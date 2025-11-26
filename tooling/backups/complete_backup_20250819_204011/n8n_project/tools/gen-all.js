import fs from 'fs';
import path from 'path';
import { parseWorkflow } from './parser.js';
import { generateMermaidDiagram } from './mermaid.js';
import { writeAndRenderMermaid } from './mermaid-export.js';
import { createBackup } from './backup.js';

const WORKFLOWS_DIR = '/home/evens/n8n-cursor/workflows';
const VISUALIZATIONS_DIR = '/home/evens/n8n-cursor/visualizations';

export function generateAllDiagrams() {
  console.log('🚀 Starting workflow visualization generation...');
  
  // Create backup first
  createBackup();
  
  // Ensure directories exist
  if (!fs.existsSync(VISUALIZATIONS_DIR)) {
    fs.mkdirSync(VISUALIZATIONS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.log('⚠️ No workflows directory found');
    return;
  }
  
  // Process all JSON files
  const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
    .filter(file => file.endsWith('.json'));
  
  const generatedDiagrams = [];
  
  workflowFiles.forEach(file => {
    const filePath = path.join(WORKFLOWS_DIR, file);
    const baseName = path.basename(file, '.json');
    const outputPath = path.join(VISUALIZATIONS_DIR, `${baseName}.md`);
    
    console.log(`📊 Processing: ${file}`);
    
    const parsed = parseWorkflow(filePath);
    if (parsed) {
      const { raw, fenced } = generateMermaidDiagram(parsed);
      
      // Write Markdown with fenced block
      fs.writeFileSync(outputPath, fenced);
      
      // Also produce .svg
      const baseNoExt = path.join(VISUALIZATIONS_DIR, baseName);
      const rendered = writeAndRenderMermaid(baseNoExt, raw);
      
      // If SVG exists, append an image embed under the fenced block
      if (rendered?.svgPath) {
        fs.appendFileSync(
          outputPath,
          `### Visual Export\n\n![${parsed.name} Diagram](${path.basename(rendered.svgPath)})\n\n`
        );
      }
      
      generatedDiagrams.push({
        name: parsed.name,
        fileName: `${baseName}.md`,
        svgFile: rendered?.svgPath ? `${baseName}.svg` : null,
        isActive: parsed.isActive,
        nodeCount: parsed.nodes.length,
        updatedAt: parsed.updatedAt
      });
      
      console.log(`✅ Generated: ${outputPath}${rendered ? ' + SVG' : ''}`);
    }
  });
  
  // Generate index page
  generateIndexPage(generatedDiagrams);
  
  console.log(`🎉 Generated ${generatedDiagrams.length} workflow diagrams`);
}

function generateIndexPage(diagrams) {
  let indexContent = `# 🔄 n8n Workflow Visualizations

*Auto-generated on ${new Date().toLocaleString()}*

## Quick Stats
- **Total Workflows:** ${diagrams.length}
- **Active Workflows:** ${diagrams.filter(d => d.isActive).length}
- **Total Nodes:** ${diagrams.reduce((sum, d) => sum + d.nodeCount, 0)}

## 📋 Table of Contents

| Workflow | Status | Nodes | Last Updated | Diagram |
|----------|--------|-------|--------------|---------|
`;

  diagrams
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach(diagram => {
      const status = diagram.isActive ? '🟢 Active' : '🔴 Inactive';
      const lastUpdated = new Date(diagram.updatedAt).toLocaleDateString();
      indexContent += `| **${diagram.name}** | ${status} | ${diagram.nodeCount} | ${lastUpdated} | [View](${diagram.fileName}) |\n`;
    });

  indexContent += `\n---\n\n## 🖼️ Workflow Diagrams\n\n`;

  // Embed each diagram
  diagrams.forEach(diagram => {
    indexContent += `### ${diagram.name}\n\n`;
    
    try {
      const diagramContent = fs.readFileSync(
        path.join(VISUALIZATIONS_DIR, diagram.fileName), 
        'utf8'
      );
      indexContent += diagramContent + '\n---\n\n';
    } catch (error) {
      indexContent += `*Error loading diagram: ${error.message}*\n\n---\n\n`;
    }
  });

  indexContent += `## 🔧 Tools & Commands

- **Regenerate All:** \`npm run gen\`
- **Start Watcher:** \`npm run watch\`
- **Sync to GitHub:** \`npm run sync\`
- **View Backups:** Check \`backups/\` folder

*This page updates automatically when workflows change.*
`;

  const indexPath = path.join(VISUALIZATIONS_DIR, 'index.md');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`📄 Generated index: ${indexPath}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllDiagrams();
}
