import { Card } from '@/components/ui/card';

export default function OpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and health monitoring
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">System Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>API:</span>
              <span className="text-green-500">Healthy</span>
            </div>
            <div className="flex justify-between">
              <span>Worker:</span>
              <span className="text-green-500">Running</span>
            </div>
            <div className="flex justify-between">
              <span>Redis:</span>
              <span className="text-green-500">Connected</span>
            </div>
            <div className="flex justify-between">
              <span>n8n:</span>
              <span className="text-green-500">Active</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a 
              href="http://api.lightningflow.local/health" 
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-primary hover:bg-primary/90 px-4 py-2 rounded text-sm text-primary-foreground transition-colors text-center"
            >
              Check API Health
            </a>
            <a 
              href="http://n8n.local" 
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm text-white transition-colors text-center"
            >
              Open n8n
            </a>
            <a 
              href="http://logs.local" 
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm text-white transition-colors text-center"
            >
              View Logs
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Environment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="text-yellow-500">Development</span>
            </div>
            <div className="flex justify-between">
              <span>Version:</span>
              <span>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Deploy:</span>
              <span>Just now</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-green-500">100%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}