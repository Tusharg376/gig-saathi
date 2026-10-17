import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Exercise the actual hook with browser media and React lifecycle adapters.
function recordingHarness(permission?: Promise<void>) {
  let uploads = 0;
  const toasts: string[] = [];
  let stoppedTracks = 0;
  let text = "Existing typed words";
  let timer: (() => void) | undefined;
  const source = ts.transpileModule(
    readFileSync(new URL("../hooks/kaam/use-voice.ts", import.meta.url), "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    },
  ).outputText;
  class Recorder {
    static isTypeSupported() {
      return true;
    }
    state = "inactive";
    mimeType = "audio/webm";
    ondataavailable?: (event: { data: Blob }) => void;
    onstop?: () => Promise<void>;
    completion?: Promise<void>;
    start() {
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({ data: new Blob(["voice"]) });
      this.completion = this.onstop?.();
    }
  }
  type Hook = {
    record: () => Promise<void>;
    cancelRecording: () => void;
    sendRecording: () => void;
    recorder: { current: Recorder };
  };
  const exports: Record<string, (options: unknown) => Hook> = {};
  runInNewContext(source, {
    exports,
    Blob,
    FormData,
    AbortController,
    DOMException,
    navigator: {
      mediaDevices: {
        getUserMedia: async () => {
          await permission;
          return { getTracks: () => [{ stop: () => stoppedTracks++ }] };
        },
      },
    },
    MediaRecorder: Recorder,
    setInterval: (callback: () => void) => {
      timer = callback;
      return 1;
    },
    clearInterval: () => {
      timer = undefined;
    },
    require: (name: string) => {
      if (name === "react")
        return {
          useState: (initial: unknown) => [initial, () => {}],
          useRef: (initial: unknown) => ({ current: initial }),
          useEffect: () => {},
        };
      if (name === "@/lib/kaam/client")
        return {
          request: async () => {
            uploads++;
            return { text: "आज 900 रुपये कमाए" };
          },
        };
      throw new Error(`Unexpected module ${name}`);
    },
  });
  const hook = exports.useVoice({
    busy: false,
    setBusy: () => {},
    ensureProfile: () => true,
    language: "hi",
    setError: () => {},
    setToast: (text: string) => {
      toasts.push(text);
    },
    inputRef: { current: null },
    abort: { current: null },
    setInput: (update: (previous: string) => string) => {
      text = update(text);
    },
  });
  return {
    hook,
    toasts,
    uploads: () => uploads,
    stoppedTracks: () => stoppedTracks,
    text: () => text,
    hasTimer: () => !!timer,
  };
}

test("Stop discards recorded audio without a transcription request or changing typed text", async () => {
  const h = recordingHarness();
  await h.hook.record();
  assert.equal(h.hasTimer(), true);
  h.hook.cancelRecording();
  await h.hook.recorder.current.completion;
  assert.equal(h.uploads(), 0);
  assert.equal(h.text(), "Existing typed words");
  assert.ok(h.stoppedTracks() > 0);
  assert.equal(h.hasTimer(), false);
});

test("Send audio transcribes once and appends editable words without submitting a chat", async () => {
  const h = recordingHarness();
  await h.hook.record();
  h.hook.sendRecording();
  h.hook.sendRecording();
  await h.hook.recorder.current.completion;
  assert.equal(h.uploads(), 1);
  assert.equal(h.text(), "Existing typed words आज 900 रुपये कमाए");
  assert.ok(h.stoppedTracks() > 0);
});

test("Cancelling while microphone permission is pending releases late streams without recording", async () => {
  let allow!: () => void;
  const permission = new Promise<void>((resolve) => {
    allow = resolve;
  });
  const h = recordingHarness(permission);
  const opening = h.hook.record();
  h.hook.cancelRecording();
  allow();
  await opening;
  assert.equal(h.hook.recorder.current, null);
  assert.equal(h.uploads(), 0);
  assert.equal(h.stoppedTracks(), 1);
  assert.equal(h.hasTimer(), false);
});

test("Navigation cancellation is silent without an active recording or pending microphone", async () => {
  const h = recordingHarness();
  h.hook.cancelRecording();
  assert.deepEqual(h.toasts, []);
  await h.hook.record();
  h.hook.cancelRecording();
  await h.hook.recorder.current.completion;
  const messages = [...h.toasts];
  h.hook.cancelRecording();
  assert.deepEqual(h.toasts, messages);
  assert.equal(messages.length, 1);
  assert.equal(h.uploads(), 0);
});
