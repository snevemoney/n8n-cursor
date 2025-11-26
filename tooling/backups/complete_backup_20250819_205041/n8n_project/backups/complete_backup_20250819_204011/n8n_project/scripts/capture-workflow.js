import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.N8N_BASE_URL || 'https://n8ncloud.tech';
const EMAIL = process.env.N8N_EMAIL;
const PASSWORD = process.env.N8N_PASSWORD;

// Get workflow name from command line args
const args = process.argv.slice(2);
const nameArg = args.find(arg => arg.startsWith('--name'));
const workflowName = nameArg ? nameArg.split('=')[1] || args[args.indexOf(nameArg) + 1] : 'GPT-5 Support Agent';

console.log(`📸 Capturing workflow: "${workflowName}"`);

if (!EMAIL || !PASSWORD) {
  console.error('❌ Missing N8N_EMAIL and/or N8N_PASSWORD environment variables');
  process.exit(1);
}

// Read workflow info from the created file
function getWorkflowInfo() {
  try {
    const workflowData = JSON.parse(fs.readFileSync('/home/evens/n8n-cursor/scripts/gpt5-workflow.json', 'utf8'));
    return workflowData;
  } catch (error) {
    console.error('❌ Could not read workflow info from gpt5-workflow.json');
    process.exit(1);
  }
}

