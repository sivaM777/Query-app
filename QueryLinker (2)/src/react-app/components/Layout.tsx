import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Database,
  Settings,
  BarChart3,
  BookOpen,
  Zap,
  Menu,
  X,
  Bell,
  User,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog,
  Shield,
  Activity,
  HelpCircle,
  Folder,
  ChevronDown
} from 'lucide-react';
import { useIntegrations } from '@/react-app/hooks/useApi';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'AI Search', href: '/search', icon: Search },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { name: 'System Integrations', href: '/integrations', icon: Database },
  { name: 'SLA Management', href: '/sla', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { data: integrations } = useIntegrations();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </div>
        )}

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: sidebarCollapsed ? 80 : 280,
            x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -280
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto bg-black/20 backdrop-blur-xl border-r border-white/10"
        >
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">QueryLinker</span>
                </motion.div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-white" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Connected Workspaces */}
            {!sidebarCollapsed && location.pathname === '/integrations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border-t border-white/10"
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  CONNECTED WORKSPACES ({(integrations || []).filter(integration => integration.is_active).length})
                </h3>
                <div className="space-y-2">
                  {(integrations || []).filter(integration => integration.is_active).map((integration) => (
                    <div key={integration.id} className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        integration.type === 'jira' ? 'bg-blue-500' :
                        integration.type === 'github' ? 'bg-gray-800' :
                        integration.type === 'servicenow' ? 'bg-green-500' :
                        integration.type === 'zendesk' ? 'bg-orange-500' :
                        integration.type === 'confluence' ? 'bg-blue-600' :
                        'bg-purple-500'
                      }`}>
                        {integration.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{integration.name}</span>
                    </div>
                  ))}
                  {(!integrations || integrations.filter(integration => integration.is_active).length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No active integrations</p>
                      <p className="text-gray-600 text-xs mt-1">Connect systems to see workspaces here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navbar */}
          <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </button>

                {/* Global search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search across all systems..."
                    className="w-64 lg:w-96 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-white" />
                  ) : (
                    <Moon className="w-5 h-5 text-white" />
                  )}
                </button>

                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                  <Bell className="w-5 h-5 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>

                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>
                  
                  <AnimatePresence>
                    {showProfileMenu && (
                      <React.Fragment>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                          onClick={() => setShowProfileMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="fixed right-4 top-16 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-[9999]"
                        >
                          <div className="px-4 py-3 border-b border-white/10">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">System Administrator</p>
                                <p className="text-gray-400 text-sm">admin@company.com</p>
                              </div>
                            </div>
                          </div>
                          <div className="py-2">
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                              <UserCog className="w-4 h-4" />
                              <span>Account Settings</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                              <Shield className="w-4 h-4" />
                              <span>Security & Permissions</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                              <Activity className="w-4 h-4" />
                              <span>Activity Log</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                              <Folder className="w-4 h-4" />
                              <span>Manage Workspaces</span>
                            </button>
                            <div className="border-t border-white/10 my-2"></div>
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                              <HelpCircle className="w-4 h-4" />
                              <span>Help & Documentation</span>
                            </button>
                            <div className="border-t border-white/10 my-2"></div>
                            <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
