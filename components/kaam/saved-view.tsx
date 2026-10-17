import type { Workspace } from "@/hooks/kaam/use-workspace";
import { ArrowRight, FileText, Pencil, Trash2 } from "lucide-react";

export function SavedView({ workspace }: { workspace: Workspace }) {
  const {
    data,

    setDraft,
    setDeleteTarget,
    hi,
    t,
    label,
    navigate,
  } = workspace;
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          {t("READY WHEN YOU NEED THEM", "जब ज़रूरत हो, तब तैयार")}
        </div>
        <h1>{label("saved")}</h1>
        <p>
          {t(
            "Your words, saved for the next step.",
            "अगले कदम के लिए सहेजी गई आपकी बात।",
          )}
        </p>
      </div>
      {data.drafts.length ? (
        <div className="draft-grid">
          {data.drafts.map((d) => (
            <article className="panel saved-card" key={d.id}>
              <FileText size={25} />
              <h2>{d.title}</h2>
              <p>
                {d.body.slice(0, 150)}
                {d.body.length > 150 ? "…" : ""}
              </p>
              <small>
                {new Date(d.updatedAt).toLocaleDateString(hi ? "hi-IN" : "en-IN")}
              </small>
              <div className="row">
                <button
                  className="btn secondary small"
                  onClick={() => setDraft({ ...d })}
                >
                  <Pencil size={16} />
                  {t("Open draft", "ड्राफ़्ट खोलें")}
                </button>
                <button
                  className="icon-btn"
                  aria-label={t("Delete draft", "ड्राफ़्ट हटाएँ")}
                  onClick={() => setDeleteTarget({ kind: "draft", id: d.id })}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="large-empty">
          <FileText size={42} />
          <h2>{t("Your drafts will find a home here", "आपके ड्राफ़्ट यहाँ मिलेंगे")}</h2>
          <p>
            {t(
              "Create a grievance with Saathi, review it, and save it when you’re ready.",
              "साथी के साथ शिकायत लिखें, जाँचें और तैयार होने पर सहेजें।",
            )}
          </p>
          <button className="btn primary" onClick={() => navigate("grievance")}>
            {t("Write with Saathi", "साथी के साथ लिखें")}
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </>
  );
}
