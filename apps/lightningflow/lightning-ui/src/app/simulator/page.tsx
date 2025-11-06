"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Users, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Code,
  Play,
  Pause
} from 'lucide-react';
import { toast } from "sonner";
import { useSimpleOnboardingTracker } from '@/hooks/useOnboardingTracker';

interface KnownPeer {
  alias: string;
  pubkey: string;
  min_channel_size: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const KNOWN_PEERS: KnownPeer[] = [
  {
    alias: 'LNBig',
    pubkey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    min_channel_size: 100_000,
    description: 'Good for beginners - low minimum channel size',
    difficulty: 'easy'
  },
  {
    alias: 'ACINQ',
    pubkey: '03006fcf3312dae8d068ea297f58e2bd00ec2f5781ffa2c5e0e52bfe34aeeea3e',
    min_channel_size: 20_000,
    description: 'Reliable and well-connected node',
    difficulty: 'easy'
  },
  {
    alias: 'Fold',
    pubkey: '0338f57e8935d5c893f4a59c84d7a92dc1ad22f2b26f3fcb11a90c05c6b7763c6c',
    min_channel_size: 5_000_000,
    description: 'High minimum (0.05 BTC) but very stable',
    difficulty: 'hard'
  }
];

interface LoopFailure {
  log: string;
  error_type: string;
  amount_sats: number;
  max_routing_fee: number;
  hops_attempted?: number;
  duration_minutes?: number;
}

interface TroubleshootingSuggestion {
  issue: string;
  explanation: string;
  immediate_actions: string[];
  cli_commands?: string[];
  prevention_tips: string[];
  success_probability: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SearchResult {
  id: string;
  content: string;
  title: string | null;
  summary: string | null;
  similarity: number;
  metadata: any;
}

export default function LightningSimulator() {
  const [selectedPeer, setSelectedPeer] = useState<KnownPeer>(KNOWN_PEERS[0]);
  const [channelAmount, setChannelAmount] = useState(500_000);
  const [feeRate, setFeeRate] = useState(50);
  const [channelResult, setChannelResult] = useState<any>(null);
  const [loopAmount, setLoopAmount] = useState(250_000);
  const [maxRoutingFee, setMaxRoutingFee] = useState(10_000);
  const [loopResult, setLoopResult] = useState<any>(null);
  const [loading, setLoading] = useState({ channel: false, loop: false, search: false, troubleshoot: false });
  
  // Vector search and troubleshooting state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [troubleshootLog, setTroubleshootLog] = useState('');
  const [troubleshootResult, setTroubleshootResult] = useState<any>(null);

  // Onboarding tracking
  const { trackPageView, trackButtonClick, trackStepCompleted, trackError } = useSimpleOnboardingTracker();

  // Track page view on component mount
  useEffect(() => {
    trackPageView('lightning_basics');
  }, [trackPageView]);

  const simulateChannelOpen = async () => {
    trackButtonClick('open_channel', 'simulate_channel_open', {
      peer_selected: selectedPeer.alias,
      channel_amount: channelAmount,
      fee_rate: feeRate
    });

    setLoading(prev => ({ ...prev, channel: true }));
    try {
      const response = await fetch('/api/simulate/open-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerPubkey: selectedPeer.pubkey,
          amountSats: channelAmount,
          feeRate,
          simulate: true
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error);
        if (data.suggestion) {
          toast.info(data.suggestion);
        }
        
        trackError('open_channel', data.error, {
          peer_selected: selectedPeer.alias,
          channel_amount: channelAmount
        });
        return;
      }

      setChannelResult(data);
      toast.success(`Channel simulated with ${data.peer_alias}`);
      
      trackStepCompleted('open_channel', {
        peer_selected: selectedPeer.alias,
        channel_amount: channelAmount,
        success: true
      });
      
    } catch (error) {
      toast.error('Failed to simulate channel opening');
      trackError('open_channel', 'Network error');
    } finally {
      setLoading(prev => ({ ...prev, channel: false }));
    }
  };

  const simulateLoopOut = async () => {
    if (!channelResult) {
      toast.error('Open a channel first');
      return;
    }

    trackButtonClick('loop_out_attempt', 'simulate_loop_out', {
      loop_amount: loopAmount,
      max_routing_fee: maxRoutingFee
    });

    setLoading(prev => ({ ...prev, loop: true }));
    try {
      const response = await fetch('/api/simulate/loop-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: 'simulated_channel',
          amountSats: loopAmount,
          maxRoutingFee,
          confTarget: 144
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || data.error);
        if (data.suggestion) {
          toast.info(data.suggestion);
        }
        if (data.cli_command) {
          navigator.clipboard.writeText(data.cli_command);
          toast.success('CLI command copied to clipboard');
        }
        
        trackError('loop_out_attempt', data.message || data.error, {
          loop_amount: loopAmount,
          error_reason: data.reason
        });
        return;
      }

      setLoopResult(data);
      toast.success('Loop out simulated successfully');
      
      trackStepCompleted('loop_out_success', {
        loop_amount: loopAmount,
        net_received: data.net_received,
        total_fees: data.fees?.total
      });
      
    } catch (error) {
      toast.error('Failed to simulate loop out');
      trackError('loop_out_attempt', 'Network error');
    } finally {
      setLoading(prev => ({ ...prev, loop: false }));
    }
  };

