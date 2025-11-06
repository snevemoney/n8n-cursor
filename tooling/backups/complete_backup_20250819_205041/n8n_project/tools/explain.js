import fs from 'fs';
import path from 'path';

const file = process.argv[2];
if (!file) { 
  console.error('Usage: node tools/explain.js <workflow.json>'); 
  process.exit(1); 
}

const wf = JSON.parse(fs.readFileSync(file, 'utf8'));
const nodes = wf.nodes || [];
const conns = wf.connections || {};

function outgoing(name) {
  const c = conns[name]?.main || [];
  return c.flat().map(e => e.node);
}

function getNodeType(type) {
  return type ? type.split('.').pop() : 'unknown';
}

function isTrigger(node) {
  const triggerTypes = ['webhook', 'cron', 'schedule', 'interval', 'manual'];
  return triggerTypes.some(t => node.type?.toLowerCase().includes(t));
}

function isResponseNode(node) {
  const responseTypes = ['respondToWebhook', 'respondToWebhookBasic'];
  return responseTypes.some(t => node.type?.includes(t));
}

// Generate explanation
let md = `# ${wf.name} — Workflow Explanation

**Status:** ${wf.active ? '🟢 Active' : '🔴 Inactive'}  
**Total Nodes:** ${nodes.length}  
**Created:** ${wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : 'Unknown'}  
**Last Updated:** ${wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : 'Unknown'}

## Overview

`;

// Identify trigger and endpoint nodes
const triggerNodes = nodes.filter(isTrigger);
const responseNodes = nodes.filter(isResponseNode);

if (triggerNodes.length > 0) {
  md += `This workflow is triggered by **${triggerNodes[0].name}** (${getNodeType(triggerNodes[0].type)})`;
  
  if (triggerNodes[0].type?.includes('webhook')) {
    const path = triggerNodes[0].parameters?.path || 'unknown';
    const method = triggerNodes[0].parameters?.httpMethod || 'POST';
    md += ` listening on \`${method} ${path}\``;
  }
  
  if (responseNodes.length > 0) {
    md += ` and responds via **${responseNodes[0].name}**`;
  }
  
  md += '.\n\n';
} else {
  md += 'This workflow has no clear trigger node identified.\n\n';
}

// Describe the workflow purpose based on node types
const nodeTypes = nodes.map(n => getNodeType(n.type));
const hasHttp = nodeTypes.some(t => t === 'httpRequest');
const hasCode = nodeTypes.some(t => t === 'function' || t === 'code');
const hasConditions = nodeTypes.some(t => t === 'if' || t === 'switch');
const hasData = nodeTypes.some(t => t === 'set' || t === 'merge');

md += 'The workflow performs the following operations:\n';
if (hasHttp) md += '- 🌐 Makes HTTP requests to external APIs\n';
if (hasCode) md += '- ⚙️ Executes custom JavaScript code\n';
if (hasConditions) md += '- 🔀 Makes conditional decisions\n';
if (hasData) md += '- 📊 Transforms and manipulates data\n';

md += `\n## Node Details\n\n`;

// List all nodes with descriptions
nodes.forEach((node, index) => {
  const type = getNodeType(node.type);
  md += `### ${index + 1}. ${node.name} \`(${type})\`\n\n`;
  
  // Add specific details based on node type
  if (type === 'webhook') {
    const method = node.parameters?.httpMethod || 'POST';
    const path = node.parameters?.path || '/webhook';
    md += `- **Endpoint:** \`${method} ${path}\`\n`;
    md += `- **Response Mode:** ${node.parameters?.responseMode || 'onReceived'}\n`;
  } else if (type === 'httpRequest') {
    const method = node.parameters?.method || 'GET';
    const url = node.parameters?.url || 'Not configured';
    md += `- **Request:** \`${method} ${url}\`\n`;
    if (node.parameters?.authentication) {
      md += `- **Authentication:** ${node.parameters.authentication}\n`;
    }
  } else if (type === 'if') {
    const condition = node.parameters?.expression || node.parameters?.condition || 'Not specified';
    md += `- **Condition:** \`${condition}\`\n`;
  } else if (type === 'set') {
    const valueCount = node.parameters?.values?.string?.length || 0;
    md += `- **Sets ${valueCount} field(s)**\n`;
  } else if (type === 'function' || type === 'code') {
    const codeLength = (node.parameters?.functionCode || node.parameters?.jsCode || '').length;
    md += `- **Code Length:** ${codeLength} characters\n`;
  }
  
  const outs = outgoing(node.name);
  if (outs.length > 0) {
    md += `- **Connects to:** ${outs.join(', ')}\n`;
  }
  
  md += '\n';
});

md += `## Data Flow\n\n`;

// Create a simple flow description
const flowSteps = [];
let currentNodes = triggerNodes.length > 0 ? [triggerNodes[0].name] : [nodes[0]?.name];

while (currentNodes.length > 0) {
  const nextNodes = [];
  
  currentNodes.forEach(nodeName => {
    if (flowSteps.length < 20) { // Prevent infinite loops
      flowSteps.push(nodeName);
      const outgoingNodes = outgoing(nodeName);
      nextNodes.push(...outgoingNodes);
    }
  });
  
  currentNodes = [...new Set(nextNodes)].filter(name => !flowSteps.includes(name));
  
  if (flowSteps.length > 20) break; // Safety break
}

if (flowSteps.length > 1) {
  md += 'The data flows through the following sequence:\n\n';
  flowSteps.forEach((step, index) => {
    const isLast = index === flowSteps.length - 1;
    md += `${index + 1}. **${step}**${isLast ? '' : ' →'}\n`;
  });
} else {
  md += 'Simple linear flow through all nodes.\n';
}

md += `\n## Usage\n\n`;

if (triggerNodes.length > 0 && triggerNodes[0].type?.includes('webhook')) {
  const path = triggerNodes[0].parameters?.path || '/webhook';
  const method = triggerNodes[0].parameters?.httpMethod || 'POST';
  
  md += `To trigger this workflow, send a ${method} request to:\n\n`;
  md += '```\n';
  md += `${method} https://your-n8n-instance.com/webhook${path}\n`;
  md += '```\n\n';
  
  if (method === 'POST') {
    md += 'Example payload:\n```json\n{\n  "key": "value",\n  "data": "your-data-here"\n}\n```\n\n';
  }
} else if (triggerNodes.length > 0 && triggerNodes[0].type?.includes('cron')) {
  md += 'This workflow runs automatically on a schedule.\n\n';
} else {
  md += 'This workflow can be triggered manually or through other means.\n\n';
}

md += `## Technical Notes\n\n`;
md += `- **Execution Order:** ${wf.settings?.executionOrder || 'v1'}\n`;
md += `- **Static Data:** ${wf.staticData ? 'Yes' : 'None'}\n`;
md += `- **Pinned Data:** ${wf.pinData ? 'Yes' : 'None'}\n`;

if (wf.tags && wf.tags.length > 0) {
  md += `- **Tags:** ${wf.tags.join(', ')}\n`;
}

md += `\n---\n\n*Generated on ${new Date().toLocaleString()}*\n`;

// Save to visualizations directory
const outDir = '/home/evens/n8n-cursor/visualizations';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const baseName = path.basename(file, '.json');
const outFile = path.join(outDir, `${baseName}-explained.md`);
fs.writeFileSync(outFile, md);

console.log(`✅ Generated explanation: ${outFile}`);
