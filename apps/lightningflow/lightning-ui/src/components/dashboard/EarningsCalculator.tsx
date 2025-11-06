"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Users,
  Coffee,
  Scissors,
  Briefcase,
  Utensils
} from 'lucide-react';

interface CalculatorInputs {
  btcAmount: number;
  businessType: 'hobby' | 'coffee' | 'barbershop' | 'freelancer' | 'restaurant';
  clientCount: number;
  avgTransaction: number;
  timeframe: 'week' | 'month' | 'year';
}

interface EarningsProjection {
  grossRevenue: number;
  routingFees: number;
  platformFees: number;
  rebalancingCosts: number;
  netProfit: number;
  roi: number;
}

const EarningsCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    btcAmount: 0.1,
    businessType: 'coffee',
    clientCount: 50,
    avgTransaction: 25,
    timeframe: 'month'
  });

  const [hobbyProjection, setHobbyProjection] = useState<EarningsProjection | null>(null);
  const [businessProjection, setBusinessProjection] = useState<EarningsProjection | null>(null);

  const businessTypes = [
    { id: 'hobby', name: 'Hobby Node', icon: Zap, multiplier: 0 },
    { id: 'coffee', name: 'Coffee Shop', icon: Coffee, multiplier: 1.2 },
    { id: 'barbershop', name: 'Barbershop', icon: Scissors, multiplier: 0.8 },
    { id: 'freelancer', name: 'Freelancer', icon: Briefcase, multiplier: 2.5 },
    { id: 'restaurant', name: 'Restaurant', icon: Utensils, multiplier: 3.2 }
  ];

  const calculateEarnings = (type: 'hobby' | 'business'): EarningsProjection => {
    const btcPrice = 69420; // Mock BTC price
    const btcValueUSD = inputs.btcAmount * btcPrice;
    const timeMultiplier = inputs.timeframe === 'week' ? 1 : inputs.timeframe === 'month' ? 4.33 : 52;

    if (type === 'hobby') {
      // Based on real hobby node data
      const grossRevenue = 0;
      const routingFees = (btcValueUSD * 0.0002) * timeMultiplier; // 0.02% monthly
      const platformFees = 0;
      const rebalancingCosts = routingFees * 0.9; // 90% eaten by rebalancing
      const netProfit = routingFees - rebalancingCosts;
      const roi = (netProfit / btcValueUSD) * 100;

      return { grossRevenue, routingFees, platformFees, rebalancingCosts, netProfit, roi };
    } else {
      // Business node calculations
      const businessMultiplier = businessTypes.find(b => b.id === inputs.businessType)?.multiplier || 1;
      const weeklyTransactions = inputs.clientCount * (inputs.timeframe === 'week' ? 1 : 4.33);
      const grossRevenue = weeklyTransactions * inputs.avgTransaction * businessMultiplier;
      const routingFees = (btcValueUSD * 0.003) * timeMultiplier; // 0.3% monthly
      const platformFees = grossRevenue * 0.015; // 1.5% platform fee
      const rebalancingCosts = routingFees * 0.1; // AI-optimized, only 10% cost
      const netProfit = grossRevenue + routingFees - platformFees - rebalancingCosts;
      const roi = (netProfit / btcValueUSD) * 100;

      return { grossRevenue, routingFees, platformFees, rebalancingCosts, netProfit, roi };
    }
  };

  useEffect(() => {
    setHobbyProjection(calculateEarnings('hobby'));
    setBusinessProjection(calculateEarnings('business'));
  }, [inputs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Lightning Earnings Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">BTC Amount</Label>
              <div className="space-y-1">
                <Slider
                  value={[inputs.btcAmount]}
                  onValueChange={([value]) => setInputs(prev => ({ ...prev, btcAmount: value }))}
                  min={0.01}
                  max={2}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 text-center">
                  {inputs.btcAmount.toFixed(3)} BTC (≈{formatCurrency(inputs.btcAmount * 69420)})
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Business Type</Label>
              <Select 
                value={inputs.businessType} 
                onValueChange={(value) => setInputs(prev => ({ ...prev, businessType: value as any }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {inputs.businessType !== 'hobby' && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-300">Weekly Customers</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[inputs.clientCount]}
                      onValueChange={([value]) => setInputs(prev => ({ ...prev, clientCount: value }))}
                      min={1}
                      max={500}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-400 text-center">
                      {inputs.clientCount} customers/week
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Avg Transaction</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[inputs.avgTransaction]}
                      onValueChange={([value]) => setInputs(prev => ({ ...prev, avgTransaction: value }))}
                      min={5}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-400 text-center">
                      {formatCurrency(inputs.avgTransaction)} avg
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Timeframe</Label>
            <Select 
              value={inputs.timeframe} 
              onValueChange={(value) => setInputs(prev => ({ ...prev, timeframe: value as any }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Per Week</SelectItem>
                <SelectItem value="month">Per Month</SelectItem>
                <SelectItem value="year">Per Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Comparison */}
      {hobbyProjection && businessProjection && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hobby Node Results */}
          <Card className="bg-red-500/5 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                Hobby Node Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Customer Revenue</span>
                  <span className="text-gray-500">{formatCurrency(hobbyProjection.grossRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Routing Fees</span>
                  <span className="text-green-400">{formatCurrency(hobbyProjection.routingFees)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rebalancing Costs</span>
                  <span className="text-red-400">-{formatCurrency(hobbyProjection.rebalancingCosts)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Net Profit</span>
                    <span className={hobbyProjection.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(hobbyProjection.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">ROI</span>
                    <span className={hobbyProjection.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatPercentage(hobbyProjection.roi)}
                    </span>
                  </div>
                </div>
              </div>

              <Badge variant="outline" className="border-red-500 text-red-400">
                Unprofitable
              </Badge>
            </CardContent>
          </Card>

          {/* Business Node Results */}
          <Card className="bg-green-500/5 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Business Node Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Customer Revenue</span>
                  <span className="text-green-400">{formatCurrency(businessProjection.grossRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Routing Fees</span>
                  <span className="text-green-400">{formatCurrency(businessProjection.routingFees)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Fee (1.5%)</span>
                  <span className="text-red-400">-{formatCurrency(businessProjection.platformFees)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rebalancing (AI)</span>
                  <span className="text-red-400">-{formatCurrency(businessProjection.rebalancingCosts)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Net Profit</span>
                    <span className="text-green-400">
                      {formatCurrency(businessProjection.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">ROI</span>
                    <span className="text-green-400">
                      {formatPercentage(businessProjection.roi)}
                    </span>
                  </div>
                </div>
              </div>

              <Badge variant="outline" className="border-green-500 text-green-400">
                Profitable
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Improvement Summary */}
      {hobbyProjection && businessProjection && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-white">Business Node Advantage</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(businessProjection.netProfit - hobbyProjection.netProfit)}
                  </div>
                  <div className="text-sm text-gray-400">Additional {inputs.timeframe}ly profit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round((businessProjection.netProfit / Math.max(Math.abs(hobbyProjection.netProfit), 1)) * 100)}x
                  </div>
                  <div className="text-sm text-gray-400">Better performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {formatPercentage(businessProjection.roi - hobbyProjection.roi)}
                  </div>
                  <div className="text-sm text-gray-400">ROI improvement</div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Building Your Business Node
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EarningsCalculator; 