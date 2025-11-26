import fs from 'fs';
import path from 'path';

function fail(msg) { 
  console.error('❌', msg); 
  process.exit(1); 
}

const file = process.argv[2];
if (!file) fail('Usage: node tools/validate-spec.js <spec.yaml>');

const yaml = (await import('yaml')).default;
const src = fs.readFileSync(file, 'utf8');
let spec;

try { 
  spec = yaml.parse(src); 
} catch(e) { 
  fail(`YAML parse error: ${e.message}`); 
}

function req(obj, key) { 
  if (!(key in obj)) fail(`Missing required: ${key}`); 
}

// Basic structure validation
req(spec, 'name'); 
req(spec, 'trigger'); 
req(spec, 'steps');

// Validate trigger
req(spec.trigger, 'type');
if (!['webhook', 'cron'].includes(spec.trigger.type)) {
  fail(`Unsupported trigger type: ${spec.trigger.type}`);
}

// Validate steps
(spec.steps || []).forEach((s, i) => {
  req(s, 'id'); 
  req(s, 'type');
  
  if (!/^[A-Za-z0-9_]+$/.test(s.id)) {
    fail(`Invalid id at steps[${i}]: ${s.id}`);
  }
  
  if (!['httpRequest', 'set', 'function', 'if', 'merge'].includes(s.type)) {
    fail(`Unsupported step type at steps[${i}]: ${s.type}`);
  }
  
  // Type-specific validation
  if (s.type === 'httpRequest' && s.request) {
    if (s.request.url && !s.request.url.match(/^https?:\/\//)) {
      console.warn(`⚠️  Step ${s.id}: URL should start with http:// or https://`);
    }
  }
  
  if (s.type === 'function' && !s.code) {
    console.warn(`⚠️  Step ${s.id}: function step should have 'code' property`);
  }
  
  if (s.type === 'if' && !s.condition) {
    console.warn(`⚠️  Step ${s.id}: if step should have 'condition' property`);
  }
});

// Validate connections
if (spec.connections) {
  spec.connections.forEach((conn, i) => {
    req(conn, 'from');
    req(conn, 'to');
    
    const [fromBase] = conn.from.split('.');
    const stepIds = spec.steps.map(s => s.id);
    const triggerIds = [spec.trigger.id || 'trigger', 'trigger'];
    
    if (!stepIds.includes(fromBase) && !triggerIds.includes(fromBase)) {
      console.warn(`⚠️  Connection ${i}: unknown from step '${fromBase}'`);
    }
    
    if (!stepIds.includes(conn.to)) {
      console.warn(`⚠️  Connection ${i}: unknown to step '${conn.to}'`);
    }
  });
}

console.log('✅ Spec looks OK');
