import Link from 'next/link';
import { isLocalDevelopment } from '@lightningflow/shared-config';
import { Bot, ArrowLeft, Plus, Settings, Trash2, Play, Pause } from 'lucide-react';

export default function AgentsPage() {
  const isLocal = isLocalDevelopment();

  // Mock agents data - in real app, fetch from agent-factory or database
  const agents = [
    {
      id: '1',
      name: 'Content Creator Agent',
      type: 'content',
      status: 'active',
      description: 'Generates blog posts, social media content, and marketing materials',
      lastUsed: '2024-01-15',
      tasksCompleted: 42
    },
    {
      id: '2',
      name: 'Research Assistant',
      type: 'research',
      status: 'active',
      description: 'Conducts research and summarizes findings',
      lastUsed: '2024-01-14',
      tasksCompleted: 28
    },
    {
      id: '3',
      name: 'SaaS Scaffold Generator',
      type: 'scaffold',
      status: 'inactive',
      description: 'Generates boilerplate code for SaaS applications',
      lastUsed: '2024-01-10',
      tasksCompleted: 15
    },
    {
      id: '4',
      name: 'Support Agent',
      type: 'support',
      status: 'active',
      description: 'Handles customer support inquiries',
      lastUsed: '2024-01-15',
      tasksCompleted: 67
    }
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      content: 'text-yellow-400 bg-yellow-400/20',
      research: 'text-blue-400 bg-blue-400/20',
      scaffold: 'text-purple-400 bg-purple-400/20',
      support: 'text-green-400 bg-green-400/20',
    };
    return colors[type] || 'text-gray-400 bg-gray-400/20';
  };

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
                <Bot className="h-8 w-8 mr-3 text-green-400" />
                AI Agent Presets
              </h1>
              <p className="text-gray-400">
                Manage your AI agent configurations and templates
              </p>
            </div>
            <Link
              href="/agents/create"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">{agents.length}</div>
            <div className="text-gray-400 mt-1">Total Agents</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-gray-400 mt-1">Active</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400">
              {agents.reduce((sum, a) => sum + a.tasksCompleted, 0)}
            </div>
            <div className="text-gray-400 mt-1">Tasks Completed</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400">
              {agents.filter(a => new Date(a.lastUsed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-gray-400 mt-1">Used This Week</div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold mr-2">{agent.name}</h3>
                    {agent.status === 'active' ? (
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
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 ${getTypeColor(agent.type)}`}>
                    {agent.type}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{agent.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{agent.tasksCompleted} tasks</span>
                <span>Last used: {agent.lastUsed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/agents/${agent.id}`}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-center"
                >
                  Configure
                </Link>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
            <p className="text-gray-400 mb-6">Create your first AI agent to get started</p>
            <Link
              href="/agents/create"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

