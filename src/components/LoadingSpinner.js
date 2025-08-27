import React from 'react';
import ProfessionalLoader from './ProfessionalLoader';

/**
 * LoadingSpinner - Version compatibilité + nouvelles fonctionnalités
 * Utilise le nouveau ProfessionalLoader tout en gardant l'API existante
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  className = '',
  color = 'primary',
  type = 'spinner', // Nouveau: type de loader
  subText = '', // Nouveau: sous-texte
  showProgress = false, // Nouveau: afficher barre de progression
  progress = 0 // Nouveau: valeur de progression
}) => {
  // Mapping des anciens styles vers les nouveaux
  const legacyColorMapping = {
    primary: 'primary',
    white: 'white', 
    gray: 'primary' // Fallback vers primary pour gray
  };

  const mappedColor = legacyColorMapping[color] || color;

  // Si c'est juste les anciens paramètres, utiliser le mode classique
  if (!subText && !showProgress && type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div 
          className={`animate-spin rounded-full border-2 border-t-transparent ${
            size === 'sm' ? 'h-4 w-4' :
            size === 'md' ? 'h-6 w-6' :
            size === 'lg' ? 'h-8 w-8' :
            'h-12 w-12'
          } ${
            color === 'primary' ? 'border-primary-200 border-t-primary-600' :
            color === 'white' ? 'border-gray-200 border-t-white' :
            'border-primary-200 border-t-primary-600'
          }`}
        />
        {text && (
          <p className="mt-2 text-sm text-gray-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  // Sinon, utiliser le nouveau ProfessionalLoader
  return (
    <ProfessionalLoader
      type={type}
      size={size}
      color={mappedColor}
      text={text}
      subText={subText}
      showProgress={showProgress}
      progress={progress}
      className={className}
    />
  );
};

export default LoadingSpinner;