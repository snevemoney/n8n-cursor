"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { QrCode, Printer, Download, Copy, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface TerminalQrGeneratorProps {
  terminalId: string
  terminalName: string
}

export function TerminalQrGenerator({ terminalId, terminalName }: TerminalQrGeneratorProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [qrSize, setQrSize] = useState("medium")
  const [qrGenerated, setQrGenerated] = useState(false)
  
  const handleGenerateQR = () => {
    if (!amount) {
      toast.error("Please enter an amount")
      return
    }
    
    setQrGenerated(true)
    toast.success("QR code generated successfully", {
      description: "Ready for printing or display on terminal"
    })
  }
  
  const handlePrint = () => {
    toast.success("Sending to printer", {
      description: "QR code is being sent to the connected printer"
    })
  }
  
  const handleCopy = () => {
    toast.success("QR code copied", {
      description: "QR code has been copied to clipboard"
    })
  }
  
  const handleDisplayOnTerminal = () => {
    toast.success(`Displaying on ${terminalName}`, {
      description: "QR code is now showing on the payment terminal"
    })
  }
  
  return (
    <Card className="border-gray-800 bg-gray-900/70">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Terminal Payment QR
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terminal-id">Terminal ID</Label>
          <Input 
            id="terminal-id" 
            value={terminalId} 
            readOnly 
            className="bg-gray-800 border-gray-700 text-gray-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (sats)</Label>
          <Input 
            id="amount" 
            placeholder="10000" 
            className="bg-gray-800 border-gray-700"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input 
            id="description" 
            placeholder="Coffee and muffin" 
            className="bg-gray-800 border-gray-700"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="qr-size">QR Code Size</Label>
          <Select value={qrSize} onValueChange={setQrSize}>
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select QR size" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="small">Small (150px)</SelectItem>
              <SelectItem value="medium">Medium (250px)</SelectItem>
              <SelectItem value="large">Large (350px)</SelectItem>
              <SelectItem value="xlarge">Extra Large (500px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {qrGenerated && (
          <div className="py-4 flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              {/* This would be a real QR code in production, using a mocked div for now */}
              <div className={`
                bg-black 
                ${qrSize === "small" ? "w-[150px] h-[150px]" : ""} 
                ${qrSize === "medium" ? "w-[250px] h-[250px]" : ""} 
                ${qrSize === "large" ? "w-[350px] h-[350px]" : ""} 
                ${qrSize === "xlarge" ? "w-[500px] h-[500px]" : ""} 
                flex items-center justify-center
              `}>
                <QrCode className="text-white w-1/3 h-1/3 opacity-20" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-3">
        {!qrGenerated ? (
          <Button 
            onClick={handleGenerateQR} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Generate QR Code
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="flex-1 text-xs border-gray-700"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 text-xs border-gray-700"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 text-xs border-gray-700"
              onClick={() => setQrGenerated(false)}
            >
              <QrCode className="h-4 w-4 mr-1" />
              New QR
            </Button>
            
            <Button 
              variant="default" 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleDisplayOnTerminal}
            >
              <Smartphone className="h-4 w-4 mr-1" />
              Display on Terminal
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
} 