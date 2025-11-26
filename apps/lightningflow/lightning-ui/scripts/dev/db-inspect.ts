#!/usr/bin/env node

/**
 * Database Inspection Tool
 * 
 * Utility to inspect bot test logs, failures, and patches
 * Usage: npx tsx scripts/dev/db-inspect.ts [table]
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Only for local secure scripts
)

async function inspectBotTestLogs() {
  console.log('📊 Recent Bot Test Logs:')
  console.log('=' .repeat(80))

  const { data, error } = await supabase
    .from('bot_test_logs')
    .select(`
      id,
      bot_name,
      test_route,
      test_result,
      execution_time_ms,
      error_detail,
      run_at
    `)
    .order('run_at', { ascending: false })
    .limit(15)

  if (error) {
    console.error('❌ Supabase error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('📭 No test logs found')
    return
  }

  data.forEach((log, index) => {
    const status = log.test_result === 'pass' ? '✅' : '❌'
    const time = new Date(log.run_at).toLocaleString()
    const duration = `${log.execution_time_ms}ms`
    
    console.log(`\n${index + 1}. ${status} ${log.bot_name} - ${log.test_route}`)
    console.log(`   Time: ${time} | Duration: ${duration}`)
    
    if (log.test_result === 'fail' && log.error_detail?.message) {
      console.log(`   Error: ${log.error_detail.message}`)
    }
  })
}

async function inspectFailureAnalysis() {
  console.log('\n🔍 Recent Failure Analysis:')
  console.log('=' .repeat(80))

  const { data, error } = await supabase
    .from('bot_failure_analysis')
    .select(`
      id,
      failure_category,
      severity,
      self_heal_attempted,
      self_heal_success,
      applied_patch_id,
      created_at,
      test_log:bot_test_logs(bot_name, test_route)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error fetching failure analysis:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('📭 No failure analysis found')
    return
  }

  data.forEach((analysis, index) => {
    const healStatus = analysis.self_heal_attempted 
      ? (analysis.self_heal_success ? '🔧✅' : '🔧❌') 
      : '⏳'
    
    const time = new Date(analysis.created_at).toLocaleString()
    
    console.log(`\n${index + 1}. ${healStatus} ${analysis.failure_category} (${analysis.severity})`)
    console.log(`   Test: ${analysis.test_log?.bot_name} - ${analysis.test_log?.test_route}`)
    console.log(`   Time: ${time}`)
    
    if (analysis.applied_patch_id) {
      console.log(`   Patch: ${analysis.applied_patch_id}`)
    }
  })
}

async function inspectPatches() {
  console.log('\n🩹 Recent Patches:')
  console.log('=' .repeat(80))

  const { data, error } = await supabase
    .from('bot_patch_logs')
    .select(`
      patch_id,
      patch_type,
      description,
      confidence,
      status,
      test_success,
      applied_at
    `)
    .order('applied_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error fetching patches:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('📭 No patches found')
    return
  }

  data.forEach((patch, index) => {
    const status = patch.test_success ? '✅' : (patch.test_success === false ? '❌' : '⏳')
    const confidence = `${(patch.confidence * 100).toFixed(1)}%`
    const time = patch.applied_at ? new Date(patch.applied_at).toLocaleString() : 'Not applied'
    
    console.log(`\n${index + 1}. ${status} ${patch.patch_type} (${confidence} confidence)`)
    console.log(`   Description: ${patch.description}`)
    console.log(`   Status: ${patch.status} | Applied: ${time}`)
  })
}

async function showAnalytics() {
  console.log('\n📈 Bot Test Analytics:')
  console.log('=' .repeat(80))

  // Get analytics using our custom function
  const { data: analytics, error } = await supabase
    .rpc('get_bot_test_analytics', { days_back: 7 })

  if (error) {
    console.error('❌ Error fetching analytics:', error)
    return
  }

  if (!analytics || analytics.length === 0) {
    console.log('📭 No analytics available')
    return
  }

  analytics.forEach((bot: any) => {
    console.log(`\n🤖 ${bot.bot_name}:`)
    console.log(`   Total Tests: ${bot.total_tests}`)
    console.log(`   Success Rate: ${bot.success_rate?.toFixed(1)}%`)
    console.log(`   Avg Execution: ${bot.avg_execution_time?.toFixed(0)}ms`)
    console.log(`   Patches Applied: ${bot.patches_applied}`)
    
    if (bot.failure_trends) {
      console.log(`   Recent Failures: ${bot.failure_trends.recent_failures}`)
      console.log(`   Self-Healed: ${bot.failure_trends.self_healed}`)
    }
  })
}

async function showPatchEffectiveness() {
  console.log('\n🎯 Patch Effectiveness:')
  console.log('=' .repeat(80))

  const { data: effectiveness, error } = await supabase
    .rpc('get_patch_effectiveness', { days_back: 30 })

  if (error) {
    console.error('❌ Error fetching patch effectiveness:', error)
    return
  }

  if (!effectiveness || effectiveness.length === 0) {
    console.log('📭 No patch effectiveness data')
    return
  }

  effectiveness.forEach((patch: any) => {
    console.log(`\n🩹 ${patch.patch_type}:`)
    console.log(`   Total Patches: ${patch.total_patches}`)
    console.log(`   Success Rate: ${patch.success_rate?.toFixed(1)}%`)
    console.log(`   Avg Confidence: ${patch.avg_confidence?.toFixed(1)}%`)
    console.log(`   Avg Reruns: ${patch.avg_rerun_count?.toFixed(1)}`)
  })
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'all'

  console.log('🔍 Lightning Platform - Database Inspector')
  console.log(`📅 ${new Date().toLocaleString()}\n`)

  try {
    switch (command) {
      case 'logs':
        await inspectBotTestLogs()
        break
        
      case 'failures':
        await inspectFailureAnalysis()
        break
        
      case 'patches':
        await inspectPatches()
        break
        
      case 'analytics':
        await showAnalytics()
        break
        
      case 'effectiveness':
        await showPatchEffectiveness()
        break
        
      case 'all':
        await inspectBotTestLogs()
        await inspectFailureAnalysis()
        await inspectPatches()
        await showAnalytics()
        break
        
      default:
        console.log('Usage: npx tsx scripts/dev/db-inspect.ts [logs|failures|patches|analytics|effectiveness|all]')
        break
    }
    
  } catch (error) {
    console.error('\n💥 Inspection failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { inspectBotTestLogs, inspectFailureAnalysis, inspectPatches, showAnalytics } 