import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// ---- Config ----
const BASE = process.env.N8N_BASE_URL || 'https://evenslouis.ca/n8n';
const EMAIL = process.env.N8N_EMAIL;
const PASSWORD = process.env.N8N_PASSWORD;

// Reads your generated list of workflows from the JSON files you already maintain
const WORKFLOWS_DIR = '/home/evens/n8n-cursor/workflows';
const OUT_DIR = '/home/evens/n8n-cursor/visualizations';
const REVIEW_DIR = path.join(OUT_DIR, 'reviews');

function ensure(p) { 
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); 
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function login(page) {
  console.log('🔐 Attempting to log in to n8n...');
  
  // 1) Try standard signin page
  try {
    await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for form elements to be available
    await page.waitForSelector('input[type="email"], input[data-test-id="email"]', { timeout: 10000 });
    
    const emailSelector = await page.$('input[type="email"]') ? 'input[type="email"]' : 'input[data-test-id="email"]';
    const passwordSelector = await page.$('input[type="password"]') ? 'input[type="password"]' : 'input[data-test-id="password"]';
    
    await page.type(emailSelector, EMAIL, { delay: 20 });
    await page.type(passwordSelector, PASSWORD, { delay: 20 });
    
    // Look for submit button with various selectors
    let submitButton = null;
    
    // Try different button selectors
    const buttonSelectors = [
      'button[type="submit"]',
      'button[data-test-id="signin-button"]',
      'button[data-test-id="submit-button"]',
      'input[type="submit"]',
      '.el-button--primary',
      'button.btn-primary',
      'button'  // fallback to any button
    ];
    
    for (const selector of buttonSelectors) {
      submitButton = await page.$(selector);
      if (submitButton) {
        // Check if this button contains sign in text
        const buttonText = await submitButton.evaluate(el => el.textContent?.toLowerCase() || '');
        if (buttonText.includes('sign') || buttonText.includes('login') || selector.includes('submit')) {
          console.log(`🔐 Found login button: ${selector}`);
          break;
        }
      }
    }
    
    if (submitButton) {
      await Promise.all([
        submitButton.click(),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      ]);
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('⚠️ No login button found');
    }
  } catch (e) {
    console.warn('⚠️ Signin flow failed, trying editor root...', e.message);
  }

  // 2) If your editor is already cookie-authenticated behind reverse proxy
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check if we're on a workflow page or dashboard (not login)
    const isLoggedIn = await page.evaluate(() => {
      return !document.location.pathname.includes('/signin') && 
             !document.body.textContent.includes('Sign in');
    });
    
    if (isLoggedIn) {
      console.log('✅ Already authenticated');
      return true;
    }
  } catch (e) {
    console.error('❌ Could not reach editor root:', e.message);
  }

  console.error('❌ Login failed. Please check N8N_EMAIL/N8N_PASSWORD environment variables.');
  return false;
}

async function captureWorkflow(page, id, nameGuess) {
  console.log(`📸 Capturing workflow: ${nameGuess} (${id})`);
  
  const url = `${BASE}/workflow/${encodeURIComponent(id)}`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Wait for canvas to load
    await page.waitForSelector('svg, canvas, [data-test-id="canvas"]', { timeout: 15000 });
    
    // Try to focus the canvas and hide chrome for a tight shot
    await page.evaluate(() => {
      // Hide common UI elements that might interfere
      const hide = (sel) => {
        document.querySelectorAll(sel).forEach(n => {
          if (n) n.style.display = 'none';
        });
      };
      
      // Common n8n UI elements to hide
      hide('[data-test-id="node-creator"]');
      hide('[data-test-id="sidebar"]');
      hide('header');
      hide('aside');
      hide('.sidebar');
      hide('.el-header');
      hide('[class*="sidebar"]');
      hide('[class*="header"]');
      
      // Set clean background
      document.body.style.background = '#f5f5f5';
      
      // Try to zoom to fit (n8n specific)
      const zoomToFitBtn = document.querySelector('[data-test-id="zoom-to-fit"]');
      if (zoomToFitBtn) zoomToFitBtn.click();
    });
    
    // Wait a moment for UI changes to take effect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Prefer a specific canvas element; fallback to body
    const canvasSelCandidates = [
      '[data-test-id="canvas"]',
      '.node-view',
      '.canvas', 
      '.workflow-canvas', 
      '[class*="canvas"] svg',
      'svg',
      '.konvajs-content'
    ];
    
    let handle = null;
    for (const sel of canvasSelCandidates) {
      handle = await page.$(sel);
      if (handle) { 
        console.log(`📐 Found canvas element: ${sel}`);
        break; 
      }
    }
    
    const clipOpts = handle ? await handle.boundingBox() : null;
    
    // Expand clip area slightly for padding
    if (clipOpts) {
      clipOpts.x = Math.max(0, clipOpts.x - 20);
      clipOpts.y = Math.max(0, clipOpts.y - 20);
      clipOpts.width = Math.min(1200, clipOpts.width + 40);
      clipOpts.height = Math.min(800, clipOpts.height + 40);
    }
    
    const baseName = slug(nameGuess || id);
    const outPng = path.join(OUT_DIR, `${baseName}.png`);
    
    await page.screenshot({
      path: outPng,
      fullPage: !clipOpts,
      clip: clipOpts || undefined,
      type: 'png'
    });

    console.log(`✅ Saved ${outPng}`);
    return outPng;
    
  } catch (error) {
    console.error(`❌ Failed to capture ${nameGuess}:`, error.message);
    return null;
  }
}