  const performVectorSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    trackButtonClick('lightning_basics', 'search_tutorials', {
      search_query: searchQuery
    });

    setLoading(prev => ({ ...prev, search: true }));
    try {
      const response = await fetch('/api/ai/search-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5,
          threshold: 0.7
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Search failed');
        trackError('lightning_basics', data.error || 'Search failed');
        return;
      }

      setSearchResults(data.results || []);
      toast.success(`Found ${data.results?.length || 0} relevant tutorials`);
      
      trackStepCompleted('lightning_basics', {
        search_query: searchQuery,
        results_found: data.results?.length || 0
      });
      
    } catch (error) {
      toast.error('Failed to search tutorials');
      trackError('lightning_basics', 'Search network error');
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const troubleshootError = async () => {
    if (!troubleshootLog.trim()) {
      toast.error('Please enter an error log');
      return;
    }

    trackButtonClick('lightning_basics', 'troubleshoot_error', {
      error_log_length: troubleshootLog.length
    });

    setLoading(prev => ({ ...prev, troubleshoot: true }));
    try {
      const response = await fetch('/api/ai/loop-troubleshooter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_log: troubleshootLog,
          context: {
            amount_sats: loopAmount,
            max_routing_fee: maxRoutingFee
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Troubleshooting failed');
        trackError('lightning_basics', data.error || 'Troubleshooting failed');
        return;
      }

      setTroubleshootResult(data);
      toast.success('Error analysis completed');
      
      trackStepCompleted('lightning_basics', {
        troubleshoot_confidence: data.confidence,
        suggestions_provided: data.suggestions?.length || 0,
        cli_commands_provided: data.cli_commands?.length || 0
      });
      
    } catch (error) {
      toast.error('Failed to analyze error');
      trackError('lightning_basics', 'Troubleshooting network error');
    } finally {
      setLoading(prev => ({ ...prev, troubleshoot: false }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            Lightning Simulator
          </h1>
          <p className="text-gray-400 text-lg">
            Practice opening channels and loop-outs without spending real Bitcoin
          </p>
        </div>

        <Tabs defaultValue="channel" className="space-y-6">
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="channel">1. Open Channel</TabsTrigger>
            <TabsTrigger value="loop">2. Loop Out</TabsTrigger>
            <TabsTrigger value="search">3. Search Help</TabsTrigger>
            <TabsTrigger value="troubleshoot">4. Troubleshoot</TabsTrigger>
            <TabsTrigger value="results">5. Results</TabsTrigger>
          </TabsList>

          {/* Channel Opening Tab */}
          <TabsContent value="channel" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Choose Your Peer
                </CardTitle>
                <CardDescription>
                  Different nodes have different requirements. Start with easier peers if you're new.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {KNOWN_PEERS.map((peer) => (
                    <div
                      key={peer.pubkey}
                      onClick={() => setSelectedPeer(peer)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPeer.pubkey === peer.pubkey
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{peer.alias}</h3>
                        <Badge variant="outline" className={getDifficultyColor(peer.difficulty)}>
                          {peer.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{peer.description}</p>
                      <p className="text-xs text-gray-500">
                        Min channel: {peer.min_channel_size.toLocaleString()} sats
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Channel Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Channel Amount (sats)
                  </label>
                  <input
                    type="number"
                    value={channelAmount}
                    onChange={(e) => setChannelAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min={selectedPeer.min_channel_size}
                  />
                  {channelAmount < selectedPeer.min_channel_size && (
                    <p className="text-red-400 text-sm mt-1">
                      Minimum for {selectedPeer.alias}: {selectedPeer.min_channel_size.toLocaleString()} sats
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fee Rate (sat/vB)
                  </label>
                  <input
                    type="number"
                    value={feeRate}
                    onChange={(e) => setFeeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min={1}
                    max={1000}
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Higher = faster confirmation, lower = cheaper
                  </p>
                </div>

                <Button
                  onClick={simulateChannelOpen}
                  disabled={loading.channel || channelAmount < selectedPeer.min_channel_size}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading.channel ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Simulate Channel Open
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loop Out Tab */}
          <TabsContent value="loop" className="space-y-6">
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-200">
                <strong>Prerequisites:</strong> You need an open channel first. After opening a channel, 
                all balance is local (you can send but not receive). Loop-out fixes this.
              </AlertDescription>
            </Alert>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Loop Out Parameters</CardTitle>
                <CardDescription>
                  Send sats via Lightning, receive them back on-chain to get inbound liquidity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Loop Amount (sats)
                  </label>
                  <input
                    type="number"
                    value={loopAmount}
                    onChange={(e) => setLoopAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min={250_000}
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Minimum: 250,000 sats (Loop service requirement)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Routing Fee (sats)
                  </label>
                  <input
                    type="number"
                    value={maxRoutingFee}
                    onChange={(e) => setMaxRoutingFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min={1000}
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Higher fees = better chance of finding a route to Loop server
                  </p>
                </div>

                <Button
                  onClick={simulateLoopOut}
                  disabled={loading.loop || !channelResult || loopAmount < 250_000}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading.loop ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Finding Route...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Simulate Loop Out
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vector Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-400" />
                  Search Lightning Tutorials
                </CardTitle>
                <CardDescription>
                  Search our knowledge base for Lightning Network help and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., 'channel opening errors' or 'loop out failed'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    onKeyPress={(e) => e.key === 'Enter' && performVectorSearch()}
                  />
                  <Button
                    onClick={performVectorSearch}
                    disabled={loading.search || !searchQuery.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading.search ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Code className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Search Results</h3>
                    {searchResults.map((result, index) => (
                      <div key={result.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">
                            {result.title || `Result ${index + 1}`}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={
                              result.similarity > 0.8 ? 'text-green-400' :
                              result.similarity > 0.7 ? 'text-yellow-400' : 'text-gray-400'
                            }
                          >
                            {Math.round(result.similarity * 100)}% match
                          </Badge>
                        </div>
                        {result.summary && (
                          <p className="text-gray-300 text-sm mb-2">{result.summary}</p>
                        )}
                        <p className="text-gray-400 text-sm line-clamp-3">
                          {result.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshoot Tab */}
          <TabsContent value="troubleshoot" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  AI Error Troubleshooter
                </CardTitle>
                <CardDescription>
                  Paste your error logs here and get AI-powered explanations and solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Error Log or Message
                  </label>
                  <textarea
                    value={troubleshootLog}
                    onChange={(e) => setTroubleshootLog(e.target.value)}
                    placeholder="Paste your error log here, e.g.:&#10;&#10;failed to find a path to destination&#10;incorrect payment details&#10;temporary channel failure"
                    className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm resize-none"
                  />
                </div>

                <Button
                  onClick={troubleshootError}
                  disabled={loading.troubleshoot || !troubleshootLog.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {loading.troubleshoot ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Error...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Analyze Error
                    </>
                  )}
                </Button>

                {troubleshootResult && (
                  <div className="space-y-4 mt-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        AI Analysis (Confidence: {troubleshootResult.confidence * 100}%)
                      </h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {troubleshootResult.explanation}
                      </p>
                    </div>

                    {troubleshootResult.suggestions && troubleshootResult.suggestions.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-green-400 mb-2">Quick Fixes</h4>
                        <ul className="space-y-1">
                          {troubleshootResult.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {troubleshootResult.cli_commands && troubleshootResult.cli_commands.length > 0 && (
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">CLI Commands</h4>
                        <div className="space-y-2">
                          {troubleshootResult.cli_commands.map((command: string, index: number) => (
                            <div key={index} className="bg-gray-900 rounded px-3 py-2 font-mono text-sm">
                              <code className="text-green-400">{command}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {channelResult && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Channel Simulation Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Channel Details</h4>
                      <p className="text-gray-300">Peer: {channelResult.peer_alias}</p>
                      <p className="text-gray-300">Size: {channelResult.channel_size.toLocaleString()} sats</p>
                      <p className="text-gray-300">On-chain Fee: {channelResult.onchain_fee.toLocaleString()} sats</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Balance Split</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Local (can send):</span>
                          <span className="text-green-400">{channelResult.local_balance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Remote (can receive):</span>
                          <span className="text-red-400">{channelResult.remote_balance.toLocaleString()}</span>
                        </div>
                      </div>
                      <Progress 
                        value={(channelResult.local_balance / channelResult.channel_size) * 100}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {channelResult.next_steps && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Next Steps</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {channelResult.next_steps.map((step: string, index: number) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {loopResult && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-400" />
                    Loop Out Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Transaction</h4>
                      <p className="text-gray-300">Status: {loopResult.status}</p>
                      <p className="text-gray-300">Routing Hops: {loopResult.routing_hops}</p>
                      <p className="text-gray-300">Stage: {loopResult.current_stage}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Fees</h4>
                      <p className="text-gray-300">Routing: {loopResult.fees.routing.toLocaleString()} sats</p>
                      <p className="text-gray-300">On-chain: {loopResult.fees.onchain_estimate.toLocaleString()} sats</p>
                      <p className="text-gray-300">Total: {loopResult.fees.total.toLocaleString()} sats</p>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">Success!</h4>
                    <p className="text-gray-300">
                      You now have {loopResult.new_remote_balance.toLocaleString()} sats of inbound liquidity.
                      Others can now route payments through your node and pay you fees.
                    </p>
                  </div>

                  {loopResult.monitoring && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Monitoring Commands</h4>
                      <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm">
                        <p className="text-green-400"># Check loop status</p>
                        <p className="text-gray-300">loop monitor</p>
                        <p className="text-green-400 mt-2"># View active HTLCs</p>
                        <p className="text-gray-300">lncli listchannels</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!channelResult && !loopResult && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Simulations Yet</h3>
                  <p className="text-gray-500">
                    Complete the channel opening and loop out simulations to see results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 