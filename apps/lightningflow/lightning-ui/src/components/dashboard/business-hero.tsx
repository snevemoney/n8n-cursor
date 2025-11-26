"use client"

import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useSmartRedirect } from "../../hooks/useSmartRedirect"
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  ArrowRight,
  Shield,
  Rocket,
  Target
} from "lucide-react"

/**
 * Business Hero Section
 * 
 * Reinforces the core nucleus: "Your Lightning Node is Your Business"
 * Focuses on payments, earnings, and growth
 */

export function BusinessHero() {
  const { goTo } = useSmartRedirect({ context: 'business-hero' })

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-amber-900/20 rounded-xl border border-gray-800/50 mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="relative p-8">
        {/* Main Hero Message */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-amber-500/20 p-2 rounded-full">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
            <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
              Node Active
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">
            Your Lightning Node is Your Business
          </h1>
          
          <p className="text-xl text-gray-300 mb-2">
            Send, earn, and grow — while saving 90% on fees.
          </p>
          
          <p className="text-lg text-gray-400">
            Build your business, not your payment processor's.
          </p>
        </div>

        {/* Core Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Payments Hub */}
          <Card className="bg-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-colors cursor-pointer"
                onClick={() => goTo('MONEY')}>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Payments Hub
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Send & receive Bitcoin instantly. Replace Stripe/PayPal with sovereign payments.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Start Paying <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Node Earnings */}
          <Card className="bg-gray-900/50 border-gray-700/50 hover:border-green-500/50 transition-colors cursor-pointer"
                onClick={() => goTo('EARN')}>
            <CardContent className="p-6 text-center">
              <div className="bg-green-500/20 p-3 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Node Income
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Earn from routing payments. Your node works 24/7 generating revenue.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Earnings <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Business Boost */}
          <Card className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-colors cursor-pointer"
                onClick={() => goTo('SCALE')}>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-500/20 p-3 rounded-full w-fit mx-auto mb-4">
                <Rocket className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Boost Business
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                AI assistants, automation, and tools to scale your Lightning business.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Explore Tools <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">$247</div>
            <div className="text-xs text-gray-400">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">1,234</div>
            <div className="text-xs text-gray-400">Payments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">89%</div>
            <div className="text-xs text-gray-400">Fee Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">24/7</div>
            <div className="text-xs text-gray-400">Uptime</div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => goTo('SEND')}
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Send Payment
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => goTo('RECEIVE')}
          >
            <Target className="h-5 w-5 mr-2" />
            Get Paid
          </Button>

          <Button 
            size="lg" 
            variant="outline"
            onClick={() => goTo('AI')}
          >
            <Rocket className="h-5 w-5 mr-2" />
            AI Tools
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-700/50">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">
            Sovereign • Non-custodial • Cryptographically Verified
          </span>
        </div>
      </div>
    </div>
  )
} 