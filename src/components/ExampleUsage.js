import React, { useState } from 'react';
import ProfessionalLoader from './ProfessionalLoader';
import WhatsAppLoader from './WhatsAppLoader';
import LoaderModal, { useLoaderModal } from './LoaderModal';

/**
 * Composant de démonstration des nouveaux loaders
 * À supprimer après intégration dans l'app
 */
const ExampleUsage = () => {
  const [whatsappVisible, setWhatsappVisible] = useState(false);
  const [whatsappStep, setWhatsappStep] = useState(0);
  const [whatsappProgress, setWhatsappProgress] = useState(0);
  
  // Hook pour le loader modal
  const { LoaderComponent, showLoader, hideLoader, updateProgress, updateMessage } = useLoaderModal();

  const demoWhatsAppSending = () => {
    setWhatsappVisible(true);
    setWhatsappStep(0);
    setWhatsappProgress(0);

    const steps = [
      { step: 0, progress: 20, delay: 1000 },
      { step: 1, progress: 40, delay: 1500 },
      { step: 2, progress: 60, delay: 2000 },
      { step: 3, progress: 80, delay: 1500 },
      { step: 4, progress: 100, delay: 1000 }
    ];

    let currentIndex = 0;
    const processStep = () => {
      if (currentIndex < steps.length) {
        const { step, progress, delay } = steps[currentIndex];
        setWhatsappStep(step);
        setWhatsappProgress(progress);
        
        setTimeout(() => {
          currentIndex++;
          processStep();
        }, delay);
      }
    };

    processStep();
  };

  const demoModalLoader = () => {
    showLoader({
      title: 'Traitement en cours',
      message: 'Envoi de l\'analyse...',
      type: 'progress',
      color: 'medical',
      showProgress: true,
      progress: 0,
      canCancel: true,
      autoMessages: [
        'Préparation des documents...',
        'Upload vers le cloud...',
        'Génération du rapport...',
        'Finalisation...'
      ]
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(hideLoader, 1000);
      }
    }, 500);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🎨 Nouveaux Loaders Professionnels
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Loaders de base */}
          <div className="card-professional">
            <h2 className="text-xl font-semibold mb-6 text-medical-700">
              Loaders de Base
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Spinner Classic</span>
                <ProfessionalLoader 
                  type="spinner" 
                  size="md" 
                  color="primary"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Points Animés</span>
                <ProfessionalLoader 
                  type="dots" 
                  size="md" 
                  color="success"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Onde</span>
                <ProfessionalLoader 
                  type="wave" 
                  size="md" 
                  color="warning"
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="font-medium block mb-3">Barre de Progression</span>
                <ProfessionalLoader 
                  type="progress" 
                  size="md" 
                  color="medical"
                  progress={65}
                  text="Chargement..."
                />
              </div>
            </div>
          </div>

          {/* Loaders avec texte */}
          <div className="card-professional">
            <h2 className="text-xl font-semibold mb-6 text-medical-700">
              Avec Messages
            </h2>
            <div className="space-y-6">
              <ProfessionalLoader 
                type="spinner" 
                size="lg" 
                color="medical"
                text="Analyse en cours..."
                subText="Veuillez patienter quelques instants"
              />
              
              <ProfessionalLoader 
                type="pulse" 
                size="lg" 
                color="whatsapp"
                text="Envoi WhatsApp"
                subText="Transmission vers le patient"
                showProgress={true}
                progress={42}
              />
            </div>
          </div>
        </div>

        {/* Boutons de démonstration */}
        <div className="card-professional mb-8">
          <h2 className="text-xl font-semibold mb-6 text-medical-700">
            Démonstrations Interactives
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={demoWhatsAppSending}
              className="btn-gradient-success flex items-center space-x-2"
            >
              <span>📱</span>
              <span>Demo Loader WhatsApp</span>
            </button>
            
            <button
              onClick={demoModalLoader}
              className="btn-gradient-primary flex items-center space-x-2"
            >
              <span>🎯</span>
              <span>Demo Modal Loader</span>
            </button>
          </div>
        </div>

        {/* Guide d'usage */}
        <div className="card-professional">
          <h2 className="text-xl font-semibold mb-4 text-medical-700">
            💡 Comment Utiliser
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
            <div className="mb-4">
              <strong>1. Loader Simple :</strong>
              <pre className="mt-2 text-gray-700">
{`<ProfessionalLoader 
  type="spinner"
  size="md"
  color="primary"
  text="Chargement..."
/>`}
              </pre>
            </div>
            
            <div className="mb-4">
              <strong>2. Loader WhatsApp :</strong>
              <pre className="mt-2 text-gray-700">
{`<WhatsAppLoader 
  isVisible={true}
  patientName="Mohamed Ould Ahmed"
  currentStep={2}
  progress={60}
/>`}
              </pre>
            </div>
            
            <div>
              <strong>3. Modal avec Hook :</strong>
              <pre className="mt-2 text-gray-700">
{`const { LoaderComponent, showLoader } = useLoaderModal();
showLoader({ 
  title: 'Processing...', 
  type: 'progress',
  progress: 50 
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Composants modaux */}
      <WhatsAppLoader
        isVisible={whatsappVisible}
        onClose={() => setWhatsappVisible(false)}
        patientName="Mohamed Ould Ahmed"
        fileName="analyse_sang_complete.pdf"
        currentStep={whatsappStep}
        progress={whatsappProgress}
      />

      <LoaderComponent />
    </div>
  );
};

export default ExampleUsage;