"use client"

import { useState, useEffect } from "react"
import { ArrowDownToLine, ArrowLeft, Copy, Download, Share2, Clock, QrCode, ArrowRight, ArrowUpDown, Shield, Eye, Check } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useRouter } from "next/navigation"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { TrustInfo } from "../../../components/ui/trust-info"
import { toast } from "sonner"
import { Textarea } from "../../../components/ui/textarea"
import { PaymentMethodSelector } from "../../../components/payment-method-selector"
import { CurrencySelect } from "../../../components/ui/currency-select"
import { Currency, convertCurrency, formatCurrency } from "../../../lib/currency"
import { calculateDiscountedAmount } from "../../../lib/payment-methods"
import { signAndExecute, dryRun, ExecutionContext, ActionPreview } from "../../../core/crypto/signAndExecute"

export default function ReceivePage() {
  const router = useRouter()
  const { goTo } = useSmartRedirect({ context: 'receive-page' })
  
  // Form state
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("BTC")
  const [expiryOption, setExpiryOption] = useState<"1h" | "24h" | "7d">("24h")
  const [discount, setDiscount] = useState("")
  const [equivalentAmount, setEquivalentAmount] = useState<string>("")
  
  // Invoice state
  const [generatedPaymentId, setGeneratedPaymentId] = useState<string | null>(null)
  const [invoiceData, setInvoiceData] = useState<{
    id: string;
    description: string;
    amount: number;
    originalAmount?: number;
    discountPercent?: number;
    expiry: string;
  } | null>(null)
  
  // Crypto state
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [preview, setPreview] = useState<ActionPreview | null>(null)
  const [lastExecutionResult, setLastExecutionResult] = useState<any>(null)
  
  // Update equivalent amount when amount or currency changes
  useEffect(() => {
    if (!amount || isNaN(Number(amount))) {
      setEquivalentAmount("");
      return;
    }

    const amountValue = parseFloat(amount);
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
  }, [amount, selectedCurrency]);
  
  // Calculate the actual amount in satoshis based on the input
  const getSatsAmount = (): number => {
    if (!amount || isNaN(Number(amount))) return 0;
    
    const amountValue = parseFloat(amount);
    if (selectedCurrency === "BTC") {
      return Math.round(amountValue * 100000000);
    } else {
      return Math.round(convertCurrency(amountValue, selectedCurrency, "BTC") * 100000000);
    }
  };

  const validateForm = (): string | null => {
    if (!description.trim()) {
      return "Please enter a description for your payment request"
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return "Please enter a valid amount"
    }
    
    return null
  }

  const handlePreviewInvoice = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setIsProcessing(true)
      
      const amountInSats = getSatsAmount()
      const discountValue = parseInt(discount, 10) || 0
      const finalAmount = calculateDiscountedAmount(amountInSats, discountValue)
      
      const invoiceData = {
        description,
        amount: finalAmount,
        originalAmount: discountValue > 0 ? amountInSats : undefined,
        discountPercent: discountValue > 0 ? discountValue : undefined,
        currency: selectedCurrency,
        expiry: expiryOption
      }

      const context: ExecutionContext = {
        userId: 'current-user',
        dryRun: true
      }

      const result = await dryRun(
        'receive_payment',
        invoiceData,
        context,
        async (payload, ctx) => {
          // Simulate invoice generation
          await new Promise(resolve => setTimeout(resolve, 800))
          
          return {
            invoiceId: 'inv_' + Date.now(),
            bolt11: 'lnbc' + finalAmount + 'n1p...',
            paymentHash: 'hash_' + Date.now(),
            amount: finalAmount,
            description,
            expiresAt: new Date(Date.now() + (expiryOption === '1h' ? 3600000 : expiryOption === '24h' ? 86400000 : 604800000))
          }
        }
      )

      if (result.success && result.preview) {
        setPreview(result.preview)
        setShowPreview(true)
      } else {
        toast.error(result.error || 'Failed to preview invoice')
      }
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error('Failed to preview invoice')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!preview) return

    try {
      setIsProcessing(true)
      
      const amountInSats = getSatsAmount()
      const discountValue = parseInt(discount, 10) || 0
      const finalAmount = calculateDiscountedAmount(amountInSats, discountValue)
      
      const invoiceData = {
        description,
        amount: finalAmount,
        originalAmount: discountValue > 0 ? amountInSats : undefined,
        discountPercent: discountValue > 0 ? discountValue : undefined,
        currency: selectedCurrency,
        expiry: expiryOption
      }

      const result = await signAndExecute(
        'receive_payment',
        invoiceData,
        async () => {
          // Simulate actual invoice creation
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          const paymentId = Date.now().toString()
          const expiryText = expiryOption === "1h" ? "1 hour" : 
                            expiryOption === "24h" ? "24 hours" : 
                            "7 days"
          
          return {
            invoiceId: paymentId,
            bolt11: 'lnbc' + finalAmount + 'n1p...',
            paymentHash: 'hash_' + Date.now(),
            amount: finalAmount,
            description,
            expiresAt: new Date(Date.now() + (expiryOption === '1h' ? 3600000 : expiryOption === '24h' ? 86400000 : 604800000)),
            timestamp: Date.now()
          }
        }
      )

      // Since signAndExecute now returns data directly, we assume success
      if (result) {
        const executionResult = {
          success: true,
          data: result,
          executionTime: 0 // This would need to be calculated properly
        }
        setLastExecutionResult(executionResult)
        setShowPreview(false)
        
        // Set invoice data for display
        const paymentId = result.invoiceId
        const expiryText = expiryOption === "1h" ? "1 hour" : 
                          expiryOption === "24h" ? "24 hours" : 
                          "7 days"
        
        setGeneratedPaymentId(paymentId)
        setInvoiceData({
          id: paymentId,
          description,
          amount: finalAmount,
          originalAmount: discountValue > 0 ? amountInSats : undefined,
          discountPercent: discountValue > 0 ? discountValue : undefined,
          expiry: expiryText
        })
        
        toast.success("Payment request created", {
          description: `Invoice created and cryptographically signed`
        })
      } else {
        toast.error('Failed to create invoice')
      }
    } catch (error) {
      console.error('Invoice creation failed:', error)
      toast.error('Failed to create invoice')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelPreview = () => {
    setShowPreview(false)
    setPreview(null)
  }
  
  const handleCopy = () => {
    toast.success("Invoice copied to clipboard", {
      description: "Share this with the person who is paying you"
    })
  }
  
  // Format amount with currency symbol
  const formatAmountWithCurrency = (amt: number, currency: Currency = "BTC") => {
    return formatCurrency(amt, currency);
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowDownToLine className="h-6 w-6 text-green-500" />
          Create Payment Request
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
              Payment Request Created Successfully
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
                  <span className="text-gray-400">Creation Time:</span>
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
              Payment Request Preview
            </CardTitle>
            <CardDescription className="text-blue-300">
              Review this payment request before signing and creating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded border">
              <h4 className="font-medium text-white mb-2">{preview.description}</h4>
              <p className="text-sm text-gray-300 mb-3">{preview.humanSummary}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Amount:</span>
                  <span className="ml-2 text-amber-400">{getSatsAmount()} sats</span>
                </div>
                <div>
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="ml-2 text-gray-300">{preview.estimatedTime}</span>
                </div>
                <div>
                  <span className="text-gray-400">Expires:</span>
                  <span className="ml-2 text-gray-300">{expiryOption === "1h" ? "1 hour" : expiryOption === "24h" ? "24 hours" : "7 days"}</span>
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
                <h5 className="text-sm font-medium text-amber-400 mb-2">⚠️ Considerations</h5>
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
              onClick={handleCreateInvoice}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Signing & Creating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign & Create Request
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Create Request
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Requests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          {!generatedPaymentId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-800 bg-gray-900/70">
                <CardHeader>
                  <CardTitle>Create Payment Request</CardTitle>
                  <CardDescription>
                    Generate a cryptographically signed Lightning invoice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Description</div>
                    <Textarea 
                      placeholder="Web design services"
                      className="bg-gray-800/70 border-gray-700 min-h-[80px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Amount</div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="1,000"
                        className="bg-gray-800/70 border-gray-700"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <CurrencySelect 
                        value={selectedCurrency}
                        onValueChange={setSelectedCurrency}
                      />
                    </div>
                    {equivalentAmount && (
                      <div className="text-xs text-gray-500">
                        ≈ {equivalentAmount}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Discount (optional)</div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="10"
                        className="bg-gray-800/70 border-gray-700"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                      <Button variant="outline" className="border-gray-700 bg-gray-800/50">
                        %
                      </Button>
                    </div>
                    {discount && parseInt(discount) > 0 && (
                      <div className="text-xs text-green-400">
                        Final amount: {formatAmountWithCurrency(calculateDiscountedAmount(getSatsAmount(), parseInt(discount)))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Expires in</div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        className={`border-gray-700 ${expiryOption === "1h" ? "bg-blue-900/30 border-blue-700/50" : "bg-gray-800/50"}`}
                        onClick={() => setExpiryOption("1h")}
                      >
                        1 hour
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`border-gray-700 ${expiryOption === "24h" ? "bg-blue-900/30 border-blue-700/50" : "bg-gray-800/50"}`}
                        onClick={() => setExpiryOption("24h")}
                      >
                        24 hours
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`border-gray-700 ${expiryOption === "7d" ? "bg-blue-900/30 border-blue-700/50" : "bg-gray-800/50"}`}
                        onClick={() => setExpiryOption("7d")}
                      >
                        7 days
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 border-t border-gray-800 pt-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={handlePreviewInvoice}
                    disabled={isProcessing || !description || !amount}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Request
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-gray-800 bg-gray-900/70">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    This request supports various payment methods for your customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[300px]">
                  <div className="text-center">
                    <p className="mb-4 text-gray-400">
                      Your customer can pay with:
                    </p>
                    <ul className="text-left space-y-2 text-gray-300 mb-6">
                      <li>• Lightning Network (instant)</li>
                      <li>• On-chain Bitcoin</li>
                      <li>• Bank Transfer (if configured)</li>
                      <li>• Credit/Debit Card (if configured)</li>
                    </ul>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => goTo('SETTINGS')}
                    >
                      Configure Payment Methods
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Show the payment method selector when an invoice is created
            <div className="mt-4">
              {invoiceData && (
                <PaymentMethodSelector
                  paymentLinkId={invoiceData.id}
                  amount={invoiceData.amount}
                  originalAmount={invoiceData.originalAmount}
                  discountPercent={invoiceData.discountPercent}
                  description={invoiceData.description}
                />
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="border-gray-800 bg-gray-900/70">
            <CardHeader>
              <CardTitle>Recent Payment Requests</CardTitle>
              <CardDescription>
                Your recent invoices and their verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700">
                  <div className="flex-1">
                    <div className="font-medium text-white">Web design services</div>
                    <div className="text-sm text-gray-400">50,000 sats • Created 2 hours ago</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
                      Paid
                    </Badge>
                    <TrustInfo
                      verified={true}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700">
                  <div className="flex-1">
                    <div className="font-medium text-white">Coffee meeting</div>
                    <div className="text-sm text-gray-400">2,500 sats • Created yesterday</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Pending
                    </Badge>
                    <TrustInfo
                      verified={true}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700">
                  <div className="flex-1">
                    <div className="font-medium text-white">Consulting session</div>
                    <div className="text-sm text-gray-400">25,000 sats • Created 3 days ago</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-400 border-amber-700/50">
                      Expired
                    </Badge>
                    <TrustInfo
                      verified={false}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 