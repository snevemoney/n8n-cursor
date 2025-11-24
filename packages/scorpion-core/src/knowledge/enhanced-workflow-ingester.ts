/**
 * Enhanced Workflow Ingester for RAG
 * Deeply parses n8n workflows to make them searchable and chat-assistable
 */

import { ExtractedKnowledge } from './types';

export interface ParsedWorkflowNode {
  id: string;
  name: string;
  type: string;
  nodeType: string; // e.g., "n8n-nodes-base.httpRequest"
  isTrigger: boolean;
  parameters: Record<string, any>;
  expressions: string[]; // Extracted n8n expressions
  description?: string;
  position: [number, number];
}

export interface ParsedWorkflowConnection {
  from: string;
  to: string;
  output: string; // 'main', 'ai_tool', etc.
  index: number;
}

export interface ParsedWorkflow {
  id: string;
  name: string;
  active: boolean;
  description?: string;
  tags?: string[];
  nodes: ParsedWorkflowNode[];
  connections: ParsedWorkflowConnection[];
  nodeTypes: Set<string>;
  triggerType?: string;
  purpose?: string; // Inferred from nodes and connections
}

export class EnhancedWorkflowIngester {
  private n8nClient?: {
    listWorkflows: () => Promise<any[]>;
    getWorkflow: (id: string) => Promise<any | null>;
    exportWorkflow: (id: string) => Promise<any>;
  };

  constructor(n8nClient?: any) {
    this.n8nClient = n8nClient;
  }

  /**
   * Ingest all n8n workflows into RAG
   */
  async ingestAllWorkflows(ragStore: any): Promise<{
    ingested: number;
    errors: Array<{ workflow: string; error: string }>;
  }> {
    const errors: Array<{ workflow: string; error: string }> = [];
    let ingested = 0;

    if (!this.n8nClient) {
      throw new Error('n8n client required for workflow ingestion');
    }

    try {
      // Get all workflows from n8n
      const workflows = await this.n8nClient.listWorkflows();
      console.log(`📥 Found ${workflows.length} workflows in n8n`);

      for (const workflow of workflows) {
        try {
          // Get full workflow details
          const fullWorkflow = await this.n8nClient.getWorkflow(workflow.id);
          if (!fullWorkflow) {
            errors.push({ workflow: workflow.name, error: 'Workflow not found' });
            continue;
          }

          // Parse workflow deeply
          const parsed = this.parseWorkflow(fullWorkflow);

          // Create rich knowledge entry
          const knowledge = this.createWorkflowKnowledge(parsed, fullWorkflow);

          // Add to RAG store
          await ragStore.addKnowledge(knowledge);
          ingested++;

          console.log(`✅ Ingested workflow: ${parsed.name} (${parsed.nodes.length} nodes)`);
        } catch (error: any) {
          errors.push({ workflow: workflow.name, error: error.message });
          console.error(`❌ Failed to ingest ${workflow.name}:`, error);
        }
      }

      return { ingested, errors };
    } catch (error: any) {
      throw new Error(`Failed to ingest workflows: ${error.message}`);
    }
  }

  /**
   * Deeply parse workflow structure
   */
  private parseWorkflow(workflow: any): ParsedWorkflow {
    const nodes: ParsedWorkflowNode[] = [];
    const connections: ParsedWorkflowConnection[] = [];
    const nodeTypes = new Set<string>();

    // Parse nodes
    if (workflow.nodes) {
      for (const node of workflow.nodes) {
        const parsedNode = this.parseNode(node);
        nodes.push(parsedNode);
        nodeTypes.add(parsedNode.nodeType);
      }
    }

    // Parse connections
    if (workflow.connections) {
      for (const [fromNodeName, outputs] of Object.entries(workflow.connections)) {
        const outputMap = outputs as Record<string, any[][]>;
        
        for (const [outputName, targetArrays] of Object.entries(outputMap)) {
          for (let outputIndex = 0; outputIndex < targetArrays.length; outputIndex++) {
            const targets = targetArrays[outputIndex];
            
            for (let inputIndex = 0; inputIndex < targets.length; inputIndex++) {
              const target = targets[inputIndex];
              connections.push({
                from: fromNodeName,
                to: target.node,
                output: outputName,
                index: inputIndex,
              });
            }
          }
        }
      }
    }

    // Infer trigger type
    const triggerNode = nodes.find(n => n.isTrigger);
    const triggerType = triggerNode?.type || 'Manual';

    // Infer purpose from node types and names
    const purpose = this.inferWorkflowPurpose(nodes, connections);

    return {
      id: workflow.id || workflow.name,
      name: workflow.name || 'Unnamed Workflow',
      active: workflow.active !== false,
      description: workflow.settings?.executionOrder || undefined,
      tags: workflow.tags?.map((t: any) => t.name || t) || [],
      nodes,
      connections,
      nodeTypes,
      triggerType,
      purpose,
    };
  }

