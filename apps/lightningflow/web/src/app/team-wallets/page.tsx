"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"
import { mockTeamWallets } from "../../lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Separator } from "../../components/ui/separator"
import { Switch } from "../../components/ui/switch"
import { 
  Users,
  Wallet,
  Settings,
  Key,
  Plus,
  ArrowRightLeft,
  ChevronRight,
  Bell,
  Clock,
  ShieldCheck,
  Lock,
  LucideIcon,
  Tablet,
  QrCode,
  Fingerprint,
  Map,
  CircleDollarSign,
  LineChart,
  BarChart,
  Settings2
} from "lucide-react"
import { TerminalQrGenerator } from "../../components/terminal-qr-generator"
import { TerminalSettings } from "../../components/terminal-settings"
import { TerminalAnalytics } from "../../components/terminal-analytics"
import { TerminalRegistration } from "../../components/terminal-registration"

interface SharedWallet {
  id: string;
  name: string;
  accessLevel: "Owner" | "Editor" | "Viewer";
}

type TeamMember = typeof mockTeamWallets[0];

export default function TeamWalletsPage() {
  const [teamWallets, setTeamWallets] = useState(mockTeamWallets)
  const [selectedTab, setSelectedTab] = useState("members")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isTerminalDialogOpen, setIsTerminalDialogOpen] = useState(false)
  const [isTerminalManagerOpen, setIsTerminalManagerOpen] = useState(false)
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null)
  const [selectedTerminalName, setSelectedTerminalName] = useState<string | null>(null)
  const [terminalManagerTab, setTerminalManagerTab] = useState("settings")
  
  // States for invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Team Member")
  const [dailyLimit, setDailyLimit] = useState("10000")
  const [monthlyLimit, setMonthlyLimit] = useState("100000")
  
  // Permissions for new member
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [canReceive, setCanReceive] = useState(true)
  const [canManageTeam, setCanManageTeam] = useState(false)
  const [canCreateInvoices, setCanCreateInvoices] = useState(true)

  const handleInviteMember = () => {
    setIsInviteDialogOpen(true)
  }
  
  const handleRemove = (email: string) => {
    toast.error(`Removed ${email}`, {
      description: "Team member has been removed."
    })
  }
  
  const handleInviteSubmit = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address")
      return
    }
    
    toast.success(`Invited ${inviteEmail}`, {
      description: "An invitation has been sent."
    })
    
    // Close the dialog
    setIsInviteDialogOpen(false)
    
    // Reset form
    setInviteEmail("")
    setInviteRole("Team Member")
    setDailyLimit("10000")
    setMonthlyLimit("100000")
    setCanWithdraw(false)
    setCanReceive(true)
    setCanManageTeam(false)
    setCanCreateInvoices(true)
  }
  
  const handleManagePermissions = (member: TeamMember) => {
    setSelectedMember(member)
    setIsPermissionsDialogOpen(true)
  }
  
  const handleUpdatePermissions = () => {
    if (selectedMember) {
      toast.success(`Updated permissions for ${selectedMember.email}`, {
        description: "Changes saved successfully."
      })
      setIsPermissionsDialogOpen(false)
    }
  }
  
  const handleAddWalletAccess = (member: TeamMember) => {
    toast.success(`Added wallet access for ${member.email}`, {
      description: "They now have access to the selected wallet."
    })
  }
  
  const getProgressBarColor = (used: number, total: number) => {
    const percentage = (used / total) * 100
    if (percentage > 80) return "bg-red-500"
    if (percentage > 50) return "bg-yellow-500"
    return "bg-green-500"
  }
  
  const renderSpendingLimitBar = (used: number, total: number) => {
    const usedPercentage = Math.min(100, (used / total) * 100)
    const barColor = getProgressBarColor(used, total)
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div
          className={`${barColor} h-2 rounded-full`}
          style={{ width: `${usedPercentage}%` }}
        ></div>
      </div>
    )
  }
  
  const renderAvatarBadge = (letter: string) => {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
        {letter}
      </div>
    )
  }

  const handleAddTerminal = () => {
    setIsTerminalDialogOpen(true)
  }
  
  const handleTerminalComplete = (terminalData: {
    id: string;
    name: string;
    type: string;
    location: string;
  }) => {
    setIsTerminalDialogOpen(false)
    toast.success(`Added terminal ${terminalData.name}`, {
      description: `Terminal ID: ${terminalData.id}`
    })
  }

  const handleManageTerminal = (id: string, name: string) => {
    setSelectedTerminalId(id)
    setSelectedTerminalName(name)
    setIsTerminalManagerOpen(true)
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Team Wallets</h1>
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          onClick={handleInviteMember}
        >
          <Plus size={16} />
          Invite Member
        </Button>
      </div>
      
      <Tabs defaultValue="members" className="mb-8" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users size={16} />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Wallet size={16} />
            Shared Wallets
          </TabsTrigger>
          <TabsTrigger value="terminals" className="flex items-center gap-2">
            <Tablet size={16} />
            Payment Terminals
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Access Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamWallets.map((member, index) => (
              <Card 
                key={index} 
                className="rounded-xl shadow-md overflow-hidden border border-gray-800 bg-gray-900/50"
              >
                <CardHeader className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className={`rounded-md px-2 py-1 text-xs text-white ${
                      member.status === "Active" ? "bg-green-500/20" : "bg-amber-500/20"
                    }`}>
                      {member.status}
                    </div>
                    <Badge variant="outline" className="text-xs border-blue-600/30 text-blue-400">
                      {member.role}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-3">
                    {renderAvatarBadge(member.avatar)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{member.email}</h3>
                      <p className="text-gray-400 text-xs">Last active: {member.activity.lastActive}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-0 space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Balance</div>
                    <div className="text-xl font-semibold text-white">
                      {member.balance.toLocaleString()} sats
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Daily Limit</span>
                      <span className="text-white">
                        {member.spendingLimit.remaining.daily.toLocaleString()} / {member.spendingLimit.daily.toLocaleString()}
                      </span>
                    </div>
                    {renderSpendingLimitBar(
                      member.spendingLimit.daily - member.spendingLimit.remaining.daily,
                      member.spendingLimit.daily
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Monthly Limit</span>
                      <span className="text-white">
                        {member.spendingLimit.remaining.monthly.toLocaleString()} / {member.spendingLimit.monthly.toLocaleString()}
                      </span>
                    </div>
                    {renderSpendingLimitBar(
                      member.spendingLimit.monthly - member.spendingLimit.remaining.monthly,
                      member.spendingLimit.monthly
                    )}
                  </div>
                  
                  {member.walletSharing.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Shared Wallets</div>
                      <div className="space-y-2">
                        {member.walletSharing.map((wallet, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-md p-2 text-xs">
                            <span className="text-gray-300">{wallet.name}</span>
                            <Badge variant={
                              wallet.accessLevel === "Owner" ? "default" : 
                              wallet.accessLevel === "Editor" ? "outline" : "secondary"
                            } 
                            className="text-[10px]"
                            >
                              {wallet.accessLevel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-4 bg-gray-800/30 border-t border-gray-800 gap-2 flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-gray-700"
                    onClick={() => handleAddWalletAccess(member)}
                  >
                    <Key size={14} className="mr-1" />
                    Wallet Access
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-gray-700"
                    onClick={() => handleManagePermissions(member)}
                  >
                    <ShieldCheck size={14} className="mr-1" />
                    Permissions
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-gray-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    onClick={() => handleRemove(member.email)}
                  >
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="shared">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Shared Company Wallets</h2>
              <Button variant="outline" className="border-blue-600/30 text-blue-400">
                <Plus size={16} className="mr-2" />
                Create Wallet
              </Button>
            </div>
            
            <div className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Marketing Budget</h3>
                    <Badge variant="outline" className="text-green-400 border-green-500/20">3 members</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Balance</span>
                    <span className="text-white font-medium">250,000 sats</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-gray-700">
                  <Button variant="ghost" size="sm" className="ml-auto text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                    Manage Access
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Operations</h3>
                    <Badge variant="outline" className="text-green-400 border-green-500/20">1 member</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Balance</span>
                    <span className="text-white font-medium">180,000 sats</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-gray-700">
                  <Button variant="ghost" size="sm" className="ml-auto text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                    Manage Access
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Content Creation</h3>
                    <Badge variant="outline" className="text-green-400 border-green-500/20">1 member</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Balance</span>
                    <span className="text-white font-medium">120,000 sats</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-gray-700">
                  <Button variant="ghost" size="sm" className="ml-auto text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                    Manage Access
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="terminals">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Payment Terminals Management</h2>
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  onClick={handleAddTerminal}
                >
                  <Plus size={16} />
                  Add Terminal
                </Button>
              </div>
              <p className="text-gray-400">Manage your physical and virtual payment terminals across all locations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Physical terminals */}
              <Card className="border-gray-800 bg-gray-900/70 hover:border-blue-700/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-md">
                      <Tablet className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Main Register</h3>
                      <p className="text-xs text-gray-400">Front Desk - Store #1</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Terminal ID</span>
                      <span className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded text-xs">TERM-001</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Transaction</span>
                      <span className="text-white">5 mins ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Today's Volume</span>
                      <span className="text-white">25,750 sats</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleManageTerminal("TERM-001", "Main Register")}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Manage Terminal
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-gray-800 bg-gray-900/70 hover:border-blue-700/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-md">
                      <CircleDollarSign className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Kitchen Register</h3>
                      <p className="text-xs text-gray-400">Back Room - Store #1</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Terminal ID</span>
                      <span className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded text-xs">TERM-002</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Transaction</span>
                      <span className="text-white">37 mins ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Today's Volume</span>
                      <span className="text-white">12,500 sats</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleManageTerminal("TERM-002", "Kitchen Register")}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Manage Terminal
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-gray-800 bg-gray-900/70 hover:border-blue-700/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-md">
                      <Map className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Online Store</h3>
                      <p className="text-xs text-gray-400">Web Checkout</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Terminal ID</span>
                      <span className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded text-xs">WEB-001</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Transaction</span>
                      <span className="text-white">2 mins ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Today's Volume</span>
                      <span className="text-white">180,000 sats</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleManageTerminal("WEB-001", "Online Store")}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Manage Terminal
                  </Button>
                </CardFooter>
              </Card>
              
              <Card 
                className="border-gray-800 bg-gray-900/70 border-dashed flex flex-col items-center justify-center p-6 hover:bg-gray-800/30 transition-colors cursor-pointer" 
                onClick={handleAddTerminal}
              >
                <div className="p-3 bg-blue-900/20 rounded-full mb-4">
                  <Plus className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Add New Terminal</h3>
                <p className="text-gray-400 text-sm text-center">Add a new payment terminal or cash register to your network</p>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border border-gray-800 rounded-xl">
              <CardHeader>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Lock size={18} />
                  Default Access Settings
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">Create Invoices</p>
                    <p className="text-sm text-gray-400">Allow members to create payment requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">Withdraw Funds</p>
                    <p className="text-sm text-gray-400">Allow members to withdraw bitcoin</p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">Invite New Members</p>
                    <p className="text-sm text-gray-400">Allow members to invite others to team</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border border-gray-800 rounded-xl">
              <CardHeader>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Bell size={18} />
                  Notifications & Alerts
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">Large Withdrawals</p>
                    <p className="text-sm text-gray-400">Get alerted for withdrawals &gt; 50,000 sats</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">New Access Grants</p>
                    <p className="text-sm text-gray-400">Get alerted when wallets are shared</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">Daily Spending Summaries</p>
                    <p className="text-sm text-gray-400">Receive daily spending reports</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Invite Team Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                placeholder="team@example.com" 
                className="bg-gray-800 border-gray-700"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Spending Limits</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daily-limit" className="text-xs text-gray-400">Daily (sats)</Label>
                  <Input 
                    id="daily-limit" 
                    className="bg-gray-800 border-gray-700"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="monthly-limit" className="text-xs text-gray-400">Monthly (sats)</Label>
                  <Input 
                    id="monthly-limit" 
                    className="bg-gray-800 border-gray-700"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Permissions</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Can Withdraw Funds</Label>
                  <p className="text-xs text-gray-400">Allow this member to withdraw bitcoin</p>
                </div>
                <Switch 
                  checked={canWithdraw}
                  onCheckedChange={setCanWithdraw}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Can Receive Payments</Label>
                  <p className="text-xs text-gray-400">Allow this member to create invoices</p>
                </div>
                <Switch 
                  checked={canReceive}
                  onCheckedChange={setCanReceive}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Can Manage Team</Label>
                  <p className="text-xs text-gray-400">Allow this member to invite and remove others</p>
                </div>
                <Switch 
                  checked={canManageTeam}
                  onCheckedChange={setCanManageTeam}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Can Create Invoices</Label>
                  <p className="text-xs text-gray-400">Allow this member to create payment links</p>
                </div>
                <Switch 
                  checked={canCreateInvoices}
                  onCheckedChange={setCanCreateInvoices}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsInviteDialogOpen(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInviteSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Permissions Dialog */}
      {selectedMember && (
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Manage Permissions</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-800">
                {renderAvatarBadge(selectedMember.avatar)}
                <div>
                  <h3 className="font-semibold text-white">{selectedMember.email}</h3>
                  <p className="text-gray-400 text-sm">{selectedMember.role}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Can Withdraw Funds</Label>
                    <p className="text-xs text-gray-400">Allow withdrawal of bitcoin</p>
                  </div>
                  <Switch 
                    checked={selectedMember.permissions.canWithdraw}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Can Receive Payments</Label>
                    <p className="text-xs text-gray-400">Allow receiving payments</p>
                  </div>
                  <Switch 
                    checked={selectedMember.permissions.canReceive}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Can Manage Team</Label>
                    <p className="text-xs text-gray-400">Allow team management</p>
                  </div>
                  <Switch 
                    checked={selectedMember.permissions.canManageTeam}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Can Create Invoices</Label>
                    <p className="text-xs text-gray-400">Allow creating payment links</p>
                  </div>
                  <Switch 
                    checked={selectedMember.permissions.canCreateInvoices}
                  />
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-800">
                  <Label>Spending Limits</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="update-daily-limit" className="text-xs text-gray-400">Daily (sats)</Label>
                      <Input 
                        id="update-daily-limit" 
                        className="bg-gray-800 border-gray-700"
                        defaultValue={selectedMember.spendingLimit.daily.toString()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="update-monthly-limit" className="text-xs text-gray-400">Monthly (sats)</Label>
                      <Input 
                        id="update-monthly-limit" 
                        className="bg-gray-800 border-gray-700"
                        defaultValue={selectedMember.spendingLimit.monthly.toString()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsPermissionsDialogOpen(false)}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePermissions}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Terminal Dialog */}
      <Dialog open={isTerminalDialogOpen} onOpenChange={setIsTerminalDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Terminal</DialogTitle>
          </DialogHeader>
          
          <TerminalRegistration onComplete={handleTerminalComplete} />
        </DialogContent>
      </Dialog>
      
      {/* Terminal Manager Dialog */}
      <Dialog open={isTerminalManagerOpen} onOpenChange={setIsTerminalManagerOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              {selectedTerminalName} Management
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="settings" className="w-full" value={terminalManagerTab} onValueChange={setTerminalManagerTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Terminal Settings
              </TabsTrigger>
              <TabsTrigger value="qrcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Generate Payment QR
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              {selectedTerminalId && selectedTerminalName && (
                <TerminalSettings
                  terminalId={selectedTerminalId}
                  terminalName={selectedTerminalName}
                />
              )}
            </TabsContent>
            
            <TabsContent value="qrcode">
              {selectedTerminalId && selectedTerminalName && (
                <TerminalQrGenerator
                  terminalId={selectedTerminalId}
                  terminalName={selectedTerminalName}
                />
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <TerminalAnalytics />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
} 