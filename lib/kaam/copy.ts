import type { Language } from './contracts';
export const errorText = (code: string, language: Language) => {
 const messages: Record<string,[string,string]> = {
 KEY_MISSING:['Connect Gemini to get started. Add GEMINI_API_KEY to .env.local and restart the local server.','शुरू करने के लिए Gemini जोड़ें। .env.local में GEMINI_API_KEY डालकर लोकल सर्वर फिर शुरू करें।'],
 KEY_INVALID:['Gemini could not authenticate. Check your API key and its permissions.','Gemini से कनेक्शन नहीं हुआ। API कुंजी और अनुमति जाँचें।'],
 MODEL_UNAVAILABLE:['This Gemini model is unavailable for your key. Check GEMINI_MODEL or GEMINI_TTS_MODEL in your settings.','यह Gemini मॉडल आपकी कुंजी के लिए उपलब्ध नहीं है। मॉडल सेटिंग जाँचें।'],
 QUOTA_EXCEEDED:['Gemini’s usage limit was reached. Please try again later or check your API quota.','Gemini की उपयोग सीमा पूरी हो गई है। कुछ देर बाद फिर प्रयास करें।'],
 TIMEOUT:['The request took too long. Your saved data is safe. Please try again.','जवाब आने में ज़्यादा समय लगा। आपका सहेजा हुआ डेटा सुरक्षित है। फिर प्रयास करें।'],
 EVIDENCE_UNAVAILABLE:['I could not verify this with official sources. Add your state or more details and try again. I won’t guess about benefits or rights.','आधिकारिक स्रोतों से जानकारी की पुष्टि नहीं हो सकी। अपना राज्य या अधिक जानकारी देकर फिर पूछें। मैं अधिकारों या योजनाओं के बारे में अनुमान नहीं लगाऊँगा।'],
 INVALID_AI_RESPONSE:['The AI response was incomplete or unclear. Please try again; no record was saved.','AI का जवाब अधूरा या अस्पष्ट था। फिर प्रयास करें; कोई रिकॉर्ड नहीं सहेजा गया।'],
 NO_SPEECH:['No clear speech was detected. Try recording again or type your message.','आवाज़ साफ़ नहीं सुनाई दी। फिर रिकॉर्ड करें या लिखकर पूछें।'],
 INVALID_FILE:['Choose a valid JPEG, PNG, or PDF file.','सही JPEG, PNG या PDF फ़ाइल चुनें।'],
 TOO_LARGE:['This file is too large. Documents must be 10 MB or less.','फ़ाइल बहुत बड़ी है। दस्तावेज़ 10 MB या कम होना चाहिए।'],
 TOO_MANY_PAGES:['Choose a PDF with 20 pages or fewer.','20 या कम पन्नों वाली PDF चुनें।'],
 UNREADABLE_PDF:['This PDF cannot be read. Try an unlocked PDF or a clear photo.','यह PDF पढ़ी नहीं जा सकती। बिना पासवर्ड वाली PDF या साफ़ फोटो भेजें।'],
 INVALID_AUDIO:['The recording could not be read. Record up to 60 seconds and try again.','रिकॉर्डिंग पढ़ी नहीं जा सकी। 60 सेकंड तक रिकॉर्ड करके फिर प्रयास करें।'],
 MIC_DENIED:['Microphone access is unavailable. Allow it in your browser or type your message.','माइक्रोफ़ोन उपलब्ध नहीं है। ब्राउज़र में अनुमति दें या लिखकर पूछें।'],
 STORAGE:['Your browser could not save the data. Check available storage and try again.','ब्राउज़र डेटा नहीं सहेज सका। उपलब्ध स्टोरेज जाँचें और फिर प्रयास करें।'],
 CONTENT_BLOCKED:['Gemini could not respond to this request. Try describing the situation in a different way.','Gemini इस अनुरोध का जवाब नहीं दे सका। स्थिति को दूसरे तरीके से बताएँ।'],
 INVALID_INPUT:['Please check the entered details and try again.','दी गई जानकारी जाँचकर फिर प्रयास करें।'],
 REQUEST_FAILED:['Something interrupted the request. Check your connection and try again.','अनुरोध पूरा नहीं हुआ। इंटरनेट जाँचकर फिर प्रयास करें।'],
 };
 return (messages[code]||messages.REQUEST_FAILED)[language==='hi'?1:0];
};
export const states = ['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
