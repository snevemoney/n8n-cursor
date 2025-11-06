'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { QRCode } from '../../components/qr-code'
import { TrustInfo } from '../../components/ui/trust-info'
import { Zap, Copy, Check, RefreshCw, Shield, Vault, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { lnbitsClient } from '../../lib/lnbits'
import type { PaymentMetadata, LightningInvoice } from '../../lib/lnbits'

interface PaymentTest {
  id: string
  type: 'invoice' | 'payment'
  amount: number
  memo: string
  status: 'pending' | 'completed' | 'failed'
  invoice?: LightningInvoice
  metadata?: PaymentMetadata
  qrCode?: string
  timestamp: number
  cryptographicProof?: string
  vaultRouted?: boolean
}

export function PaymentTestHarness() {
  const [amount, setAmount] = useState<string>('1000')
  const [memo, setMemo] = useState<string>('Test Lightning Payment')
  const [paymentRequest, setPaymentRequest] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTests, setActiveTests] = useState<PaymentTest[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  // Mock user ID for testing
  const userId = 'test-user-123'

  const createInvoice = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      const { invoice, metadata } = await lnbitsClient.createInvoice(
        parseInt(amount),
        memo,
        userId
      )

      const newTest: PaymentTest = {
        id: invoice.checking_id,
        type: 'invoice',
        amount: parseInt(amount),
        memo,
        status: 'pending',
        invoice,
        metadata,
        qrCode: invoice.payment_request,
        timestamp: Date.now(),
        cryptographicProof: metadata.cryptographic_proof,
        vaultRouted: metadata.vault_routed
      }

      setActiveTests(prev => [newTest, ...prev])
      toast.success('Lightning invoice created successfully!')

      // Start polling for payment status
      pollPaymentStatus(invoice.checking_id)

    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast.error('Failed to create Lightning invoice')
    } finally {
      setIsLoading(false)
    }
  }

  const sendPayment = async () => {
    if (!paymentRequest.trim()) {
      toast.error('Please enter a Lightning invoice')
      return
    }

    setIsLoading(true)
    try {
      const { payment, metadata } = await lnbitsClient.sendPayment(
        paymentRequest,
        userId,
        `Test payment: ${memo}`
      )

      const newTest: PaymentTest = {
        id: payment.checking_id,
        type: 'payment',
        amount: payment.amount,
        memo: payment.memo,
        status: 'completed',
        metadata,
        timestamp: Date.now(),
        cryptographicProof: metadata.cryptographic_proof,
        vaultRouted: metadata.vault_routed
      }

      setActiveTests(prev => [newTest, ...prev])
      toast.success('Lightning payment sent successfully!')
      setPaymentRequest('')

    } catch (error) {
      console.error('Failed to send payment:', error)
      toast.error('Failed to send Lightning payment')
    } finally {
      setIsLoading(false)
    }
  }

  const pollPaymentStatus = async (checkingId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const status = await lnbitsClient.checkPaymentStatus(checkingId)
        
        if (status) {
          // Payment completed if we get a valid response
          setActiveTests(prev => prev.map(test => 
            test.id === checkingId 
              ? { ...test, status: 'completed' }
              : test
          ))
          toast.success('Payment confirmed!')
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          // Timeout
          setActiveTests(prev => prev.map(test => 
            test.id === checkingId 
              ? { ...test, status: 'failed' }
              : test
          ))
          toast.error('Payment timeout - please check manually')
        }
      } catch (error) {
        console.error('Failed to check payment status:', error)
      }
    }

    // Start polling after 5 seconds
    setTimeout(poll, 5000)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type} copied to clipboard`)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const refreshStatus = async (testId: string) => {
    try {
      const status = await lnbitsClient.checkPaymentStatus(testId)
      if (status) {
        setActiveTests(prev => prev.map(test => 
          test.id === testId 
            ? { ...test, status: 'completed' }
            : test
        ))
        toast.success('Status updated')
      }
    } catch (error) {
      toast.error('Failed to refresh status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4" />
      case 'failed': return <Zap className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          ⚡ Lightning Payment Test Harness
        </h1>
        <p className="text-muted-foreground">
          Test your Lightning Network integration with real Bitcoin payments
        </p>
      </div>

      {/* Create Invoice Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Create Lightning Invoice
          </CardTitle>
          <CardDescription>
            Generate a Lightning invoice to receive payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (sats)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">Memo</Label>
              <Input
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Payment description"
              />
            </div>
          </div>
          <Button 
            onClick={createInvoice} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Create Invoice
          </Button>
        </CardContent>
      </Card>

      {/* Send Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Send Lightning Payment
          </CardTitle>
          <CardDescription>
            Pay a Lightning invoice with cryptographic enforcement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-request">Lightning Invoice</Label>
            <Textarea
              id="payment-request"
              value={paymentRequest}
              onChange={(e) => setPaymentRequest(e.target.value)}
              placeholder="lnbc1000n1p..."
              rows={3}
            />
          </div>
          <Button 
            onClick={sendPayment} 
            disabled={isLoading || !paymentRequest.trim()}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Send Payment
          </Button>
        </CardContent>
      </Card>

      {/* Active Tests */}
      {activeTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Tests</CardTitle>
            <CardDescription>
              Real-time status of your Lightning payment tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTests.map((test) => (
              <div key={test.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={test.type === 'invoice' ? 'default' : 'secondary'}>
                      {test.type === 'invoice' ? 'Receive' : 'Send'}
                    </Badge>
                    <Badge className={getStatusColor(test.status)}>
                      {getStatusIcon(test.status)}
                      <span className="ml-1 capitalize">{test.status}</span>
                    </Badge>
                    {test.vaultRouted && (
                      <Badge variant="outline" className="text-purple-600">
                        <Vault className="h-3 w-3 mr-1" />
                        Vault Routed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshStatus(test.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="font-mono text-lg">{test.amount.toLocaleString()} sats</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Memo</div>
                    <div className="truncate">{test.memo}</div>
                  </div>
                </div>

                {test.qrCode && test.type === 'invoice' && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Lightning Invoice</div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg">
                        <QRCode value={test.qrCode} size={120} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                          {test.qrCode}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(test.qrCode!, 'Invoice')}
                        >
                          {copied === 'Invoice' ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Copy Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {test.cryptographicProof && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Cryptographic Proof
                    </div>
                    <TrustInfo
                      hash={test.cryptographicProof}
                      timestamp={test.timestamp}
                      verified={test.status === 'completed'}
                      size="md"
                    />
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Test ID: {test.id} • {new Date(test.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 