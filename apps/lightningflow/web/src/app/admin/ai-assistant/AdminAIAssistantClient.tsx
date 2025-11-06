'use client';

import DashboardAssistant from '@/components/dashboard/DashboardAssistant';

export default function AdminAIAssistantClient() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🤖 AI Dashboard Assistant</h1>
        <p className="text-gray-600 mt-2">
          Test the Lightning platform AI assistant with enterprise-grade AI management.
        </p>
        <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-green-800">
            <strong>✅ Admin Authenticated:</strong> This assistant has access to Supabase schema introspection, 
            dashboard route analysis, and user context. It can answer complex questions about your platform.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <DashboardAssistant />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 C-Suite AI Agent Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">📊 Data Sources</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supabase schema introspection</li>
              <li>• Dashboard route code analysis</li>
              <li>• User role and workspace context</li>
              <li>• Platform configuration data</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">⚡ Lightning Expertise</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Node status and diagnostics</li>
              <li>• Channel liquidity optimization</li>
              <li>• Payment routing strategies</li>
              <li>• Fee management recommendations</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">🎯 Business Intelligence</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Email campaign analytics</li>
              <li>• Revenue optimization tips</li>
              <li>• Customer engagement insights</li>
              <li>• Growth strategy guidance</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">🔧 Technical Support</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• API integration troubleshooting</li>
              <li>• Database query optimization</li>
              <li>• Performance bottleneck analysis</li>
              <li>• Security best practices</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
        <h4 className="font-medium text-yellow-800 mb-2">🧪 Test Questions for C-Suite AI Agents</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• "Why is my node showing as offline?"</p>
          <p>• "How can I improve my email campaign open rates?"</p>
          <p>• "What's the best way to manage channel liquidity?"</p>
          <p>• "Explain my dashboard metrics and what they mean"</p>
          <p>• "Run a system security audit and generate recommendations"</p>
        </div>
      </div>
    </div>
  );
} 