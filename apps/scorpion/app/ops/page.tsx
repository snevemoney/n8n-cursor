import Link from 'next/link';
import { isLocalDevelopment } from '@lightningflow/shared-config';
import { ArrowLeft, Settings, Server, Database, Activity, ExternalLink } from 'lucide-react';

export default function OpsPage() {
  const isLocal = isLocalDevelopment();
  const opsUrl = isLocal ? 'http://ops.lightningflow.local' : 'http://localhost:3002';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Settings className="h-8 w-8 mr-3 text-blue-400" />
                Ops Dashboard
              </h1>
              <p className="text-gray-400">
                Internal operations and system management
              </p>
            </div>
            <Link
              href={opsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              Open Full Dashboard
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Server className="h-5 w-5 text-blue-400" />
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Online</span>
            </div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-gray-400 text-sm">Services Running</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 text-purple-400" />
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Healthy</span>
            </div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Normal</span>
            </div>
            <div className="text-2xl font-bold">1.2GB</div>
            <div className="text-gray-400 text-sm">Memory Usage</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Active</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-gray-400 text-sm">Active Workflows</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">System Health</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API Server</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Redis Cache</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">n8n Instance</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`${opsUrl}/node`}
                className="block w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                View Node Health
              </Link>
              <Link
                href={`${opsUrl}/clients`}
                className="block w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                Manage Clients
              </Link>
              <Link
                href={`${opsUrl}/wallets`}
                className="block w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                View Wallets
              </Link>
              <Link
                href={`${opsUrl}/analytics`}
                className="block w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> This is a quick overview. For full operations management,{' '}
            <Link href={opsUrl} target="_blank" className="underline hover:text-blue-200">
              open the full Ops Dashboard
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

