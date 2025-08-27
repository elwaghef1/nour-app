import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import frCommon from './locales/fr/common.json';
import arCommon from './locales/ar/common.json';
import frAuth from './locales/fr/auth.json';
import arAuth from './locales/ar/auth.json';
import frAnalysis from './locales/fr/analysis.json';
import arAnalysis from './locales/ar/analysis.json';
import frDashboard from './locales/fr/dashboard.json';
import arDashboard from './locales/ar/dashboard.json';
import frNavigation from './locales/fr/navigation.json';
import arNavigation from './locales/ar/navigation.json';
import frPagination from './locales/fr/pagination.json';
import arPagination from './locales/ar/pagination.json';
import frErrors from './locales/fr/errors.json';
import arErrors from './locales/ar/errors.json';
import frValidation from './locales/fr/validation.json';
import arValidation from './locales/ar/validation.json';
import frAnalytics from './locales/fr/analytics.json';
import arAnalytics from './locales/ar/analytics.json';
import frSettings from './locales/fr/settings.json';
import arSettings from './locales/ar/settings.json';
import frNewAnalysis from './locales/fr/newAnalysis.json';
import arNewAnalysis from './locales/ar/newAnalysis.json';
import frPatientHistory from './locales/fr/patientHistory.json';
import arPatientHistory from './locales/ar/patientHistory.json';
import frBatchUpload from './locales/fr/batchUpload.json';
import arBatchUpload from './locales/ar/batchUpload.json';

const resources = {
  fr: {
    translation: frCommon,
    common: frCommon,
    auth: frAuth,
    analysis: frAnalysis,
    dashboard: frDashboard,
    navigation: frNavigation,
    pagination: frPagination,
    errors: frErrors,
    validation: frValidation,
    analytics: frAnalytics,
    settings: frSettings,
    newAnalysis: frNewAnalysis,
    patientHistory: frPatientHistory,
    batchUpload: frBatchUpload
  },
  ar: {
    translation: arCommon,
    common: arCommon,
    auth: arAuth,
    analysis: arAnalysis,
    dashboard: arDashboard,
    navigation: arNavigation,
    pagination: arPagination,
    errors: arErrors,
    validation: arValidation,
    analytics: arAnalytics,
    settings: arSettings,
    newAnalysis: arNewAnalysis,
    patientHistory: arPatientHistory,
    batchUpload: arBatchUpload
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    
    // Langue par défaut
    fallbackLng: 'fr',
    
    // Langues supportées
    supportedLngs: ['fr', 'ar'],
    
    // Namespace par défaut
    defaultNS: 'translation',
    
    // Configuration du détecteur de langue
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    interpolation: {
      escapeValue: false // React fait déjà l'échappement
    },
    
    react: {
      useSuspense: false
    }
  });

// Fonction pour changer la direction du document et appliquer la police
const updateDocumentDirection = (language) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  
  // Appliquer la police Cairo à tout le body pour l'arabe
  if (language === 'ar') {
    document.body.style.fontFamily = "'Cairo', 'Inter', sans-serif";
    document.body.classList.add('font-cairo');
  } else {
    document.body.style.fontFamily = "'Inter', sans-serif";
    document.body.classList.remove('font-cairo');
  }
};

// Écouter les changements de langue
i18n.on('languageChanged', (language) => {
  updateDocumentDirection(language);
});

// Initialiser la direction au démarrage
updateDocumentDirection(i18n.language);

export default i18n;