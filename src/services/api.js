import axios from 'axios';
import { toast } from 'react-toastify';

// Configuration de base d'axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3010/api',
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs réseau
    if (!error.response) {
      toast.error('Erreur de connexion au serveur');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Token expiré ou invalide
        if (data.error && (data.error.includes('Token') || data.error.includes('token'))) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expirée, veuillez vous reconnecter');
        }
        break;
      
      case 403:
        toast.error('Accès refusé');
        break;
      
      case 404:
        // Ne pas afficher de toast pour les 404, laisser les composants gérer
        break;
      
      case 429:
        toast.error('Trop de requêtes, veuillez patienter');
        break;
      
      case 500:
        toast.error('Erreur interne du serveur');
        break;
      
      default:
        // Pour les autres erreurs, afficher le message du serveur s'il existe
        if (data.error && status >= 400 && status < 500) {
          // Les erreurs 4xx sont souvent dues à des données invalides
          // Laisser les composants gérer ces erreurs
        } else {
          toast.error('Une erreur est survenue');
        }
        break;
    }

    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les requêtes communes

// Authentification
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Analyses
export const analysisAPI = {
  getAll: (params = {}) => api.get('/analysis', { params }),
  getOne: (id) => api.get(`/analysis/${id}`),
  create: (formData) => api.post('/analysis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  send: (id) => api.post(`/analysis/${id}/send`),
  delete: (id) => api.delete(`/analysis/${id}`),
  download: (id) => api.get(`/analysis/${id}/download`, { responseType: 'blob' }),
  getStats: () => api.get('/analysis/stats'),
};

// WhatsApp
export const whatsappAPI = {
  test: () => api.get('/whatsapp/test'),
  sendTestMessage: (data) => api.post('/whatsapp/test-message', data),
  getMessageStatus: (messageId) => api.get(`/whatsapp/message/${messageId}/status`),
  retry: (analysisId) => api.post(`/whatsapp/retry/${analysisId}`),
};

// Fonction pour vérifier la santé de l'API
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    return null;
  }
};

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    const startTime = Date.now();
    await api.get('/health');
    const responseTime = Date.now() - startTime;
    return { success: true, responseTime };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default api;