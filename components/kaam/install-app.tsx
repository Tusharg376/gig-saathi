"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Smartphone, X } from "lucide-react";

type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallApp() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const deferred = useRef<InstallEvent | null>(null);
  const [available, setAvailable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [hi, setHi] = useState(true);
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const standalone = () =>
      display.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const language = () => setHi(document.documentElement.lang !== "en");
    const findSlot = () => setSlot(document.getElementById("install-slot"));
    const slotObserver = new MutationObserver(findSlot);
    slotObserver.observe(document.body, { childList: true, subtree: true });
    const frame = requestAnimationFrame(() => {
      findSlot();
      setInstalled(standalone());
      setIos(
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      );
      try {
        setVisible(sessionStorage.getItem("kaamsaathi-install-dismissed") !== "1");
      } catch {
        setVisible(true);
      }
      language();
    });
    const observer = new MutationObserver(language);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferred.current = event as InstallEvent;
      setAvailable(true);
    };
    const onInstalled = () => {
      deferred.current = null;
      setAvailable(false);
      setInstalled(true);
    };
    const onDisplay = () => setInstalled(standalone());
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    display.addEventListener("change", onDisplay);
    // Public offline assets only: worker records and AI responses are never cached.
    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch(() => {
          // Installation remains available if offline setup is blocked by the browser.
        });
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      slotObserver.disconnect();
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      display.removeEventListener("change", onDisplay);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    setHelp(false);
    try {
      sessionStorage.setItem("kaamsaathi-install-dismissed", "1");
    } catch {
      /* Storage can be disabled. */
    }
  }

  async function install() {
    const event = deferred.current;
    if (!event) {
      setHelp(!help);
      return;
    }
    deferred.current = null;
    setAvailable(false);
    setBusy(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "accepted") setVisible(false);
    } catch {
      setHelp(true);
    } finally {
      setBusy(false);
    }
  }

  if (installed || !slot) return null;
  return createPortal(
    <aside
      className="install-widget"
      aria-label={hi ? "KaamSaathi इंस्टॉल करें" : "Install KaamSaathi"}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          dismiss();
          event.currentTarget
            .querySelector<HTMLButtonElement>(".install-trigger")
            ?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHelp(false);
      }}
    >
      <button
        className={"install-trigger" + (visible ? " install-attention" : "")}
        disabled={busy}
        aria-label={
          busy
            ? hi
              ? "इंस्टॉल खुल रहा है"
              : "Opening installation"
            : hi
              ? "ऐप इंस्टॉल करें"
              : "Install app"
        }
        onClick={() => void install()}
        aria-expanded={!available ? help : undefined}
        aria-controls={!available ? "install-instructions" : undefined}
      >
        <Download size={18} aria-hidden="true" />
        <span className="install-label-long">
          {busy
            ? hi
              ? "खुल रहा है…"
              : "Opening…"
            : hi
              ? "ऐप इंस्टॉल करें"
              : "Install app"}
        </span>
        <span className="install-label-short" aria-hidden="true">
          {busy ? "…" : hi ? "इंस्टॉल" : "Install"}
        </span>
      </button>
      {help && (
        <section className="install-card" id="install-instructions">
          <div className="install-heading">
            <Smartphone size={22} aria-hidden="true" />
            <strong>
              {hi ? "KaamSaathi अपने फ़ोन पर पाएँ" : "Keep KaamSaathi on your phone"}
            </strong>
            <button
              className="icon-btn"
              onClick={dismiss}
              aria-label={hi ? "बंद करें" : "Close installation instructions"}
            >
              <X size={18} />
            </button>
          </div>
          <p>
            {ios
              ? hi
                ? "Safari में यह वेबसाइट खोलें। शेयर बटन दबाएँ → ‘होम स्क्रीन पर जोड़ें’ → ‘जोड़ें’।"
                : "Open this website in Safari. Tap Share → Add to Home Screen → Add."
              : hi
                ? "Chrome का ⋮ मेन्यू खोलें → ‘ऐप इंस्टॉल करें’ या ‘होम स्क्रीन पर जोड़ें’ चुनें। विकल्प न दिखे तो कुछ देर वेबसाइट इस्तेमाल करें और फिर कोशिश करें।"
                : "Open Chrome’s ⋮ menu → Install app or Add to Home screen. If the option is missing, use the website for a while and try again."}
          </p>
          <small>
            {hi
              ? "AI सहायता के लिए इंटरनेट ज़रूरी है।"
              : "AI assistance needs an internet connection."}
          </small>
        </section>
      )}
    </aside>,
    slot,
  );
}
