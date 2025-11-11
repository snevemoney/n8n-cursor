'use client';

import { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import dynamic from 'next/dynamic';

// Lazy load recharts - heavy library
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface DataPoint {
  time: string;
  rate: number;
  timestamp: number;
}

/**
 * EventRateChart - Shows event rate over time as an area chart
 * Displays events per second over the last hour, grouped into 1-minute buckets
 */
export function EventRateChart() {
  const events = useTelemetryStore(state => state.events);
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const updateChart = () => {
      const now = Date.now();
      const oneHourAgo = now - 3600000; // 1 hour in milliseconds
      
      // Filter events from last hour
      const recentEvents = events.filter(e => e.ts >= oneHourAgo);
      
      // Group into 1-minute buckets (60 buckets total)
      const buckets = new Map<number, number>();
      const bucketSize = 60000; // 1 minute in milliseconds
      
      recentEvents.forEach(event => {
        const bucketTime = Math.floor(event.ts / bucketSize) * bucketSize;
        buckets.set(bucketTime, (buckets.get(bucketTime) || 0) + 1);
      });
      
      // Create data points for the last 60 minutes
      const chartData: DataPoint[] = [];
      for (let i = 59; i >= 0; i--) {
        const bucketTime = Math.floor(now / bucketSize) * bucketSize - (i * bucketSize);
        const count = buckets.get(bucketTime) || 0;
        const rate = count / 60; // events per second (count per minute / 60)
        
        const date = new Date(bucketTime);
        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        chartData.push({
          time: timeStr,
          rate: Math.round(rate * 100) / 100, // Round to 2 decimals
          timestamp: bucketTime,
        });
      }
      
      setData(chartData);
    };

    // Update immediately
    updateChart();
    
    // Update every 5 seconds
    const interval = setInterval(updateChart, 5000);
    
    return () => clearInterval(interval);
  }, [events]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-2 shadow-lg">
          <p className="text-white/60 text-xs mb-1">{payload[0].payload.time}</p>
          <p className="text-white font-semibold">
            {payload[0].value.toFixed(2)} <span className="text-white/60 text-xs">events/sec</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 text-sm">
        No event data available yet. Waiting for telemetry...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="time" 
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
          label={{ value: 'events/sec', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="rate" 
          stroke="#10b981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRate)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

