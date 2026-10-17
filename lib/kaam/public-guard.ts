type Limiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};
export type PublicBindings = { AI_RATE_LIMITER?: Limiter };

/** Public API controls run before body parsing or any paid upstream request. */
export async function guardPublicRequest(
  request: Request,
  bindings: PublicBindings,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/") || request.method !== "POST") return null;
  const reject = (error: string, status: number, extra: Record<string, string> = {}) =>
    Response.json(
      { error },
      { status, headers: { "Cache-Control": "no-store", ...extra } },
    );
  const origin = request.headers.get("Origin");
  if (
    (origin && origin !== url.origin) ||
    request.headers.get("Sec-Fetch-Site") === "cross-site"
  ) {
    return reject("INVALID_ORIGIN", 403);
  }
  if (Number(request.headers.get("Content-Length") || 0) > 12 * 1024 * 1024) {
    return reject("TOO_LARGE", 413);
  }
  if (bindings.AI_RATE_LIMITER) {
    // Cloudflare supplies this header. Shared networks share this best-effort burst limit.
    const address = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await bindings.AI_RATE_LIMITER.limit({
      key: `gig-saathi:${address}`,
    });
    if (!success) return reject("RATE_LIMITED", 429, { "Retry-After": "60" });
  }
  return null;
}
