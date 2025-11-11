/**
 * LLM Grounding System
 * Provides comprehensive context to LLM models about:
 * - Memory systems (short-term, long-term, RAG)
 * - Assets (data sources, asset management capabilities)
 * - Actions (available tools and operations)
 * - Prompts (system messages and templates)
 */

// Agent grounding is self-contained - no external dependencies needed
// All agent information is defined in AVAILABLE_AGENTS below
// External agent registry can be optionally injected for enhanced agent support

// Agent registry interface for dependency injection
export interface AgentRegistry {
  getAgent(agentId: string): AgentConfig | null;
  getActiveAgents(): AgentConfig[];
}

// Enhanced agent config interface (compatible with lightningflow registry)
export interface AgentConfig {
  id: string;
  name: string;
  role?: string;
  description?: string;
  capabilities?: string[];
  systemPrompt?: string;
  tools?: Array<{ name: string; description?: string; parameters?: Record<string, any> }>;
  memory?: {
    type: string;
    retention: number;
    config?: Record<string, any>;
  };
  active?: boolean;
}

// Optional agent registry provider (can be set from external code)
let externalAgentRegistry: AgentRegistry | null = null;

/**
 * Register an external agent registry for enhanced agent support
 * This allows the grounding system to use agent configs from lightningflow or other sources
 * 
 * @example
 * ```typescript
 * import { registerAgentRegistry } from '@scorpion/core/context';
 * import { getAgent, getActiveAgents } from '@/lib/agents/registry';
 * 
 * registerAgentRegistry({
 *   getAgent,
 *   getActiveAgents
 * });
 * ```
 */
export function registerAgentRegistry(registry: AgentRegistry): void {
  externalAgentRegistry = registry;
}

/**
 * Get agent config from external registry if available, otherwise use built-in agent info
 */
function getAgentConfig(agentId: string, registry?: AgentRegistry | null): AgentConfig | null {
  const registryToUse = registry !== undefined ? registry : externalAgentRegistry;
  
  // Try external registry first
  if (registryToUse) {
    const config = registryToUse.getAgent(agentId);
    if (config) {
      return config;
    }
  }
  
  // Fallback to built-in agent info
  const agentInfo = AVAILABLE_AGENTS.find(a => a.id === agentId);
  if (agentInfo) {
    return {
      id: agentInfo.id,
      name: agentInfo.name,
      role: agentInfo.role,
      description: agentInfo.description,
      capabilities: agentInfo.capabilities,
      tools: agentInfo.tools,
      memory: {
        type: agentInfo.memoryType,
        retention: agentInfo.memoryRetention
      },
      active: true
    };
  }
  
  return null;
}

/**
 * Get all active agents from external registry if available, otherwise use built-in agents
 */
function getAllActiveAgents(registry?: AgentRegistry | null): AgentConfig[] {
  const registryToUse = registry !== undefined ? registry : externalAgentRegistry;
  
  // Try external registry first
  if (registryToUse) {
    const agents = registryToUse.getActiveAgents();
    if (agents && agents.length > 0) {
      return agents;
    }
  }
  
  // Fallback to built-in agents
  return AVAILABLE_AGENTS.map(agentInfo => ({
    id: agentInfo.id,
    name: agentInfo.name,
    role: agentInfo.role,
    description: agentInfo.description,
    capabilities: agentInfo.capabilities,
    tools: agentInfo.tools,
    memory: {
      type: agentInfo.memoryType,
      retention: agentInfo.memoryRetention
    },
    active: true
  }));
}

// Helper to get prompt templates (with fallbacks)
function getAssetManagementPrompt(businessName: string = '{{businessName}}'): string {
  try {
    const prompts = require('../../../scripts/tools/enhanced_chatbot_prompts');
    return prompts.assetManagementChatbotPrompt 
      ? prompts.assetManagementChatbotPrompt(businessName)
      : `You are an expert asset management assistant for ${businessName}.`;
  } catch {
    return `You are an expert asset management assistant for ${businessName}.`;
  }
}

function getSystemMessageEnhanced(): string {
  try {
    const prompts = require('../../../scripts/tools/enhanced_chatbot_prompts');
    return prompts.systemMessageEnhanced || 
      'You are an expert assistant with access to asset management, maintenance, sustainability, compliance, and financial data.';
  } catch {
    return 'You are an expert assistant with access to asset management, maintenance, sustainability, compliance, and financial data.';
  }
}

// =====================================================
// MEMORY SYSTEMS GROUNDING
// =====================================================

export interface MemorySystem {
  type: 'short-term' | 'long-term' | 'rag' | 'vector' | 'sql' | 'redis' | 'local';
  description: string;
  capabilities: string[];
  usage: string;
  retention: string;
  accessPattern: string;
}

