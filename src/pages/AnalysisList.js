import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  Filter as FilterIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Trash2 as TrashIcon,
  RefreshCw as RefreshCwIcon,
  Users as UsersIcon,
  CheckSquare as CheckSquareIcon,
  Square as SquareIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../utils/translationHelpers';
import { useAnalysis } from '../context/AnalysisContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import BatchWhatsappConfirmation from '../components/BatchWhatsappConfirmation';

const AnalysisList = () => {
  const { t } = useTranslation();
  const { tAnalysis, tCommon, formatPhoneForDisplay, formatPatientName } = useI18n();
  const {
    analyses,
    pagination,
    filters,
    isLoading,
    fetchAnalyses,
    sendAnalysis,
    deleteAnalysis,
    downloadPDF,
    retryAnalysis,
    updateFilters,
    clearFilters,
    updatePagination
  } = useAnalysis();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [showBatchConfirmation, setShowBatchConfirmation] = useState(false);
  const [isBatchSending, setIsBatchSending] = useState(false);

  useEffect(() => {
    fetchAnalyses(1);
  }, []);

  const analysisTypes = [
    { value: 'bloodAnalysis', label: tAnalysis('types.bloodAnalysis') },
    { value: 'urineAnalysis', label: tAnalysis('types.urineAnalysis') },
    { value: 'biochemistry', label: tAnalysis('types.biochemistry') },
    { value: 'hematology', label: tAnalysis('types.hematology') },
    { value: 'microbiology', label: tAnalysis('types.microbiology') },
    { value: 'immunology', label: tAnalysis('types.immunology') },
    { value: 'endocrinology', label: tAnalysis('types.endocrinology') },
    { value: 'other', label: tAnalysis('types.other') }
  ];

  const statusOptions = [
    { value: 'pending', label: tAnalysis('status.pending') },
    { value: 'sent', label: tAnalysis('status.sent') },
    { value: 'delivered', label: tAnalysis('status.delivered') },
    { value: 'read', label: tAnalysis('status.read') },
    { value: 'failed', label: tAnalysis('status.failed') }
  ];

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    updateFilters(newFilters);
    fetchAnalyses(1, newFilters);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const newFilters = { ...filters, patientName: value };
    updateFilters(newFilters);
    fetchAnalyses(1, newFilters);
  };

  const handlePaginationChange = (page) => {
    fetchAnalyses(page);
  };

  const handlePaginationSizeChange = async (newPageSize) => {
    // Mettre à jour la pagination dans le contexte d'abord
    updatePagination({ limit: newPageSize });
    // Puis récupérer les analyses avec la nouvelle taille
    await fetchAnalyses(1, filters, newPageSize);
  };

  const handleSendAnalysis = async (analysisId) => {
    if (window.confirm(tAnalysis('confirmations.send'))) {
      await sendAnalysis(analysisId);
    }
  };

  const handleRetryAnalysis = async (analysisId) => {
    if (window.confirm(tAnalysis('confirmations.retry'))) {
      await retryAnalysis(analysisId);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (window.confirm(tAnalysis('confirmations.delete'))) {
      await deleteAnalysis(analysisId);
    }
  };

  const handleDownloadPDF = async (analysisId, filename) => {
    await downloadPDF(analysisId, filename);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    fetchAnalyses(1);
  };

  // Gestion de la sélection
  const handleSelectAnalysis = (analysisId) => {
    setSelectedAnalyses(prev => {
      const analysis = analyses.find(a => a._id === analysisId);
      if (prev.find(a => a._id === analysisId)) {
        return prev.filter(a => a._id !== analysisId);
      } else {
        return [...prev, analysis];
      }
    });
  };

  const handleSelectAll = () => {
    const pendingAnalyses = analyses.filter(a => a.status === 'pending' || a.status === 'failed');
    if (selectedAnalyses.length === pendingAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(pendingAnalyses);
    }
  };

  const isAnalysisSelected = (analysisId) => {
    return selectedAnalyses.some(a => a._id === analysisId);
  };

  const canSelectAnalysis = (analysis) => {
    return analysis.status === 'pending' || analysis.status === 'failed';
  };

  // Envoi collectif
  const handleBatchSend = () => {
    if (selectedAnalyses.length === 0) {
      alert('Veuillez sélectionner au moins une analyse à envoyer');
      return;
    }
    setShowBatchConfirmation(true);
  };

  const handleBatchConfirm = async (confirmData) => {
    try {
      setIsBatchSending(true);
      
      const response = await fetch('/api/whatsapp/batch/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(confirmData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Envoi collectif lancé ! ${result.data.queuedSuccessfully} messages mis en queue.`);
        setShowBatchConfirmation(false);
        setSelectedAnalyses([]);
        // Actualiser la liste
        fetchAnalyses(pagination.page);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi collectif');
      }
    } catch (error) {
      console.error('Erreur envoi collectif:', error);
      alert('Erreur lors de l\'envoi collectif: ' + error.message);
    } finally {
      setIsBatchSending(false);
    }
  };

  const handleBatchCancel = () => {
    setShowBatchConfirmation(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-gray', text: tAnalysis('status.pending') },
      sent: { class: 'badge-info', text: tAnalysis('status.sent') },
      delivered: { class: 'badge-success', text: tAnalysis('status.delivered') },
      read: { class: 'badge-success', text: tAnalysis('status.read') },
      failed: { class: 'badge-error', text: tAnalysis('status.failed') },
    };

    const config = statusConfig[status] || { class: 'badge-gray', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const ActionButton = ({ onClick, icon: Icon, title, color = 'text-gray-400 hover:text-gray-600' }) => (
    <button
      onClick={onClick}
      className={`p-1 rounded-md ${color} transition-colors`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {tAnalysis('title')} ({pagination.total})
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('dashboard.manageAnalysesDescription')}
          </p>
        </div>
        <div className="mt-4 flex gap-2 md:mt-0 md:ml-4">
          {selectedAnalyses.length > 0 && (
            <button
              onClick={handleBatchSend}
              className="btn-success"
              disabled={isBatchSending}
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              {t('batchUpload.title')} ({selectedAnalyses.length})
            </button>
          )}
          {/* <Link to="/new-analysis" className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            {tAnalysis('newAnalysis')}
          </Link> */}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={tAnalysis('placeholders.searchPatient')}
                className="form-input pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Bouton filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline ${showFilters ? 'bg-gray-100' : ''}`}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              {tAnalysis('placeholders.filters')}
            </button>
            <button
              onClick={() => fetchAnalyses(pagination.page)}
              className="btn-outline"
              disabled={isLoading}
            >
              <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label">{tCommon('status')}</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">{tAnalysis('filters.allStatuses')}</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">{tAnalysis('analysisType')}</label>
                <select
                  className="form-select"
                  value={filters.analysisType}
                  onChange={(e) => handleFilterChange('analysisType', e.target.value)}
                >
                  <option value="">{tAnalysis('filters.allTypes')}</option>
                  {analysisTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">{tAnalysis('filters.dateFrom')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">{tAnalysis('filters.dateTo')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={handleClearFilters} className="btn-outline">
                {tAnalysis('filters.clearFilters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des analyses */}
      <div className="card">
        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner text={tCommon('loading')} />
          </div>
        ) : analyses.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-full"
                        title={selectedAnalyses.length > 0 ? tCommon('common.clear') : tCommon('common.selectAll')}
                      >
                        {selectedAnalyses.length > 0 ? (
                          <CheckSquareIcon className="h-4 w-4 text-blue-600" />
                        ) : (
                          <SquareIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="table-header-cell">{tAnalysis('patientName')}</th>
                    <th className="table-header-cell">{tAnalysis('analysisType')}</th>
                    <th className="table-header-cell">{tCommon('status')}</th>
                    <th className="table-header-cell">{tCommon('date')}</th>
                    <th className="table-header-cell">{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {analyses.map((analysis) => (
                    <tr key={analysis._id} className={isAnalysisSelected(analysis._id) ? 'bg-blue-50' : ''}>
                      <td className="table-cell">
                        {canSelectAnalysis(analysis) ? (
                          <button
                            onClick={() => handleSelectAnalysis(analysis._id)}
                            className="flex items-center justify-center w-full"
                          >
                            {isAnalysisSelected(analysis._id) ? (
                              <CheckSquareIcon className="h-4 w-4 text-blue-600" />
                            ) : (
                              <SquareIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            <SquareIcon className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPatientName(analysis.patientName)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPhoneForDisplay(analysis.patientPhone)}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {analysis.analysisType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(analysis.analysisDate)}
                        </div>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(analysis.status)}
                      </td>
                      <td className="table-cell text-sm text-gray-500">
                        {formatDate(analysis.createdAt)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          {/* Télécharger PDF */}
                          <ActionButton
                            onClick={() => handleDownloadPDF(analysis._id, analysis.pdfFilename)}
                            icon={DownloadIcon}
                            title={tAnalysis('actions.download')}
                            color="text-blue-400 hover:text-blue-600"
                          />

                          {/* Envoyer */}
                          {analysis.status === 'pending' && (
                            <ActionButton
                              onClick={() => handleSendAnalysis(analysis._id)}
                              icon={SendIcon}
                              title={tAnalysis('actions.send')}
                              color="text-green-400 hover:text-green-600"
                            />
                          )}

                          {/* Renvoyer */}
                          {analysis.status === 'failed' && analysis.retryCount < 3 && (
                            <ActionButton
                              onClick={() => handleRetryAnalysis(analysis._id)}
                              icon={RefreshCwIcon}
                              title={tAnalysis('actions.retry')}
                              color="text-yellow-400 hover:text-yellow-600"
                            />
                          )}

                          {/* Supprimer */}
                          <ActionButton
                            onClick={() => handleDeleteAnalysis(analysis._id)}
                            icon={TrashIcon}
                            title={tAnalysis('actions.delete')}
                            color="text-red-400 hover:text-red-600"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePaginationChange}
                showInfo={true}
                showSizeSelector={true}
                pageSizeOptions={[10, 20, 50, 100]}
                onPageSizeChange={handlePaginationSizeChange}
              />
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {tAnalysis('empty.title')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {tAnalysis('empty.createFirst')}
            </p>
            <div className="mt-6">
              <Link to="/new-analysis" className="btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                {tAnalysis('newAnalysis')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation d'envoi collectif */}
      {showBatchConfirmation && (
        <BatchWhatsappConfirmation
          selectedAnalyses={selectedAnalyses}
          onConfirm={handleBatchConfirm}
          onCancel={handleBatchCancel}
          isLoading={isBatchSending}
        />
      )}
    </div>
  );
};

export default AnalysisList;