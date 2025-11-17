import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Users, 
  Globe, 
  Newspaper, 
  Activity, 
  TrendingUp, 
  Server,
  Database,
  RefreshCw,
} from 'lucide-react';
import { adminApiClient, DashboardStats, UserGrowthData, DomainGenerationData, ActivityMetrics } from '../services/adminApiClient';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [domainGeneration, setDomainGeneration] = useState<DomainGenerationData[]>([]);
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  const loadData = async () => {
    try {
      const [statsData, userGrowthData, domainData, activityData] = await Promise.all([
        adminApiClient.getDashboardStats(),
        adminApiClient.getUserGrowth(timeRange),
        adminApiClient.getDomainGeneration(timeRange),
        adminApiClient.getActivityMetrics(24),
      ]);

      setStats(statsData);
      setUserGrowth(userGrowthData);
      setDomainGeneration(domainData);
      setActivityMetrics(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await adminApiClient.clearCache();
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor system performance and user activity</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users.total.toLocaleString()}
            subtitle={`${stats.users.active} active`}
            trend={`+${stats.users.newThisWeek} this week`}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Domains"
            value={stats.domains.total.toLocaleString()}
            subtitle={`${stats.domains.available} available`}
            trend={`+${stats.domains.generatedThisWeek} this week`}
            icon={<Globe className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="News Articles"
            value={stats.articles.total.toLocaleString()}
            subtitle={`${stats.articles.todayCount} today`}
            trend={`+${stats.articles.thisWeekCount} this week`}
            icon={<Newspaper className="w-6 h-6 text-white" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="Analytics Events"
            value={stats.analytics.totalEvents.toLocaleString()}
            subtitle={`${stats.analytics.uniqueUsers} unique users`}
            icon={<Activity className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Users" strokeWidth={2} />
                <Line type="monotone" dataKey="new" stroke="#10b981" name="New Users" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Domain Generation Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Domain Generation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainGeneration}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Total Domains" />
                <Bar dataKey="available" fill="#10b981" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Metrics and Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Metrics Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity (Last 24 Hours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="events" stroke="#8b5cf6" name="Events" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#ec4899" name="Active Users" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* News Sources Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">News Sources</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.articles.sources}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.articles.sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Info and Top Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2" />
              System Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">Database Size</span>
                </div>
                <span className="font-semibold">{stats.system.databaseSize}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-700">Redis Status</span>
                <span className={`px-3 py-1 rounded-full text-sm ${stats.system.redisConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {stats.system.redisConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-700">Server Uptime</span>
                <span className="font-semibold">{formatUptime(stats.system.uptime)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-700">Avg Domain Score</span>
                <span className="font-semibold">{stats.domains.avgScore}/100</span>
              </div>
            </div>
          </div>

          {/* Top Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Events</h2>
            <div className="space-y-3">
              {stats.analytics.topEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <span className="text-gray-700 font-medium">{event.eventType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(event.count / stats.analytics.topEvents[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold w-16 text-right">{event.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
