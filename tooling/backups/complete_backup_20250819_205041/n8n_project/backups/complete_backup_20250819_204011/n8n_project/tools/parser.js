import fs from 'fs';

export function parseWorkflow(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = JSON.parse(content);
    
    const nodes = workflow.nodes?.map(node => ({
      id: slugify(node.name || node.id),
      name: node.name || node.id,
      type: node.type || 'unknown',
      isTrigger: isTriggerNode(node.type),
      position: node.position || [0, 0]
    })) || [];
    
    const edges = [];
    const connections = workflow.connections || {};
    
    Object.entries(connections).forEach(([fromNode, outputs]) => {
      Object.entries(outputs).forEach(([outputName, targetArrays]) => {
        targetArrays.forEach(targetArray => {
          targetArray.forEach(target => {
            edges.push({
              from: slugify(fromNode),
              to: slugify(target.node),
              label: outputName !== 'main' ? outputName : ''
            });
          });
        });
      });
    });
    
    return {
      name: workflow.name || 'Unnamed Workflow',
      nodes,
      edges,
      isActive: workflow.active || false,
      updatedAt: workflow.updatedAt || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function isTriggerNode(type) {
  const triggers = [
    'webhook', 'httptrigger', 'cron', 'schedule', 'interval',
    'rsstrigger', 'imaptrigger', 'emailtrigger', 'slacktrigger',
    'twiliotrigger', 'formtrigger', 'manualtrigger'
  ];
  return triggers.some(trigger => 
    type.toLowerCase().includes(trigger.toLowerCase())
  );
}
