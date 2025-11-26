/**
 * Boot-Time System Check - Initial health verification when the system starts
 * Checks critical services and notifies users of any startup issues
 */

import { systemCheckRunner, SystemHealthSummary } from './runner'
import { systemFixManager } from './fix'
import { systemWatchdog } from './watchdog'

export interface BootCheckResult {
  success: boolean
  timestamp: Date
  duration_ms: number
  health_summary: SystemHealthSummary | null
  critical_issues: string[]
  warnings: string[]
  auto_fixes_attempted: number
  auto_fixes_successful: number
  startup_ready: boolean
  message: string
}

export interface BootCheckConfig {
  auto_fix_critical: boolean
  start_watchdog: boolean
  required_services: string[]
  timeout_ms: number
  retry_attempts: number
  retry_delay_ms: number
}

class BootTimeChecker {
  private config: BootCheckConfig
  private lastBootCheck: BootCheckResult | null = null

  constructor(config?: Partial<BootCheckConfig>) {
    this.config = {
      auto_fix_critical: true,
      start_watchdog: true,
      required_services: [
        'node_uptime',
        'database_connection',
        'memory_usage',
        'storage_space'
      ],
      timeout_ms: 30000, // 30 seconds
      retry_attempts: 3,
      retry_delay_ms: 5000, // 5 seconds
      ...config
    }
  }

  /**
   * Run comprehensive boot-time system check
   */
  async runBootCheck(): Promise<BootCheckResult> {
    const startTime = Date.now()
    console.log('🚀 Starting boot-time system check...')

    let healthSummary: SystemHealthSummary | null = null
    let attempt = 0
    let success = false

    // Retry logic for system checks
    while (attempt < this.config.retry_attempts && !success) {
      attempt++
      
      try {
        console.log(`🚀 Boot check attempt ${attempt}/${this.config.retry_attempts}`)
        
        // Run system health checks with timeout
        healthSummary = await this.runWithTimeout(
          systemCheckRunner.runAllChecks(),
          this.config.timeout_ms
        )
        
        success = true
      } catch (error) {
        console.error(`🚀 Boot check attempt ${attempt} failed:`, error)
        
        if (attempt < this.config.retry_attempts) {
          console.log(`🚀 Retrying in ${this.config.retry_delay_ms}ms...`)
          await this.delay(this.config.retry_delay_ms)
        }
      }
    }

    // Process results
    const result = await this.processBootResults(healthSummary, startTime, success)
    this.lastBootCheck = result

    // Log boot check summary
    this.logBootSummary(result)

    // Start watchdog if configured and system is ready
    if (this.config.start_watchdog && result.startup_ready) {
      systemWatchdog.start()
    }

    return result
  }

  /**
   * Process boot check results and determine system readiness
   */
  private async processBootResults(
    healthSummary: SystemHealthSummary | null,
    startTime: number,
    checkSuccess: boolean
  ): Promise<BootCheckResult> {
    const duration = Date.now() - startTime
    const criticalIssues: string[] = []
    const warnings: string[] = []
    let autoFixesAttempted = 0
    let autoFixesSuccessful = 0

    if (!checkSuccess || !healthSummary) {
      return {
        success: false,
        timestamp: new Date(),
        duration_ms: duration,
        health_summary: healthSummary,
        critical_issues: ['System health check failed to complete'],
        warnings: [],
        auto_fixes_attempted: 0,
        auto_fixes_successful: 0,
        startup_ready: false,
        message: 'Boot-time system check failed - manual intervention required'
      }
    }

    // Analyze health summary
    const criticalResults = healthSummary.results.filter(r => r.status === 'critical')
    const warningResults = healthSummary.results.filter(r => r.status === 'warning')

    // Check required services
    for (const requiredService of this.config.required_services) {
      const serviceResult = healthSummary.results.find(r => r.id === requiredService)
      
      if (!serviceResult) {
        criticalIssues.push(`Required service '${requiredService}' not found`)
      } else if (serviceResult.status === 'critical') {
        criticalIssues.push(`Required service '${requiredService}' is critical: ${serviceResult.message}`)
      } else if (serviceResult.status === 'warning') {
        warnings.push(`Required service '${requiredService}' has warnings: ${serviceResult.message}`)
      }
    }

    // Add other critical issues
    criticalResults.forEach(result => {
      if (!this.config.required_services.includes(result.id)) {
        criticalIssues.push(`${result.name}: ${result.message}`)
      }
    })

    // Add warnings
    warningResults.forEach(result => {
      if (!this.config.required_services.includes(result.id)) {
        warnings.push(`${result.name}: ${result.message}`)
      }
    })

    // Attempt auto-fixes for critical issues if enabled
    if (this.config.auto_fix_critical && criticalResults.length > 0) {
      console.log('🚀 Attempting auto-fixes for critical boot issues...')
      
      for (const issue of criticalResults) {
        if (issue.auto_fixable) {
          try {
            autoFixesAttempted++
            console.log(`🚀 Auto-fixing: ${issue.name}`)
            
            const fixResult = await systemFixManager.attemptFix(issue, true)
            
            if (fixResult.fix_successful) {
              autoFixesSuccessful++
              console.log(`🚀 ✅ Auto-fix successful: ${issue.name}`)
              
              // Remove from critical issues if fixed
              const issueIndex = criticalIssues.findIndex(ci => ci.includes(issue.name))
              if (issueIndex >= 0) {
                criticalIssues.splice(issueIndex, 1)
                warnings.push(`${issue.name}: Auto-fixed during boot`)
              }
            } else {
              console.log(`🚀 ❌ Auto-fix failed: ${issue.name} - ${fixResult.fix_message}`)
            }
          } catch (error) {
            console.error(`🚀 Auto-fix error for ${issue.name}:`, error)
          }
        }
      }
    }

    // Determine if system is ready for operation
    const startupReady = criticalIssues.length === 0
    
    // Generate summary message
    let message: string
    if (startupReady) {
      if (warnings.length === 0) {
        message = 'System boot completed successfully - all services healthy'
      } else {
        message = `System boot completed with ${warnings.length} warnings - operational but monitoring recommended`
      }
    } else {
      message = `System boot completed with ${criticalIssues.length} critical issues - manual intervention required`
    }

    return {
      success: checkSuccess && startupReady,
      timestamp: new Date(),
      duration_ms: duration,
      health_summary: healthSummary,
      critical_issues: criticalIssues,
      warnings,
      auto_fixes_attempted: autoFixesAttempted,
      auto_fixes_successful: autoFixesSuccessful,
      startup_ready: startupReady,
      message
    }
  }

