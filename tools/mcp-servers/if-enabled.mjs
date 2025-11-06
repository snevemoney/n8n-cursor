#!/usr/bin/env node
/**
 * MCP Server Guard Script
 * Only executes the target script if ENABLED=1/true/yes
 */

import { spawn } from 'node:child_process';

const enabled = process.env.ENABLED && ['1', 'true', 'yes'].includes(process.env.ENABLED.toLowerCase());

if (!enabled) {
  // Exit cleanly without error - Cursor will just skip this MCP server
  process.exit(0);
}

const target = process.argv[2];
if (!target) {
  console.error('if-enabled.mjs: missing target script');
  process.exit(1);
}

// Execute the target MCP server
const child = spawn('node', [target], { 
  stdio: 'inherit', 
  env: process.env 
});

child.on('exit', (code) => process.exit(code ?? 0));
