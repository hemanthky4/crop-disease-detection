export const translations = {
  en: {
    dashboard_title: "Welcome",
    dashboard_subtitle: "Your one-stop solution for agricultural needs",
    temperature: "Real-Time Temperature",
    climate: "Climate Condition",
    location: "Your Location",
    crop_recommend: "Crop Recommendations",
    marketplace: "Buy Agri Products",
    crops: "View Agricultural Crops",
    calendar: "Crop Calendar & Reminders",
    disease: "Crop Disease Detection",
    schemes: "Government Schemes",
    yield: "Yield Predictor",
    apply: "Apply / Learn more",
  },
  hi: {
    dashboard_title: "स्वागत है",
    dashboard_subtitle: "कृषि संबंधी सभी जरूरतों का एकमात्र समाधान",
    temperature: "रीयल-टाइम तापमान",
    climate: "जलवायु की स्थिति",
    location: "आपका स्थान",
    crop_recommend: "फसल की सिफारिशें",
    marketplace: "कृषि उत्पाद खरीदें",
    crops: "कृषि फसलें देखें",
    calendar: "फसल कैलेंडर और अनुस्मारक",
    disease: "फसल रोग का पता लगाना",
    schemes: "सरकारी योजनाएं",
    yield: "उपज भविष्यवक्ता",
    apply: "आवेदन करें / अधिक जानें",
  },
  te: {
    dashboard_title: "స్వాగతం",
    dashboard_subtitle: "వ్యవసాయ అవసరాలకు మీ ఏకైక పరిష్కారం",
    temperature: "నిజ-సమయ ఉష్ణోగ్రత",
    climate: "వాతావరణ పరిస్థితి",
    location: "మీ స్థానం",
    crop_recommend: "పంట సిఫార్సులు",
    marketplace: "వ్యవసాయ ఉత్పత్తులు కొనండి",
    crops: "వ్యవసాయ పంటలు చూడండి",
    calendar: "పంట క్యాలెండర్ & రిమైండర్‌లు",
    disease: "పంట వ్యాధుల గుర్తింపు",
    schemes: "ప్రభుత్వ పథకాలు",
    yield: "దిగుబడి అంచనా",
    apply: "దరఖాస్తు చేయండి / మరింత తెలుసుకోండి",
  },
  kn: {
    dashboard_title: "ಸ್ವಾಗತ",
    dashboard_subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಒಂದೇ ಪರಿಹಾರ",
    temperature: "ನೈಜ-ಸಮಯದ ತಾಪಮಾನ",
    climate: "ಹವಾಮಾನ ಸ್ಥಿತಿ",
    location: "ನಿಮ್ಮ ಸ್ಥಳ",
    crop_recommend: "ಬೆಳೆ ಶಿಫಾರಸುಗಳು",
    marketplace: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ",
    crops: "ಕೃಷಿ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    calendar: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ಜ್ಞಾಪನೆಗಳು",
    disease: "ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
    schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    yield: "ಇಳುವರಿ ಮುನ್ಸೂಚಕ",
    apply: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ / ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
  }
};

export type LanguageCode = 'en' | 'hi' | 'te' | 'kn';

export function getTranslation(lang: LanguageCode, key: keyof typeof translations['en']) {
  return translations[lang][key] || translations['en'][key];
}
