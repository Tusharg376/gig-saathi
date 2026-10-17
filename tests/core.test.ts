import test from "node:test";
import assert from "node:assert/strict";
import {
  answerSchema,
  assistantSchema,
  csv,
  earningSchema,
  grievanceSchema,
  totals,
} from "../lib/kaam/contracts";
import { officialUrl, validateSourceIds, wav } from "../lib/kaam/safety";
const entry = {
  date: "2026-10-17",
  description: "Delivery work",
  income: 900,
  expenses: 150,
  hours: 8,
};
test("earnings use exact paise arithmetic and change after an edit", () => {
  assert.deepEqual(totals([entry]), {
    income: 900,
    expenses: 150,
    net: 750,
    hours: 8,
  });
  assert.equal(totals([{ ...entry, expenses: 200 }]).net, 700);
  assert.equal(
    totals([
      { ...entry, income: 0.1, expenses: 0 },
      { ...entry, income: 0.2, expenses: 0 },
    ]).income,
    0.3,
  );
  assert.equal(totals([]).net, 0);
});
test("negative net is supported without inventing income", () =>
  assert.equal(totals([{ ...entry, income: 100, expenses: 150 }]).net, -50));
test("reject impossible dates, invalid numbers and excessive hours", () => {
  for (const patch of [
    { date: "2026-02-30" },
    { date: "yesterday" },
    { income: -1 },
    { income: Infinity },
    { hours: 25 },
    { expenses: "150" },
    { description: "" },
  ])
    assert.equal(earningSchema.safeParse({ ...entry, ...patch }).success, false);
});
test("CSV escapes formulas, commas and quotes", () => {
  const output = csv([{ ...entry, description: '=SUM(A1),"test"' }]);
  assert.ok(output.startsWith("\uFEFFDate"));
  assert.ok(output.includes('"\'=SUM(A1),""test"""'));
  assert.ok(output.includes('"750"'));
});
test("official sources cannot be imitated with URL tricks", () => {
  assert.ok(officialUrl("https://labour.gov.in/"));
  assert.ok(officialUrl("https://www.eshram.gov.in/"));
  assert.ok(officialUrl("https://example.nic.in/"));
  for (const url of [
    "http://labour.gov.in/",
    "https://gov.in.attacker.com/",
    "https://labour.gov.in@attacker.com/",
    "javascript:alert(1)",
    "https://labour.gov.in:8080/",
    "https://example.com/",
    "https://attacker.gov.in.example.com",
  ])
    assert.equal(officialUrl(url), false);
  assert.equal(officialUrl("https://www.who.int/"), false);
  assert.ok(officialUrl("https://www.who.int/", true));
});
test("claims require known sources, not model-invented citations", () => {
  const sources = [
    {
      id: "S1",
      url: "https://labour.gov.in/",
      title: "Labour",
      retrievedAt: "2026-10-17",
    },
  ];
  assert.equal(validateSourceIds([], sources), false);
  assert.equal(validateSourceIds(["S2"], sources), false);
  assert.equal(validateSourceIds(["S1", "S2"], sources), false);
  assert.equal(validateSourceIds(["S1"], sources), true);
});
test("malformed AI actions cannot enter a ledger", () => {
  assert.equal(
    answerSchema.safeParse({
      message: "saved",
      earning: { ...entry, income: "900" },
    }).success,
    false,
  );
  const result = answerSchema.parse({ message: "Tell me about your day" });
  assert.equal(result.earning, null);
  assert.equal(result.draft, null);
});
test("request validation bounds conversation and accepts Hindi/Hinglish", () => {
  const request = {
    profile: { language: "hi", occupation: "Driver", state: "Delhi" },
    mode: "earnings",
    message: "आज 900 कमाए, petrol 150, 8 घंटे",
  };
  assert.ok(assistantSchema.safeParse(request).success);
  assert.equal(assistantSchema.safeParse({ ...request, message: "" }).success, false);
  assert.equal(
    assistantSchema.safeParse({
      ...request,
      history: Array(21).fill({ role: "user", text: "x" }),
    }).success,
    false,
  );
});
test("PCM output is wrapped as playable mono WAV", () => {
  const output = wav(new Uint8Array([0, 1, 2, 3]));
  const view = new DataView(output.buffer);
  assert.equal(new TextDecoder().decode(output.slice(0, 4)), "RIFF");
  assert.equal(view.getUint32(24, true), 24000);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(40, true), 4);
  assert.equal(output.length, 48);
});

test("grievances require complete confirmed facts", () => {
  const facts = {
    incident: "Payment for work was not received",
    recipient: "Platform support",
    dates: "2026-10-17",
    amount: 900,
    resolution: "Please pay the outstanding amount",
    confirmed: true,
  };
  assert.ok(grievanceSchema.safeParse(facts).success);
  assert.equal(grievanceSchema.safeParse({ ...facts, confirmed: false }).success, false);
  assert.equal(grievanceSchema.safeParse({ ...facts, recipient: "" }).success, false);
  assert.ok(grievanceSchema.safeParse({ ...facts, amount: null }).success);
});
