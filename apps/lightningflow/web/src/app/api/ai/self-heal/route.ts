/**
 * Autonomous Self-Healing API
 * 
 * Analyzes failed bot tests and generates/applies patches automatically
 * Integrates with bot_test_logs for failure pattern analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { withRateLimit, defaultRateLimit } from '@/lib/middleware/rate-limiter'

interface SelfHealRequest {
  testLogId?: string
  botName?: string
  failurePattern?: string
  autoApply?: boolean
}

interface PatchSuggestion {
  id: string
  type: 'selector_fix' | 'timeout_increase' | 'dom_repair' | 'api_retry' | 'layout_fix'
  description: string
  patch: string
  confidence: number
  testTargets: string[]
  rollbackCode?: string
}

interface TestLog {
  id: string
  bot_name: string
  test_route: string
  test_result: string
  error_detail?: {
    message?: string
  }
  test_details?: any
  execution_time_ms: number
  run_at: string
}

async function getSupabaseClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set() {},
        remove() {}
      }
    }
  )
}

async function analyzeFailurePattern(supabase: any, testLogId?: string, botName?: string) {
  let query = supabase
    .from('bot_test_logs')
    .select(`
      id,
      bot_name,
      test_route,
      test_result,
      error_detail,
      test_details,
      execution_time_ms,
      run_at
    `)
    .eq('test_result', 'fail')
    .order('run_at', { ascending: false })
    .limit(20)

  if (testLogId) {
    query = query.eq('id', testLogId)
  } else if (botName) {
    query = query.eq('bot_name', botName)
  }

  const { data: failedTests, error } = await query

  if (error) {
    throw new Error(`Failed to fetch test logs: ${error.message}`)
  }

  // Analyze common failure patterns
  const patterns = {
    selectorFailures: failedTests.filter((t: TestLog) => 
      t.error_detail?.message?.includes('locator') || 
      t.error_detail?.message?.includes('not found') ||
      t.error_detail?.message?.includes('timeout')
    ),
    apiFailures: failedTests.filter((t: TestLog) => 
      t.error_detail?.message?.includes('api') || 
      t.error_detail?.message?.includes('fetch') ||
      t.error_detail?.message?.includes('network')
    ),
    loadingFailures: failedTests.filter((t: TestLog) => 
      t.error_detail?.message?.includes('loading') || 
      t.error_detail?.message?.includes('networkidle') ||
      t.execution_time_ms > 30000
    )
  }

  return { failedTests, patterns }
}

async function generatePatch(failureAnalysis: any, testLog: any): Promise<PatchSuggestion> {
  const { patterns } = failureAnalysis
  const errorMessage = testLog.error_detail?.message || ''
  const testRoute = testLog.test_route

  // Selector failure patterns
  if (patterns.selectorFailures.length > 0 && errorMessage.includes('locator')) {
    const selectorMatch = errorMessage.match(/locator\('([^']+)'\)/)
    const failedSelector = selectorMatch?.[1] || 'unknown'
    
    return {
      id: `selector-fix-${Date.now()}`,
      type: 'selector_fix',
      description: `Fix failed selector: ${failedSelector}`,
      patch: generateSelectorPatch(failedSelector, testRoute),
      confidence: 0.85,
      testTargets: [testLog.test_route],
      rollbackCode: `// Rollback: revert selector changes for ${failedSelector}`
    }
  }

  // Timeout failures
  if (patterns.loadingFailures.length > 0 && testLog.execution_time_ms > 30000) {
    return {
      id: `timeout-fix-${Date.now()}`,
      type: 'timeout_increase',
      description: 'Increase timeout for slow loading elements',
      patch: generateTimeoutPatch(testRoute),
      confidence: 0.9,
      testTargets: [testLog.test_route],
      rollbackCode: '// Rollback: restore original timeout values'
    }
  }

  // API failure patterns
  if (patterns.apiFailures.length > 0) {
    return {
      id: `api-retry-${Date.now()}`,
      type: 'api_retry',
      description: 'Add retry logic for API failures',
      patch: generateApiRetryPatch(testRoute),
      confidence: 0.75,
      testTargets: [testLog.test_route],
      rollbackCode: '// Rollback: remove retry wrapper'
    }
  }

  // Generic DOM repair
  return {
    id: `dom-repair-${Date.now()}`,
    type: 'dom_repair',
    description: 'Generic DOM element wait and retry',
    patch: generateDomRepairPatch(testRoute),
    confidence: 0.6,
    testTargets: [testLog.test_route],
    rollbackCode: '// Rollback: remove DOM repair wrapper'
  }
}

function generateSelectorPatch(failedSelector: string, testRoute: string): string {
  return `
// Auto-generated selector patch for ${testRoute}
// Failed selector: ${failedSelector}

export const selectorPatch = {
  route: '${testRoute}',
  timestamp: '${new Date().toISOString()}',
  changes: [
    {
      from: '${failedSelector}',
      to: '${failedSelector}, [data-testid="${failedSelector.replace(/[\[\]]/g, '')}"]',
      fallbacks: [
        'text="${failedSelector}"',
        '.${failedSelector.replace(/[^a-zA-Z0-9]/g, '')}'
      ]
    }
  ],
  waitStrategy: {
    timeout: 15000,
    retries: 3,
    waitForVisible: true
  }
}
`
}

function generateTimeoutPatch(testRoute: string): string {
  return `
// Auto-generated timeout patch for ${testRoute}

export const timeoutPatch = {
  route: '${testRoute}',
  timestamp: '${new Date().toISOString()}',
  changes: {
    actionTimeout: 45000, // Increased from 30s
    navigationTimeout: 90000, // Increased from 60s
    waitForLoadState: 'networkidle',
    additionalWaits: [
      { selector: '[data-testid="loading-spinner"]', state: 'hidden' },
      { selector: '[data-testid="error-message"]', state: 'hidden' }
    ]
  }
}
`
}

function generateApiRetryPatch(testRoute: string): string {
  return `
// Auto-generated API retry patch for ${testRoute}

export const apiRetryPatch = {
  route: '${testRoute}',
  timestamp: '${new Date().toISOString()}',
  retryConfig: {
    maxRetries: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
    retryableErrors: ['network', 'timeout', '500', '502', '503'],
    beforeRetry: async (attempt) => {
      console.log(\`API retry attempt \${attempt} for ${testRoute}\`)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000))
    }
  }
}
`
}

function generateDomRepairPatch(testRoute: string): string {
  return `
// Auto-generated DOM repair patch for ${testRoute}

export const domRepairPatch = {
  route: '${testRoute}',
  timestamp: '${new Date().toISOString()}',
  repairs: [
    {
      action: 'waitForStability',
      timeout: 10000,
      checks: ['no-animation', 'no-pending-requests']
    },
    {
      action: 'retryInteraction',
      maxAttempts: 3,
      waitBetween: 1000,
      fallbackSelectors: true
    },
    {
      action: 'scrollIntoView',
      beforeClick: true,
      smooth: false
    }
  ]
}
`
}

async function applyPatch(patch: PatchSuggestion, supabase: any): Promise<boolean> {
  try {
    // Store patch in database for tracking
    const { error: patchError } = await supabase
      .from('bot_patch_logs')
      .insert({
        patch_id: patch.id,
        patch_type: patch.type,
        description: patch.description,
        patch_content: patch.patch,
        confidence: patch.confidence,
        test_targets: patch.testTargets,
        applied_at: new Date().toISOString(),
        status: 'applied'
      })

    if (patchError) {
      console.error('Failed to log patch:', patchError)
    }

    // Write patch file to file system
    const fs = require('fs').promises
    const path = require('path')
    
    const patchDir = path.join(process.cwd(), 'patches/self-heal')
    await fs.mkdir(patchDir, { recursive: true })
    
    const patchFile = path.join(patchDir, `${patch.id}.ts`)
    await fs.writeFile(patchFile, patch.patch)
    
    console.log(`✅ Patch applied: ${patch.id}`)
    return true

  } catch (error) {
    console.error('Failed to apply patch:', error)
    return false
  }
}

async function triggerTestRerun(botName: string, testRoute: string): Promise<boolean> {
  try {
    // Trigger specific test rerun
    const { spawn } = require('child_process')
    
    return new Promise((resolve) => {
      const testProcess = spawn('npx', [
        'playwright', 'test', 
        `tests/bots/${botName}.spec.ts`,
        '--grep', testRoute,
        '--project=bots',
        '--reporter=json'
      ], {
        cwd: process.cwd(),
        stdio: 'pipe'
      })

      testProcess.on('close', (code: number | null) => {
        resolve(code === 0)
      })

      testProcess.on('error', () => {
        resolve(false)
      })
    })

  } catch (error) {
    console.error('Failed to trigger test rerun:', error)
    return false
  }
}

async function sendNotification(patch: PatchSuggestion, success: boolean) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    embeds: [{
      title: success ? '🔧 Self-Heal Patch Applied' : '❌ Self-Heal Patch Failed',
      description: patch.description,
      color: success ? 3066993 : 15158332,
      fields: [
        { name: 'Patch Type', value: patch.type, inline: true },
        { name: 'Confidence', value: `${(patch.confidence * 100).toFixed(1)}%`, inline: true },
        { name: 'Test Targets', value: patch.testTargets.join(', '), inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  try {
    const supabase = await getSupabaseClient(req)
    const body: SelfHealRequest = await req.json()
    const { testLogId, botName, autoApply = true } = body

    console.log('🧠 Starting self-heal analysis...')

    // Analyze failure patterns
    const failureAnalysis = await analyzeFailurePattern(supabase, testLogId, botName)
    
    if (failureAnalysis.failedTests.length === 0) {
      return NextResponse.json({
        message: 'No failed tests found to analyze',
        analysisComplete: true
      })
    }

    // Generate patch for most recent failure
    const latestFailure = failureAnalysis.failedTests[0]
    const patch = await generatePatch(failureAnalysis, latestFailure)

    console.log(`🔧 Generated patch: ${patch.type} (${(patch.confidence * 100).toFixed(1)}% confidence)`)

    let patchApplied = false
    let testPassed = false

    if (autoApply && patch.confidence > 0.7) {
      // Apply patch automatically
      patchApplied = await applyPatch(patch, supabase)
      
      if (patchApplied) {
        console.log('🔄 Triggering test rerun...')
        // Wait a moment for patch to be ready
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        testPassed = await triggerTestRerun(latestFailure.bot_name, latestFailure.test_route)
        
        // Send notification
        await sendNotification(patch, testPassed)
      }
    }

    return NextResponse.json({
      analysisComplete: true,
      patchGenerated: true,
      patchApplied,
      testPassed,
      patch: {
        id: patch.id,
        type: patch.type,
        description: patch.description,
        confidence: patch.confidence,
        testTargets: patch.testTargets
      },
      failureStats: {
        totalFailures: failureAnalysis.failedTests.length,
        selectorFailures: failureAnalysis.patterns.selectorFailures.length,
        apiFailures: failureAnalysis.patterns.apiFailures.length,
        loadingFailures: failureAnalysis.patterns.loadingFailures.length
      }
    })

  } catch (error) {
    console.error('Self-heal error:', error)
    return NextResponse.json(
      { error: 'Self-heal process failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting
export const POST = withRateLimit(handler, defaultRateLimit) 