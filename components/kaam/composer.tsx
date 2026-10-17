import { PlaybackControls } from "./playback-controls";
import type { Workspace } from "@/hooks/kaam/use-workspace";
import {
  ArrowRight,
  Mic,
  ShieldCheck,
  Sparkles,
  Square,
  CircleStop,
  LoaderCircle,
} from "lucide-react";

export function Composer({
  workspace,
  hidePlayback = false,
}: {
  workspace: Workspace;
  hidePlayback?: boolean;
}) {
  const {
    input,
    setInput,
    busy,

    recording,
    transcribing,
    startingMic,
    seconds,
    abort,
    inputRef,
    t,

    ask,
    stopAudio,

    startRecording,
    sendRecording,
    cancelRecording,
  } = workspace;
  return (
    <div className="composer-wrap">
      {!hidePlayback && <PlaybackControls workspace={workspace} />}
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
                    `Recording ${seconds}s / 60s — Send audio to transcribe, or Stop to discard.`,
                    `रिकॉर्डिंग ${seconds} / 60 सेकंड — लिखने के लिए ऑडियो भेजें; हटाने के लिए रोकें।`,
                  )}
          </span>
          {startingMic && (
            <button type="button" className="text-btn" onClick={cancelRecording}>
              {t("Cancel", "रद्द करें")}
            </button>
          )}
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
        <div className="recording-actions">
          <button
            type="button"
            className={recording ? "btn secondary recording-stop" : "icon-btn mic"}
            onClick={() => {
              stopAudio();
              if (recording) cancelRecording();
              else startRecording();
            }}
            disabled={busy || startingMic}
            aria-label={
              recording
                ? t("Stop and discard recording", "रिकॉर्डिंग रोकें और हटाएँ")
                : t("Record voice message", "आवाज़ रिकॉर्ड करें")
            }
          >
            {recording ? (
              <>
                <CircleStop size={18} />
                {t("Stop", "रोकें")}
              </>
            ) : (
              <Mic size={21} />
            )}
          </button>
          {recording ? (
            <button
              type="button"
              className="btn primary recording-send"
              onClick={sendRecording}
              aria-label={t("Send audio for transcription", "लिखने के लिए ऑडियो भेजें")}
              title={t("Send audio for transcription", "लिखने के लिए ऑडियो भेजें")}
            >
              <ArrowRight size={21} />
              {t("Send audio", "ऑडियो भेजें")}
            </button>
          ) : busy ? (
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
        </div>
      </form>
      {recording && (
        <p className="composer-note">
          {t(
            "Send audio converts your voice to editable text. Review it, then send your message.",
            "ऑडियो भेजने पर आपकी बात लिखी जाएगी। पहले जाँचें, फिर संदेश भेजें।",
          )}
        </p>
      )}
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
