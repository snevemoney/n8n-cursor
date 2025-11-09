/**
 * Code Ingester
 * Extracts comprehensive source code knowledge from all apps and packages
 * Provides Cursor-level understanding of the entire codebase
 */

import { ExtractedKnowledge } from './types';
import { getASTParser } from '../code/ast-parser';
import { getFileCache } from '../code/file-cache';
import fs from 'fs/promises';
import path from 'path';

export class CodeIngester {
  private workspaceRoot: string;
  private astParser: ReturnType<typeof getASTParser>;
  private fileCache: ReturnType<typeof getFileCache>;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.astParser = getASTParser(workspaceRoot);
    this.fileCache = getFileCache();
  }

  /**
   * Extract comprehensive code knowledge from all apps and packages
   */
  async extractCodeKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    console.log('💻 Scanning source code files...');

    // Extract from apps
    const appsDir = path.join(this.workspaceRoot, 'apps');
    const appsKnowledge = await this.extractFromDirectory(appsDir, 'app');
    knowledge.push(...appsKnowledge);

    // Extract from packages
    const packagesDir = path.join(this.workspaceRoot, 'packages');
    const packagesKnowledge = await this.extractFromDirectory(packagesDir, 'package');
    knowledge.push(...packagesKnowledge);

    console.log(`✅ Extracted knowledge from ${knowledge.length} code files`);

    return knowledge;
  }

  /**
   * Extract knowledge from a directory (apps or packages)
   */
  private async extractFromDirectory(
    dir: string,
    type: 'app' | 'package'
  ): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const itemPath = path.join(dir, entry.name);
        
        // Skip node_modules, .next, dist, etc.
        if (this.shouldSkipDirectory(entry.name)) {
          continue;
        }

        // Extract code files from this app/package
        const codeFiles = await this.findCodeFiles(itemPath);
        
        for (const filePath of codeFiles) {
          try {
            const fileKnowledge = await this.extractFileKnowledge(filePath, type, entry.name);
            if (fileKnowledge) {
              knowledge.push(fileKnowledge);
            }
          } catch (error) {
            console.warn(`Failed to extract knowledge from ${filePath}:`, error);
          }
        }

        // Also extract README and package.json if they exist
        const readmePath = path.join(itemPath, 'README.md');
        try {
          const readmeExists = await fs.access(readmePath).then(() => true).catch(() => false);
          if (readmeExists) {
            const readmeKnowledge = await this.extractReadmeKnowledge(readmePath, type, entry.name);
            if (readmeKnowledge) {
              knowledge.push(readmeKnowledge);
            }
          }
        } catch (error) {
          // README might not exist, continue
        }

        const packageJsonPath = path.join(itemPath, 'package.json');
        try {
          const packageJsonExists = await fs.access(packageJsonPath).then(() => true).catch(() => false);
          if (packageJsonExists) {
            const packageKnowledge = await this.extractPackageJsonKnowledge(packageJsonPath, type, entry.name);
            if (packageKnowledge) {
              knowledge.push(packageKnowledge);
            }
          }
        } catch (error) {
          // package.json might not exist, continue
        }
      }
    } catch (error) {
      console.error(`Error extracting from ${dir}:`, error);
    }

    return knowledge;
  }

  /**
   * Extract knowledge from a single source code file
   */
  private async extractFileKnowledge(
    filePath: string,
    type: 'app' | 'package',
    itemName: string
  ): Promise<ExtractedKnowledge | null> {
    try {
      const fileContent = await this.fileCache.get(filePath);
      if (!fileContent) return null;

      const relativePath = path.relative(this.workspaceRoot, filePath);
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath);
      const language = ext.slice(1) || 'text';

      // Parse AST to get structure
      const ast = await this.astParser.parseFile(filePath);

      // Determine category based on file path
      const category = this.determineCategory(relativePath);

      // Build description with AST info
      let description = `Source code file: ${fileName}`;
      if (ast) {
        const parts: string[] = [];
        if (ast.functions.length > 0) {
          parts.push(`${ast.functions.length} function${ast.functions.length > 1 ? 's' : ''}`);
        }
        if (ast.classes.length > 0) {
          parts.push(`${ast.classes.length} class${ast.classes.length > 1 ? 'es' : ''}`);
        }
        if (ast.exports.length > 0) {
          parts.push(`${ast.exports.length} export${ast.exports.length > 1 ? 's' : ''}`);
        }
        if (ast.imports.length > 0) {
          parts.push(`${ast.imports.length} import${ast.imports.length > 1 ? 's' : ''}`);
        }
        if (parts.length > 0) {
          description += ` (${parts.join(', ')})`;
        }
      }

      // Extract key functions/exports for patterns
      const patterns: string[] = [];
      if (ast) {
        ast.functions.forEach(f => {
          if (f.isExported) {
            patterns.push(`Exported function: ${f.name}`);
          }
        });
        ast.classes.forEach(c => {
          if (c.isExported) {
            patterns.push(`Exported class: ${c.name}`);
          }
        });
        ast.exports.forEach(e => {
          patterns.push(`Export: ${e.name} (${e.type})`);
        });
      }

      // Extract dependencies
      const dependencies: string[] = [];
      if (ast) {
        ast.imports.forEach(imp => {
          if (!imp.from.startsWith('.') && !imp.from.startsWith('@')) {
            // External dependency
            dependencies.push(imp.from.split('/')[0]);
          }
        });
      }

      // Build tags
      const tags = [
        'source-code',
        type,
        itemName,
        language,
        category,
        fileName.replace(ext, '')
      ];

      // Add function/class names as tags
      if (ast) {
        ast.functions.slice(0, 5).forEach(f => tags.push(f.name));
        ast.classes.slice(0, 3).forEach(c => tags.push(c.name));
      }

      // Limit file content size for RAG (keep first 50KB)
      const maxContentSize = 50000;
      let codeContent = fileContent.content;
      if (codeContent.length > maxContentSize) {
        codeContent = codeContent.substring(0, maxContentSize) + '\n... (truncated)';
      }

      return {
        id: `code-${relativePath.replace(/\//g, '-').replace(/\./g, '_')}`,
        source: type === 'app' ? `apps/${itemName}` : `packages/${itemName}`,
        type: this.determineType(category),
        category,
        title: `${itemName}: ${fileName}`,
        description,
        codeSnippets: [{
          file: relativePath,
          language,
          code: codeContent,
          explanation: ast
            ? `Code file with ${ast.functions.length} functions, ${ast.classes.length} classes, ${ast.imports.length} imports`
            : `Source code file: ${fileName}`
        }],
        patterns,
        dependencies: [...new Set(dependencies)], // Remove duplicates
        useCases: [
          'Code understanding',
          'Function location',
          'Dependency tracking',
          'Refactoring',
          'Code navigation'
        ],
        tags,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error extracting file knowledge from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract knowledge from README file
   */
  private async extractReadmeKnowledge(
    readmePath: string,
    type: 'app' | 'package',
    itemName: string
  ): Promise<ExtractedKnowledge | null> {
    try {
      const content = await fs.readFile(readmePath, 'utf-8');
      const relativePath = path.relative(this.workspaceRoot, readmePath);

      // Extract title from first heading
      const titleMatch = content.match(/^#+\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : `${itemName} README`;

      // Extract key sections
      const sections = this.extractMarkdownSections(content);

      return {
        id: `readme-${type}-${itemName}`,
        source: type === 'app' ? `apps/${itemName}` : `packages/${itemName}`,
        type: 'best-practice',
        category: 'documentation',
        title: `README: ${title}`,
        description: `Documentation for ${itemName} - ${sections.length} sections`,
        codeSnippets: [{
          file: relativePath,
          language: 'markdown',
          code: content.substring(0, 10000), // Limit to 10KB
          explanation: `README documentation for ${itemName}`
        }],
        patterns: sections.map(s => s.title),
        dependencies: [],
        useCases: [
          'Understanding project structure',
          'Setup instructions',
          'API documentation',
          'Usage examples'
        ],
        tags: ['readme', 'documentation', type, itemName],
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error extracting README from ${readmePath}:`, error);
      return null;
    }
  }

  /**
   * Extract knowledge from package.json
   */
  private async extractPackageJsonKnowledge(
    packageJsonPath: string,
    type: 'app' | 'package',
    itemName: string
  ): Promise<ExtractedKnowledge | null> {
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      const relativePath = path.relative(this.workspaceRoot, packageJsonPath);

      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      const scripts = Object.keys(packageJson.scripts || {});

      return {
        id: `package-json-${type}-${itemName}`,
        source: type === 'app' ? `apps/${itemName}` : `packages/${itemName}`,
        type: 'architecture',
        category: 'package-config',
        title: `package.json: ${packageJson.name || itemName}`,
        description: `${packageJson.description || 'Package configuration'} - ${dependencies.length} dependencies, ${scripts.length} scripts`,
        codeSnippets: [{
          file: relativePath,
          language: 'json',
          code: content,
          explanation: `Package configuration for ${itemName}`
        }],
        patterns: [
          `Dependencies: ${dependencies.length}`,
          `Dev Dependencies: ${devDependencies.length}`,
          `Scripts: ${scripts.length}`,
          ...scripts.map(s => `Script: ${s}`)
        ],
        dependencies: [...dependencies, ...devDependencies],
        useCases: [
          'Dependency management',
          'Build configuration',
          'Script execution',
          'Package understanding'
        ],
        tags: ['package.json', 'dependencies', type, itemName, ...dependencies.slice(0, 10)],
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error extracting package.json from ${packageJsonPath}:`, error);
      return null;
    }
  }

  /**
   * Find all code files in a directory recursively
   */
  private async findCodeFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip certain directories
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }
          // Recursively search subdirectories
          const subFiles = await this.findCodeFiles(fullPath);
          files.push(...subFiles);
        } else if (this.isCodeFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }

    return files;
  }

  /**
   * Check if a directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      'node_modules',
      '.next',
      'dist',
      'build',
      '.git',
      '.scorpion',
      'coverage',
      '.turbo',
      '.vercel',
      'test-results',
      'playwright-report',
      'audit',
      'backups'
    ];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if a file is a code file
   */
  private isCodeFile(fileName: string): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  /**
   * Determine category based on file path
   */
  private determineCategory(filePath: string): string {
    const normalized = filePath.toLowerCase();
    
    if (normalized.includes('/api/')) return 'api';
    if (normalized.includes('/components/')) return 'component';
    if (normalized.includes('/lib/')) return 'library';
    if (normalized.includes('/utils/')) return 'utility';
    if (normalized.includes('/hooks/')) return 'hook';
    if (normalized.includes('/types/')) return 'type';
    if (normalized.includes('/store/')) return 'store';
    if (normalized.includes('/services/')) return 'service';
    if (normalized.includes('/workers/')) return 'worker';
    if (normalized.includes('/middleware/')) return 'middleware';
    if (normalized.includes('/routes/') || normalized.includes('/route.ts')) return 'route';
    if (normalized.includes('/pages/') || normalized.includes('/page.tsx')) return 'page';
    if (normalized.includes('/layout.tsx')) return 'layout';
    if (normalized.includes('/test') || normalized.includes('.test.')) return 'test';
    
    return 'source';
  }

  /**
   * Determine knowledge type based on category
   */
  private determineType(category: string): ExtractedKnowledge['type'] {
    if (category === 'api' || category === 'route') return 'integration';
    if (category === 'component' || category === 'page') return 'feature';
    if (category === 'library' || category === 'utility') return 'pattern';
    return 'architecture';
  }

  /**
   * Extract sections from markdown content
   */
  private extractMarkdownSections(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    const lines = content.split('\n');
    let currentTitle = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.match(/^#+\s+/)) {
        if (currentTitle) {
          sections.push({
            title: currentTitle,
            content: currentContent.join('\n')
          });
        }
        currentTitle = line.replace(/^#+\s+/, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentTitle) {
      sections.push({
        title: currentTitle,
        content: currentContent.join('\n')
      });
    }

    return sections;
  }
}

