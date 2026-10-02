import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../utils/translations';

export const SUPPORTED_LANGUAGES = [
  { id: 'en', name: 'English', native: 'English', flag: '🇮🇳' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { id: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
];

const LANGUAGE_MAP = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  mr: 'मराठी (Marathi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)'
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
  userSession: null,
  updateSession: () => {}
});

export function LanguageProvider({ children, initialSession = null, onSessionChange = null }) {
  const [userSession, setUserSession] = useState(initialSession);
  const [language, setLanguageState] = useState(initialSession?.language || 'en');

  // Keep state in sync with initialSession changes
  useEffect(() => {
    if (initialSession?.language) {
      setLanguageState(initialSession.language);
      setUserSession(initialSession);
    }
  }, [initialSession]);

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    const updated = {
      ...(userSession || { mode: 'guest', name: 'Guest' }),
      language: newLang,
      languageName: LANGUAGE_MAP[newLang] || newLang
    };
    setUserSession(updated);
    try {
      localStorage.setItem('trustlens_user_session', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    if (onSessionChange) {
      onSessionChange(updated);
    }
  };

  const updateSession = (newSession) => {
    setUserSession(newSession);
    if (newSession?.language) {
      setLanguageState(newSession.language);
    }
    try {
      localStorage.setItem('trustlens_user_session', JSON.stringify(newSession));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    if (onSessionChange) {
      onSessionChange(newSession);
    }
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, userSession, updateSession }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
