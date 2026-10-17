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
  async function startRecording() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
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
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
        throw new Error("MIC_DENIED");
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (discardAudio.current) {
        stream.current.getTracks().forEach((track) => track.stop());
        return;
      }
      const mime = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const rec = new MediaRecorder(stream.current, {
        ...(mime ? { mimeType: mime } : {}),
        audioBitsPerSecond: 32000,
      });
      recorder.current = rec;
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
        if (discardAudio.current) return;
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
        if (elapsed >= 60 && rec.state === "recording") rec.stop();
      }, 250);
    } catch {
      stream.current?.getTracks().forEach((t) => t.stop());
      setError("MIC_DENIED");
    } finally {
      setStartingMic(false);
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
    record,
  };
}
