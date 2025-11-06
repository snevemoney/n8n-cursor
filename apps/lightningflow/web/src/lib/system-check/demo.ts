/**
 * System Health Monitoring Demo
 * Demonstrates the complete system health monitoring, self-healing, and watchdog functionality
 */

import { systemCheckRunner } from './runner'
import { systemFixManager } from './fix'
import { systemWatchdog } from './watchdog'
import { bootTimeChecker } from './boot-check'

/**
 * Demo: Basic System Health Check
 */
export async function demoBasicHealthCheckMain() {
  console.log('\n🔍 === DEMO: Basic System Health Check ===')
  
  try {
    const healthSummary = await systemCheckRunner.runAllChecks()
    
    console.log(`Overall Status: ${healthSummary.overall_status.toUpperCase()}`)
    console.log(`Checks: ${healthSummary.checks_passed}✅ ${healthSummary.checks_warning}⚠️ ${healthSummary.checks_failed}❌`)
    
    // Show details for non-healthy checks
    const issues = healthSummary.results.filter(r => r.status !== 'healthy')
    if (issues.length > 0) {
      console.log('\nIssues detected:')
      issues.forEach(issue => {
        const emoji = issue.status === 'critical' ? '❌' : '⚠️'
        console.log(`  ${emoji} ${issue.name}: ${issue.message}`)
      })
    }
    
    return healthSummary
  } catch (error) {
    console.error('Health check failed:', error)
    return null
  }
}

/**
 * Demo: Auto-Fix System Issues
 */
export async function demoAutoFix() {
  console.log('\n🔧 === DEMO: Auto-Fix System Issues ===')
  
  try {
    // First, run health check to find issues
    const healthSummary = await systemCheckRunner.runAllChecks()
    const criticalIssues = healthSummary.results.filter(r => r.status === 'critical' && r.auto_fixable)
    
    if (criticalIssues.length === 0) {
      console.log('No auto-fixable critical issues found')
      return []
    }
    
    console.log(`Found ${criticalIssues.length} auto-fixable critical issues`)
    
    const fixResults = []
    
    // Attempt to fix each critical issue
    for (const issue of criticalIssues) {
      console.log(`\nAttempting to fix: ${issue.name}`)
      
      const fixResult = await systemFixManager.attemptFix(issue, true)
      fixResults.push(fixResult)
      
      if (fixResult.fix_successful) {
        console.log(`✅ Fix successful: ${fixResult.fix_message}`)
      } else {
        console.log(`❌ Fix failed: ${fixResult.fix_message}`)
      }
    }
    
    // Run health check again to see improvements
    console.log('\nRunning post-fix health check...')
    const postFixHealth = await systemCheckRunner.runAllChecks()
    console.log(`Post-fix status: ${postFixHealth.overall_status.toUpperCase()}`)
    
    return fixResults
  } catch (error) {
    console.error('Auto-fix demo failed:', error)
    return []
  }
}

/**
 * Demo: Watchdog Monitoring
 */
export async function demoWatchdog() {
  console.log('\n🐕 === DEMO: Watchdog Monitoring ===')
  
  try {
    // Configure watchdog for demo (faster intervals)
    systemWatchdog.updateConfig({
      check_interval_ms: 10000, // 10 seconds for demo
      alert_thresholds: {
        critical_issues: 1,
        warning_issues: 2,
        consecutive_failures: 2
      },
      auto_fix_enabled: true
    })
    
    // Start watchdog
    systemWatchdog.start()
    
    console.log('Watchdog started with demo configuration')
    console.log('- Check interval: 10 seconds')
    console.log('- Auto-fix enabled')
    console.log('- Alert on 1+ critical issues')
    
    // Let it run for a bit
    await new Promise(resolve => setTimeout(resolve, 15000))
    
    // Show watchdog status
    const status = systemWatchdog.getStatus()
    console.log('\nWatchdog Status:')
    console.log(`- Running: ${status.running}`)
    console.log(`- Total alerts: ${status.total_alerts}`)
    console.log(`- Unacknowledged: ${status.unacknowledged_alerts}`)
    
    // Show recent alerts
    const alerts = systemWatchdog.getAlerts(5)
    if (alerts.length > 0) {
      console.log('\nRecent alerts:')
      alerts.forEach(alert => {
        const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : '🟡'
        console.log(`  ${emoji} [${alert.severity}] ${alert.title}`)
      })
    }
    
    // Stop watchdog
    systemWatchdog.stop()
    
    return status
  } catch (error) {
    console.error('Watchdog demo failed:', error)
    systemWatchdog.stop()
    return null
  }
}

