// Utilitaire pour traductions en lot - à utiliser pendant le développement
const translations = {
  // Analyses récentes section
  'Analyses récentes': 'tDashboard("recentAnalyses")',
  'Voir tout': 'tDashboard("viewAll")',
  'Voir plus': 'tDashboard("viewMore")',
  'Voir résumé': 'tDashboard("viewSummary")',
  
  // Messages communs
  'Chargement...': 'tCommon("loading")',
  'Chargement des analyses...': 'tCommon("loading")',
  'Aucune analyse': 'tDashboard("noAnalyses")',
  'Commencez par créer votre première analyse.': 'tDashboard("noAnalysesDescription")',
  
  // Status
  'En attente': 'getAnalysisStatus("pending")',
  'Envoyé': 'getAnalysisStatus("sent")',
  'Livré': 'getAnalysisStatus("delivered")',
  'Lu': 'getAnalysisStatus("read")',
  'Échec': 'getAnalysisStatus("failed")',
  
  // Boutons d'action
  'Télécharger le PDF': 'tAnalysis("actions.download")',
  'Envoyer via WhatsApp': 'tAnalysis("actions.send")',
  'Renvoyer': 'tAnalysis("actions.retry")',
  'Supprimer': 'tCommon("delete")',
  
  // Confirmations
  'Êtes-vous sûr de vouloir envoyer cette analyse via WhatsApp ?': 'tAnalysis("confirmations.send")',
  'Êtes-vous sûr de vouloir renvoyer cette analyse ?': 'tAnalysis("confirmations.retry")',
  'Êtes-vous sûr de vouloir supprimer cette analyse ? Cette action est irréversible.': 'tAnalysis("confirmations.delete")',
  
  // Pagination
  'Affichage de': 'tPagination("showing")',
  'à': 'tPagination("to")',
  'sur': 'tPagination("of")',
  'résultats': 'tPagination("results")',
  'Page': 'tPagination("page")',
  'Précédent': 'tPagination("previous")',
  'Suivant': 'tPagination("next")',
  'par page': 'tPagination("itemsPerPage")',
  
  // Filtres
  'Filtres': 'tCommon("filters")',
  'Rechercher par nom de patient...': 'tAnalysis("placeholders.searchPatient")',
  'Tous les statuts': 'tAnalysis("filters.allStatuses")',
  'Tous les types': 'tAnalysis("filters.allTypes")',
  'Date de début': 'tAnalysis("filters.dateFrom")',
  'Date de fin': 'tAnalysis("filters.dateTo")',
  'Effacer les filtres': 'tAnalysis("filters.clearFilters")',
};

// Fonction pour remplacer automatiquement les textes
export const replaceTextWithTranslation = (text) => {
  return translations[text] || text;
};

export default translations;