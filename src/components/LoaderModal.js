import React, { useState, useEffect } from 'react';
import ProfessionalLoader from './ProfessionalLoader';

/**
 * Modal de chargement réutilisable avec différents types et messages
 */
const LoaderModal = ({
  isOpen = false,
  title = '',
  message = '',
  subMessage = '',
  type = 'spinner',
  color = 'primary',
  size = 'lg',
  showProgress = false,
  progress = 0,
  canCancel = false,
  onCancel = () => {},
  backdrop = 'blur',
  autoMessages = [],
  messageInterval = 3000,
  className = ''
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(message);

  // Rotation automatique des messages
  useEffect(() => {
    if (autoMessages.length > 1 && isOpen) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % autoMessages.length);
      }, messageInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoMessages.length, isOpen, messageInterval]);

  // Mise à jour du message affiché
  useEffect(() => {
    if (autoMessages.length > 0) {
      setDisplayMessage(autoMessages[currentMessageIndex]);
    } else {
      setDisplayMessage(message);
    }
  }, [currentMessageIndex, autoMessages, message]);

  if (!isOpen) return null;

  const backdropClasses = {
    solid: 'bg-black bg-opacity-50',
    blur: 'bg-black bg-opacity-30 backdrop-blur-sm',
    dark: 'bg-gray-900 bg-opacity-75',
    light: 'bg-white bg-opacity-90'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClasses[backdrop]}`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-300 ${className}`}>
        {/* Header avec titre */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {canCancel && (
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="px-6 py-8">
          <ProfessionalLoader
            type={type}
            size={size}
            color={color}
            text={displayMessage}
            subText={subMessage}
            showProgress={showProgress}
            progress={progress}
            className="mb-4"
          />

          {/* Messages automatiques avec indicateur */}
          {autoMessages.length > 1 && (
            <div className="flex justify-center space-x-1 mt-4">
              {autoMessages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentMessageIndex 
                      ? 'bg-primary-600 scale-110' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer avec bouton d'annulation */}
        {canCancel && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="w-full btn-outline text-sm"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Hook pour gérer facilement les états de chargement
export const useLoaderModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const showLoader = (options = {}) => {
    setConfig(options);
    setIsOpen(true);
  };

  const hideLoader = () => {
    setIsOpen(false);
  };

  const updateProgress = (progress) => {
    setConfig(prev => ({ ...prev, progress }));
  };

  const updateMessage = (message) => {
    setConfig(prev => ({ ...prev, message }));
  };

  return {
    LoaderComponent: () => (
      <LoaderModal
        isOpen={isOpen}
        onCancel={hideLoader}
        {...config}
      />
    ),
    showLoader,
    hideLoader,
    updateProgress,
    updateMessage,
    isOpen
  };
};

export default LoaderModal;