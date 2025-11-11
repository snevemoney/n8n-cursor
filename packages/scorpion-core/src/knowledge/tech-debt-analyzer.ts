/**
 * Tech Debt & Missing Features Analyzer
 * Automatically analyzes codebase to detect tech debt and missing features
 * from code patterns, comments, and incomplete implementations
 */

import { ExtractedKnowledge } from './types';
import { getASTParser } from '../code/ast-parser';
import { getFileCache } from '../code/file-cache';
import fs from 'fs/promises';
import path from 'path';

interface CodeIssue {
  type: 'tech-debt' | 'missing-feature';
  priority: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  context: string;
}

export class TechDebtAnalyzer {
  private workspaceRoot: string;
  private astParser: ReturnType<typeof getASTParser>;
  private fileCache: ReturnType<typeof getFileCache>;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.astParser = getASTParser(workspaceRoot);
    this.fileCache = getFileCache();
  }

  /**
   * Analyze codebase for tech debt and missing features
   */
  async analyzeCodebase(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];
    const issues: CodeIssue[] = [];

    console.log('🔍 Analyzing codebase for tech debt and missing features...');

    // Scan apps and packages
    const appsDir = path.join(this.workspaceRoot, 'apps');
    const packagesDir = path.join(this.workspaceRoot, 'packages');

    console.log(`   Scanning apps directory: ${appsDir}`);
    await this.scanDirectory(appsDir, 'app', issues);
    console.log(`   Scanning packages directory: ${packagesDir}`);
    await this.scanDirectory(packagesDir, 'package', issues);
    console.log(`   Total issues found so far: ${issues.length}`);

    // Convert issues to individual knowledge items (one per issue for accurate counting)
    const techDebtIssues = issues.filter(i => i.type === 'tech-debt');
    const missingFeatureIssues = issues.filter(i => i.type === 'missing-feature');

    // Create individual knowledge items for each tech debt issue
    techDebtIssues.forEach((issue, index) => {
      knowledge.push(this.createTechDebtKnowledgeItem(issue, index));
    });

    // Create individual knowledge items for each missing feature issue
    missingFeatureIssues.forEach((issue, index) => {
      knowledge.push(this.createMissingFeatureKnowledgeItem(issue, index));
    });

    console.log(`✅ Found ${techDebtIssues.length} tech debt items and ${missingFeatureIssues.length} missing features`);
    
    // Log breakdown by priority for debugging
    if (techDebtIssues.length > 0) {
      const tdByPriority = this.groupByPriority(techDebtIssues);
      console.log(`   Tech Debt: Critical=${tdByPriority.critical.length}, High=${tdByPriority.high.length}, Medium=${tdByPriority.medium.length}, Low=${tdByPriority.low.length}`);
    }
    if (missingFeatureIssues.length > 0) {
      const mfByPriority = this.groupByPriority(missingFeatureIssues);
      console.log(`   Missing Features: P0=${mfByPriority.critical.length}, P1=${mfByPriority.high.length}, P2=${mfByPriority.medium.length}`);
    }

    return knowledge;
  }

  /**
   * Scan directory for code issues
   */
  private async scanDirectory(
    dir: string,
    type: 'app' | 'package',
    issues: CodeIssue[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const itemPath = path.join(dir, entry.name);
        if (this.shouldSkipDirectory(entry.name)) continue;

        const codeFiles = await this.findCodeFiles(itemPath);
        for (const filePath of codeFiles) {
          await this.analyzeFile(filePath, issues);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  /**
   * Analyze a single file for issues
   */
  private async analyzeFile(filePath: string, issues: CodeIssue[]): Promise<void> {
    try {
      const fileContent = await this.fileCache.get(filePath);
      if (!fileContent) return;

      const content = fileContent.content;
      const relativePath = path.relative(this.workspaceRoot, filePath);
      const lines = content.split('\n');
      const issuesBefore = issues.length;

      // Parse AST for structure analysis
      const ast = await this.astParser.parseFile(filePath);

      // 1. Scan for TODO/FIXME/BUG/HACK comments
      this.scanComments(lines, relativePath, issues);

      // 2. Detect incomplete implementations
      this.detectIncompleteImplementations(content, lines, relativePath, ast, issues);

      // 3. Detect code quality issues (tech debt patterns)
      this.detectCodeQualityIssues(content, lines, relativePath, ast, issues);

      // 4. Detect missing features (stub functions, unimplemented exports)
      this.detectMissingFeatures(content, lines, relativePath, ast, issues);

      // Debug: log if issues found in this file
      if (issues.length > issuesBefore) {
        console.log(`   Found ${issues.length - issuesBefore} issues in ${relativePath}`);
      }
    } catch (error) {
      // Log errors for debugging (but don't fail entire analysis)
      console.warn(`   Warning: Failed to analyze ${filePath}:`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Scan comments for TODO/FIXME/BUG/HACK markers
   */
  private scanComments(
    lines: string[],
    filePath: string,
    issues: CodeIssue[]
  ): void {
    const commentPatterns = [
      { pattern: /\/\/\s*(TODO|FIXME|BUG|HACK|XXX)\s*:?\s*(.+)/i, type: 'tech-debt' as const },
      { pattern: /\/\*\s*(TODO|FIXME|BUG|HACK|XXX)\s*:?\s*(.+?)\*\//i, type: 'tech-debt' as const },
      { pattern: /\/\/\s*@todo\s*:?\s*(.+)/i, type: 'tech-debt' as const },
      { pattern: /\/\/\s*@fixme\s*:?\s*(.+)/i, type: 'tech-debt' as const },
      { pattern: /\/\/\s*NOT\s+IMPLEMENTED/i, type: 'missing-feature' as const },
      { pattern: /\/\/\s*MISSING\s*:?\s*(.+)/i, type: 'missing-feature' as const },
      { pattern: /\/\/\s*TODO\s*:?\s*IMPLEMENT\s+(.+)/i, type: 'missing-feature' as const },
    ];

    lines.forEach((line, index) => {
      for (const { pattern, type } of commentPatterns) {
        const match = line.match(pattern);
        if (match) {
          const message = match[2] || match[1] || 'Unspecified issue';
          const priority = this.determinePriorityFromComment(message, type);
          
          issues.push({
            type,
            priority,
            file: filePath,
            line: index + 1,
            message: message.trim(),
            context: this.getContext(lines, index, 3)
          });
        }
      }
    });
  }

  /**
   * Detect incomplete implementations
   */
  private detectIncompleteImplementations(
    content: string,
    lines: string[],
    filePath: string,
    ast: any,
    issues: CodeIssue[]
  ): void {
    // Pattern: throw new Error("Not implemented")
    const notImplementedPattern = /throw\s+new\s+Error\(["'](?:not\s+implemented|not\s+yet\s+implemented|unimplemented|TODO|FIXME)/i;
    if (notImplementedPattern.test(content)) {
      const matches = [...content.matchAll(new RegExp(notImplementedPattern.source, 'gi'))];
      matches.forEach(match => {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          type: 'missing-feature',
          priority: 'high',
          file: filePath,
          line: lineNum,
          message: 'Function throws "Not implemented" error',
          context: this.getContext(lines, lineNum - 1, 5)
        });
      });
    }

    // Pattern: Function with only return statement or empty body
    if (ast && ast.functions) {
      ast.functions.forEach((func: any) => {
        const funcLine = func.line || 0;
        const funcContent = lines.slice(funcLine - 1, funcLine + 10).join('\n');
        
        // Empty function body or just return
        if (funcContent.match(/\{\s*\}/) || funcContent.match(/\{\s*return\s*;\s*\}/)) {
          issues.push({
            type: 'missing-feature',
            priority: 'medium',
            file: filePath,
            line: funcLine,
            message: `Function "${func.name}" has empty or minimal implementation`,
            context: this.getContext(lines, funcLine - 1, 5)
          });
        }
      });
    }
  }

  /**
   * Detect code quality issues (tech debt)
   */
  private detectCodeQualityIssues(
    content: string,
    lines: string[],
    filePath: string,
    ast: any,
    issues: CodeIssue[]
  ): void {
    // Large files (>1000 lines)
    if (lines.length > 1000) {
      issues.push({
        type: 'tech-debt',
        priority: 'medium',
        file: filePath,
        message: `Large file (${lines.length} lines) - consider splitting`,
        context: `File has ${lines.length} lines`
      });
    }

    // Deeply nested code (more than 4 levels)
    const maxNesting = this.detectMaxNesting(content);
    if (maxNesting > 4) {
      issues.push({
        type: 'tech-debt',
        priority: 'medium',
        file: filePath,
        message: `Deeply nested code (${maxNesting} levels) - consider refactoring`,
        context: `Maximum nesting level: ${maxNesting}`
      });
    }

    // Deprecated patterns
    const deprecatedPatterns = [
      { pattern: /\.bind\(this\)/g, message: 'Uses .bind(this) - consider arrow functions', priority: 'low' as const },
      { pattern: /var\s+\w+/g, message: 'Uses var instead of const/let', priority: 'low' as const },
      { pattern: /eval\(/gi, message: 'Uses eval() - security risk', priority: 'critical' as const },
      { pattern: /innerHTML\s*=/gi, message: 'Uses innerHTML - potential XSS risk', priority: 'high' as const },
    ];

    deprecatedPatterns.forEach(({ pattern, message, priority }) => {
      if (pattern.test(content)) {
        const lineNum = content.split('\n').findIndex(line => pattern.test(line)) + 1;
        issues.push({
          type: 'tech-debt',
          priority,
          file: filePath,
          line: lineNum > 0 ? lineNum : undefined,
          message,
          context: this.getContext(lines, lineNum - 1, 3)
        });
      }
    });

    // Console.log statements (should use proper logging)
    const consoleLogCount = (content.match(/console\.(log|debug|info|warn|error)\(/g) || []).length;
    if (consoleLogCount > 10) {
      issues.push({
        type: 'tech-debt',
        priority: 'low',
        file: filePath,
        message: `Multiple console.log statements (${consoleLogCount}) - use proper logging`,
        context: `Found ${consoleLogCount} console.* calls`
      });
    }
  }

  /**
   * Detect missing features
   */
  private detectMissingFeatures(
    content: string,
    lines: string[],
    filePath: string,
    ast: any,
    issues: CodeIssue[]
  ): void {
    // Stub functions (functions that just return null/undefined/empty)
    if (ast && ast.functions) {
      ast.functions.forEach((func: any) => {
        const funcLine = func.line || 0;
        const funcContent = lines.slice(funcLine - 1, Math.min(funcLine + 20, lines.length)).join('\n');
        
        // Function that just returns null/undefined/empty object/array
        if (funcContent.match(/\{\s*return\s+(null|undefined|\[\]|\{\})\s*;\s*\}/)) {
          issues.push({
            type: 'missing-feature',
            priority: 'high',
            file: filePath,
            line: funcLine,
            message: `Function "${func.name}" returns stub value - needs implementation`,
            context: this.getContext(lines, funcLine - 1, 5)
          });
        }
      });
    }

    // Exported functions/classes that are not implemented
    if (ast && ast.exports) {
      ast.exports.forEach((exp: any) => {
        // Check if export has implementation
        const hasImplementation = ast.functions?.some((f: any) => f.name === exp.name) ||
                                  ast.classes?.some((c: any) => c.name === exp.name);
        
        if (!hasImplementation && exp.type === 'function') {
          issues.push({
            type: 'missing-feature',
            priority: 'medium',
            file: filePath,
            message: `Exported function "${exp.name}" may not be implemented`,
            context: `Export found but implementation not detected`
          });
        }
      });
    }
  }

  /**
   * Determine priority from comment message
   */
  private determinePriorityFromComment(
    message: string,
    type: 'tech-debt' | 'missing-feature'
  ): 'critical' | 'high' | 'medium' | 'low' {
    const msg = message.toLowerCase();

    // Critical indicators
    if (msg.match(/\b(critical|urgent|blocking|security|vulnerability|p0|🔴|crash|data loss)\b/)) {
      return 'critical';
    }

    // High priority indicators
    if (msg.match(/\b(high|important|p1|🟡|bug|error|performance|memory leak)\b/)) {
      return 'high';
    }

    // Medium priority indicators
    if (msg.match(/\b(medium|moderate|p2|🟢|enhancement|improvement|refactor)\b/)) {
      return 'medium';
    }

    // Low priority indicators
    if (msg.match(/\b(low|nice to have|p3|cleanup|polish|optimization)\b/)) {
      return 'low';
    }

    // Default based on type
    return type === 'missing-feature' ? 'medium' : 'high';
  }

  /**
   * Detect maximum nesting level
   */
  private detectMaxNesting(content: string): number {
    let maxNesting = 0;
    let currentNesting = 0;

    for (const char of content) {
      if (char === '{' || char === '(' || char === '[') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}' || char === ')' || char === ']') {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }

    return maxNesting;
  }

  /**
   * Get context around a line
   */
  private getContext(lines: string[], lineIndex: number, contextLines: number): string {
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length, lineIndex + contextLines + 1);
    return lines.slice(start, end).join('\n');
  }

  /**
   * Group issues by priority
   */
  private groupByPriority(issues: CodeIssue[]): Record<string, CodeIssue[]> {
    const grouped: Record<string, CodeIssue[]> = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    issues.forEach(issue => {
      grouped[issue.priority].push(issue);
    });

    return grouped;
  }

  /**
   * Create individual tech debt knowledge item
   */
  private createTechDebtKnowledgeItem(issue: CodeIssue, index: number): ExtractedKnowledge {
    const fileName = path.basename(issue.file);
    const fileHash = issue.file.replace(/\//g, '-').replace(/\./g, '_').substring(0, 50);
    const lineSuffix = issue.line ? `-line${issue.line}` : `-${index}`;
    
    return {
      id: `tech-debt-${fileHash}${lineSuffix}-${index}`,
      source: 'code-analysis',
      type: 'best-practice',
      category: 'tech-debt',
      title: `Tech Debt: ${fileName}${issue.line ? ` (line ${issue.line})` : ''}`,
      description: `${issue.message} - ${issue.priority} priority`,
      codeSnippets: [{
        file: issue.file,
        language: path.extname(issue.file).slice(1) || 'text',
        code: issue.context || issue.message,
        explanation: issue.line ? `Line ${issue.line}: ${issue.message}` : issue.message
      }],
      patterns: [
        `Priority: ${issue.priority}`,
        `File: ${fileName}`,
        'Tech debt'
      ],
      dependencies: [],
      useCases: [
        'Tech debt management',
        'Code quality improvement',
        'Refactoring planning'
      ],
      tags: [
        'tech-debt',
        issue.priority,
        'auto-detected',
        'code-analysis',
        fileName.replace(/\.[^/.]+$/, '') // filename without extension
      ],
      extractedAt: new Date().toISOString(),
      filePath: issue.file
    };
  }

  /**
   * Create individual missing feature knowledge item
   */
  private createMissingFeatureKnowledgeItem(issue: CodeIssue, index: number): ExtractedKnowledge {
    const fileName = path.basename(issue.file);
    const fileHash = issue.file.replace(/\//g, '-').replace(/\./g, '_').substring(0, 50);
    const lineSuffix = issue.line ? `-line${issue.line}` : `-${index}`;
    const pTag = issue.priority === 'critical' ? 'p0' : 
                 issue.priority === 'high' ? 'p1' : 
                 issue.priority === 'medium' ? 'p2' : 'p3';
    
    return {
      id: `missing-feature-${fileHash}${lineSuffix}-${index}`,
      source: 'code-analysis',
      type: 'feature',
      category: 'missing-features',
      title: `Missing Feature: ${fileName}${issue.line ? ` (line ${issue.line})` : ''}`,
      description: `${issue.message} - ${issue.priority} priority`,
      codeSnippets: [{
        file: issue.file,
        language: path.extname(issue.file).slice(1) || 'text',
        code: issue.context || issue.message,
        explanation: issue.line ? `Line ${issue.line}: ${issue.message}` : issue.message
      }],
      patterns: [
        `Priority: ${pTag.toUpperCase()}`,
        `File: ${fileName}`,
        'Missing feature'
      ],
      dependencies: [],
      useCases: [
        'Feature planning',
        'Development roadmap',
        'Implementation tracking'
      ],
      tags: [
        'missing-features',
        pTag,
        issue.priority,
        'auto-detected',
        'code-analysis',
        fileName.replace(/\.[^/.]+$/, '') // filename without extension
      ],
      extractedAt: new Date().toISOString(),
      filePath: issue.file
    };
  }

  /**
   * Find code files in directory (recursive)
   */
  private async findCodeFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];

    try {
      await this.findCodeFilesRecursive(dir, files, extensions);
    } catch (error) {
      // Directory might not exist or be inaccessible
    }

    return files;
  }

  /**
   * Recursively find code files
   */
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

  /**
   * Check if directory should be skipped
   */
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

  /**
   * Check if file is a test file
   */
  private isTestFile(filePath: string): boolean {
    return /\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(filePath) ||
           /__tests__/.test(filePath) ||
           /\.test\//.test(filePath);
  }
}

