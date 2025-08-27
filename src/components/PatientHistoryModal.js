import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  Clock, 
  Download, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Send
} from 'lucide-react';
import { useI18n } from '../utils/translationHelpers';
import api from '../services/api';
import Pagination, { usePagination } from './Pagination';

const PatientHistoryModal = ({ isOpen, onClose, patientPhone, patientName }) => {
  const { tPatientHistory, tAnalysis, t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  const [filters, setFilters] = useState({
    analysisType: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'analysisDate',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination(1, 20);

  // Charger l'historique du patient
  const loadPatientHistory = async () => {
    if (!patientPhone) return;
    
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...filters
      });

      const response = await api.get(`/patient-history/${encodeURIComponent(patientPhone)}?${queryParams}`);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger la chronologie
  const loadTimeline = async () => {
    if (!patientPhone) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/patient-history/${encodeURIComponent(patientPhone)}/timeline`);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Erreur chargement chronologie:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientPhone) {
      if (activeTab === 'history') {
        loadPatientHistory();
      } else if (activeTab === 'timeline') {
        loadTimeline();
      }
    }
  }, [isOpen, patientPhone, activeTab, filters, currentPage, pageSize]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    handlePageChange(1); // Reset to first page when filters change
  };

  const handlePaginationChange = (page) => {
    handlePageChange(page);
  };

  const handlePaginationSizeChange = (newPageSize) => {
    handlePageSizeChange(newPageSize);
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        analysisType: filters.analysisType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });

      const response = await api.get(`/patient-history/${encodeURIComponent(patientPhone)}/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historique_${patientName?.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock className="w-4 h-4 text-yellow-500" />,
      'sent': <Send className="w-4 h-4 text-blue-500" />,
      'delivered': <CheckCircle className="w-4 h-4 text-green-500" />,
      'read': <Eye className="w-4 h-4 text-purple-500" />,
      'failed': <XCircle className="w-4 h-4 text-red-500" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = (status) => {
    return tAnalysis(`status.${status}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tPatientHistory('title')}</h2>
            <p className="text-gray-600 mt-1">
              {patientName} • {patientPhone}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={!historyData || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {tPatientHistory('exportCSV')}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              {t('common.filters')}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tPatientHistory('filters.analysisType')}
                </label>
                <select
                  value={filters.analysisType}
                  onChange={(e) => handleFilterChange('analysisType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{tAnalysis('filters.allTypes')}</option>
                  <option value="bloodAnalysis">{tAnalysis('types.bloodAnalysis')}</option>
                  <option value="urineAnalysis">{tAnalysis('types.urineAnalysis')}</option>
                  <option value="biochemistry">{tAnalysis('types.biochemistry')}</option>
                  <option value="hematology">{tAnalysis('types.hematology')}</option>
                  <option value="microbiology">{tAnalysis('types.microbiology')}</option>
                  <option value="immunology">{tAnalysis('types.immunology')}</option>
                  <option value="endocrinology">{tAnalysis('types.endocrinology')}</option>
                  <option value="other">{tAnalysis('types.other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tPatientHistory('filters.dateFrom')}
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tPatientHistory('filters.dateTo')}
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tPatientHistory('filters.sortBy')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="analysisDate">{tPatientHistory('filters.analysisDate')}</option>
                    <option value="createdAt">{tPatientHistory('filters.createdAt')}</option>
                    <option value="analysisType">{t('common.type')}</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="desc">{tPatientHistory('filters.desc')}</option>
                    <option value="asc">{tPatientHistory('filters.asc')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            {tPatientHistory('history')}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            {tPatientHistory('timeline')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-6">
              {/* Statistiques */}
              {historyData?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">{tPatientHistory('totalAnalyses')}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {historyData.stats.totalAnalyses}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">{tPatientHistory('firstAnalysis')}</span>
                    </div>
                    <p className="text-sm font-medium text-green-900 mt-1">
                      {historyData.stats.dateRange.firstAnalysis 
                        ? formatDate(historyData.stats.dateRange.firstAnalysis)
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">{tPatientHistory('lastAnalysis')}</span>
                    </div>
                    <p className="text-sm font-medium text-purple-900 mt-1">
                      {historyData.stats.dateRange.lastAnalysis 
                        ? formatDate(historyData.stats.dateRange.lastAnalysis)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Liste des analyses */}
              <div className="space-y-4">
                {historyData?.analyses?.map((analysis) => (
                  <div key={analysis._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {analysis.analysisType}
                          </h3>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(analysis.status)}
                            <span className="text-sm text-gray-600">
                              {getStatusText(analysis.status)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          <strong>{t('common.name')}:</strong> {analysis.pdfFilename}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                          <div>
                            <strong>{tAnalysis('analysisDate')}:</strong><br />
                            {formatDate(analysis.analysisDate)}
                          </div>
                          
                          {analysis.sentAt && (
                            <div>
                              <strong>{tPatientHistory('events.sent')}:</strong><br />
                              {formatDate(analysis.sentAt)}
                            </div>
                          )}
                          
                          {analysis.deliveredAt && (
                            <div>
                              <strong>{tPatientHistory('events.delivered')}:</strong><br />
                              {formatDate(analysis.deliveredAt)}
                            </div>
                          )}
                        </div>
                        
                        {/* {analysis.customMessage && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>{tAnalysis('customMessage')}:</strong> {analysis.customMessage}
                            </p>
                          </div>
                        )} */}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          analysis.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          analysis.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          analysis.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusText(analysis.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {historyData?.analyses?.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{tPatientHistory('empty.noAnalyses')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {tPatientHistory('empty.noAnalysesDescription')}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination pour l'historique */}
              {historyData?.pagination && historyData.pagination.pages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Pagination
                    currentPage={historyData.pagination.page}
                    totalPages={historyData.pagination.pages}
                    totalItems={historyData.pagination.total}
                    itemsPerPage={historyData.pagination.limit}
                    onPageChange={handlePaginationChange}
                    showInfo={true}
                    showSizeSelector={true}
                    pageSizeOptions={[10, 20, 50, 100]}
                    onPageSizeChange={handlePaginationSizeChange}
                  />
                </div>
              )}
            </div>
          ) : (
            // Timeline Tab
            <div className="space-y-4">
              {historyData?.timeline?.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(item.event.type.split('_')[1])}
                    </div>
                    {index < historyData.timeline.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.event.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.analysisType} • {item.pdfFilename}
                        </p>
                      </div>
                      <time className="text-sm text-gray-500">
                        {formatDate(item.event.date)}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
              
              {historyData?.timeline?.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{tPatientHistory('empty.noEvents')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {tPatientHistory('empty.noEventsDescription')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;