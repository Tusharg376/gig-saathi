import { z } from "zod";

// Interactions REST returns model-output steps, not the SDK's output_text helper.
const transcriptionOutput = z.object({
  status: z.string().optional(),
  steps: z.array(
    z.object({
      type: z.string(),
      content: z
        .array(z.object({ type: z.string(), text: z.string().optional() }))
        .optional(),
    }),
  ),
});
export function parseTranscript(raw: unknown): string {
  const parsed = transcriptionOutput.parse(raw);
  if (parsed.status && parsed.status !== "completed")
    throw new Error("INVALID_AI_RESPONSE");
  const text = parsed.steps
    .filter((s) => s.type === "model_output")
    .flatMap((s) => s.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text || "")
    .join(" ")
    .trim();
  if (!text || text === "[NO_SPEECH]") throw new Error("NO_SPEECH");
  if (text.length > 8000) throw new Error("INVALID_AI_RESPONSE");
  return text;
}
