// These checks use only a local server and deliberately invalid/local test inputs.
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
const profile = {
  language: "en",
  occupation: "Delivery partner",
  state: "Delhi",
};
const post = async (path, body) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const check = async (res, status, error) => {
  assert.equal(res.status, status);
  assert.equal((await res.json()).error, error);
};
const health = await (await fetch(base + "/api/health")).json();
assert.equal(typeof health.configured, "boolean");
await check(await post("/api/assistant", { message: "" }), 400, "INVALID_INPUT");
assert.equal(
  (
    await fetch(base + "/api/assistant", {
      method: "POST",
      headers: {
        Origin: "https://example.com",
        "Content-Type": "application/json",
      },
      body: "{}",
    })
  ).status,
  403,
);
for (const [path, body] of [
  [
    "/api/assistant",
    { profile, mode: "earnings", message: "Explain my earnings", earnings: [] },
  ],
  ["/api/speech", { text: "नमस्ते", language: "hi" }],
]) {
  if (!health.configured) await check(await post(path, body), 503, "KEY_MISSING");
}
const invalid = new FormData();
invalid.set("file", new Blob(["not an image"], { type: "image/png" }), "invalid.png");
invalid.set("profile", JSON.stringify(profile));
await check(
  await fetch(base + "/api/documents", { method: "POST", body: invalid }),
  400,
  "INVALID_FILE",
);
const pdf = await PDFDocument.create();
for (let i = 0; i < 21; i++) pdf.addPage();
const form = new FormData();
form.set(
  "file",
  new Blob([await pdf.save()], { type: "application/pdf" }),
  "too-many-pages.pdf",
);
form.set("profile", JSON.stringify(profile));
await check(
  await fetch(base + "/api/documents", { method: "POST", body: form }),
  400,
  "TOO_MANY_PAGES",
);
const tooLarge = new FormData();
tooLarge.set(
  "file",
  new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/jpeg" }),
  "large.jpg",
);
tooLarge.set("profile", JSON.stringify(profile));
await check(
  await fetch(base + "/api/documents", { method: "POST", body: tooLarge }),
  413,
  "TOO_LARGE",
);
if (!health.configured) {
  const withinLimit = new FormData();
  const bytes = new Uint8Array(2 * 1024 * 1024);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  withinLimit.set("file", new Blob([bytes], { type: "image/png" }), "size-boundary.png");
  withinLimit.set("profile", JSON.stringify(profile));
  await check(
    await fetch(base + "/api/documents", { method: "POST", body: withinLimit }),
    503,
    "KEY_MISSING",
  );
}
const recording = new FormData();
recording.set("audio", new Blob(["invalid"], { type: "audio/webm" }), "test.webm");
recording.set("duration", "62");
await check(
  await fetch(base + "/api/transcribe", { method: "POST", body: recording }),
  400,
  "INVALID_AUDIO",
);
console.log(
  "PASS: health, invalid input, cross-origin rejection, missing-key behavior (when unconfigured), invalid document signature, 21-page PDF, oversized file, recording duration.",
);
