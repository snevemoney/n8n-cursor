"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { 
  BarChart, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Filter
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface TerminalAnalyticsProps {
  totalTerminals?: number
}

export function TerminalAnalytics({ totalTerminals = 3 }: TerminalAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("today")
  const [selectedTerminal, setSelectedTerminal] = useState("all")
  
  // Mock data - in a real app, this would come from an API
  const transactionData = [
    { id: 'tx-001', amount: 15000, time: '14:32', terminal: 'TERM-001', status: 'completed' },
    { id: 'tx-002', amount: 7500, time: '13:45', terminal: 'TERM-002', status: 'completed' },
    { id: 'tx-003', amount: 35000, time: '12:21', terminal: 'WEB-001', status: 'completed' },
    { id: 'tx-004', amount: 12000, time: '11:15', terminal: 'TERM-001', status: 'completed' },
    { id: 'tx-005', amount: 22000, time: '10:33', terminal: 'WEB-001', status: 'completed' },
    { id: 'tx-006', amount: 18500, time: '09:27', terminal: 'TERM-002', status: 'completed' },
    { id: 'tx-007', amount: 5000, time: '09:12', terminal: 'TERM-001', status: 'completed' },
  ]

  // Calculate summary stats
  const totalVolume = transactionData.reduce((sum, tx) => sum + tx.amount, 0)
  const totalTransactions = transactionData.length
  const avgTransactionValue = Math.round(totalVolume / totalTransactions)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Terminal Analytics</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-gray-800 border-gray-700 w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2 border-gray-700">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/70 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-normal">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{totalVolume.toLocaleString()} sats</p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.5% from previous
                </p>
              </div>
              <div className="p-2 bg-green-900/20 rounded-md">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/70 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-normal">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{totalTransactions}</p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +8.3% from previous
                </p>
              </div>
              <div className="p-2 bg-blue-900/20 rounded-md">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/70 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-normal">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{avgTransactionValue.toLocaleString()} sats</p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +4.2% from previous
                </p>
              </div>
              <div className="p-2 bg-purple-900/20 rounded-md">
                <BarChart className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700 p-1">
          <TabsTrigger 
            value="transactions" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="by-terminal" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            By Terminal
          </TabsTrigger>
          <TabsTrigger 
            value="hourly" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            Hourly Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card className="bg-gray-900/70 border-gray-800 mt-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-white">Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 w-[160px] h-8 text-xs">
                      <SelectValue placeholder="Filter by terminal" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Terminals</SelectItem>
                      <SelectItem value="TERM-001">Main Register</SelectItem>
                      <SelectItem value="TERM-002">Kitchen Register</SelectItem>
                      <SelectItem value="WEB-001">Online Store</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" className="h-8 px-2 border-gray-700">
                    <Filter className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Terminal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                    {transactionData
                      .filter(tx => selectedTerminal === 'all' || tx.terminal === selectedTerminal)
                      .map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {transaction.time}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">
                            {transaction.amount.toLocaleString()} sats
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {transaction.terminal === 'TERM-001' ? 'Main Register' : 
                             transaction.terminal === 'TERM-002' ? 'Kitchen Register' : 
                             'Online Store'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Badge className="bg-green-900/30 text-green-400 hover:bg-green-900/40 border-0">
                              Completed
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-terminal">
          <Card className="bg-gray-900/70 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-white">Terminal Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-md">
                      <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Main Register (TERM-001)</p>
                      <p className="text-xs text-gray-400">Front Desk - Store #1</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white text-right">32,000 sats</p>
                    <div className="text-xs text-green-400 flex items-center justify-end gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +5.2% compared to average
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/30 rounded-md">
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Online Store (WEB-001)</p>
                      <p className="text-xs text-gray-400">Web Checkout</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white text-right">57,000 sats</p>
                    <div className="text-xs text-green-400 flex items-center justify-end gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +28.7% compared to average
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-md">
                      <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Kitchen Register (TERM-002)</p>
                      <p className="text-xs text-gray-400">Back Room - Store #1</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white text-right">26,000 sats</p>
                    <div className="text-xs text-red-400 flex items-center justify-end gap-1">
                      <ArrowDownRight className="h-3 w-3" />
                      -10.3% compared to average
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hourly">
          <Card className="bg-gray-900/70 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-white">Hourly Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between px-2">
                {/* Mock hourly chart - would be replaced with actual chart library */}
                {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => {
                  // Generate a random height value based on the hour
                  const heightPercent = hour < 12 
                    ? 20 + (hour - 8) * 8 
                    : hour < 17 
                      ? 80 - (hour - 12) * 5 
                      : 30 + (hour - 16) * 8
                  
                  const getColorClass = () => {
                    if (heightPercent > 60) return "bg-green-500"
                    if (heightPercent > 40) return "bg-blue-500"
                    return "bg-purple-500"
                  }
                  
                  return (
                    <div key={hour} className="flex flex-col items-center gap-2">
                      <div className="text-xs text-gray-400">{heightPercent}%</div>
                      <div 
                        className={`w-8 rounded-t-md ${getColorClass()}`} 
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <div className="text-xs text-gray-400">{hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Peak Hour</p>
                    <p className="text-lg font-semibold text-white">11 AM - 12 PM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Busiest Terminal</p>
                    <p className="text-lg font-semibold text-white">Online Store</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Avg. Transaction Size</p>
                    <p className="text-lg font-semibold text-white">15,500 sats</p>
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