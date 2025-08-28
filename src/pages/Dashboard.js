import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  // Plus as PlusIcon, 
  FileText as DocumentTextIcon, 
  CheckCircle as CheckCircleIcon, 
  Clock as ClockIcon, 
  XCircle as XCircleIcon,
  TrendingUp as TrendingUpIcon,
  // Users as UsersIcon,
  // Activity as ActivityIcon
} from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { useI18n } from '../utils/translationHelpers';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination, { usePagination } from '../components/Pagination';

const Dashboard = () => {
  const { tDashboard, tCommon, tAnalysis, getAnalysisStatus, formatPhoneForDisplay, formatPatientName } = useI18n();
  const { user } = useAuth();
  const { analyses, stats, pagination, fetchAnalyses, fetchStats, isLoading } = useAnalysis();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination(1, 10);

  useEffect(() => {
    // Charger les données du dashboard
    fetchStats();
    if (showAllRecent) {
      fetchAnalyses(currentPage, {}, pageSize);
    } else {
      fetchAnalyses(1, { limit: 5 }); // Récupérer les 5 dernières analyses
    }
  }, [showAllRecent, currentPage, pageSize, fetchStats, fetchAnalyses]);

  useEffect(() => {
    // Mettre à jour les analyses récentes
    if (showAllRecent) {
      setRecentAnalyses(analyses);
    } else {
      setRecentAnalyses(analyses.slice(0, 5));
    }
  }, [analyses, showAllRecent]);

  const handlePaginationChange = (page) => {
    handlePageChange(page);
  };

  const handlePaginationSizeChange = (newPageSize) => {
    handlePageSizeChange(newPageSize);
  };

  // Calculer les statistiques pour les cartes
  const getStatusStats = () => {
    if (!stats?.statusStats) return { pending: 0, sent: 0, delivered: 0, failed: 0 };
    
    const statusMap = stats.statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return {
      pending: statusMap.pending || 0,
      sent: statusMap.sent || 0,
      delivered: statusMap.delivered || 0,
      failed: statusMap.failed || 0,
    };
  };

  const statusStats = getStatusStats();

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                {Math.abs(trend)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-gray', text: getAnalysisStatus('pending') },
      sent: { class: 'badge-info', text: getAnalysisStatus('sent') },
      delivered: { class: 'badge-success', text: getAnalysisStatus('delivered') },
      read: { class: 'badge-success', text: getAnalysisStatus('read') },
      failed: { class: 'badge-error', text: getAnalysisStatus('failed') },
    };

    const config = statusConfig[status] || { class: 'badge-gray', text: getAnalysisStatus(status) };
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


  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={tCommon('loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {tDashboard('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tDashboard('welcome', { name: user?.fullName })}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {/* <Link
            to="/new-analysis"
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {tDashboard('newAnalysisAction')}
          </Link> */}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={tDashboard('totalAnalyses')}
          value={stats?.totalAnalyses || 0}
          icon={DocumentTextIcon}
          color="bg-primary-500"
        />
        <StatCard
          title={tDashboard('pending')}
          value={statusStats.pending}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title={tDashboard('sent')}
          value={statusStats.sent + statusStats.delivered}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          title={tDashboard('failed')}
          value={statusStats.failed}
          icon={XCircleIcon}
          color="bg-red-500"
        />
      </div>

      {/* Analyses récentes */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {tDashboard('recentAnalyses')}
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAllRecent(!showAllRecent)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {showAllRecent ? tDashboard('viewSummary') : tDashboard('viewMore')}
              </button>
              <Link
                to="/analyses"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {tDashboard('viewAll')}
              </Link>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner text={tCommon('loading')} />
          </div>
        ) : recentAnalyses.length > 0 ? (
          <div className="overflow-hidden">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">{tAnalysis('patientName')}</th>
                  <th className="table-header-cell">{tAnalysis('analysisType')}</th>
                  <th className="table-header-cell">{tCommon('status')}</th>
                  <th className="table-header-cell">{tCommon('date')}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {recentAnalyses.map((analysis) => (
                  <tr key={analysis._id}>
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
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(analysis.status)}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {formatDate(analysis.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination pour les analyses récentes */}
            {showAllRecent && pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePaginationChange}
                  showInfo={true}
                  showSizeSelector={true}
                  pageSizeOptions={[5, 10, 20, 50]}
                  onPageSizeChange={handlePaginationSizeChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {tDashboard('noAnalyses')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {tDashboard('noAnalysesDescription')}
            </p>
            <div className="mt-6">
              {/* <Link to="/new-analysis" className="btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                {tDashboard('newAnalysisAction')}
              </Link> */}
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* <Link
          to="/new-analysis"
          className="card p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlusIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {tDashboard('newAnalysisAction')}
              </h3>
              <p className="text-sm text-gray-500">
                {tDashboard('newAnalysisDescription')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/analyses"
          className="card p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {tDashboard('manageAnalyses')}
              </h3>
              <p className="text-sm text-gray-500">
                {tDashboard('manageAnalysesDescription')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/analytics"
          className="card p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ActivityIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {tDashboard('viewStatistics')}
              </h3>
              <p className="text-sm text-gray-500">
                {tDashboard('viewStatisticsDescription')}
              </p>
            </div>
          </div>
        </Link> */}
      </div>
    </div>
  );
};

export default Dashboard;