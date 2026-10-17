/* Cache only public installation assets. Never store pages, APIs or worker records. */
const CACHE = "kaamsaathi-public-v1";
const ASSETS = [
  "/offline.html",
  "/icons/app-192.png",
  "/icons/app-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("kaamsaathi-public-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match("/offline.html");
        if (!cached) return Response.error();
        // Cloudflare redirects .html URLs. Return a fresh, non-redirected response
        // so navigation requests can safely use the cached fallback.
        return new Response(cached.body, {
          status: cached.status,
          headers: cached.headers,
        });
      }),
    );
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
