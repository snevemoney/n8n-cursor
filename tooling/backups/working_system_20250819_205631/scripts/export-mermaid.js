#!/usr/bin/env node

/**
 * Export Mermaid diagrams from .md files to .svg using mermaid-cli
 * This script processes all .md files in the visualizations/ directory
 * and exports any Mermaid diagrams found to corresponding .svg files
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const visualizationsDir = join(projectRoot, 'visualizations');

/**
 * Extract Mermaid content from markdown file
 */
function extractMermaidFromMarkdown(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const mermaidBlocks = [];
  
  // Match mermaid code blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  let match;
  
  while ((match = mermaidRegex.exec(content)) !== null) {
    mermaidBlocks.push(match[1].trim());
  }
  
  return mermaidBlocks;
}

/**
 * Export single Mermaid diagram to SVG
 */
function exportMermaidToSvg(mermaidContent, outputPath) {
  try {
    // Create temporary mermaid file
    const tempMermaidFile = outputPath.replace('.svg', '.temp.mmd');
    writeFileSync(tempMermaidFile, mermaidContent, 'utf8');
    
    // Use mmdc to export to SVG
    const command = `mmdc -i "${tempMermaidFile}" -o "${outputPath}" -t neutral -b white --width 1200 --height 800`;
    
    console.log(`🎨 Exporting: ${basename(outputPath)}`);
    execSync(command, { stdio: 'pipe' });
    
    // Clean up temp file
    execSync(`rm -f "${tempMermaidFile}"`);
    
    console.log(`✅ Created: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to export ${outputPath}:`, error.message);
    return false;
  }
}

/**
 * Process all markdown files in visualizations directory
 */
function processVisualizationFiles() {
  if (!existsSync(visualizationsDir)) {
    console.log('📁 No visualizations directory found');
    return;
  }
  
  const files = readdirSync(visualizationsDir);
  const markdownFiles = files.filter(file => extname(file) === '.md');
  
  console.log(`🔍 Found ${markdownFiles.length} markdown files to process`);
  
  let exportCount = 0;
  
  for (const file of markdownFiles) {
    const filePath = join(visualizationsDir, file);
    const baseName = basename(file, '.md');
    const outputPath = join(visualizationsDir, `${baseName}.svg`);
    
    console.log(`\n📖 Processing: ${file}`);
    
    const mermaidBlocks = extractMermaidFromMarkdown(filePath);
    
    if (mermaidBlocks.length === 0) {
      console.log(`⚠️  No Mermaid diagrams found in ${file}`);
      continue;
    }
    
    if (mermaidBlocks.length > 1) {
      console.log(`📊 Found ${mermaidBlocks.length} Mermaid diagrams, using the first one`);
    }
    
    // Export the first (or only) Mermaid diagram
    const success = exportMermaidToSvg(mermaidBlocks[0], outputPath);
    if (success) {
      exportCount++;
    }
  }
  
  console.log(`\n🎉 Export complete! Generated ${exportCount} SVG files.`);
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Mermaid SVG export...');
  console.log(`📂 Processing files in: ${visualizationsDir}`);
  
  // Check if mmdc is available
  try {
    execSync('mmdc --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ mermaid-cli (mmdc) is not installed or not in PATH');
    console.error('💡 Install with: npm install -g @mermaid-js/mermaid-cli');
    process.exit(1);
  }
  
  processVisualizationFiles();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processVisualizationFiles, extractMermaidFromMarkdown, exportMermaidToSvg };
