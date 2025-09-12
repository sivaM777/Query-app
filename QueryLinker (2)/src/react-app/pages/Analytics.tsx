import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download,
  Filter,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import MetricCard from '@/react-app/components/MetricCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { useAnalyticsOverview, exportAnalytics, useMutation } from '@/react-app/hooks/useApi';

const ticketTrendData = [
  { date: '2024-01-01', created: 45, resolved: 38, pending: 12 },
  { date: '2024-01-02', created: 52, resolved: 47, pending: 15 },
  { date: '2024-01-03', created: 38, resolved: 51, pending: 8 },
  { date: '2024-01-04', created: 61, resolved: 43, pending: 18 },
  { date: '2024-01-05', created: 47, resolved: 55, pending: 10 },
  { date: '2024-01-06', created: 58, resolved: 52, pending: 14 },
  { date: '2024-01-07', created: 43, resolved: 49, pending: 9 }
];

const resolutionTimeData = [
  { system: 'Jira', avgTime: 4.2, target: 6.0 },
  { system: 'ServiceNow', avgTime: 3.8, target: 5.0 },
  { system: 'GitHub', avgTime: 2.1, target: 4.0 },
  { system: 'Zendesk', avgTime: 5.5, target: 6.0 },
  { system: 'Slack', avgTime: 1.2, target: 2.0 }
];

const priorityDistribution = [
  { name: 'Critical', value: 8, color: '#EF4444' },
  { name: 'High', value: 24, color: '#F59E0B' },
  { name: 'Medium', value: 45, color: '#10B981' },
  { name: 'Low', value: 23, color: '#6B7280' }
];

const systemPerformance = [
  { date: '2024-01-01', jira: 98.2, confluence: 99.1, github: 97.8, servicenow: 98.9 },
  { date: '2024-01-02', jira: 97.9, confluence: 98.8, github: 98.2, servicenow: 99.2 },
  { date: '2024-01-03', jira: 98.5, confluence: 99.3, github: 97.5, servicenow: 98.7 },
  { date: '2024-01-04', jira: 98.1, confluence: 98.9, github: 98.0, servicenow: 99.1 },
  { date: '2024-01-05', jira: 98.8, confluence: 99.2, github: 98.3, servicenow: 98.8 },
  { date: '2024-01-06', jira: 98.3, confluence: 99.0, github: 97.9, servicenow: 99.3 },
  { date: '2024-01-07', jira: 98.6, confluence: 99.1, github: 98.1, servicenow: 99.0 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('tickets');
  
  const { data: analyticsData } = useAnalyticsOverview(timeRange);
  const { mutate: exportData, loading: exporting } = useMutation(exportAnalytics);

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    await exportData(format);
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const metrics = [
    { value: 'tickets', label: 'Ticket Analytics', icon: Activity },
    { value: 'sla', label: 'SLA Performance', icon: Clock },
    { value: 'systems', label: 'System Health', icon: BarChart3 },
    { value: 'users', label: 'User Activity', icon: Users }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-300">Comprehensive insights and performance metrics across all systems</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value} className="bg-gray-800">
                {range.label}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {exporting && <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>}
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {exporting && <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>}
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Metric Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2"
      >
        <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
        {metrics.map((metric) => (
          <button
            key={metric.value}
            onClick={() => setSelectedMetric(metric.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
              selectedMetric === metric.value
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <metric.icon className="w-4 h-4" />
            <span>{metric.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <MetricCard
          title="Knowledge Base Articles"
          value={analyticsData?.knowledgeBaseArticles?.toString() || "0"}
          change="+3 new this week"
          changeType="positive"
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Active Integrations"
          value={analyticsData?.activeIntegrations?.toString() || "0"}
          change="All systems operational"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Active SLAs"
          value={analyticsData?.activeSLAs?.toString() || "0"}
          change="94.2% compliance rate"
          changeType="positive"
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Total Searches"
          value={analyticsData?.totalSearches?.toString() || "0"}
          change={`Last ${timeRange}`}
          changeType="neutral"
          icon={AlertTriangle}
          color="orange"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ticket Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Ticket Volume Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketTrendData}>
              <defs>
                <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="created" stroke="#EF4444" fillOpacity={1} fill="url(#created)" name="Created" />
              <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#resolved)" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Ticket Priority Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {priorityDistribution.map((entry, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution Time by System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Resolution Time by System</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionTimeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="system" type="category" stroke="#9CA3AF" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="target" fill="#6B7280" name="Target (hours)" />
              <Bar dataKey="avgTime" fill="#8B5CF6" name="Actual (hours)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* System Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">System Uptime Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis stroke="#9CA3AF" domain={[95, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="jira" stroke="#3B82F6" strokeWidth={2} name="Jira" />
              <Line type="monotone" dataKey="confluence" stroke="#10B981" strokeWidth={2} name="Confluence" />
              <Line type="monotone" dataKey="github" stroke="#8B5CF6" strokeWidth={2} name="GitHub" />
              <Line type="monotone" dataKey="servicenow" stroke="#F59E0B" strokeWidth={2} name="ServiceNow" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
