#!/usr/bin/env node

/**
 * Test script for enhanced planner prompt
 * Sends test queries to the chat API and verifies tool selection
 */

const BASE_URL = 'http://localhost:3003';
const CHAT_API = `${BASE_URL}/api/chat/stream`;

const testQueries = [
  {
    name: 'What is Scorpion?',
    query: 'What is Scorpion?',
    expectedTools: ['code.readFile'],
    shouldNotUse: ['kb.search'],
    description: 'Should use code.readFile for README/docs to answer what Scorpion is. This is classified as project_help (not identity) to allow tool usage.'
  },
  {
    name: 'Show recent files',
    query: 'Show me recent files',
    expectedTools: ['files.recent'],
    shouldNotUse: ['kb.search', 'project.analyze', 'research.run'],
    description: 'Should use files.recent, NOT kb.search or project.analyze'
  },
  {
    name: 'Research query',
    query: 'Research Bitcoin news',
    expectedTools: ['research.run'],
    shouldNotUse: [],
    description: 'Should use research.run for research queries'
  },
  {
    name: 'System health',
    query: 'Check system health',
    expectedTools: ['system.health'],
    shouldNotUse: [],
    description: 'Should use system.health for operational questions'
  },
  {
    name: 'Architecture question',
    query: 'Explain the architecture',
    expectedTools: ['code.readFile'],
    shouldNotUse: [],
    description: 'Should use code.readFile with includeAST for architecture questions'
  }
];

async function testQuery(test) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`   Query: "${test.query}"`);
  console.log(`   Expected: ${test.expectedTools.join(', ')}`);
  if (test.shouldNotUse.length > 0) {
    console.log(`   Should NOT use: ${test.shouldNotUse.join(', ')}`);
  }
  
  try {
    const response = await fetch(CHAT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: test.query
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let planFound = false;
    let toolsUsed = [];
    let reasoning = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'plan') {
              planFound = true;
              const planData = data.data;
              
              // Handle nested structure: data.data.plan.plan (the actual plan array)
              // or flat structure: data.data.plan (direct array)
              let planSteps = null;
              if (planData.plan && planData.plan.plan && Array.isArray(planData.plan.plan)) {
                // Nested structure (enforced plan - this is what actually gets executed)
                planSteps = planData.plan.plan;
              } else if (planData.plan && Array.isArray(planData.plan)) {
                // Flat structure (could be raw or enforced)
                planSteps = planData.plan;
              } else if (Array.isArray(planData)) {
                // Direct array
                planSteps = planData;
              }
              
              // Extract tools from plan steps
              if (planSteps) {
                const extractedTools = planSteps
                  .map(step => step.tool)
                  .filter(tool => tool && tool !== 'none');
                
                // Only update toolsUsed if we have actual tools (enforced plan)
                // or if this is the first plan we've seen
                if (extractedTools.length > 0 || toolsUsed.length === 0) {
                  toolsUsed = extractedTools;
                }
              }
              
              // Extract reasoning
              if (planData.reasoning) {
                reasoning = planData.reasoning;
              } else if (planData.plan && planData.plan.reasoning) {
                reasoning = planData.plan.reasoning;
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    // Evaluate final result (after all plans have been processed)
    if (!planFound) {
      console.log(`   ⚠️  WARNING: No plan found in response`);
      return;
    }
    
    // Only check expectations against the final (enforced) plan
    console.log(`   ✅ Plan received`);
    console.log(`   Tools in plan: ${toolsUsed.join(', ') || 'none'}`);
    
    // Check expected tools
    const hasExpected = test.expectedTools.every(tool => 
      toolsUsed.includes(tool) || (reasoning && reasoning.toLowerCase().includes(tool.toLowerCase()))
    );
    
    // Check should not use
    const hasForbidden = test.shouldNotUse.some(tool => 
      toolsUsed.includes(tool) || (reasoning && reasoning.toLowerCase().includes(tool.toLowerCase()))
    );
    
    if (hasExpected && !hasForbidden) {
      console.log(`   ✅ PASS: Correct tool selection`);
    } else {
      console.log(`   ⚠️  WARNING: Tool selection may not match expectations`);
      if (!hasExpected) {
        console.log(`      Missing expected tools: ${test.expectedTools.filter(t => !toolsUsed.includes(t)).join(', ')}`);
      }
      if (hasForbidden) {
        console.log(`      Using forbidden tools: ${test.shouldNotUse.filter(t => toolsUsed.includes(t)).join(', ')}`);
      }
    }
    
    // Show reasoning snippet if available
    if (reasoning) {
      const snippet = reasoning.substring(0, 200);
      console.log(`   Reasoning: ${snippet}...`);
    }

  } catch (error) {
    console.error(`   ❌ ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Enhanced Planner Prompt');
  console.log('==================================\n');
  
  for (const test of testQueries) {
    await testQuery(test);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Testing complete');
}

runTests().catch(console.error);