  /**
   * Parse individual node
   */
  private parseNode(node: any): ParsedWorkflowNode {
    const nodeType = node.type || 'unknown';
    const isTrigger = this.isTriggerNode(nodeType);
    
    // Extract expressions from parameters
    const expressions = this.extractExpressions(node.parameters || {});
    
    // Extract key parameters for description
    const keyParams = this.extractKeyParameters(node.parameters || {}, nodeType);

    return {
      id: node.id,
      name: node.name || node.id,
      type: this.simplifyNodeType(nodeType),
      nodeType,
      isTrigger,
      parameters: keyParams,
      expressions,
      description: node.notes || undefined,
      position: node.position || [0, 0],
    };
  }

  /**
   * Extract n8n expressions from parameters
   */
  private extractExpressions(params: any, expressions: string[] = []): string[] {
    if (typeof params === 'string') {
      // Check if it's an n8n expression
      if (params.includes('{{') && params.includes('}}')) {
        expressions.push(params);
      }
    } else if (Array.isArray(params)) {
      params.forEach(item => this.extractExpressions(item, expressions));
    } else if (params && typeof params === 'object') {
      Object.values(params).forEach(value => this.extractExpressions(value, expressions));
    }
    return expressions;
  }

  /**
   * Extract key parameters for description
   */
  private extractKeyParameters(params: any, nodeType: string): Record<string, any> {
    const keyParams: Record<string, any> = {};

    // Extract important parameters based on node type
    if (nodeType.includes('httpRequest')) {
      keyParams.method = params.method;
      keyParams.url = params.url;
      keyParams.authentication = params.authentication;
    } else if (nodeType.includes('set')) {
      keyParams.values = params.values;
    } else if (nodeType.includes('if')) {
      keyParams.conditions = params.conditions;
      keyParams.combinator = params.combinator;
    } else if (nodeType.includes('code') || nodeType.includes('function')) {
      keyParams.jsCode = params.jsCode?.substring(0, 200); // First 200 chars
    } else if (nodeType.includes('openai') || nodeType.includes('ai')) {
      keyParams.model = params.model;
      keyParams.resource = params.resource;
      keyParams.operation = params.operation;
    } else if (nodeType.includes('postgres') || nodeType.includes('database')) {
      keyParams.operation = params.operation;
      keyParams.table = params.table;
    }

    return keyParams;
  }

  /**
   * Simplify node type for readability
   */
  private simplifyNodeType(nodeType: string): string {
    return nodeType
      .replace('n8n-nodes-base.', '')
      .replace('@n8n/n8n-nodes-langchain.', 'langchain.')
      .replace('Trigger', '')
      .toLowerCase();
  }

  /**
   * Check if node is a trigger
   */
  private isTriggerNode(nodeType: string): boolean {
    return nodeType.includes('Trigger') || 
           nodeType.includes('Webhook') ||
           nodeType.includes('Schedule') ||
           nodeType.includes('Cron');
  }

