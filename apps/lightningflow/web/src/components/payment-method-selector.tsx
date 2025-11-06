"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Copy, Check, Zap, Building2, CreditCard, Mail, Phone, Banknote, Receipt, ArrowUpRight, Clipboard } from 'lucide-react'
import { LnurlPayButton } from './lnurl-pay-button'
import { PaymentMethodType, PAYMENT_METHODS, getPaymentMethod } from '../lib/payment-methods'
import { cn } from '../lib/utils'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { formatCurrency } from '../lib/currency'

interface PaymentMethodSelectorProps {
  paymentLinkId: string
  amount: number
  description: string
  originalAmount?: number
  discountPercent?: number
  onMarkAsPaid?: () => void
}

// Generate a unique invoice reference
const generateReference = (id: string) => `INV-${id}-${Date.now().toString().slice(-6)}`

export function PaymentMethodSelector({ 
  paymentLinkId, 
  amount, 
  description,
  originalAmount,
  discountPercent,
  onMarkAsPaid 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('lightning')
  const [reference] = useState(generateReference(paymentLinkId))
  const [isCopied, setIsCopied] = useState(false)
  
  // Get the selected payment method details
  const paymentMethod = getPaymentMethod(selectedMethod)
  
  // Handle payment method selection
  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method)
  }

  // Handle copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success('Copied to clipboard!', {
      description: 'Payment details copied successfully.',
      duration: 2000,
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Replace {id} placeholder in reference info with actual reference
  const getFormattedReferenceInfo = () => {
    if (!paymentMethod?.referenceInfo) return ''
    return paymentMethod.referenceInfo.replace('{id}', reference)
  }

  // Generate QR code data based on payment method
  const getQrData = () => {
    if (selectedMethod === 'lightning') return null // Handled by LNURL component
    
    if (paymentMethod?.generateQR) {
      return paymentMethod.generateQR(amount, description)
    }
    
    return null
  }

  // Get payment info or link for sharing
  const getPaymentInfo = () => {
    if (paymentMethod?.generateLink) {
      return paymentMethod.generateLink(amount, description)
    }
    return getFormattedReferenceInfo()
  }

  // QR data for non-lightning methods
  const qrData = getQrData()
  
  // Check if the method has a QR code
  const hasQrCode = selectedMethod === 'lightning' || !!qrData

  // Format the amounts to show discount if applicable
  const formattedAmount = formatCurrency(amount, "BTC")
  const formattedOriginalAmount = originalAmount ? formatCurrency(originalAmount, "BTC") : formattedAmount

  return (
    <div className="w-full space-y-6">
      {/* Invoice Summary */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-400">Description</p>
                <p className="font-medium text-gray-200 truncate">{description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <div className="flex items-center gap-2">
                  {originalAmount && originalAmount > amount ? (
                    <>
                      <p className="font-medium line-through text-gray-400">{formattedOriginalAmount}</p>
                      <p className="font-medium text-amber-400">{formattedAmount}</p>
                      <Badge variant="outline" className="bg-green-900/30 text-green-400 text-[10px] px-1.5 py-0.5">
                        {discountPercent}% OFF
                      </Badge>
                    </>
                  ) : (
                    <p className="font-medium text-amber-400">{formattedAmount}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Reference</p>
                <p className="font-medium text-gray-200">{reference}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selector */}
      <Tabs 
        defaultValue="lightning" 
        className="w-full" 
        onValueChange={(value: string) => handleMethodSelect(value as PaymentMethodType)}
      >
        <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 mb-6 p-1 rounded-lg bg-gray-800/50">
          {PAYMENT_METHODS.map(method => (
            <TabsTrigger 
              key={method.id} 
              value={method.id}
              className="flex flex-col items-center gap-1.5 py-3 h-auto data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-md transition-all duration-200"
            >
              {method.id === 'lightning' && <Zap className="h-5 w-5" />}
              {method.id === 'bank' && <Building2 className="h-5 w-5" />}
              {method.id === 'credit' && <CreditCard className="h-5 w-5" />}
              {method.id === 'e-transfer' && <Mail className="h-5 w-5" />}
              {method.id === 'phone' && <Phone className="h-5 w-5" />}
              {method.id === 'apple-pay' && <Zap className="h-5 w-5" />}
              {method.id === 'google-pay' && <Zap className="h-5 w-5" />}
              {method.id === 'cash' && <Banknote className="h-5 w-5" />}
              <span className="text-xs font-medium">{method.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="border border-gray-700 bg-gray-800/30 rounded-xl overflow-hidden shadow-lg">
          <CardHeader className="bg-gray-800/80 border-b border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              {selectedMethod === 'lightning' && <Zap className="h-5 w-5 text-yellow-500" />}
              {selectedMethod === 'bank' && <Building2 className="h-5 w-5 text-blue-400" />}
              {selectedMethod === 'credit' && <CreditCard className="h-5 w-5 text-purple-400" />}
              {selectedMethod === 'e-transfer' && <Mail className="h-5 w-5 text-green-400" />}
              {selectedMethod === 'phone' && <Phone className="h-5 w-5 text-blue-400" />}
              {selectedMethod === 'apple-pay' && <Zap className="h-5 w-5 text-gray-100" />}
              {selectedMethod === 'google-pay' && <Zap className="h-5 w-5 text-blue-400" />}
              {selectedMethod === 'cash' && <Banknote className="h-5 w-5 text-green-400" />}
              <CardTitle className="text-lg">{paymentMethod?.name}</CardTitle>
            </div>
            <CardDescription className="text-gray-400 mt-1">
              {paymentMethod?.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center">
                {/* Lightning QR */}
                {selectedMethod === 'lightning' && (
                  <div className="animate-in fade-in duration-500">
                    <LnurlPayButton 
                      paymentRequest={`lnbc${amount}u1p...`} 
                      amount={amount} 
                      onSuccess={onMarkAsPaid}
                    />
                  </div>
                )}
  
                {/* Non-lightning QR */}
                {selectedMethod !== 'lightning' && hasQrCode && qrData && (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded-lg mb-3 shadow-lg animate-in fade-in duration-500">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
                        alt={`${paymentMethod?.name} QR code`}
                        width={200}
                        height={200}
                        className="rounded-md"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Scan with your {paymentMethod?.name} app</p>
                  </div>
                )}
              </div>
  
              {/* Payment Instructions */}
              <div className="flex flex-col justify-center space-y-4">
                {/* Payment instructions for methods without QR */}
                {selectedMethod !== 'lightning' && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Receipt className="h-4 w-4 mr-2" /> Payment Instructions
                      </h4>
                      <p className="text-sm text-gray-300 mb-3">{getFormattedReferenceInfo()}</p>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopy(getPaymentInfo())}
                          className="flex items-center gap-2"
                        >
                          {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                          {isCopied ? 'Copied!' : 'Copy Details'}
                        </Button>

                        {paymentMethod?.generateLink && (
                          <Button 
                            variant="lightning" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => window.open(paymentMethod.generateLink!(amount, description), '_blank')}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Mark as paid for cash */}
                    {selectedMethod === 'cash' && onMarkAsPaid && (
                      <div className="mt-4">
                        <Button 
                          variant="lightning" 
                          onClick={onMarkAsPaid}
                          className="flex items-center gap-2 w-full"
                        >
                          <Check className="h-4 w-4" />
                          Mark as Paid
                        </Button>
                        <p className="text-xs text-gray-400 mt-2 text-center">This will record the transaction as completed</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
} 