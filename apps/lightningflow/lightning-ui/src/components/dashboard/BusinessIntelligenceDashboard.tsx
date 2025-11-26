"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Users,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Sparkles,
  Calculator,
  Calendar,
  Globe,
  Server,
  Wallet,
  Activity
} from 'lucide-react';

interface BusinessMetrics {
  revenue: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  transactions: {
    count: number;
    success_rate: number;
    avg_amount: number;
  };
  routing: {
    fees_earned: number;
    volume_routed: number;
    success_rate: number;
  };
  wallets: {
    active_count: number;
    total_balance: number;
    top_performer: string;
  };
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'optimization' | 'prediction';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

const BusinessIntelligenceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    revenue: { today: 45250, week: 287400, month: 1247800, growth: 23.4 },
    transactions: { count: 1247, success_rate: 98.7, avg_amount: 75000 },
    routing: { fees_earned: 12450, volume_routed: 8947000, success_rate: 99.2 },
    wallets: { active_count: 8, total_balance: 2847000, top_performer: 'Table 3' }
  });

  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Peak Hour Optimization',
      description: 'Your busiest hours (7-9 PM) could handle 23% more volume with optimized routing',
      impact: '+$180/day potential',
      confidence: 87,
      action: 'Increase channel capacity',
      priority: 'high'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Fee Policy Adjustment',
      description: 'Current network conditions suggest increasing base fees by 15% for optimal earnings',
      impact: '+$45/day',
      confidence: 92,
      action: 'Adjust fee policy',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'prediction',
      title: 'Weekend Revenue Forecast',
      description: 'Based on patterns, expect 34% higher volume this weekend due to local events',
      impact: '+$420 weekend boost',
      confidence: 79,
      action: 'Prepare for volume',
      priority: 'medium'
    }
  ]);

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [currency, setCurrency] = useState('USD');

  const formatCurrency = (amount: number, showSats = false) => {
    const fiatAmount = amount / 100_000_000 * 69420; // Mock BTC price
    const formatted = `$${fiatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return showSats ? `${formatted} (${amount.toLocaleString()} sats)` : formatted;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'optimization': return <Target className="h-4 w-4 text-blue-400" />;
      case 'prediction': return <Brain className="h-4 w-4 text-purple-400" />;
      default: return <Lightbulb className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-500/30 bg-green-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'optimization': return 'border-blue-500/30 bg-blue-500/10';
      case 'prediction': return 'border-purple-500/30 bg-purple-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Business Intelligence</h1>
          <p className="text-gray-400">AI-powered insights for your Lightning operations</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Brain className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(metrics.revenue.today)}
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+{metrics.revenue.growth}%</span>
                <span className="text-xs text-gray-500">vs yesterday</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {metrics.revenue.today.toLocaleString()} sats
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Transactions</CardTitle>
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.transactions.count}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">{metrics.transactions.success_rate}%</span>
                <span className="text-xs text-gray-500">success rate</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {formatCurrency(metrics.transactions.avg_amount)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Routing Fees</CardTitle>
                <Zap className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(metrics.routing.fees_earned)}
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">{metrics.routing.success_rate}%</span>
                <span className="text-xs text-gray-500">routing success</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Volume: {formatCurrency(metrics.routing.volume_routed)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Active Wallets</CardTitle>
                <Wallet className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.wallets.active_count}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-400">{metrics.wallets.top_performer}</span>
                <span className="text-xs text-gray-500">top earner</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Total: {formatCurrency(metrics.wallets.total_balance)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-xl p-4 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${
                            insight.priority === 'high' ? 'border-red-500/50 text-red-400' :
                            insight.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-gray-500/50 text-gray-400'
                          }`}
                        >
                          {insight.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{insight.impact}</div>
                      <div className="text-xs text-gray-400">{insight.confidence}% confidence</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-400">Confidence:</div>
                      <Progress value={insight.confidence} className="w-20 h-2" />
                      <div className="text-xs text-gray-400">{insight.confidence}%</div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tomorrow</span>
                    <span className="text-white font-medium">$520 (+15%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Week</span>
                    <span className="text-white font-medium">$3,240 (+12%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Next Month</span>
                    <span className="text-white font-medium">$14,800 (+18%)</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Confidence Level</div>
                  <Progress value={84} className="mb-1" />
                  <div className="text-xs text-gray-500">84% - Based on historical patterns & network trends</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Monthly Revenue Goal</span>
                    <span className="text-white">$15,000</span>
                  </div>
                  <Progress value={83} className="mb-1" />
                  <div className="text-xs text-gray-500">$12,478 of $15,000 (83%)</div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Transaction Count</span>
                    <span className="text-white">2,000</span>
                  </div>
                  <Progress value={62} className="mb-1" />
                  <div className="text-xs text-gray-500">1,247 of 2,000 (62%)</div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-white">99%</span>
                  </div>
                  <Progress value={99} className="mb-1" />
                  <div className="text-xs text-green-400">On track - Current: 98.7%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Performing Wallets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Table 3', earnings: '$420', growth: '+34%' },
                  { name: 'Counter', earnings: '$380', growth: '+28%' },
                  { name: 'Table 7', earnings: '$340', growth: '+22%' },
                  { name: 'Tips Pool', earnings: '$290', growth: '+18%' }
                ].map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{wallet.name}</div>
                      <div className="text-xs text-gray-400">{wallet.earnings} today</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">{wallet.growth}</div>
                      <div className="text-xs text-gray-500">vs avg</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Peak Hours Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: '7:00 PM - 9:00 PM', volume: '$1,240', percentage: 28 },
                  { time: '12:00 PM - 2:00 PM', volume: '$890', percentage: 20 },
                  { time: '6:00 PM - 7:00 PM', volume: '$670', percentage: 15 },
                  { time: '8:00 AM - 10:00 AM', volume: '$520', percentage: 12 }
                ].map((period, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{period.time}</span>
                      <span className="text-sm text-white">{period.volume}</span>
                    </div>
                    <Progress value={period.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Node Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">99.2%</div>
                  <div className="text-sm text-gray-400">Uptime (30 days)</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Channels</span>
                    <span className="text-white">14/16</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Liquidity Balance</span>
                    <span className="text-green-400">Optimal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Peer Connections</span>
                    <span className="text-white">8 active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fee Efficiency</span>
                    <span className="text-blue-400">92% score</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'Channel Rebalancing',
                    description: 'Rebalance 3 channels to improve routing success',
                    impact: '+$45/day',
                    effort: 'Low',
                    status: 'ready'
                  },
                  {
                    title: 'Fee Policy Update',
                    description: 'Adjust base fees during peak hours',
                    impact: '+$30/day',
                    effort: 'Medium',
                    status: 'ready'
                  },
                  {
                    title: 'Peer Diversification',
                    description: 'Add 2 new high-volume peer connections',
                    impact: '+$85/day',
                    effort: 'High',
                    status: 'planned'
                  }
                ].map((rec, index) => (
                  <div key={index} className="border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.effort} effort
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-medium">{rec.impact}</span>
                      <Button size="sm" variant={rec.status === 'ready' ? 'default' : 'outline'}>
                        {rec.status === 'ready' ? 'Apply Now' : 'Schedule'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Earnings Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Potential Monthly Increase</h4>
                  <div className="text-2xl font-bold text-white mb-1">+$2,340</div>
                  <div className="text-sm text-blue-200">By implementing all AI recommendations</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current monthly earnings</span>
                    <span className="text-white">$12,478</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Optimized potential</span>
                    <span className="text-green-400">$14,818</span>
                  </div>
                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Net improvement</span>
                      <span className="text-green-400 font-bold">+18.8%</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply All Optimizations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceDashboard; 