  /**
   * Log boot check summary
   */
  private logBootSummary(result: BootCheckResult) {
    const duration = (result.duration_ms / 1000).toFixed(1)
    
    console.log('\n🚀 ===== BOOT CHECK SUMMARY =====')
    console.log(`🚀 Duration: ${duration}s`)
    console.log(`🚀 Status: ${result.startup_ready ? '✅ READY' : '❌ NOT READY'}`)
    console.log(`🚀 Message: ${result.message}`)
    
    if (result.health_summary) {
      const { checks_passed, checks_warning, checks_failed } = result.health_summary
      console.log(`🚀 Health: ${checks_passed}✅ ${checks_warning}⚠️ ${checks_failed}❌`)
    }

    if (result.auto_fixes_attempted > 0) {
      console.log(`🚀 Auto-fixes: ${result.auto_fixes_successful}/${result.auto_fixes_attempted} successful`)
    }

    if (result.critical_issues.length > 0) {
      console.log('🚀 Critical Issues:')
      result.critical_issues.forEach(issue => {
        console.log(`   ❌ ${issue}`)
      })
    }

    if (result.warnings.length > 0) {
      console.log('🚀 Warnings:')
      result.warnings.forEach(warning => {
        console.log(`   ⚠️ ${warning}`)
      })
    }

    console.log('🚀 ===============================\n')
  }

  /**
   * Run a promise with timeout
   */
  private async runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      promise
        .then(result => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeout)
          reject(error)
        })
    })
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get last boot check result
   */
  getLastBootCheck(): BootCheckResult | null {
    return this.lastBootCheck
  }

  /**
   * Check if system passed boot check
   */
  isSystemReady(): boolean {
    return this.lastBootCheck?.startup_ready ?? false
  }

  /**
   * Get boot check configuration
   */
  getConfig(): BootCheckConfig {
    return { ...this.config }
  }

  /**
   * Update boot check configuration
   */
  updateConfig(newConfig: Partial<BootCheckConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log('🚀 Boot check configuration updated')
  }

  /**
   * Run a quick health verification (lighter than full boot check)
   */
  async quickHealthCheck(): Promise<{
    healthy: boolean
    issues: string[]
    duration_ms: number
  }> {
    const startTime = Date.now()
    const issues: string[] = []

    try {
      // Run only essential checks
      const healthSummary = await systemCheckRunner.runAllChecks()
      
      // Check required services only
      for (const requiredService of this.config.required_services) {
        const serviceResult = healthSummary.results.find(r => r.id === requiredService)
        
        if (!serviceResult || serviceResult.status === 'critical') {
          issues.push(serviceResult ? serviceResult.message : `Service ${requiredService} not found`)
        }
      }

      return {
        healthy: issues.length === 0,
        issues,
        duration_ms: Date.now() - startTime
      }
    } catch (error) {
      return {
        healthy: false,
        issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        duration_ms: Date.now() - startTime
      }
    }
  }
}

// Export singleton instance
export const bootTimeChecker = new BootTimeChecker()

// Export types and class
export { BootTimeChecker } 