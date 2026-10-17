import { useState } from "react";
import { FilePenLine, Mic, CircleStop, ExternalLink, Phone } from "lucide-react";
import type { Workspace } from "@/hooks/kaam/use-workspace";
import { grievanceSchema } from "@/lib/kaam/contracts";
import { complaintTypes, routesForComplaint } from "@/lib/kaam/complaints";
import { reviewedOn } from "@/lib/kaam/directory";

export function GrievanceView({ workspace: w }: { workspace: Workspace }) {
  const { t, hi } = w;
  const { complaintInputRef, abort } = w;
  const [type, setType] = useState("unpaid");
  const [money, setMoney] = useState("yes");
  const [confirmed, setConfirmed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");
  const [clarification, setClarification] = useState("");
  const current = complaintTypes.find((c) => c.id === type)!;
  const result = [...w.messages].reverse().find((m) => m.answer?.draft);
  return (
    <div className="feature-stack">
      <section className="feature-card">
        <span className="eyebrow">
          {t("1 · CHOOSE YOUR CONCERN", "1 · अपनी समस्या चुनें")}
        </span>
        <h2>{t("Let’s put your concern into words", "अपनी शिकायत को शब्द दें")}</h2>
        <p>
          {t(
            "Start with an example, then tell us your facts. Saathi prepares a draft for you to review and send.",
            "एक विषय चुनें, फिर अपने तथ्य बताएँ। साथी ड्राफ़्ट बनाएगा; आप जाँचकर खुद भेजेंगे।",
          )}
        </p>
        <div className="choice-grid">
          {complaintTypes.map((c) => (
            <button
              type="button"
              className="choice-button"
              aria-pressed={type === c.id}
              key={c.id}
              onClick={() => {
                setType(c.id);
                setConfirmed(false);
              }}
            >
              {c.name[hi ? 1 : 0]}
            </button>
          ))}
        </div>
      </section>
      <form
        className="feature-card complaint-form"
        onChange={() => setConfirmed(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          setFormError("");
          const fields = new FormData(e.currentTarget);
          const value = (key: string) => String(fields.get(key) || "").trim();
          const facts = grievanceSchema.safeParse({
            incident: w.complaintIncident,
            recipient: value("recipient"),
            dates: value("dates"),
            amount: money === "yes" ? Number(value("amount")) : null,
            resolution: value("resolution"),
            confirmed,
            category: type,
            moneyInvolved: money,
            contact: { name: value("name"), phone: value("phone"), city: value("city") },
            references: {
              orderId: value("orderId"),
              productNumber: type === "consumer" ? value("productNumber") : "",
              evidence: value("evidence"),
            },
          });
          if (!facts.success) {
            setFormError(
              t(
                "Check the required facts and confirm them before drafting.",
                "ज़रूरी तथ्य भरकर उनकी पुष्टि करें, फिर ड्राफ़्ट बनाएँ।",
              ),
            );
            return;
          }
          setGenerating(true);
          const reply = await w.ask(
            t(
              "Write a respectful complaint using only my confirmed facts. Include supplied contact and reference details, omit empty ones. Do not invent laws or submission links.",
              "मेरे पुष्ट तथ्यों से विनम्र शिकायत लिखें। दी गई संपर्क और संदर्भ जानकारी शामिल करें; खाली जानकारी छोड़ें। कानून या शिकायत लिंक न गढ़ें।",
            ),
            "grievance",
            facts.data,
            false,
          );
          setClarification(reply && !reply.answer?.draft ? reply.text : "");
          setGenerating(false);
        }}
      >
        <span className="eyebrow">
          {t("2 · TELL US WHAT HAPPENED", "2 · बताएँ क्या हुआ")}
        </span>
        {w.documentContext && (
          <details className="attached-document">
            <summary>
              {t(
                "Document details available — review before using",
                "दस्तावेज़ की जानकारी उपलब्ध — इस्तेमाल से पहले जाँचें",
              )}
            </summary>
            <p>{w.documentContext.summary}</p>
            <dl>
              {w.documentContext.fields.map((f, i) => (
                <div key={i}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <p>
              {t(
                "Only facts you enter and confirm below will be used as complaint facts.",
                "नीचे आपके भरे और पुष्ट किए तथ्य ही शिकायत के तथ्य माने जाएँगे।",
              )}
            </p>
          </details>
        )}
        <label>
          {t("What happened?", "क्या हुआ?")}
          <textarea
            ref={complaintInputRef}
            required
            minLength={5}
            maxLength={4000}
            rows={4}
            value={w.complaintIncident}
            onChange={(e) => {
              w.setComplaintIncident(e.target.value);
              setConfirmed(false);
            }}
            placeholder={current.prompt[hi ? 1 : 0]}
          />
        </label>
        <div className="feature-actions recording-actions">
          <button
            type="button"
            className="btn secondary"
            disabled={w.busy || w.startingMic}
            onClick={() => {
              setConfirmed(false);
              w.stopAudio();
              if (w.recording) w.cancelRecording();
              else w.startComplaintRecording();
            }}
          >
            {w.recording ? <CircleStop size={16} /> : <Mic size={16} />}{" "}
            {w.recording
              ? t("Stop and discard", "रोकें और हटाएँ")
              : t("Describe by voice", "बोलकर बताएँ")}
          </button>
          {w.startingMic && (
            <button type="button" className="text-btn" onClick={w.cancelRecording}>
              {t("Cancel", "रद्द करें")}
            </button>
          )}
          {w.recording && (
            <button type="button" className="btn primary" onClick={w.sendRecording}>
              {t("Send audio to transcribe", "लिखने के लिए ऑडियो भेजें")}
            </button>
          )}
          {w.transcribing && (
            <button
              type="button"
              className="text-btn"
              onClick={() => abort.current?.abort()}
            >
              {t("Cancel transcription", "लिखना रोकें")}
            </button>
          )}
        </div>
        {(w.recording || w.transcribing || w.startingMic) && (
          <div role="status" className="voice-status">
            {w.recording
              ? t(
                  `Recording ${w.seconds}s / 60s — send audio to transcribe or stop to discard.`,
                  `रिकॉर्डिंग ${w.seconds} / 60 सेकंड — लिखने के लिए ऑडियो भेजें या हटाने के लिए रोकें।`,
                )
              : w.transcribing
                ? t(
                    "Transcribing… Review the words before confirming.",
                    "आपकी बात लिख रहे हैं… पुष्टि से पहले जाँच लें।",
                  )
                : t("Opening microphone…", "माइक खुल रहा है…")}
            {w.transcribing && (
              <progress aria-label={t("Transcribing voice", "आवाज़ लिख रहे हैं")} />
            )}
          </div>
        )}
        <div className="form-grid">
          <label>
            {t("Whom is this about?", "शिकायत किससे है?")}
            <input
              name="recipient"
              required
              maxLength={300}
              placeholder={t(
                "Company, contractor or recipient",
                "कंपनी, ठेकेदार या प्राप्तकर्ता",
              )}
            />
          </label>
          <label>
            {t("When did it happen?", "कब हुआ?")}
            <input
              name="dates"
              required
              maxLength={300}
              placeholder={t("Date or date range", "तारीख या तारीखों की सीमा")}
            />
          </label>
          <label>
            {t("Is money involved?", "क्या पैसों का मामला है?")}
            <select value={money} onChange={(e) => setMoney(e.target.value)}>
              <option value="yes">
                {t("Yes — I know the amount", "हाँ — रकम पता है")}
              </option>
              <option value="unknown">
                {t("Yes — amount is unclear", "हाँ — रकम स्पष्ट नहीं है")}
              </option>
              <option value="no">{t("No", "नहीं")}</option>
            </select>
          </label>
          {money === "yes" && (
            <label>
              {t("Amount (₹)", "रकम (₹)")}
              <input
                name="amount"
                type="number"
                min="0"
                max="10000000"
                step="0.01"
                required
                inputMode="decimal"
              />
            </label>
          )}
        </div>
        <label>
          {t("What would you like them to do?", "आप क्या समाधान चाहते हैं?")}
          <textarea
            name="resolution"
            required
            minLength={3}
            maxLength={2000}
            rows={2}
            placeholder={t(
              "For example: pay the pending amount and explain the delay",
              "जैसे: बकाया दें और देरी का कारण बताएँ",
            )}
          />
        </label>
        <details>
          <summary>
            {t(
              "Add contact & reference details (optional)",
              "संपर्क और संदर्भ जानकारी जोड़ें (वैकल्पिक)",
            )}
          </summary>
          <p>
            {t(
              "Only add details you want in the letter. They are sent to Google with the confirmed facts; saved on this device only if you save the draft.",
              "केवल पत्र में शामिल करने वाली जानकारी दें। यह पुष्ट तथ्यों के साथ Google को जाएगी; ड्राफ़्ट सहेजने पर ही डिवाइस पर सहेजी जाएगी।",
            )}
          </p>
          <div className="form-grid">
            {[
              ["name", "Your name", "आपका नाम", 100],
              ["phone", "Phone number", "फ़ोन नंबर", 30],
              ["city", "City", "शहर", 100],
              ["orderId", "Order / work reference ID", "ऑर्डर / काम का संदर्भ नंबर", 100],
              ...(type === "consumer"
                ? [["productNumber", "Product / model number", "उत्पाद / मॉडल नंबर", 100]]
                : []),
            ].map(([name, en, hindi, max]) => (
              <label key={name}>
                {t(String(en), String(hindi))}
                <input
                  name={String(name)}
                  type={name === "phone" ? "tel" : "text"}
                  maxLength={Number(max)}
                />
              </label>
            ))}
          </div>
          <label>
            {t("Evidence you have (optional)", "आपके पास प्रमाण (वैकल्पिक)")}
            <textarea
              name="evidence"
              rows={2}
              maxLength={1000}
              placeholder={t(
                "For example: payment screenshot, receipt or support ticket",
                "जैसे: भुगतान स्क्रीनशॉट, रसीद या सहायता टिकट",
              )}
            />
          </label>
        </details>
        <label className="checkbox-label" onChange={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            required
            disabled={w.busy || w.recording || w.startingMic}
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          {t(
            "I have checked these facts and agree to send them to Google to prepare my draft. I will review it before sending.",
            "मैंने तथ्य जाँच लिए हैं और ड्राफ़्ट बनाने के लिए इन्हें Google को भेजने से सहमत हूँ। भेजने से पहले पत्र जाँचूँगा/जाँचूँगी।",
          )}
        </label>
        {formError && <p role="alert">{formError}</p>}
        <button
          className="btn primary"
          disabled={w.busy || w.recording || w.startingMic || !confirmed}
        >
          <FilePenLine size={18} />
          {generating
            ? t("Preparing your draft…", "आपका ड्राफ़्ट तैयार हो रहा है…")
            : t("Create my complaint draft", "मेरी शिकायत का ड्राफ़्ट बनाएँ")}
        </button>
        {generating && (
          <div role="status">
            <progress aria-label={t("Preparing complaint", "शिकायत तैयार हो रही है")} />
            <button
              type="button"
              className="text-btn"
              onClick={() => abort.current?.abort()}
            >
              {t("Cancel", "रोकें")}
            </button>
          </div>
        )}
      </form>
      {clarification && (
        <div className="feature-card" role="status">
          {clarification}
        </div>
      )}
      {result?.answer?.draft && (
        <section className="feature-card draft-preview" aria-live="polite">
          <span className="eyebrow">
            {t("3 · REVIEW & USE YOUR LETTER", "3 · पत्र जाँचें और इस्तेमाल करें")}
          </span>
          <h2>{result.answer.draft.title}</h2>
          <div className="message-text">{result.answer.draft.body}</div>
          <button
            className="btn primary"
            onClick={() =>
              w.setDraft({
                id: result.id,
                ...result.answer!.draft!,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            {t("Edit, copy, download or print", "बदलें, कॉपी, डाउनलोड या प्रिंट करें")}
          </button>
          <small>
            {t(
              "Nothing has been submitted. Review the facts and choose the right recipient.",
              "कुछ भी जमा नहीं किया गया है। तथ्य जाँचें और सही प्राप्तकर्ता चुनें।",
            )}
          </small>
        </section>
      )}
      <section className="feature-card">
        <h2>{t("Where can I take my complaint?", "शिकायत कहाँ करें?")}</h2>
        <p>
          {t(
            "For a company or platform issue, use its in-app help or official support first and keep the ticket number. These additional routes have different scopes.",
            "कंपनी या प्लेटफ़ॉर्म की समस्या में पहले उसकी ऐप सहायता या आधिकारिक सपोर्ट इस्तेमाल करें और टिकट नंबर रखें। नीचे के माध्यम अलग मामलों के लिए हैं।",
          )}
        </p>
        <div className="route-list">
          {routesForComplaint(type).map((r) => (
            <article key={r.id}>
              <h3>{r.name[hi ? 1 : 0]}</h3>
              <p>{r.scope[hi ? 1 : 0]}</p>
              <div className="feature-actions">
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {t(
                    "Official complaint / guidance source",
                    "आधिकारिक शिकायत / मार्गदर्शन स्रोत",
                  )}
                  <ExternalLink size={15} />
                </a>
                {"phone" in r && (
                  <a href={`tel:${r.phone}`}>
                    <Phone size={15} />
                    {r.phone}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        <small>
          {t("Sources checked", "स्रोत जाँचे गए")} {reviewedOn}
        </small>
      </section>
    </div>
  );
}
