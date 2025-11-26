import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Writes a .mmd file and renders to .svg with mmdc
export function writeAndRenderMermaid(basePathNoExt, mermaidBody) {
  const mmdPath = `${basePathNoExt}.mmd`;
  const svgPath = `${basePathNoExt}.svg`;

  // Write pure Mermaid (no markdown fence)
  fs.writeFileSync(mmdPath, mermaidBody, 'utf8');

  // Render to SVG
  try {
    console.log(`🎨 Rendering ${path.basename(mmdPath)} → ${path.basename(svgPath)}`);
    // Create a puppeteer config file for the no-sandbox workaround
    const puppeteerConfigPath = path.join(path.dirname(mmdPath), '.puppeteer-config.json');
    fs.writeFileSync(puppeteerConfigPath, JSON.stringify({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }));
    
    execSync(
      `npx mmdc -i "${mmdPath}" -o "${svgPath}" -t dark -b transparent --width 1200 --height 800 -p "${puppeteerConfigPath}"`,
      { stdio: 'pipe' }
    );
    
    // Clean up config file
    fs.unlinkSync(puppeteerConfigPath);
    
    // Clean up .mmd file (keep only SVG)
    fs.unlinkSync(mmdPath);
    
    console.log(`✅ Generated ${svgPath}`);
    return { svgPath };
  } catch (e) {
    console.error(`❌ Mermaid render failed for ${mmdPath}:`, e.message);
    // Keep .mmd file for debugging if render fails
    return null;
  }
}
