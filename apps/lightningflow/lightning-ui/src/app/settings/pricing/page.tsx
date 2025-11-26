"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  Settings,
  Zap,
  Target,
  Calculator,
  PiggyBank,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Globe,
  Shield
} from 'lucide-react';

interface PricingConfig {
  primary_currency: 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY';
  show_btc_amounts: boolean;
  btc_display_mode: 'sats' | 'btc' | 'both';
  dynamic_pricing: boolean;
  fee_buffer_percent: number;
  auto_adjust_fees: boolean;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  routing_preference: 'lowest_fee' | 'fastest' | 'most_reliable';
  volatility_protection: boolean;
  price_update_interval: number;
}

interface TierBenefits {
  name: string;
  fee: string;
  description: string;
  features: string[];
  color: string;
  recommended?: boolean;
}

export default function PricingSettingsPage() {
  const [config, setConfig] = useState<PricingConfig>({
    primary_currency: 'USD',
    show_btc_amounts: true,
    btc_display_mode: 'sats',
    dynamic_pricing: true,
    fee_buffer_percent: 1.0,
    auto_adjust_fees: true,
    tier: 'starter',
    routing_preference: 'lowest_fee',
    volatility_protection: true,
    price_update_interval: 30
  });

  const [currentPrices, setCurrentPrices] = useState({
    USD: 69420,
    CAD: 94250,
    EUR: 63890,
    GBP: 55320,
    JPY: 10480000
  });

  const [isLoading, setIsLoading] = useState(false);

  const tiers: TierBenefits[] = [
    {
      name: 'Free',
      fee: '0% + routing',
      description: 'Perfect for getting started',
      features: ['Basic node setup', 'Simple payments', 'Community support', 'Basic analytics'],
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    },
    {
      name: 'Starter',
      fee: '1.5% + routing cap',
      description: 'For growing businesses',
      features: ['Advanced routing', 'Team wallets', 'AI fee optimization', 'Priority support'],
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      recommended: true
    },
    {
      name: 'Pro',
      fee: '0.9% flat',
      description: 'For consistent Bitcoin users',
      features: ['Custom fee policies', 'Advanced analytics', 'White-label options', 'API access'],
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
      name: 'Enterprise',
      fee: 'Custom pricing',
      description: 'For large operations',
      features: ['Dedicated support', 'Custom integrations', 'SLA guarantees', 'Multi-node management'],
      color: 'bg-gold-500/20 text-yellow-400 border-yellow-500/30'
    }
  ];

  const calculateEstimatedFee = (amount: number, currency: string) => {
    const btcPrice = currentPrices[currency as keyof typeof currentPrices];
    const amountSats = Math.round((amount / btcPrice) * 100_000_000);
    
    let feePercent = 0;
    switch (config.tier) {
      case 'free': feePercent = 0; break;
      case 'starter': feePercent = 1.5; break;
      case 'pro': feePercent = 0.9; break;
      default: feePercent = 0.5; break;
    }
    
    const baseFee = (amount * feePercent) / 100;
    const bufferFee = config.dynamic_pricing ? (amount * config.fee_buffer_percent) / 100 : 0;
    
    return {
      base: baseFee,
      buffer: bufferFee,
      total: baseFee + bufferFee,
      sats: Math.round((amountSats * feePercent) / 100)
    };
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Pricing settings saved successfully');
    } catch (error) {
      toast.error('Failed to save pricing settings');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { USD: '$', CAD: 'C$', EUR: '€', GBP: '£', JPY: '¥' };
    const symbol = symbols[currency as keyof typeof symbols];
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    })}`;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pricing & Currency Settings</h1>
          <p className="text-gray-400">Configure fiat-first pricing with Bitcoin volatility protection</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="currency" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="currency">Currency & Display</TabsTrigger>
          <TabsTrigger value="tiers">Service Tiers</TabsTrigger>
          <TabsTrigger value="volatility">Volatility Protection</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        {/* Currency & Display Settings */}
        <TabsContent value="currency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Primary Currency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Default Display Currency</Label>
                  <Select 
                    value={config.primary_currency} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, primary_currency: value as any }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                      <SelectItem value="CAD">🇨🇦 Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">🇬🇧 British Pound (GBP)</SelectItem>
                      <SelectItem value="JPY">🇯🇵 Japanese Yen (JPY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Current Price</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    1 BTC = {formatCurrency(currentPrices[config.primary_currency], config.primary_currency)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Updated {config.price_update_interval} seconds ago
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bitcoin Display Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Show Bitcoin Amounts</Label>
                    <p className="text-sm text-gray-500">Display BTC/sats alongside fiat</p>
                  </div>
                  <Switch 
                    checked={config.show_btc_amounts}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, show_btc_amounts: checked }))}
                  />
                </div>

                {config.show_btc_amounts && (
                  <div>
                    <Label className="text-gray-300">Bitcoin Display Mode</Label>
                    <Select 
                      value={config.btc_display_mode} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, btc_display_mode: value as any }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sats">Satoshis only</SelectItem>
                        <SelectItem value="btc">Bitcoin only</SelectItem>
                        <SelectItem value="both">Both sats and BTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Example Display:</p>
                  <div className="text-white font-medium">
                    {formatCurrency(25.00, config.primary_currency)}
                    {config.show_btc_amounts && (
                      <span className="text-sm text-gray-400 ml-2">
                        {config.btc_display_mode === 'sats' && '≈ 36,000 sats'}
                        {config.btc_display_mode === 'btc' && '≈ 0.00036000 BTC'}
                        {config.btc_display_mode === 'both' && '≈ 36,000 sats (0.00036 BTC)'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Service Tiers */}
        <TabsContent value="tiers" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Service Tier Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                      config.tier === tier.name.toLowerCase() 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setConfig(prev => ({ ...prev, tier: tier.name.toLowerCase() as any }))}
                  >
                    {tier.recommended && (
                      <Badge className="absolute -top-2 left-4 bg-blue-600 text-white">
                        Recommended
                      </Badge>
                    )}
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-white">{tier.name}</h3>
                        <p className="text-sm font-medium text-blue-400">{tier.fee}</p>
                        <p className="text-xs text-gray-400">{tier.description}</p>
                      </div>
                      
                      <ul className="space-y-1">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs text-gray-300">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fee Calculator */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fee Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[100, 1000, 10000].map((amount) => {
                  const fee = calculateEstimatedFee(amount, config.primary_currency);
                  return (
                    <div key={amount} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">
                        {formatCurrency(amount, config.primary_currency)} payment
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(fee.total, config.primary_currency)} fee
                      </div>
                      <div className="text-xs text-gray-400">
                        ≈ {fee.sats.toLocaleString()} sats
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volatility Protection */}
        <TabsContent value="volatility" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Volatility Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Enable Dynamic Pricing</Label>
                  <p className="text-sm text-gray-500">Automatically adjust for BTC price changes</p>
                </div>
                <Switch 
                  checked={config.dynamic_pricing}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, dynamic_pricing: checked }))}
                />
              </div>

              {config.dynamic_pricing && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Fee Buffer ({config.fee_buffer_percent}%)</Label>
                    <Slider
                      value={[config.fee_buffer_percent]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, fee_buffer_percent: value }))}
                      min={0.1}
                      max={5.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0.1% (Minimal)</span>
                      <span>2.5% (Balanced)</span>
                      <span>5.0% (Maximum)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Auto-Adjust Fees</Label>
                      <p className="text-sm text-gray-500">Let AI optimize fees based on network conditions</p>
                    </div>
                    <Switch 
                      checked={config.auto_adjust_fees}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_adjust_fees: checked }))}
                    />
                  </div>
                </>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Volatility Protection Active</span>
                </div>
                <p className="text-sm text-gray-300">
                  Fees will be calculated in real-time based on current BTC price. 
                  Your customers see stable {config.primary_currency} prices while you're protected from volatility.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Routing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Default Routing Strategy</Label>
                  <Select 
                    value={config.routing_preference} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, routing_preference: value as any }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lowest_fee">Lowest Fee</SelectItem>
                      <SelectItem value="fastest">Fastest Settlement</SelectItem>
                      <SelectItem value="most_reliable">Most Reliable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Price Update Interval ({config.price_update_interval}s)</Label>
                  <Slider
                    value={[config.price_update_interval]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, price_update_interval: value }))}
                    min={10}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Smart Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">AI Fee Optimization</Label>
                    <p className="text-sm text-gray-500">Let AI adjust fees for maximum efficiency</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Smart Contract Generation</Label>
                    <p className="text-sm text-gray-500">Auto-generate contracts for invoices</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Earnings Forecasting</Label>
                    <p className="text-sm text-gray-500">Predict earnings based on patterns</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 