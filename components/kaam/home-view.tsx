import type { Workspace } from "@/hooks/kaam/use-workspace";
import {
  ArrowRight,
  Globe2,
  IndianRupee,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { descriptions, FriendlyScene, icons, money } from "./presentation";

import { Composer } from "./composer";
export function HomeView({ workspace }: { workspace: Workspace }) {
  const {
    data,
    language,

    setEntry,

    hi,
    t,
    label,
    navigate,
    ensureProfile,

    all,
  } = workspace;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="sun">☀</span>
            {t("A NEW DAY, A LITTLE MORE SUPPORT", "हर दिन, थोड़ा और साथ")}
          </div>
          <h1>
            {t("You work hard.", "आप मेहनत करते हैं।")}{" "}
            <span>{t("We’re here to help.", "हम आपके साथ हैं।")}</span>
          </h1>
          <p>
            {t(
              "Your earnings, your rights, your next step. Let’s figure it out together.",
              "आपकी कमाई, आपके अधिकार, आपका अगला कदम। चलिए साथ समझते हैं।",
            )}
          </p>
        </div>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="pill">
            <Sparkles size={14} />
            {t("MEET YOUR AI SAATHI", "मिलिए अपने AI साथी से")}
          </div>
          <h2>
            {t("Big questions.", "बड़े सवाल।")}
            <br />
            {t("Simple answers.", "आसान जवाब।")}
          </h2>
          <p>
            {t(
              "From understanding your pay to finding the right support — just ask, in your own words.",
              "अपनी कमाई समझने से लेकर सही सहायता पाने तक — बस अपनी भाषा में पूछें।",
            )}
          </p>
          <button
            className="btn primary"
            onClick={() => {
              if (ensureProfile()) navigate("general");
            }}
          >
            {t("Let’s talk", "चलिए बात करें")}
            <ArrowRight size={18} />
          </button>
          <span className="hero-footnote">
            <Globe2 size={13} />
            {t("Speak in Hindi or English", "हिन्दी या English में बात करें")}
          </span>
        </div>
        <FriendlyScene />
      </section>
      <section className="journey-section">
        <div className="section-title">
          <h2>{t("What can we help you with?", "हम आपकी क्या मदद करें?")}</h2>
          <span>{t("A small step goes a long way", "छोटा कदम, बड़ा बदलाव")}</span>
        </div>
        <div className="journey-grid">
          {(Object.keys(icons) as (keyof typeof icons)[]).map((key, i) => {
            const Icon = icons[key];
            return (
              <button
                className={"journey-card " + key}
                key={key}
                onClick={() => navigate(key)}
              >
                <span className="journey-number">0{i + 1}</span>
                <span className="journey-icon">
                  <Icon size={25} strokeWidth={1.7} />
                </span>
                <h3>{label(key)}</h3>
                <p>{descriptions[key][hi ? 1 : 0]}</p>
                <span className="journey-link">
                  {t("Let’s explore", "और जानें")}
                  <ArrowRight size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="home-bottom">
        <div className="overview-card">
          <div className="section-title">
            <h2>
              <Wallet size={18} />
              {t("A clearer picture of your earnings", "अपनी कमाई की साफ़ तस्वीर")}
            </h2>
            <button className="text-btn" onClick={() => navigate("earnings")}>
              {t("View all", "सब देखें")}
              <ArrowRight size={15} />
            </button>
          </div>
          {data.earnings.length ? (
            <div className="quick-totals">
              <div>
                <span>{t("Income", "कमाई")}</span>
                <strong>{money(all.income, language)}</strong>
              </div>
              <div>
                <span>{t("Expenses", "खर्च")}</span>
                <strong>{money(all.expenses, language)}</strong>
              </div>
              <div>
                <span>{t("Take-home", "शुद्ध कमाई")}</span>
                <strong>{money(all.net, language)}</strong>
              </div>
            </div>
          ) : (
            <div className="empty-earnings">
              <span className="empty-icon">
                <IndianRupee size={25} />
              </span>
              <div>
                <h3>
                  {t("Your first entry starts the picture", "पहली एंट्री से शुरुआत करें")}
                </h3>
                <p>
                  {t(
                    "Add what you earned and spent. We’ll help with the rest.",
                    "अपनी कमाई और खर्च जोड़ें। आगे हम मदद करेंगे।",
                  )}
                </p>
                <button
                  className="text-btn"
                  onClick={() => {
                    navigate("earnings");
                    setEntry({});
                  }}
                >
                  <Plus size={15} />
                  {t("Add your first earning", "अपनी पहली कमाई जोड़ें")}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="privacy-card">
          <ShieldCheck size={26} />
          <h3>{t("Your trust comes first.", "आपका भरोसा सबसे पहले।")}</h3>
          <p>
            {t(
              "Your records stay in this browser. You choose what to share with your AI Saathi.",
              "आपके रिकॉर्ड इसी ब्राउज़र में रहते हैं। AI साथी के साथ क्या साझा करें, यह आप चुनते हैं।",
            )}
          </p>
          <button className="text-btn" onClick={() => navigate("settings")}>
            {t("Your data & preferences", "आपका डेटा और पसंद")}
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
      {<Composer workspace={workspace} />}
    </>
  );
}
