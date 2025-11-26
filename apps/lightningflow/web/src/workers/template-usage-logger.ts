/**
 * Template Usage Logger Worker
 * 
 * BullMQ worker that tracks template application and modifications
 * Provides analytics for template performance and user behavior
 */

import { Worker, Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

interface TemplateUsageEvent {
  userId: string
  workspaceId: string
  templateId: string
  action: 'applied' | 'modified' | 'removed' | 'viewed'
  metadata: {
    customizations?: Record<string, any>
    originalSettings?: Record<string, any>
    modifiedSettings?: Record<string, any>
    source?: 'web' | 'api' | 'cli'
    userAgent?: string
    ipAddress?: string
  }
  timestamp: string
}

interface TemplatePerformanceMetrics {
  templateId: string
  totalApplications: number
  successfulApplications: number
  failureRate: number
  averageSetupTime: number
  commonCustomizations: Record<string, number>
  userFeedback: {
    rating: number
    issues: string[]
    improvements: string[]
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Redis connection for BullMQ
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
}

/**
 * Log template usage event
 */
async function logTemplateUsage(job: Job<TemplateUsageEvent>) {
  const { userId, workspaceId, templateId, action, metadata, timestamp } = job.data

  try {
    console.log(`🔧 Logging template usage: ${action} for template ${templateId} by user ${userId}`)

    // Insert usage log
    const { error: logError } = await supabase
      .from('template_usage_logs')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        template_id: templateId,
        action,
        metadata,
        created_at: timestamp
      })

    if (logError) {
      throw new Error(`Failed to log template usage: ${logError.message}`)
    }

    // Update template statistics
    await updateTemplateStats(templateId, action, metadata)

    // Track user behavior patterns
    await trackUserBehavior(userId, templateId, action, metadata)

    // Generate insights if enough data is available
    if (action === 'applied') {
      await generateTemplateInsights(templateId)
    }

    console.log(`✅ Template usage logged successfully`)
    return { success: true, logged: true }

  } catch (error) {
    console.error(`❌ Failed to log template usage:`, error)
    throw error
  }
}

/**
 * Update template statistics
 */
