'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { 
  Zap, 
  CheckCircle, 
  Sparkles, 
  Rocket,
  Shield,
  Bot,
  BarChart3
} from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface FinalScreenProps {
  data: OnboardingData
  onComplete: () => void
  isFirst: boolean
  isLast: boolean
}

export function FinalScreen({ data, onComplete }: FinalScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Trigger celebration animation
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: BarChart3,
      title: 'Command Center',
      description: 'Track earnings and node status'
    },
    {
      icon: Zap,
      title: 'Lightning Payments',
      description: 'Send and receive instantly'
    },
    {
      icon: Bot,
      title: 'AI Automation',
      description: data.aiAutomation ? 'Enabled and ready' : 'Available when needed'
    },
    {
      icon: Shield,
      title: 'Cryptographic Proofs',
      description: 'Every action verified'
    }
  ]

  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Celebration Header */}
      <div className="mb-12">
        <div className={`relative transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
            <Zap className="h-12 w-12 text-white" />
            {isAnimating && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl animate-ping opacity-75" />
            )}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 You're ready to activate your Lightning Business Node!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your sovereign financial operating system is configured and ready to launch
        </p>
      </div>

      {/* Workspace Summary */}
      <Card className="border-2 border-green-200 bg-green-50 mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {data.nodeName || 'Lightning Workspace'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {data.useCase || 'General Use'}
                </Badge>
                {data.testMode && (
                  <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                    Preview Mode
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card className="border-gray-200 mb-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">
                {data.aiAutomation ? 'AI Automation Enabled' : 'Manual Operations'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">
                {data.emailAlerts ? 'Email Alerts On' : 'Email Alerts Off'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">
                {data.testMode ? 'Preview Mode' : 'Live Mode'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3 text-sm text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Access your Command Center</p>
                <p className="text-gray-600">View your dashboard and explore features</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Create your first payment link</p>
                <p className="text-gray-600">Start accepting Lightning payments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Ask AI for help</p>
                <p className="text-gray-600">Get personalized guidance and automation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <div className="space-y-4">
        <Button 
          onClick={onComplete}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold"
        >
          <Rocket className="h-5 w-5 mr-2" />
          Launch My Lightning Node
        </Button>
        
        <p className="text-sm text-gray-500">
          You can always change these settings later in your workspace
        </p>
      </div>

      {/* Sparkles Animation */}
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className={`absolute text-yellow-400 animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
} 