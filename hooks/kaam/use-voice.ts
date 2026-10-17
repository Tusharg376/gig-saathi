import { request } from "@/lib/kaam/client";
import type { Language } from "@/lib/kaam/contracts";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
type Options = {
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
  ensureProfile: () => boolean;
  language: Language;
  setError: Dispatch<SetStateAction<string>>;
  setInput: Dispatch<SetStateAction<string>>;
  setToast: Dispatch<SetStateAction<string>>;
  focusInput?: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  abort: RefObject<AbortController | null>;
};
export function useVoice({
  busy,
  setBusy,
  ensureProfile,
  language,
  setError,
  setInput,
  setToast,
  inputRef,
  focusInput,
  abort,
}: Options) {
  const t = (en: string, hi: string) => (language === "hi" ? hi : en);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [voiceDialog, setVoiceDialog] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [startingMic, setStartingMic] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const discardAudio = useRef(false);
  const microphoneRequest = useRef(0);
  const microphonePending = useRef(false);
  const capture = useRef<{ submitted: boolean } | null>(null);
  function cancelRecording() {
    if (!microphonePending.current && recorder.current?.state !== "recording") return;
    microphonePending.current = false;
    microphoneRequest.current++;
    setStartingMic(false);
    discardAudio.current = true;
    if (capture.current) capture.current.submitted = false;
    if (timer.current) clearInterval(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    setRecording(false);
    setToast(
      t(
        "Recording cancelled. Nothing was sent.",
        "रिकॉर्डिंग रद्द हुई। कुछ भेजा नहीं गया।",
      ),
    );
  }
  function sendRecording() {
    if (recorder.current?.state !== "recording") return;
    discardAudio.current = false;
    if (capture.current) capture.current.submitted = true;
    setRecording(false);
    setBusy(true);
    setTranscribing(true);
    recorder.current.stop();
  }
  async function startRecording() {
    if (recording) return cancelRecording();
    if (busy || startingMic || !ensureProfile()) return;
    if (!voiceConsent) {
      setVoiceDialog(true);
      return;
    }
    await record();
  }
  async function record() {
    setVoiceDialog(false);
    setError("");
    discardAudio.current = false;
    setStartingMic(true);
    microphonePending.current = true;
    const requestId = ++microphoneRequest.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
        throw new Error("MIC_DENIED");
      const acquiredStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (discardAudio.current || requestId !== microphoneRequest.current) {
        acquiredStream.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = acquiredStream;
      const mime = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const rec = new MediaRecorder(stream.current, {
        ...(mime ? { mimeType: mime } : {}),
        audioBitsPerSecond: 32000,
      });
      recorder.current = rec;
      const session = { submitted: false };
      capture.current = session;
      const chunks: BlobPart[] = [];
      const started = Date.now();
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = async () => {
        if (timer.current) clearInterval(timer.current);
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const duration = Math.min(60, (Date.now() - started) / 1000);
        if (discardAudio.current || !session.submitted) return;
        setBusy(true);
        setTranscribing(true);
        abort.current = new AbortController();
        try {
          const form = new FormData();
          form.set("audio", new Blob(chunks, { type: rec.mimeType }), "recording");
          form.set("duration", String(duration));
          form.set("language", language);
          const result = await request<{ text: string }>(
            "/api/transcribe",
            {
              method: "POST",
              body: form,
            },
            abort.current.signal,
          );
          setInput((prev) => [prev, result.text].filter(Boolean).join(" "));
          setToast(t("Review your words, then send.", "अपनी बात जाँचकर भेजें।"));
          if (focusInput) focusInput();
          else inputRef.current?.focus();
        } catch (e) {
          if (!(e instanceof DOMException && e.name === "AbortError"))
            setError(e instanceof Error ? e.message : "REQUEST_FAILED");
        } finally {
          setBusy(false);
          setTranscribing(false);
          abort.current = null;
        }
      };
      rec.start();
      setSeconds(0);
      setRecording(true);
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setSeconds(elapsed);
        if (elapsed >= 60 && rec.state === "recording") {
          cancelRecording();
          setToast(
            t(
              "60-second limit reached. Recording discarded; try a shorter message and tap Send audio.",
              "60 सेकंड पूरे हुए। रिकॉर्डिंग हटा दी गई; छोटा संदेश बोलकर ऑडियो भेजें दबाएँ।",
            ),
          );
        }
      }, 250);
    } catch {
      if (requestId !== microphoneRequest.current) return;
      stream.current?.getTracks().forEach((t) => t.stop());
      setError("MIC_DENIED");
    } finally {
      if (requestId === microphoneRequest.current) {
        microphonePending.current = false;
        setStartingMic(false);
      }
    }
  }
  useEffect(
    () => () => {
      discardAudio.current = true;

      if (timer.current) clearInterval(timer.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
    [],
  );
  return {
    voiceConsent,
    setVoiceConsent,
    voiceDialog,
    setVoiceDialog,
    recording,
    setRecording,
    seconds,
    setSeconds,
    transcribing,
    startingMic,
    recorder,
    stream,
    timer,
    discardAudio,
    startRecording,
    sendRecording,
    cancelRecording,
    record,
  };
}
