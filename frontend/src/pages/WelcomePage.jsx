import React, { useState } from 'react';
import { 
  UserPlus, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Volume2,
  Globe
} from 'lucide-react';

const LANGUAGES = [
  {
    id: 'en',
    name: 'English',
    native: 'English',
    greeting: 'Welcome'
  },
  {
    id: 'hi',
    name: 'Hindi',
    native: 'हिन्दी (Hindi)',
    greeting: 'नमस्ते'
  },
  {
    id: 'mr',
    name: 'Marathi',
    native: 'मराठी (Marathi)',
    greeting: 'नमस्कार'
  },
  {
    id: 'kn',
    name: 'Kannada',
    native: 'ಕನ್ನಡ (Kannada)',
    greeting: 'ನಮಸ್ಕಾರ'
  },
  {
    id: 'ta',
    name: 'Tamil',
    native: 'தமிழ் (Tamil)',
    greeting: 'வணக்கம்'
  },
  {
    id: 'te',
    name: 'Telugu',
    native: 'తెలుగు (Telugu)',
    greeting: 'నమస్కారం'
  }
];

const UI_TEXT = {
  en: {
    step1Title: 'Language',
    step2Title: 'Profile',
    langHeading: 'Choose Your Preferred Language',
    langSub: 'Select the language you feel most comfortable reading. Next step will be shown in your chosen language.',
    langNextBtn: 'Next: Choose Profile',
    listenBtn: 'Listen to instructions',
    profileHeading: 'Welcome! How would you like to continue?',
    profileSub: 'Choose one option below to get started. No passwords or complicated setup required.',
    createTitle: 'Create Profile',
    createBadge: 'Recommended',
    createDesc: 'Create your profile to save your information and preferences.',
    nameLabel: 'Your Name or Nickname',
    nameOptional: '(Optional)',
    namePlaceholder: 'e.g. Rahul Sharma',
    guestTitle: 'Continue as Guest',
    guestBadge: 'Instant Access',
    guestDesc: 'Continue without creating a profile.',
    guestNote: '✓ No details requested • Quick & private',
    backBtn: 'Back to Language',
    homeBtn: 'Continue to Home Page',
    trustNote: '🔒 100% Free & Private • No passwords or phone numbers required • Verified by सतर्क SIGHT'
  },
  hi: {
    step1Title: 'भाषा',
    step2Title: 'प्रोफाइल',
    langHeading: 'अपनी पसंदीदा भाषा चुनें',
    langSub: 'वह भाषा चुनें जिसमें आप सबसे सहज महसूस करते हैं। अगला चरण आपकी चुनी हुई भाषा में दिखाया जाएगा।',
    langNextBtn: 'आगे बढ़ें: प्रोफाइल चुनें',
    listenBtn: 'निर्देश सुनें',
    profileHeading: 'नमस्ते! आप कैसे आगे बढ़ना चाहेंगे?',
    profileSub: 'शुरू करने के लिए नीचे दिए गए विकल्पों में से एक चुनें। पासवर्ड की कोई आवश्यकता नहीं है।',
    createTitle: 'प्रोफाइल बनाएं',
    createBadge: 'अनुशंसित',
    createDesc: 'अपनी जानकारी और प्राथमिकताओं को सुरक्षित रखने के लिए अपनी प्रोफाइल बनाएं।',
    nameLabel: 'आपका नाम या उपनाम',
    nameOptional: '(वैकल्पिक)',
    namePlaceholder: 'उदा. राहुल शर्मा',
    guestTitle: 'अतिथि के रूप में जारी रखें',
    guestBadge: 'त्वरित पहुंच',
    guestDesc: 'बिना प्रोफाइल बनाए सीधे जारी रखें।',
    guestNote: '✓ कोई विवरण नहीं मांगा जाएगा • त्वरित और सुरक्षित',
    backBtn: 'भाषा पर वापस जाएं',
    homeBtn: 'होम पेज पर जाएं',
    trustNote: '🔒 100% मुफ़्त और सुरक्षित • पासवर्ड या व्यक्तिगत जानकारी की आवश्यकता नहीं • सतर्क SIGHT द्वारा सत्यापित'
  },
  mr: {
    step1Title: 'भाषा',
    step2Title: 'प्रोफाइल',
    langHeading: 'आपली पसंतीची भाषा निवडा',
    langSub: 'तुम्हाला वाचायला सोपी वाटणारी भाषा निवडा. पुढील पायरी तुमच्या निवडलेल्या भाषेत दाखवली जाईल.',
    langNextBtn: 'पुढे जा: प्रोफाइल निवडा',
    listenBtn: 'सूचना ऐका',
    profileHeading: 'नमस्कार! आपण कसे पुढे जाऊ इच्छिता?',
    profileSub: 'सुरू करण्यासाठी खालीलपैकी एक पर्याय निवडा. पासवर्डची आवश्यकता नाही.',
    createTitle: 'प्रोफाइल तयार करा',
    createBadge: 'शिफारस केलेले',
    createDesc: 'आपली माहिती आणि प्राधान्ये जतन करण्यासाठी आपली प्रोफाइल तयार करा.',
    nameLabel: 'आपले नाव',
    nameOptional: '(पर्यायी)',
    namePlaceholder: 'उदा. राहुल',
    guestTitle: 'पाहुणे म्हणून सुरू ठेवा',
    guestBadge: 'त्वरित प्रवेश',
    guestDesc: 'प्रोफाइल तयार न करता थेट सुरू ठेवा.',
    guestNote: '✓ कोणतीही माहिती देण्याची गरज नाही • जलद आणि सुरक्षित',
    backBtn: 'भाषेकडे परत जा',
    homeBtn: 'मुख्य पानावर जा',
    trustNote: '🔒 100% मोफत आणि खाजगी • पासवर्डची आवश्यकता नाही • सतर्क SIGHT द्वारे सत्यापित'
  },
  kn: {
    step1Title: 'ಭಾಷೆ',
    step2Title: 'ಪ್ರೊಫೈಲ್',
    langHeading: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    langSub: 'ನೀವು ಸುಲಭವಾಗಿ ಓದಲು ಬಯಸುವ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಮುಂದಿನ ಹಂತವು ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯಲ್ಲಿ ಗೋಚರಿಸುತ್ತದೆ.',
    langNextBtn: 'ಮುಂದೆ: ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ',
    listenBtn: 'ಸೂಚನೆಗಳನ್ನು ಆಲಿಸಿ',
    profileHeading: 'ನಮಸ್ಕಾರ! ನೀವು ಹೇಗೆ ಮುಂದುವರಿಯಲು ಬಯಸುತ್ತೀರಿ?',
    profileSub: 'ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ ಒಂದು ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ. ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ.',
    createTitle: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಿ',
    createBadge: 'ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
    createDesc: 'ನಿಮ್ಮ ಮಾಹಿತಿ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಲು ಪ್ರೊಫೈಲ್ ರಚಿಸಿ.',
    nameLabel: 'ನಿಮ್ಮ ಹೆಸರು',
    nameOptional: '(ಐಚ್ಛಿಕ)',
    namePlaceholder: 'ಉದಾ. ರಾಹುಲ್',
    guestTitle: 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ',
    guestBadge: 'ತ್ವರಿತ ಪ್ರವೇಶ',
    guestDesc: 'ಪ್ರೊಫೈಲ್ ರಚಿಸದೆ ಮುಂದುವರಿಯಿರಿ.',
    guestNote: '✓ ಯಾವುದೇ ವಿವರಗಳ ಅಗತ್ಯವಿಲ್ಲ • ವೇಗ ಮತ್ತು ಸುರಕ್ಷಿತ',
    backBtn: 'ಭಾಷೆಗೆ ಹಿಂತಿರುಗಿ',
    homeBtn: 'ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ',
    trustNote: '🔒 100% ಉಚಿತ ಮತ್ತು ಸುರಕ್ಷಿತ • ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ • सतर्क SIGHT ನಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ'
  },
  ta: {
    step1Title: 'மொழி',
    step2Title: 'சுயவிவரம்',
    langHeading: 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்',
    langSub: 'நீங்கள் எளிதாகப் படிக்கக்கூடிய மொழியைத் தேர்வுசெய்யவும். அடுத்த படி உங்கள் விருப்ப மொழியில் காண்பிக்கப்படும்.',
    langNextBtn: 'அடுத்து: சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்',
    listenBtn: 'வழிமுறைகளைக் கேளுங்கள்',
    profileHeading: 'வணக்கம்! நீங்கள் எவ்வாறு தொடர விரும்புகிறீர்கள்?',
    profileSub: 'தொடங்க கீழே உள்ள ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும். கடவுச்சொல் தேவையில்லை.',
    createTitle: 'சுயவிவரத்தை உருவாக்கவும்',
    createBadge: 'பரிந்துரைக்கப்படுகிறது',
    createDesc: 'உங்கள் தகவல் மற்றும் விருப்பங்களைச் சேமிக்க சுயவிவரத்தை உருவாக்கவும்.',
    nameLabel: 'உங்கள் பெயர்',
    nameOptional: '(விருப்பமானது)',
    namePlaceholder: 'எ.கா. ராகுல்',
    guestTitle: 'விருந்தினராக தொடரவும்',
    guestBadge: 'உடனடி அணுகல்',
    guestDesc: 'சுயவிவரம் உருவாக்காமல் தொடரவும்.',
    guestNote: '✓ விவரங்கள் தேவையில்லை • விரைவான மற்றும் பாதுகாப்பானது',
    backBtn: 'மொழிக்குத் திரும்பு',
    homeBtn: 'முகப்பு பக்கத்திற்கு தொடரவும்',
    trustNote: '🔒 100% இலவசம் மற்றும் பாதுகாப்பானது • கடவுச்சொல் தேவையில்லை • सतर्क SIGHT ஆல் சரிபார்க்கப்பட்டது'
  },
  te: {
    step1Title: 'భాష',
    step2Title: 'ప్రొఫైల్',
    langHeading: 'మీ ప్రాధాన్యత భాషను ఎంచుకోండి',
    langSub: 'మీరు సులభంగా చదవగలిగే భాషను ఎంచుకోండి. తదుపరి దశ మీరు ఎంచుకున్న భాషలో చూపబడుతుంది.',
    langNextBtn: 'తర్వాత: ప్రొఫైల్ ఎంచుకోండి',
    listenBtn: 'సూచనలు వినండి',
    profileHeading: 'నమస్కారం! మీరు ఎలా కొనసాగాలనుకుంటున్నారు?',
    profileSub: 'ప్రారంభించడానికి దిగువ ఎంపికలలో ఒకదాన్ని ఎంచుకోండి. పాస్‌వర్డ్ అవసరం లేదు.',
    createTitle: 'ప్రొఫైల్ సృష్టించండి',
    createBadge: 'సిఫార్సు చేయబడింది',
    createDesc: 'మీ సమాచారం మరియు ప్రాధాన్యతలను సేవ్ చేయడానికి ప్రొఫైల్ సృష్టించండి.',
    nameLabel: 'మీ పేరు',
    nameOptional: '(ఐచ్ఛికం)',
    namePlaceholder: 'ఉదా. రాహుల్',
    guestTitle: 'అతిథిగా కొనసాగండి',
    guestBadge: 'తక్షణ ప్రవేశం',
    guestDesc: 'ప్రొఫైల్ సృష్టించకుండా కొనసాగండి.',
    guestNote: '✓ వివరాలు అవసరం లేదు • వేగవంతమైనది మరియు సురక్షితమైనది',
    backBtn: 'భాషకు తిరిగి వెళ్లండి',
    homeBtn: 'హోమ్ పేజీకి కొనసాగండి',
    trustNote: '🔒 100% ఉచితం మరియు సురక్షితమైనది • పాస్‌వర్డ్ అవసరం లేదు • सतर्क SIGHT ద్వారా ధృవీకరించబడింది'
  }
};

export default function WelcomePage({ onComplete, initialProfileMode = 'profile', initialLanguage = 'en' }) {
  // Step 1: 'language', Step 2: 'profile'
  const [currentStep, setCurrentStep] = useState(1);
  
  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);

  // Profile selection state: 'profile' | 'guest'
  const [profileMode, setProfileMode] = useState(initialProfileMode);
  const [userName, setUserName] = useState('');

  const t = UI_TEXT[selectedLanguage] || UI_TEXT.en;
  const currentLangObj = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

  // Audio instruction readout assistance
  const speakInstruction = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      // If Hindi or others, let browser voice handle if matching voice exists
      if (selectedLanguage === 'hi') utterance.lang = 'hi-IN';
      else if (selectedLanguage === 'mr') utterance.lang = 'mr-IN';
      else if (selectedLanguage === 'ta') utterance.lang = 'ta-IN';
      else if (selectedLanguage === 'te') utterance.lang = 'te-IN';
      else if (selectedLanguage === 'kn') utterance.lang = 'kn-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProceedToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    const sessionData = {
      mode: profileMode,
      name: profileMode === 'profile' ? (userName.trim() || 'Investor') : 'Guest',
      language: selectedLanguage,
      languageName: currentLangObj.native,
      actionText: t.homeBtn,
      completedAt: new Date().toISOString()
    };
    
    // Save to local storage for persistence
    try {
      localStorage.setItem('trustlens_user_session', JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }

    if (onComplete) {
      onComplete(sessionData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Branding & Accessibility Row */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-2.5">
          <img 
            src="/satark-sight-logo.png" 
            alt="सतर्क SIGHT" 
            className="h-11 w-auto object-contain"
          />
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F2F0FA] text-[#4635B1] border border-[#C8C1E8] self-center">
            AI
          </span>
        </div>

        {/* Read aloud assistance button */}
        <button
          onClick={() => {
            const promptText = currentStep === 1 
              ? `${t.langHeading}. ${t.langSub}`
              : `${t.profileHeading}. ${t.profileSub}`;
            speakInstruction(promptText);
          }}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-300 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          title="Read instructions aloud"
          aria-label="Read instructions aloud"
        >
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">{t.listenBtn}</span>
          <span className="sm:hidden">Listen</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Progress Indicator: 1. Language -> 2. Profile */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1 Pill: Language */}
            <div className="flex items-center gap-2.5">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white shadow-xs ring-4 ring-blue-100'
                    : 'bg-emerald-100 text-emerald-700 font-semibold'
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '1'}
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Step 1</p>
                <p className={`text-sm font-semibold ${currentStep === 1 ? 'text-blue-900' : 'text-slate-700'}`}>
                  {t.step1Title}
                </p>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-blue-600 transition-all duration-300 ${
                  currentStep >= 2 ? 'w-full' : 'w-0'
                }`} 
              />
            </div>

            {/* Step 2 Pill: Profile */}
            <div className="flex items-center gap-2.5">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white shadow-xs ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Step 2</p>
                <p className={`text-sm font-semibold ${currentStep === 2 ? 'text-blue-900' : 'text-slate-400'}`}>
                  {t.step2Title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: Language Preference (SHOWN FIRST)                 */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm transition-all">
            {/* Center Language Header */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-3">
                <Globe className="w-3.5 h-3.5" />
                <span>Step 1 of 2</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {t.langHeading}
              </h1>
              <p className="mt-2 text-base text-slate-600 leading-relaxed">
                {t.langSub}
              </p>
            </div>

            {/* Six Large Language Cards in a Simple Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`relative flex flex-col items-center justify-center text-center p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer min-h-[125px] sm:min-h-[145px] focus:outline-hidden ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-md ring-4 ring-blue-100'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 shadow-xs'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {/* Selected Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Flag & Native Text */}
                    <span className="text-2xl sm:text-3xl mb-2" role="img" aria-label="India Flag">
                      🇮🇳
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">
                      {lang.native}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      {lang.greeting}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Next Step Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer focus:ring-4 focus:ring-blue-200"
              >
                <span>{t.langNextBtn}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: Profile Selection (ADAPTED TO CHOSEN LANGUAGE)    */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm transition-all">
            {/* Center Welcome Header in Selected Language */}
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.step2Title} • 🇮🇳 {currentLangObj.native}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {t.profileHeading}
              </h1>
              <p className="mt-2 text-base text-slate-600 leading-relaxed">
                {t.profileSub}
              </p>
            </div>

            {/* Two Large Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8">
              {/* Option 1: Create Profile */}
              <button
                type="button"
                onClick={() => setProfileMode('profile')}
                className={`relative flex flex-col text-left p-6 sm:p-7 rounded-2xl border-2 transition-all cursor-pointer focus:outline-hidden ${
                  profileMode === 'profile'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 shadow-xs'
                }`}
                aria-pressed={profileMode === 'profile'}
              >
                {/* Visual Checkmark indicator */}
                <div className="flex items-center justify-between w-full mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    profileMode === 'profile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    <UserPlus className="w-7 h-7" />
                  </div>

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    profileMode === 'profile'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {profileMode === 'profile' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {t.createBadge}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {t.createTitle}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {t.createDesc}
                  </p>
                </div>

                {/* Optional Name Input when Create Profile is active */}
                {profileMode === 'profile' && (
                  <div className="mt-5 pt-4 border-t border-blue-200/60 w-full" onClick={(e) => e.stopPropagation()}>
                    <label htmlFor="user-name-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t.nameLabel} <span className="font-normal text-slate-500">{t.nameOptional}</span>:
                    </label>
                    <input
                      id="user-name-input"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
              </button>

              {/* Option 2: Continue as Guest */}
              <button
                type="button"
                onClick={() => setProfileMode('guest')}
                className={`relative flex flex-col text-left p-6 sm:p-7 rounded-2xl border-2 transition-all cursor-pointer focus:outline-hidden ${
                  profileMode === 'guest'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 shadow-xs'
                }`}
                aria-pressed={profileMode === 'guest'}
              >
                {/* Visual Checkmark indicator */}
                <div className="flex items-center justify-between w-full mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    profileMode === 'guest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <User className="w-7 h-7" />
                  </div>

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    profileMode === 'guest'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {profileMode === 'guest' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {t.guestBadge}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {t.guestTitle}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {t.guestDesc}
                  </p>
                </div>

                <div className="mt-auto pt-6 text-xs text-slate-500 font-medium">
                  {t.guestNote}
                </div>
              </button>
            </div>

            {/* Navigation Buttons: Back to Language and Continue */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBackToStep1}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-semibold text-base transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer focus:ring-4 focus:ring-blue-200"
              >
                <span>{t.homeBtn}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Trust & Safety Footer in Selected Language */}
      <footer className="max-w-2xl mx-auto text-center mt-8 text-xs text-slate-500 font-medium leading-relaxed">
        <p className="flex items-center justify-center gap-2">
          <span>{t.trustNote}</span>
        </p>
      </footer>
    </div>
  );
}
