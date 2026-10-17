import { SafetyView } from "./journeys/safety-view";
import { SchemesView } from "./journeys/schemes-view";
import { DocumentsView } from "./journeys/documents-view";
import { GrievanceView } from "./journeys/grievance-view";
import { PlaybackControls } from "./playback-controls";
import type { Workspace } from "@/hooks/kaam/use-workspace";
import { csv, totals } from "@/lib/kaam/contracts";
import { ArrowDownToLine, ArrowLeft, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { descriptions, download, money } from "./presentation";

import { Conversation } from "./conversation";
export function JourneyView({ workspace }: { workspace: Workspace }) {
  const {
    data,
    view,
    language,

    setEntry,

    setDeleteTarget,
    from,
    setFrom,
    to,
    setTo,
    hi,
    t,
    label,
    navigate,
    filtered,
    sum,
    CurrentIcon,
  } = workspace;
  return (
    <>
      <div className="page-heading journey-heading">
        <div>
          <button className="back-link" onClick={() => navigate("home")}>
            <ArrowLeft size={14} />
            {t("Back to home", "होम पर वापस")}
          </button>
          <h1>
            <span className={"heading-icon " + view}>
              <CurrentIcon size={26} />
            </span>
            {label(view)}
          </h1>
          <p>
            {descriptions[view]?.[hi ? 1 : 0] ||
              t(
                "A helpful conversation, in your own words.",
                "आपके शब्दों में मददगार बातचीत।",
              )}
          </p>
        </div>
        {view === "earnings" && (
          <button className="btn primary" onClick={() => setEntry({})}>
            <Plus size={18} />
            {t("Add earning", "कमाई जोड़ें")}
          </button>
        )}
      </div>
      {view === "earnings" && (
        <>
          <div className="stats-grid">
            {[
              [t("TOTAL INCOME", "कुल कमाई"), sum.income, "income"],
              [t("TOTAL EXPENSES", "कुल खर्च"), sum.expenses, "expenses"],
              [t("TAKE-HOME EARNINGS", "शुद्ध कमाई"), sum.net, "net"],
            ].map(([title, value, key]) => (
              <div className={"stat-card " + key} key={key}>
                <span>{title}</span>
                <strong>{money(Number(value), language)}</strong>
                <small>
                  {key === "net"
                    ? t("Income minus expenses", "कमाई में से खर्च घटाकर")
                    : t("From your confirmed entries", "आपकी पुष्टि की गई एंट्री से")}
                </small>
              </div>
            ))}
          </div>
          <section className="ledger panel">
            <div className="section-title">
              <h2>{t("Your earning entries", "आपकी कमाई की एंट्री")}</h2>
              <button
                className="text-btn"
                disabled={!filtered.length}
                onClick={() =>
                  download(
                    csv(filtered),
                    "kaam-saathi-earnings.csv",
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <ArrowDownToLine size={16} />
                {t("Export CSV", "CSV डाउनलोड")}
              </button>
            </div>
            <div className="filters">
              <label>
                {t("From", "इस तारीख से")}
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label>
                {t("To", "इस तारीख तक")}
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              {(from || to) && (
                <button
                  className="text-btn"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                >
                  {t("Clear filters", "फ़िल्टर हटाएँ")}
                </button>
              )}
              <span>
                {filtered.length} {t("entries", "एंट्री")} · {sum.hours}{" "}
                {t("hours", "घंटे")}
              </span>
            </div>
            {filtered.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        t("Date & work", "तारीख और काम"),
                        t("Income", "कमाई"),
                        t("Expenses", "खर्च"),
                        t("Net", "शुद्ध"),
                        t("Actions", "कार्य"),
                      ].map((s) => (
                        <th key={s}>{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <strong>{e.description}</strong>
                          <small>
                            {e.date} · {e.hours} {t("hrs", "घंटे")}
                          </small>
                        </td>
                        <td>{money(e.income, language)}</td>
                        <td>{money(e.expenses, language)}</td>
                        <td className="net-value">{money(totals([e]).net, language)}</td>
                        <td>
                          <div className="row">
                            <button
                              className="icon-btn"
                              aria-label={t("Edit entry", "एंट्री बदलें")}
                              onClick={() => setEntry({ initial: e, id: e.id })}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-btn"
                              aria-label={t("Delete entry", "एंट्री हटाएँ")}
                              onClick={() =>
                                setDeleteTarget({
                                  kind: "entry",
                                  id: e.id,
                                })
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="ledger-empty">
                <Wallet size={29} />
                <p>
                  {data.earnings.length
                    ? t(
                        "No entries in this date range.",
                        "इस तारीख सीमा में कोई एंट्री नहीं है।",
                      )
                    : t(
                        "No earnings yet. Add an entry or tell Saathi about your day.",
                        "अभी कोई कमाई दर्ज नहीं है। एंट्री जोड़ें या साथी को अपने दिन के बारे में बताएँ।",
                      )}
                </p>
              </div>
            )}
          </section>
        </>
      )}
      {view === "safety" && <SafetyView workspace={workspace} />}
      {view === "welfare" && <SchemesView workspace={workspace} />}
      {view === "documents" && <DocumentsView workspace={workspace} />}
      {view === "grievance" && <GrievanceView workspace={workspace} />}
      {view === "general" || view === "earnings" ? (
        <Conversation workspace={workspace} />
      ) : (
        <>
          <PlaybackControls workspace={workspace} />
          <section className="journey-assistant">
            <button
              className="btn secondary"
              aria-expanded={workspace.assistantOpen}
              aria-controls="journey-conversation"
              onClick={() => workspace.setAssistantOpen(!workspace.assistantOpen)}
            >
              {workspace.assistantOpen
                ? t("Close conversation", "बातचीत बंद करें")
                : t("Need more help? Ask Saathi", "और मदद चाहिए? साथी से पूछें")}
            </button>
            {workspace.assistantOpen && (
              <div id="journey-conversation">
                <Conversation workspace={workspace} hidePlayback />
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
