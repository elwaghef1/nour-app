import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  History, 
  FileText, 
  Filter,
  Download,
  Eye,
  Users,
  Phone,
  Clock,
  ChevronRight,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';
import PatientHistoryModal from '../components/PatientHistoryModal';
import ProfessionalLoader from '../components/ProfessionalLoader';
import api from '../services/api';

const PatientHistory = () => {
  const { t } = useTranslation('patientHistory');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastAnalysis');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // 'grid' ou 'list'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    pages: 0
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Charger la liste des patients
  const loadPatients = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/batch-analysis/patients?page=${page}&limit=${pagination.limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      setPatients(response.data.patients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erreur chargement patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(1, searchTerm);
  }, [searchTerm, sortBy, sortOrder]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openPatientHistory = (patient) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedPatient(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\+222)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  };

  // Composant Card Patient pour la vue grille
  const PatientCard = ({ patient }) => (
    <div className="card-professional hover:shadow-medical transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {patient.patientName}
            </h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Phone className="w-3 h-3 mr-1" />
              {formatPhone(patient.patientPhone)}
            </p>
          </div>
        </div>
        <button
          onClick={() => openPatientHistory(patient)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            {t('analyses')}
          </span>
          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
            {patient.analysisCount}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {t('last')}
          </span>
          <span className="text-xs text-gray-700 font-medium">
            {formatDate(patient.lastAnalysis)}
          </span>
        </div>
      </div>

      <button
        onClick={() => openPatientHistory(patient)}
        className="w-full mt-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center space-x-2 group"
      >
        <Eye className="w-4 h-4" />
        <span>{t('viewHistory')}</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );

  // Composant Row Patient pour la vue liste
  const PatientRow = ({ patient }) => (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="table-cell">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{patient.patientName}</p>
            <p className="text-sm text-gray-500">{formatPhone(patient.patientPhone)}</p>
          </div>
        </div>
      </td>
      <td className="table-cell text-center">
        <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2 py-1 rounded-full">
          {patient.analysisCount}
        </span>
      </td>
      <td className="table-cell text-gray-700">
        {formatDate(patient.lastAnalysis)}
      </td>
      <td className="table-cell text-right">
        <button
          onClick={() => openPatientHistory(patient)}
          className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>{t('view')}</span>
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Compact */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-medical-600" />
                {t('title')}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('patientsWithAnalyses', { count: pagination.total })}
              </p>
            </div>
            
            {/* Controls compacts */}
            <div className="flex items-center space-x-2">
              {/* Tri */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="lastAnalysis-desc">{t('sort.mostRecent')}</option>
                <option value="lastAnalysis-asc">{t('sort.oldest')}</option>
                <option value="patientName-asc">{t('sort.nameAZ')}</option>
                <option value="patientName-desc">{t('sort.nameZA')}</option>
                <option value="analysisCount-desc">{t('sort.mostAnalyses')}</option>
              </select>

              {/* Mode d'affichage */}
              <div className="flex bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche compacte */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('searchPatientPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center py-12">
            <ProfessionalLoader 
              type="spinner"
              size="lg"
              color="medical"
              text={t('loadingPatients')}
            />
          </div>
        ) : patients.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              /* Vue grille - plus compacte */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {patients.map((patient) => (
                  <PatientCard key={patient._id} patient={patient} />
                ))}
              </div>
            ) : (
              /* Vue liste - très compacte */
              <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-6">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">
                        {t('patient')}
                      </th>
                      <th className="table-header-cell text-center">
                        {t('analyses')}
                      </th>
                      <th className="table-header-cell">
                        {t('lastAnalysis')}
                      </th>
                      <th className="table-header-cell text-right">
                        {t('action')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {patients.map((patient) => (
                      <PatientRow key={patient._id} patient={patient} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination complète */}
            {pagination.pages > 1 && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {t('pagination.showing', {
                        start: ((pagination.page - 1) * pagination.limit) + 1,
                        end: Math.min(pagination.page * pagination.limit, pagination.total),
                        total: pagination.total
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Navigation pages */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => loadPatients(1, searchTerm)}
                        disabled={pagination.page === 1}
                        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('pagination.firstPage')}
                      >
                        «
                      </button>
                      
                      <button
                        onClick={() => loadPatients(pagination.page - 1, searchTerm)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('pagination.previous')}
                      </button>
                      
                      {/* Numéros de pages */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => loadPatients(pageNum, searchTerm)}
                              className={`px-3 py-1 text-sm rounded ${
                                pageNum === pagination.page
                                  ? 'bg-primary-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => loadPatients(pagination.page + 1, searchTerm)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('pagination.next')}
                      </button>
                      
                      <button
                        onClick={() => loadPatients(pagination.pages, searchTerm)}
                        disabled={pagination.page === pagination.pages}
                        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('pagination.lastPage')}
                      >
                        »
                      </button>
                    </div>
                    
                    {/* Sélecteur de taille de page */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{t('pagination.perPage')}:</span>
                      <select
                        value={pagination.limit}
                        onChange={(e) => {
                          const newLimit = parseInt(e.target.value);
                          setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                          loadPatients(1, searchTerm);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                        <option value={96}>96</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* État vide */
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noPatientFound')}</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm 
                ? t('noPatientMatchSearch', { searchTerm })
                : t('noPatientInDatabase')
              }
            </p>
          </div>
        )}

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

export default PatientHistory;