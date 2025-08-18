#!/usr/bin/env node

/**
 * Test runner for AI Agent n8n workflow
 * Usage: node test-workflow.js <webhook-url>
 */

const https = require('https');
const http = require('http');

// Test cases
const testCases = [
  {
    name: "Basic Search Test",
    input: {
      query: "What are the latest features in n8n version 1.0?",
      sessionId: "test-001"
    },
    validate: (response) => {
      return response.subject && response.email && response.actionsTaken?.includes("Searched internet");
    }
  },
  {
    name: "Email Composition Test",
    input: {
      query: "Write a thank you email to a client for their recent purchase",
      sessionId: "test-002"
    },
    validate: (response) => {
      return response.subject && response.email.toLowerCase().includes("thank");
    }
  },
  {
    name: "Memory Test - Part 1",
    input: {
      query: "My favorite color is blue and I work at TechCorp",
      sessionId: "memory-test"
    },
    validate: (response) => {
      return response.subject && response.email;
    }
  },
  {
    name: "Memory Test - Part 2",
    input: {
      query: "What company do I work at and what's my favorite color?",
      sessionId: "memory-test"
    },
    validate: (response) => {
      return response.email.toLowerCase().includes("techcorp") && 
             response.email.toLowerCase().includes("blue");
    }
  },
  {
    name: "Multi-Tool Test",
    input: {
      query: "Search for email marketing best practices and compose a newsletter announcement email",
      sessionId: "test-003"
    },
    validate: (response) => {
      return response.subject && 
             response.email && 
             response.searchResults?.length > 0;
    }
  }
];

// Function to make HTTP request
function makeRequest(webhookUrl, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const protocol = url.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Main test runner
async function runTests(webhookUrl) {
  console.log('🚀 Starting AI Agent Workflow Tests\n');
  console.log(`Webhook URL: ${webhookUrl}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`📝 Running: ${test.name}`);
    console.log(`   Input: ${JSON.stringify(test.input)}`);
    
    try {
      const response = await makeRequest(webhookUrl, test.input);
      console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
      
      if (test.validate(response)) {
        console.log(`   ✅ PASSED\n`);
        passed++;
      } else {
        console.log(`   ❌ FAILED - Validation failed\n`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}\n`);
      failed++;
    }

    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${testCases.length}`);
  
  process.exit(failed > 0 ? 1 : 0);
}

// Check command line arguments
if (process.argv.length < 3) {
  console.error('Usage: node test-workflow.js <webhook-url>');
  console.error('Example: node test-workflow.js https://your-n8n.com/webhook/abc123');
  process.exit(1);
}

// Run tests
runTests(process.argv[2]).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});