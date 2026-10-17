import type { Workspace } from "@/hooks/kaam/use-workspace";
import { ArrowDownToLine, Check, Copy, Mic, Printer, Trash2 } from "lucide-react";
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
            <label>
              {t(
                "Summary — update it if a correction changes its meaning",
                "सारांश — सुधार से अर्थ बदले तो इसे भी बदलें",
              )}
              <textarea
                rows={3}
                maxLength={10000}
                value={docEdit.summary}
                onChange={(e) => setDocEdit({ ...docEdit, summary: e.target.value })}
              />
            </label>
            {docEdit.fields.map((field, i) => (
              <label key={i}>
                {field.label}
                <input
                  maxLength={1000}
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
