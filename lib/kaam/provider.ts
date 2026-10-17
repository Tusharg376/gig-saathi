import { env } from "cloudflare:workers";
import { z } from "zod";
export class ApiError extends Error {
  constructor(
    public code: string,
    public status = 502,
  ) {
    super(code);
  }
}
export const settings = () => {
  const e = env as unknown as Record<string, string | undefined>;
  return {
    key: e.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    model: e.GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash",
    transcribe:
      e.GEMINI_TRANSCRIBE_MODEL ||
      process.env.GEMINI_TRANSCRIBE_MODEL ||
      "gemini-3.5-transcribe",
    tts: e.GEMINI_TTS_MODEL || process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts",
  };
};
export const noStore = { "Cache-Control": "no-store" };
export function fail(error: unknown) {
  const e =
    error instanceof ApiError
      ? error
      : error instanceof z.ZodError
        ? new ApiError("INVALID_INPUT", 400)
        : new ApiError("REQUEST_FAILED");
  return Response.json({ error: e.code }, { status: e.status, headers: noStore });
}
export function originGuard(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    throw new ApiError("INVALID_ORIGIN", 403);
}
export async function jsonBody(req: Request) {
  originGuard(req);
  if (Number(req.headers.get("content-length") || 0) > 250000)
    throw new ApiError("TOO_LARGE", 413);
  const text = await req.text();
  if (text.length > 250000) throw new ApiError("TOO_LARGE", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("INVALID_INPUT", 400);
  }
}
// No content, credentials, or upstream error bodies are logged or returned.
export async function providerRequest(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
) {
  const { key } = settings();
  if (!key) throw new ApiError("KEY_MISSING", 503);
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(60000)])
        : AbortSignal.timeout(60000),
    });
  } catch (error) {
    if (signal?.aborted) throw new ApiError("CANCELLED", 499);
    if (error instanceof Error && error.name === "TimeoutError")
      throw new ApiError("TIMEOUT", 504);
    throw new ApiError("REQUEST_FAILED", 502);
  }
  if (!response.ok)
    throw new ApiError(
      response.status === 429
        ? "QUOTA_EXCEEDED"
        : response.status === 401 || response.status === 403
          ? "KEY_INVALID"
          : response.status === 404
            ? "MODEL_UNAVAILABLE"
            : "PROVIDER_ERROR",
      response.status === 429 ? 429 : 502,
    );
  return response;
}
export async function gemini(
  body: Record<string, unknown>,
  model = settings().model,
  signal?: AbortSignal,
) {
  const response = await providerRequest(
    `models/${encodeURIComponent(model)}:generateContent`,
    body,
    signal,
  );
  const result = (await response.json()) as GeminiResponse;
  if (!result.candidates?.length) throw new ApiError("NO_RESPONSE");
  if (
    result.candidates[0].finishReason &&
    !["STOP", "MAX_TOKENS"].includes(result.candidates[0].finishReason)
  )
    throw new ApiError("CONTENT_BLOCKED", 422);
  return result;
}
type GeminiResponse = {
  candidates?: {
    finishReason?: string;
    content?: {
      parts?: {
        text?: string;
        inlineData?: { data: string; mimeType: string };
      }[];
    };
    groundingMetadata?: {
      groundingChunks?: { web?: { uri?: string; title?: string } }[];
      groundingSupports?: {
        segment?: { text?: string };
        groundingChunkIndices?: number[];
      }[];
      searchEntryPoint?: { renderedContent?: string };
    };
  }[];
};
export function responseText(result: GeminiResponse) {
  const value =
    result.candidates?.[0].content?.parts?.map((p) => p.text || "").join("") || "";
  if (!value) throw new ApiError("NO_RESPONSE");
  return value;
}
