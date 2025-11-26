/**
 * Intelligent Recommendation Engine
 * Analyzes codebase and generates actionable recommendations for tech debt and missing features
 * Based on code patterns, architecture, best practices, and project context
 */

import { ExtractedKnowledge } from './types';
import { getASTParser } from '../code/ast-parser';
import { getFileCache } from '../code/file-cache';
import fs from 'fs/promises';
import path from 'path';

interface Recommendation {
  type: 'tech-debt' | 'missing-feature';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  rationale: string;
  impact: string;
  file?: string;
  line?: number;
  context?: string;
  relatedFiles?: string[];
}

export class RecommendationEngine {
  private workspaceRoot: string;
  private astParser: ReturnType<typeof getASTParser>;
  private fileCache: ReturnType<typeof getFileCache>;
  private recommendations: Recommendation[] = [];
  private codebaseStats: {
    totalFiles: number;
    totalLines: number;
    hasTests: boolean;
    hasDocs: boolean;
    hasCI: boolean;
    hasMonitoring: boolean;
    hasErrorHandling: boolean;
    hasLogging: boolean;
    hasTypeSafety: boolean;
    hasSecurity: boolean;
    frameworks: string[];
    patterns: string[];
  } = {
    totalFiles: 0,
    totalLines: 0,
    hasTests: false,
    hasDocs: false,
    hasCI: false,
    hasMonitoring: false,
    hasErrorHandling: false,
    hasLogging: false,
    hasTypeSafety: false,
    hasSecurity: false,
    frameworks: [],
    patterns: []
  };

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.astParser = getASTParser(workspaceRoot);
    this.fileCache = getFileCache();
  }

  /**
   * Generate comprehensive recommendations
   */
  async generateRecommendations(): Promise<ExtractedKnowledge[]> {
    console.log('🧠 Generating intelligent recommendations...');
    
    this.recommendations = [];
    console.log('🧠 Recommendations array initialized (empty)');
    
    try {
      // Analyze codebase structure
      console.log('🧠 Analyzing codebase structure...');
      await this.analyzeCodebaseStructure();
      console.log(`🧠 Codebase stats: ${this.codebaseStats.totalFiles} files, hasTests: ${this.codebaseStats.hasTests}, hasDocs: ${this.codebaseStats.hasDocs}`);
      
      // Generate architectural recommendations (ALWAYS generates at least 3)
      console.log('🧠 Generating architectural recommendations...');
      const beforeArch = this.recommendations.length;
      this.generateArchitecturalRecommendations();
      console.log(`🧠 After architectural: ${this.recommendations.length} recommendations (added ${this.recommendations.length - beforeArch})`);
      
      // Generate security recommendations (ALWAYS generates at least 4)
      console.log('🧠 Generating security recommendations...');
      const beforeSec = this.recommendations.length;
      this.generateSecurityRecommendations();
      console.log(`🧠 After security: ${this.recommendations.length} recommendations (added ${this.recommendations.length - beforeSec})`);
      
      // Generate performance recommendations
      console.log('🧠 Generating performance recommendations...');
      this.generatePerformanceRecommendations();
      console.log(`🧠 After performance: ${this.recommendations.length} recommendations`);
      
      // Generate testing recommendations
      console.log('🧠 Generating testing recommendations...');
      this.generateTestingRecommendations();
      console.log(`🧠 After testing: ${this.recommendations.length} recommendations`);
      
      // Generate documentation recommendations
      console.log('🧠 Generating documentation recommendations...');
      this.generateDocumentationRecommendations();
      console.log(`🧠 After documentation: ${this.recommendations.length} recommendations`);
      
      // Generate monitoring recommendations
      console.log('🧠 Generating monitoring recommendations...');
      this.generateMonitoringRecommendations();
      console.log(`🧠 After monitoring: ${this.recommendations.length} recommendations`);
      
      // Generate error handling recommendations
      console.log('🧠 Generating error handling recommendations...');
      this.generateErrorHandlingRecommendations();
      console.log(`🧠 After error handling: ${this.recommendations.length} recommendations`);
      
      // Generate type safety recommendations
      console.log('🧠 Generating type safety recommendations...');
      this.generateTypeSafetyRecommendations();
      console.log(`🧠 After type safety: ${this.recommendations.length} recommendations`);
      
      // Generate missing feature recommendations based on patterns
      console.log('🧠 Generating missing feature recommendations...');
      this.generateMissingFeatureRecommendations();
      console.log(`🧠 After missing features: ${this.recommendations.length} recommendations`);
    } catch (error: any) {
      console.error('❌ Error during recommendation generation:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    
    // Convert recommendations to knowledge items
    console.log(`🧠 Converting ${this.recommendations.length} recommendations to knowledge items...`);
    const knowledge: ExtractedKnowledge[] = [];
    for (let index = 0; index < this.recommendations.length; index++) {
      try {
        const rec = this.recommendations[index];
        const knowledgeItem = this.createKnowledgeFromRecommendation(rec, index);
        knowledge.push(knowledgeItem);
      } catch (error: any) {
        console.error(`❌ Error converting recommendation ${index}:`, error?.message || String(error));
        // Continue with other recommendations
      }
    }
    console.log(`🧠 Converted to ${knowledge.length} knowledge items (from ${this.recommendations.length} recommendations)`);

    console.log(`✅ Generated ${this.recommendations.length} recommendations`);
    console.log(`   Tech Debt: ${this.recommendations.filter(r => r.type === 'tech-debt').length}`);
    console.log(`   Missing Features: ${this.recommendations.filter(r => r.type === 'missing-feature').length}`);

    return knowledge;
  }

  /**
   * Analyze codebase structure
   */
  private async analyzeCodebaseStructure(): Promise<void> {
    try {
      // Check for test files by scanning code files
      const codeFiles = await this.findCodeFiles(this.workspaceRoot);
      const testFiles = codeFiles.filter(f => this.isTestFile(f));
      this.codebaseStats.hasTests = testFiles.length > 0;
      
      // Check for documentation
      this.codebaseStats.hasDocs = await this.hasDirectory('docs') ||
                                    await this.hasFile('README.md');
      
      // Check for CI/CD
      this.codebaseStats.hasCI = await this.hasFile('.github/workflows') ||
                                  await this.hasFile('.gitlab-ci.yml') ||
                                  await this.hasFile('circle.yml');
      
      // Check for monitoring
      this.codebaseStats.hasMonitoring = await this.hasDirectory('monitoring');
      
      // Analyze code patterns
      await this.analyzeCodePatterns();
      
    } catch (error: any) {
      console.warn('⚠️ Error analyzing codebase structure (continuing with defaults):', error?.message || String(error));
      // Continue with default stats - recommendations will still be generated
    }
  }

  /**
   * Analyze code patterns
   */
  private async analyzeCodePatterns(): Promise<void> {
    const codeFiles = await this.findCodeFiles(this.workspaceRoot);
    this.codebaseStats.totalFiles = codeFiles.length;
    
    let totalLines = 0;
    let hasErrorHandling = false;
    let hasLogging = false;
    let hasTypeSafety = false;
    let hasSecurity = false;
    
    for (const file of codeFiles.slice(0, 100)) { // Sample first 100 files
      try {
        const content = await this.fileCache.get(file);
        if (!content) continue;
        
        totalLines += content.content.split('\n').length;
        
        // Check patterns
        if (content.content.includes('try') && content.content.includes('catch')) {
          hasErrorHandling = true;
        }
        if (content.content.includes('console.log') || content.content.includes('logger')) {
          hasLogging = true;
        }
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          hasTypeSafety = true;
        }
        if (content.content.includes('sanitize') || 
            content.content.includes('validate') ||
            content.content.includes('auth') ||
            content.content.includes('security')) {
          hasSecurity = true;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    this.codebaseStats.totalLines = totalLines;
    this.codebaseStats.hasErrorHandling = hasErrorHandling;
    this.codebaseStats.hasLogging = hasLogging;
    this.codebaseStats.hasTypeSafety = hasTypeSafety;
    this.codebaseStats.hasSecurity = hasSecurity;
  }

  /**
   * Generate architectural recommendations
   */
  private generateArchitecturalRecommendations(): void {
    // Always recommend modular architecture for monorepos
    const totalFiles = this.codebaseStats.totalFiles || 0;
    this.recommendations.push({
      type: 'tech-debt',
      priority: totalFiles > 100 ? 'high' : 'medium',
      category: 'architecture',
      title: 'Maintain Modular Architecture',
      description: 'Ensure codebase is split into packages/modules for better maintainability',
      rationale: `Codebase has ${totalFiles} files. Modular architecture improves maintainability, testability, and team collaboration.`,
      impact: 'High - Improves code organization and scalability',
      context: `Current structure: ${totalFiles} files. Consider splitting into focused packages.`
    });

    // Always recommend separation of concerns
    this.recommendations.push({
      type: 'tech-debt',
      priority: 'medium',
      category: 'architecture',
      title: 'Implement Layered Architecture',
      description: 'Separate business logic, data access, and presentation layers',
      rationale: 'Clear separation of concerns makes code more maintainable and testable',
      impact: 'Medium - Improves code organization and testability'
    });

    // API design recommendations
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'high',
      category: 'architecture',
      title: 'Standardize API Response Format',
      description: 'Use consistent response format across all API endpoints',
      rationale: 'Consistent API responses improve developer experience and error handling',
      impact: 'High - Improves API usability and error handling'
    });
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(): void {
    // Always recommend security best practices
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'critical',
      category: 'security',
      title: 'Implement Security Best Practices',
      description: 'Add input validation, authentication, and security headers',
      rationale: 'Security is critical for production applications. Missing security measures expose the application to vulnerabilities.',
      impact: 'Critical - Prevents security vulnerabilities and data breaches',
      context: 'Consider implementing: input validation, authentication/authorization, rate limiting, CORS, security headers, HTTPS enforcement'
    });

    // Always recommend environment variable validation
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'high',
      category: 'security',
      title: 'Add Environment Variable Validation',
      description: 'Validate all environment variables at startup with schema validation',
      rationale: 'Prevents runtime errors from missing or invalid configuration. Use libraries like zod or joi for validation.',
      impact: 'High - Prevents configuration-related failures in production'
    });

    // Always recommend rate limiting
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'high',
      category: 'security',
      title: 'Implement Rate Limiting',
      description: 'Add rate limiting to prevent abuse and DDoS attacks',
      rationale: 'Rate limiting protects APIs from abuse and ensures fair resource usage. Consider per-IP and per-user limits.',
      impact: 'High - Protects against abuse and ensures service availability'
    });

    // Always recommend secrets management
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'critical',
      category: 'security',
      title: 'Implement Secrets Management',
      description: 'Use secure secrets management instead of hardcoded credentials',
      rationale: 'Hardcoded secrets are a major security risk. Use environment variables, secret managers, or vaults.',
      impact: 'Critical - Prevents credential leaks and security breaches'
    });
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(): void {
    const totalFiles = this.codebaseStats.totalFiles || 0;
    if (totalFiles > 50) {
      this.recommendations.push({
        type: 'tech-debt',
        priority: 'medium',
        category: 'performance',
        title: 'Implement Code Splitting',
        description: 'Split large bundles into smaller chunks for faster loading',
        rationale: 'Code splitting improves initial load time and reduces bundle size',
        impact: 'Medium - Improves user experience and performance'
      });
    }

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'performance',
      title: 'Add Caching Strategy',
      description: 'Implement caching for frequently accessed data',
      rationale: 'Caching reduces database load and improves response times',
      impact: 'Medium - Improves performance and reduces server load'
    });

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'low',
      category: 'performance',
      title: 'Implement Database Query Optimization',
      description: 'Add database indexes and optimize slow queries',
      rationale: 'Optimized queries improve application performance and reduce database load',
      impact: 'Low - Improves performance but may require database analysis'
    });
  }

  /**
   * Generate testing recommendations
   */
  private generateTestingRecommendations(): void {
    // Always recommend unit tests (even if some exist, aim for better coverage)
    this.recommendations.push({
      type: 'missing-feature',
      priority: this.codebaseStats.hasTests ? 'medium' : 'high',
      category: 'testing',
      title: this.codebaseStats.hasTests ? 'Improve Test Coverage' : 'Add Unit Tests',
      description: 'Implement unit tests for core business logic. Aim for 80%+ coverage.',
      rationale: 'Unit tests catch bugs early, enable refactoring confidence, and document expected behavior',
      impact: 'High - Improves code quality and prevents regressions'
    });

    // Always recommend integration tests
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'testing',
      title: 'Add Integration Tests',
      description: 'Test component interactions and API endpoints',
      rationale: 'Integration tests verify that components work together correctly. Test API routes, database interactions, and service integrations.',
      impact: 'Medium - Catches integration issues before production'
    });

    // Always recommend E2E tests for critical flows
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'testing',
      title: 'Add E2E Tests for Critical Flows',
      description: 'Implement end-to-end tests for critical user workflows',
      rationale: 'E2E tests verify complete user workflows work as expected. Focus on critical paths like authentication, payments, data submission.',
      impact: 'Medium - Ensures critical user flows work correctly'
    });
  }

  /**
   * Generate documentation recommendations
   */
  private generateDocumentationRecommendations(): void {
    if (!this.codebaseStats.hasDocs) {
      this.recommendations.push({
        type: 'missing-feature',
        priority: 'high',
        category: 'documentation',
        title: 'Add API Documentation',
        description: 'Document all API endpoints with request/response examples',
        rationale: 'API documentation helps developers understand and use the API correctly',
        impact: 'High - Improves developer experience and API adoption'
      });
    }

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'documentation',
      title: 'Add Code Comments and JSDoc',
      description: 'Document complex functions and business logic',
      rationale: 'Well-documented code is easier to maintain and understand',
      impact: 'Medium - Improves code maintainability'
    });

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'low',
      category: 'documentation',
      title: 'Create Architecture Decision Records (ADRs)',
      description: 'Document important architectural decisions',
      rationale: 'ADRs help future developers understand why decisions were made',
      impact: 'Low - Improves long-term project understanding'
    });
  }

  /**
   * Generate monitoring recommendations
   */
  private generateMonitoringRecommendations(): void {
    if (!this.codebaseStats.hasMonitoring) {
      this.recommendations.push({
        type: 'missing-feature',
        priority: 'critical',
        category: 'monitoring',
        title: 'Implement Application Monitoring',
        description: 'Add error tracking, performance monitoring, and health checks',
        rationale: 'Monitoring is essential for production applications to detect issues early',
        impact: 'Critical - Enables proactive issue detection and resolution'
      });
    }

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'high',
      category: 'monitoring',
      title: 'Add Structured Logging',
      description: 'Implement structured logging with log levels and context',
      rationale: 'Structured logs are easier to search, filter, and analyze',
      impact: 'High - Improves debugging and issue investigation'
    });

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'monitoring',
      title: 'Implement Health Check Endpoints',
      description: 'Add /health and /ready endpoints for monitoring',
      rationale: 'Health checks enable load balancers and monitoring systems to verify service status',
      impact: 'Medium - Enables proper service monitoring and load balancing'
    });
  }

  /**
   * Generate error handling recommendations
   */
  private generateErrorHandlingRecommendations(): void {
    if (!this.codebaseStats.hasErrorHandling) {
      this.recommendations.push({
        type: 'tech-debt',
        priority: 'high',
        category: 'error-handling',
        title: 'Implement Comprehensive Error Handling',
        description: 'Add try-catch blocks and error boundaries',
        rationale: 'Proper error handling prevents crashes and improves user experience',
        impact: 'High - Prevents unexpected crashes and improves reliability'
      });
    }

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'high',
      category: 'error-handling',
      title: 'Add Global Error Handler',
      description: 'Implement centralized error handling and reporting',
      rationale: 'Centralized error handling ensures consistent error responses and logging',
      impact: 'High - Improves error consistency and debugging'
    });

    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'error-handling',
      title: 'Implement Error Recovery Strategies',
      description: 'Add retry logic and fallback mechanisms',
      rationale: 'Error recovery improves resilience and user experience',
      impact: 'Medium - Improves application resilience'
    });
  }

  /**
   * Generate type safety recommendations
   */
  private generateTypeSafetyRecommendations(): void {
    if (!this.codebaseStats.hasTypeSafety) {
      this.recommendations.push({
        type: 'tech-debt',
        priority: 'high',
        category: 'type-safety',
        title: 'Migrate to TypeScript',
        description: 'Convert JavaScript files to TypeScript for better type safety',
        rationale: 'TypeScript catches errors at compile time and improves code quality',
        impact: 'High - Reduces runtime errors and improves developer experience'
      });
    } else {
      this.recommendations.push({
        type: 'tech-debt',
        priority: 'low',
        category: 'type-safety',
        title: 'Enable Strict TypeScript Mode',
        description: 'Enable strict mode for better type checking',
        rationale: 'Strict mode catches more potential errors and enforces better practices',
        impact: 'Low - Improves type safety but may require code changes'
      });
    }
  }

  /**
   * Generate missing feature recommendations based on patterns
   */
  private generateMissingFeatureRecommendations(): void {
    // Based on Next.js patterns
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'features',
      title: 'Add Request Validation Middleware',
      description: 'Validate API request bodies and parameters',
      rationale: 'Request validation prevents invalid data from reaching business logic',
      impact: 'Medium - Prevents bugs and improves API reliability'
    });

    // Based on modern web app patterns
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'features',
      title: 'Implement Request/Response Logging',
      description: 'Log all API requests and responses for debugging',
      rationale: 'Request/response logging helps debug issues in production',
      impact: 'Medium - Improves debugging capabilities'
    });

    // Based on database patterns
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'high',
      category: 'features',
      title: 'Add Database Migration System',
      description: 'Implement versioned database migrations',
      rationale: 'Migrations ensure database schema changes are versioned and reversible',
      impact: 'High - Essential for database schema management'
    });

    // Based on API patterns
    this.recommendations.push({
      type: 'missing-feature',
      priority: 'medium',
      category: 'features',
      title: 'Implement API Versioning',
      description: 'Add versioning to API endpoints for backward compatibility',
      rationale: 'API versioning allows changes without breaking existing clients',
      impact: 'Medium - Enables API evolution without breaking changes'
    });
  }

  /**
   * Create knowledge item from recommendation
   */
  private createKnowledgeFromRecommendation(rec: Recommendation, index: number): ExtractedKnowledge {
    const pTag = rec.priority === 'critical' ? 'p0' : 
                 rec.priority === 'high' ? 'p1' : 
                 rec.priority === 'medium' ? 'p2' : 'p3';
    
    return {
      id: `${rec.type}-${rec.category}-${index}-${Date.now()}`,
      source: 'recommendation-engine',
      type: rec.type === 'tech-debt' ? 'best-practice' : 'feature',
      category: rec.type === 'tech-debt' ? 'tech-debt' : 'missing-features',
      title: rec.title,
      description: `${rec.description}\n\nRationale: ${rec.rationale}\nImpact: ${rec.impact}`,
      codeSnippets: rec.context ? [{
        file: rec.file || 'recommendation',
        language: 'markdown',
        code: rec.context,
        explanation: rec.rationale
      }] : [],
      patterns: [
        `Category: ${rec.category}`,
        `Priority: ${rec.priority}`,
        `Impact: ${rec.impact}`
      ],
      dependencies: [],
      useCases: [
        'Code improvement',
        'Best practices',
        'Architecture enhancement'
      ],
      tags: [
        rec.type === 'tech-debt' ? 'tech-debt' : 'missing-features',
        rec.priority,
        rec.type === 'missing-feature' ? pTag : rec.priority,
        rec.category,
        'recommendation',
        'auto-generated'
      ],
      extractedAt: new Date().toISOString(),
      filePath: rec.file
    };
  }

  /**
   * Helper methods
   */
  private async hasDirectory(pattern: string): Promise<boolean> {
    try {
      // Check common directory patterns
      const dirsToCheck = [
        pattern.replace('**/', ''),
        'docs',
        'tests',
        '__tests__',
        'test',
        '.github',
        'monitoring'
      ];
      
      for (const dir of dirsToCheck) {
        try {
          const dirPath = path.join(this.workspaceRoot, dir);
          const stat = await fs.stat(dirPath);
          if (stat.isDirectory()) return true;
        } catch {
          // Continue checking
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private async hasFile(pattern: string): Promise<boolean> {
    try {
      // Check common file patterns
      const filesToCheck = [
        pattern.replace('**/', ''),
        'README.md',
        '.github/workflows',
        '.gitlab-ci.yml',
        'circle.yml'
      ];
      
      for (const file of filesToCheck) {
        try {
          const filePath = path.join(this.workspaceRoot, file);
          const stat = await fs.stat(filePath);
          if (stat.isFile()) return true;
        } catch {
          // Check if it's a directory (like .github/workflows)
          try {
            const dirPath = path.join(this.workspaceRoot, file);
            const stat = await fs.stat(dirPath);
            if (stat.isDirectory()) return true;
          } catch {
            // Continue checking
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private async findCodeFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];

    try {
      await this.findCodeFilesRecursive(dir, files, extensions);
    } catch (error) {
      // Directory might not exist
    }

    return files;
  }

  private async findCodeFilesRecursive(
    dir: string,
    files: string[],
    extensions: string[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.shouldSkipDirectory(entry.name)) {
            await this.findCodeFilesRecursive(fullPath, files, extensions);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext) && !this.isTestFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  private shouldSkipDirectory(name: string): boolean {
    const skipDirs = [
      'node_modules',
      '.next',
      'dist',
      'build',
      '.git',
      'coverage',
      '.cache',
      'test-results'
    ];
    return skipDirs.includes(name);
  }

  private isTestFile(filePath: string): boolean {
    return /\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(filePath) ||
           /__tests__/.test(filePath) ||
           /\.test\//.test(filePath);
  }
}

