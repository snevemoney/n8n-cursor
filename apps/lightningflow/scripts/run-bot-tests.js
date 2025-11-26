#!/usr/bin/env node

/**
 * Bot Test Runner Script
 * 
 * Runs automated bot tests locally or in CI/CD environments
 * Provides detailed reporting and analytics integration
 */

const { execSync, spawn } = require('child_process')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  testTimeout: 120000, // 2 minutes
  retries: 2,
  headless: process.env.CI === 'true',
  video: true,
  screenshot: true
}

// Test suites configuration
const TEST_SUITES = {
  all: ['adminBot', 'userBot', 'qaBot'],
  admin: ['adminBot'],
  user: ['userBot'],
  qa: ['qaBot'],
  smoke: ['adminBot', 'userBot'],
  critical: ['adminBot', 'userBot']
}

class BotTestRunner {
  constructor() {
    this.supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey)
    this.sessionId = null
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      startTime: Date.now(),
      endTime: null
    }
  }

  async createTestSession(suiteName, triggerType = 'manual') {
    console.log('🚀 Creating test session...')
    
    const { data, error } = await this.supabase
      .from('bot_test_sessions')
      .insert({
        session_name: `local-${suiteName}-${Date.now()}`,
        trigger_type: triggerType,
        git_commit_hash: this.getGitCommit(),
        git_branch: this.getGitBranch(),
        triggered_by: process.env.USER || 'local',
        overall_status: 'running',
        environment_config: {
          runner: 'local-script',
          node_version: process.version,
          platform: process.platform
        }
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create test session: ${error.message}`)
    }

    this.sessionId = data.id
    console.log(`✅ Test session created: ${this.sessionId}`)
    return this.sessionId
  }

  async runTestSuite(suiteName) {
    console.log(`\n🤖 Running ${suiteName} test suite...`)
    
    const bots = TEST_SUITES[suiteName] || [suiteName]
    const results = []

    for (const bot of bots) {
      console.log(`\n▶️  Running ${bot} tests...`)
      
      try {
        const result = await this.runBotTest(bot)
        results.push(result)
        
        if (result.success) {
          console.log(`✅ ${bot} tests passed`)
        } else {
          console.log(`❌ ${bot} tests failed`)
        }
      } catch (error) {
        console.error(`💥 ${bot} tests crashed:`, error.message)
        results.push({
          bot,
          success: false,
          error: error.message,
          duration: 0,
          tests: []
        })
      }
    }

    return results
  }

  async runBotTest(botName) {
    const testFile = `tests/bots/${botName}.spec.ts`
    const outputDir = `test-results/${botName}-${Date.now()}`
    
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true })

    const playwrightArgs = [
      'test',
      testFile,
      '--project=bots',
      `--output=${outputDir}`,
      '--reporter=json',
      CONFIG.headless ? '--headed=false' : '--headed=true'
    ]

    return new Promise((resolve) => {
      const startTime = Date.now()
      const process = spawn('npx', ['playwright', ...playwrightArgs], {
        cwd: path.join(__dirname, '../web'),
        stdio: 'inherit',
        env: {
          ...process.env,
          TEST_SESSION_ID: this.sessionId,
          BASE_URL: CONFIG.baseUrl
        }
      })

      process.on('close', (code) => {
        const duration = Date.now() - startTime
        const success = code === 0

        // Update session statistics
        if (success) {
          this.results.passed++
        } else {
          this.results.failed++
        }
        this.results.total++

        resolve({
          bot: botName,
          success,
          exitCode: code,
          duration,
          outputDir
        })
      })

      process.on('error', (error) => {
        resolve({
          bot: botName,
          success: false,
          error: error.message,
          duration: Date.now() - startTime
        })
      })
    })
  }

  async finalizeSession() {
    if (!this.sessionId) return

    this.results.endTime = Date.now()
    const duration = this.results.endTime - this.results.startTime
    const successRate = this.results.total > 0 ? (this.results.passed / this.results.total) * 100 : 0
    
    const overallStatus = this.results.failed === 0 ? 'passed' : 
                         successRate >= 80 ? 'partial' : 'failed'

    console.log('\n📊 Finalizing test session...')
    
    await this.supabase
      .from('bot_test_sessions')
      .update({
        total_tests: this.results.total,
        passed_tests: this.results.passed,
        failed_tests: this.results.failed,
        warning_tests: this.results.warnings,
        overall_status: overallStatus,
        completed_at: new Date().toISOString(),
        session_duration_ms: duration
      })
      .eq('id', this.sessionId)

    console.log('✅ Test session finalized')
    return {
      sessionId: this.sessionId,
      ...this.results,
      successRate,
      overallStatus,
      duration
    }
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD').toString().trim()
    } catch {
      return 'unknown'
    }
  }

  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    } catch {
      return 'unknown'
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...')
    
    // Check if development server is running
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/health`)
      if (!response.ok) {
        throw new Error('Health check failed')
      }
      console.log('✅ Development server is running')
    } catch (error) {
      console.error('❌ Development server not accessible')
      console.log('💡 Please start the dev server: npm run dev')
      process.exit(1)
    }

    // Check Supabase connection
    try {
      const { error } = await this.supabase.from('bot_test_sessions').select('id').limit(1)
      if (error) throw error
      console.log('✅ Supabase connection working')
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message)
      console.log('💡 Please check your environment variables')
      process.exit(1)
    }

    // Check if Playwright is installed
    try {
      execSync('npx playwright --version', { stdio: 'pipe' })
      console.log('✅ Playwright is installed')
    } catch (error) {
      console.error('❌ Playwright not found')
      console.log('💡 Please install Playwright: npx playwright install')
      process.exit(1)
    }
  }

  printResults(results) {
    console.log('\n' + '='.repeat(60))
    console.log('🏁 BOT TEST RESULTS')
    console.log('='.repeat(60))
    
    const duration = (this.results.endTime - this.results.startTime) / 1000
    const successRate = this.results.total > 0 ? (this.results.passed / this.results.total) * 100 : 0
    
    console.log(`📋 Session ID: ${this.sessionId}`)
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`)
    console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`⚠️  Warnings: ${this.results.warnings}`)
    
    console.log('\n📝 Individual Test Results:')
    results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      const duration = (result.duration / 1000).toFixed(1)
      console.log(`  ${status} ${result.bot}: ${duration}s`)
      
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`)
      }
    })

    console.log('\n🔗 View detailed results:')
    console.log(`   Supabase: SELECT * FROM bot_test_logs WHERE test_session_id = '${this.sessionId}';`)
    console.log(`   Local files: ./test-results/`)
    
    if (this.results.failed > 0) {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.')
      process.exit(1)
    } else {
      console.log('\n🎉 All tests passed!')
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const suiteName = args[0] || 'smoke'
  
  if (!TEST_SUITES[suiteName] && !['adminBot', 'userBot', 'qaBot'].includes(suiteName)) {
    console.error('❌ Invalid test suite. Available options:')
    console.log('  all      - Run all bot tests')
    console.log('  admin    - Run admin bot tests only')
    console.log('  user     - Run user bot tests only')
    console.log('  qa       - Run QA bot tests only')
    console.log('  smoke    - Run critical smoke tests')
    console.log('  adminBot - Run specific admin bot')
    console.log('  userBot  - Run specific user bot')
    console.log('  qaBot    - Run specific QA bot')
    process.exit(1)
  }

  console.log('🤖 Lightning Platform Bot Test Runner')
  console.log(`📋 Running test suite: ${suiteName}`)
  
  const runner = new BotTestRunner()
  
  try {
    await runner.checkPrerequisites()
    await runner.createTestSession(suiteName)
    
    const results = await runner.runTestSuite(suiteName)
    const summary = await runner.finalizeSession()
    
    runner.printResults(results)
    
  } catch (error) {
    console.error('💥 Bot test runner failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { BotTestRunner, TEST_SUITES } 