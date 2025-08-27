// Export des fichiers de traduction français
export { default as frCommon } from './fr/common.json';
export { default as frNavigation } from './fr/navigation.json';
export { default as frAuth } from './fr/auth.json';
export { default as frAnalysis } from './fr/analysis.json';
export { default as frDashboard } from './fr/dashboard.json';
export { default as frNewAnalysis } from './fr/newAnalysis.json';
export { default as frBatchUpload } from './fr/batchUpload.json';
export { default as frPatientHistory } from './fr/patientHistory.json';
export { default as frAnalytics } from './fr/analytics.json';
export { default as frSettings } from './fr/settings.json';
export { default as frPagination } from './fr/pagination.json';
export { default as frErrors } from './fr/errors.json';
export { default as frValidation } from './fr/validation.json';

// Export des fichiers de traduction arabes
export { default as arCommon } from './ar/common.json';
export { default as arNavigation } from './ar/navigation.json';
export { default as arAuth } from './ar/auth.json';
export { default as arAnalysis } from './ar/analysis.json';
export { default as arDashboard } from './ar/dashboard.json';
export { default as arNewAnalysis } from './ar/newAnalysis.json';
export { default as arBatchUpload } from './ar/batchUpload.json';
export { default as arPatientHistory } from './ar/patientHistory.json';
export { default as arAnalytics } from './ar/analytics.json';
export { default as arSettings } from './ar/settings.json';
export { default as arPagination } from './ar/pagination.json';
export { default as arErrors } from './ar/errors.json';
export { default as arValidation } from './ar/validation.json';

// Configuration des ressources pour i18next
export const resources = {
  fr: {
    common: require('./fr/common.json'),
    navigation: require('./fr/navigation.json'),
    auth: require('./fr/auth.json'),
    analysis: require('./fr/analysis.json'),
    dashboard: require('./fr/dashboard.json'),
    newAnalysis: require('./fr/newAnalysis.json'),
    batchUpload: require('./fr/batchUpload.json'),
    patientHistory: require('./fr/patientHistory.json'),
    analytics: require('./fr/analytics.json'),
    settings: require('./fr/settings.json'),
    pagination: require('./fr/pagination.json'),
    errors: require('./fr/errors.json'),
    validation: require('./fr/validation.json')
  },
  ar: {
    common: require('./ar/common.json'),
    navigation: require('./ar/navigation.json'),
    auth: require('./ar/auth.json'),
    analysis: require('./ar/analysis.json'),
    dashboard: require('./ar/dashboard.json'),
    newAnalysis: require('./ar/newAnalysis.json'),
    batchUpload: require('./ar/batchUpload.json'),
    patientHistory: require('./ar/patientHistory.json'),
    analytics: require('./ar/analytics.json'),
    settings: require('./ar/settings.json'),
    pagination: require('./ar/pagination.json'),
    errors: require('./ar/errors.json'),
    validation: require('./ar/validation.json')
  }
};

// Langues supportées
export const supportedLanguages = ['fr', 'ar'];

// Configuration des langues avec métadonnées
export const languageConfig = {
  fr: {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    dir: 'ltr'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl'
  }
};
