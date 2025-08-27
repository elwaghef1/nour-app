import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock as LockIcon, 
  Bell as BellIcon, 
  Settings as CogIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Languages as LanguagesIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../utils/translationHelpers';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { whatsappAPI, testConnection } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import LanguageSelector from '../components/LanguageSelector';
import { toast } from 'react-toastify';

const Settings = () => {
  const { t } = useTranslation();
  const { tSettings, tCommon } = useI18n();
  const { user, changePassword } = useAuth();
  const { currentLanguage, availableLanguages } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // États pour les tests de connexion
  const [connectionTest, setConnectionTest] = useState(null);
  const [whatsappTest, setWhatsappTest] = useState(null);

  const tabs = [
    { id: 'profile', name: tSettings('profile'), icon: UserIcon },
    { id: 'language', name: tSettings('language'), icon: LanguagesIcon },
    { id: 'security', name: tSettings('security'), icon: LockIcon },
    { id: 'notifications', name: tSettings('notifications'), icon: BellIcon },
    { id: 'system', name: tSettings('system'), icon: CogIcon },
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(tSettings('passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(tSettings('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsLoading(false);
  };

  const testAPIConnection = async () => {
    setIsLoading(true);
    setConnectionTest(null);
    
    try {
      const result = await testConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testWhatsAppConnection = async () => {
    setIsLoading(true);
    setWhatsappTest(null);
    
    try {
      const response = await whatsappAPI.test();
      setWhatsappTest({ success: true, data: response.data });
      toast.success('Configuration WhatsApp valide');
    } catch (error) {
      setWhatsappTest({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
      toast.error('Erreur de configuration WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const TestResult = ({ result, type }) => {
    if (!result) return null;

    return (
      <div className={`mt-4 p-4 rounded-lg border ${
        result.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center">
          {result.success ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className={`text-sm font-medium ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success ? `${type} : Connexion réussie` : `${type} : Connexion échouée`}
          </span>
        </div>
        {result.success && result.responseTime && (
          <p className="text-xs text-green-600 mt-1">
            Temps de réponse: {result.responseTime}ms
          </p>
        )}
        {result.success && result.data && (
          <div className="text-xs text-green-600 mt-2">
            {result.data.data && (
              <div>
                <p>Numéro: {result.data.data.display_phone_number}</p>
                <p>Nom vérifié: {result.data.data.verified_name}</p>
              </div>
            )}
          </div>
        )}
        {!result.success && (
          <p className="text-xs text-red-600 mt-1">
            Erreur: {result.error}
          </p>
        )}
      </div>
    );
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {tSettings('profileInfo')}
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">{tSettings('fullName')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.fullName || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="form-label">Nom d'utilisateur</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.username || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="form-label">Rôle</label>
                  <input
                    type="text"
                    className="form-input capitalize"
                    value={user?.role || ''}
                    disabled
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Pour modifier ces informations, contactez votre administrateur.
              </p>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('settings.language')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    Sélectionner la langue
                  </label>
                  <div className="mt-2">
                    <LanguageSelector />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    La langue sera appliquée à toute l'interface utilisateur.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <LanguagesIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Langues disponibles
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="space-y-1">
                          {availableLanguages.map((lang) => (
                            <li key={lang.code} className="flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              {lang.nativeName}
                              {currentLanguage === lang.code && (
                                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                  Actuelle
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Changer le mot de passe
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="form-label">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      className="form-input pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                    >
                      {showPasswords.current ? (
                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="form-label">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      className="form-input pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                    >
                      {showPasswords.new ? (
                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      className="form-input pr-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                    >
                      {showPasswords.confirm ? (
                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      'Changer le mot de passe'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Préférences de notification
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Notifications d'envoi
                    </label>
                    <p className="text-sm text-gray-500">
                      Recevoir une notification quand une analyse est envoyée
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Notifications d'échec
                    </label>
                    <p className="text-sm text-gray-500">
                      Recevoir une notification en cas d'échec d'envoi
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Résumé quotidien
                    </label>
                    <p className="text-sm text-gray-500">
                      Recevoir un résumé quotidien des analyses
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tests de connexion
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Connexion API
                      </h4>
                      <p className="text-sm text-gray-500">
                        Tester la connexion au serveur backend
                      </p>
                    </div>
                    <button
                      onClick={testAPIConnection}
                      className="btn-outline"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Tester'
                      )}
                    </button>
                  </div>
                  <TestResult result={connectionTest} type="API" />
                </div>

                {user?.role === 'admin' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Configuration WhatsApp
                        </h4>
                        <p className="text-sm text-gray-500">
                          Tester la configuration WhatsApp Business API
                        </p>
                      </div>
                      <button
                        onClick={testWhatsAppConnection}
                        className="btn-outline"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Tester'
                        )}
                      </button>
                    </div>
                    <TestResult result={whatsappTest} type="WhatsApp" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations système
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="text-sm text-gray-900">1.0.0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Environnement</dt>
                    <dd className="text-sm text-gray-900">
                      {process.env.NODE_ENV || 'development'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
                    <dd className="text-sm text-gray-900">
                      {user?.lastLogin 
                        ? new Date(user.lastLogin).toLocaleString('fr-FR')
                        : 'Première connexion'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut du compte</dt>
                    <dd className="text-sm text-gray-900">
                      <span className="badge badge-success">Actif</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Navigation des onglets */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="lg:w-3/4 mt-6 lg:mt-0">
          <div className="card p-6">
            <TabContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;