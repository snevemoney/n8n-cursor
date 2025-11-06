import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = process.env.N8N_BASE_URL || 'https://n8ncloud.tech';
const EMAIL = process.env.N8N_EMAIL;
const PASSWORD = process.env.N8N_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('❌ Missing N8N_EMAIL and/or N8N_PASSWORD environment variables');
  process.exit(1);
}

// Login and get session cookie
async function login() {
  console.log('🔐 Logging in to n8n...');
  
  try {
    // Try different login endpoints
    const loginEndpoints = [
      `${BASE_URL}/rest/login`,
      `${BASE_URL}/auth/login`,
      `${BASE_URL}/api/v1/auth/login`
    ];
    
    for (const endpoint of loginEndpoints) {
      try {
        console.log(`Trying login endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: EMAIL,
            password: PASSWORD
          })
        });
        
        if (response.ok) {
          const cookies = response.headers.raw()['set-cookie'];
          console.log('✅ Login successful');
          return cookies ? cookies.join('; ') : '';
        } else {
          console.log(`Login failed at ${endpoint}: ${response.status}`);
        }
      } catch (err) {
        console.log(`Error at ${endpoint}: ${err.message}`);
      }
    }
    
    throw new Error('All login endpoints failed');
  } catch (error) {
    console.error('❌ Login failed, trying fallback approach:', error.message);
    // Return empty cookie - we'll let the browser-based approach handle it
    return '';
  }
}

// Create the GPT-5 Support Agent workflow
async function createWorkflow(sessionCookie) {
  console.log('🔨 Creating GPT-5 Support Agent workflow...');
  
  const workflow = {
    name: "GPT-5 Support Agent",
    active: false,
    nodes: [
      {
        id: "gmail-trigger",
        name: "Gmail Trigger",
        type: "n8n-nodes-base.gmailTrigger",
        typeVersion: 1,
        position: [120, 300],
        parameters: {
          pollTimes: {
            item: [{ mode: "everyMinute" }]
          },
          simple: false,
          filters: {}
        }
      },
      {
        id: "check-sender",
        name: "When missing a sender name",
        type: "n8n-nodes-base.if",
        typeVersion: 2,
        position: [320, 300],
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: "",
              typeValidation: "strict"
            },
            conditions: [
              {
                leftValue: "={{ $json.payload.headers.from }}",
                rightValue: "",
                operator: {
                  type: "string",
                  operation: "isEmpty"
                }
              }
            ],
            combinator: "and"
          }
        }
      },
      {
        id: "support-agent",
        name: "Support Agent",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [520, 300],
        parameters: {
          jsCode: `// GPT-5 Support Agent Logic
const emailContent = $json.payload.snippet || $json.payload.body;
const sender = $json.payload.headers.from || 'Unknown Sender';

// Extract key information
const supportTicket = {
  sender: sender,
  subject: $json.payload.subject || 'No Subject',
  content: emailContent,
  priority: emailContent.toLowerCase().includes('urgent') ? 'high' : 'normal',
  category: 'general_inquiry',
  timestamp: new Date().toISOString()
};

return { 
  json: { 
    supportTicket,
    needsResponse: true,
    confidence: 0.85 
  } 
};`
        }
      },
      {
        id: "content-database",
        name: "Content Database",
        type: "n8n-nodes-base.airtable",
        typeVersion: 1,
        position: [520, 480],
        parameters: {
          application: "app_placeholder",
          table: "support_responses",
          operation: "list"
        }
      },
      {
        id: "punctuation",
        name: "Punctuation",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [720, 300],
        parameters: {
          jsCode: `// Clean and format text
let text = $json.supportTicket?.content || $json.content || '';

// Basic punctuation cleanup
text = text.replace(/\s+/g, ' ').trim();
text = text.replace(/([.!?])([A-Z])/g, '$1 $2');

return { 
  json: { 
    ...($json.supportTicket ? { supportTicket: { ...$json.supportTicket, content: text } } : {}),
    cleanedText: text 
  } 
};`
        }
      },
      {
        id: "set-output",
        name: "Set Output",
        type: "n8n-nodes-base.set",
        typeVersion: 2,
        position: [920, 300],
        parameters: {
          keepOnlySet: false,
          values: {
            string: [
              {
                name: "responseType",
                value: "automated_support"
              },
              {
                name: "agentVersion",
                value: "GPT-5"
              }
            ]
          }
        }
      },
      {
        id: "ai-agent",
        name: "AI Agent",
        type: "n8n-nodes-base.openAiChat",
        typeVersion: 1,
        position: [1120, 300],
        parameters: {
          model: "gpt-4",
          messages: {
            values: [
              {
                content: `You are a helpful customer support agent. 
                
Customer inquiry: {{ $json.supportTicket.content || $json.cleanedText }}
                
Provide a professional, helpful response that addresses their concern.`,
                role: "user"
              }
            ]
          },
          options: {
            temperature: 0.3,
            maxTokens: 500
          }
        }
      },
      {
        id: "score",
        name: "Score",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1320, 300],
        parameters: {
          functionCode: `// Calculate confidence score for the response
const responseLength = items[0].json.choices?.[0]?.message?.content?.length || 0;
const hasKeywords = /thank|help|assist|resolve|solution/i.test(
  items[0].json.choices?.[0]?.message?.content || ''
);

const score = Math.min(0.95, 0.6 + (responseLength > 100 ? 0.2 : 0) + (hasKeywords ? 0.15 : 0));

return items.map(item => ({
  json: {
    ...item.json,
    confidenceScore: score,
    readyToSend: score > 0.7
  }
}));`
        }
      },
      {
        id: "send-message",
        name: "Send a message",
        type: "n8n-nodes-base.gmail",
        typeVersion: 2,
        position: [1520, 300],
        parameters: {
          resource: "message",
          operation: "send",
          message: {
            to: "={{ $json.supportTicket?.sender || 'customer@example.com' }}",
            subject: "Re: {{ $json.supportTicket?.subject || 'Your Support Request' }}",
            body: "={{ $json.choices?.[0]?.message?.content || 'Thank you for contacting us.' }}"
          }
        }
      }
    ],
    connections: {
      "Gmail Trigger": {
        main: [
          [
            {
              node: "When missing a sender name",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "When missing a sender name": {
        main: [
          [
            {
              node: "Support Agent",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Support Agent": {
        main: [
          [
            {
              node: "Punctuation",
              type: "main",
              index: 0
            },
            {
              node: "Content Database",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Punctuation": {
        main: [
          [
            {
              node: "Set Output",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Set Output": {
        main: [
          [
            {
              node: "AI Agent",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "AI Agent": {
        main: [
          [
            {
              node: "Score",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Score": {
        main: [
          [
            {
              node: "Send a message",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    },
    settings: {
      executionOrder: "v1"
    },
    staticData: null,
    meta: null,
    pinData: null
  };
  
  try {
    const response = await fetch(`${BASE_URL}/rest/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(workflow)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create workflow: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Workflow created successfully');
    
    return {
      id: result.id,
      name: result.name
    };
  } catch (error) {
    console.error('❌ Failed to create workflow:', error.message);
    process.exit(1);
  }
}

// Save workflow as importable JSON file
function saveWorkflowForImport() {
  console.log('💾 Saving GPT-5 Support Agent workflow for manual import...');
  
  const workflow = {
    name: "GPT-5 Support Agent",
    active: false,
    nodes: [
      {
        id: "gmail-trigger",
        name: "Gmail Trigger",
        type: "n8n-nodes-base.gmailTrigger",
        typeVersion: 1,
        position: [120, 300],
        parameters: {
          pollTimes: {
            item: [{ mode: "everyMinute" }]
          },
          simple: false,
          filters: {}
        }
      },
      {
        id: "check-sender",
        name: "When missing a sender name",
        type: "n8n-nodes-base.if",
        typeVersion: 2,
        position: [320, 300],
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: "",
              typeValidation: "strict"
            },
            conditions: [
              {
                leftValue: "={{ $json.payload.headers.from }}",
                rightValue: "",
                operator: {
                  type: "string",
                  operation: "isEmpty"
                }
              }
            ],
            combinator: "and"
          }
        }
      },
      {
        id: "support-agent",
        name: "Support Agent",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [520, 300],
        parameters: {
          jsCode: `// GPT-5 Support Agent Logic
const emailContent = $json.payload.snippet || $json.payload.body;
const sender = $json.payload.headers.from || 'Unknown Sender';

// Extract key information
const supportTicket = {
  sender: sender,
  subject: $json.payload.subject || 'No Subject',
  content: emailContent,
  priority: emailContent.toLowerCase().includes('urgent') ? 'high' : 'normal',
  category: 'general_inquiry',
  timestamp: new Date().toISOString()
};

return { 
  json: { 
    supportTicket,
    needsResponse: true,
    confidence: 0.85 
  } 
};`
        }
      },
      {
        id: "content-database",
        name: "Content Database",
        type: "n8n-nodes-base.airtable",
        typeVersion: 1,
        position: [520, 480],
        parameters: {
          application: "app_placeholder",
          table: "support_responses",
          operation: "list"
        }
      },
      {
        id: "punctuation",
        name: "Punctuation",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [720, 300],
        parameters: {
          jsCode: `// Clean and format text
let text = $json.supportTicket?.content || $json.content || '';

// Basic punctuation cleanup
text = text.replace(/\\s+/g, ' ').trim();
text = text.replace(/([.!?])([A-Z])/g, '$1 $2');

return { 
  json: { 
    ...($json.supportTicket ? { supportTicket: { ...$json.supportTicket, content: text } } : {}),
    cleanedText: text 
  } 
};`
        }
      },
      {
        id: "set-output",
        name: "Set Output",
        type: "n8n-nodes-base.set",
        typeVersion: 2,
        position: [920, 300],
        parameters: {
          keepOnlySet: false,
          values: {
            string: [
              {
                name: "responseType",
                value: "automated_support"
              },
              {
                name: "agentVersion",
                value: "GPT-5"
              }
            ]
          }
        }
      },
      {
        id: "ai-agent",
        name: "AI Agent",
        type: "n8n-nodes-base.openAiChat",
        typeVersion: 1,
        position: [1120, 300],
        parameters: {
          model: "gpt-4",
          messages: {
            values: [
              {
                content: `You are a helpful customer support agent. 

Customer inquiry: {{ $json.supportTicket.content || $json.cleanedText }}

Provide a professional, helpful response that addresses their concern.`,
                role: "user"
              }
            ]
          },
          options: {
            temperature: 0.3,
            maxTokens: 500
          }
        }
      },
      {
        id: "score",
        name: "Score",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1320, 300],
        parameters: {
          functionCode: `// Calculate confidence score for the response
const responseLength = items[0].json.choices?.[0]?.message?.content?.length || 0;
const hasKeywords = /thank|help|assist|resolve|solution/i.test(
  items[0].json.choices?.[0]?.message?.content || ''
);

const score = Math.min(0.95, 0.6 + (responseLength > 100 ? 0.2 : 0) + (hasKeywords ? 0.15 : 0));

return items.map(item => ({
  json: {
    ...item.json,
    confidenceScore: score,
    readyToSend: score > 0.7
  }
}));`
        }
      },
      {
        id: "send-message",
        name: "Send a message",
        type: "n8n-nodes-base.gmail",
        typeVersion: 2,
        position: [1520, 300],
        parameters: {
          resource: "message",
          operation: "send",
          message: {
            to: "={{ $json.supportTicket?.sender || 'customer@example.com' }}",
            subject: "Re: {{ $json.supportTicket?.subject || 'Your Support Request' }}",
            body: "={{ $json.choices?.[0]?.message?.content || 'Thank you for contacting us.' }}"
          }
        }
      }
    ],
    connections: {
      "Gmail Trigger": {
        main: [
          [
            {
              node: "When missing a sender name",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "When missing a sender name": {
        main: [
          [
            {
              node: "Support Agent",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Support Agent": {
        main: [
          [
            {
              node: "Punctuation",
              type: "main",
              index: 0
            },
            {
              node: "Content Database",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Punctuation": {
        main: [
          [
            {
              node: "Set Output",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Set Output": {
        main: [
          [
            {
              node: "AI Agent",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "AI Agent": {
        main: [
          [
            {
              node: "Score",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Score": {
        main: [
          [
            {
              node: "Send a message",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    },
    settings: {
      executionOrder: "v1"
    },
    staticData: null,
    meta: null,
    pinData: null
  };
  
  // Save to workflows directory for visualization
  const workflowPath = '/home/evens/n8n-cursor/workflows/gpt5-support-agent.json';
  fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
  
  // Also save for capture script reference with placeholder ID
  const workflowInfo = {
    id: "gpt5-support-agent", // placeholder for file-based workflow
    name: "GPT-5 Support Agent",
    local: true
  };
  
  fs.writeFileSync('/home/evens/n8n-cursor/scripts/gpt5-workflow.json', JSON.stringify(workflowInfo, null, 2));
  
  console.log(`💾 Workflow saved to: ${workflowPath}`);
  console.log('📋 To import: Copy this JSON file to n8n import or use MCP tools');
  
  return workflowInfo;
}

// Main execution
async function main() {
  console.log('🚀 Starting GPT-5 Support Agent workflow creation...');
  
  const sessionCookie = await login();
  
  if (sessionCookie) {
    const workflow = await createWorkflow(sessionCookie);
    console.log(JSON.stringify(workflow));
    fs.writeFileSync('/home/evens/n8n-cursor/scripts/gpt5-workflow.json', JSON.stringify(workflow, null, 2));
    console.log(`🎉 GPT-5 Support Agent workflow created with ID: ${workflow.id}`);
  } else {
    console.log('🔄 API login failed, creating local workflow file...');
    const workflowInfo = saveWorkflowForImport();
    console.log(JSON.stringify(workflowInfo));
    console.log('🎉 GPT-5 Support Agent workflow ready for import');
  }
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
