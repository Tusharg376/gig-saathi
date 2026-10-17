"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallApp() {
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
    const frame = requestAnimationFrame(() => {
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

  if (installed) return null;
  return (
    <>
      {!visible && (
        <button className="install-reopen" onClick={() => setVisible(true)}>
          <Download size={16} aria-hidden="true" />
          {hi ? "ऐप इंस्टॉल करें" : "Install app"}
        </button>
      )}
      {visible && (
        <section
          className="install-card"
          aria-label={hi ? "KaamSaathi इंस्टॉल करें" : "Install KaamSaathi"}
        >
          <div className="install-heading">
            <Smartphone size={24} aria-hidden="true" />
            <strong>
              {hi ? "KaamSaathi अपने फ़ोन पर पाएँ" : "Keep KaamSaathi on your phone"}
            </strong>
            <button
              className="icon-btn"
              onClick={dismiss}
              aria-label={hi ? "अभी नहीं" : "Dismiss install suggestion"}
            >
              <X size={18} />
            </button>
          </div>
          <p>
            {hi
              ? "होम स्क्रीन से सीधे खोलें। डाउनलोड करने के लिए कोई स्टोर ज़रूरी नहीं।"
              : "Open straight from your home screen. No app store needed."}
          </p>
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => void install()}
            aria-expanded={!available ? help : undefined}
            aria-controls={!available ? "install-instructions" : undefined}
          >
            <Download size={18} aria-hidden="true" />
            {busy
              ? hi
                ? "खुल रहा है…"
                : "Opening…"
              : available
                ? hi
                  ? "ऐप इंस्टॉल करें"
                  : "Install app"
                : hi
                  ? "इंस्टॉल करने का तरीका"
                  : "How to install"}
          </button>
          {help && (
            <div id="install-instructions" className="install-instructions" role="status">
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
            </div>
          )}
        </section>
      )}
    </>
  );
}
