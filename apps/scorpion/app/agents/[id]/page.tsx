import Link from 'next/link';
import { ArrowLeft, Bot, Settings, Play, Pause, Trash2, Copy } from 'lucide-react';

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // Mock agent data - in real app, fetch from API
  const agent = {
    id: params.id,
    name: 'Content Creator Agent',
    type: 'content',
    status: 'active',
    description: 'Generates blog posts, social media content, and marketing materials',
    lastUsed: '2024-01-15',
    tasksCompleted: 42,
    config: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    },
    features: ['Blog writing', 'Social media posts', 'SEO optimization']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/agents"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-4xl font-bold mr-4">{agent.name}</h1>
                {agent.status === 'active' ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-sm font-medium flex items-center">
                    <Pause className="h-3 w-3 mr-1" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-400">{agent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
              </button>
              <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{agent.tasksCompleted}</div>
            <div className="text-gray-400 text-sm mt-1">Tasks Completed</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{agent.config.model}</div>
            <div className="text-gray-400 text-sm mt-1">Model</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{agent.config.temperature}</div>
            <div className="text-gray-400 text-sm mt-1">Temperature</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{agent.lastUsed}</div>
            <div className="text-gray-400 text-sm mt-1">Last Used</div>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Model</span>
                <span className="font-medium">{agent.config.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Temperature</span>
                <span className="font-medium">{agent.config.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Tokens</span>
                <span className="font-medium">{agent.config.maxTokens}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="flex flex-wrap gap-2">
              {agent.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-700/50 rounded text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Run Agent
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
              Export Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

