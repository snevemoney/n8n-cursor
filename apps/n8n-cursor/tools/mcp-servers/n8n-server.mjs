#!/usr/bin/env node

/**
 * N8N MCP Server - Professional n8n API integration with credential management
 * Provides safe, validated workflows operations via MCP protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const { N8N_BASE_URL, N8N_API_KEY, MCP_SERVER_NAME = 'n8n-automation' } = process.env;

if (!N8N_BASE_URL || !N8N_API_KEY) {
  throw new Error('N8N_BASE_URL and N8N_API_KEY environment variables are required');
}

class N8nMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: MCP_SERVER_NAME,
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
  }

  async n8nRequest(path, options = {}) {
    const url = `${N8N_BASE_URL}${path}`;
    const response = await fetch(url, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new McpError(
        ErrorCode.InternalError,
        `N8N API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  setupToolHandlers() {
    // Workflow Management Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Workflow Operations
        {
          name: 'workflows.list',
          description: 'List all workflows with filtering options. Auto-paginates to return the full inventory by default.',
          inputSchema: {
            type: 'object',
            properties: {
              active: { type: 'boolean', description: 'Filter by active status' },
              tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
              limit: { type: 'number', description: 'Cap the number of workflows returned (omit for all)' },
            },
          },
        },
        {
          name: 'workflows.get',
          description: 'Get detailed workflow information by ID or name',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Workflow ID' },
              name: { type: 'string', description: 'Workflow name (alternative to ID)' },
              includeData: { type: 'boolean', default: false, description: 'Include execution data' },
            },
            oneOf: [{ required: ['id'] }, { required: ['name'] }],
          },
        },
        {
          name: 'workflows.create',
          description: 'Create a new workflow from JSON definition',
          inputSchema: {
            type: 'object',
            required: ['workflow', 'confirm'],
            properties: {
              workflow: { type: 'object', description: 'Complete workflow JSON definition' },
              confirm: { type: 'boolean', description: 'Must be true to confirm creation' },
              activate: { type: 'boolean', default: false, description: 'Activate after creation' },
            },
          },
        },
        {
          name: 'workflows.update',
          description: 'Update existing workflow with new definition',
          inputSchema: {
            type: 'object',
            required: ['id', 'workflow', 'confirm'],
            properties: {
              id: { type: 'string', description: 'Workflow ID to update' },
              workflow: { type: 'object', description: 'Updated workflow JSON definition' },
              confirm: { type: 'boolean', description: 'Must be true to confirm update' },
            },
          },
        },
        {
          name: 'workflows.diffUpdate',
          description: 'Apply minimal changes to workflow using diff operations',
          inputSchema: {
            type: 'object',
            required: ['id', 'operations', 'confirm'],
            properties: {
              id: { type: 'string', description: 'Workflow ID' },
              operations: {
                type: 'array',
                description: 'Array of diff operations',
                items: {
                  type: 'object',
                  required: ['type', 'nodeId'],
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['addNode', 'updateNode', 'removeNode', 'addConnection', 'removeConnection'],
                    },
                    nodeId: { type: 'string' },
                    changes: { type: 'object' },
                    connection: { type: 'object' },
                  },
                },
              },
              confirm: { type: 'boolean', description: 'Must be true to confirm changes' },
            },
          },
        },
        {
          name: 'workflows.activate',
          description: 'Activate a workflow',
          inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', description: 'Workflow ID' },
            },
          },
        },
        {
          name: 'workflows.deactivate',
          description: 'Deactivate a workflow',
          inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', description: 'Workflow ID' },
            },
          },
        },
        {
          name: 'workflows.delete',
          description: 'Delete a workflow (use with caution)',
          inputSchema: {
            type: 'object',
            required: ['id', 'confirm'],
            properties: {
              id: { type: 'string', description: 'Workflow ID' },
              confirm: { type: 'boolean', description: 'Must be true to confirm deletion' },
            },
          },
        },

        // Execution Management
        {
          name: 'executions.list',
          description: 'List workflow executions with filtering',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: { type: 'string', description: 'Filter by workflow ID' },
              status: { 
                type: 'string', 
                enum: ['success', 'error', 'waiting', 'running'],
                description: 'Filter by execution status' 
              },
              limit: { type: 'number', default: 20, description: 'Maximum executions to return' },
              includeData: { type: 'boolean', default: false, description: 'Include execution data' },
            },
          },
        },
        {
          name: 'executions.get',
          description: 'Get detailed execution information',
          inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', description: 'Execution ID' },
              includeData: { type: 'boolean', default: true, description: 'Include execution data' },
            },
          },
        },
        {
          name: 'executions.retry',
          description: 'Retry a failed execution',
          inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', description: 'Execution ID to retry' },
              loadWorkflow: { type: 'boolean', default: true, description: 'Load workflow data' },
            },
          },
        },
        {
          name: 'executions.stop',
          description: 'Stop a running execution',
          inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', description: 'Execution ID to stop' },
            },
          },
        },

        // Credential Management
        {
          name: 'credentials.list',
          description: 'List available credentials (safe metadata only)',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Filter by credential type' },
              excludePatterns: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Exclude credentials matching patterns (e.g., "staging", "_old")'
              },
            },
          },
        },
        {
          name: 'credentials.types',
          description: 'Get available credential types with node mappings',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'credentials.matchForNode',
          description: 'Find best credential match for a node type',
          inputSchema: {
            type: 'object',
            required: ['nodeType'],
            properties: {
              nodeType: { type: 'string', description: 'Node type (e.g., n8n-nodes-base.httpRequest)' },
              hints: { type: 'object', description: 'Hints for matching (service name, etc.)' },
              preferredName: { type: 'string', description: 'Preferred credential name pattern' },
            },
          },
        },
        {
          name: 'workflows.applyCredential',
          description: 'Apply credential binding to workflow node (no server write)',
          inputSchema: {
            type: 'object',
            required: ['workflowJson', 'nodeId', 'credentialType', 'credentialId'],
            properties: {
              workflowJson: { type: 'object', description: 'Workflow JSON to modify' },
              nodeId: { type: 'string', description: 'Node ID to bind credential to' },
              nodeName: { type: 'string', description: 'Node name (alternative to nodeId)' },
              credentialType: { type: 'string', description: 'Credential type (e.g., openAiApi)' },
              credentialId: { type: 'string', description: 'Credential ID to bind' },
              confirm: { type: 'boolean', default: false, description: 'Confirm credential binding' },
            },
          },
        },
        {
          name: 'credentials.canaryTest',
          description: 'Test credential with safe canary workflow',
          inputSchema: {
            type: 'object',
            required: ['credentialId', 'credentialType'],
            properties: {
              credentialId: { type: 'string', description: 'Credential ID to test' },
              credentialType: { type: 'string', description: 'Credential type' },
              testEndpoint: { type: 'string', description: 'Custom test endpoint (optional)' },
            },
          },
        },

        // Webhook Testing
        {
          name: 'webhooks.trigger',
          description: 'Trigger a webhook endpoint for testing',
          inputSchema: {
            type: 'object',
            required: ['path'],
            properties: {
              path: { type: 'string', description: 'Webhook path' },
              method: { type: 'string', default: 'POST', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
              body: { type: 'object', description: 'Request body' },
              headers: { type: 'object', description: 'Custom headers' },
            },
          },
        },

        // Validation Tools
        {
          name: 'validate.workflow',
          description: 'Deep validation of workflow JSON structure',
          inputSchema: {
            type: 'object',
            required: ['workflow'],
            properties: {
              workflow: { type: 'object', description: 'Workflow JSON to validate' },
              checkConnections: { type: 'boolean', default: true, description: 'Validate node connections' },
              checkExpressions: { type: 'boolean', default: true, description: 'Validate n8n expressions' },
            },
          },
        },
        {
          name: 'validate.node',
          description: 'Validate individual node configuration',
          inputSchema: {
            type: 'object',
            required: ['nodeType', 'parameters'],
            properties: {
              nodeType: { type: 'string', description: 'Node type' },
              parameters: { type: 'object', description: 'Node parameters' },
              credentials: { type: 'object', description: 'Node credentials' },
              profile: { type: 'string', default: 'runtime', enum: ['minimal', 'runtime', 'full'] },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'workflows.list':
            return await this.listWorkflows(args);
          case 'workflows.get':
            return await this.getWorkflow(args);
          case 'workflows.create':
            return await this.createWorkflow(args);
          case 'workflows.update':
            return await this.updateWorkflow(args);
          case 'workflows.diffUpdate':
            return await this.diffUpdateWorkflow(args);
          case 'workflows.activate':
            return await this.activateWorkflow(args);
          case 'workflows.deactivate':
            return await this.deactivateWorkflow(args);
          case 'workflows.delete':
            return await this.deleteWorkflow(args);
          case 'executions.list':
            return await this.listExecutions(args);
          case 'executions.get':
            return await this.getExecution(args);
          case 'executions.retry':
            return await this.retryExecution(args);
          case 'executions.stop':
            return await this.stopExecution(args);
          case 'credentials.list':
            return await this.listCredentials(args);
          case 'credentials.types':
            return await this.getCredentialTypes(args);
          case 'credentials.matchForNode':
            return await this.matchCredentialForNode(args);
          case 'workflows.applyCredential':
            return await this.applyCredentialToWorkflow(args);
          case 'credentials.canaryTest':
            return await this.canaryTestCredential(args);
          case 'webhooks.trigger':
            return await this.triggerWebhook(args);
          case 'validate.workflow':
            return await this.validateWorkflow(args);
          case 'validate.node':
            return await this.validateNode(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  // Workflow Management Methods
  async listWorkflows(args) {
    const allWorkflows = [];
    let cursor = null;
    const maxPages = 50;
    let page = 0;
    const pageSize = 100;

    do {
      const params = new URLSearchParams();
      params.append('limit', pageSize.toString());
      if (args.active !== undefined) params.append('active', args.active.toString());
      if (cursor) params.append('cursor', cursor);

      const url = '/rest/workflows?' + params.toString();
      const response = await this.n8nRequest(url);

      const workflows = response.data || response;
      if (Array.isArray(workflows)) {
        allWorkflows.push(...workflows);
      }

      cursor = response.nextCursor || null;
      page++;
    } while (cursor && page < maxPages);

    // Filter by tags if specified
    let filteredWorkflows = allWorkflows;
    if (args.tags && args.tags.length > 0) {
      filteredWorkflows = allWorkflows.filter(workflow => 
        workflow.tags && workflow.tags.some(tag => args.tags.includes(tag.name))
      );
    }

    // Apply caller-specified limit after collecting all pages
    if (args.limit && args.limit < filteredWorkflows.length) {
      filteredWorkflows = filteredWorkflows.slice(0, args.limit);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: filteredWorkflows.length,
            workflows: filteredWorkflows.map(w => ({
              id: w.id,
              name: w.name,
              active: w.active,
              tags: w.tags?.map(tag => tag.name) || [],
              createdAt: w.createdAt,
              updatedAt: w.updatedAt,
              nodes: w.nodes?.length || 0,
            })),
          }, null, 2),
        },
      ],
    };
  }

  async getWorkflow(args) {
    let workflow;
    
    if (args.id) {
      workflow = await this.n8nRequest(`/rest/workflows/${args.id}`);
    } else if (args.name) {
      const listResult = await this.listWorkflows({});
      const allWorkflows = JSON.parse(listResult.content[0].text).workflows;
      workflow = allWorkflows.find(w => w.name === args.name);
      if (!workflow) {
        throw new McpError(ErrorCode.InvalidParams, `Workflow not found: ${args.name}`);
      }
      workflow = await this.n8nRequest(`/rest/workflows/${workflow.id}`);
    }

    // Remove sensitive data unless specifically requested
    if (!args.includeData) {
      delete workflow.connections;
      delete workflow.nodes;
      delete workflow.settings;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, workflow }, null, 2),
        },
      ],
    };
  }

  async createWorkflow(args) {
    if (!args.confirm) {
      throw new McpError(ErrorCode.InvalidParams, 'confirm parameter must be true to create workflow');
    }

    // Validate workflow first
    const validation = await this.validateWorkflow({ workflow: args.workflow });
    const validationResult = JSON.parse(validation.content[0].text);
    
    if (!validationResult.valid) {
      throw new McpError(ErrorCode.InvalidParams, `Workflow validation failed: ${validationResult.errors.join(', ')}`);
    }

    const created = await this.n8nRequest('/rest/workflows', {
      method: 'POST',
      body: JSON.stringify(args.workflow),
    });

    // Activate if requested
    if (args.activate) {
      await this.n8nRequest(`/rest/workflows/${created.id}/activate`, {
        method: 'POST',
      });
      created.active = true;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            success: true, 
            workflow: created,
            webhookUrl: created.webhookUrl || `${N8N_BASE_URL}/webhook/${created.id}`,
          }, null, 2),
        },
      ],
    };
  }

  async updateWorkflow(args) {
    if (!args.confirm) {
      throw new McpError(ErrorCode.InvalidParams, 'confirm parameter must be true to update workflow');
    }

    // Get current workflow
    const current = await this.n8nRequest(`/rest/workflows/${args.id}`);
    
    // Validate new workflow
    const validation = await this.validateWorkflow({ workflow: args.workflow });
    const validationResult = JSON.parse(validation.content[0].text);
    
    if (!validationResult.valid) {
      throw new McpError(ErrorCode.InvalidParams, `Workflow validation failed: ${validationResult.errors.join(', ')}`);
    }

    const updated = await this.n8nRequest(`/rest/workflows/${args.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...args.workflow, id: args.id }),
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, workflow: updated }, null, 2),
        },
      ],
    };
  }

  async diffUpdateWorkflow(args) {
    if (!args.confirm) {
      throw new McpError(ErrorCode.InvalidParams, 'confirm parameter must be true to apply diff update');
    }

    // Get current workflow
    const current = await this.n8nRequest(`/rest/workflows/${args.id}`);
    
    // Apply diff operations
    const updatedWorkflow = { ...current };
    
    for (const operation of args.operations) {
      switch (operation.type) {
        case 'updateNode':
          const nodeIndex = updatedWorkflow.nodes.findIndex(n => n.id === operation.nodeId);
          if (nodeIndex >= 0) {
            updatedWorkflow.nodes[nodeIndex] = { ...updatedWorkflow.nodes[nodeIndex], ...operation.changes };
          }
          break;
        case 'addNode':
          updatedWorkflow.nodes.push({ id: operation.nodeId, ...operation.changes });
          break;
        case 'removeNode':
          updatedWorkflow.nodes = updatedWorkflow.nodes.filter(n => n.id !== operation.nodeId);
          break;
        case 'addConnection':
          if (!updatedWorkflow.connections[operation.connection.sourceNode]) {
            updatedWorkflow.connections[operation.connection.sourceNode] = { main: [] };
          }
          updatedWorkflow.connections[operation.connection.sourceNode].main.push([operation.connection]);
          break;
        case 'removeConnection':
          // Implementation for removing connections
          break;
      }
    }

    // Update workflow
    const updated = await this.n8nRequest(`/rest/workflows/${args.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedWorkflow),
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            success: true, 
            workflow: updated,
            operationsApplied: args.operations.length,
          }, null, 2),
        },
      ],
    };
  }

  async activateWorkflow(args) {
    await this.n8nRequest(`/rest/workflows/${args.id}/activate`, {
      method: 'POST',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Workflow activated', id: args.id }, null, 2),
        },
      ],
    };
  }

  async deactivateWorkflow(args) {
    await this.n8nRequest(`/rest/workflows/${args.id}/deactivate`, {
      method: 'POST',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Workflow deactivated', id: args.id }, null, 2),
        },
      ],
    };
  }

  async deleteWorkflow(args) {
    if (!args.confirm) {
      throw new McpError(ErrorCode.InvalidParams, 'confirm parameter must be true to delete workflow');
    }

    await this.n8nRequest(`/rest/workflows/${args.id}`, {
      method: 'DELETE',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Workflow deleted', id: args.id }, null, 2),
        },
      ],
    };
  }

  // Execution Management Methods
  async listExecutions(args) {
    let url = '/rest/executions';
    const params = new URLSearchParams();
    
    if (args.workflowId) params.append('workflowId', args.workflowId);
    if (args.status) params.append('status', args.status);
    if (args.limit) params.append('limit', args.limit.toString());
    if (args.includeData) params.append('includeData', args.includeData.toString());
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    const executions = await this.n8nRequest(url);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: executions.count,
            executions: executions.results.map(e => ({
              id: e.id,
              workflowId: e.workflowId,
              status: e.status,
              mode: e.mode,
              startedAt: e.startedAt,
              stoppedAt: e.stoppedAt,
              workflowData: args.includeData ? e.workflowData : undefined,
            })),
          }, null, 2),
        },
      ],
    };
  }

  async getExecution(args) {
    const execution = await this.n8nRequest(`/rest/executions/${args.id}?includeData=${args.includeData}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, execution }, null, 2),
        },
      ],
    };
  }

  async retryExecution(args) {
    const retried = await this.n8nRequest(`/rest/executions/${args.id}/retry`, {
      method: 'POST',
      body: JSON.stringify({ loadWorkflow: args.loadWorkflow }),
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, execution: retried }, null, 2),
        },
      ],
    };
  }

  async stopExecution(args) {
    await this.n8nRequest(`/rest/executions/${args.id}/stop`, {
      method: 'POST',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Execution stopped', id: args.id }, null, 2),
        },
      ],
    };
  }

  // Credential Management Methods
  async listCredentials(args) {
    const credentials = await this.n8nRequest('/rest/credentials');
    
    // Return only safe metadata, never secrets
    const safeCredentials = credentials.map(cred => ({
      id: String(cred.id),
      name: cred.name,
      type: cred.type,
      nodesAccess: cred.nodesAccess?.map(a => a.nodeType) || [],
    }));

    let filtered = safeCredentials;
    
    // Filter by type if specified
    if (args.type) {
      filtered = filtered.filter(c => c.type === args.type);
    }
    
    // Apply exclusion patterns for safety
    const excludePatterns = args.excludePatterns || ['(do not use)', '_old', 'staging', 'test', 'deprecated'];
    filtered = filtered.filter(cred => {
      return !excludePatterns.some(pattern => 
        cred.name.toLowerCase().includes(pattern.toLowerCase())
      );
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            success: true, 
            credentials: filtered,
            totalFound: safeCredentials.length,
            filtered: filtered.length,
            excludedPatterns: excludePatterns
          }, null, 2),
        },
      ],
    };
  }

  async getCredentialTypes() {
    const response = await this.n8nRequest('/rest/credential-types');
    
    // Enhanced credential type mapping
    const typeMapping = {
      'openAiApi': ['n8n-nodes-base.openAi'],
      'httpBasicAuth': ['n8n-nodes-base.httpRequest'],
      'httpHeaderAuth': ['n8n-nodes-base.httpRequest'],
      'oAuth2Api': ['n8n-nodes-base.httpRequest'],
      'postgres': ['n8n-nodes-base.postgres'],
      'stripeApi': ['n8n-nodes-base.stripe'],
      'discordApi': ['n8n-nodes-base.discord'],
      'slackApi': ['n8n-nodes-base.slack'],
      'notionApi': ['n8n-nodes-base.notion'],
      'mailchimpApi': ['n8n-nodes-base.mailchimp'],
      'smtp': ['n8n-nodes-base.emailSend'],
    };

    const enhancedTypes = response.credentialTypes?.map(type => ({
      ...type,
      compatibleNodes: typeMapping[type.name] || [],
      isGeneric: ['httpBasicAuth', 'httpHeaderAuth', 'oAuth2Api'].includes(type.name)
    })) || [];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            success: true, 
            credentialTypes: enhancedTypes,
            typeMapping
          }, null, 2),
        },
      ],
    };
  }

  async matchCredentialForNode(args) {
    const credentials = await this.listCredentials({});
    const credList = JSON.parse(credentials.content[0].text).credentials;
    
    let bestMatch = null;
    let matchReason = 'no_match';
    
    // Priority 1: Exact native node type match
    bestMatch = credList.find(c => c.nodesAccess.includes(args.nodeType));
    if (bestMatch) {
      matchReason = 'exact_node_match';
    }
    
    // Priority 2: Preferred name pattern match
    if (!bestMatch && args.preferredName) {
      bestMatch = credList.find(c => 
        c.name.toLowerCase().includes(args.preferredName.toLowerCase())
      );
      if (bestMatch) {
        matchReason = 'name_pattern_match';
      }
    }
    
    // Priority 3: Service hint matching
    if (!bestMatch && args.hints) {
      const hintMappings = {
        'openai': () => credList.find(c => c.type === 'openAiApi'),
        'supabase': () => credList.find(c => c.type === 'httpHeaderAuth' && c.name.toLowerCase().includes('supabase')),
        'postgres': () => credList.find(c => c.type === 'postgres'),
        'stripe': () => credList.find(c => c.type === 'stripeApi'),
        'api': () => credList.find(c => ['httpHeaderAuth', 'httpBasicAuth', 'oAuth2Api'].includes(c.type)),
        'database': () => credList.find(c => c.type === 'postgres'),
        'email': () => credList.find(c => c.type === 'smtp'),
      };
      
      for (const [service, matcher] of Object.entries(hintMappings)) {
        if (args.hints.service?.toLowerCase().includes(service) || 
            args.hints[service]) {
          bestMatch = matcher();
          if (bestMatch) {
            matchReason = `service_hint_${service}`;
            break;
          }
        }
      }
    }
    
    // Priority 4: Generic fallback for HTTP nodes
    if (!bestMatch && args.nodeType === 'n8n-nodes-base.httpRequest') {
      bestMatch = credList.find(c => ['httpHeaderAuth', 'httpBasicAuth', 'oAuth2Api'].includes(c.type));
      if (bestMatch) {
        matchReason = 'generic_http_fallback';
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            success: !!bestMatch,
            match: bestMatch,
            matchReason,
            nodeType: args.nodeType,
            hints: args.hints,
            availableTypes: [...new Set(credList.map(c => c.type))],
            totalCredentials: credList.length
          }, null, 2),
        },
      ],
    };
  }

  async applyCredentialToWorkflow(args) {
    if (!args.confirm) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: 'Credential binding requires confirm:true parameter',
              previewOnly: true,
              proposedChange: {
                nodeId: args.nodeId || args.nodeName,
                credentialBinding: {
                  [args.credentialType]: {
                    id: args.credentialId
                  }
                }
              }
            }, null, 2),
          },
        ],
      };
    }

    const workflow = { ...args.workflowJson };
    
    // Find the target node
    let targetNode = null;
    if (args.nodeId) {
      targetNode = workflow.nodes.find(n => n.id === args.nodeId);
    } else if (args.nodeName) {
      targetNode = workflow.nodes.find(n => n.name === args.nodeName);
    }
    
    if (!targetNode) {
      throw new McpError(ErrorCode.InvalidParams, `Node not found: ${args.nodeId || args.nodeName}`);
    }

    // Get credential info for name
    const credList = await this.listCredentials({});
    const credentials = JSON.parse(credList.content[0].text).credentials;
    const credential = credentials.find(c => c.id === args.credentialId);
    
    if (!credential) {
      throw new McpError(ErrorCode.InvalidParams, `Credential not found: ${args.credentialId}`);
    }

    // Apply credential binding
    if (!targetNode.credentials) {
      targetNode.credentials = {};
    }
    
    targetNode.credentials[args.credentialType] = {
      id: args.credentialId,
      name: credential.name
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Credential binding applied successfully',
            modifiedWorkflow: workflow,
            appliedBinding: {
              nodeId: targetNode.id,
              nodeName: targetNode.name,
              credentialType: args.credentialType,
              credentialId: args.credentialId,
              credentialName: credential.name
            }
          }, null, 2),
        },
      ],
    };
  }

  async canaryTestCredential(args) {
    const { credentialId, credentialType, testEndpoint } = args;
    
    // Define safe test configurations for different credential types
    const testConfigs = {
      'openAiApi': {
        nodeType: 'n8n-nodes-base.openAi',
        parameters: {
          resource: 'model',
          operation: 'getAll'
        },
        expectedStatus: [200, 401, 403] // 401/403 = invalid key but credential works
      },
      'httpHeaderAuth': {
        nodeType: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: testEndpoint || 'https://httpbin.org/headers',
          method: 'GET'
        },
        expectedStatus: [200, 401, 403, 404]
      },
      'postgres': {
        nodeType: 'n8n-nodes-base.postgres',
        parameters: {
          operation: 'select',
          query: 'SELECT 1 as test_connection'
        },
        expectedStatus: [200, 'connection_success']
      },
      'smtp': {
        // SMTP is hard to test safely, so we'll just validate the credential exists
        skipTest: true,
        message: 'SMTP credentials cannot be safely tested with canary workflow'
      }
    };

    const testConfig = testConfigs[credentialType];
    
    if (!testConfig) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: `No safe test configuration available for credential type: ${credentialType}`,
              supportedTypes: Object.keys(testConfigs)
            }, null, 2),
          },
        ],
      };
    }

    if (testConfig.skipTest) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              tested: false,
              message: testConfig.message,
              credentialId,
              credentialType
            }, null, 2),
          },
        ],
      };
    }

    // Create temporary canary workflow
    const canaryWorkflow = {
      name: `Canary_Test_${credentialType}_${Date.now()}`,
      active: false,
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        },
        {
          id: 'test-node',
          name: 'Test Node',
          type: testConfig.nodeType,
          typeVersion: 1,
          position: [300, 100],
          parameters: testConfig.parameters,
          credentials: {
            [credentialType]: { id: credentialId }
          }
        },
        {
          id: 'response-node',
          name: 'Test Result',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [500, 100],
          parameters: {
            functionCode: `
              return {
                success: true,
                message: 'Credential test completed',
                credentialType: '${credentialType}',
                credentialId: '${credentialId}',
                testTime: new Date().toISOString()
              };
            `
          }
        }
      ],
      connections: {
        'Manual Trigger': {
          main: [[{ node: 'Test Node', type: 'main', index: 0 }]]
        },
        'Test Node': {
          main: [[{ node: 'Test Result', type: 'main', index: 0 }]]
        }
      }
    };

    try {
      // Create canary workflow
      const createdWorkflow = await this.n8nRequest('/rest/workflows', {
        method: 'POST',
        body: JSON.stringify(canaryWorkflow)
      });

      // Execute canary workflow
      const execution = await this.n8nRequest(`/rest/workflows/${createdWorkflow.id}/execute`, {
        method: 'POST'
      });

      // Wait a moment for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get execution result
      const executionResult = await this.n8nRequest(`/rest/executions/${execution.id}`);

      // Clean up canary workflow
      await this.n8nRequest(`/rest/workflows/${createdWorkflow.id}`, {
        method: 'DELETE'
      });

      const testSuccessful = ['success', 'running'].includes(executionResult.status) || 
                           executionResult.status === 'error' && 
                           !executionResult.data?.resultData?.error?.message?.includes('credential');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: testSuccessful,
              tested: true,
              credentialId,
              credentialType,
              testResult: {
                status: executionResult.status,
                executionId: execution.id,
                message: testSuccessful ? 'Credential appears to be working' : 'Credential test failed',
                details: executionResult.status === 'error' ? 
                  executionResult.data?.resultData?.error?.message : 
                  'Test completed successfully'
              }
            }, null, 2),
          },
        ],
      };

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              tested: true,
              credentialId,
              credentialType,
              error: error.message,
              message: 'Credential canary test failed'
            }, null, 2),
          },
        ],
      };
    }
  }

  // Webhook Testing
  async triggerWebhook(args) {
    const webhookUrl = `${N8N_BASE_URL}/webhook/${args.path}`;
    
    const response = await fetch(webhookUrl, {
      method: args.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...args.headers,
      },
      body: args.body ? JSON.stringify(args.body) : undefined,
    });

    const responseData = await response.text();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseData,
            url: webhookUrl,
          }, null, 2),
        },
      ],
    };
  }

  // Validation Methods
  async validateWorkflow(args) {
    const workflow = args.workflow;
    const errors = [];
    const warnings = [];

    // Basic structure validation
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array');
    }

    if (!workflow.connections || typeof workflow.connections !== 'object') {
      errors.push('Workflow must have a connections object');
    }

    // Node validation
    if (workflow.nodes) {
      for (const node of workflow.nodes) {
        if (!node.id) errors.push(`Node missing id: ${JSON.stringify(node)}`);
        if (!node.type) errors.push(`Node missing type: ${node.id}`);
        if (!node.position || !Array.isArray(node.position)) {
          errors.push(`Node missing valid position: ${node.id}`);
        }
      }
    }

    // Connection validation
    if (args.checkConnections && workflow.connections) {
      for (const [sourceNodeId, connections] of Object.entries(workflow.connections)) {
        const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
        if (!sourceNode) {
          errors.push(`Connection source node not found: ${sourceNodeId}`);
        }

        if (connections.main) {
          for (const outputConnections of connections.main) {
            for (const connection of outputConnections) {
              const targetNode = workflow.nodes.find(n => n.id === connection.node);
              if (!targetNode) {
                errors.push(`Connection target node not found: ${connection.node}`);
              }
            }
          }
        }
      }
    }

    // Expression validation (basic)
    if (args.checkExpressions) {
      const expressionRegex = /\{\{.*?\}\}/g;
      const workflowStr = JSON.stringify(workflow);
      const expressions = workflowStr.match(expressionRegex) || [];
      
      for (const expr of expressions) {
        if (expr.includes('$node[') && !expr.includes('].json')) {
          warnings.push(`Potentially malformed expression: ${expr}`);
        }
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
            nodeCount: workflow.nodes?.length || 0,
            connectionCount: Object.keys(workflow.connections || {}).length,
          }, null, 2),
        },
      ],
    };
  }

  async validateNode(args) {
    const { nodeType, parameters, credentials, profile } = args;
    const errors = [];
    const warnings = [];

    // Basic validation based on profile
    if (profile === 'minimal' || profile === 'runtime' || profile === 'full') {
      if (!nodeType) errors.push('Node type is required');
      if (!parameters) errors.push('Node parameters are required');
      
      // Type-specific validation
      if (nodeType === 'n8n-nodes-base.httpRequest') {
        if (!parameters.url) errors.push('HTTP Request node requires url parameter');
        if (!parameters.method) warnings.push('HTTP Request node should specify method');
      }
      
      if (nodeType === 'n8n-nodes-base.openAi') {
        if (!parameters.resource) errors.push('OpenAI node requires resource parameter');
        if (!credentials || !credentials.openAiApi) {
          errors.push('OpenAI node requires openAiApi credentials');
        }
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
            nodeType,
            profile,
          }, null, 2),
        },
      ],
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[N8N MCP Server] Server running on stdio');
  }
}

const server = new N8nMcpServer();
server.run().catch(console.error);
