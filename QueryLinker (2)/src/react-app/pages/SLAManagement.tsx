import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Edit3, 
  Trash2,
  Play,
  Pause,
  BarChart3,
  X,
  Save
} from 'lucide-react';
import MetricCard from '@/react-app/components/MetricCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useSLAConfigs, createSLAConfig, deleteSLAConfig, toggleSLAConfig, useMutation } from '@/react-app/hooks/useApi';



const complianceData = [
  { name: 'Met', value: 85, color: '#10B981' },
  { name: 'Missed', value: 15, color: '#EF4444' }
];

const performanceData = [
  { priority: 'Critical', target: 98, actual: 98.5 },
  { priority: 'High', target: 95, actual: 95.2 },
  { priority: 'Medium', target: 90, actual: 91.8 },
  { priority: 'Low', target: 85, actual: 87.3 }
];

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

export default function SLAManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    response_time: 60,
    resolution_time: 480,
    escalation_rules: {}
  });

  const { data: slaConfigs, loading, refetch } = useSLAConfigs();
  const { mutate: createSLA, loading: creating } = useMutation(createSLAConfig);
  const { mutate: deleteSLA, loading: deleting } = useMutation(deleteSLAConfig);
  const { mutate: toggleSLA } = useMutation(toggleSLAConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let success = false;
    if (editingSLA) {
      const response = await fetch(`/api/sla-configs/${editingSLA.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      success = response.ok;
    } else {
      const result = await createSLA(formData);
      success = !!result;
    }

    if (success) {
      setShowAddModal(false);
      setEditingSLA(null);
      setFormData({ name: '', priority: 'medium', response_time: 60, resolution_time: 480, escalation_rules: {} });
      await refetch();
    }
  };

  const handleEdit = (sla: any) => {
    setEditingSLA(sla);
    setFormData({
      name: sla.name,
      priority: sla.priority,
      response_time: sla.response_time,
      resolution_time: sla.resolution_time,
      escalation_rules: typeof sla.escalation_rules === 'string' ? JSON.parse(sla.escalation_rules || '{}') : sla.escalation_rules || {}
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this SLA configuration?')) {
      const result = await deleteSLA(id);
      if (result) {
        await refetch();
      }
    }
  };

  const handleToggle = async (id: number) => {
    const result = await toggleSLA(id);
    if (result) {
      await refetch();
    }
  };

  // Mock data for display - in real app this would come from API
  const totalCompliance = 94.2;
  const totalTickets = 127;
  const criticalTickets = 3;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">SLA Management</h1>
          <p className="text-gray-300">Monitor and manage service level agreements across all systems</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New SLA</span>
        </motion.button>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <MetricCard
          title="Overall Compliance"
          value={`${totalCompliance.toFixed(1)}%`}
          change="+2.3% from last month"
          changeType="positive"
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Active Tickets"
          value={totalTickets.toString()}
          change="12 resolved today"
          changeType="positive"
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Critical Issues"
          value={criticalTickets.toString()}
          change="1 escalated"
          changeType="negative"
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title="Performance Trend"
          value="+5.2%"
          change="Improvement this week"
          changeType="positive"
          icon={TrendingUp}
          color="purple"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Compliance Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>SLA Compliance Overview</span>
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
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
          <div className="flex justify-center space-x-6 mt-4">
            {complianceData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Comparison */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Target vs Actual Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="priority" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="target" fill="#6B7280" name="Target" />
              <Bar dataKey="actual" fill="#8B5CF6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* SLA Configurations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">SLA Configurations</h3>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Loading SLA configurations...</p>
            </div>
          ) : (slaConfigs || []).map((sla, index) => (
            <motion.div
              key={sla.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(sla.priority)}`}>
                    {sla.priority.charAt(0).toUpperCase() + sla.priority.slice(1)}
                  </span>
                  <h4 className="text-lg font-semibold text-white">{sla.name}</h4>
                  <div className="flex items-center space-x-2">
                    {sla.is_active ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">Inactive</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleToggle(sla.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {sla.is_active ? <Pause className="w-4 h-4 text-gray-400" /> : <Play className="w-4 h-4 text-green-400" />}
                  </button>
                  <button 
                    onClick={() => handleEdit(sla)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                  <button 
                    onClick={() => handleDelete(sla.id)}
                    disabled={deleting}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Response Target</p>
                  <p className="text-white font-medium">{formatTime(sla.response_time)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Resolution Target</p>
                  <p className="text-white font-medium">{formatTime(sla.resolution_time)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Priority</p>
                  <p className="text-white font-medium">{sla.priority}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Created</p>
                  <p className="text-white font-medium">{new Date(sla.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-medium ${sla.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                    {sla.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      sla.is_active ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                    style={{ width: sla.is_active ? '100%' : '20%' }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit SLA Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {editingSLA ? 'Edit SLA Configuration' : 'Create New SLA'}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="e.g., Critical Issues"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="low" className="bg-gray-800">Low</option>
                      <option value="medium" className="bg-gray-800">Medium</option>
                      <option value="high" className="bg-gray-800">High</option>
                      <option value="critical" className="bg-gray-800">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Response Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.response_time}
                      onChange={(e) => setFormData({ ...formData, response_time: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Resolution Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.resolution_time}
                      onChange={(e) => setFormData({ ...formData, resolution_time: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={creating}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                    >
                      {creating && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                      <Save className="w-4 h-4" />
                      <span>{editingSLA ? 'Update' : 'Create'} SLA</span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
