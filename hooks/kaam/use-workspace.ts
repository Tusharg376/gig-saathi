import { useNavigationFocus } from "./use-navigation-focus";
import { icons, labels, View } from "@/components/kaam/presentation";
import { parsedAnswer, request } from "@/lib/kaam/client";
import {
  createProposalCommitter,
  earningConfirmation,
  earningHistory,
  isEarningsIntent,
  earningStatusMessage,
} from "@/lib/kaam/earning-confirmation";
import { createLedgerContext } from "@/lib/kaam/context";
import {
  totals,
  type Answer,
  type ChatMessage,
  type Draft,
  type EarningInput,
  type GrievanceFacts,
  type Language,
  type Mode,
  type Profile,
} from "@/lib/kaam/contracts";
import {
  clearData,
  emptyData,
  readData,
  writeData,
  type LocalData,
} from "@/lib/kaam/storage";
import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVoice } from "./use-voice";
import { usePlayback } from "./use-playback";
export function useWorkspace() {
  const [data, setData] = useState<LocalData>(emptyData);
  const [onboarding, setOnboarding] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [documentContext, setDocumentContext] = useState<Answer["document"]>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>("home");
  const [language, setLanguage] = useState<Language>("hi");
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const closeNavigation = useCallback(() => setSidebar(false), []);
  useNavigationFocus(sidebar, closeNavigation);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingEarningId, setPendingEarningId] = useState<string | null>(null);
  const commitProposal = useRef(createProposalCommitter());
  const [complaintIncident, setComplaintIncident] = useState("");
  const voiceTarget = useRef<"chat" | "complaint">("chat");
  const complaintInputRef = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [entry, setEntryState] = useState<{
    initial?: EarningInput;
    id?: string;
    messageId?: string;
  } | null>(null);
  function setEntry(next: typeof entry) {
    if (!next) setPendingEarningId(null);
    setEntryState(next);
  }
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: "entry" | "draft" | "all";
    id?: string;
  } | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [docConsent, setDocConsent] = useState(false);

  const [docEditMessageId, setDocEditMessageId] = useState<string | null>(null);
  const [docEdit, setDocEdit] = useState<Answer["document"]>(null);

  const abort = useRef<AbortController | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hi = language === "hi";
  const t = (en: string, hindi: string) => (hi ? hindi : en);
  const label = (key: string) => labels[key][hi ? 1 : 0];
  useEffect(() => {
    readData()
      .then((d) => {
        setData(d);
        if (d.profile) setLanguage(d.profile.language);
        else setOnboarding(true);
      })
      .catch(() => {
        setError("STORAGE");
        setStorageFailed(true);
      })
      .finally(() => setReady(true));
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setConfigured((d as { configured: boolean }).configured))
      .catch(() => setConfigured(null));
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    if (messages.length)
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function persist(next: LocalData) {
    setSaving(true);
    try {
      await writeData(next);
      if (data.profile?.autoSpeak && !next.profile?.autoSpeak) stopAudio();
      setData(next);
      return true;
    } catch {
      setError("STORAGE");
      return false;
    } finally {
      setSaving(false);
    }
  }
  async function completeOnboarding(profile: Profile) {
    if (await persist({ ...data, profile })) {
      setLanguage(profile.language);
      setProfileOpen(false);
    }
  }
  function finishOnboarding(next: View) {
    setOnboarding(false);
    navigate(next);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function navigate(next: View) {
    cancelRecording();
    if (!["earnings", "general", "home"].includes(next)) setPendingEarningId(null);
    setView(next);
    setAssistantOpen(false);
    setSidebar(false);
    setError("");
  }
  async function changeLanguage(next: Language) {
    setLanguage(next);
    if (data.profile)
      await persist({ ...data, profile: { ...data.profile, language: next } });
  }
  function ensureProfile() {
    if (!data.profile) {
      setOnboarding(true);
      return false;
    }
    return true;
  }

  async function ask(
    text = input,
    forcedMode?: Mode,
    grievance?: GrievanceFacts,
    showConversation = true,
  ) {
    if (!text.trim() || busy || saving || recording || startingMic || !ensureProfile())
      return;
    if (showConversation) setAssistantOpen(true);
    stopAudio();
    const selectedMode =
      forcedMode ||
      ((["home", "saved", "settings"].includes(view) ? "general" : view) as Mode);
    const mode: Mode =
      selectedMode === "general" && (pendingEarningId || isEarningsIntent(text))
        ? "earnings"
        : selectedMode;
    if (mode === "earnings") setView("earnings");
    const proposal = messages.find((m) => m.id === pendingEarningId);
    const intent = earningConfirmation(text);
    if (
      mode === "earnings" &&
      proposal?.answer?.earning &&
      !proposal.accepted &&
      intent
    ) {
      if (intent === "cancel") {
        setPendingEarningId(null);
        setInput("");
        setToast(
          t(
            "Entry not saved. Tell me the corrected details.",
            "एंट्री नहीं सहेजी गई। सही जानकारी बताएँ।",
          ),
        );
        return;
      }
      const saved = await saveProposal(proposal.id, proposal.answer.earning);
      if (saved) {
        setInput("");
        const confirmation: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: t("Earning saved on this device.", "कमाई इस डिवाइस पर सहेजी गई।"),
        };
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", text: text.trim() },
          confirmation,
        ]);
        if (data.profile?.autoSpeak) void speak(confirmation, true);
        return confirmation;
      }
      return;
    }
    if (mode === "earnings" && intent === "confirm") {
      setToast(
        t(
          "No new entry is waiting. Review an entry or describe new earnings first.",
          "कोई नई एंट्री पुष्टि के लिए नहीं है। पहले एंट्री जाँचें या नई कमाई बताएँ।",
        ),
      );
      setInput("");
      return;
    }
    // Further questions or corrections require a new proposal before a spoken yes.
    setPendingEarningId(null);
    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: text.trim(),
    };
    let reply: ChatMessage | undefined;
    const history =
      mode === "earnings"
        ? earningHistory(messages)
        : messages.slice(-16).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, user]);
    if (!grievance) setInput("");
    setError("");
    setBusy(true);
    if (
      mode !== "earnings" &&
      (view === "home" || view === "saved" || view === "settings")
    )
      setView("general");
    abort.current = new AbortController();
    try {
      const result = parsedAnswer(
        await request<Answer>(
          "/api/assistant",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: { ...data.profile, language },
              mode,
              message: user.text,
              history,
              ledger:
                mode === "earnings"
                  ? createLedgerContext(data.earnings, from, to)
                  : undefined,
              documentContext: ["documents", "grievance"].includes(mode)
                ? documentContext
                : undefined,
              grievance,
            }),
          },
          abort.current.signal,
        ),
      );
      reply = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: result.earning
          ? earningStatusMessage(result.earning, language)
          : result.message,
        answer: result,
      };
      if (result.earning && mode === "earnings") setPendingEarningId(reply.id);
      setMessages((prev) => [...prev, reply!]);
    } catch (e) {
      setMessages((previous) => previous.filter((message) => message.id !== user.id));
      // Preserve a newer typed draft; otherwise restore the interrupted question.
      setInput((current) => current || text);
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "REQUEST_FAILED");
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
    if (reply) void speak(reply, true);
    return reply;
  }
  async function upload(file: File, task?: string) {
    if (!ensureProfile() || busy) return;
    if (!docConsent) return;
    stopAudio();
    let reply: ChatMessage | undefined;
    setError("");
    if (file.size > 10 * 1024 * 1024) return setError("TOO_LARGE");
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type))
      return setError("INVALID_FILE");
    const form = new FormData();
    form.set("file", file);
    if (task) form.set("task", task);
    setDocumentLoading(true);
    form.set("profile", JSON.stringify({ ...data.profile, language }));
    setBusy(true);
    abort.current = new AbortController();
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        text:
          t("Please explain this document: ", "कृपया यह दस्तावेज़ समझाएँ: ") + file.name,
      },
    ]);
    try {
      const answer = parsedAnswer(
        await request<Answer>(
          "/api/documents",
          {
            method: "POST",
            body: form,
          },
          abort.current.signal,
        ),
      );
      setDocumentContext(answer.document);
      reply = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: answer.message,
        answer,
      };
      setMessages((prev) => [...prev, reply!]);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
      abort.current = null;
      setDocumentLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
    if (reply) void speak(reply, true);
  }

  const {
    setVoiceConsent,
    voiceDialog,
    setVoiceDialog,
    recording,
    seconds,
    transcribing,
    startingMic,
    startRecording: beginRecording,
    record,
    sendRecording,
    cancelRecording,
  } = useVoice({
    busy,
    setBusy,
    ensureProfile,
    language,
    setError,
    setInput: (update) => {
      if (voiceTarget.current === "complaint") setComplaintIncident(update);
      else setInput(update);
    },
    setToast,
    inputRef,
    focusInput: () =>
      (voiceTarget.current === "complaint"
        ? complaintInputRef.current
        : inputRef.current
      )?.focus(),
    abort,
  });
  function startRecording() {
    if (!recording) {
      stopAudio();
      voiceTarget.current = "chat";
    }
    return beginRecording();
  }
  function startComplaintRecording() {
    if (!recording) {
      stopAudio();
      voiceTarget.current = "complaint";
    }
    return beginRecording();
  }
  const {
    playing,
    paused,
    audio,
    audioPreparing,
    clearAudioCache,
    stopAudio,
    togglePause,
    speak,
  } = usePlayback({
    busy,
    recording,
    autoSpeak: data.profile?.autoSpeak ?? false,
    language,
    setBusy,
    setError,
    abortRef: abort,
  });
  useEffect(() => () => abort.current?.abort(), []);
  async function saveProposal(messageId: string, value: EarningInput) {
    return commitProposal.current(messageId, async () => {
      setError("");
      if (!messages.some((m) => m.id === messageId && !m.accepted)) return false;
      const id = `proposal-${messageId}`;
      if (data.earnings.some((earning) => earning.id === id)) return false;
      if (!(await persist({ ...data, earnings: [...data.earnings, { ...value, id }] })))
        return false;
      setPendingEarningId(null);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                accepted: true,
                text: earningStatusMessage(value, language, true),
                answer: m.answer ? { ...m.answer, earning: value } : undefined,
              }
            : m,
        ),
      );
      setToast(t("Earning saved on this device.", "कमाई इस डिवाइस पर सहेजी गई।"));
      return true;
    });
  }
  async function saveEntry(value: EarningInput) {
    if (!entry || saving) return;
    if (entry.messageId && !entry.id) {
      if (await saveProposal(entry.messageId, value)) setEntry(null);
      return;
    }
    const next = entry.id
      ? data.earnings.map((e) => (e.id === entry.id ? { ...value, id: e.id } : e))
      : [...data.earnings, { ...value, id: crypto.randomUUID() }];
    if (await persist({ ...data, earnings: next })) {
      if (entry.messageId)
        setMessages((prev) =>
          prev.map((m) => (m.id === entry.messageId ? { ...m, accepted: true } : m)),
        );
      setEntry(null);
      setToast(t("Earning saved on this device.", "कमाई इस डिवाइस पर सहेजी गई।"));
    }
  }
  async function saveDraft() {
    if (!draft) return;
    const updated = { ...draft, updatedAt: new Date().toISOString() };
    if (
      await persist({
        ...data,
        drafts: [...data.drafts.filter((d) => d.id !== draft.id), updated],
      })
    ) {
      setDraft(null);
      setToast(t("Draft saved on this device.", "ड्राफ़्ट इस डिवाइस पर सहेजा गया।"));
    }
  }
  async function remove() {
    if (!deleteTarget) return;
    let ok = false;
    if (deleteTarget.kind === "all") {
      setSaving(true);
      try {
        abort.current?.abort();
        cancelRecording();
        stopAudio();
        clearAudioCache();
        setPendingEarningId(null);
        await clearData();
        setData({ ...emptyData });
        setLanguage("hi");
        setMessages([]);
        setInput("");
        setComplaintIncident("");
        setFrom("");
        setTo("");
        setDraft(null);
        setEntry(null);
        setDocEdit(null);
        setDocumentContext(null);
        setOnboarding(true);
        setDocConsent(false);
        setVoiceConsent(false);
        setView("home");
        ok = true;
      } catch {
        setError("STORAGE");
      } finally {
        setSaving(false);
      }
    } else {
      ok = await persist({
        ...data,
        earnings:
          deleteTarget.kind === "entry"
            ? data.earnings.filter((e) => e.id !== deleteTarget.id)
            : data.earnings,
        drafts:
          deleteTarget.kind === "draft"
            ? data.drafts.filter((d) => d.id !== deleteTarget.id)
            : data.drafts,
      });
    }
    if (ok) {
      setDeleteTarget(null);
      setToast(t("Deleted from this browser.", "इस ब्राउज़र से हटा दिया गया।"));
    }
  }
  const filtered = useMemo(
    () =>
      data.earnings
        .filter((e) => (!from || e.date >= from) && (!to || e.date <= to))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.earnings, from, to],
  );
  const sum = useMemo(() => totals(filtered), [filtered]);
  const all = useMemo(() => totals(data.earnings), [data.earnings]);
  const currentIcon = view in icons ? icons[view as keyof typeof icons] : Sparkles;
  const CurrentIcon = currentIcon;
  const promptMap: Record<string, [string, string][]> = {
    earnings: [
      ["Help me record today’s earnings", "आज की कमाई दर्ज करने में मदद करें"],
      ["Explain my earnings and expenses", "मेरी कमाई और खर्च समझाएँ"],
    ],
    safety: [
      [
        "How can I work safely in extreme heat?",
        "बहुत गर्मी में सुरक्षित कैसे काम करूँ?",
      ],
      ["Help me plan a safer night shift", "रात में सुरक्षित काम करने के तरीके बताएँ"],
    ],
    welfare: [
      ["Which schemes might support me?", "मेरे लिए कौन-सी योजनाएँ हो सकती हैं?"],
      ["Help me understand my worker rights", "मेरे काम के अधिकार समझाएँ"],
    ],
    documents: [
      [
        "What documents do I need help organizing?",
        "मेरे कागज़ात व्यवस्थित करने में मदद करें",
      ],
    ],
    grievance: [
      ["Help me write about unpaid wages", "बकाया मज़दूरी की शिकायत लिखने में मदद करें"],
      [
        "Help me dispute a payment deduction",
        "भुगतान में कटौती की शिकायत लिखने में मदद करें",
      ],
    ],
    general: [["Help me understand my options", "मेरे विकल्प समझने में मदद करें"]],
  };
  return {
    pendingEarningId,
    complaintIncident,
    setComplaintIncident,
    complaintInputRef,
    startComplaintRecording,
    documentContext,
    documentLoading,
    assistantOpen,
    setAssistantOpen,
    docEditMessageId,
    setDocEditMessageId,
    onboarding,
    storageFailed,
    completeOnboarding,
    finishOnboarding,
    setDocumentContext,
    data,
    ready,
    saving,
    view,
    setView,
    language,
    setLanguage,
    profileOpen,
    setProfileOpen,
    sidebar,
    setSidebar,
    messages,
    setMessages,
    input,
    setInput,
    busy,
    error,
    setError,
    toast,
    setToast,
    configured,
    entry,
    setEntry,
    draft,
    setDraft,
    deleteTarget,
    setDeleteTarget,
    from,
    setFrom,
    to,
    setTo,
    docConsent,
    setDocConsent,
    setVoiceConsent,
    voiceDialog,
    setVoiceDialog,
    recording,
    seconds,
    playing,
    audioPreparing,
    paused,
    transcribing,
    startingMic,
    docEdit,
    setDocEdit,
    abort,
    audio,
    fileRef,
    endRef,
    inputRef,
    hi,
    t,
    label,
    persist,
    navigate,
    changeLanguage,
    ensureProfile,
    ask,
    upload,
    stopAudio,
    togglePause,
    speak,
    startRecording,
    record,
    sendRecording,
    cancelRecording,
    saveEntry,
    saveDraft,
    remove,
    filtered,
    sum,
    all,
    CurrentIcon,
    promptMap,
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
