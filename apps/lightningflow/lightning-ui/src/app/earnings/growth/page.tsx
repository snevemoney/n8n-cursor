"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import { TrendingUp, ArrowLeft } from "lucide-react"

export default function GrowthPage() {
  const { goTo } = useSmartRedirect({ context: 'growth' })

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goTo('/earnings')}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Earnings
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-900/30 p-2 rounded-full">
          <TrendingUp className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Growth Analytics</h1>
          <p className="text-gray-400">Track your business growth and trends</p>
        </div>
      </div>

      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Growth analytics are under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            This section will show growth trends, revenue projections, and business insights.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 