import React, { createContext, useContext, useReducer } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

// État initial
const initialState = {
  analyses: [],
  currentAnalysis: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    status: '',
    analysisType: '',
    patientName: '',
    patientPhone: '',
    dateFrom: '',
    dateTo: '',
  },
  isLoading: false,
  stats: null,
};

// Types d'actions
const ANALYSIS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ANALYSES: 'SET_ANALYSES',
  ADD_ANALYSIS: 'ADD_ANALYSIS',
  UPDATE_ANALYSIS: 'UPDATE_ANALYSIS',
  DELETE_ANALYSIS: 'DELETE_ANALYSIS',
  SET_CURRENT_ANALYSIS: 'SET_CURRENT_ANALYSIS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_STATS: 'SET_STATS',
  CLEAR_ANALYSES: 'CLEAR_ANALYSES',
};

// Reducer
const analysisReducer = (state, action) => {
  switch (action.type) {
    case ANALYSIS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ANALYSIS_ACTIONS.SET_ANALYSES:
      return {
        ...state,
        analyses: action.payload,
        isLoading: false,
      };
    case ANALYSIS_ACTIONS.ADD_ANALYSIS:
      return {
        ...state,
        analyses: [action.payload, ...state.analyses],
      };
    case ANALYSIS_ACTIONS.UPDATE_ANALYSIS:
      return {
        ...state,
        analyses: state.analyses.map(analysis =>
          analysis._id === action.payload._id ? action.payload : analysis
        ),
        currentAnalysis:
          state.currentAnalysis?._id === action.payload._id
            ? action.payload
            : state.currentAnalysis,
      };
    case ANALYSIS_ACTIONS.DELETE_ANALYSIS:
      return {
        ...state,
        analyses: state.analyses.filter(analysis => analysis._id !== action.payload),
        currentAnalysis:
          state.currentAnalysis?._id === action.payload ? null : state.currentAnalysis,
      };
    case ANALYSIS_ACTIONS.SET_CURRENT_ANALYSIS:
      return {
        ...state,
        currentAnalysis: action.payload,
      };
    case ANALYSIS_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case ANALYSIS_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case ANALYSIS_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload,
      };
    case ANALYSIS_ACTIONS.CLEAR_ANALYSES:
      return {
        ...state,
        analyses: [],
        currentAnalysis: null,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    default:
      return state;
  }
};

// Contexte
const AnalysisContext = createContext();

// Hook personnalisé
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis doit être utilisé dans un AnalysisProvider');
  }
  return context;
};

