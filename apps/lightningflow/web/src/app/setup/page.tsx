'use client';
import { apiPath } from '@/lib/base-path';

import { useState, useEffect } from 'react';

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<any>(null);
  const [systemTest, setSystemTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const [statusRes, testRes] = await Promise.all([
        fetch(apiPath('/api/setup-status')),
        fetch(apiPath('/api/test-system')),
      ]);

      const statusData = await statusRes.json();
      const testData = await testRes.json();

      setSetupStatus(statusData);
      setSystemTest(testData);
    } catch (error) {
      console.error('Failed to fetch setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Lightning AI Business Node Platform
          </h1>
          <p className="text-xl text-gray-600">
            Setup and Configuration
          </p>
          <button 
            onClick={fetchStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Refresh Status
          </button>
        </div>

        {/* Current Status */}
        {setupStatus && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">⚙️ Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(setupStatus.currentStatus).map(([key, status]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm text-gray-600">{status as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Test Results */}
        {systemTest && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              🗄️ System Test Results
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                systemTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {systemTest.systemStatus}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemTest.summary.passed}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {systemTest.summary.failed}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {systemTest.summary.warnings}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>

            <div className="space-y-2">
              {systemTest.tests.map((test: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded border">
                  <span className={`w-4 h-4 rounded-full ${
                    test.status === 'PASS' ? 'bg-green-500' : 
                    test.status === 'FAIL' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className="font-medium">{test.name}</span>
                  <span className="text-sm text-gray-600">{test.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Steps */}
        {setupStatus && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">📋 Setup Steps</h2>
            {setupStatus.steps.map((step: any) => (
              <div key={step.step} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="space-y-4">
                  {step.actions.map((action: any, index: number) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-2">{action.method}</h4>
                      <div className="space-y-1">
                        {action.instructions.map((instruction: string, instrIndex: number) => (
                          <div key={instrIndex} className="text-sm">
                            {instruction.startsWith('curl') ? (
                              <code className="bg-gray-100 p-2 rounded block text-xs overflow-x-auto">
                                {instruction}
                              </code>
                            ) : instruction.startsWith('Go to https') ? (
                              <div className="flex items-center gap-2">
                                <span>Go to Supabase Dashboard</span>
                                <button
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                  onClick={() => window.open(instruction.replace('Go to ', ''), '_blank')}
                                >
                                  🔗 Open Dashboard
                                </button>
                              </div>
                            ) : (
                              <span>• {instruction}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.open('https://supabase.com/dashboard/project/xlrxpfptulcugoqjccyf', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🗄️ Open Supabase Dashboard
            </button>
            <button
              onClick={() => window.open('/dashboard/simulator', '_blank')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              🔍 Test Simulator
            </button>
          </div>
        </div>

        {/* Success Message */}
        {systemTest?.systemStatus === 'READY' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <div>
                <p className="font-medium text-green-800">
                  🎉 Your Lightning AI Business Node Platform is ready!
                </p>
                <p className="text-green-700 mt-1">You can now:</p>
                <ul className="mt-2 ml-4 list-disc text-green-700">
                  <li>Process tutorials with vector search</li>
                  <li>Use the enhanced simulator</li>
                  <li>Set up AI agents and fee optimization</li>
                  <li>Track analytics and user onboarding</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 