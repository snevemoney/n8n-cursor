import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const yaml = (await import('yaml')).default;

const inFile = process.argv[2];
if (!inFile) {
  console.error('Usage: node tools/spec2n8n.js <spec.yaml>');
  process.exit(1);
}

const spec = yaml.parse(fs.readFileSync(inFile, 'utf8'));

function nid() { 
  return crypto.randomBytes(12).toString('hex'); 
}

function slug(s) { 
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); 
}

const nodes = [];
const idMap = new Map();

function addNode(name, type, parameters = {}, credentials = null, options = {}) {
  const id = nid();
  const node = {
    id,
    name,
    type,
    typeVersion: 1,
    position: [0, 0],
    parameters,
    ...(credentials ? { credentials } : {}),
    ...options
  };
  nodes.push(node);
  return id;
}

// Create trigger node
let startId = null;
if (spec.trigger.type === 'webhook') {
  startId = addNode(
    spec.trigger.name || 'Webhook Trigger', 
    'n8n-nodes-base.webhook', 
    {
      httpMethod: (spec.trigger.method || 'POST').toUpperCase(),
      path: spec.trigger.path || '/incoming',
      responseMode: 'onReceived'
    }
  );
} else if (spec.trigger.type === 'cron') {
  startId = addNode(
    spec.trigger.name || 'Cron Trigger', 
    'n8n-nodes-base.cron', 
    {
      triggerTimes: { 
        item: [{ mode: 'everyMinute' }] 
      }
    }
  );
} else {
  throw new Error('Unsupported trigger type: ' + spec.trigger.type);
}

// Create step nodes
(spec.steps || []).forEach(step => {
  let nodeType = null;
  let params = {};
  
  if (step.type === 'httpRequest') {
    nodeType = 'n8n-nodes-base.httpRequest';
    params = {
      method: (step.request?.method || 'GET').toUpperCase(),
      url: step.request?.url || '',
      jsonParameters: true,
      options: {},
      ...(step.request?.headers ? { 
        headerParametersJson: JSON.stringify(step.request.headers)
      } : {}),
      ...(step.request?.query ? { 
        queryParametersJson: JSON.stringify(step.request.query)
      } : {}),
      ...(step.request?.json ? { 
        bodyParametersJson: JSON.stringify(step.request.json)
      } : {})
    };
  } else if (step.type === 'set') {
    nodeType = 'n8n-nodes-base.set';
    params = { 
      keepOnlySet: false, 
      values: { 
        string: Object.entries(step.fields || {}).map(([k, v]) => ({
          name: k, 
          value: v
        }))
      } 
    };
  } else if (step.type === 'function') {
    nodeType = 'n8n-nodes-base.function';
    params = { 
      functionCode: step.code || 'return $json;' 
    };
  } else if (step.type === 'if') {
    nodeType = 'n8n-nodes-base.if';
    params = { 
      conditions: { 
        boolean: [], 
        number: [], 
        string: [] 
      }, 
      mode: 'expression', 
      expression: step.condition || '={{true}}' 
    };
  } else if (step.type === 'merge') {
    nodeType = 'n8n-nodes-base.merge';
    params = { 
      mode: 'passThrough' 
    };
  } else {
    throw new Error('Unsupported step type: ' + step.type);
  }
  
  const id = addNode(step.name || step.id, nodeType, params);
  idMap.set(step.id, id);
});

// Create connections
const connections = {};

function wire(fromId, outIndex, toId, inIndex) {
  const fromNode = nodes.find(n => n.id === fromId);
  const toNode = nodes.find(n => n.id === toId);
  
  if (!fromNode || !toNode) {
    console.warn(`⚠️  Skipping invalid connection: ${fromId} -> ${toId}`);
    return;
  }
  
  const key = fromNode.name;
  connections[key] = connections[key] || { main: [[]] };
  const arr = connections[key].main[outIndex] || (connections[key].main[outIndex] = []);
  arr.push({ 
    node: toNode.name, 
    type: 'main', 
    index: inIndex 
  });
}

// Process connections
if (Array.isArray(spec.connections) && spec.connections.length) {
  for (const c of spec.connections) {
    const [fromBase, branch] = c.from.split('.');
    const fromNodeId = fromBase === (spec.trigger.id || 'trigger') ? startId : idMap.get(fromBase);
    const toNodeId = idMap.get(c.to);
    const outIndex = branch === 'false' ? 1 : 0;
    
    if (fromNodeId && toNodeId) {
      wire(fromNodeId, outIndex, toNodeId, 0);
    }
  }
} else {
  // Default linear chain
  let prev = startId;
  for (const s of spec.steps) {
    const to = idMap.get(s.id);
    if (prev && to) {
      wire(prev, 0, to, 0);
      prev = to;
    }
  }
}

// Generate final workflow
const workflow = {
  name: spec.name,
  active: spec.active ?? false,
  nodes,
  connections,
  settings: {
    executionOrder: 'v1'
  },
  staticData: null,
  meta: null,
  pinData: null
};

// Save to workflows directory
const outDir = '/home/evens/n8n-cursor/workflows';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outFile = path.join(outDir, slug(spec.name) + '.json');
fs.writeFileSync(outFile, JSON.stringify(workflow, null, 2));

console.log(`✅ Generated: ${outFile}`);
