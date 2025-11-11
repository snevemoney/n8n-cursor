#!/usr/bin/env node

/**
 * Comprehensive n8n MCP Server with 39 Tools
 * Provides complete workflow management, credential management, and automation capabilities
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Configuration
const config = {
  port: process.env.N8N_PORT || 5678,
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || '',
  username: process.env.N8N_USERNAME || '', // For basic auth
  password: process.env.N8N_PASSWORD || '', // For basic auth
  serverName: 'comprehensive-n8n-server'
};

// n8n API client
const n8nApi = {
  async request(endpoint, options = {}) {
    const url = `${config.baseUrl}/api/v1${endpoint}`;
    
    // Handle authentication for remote n8n instance
    let headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // If we have an API key, use it; otherwise use basic auth
    if (config.apiKey && config.apiKey !== 'your-actual-n8n-api-key-here') {
      headers['X-N8N-API-KEY'] = config.apiKey;
    } else if (config.username && config.password) {
      // Use basic authentication for remote instances
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    try {
      const response = await fetch(url, { 
        ...options, 
        headers,
        // Add SSL verification settings for remote instances
        ...(config.baseUrl.startsWith('https') && {
          rejectUnauthorized: false // Allow self-signed certificates if needed
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`n8n API request failed: ${error.message}`);
      throw error;
    }
  },

  // Test connection to n8n instance
  async testConnection() {
    try {
      const response = await this.request('/workflows');
      return {
        success: true,
        message: 'Successfully connected to n8n',
        instance: config.baseUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        instance: config.baseUrl
      };
    }
  }
};

// Tool definitions - 39 comprehensive tools
const tools = [
  // 1. Workflow Management Tools (8 tools)
  {
    name: 'workflows.list',
    description: 'List all workflows with filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of workflows to return' },
        offset: { type: 'number', description: 'Number of workflows to skip' },
        active: { type: 'boolean', description: 'Filter by active status' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' }
      }
    }
  },
  {
    name: 'workflows.get',
    description: 'Get detailed information about a specific workflow',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Workflow ID' }
      }
    }
  },
  {
    name: 'workflows.create',
    description: 'Create a new workflow',
    inputSchema: {
      type: 'object',
      required: ['name', 'nodes', 'connections'],
      properties: {
        name: { type: 'string', description: 'Workflow name' },
        nodes: { type: 'array', description: 'Array of workflow nodes' },
        connections: { type: 'object', description: 'Node connections' },
        settings: { type: 'object', description: 'Workflow settings' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Workflow tags' },
        confirm: { type: 'boolean', description: 'Confirmation required for creation' }
      }
    }
  },
  {
    name: 'workflows.update',
    description: 'Update an existing workflow',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        name: { type: 'string', description: 'New workflow name' },
        nodes: { type: 'array', description: 'Updated nodes' },
        connections: { type: 'object', description: 'Updated connections' },
        settings: { type: 'object', description: 'Updated settings' },
        active: { type: 'boolean', description: 'Active status' },
        confirm: { type: 'boolean', description: 'Confirmation required for update' }
      }
    }
  },
  {
    name: 'workflows.delete',
    description: 'Delete a workflow',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        confirm: { type: 'boolean', description: 'Confirmation required for deletion' }
      }
    }
  },
  {
    name: 'workflows.activate',
    description: 'Activate a workflow',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Workflow ID' }
      }
    }
  },
  {
    name: 'workflows.deactivate',
    description: 'Deactivate a workflow',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Workflow ID' }
      }
    }
  },
  {
    name: 'workflows.duplicate',
    description: 'Duplicate an existing workflow',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Source workflow ID' },
        newName: { type: 'string', description: 'Name for the duplicated workflow' }
      }
    }
  },

  // 2. Node Management Tools (6 tools)
  {
    name: 'nodes.add',
    description: 'Add a new node to a workflow',
    inputSchema: {
      type: 'object',
      required: ['workflowId', 'nodeType', 'position'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        nodeType: { type: 'string', description: 'Type of node to add' },
        name: { type: 'string', description: 'Node name' },
        position: { type: 'array', items: { type: 'number' }, description: 'Node position [x, y]' },
        parameters: { type: 'object', description: 'Node parameters' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'nodes.update',
    description: 'Update an existing node in a workflow',
    inputSchema: {
      type: 'object',
      required: ['workflowId', 'nodeId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        nodeId: { type: 'string', description: 'Node ID' },
        name: { type: 'string', description: 'New node name' },
        position: { type: 'array', items: { type: 'number' }, description: 'New position' },
        parameters: { type: 'object', description: 'Updated parameters' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'nodes.delete',
    description: 'Delete a node from a workflow',
    inputSchema: {
      type: 'object',
      required: ['workflowId', 'nodeId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        nodeId: { type: 'string', description: 'Node ID' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'nodes.list',
    description: 'List available node types and their capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by node category' },
        search: { type: 'string', description: 'Search term for node types' }
      }
    }
  },
  {
    name: 'nodes.validate',
    description: 'Validate node configuration',
    inputSchema: {
      type: 'object',
      required: ['nodeType', 'parameters'],
      properties: {
        nodeType: { type: 'string', description: 'Type of node to validate' },
        parameters: { type: 'object', description: 'Node parameters to validate' }
      }
    }
  },
  {
    name: 'nodes.test',
    description: 'Test a node with sample data',
    inputSchema: {
      type: 'object',
      required: ['nodeType', 'parameters'],
      properties: {
        nodeType: { type: 'string', description: 'Type of node to test' },
        parameters: { type: 'object', description: 'Node parameters' },
        testData: { type: 'object', description: 'Sample input data for testing' }
      }
    }
  },

  // 3. Connection Management Tools (4 tools)
  {
    name: 'connections.add',
    description: 'Add a connection between nodes',
    inputSchema: {
      type: 'object',
      required: ['workflowId', 'sourceNodeId', 'targetNodeId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        sourceNodeId: { type: 'string', description: 'Source node ID' },
        targetNodeId: { type: 'string', description: 'Target node ID' },
        sourceOutput: { type: 'string', description: 'Source output name', default: 'main' },
        targetInput: { type: 'string', description: 'Target input name', default: 'main' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'connections.remove',
    description: 'Remove a connection between nodes',
    inputSchema: {
      type: 'object',
      required: ['workflowId', 'sourceNodeId', 'targetNodeId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        sourceNodeId: { type: 'string', description: 'Source node ID' },
        targetNodeId: { type: 'string', description: 'Target node ID' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'connections.list',
    description: 'List all connections in a workflow',
    inputSchema: {
      type: 'object',
      required: ['workflowId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' }
      }
    }
  },
  {
    name: 'connections.validate',
    description: 'Validate workflow connections for errors',
    inputSchema: {
      type: 'object',
      required: ['workflowId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' }
      }
    }
  },

  // 4. Credential Management Tools (8 tools)
  {
    name: 'credentials.list',
    description: 'List all available credentials (safe metadata only)',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Filter by credential type' },
        excludePatterns: { type: 'array', items: { type: 'string' }, description: 'Patterns to exclude' }
      }
    }
  },
  {
    name: 'credentials.types',
    description: 'Get available credential types and their node compatibility',
    inputSchema: {
      type: 'object'
    }
  },
  {
    name: 'credentials.matchForNode',
    description: 'Find the best matching credential for a specific node',
    inputSchema: {
      type: 'object',
      required: ['nodeType'],
      properties: {
        nodeType: { type: 'string', description: 'Type of node needing credentials' },
        preferredName: { type: 'string', description: 'Preferred credential name' },
        hints: { type: 'object', description: 'Additional hints for matching' }
      }
    }
  },
  {
    name: 'credentials.applyToWorkflow',
    description: 'Apply credential binding to a workflow',
    inputSchema: {
      type: 'object',
      required: ['workflowJson', 'nodeName', 'credentialType', 'credentialId'],
      properties: {
        workflowJson: { type: 'object', description: 'Workflow JSON to modify' },
        nodeName: { type: 'string', description: 'Name of node to bind credentials to' },
        credentialType: { type: 'string', description: 'Type of credential to apply' },
        credentialId: { type: 'string', description: 'ID of credential to apply' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'credentials.canaryTest',
    description: 'Test a credential by creating and executing a temporary workflow',
    inputSchema: {
      type: 'object',
      required: ['credentialId', 'credentialType'],
      properties: {
        credentialId: { type: 'string', description: 'Credential ID to test' },
        credentialType: { type: 'string', description: 'Type of credential to test' },
        testPayload: { type: 'object', description: 'Test data for the workflow' }
      }
    }
  },
  {
    name: 'credentials.create',
    description: 'Create a new credential',
    inputSchema: {
      type: 'object',
      required: ['name', 'type', 'data'],
      properties: {
        name: { type: 'string', description: 'Credential name' },
        type: { type: 'string', description: 'Credential type' },
        data: { type: 'object', description: 'Credential data' },
        nodesAccess: { type: 'array', description: 'Nodes that can access this credential' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'credentials.update',
    description: 'Update an existing credential',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Credential ID' },
        name: { type: 'string', description: 'New name' },
        data: { type: 'object', description: 'Updated credential data' },
        nodesAccess: { type: 'array', description: 'Updated node access' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'credentials.delete',
    description: 'Delete a credential',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Credential ID' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },

  // 5. Execution Management Tools (6 tools)
  {
    name: 'executions.list',
    description: 'List workflow executions with filtering',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string', description: 'Filter by workflow ID' },
        status: { type: 'string', description: 'Filter by execution status' },
        limit: { type: 'number', description: 'Number of executions to return' },
        offset: { type: 'number', description: 'Number of executions to skip' }
      }
    }
  },
  {
    name: 'executions.get',
    description: 'Get detailed information about a specific execution',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Execution ID' }
      }
    }
  },
  {
    name: 'executions.retry',
    description: 'Retry a failed execution',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Execution ID to retry' }
      }
    }
  },
  {
    name: 'executions.stop',
    description: 'Stop a running execution',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Execution ID to stop' }
      }
    }
  },
  {
    name: 'executions.delete',
    description: 'Delete execution history',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Execution ID to delete' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'executions.trigger',
    description: 'Manually trigger a workflow execution',
    inputSchema: {
      type: 'object',
      required: ['workflowId'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID to trigger' },
        payload: { type: 'object', description: 'Input data for the execution' },
        waitForCompletion: { type: 'boolean', description: 'Wait for execution to complete' }
      }
    }
  },

  // 6. Webhook Management Tools (4 tools)
  {
    name: 'webhooks.list',
    description: 'List all webhook endpoints',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string', description: 'Filter by workflow ID' }
      }
    }
  },
  {
    name: 'webhooks.create',
    description: 'Create a new webhook endpoint',
    inputSchema: {
      type: 'object',
      required: ['workflowId', 'path'],
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID to connect' },
        path: { type: 'string', description: 'Webhook path' },
        method: { type: 'string', description: 'HTTP method', default: 'POST' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'webhooks.delete',
    description: 'Delete a webhook endpoint',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Webhook ID' },
        confirm: { type: 'boolean', description: 'Confirmation required' }
      }
    }
  },
  {
    name: 'webhooks.trigger',
    description: 'Trigger a webhook with test data',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: { type: 'string', description: 'Webhook path to trigger' },
        method: { type: 'string', description: 'HTTP method', default: 'POST' },
        body: { type: 'object', description: 'Test payload data' },
        headers: { type: 'object', description: 'Additional headers' }
      }
    }
  },

  // 7. Validation and Testing Tools (3 tools)
  {
    name: 'validate.workflow',
    description: 'Validate workflow structure and configuration',
    inputSchema: {
      type: 'object',
      required: ['workflowJson'],
      properties: {
        workflowJson: { type: 'object', description: 'Workflow JSON to validate' }
      }
    }
  },
  {
    name: 'validate.connections',
    description: 'Validate workflow connections for errors',
    inputSchema: {
      type: 'object',
      required: ['workflowJson'],
      properties: {
        workflowJson: { type: 'object', description: 'Workflow JSON to validate' }
      }
    }
  },
  {
    name: 'validate.expressions',
    description: 'Validate n8n expressions in workflow',
    inputSchema: {
      type: 'object',
      required: ['workflowJson'],
      properties: {
        workflowJson: { type: 'object', description: 'Workflow JSON to validate' }
      }
    }
  },

  // Progressive Disclosure Tool
  {
    name: 'search_tools',
    description: 'Search available tools by keyword (progressive disclosure) - enables discovering tools without loading all definitions upfront',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { 
          type: 'string', 
          description: 'Search query to find relevant tools' 
        },
        detailLevel: { 
          type: 'string', 
          enum: ['name', 'description', 'full'],
          description: 'Level of detail: name (fastest), description (balanced), full (complete schemas)',
          default: 'description'
        }
      }
    }
  }
];

// Tool implementations
const toolImplementations = {
  // Workflow Management
  async 'workflows.list'(args) {
    const queryParams = new URLSearchParams();
    if (args.limit) queryParams.append('limit', args.limit);
    if (args.offset) queryParams.append('offset', args.offset);
    if (args.active !== undefined) queryParams.append('active', args.active);
    
    const endpoint = `/workflows${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await n8nApi.request(endpoint);
  },

  async 'workflows.get'(args) {
    return await n8nApi.request(`/workflows/${args.id}`);
  },

  async 'workflows.create'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    return await n8nApi.request('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: args.name,
        nodes: args.nodes,
        connections: args.connections,
        settings: args.settings || {},
        tags: args.tags || []
      })
    });
  },

  async 'workflows.update'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    return await n8nApi.request(`/workflows/${args.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: args.name,
        nodes: args.nodes,
        connections: args.connections,
        settings: args.settings,
        active: args.active
      })
    });
  },

  async 'workflows.delete'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    return await n8nApi.request(`/workflows/${args.id}`, { method: 'DELETE' });
  },

  async 'workflows.activate'(args) {
    return await n8nApi.request(`/workflows/${args.id}/activate`, { method: 'POST' });
  },

  async 'workflows.deactivate'(args) {
    return await n8nApi.request(`/workflows/${args.id}/deactivate`, { method: 'POST' });
  },

  async 'workflows.duplicate'(args) {
    const workflow = await n8nApi.request(`/workflows/${args.id}`);
    workflow.name = args.newName || `${workflow.name} (Copy)`;
    delete workflow.id;
    delete workflow.createdAt;
    delete workflow.updatedAt;
    
    return await n8nApi.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  },

  // Node Management
  async 'nodes.add'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: args.name || `Node ${Date.now()}`,
      type: args.nodeType,
      typeVersion: 1,
      position: args.position,
      parameters: args.parameters || {}
    };
    
    workflow.nodes.push(newNode);
    
    return await n8nApi.request(`/workflows/${args.workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ nodes: workflow.nodes })
    });
  },

  async 'nodes.update'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    const nodeIndex = workflow.nodes.findIndex(n => n.id === args.nodeId);
    
    if (nodeIndex === -1) {
      throw new Error(`Node with ID ${args.nodeId} not found`);
    }
    
    if (args.name) workflow.nodes[nodeIndex].name = args.name;
    if (args.position) workflow.nodes[nodeIndex].position = args.position;
    if (args.parameters) workflow.nodes[nodeIndex].parameters = args.parameters;
    
    return await n8nApi.request(`/workflows/${args.workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ nodes: workflow.nodes })
    });
  },

  async 'nodes.delete'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    workflow.nodes = workflow.nodes.filter(n => n.id !== args.nodeId);
    
    // Remove connections to/from this node
    Object.keys(workflow.connections).forEach(output => {
      workflow.connections[output] = workflow.connections[output].filter(conn => 
        conn.node !== args.nodeId
      );
    });
    
    return await n8nApi.request(`/workflows/${args.workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        nodes: workflow.nodes, 
        connections: workflow.connections 
      })
    });
  },

  async 'nodes.list'(args) {
    // This would typically call n8n's node registry API
    // For now, return a comprehensive list of common node types
    const nodeCategories = {
      'Triggers': ['webhook', 'schedule', 'manual', 'polling'],
      'Actions': ['httpRequest', 'email', 'slack', 'discord', 'openai'],
      'Data': ['set', 'if', 'switch', 'merge', 'split'],
      'Files': ['readFile', 'writeFile', 'googleDrive', 'dropbox'],
      'Databases': ['postgres', 'mysql', 'mongodb', 'supabase'],
      'AI': ['openai', 'anthropic', 'huggingface', 'replicate']
    };
    
    if (args.category) {
      return { [args.category]: nodeCategories[args.category] || [] };
    }
    
    if (args.search) {
      const results = {};
      Object.entries(nodeCategories).forEach(([category, nodes]) => {
        const filtered = nodes.filter(node => 
          node.toLowerCase().includes(args.search.toLowerCase())
        );
        if (filtered.length > 0) {
          results[category] = filtered;
        }
      });
      return results;
    }
    
    return nodeCategories;
  },

  async 'nodes.validate'(args) {
    // Basic validation - in a real implementation, this would call n8n's validation API
    const requiredFields = ['name', 'type'];
    const missingFields = requiredFields.filter(field => !args.parameters[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missingFields.join(', ')}`]
      };
    }
    
    return {
      valid: true,
      message: 'Node configuration is valid'
    };
  },

  async 'nodes.test'(args) {
    // Create a temporary workflow to test the node
    const testWorkflow = {
      name: `Test_${args.nodeType}_${Date.now()}`,
      nodes: [
        {
          id: 'test_node',
          name: 'Test Node',
          type: args.nodeType,
          typeVersion: 1,
          position: [100, 100],
          parameters: args.parameters
        }
      ],
      connections: {},
      settings: { executionOrder: 'v1' }
    };
    
    try {
      const created = await n8nApi.request('/workflows', {
        method: 'POST',
        body: JSON.stringify(testWorkflow)
      });
      
      // Test execution
      const execution = await n8nApi.request(`/workflows/${created.id}/trigger`, {
        method: 'POST',
        body: JSON.stringify(args.testData || {})
      });
      
      // Clean up test workflow
      await n8nApi.request(`/workflows/${created.id}`, { method: 'DELETE' });
      
      return {
        success: true,
        executionId: execution.id,
        message: 'Node test completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Connection Management
  async 'connections.add'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    
    if (!workflow.connections[args.sourceOutput]) {
      workflow.connections[args.sourceOutput] = [];
    }
    
    workflow.connections[args.sourceOutput].push({
      node: args.targetNodeId,
      type: 0,
      index: 0
    });
    
    return await n8nApi.request(`/workflows/${args.workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ connections: workflow.connections })
    });
  },

  async 'connections.remove'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    
    if (workflow.connections[args.sourceOutput]) {
      workflow.connections[args.sourceOutput] = workflow.connections[args.sourceOutput]
        .filter(conn => conn.node !== args.targetNodeId);
    }
    
    return await n8nApi.request(`/workflows/${args.workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ connections: workflow.connections })
    });
  },

  async 'connections.list'(args) {
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    return workflow.connections || {};
  },

  async 'connections.validate'(args) {
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    const errors = [];
    
    // Check for orphaned connections
    Object.entries(workflow.connections).forEach(([output, connections]) => {
      connections.forEach(conn => {
        const targetNode = workflow.nodes.find(n => n.id === conn.node);
        if (!targetNode) {
          errors.push(`Connection to non-existent node: ${conn.node}`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  // Credential Management
  async 'credentials.list'(args) {
    const credentials = await n8nApi.request('/credentials');
    
    // Filter and return safe metadata only
    let filtered = credentials.map(cred => ({
      id: String(cred.id),
      name: cred.name,
      type: cred.type,
      nodesAccess: cred.nodesAccess?.map(access => access.nodeType) || []
    }));
    
    if (args.type) {
      filtered = filtered.filter(cred => cred.type === args.type);
    }
    
    if (args.excludePatterns) {
      filtered = filtered.filter(cred => 
        !args.excludePatterns.some(pattern => 
          cred.name.toLowerCase().includes(pattern.toLowerCase())
        )
      );
    }
    
    return filtered;
  },

  async 'credentials.types'() {
    const types = await n8nApi.request('/credential-types');
    return types.credentialTypes || [];
  },

  async 'credentials.matchForNode'(args) {
    const credentials = await n8nApi.request('/credentials');
    const types = await n8nApi.request('/credential-types');
    
    // Find credentials compatible with the node type
    const compatible = credentials.filter(cred => {
      const credType = types.find(t => t.name === cred.type);
      return credType?.nodes?.some(node => node.type === args.nodeType);
    });
    
    if (args.preferredName) {
      const exactMatch = compatible.find(cred => 
        cred.name.toLowerCase().includes(args.preferredName.toLowerCase())
      );
      if (exactMatch) return exactMatch;
    }
    
    if (args.hints?.service) {
      const serviceMatch = compatible.find(cred => 
        cred.name.toLowerCase().includes(args.hints.service.toLowerCase())
      );
      if (serviceMatch) return serviceMatch;
    }
    
    return compatible[0] || null;
  },

  async 'credentials.applyToWorkflow'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = { ...args.workflowJson };
    const node = workflow.nodes.find(n => n.name === args.nodeName);
    
    if (!node) {
      throw new Error(`Node with name '${args.nodeName}' not found`);
    }
    
    if (!node.credentials) {
      node.credentials = {};
    }
    
    node.credentials[args.credentialType] = {
      id: args.credentialId
    };
    
    return workflow;
  },

  async 'credentials.canaryTest'(args) {
    // Create a minimal test workflow
    const testWorkflow = {
      name: `Canary_Test_${args.credentialType}_${Date.now()}`,
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: { httpMethod: 'GET', path: 'test' }
        },
        {
          id: 'test_node',
          name: 'Test Node',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [300, 100],
          parameters: { url: 'https://httpbin.org/get' },
          credentials: { [args.credentialType]: { id: args.credentialId } }
        }
      ],
      connections: {
        'Webhook': { main: [['Test Node']] }
      },
      settings: { executionOrder: 'v1' }
    };
    
    try {
      const created = await n8nApi.request('/workflows', {
        method: 'POST',
        body: JSON.stringify(testWorkflow)
      });
      
      // Test execution
      const execution = await n8nApi.request(`/workflows/${created.id}/trigger`, {
        method: 'POST'
      });
      
      // Clean up
      await n8nApi.request(`/workflows/${created.id}`, { method: 'DELETE' });
      
      return {
        success: true,
        message: 'Credential test passed',
        executionId: execution.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async 'credentials.create'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    return await n8nApi.request('/credentials', {
      method: 'POST',
      body: JSON.stringify({
        name: args.name,
        type: args.type,
        data: args.data,
        nodesAccess: args.nodesAccess || []
      })
    });
  },

  async 'credentials.update'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    return await n8nApi.request(`/credentials/${args.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: args.name,
        data: args.data,
        nodesAccess: args.nodesAccess
      })
    });
  },

  async 'credentials.delete'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    return await n8nApi.request(`/credentials/${args.id}`, { method: 'DELETE' });
  },

  // Execution Management
  async 'executions.list'(args) {
    const queryParams = new URLSearchParams();
    if (args.workflowId) queryParams.append('workflowId', args.workflowId);
    if (args.status) queryParams.append('status', args.status);
    if (args.limit) queryParams.append('limit', args.limit);
    if (args.offset) queryParams.append('offset', args.offset);
    
    const endpoint = `/executions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await n8nApi.request(endpoint);
  },

  async 'executions.get'(args) {
    return await n8nApi.request(`/executions/${args.id}`);
  },

  async 'executions.retry'(args) {
    return await n8nApi.request(`/executions/${args.id}/retry`, { method: 'POST' });
  },

  async 'executions.stop'(args) {
    return await n8nApi.request(`/executions/${args.id}/stop`, { method: 'POST' });
  },

  async 'executions.delete'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    return await n8nApi.request(`/executions/${args.id}`, { method: 'DELETE' });
  },

  async 'executions.trigger'(args) {
    const response = await n8nApi.request(`/workflows/${args.workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify(args.payload || {})
    });
    
    if (args.waitForCompletion) {
      // Poll for completion
      let execution;
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        execution = await n8nApi.request(`/executions/${response.id}`);
        if (execution.finished) break;
      }
      return execution;
    }
    
    return response;
  },

  // Webhook Management
  async 'webhooks.list'(args) {
    const workflows = await n8nApi.request('/workflows');
    const webhooks = [];
    
    workflows.forEach(workflow => {
      workflow.nodes.forEach(node => {
        if (node.type === 'n8n-nodes-base.webhook') {
          webhooks.push({
            id: `${workflow.id}_${node.id}`,
            workflowId: workflow.id,
            workflowName: workflow.name,
            nodeName: node.name,
            path: node.parameters.path,
            method: node.parameters.httpMethod || 'POST'
          });
        }
      });
    });
    
    if (args.workflowId) {
      return webhooks.filter(w => w.workflowId === args.workflowId);
    }
    
    return webhooks;
  },

  async 'webhooks.create'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    const workflow = await n8nApi.request(`/workflows/${args.workflowId}`);
    
    // Add webhook node
    const webhookNode = {
      id: `webhook_${Date.now()}`,
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [100, 100],
      parameters: {
        httpMethod: args.method || 'POST',
        path: args.path
      }
    };
    
    workflow.nodes.push(webhookNode);
    
    return await n8nApi.request(`/workflows/${args.workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ nodes: workflow.nodes })
    });
  },

  async 'webhooks.delete'(args) {
    if (!args.confirm) {
      throw new Error('Confirmation required. Set confirm: true to proceed.');
    }
    
    // This would require finding and removing the webhook node
    // Implementation depends on how webhooks are stored
    return { message: 'Webhook deletion requires manual node removal' };
  },

  async 'webhooks.trigger'(args) {
    const url = `${config.baseUrl}/webhook/${args.path}`;
    
    try {
      const response = await fetch(url, {
        method: args.method || 'POST',
        headers: args.headers || {},
        body: args.body ? JSON.stringify(args.body) : undefined
      });
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: await response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Validation Tools
  async 'validate.workflow'(args) {
    const workflow = args.workflowJson;
    const errors = [];
    
    // Basic structure validation
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have nodes array');
    }
    if (!workflow.connections) errors.push('Workflow must have connections');
    
    // Node validation
    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.id) errors.push(`Node ${index}: Missing ID`);
        if (!node.type) errors.push(`Node ${index}: Missing type`);
        if (!node.position) errors.push(`Node ${index}: Missing position`);
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  async 'validate.connections'(args) {
    const workflow = args.workflowJson;
    const errors = [];
    
    if (workflow.connections) {
      Object.entries(workflow.connections).forEach(([output, connections]) => {
        connections.forEach(conn => {
          const targetNode = workflow.nodes.find(n => n.id === conn.node);
          if (!targetNode) {
            errors.push(`Connection to non-existent node: ${conn.node}`);
          }
        });
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  async 'validate.expressions'(args) {
    const workflow = args.workflowJson;
    const errors = [];
    
    // Basic expression validation - in a real implementation, this would parse expressions
    const expressionRegex = /\{\{.*?\}\}/g;
    
    if (workflow.nodes) {
      workflow.nodes.forEach(node => {
        if (node.parameters) {
          const paramStr = JSON.stringify(node.parameters);
          const expressions = paramStr.match(expressionRegex);
          if (expressions) {
            expressions.forEach(expr => {
              // Basic syntax check
              if (!expr.includes('$json') && !expr.includes('$node') && !expr.includes('$env')) {
                errors.push(`Node ${node.name}: Invalid expression syntax: ${expr}`);
              }
            });
          }
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  async 'search_tools'(args) {
    const { query, detailLevel = 'description' } = args;
    const searchLower = query.toLowerCase();
    
    // Filter tools by query
    const matches = tools.filter(tool => {
      const searchText = `${tool.name} ${tool.description}`.toLowerCase();
      return searchText.includes(searchLower);
    });
    
    // Return based on detail level
    if (detailLevel === 'name') {
      return matches.map(t => ({ name: t.name }));
    }
    if (detailLevel === 'description') {
      return matches.map(t => ({ 
        name: t.name, 
        description: t.description 
      }));
    }
    
    // Full detail
    return matches;
  }
};

// MCP Server setup
const server = new Server(
  {
    name: config.serverName,
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!toolImplementations[name]) {
    throw new Error(`Tool '${name}' not implemented`);
  }
  
  try {
    const result = await toolImplementations[name](args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool '${name}': ${error.message}`
        }
      ]
    };
  }
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error(`${config.serverName} MCP server started with ${tools.length} tools`);
console.error(`n8n Base URL: ${config.baseUrl}`);
console.error(`n8n Port: ${config.port}`);
console.error(`Authentication: ${config.username ? 'Basic Auth' : 'API Key'}`);
console.error(`Username: ${config.username || 'Not set'}`);
console.error(`Total Tools: 39 (8 Workflow + 6 Node + 4 Connection + 8 Credential + 6 Execution + 4 Webhook + 3 Validation)`);
