"use client"

import { useState } from 'react'
import { Plus, ExternalLink, Copy, QrCode, Receipt, Link, Calendar, DollarSign } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { toast } from 'sonner'

interface PaymentLink {
  id: string
  title: string
  amount: number
  description: string
  status: 'active' | 'expired' | 'paid'
  created: string
  expires: string
  url: string
  payments: number
}

interface Invoice {
  id: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'expired'
  created: string
  expires: string
  paymentRequest: string
}

const mockPaymentLinks: PaymentLink[] = [
  {
    id: '1',
    title: 'Freelance Web Design',
    amount: 500000,
    description: 'Payment for website redesign project',
    status: 'active',
    created: '2024-01-15',
    expires: '2024-02-15',
    url: 'https://pay.lightning-ai.com/link/abc123',
    payments: 0
  },
  {
    id: '2',
    title: 'Consulting Session',
    amount: 150000,
    description: 'Lightning Network consultation',
    status: 'paid',
    created: '2024-01-10',
    expires: '2024-01-25',
    url: 'https://pay.lightning-ai.com/link/def456',
    payments: 1
  },
  {
    id: '3',
    title: 'Monthly Subscription',
    amount: 50000,
    description: 'Premium service subscription',
    status: 'active',
    created: '2024-01-01',
    expires: '2024-12-31',
    url: 'https://pay.lightning-ai.com/link/ghi789',
    payments: 3
  }
]

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    description: 'Lightning consultation payment',
    amount: 100000,
    status: 'pending',
    created: '2024-01-20',
    expires: '2024-01-21',
    paymentRequest: 'lnbc1m1pjkh...'
  },
  {
    id: 'inv_2',
    description: 'Website development milestone',
    amount: 250000,
    status: 'paid',
    created: '2024-01-18',
    expires: '2024-01-19',
    paymentRequest: 'lnbc2m5pjkh...'
  },
  {
    id: 'inv_3',
    description: 'API integration service',
    amount: 75000,
    status: 'expired',
    created: '2024-01-15',
    expires: '2024-01-16',
    paymentRequest: 'lnbc750upjkh...'
  }
]

export default function InvoicesPage() {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(mockPaymentLinks)
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)

  const formatSats = (sats: number) => {
    return new Intl.NumberFormat().format(sats)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'pending':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'paid':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'expired':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-500" />
            Invoices & Payment Links
          </h1>
          <p className="text-muted-foreground">Manage invoices and create payment links for your business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button className="bg-yellow-600 hover:bg-yellow-700">
            <Link className="h-4 w-4 mr-2" />
            Create Payment Link
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <div className="text-sm text-muted-foreground">
              {invoices.filter(inv => inv.status === 'pending').length} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Link className="h-4 w-4" />
              Payment Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentLinks.length}</div>
            <div className="text-sm text-muted-foreground">
              {paymentLinks.filter(link => link.status === 'active').length} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatSats(
                invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0) +
                paymentLinks.reduce((sum, link) => sum + (link.amount * link.payments), 0)
              )} sats
            </div>
            <div className="text-sm text-muted-foreground">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentLinks.reduce((sum, link) => sum + link.payments, 0) + 
               invoices.filter(inv => inv.status === 'paid').length}
            </div>
            <div className="text-sm text-muted-foreground">Payments received</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Lightning Invoices
          </TabsTrigger>
          <TabsTrigger value="payment-links" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Payment Links
          </TabsTrigger>
        </TabsList>

        {/* Lightning Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lightning Invoices</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
          
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{invoice.description}</h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">{formatSats(invoice.amount)} sats</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">{invoice.created}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <div className="font-medium">{invoice.expires}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Invoice ID:</span>
                        <div className="font-medium font-mono text-xs">{invoice.id}</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {invoice.paymentRequest}...
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(invoice.paymentRequest)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Payment Links Tab */}
        <TabsContent value="payment-links" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Payment Links</h2>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Payment Link
            </Button>
          </div>
          
          {paymentLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{link.title}</h3>
                      <Badge className={getStatusColor(link.status)}>
                        {link.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3">{link.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">{formatSats(link.amount)} sats</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payments:</span>
                        <div className="font-medium">{link.payments}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">{link.created}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <div className="font-medium">{link.expires}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
} 