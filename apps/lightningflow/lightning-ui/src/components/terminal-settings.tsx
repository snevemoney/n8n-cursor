"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { 
  Shield, 
  Users, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  Save,
  Key,
  Lock,
  Smartphone,
  History,
  Share2,
  Power
} from "lucide-react"

interface TerminalSettingsProps {
  terminalId: string;
  terminalName: string;
  terminalType?: "physical" | "mobile" | "web" | "api";
}

export function TerminalSettings({ 
  terminalId, 
  terminalName, 
  terminalType = "physical" 
}: TerminalSettingsProps) {
  // Security settings
  const [requirePin, setRequirePin] = useState(true)
  const [requireBiometric, setRequireBiometric] = useState(false)
  const [automaticLogout, setAutomaticLogout] = useState(true)
  const [logoutTimeout, setLogoutTimeout] = useState("15")
  
  // Staff settings
  const [staffMembers, setStaffMembers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", active: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", active: true },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", active: false },
  ])
  
  // Payout settings
  const [autoSettlement, setAutoSettlement] = useState(true)
  const [settlementSchedule, setSettlementSchedule] = useState("daily")
  const [settlementTime, setSettlementTime] = useState("00:00")
  const [minimumSettlement, setMinimumSettlement] = useState("10000")
  const [walletAddress, setWalletAddress] = useState("bc1q...")
  
  const handleSaveSettings = () => {
    toast.success("Terminal settings saved", {
      description: `Settings for ${terminalName} have been updated`
    })
  }
  
  const handleResetTerminal = () => {
    toast.error("Terminal reset", {
      description: `${terminalName} has been reset to factory settings`
    })
  }
  
  const handleToggleStaffActive = (id: number) => {
    setStaffMembers(staffMembers.map(staff => 
      staff.id === id ? { ...staff, active: !staff.active } : staff
    ))
  }
  
  return (
    <Tabs defaultValue="security" className="w-full">
      <TabsList className="grid grid-cols-3 bg-gray-800">
        <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
          <Shield className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="staff" className="data-[state=active]:bg-gray-700">
          <Users className="h-4 w-4 mr-2" />
          Staff Access
        </TabsTrigger>
        <TabsTrigger value="payouts" className="data-[state=active]:bg-gray-700">
          <CreditCard className="h-4 w-4 mr-2" />
          Payouts
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="security">
        <Card className="border-gray-800 bg-gray-900/70">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Terminal Security Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-white font-medium">Terminal Details</div>
              <div className="grid grid-cols-2 gap-4 px-2">
                <div>
                  <Label className="text-gray-400 text-xs">Terminal ID</Label>
                  <div className="text-sm text-white font-mono bg-gray-800 px-2 py-1 rounded mt-1">
                    {terminalId}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Terminal Type</Label>
                  <div className="text-sm text-white capitalize bg-gray-800 px-2 py-1 rounded mt-1">
                    {terminalType}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Require PIN for Transactions</Label>
                  <p className="text-xs text-gray-400">
                    Staff must enter PIN for each transaction
                  </p>
                </div>
                <Switch 
                  checked={requirePin}
                  onCheckedChange={setRequirePin}
                />
              </div>
              
              {requirePin && (
                <div className="pl-7 space-y-2">
                  <Label className="text-sm text-white">Default Staff PIN</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter PIN"
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400">
                    Staff can change their individual PINs later
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Biometric Authentication</Label>
                  <p className="text-xs text-gray-400">
                    Use fingerprint/face scan for mobile devices
                  </p>
                </div>
                <Switch 
                  checked={requireBiometric}
                  onCheckedChange={setRequireBiometric}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Automatic Logout</Label>
                  <p className="text-xs text-gray-400">
                    Automatically logout after inactivity
                  </p>
                </div>
                <Switch 
                  checked={automaticLogout}
                  onCheckedChange={setAutomaticLogout}
                />
              </div>
              
              {automaticLogout && (
                <div className="pl-7 space-y-2">
                  <Label className="text-sm text-white">Logout After (minutes)</Label>
                  <Select value={logoutTimeout} onValueChange={setLogoutTimeout}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Transaction Limits</Label>
                  <p className="text-xs text-gray-400">
                    Set maximum amount per transaction
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="pl-7 space-y-2">
                <Label className="text-sm text-white">Max Transaction Amount (sats)</Label>
                <Input 
                  placeholder="100000"
                  className="bg-gray-800 border-gray-700"
                  defaultValue="100000"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <Label className="text-sm text-white">Security Notes (Optional)</Label>
              <Textarea 
                placeholder="Add any additional security notes or procedures for this terminal"
                className="bg-gray-800 border-gray-700 mt-1 h-24"
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="destructive"
                onClick={handleResetTerminal}
                className="bg-red-900/50 hover:bg-red-900/70 text-red-200"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset Terminal
              </Button>
              
              <Button
                onClick={handleSaveSettings}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="staff">
        <Card className="border-gray-800 bg-gray-900/70">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Access Management
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-white font-medium">Authorized Staff</div>
                <Button variant="outline" size="sm" className="text-xs h-8 border-gray-700">
                  + Add Staff Member
                </Button>
              </div>
              
              <div className="space-y-3">
                {staffMembers.map((staff) => (
                  <div 
                    key={staff.id} 
                    className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md border border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-white">{staff.name}</p>
                        <p className="text-xs text-gray-400">{staff.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        staff.active ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {staff.active ? 'Active' : 'Inactive'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-gray-700"
                        onClick={() => handleToggleStaffActive(staff.id)}
                      >
                        {staff.active ? 'Revoke' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="text-sm text-white font-medium">Terminal Access Options</div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Allow Remote Access</Label>
                  <p className="text-xs text-gray-400">
                    Staff can access this terminal remotely
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Staff-Specific PINs</Label>
                  <p className="text-xs text-gray-400">
                    Each staff member uses their own PIN
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Activity Logging</Label>
                  <p className="text-xs text-gray-400">
                    Log all staff actions on this terminal
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <Button
              onClick={handleSaveSettings}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Staff Access Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="payouts">
        <Card className="border-gray-800 bg-gray-900/70">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payout Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-white">Automatic Settlement</Label>
                  <p className="text-xs text-gray-400">
                    Automatically settle funds to bitcoin address
                  </p>
                </div>
                <Switch 
                  checked={autoSettlement}
                  onCheckedChange={setAutoSettlement}
                />
              </div>
              
              {autoSettlement && (
                <>
                  <div className="space-y-2 ml-7">
                    <Label className="text-sm text-white">Settlement Schedule</Label>
                    <Select value={settlementSchedule} onValueChange={setSettlementSchedule}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">
                      How often to automatically settle funds
                    </p>
                  </div>
                  
                  <div className="space-y-2 ml-7">
                    <Label className="text-sm text-white">Settlement Time</Label>
                    <Input 
                      type="time"
                      value={settlementTime}
                      onChange={(e) => setSettlementTime(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">
                      Time of day to perform scheduled settlement
                    </p>
                  </div>
                  
                  <div className="space-y-2 ml-7">
                    <Label className="text-sm text-white">Minimum Settlement Amount (sats)</Label>
                    <Input 
                      value={minimumSettlement}
                      onChange={(e) => setMinimumSettlement(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">
                      Minimum amount required to trigger automatic settlement
                    </p>
                  </div>
                </>
              )}
              
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <Label className="text-sm text-white">Payout Bitcoin Address</Label>
                <div className="flex gap-2">
                  <Input 
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-gray-800 border-gray-700 flex-grow"
                  />
                  <Button variant="outline" className="border-gray-700">
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  All terminal funds will be sent to this address
                </p>
              </div>
              
              <Button 
                onClick={handleSaveSettings}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Payout Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 