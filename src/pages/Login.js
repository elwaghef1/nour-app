import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye as EyeIcon, EyeOff as EyeOffIcon, User as UserIcon, Lock as LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Rediriger vers la page demandée ou le dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      window.location.href = from;
    }
  }, [isAuthenticated, authLoading, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        const from = location.state?.from?.pathname || '/dashboard';
        window.location.href = from;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher le spinner si en cours de vérification d'auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  // Rediriger si déjà authentifié
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('app.name')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.loginRequired')}
          </p>
          
          {/* Sélecteur de langue */}
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Champ login */}
            <div>
              <label htmlFor="login" className="form-label">
                {t('auth.username')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  className={`form-input ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={t('auth.username')}
                  value={formData.login}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`form-input ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bouton de connexion */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.login || !formData.password}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </div>

          {/* Informations supplémentaires */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Version 1.0 - {t('app.name')}
            </p>
          </div>
        </form>

        {/* Compte de démonstration (à supprimer en production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Comptes de démonstration
            </h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Admin:</strong> admin / password123</p>
              <p><strong>Agent:</strong> agent / password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;