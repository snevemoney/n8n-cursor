"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import {
  QrCode,
  Copy,
  Download,
  Settings,
  Zap,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Terminal,
  Wallet,
  Target
} from 'lucide-react';
import QRCode from 'qrcode';

interface TerminalConfig {
  id: string;
  name: string;
  location: string;
  type: 'fixed_amount' | 'variable_amount' | 'tip_jar';
  amount?: number;
  currency: 'USD' | 'CAD' | 'EUR' | 'BTC';
  description: string;
  employee_id?: string;
  tags: string[];
  split_rules: {
    owner_percentage: number;
    employee_percentage: number;
    tip_percentage: number;
  };
  auto_routing: boolean;
  routing_preference: 'lowest_fee' | 'fastest' | 'most_reliable';
}

interface WalletRoute {
  wallet_id: string;
  wallet_name: string;
  confidence_score: number;
  estimated_fee: string;
  success_rate: number;
  reason: string;
}

export function SmartTerminalGenerator() {
  const [config, setConfig] = useState<TerminalConfig>({
    id: '',
    name: '',
    location: '',
    type: 'variable_amount',
    currency: 'USD',
    description: '',
    tags: [],
    split_rules: {
      owner_percentage: 85,
      employee_percentage: 10,
      tip_percentage: 5
    },
    auto_routing: true,
    routing_preference: 'lowest_fee'
  });

  const [qrCode, setQrCode] = useState<string>('');
  const [lnurlPay, setLnurlPay] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [routingPreview, setRoutingPreview] = useState<WalletRoute | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Generate QR code when configuration changes
  useEffect(() => {
    if (config.name && config.description) {
      generatePreview();
    }
  }, [config]);

  const generatePreview = async () => {
    if (!config.name.trim() || !config.description.trim()) return;

    setIsPreviewMode(true);
    
    try {
      // Simulate calling the wallet routing API
      const routingResponse = await simulateWalletRouting();
      setRoutingPreview(routingResponse);

      // Generate LNURL-pay URL
      const terminalId = config.id || `terminal-${Date.now()}`;
      const baseUrl = window.location.origin;
      const lnurlPayUrl = `${baseUrl}/api/terminal-pay/${terminalId}`;
      
      // For demonstration, create a simple LNURL
      setLnurlPay(lnurlPayUrl);

      // Generate QR code
      const qrCodeData = await QRCode.toDataURL(lnurlPayUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCode(qrCodeData);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const simulateWalletRouting = async (): Promise<WalletRoute> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock routing decision based on preferences
    const routes = [
      {
        wallet_id: 'main-terminal',
        wallet_name: 'Main POS Terminal',
        confidence_score: 96,
        estimated_fee: '$0.08',
        success_rate: 99.2,
        reason: 'Optimal routing - excellent performance across all metrics'
      },
      {
        wallet_id: 'backup-terminal',
        wallet_name: 'Backup Terminal',
        confidence_score: 89,
        estimated_fee: '$0.12',
        success_rate: 98.1,
        reason: 'Selected for high reliability and uptime'
      }
    ];

    return routes[0]; // Return best route
  };

  const handleGenerate = async () => {
    if (!config.name.trim() || !config.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      // In production, this would save the terminal configuration to the database
      const terminalId = `terminal-${Date.now()}`;
      setConfig(prev => ({ ...prev, id: terminalId }));
      
      await generatePreview();
      
      toast.success('Terminal QR code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate terminal');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.download = `${config.name.replace(/\s+/g, '-')}-qr.png`;
    link.href = qrCode;
    link.click();
    
    toast.success('QR code downloaded');
  };

  const updateSplitRules = (field: keyof typeof config.split_rules, value: number) => {
    const newRules = { ...config.split_rules, [field]: value };
    
    // Ensure percentages add up to 100
    const total = Object.values(newRules).reduce((sum, val) => sum + val, 0);
    if (total > 100) {
      toast.error('Total percentage cannot exceed 100%');
      return;
    }
    
    setConfig(prev => ({ ...prev, split_rules: newRules }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Smart Terminal Generator</h1>
          <p className="text-gray-400">Create intelligent payment terminals with automatic routing</p>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Terminal Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Terminal Name *</Label>
                  <Input
                    id="name"
                    placeholder="Table 3 Terminal"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    placeholder="Main Dining Area"
                    value={config.location}
                    onChange={(e) => setConfig(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Payment for dining services at Table 3"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-gray-300">Terminal Type</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable_amount">Variable Amount</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="tip_jar">Tip Jar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                  <Select
                    value={config.currency}
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {config.type === 'fixed_amount' && (
                <div>
                  <Label htmlFor="amount" className="text-gray-300">Fixed Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="25.00"
                    value={config.amount || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Smart Routing & Splits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Routing Preference</Label>
                <Select
                  value={config.routing_preference}
                  onValueChange={(value: any) => setConfig(prev => ({ ...prev, routing_preference: value }))}
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

              <div className="space-y-3">
                <Label className="text-gray-300">Payment Splits (%)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400">Owner</Label>
                    <Input
                      type="number"
                      value={config.split_rules.owner_percentage}
                      onChange={(e) => updateSplitRules('owner_percentage', parseFloat(e.target.value) || 0)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Employee</Label>
                    <Input
                      type="number"
                      value={config.split_rules.employee_percentage}
                      onChange={(e) => updateSplitRules('employee_percentage', parseFloat(e.target.value) || 0)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Tips</Label>
                    <Input
                      type="number"
                      value={config.split_rules.tip_percentage}
                      onChange={(e) => updateSplitRules('tip_percentage', parseFloat(e.target.value) || 0)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Total: {Object.values(config.split_rules).reduce((sum, val) => sum + val, 0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !config.name.trim() || !config.description.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generate Smart Terminal
              </>
            )}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Routing Preview */}
          {routingPreview && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Routing Decision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">{routingPreview.wallet_name}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {routingPreview.confidence_score}% confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Est. Fee</p>
                      <p className="text-white font-medium">{routingPreview.estimated_fee}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Success Rate</p>
                      <p className="text-white font-medium">{routingPreview.success_rate}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Routing Reason:</p>
                    <p className="text-sm text-white">{routingPreview.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code Display */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Payment QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCode ? (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCode} alt="Payment QR Code" className="w-64 h-64" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={lnurlPay}
                        readOnly
                        className="bg-gray-800 border-gray-700 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(lnurlPay, 'LNURL')}
                        className="border-gray-700"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      className="w-full border-gray-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Configure your terminal to generate QR code</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terminal Summary */}
          {config.name && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Terminal Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{config.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{config.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency:</span>
                    <span className="text-white">{config.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner Split:</span>
                    <span className="text-white">{config.split_rules.owner_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Employee Split:</span>
                    <span className="text-white">{config.split_rules.employee_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Routing:</span>
                    <span className="text-white capitalize">{config.routing_preference.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 