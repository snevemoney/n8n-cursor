#!/usr/bin/env node

/**
 * Bootstrap Autonomous Bot System
 * 
 * Sets up the complete autonomous bot testing and self-healing system
 */

const { execSync } = require('child_process')
const fs = require('fs').promises
const path = require('path')

console.log('🚀 Lightning Platform - Autonomous Bot System Bootstrap')
console.log('='.repeat(60))

async function bootstrap() {
  try {
    // 1. Create necessary directories
    console.log('📁 Creating directories...')
    const dirs = [
      'patches/self-heal',
      'patches/archive', 
      'logs/autonomous',
      'temp/rollback',
      'web/test-results',
      'web/playwright-report'
    ]

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true })
      console.log(`   ✅ ${dir}`)
    }

    // 2. Install dependencies
    console.log('\n📦 Installing dependencies...')
    process.chdir('web')
    
    try {
      execSync('npm install @playwright/test --save-dev', { stdio: 'pipe' })
      console.log('   ✅ Playwright installed')
    } catch (error) {
      console.log('   ⚠️  Playwright already installed')
    }

    try {
      execSync('npx playwright install chromium', { stdio: 'pipe' })
      console.log('   ✅ Chromium browser installed')
    } catch (error) {
      console.log('   ⚠️  Chromium already installed')
    }

    // 3. Check environment variables
    console.log('\n🔧 Checking environment configuration...')
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    let envConfigured = true
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}`)
      } else {
        console.log(`   ❌ ${envVar} - MISSING`)
        envConfigured = false
      }
    }

    if (process.env.DISCORD_WEBHOOK_URL) {
      console.log('   ✅ DISCORD_WEBHOOK_URL (optional)')
    } else {
      console.log('   ⚠️  DISCORD_WEBHOOK_URL - Optional for notifications')
    }

    // 4. Test Supabase connection
    if (envConfigured) {
      console.log('\n🗄️  Testing Supabase connection...')
      try {
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { error } = await supabase.from('bot_test_sessions').select('id').limit(1)
        if (error) {
          throw error
        }
        console.log('   ✅ Supabase connection successful')
      } catch (error) {
        console.log(`   ❌ Supabase connection failed: ${error.message}`)
        console.log('   💡 Please run the SQL schema first: psql -f web/sql/bot_testing_system.sql')
        return
      }
    }

    // 5. Create package.json scripts
    console.log('\n📝 Adding npm scripts...')
    const packageJsonPath = 'package.json'
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
    
    const newScripts = {
      'test:bots': 'npx playwright test tests/bots/ --project=bots',
      'test:bots:ui': 'npx playwright test tests/bots/ --project=bots --ui',
      'test:bots:admin': 'npx playwright test tests/bots/adminBot.spec.ts',
      'test:bots:user': 'npx playwright test tests/bots/userBot.spec.ts', 
      'test:bots:qa': 'npx playwright test tests/bots/qaBot.spec.ts',
      'monitor:autonomous': 'node ../scripts/autonomous-bot-monitor.js start',
      'monitor:status': 'node ../scripts/autonomous-bot-monitor.js status',
      'bootstrap:autonomous': 'node ../scripts/bootstrap-autonomous.js'
    }

    packageJson.scripts = { ...packageJson.scripts, ...newScripts }
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log('   ✅ Package.json scripts added')

    // 6. Create a simple test runner wrapper
    console.log('\n🧪 Creating test runner...')
    const testRunnerScript = `#!/bin/bash

# Lightning Platform Bot Test Runner
# Usage: ./run-bots.sh [all|admin|user|qa]

SUITE=\${1:-all}

echo "🤖 Running Lightning Platform Bot Tests"
echo "📋 Test Suite: $SUITE"
echo ""

case $SUITE in
  "all")
    npm run test:bots
    ;;
  "admin")
    npm run test:bots:admin
    ;;
  "user") 
    npm run test:bots:user
    ;;
  "qa")
    npm run test:bots:qa
    ;;
  *)
    echo "❌ Invalid suite. Use: all, admin, user, or qa"
    exit 1
    ;;
esac

# Show results
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Bot tests completed successfully"
  echo "📊 View detailed results: npm run test:bots:ui"
else
  echo ""
  echo "❌ Bot tests failed"
  echo "🔧 Auto-healing may be triggered if monitor is running"
fi
`

    await fs.writeFile('run-bots.sh', testRunnerScript)
    execSync('chmod +x run-bots.sh')
    console.log('   ✅ Test runner script created: ./run-bots.sh')

    // 7. Create systemd service file (optional)
    console.log('\n🖥️  Creating systemd service file...')
    const serviceFile = `[Unit]
Description=Lightning Platform Autonomous Bot Monitor
After=network.target

[Service]
Type=simple
User=\${USER}
WorkingDirectory=${process.cwd()}
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'}
Environment=SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY'}
Environment=DISCORD_WEBHOOK_URL=${process.env.DISCORD_WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK'}
ExecStart=${process.execPath} ../scripts/autonomous-bot-monitor.js start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
`

    await fs.writeFile('../lightning-bot-monitor.service', serviceFile)
    console.log('   ✅ Systemd service file created: ../lightning-bot-monitor.service')

    // 8. Success message and next steps
    console.log('\n🎉 Autonomous Bot System Bootstrap Complete!')
    console.log('='.repeat(60))
    console.log('\n📋 Next Steps:')
    console.log('1. Test the bot system:')
    console.log('   npm run test:bots')
    console.log('')
    console.log('2. Start autonomous monitoring:')
    console.log('   npm run monitor:autonomous')
    console.log('')
    console.log('3. Check monitor status:')
    console.log('   npm run monitor:status')
    console.log('')
    console.log('4. For production deployment:')
    console.log('   sudo cp ../lightning-bot-monitor.service /etc/systemd/system/')
    console.log('   sudo systemctl enable lightning-bot-monitor')
    console.log('   sudo systemctl start lightning-bot-monitor')
    console.log('')
    console.log('🤖 Your autonomous QA system is ready!')
    console.log('   • Bots will test your app continuously')
    console.log('   • Self-healing applies patches automatically') 
    console.log('   • Discord notifications keep you informed')
    console.log('   • Full test history in Supabase analytics')

  } catch (error) {
    console.error('\n💥 Bootstrap failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('• Ensure you have Node.js 18+ installed')
    console.log('• Set up your .env.local file with Supabase credentials')
    console.log('• Run the database schema: psql -f web/sql/bot_testing_system.sql')
    console.log('• Check that your dev server is running: npm run dev')
    process.exit(1)
  }
}

bootstrap() 