function getWorkflowList() {
  // Read your workflow exports (same ones you used for Mermaid)
  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, f), 'utf8'));
      return {
        id: j.id || path.basename(f, '.json'),
        name: j.name || path.basename(f, '.json'),
        active: j.active || false
      };
    } catch (error) {
      console.warn(`⚠️ Could not parse ${f}:`, error.message);
      return {
        id: path.basename(f, '.json'),
        name: path.basename(f, '.json'),
        active: false
      };
    }
  });
}

async function main() {
  console.log('🚀 Starting n8n workflow capture...');
  
  if (!EMAIL || !PASSWORD) {
    console.error('❌ Missing N8N_EMAIL and/or N8N_PASSWORD environment variables');
    console.log('Set them like: export N8N_EMAIL="you@example.com" N8N_PASSWORD="yourpass"');
    process.exit(1);
  }
  
  ensure(OUT_DIR); 
  ensure(REVIEW_DIR);

  const browser = await puppeteer.launch({
    headless: 'new', // or false to watch in a window
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  page.setDefaultTimeout(45000);

  if (!await login(page)) {
    await browser.close();
    process.exit(1);
  }

  const workflows = getWorkflowList();
  console.log(`📋 Found ${workflows.length} workflows to capture`);
  
  const shots = [];
  for (const w of workflows) {
    try {
      const imagePath = await captureWorkflow(page, w.id, w.name);
      if (imagePath) {
        shots.push({ 
          id: w.id, 
          name: w.name, 
          path: imagePath,
          active: w.active 
        });
      }
    } catch (e) {
      console.error(`❌ Failed ${w.id}:`, e.message);
    }
  }

  await browser.close();

  // Build review stub
  const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,16);
  const reviewPath = path.join(REVIEW_DIR, `${stamp}-review.md`);
  
  let md = `# Build Review — ${new Date().toLocaleString()}

This doc was auto-generated from:
- **n8n UI screenshots** (PNG)
- **Mermaid diagrams** (SVG)  
- **workflow JSON** (source of truth)

> Use this page inside Cursor to leave notes; commit to GitHub to keep the history.

## Summary

- **Total Workflows:** ${workflows.length}
- **Screenshots Captured:** ${shots.length}
- **Active Workflows:** ${shots.filter(s => s.active).length}

`;

  for (const s of shots) {
    const base = slug(s.name || s.id);
    const svg = `${base}.svg`;  // produced by your Mermaid pipeline
    const png = path.basename(s.path);
    const status = s.active ? '🟢 Active' : '🔴 Inactive';
    
    md += `---

## ${s.name} ${status}

### n8n Editor Screenshot
![n8n UI for ${s.name}](${png})

### Generated Mermaid Diagram
![Mermaid diagram for ${s.name}](${svg})

### Review Checklist
- [ ] **Structure**: Does the Mermaid diagram match the n8n editor layout?
- [ ] **Triggers**: Are trigger nodes properly highlighted in both views?
- [ ] **Connections**: Do all node connections flow correctly?
- [ ] **Labels**: Are node names and types clearly readable?
- [ ] **Error Handling**: Does the workflow include proper error paths?
- [ ] **Credentials**: Are authentication steps properly configured?

### Notes
<!-- Add your observations here -->

`;
  }
  
  md += `

## Actions

After reviewing, you can:
1. **Edit workflows**: Modify JSON files in \`workflows/\`
2. **Regenerate visuals**: Run \`npm run gen\`
3. **Re-capture**: Run \`npm run capture\`
4. **Commit changes**: Run \`npm run sync\`

---

*Generated by \`npm run capture\` on ${new Date().toISOString()}*
`;

  fs.writeFileSync(reviewPath, md);
  console.log(`📝 Review file created: ${reviewPath}`);
  console.log(`🎉 Capture complete! ${shots.length}/${workflows.length} workflows captured`);
}

main().catch(e => { 
  console.error('💥 Capture failed:', e); 
  process.exit(1); 
});
