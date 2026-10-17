import { totals, type EarningInput, type LedgerContext } from "./contracts";
export function createLedgerContext(
  entries: EarningInput[],
  from = "",
  to = "",
): LedgerContext {
  const scoped = entries.filter(
    (e) => (!from || e.date >= from) && (!to || e.date <= to),
  );
  return {
    scope: { from: from || null, to: to || null },
    entryCount: scoped.length,
    totals: totals(scoped),
    recentEntries: [...scoped].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
  };
}