// Provider
export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  // Récupérer les analyses avec filtres et pagination
  const fetchAnalyses = async (page = 1, customFilters = {}, limit = null) => {
    try {
      dispatch({ type: ANALYSIS_ACTIONS.SET_LOADING, payload: true });

      const filters = { ...state.filters, ...customFilters };
      const pageSize = limit || state.pagination.limit;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value !== '')
        ),
      });

      const response = await api.get(`/analysis?${params}`);

      if (response.data.success) {
        dispatch({
          type: ANALYSIS_ACTIONS.SET_ANALYSES,
          payload: response.data.data.analyses,
        });
        dispatch({
          type: ANALYSIS_ACTIONS.SET_PAGINATION,
          payload: response.data.data.pagination,
        });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur récupération analyses:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des analyses');
      dispatch({ type: ANALYSIS_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Créer une nouvelle analyse
  const createAnalysis = async (analysisData, file) => {
    try {
      dispatch({ type: ANALYSIS_ACTIONS.SET_LOADING, payload: true });

      const formData = new FormData();
      formData.append('pdfFile', file);
      
      // Ajouter les données de l'analyse
      Object.keys(analysisData).forEach(key => {
        if (analysisData[key]) {
          formData.append(key, analysisData[key]);
        }
      });

      const response = await api.post('/analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        dispatch({
          type: ANALYSIS_ACTIONS.ADD_ANALYSIS,
          payload: response.data.data.analysis,
        });
        toast.success('Analyse créée avec succès');
        return { success: true, data: response.data.data.analysis };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur création analyse:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la création de l\'analyse';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: ANALYSIS_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Envoyer une analyse via WhatsApp
  const sendAnalysis = async (analysisId) => {
    try {
      const response = await api.post(`/analysis/${analysisId}/send`);

      if (response.data.success) {
        dispatch({
          type: ANALYSIS_ACTIONS.UPDATE_ANALYSIS,
          payload: response.data.data.analysis,
        });
        toast.success('Analyse envoyée avec succès via WhatsApp');
        return { success: true };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur envoi analyse:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'envoi de l\'analyse';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Récupérer une analyse spécifique
  const fetchAnalysis = async (analysisId) => {
    try {
      dispatch({ type: ANALYSIS_ACTIONS.SET_LOADING, payload: true });

      const response = await api.get(`/analysis/${analysisId}`);

      if (response.data.success) {
        dispatch({
          type: ANALYSIS_ACTIONS.SET_CURRENT_ANALYSIS,
          payload: response.data.data.analysis,
        });
        return { success: true, data: response.data.data.analysis };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur récupération analyse:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération de l\'analyse');
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ANALYSIS_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Supprimer une analyse
  const deleteAnalysis = async (analysisId) => {
    try {
      const response = await api.delete(`/analysis/${analysisId}`);

      if (response.data.success) {
        dispatch({
          type: ANALYSIS_ACTIONS.DELETE_ANALYSIS,
          payload: analysisId,
        });
        toast.success('Analyse supprimée avec succès');
        return { success: true };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur suppression analyse:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression de l\'analyse');
      return { success: false, error: error.message };
    }
  };

  // Télécharger le PDF d'une analyse
  const downloadPDF = async (analysisId, filename) => {
    try {
      const response = await api.get(`/analysis/${analysisId}/download`, {
        responseType: 'blob',
      });

      // Créer un lien temporaire pour télécharger le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Téléchargement commencé');
      return { success: true };
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF');
      return { success: false, error: error.message };
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await api.get('/analysis/stats');

      if (response.data.success) {
        dispatch({
          type: ANALYSIS_ACTIONS.SET_STATS,
          payload: response.data.data,
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des statistiques');
      return { success: false, error: error.message };
    }
  };

  // Renvoyer une analyse qui a échoué
  const retryAnalysis = async (analysisId) => {
    try {
      const response = await api.post(`/whatsapp/retry/${analysisId}`);

      if (response.data.success) {
        // Recharger les analyses pour avoir les données à jour
        fetchAnalyses(state.pagination.page);
        toast.success('Analyse renvoyée avec succès');
        return { success: true };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Erreur renvoi analyse:', error);
      toast.error(error.response?.data?.error || 'Erreur lors du renvoi de l\'analyse');
      return { success: false, error: error.message };
    }
  };

  // Mettre à jour les filtres
  const updateFilters = (newFilters) => {
    dispatch({
      type: ANALYSIS_ACTIONS.SET_FILTERS,
      payload: newFilters,
    });
  };

  // Réinitialiser les filtres
  const clearFilters = () => {
    dispatch({
      type: ANALYSIS_ACTIONS.SET_FILTERS,
      payload: {
        status: '',
        analysisType: '',
        patientName: '',
        patientPhone: '',
        dateFrom: '',
        dateTo: '',
      },
    });
  };

  // Mettre à jour la pagination
  const updatePagination = (paginationData) => {
    dispatch({
      type: ANALYSIS_ACTIONS.SET_PAGINATION,
      payload: paginationData,
    });
  };

  const value = {
    ...state,
    fetchAnalyses,
    createAnalysis,
    sendAnalysis,
    fetchAnalysis,
    deleteAnalysis,
    downloadPDF,
    retryAnalysis,
    fetchStats,
    updateFilters,
    clearFilters,
    updatePagination,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};