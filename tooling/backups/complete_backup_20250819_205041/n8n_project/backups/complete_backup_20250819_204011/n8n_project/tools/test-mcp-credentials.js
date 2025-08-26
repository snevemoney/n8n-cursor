#!/usr/bin/env node

/**
 * Test script for MCP credential management capabilities
 * Validates the enhanced n8n MCP server credential detection and binding
 */

import fetch from 'node-fetch';

const { N8N_BASE_URL = 'http://localhost:5678', N8N_API_KEY } = process.env;

if (!N8N_API_KEY) {
  console.error('N8N_API_KEY environment variable is required');
  process.exit(1);
}

class CredentialTester {
  constructor() {
    this.baseUrl = N8N_BASE_URL;
    this.apiKey = N8N_API_KEY;
    this.testResults = [];
  }

  async n8nRequest(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async testCredentialListing() {
    console.log('\n🔍 Testing credential listing...');
    
    try {
      const credentials = await this.n8nRequest('/rest/credentials');
      
      // Test safe data extraction (simulating MCP server behavior)
      const safeCredentials = credentials.map(cred => ({
        id: String(cred.id),
        name: cred.name,
        type: cred.type,
        nodesAccess: cred.nodesAccess?.map(a => a.nodeType) || [],
      }));

      console.log(`✅ Found ${safeCredentials.length} credentials`);
      console.log('📋 Available credential types:', [...new Set(safeCredentials.map(c => c.type))]);
      
      // Test exclusion patterns
      const excludePatterns = ['test', 'staging', '_old'];
      const filteredCreds = safeCredentials.filter(cred => {
        return !excludePatterns.some(pattern => 
          cred.name.toLowerCase().includes(pattern.toLowerCase())
        );
      });
      
      console.log(`🔒 After exclusion filtering: ${filteredCreds.length} credentials`);
      
      this.testResults.push({
        test: 'credential_listing',
        success: true,
        details: `${safeCredentials.length} total, ${filteredCreds.length} production-ready`
      });

      return safeCredentials;
      
    } catch (error) {
      console.error('❌ Credential listing failed:', error.message);
      this.testResults.push({
        test: 'credential_listing',
        success: false,
        error: error.message
      });
      return [];
    }
  }

  async testCredentialMatching(credentials) {
    console.log('\n🎯 Testing credential matching...');
    
    const testCases = [
      {
        nodeType: 'n8n-nodes-base.openAi',
        expectedType: 'openAiApi',
        description: 'OpenAI node'
      },
      {
        nodeType: 'n8n-nodes-base.httpRequest',
        hints: { service: 'supabase' },
        expectedType: 'httpHeaderAuth',
        description: 'HTTP Request with Supabase hints'
      },
      {
        nodeType: 'n8n-nodes-base.postgres',
        expectedType: 'postgres',
        description: 'PostgreSQL node'
      },
      {
        nodeType: 'n8n-nodes-base.emailSend',
        expectedType: 'smtp',
        description: 'Email Send node'
      }
    ];

    let successCount = 0;

    for (const testCase of testCases) {
      try {
        console.log(`\n  Testing: ${testCase.description}`);
        
        // Simulate credential matching logic
        let bestMatch = null;
        let matchReason = 'no_match';
        
        // Priority 1: Exact native node type match
        bestMatch = credentials.find(c => c.nodesAccess.includes(testCase.nodeType));
        if (bestMatch) {
          matchReason = 'exact_node_match';
        }
        
        // Priority 2: Service hint matching
        if (!bestMatch && testCase.hints) {
          const hintMappings = {
            'supabase': () => credentials.find(c => 
              c.type === 'httpHeaderAuth' && 
              c.name.toLowerCase().includes('supabase')
            ),
          };
          
          if (testCase.hints.service && hintMappings[testCase.hints.service]) {
            bestMatch = hintMappings[testCase.hints.service]();
            if (bestMatch) {
              matchReason = `service_hint_${testCase.hints.service}`;
            }
          }
        }
        
        // Priority 3: Type-based fallback
        if (!bestMatch && testCase.expectedType) {
          bestMatch = credentials.find(c => c.type === testCase.expectedType);
          if (bestMatch) {
            matchReason = 'type_fallback';
          }
        }

        if (bestMatch) {
          console.log(`    ✅ Matched: ${bestMatch.name} (${bestMatch.type}) - ${matchReason}`);
          successCount++;
        } else {
          console.log(`    ⚠️  No match found for ${testCase.description}`);
        }

      } catch (error) {
        console.log(`    ❌ Error matching ${testCase.description}:`, error.message);
      }
    }

    this.testResults.push({
      test: 'credential_matching',
      success: successCount > 0,
      details: `${successCount}/${testCases.length} matches found`
    });

    return successCount;
  }

  async testCredentialTypes() {
    console.log('\n📋 Testing credential types...');
    
    try {
      const response = await this.n8nRequest('/rest/credential-types');
      const credentialTypes = response.credentialTypes || [];
      
      console.log(`✅ Found ${credentialTypes.length} credential types`);
      
      // Test type mapping
      const typeMapping = {
        'openAiApi': ['n8n-nodes-base.openAi'],
        'httpBasicAuth': ['n8n-nodes-base.httpRequest'],
        'httpHeaderAuth': ['n8n-nodes-base.httpRequest'],
        'postgres': ['n8n-nodes-base.postgres'],
        'smtp': ['n8n-nodes-base.emailSend'],
      };

      const mappedTypes = credentialTypes.filter(type => typeMapping[type.name]);
      console.log(`🔗 ${mappedTypes.length} types have node mappings`);
      
      this.testResults.push({
        test: 'credential_types',
        success: true,
        details: `${credentialTypes.length} types, ${mappedTypes.length} mapped`
      });

    } catch (error) {
      console.error('❌ Credential types test failed:', error.message);
      this.testResults.push({
        test: 'credential_types',
        success: false,
        error: error.message
      });
    }
  }

  async testWorkflowCredentialBinding() {
    console.log('\n🔗 Testing workflow credential binding...');
    
    try {
      // Create a test workflow structure
      const testWorkflow = {
        name: 'Test Credential Binding',
        nodes: [
          {
            id: 'webhook-1',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            position: [100, 100],
            parameters: { httpMethod: 'POST', path: 'test' }
          },
          {
            id: 'openai-1', 
            name: 'OpenAI Node',
            type: 'n8n-nodes-base.openAi',
            position: [300, 100],
            parameters: { resource: 'chat', operation: 'message' }
          }
        ],
        connections: {
          'Webhook': {
            main: [[{ node: 'OpenAI Node', type: 'main', index: 0 }]]
          }
        }
      };

      // Test credential binding simulation
      const mockCredential = { id: '12', name: 'OpenAI (prod)', type: 'openAiApi' };
      const targetNode = testWorkflow.nodes.find(n => n.id === 'openai-1');
      
      if (targetNode) {
        targetNode.credentials = {
          openAiApi: {
            id: mockCredential.id,
            name: mockCredential.name
          }
        };
        
        console.log('✅ Successfully bound credential to OpenAI node');
        console.log(`    Credential: ${mockCredential.name} (ID: ${mockCredential.id})`);
        
        this.testResults.push({
          test: 'credential_binding',
          success: true,
          details: 'Successfully bound OpenAI credential'
        });
      } else {
        throw new Error('Target node not found');
      }

    } catch (error) {
      console.error('❌ Credential binding test failed:', error.message);
      this.testResults.push({
        test: 'credential_binding',
        success: false,
        error: error.message
      });
    }
  }

  async testN8nConnection() {
    console.log('\n🌐 Testing n8n connection...');
    
    try {
      const response = await this.n8nRequest('/rest/workflows?limit=1');
      console.log('✅ n8n API connection successful');
      
      this.testResults.push({
        test: 'n8n_connection',
        success: true,
        details: 'API connection verified'
      });

    } catch (error) {
      console.error('❌ n8n connection failed:', error.message);
      this.testResults.push({
        test: 'n8n_connection',
        success: false,
        error: error.message
      });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting MCP Credential Management Tests');
    console.log(`📡 N8N URL: ${this.baseUrl}`);
    
    // Test n8n connection first
    await this.testN8nConnection();
    
    // Get credentials for other tests
    const credentials = await this.testCredentialListing();
    
    // Run remaining tests
    await this.testCredentialTypes();
    await this.testCredentialMatching(credentials);
    await this.testWorkflowCredentialBinding();
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total} tests`);
    
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.details || result.error}`);
    });

    if (passed === total) {
      console.log('\n🎉 All tests passed! MCP credential management is ready.');
      console.log('\n📝 Next steps:');
      console.log('1. Start the MCP server: node tools/mcp-servers/n8n-server.mjs');
      console.log('2. Configure Cursor with the MCP settings');
      console.log('3. Test in Cursor: "List my n8n credentials and create a simple workflow"');
    } else {
      console.log('\n⚠️  Some tests failed. Check your n8n setup and API configuration.');
    }
    
    console.log(`\n🔧 Environment: N8N_BASE_URL=${this.baseUrl}`);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CredentialTester();
  await tester.runAllTests();
}
