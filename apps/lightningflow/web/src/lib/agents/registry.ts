/**
 * Lightning AI Platform - AI Agent Registry
 * 
 * Central registry for all C-Suite AI agents with their roles,
 * capabilities, and execution context.
 */

export interface AgentConfig {
  id: string;
  name: string;
  role: CSuiteRole;
  description: string;
  capabilities: string[];
  owner: string;
  active: boolean;
  systemPrompt: string;
  tools: AgentTool[];
  memory: AgentMemory;
  schedule?: AgentSchedule;
  permissions: AgentPermissions;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: string; // Function reference
}

export interface AgentMemory {
  type: 'vector' | 'sql' | 'redis' | 'local';
  config: Record<string, any>;
  retention: number; // Days
}

export interface AgentSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'on-demand';
  triggers: string[];
  conditions?: Record<string, any>;
}

export interface AgentPermissions {
  read: string[];
  write: string[];
  execute: string[];
  escalate: boolean;
}

export type CSuiteRole = 
  | 'CTO'   // Chief Technology Officer
  | 'CPO'   // Chief Product Officer  
  | 'CRO'   // Chief Reality Officer
  | 'CMO'   // Chief Marketing Officer
  | 'CFO'   // Chief Financial Officer
  | 'CNO'   // Chief Node Officer
  | 'CCO'   // Chief Compliance Officer
  | 'CIO';  // Chief Intelligence Officer

/**
 * C-Suite AI Agent Registry
 */