/**
 * Demo: Boot-Time Check
 */
export async function demoBootCheck() {
  console.log('\n🚀 === DEMO: Boot-Time Check ===')
  
  try {
    // Configure boot checker for demo
    bootTimeChecker.updateConfig({
      auto_fix_critical: true,
      start_watchdog: false, // Don't start watchdog in demo
      timeout_ms: 15000, // 15 seconds
      retry_attempts: 2
    })
    
    // Run boot check
    const bootResult = await bootTimeChecker.runBootCheck()
    
    console.log('\nBoot Check Results:')
    console.log(`- Success: ${bootResult.success}`)
    console.log(`- Startup Ready: ${bootResult.startup_ready}`)
    console.log(`- Duration: ${(bootResult.duration_ms / 1000).toFixed(1)}s`)
    console.log(`- Message: ${bootResult.message}`)
    
    if (bootResult.auto_fixes_attempted > 0) {
      console.log(`- Auto-fixes: ${bootResult.auto_fixes_successful}/${bootResult.auto_fixes_attempted} successful`)
    }
    
    if (bootResult.critical_issues.length > 0) {
      console.log('\nCritical Issues:')
      bootResult.critical_issues.forEach(issue => {
        console.log(`  ❌ ${issue}`)
      })
    }
    
    if (bootResult.warnings.length > 0) {
      console.log('\nWarnings:')
      bootResult.warnings.forEach(warning => {
        console.log(`  ⚠️ ${warning}`)
      })
    }
    
    return bootResult
  } catch (error) {
    console.error('Boot check demo failed:', error)
    return null
  }
}

/**
 * Demo: Complete System Health Workflow
 */
export async function demoCompleteWorkflow() {
  console.log('\n🎯 === DEMO: Complete System Health Workflow ===')
  
  try {
    // 1. Boot-time check
    console.log('\n1. Running boot-time check...')
    const bootResult = await demoBootCheck()
    
    if (!bootResult?.startup_ready) {
      console.log('❌ System not ready - stopping demo')
      return
    }
    
    // 2. Basic health check
    console.log('\n2. Running basic health check...')
    const healthSummary = await demoBasicHealthCheckMain()
    
    if (!healthSummary) {
      console.log('❌ Health check failed - stopping demo')
      return
    }
    
    // 3. Auto-fix any issues
    if (healthSummary.checks_failed > 0) {
      console.log('\n3. Attempting auto-fixes...')
      await demoAutoFix()
    } else {
      console.log('\n3. No critical issues to fix')
    }
    
    // 4. Start monitoring
    console.log('\n4. Starting continuous monitoring...')
    await demoWatchdog()
    
    console.log('\n✅ Complete workflow demo finished successfully!')
    
  } catch (error) {
    console.error('Complete workflow demo failed:', error)
  }
}

/**
 * Demo: Fix Strategy Management
 */
export async function demoFixStrategies() {
  console.log('\n🛠️ === DEMO: Fix Strategy Management ===')
  
  try {
    // Show available fix strategies
    const strategies = systemFixManager.getFixStrategies()
    
    console.log(`Available fix strategies: ${strategies.length}`)
    strategies.forEach(strategy => {
      console.log(`  - ${strategy.name} (${strategy.risk_level} risk)`)
      console.log(`    Description: ${strategy.description}`)
      console.log(`    Auto-fix: ${strategy.auto_fix_enabled}`)
      console.log(`    Applies to: ${strategy.applicable_issues.join(', ')}`)
      console.log('')
    })
    
    // Show fix history
    const fixHistory = systemFixManager.getFixHistory(5)
    if (fixHistory.length > 0) {
      console.log('Recent fix attempts:')
      fixHistory.forEach(fix => {
        const status = fix.fix_successful ? '✅' : '❌'
        console.log(`  ${status} ${fix.fix_message} (${fix.timestamp.toLocaleTimeString()})`)
      })
    } else {
      console.log('No recent fix attempts')
    }
    
    return strategies
  } catch (error) {
    console.error('Fix strategies demo failed:', error)
    return []
  }
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('🎬 === LIGHTNING AI BUSINESS NODE - SYSTEM HEALTH DEMOS ===')
  
  try {
    await demoBasicHealthCheckMain()
    await demoFixStrategies()
    await demoAutoFix()
    await demoBootCheck()
    await demoWatchdog()
    await demoCompleteWorkflow()
    
    console.log('\n🎉 All demos completed successfully!')
  } catch (error) {
    console.error('Demo suite failed:', error)
  }
} 