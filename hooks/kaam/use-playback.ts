import { response, withAbort } from "@/lib/kaam/client";
import { SpeechCache } from "@/lib/kaam/speech-cache";
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

export function usePlayback({ busy, recording, autoSpeak, language, setError }: Options) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [audioPreparing, setAudioPreparing] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const cache = useRef(new SpeechCache());
  const autoSpeakRef = useRef(autoSpeak);
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  function stopAudio() {
    request.current?.abort();
    request.current = null;
    if (audio.current) {
      audio.current.onended = null;
      audio.current.onerror = null;
      audio.current.pause();
    }
    audio.current = null;
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
    setPlaying(null);
    setPaused(false);
    setAudioPreparing(false);
  }
  function clearAudioCache() {
    cache.current.clear();
  }
  async function resumeAudio() {
    const player = audio.current;
    if (!player) return;
    try {
      await player.play();
      if (audio.current === player) setPaused(false);
    } catch {
      if (audio.current === player) setPaused(true);
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
    const text = message.text.slice(0, 5000);
    const key = JSON.stringify([language, text]);
    const controller = new AbortController();
    request.current = controller;
    try {
      let blob = cache.current.get(key);
      if (!blob) {
        setAudioPreparing(true);
        const res = await withAbort(
          fetch("/api/speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, language }),
            signal: controller.signal,
          }),
          controller.signal,
        );
        if (!res.ok) await response(res);
        blob = await withAbort(res.blob(), controller.signal);
        controller.signal.throwIfAborted();
        cache.current.set(key, blob);
      }
      controller.signal.throwIfAborted();
      audioUrl.current = URL.createObjectURL(blob);
      const player = new Audio(audioUrl.current);
      audio.current = player;
      player.onended = stopAudio;
      player.onerror = () => {
        if (audio.current !== player) return;
        stopAudio();
        setError("REQUEST_FAILED");
      };
      setAudioPreparing(false);
      // A blocked autoplay retains the prepared audio; Resume is a user gesture.
      await resumeAudio();
    } catch (error) {
      // A cancelled, older request must never stop newer playback or replace its error.
      if (request.current !== controller) return;
      const cancelled = controller.signal.aborted;
      stopAudio();
      if (!cancelled) setError(error instanceof Error ? error.message : "REQUEST_FAILED");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setAudioPreparing(false);
      }
    }
  }
  useEffect(() => {
    const sessionCache = cache.current;
    return () => {
      request.current?.abort();
      audio.current?.pause();
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
      sessionCache.clear();
    };
  }, []);
  return {
    playing,
    paused,
    audioPreparing,
    audio,
    stopAudio,
    clearAudioCache,
    togglePause,
    speak,
  };
}
