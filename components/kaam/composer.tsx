import type { Workspace } from "@/hooks/kaam/use-workspace";
import {
  ArrowRight,
  Mic,
  ShieldCheck,
  Sparkles,
  Square,
  Pause,
  Play,
  LoaderCircle,
  Volume2,
} from "lucide-react";

export function Composer({ workspace }: { workspace: Workspace }) {
  const {
    input,
    setInput,
    busy,

    recording,
    transcribing,
    startingMic,
    playing,
    paused,
    togglePause,
    seconds,
    abort,
    inputRef,
    t,

    ask,
    stopAudio,

    startRecording,
  } = workspace;
  return (
    <div className="composer-wrap">
      {playing && (
        <div
          className="playback-controls"
          aria-label={t("Answer audio", "जवाब की आवाज़")}
        >
          <span>
            <Volume2 size={16} />
            {busy
              ? t("Preparing audio…", "आवाज़ तैयार हो रही है…")
              : paused
                ? t("Audio paused — tap Resume", "आवाज़ रुकी है — फिर से चलाएँ")
                : t("Reading answer aloud", "जवाब सुनाया जा रहा है")}
          </span>
          {!busy && (
            <button type="button" className="text-btn" onClick={togglePause}>
              {paused ? <Play size={18} /> : <Pause size={18} />}
              {paused ? t("Resume", "फिर से चलाएँ") : t("Pause", "विराम")}
            </button>
          )}
          <button type="button" className="text-btn" onClick={stopAudio}>
            <Square size={16} />
            {t("Stop", "बंद करें")}
          </button>
        </div>
      )}
      {(transcribing || startingMic || recording) && (
        <div className="voice-status" role="status" id="voice-status">
          <span>
            {recording ? <Mic size={17} /> : <LoaderCircle className="spin" size={17} />}
            {transcribing
              ? t(
                  "Transcribing your voice… Review the text before sending.",
                  "आपकी बात लिख रहे हैं… भेजने से पहले जाँच लें।",
                )
              : startingMic
                ? t(
                    "Opening microphone… Allow access to speak.",
                    "माइक खुल रहा है… बोलने के लिए अनुमति दें।",
                  )
                : t(
                    `Recording ${seconds}s / 60s — tap the square when finished.`,
                    `रिकॉर्डिंग ${seconds} / 60 सेकंड — बोलने के बाद चौकोर बटन दबाएँ।`,
                  )}
          </span>
          {transcribing && (
            <progress aria-label={t("Transcribing voice", "आवाज़ को लिख रहे हैं")} />
          )}
        </div>
      )}
      <form
        className={"composer " + (recording ? "is-recording" : "")}
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <div className="composer-mark">
          <Sparkles size={21} />
        </div>
        <textarea
          ref={inputRef}
          aria-describedby={
            transcribing || startingMic || recording ? "voice-status" : undefined
          }
          aria-busy={transcribing}
          aria-label={t("Message to Saathi", "साथी के लिए संदेश")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask();
            }
          }}
          rows={1}
          maxLength={8000}
          placeholder={
            recording
              ? t(`Listening… ${seconds}s / 60s`, `सुन रहा हूँ… ${seconds} / 60 सेकंड`)
              : t(
                  "Type or speak. Your Saathi is listening.",
                  "लिखें या बोलें। आपका साथी सुन रहा है।",
                )
          }
        />
        <button
          type="button"
          className={"icon-btn mic " + (recording ? "active" : "")}
          onClick={() => {
            stopAudio();
            startRecording();
          }}
          disabled={busy || startingMic}
          aria-label={
            recording
              ? t("Stop recording", "रिकॉर्डिंग रोकें")
              : t("Record voice message", "आवाज़ रिकॉर्ड करें")
          }
        >
          {recording ? <Square size={18} /> : <Mic size={21} />}
        </button>
        {busy ? (
          <button
            type="button"
            className="send-btn"
            onClick={() => {
              abort.current?.abort();
              stopAudio();
            }}
            aria-label={t("Cancel request", "अनुरोध रोकें")}
          >
            <Square size={17} />
          </button>
        ) : (
          <button
            className="send-btn"
            disabled={!input.trim() || recording || startingMic}
            aria-label={t("Send message", "संदेश भेजें")}
          >
            <ArrowRight size={21} />
          </button>
        )}
      </form>
      <p className="composer-note">
        <ShieldCheck size={12} />
        {t(
          "Your words, your language. AI can make mistakes — check important details.",
          "आपकी बात, आपकी भाषा। AI से गलती हो सकती है — ज़रूरी जानकारी जाँचें।",
        )}
      </p>
    </div>
  );
}
