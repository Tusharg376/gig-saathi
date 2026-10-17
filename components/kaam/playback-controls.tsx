import type { Workspace } from "@/hooks/kaam/use-workspace";
import { Volume2, Play, Pause, CircleStop, LoaderCircle } from "lucide-react";
export function PlaybackControls({ workspace }: { workspace: Workspace }) {
  const { playing, audioPreparing, paused, togglePause, stopAudio, t } = workspace;
  if (!playing) return null;
  return (
    <div className="playback-controls" aria-label={t("Answer audio", "जवाब की आवाज़")}>
      <span role="status" aria-live="polite">
        {audioPreparing ? (
          <LoaderCircle className="spin" size={16} aria-hidden="true" />
        ) : (
          <Volume2 size={16} aria-hidden="true" />
        )}
        {audioPreparing
          ? t(
              "Preparing voice… You can keep using the app.",
              "आवाज़ तैयार हो रही है… आप ऐप इस्तेमाल कर सकते हैं।",
            )
          : paused
            ? t("Audio paused — tap Resume", "आवाज़ रुकी है — फिर से चलाएँ")
            : t("Reading answer aloud", "जवाब सुनाया जा रहा है")}
      </span>
      {!audioPreparing && (
        <button type="button" className="playback-action" onClick={togglePause}>
          {paused ? (
            <Play size={18} aria-hidden="true" />
          ) : (
            <Pause size={18} aria-hidden="true" />
          )}
          {paused ? t("Resume", "फिर से चलाएँ") : t("Pause", "विराम")}
        </button>
      )}
      <button type="button" className="playback-action playback-stop" onClick={stopAudio}>
        <CircleStop size={20} aria-hidden="true" />
        {audioPreparing
          ? t("Cancel audio", "आवाज़ रद्द करें")
          : t("Stop speaking", "बोलना बंद करें")}
      </button>
    </div>
  );
}
