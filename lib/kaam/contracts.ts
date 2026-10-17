import { z } from "zod";

export const languageSchema = z.enum(["en", "hi"]);
export const modeSchema = z.enum([
  "general",
  "earnings",
  "safety",
  "welfare",
  "documents",
  "grievance",
]);
export const profileSchema = z.object({
  language: languageSchema,
  autoSpeak: z.boolean().optional(),
  occupation: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
});
export const earningSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
      "Invalid date",
    ),
  description: z.string().min(1).max(200),
  income: z.number().finite().min(0).max(10000000),
  expenses: z.number().finite().min(0).max(10000000),
  hours: z.number().finite().min(0).max(24),
});
export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  retrievedAt: z.string(),
});
export const answerSchema = z.object({
  message: z.string().min(1).max(16000),
  followUps: z.array(z.string().max(500)).max(4).default([]),
  sourceIds: z.array(z.string()).default([]),
  earning: earningSchema.nullable().default(null),
  draft: z
    .object({ title: z.string().max(200), body: z.string().max(16000) })
    .nullable()
    .default(null),
  document: z
    .object({
      summary: z.string().max(10000),
      fields: z
        .array(z.object({ label: z.string().max(150), value: z.string().max(1000) }))
        .max(40),
      missing: z.array(z.string().max(1000)).max(20),
      nextSteps: z.array(z.string().max(1000)).max(20),
    })
    .nullable()
    .default(null),
});
export const documentTaskSchema = z.string().trim().min(1).max(2000);
export const grievanceSchema = z.object({
  incident: z.string().trim().min(5).max(4000),
  recipient: z.string().trim().min(1).max(300),
  dates: z.string().trim().min(1).max(300),
  amount: z.number().finite().min(0).max(10000000).nullable(),
  resolution: z.string().trim().min(3).max(2000),
  confirmed: z.literal(true),
  moneyInvolved: z.enum(["yes", "no", "unknown"]).optional(),
  category: z
    .enum(["unpaid", "deduction", "account", "harassment", "consumer", "other"])
    .optional(),
  contact: z
    .object({
      name: z.string().max(100),
      phone: z.string().max(30),
      city: z.string().max(100),
    })
    .optional(),
  references: z
    .object({
      orderId: z.string().max(100),
      productNumber: z.string().max(100),
      evidence: z.string().max(1000),
    })
    .optional(),
});
export type GrievanceFacts = z.infer<typeof grievanceSchema>;
const totalAmount = z.number().finite().min(0).max(1e12);
export const ledgerContextSchema = z
  .object({
    scope: z.object({
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
      to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
    }),
    entryCount: z.number().int().min(0),
    totals: z.object({
      income: totalAmount,
      expenses: totalAmount,
      net: z.number().finite(),
      hours: totalAmount,
    }),
    recentEntries: z.array(earningSchema).max(30),
  })
  .refine(
    (v) =>
      v.entryCount >= v.recentEntries.length &&
      Math.abs(v.totals.income - v.totals.expenses - v.totals.net) < 0.005,
    "Inconsistent ledger totals",
  );
export type LedgerContext = z.infer<typeof ledgerContextSchema>;

export const assistantSchema = z.object({
  profile: profileSchema,
  mode: modeSchema,
  message: z.string().trim().min(1).max(8000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(16000),
      }),
    )
    .max(20)
    .default([]),
  earnings: z.array(earningSchema).max(500).default([]),
  grievance: grievanceSchema.optional(),
  ledger: ledgerContextSchema.optional(),
  documentContext: answerSchema.shape.document.optional(),
});
export type Language = z.infer<typeof languageSchema>;
export type Mode = z.infer<typeof modeSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type EarningInput = z.infer<typeof earningSchema>;
export type Earning = EarningInput & { id: string };
export type Source = z.infer<typeof sourceSchema>;
export type Answer = z.infer<typeof answerSchema> & {
  sources: Source[];
  searchSuggestionsHtml?: string;
};
export type Draft = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  answer?: Answer;
  accepted?: boolean;
};

export function totals(entries: EarningInput[]) {
  const income = entries.reduce((s, e) => s + Math.round(e.income * 100), 0);
  const expenses = entries.reduce((s, e) => s + Math.round(e.expenses * 100), 0);
  return {
    income: income / 100,
    expenses: expenses / 100,
    net: (income - expenses) / 100,
    hours: entries.reduce((s, e) => s + e.hours, 0),
  };
}
export function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function csv(entries: EarningInput[]) {
  const cell = (v: string | number) =>
    '"' +
    String(typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? "'" + v : v).replaceAll(
      '"',
      '""',
    ) +
    '"';
  return (
    "\uFEFF" +
    [
      "Date,Description,Income INR,Expenses INR,Net INR,Hours",
      ...entries.map((e) =>
        [e.date, e.description, e.income, e.expenses, totals([e]).net, e.hours]
          .map(cell)
          .join(","),
      ),
    ].join("\r\n")
  );
}
