'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Bitcoin, TrendingUp, Zap, DollarSign, Clock } from 'lucide-react';
import { useBTCThinking, useBTC } from '../../hooks/useBTCContext';
import { useState, useEffect } from 'react';

interface BTCThinkingTrainerProps {
  className?: string;
  showNodeEarnings?: boolean;
  userNodeBalance?: number; // in sats
}

export function BTCThinkingTrainer({ 
  className = '', 
  showNodeEarnings = false,
  userNodeBalance = 0 
}: BTCThinkingTrainerProps) {
  const { examples, priceUSD } = useBTCThinking();
  const { formatSats, convertSatsToUSD, lastUpdated } = useBTC();
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  // Calculate user's progress toward BTC milestones
  const userBTC = userNodeBalance / 100_000_000;
  const nextMilestone = examples.find(ex => ex.btc > userBTC);
  const progressPercent = nextMilestone ? (userBTC / nextMilestone.btc) * 100 : 100;

  useEffect(() => {
    if (userNodeBalance > 0) {
      setShowProgress(true);
    }
  }, [userNodeBalance]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            BTC Thinking Trainer
            <Badge variant="outline" className="ml-auto">
              Live: ${priceUSD.toLocaleString()}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Train your mind to think in Bitcoin. These values update in real-time.
          </p>
        </CardHeader>
      </Card>

      {/* User Progress (if they have a balance) */}
      {showProgress && userNodeBalance > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Your Node Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Balance: {formatSats(userNodeBalance)} sats</span>
                <span>${convertSatsToUSD(userNodeBalance)}</span>
              </div>
              {nextMilestone && (
                <>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {progressPercent.toFixed(1)}% toward {nextMilestone.btc} BTC milestone
                    ({nextMilestone.context})
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BTC Examples Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {examples.map((example, index) => (
          <Card 
            key={example.btc}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedExample === index ? 'ring-2 ring-orange-500' : ''
            } ${userBTC >= example.btc ? 'border-green-200 bg-green-50 dark:bg-green-950' : ''}`}
            onClick={() => setSelectedExample(selectedExample === index ? null : index)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* BTC Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">₿ {example.btc}</span>
                  {userBTC >= example.btc && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Achieved
                    </Badge>
                  )}
                </div>

                {/* USD Equivalent */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-semibold text-green-600">
                    ${example.usd}
                  </span>
                </div>

                {/* Sats */}
                <div className="text-sm text-muted-foreground">
                  {example.formatted_sats} sats
                </div>

                {/* Context */}
                <div className="text-sm font-medium text-orange-600">
                  {example.context}
                </div>

                {/* Node Earnings Context (if enabled) */}
                {showNodeEarnings && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>
                        ≈ {Math.round(example.sats / 1000)} routing fees at 1000 sats each
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedExample === index && (
                  <div className="border-t pt-3 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Per day:</span>
                        <div>${(parseFloat(example.usd) / 30).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Per month:</span>
                        <div>${example.usd}</div>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      At current BTC price of ${priceUSD.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Business Context Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Thinking</CardTitle>
          <p className="text-sm text-muted-foreground">
            How these amounts relate to your Lightning node business
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm mb-1">0.001 BTC Revenue</div>
              <div className="text-xs text-muted-foreground">
                • 100 payments of 1,000 sats each<br/>
                • 10 invoices at $10 each<br/>
                • 1 week of routing fees (active node)
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm mb-1">0.01 BTC Revenue</div>
              <div className="text-xs text-muted-foreground">
                • 1,000 microtransactions<br/>
                • Monthly SaaS revenue<br/>
                • Freelance project payment
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm mb-1">0.1 BTC Revenue</div>
              <div className="text-xs text-muted-foreground">
                • Quarterly business income<br/>
                • High-value client project<br/>
                • Node liquidity for scaling
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm mb-1">1 BTC Revenue</div>
              <div className="text-xs text-muted-foreground">
                • Annual business profit<br/>
                • Major contract completion<br/>
                • Node network investment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Price Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Last updated: {lastUpdated?.toLocaleTimeString() || 'Loading...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-orange-500" />
              <span className="font-mono">
                1 BTC = ${priceUSD.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 