  /**
   * Infer workflow purpose from nodes and connections
   */
  private inferWorkflowPurpose(
    nodes: ParsedWorkflowNode[],
    connections: ParsedWorkflowConnection[]
  ): string {
    const purposes: string[] = [];

    // Check for common patterns
    const hasAI = nodes.some(n => n.nodeType.includes('openai') || n.nodeType.includes('ai'));
    const hasDatabase = nodes.some(n => n.nodeType.includes('postgres') || n.nodeType.includes('database'));
    const hasHTTP = nodes.some(n => n.nodeType.includes('httpRequest'));
    const hasEmail = nodes.some(n => n.nodeType.includes('email'));
    const hasSlack = nodes.some(n => n.nodeType.includes('slack'));
    const hasRAG = nodes.some(n => n.nodeType.includes('rag') || n.nodeType.includes('vector'));

    if (hasAI && hasRAG) {
      purposes.push('AI-powered RAG system');
    }
    if (hasAI && hasDatabase) {
      purposes.push('AI with database integration');
    }
    if (hasHTTP && hasDatabase) {
      purposes.push('API with database');
    }
    if (hasEmail) {
      purposes.push('Email automation');
    }
    if (hasSlack) {
      purposes.push('Slack integration');
    }

    // Check node names for hints
    const nodeNames = nodes.map(n => n.name.toLowerCase()).join(' ');
    if (nodeNames.includes('ingest') || nodeNames.includes('upload')) {
      purposes.push('Data ingestion');
    }
    if (nodeNames.includes('process') || nodeNames.includes('transform')) {
      purposes.push('Data processing');
    }
    if (nodeNames.includes('notify') || nodeNames.includes('alert')) {
      purposes.push('Notifications');
    }

    return purposes.length > 0 
      ? purposes.join(', ')
      : `Workflow automation with ${nodes.length} nodes`;
  }

  /**
   * Create rich knowledge entry for workflow
   */
  private createWorkflowKnowledge(
    parsed: ParsedWorkflow,
    original: any
  ): ExtractedKnowledge {
    // Build comprehensive description
    const description = this.buildWorkflowDescription(parsed, original);

    // Extract code snippets (workflow JSON, key node configs)
    const codeSnippets = this.extractCodeSnippets(parsed, original);

    // Build patterns from node types and connections
    const patterns = this.extractPatterns(parsed);

    // Build use cases
    const useCases = this.extractUseCases(parsed);

    return {
      id: `workflow-${parsed.id}`,
      source: 'n8n-workflows',
      type: 'feature',
      category: 'workflow',
      title: `Workflow: ${parsed.name}`,
      description,
      codeSnippets,
      patterns,
      dependencies: Array.from(parsed.nodeTypes),
      useCases,
      tags: [
        'n8n',
        'workflow',
        parsed.triggerType.toLowerCase(),
        ...(parsed.tags || []),
        parsed.active ? 'active' : 'inactive',
      ],
      extractedAt: new Date().toISOString(),
      filePath: `n8n://workflows/${parsed.id}`,
      contentUrl: `n8n://workflows/${parsed.id}`,
    };
  }

