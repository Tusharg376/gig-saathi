import { useState } from "react";
import { ExternalLink, Phone, Search, Sparkles } from "lucide-react";
import type { Workspace } from "@/hooks/kaam/use-workspace";
import { filterSchemes, reviewedOn } from "@/lib/kaam/directory";

const categories = [
  ["all", "All schemes", "सभी योजनाएँ"],
  ["registration", "Worker identity", "श्रमिक पहचान"],
  ["pension", "Pension", "पेंशन"],
  ["insurance", "Insurance", "बीमा"],
  ["health", "Health", "स्वास्थ्य"],
  ["food", "Food", "राशन"],
  ["banking", "Banking", "बैंकिंग"],
];
export function SchemesView({ workspace: w }: { workspace: Workspace }) {
  const { t, hi } = w;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const matches = filterSchemes(query, category);
  return (
    <div className="feature-stack">
      <section className="directory-intro">
        <span className="eyebrow">
          {t("SUPPORT YOU CAN EXPLORE", "आपके लिए सहायता के रास्ते")}
        </span>
        <h2>{t("Find support for everyday life", "रोज़मर्रा के लिए सहारा खोजें")}</h2>
        <p>
          {t(
            "Explore selected national schemes for workers. Check the conditions, then use the official service to apply. Final eligibility is decided by the scheme authority.",
            "श्रमिकों के लिए चुनी गई राष्ट्रीय योजनाएँ देखें। शर्तें जाँचकर आधिकारिक सेवा पर आवेदन करें। अंतिम पात्रता संबंधित विभाग तय करता है।",
          )}
        </p>
        <div className="feature-actions">
          <a
            className="btn secondary"
            href="https://www.myscheme.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(
              "Browse all national & state schemes",
              "सभी राष्ट्रीय और राज्य योजनाएँ देखें",
            )}
            <ExternalLink size={16} />
          </a>
          <button
            className="btn primary"
            disabled={w.busy}
            onClick={() =>
              w.ask(
                t(
                  `Find current schemes for my occupation in ${w.data.profile?.state}. Ask for missing eligibility details and verify official sources.`,
                  `मेरे काम और ${w.data.profile?.state} राज्य के लिए मौजूदा योजनाएँ खोजें। पात्रता की अधूरी जानकारी पूछें और आधिकारिक स्रोत जाँचें।`,
                ),
                "welfare",
              )
            }
          >
            <Sparkles size={16} />
            {t("Find support for me", "मेरे लिए सहायता खोजें")}
          </button>
        </div>
      </section>
      <div className="directory-filters">
        <label>
          <Search size={17} />
          {t("Search schemes", "योजना खोजें")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Pension, food, insurance…", "पेंशन, राशन, बीमा…")}
          />
        </label>
        <label>
          {t("Category", "श्रेणी")}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map(([id, en, hindi]) => (
              <option key={id} value={id}>
                {t(en, hindi)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="source-note" role="status">
        {matches.length} {t("schemes · Sources reviewed", "योजनाएँ · स्रोत जाँचे गए")}{" "}
        {reviewedOn}.{" "}
        {t(
          "This is a selected directory, not a complete list. Rules can change; confirm on the official portal.",
          "यह चुनी हुई सूची है, पूरी सूची नहीं। नियम बदल सकते हैं; आधिकारिक पोर्टल पर पुष्टि करें।",
        )}
      </p>
      <div className="feature-grid scheme-grid">
        {matches.map((s) => (
          <article className="feature-card scheme-card" key={s.id}>
            <span className="scheme-tag">
              {t(
                ...(categories.find((c) => c[0] === s.category)!.slice(1) as [
                  string,
                  string,
                ]),
              )}
            </span>
            <h2>{s.name[hi ? 1 : 0]}</h2>
            <p>{s.benefit[hi ? 1 : 0]}</p>
            <details>
              <summary>{t("Who can apply & how", "कौन और कैसे आवेदन करे")}</summary>
              <h3>{t("Who may qualify", "कौन पात्र हो सकता है")}</h3>
              <p>{s.eligibility[hi ? 1 : 0]}</p>
              <h3>{t("How to get it", "कैसे मिलेगी")}</h3>
              <p>{s.steps[hi ? 1 : 0]}</p>
              <h3>{t("Keep ready", "ये तैयार रखें")}</h3>
              <p>{s.documents[hi ? 1 : 0]}</p>
              <a
                className="btn primary"
                href={s.apply}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Open official service", "आधिकारिक सेवा खोलें")}
                <ExternalLink size={15} />
              </a>
            </details>
            {s.moreSources?.map((source) => (
              <a
                className="source-note"
                href={source.url}
                key={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.label[hi ? 1 : 0]}
              </a>
            ))}
            <div className="scheme-contact">
              <a href={`tel:${s.phone}`}>
                <Phone size={15} />
                {s.phone}
              </a>
              <a href={s.source} target="_blank" rel="noopener noreferrer">
                {t("Official source", "आधिकारिक स्रोत")}
                <ExternalLink size={14} />
              </a>
            </div>
            <button
              className="text-btn"
              disabled={w.busy}
              onClick={() =>
                w.ask(
                  t(
                    `Help me check whether ${s.name[0]} suits me. Verify current eligibility and steps from official sources; ask for missing details.`,
                    `${s.name[1]} मेरे लिए है या नहीं, समझाएँ। आधिकारिक स्रोतों से मौजूदा पात्रता और प्रक्रिया जाँचें; अधूरी जानकारी पूछें।`,
                  ),
                  "welfare",
                )
              }
            >
              <Sparkles size={16} />
              {t("Check with Saathi", "साथी से जाँचें")}
            </button>
          </article>
        ))}
      </div>
      {!matches.length && (
        <div className="feature-card">
          <p>
            {t(
              "No matching scheme in this directory. Try another search or browse myScheme for more programmes.",
              "इस सूची में मेल खाती योजना नहीं मिली। दूसरी खोज करें या myScheme पर और योजनाएँ देखें।",
            )}
          </p>
          <button
            className="text-btn"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            {t("Clear filters", "फ़िल्टर हटाएँ")}
          </button>
        </div>
      )}
      <section className="feature-card">
        <h2>{t("Understand your rights", "अपने अधिकार समझें")}</h2>
        <p>
          {t(
            "Your state, work arrangement and situation matter. Get current, source-linked guidance before deciding your next step.",
            "आपका राज्य, काम का संबंध और हालात मायने रखते हैं। अगला कदम तय करने से पहले स्रोतों के साथ मौजूदा जानकारी लें।",
          )}
        </p>
        <button
          className="btn secondary"
          disabled={w.busy}
          onClick={() =>
            w.ask(
              t(
                "Help me understand my worker rights. Ask about my work arrangement and verify official sources.",
                "मेरे श्रमिक अधिकार समझाएँ। मेरे काम के संबंध के बारे में पूछें और आधिकारिक स्रोत जाँचें।",
              ),
              "welfare",
            )
          }
        >
          {t("Understand my rights", "मेरे अधिकार समझाएँ")}
        </button>
      </section>
    </div>
  );
}
