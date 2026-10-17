import type { ChatMessage, EarningInput, Language } from "./contracts";

// Deliberately exact: “yes, but change expenses” is a correction, never consent.
export function earningConfirmation(text: string): "confirm" | "cancel" | null {
  const normalized = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[।.!?,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (
    [
      "yes",
      "yes please",
      "yes save",
      "yes save it",
      "save it",
      "confirm",
      "हाँ",
      "हां",
      "जी हाँ",
      "जी हां",
      "हाँ सहेजें",
      "हाँ कर दो",
      "हां कर दो",
      "हाँ सेव कर दो",
      "हां सेव कर दो",
      "yes please save it",
      "हां सेव करो",
      "हाँ सेव करो",
      "सेव कर दो",
      "save kar do",
      "haan",
      "han",
      "haan save karo",
      "haan kar do",
      "ji haan",
    ].includes(normalized)
  )
    return "confirm";
  if (
    [
      "no",
      "cancel",
      "do not save",
      "don't save",
      "नहीं",
      "रद्द करें",
      "मत सहेजें",
      "nahi",
      "nahin",
      "cancel karo",
    ].includes(normalized)
  )
    return "cancel";
  return null;
}

export function earningHistory(messages: ChatMessage[]) {
  return messages.slice(-16).map((message) => ({
    role: message.role,
    text: message.answer?.earning
      ? JSON.stringify({
          message: message.text.slice(0, 12000),
          proposedEarning: message.answer.earning,
          saved: !!message.accepted,
        })
      : message.text,
  }));
}

// A synchronous lock covers duplicate clicks/voice sends before React re-renders.
// Failed writes remain retryable; successful proposal IDs cannot save twice.
export function createProposalCommitter() {
  const pending = new Set<string>();
  const saved = new Set<string>();
  return async (id: string, commit: () => Promise<boolean>): Promise<boolean> => {
    if (pending.has(id) || saved.has(id)) return false;
    pending.add(id);
    try {
      const success = await commit();
      if (success) saved.add(id);
      return success;
    } finally {
      pending.delete(id);
    }
  };
}

// Route financial logging/explanations from the default chat into the ledger journey.
// Complaint language stays in the original flow rather than creating an entry.
export function isEarningsIntent(text: string): boolean {
  const value = text.normalize("NFC").toLowerCase();
  if (
    /\b(unpaid|owed|complaint|dispute|harassment)\b|बकाया|शिकायत|विवाद|नहीं मिला|नहीं मिले/.test(
      value,
    )
  )
    return false;
  return /\b(earnings?|earned|income|expenses?|spent|spending|profit|net pay|take.home|kamai|kamaye|kamaaye|kamae|kharch|kharche)\b|कमाई|कमाए|कमाये|कमाया|कमाता|आमदनी|खर्च|ख़र्च|आय दर्ज|आय जोड़/.test(
    value,
  );
}

export function earningStatusMessage(
  earning: EarningInput,
  language: Language,
  saved = false,
): string {
  const money = (value: number) =>
    new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  const net =
    (Math.round(earning.income * 100) - Math.round(earning.expenses * 100)) / 100;
  return language === "hi"
    ? `${saved ? "कमाई इस डिवाइस पर सहेजी गई।" : "अभी सहेजा नहीं गया — नीचे जानकारी की पुष्टि करें।"} ${earning.date}: कमाई ${money(earning.income)}, खर्च ${money(earning.expenses)}, शुद्ध कमाई ${money(net)}, काम ${earning.hours} घंटे।${saved ? "" : " सही है तो हाँ कहें या लिखें। बदलाव के लिए जाँचें और सहेजें चुनें।"}`
    : `${saved ? "Earning saved on this device." : "Not saved yet — confirm the details below."} ${earning.date}: income ${money(earning.income)}, expenses ${money(earning.expenses)}, net earnings ${money(net)}, ${earning.hours} hours worked.${saved ? "" : " Say or type yes if correct, or choose Review & save to edit."}`;
}
