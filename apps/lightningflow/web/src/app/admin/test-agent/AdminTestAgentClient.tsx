'use client';
import { apiPath } from '@/lib/base-path';

import { useState } from 'react';

interface TestResult {
  status: string;
  error?: string;
  data?: any;
}

export default function AdminTestAgentClient() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiPath('/api/agents/test-agent'));
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🧪 AI Agent Testing</h1>
        <p className="text-gray-600">Test and validate AI agent functionality</p>
        <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
          ✅ Admin Authenticated - Agent Testing Enabled
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Agent Connectivity Test</h3>
        <button 
          onClick={runTest} 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? '🔄 Testing...' : '🚀 Run Test'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Agent Status</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <span>RAG Agent Endpoint: /api/agents/explain-dashboard-agent</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <span>Dashboard Assistant UI: /dashboard/ai-assistant</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <span>Admin Testing Interface: /admin/ai-assistant</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            <span>C-Suite AI Registry: 16 specialized agents active</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-purple-800 mb-2">🧠 C-Suite AI Agent Registry</h3>
        <div className="text-sm text-purple-700 space-y-1">
          <p>• CTO: InfraScout, RuntimeGuardian (infrastructure monitoring)</p>
          <p>• CPO: FlowMapper, AgentTrainer (product optimization)</p>
          <p>• CRO: RealityChecker, PlanAligner (reality validation)</p>
          <p>• CMO: CampaignSeeder, MarketSniper (marketing optimization)</p>
          <p>• CFO: ForecastEngine, FeeAuditor (financial analysis)</p>
          <p>• CNO: NodeHealthBot, ChannelLogic (Lightning Network management)</p>
          <p>• CCO: RLSEnforcer, AuditTrailBot (compliance and security)</p>
          <p>• CIO: RAGDebugger, LearningVector (AI system optimization)</p>
        </div>
      </div>
    </div>
  );
} 