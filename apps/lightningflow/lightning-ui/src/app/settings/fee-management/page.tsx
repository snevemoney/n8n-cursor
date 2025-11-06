"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import { RealityAwareFees } from "../../../components/settings/reality-aware-fees"
import { 
  Coins, 
  ArrowLeft,
  Settings,
  TrendingUp,
  Calculator,
  Info
} from "lucide-react"

export default function FeeManagementPage() {
  const { goTo } = useSmartRedirect({ context: 'fee-management' })

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => goTo('SETTINGS')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Coins className="h-8 w-8 text-orange-500" />
            Fee Management
          </h1>
          <p className="text-gray-400 mt-2">
            Configure and optimize your Lightning Network fee structure for maximum profitability
          </p>
        </div>
      </div>

      {/* Fee Management Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              Current Fee Structure
            </CardTitle>
            <CardDescription>
              Your active fee rates and policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Base Fee:</span>
                <span className="text-white font-medium">1,000 msat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Fee Rate:</span>
                <span className="text-orange-400 font-medium">250 ppm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">Competitive</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Fee Performance
            </CardTitle>
            <CardDescription>
              Revenue generated from your fee structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Today:</span>
                <span className="text-green-400 font-medium">247 sats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">This Week:</span>
                <span className="text-green-400 font-medium">1,823 sats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Success Rate:</span>
                <span className="text-green-400 font-medium">98.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-500" />
              Fee Calculator
            </CardTitle>
            <CardDescription>
              Estimate earnings with different fee structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">100k sat payment</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(1 + 100000 * 0.00025)} sats fee
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Based on current fee structure
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Fee Management Component */}
      <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-card overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-500" />
            Advanced Fee Configuration
          </CardTitle>
          <CardDescription>
            Configure channel-specific fee rates with reality-aware constraints and market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RealityAwareFees onFeesUpdated={(fees) => console.log('Fees updated:', fees)} />
        </CardContent>
      </Card>

      {/* Fee Strategy Guide */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Fee Strategy Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/30 border border-blue-800/30 rounded-lg">
                <h4 className="font-medium text-blue-100 mb-2">Low Fee Strategy</h4>
                <p className="text-sm text-blue-200 mb-2">
                  Base: 200-500 msat, Rate: 100-200 ppm
                </p>
                <p className="text-xs text-blue-300">
                  Attracts high volume, good for well-connected nodes
                </p>
              </div>
              <div className="p-4 bg-green-950/30 border border-green-800/30 rounded-lg">
                <h4 className="font-medium text-green-100 mb-2">Balanced Strategy</h4>
                <p className="text-sm text-green-200 mb-2">
                  Base: 500-1000 msat, Rate: 200-400 ppm
                </p>
                <p className="text-xs text-green-300">
                  Good balance of volume and profitability
                </p>
              </div>
              <div className="p-4 bg-purple-950/30 border border-purple-800/30 rounded-lg">
                <h4 className="font-medium text-purple-100 mb-2">Premium Strategy</h4>
                <p className="text-sm text-purple-200 mb-2">
                  Base: 1000+ msat, Rate: 400+ ppm
                </p>
                <p className="text-xs text-purple-300">
                  Higher margins, suitable for specialized routes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Network Average</span>
                  <span className="text-orange-400">285 ppm</span>
                </div>
                <div className="text-xs text-gray-400">
                  Your rate: 250 ppm (12% below average)
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Competitive Range</span>
                  <span className="text-green-400">200-350 ppm</span>
                </div>
                <div className="text-xs text-gray-400">
                  You're in the competitive sweet spot
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Recommendation</span>
                  <span className="text-blue-400">Maintain</span>
                </div>
                <div className="text-xs text-gray-400">
                  Current rates are attracting good volume
                </div>
              </div>
              
              <div className="p-4 bg-yellow-950/30 border border-yellow-800/30 rounded-lg">
                <h4 className="font-medium text-yellow-100 mb-2">💡 Optimization Tip</h4>
                <p className="text-sm text-yellow-200">
                  Consider lowering fees on high-capacity channels to increase routing volume during peak hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee History and Analytics */}
      <Card className="border-gray-800 bg-gray-850/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Fee Revenue Analytics
          </CardTitle>
          <CardDescription>
            Track your fee revenue performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-green-400">247</div>
              <div className="text-sm text-gray-400">Today (sats)</div>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-green-400">1,823</div>
              <div className="text-sm text-gray-400">This Week (sats)</div>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-green-400">7,456</div>
              <div className="text-sm text-gray-400">This Month (sats)</div>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">98.7%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-950/30 border border-green-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="font-medium text-green-100">Revenue Trend</span>
            </div>
            <p className="text-sm text-green-200">
              Your fee revenue has increased by 23% this month compared to last month. 
              The current fee structure is performing well and attracting consistent routing volume.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 