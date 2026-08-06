"use client";
import { apiPath, appPath } from '@/lib/base-path';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  TrendingUp,
  Clock,
  X
} from 'lucide-react';

interface LiquidityStatus {
  status: 'good' | 'low-inbound' | 'low-outbound' | 'imbalanced' | 'no-channels';
  inbound_sats: number;
  outbound_sats: number;
  total_channels: number;
  active_channels: number;
  issues: string[];
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
}

export function LiquidityStatus() {
  const [status, setStatus] = useState<LiquidityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkLiquidityStatus();
  }, []);

  const checkLiquidityStatus = async () => {
    try {
      const response = await fetch(apiPath('/api/liquidity/check'));
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check liquidity:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAndDismiss = () => {
    setDismissed(true);
    // Could also call API to mark as acknowledged
  };

  if (loading) return null;
  if (!status || dismissed) return null;
  if (status.status === 'good') return null;

  const getStatusInfo = () => {
    switch (status.status) {
      case 'no-channels':
        return {
          title: "🚀 Ready to Start Earning?",
          message: "You don't have any Lightning channels yet. Open your first channel to start earning Bitcoin!",
          buttonText: "Get Started",
          buttonAction: () => window.location.href = appPath('/onboarding'),
          color: 'blue',
          priority: 'high'
        };
      case 'low-inbound':
        return {
          title: "⚠️ Your Node Stopped Earning",
          message: "You need more inbound liquidity so other people can route payments through your node.",
          buttonText: "Fix This Now",
          buttonAction: () => window.location.href = appPath('/boost-liquidity'),
          color: 'amber',
          priority: 'high'
        };
      case 'imbalanced':
        return {
          title: "⚖️ Channels Need Rebalancing", 
          message: "Your channels are imbalanced. This might reduce your earning potential.",
          buttonText: "Learn How to Fix",
          buttonAction: () => window.location.href = appPath('/boost-liquidity'),
          color: 'orange',
          priority: 'medium'
        };
      case 'low-outbound':
        return {
          title: "💰 Add More Bitcoin",
          message: "You're running low on outbound liquidity. Add more Bitcoin to keep earning.",
          buttonText: "Add Funds",
          buttonAction: () => window.location.href = appPath('/payments/receive'),
          color: 'yellow',
          priority: 'medium'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-200', 
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-200',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'
  };

  const buttonClasses: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    orange: 'bg-orange-600 hover:bg-orange-700', 
    yellow: 'bg-yellow-600 hover:bg-yellow-700'
  };

  return (
    <Alert className={`${colorClasses[statusInfo.color]} relative`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">{statusInfo.title}</span>
            {statusInfo.priority === 'high' && (
              <Badge variant="outline" className="text-xs border-current">
                Urgent
              </Badge>
            )}
          </div>
          
          <AlertDescription className="mb-3">
            {statusInfo.message}
          </AlertDescription>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={statusInfo.buttonAction}
              className={`${buttonClasses[statusInfo.color]} text-white`}
              size="sm"
            >
              {statusInfo.buttonText}
            </Button>
            
            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-sm underline opacity-75 hover:opacity-100"
              >
                Show details
              </button>
            )}
            
            <button
              onClick={acknowledgeAndDismiss}
              className="text-sm underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="opacity-75">Inbound:</span>
                  <span className="ml-2 font-mono">
                    {status.inbound_sats.toLocaleString()} sats
                  </span>
                </div>
                <div>
                  <span className="opacity-75">Outbound:</span>
                  <span className="ml-2 font-mono">
                    {status.outbound_sats.toLocaleString()} sats
                  </span>
                </div>
              </div>
              
              {status.issues.length > 0 && (
                <div>
                  <div className="opacity-75 mb-1">Issues:</div>
                  <ul className="list-disc list-inside space-y-1 opacity-90">
                    {status.issues.map((issue, index) => (
                      <li key={index} className="text-xs">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button
                onClick={() => setShowDetails(false)}
                className="mt-2 text-xs underline opacity-75"
              >
                Hide details
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={acknowledgeAndDismiss}
          className="opacity-50 hover:opacity-75 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
} 