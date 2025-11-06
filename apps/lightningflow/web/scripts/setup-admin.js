#!/usr/bin/env node

/**
 * 🔐 Admin Setup Script
 * 
 * This script helps you set up the hardcoded admin system for maximum security.
 * Run this after you've created your Supabase account and have your UUID.
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function banner() {
  log(COLORS.cyan + COLORS.bold, `
┌─────────────────────────────────────────────────────────────┐
│                   🔐 ADMIN SETUP WIZARD                    │
│                Lightning Platform Security                  │
└─────────────────────────────────────────────────────────────┘
  `);
}

function instructions() {
  log(COLORS.white, '\n📋 INSTRUCTIONS:\n');
  
  log(COLORS.yellow, '1. Get Your Admin UUID:');
  log(COLORS.white, '   → Go to Supabase Dashboard');
  log(COLORS.white, '   → Authentication > Users');
  log(COLORS.white, '   → Copy your UUID (e.g., 6fa49a38-1234-5678-9abc-def123456789)');
  
  log(COLORS.yellow, '\n2. Run This Script:');
  log(COLORS.white, '   → node scripts/setup-admin.js YOUR_UUID_HERE');
  
  log(COLORS.yellow, '\n3. Security Features:');
  log(COLORS.green, '   ✅ Only your UUID can access /admin');
  log(COLORS.green, '   ✅ No database role management needed');
  log(COLORS.green, '   ✅ Hardcoded for maximum security');
  log(COLORS.green, '   ✅ Development bypass option available');
}

function setupAdmin(adminUID) {
  const envPath = path.join(__dirname, '../.env.local');
  
  // Check if .env.local exists
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    log(COLORS.blue, '📄 Found existing .env.local');
  } else {
    log(COLORS.yellow, '📄 Creating new .env.local');
  }
  
  // Update or add ADMIN_UID
  const adminUIDLine = `NEXT_PUBLIC_ADMIN_UID=${adminUID}`;
  
  if (envContent.includes('NEXT_PUBLIC_ADMIN_UID=')) {
    // Replace existing
    envContent = envContent.replace(/NEXT_PUBLIC_ADMIN_UID=.*/g, adminUIDLine);
    log(COLORS.green, '🔄 Updated existing ADMIN_UID');
  } else {
    // Add new
    envContent += `\n# Admin Configuration\n${adminUIDLine}\nADMIN_BYPASS=false\n`;
    log(COLORS.green, '➕ Added new ADMIN_UID');
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  
  log(COLORS.green + COLORS.bold, '\n✅ ADMIN SETUP COMPLETE!');
  log(COLORS.white, `🔐 Admin UID: ${adminUID}`);
  log(COLORS.white, `📁 Saved to: ${envPath}`);
  
  log(COLORS.cyan, '\n🚀 NEXT STEPS:');
  log(COLORS.white, '1. Restart your Next.js server (npm run dev)');
  log(COLORS.white, '2. Login to Supabase with your account');
  log(COLORS.white, '3. Visit /admin - only you will have access!');
  
  log(COLORS.yellow, '\n⚠️  SECURITY NOTES:');
  log(COLORS.white, '• Keep your .env.local file secure');
  log(COLORS.white, '• Never commit your admin UID to public repos');
  log(COLORS.white, '• Set ADMIN_BYPASS=true only for development');
}

function enableDevMode() {
  const envPath = path.join(__dirname, '../.env.local');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  if (envContent.includes('ADMIN_BYPASS=')) {
    envContent = envContent.replace(/ADMIN_BYPASS=.*/g, 'ADMIN_BYPASS=true');
  } else {
    envContent += '\nADMIN_BYPASS=true\n';
  }
  
  fs.writeFileSync(envPath, envContent);
  
  log(COLORS.yellow + COLORS.bold, '\n⚠️  DEV MODE ENABLED!');
  log(COLORS.white, '🚀 You can now access /admin without login');
  log(COLORS.red, '🔥 DISABLE IN PRODUCTION: Set ADMIN_BYPASS=false');
}

function main() {
  banner();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'dev') {
    enableDevMode();
    return;
  }
  
  if (!command || command.length < 30) {
    instructions();
    log(COLORS.red, '\n❌ Missing or invalid UUID');
    log(COLORS.white, 'Usage: node scripts/setup-admin.js YOUR_UUID_HERE');
    log(COLORS.white, 'Dev mode: node scripts/setup-admin.js dev');
    process.exit(1);
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(command)) {
    log(COLORS.red, '\n❌ Invalid UUID format');
    log(COLORS.white, 'Expected format: 6fa49a38-1234-5678-9abc-def123456789');
    process.exit(1);
  }
  
  setupAdmin(command);
}

if (require.main === module) {
  main();
}

module.exports = { setupAdmin, enableDevMode }; 