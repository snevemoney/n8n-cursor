/**
 * Lightning AI Node Platform - Control Center (Settings)
 * 
 * Workspace configuration, mode management, and administrative controls
 */

"use client"

import React, { useState } from 'react';
import { Button } from "../../components/ui/button"
import { ArrowLeft, Save, Settings, Network, Shield, Zap, Sliders, Bell, Code, User, Bitcoin, PaintBucket, Monitor, AlertTriangle, RefreshCw, Trash2, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { Switch } from "../../components/ui/switch"
import { useNodeMeta } from '../../hooks/useNodeMeta'
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { 
  PAGE_TITLES, 
  DESCRIPTIONS, 
  ACTION_LABELS, 
  CONCEPT_LABELS, 
  SUCCESS_LABELS,
  ERROR_LABELS 
} from '../../lib/labels';

export default function SettingsPage() {
  const router = useRouter()
  const { 
    metadata, 
    isLoading, 
    isMockMode, 
    isLiveMode, 
    resetNode, 
    updateNodeName 
  } = useNodeMeta();
  
  const [settings, setSettings] = useState({
    // Node Settings
    enableForwarding: true,
    enableKeysend: true,
    enableWatchtower: false,
    enableAutopilot: true,
    maxHtlcMsat: "500000000",
    baseFeeMsat: "1000",
    feeRate: "0.000001",
    minChanSize: "100000",
    maxChanSize: "16777215",
    
    // Notification Settings
    emailNotifications: true,
    paymentNotifications: true,
    channelNotifications: true,
    routingNotifications: false,
    backupNotifications: true,
    
    // UI Settings
    reducedMotion: false,
    compactView: false,
    
    // Security Settings
    twoFactorAuth: false,
    autoLock: true,
    autoLockTimeout: "15",
    allowRemoteAccess: false,
    
    // Autopilot Settings
    autopilotAllocation: "60",
    autopilotMaxChannels: "5",
    preferredNodes: "ACINQ, Bitfinex, River",
  })
  
  const [nodeName, setNodeName] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (metadata?.label) {
      // Remove mode prefix for editing
      const cleanName = metadata.label.replace('🧪 ', '').replace(' (Mock)', '');
      setNodeName(cleanName);
    }
  }, [metadata]);

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    })
  }
  
  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    })
  }
  
  const handleSave = () => {
    toast.success(SUCCESS_LABELS.settingsSaved);
  }

  const handleSaveNodeName = async () => {
    if (!nodeName.trim()) {
      toast.error(ERROR_LABELS.validationError);
      return;
    }

    setIsSaving(true);
    
    try {
      await updateNodeName(nodeName.trim());
      toast.success(`${CONCEPT_LABELS.node} name updated successfully`);
    } catch (error) {
      toast.error(ERROR_LABELS.serverError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetMockMode = async () => {
    if (!metadata?.canReset) {
      toast.error(`Cannot reset in ${metadata?.mode} mode`);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reset your ${CONCEPT_LABELS.mockMode.toLowerCase()} ${CONCEPT_LABELS.node.toLowerCase()}? This will clear all test data.`
    );
    
    if (!confirmed) return;

    setIsResetting(true);
    
    try {
      await resetNode();
      toast.success(`${CONCEPT_LABELS.mockMode} ${CONCEPT_LABELS.node.toLowerCase()} reset successfully`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(ERROR_LABELS.serverError);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 animate-pulse" />
          <h1 className="text-2xl font-bold">Loading Settings...</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{PAGE_TITLES.settings}</h1>
          <p className="text-muted-foreground mt-1">{DESCRIPTIONS.settings}</p>
        </div>
        <Badge variant={metadata?.mode === 'mock' ? 'secondary' : 'default'}>
          {metadata?.label}
        </Badge>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="lightning">Lightning</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Node Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Node Configuration
              </CardTitle>
              <CardDescription>
                Basic Lightning node settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="forwarding">Enable Forwarding</Label>
                  <Switch
                    id="forwarding"
                    checked={settings.enableForwarding}
                    onCheckedChange={() => handleToggle('enableForwarding')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="keysend">Enable Keysend</Label>
                  <Switch
                    id="keysend"
                    checked={settings.enableKeysend}
                    onCheckedChange={() => handleToggle('enableKeysend')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="watchtower">Enable Watchtower</Label>
                  <Switch
                    id="watchtower"
                    checked={settings.enableWatchtower}
                    onCheckedChange={() => handleToggle('enableWatchtower')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autopilot">Enable Autopilot</Label>
                  <Switch
                    id="autopilot"
                    checked={settings.enableAutopilot}
                    onCheckedChange={() => handleToggle('enableAutopilot')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lightning" className="space-y-6">
          {/* Fee Rate Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-orange-500" />
                Fee Rate Configuration
              </CardTitle>
              <CardDescription>
                Configure your Lightning node's fee structure and routing policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseFee">Base Fee (msat)</Label>
                  <Input
                    id="baseFee"
                    value={settings.baseFeeMsat}
                    onChange={(e) => handleChange('baseFeeMsat', e.target.value)}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fixed fee charged per transaction
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeRate">Fee Rate (ppm)</Label>
                  <Input
                    id="feeRate"
                    value={settings.feeRate}
                    onChange={(e) => handleChange('feeRate', e.target.value)}
                    placeholder="0.000001"
                  />
                  <p className="text-xs text-muted-foreground">
                    Proportional fee rate (parts per million)
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Current Fee Structure</h4>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p>Base Fee: {settings.baseFeeMsat} msat (~{(parseInt(settings.baseFeeMsat) / 1000).toFixed(1)} sats)</p>
                  <p>Fee Rate: {(parseFloat(settings.feeRate) * 1000000).toFixed(0)} ppm (0.{(parseFloat(settings.feeRate) * 1000000).toFixed(0).padStart(4, '0')}%)</p>
                  <p className="mt-2 font-medium">
                    Example: 100,000 sat payment = {Math.round(parseInt(settings.baseFeeMsat) / 1000 + 100000 * parseFloat(settings.feeRate))} sats fee
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channel Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-500" />
                Channel Configuration
              </CardTitle>
              <CardDescription>
                Set limits and preferences for Lightning channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minChanSize">Min Channel Size (sats)</Label>
                  <Input
                    id="minChanSize"
                    value={settings.minChanSize}
                    onChange={(e) => handleChange('minChanSize', e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxChanSize">Max Channel Size (sats)</Label>
                  <Input
                    id="maxChanSize"
                    value={settings.maxChanSize}
                    onChange={(e) => handleChange('maxChanSize', e.target.value)}
                    placeholder="16777215"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxHtlc">Max HTLC (msat)</Label>
                  <Input
                    id="maxHtlc"
                    value={settings.maxHtlcMsat}
                    onChange={(e) => handleChange('maxHtlcMsat', e.target.value)}
                    placeholder="500000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lightning Speed Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Lightning Speed Monitoring
              </CardTitle>
              <CardDescription>
                Real-time transaction speed tracking and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">365ms</div>
                  <div className="text-sm text-muted-foreground">Current Speed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">215ms</div>
                  <div className="text-sm text-muted-foreground">Fastest Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">375ms</div>
                  <div className="text-sm text-muted-foreground">7-Day Average</div>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">Performance Optimization</h4>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your node is performing well. Consider optimizing channel liquidity for even faster routing.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security features and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={() => handleToggle('twoFactorAuth')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autolock">Auto-lock Session</Label>
                    <p className="text-sm text-muted-foreground">Automatically lock after inactivity</p>
                  </div>
                  <Switch
                    id="autolock"
                    checked={settings.autoLock}
                    onCheckedChange={() => handleToggle('autoLock')}
                  />
                </div>
                {settings.autoLock && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="timeout">Auto-lock Timeout (minutes)</Label>
                    <Input
                      id="timeout"
                      value={settings.autoLockTimeout}
                      onChange={(e) => handleChange('autoLockTimeout', e.target.value)}
                      placeholder="15"
                      className="w-32"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="remote">Allow Remote Access</Label>
                    <p className="text-sm text-muted-foreground">Enable access from external networks</p>
                  </div>
                  <Switch
                    id="remote"
                    checked={settings.allowRemoteAccess}
                    onCheckedChange={() => handleToggle('allowRemoteAccess')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which events trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email Notifications</Label>
                  <Switch
                    id="email"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle('emailNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payments">Payment Notifications</Label>
                  <Switch
                    id="payments"
                    checked={settings.paymentNotifications}
                    onCheckedChange={() => handleToggle('paymentNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="channels">Channel Notifications</Label>
                  <Switch
                    id="channels"
                    checked={settings.channelNotifications}
                    onCheckedChange={() => handleToggle('channelNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="routing">Routing Notifications</Label>
                  <Switch
                    id="routing"
                    checked={settings.routingNotifications}
                    onCheckedChange={() => handleToggle('routingNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup">Backup Notifications</Label>
                  <Switch
                    id="backup"
                    checked={settings.backupNotifications}
                    onCheckedChange={() => handleToggle('backupNotifications')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Autopilot Settings */}
          {settings.enableAutopilot && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Autopilot Configuration
                </CardTitle>
                <CardDescription>
                  Configure automatic channel management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allocation">Allocation Percentage</Label>
                    <Input
                      id="allocation"
                      value={settings.autopilotAllocation}
                      onChange={(e) => handleChange('autopilotAllocation', e.target.value)}
                      placeholder="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxChannels">Max Channels</Label>
                    <Input
                      id="maxChannels"
                      value={settings.autopilotMaxChannels}
                      onChange={(e) => handleChange('autopilotMaxChannels', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred">Preferred Nodes</Label>
                  <Textarea
                    id="preferred"
                    value={settings.preferredNodes}
                    onChange={(e) => handleChange('preferredNodes', e.target.value)}
                    placeholder="Enter preferred node aliases or pubkeys"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* UI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Interface Preferences
              </CardTitle>
              <CardDescription>
                Customize the user interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="motion">Reduced Motion</Label>
                <Switch
                  id="motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={() => handleToggle('reducedMotion')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compact">Compact View</Label>
                <Switch
                  id="compact"
                  checked={settings.compactView}
                  onCheckedChange={() => handleToggle('compactView')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {ACTION_LABELS.saveSettings}
        </Button>
      </div>
    </div>
  )
} 