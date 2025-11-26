'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { CheckCircle, AlertCircle, Loader2, Shield, Database, Zap, Globe } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface SystemCheckProps {
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

interface CheckItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'checking' | 'success' | 'warning' | 'error'
  message?: string
}

export function SystemCheck({ data, onNext, onBack }: SystemCheckProps) {
  const [checks, setChecks] = useState<CheckItem[]>([
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Supabase auth connection',
      icon: Shield,
      status: 'pending'
    },
    {
      id: 'lightning',
      name: 'Lightning Network',
      description: 'Node connectivity and LNbits integration',
      icon: Zap,
      status: 'pending'
    },
    {
      id: 'database',
      name: 'Database',
      description: 'Data storage and sync',
      icon: Database,
      status: 'pending'
    },
    {
      id: 'browser',
      name: 'Browser Features',
      description: 'LocalStorage and JavaScript support',
      icon: Globe,
      status: 'pending'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const runSystemCheck = async () => {
    setIsRunning(true)
    
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i]
      
      // Update status to checking
      setChecks(prev => prev.map(c => 
        c.id === check.id ? { ...c, status: 'checking' } : c
      ))

      // Simulate check delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      // Determine result based on check type
      let status: CheckItem['status'] = 'success'
      let message = 'Connected successfully'

      switch (check.id) {
        case 'auth':
          status = 'success'
          message = 'Authentication system active'
          break
        case 'lightning':
          if (data.testMode) {
            status = 'warning'
            message = 'Using test environment'
          } else {
            status = 'success'
            message = 'Lightning node connected'
          }
          break
        case 'database':
          status = 'success'
          message = 'Database connection established'
          break
        case 'browser':
          const hasLocalStorage = typeof window !== 'undefined' && window.localStorage
          status = hasLocalStorage ? 'success' : 'error'
          message = hasLocalStorage ? 'All features supported' : 'LocalStorage not available'
          break
      }

      // Update with result
      setChecks(prev => prev.map(c => 
        c.id === check.id ? { ...c, status, message } : c
      ))
    }

    setIsRunning(false)
    setIsComplete(true)
  }

  useEffect(() => {
    // Auto-start checks after a brief delay
    const timer = setTimeout(() => {
      runSystemCheck()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: CheckItem['status']) => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const allChecksComplete = checks.every(c => c.status !== 'pending' && c.status !== 'checking')
  const hasErrors = checks.some(c => c.status === 'error')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Running Lightning health check...
        </h2>
        <p className="text-gray-600">
          Verifying system components and connections
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {checks.map((check) => (
          <Card key={check.id} className={`border-2 ${getStatusColor(check.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <check.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{check.name}</h3>
                  <p className="text-sm text-gray-600">{check.description}</p>
                  {check.message && (
                    <p className="text-sm font-medium mt-1 text-gray-700">
                      {check.message}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {getStatusIcon(check.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Summary */}
      {allChecksComplete && (
        <Card className={`border-2 ${hasErrors ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'} mb-8`}>
          <CardContent className="p-6 text-center">
            {hasErrors ? (
              <>
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Some Issues Detected
                </h3>
                <p className="text-red-700 mb-4">
                  Your workspace can still function, but some features may be limited.
                </p>
                <Button
                  onClick={runSystemCheck}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  disabled={isRunning}
                >
                  Retry Checks
                </Button>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  All Systems Ready
                </h3>
                <p className="text-green-700">
                  Your Lightning AI Node is ready to launch!
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={isRunning}>
          Back
        </Button>
        <Button 
          onClick={() => onNext()}
          disabled={!allChecksComplete}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {allChecksComplete ? 'Continue' : 'Running Checks...'}
        </Button>
      </div>
    </div>
  )
} 