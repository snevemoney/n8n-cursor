"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Users,
  Target,
  ArrowRight,
  Calculator,
  Coffee,
  Scissors,
  Utensils,
  Briefcase
} from 'lucide-react';

interface NodeComparison {
  type: 'hobby' | 'business';
  title: string;
  description: string;
  monthlyEarnings: number;
  costs: Array<{
    item: string;
    amount: number;
    type: 'expense' | 'revenue';
  }>;
  netProfit: number;
  advantages: string[];
  disadvantages: string[];
}

const LightningRealityCheck: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'comparison' | 'why' | 'examples'>('comparison');

  const hobbyNode: NodeComparison = {
    type: 'hobby',
    title: 'Traditional Hobby Node',
    description: '1.228 BTC capacity, forwarding random payments',
    monthlyEarnings: 15.00,
    costs: [
      { item: 'Routing fees earned', amount: 15.00, type: 'revenue' },
      { item: 'Rebalancing costs', amount: 13.41, type: 'expense' },
      { item: 'Channel open/close fees', amount: 5.00, type: 'expense' }
    ],
    netProfit: -3.41,
    advantages: [
      'Supports the Bitcoin network',
      'Learn Lightning technology',
      'No clients needed'
    ],
    disadvantages: [
      'Loses money after all costs',
      'Random, unpredictable routing',
      'No business value created',
      'Time-consuming rebalancing'
    ]
  };

  const businessNode: NodeComparison = {
    type: 'business',
    title: 'Lightning Business Node',
    description: 'AI-powered business operations with real customers',
    monthlyEarnings: 2840.00,
    costs: [
      { item: 'Customer payments', amount: 2400.00, type: 'revenue' },
      { item: 'Routing fees earned', amount: 180.00, type: 'revenue' },
      { item: 'AI service fees', amount: 260.00, type: 'revenue' },
      { item: 'Platform fee (1.5%)', amount: 42.60, type: 'expense' },
      { item: 'Rebalancing (AI optimized)', amount: 15.00, type: 'expense' }
    ],
    netProfit: 2782.40,
    advantages: [
      'Real business revenue',
      'AI-optimized operations',
      'Professional customer tools',
      'Scalable earning potential',
      'Non-custodial control'
    ],
    disadvantages: [
      'Requires business setup',
      'Learning curve for features'
    ]
  };

  const businessExamples = [
    {
      icon: Coffee,
      name: 'Coffee Shop',
      setup: 'Table terminals + tip routing',
      monthlyEarnings: '$1,200 - $3,500',
      features: ['QR payments at tables', 'Tip splitting for staff', 'Shift management']
    },
    {
      icon: Scissors,
      name: 'Barbershop',
      setup: 'Chair rental + tip pools',
      monthlyEarnings: '$800 - $2,100',
      features: ['Per-chair accounting', 'Tip pools', 'Appointment payments']
    },
    {
      icon: Briefcase,
      name: 'Freelancer',
      setup: 'Contract automation + invoicing',
      monthlyEarnings: '$500 - $5,000',
      features: ['AI contract generation', 'Milestone payments', 'Client management']
    },
    {
      icon: Utensils,
      name: 'Restaurant',
      setup: 'Full POS + team wallets',
      monthlyEarnings: '$2,000 - $8,000',
      features: ['Table-to-kitchen flow', 'Team tip distribution', 'Inventory alerts']
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Lightning Node Reality Check</h2>
        <p className="text-gray-400">
          Why traditional Lightning nodes lose money — and how business nodes actually earn
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-800/50 rounded-lg p-1 flex gap-1">
          {[
            { id: 'comparison', label: 'Node Comparison' },
            { id: 'why', label: 'Why Hobby Nodes Fail' },
            { id: 'examples', label: 'Business Examples' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Tab */}
      {selectedTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[hobbyNode, businessNode].map((node) => (
            <motion.div
              key={node.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-6 ${
                node.type === 'business' 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{node.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={node.type === 'business' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
                  >
                    {node.type === 'business' ? 'Profitable' : 'Unprofitable'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-400">{node.description}</p>

                {/* Monthly Earnings Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Monthly Breakdown:</h4>
                  {node.costs.map((cost, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{cost.item}</span>
                      <span className={cost.type === 'revenue' ? 'text-green-400' : 'text-red-400'}>
                        {cost.type === 'revenue' ? '+' : '-'}{formatCurrency(cost.amount)}
                      </span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Net Profit:</span>
                      <span className={node.netProfit > 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(node.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Advantages & Disadvantages */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-400 mb-2">Advantages:</h5>
                    <ul className="space-y-1">
                      {node.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-red-400 mb-2">Disadvantages:</h5>
                    <ul className="space-y-1">
                      {node.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-gray-300">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                          {disadvantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Why Hobby Nodes Fail Tab */}
      {selectedTab === 'why' && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              The Math Behind Hobby Node Failure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-2">Real Data from 1.228 BTC Node:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 1,040 payments forwarded in one month</li>
                <li>• ~34,000 sats earned (~$15 gross)</li>
                <li>• 1,200 rebalancing operations needed</li>
                <li>• Net profit: $1.59 before channel costs</li>
                <li>• Actual profit: Negative after channel open/close fees</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Random Routing',
                  problem: 'You forward payments for strangers with no control over flow or fees',
                  solution: 'Route payments for your own business with predictable volume'
                },
                {
                  title: 'Rebalancing Costs',
                  problem: 'Manual rebalancing eats up most earnings (13+ sats per rebalance)',
                  solution: 'AI agents optimize rebalancing and reduce frequency by 70%'
                },
                {
                  title: 'No Business Value',
                  problem: 'You earn tiny fees but create no actual business or customer value',
                  solution: 'Use Lightning for real business operations and customer payments'
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <h5 className="font-medium text-white">{item.title}</h5>
                  <div className="space-y-2">
                    <div className="text-xs text-red-400">
                      <strong>Problem:</strong> {item.problem}
                    </div>
                    <div className="text-xs text-green-400">
                      <strong>Our Solution:</strong> {item.solution}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Examples Tab */}
      {selectedTab === 'examples' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Real Business Use Cases</h3>
            <p className="text-gray-400">How our users turn their Lightning nodes into profitable businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessExamples.map((example, index) => {
              const Icon = example.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{example.name}</h4>
                      <p className="text-sm text-gray-400">{example.setup}</p>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="text-green-400 font-bold">{example.monthlyEarnings}</div>
                    <div className="text-xs text-green-300">Monthly earnings potential</div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-white mb-2">Key Features:</h5>
                    <ul className="space-y-1">
                      {example.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                          <Zap className="h-3 w-3 text-yellow-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 text-center space-y-4">
        <h3 className="text-xl font-semibold text-white">Ready to Build a Profitable Lightning Business?</h3>
        <p className="text-gray-300">
          Stop losing money on hobby routing. Start earning with AI-powered business operations.
        </p>
        <div className="flex justify-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Brain className="h-4 w-4 mr-2" />
            Start Business Setup
          </Button>
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Calculate My Potential
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LightningRealityCheck; 