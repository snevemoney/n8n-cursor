import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

// Remove module-level OpenAI initialization to prevent build-time errors

// Initialize Supabase with fallbacks for build time
const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

// Utility: get Supabase schema introspection
async function fetchSupabaseSchema() {
  try {
    // Return fallback if Supabase is not initialized (build time)
    if (!supabase) {
      return `
Lightning Platform Schema:
This is a Lightning Network SaaS platform with tables for:
- User management (workspaces, profiles, members)
- Lightning Network operations (invoices, payments, channels)
- AI features (agents, usage tracking)
- Business operations (email campaigns, analytics)
- Admin functions (audit logs, system monitoring)
      `
    }

    // Try to use our custom schema function first
    const { data, error } = await supabase.rpc('get_schema_doc')
    
    if (!error && data) {
      return data
    }

    // Fallback to basic table listing
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')

    if (!tablesError && tables) {
      return `
Lightning Platform Database Tables:
${tables.map(t => `• ${t.table_name}`).join('\n')}

Key Platform Tables:
• workspaces: User workspaces with Lightning node configurations
• profiles: User profiles and roles  
• workspace_members: Team membership and permissions
• email_events: Email campaign tracking (opens, clicks)
• ai_agents: AI agent configurations and settings
• usage_logs: API usage and token consumption tracking
• invoices: Lightning invoice management
• payments: Lightning payment transactions
• bonus_codes: Promotional codes for platform features
      `
    }

    // Final fallback
    return `
Lightning Platform Schema:
This is a Lightning Network SaaS platform with tables for:
- User management (workspaces, profiles, members)
- Lightning Network operations (invoices, payments, channels)
- AI features (agents, usage tracking)
- Business operations (email campaigns, analytics)
- Admin functions (audit logs, system monitoring)
    `
  } catch (error) {
    console.error('Error fetching schema:', error)
    return 'Schema information temporarily unavailable'
  }
}

// Utility: read dashboard route files
async function readDashboardRoutes() {
  try {
    const dashboardDir = path.resolve(process.cwd(), 'src/app/dashboard')
    const adminDir = path.resolve(process.cwd(), 'src/app/admin')
    
    let routes = []
    
    // Read dashboard files
    try {
      const dashboardFiles = await fs.readdir(dashboardDir, { recursive: true })
      for (const file of dashboardFiles.slice(0, 5)) { // Limit to prevent token overflow
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          try {
            const filePath = path.join(dashboardDir, file)
            const content = await fs.readFile(filePath, 'utf-8')
            routes.push(`\n--- Dashboard: ${file} ---\n${content.slice(0, 800)}...`)
          } catch (err) {
            console.log(`Could not read dashboard file ${file}`)
          }
        }
      }
    } catch (err) {
      console.log('Could not read dashboard directory')
    }

    // Read some admin files
    try {
      const adminFiles = await fs.readdir(adminDir, { recursive: true })
      for (const file of adminFiles.slice(0, 3)) {
        if (file.endsWith('.tsx') && (file.includes('page') || file.includes('layout'))) {
          try {
            const filePath = path.join(adminDir, file)
            const content = await fs.readFile(filePath, 'utf-8')
            routes.push(`\n--- Admin: ${file} ---\n${content.slice(0, 600)}...`)
          } catch (err) {
            console.log(`Could not read admin file ${file}`)
          }
        }
      }
    } catch (err) {
      console.log('Could not read admin directory')
    }
    
    if (routes.length === 0) {
      return `
Lightning Platform Dashboard Structure:
- /dashboard: Main Lightning node dashboard with balance, channels, AI requests
- /dashboard/ai-assistant: Interactive AI assistant for platform help
- /dashboard/monitor: Node monitoring and health checks
- /admin: Admin panel for platform management
- /admin/email-campaigns: Email campaign analytics with conversion tracking
- /admin/ai-assistant: AI assistant testing interface
- /payments: Lightning payment management
- /settings: Node configuration and preferences
      `
    }
    
    return routes.join('\n\n')
  } catch (error) {
    console.error('Error reading dashboard routes:', error)
    return 'Dashboard code analysis temporarily unavailable'
  }
}

