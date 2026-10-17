declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    AI_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
    BUCKET?: R2Bucket;
  }
}
