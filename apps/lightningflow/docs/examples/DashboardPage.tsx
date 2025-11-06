"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageShell } from "@/components/layout/PageShell"
import { RefreshCw, Plus, ExternalLink, Zap } from "lucide-react"
import { useState } from "react"
import { LineChart } from "@/components/ui/charts/LineChart"
import { BalanceCard } from "@/components/dashboard/BalanceCard"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { QuickAction } from "@/components/dashboard/QuickAction"
import Link from "next/link"

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  
  // Define page actions - consistent pattern across pages
  const pageActions = (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        disabled={refreshing}
        className="gap-1"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      
      <Button asChild size="sm" className="gap-1">
        <Link href="/receive">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Link>
      </Button>
    </>
  );
  
  return (
    <PageShell 
      title="Dashboard" 
      description="Your Lightning node status and activity"
      actions={pageActions}
      showSystemStatus={true}
    >
      {/* Main dashboard grid - follows UI consistency guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {/* Balance card */}
        <Card className="bg-card rounded-xl shadow-sm col-span-1 md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lightning Balance</CardTitle>
            <CardDescription>Current balance and 7-day trend</CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceCard />
          </CardContent>
        </Card>
        
        {/* Activity chart */}
        <Card className="bg-card rounded-xl shadow-sm col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Node Activity</CardTitle>
            <CardDescription>Transaction volume, last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <LineChart />
          </CardContent>
        </Card>
        
        {/* Quick actions */}
        <Card className="bg-card rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <QuickAction 
              title="Send Payment"
              description="Pay invoice or LNURL"
              icon={<Zap className="h-4 w-4" />}
              href="/send"
            />
            <QuickAction 
              title="Create Invoice"
              description="Receive payment"
              icon={<Plus className="h-4 w-4" />}
              href="/receive"
            />
            <QuickAction 
              title="Payment Links"
              description="Manage payment links"
              icon={<ExternalLink className="h-4 w-4" />}
              href="/payment-links"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity feed */}
      <Card className="bg-card rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityFeed limit={5} />
        </CardContent>
        <CardFooter className="bg-muted/20 border-t py-3">
          <div className="text-xs text-muted-foreground">
            Showing latest 5 transactions
          </div>
        </CardFooter>
      </Card>
    </PageShell>
  );
} 