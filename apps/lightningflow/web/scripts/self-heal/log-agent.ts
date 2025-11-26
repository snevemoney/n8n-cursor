#!/usr/bin/env node

/**
 * Local Self-Heal Log Agent
 * 
 * Tracks local development patches and healing attempts
 * Useful for debugging and development workflow
 */

import fs from 'fs'
import path from 'path'

const LOG_PATH = path.resolve(__dirname, 'local-heal-log.json')
const PATCH_DIR = path.resolve(__dirname, '../../patches/self-heal')

interface HealingAttempt {
  testId: string
  botName: string
  testRoute: string
  patch: string
  patchType: string
  confidence: number
  timestamp: string
  success?: boolean
  retryCount?: number
  errorMessage?: string
}

export function logFix(testId: string, patch: string, metadata?: Partial<HealingAttempt>) {
  const existing = fs.existsSync(LOG_PATH)
    ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'))
    : { attempts: [], summary: { total: 0, successful: 0, failed: 0 } }

  const attempt: HealingAttempt = {
    testId,
    patch,
    timestamp: new Date().toISOString(),
    ...metadata
  }

  existing.attempts.push(attempt)
  existing.summary.total += 1

  if (metadata?.success === true) {
    existing.summary.successful += 1
  } else if (metadata?.success === false) {
    existing.summary.failed += 1
  }

  // Keep only last 50 attempts
  if (existing.attempts.length > 50) {
    existing.attempts = existing.attempts.slice(-50)
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2))
  console.log(`🧠 Local log saved for ${testId}`)
  
  // Also save individual patch file for inspection
  if (metadata?.patchType) {
    savePatchFile(testId, patch, metadata.patchType)
  }
}

export function savePatchFile(testId: string, patch: string, patchType: string) {
  try {
    // Ensure patch directory exists
    if (!fs.existsSync(PATCH_DIR)) {
      fs.mkdirSync(PATCH_DIR, { recursive: true })
    }

    const patchFileName = `${testId}-${patchType}-${Date.now()}.ts`
    const patchFilePath = path.join(PATCH_DIR, patchFileName)
    
    const patchContent = `// Local development patch - ${new Date().toISOString()}
// Test ID: ${testId}
// Patch Type: ${patchType}

${patch}

// This patch was generated during local development
// and can be reviewed before applying to production
`

    fs.writeFileSync(patchFilePath, patchContent)
    console.log(`📁 Patch file saved: ${patchFileName}`)
    
  } catch (error) {
    console.error('❌ Failed to save patch file:', error)
  }
}

export function getLogSummary(): any {
  if (!fs.existsSync(LOG_PATH)) {
    return { attempts: [], summary: { total: 0, successful: 0, failed: 0 } }
  }

  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'))
}

export function showRecentAttempts(count: number = 10) {
  const log = getLogSummary()
  
  console.log('🔍 Recent Self-Healing Attempts:')
  console.log('=' .repeat(60))
  
  if (log.attempts.length === 0) {
    console.log('📭 No healing attempts found')
    return
  }

  const recent = log.attempts.slice(-count).reverse()
  
  recent.forEach((attempt: HealingAttempt, index: number) => {
    const status = attempt.success === true ? '✅' : 
                   attempt.success === false ? '❌' : '⏳'
    
    console.log(`\n${index + 1}. ${status} ${attempt.testId}`)
    console.log(`   Bot: ${attempt.botName} | Route: ${attempt.testRoute}`)
    console.log(`   Type: ${attempt.patchType} | Confidence: ${attempt.confidence}%`)
    console.log(`   Time: ${new Date(attempt.timestamp).toLocaleString()}`)
    
    if (attempt.errorMessage) {
      console.log(`   Error: ${attempt.errorMessage}`)
    }
  })

  console.log(`\n📊 Summary: ${log.summary.total} total, ${log.summary.successful} successful, ${log.summary.failed} failed`)
}

export function clearLog() {
  if (fs.existsSync(LOG_PATH)) {
    fs.unlinkSync(LOG_PATH)
    console.log('🗑️ Local healing log cleared')
  }
}

export function exportLog(outputPath?: string) {
  const log = getLogSummary()
  const exportPath = outputPath || `healing-log-export-${Date.now()}.json`
  
  fs.writeFileSync(exportPath, JSON.stringify(log, null, 2))
  console.log(`📤 Log exported to: ${exportPath}`)
}

// CLI interface when run directly
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'show'

  switch (command) {
    case 'show':
      const count = parseInt(args[1]) || 10
      showRecentAttempts(count)
      break
      
    case 'summary':
      const log = getLogSummary()
      console.log('📊 Self-Healing Summary:')
      console.log(JSON.stringify(log.summary, null, 2))
      break
      
    case 'clear':
      clearLog()
      break
      
    case 'export':
      exportLog(args[1])
      break
      
    case 'test':
      // Test the logging system
      logFix('test-' + Date.now(), 'console.log("test patch")', {
        botName: 'testBot',
        testRoute: '/test',
        patchType: 'test_fix',
        confidence: 85,
        success: true
      })
      console.log('✅ Test log entry created')
      break
      
    default:
      console.log('Usage: node log-agent.ts [show|summary|clear|export|test]')
      console.log('  show [count]  - Show recent attempts (default: 10)')
      console.log('  summary       - Show summary statistics')
      console.log('  clear         - Clear the log file')
      console.log('  export [path] - Export log to file')
      console.log('  test          - Create a test log entry')
      break
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
} 