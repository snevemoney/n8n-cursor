'use client';
import { apiPath } from '@/lib/base-path';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Move Supabase client creation to a function to avoid build-time initialization
function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return null during SSR/build time
    return null;
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface BotTestConfig {
  botCount: number;
  testDuration: number;
  concurrency: number;
  mode: 'mock' | 'real';
}

interface BotTestResult {
  id: string;
  timestamp: string;
  configuration: BotTestConfig;
  summary: {
    totalBots: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: string;
    avgResponseTime: string;
    requestsPerSecond: string;
  };
  status: 'running' | 'completed' | 'failed';
}

export default function AdminBotsClient() {
  const [testConfig, setTestConfig] = useState<BotTestConfig>({
    botCount: 5,
    testDuration: 30,
    concurrency: 3,
    mode: 'mock'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<BotTestResult | null>(null);
  const [testHistory, setTestHistory] = useState<BotTestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadTestHistory();
  }, []);

  async function loadTestHistory() {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      
      // Load recent bot test results
      const { data } = await supabase
        .from('bot_test_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setTestHistory(data);
      }
    } catch (error) {
      console.error('Failed to load test history:', error);
    }
  }

  async function startBotTest() {
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting bot test...');

    try {
      // Create a new test record
      const testResult: BotTestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        configuration: testConfig,
        summary: {
          totalBots: 0,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          successRate: '0%',
          avgResponseTime: '0ms',
          requestsPerSecond: '0'
        },
        status: 'running'
      };

      setCurrentTest(testResult);
      addLog(`📋 Configuration: ${testConfig.botCount} bots, ${testConfig.testDuration}s duration, ${testConfig.mode} mode`);

      // Start the bot test via API
      const response = await fetch(apiPath('/api/admin/bot-test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to start bot test');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'log') {
                addLog(data.message);
              } else if (data.type === 'progress') {
                // Update current test with progress
                setCurrentTest(prev => prev ? {
                  ...prev,
                  summary: data.summary
                } : null);
              } else if (data.type === 'complete') {
                addLog('✅ Bot test completed successfully!');
                setCurrentTest(prev => prev ? {
                  ...prev,
                  summary: data.summary,
                  status: 'completed'
                } : null);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }

    } catch (error) {
      console.error('Bot test failed:', error);
      addLog(`❌ Bot test failed: ${error}`);
      setCurrentTest(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setIsRunning(false);
      loadTestHistory();
    }
  }

  function addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }

  function stopBotTest() {
    // In a real implementation, you would send a stop signal to the running test
    setIsRunning(false);
    addLog('🛑 Bot test stopped by user');
    setCurrentTest(prev => prev ? { ...prev, status: 'failed' } : null);
  }

  const presets = [
    { name: 'Quick Test', config: { botCount: 5, testDuration: 30, concurrency: 3, mode: 'mock' as const } },
    { name: 'Load Test', config: { botCount: 20, testDuration: 120, concurrency: 5, mode: 'mock' as const } },
    { name: 'Stress Test', config: { botCount: 50, testDuration: 300, concurrency: 10, mode: 'mock' as const } },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🤖 Bot Control Panel</h1>
        <p className="text-gray-600">Manage and monitor automated bot testing with enterprise-grade controls</p>
        <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
          ✅ Admin Authenticated - Bot Testing Enabled
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h2 className="text-lg font-semibold mb-4">🎯 Test Configuration</h2>
        
        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">⚡ Quick Presets</label>
          <div className="flex space-x-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setTestConfig(preset.config)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 text-sm font-medium transition-all duration-200"
                disabled={isRunning}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🤖 Bot Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={testConfig.botCount}
              onChange={(e) => setTestConfig(prev => ({ ...prev, botCount: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">⏱️ Duration (seconds)</label>
            <input
              type="number"
              min="10"
              max="3600"
              value={testConfig.testDuration}
              onChange={(e) => setTestConfig(prev => ({ ...prev, testDuration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔄 Concurrency</label>
            <input
              type="number"
              min="1"
              max="20"
              value={testConfig.concurrency}
              onChange={(e) => setTestConfig(prev => ({ ...prev, concurrency: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🎮 Mode</label>
            <select
              value={testConfig.mode}
              onChange={(e) => setTestConfig(prev => ({ ...prev, mode: e.target.value as 'mock' | 'real' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            >
              <option value="mock">🛡️ Mock (Safe)</option>
              <option value="real">⚡ Real (Production)</option>
            </select>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex space-x-4">
          {!isRunning ? (
            <button
              onClick={startBotTest}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-md hover:from-green-600 hover:to-blue-700 flex items-center font-medium transition-all duration-200"
            >
              <span className="mr-2 text-lg">🚀</span>
              Start Bot Test
            </button>
          ) : (
            <button
              onClick={stopBotTest}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-md hover:from-red-600 hover:to-pink-700 flex items-center font-medium transition-all duration-200"
            >
              <span className="mr-2 text-lg">🛑</span>
              Stop Test
            </button>
          )}
          
          <button
            onClick={() => window.open('/bot-test-monitor.html', '_blank')}
            className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-3 rounded-md hover:from-gray-700 hover:to-gray-900 flex items-center font-medium transition-all duration-200"
          >
            <span className="mr-2 text-lg">📊</span>
            View Reports
          </button>
        </div>
      </div>

      {/* Current Test Status */}
      {currentTest && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold mb-4">📊 Current Test Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">{currentTest.summary.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{currentTest.summary.successRate}</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{currentTest.summary.avgResponseTime}</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{currentTest.summary.requestsPerSecond}</div>
              <div className="text-sm text-gray-600">Requests/sec</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              currentTest.status === 'running' ? 'bg-yellow-500 animate-pulse' :
              currentTest.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium capitalize">{currentTest.status}</span>
          </div>
        </div>
      )}

      {/* Live Logs */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-semibold mb-4">📡 Live Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="hover:bg-gray-800 px-2 py-1 rounded">{log}</div>
            ))
          ) : (
            <div className="text-gray-500">
              💭 No logs yet. Start a bot test to see live output...
              <br />
              <span className="text-xs">🎯 AI agents will monitor and report test progress</span>
            </div>
          )}
        </div>
      </div>

      {/* Test History */}
      <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-indigo-500">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">📈 Recent Test History</h2>
        </div>
        
        {testHistory.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ⏰ Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ⚙️ Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📊 Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🎯 Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testHistory.map((test, index) => (
                <tr key={test.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(test.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.configuration.botCount} bots, {test.configuration.testDuration}s, {test.configuration.mode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.summary.totalRequests} requests, {test.summary.successRate} success
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      test.status === 'completed' ? 'bg-green-100 text-green-800' :
                      test.status === 'running' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {test.status === 'completed' ? '✅' : test.status === 'running' ? '🔄' : '❌'} {test.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🤖</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test history yet</h3>
            <p className="text-gray-500">Run your first bot test to see results here</p>
            <p className="text-sm text-gray-400 mt-2">
              🧠 AI agents will analyze and optimize your bot testing patterns
            </p>
          </div>
        )}
      </div>

      {/* Safety Warning */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-2xl">⚠️</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              🛡️ Bot Testing Safety Guidelines
            </h3>
            <div className="text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>🛡️ Mock mode</strong> is safe for development and testing</li>
                <li><strong>⚡ Real mode</strong> creates actual users and makes real API calls</li>
                <li><strong>📊 High bot counts</strong> may impact system performance</li>
                <li><strong>🔍 Always monitor</strong> system resources during tests</li>
                <li><strong>🤖 Bot users</strong> are marked with 🤖 and can be cleaned up via User Management</li>
                <li><strong>🧠 AI agents</strong> monitor bot behavior and system impact automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 