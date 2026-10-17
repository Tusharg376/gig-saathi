import {
  earningSchema,
  localDate,
  type EarningInput,
  type Language,
  type Profile,
} from "@/lib/kaam/contracts";
import { states, hindiStates } from "@/lib/kaam/copy";
import {
  ArrowRight,
  Check,
  FileText,
  HandHeart,
  LoaderCircle,
  MessageCircle,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
export type View =
  | "home"
  | "earnings"
  | "safety"
  | "welfare"
  | "documents"
  | "grievance"
  | "saved"
  | "settings"
  | "general";
export const icons = {
  earnings: Wallet,
  safety: ShieldCheck,
  welfare: HandHeart,
  documents: FileText,
  grievance: MessageCircle,
};
export const labels: Record<string, [string, string]> = {
  home: ["My home", "मेरा होम"],
  earnings: ["My earnings", "मेरी कमाई"],
  safety: ["Stay safe", "सुरक्षित रहें"],
  welfare: ["Rights & schemes", "अधिकार और योजनाएँ"],
  documents: ["Document help", "दस्तावेज़ सहायता"],
  grievance: ["Raise a concern", "अपनी बात रखें"],
  saved: ["Saved drafts", "सहेजे गए ड्राफ़्ट"],
  settings: ["My preferences", "मेरी पसंद"],
  general: ["Ask Saathi", "साथी से पूछें"],
};
export const descriptions: Record<string, [string, string]> = {
  earnings: [
    "Know what you earn. See what stays with you.",
    "कमाई और खर्च समझें। अपनी बचत जानें।",
  ],
  safety: [
    "Practical advice for a safer working day.",
    "काम के दौरान सुरक्षित रहने के आसान तरीके।",
  ],
  welfare: [
    "Find the support you may be entitled to.",
    "अपने लिए उपलब्ध सहायता के बारे में जानें।",
  ],
  documents: [
    "Make sense of forms, letters, and paperwork.",
    "फ़ॉर्म, चिट्ठी और कागज़ात को आसानी से समझें।",
  ],
  grievance: [
    "Put your concern into the right words.",
    "अपनी परेशानी को सही शब्दों में लिखें।",
  ],
};
export const occupations: [string, string, string][] = [
  ["Delivery partner", "Delivery partner", "डिलीवरी पार्टनर"],
  ["Driver", "Driver", "ड्राइवर"],
  ["Daily-wage worker", "Daily-wage worker", "दिहाड़ी मज़दूर"],
  ["Other informal worker", "Other informal worker", "अन्य असंगठित श्रमिक"],
];
export const money = (value: number, lang: Language) =>
  new Intl.NumberFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
export function download(
  content: string,
  name: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function FriendlyScene() {
  return (
    <svg className="hero-art" viewBox="0 0 300 250" aria-hidden="true">
      <circle cx="159" cy="123" r="99" fill="#e5eee0" />
      <path d="M35 210h240" stroke="#a9bda9" strokeWidth="2" />
      <path
        d="M242 209v-65m0 38c-29-5-31-29-31-29 29 2 31 29 31 29m0-10c27-5 30-31 30-31-26 2-30 31-30 31"
        stroke="#528574"
        fill="#a8c9ac"
        strokeWidth="4"
      />
      <rect
        x="100"
        y="57"
        width="85"
        height="133"
        rx="13"
        fill="#286c5d"
        transform="rotate(-9 142 120)"
      />
      <rect
        x="107"
        y="65"
        width="71"
        height="116"
        rx="8"
        fill="#fffaf0"
        transform="rotate(-9 142 120)"
      />
      <path
        d="m130 104 10 9 21-23"
        fill="none"
        stroke="#4f8b69"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="m126 134 35-6m-32 17 26-4"
        stroke="#d3d9c6"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="209" cy="89" r="18" fill="#bf8259" />
      <path d="M190 88c-3-23 29-28 36-6l-17-1-10 8" fill="#293d35" />
      <path d="m194 112-15 46 33 16 18-41c4-14-17-26-36-21" fill="#e8b75d" />
      <path
        d="m194 117-20 25-27-12"
        fill="none"
        stroke="#bf8259"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="m209 168-10 39h-23m23-44 26 24-1 22h15"
        fill="none"
        stroke="#354f48"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <circle cx="70" cy="119" r="17" fill="#a66c4a" />
      <path d="M53 116c1-27 34-24 35 0l-15-5-20 5" fill="#273f36" />
      <path d="m60 140-9 38 35 3 1-36c-1-14-24-17-27-5" fill="#609b89" />
      <path
        d="m79 144 17 15 24-6"
        fill="none"
        stroke="#a66c4a"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="m60 178-8 30H38m39-29 9 30h12"
        fill="none"
        stroke="#354f48"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <rect x="31" y="139" width="27" height="31" rx="5" fill="#c48d59" />
      <g fill="#e8b75d">
        <path d="m68 50 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        <path d="m233 42 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </g>
      <circle cx="92" cy="85" r="4" fill="#87ab8c" />
    </svg>
  );
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close / बंद करें">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function ProfileForm({
  profile,
  onSave,
  lang,
  saving,
  onLanguageChange,
}: {
  onLanguageChange?: (language: Language) => void;
  profile: Profile | null;
  onSave: (p: Profile) => void;
  lang: Language;
  saving: boolean;
}) {
  const [language, setLanguage] = useState<Language>(profile?.language || lang);
  const [occupation, setOccupation] = useState(profile?.occupation || "");
  const [state, setState] = useState(profile?.state || "");
  const [autoSpeak, setAutoSpeak] = useState(profile?.autoSpeak ?? false);
  const hi = language === "hi";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ language, occupation, state, autoSpeak });
      }}
      className="stack"
    >
      <p className="muted">
        {hi
          ? "थोड़ी जानकारी से आपका साथी बेहतर मदद कर सकता है। कोई साइन-अप ज़रूरी नहीं।"
          : "A little about your work helps Saathi guide you. No sign-up needed."}
      </p>
      <label>
        {hi ? "अपनी भाषा चुनें" : "Choose your language"}
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value as Language);
            onLanguageChange?.(e.target.value as Language);
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </label>
      <label>
        {hi ? "आप क्या काम करते हैं?" : "What work do you do?"}
        <select
          required
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        >
          <option value="">{hi ? "काम चुनें" : "Choose your work"}</option>
          {occupations.map((o) => (
            <option key={o[0]} value={o[0]}>
              {o[hi ? 2 : 1]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {hi
          ? "आप किस राज्य / केंद्र शासित प्रदेश में काम करते हैं?"
          : "Which state / union territory do you work in?"}
        <select required value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">{hi ? "राज्य चुनें" : "Choose your state"}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {hi ? hindiStates[s] || s : s}
            </option>
          ))}
        </select>
      </label>
      <label className="speech-preference">
        <input
          type="checkbox"
          checked={autoSpeak}
          onChange={(e) => setAutoSpeak(e.target.checked)}
        />
        <span>
          <strong>
            {hi ? "जवाब अपने आप सुनाएँ" : "Read answers aloud automatically"}
          </strong>
          <small>
            {hi
              ? "चालू करने पर हर नया जवाब सुनाएँगे। कभी भी रोकें या फिर से चलाएँ। आवाज़ बनाने के लिए जवाब Google को भेजा जाता है।"
              : "Hear each new answer. Pause or resume any time. Answer text is sent to Google to generate speech."}
          </small>
        </span>
      </label>
      <div className="notice">
        <ShieldCheck size={19} />
        <span>
          {hi
            ? "आपकी प्रोफ़ाइल, कमाई और सहेजे ड्राफ़्ट इसी ब्राउज़र में रहेंगे। AI मदद के लिए ज़रूरी जानकारी Google को भेजी जाएगी।"
            : "Your profile, earnings, and saved drafts stay in this browser. Information needed for AI assistance is sent to Google."}
        </span>
      </div>
      <button className="btn primary" disabled={saving}>
        {saving ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}{" "}
        {profile
          ? hi
            ? "बदलाव सहेजें"
            : "Save preferences"
          : hi
            ? "चलिए शुरू करें"
            : "Let’s get started"}
      </button>
    </form>
  );
}
export function EarningForm({
  initial,
  onSave,
  lang,
  saving,
}: {
  initial?: EarningInput;
  onSave: (e: EarningInput) => void;
  lang: Language;
  saving: boolean;
}) {
  const hi = lang === "hi";
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const result = earningSchema.safeParse({
      date: f.get("date"),
      description: f.get("description"),
      income: Number(f.get("income")),
      expenses: Number(f.get("expenses")),
      hours: Number(f.get("hours")),
    });
    if (!result.success)
      return setError(
        hi
          ? "जानकारी जाँचें। सही तारीख और 0 से 24 घंटे भरें।"
          : "Check your details. Use a valid date and 0–24 hours.",
      );
    onSave(result.data);
  }
  return (
    <form className="stack" onSubmit={submit}>
      <p className="muted">
        {hi
          ? "सहेजने से पहले रकम और तारीख की पुष्टि करें।"
          : "Check the amounts and date before saving."}
      </p>
      <label>
        {hi ? "तारीख" : "Date"}
        <input
          name="date"
          type="date"
          required
          defaultValue={initial?.date || localDate()}
        />
      </label>
      <label>
        {hi ? "काम / विवरण" : "Work / description"}
        <input
          name="description"
          required
          maxLength={200}
          defaultValue={initial?.description}
        />
      </label>
      <div className="form-grid">
        <label>
          {hi ? "कमाई (₹)" : "Income (₹)"}
          <input
            name="income"
            required
            type="number"
            min="0"
            max="10000000"
            step="0.01"
            defaultValue={initial?.income}
          />
        </label>
        <label>
          {hi ? "खर्च (₹)" : "Expenses (₹)"}
          <input
            name="expenses"
            required
            type="number"
            min="0"
            max="10000000"
            step="0.01"
            defaultValue={initial?.expenses}
          />
        </label>
      </div>
      <label>
        {hi ? "काम के घंटे" : "Hours worked"}
        <input
          name="hours"
          required
          type="number"
          min="0"
          max="24"
          step="0.25"
          defaultValue={initial?.hours}
        />
      </label>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      <button disabled={saving} className="btn primary">
        <Check size={18} />
        {hi ? "पुष्टि करके सहेजें" : "Confirm & save"}
      </button>
    </form>
  );
}
export function ArrowUpRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
