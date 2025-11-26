/**
 * System Watchdog - Continuous monitoring and alerting for critical system issues
 * Triggers alerts, logs anomalies, and initiates automatic fixes when problems are detected
 */

import { systemCheckRunner, SystemHealthSummary, SystemCheckResult } from './runner'
import { systemFixManager, FixResult } from './fix'

export interface WatchdogAlert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  issue_id: string
  timestamp: Date
  acknowledged: boolean
  auto_fix_attempted: boolean
  fix_result?: FixResult
}

export interface WatchdogConfig {
  enabled: boolean
  check_interval_ms: number
  alert_thresholds: {
    critical_issues: number
    warning_issues: number
    consecutive_failures: number
  }
  auto_fix_enabled: boolean
  notification_channels: {
    console: boolean
    webhook?: string
    email?: string
  }
}

class SystemWatchdog {
  private config: WatchdogConfig
  private isRunning: boolean = false
  private checkInterval: NodeJS.Timeout | null = null
  private alerts: WatchdogAlert[] = []
  private consecutiveFailures: number = 0
  private lastHealthSummary: SystemHealthSummary | null = null

  constructor(config?: Partial<WatchdogConfig>) {
    this.config = {
      enabled: true,
      check_interval_ms: 60000, // 1 minute
      alert_thresholds: {
        critical_issues: 1,
        warning_issues: 3,
        consecutive_failures: 3
      },
      auto_fix_enabled: true,
      notification_channels: {
        console: true
      },
      ...config
    }
  }

