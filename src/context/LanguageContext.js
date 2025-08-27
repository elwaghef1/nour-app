import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');

  useEffect(() => {
    const handleLanguageChange = (language) => {
      setCurrentLanguage(language);
      setIsRTL(language === 'ar');
      
      // Mettre à jour la direction du document
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Stocker dans localStorage
      localStorage.setItem('i18nextLng', language);
    };

    // Écouter les changements de langue
    i18n.on('languageChanged', handleLanguageChange);

    // Initialiser au démarrage
    handleLanguageChange(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const value = {
    currentLanguage,
    isRTL,
    changeLanguage,
    availableLanguages: [
      { code: 'fr', name: 'Français', nativeName: 'Français' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};