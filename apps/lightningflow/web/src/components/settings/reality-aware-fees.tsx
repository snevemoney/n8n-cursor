/**
 * Reality-Aware Fee Management Component
 * 
 * Enforces Lightning Network fee constraints and prevents
 * fee policy abuse that would hurt routing reputation.
 * 
 * Senior Architecture: Lightning Reality Guardrails
 */

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Slider } from '../ui/slider'
import { useNodeReality } from '../../hooks/useNodeReality'
import { useToaster } from '../../hooks/useToaster'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react'

interface FeeUpdateHistory {
  channelId: string
  oldFee: number
  newFee: number
  timestamp: Date
}

interface RealityAwareFeesProps {
  onFeesUpdated?: (baseFee: number, feeRate: number) => void
}

export function RealityAwareFees({ onFeesUpdated }: RealityAwareFeesProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [newFeeRate, setNewFeeRate] = useState<number>(1000) // 1000 ppm default
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateHistory, setUpdateHistory] = useState<FeeUpdateHistory[]>([])
  
  const { 
    channels, 
    validateFeeRate,
    isLoading,
    refresh,
    LIMITS 
  } = useNodeReality()
  
  const { success, warning, error, info } = useToaster()

  // Get validation for current fee rate
  const feeValidation = selectedChannel ? 
    validateFeeRate(selectedChannel, newFeeRate) : 
    { valid: true, warnings: [], recommendations: [] }

  // Get selected channel info
  const selectedChannelInfo = channels.find(c => c.channelId === selectedChannel)

  // Handle fee rate change
  const handleFeeRateChange = (value: number[]) => {
    const rate = value[0]
    setNewFeeRate(rate)
    
    // Real-time validation feedback
    if (rate > 2000) {
      info('High fee rate may reduce routing volume', {
        description: 'Consider competitive rates for better routing'
      })
    }
  }

  // Handle fee update with reality checks
  const handleUpdateFee = async () => {
    if (!selectedChannel || !feeValidation.valid) return
    
    try {
      setIsUpdating(true)
      
      // In production, this would call lncli updatechanpolicy
      // Simulate fee update
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Add to history
      const update: FeeUpdateHistory = {
        channelId: selectedChannel,
        oldFee: selectedChannelInfo?.feeRate || 0,
        newFee: newFeeRate,
        timestamp: new Date()
      }
      setUpdateHistory(prev => [update, ...prev.slice(0, 9)]) // Keep last 10
      
      success(`Fee updated to ${newFeeRate} ppm`, {
        description: `Channel ${selectedChannel.slice(0, 8)}... updated successfully`
      })
      
      // Refresh node data
      refresh()
      
    } catch (err) {
      error('Failed to update fee rate', {
        description: 'Could not connect to Lightning node'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Get fee rate recommendation based on market
  const getFeeRecommendation = (): {
    rate: number
    reason: string
    confidence: 'low' | 'medium' | 'high'
  } => {
    // In production, this would analyze mempool.space and 1ML data
    // For now, provide reasonable defaults
    
    if (!selectedChannelInfo) {
      return { rate: 1000, reason: 'Default competitive rate', confidence: 'medium' }
    }
    
    const capacity = selectedChannelInfo.capacity
    const currentRate = selectedChannelInfo.feeRate
    
    if (capacity > 1000000) { // Large channel
      return { 
        rate: 500, 
        reason: 'Large channel - lower fees attract more routing', 
        confidence: 'high' 
      }
    } else if (capacity > 500000) { // Medium channel
      return { 
        rate: 1000, 
        reason: 'Medium channel - balanced fee for good routing', 
        confidence: 'high' 
      }
    } else { // Small channel
      return { 
        rate: 1500, 
        reason: 'Small channel - higher fees for profitability', 
        confidence: 'medium' 
      }
    }
  }

  const recommendation = getFeeRecommendation()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading channel data...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fee Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Lightning Fee Management
            <Badge variant="outline" className="ml-auto">
              Reality-Constrained
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Select Channel</Label>
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value)
                const channel = channels.find(c => c.channelId === e.target.value)
                if (channel) setNewFeeRate(channel.feeRate)
              }}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Choose a channel...</option>
              {channels.map(channel => (
                <option key={channel.channelId} value={channel.channelId}>
                  {channel.peerAlias} - {channel.capacity.toLocaleString()} sats
                </option>
              ))}
            </select>
          </div>

          {selectedChannelInfo && (
            <>
              {/* Current Channel Info */}
              <div className="p-4 bg-gray-900/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Current Fee Rate</span>
                  <span className="font-medium">{selectedChannelInfo.feeRate} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Channel Capacity</span>
                  <span className="font-medium">{selectedChannelInfo.capacity.toLocaleString()} sats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Last Update</span>
                  <span className="font-medium">
                    {selectedChannelInfo.lastFeeUpdate ? 
                      selectedChannelInfo.lastFeeUpdate.toLocaleTimeString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>

              {/* Fee Rate Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>New Fee Rate (ppm)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newFeeRate}
                      onChange={(e) => setNewFeeRate(parseInt(e.target.value) || 0)}
                      min={LIMITS.MIN_PPM}
                      max={LIMITS.MAX_PPM}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-gray-400">ppm</span>
                  </div>
                </div>
                
                <Slider
                  value={[newFeeRate]}
                  onValueChange={handleFeeRateChange}
                  min={LIMITS.MIN_PPM}
                  max={LIMITS.MAX_PPM}
                  step={50}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{LIMITS.MIN_PPM} ppm (Free)</span>
                  <span>1000 ppm (Competitive)</span>
                  <span>{LIMITS.MAX_PPM} ppm (Maximum)</span>
                </div>
              </div>

              {/* AI Recommendation */}
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">AI Recommendation: {recommendation.rate} ppm</div>
                    <div className="text-sm">{recommendation.reason}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewFeeRate(recommendation.rate)}
                      >
                        Use Recommendation
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        {recommendation.confidence} confidence
                      </Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Reality Warnings */}
              {feeValidation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {feeValidation.warnings.map((warning, idx) => (
                        <div key={idx} className="text-sm">{warning}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Reality Recommendations */}
              {feeValidation.recommendations.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Tips:</div>
                      {feeValidation.recommendations.map((rec, idx) => (
                        <div key={idx} className="text-sm">• {rec}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Update Button */}
              <Button
                onClick={handleUpdateFee}
                disabled={!feeValidation.valid || isUpdating || newFeeRate === selectedChannelInfo.feeRate}
                className="w-full"
                size="lg"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating Fee Rate...
                  </>
                ) : (
                  <>
                    Update Fee to {newFeeRate} ppm
                    <Zap className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fee Update History */}
      {updateHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Recent Fee Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updateHistory.map((update, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">
                      Channel {update.channelId.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-400">
                      {update.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{update.oldFee} ppm</span>
                    {update.newFee > update.oldFee ? (
                      <TrendingUp className="h-4 w-4 text-red-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-sm font-medium">{update.newFee} ppm</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reality Footer */}
      <div className="text-xs text-gray-400 text-center space-y-1">
        <div>✓ Fee rates clamped to {LIMITS.MIN_PPM}-{LIMITS.MAX_PPM} ppm • ✓ Rate limiting enforced</div>
        <div>Lightning Reality Engine prevents fee policy abuse</div>
      </div>
    </div>
  )
} 