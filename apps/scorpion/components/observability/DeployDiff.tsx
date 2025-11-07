'use client';

import { useTelemetryStore } from '@/lib/telemetry/store';

/**
 * DeployDiff - Compare metrics before/after deploy markers
 */
export function DeployDiff() {
  const events = useTelemetryStore(state => state.events);
  
  const deploys = events.filter(e => e.type === 'deploy.marker');
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="text-white/60 mb-4">Deploy Impact Analysis</div>
      
      {deploys.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
          No deploy markers found.
          <br />
          Use <code className="text-xs bg-white/10 px-1 rounded">telemetry.deployMarker(version, env)</code>
        </div>
      ) : (
        <div className="space-y-2">
          {deploys.map((deploy, i) => (
            <div key={i} className="p-3 bg-white/5 border border-white/10 rounded">
              <div className="text-sm text-white">
                {'version' in deploy ? deploy.version as string : 'Unknown'}
              </div>
              <div className="text-xs text-white/40">
                {new Date(deploy.ts).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

