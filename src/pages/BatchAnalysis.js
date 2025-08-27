import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, TrendingUp, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../utils/translationHelpers';
import BatchUpload from '../components/BatchUpload';
import PatientHistoryModal from '../components/PatientHistoryModal';
import api from '../services/api';

const BatchAnalysis = () => {
  const { t } = useTranslation();
  const { tBatchUpload, tCommon, tAnalysis, tPagination } = useI18n();
  const [activeTab, setActiveTab] = useState('upload');
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Charger les patients
  const loadPatients = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/batch-analysis/patients?page=${page}&limit=${pagination.limit}&search=${search}`);
      setPatients(response.data.patients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await api.get('/batch-analysis/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'patients') {
      loadPatients();
    } else if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'upload', name: tBatchUpload('title'), icon: Upload },
    { id: 'patients', name: tBatchUpload('patients'), icon: Users },
    { id: 'stats', name: tBatchUpload('statistics.title'), icon: TrendingUp }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'read': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': tAnalysis('status.pending'),
      'sent': tAnalysis('status.sent'),
      'delivered': tAnalysis('status.delivered'),
      'read': tAnalysis('status.read'),
      'failed': tAnalysis('status.failed')
    };
    return texts[status] || status;
  };

  const openPatientHistory = (patient) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedPatient(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{tBatchUpload('title')}</h1>
          <p className="text-gray-600 mt-2">
            {tBatchUpload ('description')}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <BatchUpload />
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {tBatchUpload('patientsList')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {tBatchUpload('patientsDescription')}
                </p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div key={patient._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{patient.patientName}</h3>
                            <p className="text-sm text-gray-600">{patient.patientPhone}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {tBatchUpload('lastAnalysis')}: {formatDate(patient.lastAnalysis)}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {patient.analysisCount} {tBatchUpload('analysisCount', { count: patient.analysisCount })}
                            </span>
                            <button
                              onClick={() => openPatientHistory(patient)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <History className="w-3 h-3" />
                              {tBatchUpload('viewHistory')}
                            </button>
                          </div>
                        </div>

                        {/* Liste des analyses */}
                        <div className="space-y-2">
                          {patient.analyses.slice(0, 3).map((analysis) => (
                            <div key={analysis._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {analysis.pdfFilename}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {analysis.analysisType} • {formatDate(analysis.analysisDate)}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                                {getStatusText(analysis.status)}
                              </span>
                            </div>
                          ))}
                          
                          {patient.analysisCount > 3 && (
                            <p className="text-xs text-gray-500 text-center pt-2">
                              + {patient.analysisCount - 3} {tBatchUpload('moreAnalyses', { count: patient.analysisCount - 3 })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {patients.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{tBatchUpload('noPatients')}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {tBatchUpload('noPatientsDescription')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      {tPagination('showing')} {((pagination.page - 1) * pagination.limit) + 1} {tPagination('to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {tPagination('of')} {pagination.total} {tBatchUpload('patientsCount')}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadPatients(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        {tPagination('previous')}
                      </button>
                      <button
                        onClick={() => loadPatients(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        {tPagination('next')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {tBatchUpload('statisticsTitle')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {tBatchUpload('statisticsDescription')}
                </p>
              </div>

              <div className="p-6">
                {stats ? (
                  <div className="space-y-6">
                    {stats.map((day) => (
                      <div key={day._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">
                            {new Date(day._id).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <span className="text-lg font-semibold text-blue-600">
                            {day.total} {tBatchUpload('analysisCount', { count: day.total })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {day.analyses.map((analysis) => (
                            <div key={analysis.type} className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-sm font-medium text-gray-900">{analysis.type}</p>
                              <p className="text-lg font-semibold text-gray-700">{analysis.count}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {stats.length === 0 && (
                      <div className="text-center py-8">
                        <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{tBatchUpload('noData')}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {tBatchUpload('noDataDescription')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal d'historique patient */}
        <PatientHistoryModal
          isOpen={showHistoryModal}
          onClose={closeHistoryModal}
          patientPhone={selectedPatient?.patientPhone}
          patientName={selectedPatient?.patientName}
        />
      </div>
    </div>
  );
};

export default BatchAnalysis;