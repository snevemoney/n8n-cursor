/**
 * Lightning AI Platform - Payments Hub
 * Central hub for all Lightning payment operations
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Send,
  Plus,
  Receipt,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  QrCode,
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react"

interface PaymentMetrics {
  totalSent: number
  totalReceived: number
  pendingPayments: number
  successRate: number
}

export default function PaymentsHub() {
  const router = useRouter()
  
  const [metrics] = useState<PaymentMetrics>({
    totalSent: 2500000,
    totalReceived: 3200000,
    pendingPayments: 2,
    successRate: 99.8
  })

  const formatSats = (sats: number) => {
    if (sats >= 100000) {
      return `${(sats / 100000).toFixed(1)}M`
    }
    if (sats >= 1000) {
      return `${(sats / 1000).toFixed(0)}k`
    }
    return sats.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Payments Hub</h1>
        <p className="text-muted-foreground mt-2">Manage all your Lightning Network payments</p>
      </div>

      {/* Payment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold text-foreground">{formatSats(metrics.totalSent)} sats</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold text-foreground">{formatSats(metrics.totalReceived)} sats</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowDownRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{metrics.pendingPayments}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{metrics.successRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/send')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Send Payment</h3>
                <p className="text-sm text-muted-foreground">Pay Lightning invoice instantly</p>
              </div>
              <Button size="sm" className="w-full">
                Send Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/receive')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-lg">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Get Paid</h3>
                <p className="text-sm text-muted-foreground">Create invoices & requests</p>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Create Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/invoices')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-purple-100 rounded-lg">
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Invoices</h3>
                <p className="text-sm text-muted-foreground">Manage payment requests</p>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                View Invoices
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/history')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <History className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Payment History</h3>
                <p className="text-sm text-muted-foreground">Track all transactions</p>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Payments
          </CardTitle>
          <CardDescription>Your latest Lightning transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Payment received</p>
                  <p className="text-sm text-muted-foreground">Invoice #INV-001</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+25,000 sats</p>
                <p className="text-sm text-muted-foreground">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Payment sent</p>
                  <p className="text-sm text-muted-foreground">To supplier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">-50,000 sats</p>
                <p className="text-sm text-muted-foreground">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Pending payment</p>
                  <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-orange-600">15,000 sats</p>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={() => router.push('/payments/history')}>
              View All Transactions
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 