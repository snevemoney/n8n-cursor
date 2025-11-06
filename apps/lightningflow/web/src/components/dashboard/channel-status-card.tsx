"use client"

import { Card, CardContent, CardHeader } from "../ui/card"
import { Network } from "lucide-react"
import Link from "next/link"

export function ChannelStatusCard() {
  // Hardcoded data to match visual
  const channels = {
    active: 4,
    total: 5,
    pending: 1
  }

  return (
    <Card className="rounded-xl border border-border bg-muted/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-card border-b border-border/20 flex flex-row items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full flex items-center justify-center">
            <Network className="h-4 w-4 text-purple-600 dark:text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Channels</h3>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="mb-2">
          <h2 className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-white">{channels.active}</span>
            <span className="text-xl font-semibold text-white opacity-50">/</span>
            <span className="text-xl font-semibold text-muted-foreground">{channels.total}</span>
          </h2>
          <p className="text-xs text-muted-foreground">Active Channels</p>
          {channels.pending > 0 && (
            <div className="mt-3 text-xs inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {channels.pending} pending channel
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 