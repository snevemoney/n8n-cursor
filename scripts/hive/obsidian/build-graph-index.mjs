#!/usr/bin/env node
/**
 * Build wikilink graph index from Obsidian vault → .hive/graph-index.json
 */
import fs from 'fs';
import path from 'path';

const vault = process.argv[2] || process.env.HIVE_OBSIDIAN_VAULT;
if (!vault || !fs.existsSync(vault)) {
  console.error('Usage: HIVE_OBSIDIAN_VAULT=... node build-graph-index.mjs [vaultPath]');
  process.exit(1);
}

const linkRe = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
const skipDirs = new Set(['.obsidian', '.hive', '.git', 'node_modules']);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

const files = walk(vault);
const nodes = {};
const edges = [];

for (const file of files) {
  const rel = path.relative(vault, file).replace(/\\/g, '/');
  const name = path.basename(file, '.md');
  const text = fs.readFileSync(file, 'utf8');
  nodes[name] = { path: rel, links: [] };
  let m;
  while ((m = linkRe.exec(text)) !== null) {
    const target = m[1].trim();
    nodes[name].links.push(target);
    edges.push({ from: name, to: target, sourcePath: rel });
  }
}

const index = {
  generatedAt: new Date().toISOString(),
  vault,
  nodeCount: Object.keys(nodes).length,
  edgeCount: edges.length,
  nodes,
  edges,
};

const outDir = path.join(vault, '.hive');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'graph-index.json');
fs.writeFileSync(outPath, JSON.stringify(index, null, 2));
console.log(`Wrote ${outPath} (${index.nodeCount} nodes, ${index.edgeCount} edges)`);
