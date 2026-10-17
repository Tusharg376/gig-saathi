import { useState } from "react";
import { FileText, Upload, Pencil, ArrowRight, Volume2 } from "lucide-react";
import type { Workspace } from "@/hooks/kaam/use-workspace";

const tasks = [
  ["Explain this document in simple language.", "Explain it", "आसान भाषा में समझाएँ"],
  [
    "Identify missing or unclear information in this document.",
    "Find missing details",
    "अधूरी जानकारी पहचानें",
  ],
  [
    "Explain what actions this document asks me to take, without inventing deadlines.",
    "Help with next steps",
    "अगले कदम बताएँ",
  ],
  [
    "Translate the visible document into my selected language, preserving uncertainty.",
    "Translate it",
    "अनुवाद करें",
  ],
];
export function DocumentsView({ workspace: w }: { workspace: Workspace }) {
  const { t } = w;
  const { fileRef, abort } = w;
  const [task, setTask] = useState(tasks[0][0]);
  const [question, setQuestion] = useState("");
  const result = [...w.messages].reverse().find((m) => m.answer?.document);
  const doc = result?.answer?.document;
  return (
    <div className="feature-stack">
      <section className="feature-card document-upload">
        <span className="eyebrow">
          <FileText size={18} />
          {t("MAKE SENSE OF YOUR PAPERWORK", "अपने कागज़ात समझें")}
        </span>
        <h2>{t("Show Saathi your document", "साथी को अपना दस्तावेज़ दिखाएँ")}</h2>
        <p>
          {t(
            "A payment slip, notice, form or letter — choose what you need help with, then upload a clear photo or PDF.",
            "भुगतान पर्ची, नोटिस, फ़ॉर्म या पत्र — किस मदद की ज़रूरत है चुनें, फिर साफ़ फोटो या PDF भेजें।",
          )}
        </p>
        <div
          className="choice-grid"
          role="group"
          aria-label={t("Document task", "दस्तावेज़ से जुड़ा काम")}
        >
          {tasks.map(([id, en, hi]) => (
            <button
              className="choice-button"
              type="button"
              aria-pressed={task === id}
              key={id}
              onClick={() => setTask(id)}
            >
              {t(en, hi)}
            </button>
          ))}
        </div>
        <label>
          {t(
            "Anything specific you want to know? (optional)",
            "कुछ खास जानना चाहते हैं? (वैकल्पिक)",
          )}
          <textarea
            rows={2}
            maxLength={1500}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t(
              "For example: what amount is still unpaid?",
              "जैसे: कितना भुगतान अभी बाकी है?",
            )}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={w.docConsent}
            onChange={(e) => w.setDocConsent(e.target.checked)}
          />
          {t(
            "I agree to send this file and question to Google for AI processing. Hide full ID numbers and bank details first. Files are not saved by this app.",
            "मैं यह फ़ाइल और सवाल AI सहायता के लिए Google को भेजने से सहमत हूँ। पहले पूरे पहचान नंबर और बैंक जानकारी छिपाएँ। ऐप फ़ाइल सहेजता नहीं है।",
          )}
        </label>
        <label className="upload-drop">
          <Upload size={30} />
          <strong>{t("Choose a photo or PDF", "फोटो या PDF चुनें")}</strong>
          <span>JPEG, PNG, PDF · 10 MB · {t("up to 20 pages", "अधिकतम 20 पन्ने")}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            disabled={!w.docConsent || w.busy || w.recording}
            onChange={(e) => {
              if (e.target.files?.[0])
                void w.upload(e.target.files[0], `${task}\n${question}`);
            }}
          />
        </label>
        {w.documentLoading && (
          <div className="feature-loading" role="status">
            <p>
              {t(
                "Reading your document and preparing next steps…",
                "दस्तावेज़ पढ़कर अगले कदम तैयार कर रहे हैं…",
              )}
            </p>
            <progress aria-label={t("Analysing document", "दस्तावेज़ समझ रहे हैं")} />
            <button className="text-btn" onClick={() => abort.current?.abort()}>
              {t("Cancel", "रोकें")}
            </button>
          </div>
        )}
      </section>
      {doc && result && (
        <section
          className="feature-card document-result"
          aria-label={t("Document understanding", "दस्तावेज़ की समझ")}
        >
          <span className="eyebrow">
            {t("YOUR DOCUMENT, EXPLAINED", "आपके दस्तावेज़ की जानकारी")}
          </span>
          <h2>{t("Here is what Saathi found", "साथी को यह जानकारी मिली")}</h2>
          <p>{doc.summary}</p>
          <dl>
            {doc.fields.map((f, i) => (
              <div key={i}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {doc.missing.length > 0 && (
            <>
              <h3>{t("Missing or unclear", "अधूरा या अस्पष्ट")}</h3>
              <ul>
                {doc.missing.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
          <h3>{t("Your next steps", "आपके अगले कदम")}</h3>
          <ol>
            {doc.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="feature-actions">
            <button
              className="btn secondary"
              onClick={() => {
                w.setDocEditMessageId(result.id);
                w.setDocEdit(structuredClone(doc));
              }}
            >
              <Pencil size={16} />
              {t("Correct details", "जानकारी सुधारें")}
            </button>
            <button
              className="btn secondary"
              disabled={w.busy}
              onClick={() => w.speak(result)}
            >
              <Volume2 size={16} />
              {t("Listen", "सुनें")}
            </button>
            <button
              className="btn primary"
              onClick={() => {
                w.setDocumentContext(doc);
                w.navigate("grievance");
                w.setInput("");
              }}
            >
              {t("Prepare a complaint", "शिकायत तैयार करें")}
              <ArrowRight size={16} />
            </button>
          </div>
          <small>
            {t(
              "AI may misread text. Check and correct details before using them in a complaint.",
              "AI पढ़ने में गलती कर सकता है। शिकायत में इस्तेमाल से पहले जानकारी जाँचें और सुधारें।",
            )}
          </small>
        </section>
      )}
    </div>
  );
}
