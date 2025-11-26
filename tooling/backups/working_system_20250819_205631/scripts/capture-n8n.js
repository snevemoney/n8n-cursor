#!/usr/bin/env node

/**
 * Capture n8n workflow screenshots using Puppeteer
 * Connects to your n8n instance and takes screenshots of workflow canvases
 */

import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration from environment variables
const config = {
  baseUrl: process.env.N8N_BASE_URL || 'https://n8ncloud.tech',
  email: process.env.N8N_EMAIL,
  password: process.env.N8N_PASSWORD,
  headless: process.env.NODE_ENV !== 'development',
  screenshotsDir: join(projectRoot, 'visualizations', 'screenshots'),
  workflowsDir: join(projectRoot, 'workflows')
};

/**
 * Wait for an element and click it safely
 */
async function waitAndClick(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (error) {
    console.warn(`⚠️  Could not click ${selector}:`, error.message);
    return false;
  }
}

/**
 * Wait for element and type text
 */
async function waitAndType(page, selector, text, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.type(selector, text);
    return true;
  } catch (error) {
    console.warn(`⚠️  Could not type in ${selector}:`, error.message);
    return false;
  }
}

/**
 * Login to n8n
 */
async function loginToN8n(page) {
  console.log('🔐 Logging into n8n...');
  
  try {
    // Navigate to login page
    await page.goto(`${config.baseUrl}/signin`, { waitUntil: 'networkidle2' });
    
    // Wait for and fill email
    await waitAndType(page, 'input[name="email"], input[type="email"]', config.email);
    
    // Wait for and fill password
    await waitAndType(page, 'input[name="password"], input[type="password"]', config.password);
    
    // Submit login form
    await waitAndClick(page, 'button[type="submit"], .btn-primary, .el-button--primary');
    
    // Wait for navigation to dashboard/workflows
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log('✅ Successfully logged in');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

/**
 * Get list of available workflows from n8n
 */
async function getWorkflowList(page) {
  try {
    // Navigate to workflows page
    await page.goto(`${config.baseUrl}/workflows`, { waitUntil: 'networkidle2' });
    
    // Wait for workflow list to load
    await page.waitForSelector('.workflows-list, .workflow-item, [data-test-id="workflow-card"]', { timeout: 10000 });
    
    // Extract workflow information
    const workflows = await page.evaluate(() => {
      const workflowElements = document.querySelectorAll('.workflow-item, [data-test-id="workflow-card"], .workflow-card');
      const workflows = [];
      
      workflowElements.forEach(element => {
        const nameElement = element.querySelector('.workflow-name, .name, h3, .title');
        const linkElement = element.querySelector('a');
        
        if (nameElement && linkElement) {
          workflows.push({
            name: nameElement.textContent.trim(),
            url: linkElement.href
          });
        }
      });
      
      return workflows;
    });
    
    console.log(`📋 Found ${workflows.length} workflows`);
    return workflows;
  } catch (error) {
    console.warn('⚠️  Could not get workflow list from n8n, using local files');
    return [];
  }
}

/**
 * Get workflows from local JSON files
 */
function getLocalWorkflows() {
  const workflows = [];
  
  if (existsSync(config.workflowsDir)) {
    const files = readdirSync(config.workflowsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const name = file.replace('.json', '');
      workflows.push({
        name,
        file: join(config.workflowsDir, file),
        isLocal: true
      });
    }
  }
  
  return workflows;
}

/**
 * Capture screenshot of a workflow
 */
async function captureWorkflowScreenshot(page, workflow) {
  try {
    console.log(`📸 Capturing screenshot for: ${workflow.name}`);
    
    if (workflow.url) {
      // Navigate to the workflow in n8n
      await page.goto(workflow.url, { waitUntil: 'networkidle2', timeout: 30000 });
    } else {
      // Just use the current page if no URL
      console.log('📄 Using current page for screenshot');
    }
    
    // Wait for canvas to load
    await page.waitForSelector('.node-view, .workflow-canvas, canvas, .nodeview', { timeout: 15000 });
    
    // Give extra time for nodes to render
    await page.waitForTimeout(3000);
    
    // Try to fit the workflow in view
    const fitToViewButton = await page.$('.fit-to-view, [data-test-id="fit-to-view"], .zoom-to-fit');
    if (fitToViewButton) {
      await fitToViewButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Get the canvas element or main content area
    const canvasSelector = '.node-view, .workflow-canvas, .nodeview, .canvas-container, main';
    const canvas = await page.$(canvasSelector);
    
    if (!canvas) {
      console.warn('⚠️  Could not find canvas element');
      return false;
    }
    
    // Take screenshot
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${workflow.name.replace(/[^a-zA-Z0-9-_]/g, '-')}-${timestamp}.png`;
    const outputPath = join(config.screenshotsDir, filename);
    
    // Ensure screenshots directory exists
    if (!existsSync(config.screenshotsDir)) {
      mkdirSync(config.screenshotsDir, { recursive: true });
    }
    
    await canvas.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false
    });
    
    console.log(`✅ Screenshot saved: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to capture screenshot for ${workflow.name}:`, error.message);
    return false;
  }
}

/**
 * Main capture function
 */
async function captureN8nScreenshots() {
  console.log('🚀 Starting n8n screenshot capture...');
  
  // Validate configuration
  if (!config.email || !config.password) {
    console.error('❌ Missing N8N_EMAIL or N8N_PASSWORD environment variables');
    console.log('💡 Set these in your Cursor Background Agent secrets');
    process.exit(1);
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1920,1080'
    ]
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Login to n8n
    const loginSuccess = await loginToN8n(page);
    if (!loginSuccess) {
      throw new Error('Could not login to n8n');
    }
    
    // Get workflows (try n8n first, fallback to local)
    let workflows = await getWorkflowList(page);
    if (workflows.length === 0) {
      workflows = getLocalWorkflows();
      console.log(`📁 Using ${workflows.length} local workflow files`);
    }
    
    // Capture screenshots
    let captureCount = 0;
    for (const workflow of workflows) {
      const success = await captureWorkflowScreenshot(page, workflow);
      if (success) captureCount++;
      
      // Small delay between captures
      await page.waitForTimeout(2000);
    }
    
    console.log(`🎉 Capture complete! Generated ${captureCount} screenshots.`);
    
  } catch (error) {
    console.error('❌ Capture failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Main execution
 */
async function main() {
  await captureN8nScreenshots();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { captureN8nScreenshots, captureWorkflowScreenshot, loginToN8n };