  /**
   * Build comprehensive workflow description
   */
  private buildWorkflowDescription(
    parsed: ParsedWorkflow,
    original: any
  ): string {
    const parts: string[] = [];

    parts.push(`n8n workflow: ${parsed.name}`);
    parts.push(`Status: ${parsed.active ? 'Active' : 'Inactive'}`);
    parts.push(`Trigger: ${parsed.triggerType}`);
    parts.push(`Nodes: ${parsed.nodes.length}`);

    if (parsed.purpose) {
      parts.push(`Purpose: ${parsed.purpose}`);
    }

    if (parsed.tags && parsed.tags.length > 0) {
      parts.push(`Tags: ${parsed.tags.join(', ')}`);
    }

    // Node summary
    const nodeSummary = this.summarizeNodes(parsed.nodes);
    if (nodeSummary) {
      parts.push(`\nNodes:\n${nodeSummary}`);
    }

    // Connection flow
    const flowSummary = this.summarizeFlow(parsed.connections, parsed.nodes);
    if (flowSummary) {
      parts.push(`\nFlow:\n${flowSummary}`);
    }

    // Key expressions
    const allExpressions = parsed.nodes.flatMap(n => n.expressions);
    if (allExpressions.length > 0) {
      parts.push(`\nKey Expressions (${allExpressions.length}):`);
      allExpressions.slice(0, 5).forEach(expr => {
        parts.push(`  - ${expr.substring(0, 100)}${expr.length > 100 ? '...' : ''}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Summarize nodes
   */
  private summarizeNodes(nodes: ParsedWorkflowNode[]): string {
    const summaries: string[] = [];

    // Group by type
    const byType = new Map<string, ParsedWorkflowNode[]>();
    nodes.forEach(node => {
      const type = node.type;
      if (!byType.has(type)) {
        byType.set(type, []);
      }
      byType.get(type)!.push(node);
    });

    // Create summary
    byType.forEach((nodesOfType, type) => {
      if (nodesOfType.length === 1) {
        summaries.push(`  - ${nodesOfType[0].name} (${type})`);
      } else {
        summaries.push(`  - ${nodesOfType.length}x ${type}: ${nodesOfType.map(n => n.name).join(', ')}`);
      }
    });

    return summaries.join('\n');
  }

  /**
   * Summarize workflow flow
   */
  private summarizeFlow(
    connections: ParsedWorkflowConnection[],
    nodes: ParsedWorkflowNode[]
  ): string {
    // Find trigger
    const trigger = nodes.find(n => n.isTrigger);
    if (!trigger) return '';

    // Build flow path
    const flow: string[] = [];
    const visited = new Set<string>();

    const traverse = (nodeName: string, depth: number = 0): void => {
      if (depth > 10 || visited.has(nodeName)) return; // Prevent infinite loops
      visited.add(nodeName);

      const node = nodes.find(n => n.name === nodeName);
      if (!node) return;

      const indent = '  '.repeat(depth);
      flow.push(`${indent}→ ${node.name} (${node.type})`);

      // Find connections from this node
      const outgoing = connections.filter(c => c.from === nodeName);
      outgoing.forEach(conn => {
        traverse(conn.to, depth + 1);
      });
    };

    if (trigger) {
      traverse(trigger.name);
    }

    return flow.join('\n');
  }

  /**
   * Extract code snippets
   */
  private extractCodeSnippets(
    parsed: ParsedWorkflow,
    original: any
  ): ExtractedKnowledge['codeSnippets'] {
    const snippets: ExtractedKnowledge['codeSnippets'] = [];

    // Add workflow structure
    snippets.push({
      file: `workflow-${parsed.id}.json`,
      language: 'json',
      code: JSON.stringify({
        name: parsed.name,
        nodes: parsed.nodes.map(n => ({
          name: n.name,
          type: n.type,
          isTrigger: n.isTrigger,
        })),
        connections: parsed.connections.length,
      }, null, 2),
      explanation: `Workflow structure: ${parsed.name}`,
    });

    // Add key node configurations
    parsed.nodes.slice(0, 5).forEach(node => {
      if (Object.keys(node.parameters).length > 0) {
        snippets.push({
          file: `node-${node.name}.json`,
          language: 'json',
          code: JSON.stringify({
            name: node.name,
            type: node.type,
            parameters: node.parameters,
          }, null, 2),
          explanation: `Node configuration: ${node.name}`,
        });
      }
    });

    return snippets;
  }

  /**
   * Extract patterns
   */
  private extractPatterns(parsed: ParsedWorkflow): string[] {
    const patterns: string[] = [];

    // Node type patterns
    parsed.nodeTypes.forEach(type => {
      patterns.push(`Uses ${this.simplifyNodeType(type)}`);
    });

    // Connection patterns
    if (parsed.connections.length > 0) {
      patterns.push(`${parsed.connections.length} connections`);
    }

    // Expression patterns
    const hasExpressions = parsed.nodes.some(n => n.expressions.length > 0);
    if (hasExpressions) {
      patterns.push('Uses n8n expressions');
    }

    // Trigger patterns
    if (parsed.triggerType !== 'Manual') {
      patterns.push(`Triggered by ${parsed.triggerType}`);
    }

    return patterns;
  }

  /**
   * Extract use cases
   */
  private extractUseCases(parsed: ParsedWorkflow): string[] {
    const useCases: string[] = [];

    // Infer from node types
    if (parsed.nodeTypes.has('httpRequest') || Array.from(parsed.nodeTypes).some(t => t.includes('httpRequest'))) {
      useCases.push('API integration');
    }
    if (Array.from(parsed.nodeTypes).some(t => t.includes('postgres') || t.includes('database'))) {
      useCases.push('Database operations');
    }
    if (Array.from(parsed.nodeTypes).some(t => t.includes('openai') || t.includes('ai'))) {
      useCases.push('AI automation');
    }
    if (Array.from(parsed.nodeTypes).some(t => t.includes('email'))) {
      useCases.push('Email automation');
    }
    if (Array.from(parsed.nodeTypes).some(t => t.includes('slack'))) {
      useCases.push('Slack integration');
    }

    // Add general use cases
    useCases.push('Workflow automation');
    useCases.push('Process orchestration');

    return useCases;
  }
}












