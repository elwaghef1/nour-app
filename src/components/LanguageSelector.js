import React, { useState } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ variant = 'default' }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title={t('settings.language')}
        >
          <Languages className="h-5 w-5" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
              <div className="py-1">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      currentLanguage === language.code
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{language.nativeName}</span>
                      {currentLanguage === language.code && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <div className="flex items-center">
          <Languages className="h-4 w-4 mr-2" />
          <span>{currentLang?.nativeName}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    currentLanguage === language.code
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Languages className="h-4 w-4 mr-2" />
                      <span>{language.nativeName}</span>
                    </div>
                    {currentLanguage === language.code && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;