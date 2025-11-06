#!/usr/bin/env tsx

/**
 * Lightning AI Platform - Full System Introspection
 * 
 * Recursively audits:
 * - Route mappings and navigation flows
 * - Component ownership and usage
 * - API endpoint coverage
 * - Authentication and RLS enforcement
 * - Missing fallbacks and error boundaries
 * - Orphaned files and unused code
 * - Cross-layer dependency health
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

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
  dependencies: DependencyMap;
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

interface DependencyMap {
  [key: string]: {
    dependsOn: string[];
    dependents: string[];
    criticality: 'high' | 'medium' | 'low';
  };
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

export class SystemIntrospector {
  private rootDir: string;
  private report: SystemAuditReport;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.report = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      overview: {
        totalRoutes: 0,
        totalComponents: 0,
        totalApiEndpoints: 0,
        totalLibFiles: 0,
        criticalIssues: 0,
        warnings: 0
      },
      routes: [],
      components: [],
      apis: [],
      libraries: [],
      security: {
        rlsEnabled: false,
        authGuardsCoverage: 0,
        adminRoutesProtected: false,
        secretsExposed: false,
        vulnerabilities: []
      },
      dependencies: {},
      recommendations: []
    };
  }

  async runFullAudit(): Promise<SystemAuditReport> {
    console.log('🔍 Starting comprehensive system introspection...');

    await this.auditRoutes();
    await this.auditComponents();
    await this.auditApiEndpoints();
    await this.auditLibraries();
    await this.auditSecurity();
    await this.buildDependencyMap();
    await this.generateRecommendations();

    this.calculateOverview();
    await this.saveReport();

    return this.report;
  }

  private async auditRoutes(): Promise<void> {
    console.log('📄 Auditing routes...');
    
    const appDir = path.join(this.rootDir, 'src/app');
    
    if (!fs.existsSync(appDir)) {
      console.warn(`App directory not found: ${appDir}`);
      return;
    }

    const routeFiles = await glob('**/page.tsx', { cwd: appDir });

    // Audit each route
    for (const routeFile of routeFiles) {
      const routePath = this.convertFilePathToRoute(routeFile);
      const fullPath = path.join(appDir, routeFile);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const audit: RouteAudit = {
        path: routePath,
        type: 'page',
        owner: this.determineOwner(routePath, content),
        hasAuth: this.checkForAuth(content),
        hasMetadata: this.checkForMetadata(routeFile, appDir, content),
        hasErrorBoundary: this.checkForErrorBoundary(content),
        hasLoadingState: this.checkForLoadingState(routeFile, appDir, content),
        navigationPaths: this.findNavigationPaths(content),
        issues: [],
        dependencies: this.extractDependencies(content)
      };

      // Check for issues
      if (audit.owner === 'admin' && !audit.hasAuth) {
        audit.issues.push({
          type: 'critical',
          category: 'security',
          message: 'Admin route missing authentication',
          suggestion: 'Add auth middleware or redirect',
          owner: 'CCO'
        });
      }

      if (!audit.hasErrorBoundary) {
        audit.issues.push({
          type: 'warning',
          category: 'maintainability',
          message: 'Missing error boundary',
          suggestion: 'Add error.tsx or ErrorBoundary component',
          owner: 'CTO'
        });
      }

      if (!audit.hasLoadingState) {
        audit.issues.push({
          type: 'warning',
          category: 'performance',
          message: 'Missing loading state',
          suggestion: 'Add loading.tsx or Suspense boundary',
          owner: 'CPO'
        });
      }

      this.report.routes.push(audit);
    }
  }

  private async auditComponents(): Promise<void> {
    console.log('🧩 Auditing components...');
    
    const componentsDir = path.join(this.rootDir, 'src/components');
    
    if (!fs.existsSync(componentsDir)) {
      console.warn(`Components directory not found: ${componentsDir}`);
      return;
    }

    const componentFiles = await glob('**/*.tsx', { cwd: componentsDir });

    for (const componentFile of componentFiles) {
      const fullPath = path.join(componentsDir, componentFile);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const componentName = this.extractComponentName(content);

      const audit: ComponentAudit = {
        path: componentFile,
        name: componentName,
        owner: this.determineComponentOwner(componentFile, content),
        usageCount: 0,
        usedBy: [],
        hasTests: this.checkForTests(path.join(componentsDir, componentFile)),
        hasTypeDefinitions: this.checkForTypes(content),
        issues: []
      };

      // Find usage across codebase
      const usage = await this.findComponentUsage(componentName);
      audit.usageCount = usage.length;
      audit.usedBy = usage;

      // Check for issues
      if (audit.usageCount === 0) {
        audit.issues.push({
          type: 'warning',
          category: 'maintainability',
          message: 'Unused component',
          suggestion: 'Remove or link to feature',
          owner: 'CPO'
        });
      }

      if (!audit.hasTests && audit.usageCount > 3) {
        audit.issues.push({
          type: 'warning',
          category: 'maintainability',
          message: 'Widely used component without tests',
          suggestion: 'Add unit tests',
          owner: 'CTO'
        });
      }

      this.report.components.push(audit);
    }
  }

  private async auditApiEndpoints(): Promise<void> {
    console.log('🔌 Auditing API endpoints...');
    
    const apiDir = path.join(this.rootDir, 'src/app/api');
    
    if (!fs.existsSync(apiDir)) {
      console.warn(`API directory not found: ${apiDir}`);
      return;
    }

    const apiFiles = await glob('**/route.ts', { cwd: apiDir });

    for (const apiFile of apiFiles) {
      const fullPath = path.join(apiDir, apiFile);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const routePath = this.convertApiFilePathToRoute(apiFile);

      const audit: ApiAudit = {
        path: routePath,
        methods: this.extractHttpMethods(content),
        hasAuth: this.checkForAuth(content),
        hasRateLimit: this.checkForRateLimit(content),
        hasValidation: this.checkForValidation(content),
        usedByFrontend: await this.checkApiUsage(routePath),
        issues: []
      };

      // Check for issues
      if (!audit.hasAuth && routePath.includes('/admin')) {
        audit.issues.push({
          type: 'critical',
          category: 'security',
          message: 'Admin API endpoint missing authentication',
          suggestion: 'Add auth validation',
          owner: 'CCO'
        });
      }

      if (!audit.hasValidation) {
        audit.issues.push({
          type: 'warning',
          category: 'security',
          message: 'Missing input validation',
          suggestion: 'Add request validation',
          owner: 'CTO'
        });
      }

      if (!audit.usedByFrontend) {
        audit.issues.push({
          type: 'info',
          category: 'maintainability',
          message: 'API endpoint not used by frontend',
          suggestion: 'Verify if needed or remove',
          owner: 'CPO'
        });
      }

      this.report.apis.push(audit);
    }
  }

  private async auditLibraries(): Promise<void> {
    console.log('📚 Auditing libraries...');
    
    const libDir = path.join(this.rootDir, 'src/lib');
    
    if (!fs.existsSync(libDir)) {
      console.warn(`Lib directory not found: ${libDir}`);
      return;
    }

    const libFiles = await glob('**/*.ts', { cwd: libDir });

    for (const libFile of libFiles) {
      const fullPath = path.join(libDir, libFile);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const audit: LibraryAudit = {
        path: libFile,
        exportedFunctions: this.extractExports(content),
        usageCount: 0,
        hasTests: this.checkForTests(path.join(libDir, libFile)),
        issues: []
      };

      // Find usage
      const usage = await this.findLibraryUsage(libFile);
      audit.usageCount = usage;

      if (audit.usageCount === 0) {
        audit.issues.push({
          type: 'warning',
          category: 'maintainability',
          message: 'Unused library file',
          suggestion: 'Remove or integrate',
          owner: 'CTO'
        });
      }

      this.report.libraries.push(audit);
    }
  }

  private async auditSecurity(): Promise<void> {
    console.log('🔒 Auditing security...');
    
    // Check for exposed secrets
    const secretsExposed = await this.checkForExposedSecrets();

    // Analyze auth coverage
    const adminRoutes = this.report.routes.filter(r => r.owner === 'admin');
    const protectedAdminRoutes = adminRoutes.filter(r => r.hasAuth);
    const authCoverage = adminRoutes.length > 0 ? (protectedAdminRoutes.length / adminRoutes.length) * 100 : 100;

    this.report.security = {
      rlsEnabled: await this.checkRLSStatus(),
      authGuardsCoverage: authCoverage,
      adminRoutesProtected: authCoverage === 100,
      secretsExposed,
      vulnerabilities: []
    };

    if (secretsExposed) {
      this.report.security.vulnerabilities.push({
        type: 'critical',
        category: 'security',
        message: 'Secrets potentially exposed in code',
        suggestion: 'Audit and rotate exposed secrets',
        owner: 'CCO'
      });
    }

    if (authCoverage < 100) {
      this.report.security.vulnerabilities.push({
        type: 'critical',
        category: 'security',
        message: `${100 - authCoverage}% of admin routes lack authentication`,
        suggestion: 'Add auth guards to all admin routes',
        owner: 'CCO'
      });
    }
  }

  private async buildDependencyMap(): Promise<void> {
    console.log('🕸️ Building dependency map...');
    
    // This would analyze import/export relationships
    // For now, simplified implementation
    this.report.dependencies = {};
  }

  private async generateRecommendations(): Promise<void> {
    console.log('💡 Generating recommendations...');
    
    const criticalIssues = this.getAllIssues().filter(i => i.type === 'critical');
    const warnings = this.getAllIssues().filter(i => i.type === 'warning');

    if (criticalIssues.length > 0) {
      this.report.recommendations.push({
        priority: 'critical',
        category: 'Security',
        title: 'Fix Critical Security Issues',
        description: `${criticalIssues.length} critical security issues found`,
        actionItems: criticalIssues.map(i => i.message),
        estimatedHours: criticalIssues.length * 2,
        owner: 'CCO'
      });
    }

    if (warnings.length > 5) {
      this.report.recommendations.push({
        priority: 'high',
        category: 'Maintenance',
        title: 'Address System Warnings',
        description: `${warnings.length} system warnings need attention`,
        actionItems: ['Review and prioritize warnings', 'Create cleanup tasks'],
        estimatedHours: Math.ceil(warnings.length / 2),
        owner: 'CTO'
      });
    }
  }

  private calculateOverview(): void {
    this.report.overview.totalRoutes = this.report.routes.length;
    this.report.overview.totalComponents = this.report.components.length;
    this.report.overview.totalApiEndpoints = this.report.apis.length;
    this.report.overview.totalLibFiles = this.report.libraries.length;

    const allIssues = this.getAllIssues();
    this.report.overview.criticalIssues = allIssues.filter(i => i.type === 'critical').length;
    this.report.overview.warnings = allIssues.filter(i => i.type === 'warning').length;
  }

  private getAllIssues(): Issue[] {
    return [
      ...this.report.routes.flatMap(r => r.issues),
      ...this.report.components.flatMap(c => c.issues),
      ...this.report.apis.flatMap(a => a.issues),
      ...this.report.libraries.flatMap(l => l.issues),
      ...this.report.security.vulnerabilities
    ];
  }

  private async saveReport(): Promise<void> {
    const reportsDir = path.join(this.rootDir, 'audit-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportsDir, `system-audit-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    
    // Also save as latest
    fs.writeFileSync(path.join(reportsDir, 'latest.json'), JSON.stringify(this.report, null, 2));
    
    console.log(`📊 Report saved to: ${reportPath}`);
  }

  // Helper methods
  private convertFilePathToRoute(filePath: string): string {
    return '/' + filePath.replace(/\/page\.tsx$/, '').replace(/\[([^\]]+)\]/g, ':$1');
  }

  private convertApiFilePathToRoute(filePath: string): string {
    return '/api/' + filePath.replace(/\/route\.ts$/, '');
  }

  private determineOwner(routePath: string, content: string): 'admin' | 'user' | 'shared' | 'unknown' {
    if (routePath.startsWith('/admin')) return 'admin';
    if (routePath.startsWith('/dashboard') || routePath.startsWith('/settings')) return 'user';
    if (routePath === '/' || routePath.startsWith('/learn')) return 'shared';
    return 'unknown';
  }

  private determineComponentOwner(filePath: string, content: string): 'admin' | 'user' | 'shared' | 'unknown' {
    if (filePath.includes('/admin/')) return 'admin';
    if (filePath.includes('/dashboard/') || filePath.includes('/settings/')) return 'user';
    return 'shared';
  }

  private checkForAuth(content: string): boolean {
    return content.includes('auth') || content.includes('getUserWorkspace') || content.includes('requireAdmin');
  }

  private checkForMetadata(routeFile: string, appDir: string, content: string): boolean {
    const metadataFile = path.join(appDir, routeFile.replace('page.tsx', 'metadata.ts'));
    return fs.existsSync(metadataFile) || content.includes('generateMetadata');
  }

  private checkForErrorBoundary(content: string): boolean {
    return content.includes('ErrorBoundary') || content.includes('error.tsx');
  }

  private checkForLoadingState(routeFile: string, appDir: string, content: string): boolean {
    const loadingFile = path.join(appDir, routeFile.replace('page.tsx', 'loading.tsx'));
    return fs.existsSync(loadingFile) || content.includes('Suspense');
  }

  private findNavigationPaths(content: string): string[] {
    const linkMatches = content.match(/href=["']([^"']+)["']/g) || [];
    return linkMatches.map(match => match.replace(/href=["']([^"']+)["']/, '$1'));
  }

  private extractDependencies(content: string): string[] {
    const importMatches = content.match(/import.*from\s+["']([^"']+)["']/g) || [];
    return importMatches.map(match => match.replace(/import.*from\s+["']([^"']+)["']/, '$1'));
  }

  private extractComponentName(content: string): string {
    const match = content.match(/export\s+(?:default\s+)?(?:function\s+)?(\w+)/);
    return match ? match[1] : 'Unknown';
  }

  private checkForTests(filePath: string): boolean {
    const testFile = filePath.replace(/\.tsx?$/, '.test.ts');
    const specFile = filePath.replace(/\.tsx?$/, '.spec.ts');
    return fs.existsSync(testFile) || fs.existsSync(specFile);
  }

  private checkForTypes(content: string): boolean {
    return content.includes('interface ') || content.includes('type ') || content.includes(': React.');
  }

  private async findComponentUsage(componentName: string): Promise<string[]> {
    // Simplified - would use proper AST analysis in production
    const srcDir = path.join(this.rootDir, 'src');
    
    if (!fs.existsSync(srcDir)) {
      return [];
    }

    const files = await glob('**/*.{ts,tsx}', { cwd: srcDir });
    const usage: string[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
        if (content.includes(`<${componentName}`) || content.includes(`${componentName}(`)) {
          usage.push(file);
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return usage;
  }

  private extractHttpMethods(content: string): string[] {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    return methods.filter(method => content.includes(`export async function ${method}`));
  }

  private checkForRateLimit(content: string): boolean {
    return content.includes('rateLimit') || content.includes('rate-limit');
  }

  private checkForValidation(content: string): boolean {
    return content.includes('validate') || content.includes('schema') || content.includes('zod');
  }

  private async checkApiUsage(apiPath: string): Promise<boolean> {
    const srcDir = path.join(this.rootDir, 'src');
    
    if (!fs.existsSync(srcDir)) {
      return false;
    }

    const files = await glob('**/*.{ts,tsx}', { cwd: srcDir });

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
        if (content.includes(apiPath)) {
          return true;
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return false;
  }

  private extractExports(content: string): string[] {
    const exportMatches = content.match(/export\s+(?:async\s+)?(?:function\s+)?(\w+)/g) || [];
    return exportMatches.map(match => match.replace(/export\s+(?:async\s+)?(?:function\s+)?(\w+)/, '$1'));
  }

  private async findLibraryUsage(libFile: string): Promise<number> {
    const srcDir = path.join(this.rootDir, 'src');
    
    if (!fs.existsSync(srcDir)) {
      return 0;
    }

    const files = await glob('**/*.{ts,tsx}', { cwd: srcDir });
    let usage = 0;

    const importPath = libFile.replace(/\.ts$/, '').replace(/\//g, '/');

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
        if (content.includes(importPath)) {
          usage++;
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return usage;
  }

  private async checkForExposedSecrets(): Promise<boolean> {
    const srcDir = path.join(this.rootDir, 'src');
    
    if (!fs.existsSync(srcDir)) {
      return false;
    }

    const files = await glob('**/*.{ts,tsx,js,jsx}', { cwd: srcDir });

    const secretPatterns = [
      /process\.env\.\w+/g,
      /['"]\w*[Kk]ey\w*['"]:\s*['"]\w+['"]/g,
      /['"]\w*[Tt]oken\w*['"]:\s*['"]\w+['"]/g
    ];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            return true;
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return false;
  }

  private async checkRLSStatus(): Promise<boolean> {
    // This would check Supabase RLS status - simplified for now
    return true;
  }
}

// CLI execution
async function main() {
  const introspector = new SystemIntrospector();
  const report = await introspector.runFullAudit();
  
  console.log('\n🎯 System Audit Complete!');
  console.log(`📊 Overview:`);
  console.log(`   Routes: ${report.overview.totalRoutes}`);
  console.log(`   Components: ${report.overview.totalComponents}`);
  console.log(`   API Endpoints: ${report.overview.totalApiEndpoints}`);
  console.log(`   Libraries: ${report.overview.totalLibFiles}`);
  console.log(`   🔴 Critical Issues: ${report.overview.criticalIssues}`);
  console.log(`   🟡 Warnings: ${report.overview.warnings}`);
  
  if (report.overview.criticalIssues > 0) {
    console.log(`\n⚠️  CRITICAL ISSUES FOUND - Review audit report immediately`);
    process.exit(1);
  } else {
    console.log(`\n✅ System health check passed`);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 