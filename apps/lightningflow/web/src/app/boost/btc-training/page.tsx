"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import { BTCThinkingTrainer } from "../../../components/BTCThinkingTrainer"
import { BTCForecastPlanner } from "../../../components/BTCForecastPlanner"
import { BTCValueCard } from "../../../components/BTCValueCard"
import { 
  Bitcoin, 
  TrendingUp, 
  ArrowLeft,
  Brain,
  Calculator,
  Target
} from "lucide-react"

export default function BTCTrainingPage() {
  const { goTo } = useSmartRedirect({ context: 'btc-training' })

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => goTo('BOOST')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Boost
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bitcoin className="h-8 w-8 text-orange-500" />
            Bitcoin Mindset Training
          </h1>
          <p className="text-gray-400 mt-2">
            Develop Bitcoin-native thinking for your business operations and financial planning
          </p>
        </div>
      </div>

      {/* Training Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Mindset Training
            </CardTitle>
            <CardDescription>
              Learn to think in Bitcoin terms for business decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Train your brain to naturally think in sats, BTC, and payment flows rather than traditional fiat concepts.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-500" />
              Value Breakdown
            </CardTitle>
            <CardDescription>
              Understand Bitcoin amounts in multiple formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              See live conversions between BTC, sats, and USD to build intuitive understanding of Bitcoin values.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Financial Planning
            </CardTitle>
            <CardDescription>
              Plan your Bitcoin cash flows and projections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Forecast your Bitcoin income and expenses to make informed business decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BTC Training & Value Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* BTC Thinking Trainer */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Bitcoin Thinking Exercises
              </CardTitle>
              <CardDescription>
                Practice thinking in Bitcoin terms for different business scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BTCThinkingTrainer />
            </CardContent>
          </Card>
        </div>

        {/* BTC Value Breakdown */}
        <div className="space-y-4">
          <BTCValueCard 
            amountBTC={0.00152} 
            title="Your Current Holdings"
            className="border-gray-800 bg-gray-850/80"
          />
          <BTCValueCard 
            amountBTC={0.01} 
            title="Next Milestone"
            className="border-gray-800 bg-gray-850/80"
          />
          <BTCValueCard 
            amountBTC={0.1} 
            title="Business Goal"
            className="border-gray-800 bg-gray-850/80"
          />
        </div>
      </div>

      {/* BTC Flow Planning */}
      <div className="grid gap-6">
        <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Bitcoin Financial Planning
            </CardTitle>
            <CardDescription>
              Plan and forecast your Bitcoin cash flows for better business decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BTCForecastPlanner />
          </CardContent>
        </Card>
      </div>

      {/* Training Tips */}
      <Card className="border-gray-800 bg-gray-850/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            Bitcoin Business Mindset Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-400">Think in Payment Flows</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Focus on revenue streams, not purchases</li>
                <li>• Consider routing fees as passive income</li>
                <li>• Plan for instant settlement benefits</li>
                <li>• Think globally, transact instantly</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-400">Business Scaling</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Each sat represents potential growth</li>
                <li>• Lightning enables micro-revenue models</li>
                <li>• Automate payments for efficiency</li>
                <li>• Build recurring Bitcoin income</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 