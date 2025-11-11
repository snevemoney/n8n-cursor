/**
 * n8n-cursor Knowledge Ingester
 * Extracts knowledge from the n8n-cursor development workbench
 */

import { ExtractedKnowledge } from './types';
import fs from 'fs/promises';
import path from 'path';

export class N8nCursorIngester {
  private workspaceRoot: string;
  private n8nCursorRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.n8nCursorRoot = path.join(workspaceRoot, 'apps', 'n8n-cursor');
  }

  /**
   * Extract all n8n-cursor knowledge
   */
  async extractN8nCursorKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Check if n8n-cursor directory exists
      try {
        await fs.access(this.n8nCursorRoot);
      } catch {
        console.log('⚠️ n8n-cursor directory not found, skipping ingestion');
        return knowledge;
      }

      console.log('🛠️ Extracting n8n-cursor knowledge...');

      // Extract README and overview
      const readmeKnowledge = await this.extractReadme();
      if (readmeKnowledge) knowledge.push(readmeKnowledge);

      // Extract scripts knowledge
      const scriptsKnowledge = await this.extractScripts();
      knowledge.push(...scriptsKnowledge);

      // Extract tools knowledge
      const toolsKnowledge = await this.extractTools();
      knowledge.push(...toolsKnowledge);

      // Extract MCP server knowledge
      const mcpKnowledge = await this.extractMCP();
      knowledge.push(...mcpKnowledge);

      // Extract visualizations and documentation
      const vizKnowledge = await this.extractVisualizations();
      knowledge.push(...vizKnowledge);

      // Extract AI prompts and specs
      const aiKnowledge = await this.extractAIPrompts();
      knowledge.push(...aiKnowledge);

      // Extract workflow tools and utilities
      const workflowToolsKnowledge = await this.extractWorkflowTools();
      knowledge.push(...workflowToolsKnowledge);

      console.log(`✅ Extracted ${knowledge.length} n8n-cursor knowledge items`);

    } catch (error) {
      console.error('Error extracting n8n-cursor knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract README and overview
   */
  private async extractReadme(): Promise<ExtractedKnowledge | null> {
    try {
      const readmePath = path.join(this.n8nCursorRoot, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');
      const relativePath = path.relative(this.workspaceRoot, readmePath);

      return {
        id: 'n8n-cursor-overview',
        source: 'n8n-cursor',
        type: 'architecture',
        category: 'development-tools',
        title: 'n8n-cursor Development Workbench',
        description: `n8n-cursor provides development tools for workflow management, automation scripts, MCP server, code generation, and testing utilities. ${content.substring(0, 500)}`,
        codeSnippets: [{
          file: relativePath,
          language: 'markdown',
          code: content.substring(0, 2000),
          explanation: 'n8n-cursor overview and documentation'
        }],
        patterns: [
          'Workflow management and synchronization',
          'Development automation',
          'MCP (Model Context Protocol) integration',
          'Code generation and refactoring',
          'Testing and validation'
        ],
        dependencies: ['n8n', 'Node.js', 'TypeScript'],
        useCases: [
          'n8n workflow development',
          'Workflow automation',
          'AI-powered development tools',
          'Development workflow management'
        ],
        tags: ['n8n-cursor', 'development-tools', 'workflows', 'mcp', 'automation'],
        extractedAt: new Date().toISOString(),
        filePath: relativePath,
        contentUrl: relativePath
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract scripts knowledge
   */
  private async extractScripts(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];
    const scriptsDir = path.join(this.n8nCursorRoot, 'scripts');

    try {
      const entries = await fs.readdir(scriptsDir, { withFileTypes: true });

      // Group scripts by category
      const scriptCategories: Record<string, string[]> = {
        'workflow-management': [],
        'development-tools': [],
        'maintenance': [],
        'mcp-tools': [],
        'backup-restore': [],
        'testing': []
      };

      for (const entry of entries) {
        if (!entry.isFile() || (!entry.name.endsWith('.sh') && !entry.name.endsWith('.js'))) {
          continue;
        }

        const scriptPath = path.join(scriptsDir, entry.name);
        const relativePath = path.relative(this.workspaceRoot, scriptPath);

        try {
          const content = await fs.readFile(scriptPath, 'utf-8');
          const firstLines = content.split('\n').slice(0, 20).join('\n');

          // Categorize script
          let category = 'development-tools';
          if (entry.name.includes('workflow') || entry.name.includes('import') || entry.name.includes('export')) {
            category = 'workflow-management';
          } else if (entry.name.includes('backup') || entry.name.includes('restore')) {
            category = 'backup-restore';
          } else if (entry.name.includes('mcp')) {
            category = 'mcp-tools';
          } else if (entry.name.includes('test') || entry.name.includes('validate')) {
            category = 'testing';
          } else if (entry.name.includes('cleanup') || entry.name.includes('remove')) {
            category = 'maintenance';
          }

          // Extract purpose from comments
          const purposeMatch = content.match(/#\s*(.+?)(?:\n|$)/i) || 
                               content.match(/\/\/\s*(.+?)(?:\n|$)/i);
          const purpose = purposeMatch ? purposeMatch[1] : `Script: ${entry.name}`;

          knowledge.push({
            id: `n8n-cursor-script-${entry.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
            source: 'n8n-cursor',
            type: 'feature',
            category: category,
            title: `Script: ${entry.name}`,
            description: `${purpose}\n\nLocation: ${relativePath}\n\n${firstLines.substring(0, 300)}`,
            codeSnippets: [{
              file: relativePath,
              language: entry.name.endsWith('.sh') ? 'bash' : 'javascript',
              code: content.substring(0, 1000),
              explanation: `n8n-cursor script: ${entry.name}`
            }],
            patterns: [
              'Automation script',
              'Development utility',
              entry.name.includes('workflow') ? 'Workflow management' : '',
              entry.name.includes('mcp') ? 'MCP integration' : ''
            ].filter(Boolean),
            dependencies: [],
            useCases: [
              'Development automation',
              'Workflow management',
              'System maintenance'
            ],
            tags: ['n8n-cursor', 'script', entry.name.replace(/\.(sh|js)$/, ''), category],
            extractedAt: new Date().toISOString(),
            filePath: relativePath,
            contentUrl: relativePath
          });
        } catch (error) {
          console.warn(`Failed to read script ${entry.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error extracting scripts:', error);
    }

    return knowledge;
  }

  /**
   * Extract tools knowledge
   */
  private async extractTools(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];
    const toolsDir = path.join(this.n8nCursorRoot, 'tools');

    try {
      const entries = await fs.readdir(toolsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Handle subdirectories
          const subDir = path.join(toolsDir, entry.name);
          const subEntries = await fs.readdir(subDir, { withFileTypes: true });
          
          for (const subEntry of subEntries) {
            if (subEntry.isFile() && (subEntry.name.endsWith('.js') || subEntry.name.endsWith('.mjs'))) {
              const toolPath = path.join(subDir, subEntry.name);
              const toolKnowledge = await this.extractToolFile(toolPath, entry.name);
              if (toolKnowledge) knowledge.push(toolKnowledge);
            }
          }
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
          const toolPath = path.join(toolsDir, entry.name);
          const toolKnowledge = await this.extractToolFile(toolPath);
          if (toolKnowledge) knowledge.push(toolKnowledge);
        }
      }
    } catch (error) {
      console.error('Error extracting tools:', error);
    }

    return knowledge;
  }

  /**
   * Extract a single tool file
   */
  private async extractToolFile(toolPath: string, category?: string): Promise<ExtractedKnowledge | null> {
    try {
      const content = await fs.readFile(toolPath, 'utf-8');
      const relativePath = path.relative(this.workspaceRoot, toolPath);
      const fileName = path.basename(toolPath);

      // Extract description from JSDoc or comments
      const jsDocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
      const commentMatch = content.match(/\/\/\s*(.+?)(?:\n|$)/);
      const description = jsDocMatch?.[0] || commentMatch?.[1] || `Tool: ${fileName}`;

      return {
        id: `n8n-cursor-tool-${fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
        source: 'n8n-cursor',
        type: 'feature',
        category: category || 'development-tools',
        title: `Tool: ${fileName}`,
        description: `${description}\n\nLocation: ${relativePath}`,
        codeSnippets: [{
          file: relativePath,
          language: 'javascript',
          code: content.substring(0, 2000),
          explanation: `n8n-cursor tool: ${fileName}`
        }],
        patterns: [
          'Node.js utility',
          'Development tool',
          category ? `${category} tool` : ''
        ].filter(Boolean),
        dependencies: ['Node.js'],
        useCases: [
          'Development automation',
          'Workflow processing',
          'Code generation'
        ],
        tags: ['n8n-cursor', 'tool', fileName.replace(/\.(js|mjs)$/, ''), category || 'utility'],
        extractedAt: new Date().toISOString(),
        filePath: relativePath,
        contentUrl: relativePath
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract MCP server knowledge
   */
  private async extractMCP(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];
    const mcpDir = path.join(this.n8nCursorRoot, 'mcp-server');

    try {
      const readmePath = path.join(mcpDir, 'README.md');
      try {
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        const mcpReadmePath = path.relative(this.workspaceRoot, readmePath);
        knowledge.push({
          id: 'n8n-cursor-mcp-server',
          source: 'n8n-cursor',
          type: 'integration',
          category: 'mcp',
          title: 'MCP Server for n8n-cursor',
          description: readmeContent.substring(0, 500),
          codeSnippets: [{
            file: mcpReadmePath,
            language: 'markdown',
            code: readmeContent.substring(0, 2000),
            explanation: 'MCP server documentation'
          }],
          patterns: [
            'Model Context Protocol',
            'AI integration',
            'Workflow automation',
            'n8n integration'
          ],
          dependencies: ['Node.js', 'MCP'],
          useCases: [
            'AI-powered workflow management',
            'Automated workflow creation',
            'Workflow analysis'
          ],
          tags: ['n8n-cursor', 'mcp', 'ai', 'integration'],
          extractedAt: new Date().toISOString(),
          filePath: mcpReadmePath,
          contentUrl: mcpReadmePath
        });
      } catch {
        // README might not exist
      }

      // Extract MCP server code
      const indexPath = path.join(mcpDir, 'index.js');
      try {
        const indexContent = await fs.readFile(indexPath, 'utf-8');
        const mcpIndexPath = path.relative(this.workspaceRoot, indexPath);
        knowledge.push({
          id: 'n8n-cursor-mcp-server-code',
          source: 'n8n-cursor',
          type: 'integration',
          category: 'mcp',
          title: 'MCP Server Implementation',
          description: 'MCP server implementation for n8n workflow management',
          codeSnippets: [{
            file: mcpIndexPath,
            language: 'javascript',
            code: indexContent.substring(0, 2000),
            explanation: 'MCP server main implementation'
          }],
          patterns: ['MCP server', 'AI tools', 'Workflow management'],
          dependencies: ['Node.js', 'MCP'],
          useCases: ['AI integration', 'Workflow automation'],
          tags: ['n8n-cursor', 'mcp', 'server', 'implementation'],
          extractedAt: new Date().toISOString(),
          filePath: mcpIndexPath,
          contentUrl: mcpIndexPath
        });
      } catch {
        // index.js might not exist
      }
    } catch (error) {
      console.error('Error extracting MCP knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract visualizations and documentation
   */
  private async extractVisualizations(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];
    const vizDir = path.join(this.n8nCursorRoot, 'visualizations');

    try {
      const entries = await fs.readdir(vizDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const vizPath = path.join(vizDir, entry.name);
          try {
            const content = await fs.readFile(vizPath, 'utf-8');
            const relativePath = path.relative(this.workspaceRoot, vizPath);
            const title = entry.name.replace('.md', '').replace(/-/g, ' ');

            knowledge.push({
              id: `n8n-cursor-viz-${entry.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
              source: 'n8n-cursor',
              type: 'best-practice',
              category: 'documentation',
              title: `Visualization: ${title}`,
              description: content.substring(0, 500),
              codeSnippets: [{
                file: relativePath,
                language: 'markdown',
                code: content.substring(0, 2000),
                explanation: `Workflow visualization: ${title}`
              }],
              patterns: ['Workflow documentation', 'Visualization', 'Best practices'],
              dependencies: [],
              useCases: ['Workflow understanding', 'Documentation', 'Learning'],
              tags: ['n8n-cursor', 'visualization', 'documentation', title.toLowerCase()],
              extractedAt: new Date().toISOString(),
              filePath: relativePath,
              contentUrl: relativePath
            });
          } catch (error) {
            console.warn(`Failed to read visualization ${entry.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting visualizations:', error);
    }

    return knowledge;
  }

  /**
   * Extract AI prompts and specs
   */
  private async extractAIPrompts(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];
    const aiDir = path.join(this.n8nCursorRoot, 'ai');

    try {
      // Extract prompts
      const promptsDir = path.join(aiDir, 'prompts');
      try {
        const promptFiles = await fs.readdir(promptsDir);
        for (const file of promptFiles) {
          if (file.endsWith('.md')) {
            const promptPath = path.join(promptsDir, file);
            const content = await fs.readFile(promptPath, 'utf-8');
            const relativePath = path.relative(this.workspaceRoot, promptPath);

            knowledge.push({
              id: `n8n-cursor-prompt-${file.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
              source: 'n8n-cursor',
              type: 'best-practice',
              category: 'ai-prompts',
              title: `AI Prompt: ${file.replace('.md', '')}`,
              description: content.substring(0, 500),
              codeSnippets: [{
                file: relativePath,
                language: 'markdown',
                code: content.substring(0, 2000),
                explanation: `AI prompt template: ${file}`
              }],
              patterns: ['AI prompts', 'Code generation', 'Workflow specification'],
              dependencies: [],
              useCases: ['AI-assisted development', 'Code generation', 'Workflow creation'],
              tags: ['n8n-cursor', 'ai', 'prompt', file.replace('.md', '')],
              extractedAt: new Date().toISOString(),
              filePath: relativePath,
              contentUrl: relativePath
            });
          }
        }
      } catch {
        // Prompts directory might not exist
      }

      // Extract specs
      const specsDir = path.join(aiDir, 'specs');
      try {
        const specFiles = await fs.readdir(specsDir);
        for (const file of specFiles) {
          if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            const specPath = path.join(specsDir, file);
            const content = await fs.readFile(specPath, 'utf-8');
            const relativePath = path.relative(this.workspaceRoot, specPath);

            knowledge.push({
              id: `n8n-cursor-spec-${file.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
              source: 'n8n-cursor',
              type: 'pattern',
              category: 'workflow-specs',
              title: `Workflow Spec: ${file.replace(/\.(yaml|yml)$/, '')}`,
              description: `Workflow specification: ${content.substring(0, 300)}`,
              codeSnippets: [{
                file: relativePath,
                language: 'yaml',
                code: content.substring(0, 2000),
                explanation: `Workflow specification: ${file}`
              }],
              patterns: ['Workflow specification', 'YAML schema', 'Workflow definition'],
              dependencies: [],
              useCases: ['Workflow creation', 'Specification-driven development'],
              tags: ['n8n-cursor', 'spec', 'yaml', file.replace(/\.(yaml|yml)$/, '')],
              extractedAt: new Date().toISOString(),
              filePath: relativePath,
              contentUrl: relativePath
            });
          }
        }
      } catch {
        // Specs directory might not exist
      }
    } catch (error) {
      console.error('Error extracting AI prompts:', error);
    }

    return knowledge;
  }

  /**
   * Extract workflow tools and utilities
   */
  private async extractWorkflowTools(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    // Extract knowledge about workflow management capabilities
    knowledge.push({
      id: 'n8n-cursor-workflow-management',
      source: 'n8n-cursor',
      type: 'feature',
      category: 'workflow-management',
      title: 'n8n Workflow Management Tools',
      description: 'Comprehensive tools for managing n8n workflows including export, import, validation, fixing expressions, and synchronization.',
      codeSnippets: [],
      patterns: [
        'Workflow export/import',
        'Expression fixing',
        'Workflow validation',
        'Bidirectional synchronization',
        'Workflow backup and restore'
      ],
      dependencies: ['n8n API'],
      useCases: [
        'Workflow version control',
        'Workflow migration',
        'Expression debugging',
        'Workflow synchronization',
        'Bulk workflow operations'
      ],
      tags: ['n8n-cursor', 'workflows', 'management', 'automation'],
      extractedAt: new Date().toISOString()
    });

    return knowledge;
  }
}

