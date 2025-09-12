import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, RefreshCw, ExternalLink, CheckCircle2, AlertCircle, X, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import MetricCard from '@/react-app/components/MetricCard';
import { useIntegrations, createIntegration, deleteIntegration, syncIntegration, useMutation } from '@/react-app/hooks/useApi';

const systemOptions = [
  { id: 'jira', name: 'Jira', icon: '🔴', description: 'Issue tracking and project management' },
  { id: 'confluence', name: 'Confluence', icon: '🇮🇳', description: 'Team collaboration and knowledge management' },
  { id: 'github', name: 'GitHub', icon: '🐙', description: 'Version control and code collaboration' },
  { id: 'servicenow-kb', name: 'ServiceNow KB', icon: '☁️', description: 'Knowledge base management' },
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Team communication platform' },
  { id: 'google-meet', name: 'Google Meet', icon: '📹', description: 'Video conferencing and meetings' },
  { id: 'servicenow-itsm', name: 'ServiceNow ITSM', icon: '🛠️', description: 'IT service management platform' },
  { id: 'zendesk', name: 'Zendesk', icon: '🎫', description: 'Customer service and support' },
  { id: 'linear', name: 'Linear', icon: '📐', description: 'Issue tracking for software teams' },
  { id: 'notion', name: 'Notion', icon: '📋', description: 'All-in-one workspace for notes and docs' },
  { id: 'custom-api', name: 'Custom API', icon: '🔗', description: 'Connect any custom API endpoint' }
];

const integrationGuides = [
  {
    title: 'Jira Integration',
    description: 'Connect your Jira instance to import tickets and issues',
    steps: [
      'Generate API token',
      'Configure OAuth',
      'Test connection'
    ],
    icon: '🔗',
    color: 'blue',
    status: 'available'
  },
  {
    title: 'Confluence Setup',
    description: 'Sync knowledge base articles and documentation',
    steps: [
      'Enable API access',
      'Set permissions',
      'Configure sync'
    ],
    icon: '📚',
    color: 'green',
    status: 'available'
  },
  {
    title: 'GitHub Integration',
    description: 'Import repository issues and pull requests',
    steps: [
      'Install GitHub App',
      'Grant permissions',
      'Select repositories'
    ],
    icon: '🐙',
    color: 'purple',
    status: 'available'
  },
  {
    title: 'ServiceNow',
    description: 'Connect to ServiceNow for ticket management',
    steps: [
      'Setup API credentials',
      'Configure endpoint',
      'Map fields'
    ],
    icon: '⚙️',
    color: 'orange',
    status: 'coming-soon'
  },
  {
    title: 'Slack Integration',
    description: 'Enable Slack notifications and commands',
    steps: [
      'Create Slack app',
      'Install to workspace',
      'Configure webhooks'
    ],
    icon: '💬',
    color: 'green',
    status: 'available'
  },
  {
    title: 'Zendesk',
    description: 'Sync support tickets and customer data',
    steps: [
      'Generate API key',
      'Setup webhooks',
      'Configure mapping'
    ],
    icon: '🎫',
    color: 'red',
    status: 'coming-soon'
  }
];

