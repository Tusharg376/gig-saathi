import test from "node:test";
import assert from "node:assert/strict";
import { SpeechCache } from "../lib/kaam/speech-cache";

test("speech replay reuses audio for the same text and language only", () => {
  const cache = new SpeechCache();
  const audio = new Blob(["audio"]);
  cache.set(JSON.stringify(["hi", "नमस्ते"]), audio);
  assert.equal(cache.get(JSON.stringify(["hi", "नमस्ते"])), audio);
  assert.equal(cache.get(JSON.stringify(["en", "नमस्ते"])), undefined);
  assert.equal(cache.get(JSON.stringify(["hi", "updated reply"])), undefined);
  cache.clear();
  assert.equal(cache.get(JSON.stringify(["hi", "नमस्ते"])), undefined);
});

test("speech cache evicts least recently used audio and never exceeds its byte budget", () => {
  const cache = new SpeechCache(10, 2);
  cache.set("a", new Blob(["1234"]));
  cache.set("b", new Blob(["5678"]));
  assert.ok(cache.get("a"));
  cache.set("c", new Blob(["9012"]));
  assert.equal(cache.get("b"), undefined);
  assert.ok(cache.get("a"));
  assert.ok(cache.get("c"));
  cache.set("d", new Blob(["1234567"]));
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("c"), undefined);
  assert.ok(cache.get("d"));
  cache.set("too big", new Blob(["12345678901"]));
  assert.equal(cache.get("too big"), undefined);
  assert.ok(cache.get("d"));
});
