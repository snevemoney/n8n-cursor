'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalBots: number;
  activeUsers: number;
  totalInvoices: number;
  totalApiCalls: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 42,
    totalBots: 8,
    activeUsers: 15,
    totalInvoices: 127,
    totalApiCalls: 1543,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    {
      title: 'System Map',
      description: 'Visualize system architecture',
      href: '/admin/system-map',
      icon: '🗺️',
      color: 'bg-indigo-500'
    },
    {
      title: 'Run Bot Tests',
      description: 'Start a quick bot simulation',
      href: '/admin/bots',
      icon: '🤖',
      color: 'bg-blue-500'
    },
    {
      title: 'View Users',
      description: 'Manage platform users',
      href: '/admin/users',
      icon: '👥',
      color: 'bg-green-500'
    },
    {
      title: 'AI Assistant',
      description: 'Access AI management tools',
      href: '/admin/ai-assistant',
      icon: '🧠',
      color: 'bg-purple-500'
    },
    {
      title: 'Lightning Status',
      description: 'Monitor LN node health',
      href: '/admin/lightning',
      icon: '⚡',
      color: 'bg-yellow-500'
    },
    {
      title: 'Analytics',
      description: 'View platform analytics',
      href: '/admin/analytics',
      icon: '📊',
      color: 'bg-pink-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚡ Lightning AI Platform</h1>
        <p className="text-gray-600">C-Suite AI Management & System Control Center</p>
        <div className="mt-2 flex gap-2">
          <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            ✅ Admin Authenticated
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            🧠 16 AI Agents Active
          </div>
          <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
            🔍 System Monitoring Live
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Agents</p>
              <p className="text-2xl font-bold text-gray-900">16</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${
              stats.systemHealth === 'healthy' ? 'bg-green-100' :
              stats.systemHealth === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className="text-2xl">
                {stats.systemHealth === 'healthy' ? '🟢' :
                 stats.systemHealth === 'warning' ? '🟡' : '🔴'}
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {stats.systemHealth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Command Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-gray-200 hover:border-blue-500"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${action.color} text-white`}>
                  <span className="text-xl">{action.icon}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* C-Suite AI Agents Status */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🧠 C-Suite AI Agents</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">CTO</div>
              <div className="text-sm text-blue-600">InfraScout, RuntimeGuardian</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">CPO</div>
              <div className="text-sm text-green-600">FlowMapper, AgentTrainer</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-700">CRO</div>
              <div className="text-sm text-purple-600">RealityChecker, PlanAligner</div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-lg font-bold text-pink-700">CMO</div>
              <div className="text-sm text-pink-600">CampaignSeeder, MarketSniper</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-700">CFO</div>
              <div className="text-sm text-yellow-600">ForecastEngine, FeeAuditor</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-700">CNO</div>
              <div className="text-sm text-orange-600">NodeHealthBot, ChannelLogic</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-700">CCO</div>
              <div className="text-sm text-red-600">RLSEnforcer, AuditTrailBot</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-bold text-indigo-700">CIO</div>
              <div className="text-sm text-indigo-600">RAGDebugger, LearningVector</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Recent Activity</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-l-4 border-green-400 pl-4">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  <span className="text-sm text-gray-900">System audit completed - 12 critical issues found</span>
                </div>
                <span className="text-xs text-gray-500">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-l-4 border-blue-400 pl-4">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-3">🧠</span>
                  <span className="text-sm text-gray-900">RealityChecker agent flagged admin auth gaps</span>
                </div>
                <span className="text-xs text-gray-500">5 minutes ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-l-4 border-purple-400 pl-4">
                <div className="flex items-center">
                  <span className="text-purple-500 mr-3">🤖</span>
                  <span className="text-sm text-gray-900">CCO agents monitoring security compliance</span>
                </div>
                <span className="text-xs text-gray-500">10 minutes ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-l-4 border-yellow-400 pl-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-3">⚡</span>
                  <span className="text-sm text-gray-900">Lightning node health monitoring active</span>
                </div>
                <span className="text-xs text-gray-500">15 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 