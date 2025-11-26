"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { EarningsCard } from "../../features/dashboard/cards/earnings"
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  Activity, 
  TrendingUp, 
  ChevronRight, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  Calendar
} from "lucide-react"
import dynamic from "next/dynamic"

// Import recharts components normally - they will be client-side only due to "use client"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Dynamic import for Lightning Network Map to prevent SSR issues
const LightningNetworkMap = dynamic(() => import("../../components/lightning-network-map").then(mod => ({ default: mod.LightningNetworkMap })), { 
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center text-gray-400">Loading Lightning Network Map...</div>
});

export default function AnalyticsPage() {
  const [timeFrame, setTimeFrame] = useState("7 days")
  const [activeTab, setActiveTab] = useState("overview")
  const [isHydrated, setIsHydrated] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure hydration is complete before rendering charts
  useEffect(() => {
    // First, ensure we're on the client
    setIsClient(true)
    
    // Add a delay to ensure DOM is fully ready and all dynamic imports are loaded
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock data for node health - with validation
  const nodeHealthData = [
    { name: "Mon", uptime: 99.9 },
    { name: "Tue", uptime: 100 },
    { name: "Wed", uptime: 100 },
    { name: "Thu", uptime: 99.7 },
    { name: "Fri", uptime: 97.5 },
    { name: "Sat", uptime: 100 },
    { name: "Sun", uptime: 99.8 },
  ]

  // Mock data for routing trends - with validation
  const routingTrendsData = [
    { name: "Week 1", routing: 4500, volume: 1250000 },
    { name: "Week 2", routing: 5200, volume: 1450000 },
    { name: "Week 3", routing: 4800, volume: 1350000 },
    { name: "Week 4", routing: 6500, volume: 1850000 },
  ]

  // Mock data for peer distribution - with validation
  const peerDistributionData = [
    { name: "ACINQ", value: 9200 },
    { name: "Bitfinex", value: 5400 },
    { name: "River", value: 4100 },
    { name: "Voltage", value: 2500 },
    { name: "Breez", value: 1800 },
  ]

  // Mock hourly forwarding data - with validation
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    forwards: Math.floor(Math.random() * 40),
  }))

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']
  
  // Helper function to validate chart data
  const isValidChartData = (data: any[]): boolean => {
    return Array.isArray(data) && data.length > 0 && data.every(item => typeof item === 'object' && item !== null)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="inline-block mr-2">⚡</span>
            Lightning Earnings Analytics
          </h1>
          <p className="text-muted-foreground">Comprehensive earnings tracking and performance metrics for your Lightning node</p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Tabs defaultValue={timeFrame} onValueChange={setTimeFrame} className="w-auto">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="7 days" className="data-[state=active]:bg-gray-800">7 Days</TabsTrigger>
              <TabsTrigger value="30 days" className="data-[state=active]:bg-gray-800">30 Days</TabsTrigger>
              <TabsTrigger value="90 days" className="data-[state=active]:bg-gray-800">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="icon" className="border-gray-700 bg-gray-900 hover:bg-gray-800">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detailed Earnings Analytics - Moved from Dashboard */}
      <div className="mb-8">
        <EarningsCard userId="test-user-123" />
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
            Overview
          </TabsTrigger>
          <TabsTrigger value="routing" className="data-[state=active]:bg-gray-800">
            Routing
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-gray-800">
            Channels
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gray-800">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Node Health</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">30-day average: 99.2%</span>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[220px] w-full">
                  {isHydrated && isValidChartData(nodeHealthData) ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                      <AreaChart data={nodeHealthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" domain={[95, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                          labelStyle={{ color: '#e5e7eb' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="uptime" 
                          stroke="#22c55e" 
                          fillOpacity={1} 
                          fill="url(#uptimeGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Loading chart...
                    </div>
                  )}
                </div>

                <div className="bg-amber-950/30 border border-amber-800/30 text-amber-500 p-4 rounded-lg mt-4 text-left">
                  <div className="flex items-center mb-1">
                    <span className="mr-2">⚠️</span>
                    <h4 className="font-medium text-amber-400">Revenue Impact</h4>
                  </div>
                  <p className="text-sm">
                    Your node lost approximately 550 sats in potential routing revenue due to downtime.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Routing Trends</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total routing fees</div>
                    <div className="text-2xl font-bold text-white">23,500 <span className="text-sm font-normal text-muted-foreground">sats</span></div>
                    <div className="text-sm text-green-500 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +12.8%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Volume forwarded</div>
                    <div className="text-2xl font-bold text-white">4.25M <span className="text-sm font-normal text-muted-foreground">sats</span></div>
                    <div className="text-sm text-green-500 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +8.2%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">HTLC success rate</div>
                    <div className="text-2xl font-bold text-green-500">98.7%</div>
                    <div className="text-sm text-green-500 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +0.5%
                    </div>
                  </div>
                </div>

                <div className="h-[180px] w-full">
                  {isHydrated && isValidChartData(routingTrendsData) ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                      <ComposedChart data={routingTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis yAxisId="left" stroke="#666" orientation="left" />
                        <YAxis yAxisId="right" stroke="#666" orientation="right" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                          labelStyle={{ color: '#e5e7eb' }}
                        />
                        <Bar yAxisId="left" dataKey="routing" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Loading chart...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <div className="flex items-center space-x-2">
                  <BarChartIcon className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Peer Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[260px] w-full">
                  {isHydrated && isValidChartData(peerDistributionData) ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                      <PieChart>
                        <Pie
                          data={peerDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {peerDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                          labelStyle={{ color: '#e5e7eb' }}
                          formatter={(value) => [`${value} sats`, 'Revenue']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Loading chart...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <div className="flex items-center space-x-2">
                  <LineChartIcon className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Hourly Forwarding Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[260px] w-full">
                  {isHydrated && isValidChartData(hourlyData) ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                      <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                          dataKey="hour" 
                          stroke="#666" 
                          tickFormatter={(hour) => `${hour}:00`}
                        />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                          labelStyle={{ color: '#e5e7eb' }}
                          labelFormatter={(hour) => `Time: ${hour}:00`}
                          formatter={(value) => [`${value} forwards`, 'Count']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="forwards" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#hourlyGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Loading chart...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl shadow-md overflow-hidden mb-6">
            <CardHeader className="bg-card border-b border-border/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Channel Quality Scores</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-gray-700 bg-gray-900 hover:bg-gray-800"
                  onClick={() => setActiveTab("channels")}
                >
                  View all channels
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 font-medium text-muted-foreground">Channel</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Capacity</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Local/Remote</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Fee Rate</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Uptime</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Score</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="p-4 text-white">ACINQ</td>
                      <td className="p-4 text-white">1,000,000</td>
                      <td className="p-4">
                        <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "95%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>95%</span>
                          <span>5%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white">500 ppm</div>
                        <div className="text-xs text-green-500">+1 sat base</div>
                      </td>
                      <td className="p-4 text-white">99.8%</td>
                      <td className="p-4 text-amber-500">72/100</td>
                      <td className="p-4">
                        <div className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs inline-flex items-center">
                          Rebalance
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="p-4 text-white">Bitfinex</td>
                      <td className="p-4 text-white">1,000,000</td>
                      <td className="p-4">
                        <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>20%</span>
                          <span>80%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white">800 ppm</div>
                        <div className="text-xs text-green-500">+1 sat base</div>
                      </td>
                      <td className="p-4 text-white">99.9%</td>
                      <td className="p-4 text-green-500">88/100</td>
                      <td className="p-4">
                        <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs inline-flex items-center">
                          Healthy
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing">
          <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Routing Analytics</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Detailed analytics for your Lightning Network routing income. Optimize your node's performance 
              by analyzing channel metrics, fee settings, and forwarding patterns.
            </p>
          </div>
          
          <LightningNetworkMap />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <CardTitle className="text-lg">Forwarding Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Forwards (30d)</div>
                    <div className="text-2xl font-bold">2,457</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Success Rate</div>
                    <div className="text-2xl font-bold text-green-500">96.3%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Avg. Forward Size</div>
                    <div className="text-2xl font-bold">32,500 <span className="text-sm font-normal text-gray-400">sats</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <CardTitle className="text-lg">Fee Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Fees Earned (30d)</div>
                    <div className="text-2xl font-bold">15,230 <span className="text-sm font-normal text-gray-400">sats</span></div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Avg. Fee Rate</div>
                    <div className="text-2xl font-bold">320 <span className="text-sm font-normal text-gray-400">ppm</span></div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Most Profitable Channel</div>
                    <div className="text-lg font-medium text-blue-400">ACINQ</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-md">
              <CardHeader className="bg-card border-b border-border/20 p-5">
                <CardTitle className="text-lg">Optimization Potential</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Rebalance Opportunities</div>
                    <div className="text-2xl font-bold text-amber-500">4</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Fee Adjustment Suggestions</div>
                    <div className="text-2xl font-bold text-blue-500">6</div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full border-yellow-600 text-yellow-500 hover:bg-yellow-950">
                      View Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels">
          <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Channel Management</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Monitor and optimize your Lightning Network channels. View detailed metrics, set fee policies,
              and manage liquidity to maximize routing revenue.
            </p>
          </div>
          
          {/* Add more detailed channel management content here */}
        </TabsContent>

        <TabsContent value="performance">
          <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Node Performance</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Monitor your node's performance metrics, resource usage, and overall health to ensure 
              optimal operation of your Lightning Network node.
            </p>
          </div>
          
          {/* Add more detailed performance content here */}
        </TabsContent>
      </Tabs>
    </div>
  )
} 