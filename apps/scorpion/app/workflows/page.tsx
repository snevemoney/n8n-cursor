import Link from 'next/link';
import { isLocalDevelopment } from '@lightningflow/shared-config';
import { Workflow, ExternalLink, ArrowLeft, Play, Pause, Trash2 } from 'lucide-react';

export default async function WorkflowsPage() {
  const isLocal = isLocalDevelopment();
  const n8nUrl = isLocal ? 'http://n8n.local' : 'https://n8ncloud.tech';

  // Mock workflows data - in real app, fetch from n8n API
  const workflows = [
    {
      id: '1',
      name: 'Email Notifications',
      active: true,
      nodes: 5,
      updatedAt: '2024-01-15',
      description: 'Sends email notifications for important events'
    },
    {
      id: '2',
      name: 'Tenant Onboarding',
      active: true,
      nodes: 8,
      updatedAt: '2024-01-14',
      description: 'Automates new tenant setup process'
    },
    {
      id: '3',
      name: 'Data Processing',
      active: false,
      nodes: 12,
      updatedAt: '2024-01-10',
      description: 'Processes and transforms incoming data'
    }
  ];

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
                <Workflow className="h-8 w-8 mr-3 text-purple-400" />
                Workflow Library
              </h1>
              <p className="text-gray-400">
                Manage and browse all your n8n workflows
              </p>
            </div>
            <Link
              href={n8nUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              Open n8n
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400">{workflows.length}</div>
            <div className="text-gray-400 mt-1">Total Workflows</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">
              {workflows.filter(w => w.active).length}
            </div>
            <div className="text-gray-400 mt-1">Active</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">
              {workflows.reduce((sum, w) => sum + w.nodes, 0)}
            </div>
            <div className="text-gray-400 mt-1">Total Nodes</div>
          </div>
        </div>

        {/* Workflows List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">All Workflows</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-6 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold mr-3">{workflow.name}</h3>
                      {workflow.active ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium flex items-center">
                          <Pause className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{workflow.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{workflow.nodes} nodes</span>
                      <span>•</span>
                      <span>Updated {workflow.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`${n8nUrl}/workflow/${workflow.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                      Edit
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> This is a preview. To manage workflows, use the{' '}
            <Link href={n8nUrl} target="_blank" className="underline hover:text-blue-200">
              n8n dashboard
            </Link>
            . Workflow data is synced from your n8n instance.
          </p>
        </div>
      </div>
    </div>
  );
}

