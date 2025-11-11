'use client';

import { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import { computeBackpressure } from '@/lib/telemetry/derived';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * BackpressureDial - Shows enqueue vs drain rate with trend
 */
export function BackpressureDial() {
  const events = useTelemetryStore(state => state.events);
  const [backpressure, setBackpressure] = useState({ ratio: 0, enqueueRate: 0, drainRate: 0, ts: Date.now() });
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [history, setHistory] = useState<number[]>([]);
  
  useEffect(() => {
    // Only update when tab is visible, reduce frequency to 3 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const bp = computeBackpressure(events);
        setBackpressure(bp);
        
        // Update history
        setHistory(prev => {
          const newHistory = [...prev, bp.ratio].slice(-10);
          
          // Detect trend
          if (newHistory.length >= 3) {
            const recent = newHistory.slice(-3);
            const avg = recent.reduce((a, b) => a + b) / recent.length;
            const prevAvg = newHistory.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
            
            if (avg > prevAvg * 1.1) setTrend('up');
            else if (avg < prevAvg * 0.9) setTrend('down');
            else setTrend('stable');
          }
          
          return newHistory;
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [events]);
  
  const getColor = () => {
    if (backpressure.ratio > 1.5) return 'text-red-400';
    if (backpressure.ratio > 1.0) return 'text-yellow-400';
    return 'text-emerald-400';
  };
  
  const getIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg border border-white/10">
      <div className="text-xs text-white/40 mb-2">Backpressure</div>
      <div className={`text-3xl font-bold ${getColor()}`}>
        {backpressure.ratio === Infinity ? '∞' : backpressure.ratio.toFixed(2)}x
      </div>
      <div className="flex items-center gap-1 mt-2 text-white/60">
        {getIcon()}
        <span className="text-xs capitalize">{trend}</span>
      </div>
      <div className="mt-3 text-xs text-white/40 space-y-1">
        <div>Enqueue: {backpressure.enqueueRate.toFixed(1)}/s</div>
        <div>Drain: {backpressure.drainRate.toFixed(1)}/s</div>
      </div>
    </div>
  );
}

