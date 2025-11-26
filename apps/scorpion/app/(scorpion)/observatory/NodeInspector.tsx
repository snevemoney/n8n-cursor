'use client';

/**
 * Node Inspector Component
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

import type { BrainNode } from '@/server/observatory/types';

interface NodeInspectorProps {
  node: BrainNode | null;
}

/**
 * Node Inspector - Power of 10 Rule 3: ≤ 60 lines
 */
export function NodeInspector({ node }: NodeInspectorProps) {
  if (!node) {
    return (
      <div className="text-white/60 text-sm">
        <h3 className="text-lg font-semibold mb-2">How to read this brain</h3>
        <p className="mb-2">Click on any node to see its internals:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Parameters (config, models, timeouts)</li>
          <li>Metrics (usage, latency, errors)</li>
          <li>Description and purpose</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{node.label}</h3>
        <div className="flex gap-2 mt-1">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
            {node.kind}
          </span>
          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
            {node.layer}
          </span>
        </div>
      </div>

      {node.description && (
        <div>
          <h4 className="text-sm font-semibold mb-1">Description</h4>
          <p className="text-sm text-white/80">{node.description}</p>
        </div>
      )}

      {node.metrics && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Metrics</h4>
          <div className="space-y-1 text-xs">
            {node.metrics.callsLastHour !== undefined && (
              <div>Calls (1h): {node.metrics.callsLastHour}</div>
            )}
            {node.metrics.callsLast24h !== undefined && (
              <div>Calls (24h): {node.metrics.callsLast24h}</div>
            )}
            {node.metrics.avgLatencyMs !== undefined && (
              <div>Avg Latency: {node.metrics.avgLatencyMs}ms</div>
            )}
            {node.metrics.errorRatePct !== undefined && (
              <div>Error Rate: {node.metrics.errorRatePct}%</div>
            )}
          </div>
        </div>
      )}

      {node.params && Object.keys(node.params).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Parameters</h4>
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(node.params).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-700">
                  <td className="py-1 text-white/60">{key}</td>
                  <td className="py-1 text-white/80">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

