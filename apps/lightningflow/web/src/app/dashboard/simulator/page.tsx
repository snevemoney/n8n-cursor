'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VectorSearch from '@/components/vector/vector-search';
import { 
  Zap, 
  AlertTriangle, 
  Search, 
  BookOpen, 
  Play, 
  Settings, 
  TrendingUp,
  Network,
  DollarSign,
  Users
} from 'lucide-react';

interface SimulationError {
  type: 'channel_liquidity' | 'routing_failure' | 'fee_insufficient' | 'peer_offline';
  message: string;
  details: any;
  timestamp: Date;
}

export default function SimulatorPage() {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationErrors, setSimulationErrors] = useState<SimulationError[]>([]);
  const [searchContext, setSearchContext] = useState<any>(null);

  // Simulate different Lightning scenarios
  const scenarios = [
    {
      id: 'channel_open',
      title: 'Open Lightning Channel',
      description: 'Simulate opening a channel with a peer',
      category: 'Channel Management',
      difficulty: 'beginner',
      icon: Network,
      estimatedTime: '2-3 minutes',
    },
    {
      id: 'payment_route',
      title: 'Route Payment',
      description: 'Test payment routing through the Lightning Network',
      category: 'Payments',
      difficulty: 'intermediate',
      icon: DollarSign,
      estimatedTime: '1-2 minutes',
    },
    {
      id: 'fee_optimization',
      title: 'Optimize Routing Fees',
      description: 'Experiment with fee settings for better routing income',
      category: 'Fee Management',
      difficulty: 'advanced',
      icon: TrendingUp,
      estimatedTime: '5-10 minutes',
    },
    {
      id: 'liquidity_balance',
      title: 'Balance Channel Liquidity',
      description: 'Practice rebalancing channel liquidity',
      category: 'Liquidity Management',
      difficulty: 'intermediate',
      icon: Zap,
      estimatedTime: '3-5 minutes',
    },
    {
      id: 'peer_management',
      title: 'Manage Node Peers',
      description: 'Connect and manage Lightning node peers',
      category: 'Node Operations',
      difficulty: 'beginner',
      icon: Users,
      estimatedTime: '2-4 minutes',
    },
  ];

  const handleSimulationStart = (scenarioId: string) => {
    setActiveSimulation(scenarioId);
    setSimulationErrors([]);
    
    // Simulate some errors for demonstration
    setTimeout(() => {
      const mockError: SimulationError = {
        type: 'channel_liquidity',
        message: 'Insufficient local balance for payment routing',
        details: {
          requiredAmount: 100000,
          availableAmount: 50000,
          channelId: '753928465982374656',
        },
        timestamp: new Date(),
      };
      
      setSimulationErrors([mockError]);
      setSearchContext({
        errorDetails: mockError,
        userLevel: 'intermediate',
        currentSimulation: scenarioId,
      });
    }, 3000);
  };

  const handleSimulationStop = () => {
    setActiveSimulation(null);
    setSimulationErrors([]);
    setSearchContext(null);
  };

  const handleSearchResultClick = (result: any) => {
    console.log('Search result clicked:', result);
    // Track interaction for analytics
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lightning Network Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Practice Lightning operations in a safe environment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Safe Mode</Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="search">Knowledge Search</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          {/* Active Simulation Alert */}
          {activeSimulation && (
            <Alert>
              <Play className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between w-full">
                <span>
                  Simulation "{scenarios.find(s => s.id === activeSimulation)?.title}" is running...
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSimulationStop}
                >
                  Stop Simulation
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Simulation Errors */}
          {simulationErrors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Simulation Errors Detected
              </h3>
              
              {simulationErrors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">{error.message}</div>
                      <div className="text-xs opacity-75">
                        Type: {error.type} | Time: {error.timestamp.toLocaleTimeString()}
                      </div>
                      {error.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer">Error Details</summary>
                          <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                            {JSON.stringify(error.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}

              {/* Smart Error Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VectorSearch
                    defaultType="error"
                    context={searchContext}
                    placeholder="Search for solutions to this error..."
                    maxResults={5}
                    showTypeToggle={false}
                    onResultClick={handleSearchResultClick}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Simulation Scenarios */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isActive = activeSimulation === scenario.id;
              
              return (
                <Card 
                  key={scenario.id} 
                  className={`transition-all hover:shadow-md ${
                    isActive ? 'border-primary shadow-md' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {scenario.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {scenario.category}
                        </Badge>
                        <Badge 
                          variant={
                            scenario.difficulty === 'beginner' ? 'secondary' :
                            scenario.difficulty === 'intermediate' ? 'default' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Estimated time: {scenario.estimatedTime}
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleSimulationStart(scenario.id)}
                        disabled={isActive}
                        variant={isActive ? 'secondary' : 'default'}
                      >
                        {isActive ? (
                          <>
                            <Play className="h-4 w-4 mr-2 animate-pulse" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Simulation
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Knowledge Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lightning Knowledge Search</CardTitle>
              <p className="text-muted-foreground">
                Search our comprehensive knowledge base for tutorials, solutions, and Lightning Network expertise.
              </p>
            </CardHeader>
            <CardContent>
              <VectorSearch
                defaultType="general"
                placeholder="Ask anything about Lightning Network, channels, fees, routing..."
                maxResults={10}
                showTypeToggle={true}
                onResultClick={handleSearchResultClick}
                context={{
                  currentPage: '/dashboard/simulator',
                  userLevel: 'intermediate'
                }}
              />
            </CardContent>
          </Card>

          {/* Quick Search Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { category: 'Channel Management', icon: Network, queries: ['open channel', 'close channel', 'channel capacity'] },
              { category: 'Fee Optimization', icon: TrendingUp, queries: ['routing fees', 'fee strategy', 'dynamic pricing'] },
              { category: 'Liquidity Management', icon: Zap, queries: ['rebalancing', 'liquidity loops', 'submarine swaps'] },
              { category: 'Troubleshooting', icon: AlertTriangle, queries: ['payment failures', 'routing errors', 'node offline'] },
            ].map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.category} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.queries.map((query, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-7"
                          onClick={() => {
                            // This would trigger a search with the query
                            console.log('Quick search:', query);
                          }}
                        >
                          <Search className="h-3 w-3 mr-2" />
                          {query}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Error Analysis Tab */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis & Solutions</CardTitle>
              <p className="text-muted-foreground">
                Analyze Lightning Network errors and get AI-powered solution recommendations.
              </p>
            </CardHeader>
            <CardContent>
              <VectorSearch
                defaultType="error"
                placeholder="Describe your Lightning error or paste error message..."
                maxResults={6}
                showTypeToggle={false}
                onResultClick={handleSearchResultClick}
                context={{
                  currentPage: '/dashboard/simulator',
                  userLevel: 'intermediate'
                }}
              />
            </CardContent>
          </Card>

          {/* Common Error Patterns */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Payment Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'TEMPORARY_CHANNEL_FAILURE',
                    'INSUFFICIENT_BALANCE',
                    'FEE_INSUFFICIENT',
                    'EXPIRY_TOO_SOON',
                    'CHANNEL_DISABLED',
                  ].map((error, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        // This would search for solutions to this specific error
                        console.log('Search error:', error);
                      }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-2 text-orange-500" />
                      {error}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node Operation Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Peer Connection Failed',
                    'Channel Force Closure',
                    'Routing Table Sync Issues',
                    'Backup Verification Failed',
                    'Watchtower Offline',
                  ].map((issue, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        console.log('Search issue:', issue);
                      }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                      {issue}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 