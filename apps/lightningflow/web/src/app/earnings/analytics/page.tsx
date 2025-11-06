"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { 
  BarChart2, 
  TrendingUp, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Download,
  BarChart, 
  PieChart,
  ChevronRight
} from "lucide-react"

export default function EarningsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [viewMode, setViewMode] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Mock data for earnings
  const earningsSources = [
    { name: "Routing Fees", amount: 8239, percentage: 35, growth: 12.5 },
    { name: "Direct Sales", amount: 15301, percentage: 65, growth: 8.2 },
  ]
  
  // Mock data for monthly earnings
  const monthlyEarnings = [
    { month: "Jan", amount: 20000 },
    { month: "Feb", amount: 12500 },
    { month: "Mar", amount: 32500 },
    { month: "Apr", amount: 15000 },
    { month: "May", amount: 22500 },
    { month: "Jun", amount: 17500 },
    { month: "Jul", amount: 27500 },
    { month: "Aug", amount: 22500 },
    { month: "Sep", amount: 30000 },
    { month: "Oct", amount: 37500 },
    { month: "Nov", amount: 25000 },
    { month: "Dec", amount: 40000 },
  ]
  
  // Mock data for routing performance
  const routingMetrics = [
    { metric: "Successful forwards", value: 156, change: "+12%" },
    { metric: "Average fee rate", value: "0.25%", change: "+0.03%" },
    { metric: "Average fee earned", value: "52 sats", change: "+8%" },
    { metric: "Total volume", value: "4.25M sats", change: "+15%" }
  ]
  
  // Helper function to format sats with commas
  const formatSats = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-green-500" />
            Earnings Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track, analyze, and optimize your Lightning node revenue streams
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            className="border-gray-700 bg-gray-900 hover:bg-gray-800"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
              <CardContent className="p-6">
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-32 bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setViewMode}>
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
                Overview
              </TabsTrigger>
              <TabsTrigger value="routing" className="data-[state=active]:bg-gray-800">
                Routing Revenue
              </TabsTrigger>
              <TabsTrigger value="sales" className="data-[state=active]:bg-gray-800">
                Sales Revenue
              </TabsTrigger>
              <TabsTrigger value="projections" className="data-[state=active]:bg-gray-800">
                Projections
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Earnings Card */}
                <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Earnings ({timeRange === "30d" ? "30 days" : timeRange === "7d" ? "7 days" : timeRange === "90d" ? "90 days" : "1 year"})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatSats(earningsSources.reduce((sum, src) => sum + src.amount, 0))} <span className="text-sm font-normal text-muted-foreground">sats</span>
                    </div>
                    <div className="text-sm text-green-500 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +9.8% from previous period
                    </div>
                    
                    <div className="h-[1px] bg-gray-800 my-4"></div>
                    
                    <div className="space-y-3">
                      {earningsSources.map((source, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm">{source.name}</span>
                          </div>
                          <div className="text-sm font-medium">{source.percentage}%</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="h-2 w-full bg-gray-800 rounded-full mt-3 overflow-hidden">
                      <div className="h-full flex">
                        <div className="h-full bg-purple-500" style={{ width: `${earningsSources[0].percentage}%` }}></div>
                        <div className="h-full bg-yellow-500" style={{ width: `${earningsSources[1].percentage}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Routing Revenue */}
                <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Routing Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatSats(earningsSources[0].amount)} <span className="text-sm font-normal text-muted-foreground">sats</span>
                    </div>
                    <div className="text-sm text-green-500 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +{earningsSources[0].growth}% from previous period
                    </div>
                    
                    <div className="mt-6 flex items-end h-24 gap-1">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const height = 40 + Math.random() * 60;
                        return (
                          <div key={i} className="flex-1 group relative">
                            <div 
                              className="w-full rounded-t-sm bg-purple-500 group-hover:bg-purple-400 transition-colors"
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {Math.floor(height * 20)} sats
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <span key={i}>{i + 1}</span>
                      ))}
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Last 7 days
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sales Revenue */}
                <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Sales Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatSats(earningsSources[1].amount)} <span className="text-sm font-normal text-muted-foreground">sats</span>
                    </div>
                    <div className="text-sm text-green-500 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +{earningsSources[1].growth}% from previous period
                    </div>
                    
                    <div className="mt-6 flex items-end h-24 gap-1">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const height = 30 + Math.random() * 70;
                        return (
                          <div key={i} className="flex-1 group relative">
                            <div 
                              className="w-full rounded-t-sm bg-yellow-500 group-hover:bg-yellow-400 transition-colors"
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {Math.floor(height * 40)} sats
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <span key={i}>{i + 1}</span>
                      ))}
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Last 7 days
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Annual Performance Chart */}
              <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Annual Earnings Performance
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Sales</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Routing</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-64 flex items-end gap-4">
                    {monthlyEarnings.map((month, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="text-xs text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatSats(month.amount)} sats
                        </div>
                        <div className="w-full relative">
                          <div 
                            className="w-full bg-yellow-500 hover:bg-yellow-400 transition-colors rounded-t"
                            style={{ height: `${(month.amount * 0.65) / 400}px` }}
                          ></div>
                          <div 
                            className="w-full bg-purple-500 hover:bg-purple-400 transition-colors"
                            style={{ height: `${(month.amount * 0.35) / 400}px` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">{month.month}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Routing Performance */}
              <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Routing Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {routingMetrics.map((metric, i) => (
                      <div key={i} className="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
                        <div className="text-sm text-muted-foreground mb-1">{metric.metric}</div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className={`text-sm flex items-center mt-1 ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {metric.change.startsWith('+') ? 
                            <ArrowUp className="h-3 w-3 mr-1" /> : 
                            <ArrowDown className="h-3 w-3 mr-1" />
                          }
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 text-sm"
                      onClick={() => setViewMode("routing")}
                    >
                      View detailed routing analysis
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="routing" className="mt-6">
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Routing Revenue Analysis</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Detailed analytics for your Lightning Network routing income. Optimize your node's performance 
                  by analyzing channel metrics, fee settings, and forwarding patterns.
                </p>
              </div>
              
              {/* Routing analytics content would go here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-purple-500" />
                      Channel Performance
                    </h3>
                    
                    {/* Placeholder for detailed channel performance metrics */}
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Channel #{i+1}</div>
                            <div className="text-sm text-muted-foreground">Peer: Node{i+1}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-500">{Math.floor(500 + Math.random() * 2000)} sats</div>
                            <div className="text-sm text-muted-foreground">{Math.floor(5 + Math.random() * 20)} forwards</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-500" />
                      Fee Rate Analysis
                    </h3>
                    
                    {/* Placeholder for fee analysis */}
                    <div className="space-y-4">
                      <div className="h-40 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-8 border-blue-500 relative flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">0.25%</div>
                            <div className="text-sm text-muted-foreground">Average</div>
                          </div>
                          <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-green-500 border-4 border-gray-850 flex items-center justify-center text-sm font-medium">
                            0.3%
                          </div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-yellow-500 border-4 border-gray-850 flex items-center justify-center text-sm font-medium">
                            0.2%
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                          <div className="text-sm text-muted-foreground">Highest earning rate</div>
                          <div className="text-xl font-medium">0.3%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                          <div className="text-sm text-muted-foreground">Optimal rate range</div>
                          <div className="text-xl font-medium">0.2-0.3%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sales" className="mt-6">
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Sales Revenue Analysis</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Track your Lightning Network sales performance, customer payment patterns, 
                  and optimize your business income.
                </p>
              </div>
              
              {/* Sales analytics placeholder */}
              <div className="h-80 flex items-center justify-center border border-gray-700 rounded-xl bg-gray-900/50">
                <div className="text-center">
                  <p className="text-muted-foreground">Detailed sales analytics will be displayed here</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="projections" className="mt-6">
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Earnings Projections</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  View earnings forecasts based on your historical data and growth trends.
                </p>
              </div>
              
              {/* Projections placeholder */}
              <div className="h-80 flex items-center justify-center border border-gray-700 rounded-xl bg-gray-900/50">
                <div className="text-center">
                  <p className="text-muted-foreground">Earnings projections will be displayed here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
} 