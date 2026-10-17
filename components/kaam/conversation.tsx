import type { Workspace } from "@/hooks/kaam/use-workspace";
import { totals } from "@/lib/kaam/contracts";
import {
  Check,
  CircleHelp,
  ClipboardCheck,
  Copy,
  Globe2,
  LoaderCircle,
  Pencil,
  Sparkles,
  Volume2,
} from "lucide-react";
import { ArrowUpRightIcon, money } from "./presentation";

import { Composer } from "./composer";
export function Conversation({ workspace }: { workspace: Workspace }) {
  const {
    saving,
    view,
    language,
    messages,
    setMessages,
    setInput,
    busy,
    setError,
    setToast,
    setEntry,

    setDraft,

    playing,
    transcribing,
    setDocEdit,
    setDocEditMessageId,
    setDocumentContext,
    navigate,

    endRef,
    inputRef,
    hi,
    t,

    speak,
    promptMap,
  } = workspace;
  return (
    <section className="assistant-panel">
      <div className="section-title">
        <h2>
          <Sparkles size={19} />
          {t("Your conversation with Saathi", "साथी से आपकी बातचीत")}
        </h2>
        {messages.length > 0 && (
          <button
            className="text-btn"
            disabled={busy}
            onClick={() => {
              setMessages([]);
              setDocumentContext(null);
            }}
          >
            {t("New conversation", "नई बातचीत")}
          </button>
        )}
      </div>
      {messages.length === 0 ? (
        <div className="chat-empty">
          <div className="assistant-avatar">
            <Sparkles size={24} />
          </div>
          <h3>{t("A little help. A clearer next step.", "थोड़ी मदद। अगला कदम आसान।")}</h3>
          <p>
            {t(
              "Tell me what’s on your mind. We’ll take it one step at a time.",
              "अपनी बात बताएँ। हम एक-एक कदम आगे बढ़ेंगे।",
            )}
          </p>
          <div className="suggestions">
            {(promptMap[view] || promptMap.general).map((p) => (
              <button
                key={p[0]}
                onClick={() => {
                  setInput(p[hi ? 1 : 0]);
                  inputRef.current?.focus();
                }}
              >
                {p[hi ? 1 : 0]}
                <ArrowUpRightIcon />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="messages" aria-live="polite">
          {messages.map((m) => (
            <article key={m.id} className={"message " + m.role}>
              <div className="message-author">
                {m.role === "assistant" ? (
                  <>
                    <span className="tiny-logo">
                      <Sparkles size={13} />
                    </span>
                    Saathi
                  </>
                ) : (
                  t("You", "आप")
                )}
              </div>
              <div className="message-text">{m.text}</div>
              {m.answer?.sources.length ? (
                <div className="sources">
                  <span>{t("Official sources", "आधिकारिक स्रोत")}</span>
                  {m.answer.sources.map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
                      <Globe2 size={14} />
                      <span>
                        {s.title}
                        <small>
                          {t("Checked ", "जाँचा गया ")}
                          {new Date(s.retrievedAt).toLocaleDateString(
                            hi ? "hi-IN" : "en-IN",
                          )}
                        </small>
                      </span>
                      <ArrowUpRightIcon />
                    </a>
                  ))}
                </div>
              ) : null}
              {m.answer?.searchSuggestionsHtml && (
                <iframe
                  className="search-suggestions"
                  title="Google Search suggestions"
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  srcDoc={
                    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src https: data:;"><base target="_blank">' +
                    m.answer.searchSuggestionsHtml
                  }
                />
              )}{" "}
              {m.answer?.earning && (
                <div className="action-card">
                  <div>
                    <strong>{m.answer.earning.description}</strong>
                    <p>
                      {m.answer.earning.date} · {t("Net", "शुद्ध")}{" "}
                      {money(totals([m.answer.earning]).net, language)}
                    </p>
                  </div>
                  <button
                    className="btn small primary"
                    disabled={m.accepted || saving}
                    onClick={() =>
                      setEntry({
                        initial: m.answer!.earning!,
                        messageId: m.id,
                      })
                    }
                  >
                    {m.accepted ? <Check size={16} /> : <ClipboardCheck size={16} />}{" "}
                    {m.accepted
                      ? t("Saved", "सहेजा गया")
                      : t("Review & save", "जाँचें और सहेजें")}
                  </button>
                </div>
              )}
              {m.answer?.draft && (
                <div className="action-card">
                  <div>
                    <strong>{m.answer.draft.title}</strong>
                    <p>{t("Ready for your review", "आपकी समीक्षा के लिए तैयार")}</p>
                  </div>
                  <button
                    className="btn small primary"
                    onClick={() =>
                      setDraft({
                        id: crypto.randomUUID(),
                        ...m.answer!.draft!,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                  >
                    <Pencil size={16} />
                    {t("Edit draft", "ड्राफ़्ट बदलें")}
                  </button>
                </div>
              )}
              {m.answer?.document && (
                <div className="document-result">
                  <h4>{t("What the document says", "दस्तावेज़ में क्या है")}</h4>
                  <p>{m.answer.document.summary}</p>
                  <dl>
                    {m.answer.document.fields.map((f, i) => (
                      <div key={i}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {m.answer.document.missing.length > 0 && (
                    <>
                      <h4>{t("Missing or unclear", "गायब या अस्पष्ट")}</h4>
                      <ul>
                        {m.answer.document.missing.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {m.answer.document.nextSteps.length > 0 && (
                    <>
                      <h4>{t("Next steps", "अगले कदम")}</h4>
                      <ol>
                        {m.answer.document.nextSteps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </>
                  )}
                  <button
                    className="btn small secondary"
                    onClick={() => {
                      setDocEditMessageId(m.id);
                      setDocEdit(structuredClone(m.answer!.document));
                    }}
                  >
                    <Pencil size={15} />
                    {t("Correct extracted details", "निकाली गई जानकारी सुधारें")}
                  </button>
                  <button
                    className="btn small secondary"
                    onClick={() => {
                      setDocumentContext(m.answer!.document);
                      navigate("grievance");
                      setInput(
                        t(
                          "Help me prepare a concern about this document. Ask me which facts need confirming.",
                          "इस दस्तावेज़ से जुड़ी शिकायत तैयार करने में मदद करें। मुझसे ज़रूरी तथ्यों की पुष्टि पूछें।",
                        ),
                      );
                    }}
                  >
                    {t("Use this in a grievance", "शिकायत तैयार करने में इस्तेमाल करें")}
                  </button>
                </div>
              )}
              {m.role === "assistant" && (
                <div className="message-tools">
                  <button onClick={() => speak(m)} disabled={busy && playing !== m.id}>
                    <Volume2 size={15} />
                    {playing === m.id
                      ? t("Stop audio", "आवाज़ रोकें")
                      : t("Listen", "सुनें")}
                  </button>
                  <button
                    onClick={() =>
                      navigator.clipboard
                        .writeText(m.text)
                        .then(() => setToast(t("Copied", "कॉपी किया गया")))
                        .catch(() => setError("REQUEST_FAILED"))
                    }
                  >
                    <Copy size={14} />
                    {t("Copy", "कॉपी करें")}
                  </button>
                </div>
              )}
              {m.answer?.followUps.length ? (
                <div className="followups">
                  {m.answer.followUps.map((q, i) => (
                    <p key={i}>
                      <CircleHelp size={14} />
                      {q}
                    </p>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          {busy && (
            <div className="thinking">
              <LoaderCircle size={16} className="spin" />
              {transcribing
                ? t("Transcribing your voice…", "आपकी बात लिख रहे हैं…")
                : playing
                  ? t("Preparing audio…", "आवाज़ तैयार हो रही है…")
                  : t("Saathi is working on it…", "साथी मदद कर रहा है…")}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}
      {<Composer workspace={workspace} />}
    </section>
  );
}
