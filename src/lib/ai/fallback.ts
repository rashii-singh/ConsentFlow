import { SupportedLanguage } from './prompts';

export interface SimplifiedNoticeResult {
  simplified: string;
  keyPoints: string[];
  readingTime: string;
}

const FALLBACK_TEMPLATES: Record<SupportedLanguage, Record<string, SimplifiedNoticeResult>> = {
  en: {
    healthcare: {
      simplified: 'HealthPlus Care accesses your health history and diagnostic lab reports so doctors can diagnose you during online consultations.',
      keyPoints: [
        'Access health history for tele-consultations',
        'Share digital prescriptions directly with pharmacies',
        'Emergency doctor access in urgent health situations',
      ],
      readingTime: '30s',
    },
    retail: {
      simplified: 'ShopSmart Retail tracks products you view and purchase to show you customized discount deals and relevant items.',
      keyPoints: [
        'Tailored store discounts and coupon alerts',
        'Browsing history saved for 90 days for recommendations',
        'Optional location access for nearby store offers',
      ],
      readingTime: '25s',
    },
    kyc: {
      simplified: 'We verify your government photo ID and bank details to prevent payment fraud on high-value orders.',
      keyPoints: [
        'One-time government identity check',
        'Encrypted verification to prevent identity theft',
        'Your identity details are never sold to third parties',
      ],
      readingTime: '30s',
    },
    generic: {
      simplified: 'This company collects essential information needed to provide you service under DPDP Act 2023 guidelines.',
      keyPoints: [
        'Information used strictly for requested service',
        '1-tap right to withdraw consent at any time',
        'Encrypted data storage with audit tracking',
      ],
      readingTime: '20s',
    },
  },
  hi: {
    healthcare: {
      simplified: 'हेल्थप्लस केयर आपकी स्वास्थ्य जानकारी का उपयोग ऑनलाइन डॉक्टर सलाह और डिजिटल पर्चे देने के लिए करता है।',
      keyPoints: [
        'ऑनलाइन डॉक्टर सलाह के लिए मेडिकल रिपोर्ट का उपयोग',
        'डिजिटल पर्चे सीधे फार्मेसी के साथ साझा करना',
        'आपातकालीन स्थिति में डॉक्टर सहायता',
      ],
      readingTime: '35s',
    },
    retail: {
      simplified: 'शॉपस्मार्ट रिटेल आपके द्वारा देखे गए सामानों को ट्रैक करता है ताकि आपको बेहतरीन छूट और नए ऑफर दिखाए जा सकें।',
      keyPoints: [
        'आपकी पसंद के अनुसार विशेष डिस्काउंट अलर्ट',
        '90 दिनों के लिए खरीदारी इतिहास सहेजना',
        'पास की दुकानों के विशेष ऑफर की जानकारी',
      ],
      readingTime: '30s',
    },
    kyc: {
      simplified: 'हम ऑनलाइन धोखाधड़ी से सुरक्षा के लिए आपकी सरकारी पहचान (ID) की पुष्टि करते हैं।',
      keyPoints: [
        'सुरक्षित और एन्क्रिप्टेड पहचान सत्यापन',
        'धोखाधड़ी से सुरक्षा के लिए केवल एक बार जांच',
        'आपकी पहचान की जानकारी कभी बेची नहीं जाती',
      ],
      readingTime: '30s',
    },
    generic: {
      simplified: 'यह कंपनी DPDP अधिनियम 2023 के तहत आपको सेवा प्रदान करने के लिए आवश्यक डेटा एकत्र करती है।',
      keyPoints: [
        'डेटा केवल सेवा देने के लिए उपयोग होता है',
        '1-क्लिक में सहमति वापस लेने का अधिकार',
        'सुरक्षित ऑडिट ट्रेल रिकॉर्ड',
      ],
      readingTime: '25s',
    },
  },
  kn: {
    healthcare: {
      simplified: 'ಆನ್‌ಲೈನ್ ವೈದ್ಯರ ಸಲಹೆಗಾಗಿ ಹೆಲ್ತ್‌ಪ್ಲಸ್ ಕೇರ್ ನಿಮ್ಮ ಆರೋಗ್ಯ ವರದಿಗಳನ್ನು ಬಳಸುತ್ತದೆ.',
      keyPoints: [
        'ವೈದ್ಯರ ಸಲಹೆಗೆ ಆರೋಗ್ಯ ವರದಿಗಳ ಪರಿಶೀಲನೆ',
        'ಔಷಧಿ ಅಂಗಡಿಗಳಿಗೆ ನೇರ ಡಿಜಿಟಲ್ ಚೀಟಿ ಕಳುಹಿಸುವಿಕೆ',
        'ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು',
      ],
      readingTime: '35s',
    },
    retail: {
      simplified: 'ನಿಮಗೆ ಉತ್ತಮ ರಿಯಾಯಿತಿ ಆಫರ್‌ಗಳನ್ನು ತೋರಿಸಲು ಶಾಪ್‌ಸ್ಮಾರ್ಟ್ ನಿಮ್ಮ ಖರೀದಿಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.',
      keyPoints: [
        'ನಿಮ್ಮ ಆಯ್ಕೆಯಂತೆ ವಿಶೇಷ ಆಫರ್ ನೀಡಿಕೆ',
        '90 ದಿನಗಳ ಖರೀದಿ ವಿವರಗಳ ಸಂಗ್ರಹ',
        'ಸಮೀಪದ ಅಂಗಡಿಗಳ ಆಫರ್ ಮಾಹಿತಿ',
      ],
      readingTime: '30s',
    },
    kyc: {
      simplified: 'ವಂಚನೆ ತಡೆಯಲು ನಿಮ್ಮ ಸರ್ಕಾರಿ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',
      keyPoints: [
        'ಸುರಕ್ಷಿತ ಒಮ್ಮೆ ಮಾತ್ರ ಗುರುತಿನ ಪರಿಶೀಲನೆ',
        'ಆನ್‌ಲೈನ್ ಹಣಕಾಸು ವಂಚನೆಯಿಂದ ರಕ್ಷಣೆ',
        'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಇತರರಿಗೆ ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ',
      ],
      readingTime: '30s',
    },
    generic: {
      simplified: 'DPDP ಕಾಯಿದೆ 2023 ರ ಅಡಿಯಲ್ಲಿ ಸೇವೆ ನೀಡಲು ಅಗತ್ಯವಿರುವ ವಿವರಗಳನ್ನು ಮಾತ್ರ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ.',
      keyPoints: [
        'ಸೇವೆಗೆ ಮಾತ್ರ ವಿವರಗಳ ಬಳಕೆ',
        'ಯಾವಾಗ ಬೇಕಾದರೂ ಸಮ್ಮತಿಯನ್ನು ಹಿಂಪಡೆಯುವ ಹಕ್ಕು',
        'ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ದಾಖಲೆಗಳ ರಕ್ಷಣೆ',
      ],
      readingTime: '25s',
    },
  },
  ta: {
    healthcare: {
      simplified: 'ஆன்லைன் மருத்துவர் ஆலோசனை வழங்க ஹெல்த்பிளஸ் கேர் உங்கள் மருத்துவ அறிக்கைகளைப் பயன்படுத்துகிறது.',
      keyPoints: [
        'மருத்துவர் ஆலோசனைக்கு மருத்துவ அறிக்கை பயன்பாடு',
        'மருந்தகங்களுக்கு நேரடியாக டிஜிட்டல் மருந்துச்சீட்டு அனுப்புதல்',
        'அவசர மருத்துவ உதவி சேவை',
      ],
      readingTime: '35s',
    },
    retail: {
      simplified: 'உங்களுக்கு ஏற்ற தள்ளுபடி சலுகைகளைக் காட்ட சாப்ஸ்பார்ட் உங்கள் வாங்குதல்களைக் கண்காணிக்கிறது.',
      keyPoints: [
        'உங்களுக்கு பிடித்த பொருட்களுக்கான தள்ளுபடி சலுகைகள்',
        '90 நாட்களுக்கான வாடிக்கையாளர் விருப்பப் பதிவு',
        'அருகிலுள்ள கடை சலுகைகள் அறிவிப்பு',
      ],
      readingTime: '30s',
    },
    kyc: {
      simplified: 'மோசடிகளைத் தடுக்க உங்கள் அரசு அடையாளச் சான்று சரிபார்க்கப்படுகிறது.',
      keyPoints: [
        'பாதுகாப்பான அடையாளச் சரிபார்ப்பு',
        'ஆன்லைன் பண மோசடிகளில் இருந்து பாதுகாப்பு',
        'உங்கள் தகவல்கள் யாருக்கும் விற்கப்படாது',
      ],
      readingTime: '30s',
    },
    generic: {
      simplified: 'DPDP சட்டம் 2023 இன் படி உங்களுக்கு சேவை வழங்க தேவையான தகவல்கள் மட்டுமே சேகரிக்கப்படுகின்றன.',
      keyPoints: [
        'சேவைக்கு மட்டுமே தகவல் பயன்பாடு',
        'எப்போது வேண்டுமானாலும் சம்மதத்தை ரத்து செய்யும் உரிமை',
        'பாதுகாப்பான டிஜிட்டல் பதிவு',
      ],
      readingTime: '25s',
    },
  },
  te: {
    healthcare: {
      simplified: 'ఆన్‌లైన్ డాక్టర్ సలహా కోసం హెల్త్‌ప్లస్ కేర్ మీ ఆరోగ్య నివేదికలను ఉపయోగిస్తుంది.',
      keyPoints: [
        'డాక్టర్ సలహా కోసం వైద్య నివేదికల వినియోగం',
        'ఫార్మసీలకు నేరుగా డిజిటల్ ప్రిస్క్రిప్షన్ పంపడం',
        'అత్యవసర వైద్య సహాయం',
      ],
      readingTime: '35s',
    },
    retail: {
      simplified: 'మీకు ఉత్తమ డిస్కౌంట్ ఆఫర్లను చూపించడానికి షాప్‌స్మార్ట్ మీ కొనుగోళ్లను పరిశీలిస్తుంది.',
      keyPoints: [
        'మీ ఇష్టాలకు తగిన ప్రత్యేక డిస్కౌంట్ అలర్ట్‌లు',
        '90 రోజుల కొనుగోలు చరిత్ర నమోదు',
        'దగ్గరలోని షాప్‌ల ప్రత్యేక ఆఫర్‌లు',
      ],
      readingTime: '30s',
    },
    kyc: {
      simplified: 'మోసాలను అరికట్టడానికి మీ ప్రభుత్వ గుర్తింపు కార్డును సరిచూస్తాము.',
      keyPoints: [
        'సురక్షితమైన ఒకే సారి గుర్తింపు తనిఖీ',
        'ఆన్‌లైన్ మోసాల నుండి రక్షణ',
        'మీ సమాచారం ఇతరులకు విక్రయించబడదు',
      ],
      readingTime: '30s',
    },
    generic: {
      simplified: 'DPDP చట్టం 2023 ప్రకారం మీకు సేవలు అందించడానికి అవసరమైన డేటా మాత్రమే సేకరించబడుతుంది.',
      keyPoints: [
        'సేవలకు మాత్రమే డేటా వినియోగం',
        'ఎప్పుడైనా సమ్మతిని ఉపసంహరించుకునే హక్కు',
        'సురక్షితమైన డిజిటల్ రికార్డులు',
      ],
      readingTime: '25s',
    },
  },
};

/**
 * Returns static pre-written fallback template based on matching keywords in legalText and target language.
 */
export function getFallbackSimplification(
  legalText: string,
  lang: string
): SimplifiedNoticeResult {
  const languageKey = (SUPPORTED_LANGUAGES[lang as SupportedLanguage] ? lang : 'en') as SupportedLanguage;
  const langTemplates = FALLBACK_TEMPLATES[languageKey];

  const textLower = legalText.toLowerCase();

  if (textLower.includes('health') || textLower.includes('medical') || textLower.includes('consult')) {
    return langTemplates.healthcare;
  }
  if (textLower.includes('retail') || textLower.includes('shop') || textLower.includes('discount')) {
    return langTemplates.retail;
  }
  if (textLower.includes('kyc') || textLower.includes('identity') || textLower.includes('fraud')) {
    return langTemplates.kyc;
  }

  return langTemplates.generic;
}
