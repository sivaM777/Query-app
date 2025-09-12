import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Database
} from 'lucide-react';
import MetricCard from '@/react-app/components/MetricCard';
import { useAnalyticsOverview, refreshDashboard, useMutation } from '@/react-app/hooks/useApi';

const ticketData = [
  { name: 'Mon', open: 12, resolved: 18, pending: 5 },
  { name: 'Tue', open: 19, resolved: 15, pending: 8 },
  { name: 'Wed', open: 3, resolved: 22, pending: 3 },
  { name: 'Thu', open: 5, resolved: 16, pending: 7 },
  { name: 'Fri', open: 15, resolved: 20, pending: 4 },
  { name: 'Sat', open: 8, resolved: 12, pending: 2 },
  { name: 'Sun', open: 6, resolved: 10, pending: 1 },
];

const slaData = [
  { name: 'Met', value: 85, color: '#10B981' },
  { name: 'Missed', value: 15, color: '#EF4444' },
];

const systemData = [
  { name: 'Jira', status: 'healthy', uptime: '99.9%' },
  { name: 'Confluence', status: 'healthy', uptime: '99.8%' },
  { name: 'GitHub', status: 'warning', uptime: '98.5%' },
  { name: 'ServiceNow', status: 'healthy', uptime: '99.7%' },
  { name: 'Slack', status: 'healthy', uptime: '99.9%' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { data: analyticsData, refetch } = useAnalyticsOverview('7d');
  const { mutate: refreshData, loading: refreshLoading } = useMutation(refreshDashboard);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshData = async () => {
    const result = await refreshData({});
    if (result) {
      await refetch();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Create Ticket':
        // Navigate to ticket creation or show modal
        window.open('https://your-ticketing-system.com/create', '_blank');
        break;
      case 'Add KB Article':
        navigate('/knowledge');
        break;
      case 'Run Analytics':
        navigate('/analytics');
        break;
      case 'Manage SLAs':
        navigate('/sla');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white/10 rounded-2xl"></div>
            <div className="h-80 bg-white/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Welcome back! Here's what's happening with your IT services.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefreshData}
          disabled={refreshLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {refreshLoading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
          <span>{refreshLoading ? 'Refreshing...' : 'Refresh Data'}</span>
        </motion.button>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Knowledge Base Articles"
          value={analyticsData?.knowledgeBaseArticles?.toString() || "0"}
          change="+3 new this week"
          changeType="positive"
          icon={Database}
          color="purple"
        />
        <MetricCard
          title="Active Integrations"
          value={analyticsData?.activeIntegrations?.toString() || "0"}
          change="All systems operational"
          changeType="positive"
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Active SLAs"
          value={analyticsData?.activeSLAs?.toString() || "0"}
          change="94.2% compliance rate"
          changeType="positive"
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Total Searches"
          value={analyticsData?.totalSearches?.toString() || "0"}
          change="Last 7 days"
          changeType="neutral"
          icon={TrendingUp}
          color="orange"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Ticket Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="open" fill="#EF4444" name="Open" />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* SLA Compliance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">SLA Compliance</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={slaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {slaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {systemData.map((system, index) => (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-black/20 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{system.name}</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    system.status === 'healthy'
                      ? 'bg-green-400'
                      : system.status === 'warning'
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                ></div>
              </div>
              <p className="text-gray-300 text-sm">Uptime: {system.uptime}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Create Ticket', icon: Activity, color: 'purple' },
            { name: 'Add KB Article', icon: Database, color: 'blue' },
            { name: 'Run Analytics', icon: TrendingUp, color: 'green' },
            { name: 'Manage SLAs', icon: Zap, color: 'orange' },
          ].map((action) => (
            <motion.button
              key={action.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action.name)}
              className={`p-4 rounded-xl bg-gradient-to-r ${
                action.color === 'purple'
                  ? 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
                  : action.color === 'blue'
                  ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
                  : action.color === 'green'
                  ? 'from-green-500/20 to-green-600/20 border-green-500/30'
                  : 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
              } border hover:shadow-lg transition-all duration-200 text-left cursor-pointer`}
            >
              <action.icon className={`w-6 h-6 mb-2 ${
                action.color === 'purple'
                  ? 'text-purple-400'
                  : action.color === 'blue'
                  ? 'text-blue-400'
                  : action.color === 'green'
                  ? 'text-green-400'
                  : 'text-orange-400'
              }`} />
              <p className="text-white font-medium text-sm">{action.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
