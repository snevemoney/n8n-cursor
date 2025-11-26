import DashboardAssistant from '@/components/dashboard/DashboardAssistant';

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lightning AI Assistant</h1>
          <p className="text-gray-600 mt-2">
            Ask questions about your Lightning platform, node status, or get help with platform features.
          </p>
        </div>

        <div className="flex justify-center">
          <DashboardAssistant />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What can I help you with?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Lightning Node Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check node status and connectivity</li>
                <li>• Channel capacity and liquidity</li>
                <li>• Payment routing optimization</li>
                <li>• Fee management strategies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Platform Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI agent configuration</li>
                <li>• Email campaign analytics</li>
                <li>• Dashboard metrics explanation</li>
                <li>• Account and billing questions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Business Operations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Invoice and payment tracking</li>
                <li>• Revenue optimization tips</li>
                <li>• Customer engagement strategies</li>
                <li>• Scaling your Lightning business</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Troubleshooting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Resolve connection issues</li>
                <li>• Payment failures diagnosis</li>
                <li>• Performance bottlenecks</li>
                <li>• Security recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 