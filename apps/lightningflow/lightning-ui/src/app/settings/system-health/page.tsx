"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { AlertCircle, AlertTriangle, CheckCircle, RefreshCw, Terminal, Zap } from 'lucide-react'
import { getClientSystemCheckResults, SystemCheckResult, SystemCheckStatus } from '../../../lib/system-check'
import { Skeleton } from '../../../components/ui/skeleton'
import { format, formatDistanceToNow } from 'date-fns'
import { SystemHealthCard } from '../../../components/system-health-card'

export default function SystemHealthPage() {
  const [results, setResults] = useState<SystemCheckResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SystemCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchResults()
  }, [])

  // Fetch history of system checks
  const fetchResults = async () => {
    setLoading(true)
    try {
      const data = await getClientSystemCheckResults(10)
      setResults(data)
      if (data.length > 0) {
        setSelectedResult(data[0])
      }
    } catch (error) {
      console.error('Error fetching system check results:', error)
    } finally {
      setLoading(false)
    }
  }

  // Run a system check on demand
  const runSystemCheck = async () => {
    setRunning(true)
    try {
      const response = await fetch('/api/system-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-system-check-key': localStorage.getItem('system_check_key') || ''
        },
        body: JSON.stringify({ tests: ['node', 'database', 'invoice', 'lnurl', 'webhook'] })
      })

      if (!response.ok) {
        throw new Error(`Error running system check: ${response.statusText}`)
      }

      const result = await response.json()
      // Add to results and select this one
      setResults([result, ...results])
      setSelectedResult(result)
      setActiveTab('details')
    } catch (error: any) {
      console.error('Error running system check:', error)
      alert('Error running system check: ' + error.message)
    } finally {
      setRunning(false)
    }
  }

  // Get status badge for a check result
  const getStatusBadge = (status: SystemCheckStatus) => {
    switch (status) {
      case 'ok':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Healthy</Badge>
      case 'warning':
        return <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3" /> Warning</Badge>
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system health and run diagnostic checks on the payment infrastructure
          </p>
        </div>
        <Button 
          onClick={runSystemCheck} 
          disabled={running}
          className="flex items-center gap-2"
        >
          {running ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run System Check
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* New Comprehensive System Health Card */}
        <SystemHealthCard className="w-full" />

        {/* Existing System Check Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-3 h-min overflow-auto">
            <CardHeader>
              <CardTitle>Legacy Checks</CardTitle>
              <CardDescription>History of manual system checks</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No manual checks found
                </div>
              ) : (
                <ul className="space-y-3">
                  {results.map((result, index) => (
                    <li key={result.timestamp || index} className="flex justify-between items-center">
                      <button
                        onClick={() => {
                          setSelectedResult(result)
                          setActiveTab('details')
                        }}
                        className={`text-sm hover:underline ${
                          selectedResult?.timestamp === result.timestamp 
                            ? 'font-semibold text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {result.timestamp 
                          ? formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })
                          : 'Unknown date'}
                      </button>
                      {getStatusBadge(result.status)}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-9">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Check Details</TabsTrigger>
                <TabsTrigger value="payments">Payment System</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health Overview</CardTitle>
                    <CardDescription>
                      Real-time monitoring and automated health checks for your Lightning AI Business Node
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Lightning Network</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Monitors node sync status, peer connections, and channel health
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Agent Runtime</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tracks AI agent execution, failures, and performance metrics
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">Auto-Healing</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Automatically fixes common issues like stuck jobs and connection problems
                        </p>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>New System Health Monitoring</AlertTitle>
                      <AlertDescription>
                        The system health card above provides real-time monitoring with automatic issue detection and self-healing capabilities. 
                        It runs comprehensive checks every minute and can automatically fix many common problems.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {!selectedResult ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No data available</AlertTitle>
                    <AlertDescription>
                      Run a system check to see detailed results
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>System Status</CardTitle>
                          {getStatusBadge(selectedResult.status)}
                        </div>
                        <CardDescription>
                          Check ran {selectedResult.timestamp 
                            ? format(new Date(selectedResult.timestamp), 'PPpp')
                            : 'Unknown date'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedResult.message && (
                            <Alert variant={selectedResult.status === 'error' ? 'destructive' : 'default'}>
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Message</AlertTitle>
                              <AlertDescription>{selectedResult.message}</AlertDescription>
                            </Alert>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Node Status */}
                            {selectedResult.results.node && (
                              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
                                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">Lightning Node</CardTitle>
                                    {getStatusBadge(selectedResult.results.node.status)}
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                  {selectedResult.results.node.message && (
                                    <p className="text-sm text-muted-foreground mb-3">{selectedResult.results.node.message}</p>
                                  )}
                                  {selectedResult.results.node.info && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div className="flex justify-between">
                                        <span>Node ID:</span>
                                        <span className="font-mono truncate max-w-[200px]">{selectedResult.results.node.info.id || 'Unknown'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Name:</span>
                                        <span>{selectedResult.results.node.info.name || 'Unknown'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Balance:</span>
                                        <span>{selectedResult.results.node.info.balance || 0} sats</span>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {/* Database Status */}
                            {selectedResult.results.database && (
                              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
                                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">Database</CardTitle>
                                    {getStatusBadge(selectedResult.results.database.status)}
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                  {selectedResult.results.database.message && (
                                    <p className="text-sm text-muted-foreground mb-3">{selectedResult.results.database.message}</p>
                                  )}
                                  {selectedResult.results.database.details?.tables && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      {Object.entries(selectedResult.results.database.details.tables).map(([table, count]) => (
                                        <div key={table} className="flex justify-between">
                                          <span>{table}:</span>
                                          <span>{String(count)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                {!selectedResult ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No data available</AlertTitle>
                    <AlertDescription>
                      Run a system check to see payment system results
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment System Check</CardTitle>
                      <CardDescription>
                        Diagnostics for the Lightning payment infrastructure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Invoice Creation */}
                        {selectedResult.results.invoice && (
                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
                            <CardHeader className="bg-gray-50 dark:bg-gray-900/50 p-4">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Invoice Creation</CardTitle>
                                {getStatusBadge(selectedResult.results.invoice.status)}
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              {selectedResult.results.invoice.message && (
                                <p className="text-sm text-muted-foreground mb-3">{selectedResult.results.invoice.message}</p>
                              )}
                              {selectedResult.results.invoice.details?.invoice_id && (
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div className="flex justify-between">
                                    <span>Invoice ID:</span>
                                    <span className="font-mono">{selectedResult.results.invoice.details.invoice_id}</span>
                                  </div>
                                  {selectedResult.results.invoice.details?.payment_hash && (
                                    <div className="flex justify-between">
                                      <span>Payment Hash:</span>
                                      <span className="font-mono truncate max-w-[200px]">{selectedResult.results.invoice.details.payment_hash}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* LNURL-Pay Flow */}
                        {selectedResult.results.lnurl && (
                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
                            <CardHeader className="bg-gray-50 dark:bg-gray-900/50 p-4">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">LNURL-Pay Flow</CardTitle>
                                {getStatusBadge(selectedResult.results.lnurl.status)}
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              {selectedResult.results.lnurl.message && (
                                <p className="text-sm text-muted-foreground mb-3">{selectedResult.results.lnurl.message}</p>
                              )}
                              {selectedResult.results.lnurl.details?.payment_request && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Payment Request:</span>
                                    <span className="font-mono truncate max-w-[200px]">{String(selectedResult.results.lnurl.details.payment_request).substring(0, 20)}...</span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Webhook Processing */}
                        {selectedResult.results.webhook && (
                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
                            <CardHeader className="bg-gray-50 dark:bg-gray-900/50 p-4">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Webhook Processing</CardTitle>
                                {getStatusBadge(selectedResult.results.webhook.status)}
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              {selectedResult.results.webhook.message && (
                                <p className="text-sm text-muted-foreground mb-3">{selectedResult.results.webhook.message}</p>
                              )}
                              {selectedResult.results.webhook.details?.invoice_status && (
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div className="flex justify-between">
                                    <span>Invoice Status:</span>
                                    <span>{String(selectedResult.results.webhook.details.invoice_status)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Payment Status:</span>
                                    <span>{String(selectedResult.results.webhook.details.payment_status)}</span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>System Check History</CardTitle>
                    <CardDescription>Recent system health check results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : results.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Terminal className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No system checks have been run yet</p>
                        <Button onClick={runSystemCheck} variant="outline" className="mt-4">Run First Check</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.map((result, index) => (
                          <Card key={result.timestamp || index} className="overflow-hidden">
                            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                              <div>
                                <CardTitle className="text-base">
                                  {result.timestamp ? format(new Date(result.timestamp), 'PPpp') : 'Unknown date'}
                                </CardTitle>
                                <CardDescription>
                                  {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                                </CardDescription>
                              </div>
                              {getStatusBadge(result.status)}
                            </CardHeader>
                            <CardContent className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-sm flex justify-between">
                              <div className="flex gap-x-6">
                                {result.results.node && (
                                  <div className="flex items-center gap-1">
                                    <span>Node:</span>
                                    {getStatusBadge(result.results.node.status)}
                                  </div>
                                )}
                                {result.results.database && (
                                  <div className="flex items-center gap-1">
                                    <span>DB:</span>
                                    {getStatusBadge(result.results.database.status)}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-x-6">
                                {result.results.invoice && (
                                  <div className="flex items-center gap-1">
                                    <span>Invoice:</span>
                                    {getStatusBadge(result.results.invoice.status)}
                                  </div>
                                )}
                                {result.results.webhook && (
                                  <div className="flex items-center gap-1">
                                    <span>Webhook:</span>
                                    {getStatusBadge(result.results.webhook.status)}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="py-2 px-4 bg-gray-100 dark:bg-gray-900/80 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedResult(result)
                                  setActiveTab('details')
                                }}
                              >
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 