"use client";
import { errorText } from "@/lib/kaam/copy";
import {
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Globe2,
  HeartHandshake,
  Home,
  Leaf,
  LoaderCircle,
  Menu,
  MessageCircle,
  Mic,
  Settings2,
  Wallet,
  X,
} from "lucide-react";
import { Onboarding } from "./onboarding";
import { icons, View } from "./presentation";

import { useWorkspace } from "@/hooks/kaam/use-workspace";
import { HomeView } from "./home-view";
import { JourneyView } from "./journey-view";
import { SavedView } from "./saved-view";
import { SettingsView } from "./settings-view";
import { WorkspaceDialogs } from "./workspace-dialogs";
export function WorkerWorkspace() {
  const workspace = useWorkspace();
  const {
    data,
    ready,
    saving,
    view,
    setView,
    language,
    setProfileOpen,
    sidebar,
    setSidebar,
    error,
    setError,
    toast,

    hi,
    t,
    label,
    navigate,
    changeLanguage,
    startRecording,
  } = workspace;
  if (!ready)
    return (
      <main className="loading" role="status">
        <LoaderCircle className="spin" />
        {t("Getting your space ready…", "आपकी जगह तैयार हो रही है…")}
      </main>
    );
  if (workspace.storageFailed)
    return (
      <main className="onboarding">
        <div className="onboarding-card">
          <h1>{t("Your saved data needs attention", "सहेजी गई जानकारी लोड नहीं हुई")}</h1>
          <p role="alert">
            {t(
              "We could not read your saved data. Nothing has been overwritten. Try reloading or reopening this browser.",
              "आपका डेटा पढ़ा नहीं जा सका। कुछ भी बदला नहीं गया है। पेज या ब्राउज़र फिर खोलें।",
            )}
          </p>
          <button className="btn primary" onClick={() => location.reload()}>
            {t("Try again", "फिर कोशिश करें")}
          </button>
        </div>
      </main>
    );
  if (workspace.onboarding) return <Onboarding workspace={workspace} />;
  return (
    <div className="app-shell">
      {sidebar && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside id="worker-navigation" className={"sidebar " + (sidebar ? "open" : "")}>
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="KaamSaathi home"
        >
          <span className="brand-symbol">
            <HeartHandshake size={25} />
          </span>
          <span>
            Kaam<span className="brand-light">Saathi</span>
            <small>{t("A little support. Every day.", "हर दिन, आपके साथ।")}</small>
          </span>
        </button>
        <div className="nav-label">
          {t("YOUR EVERYDAY COMPANION", "आपका रोज़ का साथी")}
        </div>
        <nav>
          {(
            ["home", "earnings", "safety", "welfare", "documents", "grievance"] as View[]
          ).map((key) => {
            const Icon = key === "home" ? Home : icons[key as keyof typeof icons];
            return (
              <button
                key={key}
                className={"nav-item " + (view === key ? "selected" : "")}
                onClick={() => navigate(key)}
              >
                <Icon size={20} />
                <span>{label(key)}</span>
                {view === key && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-divider" />
        <button
          className={"nav-item " + (view === "saved" ? "selected" : "")}
          onClick={() => navigate("saved")}
        >
          <ClipboardCheck size={20} />
          <span>{label("saved")}</span>
          {data.drafts.length > 0 && <span className="count">{data.drafts.length}</span>}
        </button>
        <div className="sidebar-bottom">
          <div className="care-card">
            <div className="care-icon">
              <Leaf size={24} />
            </div>
            <strong>{t("Your work matters.", "आपका काम मायने रखता है।")}</strong>
            <p>
              {t(
                "And so does your wellbeing. Let’s take care of both.",
                "और आपकी खुशहाली भी। चलिए, दोनों का ख़याल रखें।",
              )}
            </p>
            <span>{t("Made for hardworking people.", "मेहनत करने वालों के लिए।")}</span>
          </div>
          <button className="profile-button" onClick={() => setProfileOpen(true)}>
            <div className="avatar">
              {data.profile ? <Check size={19} /> : <Settings2 size={19} />}
            </div>
            <span>
              <strong>
                {data.profile
                  ? t("My worker profile", "मेरी श्रमिक प्रोफ़ाइल")
                  : t("Set up your profile", "अपनी प्रोफ़ाइल बनाएँ")}
              </strong>
              <small>
                {data.profile?.state || t("Make Saathi yours", "साथी को अपना बनाएँ")}
              </small>
            </span>
            <ChevronRight size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              onClick={() => setSidebar(!sidebar)}
              aria-label={t("Open navigation", "नेविगेशन खोलें")}
              aria-expanded={sidebar}
              aria-controls="worker-navigation"
            >
              <Menu size={22} />
            </button>
            <span>
              {t(
                "Your companion for a better workday",
                "बेहतर कामकाजी दिन के लिए आपका साथी",
              )}
            </span>
          </div>
          <div className="header-actions">
            <span className="local-badge">
              <span />
              {t("On your device", "आपके डिवाइस पर")}
            </span>
            <button
              className="language-switch"
              onClick={() => changeLanguage(hi ? "en" : "hi")}
              disabled={saving}
            >
              <Globe2 size={16} />
              {hi ? "English" : "हिन्दी"}
              <span>⇄</span>
            </button>
            <button
              className="icon-btn settings-icon"
              aria-label={label("settings")}
              onClick={() => navigate("settings")}
            >
              <Settings2 size={19} />
            </button>
            <div id="install-slot" className="install-slot" />
          </div>
        </header>
        <main className="content" id="main-content">
          {error && (
            <div className="error-banner" role="alert">
              <CircleHelp size={20} />
              <span>{errorText(error, language)}</span>
              <button
                className="icon-btn"
                onClick={() => setError("")}
                aria-label="Dismiss"
              >
                <X size={17} />
              </button>
            </div>
          )}
          {!ready ? (
            <div className="loading">
              <LoaderCircle className="spin" />
              {t("Getting your space ready…", "आपकी जगह तैयार हो रही है…")}
            </div>
          ) : view === "home" ? (
            <HomeView workspace={workspace} />
          ) : view === "settings" ? (
            <SettingsView workspace={workspace} />
          ) : view === "saved" ? (
            <SavedView workspace={workspace} />
          ) : (
            <JourneyView workspace={workspace} />
          )}
          <footer className="footer">
            <span>
              <HeartHandshake size={15} /> KaamSaathi
            </span>
            <span>{t("Built around your everyday.", "आपके रोज़मर्रा के लिए।")}</span>
            <span>
              {t(
                "Hindi + English · Powered by Gemini",
                "हिन्दी + English · Gemini की मदद से",
              )}
            </span>
          </footer>
        </main>
      </div>
      {(view === "settings" || view === "saved") && (
        <button
          className="floating-mic"
          aria-label={t("Talk to Saathi", "साथी से बात करें")}
          onClick={() => {
            setView("general");
            startRecording();
          }}
        >
          <Mic size={22} />
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      <nav
        className="mobile-bottom-nav"
        aria-label={t("Quick navigation", "मुख्य नेविगेशन")}
      >
        {(
          [
            { view: "home", icon: Home, label: t("Home", "होम") },
            { view: "earnings", icon: Wallet, label: t("Earnings", "कमाई") },
            {
              view: "general",
              icon: MessageCircle,
              label: t("Talk", "बात करें"),
            },
          ] as const
        ).map((item) => (
          <button
            key={item.view}
            aria-current={view === item.view ? "page" : undefined}
            onClick={() => navigate(item.view)}
          >
            <item.icon size={21} />
            {item.label}
          </button>
        ))}
        <button
          aria-expanded={sidebar}
          aria-controls="worker-navigation"
          onClick={() => setSidebar(!sidebar)}
        >
          <Menu size={21} />
          {t("More", "और")}
        </button>
      </nav>
      <WorkspaceDialogs workspace={workspace} />
    </div>
  );
}
