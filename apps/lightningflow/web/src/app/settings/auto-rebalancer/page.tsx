"use client";
import { apiPath } from '@/lib/base-path';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from "sonner";
import {
  Settings,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Eye,
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface RebalancerSettings {
  enabled: boolean;
  min_imbalance_ratio: number;
  max_fee_per_rebalance: number;
  rebalance_frequency_hours: number;
  ai_suggestions_enabled: boolean;
  auto_fee_updates: boolean;
  confidence_threshold: number;
}

interface ChannelAction {
  id: string;
  channel_id: string;
  peer_alias: string;
  action_type: string;
  trigger_source: string;
  success: boolean;
  cost_sats: number;
  ai_reasoning: string;
  confidence_score: number;
  created_at: string;
  command_executed: string;
}

const AutoRebalancerSettings: React.FC = () => {
  const [settings, setSettings] = useState<RebalancerSettings>({
    enabled: false,
    min_imbalance_ratio: 0.25,
    max_fee_per_rebalance: 1000,
    rebalance_frequency_hours: 6,
    ai_suggestions_enabled: true,
    auto_fee_updates: false,
    confidence_threshold: 0.7
  });

  const [recentActions, setRecentActions] = useState<ChannelAction[]>([]);
  const [previewCommand, setPreviewCommand] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecentActions = async () => {
    try {
      const response = await fetch(apiPath('/api/channel/audit?limit=20'));
      const data = await response.json();
      setRecentActions(data.actions || []);
    } catch (error) {
      console.error('Failed to fetch recent actions:', error);
    }
  };

  const generatePreviewCommand = () => {
    const cmd = `bos rebalance --amount=100000 --max_fee=${settings.max_fee_per_rebalance} --avoid_high_inbound --timeout=300`;
    setPreviewCommand(cmd);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to your user settings table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success("Auto-rebalancer settings have been updated");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActions();
    generatePreviewCommand();
  }, [settings]);

  const formatCurrency = (sats: number) => {
    return new Intl.NumberFormat('en-US').format(sats);
  };

  const getActionBadgeColor = (action: ChannelAction) => {
    if (!action.success) return 'destructive';
    if (action.trigger_source === 'ai') return 'secondary';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-400" />
            Auto-Rebalancer Settings
          </h1>
          <p className="text-gray-400">
            Configure automated channel rebalancing and fee optimization for your Lightning node
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Command Preview</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Main Toggle */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Auto-Rebalancer Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white text-base">Enable Auto-Rebalancer</Label>
                    <p className="text-sm text-gray-400">
                      Automatically rebalance channels when imbalance thresholds are met
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
                  />
                </div>
                
                {settings.enabled && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Auto-rebalancer is active and monitoring your channels
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rebalancing Parameters */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Rebalancing Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white">Minimum Imbalance Ratio</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.min_imbalance_ratio]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, min_imbalance_ratio: value }))}
                      min={0.1}
                      max={0.4}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400">
                      Trigger rebalancing when local balance is below {(settings.min_imbalance_ratio * 100).toFixed(0)}% 
                      or above {((1 - settings.min_imbalance_ratio) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Max Fee Per Rebalance (sats)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.max_fee_per_rebalance]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, max_fee_per_rebalance: value }))}
                      min={100}
                      max={5000}
                      step={100}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400">
                      Maximum {formatCurrency(settings.max_fee_per_rebalance)} sats per rebalancing operation
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Rebalance Frequency (hours)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.rebalance_frequency_hours]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, rebalance_frequency_hours: value }))}
                      min={1}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400">
                      Check for rebalancing opportunities every {settings.rebalance_frequency_hours} hour(s)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI Enhancement Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">AI Suggestions</Label>
                    <p className="text-sm text-gray-400">
                      Let AI analyze patterns and suggest optimal rebalancing strategies
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai_suggestions_enabled}
                    onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, ai_suggestions_enabled: enabled }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto Fee Updates</Label>
                    <p className="text-sm text-gray-400">
                      Automatically adjust channel fees based on AI recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_fee_updates}
                    onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, auto_fee_updates: enabled }))}
                  />
                </div>

                {settings.ai_suggestions_enabled && (
                  <div className="space-y-3">
                    <Label className="text-white">AI Confidence Threshold</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.confidence_threshold]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, confidence_threshold: value }))}
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-400">
                        Only execute AI suggestions with {(settings.confidence_threshold * 100).toFixed(0)}%+ confidence
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={saveSettings} 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </TabsContent>

          {/* Command Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  Command Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-green-400">
                  {previewCommand}
                </div>
                <p className="text-sm text-gray-400">
                  This is an example of the rebalancing command that would be executed based on your current settings.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Max Fee</div>
                    <div className="text-lg font-semibold text-white">
                      {formatCurrency(settings.max_fee_per_rebalance)} sats
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Frequency</div>
                    <div className="text-lg font-semibold text-white">
                      Every {settings.rebalance_frequency_hours}h
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">AI Confidence</div>
                    <div className="text-lg font-semibold text-white">
                      {(settings.confidence_threshold * 100).toFixed(0)}%+
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Recent Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No rebalancing actions yet. Actions will appear here once the auto-rebalancer starts working.
                    </div>
                  ) : (
                    recentActions.map((action) => (
                      <div key={action.id} className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={getActionBadgeColor(action)}>
                              {action.action_type}
                            </Badge>
                            <span className="text-white font-medium">{action.peer_alias}</span>
                            <span className="text-gray-400 text-sm">{action.channel_id.slice(0, 8)}...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {action.success ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                            <span className="text-sm text-gray-400">
                              {action.cost_sats ? `${formatCurrency(action.cost_sats)} sats` : 'Free'}
                            </span>
                          </div>
                        </div>
                        
                        {action.ai_reasoning && (
                          <div className="text-sm text-gray-300 italic">
                            AI: {action.ai_reasoning}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{action.trigger_source}</span>
                          <span>{new Date(action.created_at).toLocaleString()}</span>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2">
                              View Command
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800">
                            <DialogHeader>
                              <DialogTitle className="text-white">Executed Command</DialogTitle>
                              <DialogDescription>
                                Command that was executed for this action
                              </DialogDescription>
                            </DialogHeader>
                            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-green-400">
                              {action.command_executed}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutoRebalancerSettings; 