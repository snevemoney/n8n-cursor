"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  Tablet, 
  Smartphone, 
  Globe, 
  Printer, 
  Map, 
  Building, 
  ShoppingBag, 
  CreditCard,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"

interface TerminalRegistrationProps {
  onComplete: (terminalData: {
    id: string;
    name: string;
    type: string;
    location: string;
  }) => void;
}

export function TerminalRegistration({ onComplete }: TerminalRegistrationProps) {
  const [step, setStep] = useState(1)
  const [terminalType, setTerminalType] = useState("")
  const [terminalName, setTerminalName] = useState("")
  const [terminalLocation, setTerminalLocation] = useState("")
  const [locationType, setLocationType] = useState("physical-store")
  
  const generateTerminalId = () => {
    const prefix = terminalType === "physical" ? "TERM" : 
                  terminalType === "mobile" ? "MOB" : 
                  terminalType === "web" ? "WEB" : "API"
    const randomId = Math.floor(100 + Math.random() * 900)
    return `${prefix}-${randomId}`
  }
  
  const handleNextStep = () => {
    if (step === 1 && !terminalType) {
      toast.error("Please select a terminal type")
      return
    }
    
    if (step === 2 && !terminalName) {
      toast.error("Please enter a terminal name")
      return
    }
    
    if (step === 3 && !terminalLocation) {
      toast.error("Please enter a terminal location")
      return
    }
    
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Complete registration
      const terminalId = generateTerminalId()
      onComplete({
        id: terminalId,
        name: terminalName,
        type: terminalType,
        location: terminalLocation,
      })
    }
  }
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-4">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-blue-900/30 border border-blue-400' : 'bg-gray-800 border border-gray-700'}`}>1</div>
          <span className="text-xs">Type</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className={`h-0.5 w-full ${step >= 2 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
        </div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-blue-900/30 border border-blue-400' : 'bg-gray-800 border border-gray-700'}`}>2</div>
          <span className="text-xs">Details</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className={`h-0.5 w-full ${step >= 3 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
        </div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-blue-900/30 border border-blue-400' : 'bg-gray-800 border border-gray-700'}`}>3</div>
          <span className="text-xs">Location</span>
        </div>
      </div>
      
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white">Select Terminal Type</h3>
          <p className="text-gray-400 text-sm">Choose the type of payment terminal you want to add</p>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div 
              className={`border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-colors ${terminalType === 'physical' ? 'bg-blue-900/20 border-blue-500' : 'border-gray-700 hover:border-gray-600'}`}
              onClick={() => setTerminalType('physical')}
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Tablet className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="font-medium text-white">Physical Terminal</h4>
              <p className="text-gray-400 text-xs text-center">Hardware payment terminal or point-of-sale device</p>
            </div>
            
            <div 
              className={`border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-colors ${terminalType === 'mobile' ? 'bg-blue-900/20 border-blue-500' : 'border-gray-700 hover:border-gray-600'}`}
              onClick={() => setTerminalType('mobile')}
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Smartphone className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="font-medium text-white">Mobile App</h4>
              <p className="text-gray-400 text-xs text-center">Smartphone or tablet payment app</p>
            </div>
            
            <div 
              className={`border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-colors ${terminalType === 'web' ? 'bg-blue-900/20 border-blue-500' : 'border-gray-700 hover:border-gray-600'}`}
              onClick={() => setTerminalType('web')}
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Globe className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="font-medium text-white">Web Checkout</h4>
              <p className="text-gray-400 text-xs text-center">Online store payment processing</p>
            </div>
            
            <div 
              className={`border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-colors ${terminalType === 'printer' ? 'bg-blue-900/20 border-blue-500' : 'border-gray-700 hover:border-gray-600'}`}
              onClick={() => setTerminalType('printer')}
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Printer className="h-8 w-8 text-yellow-400" />
              </div>
              <h4 className="font-medium text-white">Receipt Printer</h4>
              <p className="text-gray-400 text-xs text-center">Print QR codes for payments</p>
            </div>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white">Terminal Details</h3>
          <p className="text-gray-400 text-sm">Configure your new {terminalType} terminal</p>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="terminal-name">Terminal Name</Label>
              <Input 
                id="terminal-name" 
                placeholder="e.g. Main Checkout, Front Desk, etc."
                className="bg-gray-800 border-gray-700"
                value={terminalName}
                onChange={(e) => setTerminalName(e.target.value)}
              />
            </div>
            
            {terminalType === 'physical' && (
              <div className="space-y-2">
                <Label htmlFor="terminal-model">Terminal Model (Optional)</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="generic">Generic Lightning Terminal</SelectItem>
                    <SelectItem value="btcpayserver">BTCPay Server</SelectItem>
                    <SelectItem value="lnpos">LN POS</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {terminalType === 'mobile' && (
              <div className="space-y-2">
                <Label htmlFor="device-type">Device Type (Optional)</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="ios">iOS Device</SelectItem>
                    <SelectItem value="android">Android Device</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {terminalType === 'web' && (
              <div className="space-y-2">
                <Label htmlFor="website-url">Website URL (Optional)</Label>
                <Input 
                  id="website-url" 
                  placeholder="https://yourstore.com"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white">Terminal Location</h3>
          <p className="text-gray-400 text-sm">Where will this terminal be used?</p>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Location Type</Label>
              <Tabs value={locationType} onValueChange={setLocationType} className="w-full">
                <TabsList className="grid grid-cols-3 bg-gray-800">
                  <TabsTrigger value="physical-store" className="data-[state=active]:bg-gray-700">Physical Store</TabsTrigger>
                  <TabsTrigger value="online" className="data-[state=active]:bg-gray-700">Online</TabsTrigger>
                  <TabsTrigger value="mobile" className="data-[state=active]:bg-gray-700">Mobile</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {locationType === 'physical-store' && (
              <div className="space-y-2">
                <Label htmlFor="store-name">Store / Location Name</Label>
                <Input 
                  id="store-name" 
                  placeholder="e.g. Main Store, Downtown Location"
                  className="bg-gray-800 border-gray-700"
                  value={terminalLocation}
                  onChange={(e) => setTerminalLocation(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-sm text-gray-400">Floor / Area (Optional)</Label>
                    <Input 
                      id="floor" 
                      placeholder="e.g. 1st Floor"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm text-gray-400">Department (Optional)</Label>
                    <Input 
                      id="department" 
                      placeholder="e.g. Electronics"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {locationType === 'online' && (
              <div className="space-y-2">
                <Label htmlFor="online-store">Online Store Name</Label>
                <Input 
                  id="online-store" 
                  placeholder="e.g. yourstore.com"
                  className="bg-gray-800 border-gray-700"
                  value={terminalLocation}
                  onChange={(e) => setTerminalLocation(e.target.value)}
                />
              </div>
            )}
            
            {locationType === 'mobile' && (
              <div className="space-y-2">
                <Label htmlFor="mobile-description">Mobile Usage Description</Label>
                <Input 
                  id="mobile-description" 
                  placeholder="e.g. Field Sales, Events, Pop-up Store"
                  className="bg-gray-800 border-gray-700"
                  value={terminalLocation}
                  onChange={(e) => setTerminalLocation(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button 
            variant="outline"
            onClick={handlePrevStep}
            className="border-gray-700"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button
          onClick={handleNextStep}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {step < 3 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : 'Complete Registration'}
        </Button>
      </div>
    </div>
  )
} 