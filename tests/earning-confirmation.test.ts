import test from "node:test";
import assert from "node:assert/strict";
import {
  createProposalCommitter,
  earningConfirmation,
  earningHistory,
  isEarningsIntent,
  earningStatusMessage,
} from "../lib/kaam/earning-confirmation";
import type { ChatMessage } from "../lib/kaam/contracts";

test("only explicit multilingual consent confirms an earnings proposal", () => {
  for (const text of [
    "Yes!",
    "yes save it",
    "हाँ।",
    "हां",
    "जी हाँ",
    "haan save karo",
    "save kar do",
  ])
    assert.equal(earningConfirmation(text), "confirm", text);
  for (const text of [
    "yes but expenses are 200",
    "हाँ लेकिन रकम गलत है",
    "yes no",
    "900",
    "maybe",
    "नहीं सेव करो",
  ])
    assert.equal(earningConfirmation(text), null, text);
  for (const text of ["no", "cancel", "नहीं", "मत सहेजें", "nahi"])
    assert.equal(earningConfirmation(text), "cancel", text);
});

test("duplicate confirmation is locked during write and after success; failed save can retry", async () => {
  const commit = createProposalCommitter();
  let calls = 0;
  let finish!: (value: boolean) => void;
  const pending = commit("proposal", () => {
    calls++;
    return new Promise<boolean>((resolve) => {
      finish = resolve;
    });
  });
  assert.equal(
    await commit("proposal", async () => {
      calls++;
      return true;
    }),
    false,
  );
  finish(true);
  assert.equal(await pending, true);
  assert.equal(
    await commit("proposal", async () => {
      calls++;
      return true;
    }),
    false,
  );
  assert.equal(calls, 1);
  assert.equal(await commit("retry", async () => false), false);
  assert.equal(await commit("retry", async () => true), true);
  await assert.rejects(
    commit("error", async () => {
      throw Error("storage unavailable");
    }),
  );
  assert.equal(await commit("error", async () => true), true);
});

test("earnings corrections retain structured amounts and saved status in bounded history", () => {
  const proposal: ChatMessage = {
    id: "p",
    role: "assistant",
    text: "Please confirm",
    answer: {
      message: "Please confirm",
      followUps: [],
      sourceIds: [],
      sources: [],
      document: null,
      draft: null,
      earning: {
        date: "2026-10-17",
        description: "Delivery",
        income: 900,
        expenses: 150,
        hours: 8,
      },
    },
  };
  const context = JSON.parse(earningHistory([proposal])[0].text);
  assert.equal(context.proposedEarning.expenses, 150);
  assert.equal(context.saved, false);
  assert.equal(
    JSON.parse(earningHistory([{ ...proposal, accepted: true }])[0].text).saved,
    true,
  );
  assert.equal(earningHistory(Array.from({ length: 25 }, () => proposal)).length, 16);
  assert.ok(
    earningHistory([{ ...proposal, text: "a".repeat(16000) }])[0].text.length < 16000,
  );
});

test("default chat routes Hindi, English and Hinglish earnings requests but not disputes", () => {
  for (const text of [
    "I earned 900 and spent 150 today",
    "Add today's earnings",
    "आज 900 रुपये कमाए और 150 रुपये खर्च हुए",
    "aaj 900 kamaye aur 150 kharch hue",
    "Explain my income",
    "आज की कमाई जोड़ो",
  ])
    assert.equal(isEarningsIntent(text), true, text);
  for (const text of [
    "Help me complain about unpaid earnings",
    "कमाई नहीं मिली, शिकायत लिखो",
    "Show schemes",
    "हाँ",
    "900",
  ])
    assert.equal(isEarningsIntent(text), false, text);
});

test("transaction status is application truth in both languages, not generated success claims", () => {
  const earning = {
    date: "2026-10-17",
    description: "Delivery",
    income: 900,
    expenses: 150,
    hours: 8,
  };
  assert.match(earningStatusMessage(earning, "en"), /Not saved yet/);
  assert.match(earningStatusMessage(earning, "hi"), /अभी सहेजा नहीं गया/);
  assert.match(earningStatusMessage(earning, "en"), /750/);
  assert.match(
    earningStatusMessage(earning, "en", true),
    /^Earning saved on this device/,
  );
  assert.doesNotMatch(earningStatusMessage(earning, "hi", true), /अभी सहेजा नहीं गया/);
});
