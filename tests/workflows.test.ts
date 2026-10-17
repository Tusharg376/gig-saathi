import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { createLedgerContext } from "../lib/kaam/context";
import { assistantSchema } from "../lib/kaam/contracts";
import { readData, writeData, clearData, decodeStoredData } from "../lib/kaam/storage";
const profile = { language: "hi" as const, occupation: "Driver", state: "Delhi" };
const entry = {
  id: "qa-isolated",
  date: "2026-10-17",
  description: "Isolated test",
  income: 900,
  expenses: 150,
  hours: 8,
};
test("ledger context includes every record even when only 30 details are sent", () => {
  const ledger = createLedgerContext(Array.from({ length: 501 }, () => entry));
  assert.equal(ledger.entryCount, 501);
  assert.equal(ledger.recentEntries.length, 30);
  assert.equal(ledger.totals.net, 375750);
  assert.ok(
    assistantSchema.safeParse({
      profile,
      mode: "earnings",
      message: "Explain totals",
      ledger,
    }).success,
  );
  const scoped = createLedgerContext(
    [entry, { ...entry, date: "2026-10-16" }],
    "2026-10-17",
    "2026-10-17",
  );
  assert.equal(scoped.entryCount, 1);
  assert.equal(scoped.totals.net, 750);
});
test("document context survives follow-up and handoff, without confirming grievance facts", () => {
  const documentContext = {
    summary: "Payment record",
    fields: [{ label: "Amount", value: "850" }],
    missing: [],
    nextSteps: ["Confirm payment"],
  };
  for (const mode of ["documents", "grievance"]) {
    const input = assistantSchema.parse({
      profile,
      mode,
      message: "Use corrected amount",
      documentContext,
    });
    assert.equal(input.documentContext?.fields[0].value, "850");
    assert.equal(input.grievance, undefined);
  }
});
test("browser persistence supports onboarding, earnings editing, draft saving and deletion", async () => {
  await clearData();
  assert.equal((await readData()).profile, null);
  await writeData({ profile, earnings: [entry], drafts: [] });
  assert.equal(createLedgerContext((await readData()).earnings).totals.net, 750);
  await writeData({
    profile,
    earnings: [{ ...entry, expenses: 200 }],
    drafts: [
      {
        id: "draft",
        title: "Payment query",
        body: "Please check payment.",
        updatedAt: new Date().toISOString(),
      },
    ],
  });
  const reloaded = await readData();
  assert.equal(reloaded.profile?.language, "hi");
  assert.equal(createLedgerContext(reloaded.earnings).totals.net, 700);
  assert.equal(reloaded.drafts.length, 1);
  await clearData();
  assert.deepEqual(await readData(), { profile: null, earnings: [], drafts: [] });
});
test("corrupt storage rejects without hanging or silently replacing saved records", async () => {
  assert.throws(() => decodeStoredData({ profile, earnings: {}, drafts: [] }));
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("kaam-saathi", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("data", "readwrite");
    tx.objectStore("data").put({ profile, earnings: null, drafts: [] }, "worker");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  await assert.rejects(readData());
  await assert.rejects(readData());
  await clearData();
});