// Utility: get user role + workspace state
async function fetchUserContext(userId: string) {
  try {
    // Return default context if Supabase is not initialized (build time)
    if (!supabase) {
      return {
        role: 'user',
        workspaces: {
          id: 'build-time',
          name: 'Demo Workspace',
          status: 'active',
          node_status: 'online',
          plan: 'free'
        }
      }
    }

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        role, 
        workspaces(id, name, status, node_status, plan)
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('User context error:', error)
      return {
        role: 'user',
        workspaces: {
          id: 'unknown',
          name: 'Demo Workspace',
          status: 'active',
          node_status: 'online',
          plan: 'free'
        }
      }
    }

    return data
  } catch (error) {
    console.error('Error fetching user context:', error)
    return {
      role: 'user',
      workspaces: {
        id: 'unknown',
        name: 'Demo Workspace', 
        status: 'active',
        node_status: 'online',
        plan: 'free'
      }
    }
  }
}

// Agent logic
export async function POST(req: NextRequest) {
  try {
    const { userId, question } = await req.json()

    if (!userId || !question) {
      return NextResponse.json({ error: 'Missing userId or question' }, { status: 400 })
    }

    // Initialize OpenAI client at runtime when environment variables are available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable',
        reply: 'The AI assistant is currently unavailable. Please check your configuration or try again later.'
      }, { status: 503 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log(`Dashboard Agent query from ${userId}: ${question}`)

    const [schema, dashboardCode, context] = await Promise.all([
      fetchSupabaseSchema(),
      readDashboardRoutes(),
      fetchUserContext(userId)
    ])

    const system = `
You are a helpful AI agent embedded in a Bitcoin Lightning SaaS dashboard.
Your job is to answer user questions using database schema, dashboard code, and user context.

You are an expert in:
- Lightning Network node management and optimization
- Bitcoin payments, invoicing, and channel liquidity
- Multi-tenant SaaS architecture and user management
- Email campaign analytics and conversion optimization
- AI agent configuration and automation
- Dashboard metrics interpretation and business insights

Database Schema:
${schema}

Dashboard Implementation:
${dashboardCode}

Current User Context:
- Role: ${context.role}
- Node Status: ${Array.isArray(context.workspaces) ? context.workspaces[0]?.node_status : context.workspaces?.node_status || 'unknown'}
- Workspace: ${Array.isArray(context.workspaces) ? context.workspaces[0]?.name : context.workspaces?.name || 'Unknown'} (${Array.isArray(context.workspaces) ? context.workspaces[0]?.id?.slice(0, 8) : context.workspaces?.id?.slice(0, 8) || 'unknown'}...)
- Plan: ${Array.isArray(context.workspaces) ? context.workspaces[0]?.plan : context.workspaces?.plan || 'free'}
- Workspace Status: ${Array.isArray(context.workspaces) ? context.workspaces[0]?.status : context.workspaces?.status || 'unknown'}

Instructions:
1. Provide helpful, actionable answers about the Lightning platform
2. Reference specific features available in their current plan
3. If they ask about unavailable features, explain upgrade requirements
4. Be conversational but technical when appropriate
5. Focus on practical advice for Lightning node business operations
6. When discussing metrics, explain what they mean for their business

Answer the user's question with specific, actionable advice.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.3,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: question }
      ]
    })

    const reply = response.choices[0].message.content

    console.log(`Dashboard Agent response: ${reply?.slice(0, 100)}...`)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Dashboard Agent error:', error)
    return NextResponse.json({ 
      error: 'Failed to process question',
      reply: 'Sorry, I encountered an error processing your question. Please try asking something else or contact support if the issue persists.'
    }, { status: 500 })
  }
} 