import React, { useState, useEffect, useCallback } from 'react';
// import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';

const BatchWhatsappConfirmation = ({ 
  selectedAnalyses, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}) => {
  // const { t } = useTranslation();
  const [batchPreview, setBatchPreview] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState({});
  const [customMessage, setCustomMessage] = useState('');
  const [isPreparingBatch, setIsPreparingBatch] = useState(true);

  const prepareBatch = useCallback(async () => {
    try {
      setIsPreparingBatch(true);
      const response = await fetch('/api/whatsapp/batch/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          analysisIds: selectedAnalyses.map(a => a._id)
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la préparation de l\'envoi collectif');
      }

      const data = await response.json();
      setBatchPreview(data.data);

      // Initialiser tous les messages valides comme cochés
      const initialSelection = {};
      data.data.validMessages.forEach(msg => {
        initialSelection[msg.analysisId] = true;
      });
      setSelectedMessages(initialSelection);

    } catch (error) {
      console.error('Erreur préparation batch:', error);
      alert('Erreur lors de la préparation de l\'envoi collectif');
    } finally {
      setIsPreparingBatch(false);
    }
  }, [selectedAnalyses]);

  useEffect(() => {
    if (selectedAnalyses && selectedAnalyses.length > 0) {
      prepareBatch();
    }
  }, [selectedAnalyses, prepareBatch]);

  const handleMessageToggle = (analysisId) => {
    setSelectedMessages(prev => ({
      ...prev,
      [analysisId]: !prev[analysisId]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedMessages).every(Boolean);
    const newSelection = {};
    batchPreview.validMessages.forEach(msg => {
      newSelection[msg.analysisId] = !allSelected;
    });
    setSelectedMessages(newSelection);
  };

  const handleConfirm = () => {
    const selectedIds = Object.entries(selectedMessages)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => id);
    
    onConfirm({
      analysisIds: selectedAnalyses.map(a => a._id),
      selectedIds,
      customMessage: customMessage.trim()
    });
  };

  const getSelectedCount = () => {
    return Object.values(selectedMessages).filter(Boolean).length;
  };

  if (isPreparingBatch) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner />
          </div>
          <h3 className="text-lg font-medium text-center">
            Préparation de l'envoi collectif...
          </h3>
          <p className="text-gray-500 text-center mt-2">
            Validation des numéros et préparation des messages
          </p>
        </div>
      </div>
    );
  }

  if (!batchPreview) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Confirmer l'envoi collectif WhatsApp
              </h3>
              <p className="text-gray-600 mt-1">
                Vérifiez et ajustez les messages avant l'envoi
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Résumé */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {batchPreview.summary.totalFound}
              </div>
              <div className="text-sm text-blue-600">Analyses trouvées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {batchPreview.summary.validForSending}
              </div>
              <div className="text-sm text-green-600">Prêtes à envoyer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getSelectedCount()}
              </div>
              <div className="text-sm text-orange-600">Sélectionnées</div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Message personnalisé */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message personnalisé (optionnel)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Message qui remplacera le message par défaut pour tous les envois..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {customMessage.length}/1000 caractères
            </div>
          </div>

          {/* Contrôles de sélection */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              {Object.values(selectedMessages).every(Boolean) ? 'Tout décocher' : 'Tout cocher'}
            </button>
            <span className="text-sm text-gray-600">
              {getSelectedCount()} sur {batchPreview.validMessages.length} sélectionnés
            </span>
          </div>

          {/* Messages valides */}
          {batchPreview.validMessages.length > 0 && (
            <div className="p-6">
              <h4 className="font-medium text-green-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Messages prêts à envoyer ({batchPreview.validMessages.length})
              </h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {batchPreview.validMessages.map((message) => (
                  <div key={message.analysisId} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedMessages[message.analysisId] || false}
                      onChange={() => handleMessageToggle(message.analysisId)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {message.patientName}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">
                          {message.analysisType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {message.formattedPhone}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.pdfFilename}
                      </p>
                      {message.retryCount > 0 && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                          Retry #{message.retryCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages invalides */}
          {batchPreview.invalidMessages.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h4 className="font-medium text-red-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Messages non envoyables ({batchPreview.invalidMessages.length})
              </h4>
              
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {batchPreview.invalidMessages.map((message) => (
                  <div key={message.analysisId} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {message.patientName}
                      </p>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {message.status === 'sent' ? 'Déjà envoyé' : 'Numéro invalide'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {message.originalPhone} → {message.formattedPhone}
                    </p>
                    {!message.isValidPhone && (
                      <p className="text-xs text-red-600 mt-1">
                        Format de numéro mauritanien invalide (attendu: +222XXXXXXXX)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          
          <div className="flex items-center space-x-3">
            {getSelectedCount() > 0 && (
              <span className="text-sm text-gray-600">
                {getSelectedCount()} message{getSelectedCount() > 1 ? 's' : ''} sera{getSelectedCount() > 1 ? 'nt' : ''} envoyé{getSelectedCount() > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={handleConfirm}
              disabled={getSelectedCount() === 0 || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              <span>
                {isLoading ? 'Envoi en cours...' : `Envoyer ${getSelectedCount()} message${getSelectedCount() > 1 ? 's' : ''}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchWhatsappConfirmation;