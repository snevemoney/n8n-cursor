/**
 * Code Ingester
 * Extracts comprehensive source code knowledge from all apps and packages
 * Provides Cursor-level understanding of the entire codebase
 * Uses hybrid RAG indexing: Summary, Query, and Sub-chunks strategies
 */

import { ExtractedKnowledge } from './types';
import { getASTParser } from '../code/ast-parser';
import { getFileCache } from '../code/file-cache';
import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag';
import fs from 'fs/promises';
import path from 'path';

export class CodeIngester {
  private workspaceRoot: string;
  private astParser: ReturnType<typeof getASTParser>;
  private fileCache: ReturnType<typeof getFileCache>;
  private llm: LLMAdapter;
  private ragStore?: RAGStore;

  constructor(workspaceRoot: string, ragStore?: RAGStore) {
    this.workspaceRoot = workspaceRoot;
    this.astParser = getASTParser(workspaceRoot);
    this.fileCache = getFileCache();
    this.llm = new LLMAdapter({ temperature: 0.3, maxTokens: 500 });
    this.ragStore = ragStore;
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
      // Skip test files as a safety net (should already be filtered in findCodeFiles)
      if (this.isTestFile(filePath)) {
        return null;
      }

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
      const isLargeFile = codeContent.length > maxContentSize;
      if (isLargeFile) {
        codeContent = codeContent.substring(0, maxContentSize) + '\n... (truncated)';
      }

      const knowledge: ExtractedKnowledge = {
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

      // Apply hybrid indexing strategies
      if (this.ragStore) {
        // 1. Query Indexing: Generate common questions about this code file
        try {
          const queries = await this.generateCodeQueries(fileName, description, ast, patterns);
          for (const query of queries) {
            await this.ragStore.addQueryEntry(
              knowledge.id,
              query,
              {
                source: knowledge.source,
                type: knowledge.type,
                category: knowledge.category,
                tags: knowledge.tags,
                extractedAt: knowledge.extractedAt
              }
            );
          }
          if (queries.length > 0) {
            console.log(`  ✓ Generated ${queries.length} query entries for ${fileName}`);
          }
        } catch (error) {
          console.warn(`  ⚠ Failed to generate queries for ${fileName}:`, error);
        }

        // 2. Sub-chunks Indexing: Split large files by functions/classes
        if (isLargeFile && ast && (ast.functions.length > 0 || ast.classes.length > 0)) {
          try {
            await this.indexSubChunks(knowledge, fileContent.content, ast);
            console.log(`  ✓ Indexed sub-chunks for ${fileName}`);
          } catch (error) {
            console.warn(`  ⚠ Failed to index sub-chunks for ${fileName}:`, error);
          }
        }
      }

      return knowledge;
    } catch (error) {
      console.error(`Error extracting file knowledge from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract knowledge from README file with Summary Indexing
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

      const knowledge: ExtractedKnowledge = {
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

      // Generate and index summary (Summary Indexing strategy)
      if (this.ragStore) {
        try {
          const summary = await this.generateSummary(content, title);
          if (summary) {
            await this.ragStore.addSummaryEntry(
              knowledge.id,
              summary,
              {
                source: knowledge.source,
                type: knowledge.type,
                category: knowledge.category,
                tags: knowledge.tags,
                extractedAt: knowledge.extractedAt
              }
            );
            console.log(`  ✓ Generated summary for ${itemName} README`);
          }
        } catch (error) {
          console.warn(`  ⚠ Failed to generate summary for ${itemName} README:`, error);
        }
      }

      return knowledge;
    } catch (error) {
      console.error(`Error extracting README from ${readmePath}:`, error);
      return null;
    }
  }

  /**
   * Generate a concise summary of README content using LLM
   */
  private async generateSummary(content: string, title: string): Promise<string | null> {
    try {
      // Extract first 2000 chars for summary generation (to avoid token limits)
      const contentPreview = content.substring(0, 2000);
      
      const prompt = `Generate a concise 2-3 sentence summary of this README file. Focus on what the project is, its main purpose, and key features.

Title: ${title}

Content:
${contentPreview}

Summary (2-3 sentences):`;

      const summary = await this.llm.chat(prompt, 'You are a technical documentation expert. Generate clear, concise summaries.');
      return summary.trim();
    } catch (error) {
      console.warn('Failed to generate summary:', error);
      return null;
    }
  }

  /**
   * Generate common questions about a code file (Query Indexing)
   */
  private async generateCodeQueries(
    fileName: string,
    description: string,
    ast: any,
    patterns: string[]
  ): Promise<string[]> {
    try {
      const functionsList = ast?.functions.slice(0, 10).map((f: any) => f.name).join(', ') || 'none';
      const classesList = ast?.classes.slice(0, 5).map((c: any) => c.name).join(', ') || 'none';
      
      const prompt = `Generate 3-5 common questions developers might ask about this code file. Focus on "how to" and "what does" questions.

File: ${fileName}
Description: ${description}
Functions: ${functionsList}
Classes: ${classesList}
Patterns: ${patterns.slice(0, 5).join(', ')}

Generate questions like:
- "How do I use [function/class]?"
- "What does [function/class] do?"
- "How to [common use case]?"

Return only the questions, one per line, no numbering:`;

      const response = await this.llm.chat(prompt, 'You are a code documentation expert. Generate practical questions developers would ask.');
      const queries = response
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.match(/^\d+[\.\)]/)) // Remove numbering
        .slice(0, 5); // Limit to 5 queries

      return queries;
    } catch (error) {
      console.warn('Failed to generate code queries:', error);
      return [];
    }
  }

  /**
   * Index code file as sub-chunks by function/class (Sub-chunks Indexing)
   */
  private async indexSubChunks(
    knowledge: ExtractedKnowledge,
    fullContent: string,
    ast: any
  ): Promise<void> {
    if (!this.ragStore) return;

    const chunks: Array<{ content: string; index: number }> = [];
    let chunkIndex = 0;

    // Create chunks from classes
    for (const classInfo of ast.classes) {
      // Extract class code (simplified - in production would parse AST more precisely)
      const classMatch = fullContent.match(
        new RegExp(`(export\\s+)?(class|interface|type)\\s+${classInfo.name}[\\s\\S]*?(?=\\n(export\\s+)?(class|interface|type|function|const|let|var|$))`, 'm')
      );
      if (classMatch) {
        chunks.push({
          content: `Class: ${classInfo.name}\n\n${classMatch[0]}`,
          index: chunkIndex++
        });
      }
    }

    // Create chunks from exported functions
    for (const funcInfo of ast.functions.filter((f: any) => f.isExported).slice(0, 20)) {
      // Extract function code (simplified)
      const funcMatch = fullContent.match(
        new RegExp(`(export\\s+)?(function|const|let|var)\\s+${funcInfo.name}[\\s\\S]*?(?=\\n(export\\s+)?(function|const|let|var|class|interface|type|$))`, 'm')
      );
      if (funcMatch) {
        chunks.push({
          content: `Function: ${funcInfo.name}\n\n${funcMatch[0]}`,
          index: chunkIndex++
        });
      }
    }

    // Index each chunk
    for (const chunk of chunks) {
      await this.ragStore.addSubChunkEntry(
        knowledge.id,
        chunk.content.substring(0, 10000), // Limit chunk size
        chunk.index,
        chunks.length,
        {
          source: knowledge.source,
          type: knowledge.type,
          category: knowledge.category,
          tags: knowledge.tags,
          extractedAt: knowledge.extractedAt
        }
      );
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
          // Skip test files
          if (this.isTestFile(fullPath)) {
            continue;
          }
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
   * Check if a file is a test file (should be excluded from indexing)
   */
  private isTestFile(filePath: string): boolean {
    const normalized = filePath.toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    
    // Skip test files and test directories
    return (
      normalized.includes('/test/') ||
      normalized.includes('/tests/') ||
      normalized.includes('/__tests__/') ||
      normalized.includes('/__test__/') ||
      fileName.startsWith('test-') ||
      fileName.endsWith('.test.ts') ||
      fileName.endsWith('.test.tsx') ||
      fileName.endsWith('.test.js') ||
      fileName.endsWith('.test.jsx') ||
      fileName.endsWith('.spec.ts') ||
      fileName.endsWith('.spec.tsx') ||
      fileName.endsWith('.spec.js') ||
      fileName.endsWith('.spec.jsx') ||
      fileName.match(/test-\d+/) || // Matches test-1748574172423-test_fix-1748574172424.ts
      fileName.match(/test_\d+/)    // Matches test_1748574172423 patterns
    );
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

