"use client";

import React, { useState } from 'react';
import { BusinessWalletDashboard } from '@/components/wallet-system/business-wallet-dashboard';
import { SmartTerminalGenerator } from '@/components/wallet-system/smart-terminal-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  Terminal,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  DollarSign,
  Users,
  Target,
  Award,
  TrendingUp,
  Shield,
  Globe,
  Cpu
} from 'lucide-react';

export default function WalletDemoPage() {
  const [activeDemo, setActiveDemo] = useState('dashboard');

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Intelligent Routing",
      description: "AI-powered payment routing optimizes for fees, speed, and reliability automatically."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-green-400" />,
      title: "Fiat-First UX",
      description: "Display prices in your preferred currency with optional Bitcoin amounts."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Team Splits",
      description: "Automatic tip and revenue splitting with customizable rules and instant payouts."
    },
    {
      icon: <Target className="h-6 w-6 text-purple-400" />,
      title: "Business Insights",
      description: "AI-driven recommendations to optimize your payment flows and increase revenue."
    },
    {
      icon: <Shield className="h-6 w-6 text-cyan-400" />,
      title: "Enterprise Security",
      description: "Non-custodial architecture with comprehensive audit trails and RLS protection."
    },
    {
      icon: <Globe className="h-6 w-6 text-orange-400" />,
      title: "Multi-Currency",
      description: "Support for USD, CAD, EUR, GBP, JPY with real-time exchange rates."
    }
  ];

  const useCases = [
    {
      icon: "🍽️",
      title: "Restaurant Chain",
      description: "Multi-location restaurants with table terminals, staff tips, and owner earnings",
      benefits: ["Auto-split tips", "Per-table routing", "Staff performance tracking"]
    },
    {
      icon: "☕",
      title: "Coffee Shop",
      description: "Single location with POS terminals, tip jar, and team earnings",
      benefits: ["Instant tip payouts", "Low-fee routing", "Real-time earnings"]
    },
    {
      icon: "🏪",
      title: "Retail Store",
      description: "Multiple cashiers, commission tracking, and inventory integration",
      benefits: ["Sales attribution", "Commission splits", "Inventory tracking"]
    },
    {
      icon: "💼",
      title: "Service Business",
      description: "Freelancers, consultants, and service providers with client payments",
      benefits: ["Client invoicing", "Project tracking", "Tax optimization"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-6">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Business Wallet System
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Your AI Business
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Partner</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform your business with intelligent payment routing, automatic splits, and fiat-first UX. 
              Lightning fast, enterprise secure, genuinely helpful.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                onClick={() => setActiveDemo('dashboard')}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Dashboard Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setActiveDemo('terminal')}
              >
                <Terminal className="h-5 w-5 mr-2" />
                Create Smart Terminal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Built for Modern Businesses</h2>
          <p className="text-gray-400 text-lg">Everything you need to accept Lightning payments like a Fortune 500 company</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-900/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Perfect for Any Business</h2>
            <p className="text-gray-400 text-lg">From coffee shops to enterprise, our wallet system scales with your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{useCase.icon}</span>
                    <CardTitle className="text-white">{useCase.title}</CardTitle>
                  </div>
                  <p className="text-gray-400">{useCase.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {useCase.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <span className="text-sm text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Interactive Demo</h2>
          <p className="text-gray-400 text-lg">Experience the power of AI-driven payment routing</p>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Business Dashboard
            </TabsTrigger>
            <TabsTrigger value="terminal" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Smart Terminal Generator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-gray-900/30 border-gray-800 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Live Business Dashboard</h3>
                <p className="text-gray-400">
                  See how your restaurant earnings, team performance, and AI insights look in real-time. 
                  All amounts shown in your preferred fiat currency with optional Bitcoin display.
                </p>
              </div>
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <BusinessWalletDashboard />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="terminal" className="space-y-6">
            <Card className="bg-gray-900/30 border-gray-800 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Smart Terminal Generator</h3>
                <p className="text-gray-400">
                  Create intelligent payment terminals with automatic routing, split rules, and QR code generation. 
                  Perfect for restaurants, retail, or any business needing multiple payment points.
                </p>
              </div>
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <SmartTerminalGenerator />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Technical Highlights */}
      <div className="bg-gray-900/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Architecture</h2>
            <p className="text-gray-400 text-lg">Built with the same standards as major financial institutions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Routing Engine</h3>
              <p className="text-gray-400 text-sm">
                Advanced algorithms optimize every payment for lowest fees, highest success rates, and fastest settlement.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Non-Custodial Security</h3>
              <p className="text-gray-400 text-sm">
                Your keys, your Bitcoin. Multi-tenant RLS, audit trails, and cryptographic proof of all operations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Business Intelligence</h3>
              <p className="text-gray-400 text-sm">
                Real-time insights, performance optimization, and automated recommendations to grow your business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of businesses using AI-powered Lightning payments to reduce costs and increase revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Building
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Settings className="h-5 w-5 mr-2" />
              View Documentation
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-6">
            Non-custodial • Enterprise security • Lightning fast
          </p>
        </div>
      </div>
    </div>
  );
} 