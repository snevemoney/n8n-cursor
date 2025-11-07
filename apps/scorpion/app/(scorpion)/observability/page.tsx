'use client';

import { useEffect } from 'react';
import { connectTelemetryStream, disconnectTelemetryStream } from '@/lib/telemetry';
import { TimeScrubber } from '@/components/observability/TimeScrubber';
import { LivePill } from '@/components/observability/LivePill';
import { BackpressureDial } from '@/components/observability/BackpressureDial';
import { LogStream } from '@/components/observability/LogStream';
import { HealthCards } from '@/components/observability/HealthCards';
import { Panel } from '@/components/scorpion';

/**
 * Observability Dashboard
 * Real-time system monitoring with telemetry streaming
 */
export default function ObservabilityPage() {
  useEffect(() => {
    // Connect to telemetry stream
    connectTelemetryStream();
    
    return () => {
      disconnectTelemetryStream();
    };
  }, []);
  
  return (
    <div className="h-full flex flex-col">
      {/* Time scrubber toolbar */}
      <div className="flex-shrink-0">
        <TimeScrubber />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Observability Dashboard</h1>
            <p className="text-sm text-white/40">Real-time system monitoring and telemetry</p>
          </div>
          <LivePill />
        </div>
        
        {/* Health overview */}
        <Panel title="System Health">
          <HealthCards />
        </Panel>
        
        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-4">
          <Panel title="Backpressure">
            <BackpressureDial />
          </Panel>
          
          <Panel title="Event Rate" className="col-span-2">
            <div className="h-full flex items-center justify-center text-white/40">
              Event rate chart placeholder (use Recharts)
            </div>
          </Panel>
        </div>
        
        {/* Logs */}
        <Panel title="System Logs" className="h-96">
          <LogStream />
        </Panel>
        
        {/* Placeholder for additional visualizations */}
        <div className="grid grid-cols-2 gap-4">
          <Panel title="Agent Activity">
            <div className="h-48 flex items-center justify-center text-white/40">
              Agent small multiples placeholder
            </div>
          </Panel>
          
          <Panel title="Queue Statistics">
            <div className="h-48 flex items-center justify-center text-white/40">
              Queue table with barcodes placeholder
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

