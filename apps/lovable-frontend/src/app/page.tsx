'use client';

import { useState } from 'react';
import { webhookApi } from '@/lib/webhook-config';
import type { WebhookResponse } from '@/lib/types';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function Home() {
  const [results, setResults] = useState<Record<string, WebhookResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testWorkflow = async (
    name: string,
    testFn: () => Promise<WebhookResponse>
  ) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await testFn();
      setResults((prev) => ({ ...prev, [name]: result }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const workflows = [
    {
      name: 'Chat AI Agent',
      endpoint: '/chat-assets',
      test: () =>
        webhookApi.chatAssets({
          action: 'chat',
          tenantId: 'test-tenant-webhook-validation',
          userEmail: 'test@example.com',
          chatInput: 'Hello, test message',
        }),
    },
    {
      name: 'Asset Management',
      endpoint: '/assets',
      test: () =>
        webhookApi.assetManagement({
          action: 'create',
          tenantId: 'test-tenant-webhook-validation',
          assetType: 'equipment',
          assetName: 'Test Asset',
          assetCategory: 'machinery',
          location: 'Floor 1, Room A101',
          purchaseDate: '2025-01-01',
          purchasePrice: 1000,
          currentValue: 800,
          conditionStatus: 'good',
          status: 'active',
        }),
    },
    {
      name: 'Work Orders',
      endpoint: '/work-orders',
      test: () =>
        webhookApi.workOrders({
          action: 'create',
          tenantId: 'test-tenant-webhook-validation',
          assetId: 'asset-123',
          title: 'Test Work Order',
          description: 'Test description',
          priority: 'medium',
          status: 'pending',
          requestedBy: 'test-user',
          scheduledDate: '2025-11-01',
          dueDate: '2025-11-05',
        }),
    },
    {
      name: 'Sustainability',
      endpoint: '/sustainability-metrics',
      test: () =>
        webhookApi.sustainability({
          action: 'track',
          tenantId: 'test-tenant-webhook-validation',
          metricType: 'energy',
          measurementDate: new Date().toISOString(),
          value: 150,
          unit: 'kWh',
          source: 'test',
        }),
    },
    {
      name: 'Tenant Onboarding',
      endpoint: '/tenant-onboard',
      test: () =>
        webhookApi.tenantOnboarding({
          action: 'onboard',
          tenantId: 'test-tenant-webhook-validation',
          businessName: 'Test Business',
          contactEmail: 'test@example.com',
          contactName: 'Test User',
        }),
    },
    {
      name: 'Email Notifications',
      endpoint: '/notifications/email',
      test: () =>
        webhookApi.emailNotifications({
          action: 'send',
          type: 'alert',
          tenantId: 'test-tenant-webhook-validation',
          recipientEmail: 'test@example.com',
          subject: 'Test Email',
          body: 'This is a test email',
        }),
    },
    {
      name: 'Security Monitoring',
      endpoint: '/security',
      test: () =>
        webhookApi.securityMonitoring({
          action: 'create',
          tenantId: 'test-tenant-webhook-validation',
          securityType: 'test',
        }),
    },
    {
      name: 'Compliance Audit',
      endpoint: '/compliance',
      test: () =>
        webhookApi.complianceAudit({
          action: 'audit',
          tenantId: 'test-tenant-webhook-validation',
          complianceType: 'test',
        }),
    },
    {
      name: 'Health Check',
      endpoint: '/health',
      test: () => webhookApi.healthCheck(),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            n8n Workflows Dashboard
          </h1>
          <p className="text-slate-600">
            Test and monitor all 20 n8n workflows from Lovable frontend
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => {
            const isLoading = loading[workflow.name];
            const result = results[workflow.name];
            const isSuccess = result?.success !== false;

            return (
              <div
                key={workflow.name}
                className="bg-white rounded-lg shadow-md p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {workflow.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {workflow.endpoint}
                    </p>
                  </div>
                  {result && (
                    <div className="ml-2">
                      {isSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => testWorkflow(workflow.name, workflow.test)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Test Workflow</span>
                    </>
                  )}
                </button>

                {result && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-md">
                    <pre className="text-xs text-slate-700 overflow-auto max-h-32">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>
            Connected to:{' '}
            <code className="bg-slate-100 px-2 py-1 rounded">
              https://n8ncloud.tech/webhook
            </code>
          </p>
        </footer>
      </div>
    </div>
  );
}

