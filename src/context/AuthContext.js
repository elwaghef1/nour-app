import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

// État initial
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
};

// Types d'actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Contexte
const AuthContext = createContext();

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier le token au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Vérifier l'authentification
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.data.user,
            token: localStorage.getItem('token'),
          },
        });
      } else {
        throw new Error('Token invalide');
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
    }
  };

  // Connexion
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Stocker le token
        localStorage.setItem('token', token);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });
        
        toast.success(`Bienvenue ${user.fullName} !`);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Erreur de connexion');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de connexion';
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Stocker le token
        localStorage.setItem('token', token);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });
        
        toast.success(`Compte créé avec succès ! Bienvenue ${user.fullName} !`);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de l\'inscription';
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.info('Vous avez été déconnecté');
    }
  };

  // Changer le mot de passe
  const changePassword = async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      
      if (response.data.success) {
        toast.success('Mot de passe changé avec succès');
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors du changement de mot de passe';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Mettre à jour les informations utilisateur
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    changePassword,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};