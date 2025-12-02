import { useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

const STORAGE_KEY = 'tv-compare-language';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    
    // Update document direction and lang attribute
    const isRTL = ['ar'].includes(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.ar[key] || key;
  };

  const isRTL = ['ar'].includes(language);

  return { t, language, setLanguage, isRTL };
};
