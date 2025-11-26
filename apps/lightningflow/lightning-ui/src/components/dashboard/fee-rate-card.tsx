"use client"

import { Card, CardContent, CardHeader } from "../ui/card"
import { BarChart2 } from "lucide-react"
import { Button } from "../ui/button"
import { useDashboardActions } from "../../lib/actions"

export function FeeRateCard() {
  const { adjustFeeRate } = useDashboardActions()
  
  // Hardcoded data to match visual
  const feeRate = {
    percent: 0.25,
    description: "Competitive market rate"
  }

  return (
    <Card className="rounded-xl border border-border bg-muted/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-card border-b border-border/20 flex flex-row items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-green-600 dark:text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Fee Rate</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-7 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={adjustFeeRate}
        >
          Adjust
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-white mb-1">
            {feeRate.percent}%
          </h2>
          <p className="text-xs text-muted-foreground">per transaction</p>
          
          <div className="mt-4 text-xs text-muted-foreground">
            {feeRate.description}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 