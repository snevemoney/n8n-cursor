#!/usr/bin/env node

/**
 * N8N Validation MCP Server - Comprehensive workflow and node validation
 * Provides deep validation capabilities for n8n workflows before deployment
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

const { VALIDATION_LEVEL = 'standard' } = process.env;

class ValidationMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'n8n-validator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
    this.loadNodeDefinitions();
  }

  loadNodeDefinitions() {
    // Common n8n node types and their requirements
    this.nodeDefinitions = {
      'n8n-nodes-base.webhook': {
        required: ['httpMethod'],
        optional: ['path', 'options'],
        outputs: ['main'],
        category: 'trigger'
      },
      'n8n-nodes-base.httpRequest': {
        required: ['url'],
        optional: ['method', 'headers', 'body', 'authentication'],
        outputs: ['main'],
        category: 'action',
        credentialTypes: ['httpBasicAuth', 'httpHeaderAuth', 'oAuth2Api']
      },
      'n8n-nodes-base.openAi': {
        required: ['resource', 'operation'],
        optional: ['model', 'messages', 'temperature', 'maxTokens'],
        outputs: ['main'],
        category: 'action',
        credentialTypes: ['openAiApi']
      },
      'n8n-nodes-base.postgres': {
        required: ['operation'],
        optional: ['query', 'schema', 'table'],
        outputs: ['main'],
        category: 'action',
        credentialTypes: ['postgres']
      },
      'n8n-nodes-base.function': {
        required: ['functionCode'],
        optional: [],
        outputs: ['main'],
        category: 'action'
      },
      'n8n-nodes-base.switch': {
        required: ['dataType', 'value1', 'rules'],
        optional: [],
        outputs: ['main', 'fallback'],
        category: 'logic'
      },
      'n8n-nodes-base.if': {
        required: ['conditions'],
        optional: [],
        outputs: ['true', 'false'],
        category: 'logic'
      },
      'n8n-nodes-base.emailSend': {
        required: ['toEmail', 'subject', 'message'],
        optional: ['fromEmail', 'attachments'],
        outputs: ['main'],
        category: 'action',
        credentialTypes: ['smtp']
      }
    };
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'validate.nodeMinimal',
          description: 'Quick validation of node configuration - checks required fields only',
          inputSchema: {
            type: 'object',
            required: ['nodeType', 'config'],
            properties: {
              nodeType: { type: 'string', description: 'Node type (e.g., n8n-nodes-base.httpRequest)' },
              config: { type: 'object', description: 'Node configuration parameters' },
            },
          },
        },
        {
          name: 'validate.nodeOperation',
          description: 'Full operation-aware node validation with context checking',
          inputSchema: {
            type: 'object',
            required: ['nodeType', 'config', 'profile'],
            properties: {
              nodeType: { type: 'string', description: 'Node type' },
              config: { type: 'object', description: 'Complete node configuration' },
              profile: { 
                type: 'string', 
                enum: ['minimal', 'runtime', 'full'],
                description: 'Validation profile depth'
              },
              context: { type: 'object', description: 'Workflow context for validation' },
            },
          },
        },
        {
          name: 'validate.workflow',
          description: 'Complete workflow validation including connections and structure',
          inputSchema: {
            type: 'object',
            required: ['workflow'],
            properties: {
              workflow: { type: 'object', description: 'Complete workflow JSON' },
              strictMode: { type: 'boolean', default: false, description: 'Enable strict validation' },
              checkCredentials: { type: 'boolean', default: true, description: 'Validate credential references' },
            },
          },
        },
        {
          name: 'validate.workflowConnections',
          description: 'Validate workflow structure and AI tool connections',
          inputSchema: {
            type: 'object',
            required: ['workflow'],
            properties: {
              workflow: { type: 'object', description: 'Workflow JSON' },
              checkAiConnections: { type: 'boolean', default: true, description: 'Validate AI agent connections' },
            },
          },
        },
        {
          name: 'validate.workflowExpressions',
          description: 'Validate all n8n expressions in workflow',
          inputSchema: {
            type: 'object',
            required: ['workflow'],
            properties: {
              workflow: { type: 'object', description: 'Workflow JSON' },
              checkSyntax: { type: 'boolean', default: true, description: 'Check expression syntax' },
              checkReferences: { type: 'boolean', default: true, description: 'Check node references' },
            },
          },
        },
        {
          name: 'validate.nodeCompatibility',
          description: 'Check node compatibility with n8n version and other nodes',
          inputSchema: {
            type: 'object',
            required: ['nodeType'],
            properties: {
              nodeType: { type: 'string', description: 'Node type to check' },
              n8nVersion: { type: 'string', description: 'Target n8n version' },
              connectedNodes: { type: 'array', items: { type: 'string' }, description: 'Connected node types' },
            },
          },
        },
        {
          name: 'validate.credentialBinding',
          description: 'Validate credential bindings for nodes',
          inputSchema: {
            type: 'object',
            required: ['nodeType', 'credentials'],
            properties: {
              nodeType: { type: 'string', description: 'Node type' },
              credentials: { type: 'object', description: 'Credential configuration' },
              availableCredentials: { type: 'array', description: 'Available credential IDs' },
            },
          },
        },
        {
          name: 'optimize.workflowPerformance',
          description: 'Analyze workflow for performance optimizations',
          inputSchema: {
            type: 'object',
            required: ['workflow'],
            properties: {
              workflow: { type: 'object', description: 'Workflow JSON' },
              checkParallelism: { type: 'boolean', default: true, description: 'Check for parallelization opportunities' },
              checkBottlenecks: { type: 'boolean', default: true, description: 'Identify potential bottlenecks' },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'validate.nodeMinimal':
            return await this.validateNodeMinimal(args);
          case 'validate.nodeOperation':
            return await this.validateNodeOperation(args);
          case 'validate.workflow':
            return await this.validateWorkflow(args);
          case 'validate.workflowConnections':
            return await this.validateWorkflowConnections(args);
          case 'validate.workflowExpressions':
            return await this.validateWorkflowExpressions(args);
          case 'validate.nodeCompatibility':
            return await this.validateNodeCompatibility(args);
          case 'validate.credentialBinding':
            return await this.validateCredentialBinding(args);
          case 'optimize.workflowPerformance':
            return await this.optimizeWorkflowPerformance(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Validation failed: ${error.message}`);
      }
    });
  }

  async validateNodeMinimal(args) {
    const { nodeType, config } = args;
    const errors = [];
    const warnings = [];

    const nodeDefinition = this.nodeDefinitions[nodeType];
    if (!nodeDefinition) {
      warnings.push(`Unknown node type: ${nodeType} - using generic validation`);
    } else {
      // Check required parameters
      for (const required of nodeDefinition.required) {
        if (!config.parameters || !(required in config.parameters)) {
          errors.push(`Missing required parameter: ${required}`);
        }
      }

      // Check credential requirements
      if (nodeDefinition.credentialTypes && nodeDefinition.credentialTypes.length > 0) {
        if (!config.credentials) {
          errors.push(`Node requires credentials of type: ${nodeDefinition.credentialTypes.join(' or ')}`);
        } else {
          const hasValidCredential = nodeDefinition.credentialTypes.some(credType => 
            config.credentials[credType]
          );
          if (!hasValidCredential) {
            errors.push(`Node requires credentials of type: ${nodeDefinition.credentialTypes.join(' or ')}`);
          }
        }
      }
    }

    // Basic structure validation
    if (!config.id) errors.push('Node must have an id');
    if (!config.name) warnings.push('Node should have a name');
    if (!config.position || !Array.isArray(config.position) || config.position.length !== 2) {
      errors.push('Node must have valid position [x, y]');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            valid: errors.length === 0,
            errors,
            warnings,
            nodeType,
            validationLevel: 'minimal',
          }, null, 2),
        },
      ],
    };
  }

  async validateNodeOperation(args) {
    const { nodeType, config, profile, context } = args;
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // First run minimal validation
    const minimalResult = await this.validateNodeMinimal({ nodeType, config });
    const minimalData = JSON.parse(minimalResult.content[0].text);
    errors.push(...minimalData.errors);
    warnings.push(...minimalData.warnings);

    const nodeDefinition = this.nodeDefinitions[nodeType];

    if (profile === 'runtime' || profile === 'full') {
      // Runtime-specific validation
      if (nodeType === 'n8n-nodes-base.httpRequest') {
        if (config.parameters?.url && !this.isValidUrl(config.parameters.url)) {
          errors.push('Invalid URL format');
        }
        if (config.parameters?.method && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(config.parameters.method)) {
          errors.push('Invalid HTTP method');
        }
        if (!config.parameters?.authentication && config.parameters?.url?.includes('api')) {
          warnings.push('API requests typically require authentication');
        }
      }

      if (nodeType === 'n8n-nodes-base.openAi') {
        if (!config.parameters?.model) {
          warnings.push('OpenAI node should specify a model');
        }
        if (config.parameters?.temperature && (config.parameters.temperature < 0 || config.parameters.temperature > 2)) {
          errors.push('OpenAI temperature must be between 0 and 2');
        }
      }

      if (nodeType === 'n8n-nodes-base.function') {
        if (config.parameters?.functionCode) {
          const codeIssues = this.validateJavaScriptCode(config.parameters.functionCode);
          errors.push(...codeIssues.errors);
          warnings.push(...codeIssues.warnings);
        }
      }
    }

    if (profile === 'full') {
      // Full validation including best practices
      if (nodeDefinition?.category === 'trigger' && context?.isFirstNode === false) {
        warnings.push('Trigger nodes should typically be the first node in a workflow');
      }

      if (nodeDefinition?.outputs?.includes('main') && context?.hasConnections === false) {
        warnings.push('Node has outputs but no connections defined');
      }

      // Check for performance optimizations
      if (nodeType === 'n8n-nodes-base.httpRequest' && config.parameters?.url?.includes('localhost')) {
        warnings.push('Using localhost URLs may cause issues in production');
      }

      // Security checks
      if (config.parameters && JSON.stringify(config.parameters).includes('password')) {
        errors.push('Passwords should not be hardcoded in parameters - use credentials instead');
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            valid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            nodeType,
            validationLevel: profile,
            performanceScore: this.calculateNodePerformanceScore(nodeType, config),
          }, null, 2),
        },
      ],
    };
  }

  async validateWorkflow(args) {
    const { workflow, strictMode, checkCredentials } = args;
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Structure validation
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array');
      return this.formatValidationResult(false, errors, warnings, suggestions);
    }

    if (!workflow.connections || typeof workflow.connections !== 'object') {
      errors.push('Workflow must have a connections object');
    }

    // Node validation
    const nodeIds = new Set();
    const triggerNodes = [];
    
    for (const node of workflow.nodes) {
      if (!node.id) {
        errors.push('All nodes must have an id');
        continue;
      }

      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node id: ${node.id}`);
      }
      nodeIds.add(node.id);

      // Validate individual node
      const nodeValidation = await this.validateNodeOperation({
        nodeType: node.type,
        config: node,
        profile: strictMode ? 'full' : 'runtime',
      });
      const nodeResult = JSON.parse(nodeValidation.content[0].text);
      
      if (!nodeResult.valid) {
        errors.push(`Node ${node.id}: ${nodeResult.errors.join(', ')}`);
      }
      warnings.push(...nodeResult.warnings.map(w => `Node ${node.id}: ${w}`));

      // Track trigger nodes
      const nodeDefinition = this.nodeDefinitions[node.type];
      if (nodeDefinition?.category === 'trigger') {
        triggerNodes.push(node.id);
      }
    }

    // Connection validation
    for (const [sourceNodeId, connections] of Object.entries(workflow.connections)) {
      if (!nodeIds.has(sourceNodeId)) {
        errors.push(`Connection source node not found: ${sourceNodeId}`);
        continue;
      }

      if (connections.main) {
        for (let outputIndex = 0; outputIndex < connections.main.length; outputIndex++) {
          const outputConnections = connections.main[outputIndex];
          for (const connection of outputConnections) {
            if (!nodeIds.has(connection.node)) {
              errors.push(`Connection target node not found: ${connection.node}`);
            }
            if (typeof connection.type !== 'string') {
              errors.push(`Invalid connection type for ${sourceNodeId} -> ${connection.node}`);
            }
            if (typeof connection.index !== 'number') {
              errors.push(`Invalid connection index for ${sourceNodeId} -> ${connection.node}`);
            }
          }
        }
      }
    }

    // Workflow structure validation
    if (triggerNodes.length === 0) {
      warnings.push('Workflow has no trigger nodes - it can only be executed manually');
    } else if (triggerNodes.length > 1) {
      warnings.push('Workflow has multiple trigger nodes - only one will be active');
    }

    // Check for isolated nodes
    const connectedNodes = new Set();
    for (const connections of Object.values(workflow.connections)) {
      if (connections.main) {
        for (const outputConnections of connections.main) {
          for (const connection of outputConnections) {
            connectedNodes.add(connection.node);
          }
        }
      }
    }

    const sourceNodes = new Set(Object.keys(workflow.connections));
    for (const nodeId of nodeIds) {
      if (!connectedNodes.has(nodeId) && !sourceNodes.has(nodeId) && !triggerNodes.includes(nodeId)) {
        warnings.push(`Isolated node detected: ${nodeId}`);
      }
    }

    // Credential validation
    if (checkCredentials) {
      const credentialRefs = new Set();
      for (const node of workflow.nodes) {
        if (node.credentials) {
          for (const [credType, credConfig] of Object.entries(node.credentials)) {
            if (credConfig.id) {
              credentialRefs.add(credConfig.id);
            }
          }
        }
      }
      if (credentialRefs.size > 0) {
        suggestions.push(`Workflow references ${credentialRefs.size} credentials - ensure they exist in target environment`);
      }
    }

    return this.formatValidationResult(errors.length === 0, errors, warnings, suggestions, {
      nodeCount: workflow.nodes.length,
      connectionCount: Object.keys(workflow.connections).length,
      triggerCount: triggerNodes.length,
      credentialCount: checkCredentials ? Array.from(new Set()).length : undefined,
    });
  }

  async validateWorkflowConnections(args) {
    const { workflow, checkAiConnections } = args;
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!workflow.nodes || !workflow.connections) {
      errors.push('Workflow must have nodes and connections');
      return this.formatValidationResult(false, errors, warnings, suggestions);
    }

    // Build connection graph
    const graph = new Map();
    const incomingConnections = new Map();

    for (const node of workflow.nodes) {
      graph.set(node.id, []);
      incomingConnections.set(node.id, []);
    }

    for (const [sourceId, connections] of Object.entries(workflow.connections)) {
      if (connections.main) {
        for (const outputConnections of connections.main) {
          for (const connection of outputConnections) {
            graph.get(sourceId)?.push(connection.node);
            incomingConnections.get(connection.node)?.push(sourceId);
          }
        }
      }
    }

    // Check for cycles
    const cycles = this.detectCycles(graph);
    if (cycles.length > 0) {
      errors.push(`Circular dependencies detected: ${cycles.join(', ')}`);
    }

    // AI agent connection validation
    if (checkAiConnections) {
      const aiNodes = workflow.nodes.filter(node => 
        node.type === 'n8n-nodes-base.openAi' || 
        node.type.includes('ai') ||
        node.type.includes('langchain')
      );

      for (const aiNode of aiNodes) {
        const incoming = incomingConnections.get(aiNode.id) || [];
        const outgoing = graph.get(aiNode.id) || [];

        if (incoming.length === 0) {
          warnings.push(`AI node ${aiNode.id} has no input connections`);
        }
        if (outgoing.length === 0) {
          warnings.push(`AI node ${aiNode.id} has no output connections`);
        }

        // Check for proper AI chaining
        if (aiNode.type === 'n8n-nodes-base.openAi' && incoming.length > 0) {
          const inputNode = workflow.nodes.find(n => n.id === incoming[0]);
          if (inputNode?.type !== 'n8n-nodes-base.function' && 
              inputNode?.type !== 'n8n-nodes-base.set' &&
              !inputNode?.type.includes('trigger')) {
            suggestions.push(`Consider adding data preparation node before AI node ${aiNode.id}`);
          }
        }
      }
    }

    // Check execution flow
    const reachableNodes = this.findReachableNodes(graph);
    const unreachableNodes = workflow.nodes.filter(node => !reachableNodes.has(node.id));
    
    if (unreachableNodes.length > 0) {
      warnings.push(`Unreachable nodes: ${unreachableNodes.map(n => n.id).join(', ')}`);
    }

    return this.formatValidationResult(errors.length === 0, errors, warnings, suggestions, {
      totalNodes: workflow.nodes.length,
      connectedNodes: reachableNodes.size,
      aiNodes: checkAiConnections ? aiNodes.length : undefined,
      cyclesDetected: cycles.length,
    });
  }

  async validateWorkflowExpressions(args) {
    const { workflow, checkSyntax, checkReferences } = args;
    const errors = [];
    const warnings = [];
    const suggestions = [];

    const workflowStr = JSON.stringify(workflow);
    const expressionRegex = /\{\{([^}]+)\}\}/g;
    const expressions = [];
    
    let match;
    while ((match = expressionRegex.exec(workflowStr)) !== null) {
      expressions.push({
        expression: match[0],
        content: match[1].trim(),
        position: match.index,
      });
    }

    const nodeIds = new Set(workflow.nodes.map(n => n.id));

    for (const expr of expressions) {
      if (checkSyntax) {
        // Basic syntax validation
        if (expr.content.includes('$node[') && !expr.content.includes('].json')) {
          warnings.push(`Potentially incomplete node reference: ${expr.expression}`);
        }

        // Check for common mistakes
        if (expr.content.includes('$json.') && expr.content.includes('$node[')) {
          warnings.push(`Mixed data access patterns in: ${expr.expression}`);
        }

        // Check for unescaped quotes
        if ((expr.content.match(/'/g) || []).length % 2 !== 0) {
          errors.push(`Unmatched quotes in: ${expr.expression}`);
        }
      }

      if (checkReferences) {
        // Node reference validation
        const nodeRefRegex = /\$node\[["']([^"']+)["']\]/g;
        let nodeMatch;
        
        while ((nodeMatch = nodeRefRegex.exec(expr.content)) !== null) {
          const referencedNodeId = nodeMatch[1];
          if (!nodeIds.has(referencedNodeId)) {
            errors.push(`Invalid node reference '${referencedNodeId}' in: ${expr.expression}`);
          }
        }

        // Check for potentially unsafe expressions
        if (expr.content.includes('eval(') || expr.content.includes('Function(')) {
          errors.push(`Potentially unsafe expression: ${expr.expression}`);
        }
      }
    }

    // Performance suggestions
    if (expressions.length > 50) {
      suggestions.push('Workflow has many expressions - consider optimizing for performance');
    }

    const complexExpressions = expressions.filter(e => e.content.length > 100);
    if (complexExpressions.length > 0) {
      suggestions.push(`${complexExpressions.length} complex expressions detected - consider breaking into functions`);
    }

    return this.formatValidationResult(errors.length === 0, errors, warnings, suggestions, {
      totalExpressions: expressions.length,
      complexExpressions: complexExpressions.length,
      nodeReferences: expressions.filter(e => e.content.includes('$node[')).length,
    });
  }

  async validateNodeCompatibility(args) {
    const { nodeType, n8nVersion, connectedNodes } = args;
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Version compatibility (simplified)
    const nodeDefinition = this.nodeDefinitions[nodeType];
    if (!nodeDefinition) {
      warnings.push(`Unknown node type: ${nodeType} - compatibility unknown`);
    }

    // Check for deprecated patterns
    if (nodeType === 'n8n-nodes-base.function' && VALIDATION_LEVEL === 'strict') {
      suggestions.push('Consider using Code node instead of Function node for better performance');
    }

    // Connection compatibility
    if (connectedNodes) {
      for (const connectedNodeType of connectedNodes) {
        const compatibility = this.checkNodeCompatibility(nodeType, connectedNodeType);
        if (!compatibility.compatible) {
          warnings.push(`Potential compatibility issue between ${nodeType} and ${connectedNodeType}: ${compatibility.reason}`);
        }
      }
    }

    return this.formatValidationResult(errors.length === 0, errors, warnings, suggestions, {
      nodeType,
      compatible: errors.length === 0,
      n8nVersion,
    });
  }

  async validateCredentialBinding(args) {
    const { nodeType, credentials, availableCredentials } = args;
    const errors = [];
    const warnings = [];

    const nodeDefinition = this.nodeDefinitions[nodeType];
    if (!nodeDefinition) {
      warnings.push(`Unknown node type: ${nodeType}`);
      return this.formatValidationResult(true, errors, warnings, []);
    }

    if (nodeDefinition.credentialTypes && nodeDefinition.credentialTypes.length > 0) {
      if (!credentials) {
        errors.push(`Node ${nodeType} requires credentials`);
      } else {
        const hasValidCredential = nodeDefinition.credentialTypes.some(credType =>
          credentials[credType] && credentials[credType].id
        );
        
        if (!hasValidCredential) {
          errors.push(`Node requires credential of type: ${nodeDefinition.credentialTypes.join(' or ')}`);
        }

        // Check if credential IDs exist
        if (availableCredentials) {
          for (const [credType, credConfig] of Object.entries(credentials)) {
            if (credConfig.id && !availableCredentials.includes(credConfig.id)) {
              errors.push(`Credential ID not found: ${credConfig.id}`);
            }
          }
        }
      }
    }

    return this.formatValidationResult(errors.length === 0, errors, warnings, []);
  }

  async optimizeWorkflowPerformance(args) {
    const { workflow, checkParallelism, checkBottlenecks } = args;
    const suggestions = [];
    const optimizations = [];

    if (checkParallelism) {
      // Find nodes that could run in parallel
      const parallelOpportunities = this.findParallelizationOpportunities(workflow);
      for (const opportunity of parallelOpportunities) {
        suggestions.push(`Nodes ${opportunity.nodes.join(', ')} could run in parallel`);
        optimizations.push({
          type: 'parallelization',
          nodes: opportunity.nodes,
          estimatedSpeedup: opportunity.speedup,
        });
      }
    }

    if (checkBottlenecks) {
      // Identify potential bottlenecks
      const bottlenecks = this.identifyBottlenecks(workflow);
      for (const bottleneck of bottlenecks) {
        suggestions.push(`Potential bottleneck at node ${bottleneck.nodeId}: ${bottleneck.reason}`);
        optimizations.push({
          type: 'bottleneck',
          nodeId: bottleneck.nodeId,
          severity: bottleneck.severity,
          recommendations: bottleneck.recommendations,
        });
      }
    }

    // General performance suggestions
    const functionNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.function');
    if (functionNodes.length > 5) {
      suggestions.push('Consider consolidating multiple Function nodes for better performance');
    }

    const httpNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');
    for (const httpNode of httpNodes) {
      if (!httpNode.parameters?.options?.timeout) {
        suggestions.push(`Consider setting timeout for HTTP node ${httpNode.id}`);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            optimizationScore: this.calculateOptimizationScore(workflow),
            suggestions,
            optimizations,
            performanceMetrics: {
              estimatedExecutionTime: this.estimateExecutionTime(workflow),
              memoryUsage: this.estimateMemoryUsage(workflow),
              parallelizationPotential: parallelOpportunities?.length || 0,
            },
          }, null, 2),
        },
      ],
    };
  }

  // Helper methods
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateJavaScriptCode(code) {
    const errors = [];
    const warnings = [];

    // Basic syntax checks
    if (code.includes('eval(')) {
      errors.push('Use of eval() is not allowed');
    }
    if (code.includes('require(')) {
      errors.push('Use of require() is not allowed in Function nodes');
    }
    if (!code.includes('return')) {
      warnings.push('Function code should have a return statement');
    }

    // Check for common mistakes
    if (code.includes('$input.first().json') && code.includes('$json')) {
      warnings.push('Mixing $input.first().json and $json - choose one pattern');
    }

    return { errors, warnings };
  }

  calculateNodePerformanceScore(nodeType, config) {
    let score = 100;

    if (nodeType === 'n8n-nodes-base.httpRequest') {
      if (!config.parameters?.options?.timeout) score -= 10;
      if (config.parameters?.url?.includes('localhost')) score -= 20;
    }

    if (nodeType === 'n8n-nodes-base.function') {
      const codeLength = config.parameters?.functionCode?.length || 0;
      if (codeLength > 1000) score -= 15;
    }

    return Math.max(0, score);
  }

  detectCycles(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (nodeId, path) => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).join(' -> '));
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path, neighbor]);
      }

      recursionStack.delete(nodeId);
    };

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, [nodeId]);
      }
    }

    return cycles;
  }

  findReachableNodes(graph) {
    const reachable = new Set();
    const triggerNodes = Array.from(graph.keys()).filter(nodeId => {
      // Simplified trigger detection
      return Array.from(graph.values()).every(neighbors => !neighbors.includes(nodeId));
    });

    const dfs = (nodeId) => {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }
    };

    for (const triggerId of triggerNodes) {
      dfs(triggerId);
    }

    return reachable;
  }

  checkNodeCompatibility(nodeType1, nodeType2) {
    // Simplified compatibility checking
    const incompatiblePairs = [
      ['n8n-nodes-base.webhook', 'n8n-nodes-base.webhook'], // Multiple webhooks
    ];

    for (const [type1, type2] of incompatiblePairs) {
      if ((nodeType1 === type1 && nodeType2 === type2) || 
          (nodeType1 === type2 && nodeType2 === type1)) {
        return { 
          compatible: false, 
          reason: 'These node types should not be directly connected' 
        };
      }
    }

    return { compatible: true };
  }

  findParallelizationOpportunities(workflow) {
    // Simplified parallelization detection
    const opportunities = [];
    
    // Find nodes that don't depend on each other
    const graph = new Map();
    for (const node of workflow.nodes) {
      graph.set(node.id, []);
    }

    for (const [sourceId, connections] of Object.entries(workflow.connections)) {
      if (connections.main) {
        for (const outputConnections of connections.main) {
          for (const connection of outputConnections) {
            graph.get(sourceId)?.push(connection.node);
          }
        }
      }
    }

    // Find independent branches
    const independentGroups = this.findIndependentBranches(graph);
    for (const group of independentGroups) {
      if (group.length > 1) {
        opportunities.push({
          nodes: group,
          speedup: Math.min(group.length, 4), // Assume max 4x speedup
        });
      }
    }

    return opportunities;
  }

  findIndependentBranches(graph) {
    // Simplified implementation
    const branches = [];
    const visited = new Set();

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        const branch = [];
        const stack = [nodeId];
        
        while (stack.length > 0) {
          const current = stack.pop();
          if (!visited.has(current)) {
            visited.add(current);
            branch.push(current);
            stack.push(...(graph.get(current) || []));
          }
        }
        
        if (branch.length > 0) {
          branches.push(branch);
        }
      }
    }

    return branches;
  }

  identifyBottlenecks(workflow) {
    const bottlenecks = [];

    for (const node of workflow.nodes) {
      if (node.type === 'n8n-nodes-base.httpRequest') {
        bottlenecks.push({
          nodeId: node.id,
          reason: 'HTTP requests can be slow',
          severity: 'medium',
          recommendations: ['Add timeout', 'Consider caching', 'Use connection pooling'],
        });
      }

      if (node.type === 'n8n-nodes-base.function' && 
          node.parameters?.functionCode?.length > 1000) {
        bottlenecks.push({
          nodeId: node.id,
          reason: 'Large function code may impact performance',
          severity: 'low',
          recommendations: ['Split into smaller functions', 'Optimize algorithms'],
        });
      }
    }

    return bottlenecks;
  }

  calculateOptimizationScore(workflow) {
    let score = 100;
    
    const functionNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.function');
    score -= functionNodes.length * 2; // Function nodes add overhead

    const httpNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');
    score -= httpNodes.length * 5; // HTTP nodes are potentially slow

    return Math.max(0, score);
  }

  estimateExecutionTime(workflow) {
    let totalTime = 0;
    
    for (const node of workflow.nodes) {
      switch (node.type) {
        case 'n8n-nodes-base.httpRequest':
          totalTime += 1000; // 1 second for HTTP requests
          break;
        case 'n8n-nodes-base.function':
          totalTime += 100; // 100ms for function execution
          break;
        case 'n8n-nodes-base.openAi':
          totalTime += 3000; // 3 seconds for AI requests
          break;
        default:
          totalTime += 50; // 50ms for other nodes
      }
    }

    return totalTime;
  }

  estimateMemoryUsage(workflow) {
    let memory = 0;
    
    for (const node of workflow.nodes) {
      if (node.type === 'n8n-nodes-base.function') {
        memory += 10; // 10MB per function node
      } else {
        memory += 2; // 2MB per regular node
      }
    }

    return memory;
  }

  formatValidationResult(valid, errors, warnings, suggestions, metadata = {}) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            valid,
            errors,
            warnings,
            suggestions,
            metadata,
            validatedAt: new Date().toISOString(),
            validationLevel: VALIDATION_LEVEL,
          }, null, 2),
        },
      ],
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Validation Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[N8N Validation MCP Server] Server running on stdio');
  }
}

const server = new ValidationMcpServer();
server.run().catch(console.error);
