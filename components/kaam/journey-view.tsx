import type { Workspace } from "@/hooks/kaam/use-workspace";
import { csv, totals } from "@/lib/kaam/contracts";
import {
  ArrowDownToLine,
  ArrowLeft,
  ClipboardCheck,
  Globe2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { descriptions, download, money } from "./presentation";

import { Conversation } from "./conversation";
export function JourneyView({ workspace }: { workspace: Workspace }) {
  const {
    data,
    view,
    language,

    busy,

    setEntry,

    setDeleteTarget,
    setGrievanceOpen,
    from,
    setFrom,
    to,
    setTo,
    docConsent,
    setDocConsent,
    fileRef,
    hi,
    t,
    label,
    navigate,
    ensureProfile,
    upload,
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
      {view === "documents" && (
        <section className="upload-panel">
          <span className="upload-icon">
            <Upload size={28} />
          </span>
          <div>
            <h2>{t("Paperwork, made a little easier.", "कागज़ात समझना हुआ आसान।")}</h2>
            <p>
              {t(
                "Upload a clear photo or PDF. Saathi will explain it and help you spot missing details.",
                "साफ़ फोटो या PDF भेजें। साथी इसे समझाएगा और गायब जानकारी पहचानने में मदद करेगा।",
              )}
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={docConsent}
                onChange={(e) => setDocConsent(e.target.checked)}
              />
              {t(
                "I agree to send this file to Google for AI processing. Avoid sharing full ID numbers or bank details.",
                "मैं यह फ़ाइल AI सहायता के लिए Google को भेजने की सहमति देता/देती हूँ। पूरे पहचान नंबर या बैंक जानकारी साझा न करें।",
              )}
            </label>
            <div className="row">
              <button
                className="btn primary"
                disabled={!docConsent || busy}
                onClick={() => {
                  if (ensureProfile()) fileRef.current?.click();
                }}
              >
                <Plus size={17} />
                {t("Choose a document", "दस्तावेज़ चुनें")}
              </button>
              <small>
                JPEG, PNG, PDF · 10 MB · {t("20 pages max", "अधिकतम 20 पन्ने")}
              </small>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) upload(e.target.files[0]);
              }}
            />
          </div>
        </section>
      )}
      {view === "welfare" && (
        <div className="notice journey-notice">
          <Globe2 size={20} />
          <span>
            {t(
              "Guidance checked against official sources, tailored to your state. Final eligibility is decided by the relevant authority.",
              "आपके राज्य के अनुसार आधिकारिक स्रोतों से जाँची गई जानकारी। अंतिम पात्रता संबंधित विभाग तय करता है।",
            )}
          </span>
        </div>
      )}
      {view === "grievance" && (
        <button
          className="btn secondary"
          disabled={busy}
          onClick={() => {
            if (ensureProfile()) setGrievanceOpen(true);
          }}
        >
          <ClipboardCheck size={18} />
          {t("Add & confirm facts", "तथ्य भरें और पुष्टि करें")}
        </button>
      )}
      {view === "grievance" && (
        <div className="notice journey-notice">
          <Pencil size={20} />
          <span>
            {t(
              "Tell Saathi what happened, when, who it concerns, and what outcome you want. Confirm the facts before a draft is created.",
              "साथी को बताएँ कि क्या हुआ, कब हुआ, किससे शिकायत है और आप क्या समाधान चाहते हैं। ड्राफ़्ट बनने से पहले तथ्यों की पुष्टि करें।",
            )}
          </span>
        </div>
      )}
      {<Conversation workspace={workspace} />}
    </>
  );
}