async function updateTemplateStats(
  templateId: string, 
  action: string, 
  metadata: Record<string, any>
) {
  try {
    // Get current stats
    const { data: currentStats } = await supabase
      .from('template_statistics')
      .select('*')
      .eq('template_id', templateId)
      .single()

    let newStats = {
      template_id: templateId,
      total_applications: 0,
      successful_applications: 0,
      total_views: 0,
      total_modifications: 0,
      average_setup_time: 0,
      common_customizations: {},
      last_used: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (currentStats) {
      newStats = { ...currentStats }
    }

    // Update based on action
    switch (action) {
      case 'applied':
        newStats.total_applications += 1
        if (!metadata.error) {
          newStats.successful_applications += 1
        }
        if (metadata.setupTime) {
          const currentAvg = newStats.average_setup_time || 0
          const currentCount = newStats.total_applications
          newStats.average_setup_time = 
            (currentAvg * (currentCount - 1) + metadata.setupTime) / currentCount
        }
        break
      
      case 'viewed':
        newStats.total_views += 1
        break
      
      case 'modified':
        newStats.total_modifications += 1
        break
    }

    // Track customizations
    if (metadata.customizations) {
      const customizations: Record<string, number> = newStats.common_customizations || {}
      Object.keys(metadata.customizations).forEach(key => {
        customizations[key] = (customizations[key] || 0) + 1
      })
      newStats.common_customizations = customizations
    }

    // Upsert statistics
    const { error } = await supabase
      .from('template_statistics')
      .upsert(newStats)

    if (error) {
      throw new Error(`Failed to update template stats: ${error.message}`)
    }

  } catch (error) {
    console.error(`Failed to update template stats:`, error)
  }
}

/**
 * Track user behavior patterns
 */
async function trackUserBehavior(
  userId: string,
  templateId: string,
  action: string,
  metadata: Record<string, any>
) {
  try {
    // Get user's template usage history
    const { data: userHistory } = await supabase
      .from('template_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Analyze patterns
    const patterns = {
      favoriteTemplates: getFavoriteTemplates(userHistory || []),
      usageFrequency: calculateUsageFrequency(userHistory || []),
      customizationPreferences: getCustomizationPreferences(userHistory || []),
      timeToApply: getAverageTimeToApply(userHistory || [])
    }

    // Update user behavior profile
    const { error } = await supabase
      .from('user_behavior_profiles')
      .upsert({
        user_id: userId,
        behavior_patterns: patterns,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to update user behavior: ${error.message}`)
    }

  } catch (error) {
    console.error(`Failed to track user behavior:`, error)
  }
}

/**
 * Generate template insights
 */
async function generateTemplateInsights(templateId: string) {
  try {
    // Get template usage data
    const { data: usageData } = await supabase
      .from('template_usage_logs')
      .select('*')
      .eq('template_id', templateId)
      .eq('action', 'applied')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (!usageData || usageData.length < 5) {
      return // Need more data for insights
    }

    // Calculate metrics
    const insights = {
      template_id: templateId,
      success_rate: calculateSuccessRate(usageData),
      popular_customizations: getPopularCustomizations(usageData),
      setup_time_trends: getSetupTimeTrends(usageData),
      user_satisfaction: await getUserSatisfaction(templateId),
      recommendations: generateRecommendations(usageData),
      generated_at: new Date().toISOString()
    }

    // Store insights
    const { error } = await supabase
      .from('template_insights')
      .upsert(insights)

    if (error) {
      throw new Error(`Failed to store template insights: ${error.message}`)
    }

    console.log(`📊 Generated insights for template ${templateId}`)

  } catch (error) {
    console.error(`Failed to generate template insights:`, error)
  }
}

// Helper functions
function getFavoriteTemplates(history: any[]): string[] {
  const templateCounts = history.reduce((acc, log) => {
    acc[log.template_id] = (acc[log.template_id] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(templateCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([templateId]) => templateId)
}

function calculateUsageFrequency(history: any[]): number {
  if (history.length < 2) return 0
  
  const dates = history.map(log => new Date(log.created_at).getTime())
  const intervals = []
  
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i-1] - dates[i])
  }
  
  return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
}

function getCustomizationPreferences(history: any[]): Record<string, number> {
  const preferences: Record<string, number> = {}
  
  history.forEach(log => {
    if (log.metadata?.customizations) {
      Object.keys(log.metadata.customizations).forEach(key => {
        preferences[key] = (preferences[key] || 0) + 1
      })
    }
  })
  
  return preferences
}

function getAverageTimeToApply(history: any[]): number {
  const setupTimes = history
    .filter(log => log.metadata?.setupTime)
    .map(log => log.metadata.setupTime)
  
  if (setupTimes.length === 0) return 0
  
  return setupTimes.reduce((sum, time) => sum + time, 0) / setupTimes.length
}

function calculateSuccessRate(usageData: any[]): number {
  const successful = usageData.filter(log => !log.metadata?.error).length
  return (successful / usageData.length) * 100
}

function getPopularCustomizations(usageData: any[]): Record<string, number> {
  const customizations: Record<string, number> = {}
  
  usageData.forEach(log => {
    if (log.metadata?.customizations) {
      Object.keys(log.metadata.customizations).forEach(key => {
        customizations[key] = (customizations[key] || 0) + 1
      })
    }
  })
  
  return customizations
}

function getSetupTimeTrends(usageData: any[]): any[] {
  return usageData
    .filter(log => log.metadata?.setupTime)
    .map(log => ({
      date: log.created_at,
      setupTime: log.metadata.setupTime
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

async function getUserSatisfaction(templateId: string): Promise<number> {
  const { data: feedback } = await supabase
    .from('template_feedback')
    .select('rating')
    .eq('template_id', templateId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  
  if (!feedback || feedback.length === 0) return 0
  
  const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
  return Math.round(avgRating * 10) / 10
}

function generateRecommendations(usageData: any[]): string[] {
  const recommendations = []
  
  const successRate = calculateSuccessRate(usageData)
  if (successRate < 80) {
    recommendations.push('Improve setup documentation to reduce failure rate')
  }
  
  const avgSetupTime = usageData
    .filter(log => log.metadata?.setupTime)
    .reduce((sum, log) => sum + log.metadata.setupTime, 0) / usageData.length
  
  if (avgSetupTime > 30) {
    recommendations.push('Simplify configuration to reduce setup time')
  }
  
  const customizations = getPopularCustomizations(usageData)
  const topCustomization = Object.entries(customizations)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]
  
  if (topCustomization && topCustomization[1] > usageData.length * 0.7) {
    recommendations.push(`Consider making '${topCustomization[0]}' a default setting`)
  }
  
  return recommendations
}

// Create the worker
const templateUsageWorker = new Worker(
  'template-usage-logger',
  logTemplateUsage,
  {
    connection: redisConnection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 }
  }
)

templateUsageWorker.on('completed', (job) => {
  console.log(`✅ Template usage logging job ${job.id} completed`)
})

templateUsageWorker.on('failed', (job, err) => {
  console.error(`❌ Template usage logging job ${job?.id} failed:`, err)
})

templateUsageWorker.on('error', (err) => {
  console.error('❌ Template usage worker error:', err)
})

console.log('🚀 Template Usage Logger Worker started')

export default templateUsageWorker 