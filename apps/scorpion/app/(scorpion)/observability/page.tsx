'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { connectTelemetryStream, disconnectTelemetryStream } from '@/lib/telemetry';
import { TimeScrubber } from '@/components/observability/TimeScrubber';
import { LivePill } from '@/components/observability/LivePill';
import { BackpressureDial } from '@/components/observability/BackpressureDial';
import { LogStream } from '@/components/observability/LogStream';
import { HealthCards } from '@/components/observability/HealthCards';
import { AgentSmallMultiples } from '@/components/observability/AgentSmallMultiples';
import { QueueStatistics } from '@/components/observability/QueueStatistics';
import { Panel, PageLoadingBar } from '@/components/scorpion';

// Lazy load EventRateChart - likely uses recharts or similar heavy library
const EventRateChart = dynamic(
  () => import('@/components/observability/EventRateChart').then(mod => ({ default: mod.EventRateChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-white/40">Loading chart...</div>
      </div>
    )
  }
);

/**
 * Observability Dashboard
 * Real-time system monitoring with telemetry streaming
 */
export default function ObservabilityPage() {
  useEffect(() => {
    // Connect to telemetry stream FIRST
    connectTelemetryStream();
    
    // Function to populate dashboard with REAL system data
    // Telemetry stream handles real-time updates, so we only need periodic population
    const populateRealData = async () => {
      try {
        // Use the populate endpoint which generates real telemetry from actual system state
        await fetch('/api/telemetry/populate', { method: 'POST' });
      } catch (err) {
        console.error('[Observability] Failed to populate real data:', err);
      }
    };
    
    // Defer initial populate to allow page to render first
    // Telemetry stream provides real-time updates, so we don't need frequent polling
    const populateTimeout = setTimeout(() => {
      populateRealData();
    }, 500); // Single initial populate after render
    
    // Populate real data periodically (less frequent since telemetry stream handles real-time)
    // Only when tab is visible to avoid unnecessary work
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        populateRealData();
      }
    }, 30000); // 30 seconds - telemetry stream handles real-time updates
    
    return () => {
      clearTimeout(populateTimeout);
      clearInterval(interval);
      disconnectTelemetryStream();
    };
  }, []);
  
  return (
    <div className="h-full flex flex-col">
      <PageLoadingBar loading={false} /> {/* This page loads via stream, but add for consistency */}
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
            <div className="h-64">
              <EventRateChart />
            </div>
          </Panel>
        </div>
        
        {/* Logs */}
        <Panel title="System Logs" className="h-96">
          <LogStream />
        </Panel>
        
        {/* Agent Activity and Queue Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Panel title="Agent Activity">
            <AgentSmallMultiples />
          </Panel>
          
          <Panel title="Queue Statistics">
            <QueueStatistics />
          </Panel>
        </div>
      </div>
    </div>
  );
}

