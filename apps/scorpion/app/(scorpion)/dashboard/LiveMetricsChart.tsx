'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface MetricPoint {
  time: string;
  healthy: number;
  warnings: number;
  errors: number;
}

interface LiveMetricsChartProps {
  data: MetricPoint[];
}

export function LiveMetricsChart({ data }: LiveMetricsChartProps) {
  return (
    <div className="w-full" style={{ minHeight: '256px', height: '256px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height={256}>
        <AreaChart 
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="time" 
            stroke="#ffffff40" 
            style={{ fontSize: '10px' }}
            tick={{ fill: '#ffffff60' }}
          />
          <YAxis 
            stroke="#ffffff40"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#ffffff60' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f1318', 
              border: '1px solid #ffffff20',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            labelStyle={{ color: '#ffffff' }}
          />
          <Area 
            type="monotone" 
            dataKey="healthy" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorHealthy)"
            name="Healthy"
          />
          <Area 
            type="monotone" 
            dataKey="warnings" 
            stroke="#f59e0b" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorWarnings)"
            name="Warnings"
          />
          <Area 
            type="monotone" 
            dataKey="errors" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorErrors)"
            name="Errors"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

