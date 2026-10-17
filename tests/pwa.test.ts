import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const read = (path: string) =>
  readFileSync(new URL(`../public/${path}`, import.meta.url));

test("install manifest has valid standalone scope and PNG icons of the declared size", () => {
  const manifest = JSON.parse(read("manifest.webmanifest").toString());
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  for (const icon of manifest.icons) {
    const bytes = read(icon.src.slice(1));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes);
  }
  assert.ok(manifest.icons.some((i: { sizes: string }) => i.sizes === "192x192"));
  assert.ok(manifest.icons.some((i: { sizes: string }) => i.sizes === "512x512"));
  assert.ok(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable"));
});

test("offline worker leaves APIs, third parties and private pages out of cache", async () => {
  const handlers: Record<string, (event: unknown) => void> = {};
  const cached: string[] = [];
  let offline = false;
  const fallback = new Response("offline");
  Object.defineProperty(fallback, "redirected", { value: true });
  runInNewContext(read("sw.js").toString(), {
    self: {
      location: { origin: "https://example.com" },
      addEventListener: (name: string, handler: (event: unknown) => void) => {
        handlers[name] = handler;
      },
    },
    caches: {
      open: async () => ({
        addAll: async (paths: string[]) => {
          cached.push(...paths);
        },
      }),
      match: async (path: string) => (path === "/offline.html" ? fallback : undefined),
    },
    URL,
    Response,
    fetch: async () => {
      if (offline) throw new Error("offline");
      return new Response("live");
    },
  });
  let pending: Promise<unknown> | undefined;
  handlers.install({
    waitUntil: (value: Promise<unknown>) => {
      pending = value;
    },
  });
  await pending;
  assert.ok(cached.includes("/offline.html"));
  assert.ok(
    cached.every((path) => path === "/offline.html" || path.startsWith("/icons/")),
  );
  async function request(path: string, mode = "cors", method = "GET") {
    let response: Promise<Response> | undefined;
    handlers.fetch({
      request: { url: new URL(path, "https://example.com").href, method, mode },
      respondWith: (value: Promise<Response>) => {
        response = value;
      },
    });
    return response;
  }
  assert.equal(await request("/api/assistant", "cors", "POST"), undefined);
  assert.equal(await request("/api/documents"), undefined);
  assert.equal(await request("https://other.example/private", "navigate"), undefined);
  assert.equal(await request("/private.json"), undefined);
  assert.equal(await (await request("/", "navigate"))?.text(), "live");
  offline = true;
  const offlineResponse = await request("/", "navigate");
  assert.equal(offlineResponse?.redirected, false);
  assert.equal(await offlineResponse?.text(), "offline");
});
