import { useEffect } from "react";
import type { Workspace } from "@/hooks/kaam/use-workspace";
import { errorText, hindiStates } from "@/lib/kaam/copy";
import { ArrowRight, Check, HeartHandshake, ShieldCheck, Wallet } from "lucide-react";
import { ProfileForm, occupations } from "./presentation";

export function Onboarding({ workspace }: { workspace: Workspace }) {
  const { data, language, saving, error, t, completeOnboarding, finishOnboarding } =
    workspace;
  useEffect(() => {
    if (data.profile) document.getElementById("welcome-title")?.focus();
  }, [data.profile]);
  return (
    <main className="onboarding">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="onboarding-brand">
            <HeartHandshake aria-hidden="true" size={32} /> KaamSaathi
          </div>
          <div id="install-slot" className="install-slot" />
        </div>
        {data.profile ? (
          <section className="welcome-ready" aria-labelledby="welcome-title">
            <div className="ready-check">
              <Check size={38} aria-hidden="true" />
            </div>
            <p className="step-label">
              {t("READY FOR YOUR WORKDAY", "आपके कामकाजी दिन के लिए तैयार")}
            </p>
            <h1 id="welcome-title" tabIndex={-1}>
              {t("Your Saathi is ready.", "आपका साथी तैयार है।")}
            </h1>
            <p>
              {t(
                "Your preferences are saved. Ask a question in your own words, or start with your earnings.",
                "आपकी पसंद सहेज ली गई है। अपनी भाषा में सवाल पूछें या कमाई दर्ज करें।",
              )}
            </p>
            <div className="setup-summary">
              <span>{language === "hi" ? "हिन्दी" : "English"}</span>
              <span>
                {occupations.find((o) => o[0] === data.profile?.occupation)?.[
                  language === "hi" ? 2 : 1
                ] || data.profile.occupation}
              </span>
              <span>
                {language === "hi"
                  ? hindiStates[data.profile.state] || data.profile.state
                  : data.profile.state}
              </span>
            </div>
            <button className="btn primary" onClick={() => finishOnboarding("general")}>
              {t("Start talking to Saathi", "साथी से बात शुरू करें")}
              <ArrowRight size={20} />
            </button>
            <button
              className="btn secondary"
              onClick={() => finishOnboarding("earnings")}
            >
              <Wallet size={20} />
              {t("Track my earnings", "अपनी कमाई दर्ज करें")}
            </button>
          </section>
        ) : (
          <section aria-labelledby="setup-title">
            <p className="step-label">{t("A QUICK INTRODUCTION", "एक छोटा-सा परिचय")}</p>
            <h1 id="setup-title">{t("Let’s make this yours.", "आपके लिए आपका साथी।")}</h1>
            <p className="onboarding-intro">
              {t(
                "Help with your earnings, safety, paperwork and rights. Just three details to get started.",
                "कमाई, सुरक्षा, कागज़ात और अधिकारों में मदद। शुरुआत के लिए बस तीन बातें।",
              )}
            </p>
            <ProfileForm
              profile={null}
              lang={language}
              saving={saving}
              onSave={completeOnboarding}
              onLanguageChange={workspace.setLanguage}
            />
          </section>
        )}
        {error && (
          <p role="alert" className="error-text">
            {errorText(error, language)}
          </p>
        )}
        <p className="onboarding-privacy">
          <ShieldCheck size={16} />
          {t(
            "No account. No Aadhaar number. Change your preferences anytime.",
            "कोई खाता या आधार नंबर नहीं। अपनी पसंद कभी भी बदलें।",
          )}
        </p>
      </div>
    </main>
  );
}
