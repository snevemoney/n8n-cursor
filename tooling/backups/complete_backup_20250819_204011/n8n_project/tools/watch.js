import fs from 'fs';
import path from 'path';
import { generateAllDiagrams } from './gen-all.js';

const WORKFLOWS_DIR = '/home/evens/n8n-cursor/workflows';

console.log('👀 Starting workflow file watcher...');
console.log(`📁 Watching: ${WORKFLOWS_DIR}`);

if (!fs.existsSync(WORKFLOWS_DIR)) {
  console.log('⚠️ Workflows directory does not exist, creating...');
  fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
}

// Initial generation
generateAllDiagrams();

let debounceTimer = null;

// Watch for changes
fs.watch(WORKFLOWS_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.json')) {
    console.log(`🔄 Detected ${eventType} on ${filename}`);
    
    // Debounce rapid changes
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      generateAllDiagrams();
      console.log('✨ Diagrams updated!');
    }, 1000);
  }
});

console.log('✅ Watcher active! Press Ctrl+C to stop.');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...');
  process.exit(0);
});
