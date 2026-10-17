import type { Workspace } from "@/hooks/kaam/use-workspace";
import { Volume2, Play, Pause, Square } from "lucide-react";
export function PlaybackControls({ workspace }: { workspace: Workspace }) {
  const { playing, busy, paused, togglePause, stopAudio, t } = workspace;
  return (
    <>
      {" "}
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
    </>
  );
}
