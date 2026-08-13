'use client';
import { apiPath } from '@/lib/base-path';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, Shield, Users, Code, Database, Cpu, Eye, Download } from 'lucide-react';

interface SystemAuditReport {
  timestamp: string;
  version: string;
  overview: {
    totalRoutes: number;
    totalComponents: number;
    totalApiEndpoints: number;
    totalLibFiles: number;
    criticalIssues: number;
    warnings: number;
  };
  routes: RouteAudit[];
  components: ComponentAudit[];
  apis: ApiAudit[];
  libraries: LibraryAudit[];
  security: SecurityAudit;
  recommendations: Recommendation[];
}

interface RouteAudit {
  path: string;
  type: 'page' | 'layout' | 'not-found' | 'loading' | 'error';
  owner: 'admin' | 'user' | 'shared' | 'unknown';
  hasAuth: boolean;
  hasMetadata: boolean;
  hasErrorBoundary: boolean;
  hasLoadingState: boolean;
  navigationPaths: string[];
  issues: Issue[];
  dependencies: string[];
}

interface ComponentAudit {
  path: string;
  name: string;
  owner: 'admin' | 'user' | 'shared' | 'unknown';
  usageCount: number;
  usedBy: string[];
  hasTests: boolean;
  hasTypeDefinitions: boolean;
  issues: Issue[];
}

interface ApiAudit {
  path: string;
  methods: string[];
  hasAuth: boolean;
  hasRateLimit: boolean;
  hasValidation: boolean;
  usedByFrontend: boolean;
  issues: Issue[];
}

interface LibraryAudit {
  path: string;
  exportedFunctions: string[];
  usageCount: number;
  hasTests: boolean;
  issues: Issue[];
}

interface SecurityAudit {
  rlsEnabled: boolean;
  authGuardsCoverage: number;
  adminRoutesProtected: boolean;
  secretsExposed: boolean;
  vulnerabilities: Issue[];
}

interface Issue {
  type: 'critical' | 'warning' | 'info';
  category: 'security' | 'performance' | 'maintainability' | 'accessibility' | 'structure';
  message: string;
  suggestion?: string;
  owner?: string;
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  estimatedHours: number;
  owner: string;
}

const CSuiteRoles = {
  CTO: { name: 'Chief Technology Officer', color: 'blue', icon: Cpu },
  CPO: { name: 'Chief Product Officer', color: 'green', icon: Users },
  CRO: { name: 'Chief Reality Officer', color: 'purple', icon: Eye },
  CMO: { name: 'Chief Marketing Officer', color: 'pink', icon: Code },
  CFO: { name: 'Chief Financial Officer', color: 'yellow', icon: Database },
  CNO: { name: 'Chief Node Officer', color: 'orange', icon: Shield },
  CCO: { name: 'Chief Compliance Officer', color: 'red', icon: Shield },
  CIO: { name: 'Chief Intelligence Officer', color: 'indigo', icon: Code }
};

