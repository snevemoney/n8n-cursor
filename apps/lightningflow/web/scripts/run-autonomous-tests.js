#!/usr/bin/env node

/**
 * Autonomous Test Runner
 * 
 * Advanced test runner that integrates with our self-healing system
 * Provides comprehensive testing workflows with failure detection and healing
 */

const { spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')

class AutonomousTestRunner {
  constructor() {
    this.sessionId = null
    this.failureCount = 0
    this.healingAttempts = 0
    this.testResults = []
  }

  async runTestSuite(suite = 'all', options = {}) {
    console.log('🤖 Lightning Platform - Autonomous Test Runner')
    console.log('=' .repeat(60))
    console.log(`📋 Test Suite: ${suite}`)
    console.log(`🕐 Started: ${new Date().toLocaleString()}`)
    console.log('')

    const startTime = Date.now()

    try {
      // Create test session
      this.sessionId = await this.createTestSession(suite)
      
      // Run the specified test suite
      const testPassed = await this.executeTests(suite, options)
      
      // Analyze results and potentially trigger healing
      await this.analyzeResults()
      
      // Generate summary
      const duration = Date.now() - startTime
      await this.generateSummary(duration, testPassed)
      
      return testPassed

    } catch (error) {
      console.error('💥 Test runner failed:', error.message)
      return false
    }
  }

  async createTestSession(suite) {
    const sessionName = `${suite}-${Date.now()}`
    console.log(`📝 Creating test session: ${sessionName}`)
    
    // We'll integrate with Supabase session creation here
    // For now, return a mock session ID
    return sessionName
  }

  async executeTests(suite, options) {
    const testCommands = {
      all: ['tests/bots/adminBot.spec.ts', 'tests/bots/userBot.spec.ts', 'tests/bots/qaBot.spec.ts'],
      admin: ['tests/bots/adminBot.spec.ts'],
      user: ['tests/bots/userBot.spec.ts'],
      qa: ['tests/bots/qaBot.spec.ts'],
      broken: ['tests/bots/broken-button.spec.ts'],
      smoke: ['tests/bots/adminBot.spec.ts', 'tests/bots/broken-button.spec.ts']
    }

    const testFiles = testCommands[suite] || testCommands.all
    let allPassed = true

    for (const testFile of testFiles) {
      console.log(`\n🧪 Running: ${testFile}`)
      const passed = await this.runSingleTest(testFile, options)
      
      this.testResults.push({
        testFile,
        passed,
        timestamp: new Date().toISOString()
      })

      if (!passed) {
        allPassed = false
        this.failureCount++
        
        // Check if we should attempt healing
        if (this.shouldAttemptHealing()) {
          await this.attemptHealing(testFile)
        }
      }
    }

    return allPassed
  }

  async runSingleTest(testFile, options) {
    return new Promise((resolve) => {
      const args = [
        'playwright', 'test', testFile,
        '--project=bots',
        '--reporter=json'
      ]

      if (options.headed) args.push('--headed')
      if (options.debug) args.push('--debug')

      const testProcess = spawn('npx', args, {
        cwd: process.cwd(),
        stdio: 'pipe'
      })

      let output = ''
      let errorOutput = ''

      testProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      testProcess.on('close', (code) => {
        const passed = code === 0
        
        if (passed) {
          console.log('  ✅ PASSED')
        } else {
          console.log('  ❌ FAILED')
          if (errorOutput) {
            console.log(`  🔍 Error: ${errorOutput.substring(0, 200)}...`)
          }
        }

        resolve(passed)
      })

      testProcess.on('error', (error) => {
        console.log('  💥 Process error:', error.message)
        resolve(false)
      })
    })
  }

  shouldAttemptHealing() {
    // Attempt healing after 2 failures, max 3 healing attempts
    return this.failureCount >= 2 && this.healingAttempts < 3
  }

  async attemptHealing(failedTest) {
    console.log('\n🔧 Attempting autonomous healing...')
    this.healingAttempts++

    try {
      // Call our self-heal API
      const response = await fetch('http://localhost:3001/api/ai/self-heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName: this.extractBotName(failedTest),
          autoApply: true
        })
      })

      if (!response.ok) {
        throw new Error(`Self-heal API failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.patchApplied) {
        console.log('  ✅ Patch applied successfully')
        
        if (result.testPassed) {
          console.log('  🎉 Test now passes after healing!')
          this.failureCount-- // Reduce failure count since we fixed one
        } else {
          console.log('  ⚠️ Patch applied but test still failing')
        }
      } else {
        console.log('  ❌ Could not generate viable patch')
      }

      return result

    } catch (error) {
      console.log(`  💥 Healing failed: ${error.message}`)
      return null
    }
  }

  extractBotName(testFile) {
    if (testFile.includes('admin')) return 'adminBot'
    if (testFile.includes('user')) return 'userBot'
    if (testFile.includes('qa')) return 'qaBot'
    return 'testBot'
  }

  async analyzeResults() {
    console.log('\n📊 Analyzing test results...')
    
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

    console.log(`  📈 Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`  ✅ Passed: ${passedTests}`)
    console.log(`  ❌ Failed: ${failedTests}`)
    console.log(`  🔧 Healing Attempts: ${this.healingAttempts}`)

    // Trigger alerts if success rate is too low
    if (successRate < 80 && totalTests > 0) {
      console.log('  🚨 Low success rate detected - consider manual intervention')
      await this.sendAlert('Low success rate', { successRate, failedTests })
    }
  }

  async sendAlert(title, details) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) return

    const message = {
      embeds: [{
        title: `🚨 ${title}`,
        description: 'Autonomous test runner detected issues',
        color: 15158332, // Red
        fields: Object.entries(details).map(([key, value]) => ({
          name: key.toUpperCase(),
          value: String(value),
          inline: true
        })),
        timestamp: new Date().toISOString(),
        footer: { text: 'Autonomous Test Runner' }
      }]
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
      console.log('  📱 Alert sent to Discord')
    } catch (error) {
      console.log('  ❌ Failed to send alert:', error.message)
    }
  }

  async generateSummary(duration, overallPassed) {
    console.log('\n📋 Test Summary:')
    console.log('=' .repeat(60))
    console.log(`🕐 Duration: ${(duration / 1000).toFixed(1)}s`)
    console.log(`📊 Overall Result: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`🧪 Tests Run: ${this.testResults.length}`)
    console.log(`🔧 Healing Attempts: ${this.healingAttempts}`)
    
    if (this.testResults.length > 0) {
      console.log('\n📝 Individual Results:')
      this.testResults.forEach((result, index) => {
        const status = result.passed ? '✅' : '❌'
        const testName = path.basename(result.testFile, '.spec.ts')
        console.log(`  ${index + 1}. ${status} ${testName}`)
      })
    }

    // Save results to file
    const resultsFile = `test-results/autonomous-${this.sessionId}.json`
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(resultsFile, JSON.stringify({
      sessionId: this.sessionId,
      duration,
      overallPassed,
      testResults: this.testResults,
      healingAttempts: this.healingAttempts,
      timestamp: new Date().toISOString()
    }, null, 2))

    console.log(`\n💾 Results saved to: ${resultsFile}`)
    
    if (overallPassed) {
      console.log('\n🎉 All tests passed! Your Lightning Platform is healthy.')
    } else {
      console.log('\n⚠️ Some tests failed. Check logs and consider manual review.')
      
      if (this.healingAttempts > 0) {
        console.log('🔧 Autonomous healing was attempted - check patch effectiveness.')
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const suite = args[0] || 'all'
  
  const options = {
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    heal: !args.includes('--no-heal')
  }

  const runner = new AutonomousTestRunner()
  const success = await runner.runTestSuite(suite, options)
  
  process.exit(success ? 0 : 1)
}

// Show usage if no valid command
if (process.argv.length === 2) {
  console.log('🤖 Autonomous Test Runner')
  console.log('')
  console.log('Usage: node run-autonomous-tests.js [suite] [options]')
  console.log('')
  console.log('Suites:')
  console.log('  all     - Run all bot tests (default)')
  console.log('  admin   - Run admin bot tests only')
  console.log('  user    - Run user bot tests only')
  console.log('  qa      - Run QA bot tests only')
  console.log('  broken  - Run intentionally broken tests')
  console.log('  smoke   - Run smoke tests')
  console.log('')
  console.log('Options:')
  console.log('  --headed    - Run tests in headed mode')
  console.log('  --debug     - Run tests in debug mode')
  console.log('  --no-heal   - Disable autonomous healing')
  console.log('')
  console.log('Examples:')
  console.log('  node run-autonomous-tests.js all')
  console.log('  node run-autonomous-tests.js broken --headed')
  console.log('  node run-autonomous-tests.js smoke --no-heal')
} else {
  main().catch(console.error)
}

module.exports = { AutonomousTestRunner } 