export default function SystemIntegrations() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [configData, setConfigData] = useState({
    apiKey: '',
    endpoint: '',
    username: '',
    password: ''
  });

  const { data: integrations, loading, refetch } = useIntegrations();
  const { mutate: createNewIntegration, loading: creating } = useMutation(createIntegration);
  const { mutate: deleteExistingIntegration, loading: deleting } = useMutation(deleteIntegration);
  const { mutate: syncExistingIntegration, loading: syncing } = useMutation(syncIntegration);

  const handleAddSystem = async () => {
    if (selectedSystem) {
      const selectedSystemData = systemOptions.find(opt => opt.id === selectedSystem);
      if (selectedSystemData) {
        const result = await createNewIntegration({
          name: selectedSystemData.name,
          type: selectedSystem,
          config: configData
        });

        if (result) {
          setShowAddModal(false);
          setSelectedSystem('');
          setConfigData({ apiKey: '', endpoint: '', username: '', password: '' });
          setShowSuccessNotification(true);
          setTimeout(() => setShowSuccessNotification(false), 5000);
          await refetch();
        }
      }
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      const result = await deleteExistingIntegration(id);
      if (result) {
        await refetch();
      }
    }
  };

  const handleSyncIntegration = async (id: number) => {
    const result = await syncExistingIntegration(id);
    if (result) {
      await refetch();
    }
  };

  const getSystemIcon = (type: string) => {
    const systemData = systemOptions.find(opt => opt.id === type);
    return systemData?.icon || '🔗';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
            ))}
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
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add System</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">System Integrations</h1>
        <p className="text-gray-300">Connected systems and their status</p>
      </motion.div>

      {/* System Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">System Status Overview</h2>
        <p className="text-gray-400 mb-6">Real-time status and performance metrics for all connected systems</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Connected Systems"
            value={(integrations || []).filter(i => i.is_active).length.toString()}
            change="All operational"
            changeType="positive"
            icon={CheckCircle2}
            color="green"
          />
          <MetricCard
            title="Total Systems"
            value={(integrations || []).length.toString()}
            change="Active & Inactive"
            changeType="neutral"
            icon={AlertCircle}
            color="blue"
          />
          <MetricCard
            title="Sync Success Rate"
            value="98.7%"
            change="Excellent performance"
            changeType="positive"
            icon={RefreshCw}
            color="purple"
          />
          <MetricCard
            title="Avg Sync Time"
            value="2.3s"
            change="Within targets"
            changeType="positive"
            icon={RefreshCw}
            color="orange"
          />
        </div>
      </motion.div>

      {/* Connected Systems */}
      {(integrations || []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {(integrations || []).map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSystemIcon(system.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{system.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        system.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {system.is_active ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleSyncIntegration(system.id)}
                    disabled={syncing}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Sync Integration"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-400 ${syncing ? 'animate-spin' : ''}`} />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDeleteIntegration(system.id)}
                    disabled={deleting}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                {systemOptions.find(opt => opt.id === system.type)?.description || 'System integration'}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last sync:</span>
                  <span className="text-white">
                    {system.last_sync_at 
                      ? new Date(system.last_sync_at).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white capitalize">{system.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-medium ${system.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                    {system.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => window.open('#', '_blank')}
                className="w-full py-2 px-4 bg-blue-500/20 text-blue-400 rounded-xl font-medium transition-all duration-200 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Workspace</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Integration Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Integration Guide</h2>
        <p className="text-gray-400 mb-6">Quick setup instructions for popular integrations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationGuides.map((guide, index) => (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 ${
                guide.status === 'coming-soon' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{guide.icon}</div>
                {guide.status === 'coming-soon' && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{guide.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{guide.description}</p>
              
              <div className="space-y-2 mb-4">
                {guide.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center space-x-3 text-sm">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      guide.color === 'blue'
                        ? 'bg-blue-500/20 text-blue-400'
                        : guide.color === 'green'
                        ? 'bg-green-500/20 text-green-400'
                        : guide.color === 'purple'
                        ? 'bg-purple-500/20 text-purple-400'
                        : guide.color === 'orange'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stepIndex + 1}
                    </span>
                    <span className="text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
              
              <button
                disabled={guide.status === 'coming-soon'}
                className={`w-full py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  guide.status === 'coming-soon'
                    ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                    : `bg-${guide.color}-500/20 text-${guide.color}-400 hover:bg-${guide.color}-500/30 border border-${guide.color}-500/30`
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Docs</span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Add System Modal */}
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
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Add New System Integration</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                Connect a new system to expand your knowledge sources and improve suggestion coverage.
              </p>

              {/* System Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select System
                </label>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/50 rounded-xl text-white text-left flex items-center justify-between hover:border-purple-500/70 transition-colors"
                  >
                    {selectedSystem ? (
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {systemOptions.find(opt => opt.id === selectedSystem)?.icon}
                        </span>
                        <span>{systemOptions.find(opt => opt.id === selectedSystem)?.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Choose a system to integrate</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto"
                      >
                        {systemOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedSystem(option.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3 ${
                              option.id === 'servicenow-itsm' ? 'bg-white/5 border border-purple-500/30' : ''
                            }`}
                          >
                            <span className="text-lg">{option.icon}</span>
                            <div className="flex-1">
                              <div className="text-white font-medium">{option.name}</div>
                              <div className="text-gray-400 text-xs">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddSystem}
                  disabled={!selectedSystem || creating}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedSystem && !creating
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {creating && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{creating ? 'Adding...' : 'Add System'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">System Added</h4>
                <p className="text-gray-300 text-sm">New system integration added successfully</p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