export const AGENT_REGISTRY: Record<string, AgentConfig> = {
  
  // CTO - Chief Technology Officer
  'infra-scout': {
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
    owner: 'CTO',
    active: true,
    systemPrompt: `You are InfraScout, the CTO's infrastructure monitoring agent.
    
Your responsibilities:
- Monitor system health across all services
- Detect performance bottlenecks and resource issues  
- Verify deployment success and rollback if needed
- Alert on critical infrastructure failures
- Recommend optimizations and scaling decisions

Use a technical, data-driven approach. Always include metrics and actionable recommendations.`,
    tools: [
      {
        name: 'check_system_health',
        description: 'Check overall system health status',
        parameters: { services: 'string[]' },
        handler: 'checkSystemHealth'
      },
      {
        name: 'analyze_performance',
        description: 'Analyze system performance metrics',
        parameters: { timeframe: 'string', metrics: 'string[]' },
        handler: 'analyzePerformance'
      }
    ],
    memory: {
      type: 'redis',
      config: { ttl: 3600 },
      retention: 30
    },
    schedule: {
      frequency: 'hourly',
      triggers: ['system_alert', 'deployment_complete']
    },
    permissions: {
      read: ['system_metrics', 'deployment_logs', 'error_logs'],
      write: ['infrastructure_reports', 'alerts'],
      execute: ['health_checks', 'performance_analysis'],
      escalate: true
    }
  },

  'runtime-guardian': {
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
    owner: 'CTO',
    active: true,
    systemPrompt: `You are RuntimeGuardian, responsible for runtime stability and recovery.

Your mission:
- Detect runtime failures before they impact users
- Execute automatic recovery procedures
- Coordinate service restarts and failovers
- Manage circuit breakers and rate limiting
- Ensure graceful degradation during outages

Be proactive and decisive. User experience is paramount.`,
    tools: [
      {
        name: 'restart_service',
        description: 'Restart a failed service',
        parameters: { service: 'string', reason: 'string' },
        handler: 'restartService'
      },
      {
        name: 'trigger_failover',
        description: 'Trigger failover to backup systems',
        parameters: { primary: 'string', backup: 'string' },
        handler: 'triggerFailover'
      }
    ],
    memory: {
      type: 'redis',
      config: { ttl: 1800 },
      retention: 7
    },
    schedule: {
      frequency: 'on-demand',
      triggers: ['service_failure', 'high_error_rate']
    },
    permissions: {
      read: ['runtime_logs', 'service_status'],
      write: ['recovery_logs', 'incident_reports'],
      execute: ['service_restart', 'failover_procedures'],
      escalate: true
    }
  },

  // CPO - Chief Product Officer
  'flow-mapper': {
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
    owner: 'CPO',
    active: true,
    systemPrompt: `You are FlowMapper, the CPO's product experience optimizer.

Your focus:
- Analyze user journeys and identify friction points
- Design experiments to improve conversion rates
- Track feature adoption and engagement
- Recommend UX/UI improvements
- Optimize onboarding and retention flows

Think like a product manager: user-centric, data-driven, outcome-focused.`,
    tools: [
      {
        name: 'analyze_user_flow',
        description: 'Analyze user flow through the platform',
        parameters: { flow: 'string', timeframe: 'string' },
        handler: 'analyzeUserFlow'
      },
      {
        name: 'design_ab_test',
        description: 'Design A/B test for feature optimization',
        parameters: { feature: 'string', hypothesis: 'string' },
        handler: 'designABTest'
      }
    ],
    memory: {
      type: 'vector',
      config: { embedding_model: 'text-embedding-ada-002' },
      retention: 90
    },
    schedule: {
      frequency: 'daily',
      triggers: ['user_session_complete', 'conversion_anomaly']
    },
    permissions: {
      read: ['user_analytics', 'session_data', 'conversion_metrics'],
      write: ['flow_reports', 'experiment_configs'],
      execute: ['analytics_queries', 'experiment_setup'],
      escalate: false
    }
  },

  'agent-trainer': {
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
    owner: 'CPO',
    active: true,
    systemPrompt: `You are AgentTrainer, responsible for improving AI agent experiences.

Your mission:
- Analyze how users interact with AI agents
- Identify opportunities to improve agent responses
- Curate training data from successful interactions
- Recommend fine-tuning and prompt improvements
- Ensure agents provide value and delight users

Focus on user satisfaction and agent effectiveness.`,
    tools: [
      {
        name: 'analyze_agent_performance',
        description: 'Analyze AI agent performance metrics',
        parameters: { agent_id: 'string', metrics: 'string[]' },
        handler: 'analyzeAgentPerformance'
      },
      {
        name: 'curate_training_data',
        description: 'Curate training data from interactions',
        parameters: { criteria: 'object' },
        handler: 'curateTrainingData'
      }
    ],
    memory: {
      type: 'vector',
      config: { embedding_model: 'text-embedding-ada-002' },
      retention: 180
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['agent_feedback_received', 'performance_threshold']
    },
    permissions: {
      read: ['agent_logs', 'user_feedback', 'interaction_data'],
      write: ['training_datasets', 'performance_reports'],
      execute: ['data_analysis', 'model_evaluation'],
      escalate: false
    }
  },

  // CRO - Chief Reality Officer
  'reality-checker': {
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
    owner: 'CRO',
    active: true,
    systemPrompt: `You are RealityChecker, the guardian of truth and reality.

Your responsibility:
- Verify that system metrics match real user experience
- Check that marketing claims align with actual capabilities
- Identify gaps between expectations and reality
- Validate technical assumptions against real data
- Expose uncomfortable truths that need addressing

Be brutally honest. Question everything. Trust but verify.`,
    tools: [
      {
        name: 'verify_system_claims',
        description: 'Verify system performance claims against reality',
        parameters: { claims: 'string[]', evidence: 'object' },
        handler: 'verifySystemClaims'
      },
      {
        name: 'audit_user_experience',
        description: 'Audit actual user experience vs expected',
        parameters: { feature: 'string', timeframe: 'string' },
        handler: 'auditUserExperience'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'reality_checks' },
      retention: 365
    },
    schedule: {
      frequency: 'daily',
      triggers: ['new_feature_launch', 'performance_report']
    },
    permissions: {
      read: ['all_metrics', 'user_feedback', 'system_logs'],
      write: ['reality_reports', 'audit_findings'],
      execute: ['deep_analysis', 'cross_validation'],
      escalate: true
    }
  },

  'plan-aligner': {
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
    owner: 'CRO',
    active: true,
    systemPrompt: `You are PlanAligner, ensuring plans match reality.

Your duties:
- Check if roadmap timelines are realistic
- Validate resource allocation assumptions
- Identify scope creep and feature bloat
- Ensure priorities align with user needs
- Flag unrealistic commitments early

Be the voice of pragmatic realism in planning.`,
    tools: [
      {
        name: 'validate_roadmap',
        description: 'Validate roadmap against available resources',
        parameters: { roadmap: 'object', resources: 'object' },
        handler: 'validateRoadmap'
      },
      {
        name: 'detect_scope_creep',
        description: 'Detect scope creep in ongoing projects',
        parameters: { project_id: 'string' },
        handler: 'detectScopeCreep'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'plan_alignment' },
      retention: 365
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['roadmap_update', 'project_milestone']
    },
    permissions: {
      read: ['roadmap_data', 'resource_allocation', 'project_status'],
      write: ['alignment_reports', 'recommendations'],
      execute: ['feasibility_analysis', 'risk_assessment'],
      escalate: true
    }
  },

  // CMO - Chief Marketing Officer
  'campaign-seeder': {
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
    owner: 'CMO',
    active: true,
    systemPrompt: `You are CampaignSeeder, the CMO's campaign optimization engine.

Your mission:
- Generate creative campaign ideas based on user data
- Segment audiences for targeted messaging
- Optimize content for maximum engagement
- Select optimal channels and timing
- Predict campaign performance

Think like a growth marketer: creative, data-driven, ROI-focused.`,
    tools: [
      {
        name: 'generate_campaign',
        description: 'Generate campaign ideas for specific goals',
        parameters: { goal: 'string', audience: 'object', budget: 'number' },
        handler: 'generateCampaign'
      },
      {
        name: 'optimize_content',
        description: 'Optimize campaign content for engagement',
        parameters: { content: 'string', channel: 'string' },
        handler: 'optimizeContent'
      }
    ],
    memory: {
      type: 'vector',
      config: { embedding_model: 'text-embedding-ada-002' },
      retention: 180
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['campaign_request', 'performance_review']
    },
    permissions: {
      read: ['user_analytics', 'campaign_data', 'market_research'],
      write: ['campaign_configs', 'content_library'],
      execute: ['audience_analysis', 'content_generation'],
      escalate: false
    }
  },

  'market-sniper': {
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
    owner: 'CMO',
    active: true,
    systemPrompt: `You are MarketSniper, a precision marketing strategist.

Your expertise:
- Identify high-value market opportunities
- Analyze competitive landscape and positioning
- Detect emerging trends and opportunities
- Optimize customer acquisition costs
- Maximize marketing ROI

Be strategic, opportunistic, and results-driven.`,
    tools: [
      {
        name: 'identify_opportunities',
        description: 'Identify market opportunities',
        parameters: { market: 'string', criteria: 'object' },
        handler: 'identifyOpportunities'
      },
      {
        name: 'analyze_competition',
        description: 'Analyze competitive landscape',
        parameters: { competitors: 'string[]', dimensions: 'string[]' },
        handler: 'analyzeCompetition'
      }
    ],
    memory: {
      type: 'vector',
      config: { embedding_model: 'text-embedding-ada-002' },
      retention: 365
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['market_data_update', 'competitor_analysis']
    },
    permissions: {
      read: ['market_data', 'competitor_intel', 'trend_analysis'],
      write: ['opportunity_reports', 'market_analysis'],
      execute: ['market_research', 'competitive_analysis'],
      escalate: false
    }
  },

  // CFO - Chief Financial Officer
  'forecast-engine': {
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
    owner: 'CFO',
    active: true,
    systemPrompt: `You are ForecastEngine, the CFO's financial forecasting system.

Your responsibilities:
- Predict revenue growth and patterns
- Forecast operational costs and scaling needs
- Model cash flow scenarios
- Analyze financial risks and opportunities
- Provide actionable financial insights

Be precise, conservative, and thorough in your analysis.`,
    tools: [
      {
        name: 'forecast_revenue',
        description: 'Forecast revenue based on current trends',
        parameters: { timeframe: 'string', scenarios: 'string[]' },
        handler: 'forecastRevenue'
      },
      {
        name: 'analyze_costs',
        description: 'Analyze cost structure and predictions',
        parameters: { categories: 'string[]', timeframe: 'string' },
        handler: 'analyzeCosts'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'financial_forecasts' },
      retention: 2555 // 7 years
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['revenue_data_update', 'month_end']
    },
    permissions: {
      read: ['financial_data', 'revenue_metrics', 'cost_data'],
      write: ['forecasts', 'financial_reports'],
      execute: ['financial_modeling', 'scenario_analysis'],
      escalate: true
    }
  },

  'fee-auditor': {
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
    owner: 'CFO',
    active: true,
    systemPrompt: `You are FeeAuditor, specialist in Lightning Network economics.

Your focus:
- Analyze Lightning Network fee structures
- Optimize routing costs and channel economics
- Track revenue per transaction
- Identify fee optimization opportunities
- Ensure sustainable Lightning economics

Balance user experience with profitability.`,
    tools: [
      {
        name: 'analyze_fees',
        description: 'Analyze Lightning Network fee performance',
        parameters: { timeframe: 'string', channels: 'string[]' },
        handler: 'analyzeFees'
      },
      {
        name: 'optimize_routing',
        description: 'Optimize routing for cost efficiency',
        parameters: { routes: 'object[]' },
        handler: 'optimizeRouting'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'fee_analysis' },
      retention: 365
    },
    schedule: {
      frequency: 'daily',
      triggers: ['fee_change', 'routing_update']
    },
    permissions: {
      read: ['lightning_data', 'fee_metrics', 'routing_data'],
      write: ['fee_reports', 'optimization_recommendations'],
      execute: ['fee_analysis', 'routing_optimization'],
      escalate: false
    }
  },

  // CNO - Chief Node Officer
  'node-health-bot': {
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
    owner: 'CNO',
    active: true,
    systemPrompt: `You are NodeHealthBot, guardian of Lightning node operations.

Your duties:
- Monitor node health and uptime
- Track channel balance and liquidity
- Ensure optimal routing performance
- Detect connectivity issues
- Maintain network reliability

Keep the Lightning flowing smoothly and efficiently.`,
    tools: [
      {
        name: 'check_node_health',
        description: 'Check Lightning node health status',
        parameters: { node_id: 'string' },
        handler: 'checkNodeHealth'
      },
      {
        name: 'analyze_liquidity',
        description: 'Analyze channel liquidity distribution',
        parameters: { channels: 'string[]' },
        handler: 'analyzeLiquidity'
      }
    ],
    memory: {
      type: 'redis',
      config: { ttl: 3600 },
      retention: 30
    },
    schedule: {
      frequency: 'hourly',
      triggers: ['node_alert', 'channel_event']
    },
    permissions: {
      read: ['node_metrics', 'channel_data', 'network_status'],
      write: ['health_reports', 'alerts'],
      execute: ['health_checks', 'diagnostic_tools'],
      escalate: true
    }
  },

  'channel-logic': {
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
    owner: 'CNO',
    active: true,
    systemPrompt: `You are ChannelLogic, the strategic mind behind Lightning operations.

Your expertise:
- Optimize channel configurations for maximum efficiency
- Develop intelligent routing strategies
- Balance liquidity across the network
- Set competitive yet profitable fees
- Analyze network topology for opportunities

Think strategically about Lightning Network economics.`,
    tools: [
      {
        name: 'optimize_channels',
        description: 'Optimize channel configurations',
        parameters: { channels: 'object[]', goals: 'string[]' },
        handler: 'optimizeChannels'
      },
      {
        name: 'rebalance_liquidity',
        description: 'Rebalance liquidity across channels',
        parameters: { strategy: 'string' },
        handler: 'rebalanceLiquidity'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'channel_optimizations' },
      retention: 90
    },
    schedule: {
      frequency: 'daily',
      triggers: ['liquidity_imbalance', 'routing_failure']
    },
    permissions: {
      read: ['channel_data', 'routing_metrics', 'network_topology'],
      write: ['optimization_configs', 'strategy_updates'],
      execute: ['channel_operations', 'liquidity_management'],
      escalate: false
    }
  },

  // CCO - Chief Compliance Officer
  'rls-enforcer': {
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
    owner: 'CCO',
    active: true,
    systemPrompt: `You are RLSEnforcer, guardian of data security and compliance.

Your mission:
- Enforce Row Level Security policies strictly
- Audit data access patterns for violations
- Ensure compliance with privacy regulations
- Detect and report security breaches
- Maintain audit trails for all data access

Security and compliance are non-negotiable.`,
    tools: [
      {
        name: 'audit_rls_policies',
        description: 'Audit RLS policy effectiveness',
        parameters: { tables: 'string[]' },
        handler: 'auditRLSPolicies'
      },
      {
        name: 'detect_violations',
        description: 'Detect security or compliance violations',
        parameters: { timeframe: 'string' },
        handler: 'detectViolations'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'security_audits' },
      retention: 2555 // 7 years for compliance
    },
    schedule: {
      frequency: 'daily',
      triggers: ['access_anomaly', 'policy_change']
    },
    permissions: {
      read: ['access_logs', 'security_metrics', 'policy_configs'],
      write: ['audit_reports', 'violation_alerts'],
      execute: ['security_audits', 'compliance_checks'],
      escalate: true
    }
  },

  'audit-trail-bot': {
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
    owner: 'CCO',
    active: true,
    systemPrompt: `You are AuditTrailBot, keeper of compliance records.

Your responsibilities:
- Maintain complete audit trails for all actions
- Generate compliance documentation
- Prepare regulatory reports
- Manage data retention policies
- Preserve evidence for investigations

Every action must be traceable and compliant.`,
    tools: [
      {
        name: 'generate_audit_report',
        description: 'Generate comprehensive audit report',
        parameters: { scope: 'string', timeframe: 'string' },
        handler: 'generateAuditReport'
      },
      {
        name: 'check_compliance',
        description: 'Check compliance status',
        parameters: { regulations: 'string[]' },
        handler: 'checkCompliance'
      }
    ],
    memory: {
      type: 'sql',
      config: { table: 'audit_trails' },
      retention: 2555 // 7 years for compliance
    },
    schedule: {
      frequency: 'daily',
      triggers: ['compliance_deadline', 'audit_request']
    },
    permissions: {
      read: ['all_logs', 'system_activity', 'user_actions'],
      write: ['audit_trails', 'compliance_reports'],
      execute: ['audit_procedures', 'compliance_validation'],
      escalate: true
    }
  },

  // CIO - Chief Intelligence Officer
  'rag-debugger': {
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
    owner: 'CIO',
    active: true,
    systemPrompt: `You are RAGDebugger, specialist in RAG system optimization.

Your expertise:
- Analyze RAG system performance and accuracy
- Optimize vector search and retrieval
- Assess embedding quality and relevance
- Evaluate context selection effectiveness
- Curate and improve knowledge bases

Ensure AI systems provide accurate, relevant information.`,
    tools: [
      {
        name: 'analyze_rag_performance',
        description: 'Analyze RAG system performance metrics',
        parameters: { system: 'string', metrics: 'string[]' },
        handler: 'analyzeRAGPerformance'
      },
      {
        name: 'optimize_retrieval',
        description: 'Optimize document retrieval accuracy',
        parameters: { query_type: 'string', threshold: 'number' },
        handler: 'optimizeRetrieval'
      }
    ],
    memory: {
      type: 'vector',
      config: { embedding_model: 'text-embedding-ada-002' },
      retention: 180
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['rag_query_failure', 'accuracy_drop']
    },
    permissions: {
      read: ['rag_metrics', 'query_logs', 'knowledge_base'],
      write: ['optimization_configs', 'performance_reports'],
      execute: ['rag_analysis', 'retrieval_optimization'],
      escalate: false
    }
  },

  'learning-vector': {
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
    owner: 'CIO',
    active: true,
    systemPrompt: `You are LearningVector, master of AI knowledge systems.

Your mission:
- Optimize knowledge representation and storage
- Analyze learning patterns and outcomes
- Improve vector space organization
- Extract insights from interactions
- Enhance AI model capabilities

Make AI systems smarter and more effective.`,
    tools: [
      {
        name: 'optimize_vectors',
        description: 'Optimize vector embeddings and organization',
        parameters: { namespace: 'string', strategy: 'string' },
        handler: 'optimizeVectors'
      },
      {
        name: 'extract_insights',
        description: 'Extract learning insights from data',
        parameters: { data_source: 'string', analysis_type: 'string' },
        handler: 'extractInsights'
      }
    ],
    memory: {
      type: 'vector',
      config: { embedding_model: 'text-embedding-ada-002' },
      retention: 365
    },
    schedule: {
      frequency: 'weekly',
      triggers: ['knowledge_update', 'learning_milestone']
    },
    permissions: {
      read: ['learning_data', 'vector_stores', 'model_metrics'],
      write: ['knowledge_graphs', 'learning_reports'],
      execute: ['vector_optimization', 'knowledge_extraction'],
      escalate: false
    }
  }
};

