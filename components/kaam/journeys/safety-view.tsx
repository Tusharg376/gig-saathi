import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Send, ShieldAlert } from "lucide-react";
import type { Workspace } from "@/hooks/kaam/use-workspace";
import {
  helplines,
  helplineSource,
  locationMessage,
  reviewedOn,
  whatsappLink,
} from "@/lib/kaam/directory";

export function SafetyView({ workspace: w }: { workspace: Workspace }) {
  const { t, hi, language } = w;
  const [locating, setLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [landmark, setLandmark] = useState("");
  const [locationError, setLocationError] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  function locate() {
    setLocationError(false);
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (alive.current) {
          setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
          setLocating(false);
        }
      },
      () => {
        if (alive.current) {
          setLocationError(true);
          setLocating(false);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }
  const message = locationMessage(language, landmark, coordinates);
  return (
    <div className="feature-stack">
      <section className="sos-panel">
        <div>
          <span className="eyebrow">
            <ShieldAlert size={18} />
            {t("HELP WHEN IT MATTERS", "ज़रूरत के समय मदद")}
          </span>
          <h2>{t("In immediate danger?", "अभी खतरे में हैं?")}</h2>
          <p>
            {t(
              "112 connects you to emergency help for police, fire and medical emergencies.",
              "पुलिस, आग या चिकित्सा आपातकाल में 112 पर मदद लें।",
            )}
          </p>
          <a className="btn sos-button" href="tel:112">
            <Phone size={22} />
            {t("SOS · Call 112", "SOS · 112 पर कॉल करें")}
          </a>
          <small>
            {t(
              "Opens your phone’s dialler. This website does not dispatch help.",
              "फ़ोन का डायलर खुलेगा। यह वेबसाइट मदद भेजती नहीं है।",
            )}
          </small>
        </div>
        <div className="sos-number" aria-hidden="true">
          112<span>{t("Emergency assistance", "आपातकालीन सहायता")}</span>
        </div>
      </section>
      <section className="feature-card location-card">
        <div className="section-title">
          <h2>
            <MapPin size={20} />
            {t("Let someone know where you are", "अपनों को अपनी जगह बताएँ")}
          </h2>
        </div>
        <p>
          {t(
            "Choose a trusted person in WhatsApp and send them a help message. Your location stays here until you choose to share it.",
            "WhatsApp में भरोसेमंद व्यक्ति चुनें और मदद का संदेश भेजें। साझा करने तक आपकी जगह यहीं रहती है।",
          )}
        </p>
        <label>
          {t("Nearby landmark or address (optional)", "पास की पहचान या पता (वैकल्पिक)")}
          <input
            maxLength={500}
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder={t(
              "For example: outside the railway station",
              "जैसे: रेलवे स्टेशन के बाहर",
            )}
          />
        </label>
        <div className="feature-actions">
          <button className="btn secondary" onClick={locate} disabled={locating}>
            <MapPin size={17} />
            {locating
              ? t("Finding your location…", "आपकी जगह खोज रहे हैं…")
              : coordinates
                ? t("Refresh location", "जगह फिर से पता करें")
                : t("Add my current location", "मेरी मौजूदा जगह जोड़ें")}
          </button>
          <a
            className="btn primary"
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send size={17} />
            {t("Open WhatsApp message", "WhatsApp संदेश खोलें")}
          </a>
        </div>
        {locating && <progress aria-label={t("Finding location", "जगह खोज रहे हैं")} />}
        {locationError && (
          <p role="alert">
            {t(
              "Location unavailable or permission denied. Enter a landmark above, or share a message without location.",
              "जगह नहीं मिली या अनुमति नहीं मिली। ऊपर पहचान लिखें या बिना लोकेशन संदेश भेजें।",
            )}
          </p>
        )}
        {coordinates && (
          <div className="location-preview">
            <p role="status">
              {t(
                "Location attached. Check the map before sharing.",
                "जगह जुड़ गई है। साझा करने से पहले नक्शा जाँचें।",
              )}
            </p>
            <a
              href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Check location on map", "नक्शे पर जगह जाँचें")}
            </a>
            <button className="text-btn" onClick={() => setCoordinates(undefined)}>
              {t("Remove location", "जगह हटाएँ")}
            </button>
          </div>
        )}
        <small>
          {t(
            "You choose the recipient and press Send in WhatsApp. This is a message to your contact, not an emergency-service alert.",
            "प्राप्तकर्ता चुनकर WhatsApp में भेजें दबाएँ। यह आपके परिचित को संदेश है, आपातकालीन सेवा को सूचना नहीं।",
          )}
        </small>
      </section>
      <section>
        <h2>{t("Useful helplines", "ज़रूरी हेल्पलाइन")}</h2>
        <div className="feature-grid helpline-grid">
          {helplines.map((h) => (
            <a
              className="feature-card helpline-card"
              key={h.number}
              href={`tel:${h.number}`}
            >
              <Phone size={21} />
              <span>
                {h.name[hi ? 1 : 0]}
                <strong>{h.number}</strong>
              </span>
            </a>
          ))}
        </div>
        <p className="source-note">
          <a href={helplineSource} target="_blank" rel="noopener noreferrer">
            {t("Official helpline directory", "आधिकारिक हेल्पलाइन सूची")}
          </a>{" "}
          · {t("Checked", "जाँचा गया")} {reviewedOn}
        </p>
      </section>
      <section className="feature-card">
        <h2>{t("Plan a safer workday", "काम का दिन सुरक्षित बनाएँ")}</h2>
        <p>
          {t(
            "Ask for guidance for your work and situation, checked against official sources.",
            "अपने काम और हालात के लिए आधिकारिक स्रोतों से जाँची सलाह लें।",
          )}
        </p>
        <div className="feature-actions">
          {w.promptMap.safety.map((p) => (
            <button
              className="btn secondary"
              key={p[0]}
              disabled={w.busy}
              onClick={() => w.ask(p[hi ? 1 : 0], "safety")}
            >
              {p[hi ? 1 : 0]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
