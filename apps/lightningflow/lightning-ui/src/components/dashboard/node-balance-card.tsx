"use client"

import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Bitcoin } from "lucide-react"
import { useDashboardActions } from "../../lib/actions"

export function NodeBalanceCard() {
  const { goToSend, goToReceive } = useDashboardActions()
  
  return (
    <Card className="rounded-xl border border-border bg-muted/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-card border-b border-border/20 flex flex-row items-center justify-between p-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Bitcoin className="h-4 w-4 text-yellow-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Node Balance</h3>
          </div>
          <div className="text-3xl font-bold text-white">23,540 <span className="text-base font-normal text-muted-foreground">sats</span></div>
          <div className="text-xs text-muted-foreground">≈ $9.89 USD</div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-2 w-full bg-gray-800 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-green-500 w-[60%]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white w-full"
            onClick={goToReceive}
          >
            Receive
          </Button>
          <Button
            size="sm"
            variant="lightning"
            className="w-full"
            onClick={goToSend}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 