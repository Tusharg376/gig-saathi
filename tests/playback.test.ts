import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { response, withAbort } from "../lib/kaam/client";
import { SpeechCache } from "../lib/kaam/speech-cache";
import type { ChatMessage } from "../lib/kaam/contracts";

// Execute the real hook with explicit React renders and controllable browser audio/transport.
function playbackHarness() {
  const cells: unknown[] = [];
  let cursor = 0;
  const cleanups: (() => void)[] = [];
  let firstRender = true;
  const requests: { resolve: (response: Response) => void; signal: AbortSignal }[] = [];
  const players: Player[] = [];
  const errors: string[] = [];
  let sharedBusyWrites = 0;
  let revokedUrls = 0;
  const sharedAbort = { current: null };
  class Player {
    paused = true;
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(public src: string) {
      players.push(this);
    }
    async play() {
      this.paused = false;
    }
    pause() {
      this.paused = true;
    }
  }
  type Playback = {
    playing: string | null;
    audioPreparing: boolean;
    speak: (message: ChatMessage) => Promise<void>;
    stopAudio: () => void;
    clearAudioCache: () => void;
  };
  const exports: { usePlayback?: (options: unknown) => Playback } = {};
  const source = ts.transpileModule(
    readFileSync(new URL("../hooks/kaam/use-playback.ts", import.meta.url), "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    },
  ).outputText;
  runInNewContext(source, {
    exports,
    AbortController,
    Audio: Player,
    URL: {
      createObjectURL: () => `blob:test-${players.length}`,
      revokeObjectURL: () => revokedUrls++,
    },
    fetch: (_url: string, init: { signal: AbortSignal }) =>
      new Promise<Response>((resolve) => requests.push({ resolve, signal: init.signal })),
    require: (name: string) => {
      if (name === "@/lib/kaam/client") return { response, withAbort };
      if (name === "@/lib/kaam/speech-cache") return { SpeechCache };
      if (name === "react")
        return {
          useState: (initial: unknown) => {
            const index = cursor++;
            if (firstRender) cells[index] = initial;
            return [cells[index], (value: unknown) => (cells[index] = value)];
          },
          useRef: (initial: unknown) => {
            const index = cursor++;
            if (firstRender) cells[index] = { current: initial };
            return cells[index];
          },
          useEffect: (effect: () => (() => void) | undefined) => {
            if (firstRender) {
              const cleanup = effect();
              if (cleanup) cleanups.push(cleanup);
            }
          },
        };
      throw new Error(`Unexpected module ${name}`);
    },
  });
  function render() {
    cursor = 0;
    const hook = exports.usePlayback!({
      busy: false,
      recording: false,
      autoSpeak: false,
      language: "hi",
      setBusy: () => sharedBusyWrites++,
      setError: (error: string) => errors.push(error),
      abortRef: sharedAbort,
    });
    firstRender = false;
    return hook;
  }
  return {
    render,
    requests,
    players,
    errors,
    sharedAbort,
    sharedBusyWrites: () => sharedBusyWrites,
    revokedUrls: () => revokedUrls,
    unmount: () => cleanups.forEach((cleanup) => cleanup()),
  };
}
const message = (id: string, text = "नमस्ते") =>
  ({ id, role: "assistant", text }) satisfies ChatMessage;
const audioResponse = () =>
  new Response(new Blob(["test audio"], { type: "audio/wav" }), { status: 200 });

test("playback replays cached speech without a network request and clears it on data deletion", async () => {
  const h = playbackHarness();
  const first = h.render().speak(message("first"));
  assert.equal(h.render().audioPreparing, true);
  h.requests[0].resolve(audioResponse());
  await first;
  assert.equal(h.players.length, 1);
  assert.equal(h.players[0].paused, false);
  h.render().stopAudio();
  await h.render().speak(message("replay"));
  assert.equal(h.requests.length, 1);
  assert.equal(h.players.length, 2);
  assert.equal(h.render().audioPreparing, false);
  h.render().stopAudio();
  h.render().clearAudioCache();
  const fresh = h.render().speak(message("after-delete"));
  assert.equal(h.requests.length, 2);
  h.requests[1].resolve(audioResponse());
  await fresh;
  h.unmount();
  assert.equal(h.players[2].paused, true);
  assert.ok(h.revokedUrls() > 0);
});

test("cancelled late speech response cannot stop or replace a newer answer", async () => {
  const h = playbackHarness();
  const old = h.render().speak(message("old", "पुराना जवाब"));
  const latest = h.render().speak(message("new", "नया जवाब"));
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[1].resolve(audioResponse());
  await latest;
  await old;
  h.requests[0].resolve(audioResponse());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.render().playing, "new");
  assert.equal(h.players.length, 1);
  assert.equal(h.players[0].paused, false);
  assert.equal(h.errors.filter(Boolean).length, 0);
  h.unmount();
});

test("speech preparation remains cancellable without taking the shared request or busy state", async () => {
  const h = playbackHarness();
  const pending = h.render().speak(message("pending"));
  assert.equal(h.render().audioPreparing, true);
  assert.equal(h.sharedBusyWrites(), 0);
  assert.equal(h.sharedAbort.current, null);
  h.render().stopAudio();
  await pending;
  assert.equal(h.render().audioPreparing, false);
  assert.equal(h.render().playing, null);
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[0].resolve(audioResponse());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.players.length, 0);
  assert.equal(h.sharedBusyWrites(), 0);
  h.unmount();
});
