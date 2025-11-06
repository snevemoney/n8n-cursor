/**
 * Knowledge Extractor
 * Analyzes side hustle codebases and extracts:
 * - Architecture patterns (multi-tenant, payment processing, etc.)
 * - Feature implementations (chatbot, workflows, etc.)
 * - Code patterns and best practices
 * - API designs and integrations
 */

import { ExtractedKnowledge } from './types';
import fs from 'fs/promises';
import path from 'path';

export class KnowledgeExtractor {
  private sideHustlePath: string;

  constructor(sideHustlePath: string) {
    this.sideHustlePath = sideHustlePath;
  }

  /**
   * Extract knowledge from a side hustle codebase
   */
  async extractKnowledge(sideHustleId: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Extract architecture patterns
      const architecturePatterns = await this.extractArchitecturePatterns(sideHustleId);
      knowledge.push(...architecturePatterns);

      // Extract features
      const features = await this.extractFeatures(sideHustleId);
      knowledge.push(...features);

      // Extract code patterns
      const patterns = await this.extractCodePatterns(sideHustleId);
      knowledge.push(...patterns);
    } catch (error) {
      console.error(`Error extracting knowledge from ${sideHustleId}:`, error);
    }

    return knowledge;
  }

  /**
   * Extract architecture patterns (multi-tenant, auth, etc.)
   */
  private async extractArchitecturePatterns(sideHustleId: string): Promise<ExtractedKnowledge[]> {
    const patterns: ExtractedKnowledge[] = [];
    
    try {
      // Check for multi-tenant patterns
      const tenantFiles = await this.findFiles(['tenant', 'multi-tenant', 'organization', 'multi_tenant']);
      if (tenantFiles.length > 0) {
        patterns.push({
          id: `${sideHustleId}-multi-tenant`,
          source: sideHustleId,
          type: 'architecture',
          category: 'multi-tenant',
          title: 'Multi-Tenant Architecture',
          description: `How ${sideHustleId} implements multi-tenancy with tenant isolation and shared database patterns`,
          codeSnippets: await this.extractCodeSnippets(tenantFiles.slice(0, 3)),
          patterns: ['Row-level security', 'Tenant isolation', 'Shared database', 'Tenant context'],
          dependencies: ['PostgreSQL', 'Supabase'],
          useCases: ['SaaS applications', 'Multi-organization platforms', 'B2B applications'],
          tags: ['multi-tenant', 'saas', 'architecture', 'database'],
          extractedAt: new Date().toISOString()
        });
      }

      // Check for payment patterns
      const paymentFiles = await this.findFiles(['payment', 'stripe', 'lightning', 'invoice', 'billing']);
      if (paymentFiles.length > 0) {
        patterns.push({
          id: `${sideHustleId}-payment`,
          source: sideHustleId,
          type: 'feature',
          category: 'payment',
          title: 'Payment Processing',
          description: `Payment integration implementation from ${sideHustleId}`,
          codeSnippets: await this.extractCodeSnippets(paymentFiles.slice(0, 3)),
          patterns: ['Invoice creation', 'Payment webhooks', 'Subscription handling', 'Payment verification'],
          dependencies: ['LNbits', 'Stripe'],
          useCases: ['E-commerce', 'SaaS subscriptions', 'Marketplaces', 'B2B payments'],
          tags: ['payment', 'lightning', 'stripe', 'billing'],
          extractedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error extracting architecture patterns:', error);
    }

    return patterns;
  }

  /**
   * Extract feature implementations
   */
  private async extractFeatures(sideHustleId: string): Promise<ExtractedKnowledge[]> {
    const features: ExtractedKnowledge[] = [];

    try {
      // Check for chatbot features
      const chatbotFiles = await this.findFiles(['chat', 'bot', 'llm', 'ollama', 'message', 'conversation']);
      if (chatbotFiles.length > 0) {
        features.push({
          id: `${sideHustleId}-chatbot`,
          source: sideHustleId,
          type: 'feature',
          category: 'chatbot',
          title: 'Chatbot Implementation',
          description: `How ${sideHustleId} implements a chatbot SaaS with message handling and LLM integration`,
          codeSnippets: await this.extractCodeSnippets(chatbotFiles.slice(0, 3)),
          patterns: ['Message handling', 'Context management', 'LLM integration', 'Conversation state'],
          dependencies: ['Ollama', 'Next.js', 'React'],
          useCases: ['Customer support', 'Business automation', 'AI assistants', 'Chat interfaces'],
          tags: ['chatbot', 'ai', 'llm', 'conversation'],
          extractedAt: new Date().toISOString()
        });
      }

      // Check for workflow features
      const workflowFiles = await this.findFiles(['workflow', 'n8n', 'automation', 'orchestration']);
      if (workflowFiles.length > 0) {
        features.push({
          id: `${sideHustleId}-workflows`,
          source: sideHustleId,
          type: 'feature',
          category: 'workflow',
          title: 'Workflow Automation',
          description: `Workflow orchestration system from ${sideHustleId}`,
          codeSnippets: await this.extractCodeSnippets(workflowFiles.slice(0, 3)),
          patterns: ['Workflow execution', 'Node orchestration', 'State management', 'Multi-tenant workflows'],
          dependencies: ['n8n'],
          useCases: ['Business automation', 'Data pipelines', 'Integration platforms', 'SaaS workflows'],
          tags: ['workflow', 'automation', 'n8n', 'orchestration'],
          extractedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error extracting features:', error);
    }

    return features;
  }

  /**
   * Extract reusable code patterns
   */
  private async extractCodePatterns(sideHustleId: string): Promise<ExtractedKnowledge[]> {
    // Extract common patterns like API routes, database queries, etc.
    const patterns: ExtractedKnowledge[] = [];

    try {
      // Check for API patterns
      const apiFiles = await this.findFiles(['api', 'route', 'endpoint']);
      if (apiFiles.length > 0) {
        patterns.push({
          id: `${sideHustleId}-api-patterns`,
          source: sideHustleId,
          type: 'pattern',
          category: 'api',
          title: 'API Route Patterns',
          description: `API route patterns and structure from ${sideHustleId}`,
          codeSnippets: await this.extractCodeSnippets(apiFiles.slice(0, 2)),
          patterns: ['REST API', 'Route handlers', 'Error handling', 'Validation'],
          dependencies: ['Next.js'],
          useCases: ['API development', 'Backend services'],
          tags: ['api', 'routes', 'backend'],
          extractedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error extracting code patterns:', error);
    }

    return patterns;
  }

  private async findFiles(keywords: string[]): Promise<string[]> {
    const foundFiles: string[] = [];
    
    try {
      const files = await this.getAllFiles(this.sideHustlePath);
      
      for (const file of files) {
        const fileName = path.basename(file).toLowerCase();
        const filePath = file.toLowerCase();
        
        for (const keyword of keywords) {
          if (fileName.includes(keyword.toLowerCase()) || filePath.includes(keyword.toLowerCase())) {
            foundFiles.push(file);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error finding files:', error);
    }

    return foundFiles;
  }

  private async getAllFiles(dir: string, fileList: string[] = []): Promise<string[]> {
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .next, dist, etc.
          if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
            await this.getAllFiles(filePath, fileList);
          }
        } else if (this.isCodeFile(file)) {
          fileList.push(filePath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return fileList;
  }

  private isCodeFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'].includes(ext);
  }

  private async extractCodeSnippets(files: string[]): Promise<ExtractedKnowledge['codeSnippets']> {
    const snippets: ExtractedKnowledge['codeSnippets'] = [];

    for (const file of files.slice(0, 3)) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const language = path.extname(file).slice(1) || 'typescript';
        const relativePath = path.relative(this.sideHustlePath, file);
        
        // Extract first 50 lines as snippet
        const lines = content.split('\n').slice(0, 50).join('\n');
        
        snippets.push({
          file: relativePath,
          language,
          code: lines,
          explanation: `Code from ${relativePath} showing implementation pattern`
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return snippets;
  }
}

