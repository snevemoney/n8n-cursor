"use client"

import { BarChart3, LineChart, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"

export default function RoutingAnalyticsPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-500" />
        Routing Analytics
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="rounded-xl border border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Routing Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240 <span className="text-sm font-normal text-muted-foreground">sats</span></div>
            <div className="text-sm text-green-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>+14% from last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Routing Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <div className="text-sm text-amber-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>-2% from last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Forwarded Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">249,850 <span className="text-sm font-normal text-muted-foreground">sats</span></div>
            <div className="text-sm text-green-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>+8% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-12 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center mb-6">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-semibold mb-2">Advanced Routing Analytics Coming Soon</h2>
        <p className="text-gray-400 max-w-md text-center mb-4">
          Detailed routing performance metrics and visualizations are being implemented.
          Check back soon to optimize your Lightning Node's routing capabilities!
        </p>
        <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-950">
          Join Waitlist for Early Access
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-500" />
            Routing Performance Metrics
          </h3>
          <p className="text-gray-300 mb-4">
            Track and optimize these key routing metrics:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              Forward success/failure rate by channel
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              Fee earnings over time (hourly/daily/weekly)
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              Channel liquidity balance optimization
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              Most profitable routes and channels
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Optimize Your Routing Strategy
          </h3>
          <p className="text-gray-300 mb-4">
            Coming tools to enhance routing revenue:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
              AI-powered fee optimization suggestions
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
              Channel rebalancing automation
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
              Peer quality scoring and recommendations
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
              Automatic capital allocation optimization
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 