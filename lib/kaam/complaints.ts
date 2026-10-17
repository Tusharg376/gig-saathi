import type { Bilingual } from "./directory";
export const complaintTypes = [
  {
    id: "unpaid",
    name: ["Unpaid earnings", "बकाया कमाई"],
    prompt: [
      "Describe the work you completed and which payment is missing.",
      "क्या काम किया और कौन-सा भुगतान नहीं मिला, बताएँ।",
    ],
  },
  {
    id: "deduction",
    name: ["Unexpected deduction", "बिना वजह कटौती"],
    prompt: [
      "Describe the deduction and the explanation you received, if any.",
      "कटौती और उसके लिए मिला कारण, अगर मिला हो, बताएँ।",
    ],
  },
  {
    id: "account",
    name: ["Account blocked", "खाता बंद किया गया"],
    prompt: [
      "Describe when access stopped and any notice you received.",
      "खाता कब बंद हुआ और क्या सूचना मिली, बताएँ।",
    ],
  },
  {
    id: "harassment",
    name: ["Harassment or mistreatment", "परेशान करना या दुर्व्यवहार"],
    prompt: [
      "Describe what happened in your own words. If you are in danger, use Stay Safe first.",
      "अपने शब्दों में घटना बताएँ। अभी खतरा हो तो पहले सुरक्षित रहें पेज खोलें।",
    ],
  },
  {
    id: "consumer",
    name: ["Product or service problem", "सामान या सेवा की समस्या"],
    prompt: [
      "Describe what you bought and the problem with the product or service.",
      "क्या खरीदा और सामान या सेवा में क्या समस्या है, बताएँ।",
    ],
  },
  {
    id: "other",
    name: ["Something else", "कुछ और"],
    prompt: [
      "Tell us what happened and what you want to put right.",
      "बताएँ क्या हुआ और आप क्या ठीक करवाना चाहते हैं।",
    ],
  },
] satisfies { id: string; name: Bilingual; prompt: Bilingual }[];
export type ComplaintType = (typeof complaintTypes)[number]["id"];
export const complaintRoutes = [
  {
    id: "labour",
    types: ["unpaid", "deduction", "harassment", "other"],
    name: ["Labour dispute: SAMADHAN", "श्रम विवाद: समाधान"],
    scope: [
      "For applicable employment disputes and labour claims. Coverage depends on your work relationship and jurisdiction; gig-platform disputes are not automatically covered. Check with the labour office.",
      "लागू रोजगार विवाद और श्रम दावों के लिए। काम के संबंध और क्षेत्र पर निर्भर; गिग प्लेटफ़ॉर्म विवाद अपने-आप शामिल नहीं होते। श्रम कार्यालय से जाँचें।",
    ],
    url: "https://samadhan.labour.gov.in/",
  },
  {
    id: "consumer",
    types: ["consumer"],
    name: ["National Consumer Helpline · 1915", "राष्ट्रीय उपभोक्ता हेल्पलाइन · 1915"],
    scope: [
      "For complaints as a buyer of goods/services. Not a wage-recovery channel. Register your complaint and attach purchase evidence.",
      "सामान/सेवा खरीदने वाले उपभोक्ता की शिकायत के लिए। मज़दूरी वसूली का माध्यम नहीं। खरीद के प्रमाण के साथ शिकायत दर्ज करें।",
    ],
    url: "https://consumerhelpline.gov.in/public/about",
    phone: "1915",
  },
  {
    id: "legal",
    types: ["unpaid", "deduction", "account", "harassment", "consumer", "other"],
    name: ["Legal guidance · NALSA 15100", "कानूनी मार्गदर्शन · NALSA 15100"],
    scope: [
      "Ask which authority can handle your situation and whether you qualify for legal aid. Eligibility is assessed by the legal services authority.",
      "पूछें कौन-सा विभाग आपकी समस्या देखेगा और क्या आपको कानूनी सहायता मिल सकती है। पात्रता विधिक सेवा प्राधिकरण तय करता है।",
    ],
    url: "https://himachalpradesh.nalsa.gov.in/legal-aid/",
    phone: "15100",
  },
] satisfies {
  id: string;
  types: string[];
  name: Bilingual;
  scope: Bilingual;
  url: string;
  phone?: string;
}[];
export function routesForComplaint(type: string) {
  return complaintRoutes.filter((r) => r.types.includes(type));
}
