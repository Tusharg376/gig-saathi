/** Curated public reference information, not AI responses or worker records. */
export type Bilingual = readonly [string, string];
export const reviewedOn = "2026-10-17";
export const helplineSource = "https://www.india.gov.in/directory/helpline";
export const helplines = [
  {
    number: "112",
    name: ["Police, fire & medical emergency", "पुलिस, आग और चिकित्सा आपातकाल"],
  },
  { number: "1930", name: ["Cyber financial fraud", "ऑनलाइन पैसों की धोखाधड़ी"] },
  { number: "181", name: ["Women’s helpline", "महिला हेल्पलाइन"] },
  { number: "1098", name: ["Child helpline", "बाल हेल्पलाइन"] },
] satisfies { number: string; name: Bilingual }[];

export type Scheme = {
  id: string;
  name: Bilingual;
  category: "registration" | "pension" | "insurance" | "health" | "food" | "banking";
  benefit: Bilingual;
  eligibility: Bilingual;
  steps: Bilingual;
  documents: Bilingual;
  phone: string;
  source: string;
  apply: string;
  moreSources?: { label: Bilingual; url: string }[];
};
export const schemes: Scheme[] = [
  {
    id: "eshram",
    name: ["e-Shram worker registration", "ई-श्रम पंजीकरण"],
    category: "registration",
    benefit: [
      "A worker identity (UAN) and access to linked welfare services. Registration itself does not guarantee a cash payment.",
      "श्रमिक पहचान (UAN) और जुड़ी कल्याण सेवाओं तक पहुँच। पंजीकरण से अपने-आप नकद लाभ नहीं मिलता।",
    ],
    eligibility: [
      "Unorganised workers aged 16 or above, subject to the portal’s other criteria. Check your work and social-security status during registration.",
      "16 साल या अधिक उम्र के असंगठित श्रमिक, पोर्टल की अन्य शर्तों के अधीन। पंजीकरण में काम और सामाजिक सुरक्षा की स्थिति जाँचें।",
    ],
    steps: [
      "Register free on e-Shram, or visit a Common Service Centre (CSC). Review your occupation and address before submitting.",
      "ई-श्रम पर मुफ़्त पंजीकरण करें या CSC जाएँ। भेजने से पहले अपना काम और पता जाँचें।",
    ],
    documents: [
      "Aadhaar and linked mobile. Without a linked mobile, ask a CSC about biometric registration. Enter IDs only on the official service.",
      "आधार और उससे जुड़ा मोबाइल। मोबाइल न जुड़ा हो तो CSC में बायोमेट्रिक पंजीकरण पूछें। पहचान नंबर केवल आधिकारिक सेवा पर भरें।",
    ],
    phone: "14434",
    source: "https://eshram.gov.in/faqs",
    apply: "https://register.eshram.gov.in/",
  },
  {
    id: "pmsym",
    name: ["PM-SYM pension", "प्रधानमंत्री श्रम योगी मानधन"],
    category: "pension",
    benefit: [
      "Contributory pension of ₹3,000 a month from age 60, subject to scheme conditions. You and the government contribute.",
      "शर्तों के अनुसार 60 साल की उम्र से ₹3,000 मासिक पेंशन। आप और सरकार दोनों अंशदान करते हैं।",
    ],
    eligibility: [
      "Unorganised workers aged 18–40 earning up to ₹15,000 monthly; not income-tax payers or covered by EPFO, ESIC or government-funded NPS.",
      "18–40 साल के असंगठित श्रमिक, मासिक आय ₹15,000 तक; आयकरदाता या EPFO, ESIC अथवा सरकारी NPS में शामिल न हों।",
    ],
    steps: [
      "Visit a CSC to check eligibility and enrol. Confirm the age-based monthly contribution and auto-debit before joining.",
      "पात्रता जाँचने और जुड़ने के लिए CSC जाएँ। पहले उम्र के अनुसार मासिक अंशदान और ऑटो-डेबिट समझें।",
    ],
    documents: [
      "Aadhaar, savings/Jan-Dhan account and mobile number; confirm requirements with the CSC.",
      "आधार, बचत/जन-धन खाता और मोबाइल नंबर; CSC से ज़रूरतें जाँचें।",
    ],
    phone: "18002676888",
    source: "https://labour.gov.in/FAQ-0",
    apply: "https://maandhan.in/",
  },
  {
    id: "pmsby",
    name: ["PMSBY accident insurance", "प्रधानमंत्री सुरक्षा बीमा योजना"],
    category: "insurance",
    benefit: [
      "Accident cover: ₹2 lakh for accidental death or total disability; ₹1 lakh for specified partial disability. Annual premium ₹20; policy conditions apply.",
      "दुर्घटना में मृत्यु या पूर्ण दिव्यांगता पर ₹2 लाख; तय आंशिक दिव्यांगता पर ₹1 लाख। सालाना प्रीमियम ₹20; पॉलिसी की शर्तें लागू।",
    ],
    eligibility: [
      "Participating bank/post-office account holders aged 18–70 who consent to premium auto-debit. Cover is through one account only.",
      "18–70 साल के भागीदार बैंक/डाकघर खाताधारक जो प्रीमियम ऑटो-डेबिट की सहमति दें। एक खाते से ही कवर मिलता है।",
    ],
    steps: [
      "Ask your bank/post office for the PMSBY form or its official enrolment service. Check cover dates, nominee and debit consent.",
      "बैंक/डाकघर से PMSBY फ़ॉर्म या आधिकारिक पंजीकरण सेवा पूछें। कवर की तारीखें, नॉमिनी और डेबिट सहमति जाँचें।",
    ],
    documents: [
      "Account details, enrolment/consent form and nominee details, as requested by your bank.",
      "बैंक के अनुसार खाते की जानकारी, पंजीकरण/सहमति फ़ॉर्म और नॉमिनी की जानकारी।",
    ],
    phone: "18001801111",
    source: "https://www.financialservices.gov.in/pmsby",
    apply: "https://jansuraksha.gov.in/forms-pmsby.aspx",
  },
  {
    moreSources: [
      {
        label: ["Premium and cover", "प्रीमियम और कवर"],
        url: "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=154428&id=154428",
      },
    ],
    id: "pmjjby",
    name: ["PMJJBY life insurance", "प्रधानमंत्री जीवन ज्योति बीमा योजना"],
    category: "insurance",
    benefit: [
      "₹2 lakh life cover for death from any cause, subject to policy terms and waiting-period rules. Full annual premium ₹436.",
      "पॉलिसी और प्रतीक्षा अवधि की शर्तों के अनुसार किसी भी कारण से मृत्यु पर ₹2 लाख जीवन कवर। पूरे साल का प्रीमियम ₹436।",
    ],
    eligibility: [
      "Join at ages 18–50 with an eligible bank/post-office account and auto-debit consent. One account only; renewal conditions apply.",
      "18–50 साल में पात्र बैंक/डाकघर खाते और ऑटो-डेबिट सहमति के साथ जुड़ें। केवल एक खाता; नवीनीकरण की शर्तें लागू।",
    ],
    steps: [
      "Ask your bank/post office to enrol. Read the exclusions, waiting period and renewal terms before agreeing.",
      "बैंक/डाकघर में पंजीकरण पूछें। सहमति से पहले अपवाद, प्रतीक्षा अवधि और नवीनीकरण की शर्तें पढ़ें।",
    ],
    documents: [
      "Account and nominee details, plus the bank’s consent/enrolment form.",
      "खाते और नॉमिनी की जानकारी तथा बैंक का सहमति/पंजीकरण फ़ॉर्म।",
    ],
    phone: "1800110001",
    source: "https://www.indiapost.gov.in/insurance-services/pmjjby",
    apply: "https://jansuraksha.gov.in/",
  },
  {
    moreSources: [
      {
        label: ["Coverage for age 70+", "70+ उम्र के लिए कवर"],
        url: "https://nha.gov.in/img/resources/English_FAQs_related_to_the_benefits_for_senior_citizens.pdf",
      },
    ],
    id: "pmjay",
    name: ["Ayushman Bharat PM-JAY", "आयुष्मान भारत PM-JAY"],
    category: "health",
    benefit: [
      "Up to ₹5 lakh per family per year for covered hospital treatment at empanelled hospitals. Not every treatment or worker is automatically covered.",
      "सूचीबद्ध अस्पतालों में शामिल इलाज के लिए परिवार को सालाना ₹5 लाख तक कवर। हर इलाज या हर श्रमिक अपने-आप शामिल नहीं होता।",
    ],
    eligibility: [
      "Eligible families in the programme’s beneficiary records; separate coverage is available to people aged 70 and above regardless of income. Verify your record.",
      "कार्यक्रम की लाभार्थी सूची में पात्र परिवार; 70 साल या अधिक उम्र के लोगों के लिए आय से अलग कवर उपलब्ध है। अपनी पात्रता जाँचें।",
    ],
    steps: [
      "Check on the beneficiary portal or call 14555. Ask an Ayushman help desk to confirm eligibility and the hospital before treatment.",
      "लाभार्थी पोर्टल पर जाँचें या 14555 पर कॉल करें। इलाज से पहले आयुष्मान सहायता केंद्र से पात्रता और अस्पताल की पुष्टि करें।",
    ],
    documents: [
      "Identity and family/beneficiary details requested by the official portal or help desk. Requirements depend on your route.",
      "आधिकारिक पोर्टल/सहायता केंद्र के अनुसार पहचान और परिवार/लाभार्थी जानकारी। ज़रूरतें आपके आवेदन पर निर्भर हैं।",
    ],
    phone: "14555",
    source: "https://nha.gov.in/PM-JAY",
    apply: "https://beneficiary.nha.gov.in/",
  },
  {
    id: "onorc",
    name: ["One Nation One Ration Card", "एक देश, एक राशन कार्ड"],
    category: "food",
    benefit: [
      "Use your existing NFSA food entitlement at participating fair-price shops away from home. This is portability, not an extra ration allocation.",
      "घर से दूर भागीदार राशन दुकान पर अपना मौजूदा NFSA राशन लें। यह सुविधा राशन की जगह बदलती है, अतिरिक्त राशन नहीं देती।",
    ],
    eligibility: [
      "Existing beneficiaries with an NFSA ration card; authentication and available entitlement must be verified.",
      "NFSA राशन कार्ड वाले मौजूदा लाभार्थी; पहचान और उपलब्ध राशन की पुष्टि ज़रूरी है।",
    ],
    steps: [
      "Take your ration card/Aadhaar details to an enabled fair-price shop and ask for portability. Call 14445 for help.",
      "राशन कार्ड/आधार जानकारी लेकर सुविधा वाली राशन दुकान जाएँ और पोर्टेबिलिटी पूछें। मदद के लिए 14445 पर कॉल करें।",
    ],
    documents: [
      "Existing NFSA ration card or Aadhaar details for authentication at the shop.",
      "दुकान पर पहचान के लिए मौजूदा NFSA राशन कार्ड या आधार जानकारी।",
    ],
    phone: "14445",
    source:
      "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2021/mar/doc202131221.pdf",
    apply: "https://www.nfsa.gov.in/portal/Ration_Card_State_Portals_",
  },
  {
    id: "pmjdy",
    name: ["PM Jan-Dhan bank account", "प्रधानमंत्री जन-धन खाता"],
    category: "banking",
    benefit: [
      "A basic bank account with no minimum balance requirement, supporting payments and access to financial services.",
      "न्यूनतम बैलेंस की शर्त के बिना बुनियादी बैंक खाता, भुगतान और वित्तीय सेवाओं के लिए।",
    ],
    eligibility: [
      "Unbanked people who meet the bank’s identity/KYC requirements. Other benefits have separate conditions.",
      "बिना बैंक खाते वाले लोग जो बैंक की पहचान/KYC शर्तें पूरी करें। दूसरे लाभों की अलग शर्तें होती हैं।",
    ],
    steps: [
      "Visit a bank branch or Bank Mitra and ask to open a PMJDY account. Confirm the services and any applicable charges.",
      "बैंक शाखा या बैंक मित्र से PMJDY खाता खोलने को कहें। सेवाओं और लागू शुल्क की पुष्टि करें।",
    ],
    documents: [
      "Identity/address documents accepted by the bank for KYC; ask about available options if a document is missing.",
      "KYC के लिए बैंक द्वारा स्वीकार पहचान/पते के दस्तावेज़; कोई कागज़ न हो तो विकल्प पूछें।",
    ],
    phone: "1800110001",
    source: "https://pmjdy.gov.in/scheme",
    apply: "https://pmjdy.gov.in/",
  },
];
export function filterSchemes(query: string, category: string) {
  const term = query.trim().toLocaleLowerCase();
  return schemes.filter(
    (s) =>
      (category === "all" || s.category === category) &&
      [s.id, ...s.name, ...s.benefit, ...s.eligibility]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term),
  );
}

export function locationMessage(
  language: "hi" | "en",
  landmark: string,
  coordinates?: { latitude: number; longitude: number },
) {
  const parts = [
    language === "hi"
      ? "मुझे मदद चाहिए। कृपया मुझसे संपर्क करें।"
      : "I need help. Please contact me.",
  ];
  if (landmark.trim()) parts.push(landmark.trim().slice(0, 500));
  if (coordinates) {
    const { latitude, longitude } = coordinates;
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    )
      throw new Error("INVALID_LOCATION");
    parts.push(
      `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
    );
  }
  return parts.join("\n");
}
export function whatsappLink(message: string) {
  return "https://wa.me/?text=" + encodeURIComponent(message);
}
