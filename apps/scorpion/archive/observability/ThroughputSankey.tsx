'use client';

/**
 * ThroughputSankey - Flow diagram showing sources → queues → workers
 * Tokens animate when rate > 0
 * 
 * This is a placeholder for the full implementation using D3 or Cytoscape
 */
export function ThroughputSankey() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="text-white/60 mb-2">Throughput Sankey Diagram</div>
      <div className="text-sm text-white/40 max-w-md">
        Visualizes job flow: Sources → Queues → Workers
        <br />
        Animated tokens show active processing
        <br /><br />
        <span className="text-xs text-white/30">
          (Full implementation requires D3.js or Cytoscape Sankey plugin)
        </span>
      </div>
    </div>
  );
}