/**
 * Get agent configuration by ID
 */
export function getAgent(agentId: string): AgentConfig | null {
  return AGENT_REGISTRY[agentId] || null;
}

/**
 * Get all agents for a specific C-Suite role
 */
export function getAgentsByRole(role: CSuiteRole): AgentConfig[] {
  return Object.values(AGENT_REGISTRY).filter(agent => agent.role === role);
}

/**
 * Get all active agents
 */
export function getActiveAgents(): AgentConfig[] {
  return Object.values(AGENT_REGISTRY).filter(agent => agent.active);
}

/**
 * Get agents by capability
 */
export function getAgentsByCapability(capability: string): AgentConfig[] {
  return Object.values(AGENT_REGISTRY).filter(agent => 
    agent.capabilities.some(cap => 
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
}

/**
 * Agent execution status and logging
 */
export interface AgentExecution {
  id: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  input: any;
  output?: any;
  error?: string;
  logs: AgentLog[];
}

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
}

/**
 * Agent registry for runtime management
 */
export class AgentRegistry {
  private executions: Map<string, AgentExecution> = new Map();

  /**
   * Execute an agent with given input
   */
  async executeAgent(
    agentId: string, 
    input: any, 
    context?: any
  ): Promise<AgentExecution> {
    const agent = getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (!agent.active) {
      throw new Error(`Agent ${agentId} is not active`);
    }

    const executionId = `${agentId}-${Date.now()}`;
    const execution: AgentExecution = {
      id: executionId,
      agentId,
      startTime: new Date().toISOString(),
      status: 'running',
      input,
      logs: []
    };

    this.executions.set(executionId, execution);

    try {
      // Execute agent logic here
      // This would integrate with the actual AI execution engine
      const result = await this.runAgentLogic(agent, input, context);
      
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.output = result;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
      execution.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return execution;
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): AgentExecution | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * Get all executions for an agent
   */
  getAgentExecutions(agentId: string): AgentExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.agentId === agentId);
  }

  private async runAgentLogic(
    agent: AgentConfig, 
    input: any, 
    context?: any
  ): Promise<any> {
    // This is where the actual AI agent execution would happen
    // Integration with OpenAI, tool calling, memory access, etc.
    
    // For now, return a mock response
    return {
      agent: agent.name,
      processed: input,
      timestamp: new Date().toISOString(),
      context
    };
  }
}

// Global registry instance
export const agentRegistry = new AgentRegistry(); 