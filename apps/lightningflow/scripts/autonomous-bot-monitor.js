#!/usr/bin/env node

/**
 * Autonomous Bot Monitor
 * 
 * Continuously monitors bot test failures and triggers self-healing
 * Runs as a background service to provide autonomous QA capabilities
 */

const { createClient } = require('@supabase/supabase-js')
const { spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')

// Configuration
const CONFIG = {
  checkInterval: 30000, // Check every 30 seconds
  failureThreshold: 3, // Trigger self-heal after 3 failures
  maxHealAttempts: 2, // Max attempts per test before escalation
  confidenceThreshold: 0.7, // Min confidence to auto-apply patches
  rollbackThreshold: 0.5, // Rollback if success rate drops below 50%
  maxPatchAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
}

class AutonomousBotMonitor {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    this.isRunning = false
    this.healInProgress = new Set() // Track ongoing healing processes
    this.lastNotificationTime = new Map() // Rate limit notifications
  }

  async start() {
    console.log('🤖 Starting Autonomous Bot Monitor...')
    console.log(`📊 Configuration:`)
    console.log(`   Check interval: ${CONFIG.checkInterval / 1000}s`)
    console.log(`   Failure threshold: ${CONFIG.failureThreshold}`)
    console.log(`   Confidence threshold: ${CONFIG.confidenceThreshold * 100}%`)
    
    this.isRunning = true
    
    // Create necessary directories
    await this.ensureDirectories()
    
    // Start monitoring loop
    this.monitorLoop()
    
    // Graceful shutdown
    process.on('SIGINT', () => this.stop())
    process.on('SIGTERM', () => this.stop())
  }

  async stop() {
    console.log('\n🛑 Stopping Autonomous Bot Monitor...')
    this.isRunning = false
    process.exit(0)
  }

  async ensureDirectories() {
    const dirs = [
      'patches/self-heal',
      'logs/autonomous',
      'temp/rollback'
    ]

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true })
    }
  }

  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkForFailures()
        await this.checkPatchHealth()
        await this.cleanupOldPatches()
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval))
        
      } catch (error) {
        console.error('❌ Monitor loop error:', error.message)
        await this.logError('monitor_loop', error)
        
        // Wait longer after error
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval * 2))
      }
    }
  }

  async checkForFailures() {
    // Get recent failures that haven't been healed
    const { data: failures, error } = await this.supabase
      .from('bot_failure_analysis')
      .select(`
        id,
        test_log_id,
        failure_category,
        severity,
        ai_analysis,
        self_heal_attempted,
        applied_patch_id,
        created_at,
        test_log:bot_test_logs(
          bot_name,
          test_route,
          error_detail,
          run_at
        )
      `)
      .eq('self_heal_attempted', false)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(`Failed to fetch failure analysis: ${error.message}`)
    }

    for (const failure of failures) {
      if (!failure.test_log) continue

      const healKey = `${failure.test_log.bot_name}-${failure.test_log.test_route}`
      
      // Skip if already healing this bot/route
      if (this.healInProgress.has(healKey)) {
        continue
      }

      // Check if this failure pattern qualifies for auto-healing
      const shouldHeal = await this.shouldTriggerHealing(failure)
      
      if (shouldHeal) {
        console.log(`🔧 Triggering self-heal for ${healKey}`)
        this.healInProgress.add(healKey)
        
        // Start healing process (non-blocking)
        this.healFailure(failure, healKey).catch(error => {
          console.error(`❌ Healing failed for ${healKey}:`, error.message)
          this.healInProgress.delete(healKey)
        })
      }
    }
  }

  async shouldTriggerHealing(failure) {
    const testLog = failure.test_log
    
    // Count recent failures for same bot + route
    const { data: recentFailures, error } = await this.supabase
      .from('bot_test_logs')
      .select('id')
      .eq('bot_name', testLog.bot_name)
      .eq('test_route', testLog.test_route)
      .eq('test_result', 'fail')
      .gte('run_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Error checking recent failures:', error)
      return false
    }

    // Check if we've already tried healing this recently
    const { data: healAttempts, error: healError } = await this.supabase
      .from('bot_patch_logs')
      .select('id')
      .contains('test_targets', [testLog.test_route])
      .gte('applied_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (healError) {
      console.error('Error checking heal attempts:', healError)
      return false
    }

    const failureCount = recentFailures?.length || 0
    const healAttemptCount = healAttempts?.length || 0

    // Trigger conditions
    const hasEnoughFailures = failureCount >= CONFIG.failureThreshold
    const notOverHealed = healAttemptCount < CONFIG.maxHealAttempts
    const isCriticalOrHigh = ['critical', 'high'].includes(failure.severity)

    return hasEnoughFailures && notOverHealed && (isCriticalOrHigh || failureCount >= 5)
  }

  async healFailure(failure, healKey) {
    try {
      console.log(`🧠 Starting healing process for ${healKey}`)
      
      // Mark as healing attempted
      await this.supabase
        .from('bot_failure_analysis')
        .update({ self_heal_attempted: true })
        .eq('id', failure.id)

      // Call self-heal API
      const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3001'}/api/ai/self-heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testLogId: failure.test_log_id,
          autoApply: true
        })
      })

      if (!response.ok) {
        throw new Error(`Self-heal API failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.patchApplied && result.testPassed) {
        console.log(`✅ Successfully healed ${healKey}`)
        await this.notifySuccess(healKey, result)
        
        // Update failure analysis with success
        await this.supabase
          .from('bot_failure_analysis')
          .update({ 
            self_heal_success: true,
            self_heal_details: result,
            applied_patch_id: result.patch?.id
          })
          .eq('id', failure.id)
          
      } else if (result.patchApplied && !result.testPassed) {
        console.log(`⚠️ Patch applied but test still failing for ${healKey}`)
        await this.escalateFailure(healKey, result)
        
      } else {
        console.log(`❌ Could not heal ${healKey}`)
        await this.escalateFailure(healKey, result)
      }

    } catch (error) {
      console.error(`💥 Healing error for ${healKey}:`, error.message)
      await this.escalateFailure(healKey, { error: error.message })
      
    } finally {
      this.healInProgress.delete(healKey)
    }
  }

  async checkPatchHealth() {
    // Monitor patch effectiveness over time
    const { data: patches, error } = await this.supabase
      .from('bot_patch_logs')
      .select('*')
      .eq('status', 'applied')
      .gte('applied_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) return

    for (const patch of patches) {
      // Check if tests are still passing after patch
      const { data: recentTests, error: testError } = await this.supabase
        .from('bot_test_logs')
        .select('test_result')
        .in('test_route', patch.test_targets)
        .gte('run_at', patch.applied_at)
        .order('run_at', { ascending: false })
        .limit(10)

      if (testError) continue

      const passRate = recentTests.length > 0 
        ? (recentTests.filter(t => t.test_result === 'pass').length / recentTests.length)
        : 0

      // If patch is causing more failures, consider rollback
      if (passRate < CONFIG.rollbackThreshold && recentTests.length >= 5) {
        console.log(`🚨 Patch ${patch.patch_id} may be causing issues (${(passRate * 100).toFixed(1)}% pass rate)`)
        await this.considerRollback(patch)
      }
    }
  }

  async considerRollback(patch) {
    // Log potential rollback need
    await this.supabase
      .from('bot_patch_logs')
      .update({ 
        status: 'failed',
        side_effects: { 
          rollback_considered: true,
          low_pass_rate: true,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', patch.id)

    // Alert about potential rollback
    await this.sendAlert({
      title: '🚨 Patch Rollback Needed',
      description: `Patch ${patch.patch_id} may be causing test failures`,
      severity: 'high',
      details: {
        patch_type: patch.patch_type,
        confidence: patch.confidence,
        test_targets: patch.test_targets
      }
    })
  }

  async cleanupOldPatches() {
    const cutoffDate = new Date(Date.now() - CONFIG.maxPatchAge).toISOString()
    
    // Archive old patches
    const { data: oldPatches, error } = await this.supabase
      .from('bot_patch_logs')
      .select('patch_id, patch_content')
      .lt('applied_at', cutoffDate)
      .in('status', ['applied', 'successful'])

    if (error) return

    for (const patch of oldPatches) {
      // Archive patch content to file
      const archivePath = path.join('patches/archive', `${patch.patch_id}.ts`)
      await fs.writeFile(archivePath, patch.patch_content)
    }

    // Update status to archived
    await this.supabase
      .from('bot_patch_logs')
      .update({ status: 'archived' })
      .lt('applied_at', cutoffDate)
      .in('status', ['applied', 'successful'])
  }

  async notifySuccess(healKey, result) {
    await this.sendAlert({
      title: '🎉 Autonomous Healing Success',
      description: `Successfully healed ${healKey}`,
      severity: 'info',
      details: {
        patch_type: result.patch?.type,
        confidence: result.patch?.confidence,
        test_passed: result.testPassed
      }
    })
  }

  async escalateFailure(healKey, result) {
    // Rate limit escalation notifications
    const lastNotification = this.lastNotificationTime.get(healKey)
    const now = Date.now()
    
    if (lastNotification && (now - lastNotification) < 30 * 60 * 1000) {
      return // Don't spam notifications
    }

    this.lastNotificationTime.set(healKey, now)

    await this.sendAlert({
      title: '⚠️ Autonomous Healing Failed',
      description: `Could not heal ${healKey} - manual intervention may be required`,
      severity: 'high',
      details: result
    })
  }

  async sendAlert(alert) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.log(`📢 Alert: ${alert.title} - ${alert.description}`)
      return
    }

    const colorMap = {
      'info': 3066993,    // Green
      'warning': 16776960, // Yellow  
      'high': 15158332,   // Red
      'critical': 10038562 // Dark red
    }

    const message = {
      embeds: [{
        title: alert.title,
        description: alert.description,
        color: colorMap[alert.severity] || 3066993,
        fields: Object.entries(alert.details || {}).map(([key, value]) => ({
          name: key.replace(/_/g, ' ').toUpperCase(),
          value: String(value),
          inline: true
        })),
        timestamp: new Date().toISOString(),
        footer: { text: 'Autonomous Bot Monitor' }
      }]
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
    } catch (error) {
      console.error('Failed to send alert:', error.message)
    }
  }

  async logError(context, error) {
    try {
      const logFile = path.join('logs/autonomous', `error-${new Date().toISOString().split('T')[0]}.json`)
      const logEntry = {
        timestamp: new Date().toISOString(),
        context,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }

      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n')
    } catch (logError) {
      console.error('Failed to log error:', logError.message)
    }
  }

  async getStatus() {
    // Get current monitoring status
    const { data: recentFailures } = await this.supabase
      .from('bot_failure_analysis')
      .select('severity')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    const { data: recentPatches } = await this.supabase
      .from('bot_patch_logs')
      .select('status, test_success')
      .gte('applied_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    return {
      isRunning: this.isRunning,
      healingInProgress: Array.from(this.healInProgress),
      recentFailures: recentFailures?.length || 0,
      recentPatches: recentPatches?.length || 0,
      patchSuccessRate: recentPatches?.length > 0 
        ? (recentPatches.filter(p => p.test_success).length / recentPatches.length) * 100
        : 0
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'start'

  const monitor = new AutonomousBotMonitor()

  switch (command) {
    case 'start':
      await monitor.start()
      break
      
    case 'status':
      const status = await monitor.getStatus()
      console.log('🤖 Autonomous Bot Monitor Status:')
      console.log(`   Running: ${status.isRunning}`)
      console.log(`   Healing in progress: ${status.healingInProgress.length}`)
      console.log(`   Recent failures: ${status.recentFailures}`)
      console.log(`   Recent patches: ${status.recentPatches}`)
      console.log(`   Patch success rate: ${status.patchSuccessRate.toFixed(1)}%`)
      break
      
    default:
      console.log('Usage: node autonomous-bot-monitor.js [start|status]')
      break
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { AutonomousBotMonitor } 