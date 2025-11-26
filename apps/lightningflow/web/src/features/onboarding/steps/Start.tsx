'use client'

import React from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Zap, Shield, Cpu, Globe } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface StartProps {
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  isFirst: boolean
  isLast: boolean
}

export function Start({ onNext }: StartProps) {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant Bitcoin payments with Lightning Network'
    },
    {
      icon: Cpu,
      title: 'AI Powered',
      description: 'Smart automation for your business operations'
    },
    {
      icon: Shield,
      title: 'Sovereign',
      description: 'Your keys, your node, your financial freedom'
    },
    {
      icon: Globe,
      title: 'Global',
      description: 'Accept payments from anywhere in the world'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Lightning AI Node
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your sovereign financial operating system. Built on Bitcoin Lightning Network 
          for freelancers, creators, and small businesses.
        </p>
        
        <Button 
          onClick={() => onNext()}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
        >
          Get Started
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-4">Trusted by creators worldwide</p>
        <div className="flex items-center justify-center gap-8 opacity-60">
          <div className="text-xs font-medium text-gray-400">🔒 Self-Custodial</div>
          <div className="text-xs font-medium text-gray-400">⚡ Lightning Network</div>
          <div className="text-xs font-medium text-gray-400">🤖 AI Powered</div>
          <div className="text-xs font-medium text-gray-400">🌍 Global</div>
        </div>
      </div>
    </div>
  )
} 