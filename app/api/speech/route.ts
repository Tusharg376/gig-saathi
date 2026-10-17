import { z } from "zod";
import {
  ApiError,
  fail,
  jsonBody,
  noStore,
  providerRequest,
  settings,
} from "@/lib/kaam/server";
import { wav } from "@/lib/kaam/safety";
const audioOutput = z.object({
  steps: z.array(
    z.object({
      type: z.string(),
      content: z
        .array(
          z.object({
            type: z.string(),
            data: z.string().optional(),
            mime_type: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});
export async function POST(req: Request) {
  try {
    const input = z
      .object({
        text: z.string().min(1).max(5000),
        language: z.enum(["hi", "en"]),
      })
      .parse(await jsonBody(req));
    const res = await providerRequest(
      "interactions",
      {
        model: settings().tts,
        input: [
          {
            type: "user_input",
            content: [
              {
                type: "text",
                text: input.text,
                annotations: [
                  {
                    type: "speech_metadata",
                    style: "Calm, clear, friendly delivery at a measured pace.",
                  },
                ],
              },
            ],
          },
        ],
        response_format: { type: "audio" },
        generation_config: { speech_config: [{ voice: "Kore" }] },
        store: false,
      },
      req.signal,
    );
    const parsed = audioOutput.safeParse(await res.json());
    if (!parsed.success) throw new ApiError("INVALID_AI_RESPONSE");
    const audio = parsed.data.steps
      .filter((s) => s.type === "model_output")
      .flatMap((s) => s.content || [])
      .filter((c) => c.type === "audio" && c.data)
      .at(-1);
    if (!audio?.data) throw new ApiError("NO_RESPONSE");
    const mime = audio.mime_type || "audio/wav";
    const bytes = Uint8Array.from(Buffer.from(audio.data, "base64"));
    const isWav = mime.includes("wav");
    if (!isWav && !/pcm|L16/i.test(mime)) throw new ApiError("INVALID_AI_RESPONSE");
    const rate = Number(mime.match(/rate=(\d+)/)?.[1] || 24000);
    return new Response(isWav ? bytes : wav(bytes, rate), {
      headers: { ...noStore, "Content-Type": "audio/wav" },
    });
  } catch (e) {
    return fail(e);
  }
}
