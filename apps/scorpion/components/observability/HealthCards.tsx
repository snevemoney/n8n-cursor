'use client';

import { useTelemetryStore } from '@/lib/telemetry/store';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

/**
 * HealthCards - Service health status cards
 */
export function HealthCards() {
  const health = useTelemetryStore(state => state.health);
  
  const services = Object.entries(health);
  
  if (services.length === 0) {
    return (
      <div className="text-sm text-white/40 text-center py-8">
        No health data available yet
      </div>
    );
  }
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <Activity className="h-5 w-5 text-white/40" />;
    }
  };
  
  const getColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-emerald-400/30 bg-emerald-400/5';
      case 'degraded': return 'border-yellow-400/30 bg-yellow-400/5';
      case 'down': return 'border-red-400/30 bg-red-400/5';
      default: return 'border-white/10 bg-white/5';
    }
  };
  
  const formatUptime = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {services.map(([service, data]) => (
        <div
          key={service}
          className={`p-4 rounded-lg border ${getColor(data.status)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-white capitalize">{service}</div>
              <div className="text-xs text-white/40 mt-0.5">
                {new Date(data.lastCheck).toLocaleTimeString()}
              </div>
            </div>
            {getIcon(data.status)}
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-white/60">
              Status: <span className="capitalize">{data.status}</span>
            </div>
            {data.uptime !== undefined && (
              <div className="text-xs text-white/60">
                Uptime: {formatUptime(data.uptime)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

