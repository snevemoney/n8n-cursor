"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Coffee,
  DollarSign,
  Lock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}

export function LightningBasics() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      id: 'problem',
      title: 'The Bitcoin Scalability Problem',
      subtitle: 'Why Lightning Network was created',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'text-red-400',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <h4 className="font-semibold text-red-400 mb-2">Bitcoin</h4>
                <div className="text-3xl font-bold text-white mb-1">7</div>
                <div className="text-sm text-muted-foreground">TPS</div>
              </div>
              <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                <h4 className="font-semibold text-amber-400 mb-2">Credit Cards</h4>
                <div className="text-3xl font-bold text-white mb-1">4,000</div>
                <div className="text-sm text-muted-foreground">TPS average</div>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">Visa Peak</h4>
                <div className="text-3xl font-bold text-white mb-1">65,000</div>
                <div className="text-sm text-muted-foreground">TPS maximum</div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Bitcoin's 1MB block size limits it to ~7 transactions per second. 
              This makes small everyday purchases expensive and slow.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: 'Lightning Network Solution',
      subtitle: 'Off-chain scaling for instant payments',
      icon: <Zap className="h-8 w-8" />,
      color: 'text-yellow-400',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/20 mb-4">
              <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Lightning Network</h3>
              <div className="text-4xl font-bold text-white mb-2">⚡ Millions</div>
              <div className="text-sm text-muted-foreground">Theoretical TPS</div>
            </div>
            <p className="text-muted-foreground">
              Lightning enables instant, nearly free Bitcoin payments by moving 
              small transactions off the main blockchain.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400 mb-2" />
              <h4 className="font-semibold text-green-400 mb-1">Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Instant settlements</li>
                <li>• Minimal fees</li>
                <li>• Infinite scalability</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-lg">
              <Lock className="h-5 w-5 text-blue-400 mb-2" />
              <h4 className="font-semibold text-blue-400 mb-1">Security</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Non-custodial</li>
                <li>• Cryptographic proofs</li>
                <li>• Bitcoin-backed</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'coffee-example',
      title: 'Real-World Example',
      subtitle: "Bob's daily coffee purchases",
      icon: <Coffee className="h-8 w-8" />,
      color: 'text-amber-400',
      content: (
        <div className="space-y-6">
          <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 text-center">
            <Coffee className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-400 mb-2">The Coffee Shop Problem</h3>
            <p className="text-sm text-muted-foreground">
              Bob buys coffee every morning. On-chain Bitcoin transactions cost more than the coffee itself!
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
              <h4 className="font-semibold text-red-400 mb-2">❌ Without Lightning</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• $5 coffee + $15 transaction fee</li>
                <li>• 10-60 minute confirmation</li>
                <li>• Clogs the Bitcoin network</li>
              </ul>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <h4 className="font-semibold text-green-400 mb-2">✅ With Lightning</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• $5 coffee + $0.01 fee</li>
                <li>• Instant confirmation</li>
                <li>• Hundreds of purchases per day</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'how-it-works',
      title: 'How Lightning Channels Work',
      subtitle: 'The three-step process',
      icon: <Users className="h-8 w-8" />,
      color: 'text-blue-400',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-center">
              <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-blue-400 mb-2">Open Channel</h4>
              <p className="text-sm text-muted-foreground">
                Bob and the coffee shop lock Bitcoin in a shared multisig wallet on-chain
              </p>
            </div>
            
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
              <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-400 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-green-400 mb-2">Update Balances</h4>
              <p className="text-sm text-muted-foreground">
                They exchange signed IOUs off-chain - instant and nearly free
              </p>
            </div>
            
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 text-center">
              <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-purple-400 mb-2">Close Channel</h4>
              <p className="text-sm text-muted-foreground">
                Final balance is settled on-chain when they're done
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Example: Bob's Coffee Channel</h4>
            <p className="text-sm text-muted-foreground">
              Bob deposits 0.05 BTC (~$2,000), coffee shop deposits nothing. 
              After 50 coffees at $5 each, Bob has 0.045 BTC and shop has 0.005 BTC.
              Only 2 on-chain transactions needed for 50 purchases!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'routing',
      title: 'Network Routing',
      subtitle: 'Payments through multiple hops',
      icon: <ArrowRight className="h-8 w-8" />,
      color: 'text-purple-400',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-purple-400 mb-4">
              You don't need direct channels with everyone!
            </h3>
            <p className="text-muted-foreground mb-6">
              Alice can pay the coffee shop through Bob, even without a direct channel.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <span className="text-blue-400 font-semibold">Alice</span>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="bg-green-500/20 p-3 rounded-full">
                <span className="text-green-400 font-semibold">Bob</span>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="bg-amber-500/20 p-3 rounded-full">
                <span className="text-amber-400 font-semibold">Coffee Shop</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Payment routes automatically through the network to find the cheapest, fastest path
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Network Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic route finding</li>
                <li>• Competitive fee markets</li>
                <li>• Global connectivity</li>
              </ul>
            </div>
            <div className="bg-amber-500/10 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-400 mb-2">Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sufficient liquidity</li>
                <li>• Active routing nodes</li>
                <li>• Balanced channels</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'limitations',
      title: 'Honest About Limitations',
      subtitle: 'What you should know',
      icon: <AlertCircle className="h-8 w-8" />,
      color: 'text-amber-400',
      content: (
        <div className="space-y-6">
          <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
            <AlertCircle className="h-6 w-6 text-amber-400 mb-3" />
            <h3 className="font-semibold text-amber-400 mb-2">We believe in transparency</h3>
            <p className="text-sm text-muted-foreground">
              Lightning Network isn't perfect. Here are the real challenges:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-400">Challenges</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Requires active liquidity management</li>
                <li>• Payments can fail if routes unavailable</li>
                <li>• Network effects may favor large hubs</li>
                <li>• Nodes need to stay online</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-400">How We Help</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Real-time liquidity insights</li>
                <li>• AI-powered routing suggestions</li>
                <li>• Automated rebalancing tools</li>
                <li>• 24/7 monitoring & alerts</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              "Routing is not free — large players will dominate the hubs" 
              - Mathematical critique by Fyookball (2018)
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'get-started',
      title: 'Ready to Start?',
      subtitle: 'Your Lightning journey begins now',
      icon: <Zap className="h-8 w-8" />,
      color: 'text-green-400',
      content: (
        <div className="space-y-6 text-center">
          <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/20">
            <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">
              You now understand Lightning Network!
            </h3>
            <p className="text-muted-foreground">
              Ready to start earning Bitcoin through your own Lightning node?
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500/10 p-4 rounded-lg">
              <Lock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-400 mb-1">Non-custodial</h4>
              <p className="text-xs text-muted-foreground">Your Bitcoin, your keys</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-400 mb-1">Earn Fees</h4>
              <p className="text-xs text-muted-foreground">Route payments, earn sats</p>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-green-400 mb-1">Join Network</h4>
              <p className="text-xs text-muted-foreground">Help scale Bitcoin</p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              Start Your Lightning Node
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Lightning Network Basics
            </h1>
            <p className="text-muted-foreground">
              Learn how Bitcoin's Layer 2 enables instant, cheap payments
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted/50 ${steps[currentStep].color}`}>
              {steps[currentStep].icon}
            </div>
            <div>
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <CardDescription className="text-base">
                {steps[currentStep].subtitle}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          {steps[currentStep].content}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-500' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Want to dive deeper? Visit our{' '}
          <a href="/trust" className="text-blue-400 hover:underline">
            Trust Center
          </a>{' '}
          for technical details and source citations.
        </p>
      </div>
    </div>
  );
} 