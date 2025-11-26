'use client';

/**
 * WaterfallDiff - Compare failing run vs last success
 * Highlight network + compute deltas
 * 
 * Placeholder for HAR file analysis
 */
export function WaterfallDiff() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="text-white/60 mb-2">Waterfall Diff Analyzer</div>
      <div className="text-sm text-white/40 max-w-md">
        Compares failed execution vs successful baseline
        <br />
        Shows network timing, compute duration, and bottlenecks
        <br /><br />
        <span className="text-xs text-white/30">
          (Requires HAR file parsing and timeline visualization)
        </span>
      </div>
    </div>
  );
}

