"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePaymentStatus, PaymentStatus, FallbackOption } from "../hooks/usePaymentStatus"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Wifi,
  Globe,
  ArrowRight,
  RefreshCw
} from "lucide-react"

interface PaymentStatusDisplayProps {
  paymentStatus: PaymentStatus | null
  showFallback: boolean
  onFallbackAction: (option: FallbackOption) => void
  onRetry: () => void
  className?: string
}

export function PaymentStatusDisplay({ 
  paymentStatus, 
  showFallback, 
  onFallbackAction, 
  onRetry,
  className = "" 
}: PaymentStatusDisplayProps) {
  if (!paymentStatus) return null

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'preparing':
        return <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
      case 'routing':
        return <Zap className="h-6 w-6 text-purple-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'fallback':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'preparing': return 'border-blue-500'
      case 'pending': return 'border-yellow-500'
      case 'routing': return 'border-purple-500'
      case 'completed': return 'border-green-500'
      case 'failed': return 'border-red-500'
      case 'fallback': return 'border-orange-500'
      default: return 'border-gray-500'
    }
  }

  const getProgressColor = () => {
    switch (paymentStatus.status) {
      case 'preparing': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'routing': return 'bg-purple-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'fallback': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={className}
      >
        <Card className={`border-2 ${getStatusColor()} bg-gray-900/95 backdrop-blur-md shadow-2xl`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <div className="text-lg font-bold text-white">
                  {paymentStatus.status === 'preparing' && 'Preparing Payment'}
                  {paymentStatus.status === 'pending' && 'Finding Route'}
                  {paymentStatus.status === 'routing' && 'Routing Payment'}
                  {paymentStatus.status === 'completed' && 'Payment Completed'}
                  {paymentStatus.status === 'failed' && 'Payment Failed'}
                  {paymentStatus.status === 'fallback' && 'Fallback Options'}
                </div>
                <div className="text-sm text-gray-400">
                  {paymentStatus.message}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            {paymentStatus.status !== 'completed' && paymentStatus.status !== 'failed' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-medium">{paymentStatus.progress}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={paymentStatus.progress} 
                    className="h-2 bg-gray-800"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
                    style={{ width: `${paymentStatus.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Estimated Time */}
            {paymentStatus.estimatedTime && paymentStatus.estimatedTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Estimated time: {Math.ceil(paymentStatus.estimatedTime / 1000)}s</span>
              </div>
            )}

            {/* Node Health Info */}
            {paymentStatus.nodeHealth && (
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Globe className="h-4 w-4" />
                  Network Health
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Region:</span>
                    <span className="ml-2 text-white">{paymentStatus.nodeHealth.region}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Latency:</span>
                    <span className="ml-2 text-white">{Math.round(paymentStatus.nodeHealth.latency)}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="ml-2 text-green-400">{paymentStatus.nodeHealth.successRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Liquidity:</span>
                    <span className="ml-2 text-blue-400">{Math.round(paymentStatus.nodeHealth.channelLiquidity)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Retry Count */}
            {paymentStatus.retryCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <RefreshCw className="h-4 w-4" />
                <span>Retry attempt {paymentStatus.retryCount}</span>
              </div>
            )}

            {/* Fallback Options */}
            {showFallback && paymentStatus.fallbackOptions && paymentStatus.fallbackOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                  Alternative Payment Methods
                </div>
                <div className="space-y-2">
                  {paymentStatus.fallbackOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-left"
                        onClick={() => onFallbackAction(option)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <div>
                            <div className="font-medium text-white">{option.label}</div>
                            <div className="text-xs text-gray-400">Est. {option.estimatedTime}</div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {paymentStatus.status === 'failed' && (
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={onRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              </div>
            )}

            {paymentStatus.status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center justify-center py-4"
              >
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-400">Success!</div>
                  <div className="text-sm text-gray-400">Payment completed successfully</div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// BTC Context Display Component
interface BTCContextDisplayProps {
  amount: number
  context: string
  className?: string
}

export function BTCContextDisplay({ amount, context, className = "" }: BTCContextDisplayProps) {
  const formatBTC = (sats: number) => {
    if (sats >= 100000000) return `₿${(sats / 100000000).toFixed(2)}`
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}K sats`
    return `${sats} sats`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-orange-950/30 to-yellow-950/30 border border-orange-800/30 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
          <Zap className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <div className="font-mono text-lg font-bold text-orange-400">
            {formatBTC(amount)}
          </div>
          <div className="text-sm text-orange-200/80">
            {context}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 