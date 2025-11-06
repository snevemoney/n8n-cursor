"use client"

import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { ArrowUpRight, Zap, SendHorizontal } from "lucide-react"
import { useDashboardActions } from "../../lib/actions"

// Mock data for recent payments
const mockRecentPayments = [
  {
    recipient: "Coffee Shop",
    amount: 2500,
    timeAgo: "2 hours ago"
  },
  {
    recipient: "Web Design",
    amount: 50000,
    timeAgo: "Yesterday"
  }
]

export function SendMoneyCard() {
  const { goToSend } = useDashboardActions()
  
  // Use the first mock payment
  const lastPayment = mockRecentPayments[0]

  return (
    <Card className="rounded-xl border border-border bg-muted/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-card border-b border-border/20 flex flex-row items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full flex items-center justify-center">
            <SendHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Send Money</h3>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-300">Pay teammates or suppliers instantly</span>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            No bank delays, no international fees
          </div>
        </div>
        
        <Button 
          className="w-full bg-lightning-yellow hover:bg-lightning-yellow/90 text-gray-900 font-medium flex items-center justify-center gap-1"
          onClick={goToSend}
        >
          <span>Send Now</span>
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
} 