import { response } from "@/lib/kaam/client";
import type { ChatMessage, Language } from "@/lib/kaam/contracts";
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
  recording: boolean;
  autoSpeak: boolean;
  language: Language;
  setBusy: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  abortRef: RefObject<AbortController | null>;
};

export function usePlayback({
  busy,
  recording,
  autoSpeak,
  language,
  setBusy,
  setError,
  abortRef,
}: Options) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const autoSpeakRef = useRef(autoSpeak);
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  function stopAudio() {
    request.current?.abort();
    audio.current?.pause();
    audio.current = null;
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
    setPlaying(null);
    setPaused(false);
  }
  async function resumeAudio() {
    try {
      await audio.current?.play();
      setPaused(false);
    } catch {
      setPaused(true);
    }
  }
  function togglePause() {
    if (!audio.current) return;
    if (audio.current.paused) void resumeAudio();
    else {
      audio.current.pause();
      setPaused(true);
    }
  }
  async function speak(message: ChatMessage, automatic = false) {
    if (automatic && !autoSpeakRef.current) return;
    if (playing === message.id) return stopAudio();
    if (busy || recording) return;
    stopAudio();
    setPlaying(message.id);
    setError("");
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    abortRef.current = controller;
    try {
      const res = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.text.slice(0, 5000), language }),
        signal: controller.signal,
      });
      if (!res.ok) await response(res);
      const blob = await res.blob();
      controller.signal.throwIfAborted();
      audioUrl.current = URL.createObjectURL(blob);
      const player = new Audio(audioUrl.current);
      audio.current = player;
      player.onended = stopAudio;
      player.onerror = () => {
        stopAudio();
        setError("REQUEST_FAILED");
      };
      // A blocked autoplay retains the prepared audio; Resume is a user gesture.
      await resumeAudio();
    } catch (error) {
      const cancelled = controller.signal.aborted;
      stopAudio();
      if (!cancelled) setError(error instanceof Error ? error.message : "REQUEST_FAILED");
    } finally {
      if (request.current === controller) request.current = null;
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
    }
  }
  useEffect(
    () => () => {
      request.current?.abort();
      audio.current?.pause();
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    },
    [],
  );
  return { playing, paused, audio, stopAudio, togglePause, speak };
}
