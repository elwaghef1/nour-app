import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Loader spécialement conçu pour les envois WhatsApp
 * Avec étapes progressives et messages contextuels
 */
const WhatsAppLoader = ({ 
  isVisible = false,
  onClose = () => {},
  patientName = '',
  fileName = '',
  currentStep = 0,
  progress = 0,
  error = null,
  success = false
}) => {
  const { t } = useTranslation(['common', 'analysis']);
  const [animationStep, setAnimationStep] = useState(0);

  // Animation des étapes
  useEffect(() => {
    if (currentStep > animationStep) {
      const timer = setTimeout(() => {
        setAnimationStep(currentStep);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, animationStep]);

  const steps = [
    {
      id: 0,
      icon: '📱',
      titleKey: 'whatsapp.steps.preparing',
      descriptionKey: 'whatsapp.steps.preparingDesc',
      defaultTitle: 'Préparation de l\'envoi',
      defaultDesc: 'Configuration des paramètres WhatsApp'
    },
    {
      id: 1,
      icon: '🔒',
      titleKey: 'whatsapp.steps.validating',
      descriptionKey: 'whatsapp.steps.validatingDesc',
      defaultTitle: 'Validation du numéro',
      defaultDesc: 'Vérification du format mauritanien (+222)'
    },
    {
      id: 2,
      icon: '☁️',
      titleKey: 'whatsapp.steps.uploading',
      descriptionKey: 'whatsapp.steps.uploadingDesc',
      defaultTitle: 'Upload du fichier',
      defaultDesc: 'Téléchargement vers Google Cloud Storage'
    },
    {
      id: 3,
      icon: '📤',
      titleKey: 'whatsapp.steps.sending',
      descriptionKey: 'whatsapp.steps.sendingDesc',
      defaultTitle: 'Envoi WhatsApp',
      defaultDesc: 'Transmission via Twilio Business API'
    },
    {
      id: 4,
      icon: '✅',
      titleKey: 'whatsapp.steps.completed',
      descriptionKey: 'whatsapp.steps.completedDesc',
      defaultTitle: 'Envoi terminé',
      defaultDesc: 'Message livré avec succès'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.905 3.512z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {t('whatsapp.sending', 'Envoi WhatsApp')}
                </h2>
                <p className="text-green-100 text-sm">
                  {patientName && `Patient: ${patientName}`}
                </p>
              </div>
            </div>
            {!success && !error && (
              <button
                onClick={onClose}
                className="text-white hover:text-green-200 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-sm text-green-100 mt-1">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error ? (
            /* État d'erreur */
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                {t('whatsapp.error.title', 'Erreur d\'envoi')}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {error}
              </p>
              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                {t('common.close', 'Fermer')}
              </button>
            </div>
          ) : success ? (
            /* État de succès */
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                {t('whatsapp.success.title', 'Envoi réussi')}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('whatsapp.success.message', 'Le message WhatsApp a été envoyé avec succès')}
              </p>
              {fileName && (
                <p className="text-xs text-gray-500 mb-4">
                  {t('whatsapp.success.file', 'Fichier')}: {fileName}
                </p>
              )}
              <button
                onClick={onClose}
                className="btn-success w-full"
              >
                {t('common.close', 'Fermer')}
              </button>
            </div>
          ) : (
            /* États de progression */
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isUpcoming = index > currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-blue-50 border-blue-200 border' :
                      isCompleted ? 'bg-green-50 border-green-200 border' :
                      'bg-gray-50 border-gray-200 border opacity-50'
                    }`}
                  >
                    <div className={`text-2xl transition-transform duration-300 ${
                      isActive ? 'animate-pulse scale-110' :
                      isCompleted ? 'scale-100' :
                      'scale-90'
                    }`}>
                      {isCompleted ? '✅' : step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${
                        isActive ? 'text-blue-700' :
                        isCompleted ? 'text-green-700' :
                        'text-gray-500'
                      }`}>
                        {t(step.titleKey, step.defaultTitle)}
                      </h4>
                      <p className={`text-xs mt-1 ${
                        isActive ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                        'text-gray-400'
                      }`}>
                        {t(step.descriptionKey, step.defaultDesc)}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer avec info */}
        {!error && !success && (
          <div className="bg-gray-50 px-6 py-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              {t('whatsapp.info', 'L\'envoi peut prendre quelques secondes selon la taille du fichier')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppLoader;