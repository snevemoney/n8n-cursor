#!/usr/bin/env node
/**
 * Parse Obsidian .canvas JSON → flow graph + optional founder-signal / predictive payload.
 * Usage:
 *   node parse-canvas.mjs path/to/file.canvas
 *   node parse-canvas.mjs file.canvas --emit json|founder-signal|thesis
 */
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
const emit = process.argv.includes('--emit')
  ? process.argv[process.argv.indexOf('--emit') + 1]
  : 'json';

if (!file || !fs.existsSync(file)) {
  console.error('Usage: node parse-canvas.mjs <file.canvas> [--emit json|founder-signal|thesis]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const nodes = raw.nodes || [];
const edges = raw.edges || [];

const byId = Object.fromEntries(
  nodes.map((n) => [
    n.id,
    {
      id: n.id,
      type: n.type || 'text',
      label: (n.text || n.label || n.id || '').replace(/\n/g, ' ').trim().slice(0, 200),
    },
  ]),
);

const flows = edges.map((e) => ({
  from: byId[e.fromNode]?.label || e.fromNode,
  to: byId[e.toNode]?.label || e.toNode,
}));

const steps = [];
const seen = new Set();
for (const e of edges) {
  const from = byId[e.fromNode]?.label;
  const to = byId[e.toNode]?.label;
  if (from && !seen.has(from)) {
    steps.push(from);
    seen.add(from);
  }
  if (to && !seen.has(to)) {
    steps.push(to);
    seen.add(to);
  }
}

const thesis =
  steps.length > 0
    ? `Canvas blueprint "${path.basename(file, '.canvas')}": ${steps.join(' → ')}`
    : `Canvas blueprint "${path.basename(file, '.canvas')}" with ${nodes.length} nodes`;

const out = {
  file: path.basename(file),
  nodeCount: nodes.length,
  edgeCount: edges.length,
  steps,
  flows,
  thesis,
};

if (emit === 'thesis') {
  console.log(thesis);
  process.exit(0);
}

if (emit === 'founder-signal') {
  const cid = `canvas-${Date.now()}`;
  console.log(
    JSON.stringify(
      {
        route: 'founder-signal',
        correlationId: cid,
        sourceRepo: 'obsidian-vault',
        payload: {
          signalType: 'doc',
          source: 'obsidian-canvas',
          text: thesis + '\n\nFlows:\n' + flows.map((f) => `- ${f.from} → ${f.to}`).join('\n'),
          tags: ['canvas', 'blueprint', path.basename(file, '.canvas')],
        },
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

console.log(JSON.stringify(out, null, 2));
