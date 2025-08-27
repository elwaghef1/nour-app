import React from 'react';

/**
 * Composant de loader professionnel avec différents styles et animations
 */
const ProfessionalLoader = ({ 
  type = 'spinner', 
  size = 'md', 
  color = 'primary',
  text = '',
  subText = '',
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const sizeClasses = {
    sm: { loader: 'h-6 w-6', text: 'text-sm', container: 'p-2' },
    md: { loader: 'h-8 w-8', text: 'text-base', container: 'p-4' },
    lg: { loader: 'h-12 w-12', text: 'text-lg', container: 'p-6' },
    xl: { loader: 'h-16 w-16', text: 'text-xl', container: 'p-8' }
  };

  const colorClasses = {
    primary: {
      loader: 'border-primary-200 border-t-primary-600',
      text: 'text-primary-700',
      pulse: 'bg-primary-600',
      progress: 'bg-primary-600'
    },
    success: {
      loader: 'border-success-200 border-t-success-600',
      text: 'text-success-700',
      pulse: 'bg-success-600',
      progress: 'bg-success-600'
    },
    warning: {
      loader: 'border-warning-200 border-t-warning-600',
      text: 'text-warning-700',
      pulse: 'bg-warning-600',
      progress: 'bg-warning-600'
    },
    medical: {
      loader: 'border-medical-200 border-t-medical-600',
      text: 'text-medical-700',
      pulse: 'bg-medical-600',
      progress: 'bg-medical-600'
    },
    whatsapp: {
      loader: 'border-whatsapp-200 border-t-whatsapp-600',
      text: 'text-whatsapp-700',
      pulse: 'bg-whatsapp-600',
      progress: 'bg-whatsapp-600'
    },
    white: {
      loader: 'border-gray-200 border-t-white',
      text: 'text-white',
      pulse: 'bg-white',
      progress: 'bg-white'
    }
  };

  const renderSpinner = () => {
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const colorClass = colorClasses[color] || colorClasses.primary;
    
    return (
      <div 
        className={`animate-spin rounded-full border-2 ${sizeClass.loader} ${colorClass.loader}`}
      />
    );
  };

  const renderDots = () => {
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const colorClass = colorClasses[color] || colorClasses.primary;
    
    return (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClass.loader.replace('h-', 'h-2 w-2 rounded-full ').replace('w-', '')} ${colorClass.pulse}`}
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite both`
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => {
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const colorClass = colorClasses[color] || colorClasses.primary;
    
    return (
      <div className={`animate-pulse ${sizeClass.loader} ${colorClass.pulse} rounded-full opacity-75`} />
    );
  };

  const renderWave = () => {
    const colorClass = colorClasses[color] || colorClasses.primary;
    
    return (
      <div className="flex items-center space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1 ${colorClass.pulse} rounded-full`}
            style={{
              height: '20px',
              animation: `wave 1s ease-in-out ${i * 0.1}s infinite alternate`
            }}
          />
        ))}
      </div>
    );
  };

  const renderProgress = () => {
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const colorClass = colorClasses[color] || colorClasses.primary;
    
    return (
      <div className="w-full">
        {(text || subText) && (
          <div className="mb-4 text-center">
            {text && <div className={`font-medium ${colorClass.text} ${sizeClass.text}`}>{text}</div>}
            {subText && <div className={`text-gray-500 text-sm mt-1`}>{subText}</div>}
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 ${colorClass.progress} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className={`${colorClass.text} text-sm font-medium`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'wave': return renderWave();
      case 'progress': return renderProgress();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size].container} ${className}`}>
      {type !== 'progress' && renderLoader()}
      {type === 'progress' && renderLoader()}
      
      {type !== 'progress' && (text || subText) && (
        <div className="mt-4 text-center max-w-xs">
          {text && (
            <div className={`font-medium ${colorClasses[color].text} ${sizeClasses[size].text} mb-1`}>
              {text}
            </div>
          )}
          {subText && (
            <div className="text-gray-500 text-sm animate-pulse">
              {subText}
            </div>
          )}
          {showProgress && (
            <div className="mt-2 w-32 mx-auto bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 ${colorClasses[color].progress} rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Styles CSS pour les animations personnalisées
const styles = `
  @keyframes pulse {
    0%, 80%, 100% { 
      transform: scale(0);
      opacity: 0.5;
    }
    40% { 
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes wave {
    0% { height: 10px; }
    100% { height: 25px; }
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ProfessionalLoader;