"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Users,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  BarChart3,
  Wallet,
  Sparkles,
  Target,
  Award,
  Gauge
} from 'lucide-react';

interface WalletPerformance {
  id: string;
  name: string;
  type: 'team' | 'terminal' | 'personal' | 'reserve';
  balance_fiat: string;
  balance_sats: number;
  health_score: number;
  today_earnings: string;
  today_change: number;
  success_rate: number;
  avg_fee: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  last_activity: string;
  recent_transactions: number;
}

interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'optimization' | 'alert' | 'achievement';
  title: string;
  description: string;
  action?: string;
  impact?: string;
  priority: 'high' | 'medium' | 'low';
}

interface TeamEarnings {
  employee_name: string;
  total_earnings: string;
  tips_earned: string;
  transactions: number;
  performance_score: number;
}

export function BusinessWalletDashboard() {
  const [wallets, setWallets] = useState<WalletPerformance[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [teamEarnings, setTeamEarnings] = useState<TeamEarnings[]>([]);
  const [totalBalance, setTotalBalance] = useState('$0.00');
  const [todayRevenue, setTodayRevenue] = useState('$0.00');
  const [activeTerminals, setActiveTerminals] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading real data
    setTimeout(() => {
      setWallets([
        {
          id: 'main-pos',
          name: 'Main POS Terminal',
          type: 'terminal',
          balance_fiat: '$2,847.20',
          balance_sats: 4250000,
          health_score: 96,
          today_earnings: '$1,240.50',
          today_change: 12.5,
          success_rate: 99.2,
          avg_fee: '$0.08',
          status: 'excellent',
          last_activity: '2 minutes ago',
          recent_transactions: 28
        },
        {
          id: 'barista-tips',
          name: 'Barista Tips Pool',
          type: 'team',
          balance_fiat: '$487.50',
          balance_sats: 728000,
          health_score: 92,
          today_earnings: '$127.30',
          today_change: 8.2,
          success_rate: 98.7,
          avg_fee: '$0.05',
          status: 'excellent',
          last_activity: '5 minutes ago',
          recent_transactions: 15
        },
        {
          id: 'owner-wallet',
          name: 'Owner Earnings',
          type: 'personal',
          balance_fiat: '$8,650.00',
          balance_sats: 12920000,
          health_score: 98,
          today_earnings: '$2,100.00',
          today_change: 15.7,
          success_rate: 99.8,
          avg_fee: '$0.12',
          status: 'excellent',
          last_activity: '1 minute ago',
          recent_transactions: 42
        },
        {
          id: 'backup-reserve',
          name: 'Emergency Reserve',
          type: 'reserve',
          balance_fiat: '$5,000.00',
          balance_sats: 7460000,
          health_score: 85,
          today_earnings: '$0.00',
          today_change: 0,
          success_rate: 100,
          avg_fee: '$0.00',
          status: 'good',
          last_activity: '2 hours ago',
          recent_transactions: 0
        }
      ]);

      setInsights([
        {
          id: '1',
          type: 'opportunity',
          title: 'Peak Hour Optimization',
          description: 'Your busiest hour (2-3 PM) could handle 23% more volume with better routing.',
          action: 'Adjust terminal liquidity',
          impact: '+$180/day',
          priority: 'high'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Fee Efficiency Record',
          description: 'Your average fees are 40% lower than Lightning network average this week.',
          priority: 'low'
        },
        {
          id: '3',
          type: 'optimization',
          title: 'Team Payout Delay',
          description: 'Consider instant tip payouts to improve staff satisfaction.',
          action: 'Enable instant payouts',
          impact: 'Better retention',
          priority: 'medium'
        }
      ]);

      setTeamEarnings([
        {
          employee_name: 'Sarah (Barista)',
          total_earnings: '$127.30',
          tips_earned: '$87.20',
          transactions: 15,
          performance_score: 94
        },
        {
          employee_name: 'Mike (Cashier)',
          total_earnings: '$98.50',
          tips_earned: '$62.30',
          transactions: 12,
          performance_score: 89
        }
      ]);

      setTotalBalance('$16,984.70');
      setTodayRevenue('$3,467.80');
      setActiveTerminals(3);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'good': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4 text-blue-400" />;
      case 'optimization': return <Sparkles className="h-4 w-4 text-purple-400" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'achievement': return <Award className="h-4 w-4 text-green-400" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-800 rounded-xl"></div>
            <div className="h-96 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Business Command Center</h1>
          <p className="text-gray-400">Real-time insights and intelligent payment routing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-700 text-gray-300">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalBalance}</div>
            <p className="text-xs text-gray-500 mt-1">Across all wallets</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{todayRevenue}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+15.2% vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">Active Terminals</CardTitle>
              <Terminal className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeTerminals}</div>
            <p className="text-xs text-gray-500 mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">Success Rate</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.1%</div>
            <p className="text-xs text-gray-500 mt-1">Payment reliability</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets Performance */}
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Gauge className="h-6 w-6 text-blue-400" />
                      <div className="absolute -top-1 -right-1 text-xs font-bold text-white">
                        {wallet.health_score}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{wallet.name}</h3>
                      <p className="text-xs text-gray-400 capitalize">{wallet.type} wallet</p>
                    </div>
                  </div>
                  <Badge className={`px-2 py-1 ${getStatusColor(wallet.status)}`}>
                    {wallet.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Balance</p>
                    <p className="font-medium text-white">{wallet.balance_fiat}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Today</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-white">{wallet.today_earnings}</p>
                      {wallet.today_change > 0 && (
                        <ArrowUpRight className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Success</p>
                    <p className="font-medium text-white">{wallet.success_rate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Avg Fee</p>
                    <p className="font-medium text-white">{wallet.avg_fee}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {wallet.last_activity}
                  </div>
                  <div className="text-xs text-gray-400">
                    {wallet.recent_transactions} transactions
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Business Insights */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    
                    {insight.action && (
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => toast.info(`Action: ${insight.action}`)}
                        >
                          {insight.action}
                        </Button>
                        {insight.impact && (
                          <span className="text-xs text-green-400 font-medium">
                            {insight.impact}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamEarnings.map((member) => (
              <div
                key={member.employee_name}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{member.employee_name}</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-400">Score:</span>
                    <span className="text-sm font-medium text-blue-400">
                      {member.performance_score}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-medium text-white">{member.total_earnings}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tips</p>
                    <p className="font-medium text-green-400">{member.tips_earned}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Sales</p>
                    <p className="font-medium text-white">{member.transactions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 