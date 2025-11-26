"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, ArrowUpFromLine, Zap, Clock, Scan, QrCode, Copy, ExternalLink, Send, Check, Shield, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { TrustInfo } from "../../../components/ui/trust-info"
import { toast } from "sonner"
import { signAndExecute, dryRun, ExecutionContext, ActionPreview } from "../../../core/crypto/signAndExecute"
import { createPayload } from "../../../core/crypto"
import { CurrencySelect } from "../../../components/ui/currency-select"
import { Currency, convertCurrency, formatCurrency } from "../../../lib/currency"

interface PaymentForm {
  invoice: string
  amount: string
  description: string
  recipient?: string
}

export default function SendPage() {
  const router = useRouter()
  const { goTo } = useSmartRedirect({ context: 'send-page' })
  const [form, setForm] = useState<PaymentForm>({
    invoice: '',
    amount: '',
    description: ''
  })
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("BTC")
  const [equivalentAmount, setEquivalentAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [preview, setPreview] = useState<ActionPreview | null>(null)
  const [lastExecutionResult, setLastExecutionResult] = useState<any>(null)
  
  // Update equivalent amount when amount or currency changes
  useEffect(() => {
    if (!form.amount || isNaN(Number(form.amount))) {
      setEquivalentAmount("");
      return;
    }

    const amountValue = parseFloat(form.amount);
    if (amountValue <= 0) {
      setEquivalentAmount("");
      return;
    }

    try {
      // Show equivalent in sats if not BTC
      if (selectedCurrency !== "BTC") {
        const satsValue = convertCurrency(amountValue, selectedCurrency, "BTC") * 100000000;
        setEquivalentAmount(Math.round(satsValue).toLocaleString() + " sats");
      } else {
        // Show sats equivalent for BTC
        const satsValue = amountValue * 100000000;
        setEquivalentAmount(Math.round(satsValue).toLocaleString() + " sats");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      setEquivalentAmount("");
    }
  }, [form.amount, selectedCurrency]);
  
  // Calculate the actual amount in satoshis based on the input
  const getSatsAmount = (): number => {
    if (!form.amount || isNaN(Number(form.amount))) return 0;
    
    const amountValue = parseFloat(form.amount);
    if (selectedCurrency === "BTC") {
      return Math.round(amountValue * 100000000);
    } else {
      return Math.round(convertCurrency(amountValue, selectedCurrency, "BTC") * 100000000);
    }
  };

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Auto-detect recipient from invoice
    if (field === 'invoice' && value) {
      // Simple parsing - in real app would decode BOLT11
      if (value.includes('@')) {
        setForm(prev => ({ ...prev, recipient: value }))
      } else if (value.startsWith('lnbc')) {
        setForm(prev => ({ ...prev, recipient: 'Lightning Invoice' }))
      }
    }
  }

  const validateForm = (): string | null => {
    if (!form.invoice.trim()) {
      return "Please enter an invoice or Lightning address"
    }
    
    if (form.invoice.includes('@') && !form.amount) {
      return "Amount is required for Lightning addresses"
    }
    
    if (form.amount && (isNaN(Number(form.amount)) || Number(form.amount) <= 0)) {
      return "Please enter a valid amount"
    }
    
    return null
  }

  const handlePreviewPayment = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setIsProcessing(true)
      
      const amountInSats = getSatsAmount()
      const paymentData = {
        invoice: form.invoice,
        amount: amountInSats || undefined,
        description: form.description || 'Lightning payment',
        recipient: form.recipient || form.invoice
      }

      const context: ExecutionContext = {
        userId: 'current-user', // In real app, get from auth
        dryRun: true
      }

      const result = await dryRun(
        'send_payment',
        paymentData,
        context,
        async (payload, ctx) => {
          // Simulate payment processing
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          return {
            paymentHash: 'mock_hash_' + Date.now(),
            amount: paymentData.amount || 1000,
            recipient: paymentData.recipient,
            fee: Math.floor((paymentData.amount || 1000) * 0.001), // 0.1% fee
            route: ['node1', 'node2', 'destination']
          }
        }
      )

      if (result.success && result.preview) {
        setPreview(result.preview)
        setShowPreview(true)
      } else {
        toast.error(result.error || 'Failed to preview payment')
      }
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error('Failed to preview payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExecutePayment = async () => {
    if (!preview) return

    try {
      setIsProcessing(true)
      
      const amountInSats = getSatsAmount()
      const paymentData = {
        invoice: form.invoice,
        amount: amountInSats || undefined,
        description: form.description || 'Lightning payment',
        recipient: form.recipient || form.invoice
      }

      const result = await signAndExecute(
        'send_payment',
        paymentData,
        async () => {
          // Simulate actual payment processing
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const paymentId = 'pay_' + Date.now()
          const txId = 'tx_' + Math.random().toString(36).substring(7)
          
          return {
            paymentId,
            txId,
            amount: amountInSats,
            destination: paymentData.invoice,
            timestamp: Date.now(),
            status: 'completed'
          }
        }
      )

      if (result) {
        const executionResult = {
          success: true,
          data: result,
          executionTime: 0 // This would need to be calculated properly
        }
        setLastExecutionResult(executionResult)
        setShowPreview(false)
        
        toast.success("Payment sent successfully", {
          description: `Sent ${result.amount} sats`
        })
        
        // Reset form
        setForm({ invoice: '', amount: '', description: '' })
        
        // Redirect to transactions after a delay
        setTimeout(() => {
          goTo('TRANSACTIONS')
        }, 2000)
      } else {
        toast.error('Payment failed')
      }
    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Payment execution failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelPreview = () => {
    setShowPreview(false)
    setPreview(null)
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowUpFromLine className="h-6 w-6 text-amber-500" />
          Send Secured Payment
        </h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Success Result Display */}
      {lastExecutionResult && (
        <Card className="border-green-700 bg-green-900/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Check className="h-5 w-5" />
              Payment Executed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Amount:</span>
                  <span className="ml-2 text-white">{lastExecutionResult.data?.amount} sats</span>
                </div>
                <div>
                  <span className="text-gray-400">Execution Time:</span>
                  <span className="ml-2 text-white">{lastExecutionResult.executionTime}ms</span>
                </div>
              </div>
              
              <TrustInfo
                verified={true}
                hash={lastExecutionResult.signedPayload?.hash}
                signature={lastExecutionResult.signedPayload?.signature}
                timestamp={lastExecutionResult.signedPayload?.timestamp}
                proofId={lastExecutionResult.proofId}
                showDetails={true}
                size="md"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && preview && (
        <Card className="border-blue-700 bg-blue-900/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Eye className="h-5 w-5" />
              Payment Preview
            </CardTitle>
            <CardDescription className="text-blue-300">
              Review this payment before signing and executing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded border">
              <h4 className="font-medium text-white mb-2">{preview.description}</h4>
              <p className="text-sm text-gray-300 mb-3">{preview.humanSummary}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Estimated Cost:</span>
                  <span className="ml-2 text-amber-400">{preview.estimatedCost} sats</span>
                </div>
                <div>
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="ml-2 text-gray-300">{preview.estimatedTime}</span>
                </div>
                <div>
                  <span className="text-gray-400">Reversible:</span>
                  <span className="ml-2">
                    {preview.reversible ? (
                      <Badge className="bg-green-900/30 text-green-400">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Risks and Safeguards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-amber-400 mb-2">⚠️ Risks</h5>
                <ul className="text-xs text-gray-300 space-y-1">
                  {preview.risks.map((risk, index) => (
                    <li key={index}>• {risk}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium text-green-400 mb-2">🛡️ Safeguards</h5>
                <ul className="text-xs text-gray-300 space-y-1">
                  {preview.safeguards.map((safeguard, index) => (
                    <li key={index}>• {safeguard}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 border-t border-gray-800 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancelPreview}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExecutePayment}
              disabled={isProcessing}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Signing & Executing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign & Execute
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="lnurl" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            LNURL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoice">
          <Card className="border-gray-800 bg-gray-900/70">
            <CardHeader>
              <CardTitle>Pay with Invoice</CardTitle>
              <CardDescription>
                Paste a BOLT11 invoice or Lightning Address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input 
                  placeholder="lnbc500u1p... or satoshi@ln.tips"
                  className="bg-gray-800/70 border-gray-700"
                  value={form.invoice}
                  onChange={(e) => handleInputChange('invoice', e.target.value)}
                />
                <div className="text-xs text-gray-500">
                  Paste a Lightning invoice or type a Lightning Address
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Amount (optional)</div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="0.001"
                    className="bg-gray-800/70 border-gray-700 flex-1"
                    value={form.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                  <CurrencySelect
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                    className="border-gray-700 bg-gray-800/50"
                  />
                </div>
                {equivalentAmount && (
                  <div className="text-xs text-gray-500">
                    ≈ {equivalentAmount}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Only needed for Lightning Addresses or zero-amount invoices
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Description (optional)</div>
                <Input 
                  placeholder="Coffee with Alex"
                  className="bg-gray-800/70 border-gray-700"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {/* Recipient Display */}
              {form.recipient && (
                <div className="bg-gray-800/30 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Recipient</div>
                  <div className="text-sm text-white font-medium">{form.recipient}</div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 border-t border-gray-800 pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={handlePreviewPayment}
                disabled={isProcessing || !form.invoice}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="scan">
          <Card className="border-gray-800 bg-gray-900/70">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Use your camera to scan a Lightning invoice QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-center">
                <Scan className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">QR code scanner would appear here</p>
                <Button variant="outline">
                  Enable Camera
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lnurl">
          <Card className="border-gray-800 bg-gray-900/70">
            <CardHeader>
              <CardTitle>LNURL Payment</CardTitle>
              <CardDescription>
                Pay anyone with an LNURL or Lightning Address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">LNURL or Lightning Address</div>
                <Input 
                  placeholder="name@domain.com"
                  className="bg-gray-800/70 border-gray-700"
                  value={form.invoice}
                  onChange={(e) => handleInputChange('invoice', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Amount</div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="0.001"
                    className="bg-gray-800/70 border-gray-700 flex-1"
                    value={form.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                  <CurrencySelect
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                    className="border-gray-700 bg-gray-800/50"
                  />
                </div>
                {equivalentAmount && (
                  <div className="text-xs text-gray-500">
                    ≈ {equivalentAmount}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Comment (optional)</div>
                <Input 
                  placeholder="Payment for website design"
                  className="bg-gray-800/70 border-gray-700"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 border-t border-gray-800 pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={handlePreviewPayment}
                disabled={isProcessing || !form.invoice || !form.amount}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 