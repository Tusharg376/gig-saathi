import { answerSchema, sourceSchema, type Answer } from "./contracts";
export async function response<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const d = (await res.json().catch(() => ({
      error: res.status === 413 ? "TOO_LARGE" : "REQUEST_FAILED",
    }))) as { error?: string };
    throw new Error(d.error || "REQUEST_FAILED");
  }
  return res.json();
}
export function parsedAnswer(raw: Answer): Answer {
  return {
    ...answerSchema.parse(raw),
    sources: sourceSchema.array().parse(raw.sources),
    searchSuggestionsHtml:
      typeof raw.searchSuggestionsHtml === "string"
        ? raw.searchSuggestionsHtml.slice(0, 30000)
        : undefined,
  };
}