export const MEMORY_SYSTEMS: MemorySystem[] = [
  {
    type: 'short-term',
    description: 'Conversation-level memory stored in-memory for active sessions',
    capabilities: [
      'Stores last 20 conversation items per session',
      'Fast access for immediate context',
      'Session-scoped isolation'
    ],
    usage: 'Use for maintaining conversation flow and recent context',
    retention: 'Cleared when conversation ends or session expires',
    accessPattern: 'recall(conversationId, limit) - Get recent items; remember(conversationId, text) - Store new item'
  },
  {
    type: 'long-term',
    description: 'Persistent memory stored in RAG vector store',
    capabilities: [
      'Semantic search across all stored memories',
      'Tagged and categorized storage',
      'Cross-conversation knowledge retention'
    ],
    usage: 'Use for storing important information that should persist across sessions',
    retention: 'Permanent until explicitly deleted',
    accessPattern: 'commitToLongTerm(conversationId, docIds) - Store memories; RAG search for retrieval'
  },
  {
    type: 'rag',
    description: 'Retrieval Augmented Generation - Knowledge base with vector embeddings',
    capabilities: [
      'Semantic search across documents',
      'Context injection for LLM prompts',
      'Multi-tenant isolation',
      'Category and tag filtering'
    ],
    usage: 'Use for retrieving relevant knowledge to enhance LLM responses',
    retention: 'Permanent knowledge base',
    accessPattern: 'store.search(query, limit) - Find relevant documents; store.add(doc) - Add new knowledge'
  },
  {
    type: 'vector',
    description: 'Vector embeddings for semantic similarity search',
    capabilities: [
      'High-dimensional vector storage',
      'Similarity matching',
      'Embedding model: text-embedding-ada-002'
    ],
    usage: 'Used by RAG and long-term memory systems',
    retention: 'Permanent',
    accessPattern: 'Embedding-based search through RAG store'
  },
  {
    type: 'sql',
    description: 'Structured data storage in PostgreSQL',
    capabilities: [
      'Relational data queries',
      'Complex joins and aggregations',
      'Transaction support',
      'Multi-tenant row-level security'
    ],
    usage: 'Use for structured business data, audit trails, compliance records',
    retention: 'Configurable (30-2555 days depending on data type)',
    accessPattern: 'SQL queries through Postgres nodes or direct database access'
  },
  {
    type: 'redis',
    description: 'Fast in-memory cache for temporary data',
    capabilities: [
      'Sub-second access times',
      'TTL-based expiration',
      'Key-value storage'
    ],
    usage: 'Use for caching, session data, temporary state',
    retention: 'TTL-based (typically 30-60 minutes)',
    accessPattern: 'Redis client operations with TTL'
  },
  {
    type: 'local',
    description: 'Local file-based or in-process memory',
    capabilities: [
      'Fast access',
      'No network overhead',
      'Process-scoped'
    ],
    usage: 'Use for temporary computation state',
    retention: 'Process lifetime',
    accessPattern: 'In-memory data structures'
  }
];

// =====================================================
// ASSETS GROUNDING
// =====================================================

export interface AssetSource {
  name: string;
  type: 'database' | 'api' | 'file' | 'knowledge-base' | 'iot' | 'external';
  description: string;
  dataTypes: string[];
  accessMethod: string;
  capabilities: string[];
}

export const ASSET_SOURCES: AssetSource[] = [
  {
    name: 'Asset Registry',
    type: 'database',
    description: 'Complete inventory of equipment, buildings, vehicles, and digital assets',
    dataTypes: ['equipment', 'buildings', 'vehicles', 'digital_assets', 'maintenance_records'],
    accessMethod: 'PostgreSQL queries on tenant_assets table with RLS',
    capabilities: [
      'Query asset inventory and details',
      'Track asset condition and depreciation',
      'Monitor asset lifecycle',
      'Filter by category, location, status'
    ]
  },
  {
    name: 'Work Order System',
    type: 'database',
    description: 'Maintenance requests, scheduling, and work order tracking',
    dataTypes: ['work_orders', 'maintenance_schedules', 'vendor_assignments', 'completion_status'],
    accessMethod: 'PostgreSQL queries on work_orders table',
    capabilities: [
      'Create and track work orders',
      'Check maintenance schedules',
      'Find upcoming and overdue maintenance',
      'Track vendor performance'
    ]
  },
  {
    name: 'Sustainability Metrics',
    type: 'database',
    description: 'Energy, water, waste consumption and ESG tracking',
    dataTypes: ['energy_consumption', 'water_usage', 'waste_metrics', 'carbon_footprint', 'esg_scores'],
    accessMethod: 'PostgreSQL queries on sustainability_metrics table + IoT sensor data',
    capabilities: [
      'Access real-time energy, water, waste data',
      'Calculate carbon footprint',
      'Track ESG performance',
      'Compare against baselines and targets'
    ]
  },
  {
    name: 'Compliance Database',
    type: 'database',
    description: 'Permits, licenses, certifications, and regulatory compliance records',
    dataTypes: ['permits', 'licenses', 'certifications', 'audits', 'expiration_dates'],
    accessMethod: 'PostgreSQL queries on compliance_records table',
    capabilities: [
      'Check compliance status',
      'View permits, licenses, certifications',
      'Get expiration alerts',
      'Track renewal requirements'
    ]
  },
  {
    name: 'Financial Records',
    type: 'database',
    description: 'Budgets, expenses, revenues, and financial reporting',
    dataTypes: ['budgets', 'expenses', 'revenue', 'financial_reports', 'forecasts'],
    accessMethod: 'PostgreSQL queries on financial_data tables',
    capabilities: [
      'Track budget vs actual',
      'Analyze spending by category',
      'Generate financial forecasts',
      'Calculate ROI and cost optimization'
    ]
  },
  {
    name: 'Knowledge Base',
    type: 'knowledge-base',
    description: 'RAG store with technical manuals, policies, procedures, vendor documentation',
    dataTypes: ['manuals', 'policies', 'procedures', 'vendor_docs', 'troubleshooting_guides'],
    accessMethod: 'RAG store search with semantic matching',
    capabilities: [
      'Search technical documentation',
      'Find troubleshooting guides',
      'Retrieve vendor manuals',
      'Access policy and procedure documents'
    ]
  },
  {
    name: 'IoT Sensor Data',
    type: 'iot',
    description: 'Real-time building performance metrics from smart sensors',
    dataTypes: ['sensor_readings', 'building_performance', 'energy_monitoring', 'occupancy_data'],
    accessMethod: 'IoT API endpoints or database queries',
    capabilities: [
      'Monitor real-time building performance',
      'Track energy consumption patterns',
      'Detect anomalies',
      'Predictive maintenance alerts'
    ]
  },
  {
    name: 'Vendor Database',
    type: 'database',
    description: 'Vendor contacts, performance records, and service history',
    dataTypes: ['vendor_contacts', 'performance_metrics', 'service_history', 'contracts'],
    accessMethod: 'PostgreSQL queries on vendors table',
    capabilities: [
      'Find vendors by service type',
      'Check vendor performance',
      'View service history',
      'Manage vendor relationships'
    ]
  },
  {
    name: 'Tenant Communications',
    type: 'database',
    description: 'Announcements, notifications, service requests, and feedback',
    dataTypes: ['announcements', 'notifications', 'service_requests', 'feedback', 'satisfaction_scores'],
    accessMethod: 'PostgreSQL queries on communications tables',
    capabilities: [
      'Send announcements and notifications',
      'Track service requests',
      'Collect feedback',
      'Monitor tenant satisfaction'
    ]
  },
  {
    name: 'Incident Reports',
    type: 'database',
    description: 'Safety, security, and operational incident tracking',
    dataTypes: ['safety_incidents', 'security_events', 'operational_issues', 'resolutions'],
    accessMethod: 'PostgreSQL queries on incidents table',
    capabilities: [
      'Report and track incidents',
      'Monitor safety metrics',
      'Track resolution status',
      'Generate incident reports'
    ]
  }
];

