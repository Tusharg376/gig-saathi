import test from "node:test";
import assert from "node:assert/strict";
import { parseTranscript } from "../lib/kaam/transcription";
import { decodeStoredData } from "../lib/kaam/storage";

test("speech preference preserves older profiles and explicit on/off choices", () => {
  const profile = { language: "hi", occupation: "Driver", state: "Delhi" };
  const read = (p: unknown) =>
    decodeStoredData({ profile: p, earnings: [], drafts: [] }).profile;
  assert.equal(read(profile)?.autoSpeak ?? false, false);
  assert.equal(read({ ...profile, autoSpeak: true })?.autoSpeak, true);
  assert.equal(read({ ...profile, autoSpeak: false })?.autoSpeak, false);
  assert.throws(() => read({ ...profile, autoSpeak: "true" }));
});
test("transcription extracts only completed model text without translating mixed speech", () => {
  const text = "आज delivery से 900 रुपये कमाए और fuel 150 लगा।";
  assert.equal(
    parseTranscript({
      status: "completed",
      steps: [
        { type: "user_input", content: [{ type: "text", text: "not a transcript" }] },
        {
          type: "model_output",
          content: [
            { type: "text", text },
            { type: "audio", data: "ignored" },
          ],
        },
      ],
    }),
    text,
  );
  assert.throws(
    () => parseTranscript({ status: "failed", steps: [] }),
    /INVALID_AI_RESPONSE/,
  );
  assert.throws(() => parseTranscript({ steps: [] }), /NO_SPEECH/);
  assert.throws(
    () =>
      parseTranscript({
        steps: [
          { type: "model_output", content: [{ type: "text", text: "[NO_SPEECH]" }] },
        ],
      }),
    /NO_SPEECH/,
  );
  assert.throws(
    () =>
      parseTranscript({
        steps: [
          { type: "model_output", content: [{ type: "text", text: "a".repeat(8001) }] },
        ],
      }),
    /INVALID_AI_RESPONSE/,
  );
  assert.throws(() => parseTranscript({ steps: "invalid" }));
});

test("cancellation settles immediately even when the transport returns late", async () => {
  const { withAbort } = await import("../lib/kaam/client");
  const controller = new AbortController();
  let finish!: (value: string) => void;
  const pending = new Promise<string>((resolve) => {
    finish = resolve;
  });
  const result = withAbort(pending, controller.signal);
  controller.abort();
  await assert.rejects(result, { name: "AbortError" });
  finish("late response must not replace the cancelled draft");
  await assert.rejects(result, { name: "AbortError" });
  assert.equal(
    await withAbort(Promise.resolve("ok"), new AbortController().signal),
    "ok",
  );
});
