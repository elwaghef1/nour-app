import React, { useEffect } from 'react';
import { 
  BarChart3 as BarChart3Icon, 
  TrendingUp as TrendingUpIcon, 
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  RefreshCw as RefreshCwIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../utils/translationHelpers';
import { useAnalysis } from '../context/AnalysisContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  // const { t } = useTranslation();
  const { tAnalytics, tCommon } = useI18n();
  // const getAnalysisStatus = useI18n().getAnalysisStatus;
  const { stats, fetchStats, isLoading } = useAnalysis();
  // const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getStatusStats = () => {
    if (!stats?.statusStats) return [];
    
    const statusMap = {
      'pending': { label: 'En attente', color: 'bg-yellow-500', count: 0 },
      'sent': { label: 'Envoyé', color: 'bg-blue-500', count: 0 },
      'delivered': { label: 'Livré', color: 'bg-green-500', count: 0 },
      'read': { label: 'Lu', color: 'bg-green-600', count: 0 },
      'failed': { label: 'Échec', color: 'bg-red-500', count: 0 }
    };

    stats.statusStats.forEach(stat => {
      if (statusMap[stat._id]) {
        statusMap[stat._id].count = stat.count;
      }
    });

    return Object.entries(statusMap).map(([status, data]) => ({
      status,
      ...data
    }));
  };

  const getTypeStats = () => {
    if (!stats?.typeStats) return [];
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-gray-500'
    ];

    return stats.typeStats.map((stat, index) => ({
      type: stat._id,
      count: stat.count,
      color: colors[index % colors.length]
    }));
  };

  const getMonthlyStats = () => {
    if (!stats?.monthlyStats) return [];
    
    return stats.monthlyStats.map(stat => ({
      month: `${stat._id.month}/${stat._id.year}`,
      count: stat.count
    }));
  };

  const calculateSuccessRate = () => {
    if (!stats?.statusStats) return 0;
    
    const statusCounts = stats.statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const successful = (statusCounts.delivered || 0) + (statusCounts.read || 0);
    
    return total > 0 ? Math.round((successful / total) * 100) : 0;
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'bg-primary-500' }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, total, color = 'bg-primary-500' }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-500">{value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={tCommon('loading')} />
      </div>
    );
  }

  const statusStats = getStatusStats();
  const typeStats = getTypeStats();
  const monthlyStats = getMonthlyStats();
  const successRate = calculateSuccessRate();
  const totalAnalyses = stats?.totalAnalyses || 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {tAnalytics('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tAnalytics('description')}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => fetchStats()}
            className="btn-outline"
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={tAnalytics('totalAnalyses')}
          value={totalAnalyses}
          icon={BarChart3Icon}
          color="bg-primary-500"
        />
        <StatCard
          title={tAnalytics('successRate')}
          value={`${successRate}%`}
          subtitle={tAnalytics('successRateDescription')}
          icon={TrendingUpIcon}
          color="bg-green-500"
        />
        <StatCard
          title={tAnalytics('pending')}
          value={statusStats.find(s => s.status === 'pending')?.count || 0}
          subtitle={tAnalytics('pendingDescription')}
          icon={CalendarIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title={tAnalytics('failed')}
          value={statusStats.find(s => s.status === 'failed')?.count || 0}
          subtitle={tAnalytics('failedDescription')}
          icon={RefreshCwIcon}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {tAnalytics('statusDistribution')}
            </h2>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {statusStats.map((stat) => (
              <ProgressBar
                key={stat.status}
                label={stat.label}
                value={stat.count}
                total={totalAnalyses}
                color={stat.color}
              />
            ))}
          </div>
        </div>

        {/* Répartition par type d'analyse */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {tAnalytics('typeDistribution')}
            </h2>
            <BarChart3Icon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {typeStats.slice(0, 5).map((stat) => (
              <ProgressBar
                key={stat.type}
                label={stat.type}
                value={stat.count}
                total={totalAnalyses}
                color={stat.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Évolution mensuelle */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {tAnalytics('monthlyEvolution')}
          </h2>
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {monthlyStats.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">
                    {stat.month}
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mt-1">
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Pas encore de données
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Les statistiques mensuelles apparaîtront ici
            </p>
          </div>
        )}
      </div>

      {/* Détails additionnels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performances WhatsApp */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performances WhatsApp
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Messages envoyés</span>
              <span className="text-sm font-medium">
                {(statusStats.find(s => s.status === 'sent')?.count || 0) +
                 (statusStats.find(s => s.status === 'delivered')?.count || 0) +
                 (statusStats.find(s => s.status === 'read')?.count || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Messages livrés</span>
              <span className="text-sm font-medium">
                {(statusStats.find(s => s.status === 'delivered')?.count || 0) +
                 (statusStats.find(s => s.status === 'read')?.count || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Messages lus</span>
              <span className="text-sm font-medium">
                {statusStats.find(s => s.status === 'read')?.count || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Échecs</span>
              <span className="text-sm font-medium text-red-600">
                {statusStats.find(s => s.status === 'failed')?.count || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Tendances */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tendances
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taux de livraison</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-600">
                  {successRate}%
                </span>
                <TrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moyenne mensuelle</span>
              <span className="text-sm font-medium">
                {monthlyStats.length > 0 
                  ? Math.round(monthlyStats.reduce((sum, stat) => sum + stat.count, 0) / monthlyStats.length)
                  : 0
                }
              </span>
            </div>
          </div>
        </div>

        {/* Actions recommandées */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Actions recommandées
          </h3>
          <div className="space-y-3">
            {statusStats.find(s => s.status === 'pending')?.count > 0 && (
              <div className="text-sm text-yellow-600">
                • {statusStats.find(s => s.status === 'pending').count} analyses en attente d'envoi
              </div>
            )}
            {statusStats.find(s => s.status === 'failed')?.count > 0 && (
              <div className="text-sm text-red-600">
                • {statusStats.find(s => s.status === 'failed').count} analyses à renvoyer
              </div>
            )}
            {successRate < 90 && (
              <div className="text-sm text-orange-600">
                • Taux de réussite à améliorer ({successRate}%)
              </div>
            )}
            {successRate >= 95 && (
              <div className="text-sm text-green-600">
                • Excellent taux de réussite ! ({successRate}%)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;