// =====================================================
// ACTIONS GROUNDING
// =====================================================

export interface Action {
  name: string;
  category: 'query' | 'create' | 'update' | 'delete' | 'analyze' | 'notify' | 'schedule';
  description: string;
  parameters: Record<string, string>;
  returns: string;
  examples: string[];
}

export const AVAILABLE_ACTIONS: Action[] = [
  // Asset Management Actions
  {
    name: 'query_asset_registry',
    category: 'query',
    description: 'Query asset inventory and get detailed asset information',
    parameters: {
      asset_id: 'string (optional)',
      category: 'string (optional)',
      location: 'string (optional)',
      status: 'string (optional)'
    },
    returns: 'Array of asset objects with details',
    examples: [
      'Get all HVAC equipment',
      'Find assets at specific location',
      'List assets requiring maintenance'
    ]
  },
  {
    name: 'check_maintenance_schedule',
    category: 'query',
    description: 'Find upcoming and overdue maintenance tasks',
    parameters: {
      timeframe: 'string (e.g., "this_month", "next_week")',
      asset_id: 'string (optional)',
      status: 'string (optional)'
    },
    returns: 'Array of maintenance tasks with dates and details',
    examples: [
      'Show maintenance due this month',
      'Find overdue maintenance',
      'Get schedule for specific asset'
    ]
  },
  {
    name: 'get_sustainability_metrics',
    category: 'query',
    description: 'Access energy, water, waste data and ESG metrics',
    parameters: {
      metric_type: 'string (energy|water|waste|carbon)',
      timeframe: 'string (e.g., "this_month", "last_year")',
      compare_to: 'string (baseline|previous_period)'
    },
    returns: 'Metrics object with values, trends, and comparisons',
    examples: [
      'Get energy consumption this month',
      'Compare water usage to last year',
      'Calculate carbon footprint'
    ]
  },
  {
    name: 'check_compliance_status',
    category: 'query',
    description: 'View permits, licenses, certifications and expiration status',
    parameters: {
      compliance_type: 'string (optional)',
      expiring_soon: 'boolean (optional)',
      status: 'string (optional)'
    },
    returns: 'Array of compliance records with expiration dates',
    examples: [
      'Show expiring permits',
      'Check license status',
      'List all certifications'
    ]
  },
  {
    name: 'get_work_orders',
    category: 'query',
    description: 'Track maintenance requests and their status',
    parameters: {
      status: 'string (pending|in_progress|completed)',
      priority: 'string (low|medium|high|urgent)',
      asset_id: 'string (optional)'
    },
    returns: 'Array of work orders with status and details',
    examples: [
      'Show pending work orders',
      'Find urgent maintenance requests',
      'Get work orders for specific asset'
    ]
  },
  {
    name: 'create_work_order',
    category: 'create',
    description: 'Create a new maintenance work order',
    parameters: {
      asset_id: 'string',
      description: 'string',
      priority: 'string (low|medium|high|urgent)',
      vendor_id: 'string (optional)',
      scheduled_date: 'string (optional)'
    },
    returns: 'Created work order object with ID',
    examples: [
      'Create work order for HVAC repair',
      'Schedule preventive maintenance',
      'Request vendor service'
    ]
  },
  {
    name: 'search_knowledge_base',
    category: 'query',
    description: 'Search technical documentation and knowledge base',
    parameters: {
      query: 'string',
      category: 'string (optional)',
      limit: 'number (optional, default: 5)'
    },
    returns: 'Array of relevant documents',
    examples: [
      'Find HVAC troubleshooting guide',
      'Search for vendor manual',
      'Get policy documents'
    ]
  },
  {
    name: 'analyze_financial_data',
    category: 'analyze',
    description: 'Analyze budgets, expenses, and financial performance',
    parameters: {
      analysis_type: 'string (budget_vs_actual|trends|forecast)',
      category: 'string (optional)',
      timeframe: 'string'
    },
    returns: 'Financial analysis object with insights',
    examples: [
      'Compare budget to actual spending',
      'Analyze expense trends',
      'Generate financial forecast'
    ]
  },
  {
    name: 'get_iot_sensor_data',
    category: 'query',
    description: 'Retrieve real-time IoT sensor readings',
    parameters: {
      sensor_type: 'string',
      location: 'string (optional)',
      timeframe: 'string (optional)'
    },
    returns: 'Sensor data with timestamps and values',
    examples: [
      'Get current temperature readings',
      'Monitor energy consumption',
      'Check occupancy levels'
    ]
  },
  {
    name: 'send_notification',
    category: 'notify',
    description: 'Send announcement or notification to tenants',
    parameters: {
      message: 'string',
      recipients: 'string[] (optional, defaults to all tenants)',
      priority: 'string (low|medium|high)',
      channel: 'string (email|sms|app)'
    },
    returns: 'Notification object with delivery status',
    examples: [
      'Send maintenance notice',
      'Notify about expiring permits',
      'Alert about energy usage'
    ]
  },
  {
    name: 'schedule_maintenance',
    category: 'schedule',
    description: 'Schedule recurring or one-time maintenance',
    parameters: {
      asset_id: 'string',
      maintenance_type: 'string',
      frequency: 'string (one-time|daily|weekly|monthly|yearly)',
      start_date: 'string',
      vendor_id: 'string (optional)'
    },
    returns: 'Scheduled maintenance object',
    examples: [
      'Schedule annual HVAC inspection',
      'Set up monthly filter replacement',
      'Plan quarterly safety check'
    ]
  }
];

