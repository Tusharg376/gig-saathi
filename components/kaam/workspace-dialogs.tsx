import type { Workspace } from "@/hooks/kaam/use-workspace";
import { grievanceSchema } from "@/lib/kaam/contracts";
import { ArrowDownToLine, Check, Copy, Mic, Pencil, Printer, Trash2 } from "lucide-react";
import { Dialog, download, EarningForm, ProfileForm } from "./presentation";

export function WorkspaceDialogs({ workspace }: { workspace: Workspace }) {
  const {
    data,

    saving,
    language,
    setLanguage,
    profileOpen,
    setProfileOpen,

    setInput,
    setError,
    setToast,
    entry,
    setEntry,
    draft,
    setDraft,
    deleteTarget,
    setDeleteTarget,
    grievanceOpen,
    setGrievanceOpen,

    setVoiceConsent,
    voiceDialog,
    setVoiceDialog,

    docEdit,
    setDocEdit,
    setDocumentContext,
    docEditMessageId,
    setMessages,

    inputRef,

    t,

    persist,
    ask,
    record,
    saveEntry,
    saveDraft,
    remove,
  } = workspace;
  return (
    <>
      {profileOpen && (
        <Dialog
          title={t("Make yourself at home", "साथी से परिचय करें")}
          onClose={() => setProfileOpen(false)}
        >
          <ProfileForm
            profile={data.profile}
            lang={language}
            saving={saving}
            onSave={async (p) => {
              if (await persist({ ...data, profile: p })) {
                setLanguage(p.language);
                setProfileOpen(false);
                setToast(
                  p.language === "hi" ? "आपका साथी तैयार है।" : "Your Saathi is ready.",
                );
              }
            }}
          />
        </Dialog>
      )}
      {entry && (
        <Dialog
          title={
            entry.id
              ? t("Edit earning", "कमाई बदलें")
              : t("Review earning", "कमाई की समीक्षा")
          }
          onClose={() => setEntry(null)}
        >
          <EarningForm
            initial={entry.initial}
            lang={language}
            saving={saving}
            onSave={saveEntry}
          />
        </Dialog>
      )}
      {draft && (
        <Dialog
          title={t("Your words, your choice", "आपकी बात, आपकी पसंद")}
          onClose={() => setDraft(null)}
        >
          <div className="stack">
            <label>
              {t("Title", "शीर्षक")}
              <input
                value={draft.title}
                maxLength={200}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              {t("Review and edit your draft", "अपना ड्राफ़्ट जाँचें और बदलें")}
              <textarea
                className="draft-editor"
                value={draft.body}
                maxLength={16000}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </label>
            <p className="muted">
              {t(
                "Check every fact and replace any placeholders before sharing. Nothing is sent automatically.",
                "साझा करने से पहले हर तथ्य जाँचें और खाली जगह भरें। कुछ भी अपने आप नहीं भेजा जाता।",
              )}
            </p>
            <div className="draft-actions">
              <button
                className="btn primary"
                disabled={saving || !draft.title.trim() || !draft.body.trim()}
                onClick={saveDraft}
              >
                <Check size={16} />
                {t("Save draft", "ड्राफ़्ट सहेजें")}
              </button>
              <button
                className="btn secondary"
                onClick={() =>
                  navigator.clipboard
                    .writeText(draft.body)
                    .then(() => setToast(t("Copied", "कॉपी किया गया")))
                    .catch(() => setError("REQUEST_FAILED"))
                }
              >
                <Copy size={16} />
                {t("Copy", "कॉपी")}
              </button>
              <button
                className="btn secondary"
                onClick={() =>
                  download(draft.title + "\n\n" + draft.body, "kaam-saathi-draft.txt")
                }
                aria-label={t("Download draft", "ड्राफ़्ट डाउनलोड")}
              >
                <ArrowDownToLine size={17} />
              </button>
              <button
                className="btn secondary"
                onClick={() => window.print()}
                aria-label={t("Print draft", "ड्राफ़्ट प्रिंट करें")}
              >
                <Printer size={17} />
              </button>
            </div>
            <div className="print-content">
              <h1>{draft.title}</h1>
              <p>{draft.body}</p>
            </div>
          </div>
        </Dialog>
      )}
      {docEdit && (
        <Dialog
          title={t("Correct document details", "दस्तावेज़ की जानकारी सुधारें")}
          onClose={() => setDocEdit(null)}
        >
          <div className="stack">
            {docEdit.fields.map((field, i) => (
              <label key={i}>
                {field.label}
                <input
                  value={field.value}
                  onChange={(e) =>
                    setDocEdit({
                      ...docEdit,
                      fields: docEdit.fields.map((f, j) =>
                        j === i ? { ...f, value: e.target.value } : f,
                      ),
                    })
                  }
                />
              </label>
            ))}
            <button
              className="btn primary"
              onClick={() => {
                setDocumentContext(docEdit);
                setMessages((previous) =>
                  previous.map((message) =>
                    message.id === docEditMessageId && message.answer
                      ? { ...message, answer: { ...message.answer, document: docEdit } }
                      : message,
                  ),
                );
                setInput(
                  t(
                    "I corrected the document fields. Please use the updated details for my next steps.",
                    "मैंने दस्तावेज़ की जानकारी सुधार दी है। कृपया आगे के कदमों के लिए सही जानकारी इस्तेमाल करें।",
                  ),
                );
                setDocEdit(null);
                inputRef.current?.focus();
              }}
            >
              <Check size={17} />
              {t("Use corrected details", "सही जानकारी इस्तेमाल करें")}
            </button>
            <p className="muted">
              {t(
                "Review the message and send it to update Saathi’s context.",
                "संदेश जाँचकर भेजें ताकि साथी सही जानकारी इस्तेमाल करे।",
              )}
            </p>
          </div>
        </Dialog>
      )}
      {deleteTarget && (
        <Dialog
          title={t("Delete this information?", "यह जानकारी हटा दें?")}
          onClose={() => setDeleteTarget(null)}
        >
          <p>
            {deleteTarget.kind === "all"
              ? t(
                  "This permanently removes your profile, earnings, and saved drafts from this browser.",
                  "इस ब्राउज़र से आपकी प्रोफ़ाइल, कमाई और सहेजे गए ड्राफ़्ट हमेशा के लिए हट जाएँगे।",
                )
              : t(
                  "This saved item will be removed from this browser.",
                  "यह सहेजी गई जानकारी इस ब्राउज़र से हटा दी जाएगी।",
                )}
          </p>
          <div className="dialog-actions">
            <button className="btn secondary" onClick={() => setDeleteTarget(null)}>
              {t("Keep it", "रहने दें")}
            </button>
            <button className="btn danger" disabled={saving} onClick={remove}>
              <Trash2 size={16} />
              {t("Delete", "हटाएँ")}
            </button>
          </div>
        </Dialog>
      )}
      {grievanceOpen && (
        <Dialog
          title={t("The facts behind your concern", "आपकी शिकायत के तथ्य")}
          onClose={() => setGrievanceOpen(false)}
        >
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const facts = grievanceSchema.safeParse({
                incident: f.get("incident"),
                recipient: f.get("recipient"),
                dates: f.get("dates"),
                amount: f.get("amount") === "" ? null : Number(f.get("amount")),
                resolution: f.get("resolution"),
                confirmed: f.get("confirmed") === "on",
              });
              if (!facts.success) {
                setError("INVALID_INPUT");
                return;
              }
              setGrievanceOpen(false);
              ask(
                t(
                  "Please draft my grievance using only these confirmed facts.",
                  "कृपया केवल इन पुष्ट तथ्यों से मेरी शिकायत लिखें।",
                ),
                "grievance",
                facts.data,
              );
            }}
          >
            <label>
              {t("What happened?", "क्या हुआ?")}
              <textarea
                name="incident"
                required
                minLength={5}
                maxLength={4000}
                rows={3}
              />
            </label>
            <label>
              {t("Who is this addressed to?", "शिकायत किसके लिए है?")}
              <input name="recipient" required maxLength={300} />
            </label>
            <label>
              {t("Relevant date(s)", "संबंधित तारीखें")}
              <input name="dates" required maxLength={300} />
            </label>
            <label>
              {t(
                "Amount in dispute (₹), leave blank if not applicable",
                "विवादित रकम (₹), लागू न हो तो खाली छोड़ें",
              )}
              <input name="amount" type="number" min="0" max="10000000" step="0.01" />
            </label>
            <label>
              {t("What resolution would you like?", "आप क्या समाधान चाहते हैं?")}
              <textarea
                name="resolution"
                required
                minLength={3}
                maxLength={2000}
                rows={2}
              />
            </label>
            <label className="checkbox-label" style={{ flexDirection: "row" }}>
              <input type="checkbox" name="confirmed" required />
              {t(
                "I confirm these facts are accurate.",
                "मैं पुष्टि करता/करती हूँ कि ये तथ्य सही हैं।",
              )}
            </label>
            <button className="btn primary">
              <Pencil size={17} />
              {t("Generate my draft", "मेरा ड्राफ़्ट बनाएँ")}
            </button>
          </form>
        </Dialog>
      )}
      {voiceDialog && (
        <Dialog
          title={t("Speak in your own words", "अपनी भाषा में बोलें")}
          onClose={() => setVoiceDialog(false)}
        >
          <p>
            {t(
              "Your recording will be sent to Google Gemini for transcription. Record for up to 60 seconds, review the text, then send it. This app does not save the audio.",
              "आपकी आवाज़ Google Gemini को लिखित रूप में बदलने के लिए भेजी जाएगी। 60 सेकंड तक बोलें, लिखी गई बात जाँचें, फिर भेजें। यह ऐप ऑडियो सहेजता नहीं है।",
            )}
          </p>
          <button
            className="btn primary"
            onClick={() => {
              setVoiceConsent(true);
              record();
            }}
          >
            <Mic size={18} />
            {t("Agree & record", "सहमत हूँ, रिकॉर्ड करें")}
          </button>
        </Dialog>
      )}
    </>
  );
}
