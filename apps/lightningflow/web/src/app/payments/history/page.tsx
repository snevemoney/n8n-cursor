"use client"

import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, Filter, Download, Clock, ChevronDown, ArrowUpRight, ArrowDownLeft, Zap, Network } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "../../../components/ui/card"
import { TransactionSpeedChart } from "../../../components/transaction-speed-chart"
import { useState } from "react"

export default function TransactionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'history' | 'speed'>('history')
  const [displayedTransactions, setDisplayedTransactions] = useState(5)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Helper function to get status badge styling
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-900/20 text-amber-400';
      case 'Completed':
        return 'bg-green-900/20 text-green-400';
      case 'Confirmed':
        return 'bg-blue-900/20 text-blue-400';
      case 'Failed':
        return 'bg-red-900/20 text-red-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };
  
  const transactions = [
    { 
      date: "May 8, 2023", 
      time: "05:55 AM",
      description: "Logo design project", 
      type: "Invoice", 
      amount: 120000,
      status: "Pending"
    },
    { 
      date: "May 7, 2023", 
      time: "07:55 AM",
      description: "Website maintenance", 
      type: "Invoice", 
      amount: 105000,
      status: "Completed"
    },
    { 
      date: "May 6, 2023", 
      time: "07:55 AM",
      description: "Content creation services", 
      type: "Invoice", 
      amount: 73000,
      status: "Completed"
    },
    { 
      date: "May 5, 2023", 
      time: "10:22 AM",
      description: "Channel open with ACINQ", 
      type: "Channel", 
      amount: 500000,
      status: "Confirmed"
    },
    { 
      date: "May 3, 2023", 
      time: "04:32 PM",
      description: "Routing fee", 
      type: "Routing", 
      amount: 125,
      status: "Completed"
    },
    { 
      date: "May 2, 2023", 
      time: "02:15 PM",
      description: "Consulting services", 
      type: "Invoice", 
      amount: 250000,
      status: "Completed"
    },
    { 
      date: "May 1, 2023", 
      time: "11:30 AM",
      description: "Channel close with Bitfinex", 
      type: "Channel", 
      amount: 750000,
      status: "Confirmed"
    },
    { 
      date: "Apr 30, 2023", 
      time: "09:45 AM",
      description: "Monthly subscription", 
      type: "Invoice", 
      amount: 50000,
      status: "Completed"
    },
    { 
      date: "Apr 29, 2023", 
      time: "03:20 PM",
      description: "Routing fee", 
      type: "Routing", 
      amount: 89,
      status: "Completed"
    },
    { 
      date: "Apr 28, 2023", 
      time: "01:10 PM",
      description: "Web development project", 
      type: "Invoice", 
      amount: 180000,
      status: "Completed"
    },
    { 
      date: "Apr 27, 2023", 
      time: "07:55 AM",
      description: "Channel open with Kraken", 
      type: "Channel", 
      amount: 300000,
      status: "Confirmed"
    },
    { 
      date: "Apr 26, 2023", 
      time: "05:30 PM",
      description: "Design consultation", 
      type: "Invoice", 
      amount: 95000,
      status: "Completed"
    },
    { 
      date: "Apr 25, 2023", 
      time: "12:00 PM",
      description: "Routing fee", 
      type: "Routing", 
      amount: 156,
      status: "Completed"
    },
    { 
      date: "Apr 24, 2023", 
      time: "10:15 AM",
      description: "Marketing services", 
      type: "Invoice", 
      amount: 120000,
      status: "Completed"
    },
    { 
      date: "Apr 23, 2023", 
      time: "08:40 AM",
      description: "Channel close with River", 
      type: "Channel", 
      amount: 450000,
      status: "Confirmed"
    }
  ];

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDisplayedTransactions(prev => Math.min(prev + 5, transactions.length));
    setIsLoadingMore(false);
  };

  const hasMoreTransactions = displayedTransactions < transactions.length;
  
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'history' ? 'default' : 'outline'} 
            className={activeTab !== 'history' ? 'border-gray-700' : ''}
            onClick={() => setActiveTab('history')}
          >
            <Clock className="h-4 w-4 mr-1" />
            History
          </Button>
          <Button 
            variant={activeTab === 'speed' ? 'default' : 'outline'} 
            className={activeTab !== 'speed' ? 'border-gray-700' : ''}
            onClick={() => setActiveTab('speed')}
          >
            <Zap className="h-4 w-4 mr-1" />
            Speed Monitor
          </Button>
        </div>
      </div>
      
      {activeTab === 'history' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Total Volume</p>
                    <h3 className="text-2xl font-bold text-white">1,450,000</h3>
                    <p className="text-xs text-gray-500">≈ $609.00 USD</p>
                  </div>
                  <div className="bg-blue-900/30 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Received</p>
                    <h3 className="text-2xl font-bold text-green-400">985,000</h3>
                    <p className="text-xs text-gray-500">≈ $413.70 USD</p>
                  </div>
                  <div className="bg-green-900/30 p-2 rounded-lg">
                    <ArrowDownLeft className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Sent</p>
                    <h3 className="text-2xl font-bold text-amber-400">445,000</h3>
                    <p className="text-xs text-gray-500">≈ $186.90 USD</p>
                  </div>
                  <div className="bg-amber-900/30 p-2 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Routing Fees</p>
                    <h3 className="text-2xl font-bold text-purple-400">20,000</h3>
                    <p className="text-xs text-gray-500">≈ $8.40 USD</p>
                  </div>
                  <div className="bg-purple-900/30 p-2 rounded-lg">
                    <Network className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">All Transactions</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="text-gray-400 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last 30 Days
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Description</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, displayedTransactions).map((tx, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="p-4 text-white">
                        <div>{tx.date}</div>
                        <div className="text-gray-400 text-xs">{tx.time}</div>
                      </td>
                      <td className="p-4 text-white">{tx.description}</td>
                      <td className="p-4">
                        <div className="px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs inline-flex items-center">
                          {tx.type}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-white font-medium">{tx.amount.toLocaleString()} sats</div>
                        <div className="text-gray-400 text-xs">${(tx.amount * 0.00042).toFixed(2)} USD</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`px-2 py-1 rounded-full ${getStatusBadgeClasses(tx.status)} text-xs inline-flex items-center mx-auto`}>
                          {tx.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-center">
            {hasMoreTransactions ? (
              <Button 
                variant="outline" 
                className="border-gray-700 hover:bg-gray-700/50"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  `Load More Transactions (${transactions.length - displayedTransactions} remaining)`
                )}
              </Button>
            ) : (
              <div className="text-gray-400 text-sm py-4">
                All transactions loaded
              </div>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'speed' && (
        <div className="space-y-6">
          <TransactionSpeedChart />
          
          <Card className="border-gray-800 bg-gray-850/80">
            <CardContent className="p-6">
              <div className="text-lg font-medium mb-4 flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                Lightning Speed Facts
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Did You Know?</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>Lightning transactions typically complete in less than 1 second, compared to on-chain Bitcoin transactions that can take 10+ minutes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>Our network's average transaction speed is 378ms, which is faster than a blink of an eye (~400ms).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>The Lightning Network can theoretically handle millions of transactions per second, while Visa processes around 1,700 tps.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Speed Optimizations</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>Direct channels to frequent payment partners can reduce transaction times by up to 40%.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>Your node is currently using optimized pathfinding algorithms for faster routing decisions.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>Transactions with fewer hops (1-2) complete significantly faster than those requiring multiple hops.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 