// =====================================================
// AGENTS GROUNDING
// =====================================================

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, string>;
  }>;
  memoryType: string;
  memoryRetention: number;
  schedule?: {
    frequency: string;
    triggers: string[];
  };
  useCases: string[];
}

export const AVAILABLE_AGENTS: AgentInfo[] = [
  // CTO - Chief Technology Officer
  {
    id: 'infra-scout',
    name: 'InfraScout',
    role: 'CTO',
    description: 'Monitors infrastructure health, performance, and deployment status',
    capabilities: [
      'System health monitoring',
      'Performance analysis',
      'Deployment verification',
      'Error detection and alerting',
      'Resource optimization'
    ],
    tools: [
      {
        name: 'check_system_health',
        description: 'Check overall system health status',
        parameters: { services: 'string[]' }
      },
      {
        name: 'analyze_performance',
        description: 'Analyze system performance metrics',
        parameters: { timeframe: 'string', metrics: 'string[]' }
      }
    ],
    memoryType: 'redis',
    memoryRetention: 30,
    schedule: {
      frequency: 'hourly',
      triggers: ['system_alert', 'deployment_complete']
    },
    useCases: [
      'Infrastructure health monitoring',
      'Performance bottleneck detection',
      'Deployment verification',
      'Resource optimization recommendations'
    ]
  },
  {
    id: 'runtime-guardian',
    name: 'RuntimeGuardian',
    role: 'CTO',
    description: 'Ensures runtime stability and handles automatic recovery',
    capabilities: [
      'Runtime error detection',
      'Automatic recovery procedures',
      'Service restart coordination',
      'Dependency health checks',
      'Circuit breaker management'
    ],
    tools: [
      {
        name: 'restart_service',
        description: 'Restart a failed service',
        parameters: { service: 'string', reason: 'string' }
      },
      {
        name: 'trigger_failover',
        description: 'Trigger failover to backup systems',
        parameters: { primary: 'string', backup: 'string' }
      }
    ],
    memoryType: 'redis',
    memoryRetention: 7,
    schedule: {
      frequency: 'on-demand',
      triggers: ['service_failure', 'high_error_rate']
    },
    useCases: [
      'Runtime failure detection',
      'Automatic service recovery',
      'Failover coordination',
      'Circuit breaker management'
    ]
  },
  // CPO - Chief Product Officer
  {
    id: 'flow-mapper',
    name: 'FlowMapper',
    role: 'CPO',
    description: 'Maps and optimizes user flows and product experiences',
    capabilities: [
      'User journey analysis',
      'Conversion funnel optimization',
      'A/B test design',
      'Feature usage tracking',
      'UX improvement recommendations'
    ],
    tools: [
      {
        name: 'analyze_user_flow',
        description: 'Analyze user flow through the platform',
        parameters: { flow: 'string', timeframe: 'string' }
      },
      {
        name: 'design_ab_test',
        description: 'Design A/B test for feature optimization',
        parameters: { feature: 'string', hypothesis: 'string' }
      }
    ],
    memoryType: 'vector',
    memoryRetention: 90,
    schedule: {
      frequency: 'daily',
      triggers: ['user_session_complete', 'conversion_anomaly']
    },
    useCases: [
      'User journey optimization',
      'Conversion funnel analysis',
      'A/B test design',
      'UX improvement recommendations'
    ]
  },
  {
    id: 'agent-trainer',
    name: 'AgentTrainer',
    role: 'CPO',
    description: 'Trains and optimizes AI agents based on user interactions',
    capabilities: [
      'Agent performance analysis',
      'Training data curation',
      'Model fine-tuning recommendations',
      'User feedback integration',
      'Agent UX optimization'
    ],
    tools: [
      {
        name: 'analyze_agent_performance',
        description: 'Analyze AI agent performance metrics',
        parameters: { agent_id: 'string', metrics: 'string[]' }
      },
      {
        name: 'curate_training_data',
        description: 'Curate training data from interactions',
        parameters: { criteria: 'object' }
      }
    ],
    memoryType: 'vector',
    memoryRetention: 180,
    schedule: {
      frequency: 'weekly',
      triggers: ['agent_feedback_received', 'performance_threshold']
    },
    useCases: [
      'Agent performance analysis',
      'Training data curation',
      'Model fine-tuning recommendations',
      'Agent UX optimization'
    ]
  },
  // CRO - Chief Reality Officer
  {
    id: 'reality-checker',
    name: 'RealityChecker',
    role: 'CRO',
    description: 'Validates system claims against actual performance and user reality',
    capabilities: [
      'Truth verification',
      'Performance reality checks',
      'User expectation validation',
      'System claim auditing',
      'Reality gap identification'
    ],
    tools: [
      {
        name: 'verify_system_claims',
        description: 'Verify system performance claims against reality',
        parameters: { claims: 'string[]', evidence: 'object' }
      },
      {
        name: 'audit_user_experience',
        description: 'Audit actual user experience vs expected',
        parameters: { feature: 'string', timeframe: 'string' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 365,
    schedule: {
      frequency: 'daily',
      triggers: ['new_feature_launch', 'performance_report']
    },
    useCases: [
      'System claim verification',
      'Performance reality checks',
      'User experience auditing',
      'Reality gap identification'
    ]
  },
  {
    id: 'plan-aligner',
    name: 'PlanAligner',
    role: 'CRO',
    description: 'Ensures roadmap and execution align with reality and user needs',
    capabilities: [
      'Roadmap reality checking',
      'Resource allocation validation',
      'Timeline feasibility analysis',
      'Scope creep detection',
      'Priority alignment verification'
    ],
    tools: [
      {
        name: 'validate_roadmap',
        description: 'Validate roadmap against available resources',
        parameters: { roadmap: 'object', resources: 'object' }
      },
      {
        name: 'detect_scope_creep',
        description: 'Detect scope creep in ongoing projects',
        parameters: { project_id: 'string' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 365,
    schedule: {
      frequency: 'weekly',
      triggers: ['roadmap_update', 'project_milestone']
    },
    useCases: [
      'Roadmap validation',
      'Resource allocation checking',
      'Timeline feasibility analysis',
      'Scope creep detection'
    ]
  },
  // CMO - Chief Marketing Officer
  {
    id: 'campaign-seeder',
    name: 'CampaignSeeder',
    role: 'CMO',
    description: 'Generates and optimizes marketing campaigns based on user data',
    capabilities: [
      'Campaign ideation',
      'Audience segmentation',
      'Content optimization',
      'Channel selection',
      'Performance prediction'
    ],
    tools: [
      {
        name: 'generate_campaign',
        description: 'Generate campaign ideas for specific goals',
        parameters: { goal: 'string', audience: 'object', budget: 'number' }
      },
      {
        name: 'optimize_content',
        description: 'Optimize campaign content for engagement',
        parameters: { content: 'string', channel: 'string' }
      }
    ],
    memoryType: 'vector',
    memoryRetention: 180,
    schedule: {
      frequency: 'weekly',
      triggers: ['campaign_request', 'performance_review']
    },
    useCases: [
      'Campaign ideation',
      'Audience segmentation',
      'Content optimization',
      'Performance prediction'
    ]
  },
  {
    id: 'market-sniper',
    name: 'MarketSniper',
    role: 'CMO',
    description: 'Identifies high-value market opportunities with precision targeting',
    capabilities: [
      'Market opportunity identification',
      'Competitive analysis',
      'Trend detection',
      'Customer acquisition optimization',
      'ROI maximization'
    ],
    tools: [
      {
        name: 'identify_opportunities',
        description: 'Identify market opportunities',
        parameters: { market: 'string', criteria: 'object' }
      },
      {
        name: 'analyze_competition',
        description: 'Analyze competitive landscape',
        parameters: { competitors: 'string[]', dimensions: 'string[]' }
      }
    ],
    memoryType: 'vector',
    memoryRetention: 365,
    schedule: {
      frequency: 'weekly',
      triggers: ['market_data_update', 'competitor_analysis']
    },
    useCases: [
      'Market opportunity identification',
      'Competitive analysis',
      'Trend detection',
      'ROI maximization'
    ]
  },
  // CFO - Chief Financial Officer
  {
    id: 'forecast-engine',
    name: 'ForecastEngine',
    role: 'CFO',
    description: 'Predicts revenue, costs, and financial performance',
    capabilities: [
      'Revenue forecasting',
      'Cost prediction',
      'Cash flow modeling',
      'Financial scenario analysis',
      'Risk assessment'
    ],
    tools: [
      {
        name: 'forecast_revenue',
        description: 'Forecast revenue based on current trends',
        parameters: { timeframe: 'string', scenarios: 'string[]' }
      },
      {
        name: 'analyze_costs',
        description: 'Analyze cost structure and predictions',
        parameters: { categories: 'string[]', timeframe: 'string' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 2555,
    schedule: {
      frequency: 'weekly',
      triggers: ['revenue_data_update', 'month_end']
    },
    useCases: [
      'Revenue forecasting',
      'Cost prediction',
      'Cash flow modeling',
      'Financial scenario analysis'
    ]
  },
  {
    id: 'fee-auditor',
    name: 'FeeAuditor',
    role: 'CFO',
    description: 'Audits and optimizes Lightning Network fees and routing costs',
    capabilities: [
      'Fee analysis and optimization',
      'Routing cost assessment',
      'Channel economics evaluation',
      'Revenue per transaction tracking',
      'Cost-benefit analysis'
    ],
    tools: [
      {
        name: 'analyze_fees',
        description: 'Analyze Lightning Network fee performance',
        parameters: { timeframe: 'string', channels: 'string[]' }
      },
      {
        name: 'optimize_routing',
        description: 'Optimize routing for cost efficiency',
        parameters: { routes: 'object[]' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 365,
    schedule: {
      frequency: 'daily',
      triggers: ['fee_change', 'routing_update']
    },
    useCases: [
      'Fee analysis and optimization',
      'Routing cost assessment',
      'Channel economics evaluation',
      'Cost-benefit analysis'
    ]
  },
  // CNO - Chief Node Officer
  {
    id: 'node-health-bot',
    name: 'NodeHealthBot',
    role: 'CNO',
    description: 'Monitors Lightning node health and performance',
    capabilities: [
      'Node health monitoring',
      'Channel balance tracking',
      'Liquidity management',
      'Routing performance analysis',
      'Network connectivity checks'
    ],
    tools: [
      {
        name: 'check_node_health',
        description: 'Check Lightning node health status',
        parameters: { node_id: 'string' }
      },
      {
        name: 'analyze_liquidity',
        description: 'Analyze channel liquidity distribution',
        parameters: { channels: 'string[]' }
      }
    ],
    memoryType: 'redis',
    memoryRetention: 30,
    schedule: {
      frequency: 'hourly',
      triggers: ['node_alert', 'channel_event']
    },
    useCases: [
      'Node health monitoring',
      'Channel balance tracking',
      'Liquidity management',
      'Routing performance analysis'
    ]
  },
  {
    id: 'channel-logic',
    name: 'ChannelLogic',
    role: 'CNO',
    description: 'Optimizes Lightning channel management and routing strategies',
    capabilities: [
      'Channel optimization',
      'Routing strategy development',
      'Liquidity rebalancing',
      'Fee optimization',
      'Network topology analysis'
    ],
    tools: [
      {
        name: 'optimize_channels',
        description: 'Optimize channel configurations',
        parameters: { channels: 'object[]', goals: 'string[]' }
      },
      {
        name: 'rebalance_liquidity',
        description: 'Rebalance liquidity across channels',
        parameters: { strategy: 'string' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 90,
    schedule: {
      frequency: 'daily',
      triggers: ['liquidity_imbalance', 'routing_failure']
    },
    useCases: [
      'Channel optimization',
      'Routing strategy development',
      'Liquidity rebalancing',
      'Fee optimization'
    ]
  },
  // CCO - Chief Compliance Officer
  {
    id: 'rls-enforcer',
    name: 'RLSEnforcer',
    role: 'CCO',
    description: 'Ensures Row Level Security and data access compliance',
    capabilities: [
      'RLS policy enforcement',
      'Access control auditing',
      'Data privacy compliance',
      'Security violation detection',
      'Compliance reporting'
    ],
    tools: [
      {
        name: 'audit_rls_policies',
        description: 'Audit RLS policy effectiveness',
        parameters: { tables: 'string[]' }
      },
      {
        name: 'detect_violations',
        description: 'Detect security or compliance violations',
        parameters: { timeframe: 'string' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 2555,
    schedule: {
      frequency: 'daily',
      triggers: ['access_anomaly', 'policy_change']
    },
    useCases: [
      'RLS policy enforcement',
      'Access control auditing',
      'Security violation detection',
      'Compliance reporting'
    ]
  },
  {
    id: 'audit-trail-bot',
    name: 'AuditTrailBot',
    role: 'CCO',
    description: 'Maintains comprehensive audit trails and compliance documentation',
    capabilities: [
      'Audit trail maintenance',
      'Compliance documentation',
      'Regulatory reporting',
      'Data retention management',
      'Evidence preservation'
    ],
    tools: [
      {
        name: 'generate_audit_report',
        description: 'Generate comprehensive audit report',
        parameters: { scope: 'string', timeframe: 'string' }
      },
      {
        name: 'check_compliance',
        description: 'Check compliance status',
        parameters: { regulations: 'string[]' }
      }
    ],
    memoryType: 'sql',
    memoryRetention: 2555,
    schedule: {
      frequency: 'daily',
      triggers: ['compliance_deadline', 'audit_request']
    },
    useCases: [
      'Audit trail maintenance',
      'Compliance documentation',
      'Regulatory reporting',
      'Evidence preservation'
    ]
  },
  // CIO - Chief Intelligence Officer
  {
    id: 'rag-debugger',
    name: 'RAGDebugger',
    role: 'CIO',
    description: 'Debugs and optimizes RAG (Retrieval Augmented Generation) systems',
    capabilities: [
      'RAG performance analysis',
      'Vector search optimization',
      'Embedding quality assessment',
      'Context relevance evaluation',
      'Knowledge base curation'
    ],
    tools: [
      {
        name: 'analyze_rag_performance',
        description: 'Analyze RAG system performance metrics',
        parameters: { system: 'string', metrics: 'string[]' }
      },
      {
        name: 'optimize_retrieval',
        description: 'Optimize document retrieval accuracy',
        parameters: { query_type: 'string', threshold: 'number' }
      }
    ],
    memoryType: 'vector',
    memoryRetention: 180,
    schedule: {
      frequency: 'weekly',
      triggers: ['rag_query_failure', 'accuracy_drop']
    },
    useCases: [
      'RAG performance analysis',
      'Vector search optimization',
      'Embedding quality assessment',
      'Knowledge base curation'
    ]
  },
  {
    id: 'learning-vector',
    name: 'LearningVector',
    role: 'CIO',
    description: 'Manages AI learning and knowledge vector optimization',
    capabilities: [
      'Knowledge graph optimization',
      'Learning pattern analysis',
      'Vector space optimization',
      'Knowledge extraction',
      'AI model improvement'
    ],
    tools: [
      {
        name: 'optimize_vectors',
        description: 'Optimize vector embeddings and organization',
        parameters: { namespace: 'string', strategy: 'string' }
      },
      {
        name: 'extract_insights',
        description: 'Extract learning insights from data',
        parameters: { data_source: 'string', analysis_type: 'string' }
      }
    ],
    memoryType: 'vector',
    memoryRetention: 365,
    schedule: {
      frequency: 'weekly',
      triggers: ['knowledge_update', 'learning_milestone']
    },
    useCases: [
      'Knowledge graph optimization',
      'Learning pattern analysis',
      'Vector space optimization',
      'AI model improvement'
    ]
  }
];

// =====================================================
// PROMPTS GROUNDING
// =====================================================

export interface PromptTemplate {
  name: string;
  type: 'system' | 'user' | 'agent';
  description: string;
  template: string;
  variables: string[];
  useCases: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    name: 'Asset Management System Prompt',
    type: 'system',
    description: 'Comprehensive system prompt for asset management AI assistant',
    template: getAssetManagementPrompt('{{businessName}}'),
    variables: ['businessName'],
    useCases: [
      'Asset management chatbot',
      'Maintenance scheduling assistant',
      'Sustainability monitoring agent'
    ]
  },
  {
    name: 'Enhanced System Message',
    type: 'system',
    description: 'Standard system message for enhanced chatbot capabilities',
    template: getSystemMessageEnhanced(),
    variables: [],
    useCases: [
      'General purpose AI assistant',
      'Knowledge base chatbot',
      'Multi-capability agent'
    ]
  },
  {
    name: 'Agent Registry System Prompt',
    type: 'system',
    description: 'Dynamic system prompt from agent registry based on agent role',
    template: '{{agent.systemPrompt}}',
    variables: ['agent'],
    useCases: [
      'C-Suite AI agents',
      'Role-specific assistants',
      'Specialized task agents'
    ]
  },
  {
    name: 'RAG Context Injection',
    type: 'user',
    description: 'Template for injecting RAG context into user prompts',
    template: `Context from knowledge base:
{{context}}

User question: {{userQuestion}}`,
    variables: ['context', 'userQuestion'],
    useCases: [
      'RAG-enhanced queries',
      'Knowledge-grounded responses',
      'Context-aware conversations'
    ]
  },
  {
    name: 'Multi-Tenant Context',
    type: 'system',
    description: 'System prompt with tenant context for multi-tenant systems',
    template: `You are an assistant for {{businessName}}.

Tenant Context:
- Business: {{businessName}}
- User: {{userEmail}}
- Tenant ID: {{tenantId}}

{{additionalContext}}

All queries are automatically filtered to show only data for {{businessName}}.`,
    variables: ['businessName', 'userEmail', 'tenantId', 'additionalContext'],
    useCases: [
      'Multi-tenant SaaS assistants',
      'Tenant-specific agents',
      'Isolated data access'
    ]
  }
];

// =====================================================
// GROUNDING CONTEXT GENERATOR
// =====================================================

export interface GroundingContext {
  memory: {
    systems: MemorySystem[];
    recommendations: string;
  };
  assets: {
    sources: AssetSource[];
    recommendations: string;
  };
  actions: {
    available: Action[];
    recommendations: string;
  };
  agents: {
    available: AgentInfo[];
    recommendations: string;
  };
  prompts: {
    templates: PromptTemplate[];
    recommendations: string;
  };
}

/**
 * Generate comprehensive grounding context for LLM models
 */
export function generateGroundingContext(options?: {
  includeMemory?: boolean;
  includeAssets?: boolean;
  includeActions?: boolean;
  includeAgents?: boolean;
  includePrompts?: boolean;
  agentId?: string;
  businessName?: string;
  agentRegistry?: AgentRegistry; // Optional agent registry override
}): GroundingContext {
  const {
    includeMemory = true,
    includeAssets = true,
    includeActions = true,
    includeAgents = true,
    includePrompts = true,
    agentId,
    businessName,
    agentRegistry
  } = options || {};
  
  // Use provided registry or fall back to registered one
  const registryToUse = agentRegistry || externalAgentRegistry;

  const context: GroundingContext = {
    memory: {
      systems: includeMemory ? MEMORY_SYSTEMS : [],
      recommendations: includeMemory
        ? `Available memory systems: ${MEMORY_SYSTEMS.map(m => m.type).join(', ')}. ` +
          `Use short-term memory for conversation context, long-term/RAG for persistent knowledge, ` +
          `SQL for structured business data, Redis for caching.`
        : ''
    },
    assets: {
      sources: includeAssets ? ASSET_SOURCES : [],
      recommendations: includeAssets
        ? `Available data sources: ${ASSET_SOURCES.map(a => a.name).join(', ')}. ` +
          `Query these sources to provide accurate, data-driven responses. ` +
          `All queries are automatically filtered by tenant context when applicable.`
        : ''
    },
    actions: {
      available: includeActions ? AVAILABLE_ACTIONS : [],
      recommendations: includeActions
        ? `Available actions: ${AVAILABLE_ACTIONS.map(a => a.name).join(', ')}. ` +
          `Use these actions to query data, create records, analyze metrics, and perform operations. ` +
          `Always use appropriate actions before making claims about data.`
        : ''
    },
    agents: {
      available: includeAgents ? getAllActiveAgents(registryToUse).map(config => ({
        id: config.id,
        name: config.name,
        role: config.role || 'Unknown',
        description: config.description || '',
        capabilities: config.capabilities || [],
        tools: config.tools || [],
        memoryType: config.memory?.type || 'unknown',
        memoryRetention: config.memory?.retention || 0,
        useCases: []
      })) : [],
      recommendations: includeAgents
        ? `Available agents: ${getAllActiveAgents(registryToUse).map(a => `${a.name} (${a.role || 'Unknown'})`).join(', ')}. ` +
          `Each agent has specific capabilities, tools, and memory configurations. ` +
          `Use agents for specialized tasks aligned with their C-Suite roles. ` +
          `Agents can be invoked by ID or role for task-specific assistance.`
        : ''
    },
    prompts: {
      templates: includePrompts ? PROMPT_TEMPLATES : [],
      recommendations: includePrompts
        ? `Available prompt templates: ${PROMPT_TEMPLATES.map(p => p.name).join(', ')}. ` +
          `Use system prompts to set agent behavior, user prompts for queries, ` +
          `and inject RAG context for knowledge-grounded responses.`
        : ''
    }
  };

  // Add agent-specific recommendations if agent provided
  if (agentId && includeAgents) {
    const agentConfig = getAgentConfig(agentId, registryToUse);
    if (agentConfig) {
      const role = agentConfig.role || 'Unknown';
      const description = agentConfig.description || 'No description available';
      const capabilities = agentConfig.capabilities?.join(', ') || 'No capabilities listed';
      const tools = agentConfig.tools?.map(t => t.name).join(', ') || 'No tools listed';
      const memoryType = agentConfig.memory?.type || 'unknown';
      const memoryRetention = agentConfig.memory?.retention || 0;
      
      context.agents.recommendations += `\n\nCurrent Agent: ${agentConfig.name} (${role}) - ${description}. ` +
        `Capabilities: ${capabilities}. ` +
        `Tools: ${tools}. ` +
        `Memory: ${memoryType} with ${memoryRetention} day retention.`;
      
      // Add system prompt if available from external registry
      if (agentConfig.systemPrompt) {
        context.agents.recommendations += `\n\nAgent System Prompt: ${agentConfig.systemPrompt}`;
      }
    }
  }

  if (businessName) {
    context.prompts.recommendations += `\n\nBusiness Context: ${businessName} - Use business-specific prompts and maintain tenant isolation.`;
  }

  return context;
}

export interface GroundingOptions {
  basePrompt?: string;
  agentId?: string;
  businessName?: string;
  includeMemory?: boolean;
  includeAssets?: boolean;
  includeActions?: boolean;
  includeAgents?: boolean;
  includePrompts?: boolean;
}

/**
 * Generate a formatted system prompt with grounding context
 */
export function generateGroundedSystemPrompt(options?: GroundingOptions): string {
  const {
    basePrompt = '',
    agentId,
    businessName,
    includeMemory = true,
    includeAssets = true,
    includeActions = true,
    includeAgents = true,
    includePrompts = true
  } = options || {};

  const grounding = generateGroundingContext({
    includeMemory,
    includeAssets,
    includeActions,
    includePrompts,
    agentId,
    businessName
  });

  let prompt = basePrompt;

  if (includeMemory && grounding.memory.systems.length > 0) {
    prompt += `\n\n## MEMORY SYSTEMS\n${grounding.memory.recommendations}\n\nAvailable Memory Types:\n`;
    grounding.memory.systems.forEach(mem => {
      prompt += `- **${mem.type}**: ${mem.description}. ${mem.usage}. Retention: ${mem.retention}.\n`;
    });
  }

  if (includeAssets && grounding.assets.sources.length > 0) {
    prompt += `\n\n## DATA SOURCES & ASSETS\n${grounding.assets.recommendations}\n\nAvailable Data Sources:\n`;
    grounding.assets.sources.forEach(asset => {
      prompt += `- **${asset.name}** (${asset.type}): ${asset.description}. ` +
        `Data types: ${asset.dataTypes.join(', ')}. ` +
        `Access: ${asset.accessMethod}.\n`;
    });
  }

  if (includeActions && grounding.actions.available.length > 0) {
    prompt += `\n\n## AVAILABLE ACTIONS\n${grounding.actions.recommendations}\n\nAvailable Actions:\n`;
    grounding.actions.available.forEach(action => {
      prompt += `- **${action.name}** (${action.category}): ${action.description}. ` +
        `Returns: ${action.returns}.\n`;
    });
  }

  if (includeAgents && grounding.agents.available.length > 0) {
    prompt += `\n\n## AVAILABLE AGENTS\n${grounding.agents.recommendations}\n\nAvailable Agents:\n`;
    grounding.agents.available.forEach(agent => {
      prompt += `- **${agent.name}** (${agent.role}): ${agent.description}. ` +
        `Capabilities: ${agent.capabilities.join(', ')}. ` +
        `Tools: ${agent.tools.map(t => t.name).join(', ')}. ` +
        `Memory: ${agent.memoryType} (${agent.memoryRetention} days).\n`;
    });
  }

  if (includePrompts && grounding.prompts.templates.length > 0) {
    prompt += `\n\n## PROMPT TEMPLATES\n${grounding.prompts.recommendations}\n\nAvailable Templates:\n`;
    grounding.prompts.templates.forEach(template => {
      prompt += `- **${template.name}** (${template.type}): ${template.description}. ` +
        `Variables: ${template.variables.join(', ')}.\n`;
    });
  }

  return prompt;
}

/**
 * Get memory system information for a specific type
 */
export function getMemorySystem(type: MemorySystem['type']): MemorySystem | undefined {
  return MEMORY_SYSTEMS.find(m => m.type === type);
}

/**
 * Get asset source information by name
 */
export function getAssetSource(name: string): AssetSource | undefined {
  return ASSET_SOURCES.find(a => a.name === name);
}

/**
 * Get action information by name
 */
export function getAction(name: string): Action | undefined {
  return AVAILABLE_ACTIONS.find(a => a.name === name);
}

/**
 * Get prompt template by name
 */
export function getPromptTemplate(name: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(p => p.name === name);
}

/**
 * Get agent information by ID
 * Uses external registry if available, otherwise falls back to built-in agents
 */
export function getAgentInfo(agentId: string): AgentInfo | undefined {
  const config = getAgentConfig(agentId);
  if (!config) return undefined;
  
  // Convert AgentConfig to AgentInfo format
  return {
    id: config.id,
    name: config.name,
    role: config.role || 'Unknown',
    description: config.description || '',
    capabilities: config.capabilities || [],
    tools: config.tools?.map(t => ({
      name: t.name,
      description: t.description || '',
      parameters: t.parameters || {}
    })) || [],
    memoryType: config.memory?.type || 'unknown',
    memoryRetention: config.memory?.retention || 0,
    useCases: []
  };
}

/**
 * Get agents by role
 * Uses external registry if available, otherwise falls back to built-in agents
 */
export function getAgentsByRole(role: string): AgentInfo[] {
  const agents = getAllActiveAgents();
  return agents
    .filter(a => a.role === role)
    .map(config => ({
      id: config.id,
      name: config.name,
      role: config.role || 'Unknown',
      description: config.description || '',
      capabilities: config.capabilities || [],
      tools: config.tools?.map(t => ({
        name: t.name,
        description: t.description || '',
        parameters: t.parameters || {}
      })) || [],
      memoryType: config.memory?.type || 'unknown',
      memoryRetention: config.memory?.retention || 0,
      useCases: []
    }));
}

