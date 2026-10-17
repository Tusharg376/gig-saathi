import { parseTranscript } from "@/lib/kaam/transcription";
import {
  ApiError,
  fail,
  providerRequest,
  settings,
  noStore,
  originGuard,
} from "@/lib/kaam/server";
export async function POST(req: Request) {
  try {
    originGuard(req);
    if (Number(req.headers.get("content-length") || 0) > 9 * 1024 * 1024)
      throw new ApiError("TOO_LARGE", 413);
    const form = await req.formData();
    const file = form.get("audio");
    const duration = Number(form.get("duration"));
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > 8 * 1024 * 1024 ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > 61 ||
      !["audio/webm", "audio/mp4", "audio/wav", "audio/ogg"].includes(
        file.type.split(";")[0],
      )
    )
      throw new ApiError("INVALID_AUDIO", 400);
    const result = await providerRequest(
      "interactions",
      {
        model: settings().transcribe,
        input: [
          {
            type: "audio",
            mime_type: file.type.split(";")[0],
            data: Buffer.from(await file.arrayBuffer()).toString("base64"),
          },
        ],
        generation_config: {
          transcription_config: {
            language_codes: ["hi-IN", "en-IN"],
            mode: { type: "verbatim" },
          },
        },
        store: false,
      },
      req.signal,
    );
    let text: string;
    try {
      text = parseTranscript(await result.json());
    } catch (error) {
      if (error instanceof Error && error.message === "NO_SPEECH")
        throw new ApiError("NO_SPEECH", 422);
      throw new ApiError("INVALID_AI_RESPONSE");
    }
    return Response.json({ text }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}
