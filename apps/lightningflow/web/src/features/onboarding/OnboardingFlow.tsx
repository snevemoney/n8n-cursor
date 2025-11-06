'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSmartRedirect } from '../../hooks/useSmartRedirect'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { X, ArrowLeft, ArrowRight } from 'lucide-react'

// Import onboarding steps
import { Start } from './steps/Start'
import { CreateAccount } from './steps/CreateAccount'
import { NameNode } from './steps/NameNode'
import { Preferences } from './steps/Preferences'
import { SystemCheck } from './steps/SystemCheck'
import { WorkspaceTour } from './steps/WorkspaceTour'
import { FinalScreen } from './steps/FinalScreen'

export interface OnboardingData {
  nodeName: string
  useCase: string
  aiAutomation: boolean
  testMode: boolean
  emailAlerts: boolean
  email?: string
  password?: string
}

const STEPS = [
  { id: 'start', component: Start, title: 'Welcome' },
  { id: 'create', component: CreateAccount, title: 'Create Account' },
  { id: 'name', component: NameNode, title: 'Name Your Workspace' },
  { id: 'preferences', component: Preferences, title: 'Preferences' },
  { id: 'check', component: SystemCheck, title: 'System Check' },
  { id: 'tour', component: WorkspaceTour, title: 'Workspace Tour' },
  { id: 'finish', component: FinalScreen, title: 'Ready to Launch' }
]

export function OnboardingFlow() {
  const router = useRouter()
  const { goTo } = useSmartRedirect({ context: 'onboarding-flow' })
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    nodeName: '',
    useCase: '',
    aiAutomation: true,
    testMode: true,
    emailAlerts: true
  })
  const [isExiting, setIsExiting] = useState(false)

  const currentStepData = STEPS[currentStep]
  const StepComponent = currentStepData.component
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = (stepData?: Partial<OnboardingData>) => {
    if (stepData) {
      setData(prev => ({ ...prev, ...stepData }))
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    setCurrentStep(STEPS.length - 1) // Go to final screen
  }

  const handleComplete = () => {
    // Save onboarding completion
    localStorage.setItem('lightning-onboarding-complete', 'true')
    localStorage.setItem('lightning-node-data', JSON.stringify(data))
    
    setIsExiting(true)
    setTimeout(() => {
      goTo('DASHBOARD')
    }, 500)
  }

  const handleExit = () => {
    if (confirm('Are you sure you want to exit onboarding? You can complete it later.')) {
      goTo('DASHBOARD')
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Lightning AI Node</h1>
            <p className="text-sm text-gray-500">{currentStepData.title}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6">
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={isExiting ? 'opacity-0' : ''}
          >
            <StepComponent
              data={data}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              onComplete={handleComplete}
              isFirst={currentStep === 0}
              isLast={currentStep === STEPS.length - 1}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="flex items-center justify-between p-6 border-t bg-white/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </Button>
        </div>
      )}
    </div>
  )
} 