  /**
   * Start the watchdog monitoring
   */
  start() {
    if (this.isRunning) {
      console.warn('🐕 Watchdog is already running')
      return
    }

    if (!this.config.enabled) {
      console.log('🐕 Watchdog is disabled')
      return
    }

    this.isRunning = true
    this.consecutiveFailures = 0
    
    console.log(`🐕 Starting system watchdog (${this.config.check_interval_ms}ms interval)`)
    
    // Run initial check
    this.performCheck()
    
    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.performCheck()
    }, this.config.check_interval_ms)
  }

  /**
   * Stop the watchdog monitoring
   */
  stop() {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    
    console.log('🐕 System watchdog stopped')
  }

  /**
   * Perform a system health check and evaluate results
   */
  private async performCheck() {
    try {
      const healthSummary = await systemCheckRunner.runAllChecks()
      this.lastHealthSummary = healthSummary
      
      // Reset consecutive failures on successful check
      this.consecutiveFailures = 0
      
      // Evaluate health summary for alerts
      await this.evaluateHealthSummary(healthSummary)
      
    } catch (error) {
      this.consecutiveFailures++
      console.error('🐕 Watchdog check failed:', error)
      
      // Create alert for watchdog failure
      await this.createAlert({
        severity: 'high',
        title: 'Watchdog Check Failed',
        message: `System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        issue_id: 'watchdog_failure'
      })
      
      // Check for consecutive failures
      if (this.consecutiveFailures >= this.config.alert_thresholds.consecutive_failures) {
        await this.createAlert({
          severity: 'critical',
          title: 'System Monitoring Failure',
          message: `${this.consecutiveFailures} consecutive watchdog failures detected`,
          issue_id: 'consecutive_failures'
        })
      }
    }
  }

  /**
   * Evaluate health summary and create alerts as needed
   */
  private async evaluateHealthSummary(summary: SystemHealthSummary) {
    // Check for critical issues
    if (summary.checks_failed >= this.config.alert_thresholds.critical_issues) {
      const criticalIssues = summary.results.filter(r => r.status === 'critical')
      
      for (const issue of criticalIssues) {
        await this.handleCriticalIssue(issue)
      }
    }

    // Check for warning threshold
    if (summary.checks_warning >= this.config.alert_thresholds.warning_issues) {
      await this.createAlert({
        severity: 'medium',
        title: 'Multiple System Warnings',
        message: `${summary.checks_warning} system warnings detected`,
        issue_id: 'multiple_warnings'
      })
    }

    // Check for overall system degradation
    if (summary.overall_status === 'critical') {
      await this.createAlert({
        severity: 'critical',
        title: 'System Health Critical',
        message: 'Overall system health is critical - immediate attention required',
        issue_id: 'system_critical'
      })
    }

    // Log health summary
    this.logHealthSummary(summary)
  }

  /**
   * Handle critical issues with automatic fixing if enabled
   */
  private async handleCriticalIssue(issue: SystemCheckResult) {
    // Create alert for critical issue
    const alert = await this.createAlert({
      severity: 'critical',
      title: `Critical Issue: ${issue.name}`,
      message: issue.message,
      issue_id: issue.id
    })

    // Attempt auto-fix if enabled and issue is auto-fixable
    if (this.config.auto_fix_enabled && issue.auto_fixable) {
      try {
        console.log(`🐕 Attempting auto-fix for critical issue: ${issue.id}`)
        
        const fixResult = await systemFixManager.attemptFix(issue)
        
        // Update alert with fix result
        alert.auto_fix_attempted = true
        alert.fix_result = fixResult
        
        if (fixResult.fix_successful) {
          console.log(`🐕 ✅ Auto-fix successful for ${issue.id}`)
          
          // Create success alert
          await this.createAlert({
            severity: 'low',
            title: `Auto-Fix Successful: ${issue.name}`,
            message: fixResult.fix_message,
            issue_id: `${issue.id}_fixed`
          })
        } else {
          console.warn(`🐕 ⚠️ Auto-fix failed for ${issue.id}: ${fixResult.fix_message}`)
          
          // Create failure alert
          await this.createAlert({
            severity: 'high',
            title: `Auto-Fix Failed: ${issue.name}`,
            message: `Fix attempt failed: ${fixResult.fix_message}`,
            issue_id: `${issue.id}_fix_failed`
          })
        }
      } catch (error) {
        console.error(`🐕 ❌ Auto-fix error for ${issue.id}:`, error)
        
        alert.auto_fix_attempted = true
        
        await this.createAlert({
          severity: 'high',
          title: `Auto-Fix Error: ${issue.name}`,
          message: `Fix attempt error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          issue_id: `${issue.id}_fix_error`
        })
      }
    }
  }

  /**
   * Create and process a new alert
   */
  private async createAlert(alertData: {
    severity: WatchdogAlert['severity']
    title: string
    message: string
    issue_id: string
  }): Promise<WatchdogAlert> {
    const alert: WatchdogAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      issue_id: alertData.issue_id,
      timestamp: new Date(),
      acknowledged: false,
      auto_fix_attempted: false
    }

    // Add to alerts list
    this.alerts.unshift(alert)
    
    // Limit alerts history
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 500)
    }

    // Send notifications
    await this.sendNotification(alert)

    return alert
  }

  /**
   * Send alert notifications through configured channels
   */
  private async sendNotification(alert: WatchdogAlert) {
    const { notification_channels } = this.config

    // Console notification
    if (notification_channels.console) {
      const emoji = this.getSeverityEmoji(alert.severity)
      const timestamp = alert.timestamp.toLocaleTimeString()
      
      console.log(`🐕 ${emoji} [${alert.severity.toUpperCase()}] ${alert.title}`)
      console.log(`   ${alert.message}`)
      console.log(`   Issue ID: ${alert.issue_id} | Time: ${timestamp}`)
    }

    // Webhook notification
    if (notification_channels.webhook) {
      try {
        await fetch(notification_channels.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            alert_id: alert.id,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            issue_id: alert.issue_id,
            timestamp: alert.timestamp.toISOString(),
            source: 'lightning_ai_watchdog'
          })
        })
      } catch (error) {
        console.error('🐕 Failed to send webhook notification:', error)
      }
    }

    // Email notification (placeholder - implement with your email service)
    if (notification_channels.email) {
      console.log(`🐕 📧 Email notification would be sent to: ${notification_channels.email}`)
      // TODO: Implement email notification
    }
  }

  /**
   * Get emoji for alert severity
   */
  private getSeverityEmoji(severity: WatchdogAlert['severity']): string {
    switch (severity) {
      case 'critical':
        return '🚨'
      case 'high':
        return '⚠️'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '📋'
    }
  }

  /**
   * Log health summary for monitoring
   */
  private logHealthSummary(summary: SystemHealthSummary) {
    const timestamp = summary.last_check.toLocaleTimeString()
    const status = summary.overall_status.toUpperCase()
    
    console.log(`🐕 Health Check [${timestamp}]: ${status} (${summary.checks_passed}✅ ${summary.checks_warning}⚠️ ${summary.checks_failed}❌)`)
    
    // Log details for non-healthy status
    if (summary.overall_status !== 'healthy') {
      const issues = summary.results.filter(r => r.status !== 'healthy')
      issues.forEach(issue => {
        const emoji = issue.status === 'critical' ? '❌' : '⚠️'
        console.log(`   ${emoji} ${issue.name}: ${issue.message}`)
      })
    }
  }

  /**
   * Get current alerts
   */
  getAlerts(limit: number = 50): WatchdogAlert[] {
    return this.alerts.slice(0, limit)
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): WatchdogAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged)
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      console.log(`🐕 Alert acknowledged: ${alert.title}`)
      return true
    }
    return false
  }

  /**
   * Get watchdog status
   */
  getStatus() {
    return {
      running: this.isRunning,
      config: this.config,
      consecutive_failures: this.consecutiveFailures,
      total_alerts: this.alerts.length,
      unacknowledged_alerts: this.getUnacknowledgedAlerts().length,
      last_health_summary: this.lastHealthSummary
    }
  }

  /**
   * Update watchdog configuration
   */
  updateConfig(newConfig: Partial<WatchdogConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log('🐕 Watchdog configuration updated')
  }

  /**
   * Force a manual check
   */
  async forceCheck(): Promise<SystemHealthSummary | null> {
    console.log('🐕 Forcing manual health check...')
    await this.performCheck()
    return this.lastHealthSummary
  }
}

// Export singleton instance
export const systemWatchdog = new SystemWatchdog()

// Export types and class
export { SystemWatchdog } 