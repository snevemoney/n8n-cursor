"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  RefreshCw,
  Bell,
  BellOff,
  BarChart3,
  Gauge,
  Wifi,
  WifiOff,
  Users
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Dynamic imports for Chart.js components to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
});

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Doughnut })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
});

// Client-side chart registration
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );
}

interface Channel {
  id: string;
  channel_id: string;
  peer_pubkey: string;
  peer_alias: string;
  local_balance: number;
  remote_balance: number;
  capacity: number;
  local_ratio: number;
  balance_score: string;
  active: boolean;
  base_fee_msat: number;
  fee_rate_ppm: number;
  last_forward_at: string;
  last_update_at: string;
  alerts: any[];
  alert_count: number;
  has_critical_alerts: boolean;
}

interface ChannelAlert {
  id: string;
  channel_id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  recommended_action: string;
  acknowledged: boolean;
  resolved: boolean;
  triggered_at: string;
  peer_alias: string;
  capacity: number;
  local_ratio: number;
}

interface HealthSummary {
  total_channels: number;
  active_channels: number;
  balanced_channels: number;
  imbalanced_channels: number;
  inactive_channels: number;
  total_capacity: number;
  total_local_balance: number;
  avg_local_ratio: number;
}

const ChannelMonitor: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [alerts, setAlerts] = useState<ChannelAlert[]>([]);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [capacityHistory, setCapacityHistory] = useState<any[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure hydration is complete before rendering charts
  useEffect(() => {
    // Add a small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [channelsRes, alertsRes, healthRes, historyRes] = await Promise.all([
        fetch(`/api/channels/monitor?type=channels&include_inactive=${includeInactive}`),
        fetch('/api/channels/monitor?type=alerts'),
        fetch('/api/channels/monitor?type=health'),
        fetch('/api/channels/monitor?type=capacity-history&days=7')
      ]);

      const [channelsData, alertsData, healthData, historyData] = await Promise.all([
        channelsRes.json(),
        alertsRes.json(),
        healthRes.json(),
        historyRes.json()
      ]);

      setChannels(channelsData.channels || []);
      setAlerts(alertsData.alerts || []);
      setHealth(healthData.health || null);
      setCapacityHistory(historyData.history || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error("Failed to fetch monitoring data");
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/channels/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge_alert', alert_id: alertId })
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      
      toast.success("Alert has been marked as acknowledged");
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/channels/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_alert', alert_id: alertId })
      });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast.success("Alert has been resolved and removed");
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  useEffect(() => {
    fetchData();
  }, [includeInactive]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, includeInactive]);

  const formatSats = (sats: number) => {
    return new Intl.NumberFormat('en-US').format(sats);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getBalanceColor = (score: string) => {
    switch (score) {
      case 'balanced': return 'text-green-400';
      case 'low_local': return 'text-red-400';
      case 'high_local': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'outline';
      default: return 'secondary';
    }
  };

  const capacityChartData = {
    labels: capacityHistory.map(h => new Date(h.recorded_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Capacity',
        data: capacityHistory.map(h => h.capacity),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.2,
      },
    ],
  };

  const balanceDistributionData = {
    labels: ['Balanced', 'Low Local', 'High Local', 'Moderate'],
    datasets: [
      {
        data: [
          channels.filter(c => c.balance_score === 'balanced').length,
          channels.filter(c => c.balance_score === 'low_local').length,
          channels.filter(c => c.balance_score === 'high_local').length,
          channels.filter(c => c.balance_score === 'moderate').length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-400" />
              Channel Monitor
            </h1>
            <p className="text-gray-400">
              Real-time monitoring of your Lightning channels and performance
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-gray-300">Auto Refresh</Label>
            </div>
            
            <Button
              onClick={fetchData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Health Summary Cards */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Channels</p>
                    <p className="text-2xl font-bold text-white">{health.total_channels}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {health.active_channels} active
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Capacity</p>
                    <p className="text-2xl font-bold text-white">
                      {formatBytes(health.total_capacity)}
                    </p>
                  </div>
                  <Gauge className="h-8 w-8 text-green-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {((health.avg_local_ratio || 0) * 100).toFixed(1)}% avg local
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Balanced Channels</p>
                    <p className="text-2xl font-bold text-green-400">{health.balanced_channels}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {health.imbalanced_channels} need attention
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Alerts</p>
                    <p className="text-2xl font-bold text-orange-400">{alerts.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-orange-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {alerts.filter(a => a.severity === 'critical').length} critical
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Channel Status</h2>
              <div className="flex items-center gap-2">
                <Switch
                  id="include-inactive"
                  checked={includeInactive}
                  onCheckedChange={setIncludeInactive}
                />
                <Label htmlFor="include-inactive" className="text-gray-300">Include Inactive</Label>
              </div>
            </div>

            <div className="space-y-4">
              {channels.map((channel) => (
                <Card key={channel.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {channel.active ? (
                            <Wifi className="h-5 w-5 text-green-400" />
                          ) : (
                            <WifiOff className="h-5 w-5 text-red-400" />
                          )}
                          <div>
                            <h3 className="font-semibold text-white">{channel.peer_alias}</h3>
                            <p className="text-sm text-gray-400">{channel.channel_id.slice(0, 16)}...</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(channel.balance_score)} className={getBalanceColor(channel.balance_score)}>
                            {channel.balance_score.replace('_', ' ')}
                          </Badge>
                          {channel.has_critical_alerts && (
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          )}
                          {channel.alert_count > 0 && (
                            <Badge variant="outline" className="text-orange-400">
                              {channel.alert_count} alerts
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Capacity</div>
                          <div className="text-lg font-semibold text-white">
                            {formatSats(channel.capacity)} sats
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Local Balance</div>
                          <div className="text-lg font-semibold text-green-400">
                            {formatSats(channel.local_balance)} sats
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Remote Balance</div>
                          <div className="text-lg font-semibold text-blue-400">
                            {formatSats(channel.remote_balance)} sats
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Local Ratio</span>
                          <span className="text-white">{(channel.local_ratio * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={channel.local_ratio * 100} 
                          className="h-2" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Base Fee: </span>
                          <span className="text-white">{channel.base_fee_msat} msat</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Fee Rate: </span>
                          <span className="text-white">{channel.fee_rate_ppm} ppm</span>
                        </div>
                      </div>

                      {channel.last_forward_at && (
                        <div className="text-sm text-gray-400">
                          Last forward: {new Date(channel.last_forward_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Active Alerts</h2>
            
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">All Clear!</h3>
                    <p className="text-gray-400">No active alerts for your channels.</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <Alert key={alert.id} className="bg-gray-900/50 border-gray-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{alert.title}</h4>
                          <p className="text-gray-300">{alert.message}</p>
                          {alert.recommended_action && (
                            <p className="text-blue-400 text-sm mt-1">
                              💡 {alert.recommended_action}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {new Date(alert.triggered_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!alert.acknowledged && (
                          <Button
                            onClick={() => acknowledgeAlert(alert.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          onClick={() => resolveAlert(alert.id)}
                          size="sm"
                          variant="outline"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Channel Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Capacity Trend (7 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {isHydrated && capacityHistory && capacityHistory.length > 0 ? (
                      <Line
                        data={capacityChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: { color: 'white' }
                            }
                          },
                          scales: {
                            x: {
                              ticks: { color: 'white' },
                              grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            y: {
                              ticks: { color: 'white' },
                              grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        {isLoading ? 'Loading chart data...' : 'No capacity data available'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Balance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {isHydrated && channels && channels.length > 0 ? (
                      <Doughnut
                        data={balanceDistributionData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: { color: 'white' }
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        {isLoading ? 'Loading chart data...' : 'No channel data available'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChannelMonitor; 