import Link from 'next/link';
import { isLocalDevelopment } from '@lightningflow/shared-config';
import { ArrowLeft, Bot, ExternalLink, AlertCircle } from 'lucide-react';

export default function LocalAIPage() {
  const isLocal = isLocalDevelopment();

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
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Bot className="h-8 w-8 mr-3 text-blue-400" />
              Local AI Services
            </h1>
            <p className="text-gray-400">
              Access your local AI tools and LLM interfaces
            </p>
          </div>
        </div>

        {isLocal ? (
          <>
            {/* Chat Interface */}
            <div className="mb-8">
              <Link
                href="/chat"
                className="block bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">💬</div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  Chat with Local LLM
                </h3>
                <p className="text-gray-400 mb-4">
                  Direct chat interface connecting to your local Ollama instance. Built into Scorpion.
                </p>
                <div className="flex items-center text-sm text-blue-400">
                  <span>Click to start chatting →</span>
                </div>
              </Link>
            </div>

            {/* Document Chat & RAG */}
            <div className="mb-8">
              <Link
                href="/ai/docs"
                className="block bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">📚</div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  Document Chat & RAG
                </h3>
                <p className="text-gray-400 mb-4">
                  Upload documents and chat with them using AI. Retrieval Augmented Generation built into Scorpion.
                </p>
                <div className="flex items-center text-sm text-purple-400">
                  <span>Click to start →</span>
                </div>
              </Link>
            </div>

            {/* Setup Instructions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">Getting Started:</h3>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Make sure Ollama is running: <code className="bg-gray-700 px-2 py-1 rounded">ollama serve</code></li>
                    <li>Access chat at <code className="bg-gray-700 px-2 py-1 rounded">http://scorpion.local/chat</code> or <code className="bg-gray-700 px-2 py-1 rounded">http://localhost:3003/chat</code></li>
                    <li>Access document chat at <code className="bg-gray-700 px-2 py-1 rounded">http://scorpion.local/ai/docs</code> or <code className="bg-gray-700 px-2 py-1 rounded">http://localhost:3003/ai/docs</code></li>
                    <li>Upload documents and start chatting with your local LLM</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Not Running Locally */
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Local Services Not Available</h3>
                <p className="text-gray-300 mb-4">
                  Local AI services are only available when running Scorpion locally. These services require Docker containers
                  that run on your local machine.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">To access local AI services:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 ml-2">
                    <li>Run Scorpion locally: <code className="bg-gray-700 px-2 py-1 rounded">pnpm --filter scorpion run dev</code></li>
                    <li>Start Docker services: <code className="bg-gray-700 px-2 py-1 rounded">./scripts/start-local-services.sh</code></li>
                    <li>Access services at their <code className="bg-gray-700 px-2 py-1 rounded">.local</code> domains</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

