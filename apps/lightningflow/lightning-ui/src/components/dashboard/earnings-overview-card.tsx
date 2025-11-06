"use client"

import { Card, CardContent, CardHeader } from "../ui/card"
import { ArrowRight, TrendingUp } from "lucide-react"
import { mockNodeData } from "../../lib/mock-data"
import { Button } from "../ui/button"
import { useSmartRedirect } from "../../hooks/useSmartRedirect"
import { toast } from "sonner"

export function EarningsOverviewCard() {
  const { earnings } = mockNodeData
  const { goTo } = useSmartRedirect({ context: 'earnings-overview-card' })

  const handleLearnMore = () => {
    toast.info("Opening earnings guide", {
      description: "Loading optimization tips for increasing your revenue"
    })
    goTo('LEARN')
  }

  return (
    <Card className="rounded-xl border border-border bg-muted/10 shadow-sm overflow-hidden col-span-2">
      <CardHeader className="bg-card border-b border-border/20 flex flex-row items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
          </div>
          <h3 className="text-base font-semibold text-card-foreground">Earnings Overview</h3>
        </div>
        <p className="text-sm text-muted-foreground">Track your Lightning Network revenue streams</p>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Income from Routing</h4>
            <p className="text-2xl font-bold text-white">{earnings.routing.sats.toLocaleString()} sats</p>
            <p className="text-xs text-muted-foreground">+${earnings.routing.usd} USD</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Income from Sales</h4>
            <p className="text-2xl font-bold text-white">{earnings.sales.sats.toLocaleString()} sats</p>
            <p className="text-xs text-muted-foreground">+${earnings.sales.usd} USD</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Monthly Projection</h4>
            <p className="text-2xl font-bold text-green-500">{earnings.monthlyProjection.sats.toLocaleString()} sats</p>
            <p className="text-xs text-green-500/80">+${earnings.monthlyProjection.usd} USD</p>
          </div>
        </div>
        <div className="w-full h-24 flex items-end justify-between gap-1 mb-4">
          {/* This would be a real chart in a production app */}
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '40%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '30%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '50%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '45%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '70%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '55%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '65%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '75%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '80%' }}></div>
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '70%' }}></div>
        </div>
        <Button 
          className="bg-muted hover:bg-muted/80 border-none flex justify-start gap-2 text-sm py-3 px-4 w-full text-left"
          onClick={handleLearnMore}
        >
          Learn how to increase earnings
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
} 