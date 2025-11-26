'use client';

import { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import { QueueBarcode } from './QueueBarcode';
import type { DomainEvent } from '@/lib/telemetry/schema';

interface QueueStats {
  queue: string;
  depth: number;
  enqueueRate: number;
  drainRate: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  totalJobs: number;
}

/**
 * QueueStatistics - Shows statistics for each queue
 * Displays depth, rates, success/error counts, and activity barcode
 */
export function QueueStatistics() {
  const events = useTelemetryStore(state => state.events);
  const [queueStats, setQueueStats] = useState<QueueStats[]>([]);

  useEffect(() => {
    const updateStats = () => {
      const now = Date.now();
      const window = 60000; // Last 60 seconds
      const recentEvents = events.filter(e => e.ts > now - window);

      // Get all unique queue names
      const queueNames = new Set<string>();
      events.forEach(event => {
        if ('queue' in event && typeof event.queue === 'string') {
          queueNames.add(event.queue);
        }
      });

      // Calculate stats per queue
      const stats: QueueStats[] = Array.from(queueNames).map(queue => {
        const queueEvents = recentEvents.filter(
          e => 'queue' in e && e.queue === queue
        );

        // Calculate current depth (enqueued - completed - failed)
        let depth = 0;
        const allQueueEvents = events.filter(
          e => 'queue' in e && e.queue === queue
        );

        allQueueEvents.forEach(event => {
          if (event.type === 'job.queued') {
            depth++;
          } else if (event.type === 'job.completed' || event.type === 'job.failed') {
            depth = Math.max(0, depth - 1);
          }
        });

        // Count enqueues and drains in recent window
        const enqueues = queueEvents.filter(e => e.type === 'job.queued').length;
        const completed = queueEvents.filter(e => e.type === 'job.completed').length;
        const failed = queueEvents.filter(e => e.type === 'job.failed').length;
        const drains = completed + failed;

        // Calculate rates (per second)
        const enqueueRate = enqueues / (window / 1000);
        const drainRate = drains / (window / 1000);

        // Success/error stats
        const successCount = completed;
        const errorCount = failed;
        const totalJobs = successCount + errorCount;
        const successRate = totalJobs > 0 ? successCount / totalJobs : 0;

        return {
          queue,
          depth,
          enqueueRate,
          drainRate,
          successCount,
          errorCount,
          successRate,
          totalJobs,
        };
      });

      // Sort by total activity (most active first)
      stats.sort((a, b) => b.totalJobs - a.totalJobs);

      setQueueStats(stats);
    };

    // Update immediately
    updateStats();

    // Update every 2 seconds
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [events]);

  if (queueStats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 text-sm text-center p-4">
        No queue activity yet. Waiting for telemetry...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-3">
        {queueStats.map((stat) => (
          <div
            key={stat.queue}
            className="bg-black/20 border border-white/10 rounded-lg p-3 space-y-2"
          >
            {/* Queue name and depth */}
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">{stat.queue}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Depth:</span>
                <span
                  className={`text-sm font-bold ${
                    stat.depth > 10
                      ? 'text-red-400'
                      : stat.depth > 5
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {stat.depth}
                </span>
              </div>
            </div>

            {/* Activity barcode */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-16">Activity:</span>
              <QueueBarcode events={events} queue={stat.queue} width={200} height={16} />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-white/60">Enqueue: </span>
                <span className="text-white font-mono">
                  {stat.enqueueRate.toFixed(2)}/s
                </span>
              </div>
              <div>
                <span className="text-white/60">Drain: </span>
                <span className="text-white font-mono">
                  {stat.drainRate.toFixed(2)}/s
                </span>
              </div>
            </div>

            {/* Success/Error stats */}
            {stat.totalJobs > 0 && (
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400">●</span>
                  <span className="text-white/60">Success:</span>
                  <span className="text-white font-semibold">
                    {stat.successCount} ({Math.round(stat.successRate * 100)}%)
                  </span>
                </div>
                {stat.errorCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-red-400">●</span>
                    <span className="text-white/60">Errors:</span>
                    <span className="text-white font-semibold">{stat.errorCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

