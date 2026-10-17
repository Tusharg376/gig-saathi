import type { Workspace } from "@/hooks/kaam/use-workspace";
import { ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { ProfileForm } from "./presentation";

export function SettingsView({ workspace }: { workspace: Workspace }) {
  const {
    data,
    saving,
    language,
    setLanguage,
    busy,
    setToast,
    configured,
    setDeleteTarget,

    recording,

    t,
    label,
    persist,
  } = workspace;
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">KAAMSAATHI / {t("YOUR SPACE", "आपकी जगह")}</div>
        <h1>{label("settings")}</h1>
        <p>
          {t("A little more control over your companion.", "अपने साथी पर आपका नियंत्रण।")}
        </p>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h2>{t("Your worker profile", "आपकी श्रमिक प्रोफ़ाइल")}</h2>
          <ProfileForm
            key={data.profile?.language || language}
            profile={data.profile}
            lang={language}
            saving={saving}
            onSave={async (p) => {
              if (await persist({ ...data, profile: p })) {
                setLanguage(p.language);
                setToast(t("Preferences saved", "पसंद सहेजी गई"));
              }
            }}
          />
        </section>
        <div className="stack">
          <section className="panel">
            <h2>
              <Sparkles size={20} />
              {t("AI connection", "AI कनेक्शन")}
            </h2>
            <div className={"connection " + (configured ? "connected" : "")}>
              <span />
              {configured
                ? t("Gemini key configured", "Gemini कुंजी सेट है")
                : t("Gemini setup needed", "Gemini सेटअप ज़रूरी है")}
            </div>
            <p className="muted">
              {t(
                "A configured key is not a guarantee of model access or available quota.",
                "कुंजी सेट होने पर भी मॉडल की उपलब्धता और उपयोग सीमा अलग हो सकती है।",
              )}
            </p>
            {!configured && (
              <p className="setup-instructions">
                {t(
                  "Add your key as GEMINI_API_KEY in .env.local, then restart the local server. Never share your key in chat.",
                  "अपनी कुंजी .env.local में GEMINI_API_KEY के रूप में जोड़ें और लोकल सर्वर फिर शुरू करें। कुंजी चैट में साझा न करें।",
                )}
              </p>
            )}
          </section>
          <section className="panel">
            <h2>
              <ShieldCheck size={20} />
              {t("Your data, your choice", "आपका डेटा, आपकी पसंद")}
            </h2>
            <p>
              {t(
                "Saved on this device: your profile, confirmed earnings, and saved drafts. Conversation history stays only in this tab’s memory.",
                "इस डिवाइस पर आपकी प्रोफ़ाइल, पुष्टि की गई कमाई और ड्राफ़्ट सहेजे जाते हैं। बातचीत केवल इस टैब की मेमोरी में रहती है।",
              )}
            </p>
            <p className="muted">
              {t(
                "Questions and selected context are sent to Google Gemini. Uploaded files and audio are processed transiently by this app; Google’s own data policies apply. Clearing this browser does not delete data already processed by Google.",
                "सवाल और ज़रूरी जानकारी Google Gemini को भेजी जाती है। यह ऐप फ़ाइलें और ऑडियो स्थायी रूप से नहीं रखता; Google की डेटा नीतियाँ लागू होती हैं। ब्राउज़र का डेटा हटाने से Google द्वारा पहले संसाधित डेटा नहीं मिटता।",
              )}
            </p>
            <p className="muted">
              {t(
                "On shared devices, delete your saved information when finished.",
                "साझा डिवाइस पर काम पूरा होने के बाद अपनी सहेजी जानकारी हटा दें।",
              )}
            </p>
            <button
              className="btn danger"
              disabled={busy || recording || saving}
              onClick={() => setDeleteTarget({ kind: "all" })}
            >
              <Trash2 size={17} />
              {t("Delete my data", "मेरा डेटा हटाएँ")}
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
