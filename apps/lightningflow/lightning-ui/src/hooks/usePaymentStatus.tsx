"use client"

import { useState, useEffect, useCallback } from 'react'

export interface PaymentStatus {
  status: 'preparing' | 'pending' | 'routing' | 'completed' | 'failed' | 'fallback'
  progress: number
  message: string
  fallbackOptions?: FallbackOption[]
  estimatedTime?: number
  retryCount: number
  nodeHealth?: NodeHealth
}

export interface FallbackOption {
  type: 'onchain' | 'lnurl-withdraw' | 'custodial' | 'retry'
  label: string
  action: () => void
  estimatedTime: string
}

export interface NodeHealth {
  region: string
  latency: number
  channelLiquidity: number
  successRate: number
  isOptimal: boolean
}

export interface PaymentRequest {
  amount: number
  destination: string
  memo?: string
  region?: string
}

export function usePaymentStatus() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  // Get best node based on user's region
  const getBestNode = useCallback((region: string = 'US') => {
    const nodeMap: Record<string, string> = {
      'Africa': 'lnd-africa.yourdomain.com',
      'Asia': 'lnd-singapore.yourdomain.com',
      'Europe': 'lnd-europe.yourdomain.com',
      'South America': 'lnd-brazil.yourdomain.com',
      'Oceania': 'lnd-australia.yourdomain.com',
      'default': 'lnd-us-east.yourdomain.com'
    }
    return nodeMap[region] || nodeMap.default
  }, [])

  // Simulate real-time payment processing with intelligent fallbacks
  const processPayment = useCallback(async (request: PaymentRequest) => {
    const startTime = Date.now()
    let retryCount = 0
    const maxRetries = 3

    // Initial status
    setPaymentStatus({
      status: 'preparing',
      progress: 0,
      message: 'Preparing payment...',
      retryCount: 0,
      nodeHealth: {
        region: request.region || 'US',
        latency: Math.random() * 200 + 50,
        channelLiquidity: Math.random() * 100,
        successRate: 95 + Math.random() * 5,
        isOptimal: true
      }
    })

    // Show fallback options after 5 seconds
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true)
      setPaymentStatus(prev => prev ? {
        ...prev,
        message: 'Payment is taking longer than usual. Preparing fallback options...',
        fallbackOptions: [
          {
            type: 'retry',
            label: 'Retry with different route',
            action: () => processPayment({ ...request, region: 'Europe' }),
            estimatedTime: '30 seconds'
          },
          {
            type: 'onchain',
            label: 'Send via Bitcoin on-chain',
            action: () => console.log('Fallback to on-chain'),
            estimatedTime: '10-60 minutes'
          },
          {
            type: 'lnurl-withdraw',
            label: 'Generate withdrawal link',
            action: () => console.log('Generate LNURL-withdraw'),
            estimatedTime: 'Instant'
          }
        ]
      } : null)
    }, 5000)

    try {
      // Simulate payment routing phases
      const phases = [
        { status: 'pending' as const, progress: 20, message: 'Finding optimal route...', duration: 1000 },
        { status: 'routing' as const, progress: 60, message: 'Routing through Lightning Network...', duration: 2000 },
        { status: 'routing' as const, progress: 85, message: 'Confirming with destination...', duration: 1500 }
      ]

      for (const phase of phases) {
        await new Promise(resolve => setTimeout(resolve, phase.duration))
        
        setPaymentStatus(prev => prev ? {
          ...prev,
          status: phase.status,
          progress: phase.progress,
          message: phase.message,
          estimatedTime: Math.max(0, 8000 - (Date.now() - startTime))
        } : null)

        // Simulate potential failures and retries
        if (Math.random() < 0.1 && retryCount < maxRetries) { // 10% chance of needing retry
          retryCount++
          setPaymentStatus(prev => prev ? {
            ...prev,
            status: 'pending',
            progress: 30,
            message: `Route failed, trying alternative path (attempt ${retryCount + 1})...`,
            retryCount
          } : null)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Success
      clearTimeout(fallbackTimer)
      setPaymentStatus(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        message: 'Payment completed successfully!',
        estimatedTime: 0
      } : null)

      // Clear status after success animation
      setTimeout(() => {
        setPaymentStatus(null)
        setShowFallback(false)
      }, 3000)

    } catch (error) {
      clearTimeout(fallbackTimer)
      setPaymentStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        progress: 0,
        message: 'Payment failed. Please try again or use a fallback option.',
        fallbackOptions: [
          {
            type: 'retry',
            label: 'Retry payment',
            action: () => processPayment(request),
            estimatedTime: '30 seconds'
          },
          {
            type: 'onchain',
            label: 'Send via Bitcoin on-chain',
            action: () => console.log('Fallback to on-chain'),
            estimatedTime: '10-60 minutes'
          }
        ]
      } : null)
    }
  }, [])

  // Get BTC context for amount display
  const getBTCContext = useCallback((amount: number) => {
    const contexts = [
      { threshold: 100000000, context: "Full node operator level - serious business capital 🏢" },
      { threshold: 10000000, context: "10,000 microtransactions or monthly SaaS revenue 💼" },
      { threshold: 1000000, context: "1,000 client payments or weekly earnings target 📊" },
      { threshold: 100000, context: "100 small invoices or daily revenue goal 🎯" },
      { threshold: 10000, context: "10 micro-payments or single service fee ⚡" },
      { threshold: 1000, context: "Coffee money or small tip ☕" },
      { threshold: 0, context: "Dust payment or testing amount 🧪" }
    ]

    return contexts.find(c => amount >= c.threshold)?.context || "Minimal amount"
  }, [])

  return {
    paymentStatus,
    showFallback,
    processPayment,
    getBestNode,
    getBTCContext,
    clearPayment: () => {
      setPaymentStatus(null)
      setShowFallback(false)
    }
  }
} 