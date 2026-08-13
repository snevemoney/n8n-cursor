"use client";
import { apiPath, appPath } from '@/lib/base-path';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  ExternalLink, 
  Bot, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  DollarSign
} from 'lucide-react';

interface LiquidityProvider {
  name: string;
  url: string;
  description: string;
  cost: string;
  speed: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  recommended_for: string;
}

interface AIRecommendation {
  provider: string;
  reasoning: string;
  confidence: number;
  estimated_cost_sats: number;
  expected_boost: string;
}

const providers: LiquidityProvider[] = [
  {
    name: 'Magma',
    url: 'https://magma.money',
    description: 'Get instant inbound liquidity. Just pick an amount and pay.',
    cost: '~2000 sats',
    speed: 'Instant',
    difficulty: 'easy',
    recommended_for: 'First-time users who want to start earning quickly'
  },
  {
    name: 'Amboss Liquidity Marketplace',
    url: 'https://amboss.space/liquidity',
    description: 'Buy or sell channel liquidity with other node operators.',
    cost: '1000-5000 sats',
    speed: '1-24 hours',
    difficulty: 'medium',
    recommended_for: 'Users who want competitive rates and more control'
  },
  {
    name: 'LightningNetwork+',
    url: 'https://lightningnetwork.plus',
    description: 'Free liquidity swaps with other nodes. Takes longer but costs nothing.',
    cost: 'Free',
    speed: '1-7 days',
    difficulty: 'medium',
    recommended_for: 'Patient users who want to avoid fees'
  }
];

export default function BoostLiquidity() {
  const [showAI, setShowAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    // Fetch user's current liquidity stats
    fetch(apiPath('/api/liquidity/check'))
      .then(res => res.json())
      .then(setUserStats)
      .catch(console.error);
  }, []);

  const getAIRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiPath('/api/ai/recommend-liquidity'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userStats,
          goal: 'boost_earnings',
          budget_preference: 'moderate'
        })
      });
      
      const recommendation = await response.json();
      setAIRecommendation(recommendation);
    } catch (error) {
      console.error('AI recommendation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLiquidityFixed = async () => {
    try {
      await fetch(apiPath('/api/liquidity/mark-resolved'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Redirect back to dashboard
      window.location.href = appPath('/dashboard?liquidity_fixed=true');
    } catch (error) {
      console.error('Failed to mark liquidity as fixed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            Get More Bitcoin Traffic
          </h1>
          <p className="text-gray-400 text-lg">
            Your node isn't earning because it needs more inbound liquidity. Here's how to fix it.
          </p>
        </div>

        {/* Current Status */}
        {userStats && (
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-200">
              <strong>What's happening:</strong> You have outbound liquidity but need inbound channels 
              so other people can route payments through your node and pay you fees.
              {userStats.status === 'low-inbound' && (
                <span className="block mt-1">
                  Current inbound capacity: {userStats.inbound_sats?.toLocaleString() || 0} sats
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* AI Recommendation Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              Get AI Recommendation
            </CardTitle>
            <CardDescription>
              Let AI analyze your node and suggest the best liquidity option for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!aiRecommendation ? (
              <Button 
                onClick={getAIRecommendation}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Analyzing...' : '🤖 Analyze My Node'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">
                    Recommended: {aiRecommendation.provider}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    {aiRecommendation.reasoning}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Estimated Cost:</span>
                      <span className="text-white ml-2">{aiRecommendation.estimated_cost_sats.toLocaleString()} sats</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Expected Boost:</span>
                      <span className="text-green-400 ml-2">{aiRecommendation.expected_boost}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${
                      aiRecommendation.confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'
                    }`}
                  >
                    {Math.round(aiRecommendation.confidence * 100)}% confidence
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Liquidity Providers</h2>
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card 
                key={provider.name} 
                className={`bg-gray-900/50 border-gray-800 transition-colors ${
                  aiRecommendation?.provider === provider.name 
                    ? 'border-blue-500/50 bg-blue-500/5' 
                    : 'hover:border-gray-700'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {provider.name}
                        {aiRecommendation?.provider === provider.name && (
                          <Badge variant="outline" className="text-blue-400">
                            AI Pick
                          </Badge>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {provider.description}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      provider.difficulty === 'easy' ? 'text-green-400' :
                      provider.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {provider.difficulty}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-white ml-2">{provider.cost}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Speed:</span>
                      <span className="text-white ml-2">{provider.speed}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">
                    <strong>Best for:</strong> {provider.recommended_for}
                  </p>

                  <a 
                    href={provider.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Visit {provider.name}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Already Fixed Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Already Fixed Your Liquidity?
            </CardTitle>
            <CardDescription>
              If you've added liquidity through one of the providers above, let us know
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={markLiquidityFixed}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              I Fixed It - Re-enable Earnings Monitor
            </Button>
            <p className="text-sm text-gray-400 mt-2">
              This will stop showing you liquidity warnings and resume normal earnings tracking.
            </p>
          </CardContent>
        </Card>

        {/* Simple Explanation */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">What is Inbound Liquidity?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300">
              Think of it like this: You have a Bitcoin ATM, but no one can deposit money into it 
              because all the slots are full of your own money.
            </p>
            <p className="text-gray-300">
              <strong>Inbound liquidity</strong> = Empty slots so other people can route payments 
              through your node and pay you fees.
            </p>
            <p className="text-gray-300">
              The providers above will open channels to your node with their Bitcoin, 
              giving you those empty slots you need to start earning.
            </p>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button
            onClick={() => window.location.href = appPath('/dashboard')}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 