import { useTranslation } from 'react-i18next';

// Hook pour les traductions avec des shortcuts fréquents
export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const { t: tBatchUploadNs } = useTranslation('batchUpload');
  const { t: tPatientHistoryNs } = useTranslation('patientHistory');
  
  return {
    t,
    i18n,
    // Raccourcis fréquents
    tCommon: (key) => t(`common.${key}`),
    tAuth: (key) => t(`auth.${key}`),
    tAnalysis: (key) => t(`analysis.${key}`),
    tDashboard: (key) => t(`dashboard.${key}`),
    tNavigation: (key) => t(`navigation.${key}`),
    tPagination: (key, options = {}) => t(`pagination.${key}`, options),
    tErrors: (key) => t(`errors.${key}`),
    tValidation: (key) => t(`validation.${key}`),
    tAnalytics: (key) => t(`analytics.${key}`),
    tSettings: (key) => t(`settings.${key}`),
    tNewAnalysis: (key) => t(`newAnalysis.${key}`),
    tPatientHistory: (key, options = {}) => tPatientHistoryNs(key, options),
    tBatchUpload: (key, options = {}) => tBatchUploadNs(key, options),
    
    // Helper pour les types d'analyses
    getAnalysisType: (type) => {
      const typeMap = {
        'Analyse sanguine': t('analysis.types.bloodAnalysis'),
        'Analyse urinaire': t('analysis.types.urineAnalysis'),
        'Biochimie': t('analysis.types.biochemistry'),
        'Hématologie': t('analysis.types.hematology'),
        'Microbiologie': t('analysis.types.microbiology'),
        'Immunologie': t('analysis.types.immunology'),
        'Hormonologie': t('analysis.types.endocrinology'),
        'Autre': t('analysis.types.other')
      };
      return typeMap[type] || type;
    },
    
    // Helper pour les statuts
    getAnalysisStatus: (status) => {
      const statusMap = {
        'pending': t('analysis.status.pending'),
        'sent': t('analysis.status.sent'),
        'delivered': t('analysis.status.delivered'),
        'read': t('analysis.status.read'),
        'failed': t('analysis.status.failed')
      };
      return statusMap[status] || status;
    },
    
    // Helper pour formater les numéros de téléphone
    formatPhoneForDisplay: (phone) => {
      if (!phone) return '';
      // Enlever les labels et l'indicatif +222 pour l'affichage
      let cleanPhone = phone
        .replace(/Téléphone[\s:]*/, '')
        .replace(/Phone[\s:]*/, '')
        .replace(/Tel[\s:]*/, '')
        .replace(/Tél[\s:]*/, '')
        .trim();
      
      // Enlever l'indicatif +222 de la Mauritanie pour l'affichage
      cleanPhone = cleanPhone.replace(/^\+222[\s-]*/, '');
      
      return cleanPhone;
    },
    
    // Helper pour ajouter l'indicatif pour WhatsApp
    formatPhoneForWhatsApp: (phone) => {
      if (!phone) return '';
      // Nettoyer le numéro
      let cleanPhone = phone
        .replace(/Téléphone[\s:]*/, '')
        .replace(/Phone[\s:]*/, '')
        .replace(/Tel[\s:]*/, '')
        .replace(/Tél[\s:]*/, '')
        .replace(/^\+222[\s-]*/, '')
        .replace(/\s/g, '')
        .trim();
      
      // Ajouter l'indicatif +222 s'il n'est pas présent
      if (cleanPhone && !cleanPhone.startsWith('+')) {
        cleanPhone = '+222' + cleanPhone;
      }
      
      return cleanPhone;
    },
    
    // Helper pour nettoyer les noms de patients
    formatPatientName: (name) => {
      if (!name) return '';
      // Enlever le mot "Téléphone" et autres labels possibles du nom
      let cleanName = name
        .replace(/Téléphone[\s:]*$/, '')
        .replace(/Phone[\s:]*$/, '')
        .replace(/Tel[\s:]*$/, '')
        .replace(/Tél[\s:]*$/, '')
        .trim();
      
      return cleanName;
    }
  };
};

export default useI18n;