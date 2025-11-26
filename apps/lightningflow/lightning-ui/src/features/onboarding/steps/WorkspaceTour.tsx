'use client'

import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { 
  BarChart3, 
  Send, 
  Download, 
  MessageSquare, 
  Bot, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface WorkspaceTourProps {
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  features: string[]
}

export function WorkspaceTour({ data, onNext, onBack, onSkip }: WorkspaceTourProps) {
  const [currentTourStep, setCurrentTourStep] = useState(0)

  const tourSteps: TourStep[] = [
    {
      id: 'command',
      title: 'Command Center',
      description: 'Track your revenue, automations, and node status in one place',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Real-time earnings dashboard',
        'AI automation status',
        'Node health monitoring',
        'Quick action buttons'
      ]
    },
    {
      id: 'payments',
      title: 'Pay & Request',
      description: 'Send and receive Lightning payments instantly',
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Instant Lightning payments',
        'QR code generation',
        'Payment links',
        'Transaction history'
      ]
    },
    {
      id: 'ai',
      title: 'Ask AI',
      description: 'Get help, make decisions, and automate your workflow',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Smart business insights',
        'Automated responses',
        'Content generation',
        'Decision support'
      ]
    },
    {
      id: 'automations',
      title: 'Automations',
      description: 'AI agents that work for your business 24/7',
      icon: Bot,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Content creation',
        'Customer support',
        'Payment processing',
        'Scheduling & reminders'
      ]
    },
    {
      id: 'verify',
      title: 'Verify Center',
      description: 'Cryptographic proof of every action on your node',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      features: [
        'Transaction verification',
        'Audit trails',
        'Cryptographic proofs',
        'Compliance reports'
      ]
    }
  ]

  const currentStep = tourSteps[currentTourStep]
  const isLastStep = currentTourStep === tourSteps.length - 1

  const handleNextStep = () => {
    if (isLastStep) {
      onNext()
    } else {
      setCurrentTourStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(prev => prev - 1)
    } else {
      onBack()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to your Lightning workspace
        </h2>
        <p className="text-gray-600">
          Let's take a quick tour of the key features
        </p>
      </div>

      {/* Tour Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {tourSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentTourStep 
                ? 'bg-blue-500 w-8' 
                : index < currentTourStep 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Main Tour Card */}
      <Card className={`border-2 ${currentStep.bgColor} border-gray-200 mb-8`}>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className={`w-16 h-16 ${currentStep.bgColor} rounded-2xl flex items-center justify-center`}>
              <currentStep.icon className={`h-8 w-8 ${currentStep.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-gray-900">{currentStep.title}</h3>
                {data.testMode && (
                  <Badge variant="outline" className="text-xs">
                    Preview Mode
                  </Badge>
                )}
              </div>
              
              <p className="text-lg text-gray-600 mb-6">
                {currentStep.description}
              </p>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStep.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded">
                <span className="text-white text-xs flex items-center justify-center h-full">⚡</span>
              </div>
              <span className="text-sm font-medium">{data.nodeName || 'Lightning Workspace'}</span>
              {data.testMode && (
                <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                  Preview
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-center">
              {tourSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-3 rounded-lg transition-all ${
                    index === currentTourStep 
                      ? 'bg-white/20 ring-2 ring-white/30' 
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <step.icon className="h-5 w-5 mx-auto mb-2 text-white" />
                  <span className="text-xs text-white/80">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrevStep}>
          {currentTourStep === 0 ? 'Back' : 'Previous'}
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onSkip}>
            Skip Tour
          </Button>
          
          <Button 
            onClick={handleNextStep}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
          >
            {isLastStep ? (
              <>
                <Sparkles className="h-4 w-4" />
                Launch Workspace
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 