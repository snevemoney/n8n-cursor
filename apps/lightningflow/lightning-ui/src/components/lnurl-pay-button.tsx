"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { QRCode } from './qr-code'
import { Copy, Check, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface LnurlPayButtonProps {
  paymentRequest: string
  amount: number
  label?: string
  onSuccess?: () => void
}

export function LnurlPayButton({ 
  paymentRequest,
  amount,
  label = "Pay with Lightning",
  onSuccess
}: LnurlPayButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentRequest)
      setIsCopied(true)
      toast.success("Payment request copied to clipboard")
      
      setTimeout(() => {
        setIsCopied(false)
      }, 3000)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }
  
  // In a real app, we would poll the server to check if the invoice has been paid
  // For this demo, we'll simulate a payment with a button
  const simulatePayment = () => {
    // Fake delay to simulate payment processing
    setTimeout(() => {
      toast.success("Payment received!", {
        description: `${amount} sats payment confirmed.`
      })
      
      if (onSuccess) {
        onSuccess()
      }
    }, 1500)
  }
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-2 rounded-lg">
        <QRCode value={paymentRequest} size={200} />
      </div>
      
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handleCopy}
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {isCopied ? "Copied!" : "Copy Invoice"}
        </Button>
        
        <Button 
          variant="lightning"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={simulatePayment}
        >
          <Zap className="h-4 w-4" />
          {label}
        </Button>
      </div>
    </div>
  )
}
