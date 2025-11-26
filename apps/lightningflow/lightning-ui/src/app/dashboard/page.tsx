/**
 * Lightning AI Platform - Comprehensive Business Dashboard
 * 
 * Professional Lightning Node Dashboard with:
 * - Real-time node metrics and channel status
 * - Revenue analytics and routing performance
 * - AI-powered business insights
 * - Security monitoring and alerts
 */

"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft,
  Plus,
  Send,
  MessageSquare,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  const [nodeData, setNodeData] = useState({
    balance: '12.5M',
    channels: 76,
    earnings: '84',
    security: 85,
    status: 'optimal'
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <div className="bg-card/80 backdrop-blur border-b border-border">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Lightning Business Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete overview of your Lightning node</p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* 3-Panel Layout: Overview • Node • Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Panel 1: Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Overview</h2>
            
            {/* Total Balance */}
            <Card className="bg-card shadow-sm border border-border rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-orange-500" />
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{nodeData.balance} sats</div>
                <div className="text-sm text-muted-foreground mt-1">+2.1% this week</div>
              </CardContent>
            </Card>

            {/* Daily Earnings */}
            <Card className="bg-card shadow-sm border border-border rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Daily Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{nodeData.earnings} sats</div>
                <div className="text-sm text-muted-foreground mt-1">Today's earnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 2: Node */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Node</h2>
            
            {/* Active Channels */}
            <Card className="bg-card shadow-sm border border-border rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Active Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{nodeData.channels}</div>
                <div className="text-sm text-muted-foreground mt-1">8 pending</div>
              </CardContent>
            </Card>

            {/* Security Score */}
            <Card className="bg-card shadow-sm border border-border rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-purple-500" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{nodeData.security}%</div>
                <div className="text-sm text-green-600 mt-1">Excellent</div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 3: Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Button className="w-full justify-start bg-card border border-border text-foreground hover:bg-accent rounded-xl h-14">
                <Plus className="w-5 h-5 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Create Invoice</div>
                  <div className="text-xs text-muted-foreground">Request payment</div>
                </div>
              </Button>

              <Button className="w-full justify-start bg-card border border-border text-foreground hover:bg-accent rounded-xl h-14">
                <Send className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Send Payment</div>
                  <div className="text-xs text-muted-foreground">Pay Lightning invoice</div>
                </div>
              </Button>

              <Button className="w-full justify-start bg-card border border-border text-foreground hover:bg-accent rounded-xl h-14">
                <MessageSquare className="w-5 h-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">AI Assistant</div>
                  <div className="text-xs text-muted-foreground">Get help with tasks</div>
                </div>
              </Button>

              <Button className="w-full justify-start bg-card border border-border text-foreground hover:bg-accent rounded-xl h-14">
                <BarChart3 className="w-5 h-5 mr-3 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-muted-foreground">View performance</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card shadow-sm border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground flex items-center">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Received payment from client</div>
                    <div className="text-xs text-muted-foreground">2 minutes ago</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">+250 sats</div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Forwarded 3.2k sats via routing</div>
                    <div className="text-xs text-muted-foreground">15 minutes ago</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-blue-600">+32 sats</div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Payment to supplier</div>
                    <div className="text-xs text-muted-foreground">1 hour ago</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground">-500 sats</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clean System Status Bar */}
        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-green-400">System Status</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-green-400">
              <span>Lightning Node: Online</span>
              <span>Security: Excellent (96%)</span>
              <span>Network: Connected to 8 peers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 