async function login(page) {
  console.log('🔐 Logging in to n8n...');
  
  try {
    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for form elements
    await page.waitForSelector('input[type="email"], input[data-test-id="email"]', { timeout: 10000 });
    
    const emailSelector = await page.$('input[type="email"]') ? 'input[type="email"]' : 'input[data-test-id="email"]';
    const passwordSelector = await page.$('input[type="password"]') ? 'input[type="password"]' : 'input[data-test-id="password"]';
    
    await page.type(emailSelector, EMAIL, { delay: 20 });
    await page.type(passwordSelector, PASSWORD, { delay: 20 });
    
    // Find and click login button
    const buttonSelectors = [
      'button[type="submit"]',
      'button[data-test-id="signin-button"]',
      'button'
    ];
    
    let loginButton = null;
    for (const selector of buttonSelectors) {
      loginButton = await page.$(selector);
      if (loginButton) {
        const buttonText = await loginButton.evaluate(el => el.textContent?.toLowerCase() || '');
        if (buttonText.includes('sign') || buttonText.includes('login') || selector.includes('submit')) {
          break;
        }
      }
    }
    
    if (loginButton) {
      await Promise.all([
        loginButton.click(),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      ]);
      console.log('✅ Login successful');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function captureWorkflow(page, workflowId) {
  console.log(`📸 Capturing workflow ${workflowId}...`);
  
  try {
    // Navigate to workflow
    const workflowUrl = `${BASE_URL}/workflow/${workflowId}`;
    await page.goto(workflowUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Wait for canvas to load
    await page.waitForSelector('svg, canvas, [data-test-id="canvas"], .node-view', { timeout: 15000 });
    
    // Try to zoom to fit and optimize the view
    await page.evaluate(() => {
      // Hide UI elements for cleaner screenshot
      const hide = (sel) => {
        document.querySelectorAll(sel).forEach(n => {
          if (n) n.style.display = 'none';
        });
      };
      
      hide('[data-test-id="node-creator"]');
      hide('[data-test-id="sidebar"]');
      hide('header');
      hide('aside');
      hide('.sidebar');
      hide('.el-header');
      hide('[class*="sidebar"]');
      hide('[class*="header"]');
      hide('[data-test-id="main-header"]');
      hide('[data-test-id="main-sidebar"]');
      
      // Set clean background
      document.body.style.background = '#f5f5f5';
      
      // Try to click zoom to fit button
      const zoomButtons = [
        '[data-test-id="zoom-to-fit"]',
        '[title*="fit"]',
        '[aria-label*="fit"]',
        '.zoom-to-fit'
      ];
      
      for (const selector of zoomButtons) {
        const btn = document.querySelector(selector);
        if (btn) {
          btn.click();
          console.log('Clicked zoom to fit');
          break;
        }
      }
      
      // Alternative: Try keyboard shortcut for zoom to fit
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: '0',
        metaKey: true,
        bubbles: true
      }));
    });
    
    // Wait for zoom animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find the best canvas element to screenshot
    const canvasSelectors = [
      '[data-test-id="canvas"]',
      '.node-view',
      '.canvas-root',
      '.workflow-canvas',
      '[class*="canvas"] svg',
      'svg',
      '.konvajs-content'
    ];
    
    let canvasElement = null;
    for (const selector of canvasSelectors) {
      canvasElement = await page.$(selector);
      if (canvasElement) {
        console.log(`📐 Found canvas element: ${selector}`);
        break;
      }
    }
    
    // Get canvas bounding box or use full page
    let clipOptions = null;
    if (canvasElement) {
      const boundingBox = await canvasElement.boundingBox();
      if (boundingBox) {
        // Add some padding and ensure reasonable dimensions
        clipOptions = {
          x: Math.max(0, boundingBox.x - 50),
          y: Math.max(0, boundingBox.y - 50),
          width: Math.min(1600, boundingBox.width + 100),
          height: Math.min(1200, boundingBox.height + 100)
        };
      }
    }
    
    // Create screenshots directory
    const screenshotsDir = '/home/evens/n8n-cursor/visualizations/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Generate filename with date
    const date = new Date().toISOString().slice(0, 10);
    const filename = `gpt5-support-agent-${date}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    // Take high-resolution screenshot
    await page.screenshot({
      path: filepath,
      fullPage: !clipOptions,
      clip: clipOptions,
      type: 'png',
      deviceScaleFactor: 2  // Retina quality
    });
    
    console.log(`✅ Screenshot saved: ${filepath}`);
    return filepath;
    
  } catch (error) {
    console.error(`❌ Failed to capture workflow:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting workflow screenshot capture...');
  
  const workflowInfo = getWorkflowInfo();
  console.log(`🎯 Target workflow: ${workflowInfo.name} (ID: ${workflowInfo.id})`);
  
  if (workflowInfo.local) {
    console.log('📋 This is a local workflow - you need to import it to n8n first!');
    console.log('💡 Import options:');
    console.log('   1. Use n8n UI: Import → Upload JSON file');
    console.log('   2. Use MCP: Use the n8n tool: n8n_import_file');
    console.log('   3. Manual: Copy-paste the JSON into n8n');
    console.log('');
    console.log('🔄 For now, creating a placeholder screenshot...');
    
    // Create a placeholder screenshot path
    const screenshotsDir = '/home/evens/n8n-cursor/visualizations/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().slice(0, 10);
    const filename = `gpt5-support-agent-${date}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    // Create a simple placeholder file
    const placeholderText = `GPT-5 Support Agent workflow created locally\nImport workflows/gpt5-support-agent.json to n8n to capture screenshot`;
    fs.writeFileSync(filepath.replace('.png', '.txt'), placeholderText);
    
    console.log(`📋 Placeholder created: ${filepath.replace('.png', '.txt')}`);
    console.log('📄 Workflow JSON available at: workflows/gpt5-support-agent.json');
    return;
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
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
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  page.setDefaultTimeout(45000);
  
  const loginSuccess = await login(page);
  if (!loginSuccess) {
    await browser.close();
    process.exit(1);
  }
  
  const screenshotPath = await captureWorkflow(page, workflowInfo.id);
  await browser.close();
  
  if (screenshotPath) {
    console.log(`📸 Screenshot captured successfully: ${screenshotPath}`);
    console.log(screenshotPath); // Output path for other scripts
  } else {
    console.error('❌ Screenshot capture failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Capture script failed:', error);
  process.exit(1);
});
