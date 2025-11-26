"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { 
  Zap, 
  Timer, 
  ArrowRight, 
  BarChart, 
  Clock, 
  CheckCircle,
  Bolt
} from "lucide-react"
import { motion } from "framer-motion"

// Types for transaction data
interface TransactionSpeed {
  id: string
  amount: number
  initiatedTime: Date
  completedTime: Date
  processingTimeMs: number
  hops: number
  type: 'incoming' | 'outgoing' | 'routing'
}

interface TransactionSpeedChartProps {
  className?: string
}

export function TransactionSpeedChart({ className }: TransactionSpeedChartProps) {
  const [selectedView, setSelectedView] = useState<'recent' | 'fastest' | 'all'>('recent')
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Mock data for transaction speeds
  const transactionSpeeds: TransactionSpeed[] = [
    {
      id: 'tx-001',
      amount: 25000,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      completedTime: new Date(Date.now() - 1000 * 60 * 2 + 428), // 428ms later
      processingTimeMs: 428,
      hops: 2,
      type: 'incoming'
    },
    {
      id: 'tx-002',
      amount: 5000,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      completedTime: new Date(Date.now() - 1000 * 60 * 5 + 371), // 371ms later
      processingTimeMs: 371,
      hops: 1,
      type: 'outgoing'
    },
    {
      id: 'tx-003',
      amount: 75000,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      completedTime: new Date(Date.now() - 1000 * 60 * 15 + 532), // 532ms later
      processingTimeMs: 532,
      hops: 3,
      type: 'incoming'
    },
    {
      id: 'tx-004',
      amount: 1500,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      completedTime: new Date(Date.now() - 1000 * 60 * 25 + 215), // 215ms later
      processingTimeMs: 215,
      hops: 1,
      type: 'routing'
    },
    {
      id: 'tx-005',
      amount: 42000,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      completedTime: new Date(Date.now() - 1000 * 60 * 45 + 389), // 389ms later
      processingTimeMs: 389,
      hops: 2,
      type: 'outgoing'
    },
    {
      id: 'tx-006',
      amount: 10000,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      completedTime: new Date(Date.now() - 1000 * 60 * 60 + 301), // 301ms later
      processingTimeMs: 301,
      hops: 1,
      type: 'incoming'
    },
    {
      id: 'tx-007',
      amount: 8500,
      initiatedTime: new Date(Date.now() - 1000 * 60 * 70), // 70 minutes ago
      completedTime: new Date(Date.now() - 1000 * 60 * 70 + 412), // 412ms later
      processingTimeMs: 412,
      hops: 2,
      type: 'outgoing'
    },
  ]
  
  // Stats calculations
  const averageSpeed = Math.round(
    transactionSpeeds.reduce((sum, tx) => sum + tx.processingTimeMs, 0) / transactionSpeeds.length
  )
  
  const fastestTransaction = transactionSpeeds.reduce(
    (fastest, tx) => tx.processingTimeMs < fastest.processingTimeMs ? tx : fastest,
    transactionSpeeds[0]
  )
  
  const slowestTransaction = transactionSpeeds.reduce(
    (slowest, tx) => tx.processingTimeMs > slowest.processingTimeMs ? tx : slowest,
    transactionSpeeds[0]
  )
  
  // Generate sorted data for display
  const getDisplayTransactions = () => {
    switch (selectedView) {
      case 'fastest':
        return [...transactionSpeeds].sort((a, b) => a.processingTimeMs - b.processingTimeMs);
      case 'recent':
        return [...transactionSpeeds].sort((a, b) => 
          b.initiatedTime.getTime() - a.initiatedTime.getTime()
        );
      case 'all':
      default:
        return transactionSpeeds;
    }
  }
  
  // Animation effect on load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Format time function
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) {
      return `${Math.floor(diffMs / 1000)} seconds ago`;
    } else if (diffMs < 3600000) {
      return `${Math.floor(diffMs / 60000)} minutes ago`;
    } else if (diffMs < 86400000) {
      return `${Math.floor(diffMs / 3600000)} hours ago`;
    } else {
      return `${Math.floor(diffMs / 86400000)} days ago`;
    }
  };

  return (
    <Card className={`border-gray-800 bg-gray-850/80 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-bold flex items-center">
          <Bolt className="mr-2 h-5 w-5 text-yellow-500" />
          Lightning Speed Monitor
        </CardTitle>
        <Tabs value={selectedView} onValueChange={setSelectedView as any} className="w-auto">
          <TabsList className="bg-gray-900 h-8">
            <TabsTrigger className="text-xs h-7" value="recent">Recent</TabsTrigger>
            <TabsTrigger className="text-xs h-7" value="fastest">Fastest</TabsTrigger>
            <TabsTrigger className="text-xs h-7" value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Average Speed</p>
              <p className="text-2xl font-bold text-white">{averageSpeed} ms</p>
            </div>
            <div className="bg-blue-900/30 p-2 rounded-full">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Fastest Transaction</p>
              <p className="text-2xl font-bold text-green-400">{fastestTransaction.processingTimeMs} ms</p>
            </div>
            <div className="bg-green-900/30 p-2 rounded-full">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Slowest Transaction</p>
              <p className="text-2xl font-bold text-amber-400">{slowestTransaction.processingTimeMs} ms</p>
            </div>
            <div className="bg-amber-900/30 p-2 rounded-full">
              <Timer className="h-5 w-5 text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Transaction Speed Timeline</h3>
          
          <div className="space-y-4">
            {getDisplayTransactions().map((tx, index) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      tx.type === 'incoming' ? 'bg-green-900/30' : 
                      tx.type === 'outgoing' ? 'bg-amber-900/30' : 
                      'bg-blue-900/30'
                    }`}>
                      {tx.type === 'incoming' && <ArrowRight className="h-4 w-4 text-green-400" />}
                      {tx.type === 'outgoing' && <ArrowRight className="h-4 w-4 text-amber-400 transform rotate-180" />}
                      {tx.type === 'routing' && <Bolt className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {tx.amount.toLocaleString()} sats
                        <span className="text-sm font-normal text-gray-400 ml-2">
                          ({formatRelativeTime(tx.initiatedTime)})
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.type === 'incoming' ? 'Received' : 
                         tx.type === 'outgoing' ? 'Sent' : 
                         'Routed'} via {tx.hops} {tx.hops === 1 ? 'hop' : 'hops'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-900/20 text-yellow-400 border-0">
                    {tx.processingTimeMs} ms
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: tx.processingTimeMs / 1000, ease: "easeOut" }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-full rounded-full"
                  />
                </div>
                
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">Initiated</span>
                  <span className="text-gray-400">Completed</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 