export function SystemMapDashboard() {
  const [auditReport, setAuditReport] = useState<SystemAuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [issueFilter, setIssueFilter] = useState<string>('all');

  useEffect(() => {
    loadAuditReport();
  }, []);

  async function loadAuditReport() {
    try {
      setLoading(true);
      
      // Try to load existing report first
      const response = await fetch('/audit-reports/latest.json');
      if (response.ok) {
        const report = await response.json();
        setAuditReport(report);
      } else {
        // Generate new report
        await generateNewReport();
      }
    } catch (error) {
      console.error('Failed to load audit report:', error);
      // Generate new report as fallback
      await generateNewReport();
    } finally {
      setLoading(false);
    }
  }

  async function generateNewReport() {
    try {
      const response = await fetch(apiPath('/api/admin/system-audit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const report = await response.json();
        setAuditReport(report);
      }
    } catch (error) {
      console.error('Failed to generate audit report:', error);
    }
  }

  async function exportReport() {
    if (!auditReport) return;
    
    const dataStr = JSON.stringify(auditReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!auditReport) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Audit Report Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate a new system audit to view the dashboard.
        </p>
        <Button onClick={generateNewReport}>
          Generate System Audit
        </Button>
      </div>
    );
  }

  const filteredRoutes = auditReport.routes.filter(route => {
    if (ownerFilter !== 'all' && route.owner !== ownerFilter) return false;
    if (issueFilter === 'critical' && !route.issues.some(i => i.type === 'critical')) return false;
    if (issueFilter === 'warning' && !route.issues.some(i => i.type === 'warning')) return false;
    if (issueFilter === 'clean' && route.issues.length > 0) return false;
    return true;
  });

  const filteredComponents = auditReport.components.filter(component => {
    if (ownerFilter !== 'all' && component.owner !== ownerFilter) return false;
    if (issueFilter === 'critical' && !component.issues.some(i => i.type === 'critical')) return false;
    if (issueFilter === 'warning' && !component.issues.some(i => i.type === 'warning')) return false;
    if (issueFilter === 'clean' && component.issues.length > 0) return false;
    return true;
  });

  const getHealthStatus = (issues: Issue[]) => {
    if (issues.some(i => i.type === 'critical')) return { status: 'critical', color: 'red' };
    if (issues.some(i => i.type === 'warning')) return { status: 'warning', color: 'yellow' };
    return { status: 'healthy', color: 'green' };
  };

  const getOwnerBadgeColor = (owner: string) => {
    switch (owner) {
      case 'admin': return 'red';
      case 'user': return 'blue';
      case 'shared': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last updated: {new Date(auditReport.timestamp).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateNewReport}>
            <Clock className="w-4 h-4 mr-2" />
            Refresh Audit
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {auditReport.overview.criticalIssues === 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditReport.overview.criticalIssues === 0 ? 'Healthy' : 'At Risk'}
            </div>
            <p className="text-xs text-muted-foreground">
              {auditReport.overview.criticalIssues} critical issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Coverage</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(auditReport.security.authGuardsCoverage)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Admin routes protected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Components</CardTitle>
            <Code className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditReport.overview.totalRoutes + auditReport.overview.totalComponents}
            </div>
            <p className="text-xs text-muted-foreground">
              {auditReport.overview.totalRoutes} routes, {auditReport.overview.totalComponents} components
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditReport.overview.totalApiEndpoints}
            </div>
            <p className="text-xs text-muted-foreground">
              Active API routes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="user">User Only</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        <Select value={issueFilter} onValueChange={setIssueFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by issues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="critical">Critical Issues</SelectItem>
            <SelectItem value="warning">Warnings</SelectItem>
            <SelectItem value="clean">No Issues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* C-Suite Ownership Map */}
            <Card>
              <CardHeader>
                <CardTitle>C-Suite Ownership</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(CSuiteRoles).map(([role, config]) => {
                    const Icon = config.icon;
                    const issues = auditReport.recommendations.filter(r => r.owner === role);
                    return (
                      <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium">{role}</div>
                            <div className="text-sm text-gray-500">{config.name}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {issues.length > 0 && (
                            <Badge variant="outline" className="text-red-600">
                              {issues.length} actions
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditReport.security.vulnerabilities
                    .filter(v => v.type === 'critical')
                    .slice(0, 5)
                    .map((vulnerability, idx) => (
                      <div key={idx} className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div className="font-medium text-red-800 dark:text-red-200">
                          {vulnerability.message}
                        </div>
                        {vulnerability.suggestion && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            💡 {vulnerability.suggestion}
                          </div>
                        )}
                        {vulnerability.owner && (
                          <Badge variant="outline" className="mt-2">
                            Owner: {vulnerability.owner}
                          </Badge>
                        )}
                      </div>
                    ))}
                  {auditReport.security.vulnerabilities.filter(v => v.type === 'critical').length === 0 && (
                    <div className="text-center py-4 text-green-600">
                      ✅ No critical security issues found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4">
            {filteredRoutes.map((route, idx) => {
              const health = getHealthStatus(route.issues);
              return (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${health.color}-500`}></div>
                        <div>
                          <div className="font-medium">{route.path}</div>
                          <div className="text-sm text-gray-500">
                            {route.type} • {route.dependencies.length} dependencies
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" color={getOwnerBadgeColor(route.owner)}>
                          {route.owner}
                        </Badge>
                        {route.hasAuth && <Badge variant="outline">🔒 Auth</Badge>}
                        {route.hasErrorBoundary && <Badge variant="outline">🛡️ Error Boundary</Badge>}
                      </div>
                    </div>
                    
                    {route.issues.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {route.issues.map((issue, issueIdx) => (
                          <div key={issueIdx} className={`p-2 rounded border-l-4 border-${issue.type === 'critical' ? 'red' : 'yellow'}-400 bg-${issue.type === 'critical' ? 'red' : 'yellow'}-50 dark:bg-${issue.type === 'critical' ? 'red' : 'yellow'}-900/10`}>
                            <div className="text-sm font-medium">{issue.message}</div>
                            {issue.suggestion && (
                              <div className="text-xs text-gray-600 mt-1">💡 {issue.suggestion}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <div className="grid gap-4">
            {filteredComponents.map((component, idx) => {
              const health = getHealthStatus(component.issues);
              return (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${health.color}-500`}></div>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm text-gray-500">
                            {component.path} • Used by {component.usageCount} files
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" color={getOwnerBadgeColor(component.owner)}>
                          {component.owner}
                        </Badge>
                        {component.hasTests && <Badge variant="outline">🧪 Tests</Badge>}
                        {component.hasTypeDefinitions && <Badge variant="outline">📝 Types</Badge>}
                      </div>
                    </div>
                    
                    {component.issues.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {component.issues.map((issue, issueIdx) => (
                          <div key={issueIdx} className={`p-2 rounded border-l-4 border-${issue.type === 'critical' ? 'red' : 'yellow'}-400 bg-${issue.type === 'critical' ? 'red' : 'yellow'}-50 dark:bg-${issue.type === 'critical' ? 'red' : 'yellow'}-900/10`}>
                            <div className="text-sm font-medium">{issue.message}</div>
                            {issue.suggestion && (
                              <div className="text-xs text-gray-600 mt-1">💡 {issue.suggestion}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <div className="grid gap-4">
            {auditReport.apis.map((api, idx) => {
              const health = getHealthStatus(api.issues);
              return (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${health.color}-500`}></div>
                        <div>
                          <div className="font-medium">{api.path}</div>
                          <div className="text-sm text-gray-500">
                            {api.methods.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {api.hasAuth && <Badge variant="outline">🔒 Auth</Badge>}
                        {api.hasRateLimit && <Badge variant="outline">⏱️ Rate Limited</Badge>}
                        {api.hasValidation && <Badge variant="outline">✅ Validated</Badge>}
                        {!api.usedByFrontend && <Badge variant="outline" className="text-yellow-600">Unused</Badge>}
                      </div>
                    </div>
                    
                    {api.issues.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {api.issues.map((issue, issueIdx) => (
                          <div key={issueIdx} className={`p-2 rounded border-l-4 border-${issue.type === 'critical' ? 'red' : 'yellow'}-400 bg-${issue.type === 'critical' ? 'red' : 'yellow'}-50 dark:bg-${issue.type === 'critical' ? 'red' : 'yellow'}-900/10`}>
                            <div className="text-sm font-medium">{issue.message}</div>
                            {issue.suggestion && (
                              <div className="text-xs text-gray-600 mt-1">💡 {issue.suggestion}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>RLS Enabled</span>
                  <Badge variant={auditReport.security.rlsEnabled ? "default" : "destructive"}>
                    {auditReport.security.rlsEnabled ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auth Guard Coverage</span>
                  <Badge variant={auditReport.security.authGuardsCoverage === 100 ? "default" : "destructive"}>
                    {Math.round(auditReport.security.authGuardsCoverage)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Routes Protected</span>
                  <Badge variant={auditReport.security.adminRoutesProtected ? "default" : "destructive"}>
                    {auditReport.security.adminRoutesProtected ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secrets Exposed</span>
                  <Badge variant={auditReport.security.secretsExposed ? "destructive" : "default"}>
                    {auditReport.security.secretsExposed ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditReport.security.vulnerabilities.map((vulnerability, idx) => (
                    <div key={idx} className={`p-3 border rounded-lg ${
                      vulnerability.type === 'critical' 
                        ? 'border-red-200 bg-red-50 dark:bg-red-900/10' 
                        : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10'
                    }`}>
                      <div className={`font-medium ${
                        vulnerability.type === 'critical' 
                          ? 'text-red-800 dark:text-red-200' 
                          : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {vulnerability.message}
                      </div>
                      {vulnerability.suggestion && (
                        <div className={`text-sm mt-1 ${
                          vulnerability.type === 'critical' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          💡 {vulnerability.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                  {auditReport.security.vulnerabilities.length === 0 && (
                    <div className="text-center py-4 text-green-600">
                      ✅ No security vulnerabilities found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {auditReport.recommendations
              .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((rec, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'critical' ? "destructive" : rec.priority === 'high' ? "default" : "secondary"}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                          <span className="text-sm text-gray-500">~{rec.estimatedHours}h</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{rec.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                        <div className="space-y-1">
                          {rec.actionItems.map((item, itemIdx) => (
                            <div key={itemIdx} className="text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Badge variant="outline">
                          Owner: {rec.owner}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 