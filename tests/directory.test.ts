import test from "node:test";
import assert from "node:assert/strict";
import {
  filterSchemes,
  locationMessage,
  schemes,
  whatsappLink,
} from "../lib/kaam/directory";
import { routesForComplaint } from "../lib/kaam/complaints";
import { documentTaskSchema, grievanceSchema } from "../lib/kaam/contracts";

test("schemes can be discovered in Hindi or English and filtered without losing the category", () => {
  assert.equal(filterSchemes("पेंशन", "pension")[0].id, "pmsym");
  assert.equal(filterSchemes(" accident ", "insurance")[0].id, "pmsby");
  assert.equal(filterSchemes("pension", "food").length, 0);
  assert.equal(filterSchemes("", "all").length, schemes.length);
});
test("WhatsApp drafts preserve Hindi and encode landmarks without adding URL parameters", () => {
  const message = locationMessage("hi", "Station & gate #2", {
    latitude: 28.6139,
    longitude: 77.209,
  });
  const link = new URL(whatsappLink(message));
  assert.equal(link.origin, "https://wa.me");
  assert.equal(link.searchParams.size, 1);
  assert.equal(link.searchParams.get("text"), message);
  assert.match(message, /28.613900,77.209000/);
  assert.ok(!locationMessage("en", "Near station").includes("maps"));
  for (const latitude of [NaN, Infinity, 91, -91])
    assert.throws(() => locationMessage("en", "", { latitude, longitude: 0 }));
  assert.throws(() => locationMessage("en", "", { latitude: 0, longitude: 181 }));
});
test("consumer channels do not get offered for unpaid earnings or blocked platform accounts", () => {
  assert.ok(routesForComplaint("consumer").some((r) => r.id === "consumer"));
  for (const type of ["unpaid", "deduction", "account"])
    assert.ok(!routesForComplaint(type).some((r) => r.id === "consumer"));
  assert.ok(!routesForComplaint("account").some((r) => r.id === "labour"));
});
test("complaints accept optional confirmed references while rejecting excessive input and unconfirmed facts", () => {
  const facts = {
    incident: "Payment for completed work is missing.",
    recipient: "Test Support",
    dates: "2026-10-17",
    amount: null,
    moneyInvolved: "unknown",
    resolution: "Please investigate and explain.",
    confirmed: true,
    contact: { name: "Test Worker", phone: "", city: "Delhi" },
    references: { orderId: "QA-123", productNumber: "", evidence: "Support ticket" },
  };
  assert.equal(grievanceSchema.parse(facts).moneyInvolved, "unknown");
  assert.equal(grievanceSchema.safeParse({ ...facts, confirmed: false }).success, false);
  assert.equal(
    grievanceSchema.safeParse({
      ...facts,
      contact: { ...facts.contact, phone: "9".repeat(31) },
    }).success,
    false,
  );
  assert.equal(documentTaskSchema.safeParse(" ").success, false);
  assert.equal(documentTaskSchema.safeParse("a".repeat(2001)).success, false);
});
