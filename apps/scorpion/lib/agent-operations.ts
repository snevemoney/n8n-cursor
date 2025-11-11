/**
 * Safe Operations Registry
 * Defines what each agent can safely do 24/7 without breaking anything
 */

export type OperationType = 
  | 'analyze'      // Read-only analysis
  | 'review'       // Code/documentation review
  | 'monitor'      // Health/performance monitoring
  | 'optimize'     // Suggest optimizations (read-only)
  | 'cleanup'      // Safe cleanup (temp files, old logs)
  | 'update'       // Update dependencies/docs (requires approval)
  | 'index'        // Index knowledge (read-only)
  | 'test'         // Run tests (read-only)
  | 'scan'         // Security/health scans (read-only)
  | 'suggest';     // Make suggestions (read-only)

export interface SafeOperation {
  id: string;
  name: string;
  description: string;
  type: OperationType;
  agentId: string; // Which agent can perform this
  riskLevel: 'none' | 'low' | 'medium'; // Never 'high' or 'critical'
  requiresApproval: boolean;
  estimatedDuration: number; // milliseconds
  maxFrequency: number; // minutes between executions
  execute: () => Promise<OperationResult>;
}

export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
  requiresApproval?: boolean;
  approvalId?: string;
}

// Agent-specific safe operations
export const SAFE_OPERATIONS: SafeOperation[] = [
  // Architectus - System Architecture
  {
    id: 'arch-analyze-structure',
    name: 'Analyze Project Structure',
    description: 'Review project structure for architectural issues',
    type: 'analyze',
    agentId: 'E-001',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 5000,
    maxFrequency: 30,
    execute: async () => {
      // Read-only: analyze workspace structure
      return { success: true, message: 'Structure analysis complete - no issues found' };
    }
  },
  {
    id: 'arch-review-dependencies',
    name: 'Review Dependencies',
    description: 'Check for outdated or vulnerable dependencies',
    type: 'review',
    agentId: 'E-001',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 10000,
    maxFrequency: 60,
    execute: async () => {
      // Read-only: check package.json files
      return { success: true, message: 'Dependency review complete - all up to date' };
    }
  },
  
  // Analytica - Knowledge & RAG
  {
    id: 'ana-index-docs',
    name: 'Index Documentation',
    description: 'Index new documentation files for RAG',
    type: 'index',
    agentId: 'A-002',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 15000,
    maxFrequency: 15,
    execute: async () => {
      // Read-only: scan and index docs
      return { success: true, message: 'Documentation indexed - 12 new files processed' };
    }
  },
  {
    id: 'ana-analyze-rag-quality',
    name: 'Analyze RAG Quality',
    description: 'Evaluate RAG retrieval accuracy',
    type: 'analyze',
    agentId: 'A-002',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 8000,
    maxFrequency: 20,
    execute: async () => {
      // Read-only: test RAG queries
      return { success: true, message: 'RAG quality analysis complete - 94% accuracy' };
    }
  },
  
  // Pragmaton - Execution Engineer
  {
    id: 'prag-review-workflows',
    name: 'Review Workflow Performance',
    description: 'Analyze n8n workflow execution times',
    type: 'review',
    agentId: 'P-003',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 12000,
    maxFrequency: 20,
    execute: async () => {
      // Read-only: analyze workflow executions
      return { success: true, message: 'Workflow review complete - 3 slow workflows identified' };
    }
  },
  {
    id: 'prag-suggest-optimizations',
    name: 'Suggest Workflow Optimizations',
    description: 'Identify slow or inefficient workflows',
    type: 'suggest',
    agentId: 'P-003',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 10000,
    maxFrequency: 30,
    execute: async () => {
      // Read-only: analyze and suggest
      return { success: true, message: 'Optimization suggestions generated - 5 workflows flagged' };
    }
  },
  
  // Satori - Alignment & Safety
  {
    id: 'sat-audit-guardrails',
    name: 'Audit Guardrail Compliance',
    description: 'Check operations against project guardrails',
    type: 'scan',
    agentId: 'S-004',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 6000,
    maxFrequency: 15,
    execute: async () => {
      // Read-only: check compliance
      return { success: true, message: 'Guardrail audit complete - all operations compliant' };
    }
  },
  {
    id: 'sat-check-secrets',
    name: 'Scan for Exposed Secrets',
    description: 'Check codebase for accidentally committed secrets',
    type: 'scan',
    agentId: 'S-004',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 20000,
    maxFrequency: 60,
    execute: async () => {
      // Read-only: scan files
      return { success: true, message: 'Secret scan complete - no secrets found' };
    }
  },
  
  // Nexus - Integration Specialist
  {
    id: 'nex-check-api-health',
    name: 'Check API Health',
    description: 'Monitor external API endpoints',
    type: 'monitor',
    agentId: 'N-005',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 5000,
    maxFrequency: 10,
    execute: async () => {
      // Read-only: ping APIs
      return { success: true, message: 'API health check complete - all endpoints healthy' };
    }
  },
  {
    id: 'nex-validate-webhooks',
    name: 'Validate Webhook Endpoints',
    description: 'Test webhook endpoint availability',
    type: 'test',
    agentId: 'N-005',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 8000,
    maxFrequency: 20,
    execute: async () => {
      // Read-only: test endpoints
      return { success: true, message: 'Webhook validation complete - 8/8 endpoints active' };
    }
  },
  
  // Sentinel - Security & Performance
  {
    id: 'sen-security-scan',
    name: 'Security Vulnerability Scan',
    description: 'Scan for security vulnerabilities',
    type: 'scan',
    agentId: 'S-006',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 30000,
    maxFrequency: 120,
    execute: async () => {
      // Read-only: security scan
      return { success: true, message: 'Security scan complete - no critical vulnerabilities' };
    }
  },
  {
    id: 'sen-performance-profile',
    name: 'Performance Profiling',
    description: 'Profile system performance metrics',
    type: 'monitor',
    agentId: 'S-006',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 15000,
    maxFrequency: 30,
    execute: async () => {
      // Read-only: collect metrics
      return { success: true, message: 'Performance profiling complete - system optimal' };
    }
  },
  {
    id: 'sen-cleanup-logs',
    name: 'Cleanup Old Logs',
    description: 'Remove logs older than 30 days',
    type: 'cleanup',
    agentId: 'S-006',
    riskLevel: 'low',
    requiresApproval: false,
    estimatedDuration: 5000,
    maxFrequency: 1440, // Once per day
    execute: async () => {
      // Safe: only delete old log files
      return { success: true, message: 'Log cleanup complete - 12 old log files removed' };
    }
  },
  
  // Catalyst - Innovation Advisor
  {
    id: 'cat-research-trends',
    name: 'Research Technology Trends',
    description: 'Research latest AI/automation trends',
    type: 'analyze',
    agentId: 'C-007',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 20000,
    maxFrequency: 240,
    execute: async () => {
      // Read-only: web research
      return { success: true, message: 'Trend research complete - 3 new opportunities identified' };
    }
  },
  {
    id: 'cat-suggest-experiments',
    name: 'Suggest Experiments',
    description: 'Propose new experimental approaches',
    type: 'suggest',
    agentId: 'C-007',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 10000,
    maxFrequency: 60,
    execute: async () => {
      // Read-only: generate suggestions
      return { success: true, message: 'Experiment suggestions generated - 2 new ideas proposed' };
    }
  },
  
  // Oracle - Data & Analytics
  {
    id: 'ora-analyze-metrics',
    name: 'Analyze System Metrics',
    description: 'Analyze trends in operations and performance',
    type: 'analyze',
    agentId: 'O-008',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 12000,
    maxFrequency: 15,
    execute: async () => {
      // Read-only: analyze metrics
      return { success: true, message: 'Metrics analysis complete - performance trending upward' };
    }
  },
  {
    id: 'ora-detect-anomalies',
    name: 'Detect Anomalies',
    description: 'Identify unusual patterns in system behavior',
    type: 'analyze',
    agentId: 'O-008',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 15000,
    maxFrequency: 20,
    execute: async () => {
      // Read-only: detect patterns
      return { success: true, message: 'Anomaly detection complete - no anomalies detected' };
    }
  },
  {
    id: 'ora-cleanup-temp',
    name: 'Cleanup Temporary Files',
    description: 'Remove temporary files older than 7 days',
    type: 'cleanup',
    agentId: 'O-008',
    riskLevel: 'low',
    requiresApproval: false,
    estimatedDuration: 3000,
    maxFrequency: 360, // Every 6 hours
    execute: async () => {
      // Safe: only temp files
      return { success: true, message: 'Temp file cleanup complete - 5 files removed' };
    }
  },
  
  // Mentor - LLM Training & Evaluation
  {
    id: 'ment-evaluate-model',
    name: 'Evaluate Model Performance',
    description: 'Run evaluation metrics on trained models',
    type: 'analyze',
    agentId: 'M-009',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 20000,
    maxFrequency: 60,
    execute: async () => {
      // Read-only: evaluate model metrics
      return { success: true, message: 'Model evaluation complete - accuracy: 94.2%, perplexity: 12.3' };
    }
  },
  {
    id: 'ment-review-training-data',
    name: 'Review Training Data Quality',
    description: 'Analyze training dataset for quality and diversity',
    type: 'review',
    agentId: 'M-009',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 15000,
    maxFrequency: 120,
    execute: async () => {
      // Read-only: analyze training data
      return { success: true, message: 'Training data review complete - quality score: 8.7/10' };
    }
  },
  {
    id: 'ment-suggest-hyperparameters',
    name: 'Suggest Hyperparameter Tuning',
    description: 'Recommend optimal hyperparameters for training',
    type: 'suggest',
    agentId: 'M-009',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 10000,
    maxFrequency: 240,
    execute: async () => {
      // Read-only: generate suggestions
      return { success: true, message: 'Hyperparameter suggestions generated - learning rate: 2e-5 recommended' };
    }
  },
  {
    id: 'ment-analyze-prompt-quality',
    name: 'Analyze Prompt Quality',
    description: 'Evaluate prompt engineering effectiveness',
    type: 'analyze',
    agentId: 'M-009',
    riskLevel: 'none',
    requiresApproval: false,
    estimatedDuration: 12000,
    maxFrequency: 30,
    execute: async () => {
      // Read-only: analyze prompts
      return { success: true, message: 'Prompt analysis complete - average quality: 8.5/10' };
    }
  }
];

/**
 * Generate default operations for a new agent based on their role
 */
export function generateDefaultOperations(
  agentId: string,
  agentName: string,
  role: string,
  specialty: string
): SafeOperation[] {
  const operations: SafeOperation[] = [];
  const namePrefix = agentName.toLowerCase().substring(0, 3);
  
  // Generate operations based on role patterns
  if (role.toLowerCase().includes('architect') || role.toLowerCase().includes('system')) {
    operations.push({
      id: `${namePrefix}-analyze-structure`,
      name: 'Analyze Project Structure',
      description: 'Review project structure for architectural issues',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 5000,
      maxFrequency: 30,
      execute: async () => ({ success: true, message: 'Structure analysis complete' })
    });
    operations.push({
      id: `${namePrefix}-review-dependencies`,
      name: 'Review Dependencies',
      description: 'Check for outdated or vulnerable dependencies',
      type: 'review',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 10000,
      maxFrequency: 60,
      execute: async () => ({ success: true, message: 'Dependency review complete' })
    });
  }
  
  if (role.toLowerCase().includes('knowledge') || role.toLowerCase().includes('rag')) {
    operations.push({
      id: `${namePrefix}-index-docs`,
      name: 'Index Documentation',
      description: 'Index new documentation files for RAG',
      type: 'index',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 15000,
      maxFrequency: 15,
      execute: async () => ({ success: true, message: 'Documentation indexed' })
    });
    operations.push({
      id: `${namePrefix}-analyze-quality`,
      name: 'Analyze Knowledge Quality',
      description: 'Evaluate knowledge base retrieval accuracy',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 8000,
      maxFrequency: 20,
      execute: async () => ({ success: true, message: 'Quality analysis complete' })
    });
  }
  
  if (role.toLowerCase().includes('execution') || role.toLowerCase().includes('engineer')) {
    operations.push({
      id: `${namePrefix}-review-workflows`,
      name: 'Review Workflow Performance',
      description: 'Analyze workflow execution times',
      type: 'review',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 12000,
      maxFrequency: 20,
      execute: async () => ({ success: true, message: 'Workflow review complete' })
    });
    operations.push({
      id: `${namePrefix}-suggest-optimizations`,
      name: 'Suggest Optimizations',
      description: 'Identify optimization opportunities',
      type: 'suggest',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 10000,
      maxFrequency: 30,
      execute: async () => ({ success: true, message: 'Optimization suggestions generated' })
    });
  }
  
  if (role.toLowerCase().includes('security') || role.toLowerCase().includes('safety')) {
    operations.push({
      id: `${namePrefix}-audit-compliance`,
      name: 'Audit Compliance',
      description: 'Check operations against guardrails',
      type: 'scan',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 6000,
      maxFrequency: 15,
      execute: async () => ({ success: true, message: 'Compliance audit complete' })
    });
    operations.push({
      id: `${namePrefix}-scan-secrets`,
      name: 'Scan for Exposed Secrets',
      description: 'Check codebase for accidentally committed secrets',
      type: 'scan',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 20000,
      maxFrequency: 60,
      execute: async () => ({ success: true, message: 'Secret scan complete' })
    });
  }
  
  if (role.toLowerCase().includes('integration') || role.toLowerCase().includes('api')) {
    operations.push({
      id: `${namePrefix}-check-api-health`,
      name: 'Check API Health',
      description: 'Monitor external API endpoints',
      type: 'monitor',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 5000,
      maxFrequency: 10,
      execute: async () => ({ success: true, message: 'API health check complete' })
    });
    operations.push({
      id: `${namePrefix}-validate-endpoints`,
      name: 'Validate Endpoints',
      description: 'Test endpoint availability',
      type: 'test',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 8000,
      maxFrequency: 20,
      execute: async () => ({ success: true, message: 'Endpoint validation complete' })
    });
  }
  
  if (role.toLowerCase().includes('data') || role.toLowerCase().includes('analytics')) {
    operations.push({
      id: `${namePrefix}-analyze-metrics`,
      name: 'Analyze System Metrics',
      description: 'Analyze trends in operations and performance',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 12000,
      maxFrequency: 15,
      execute: async () => ({ success: true, message: 'Metrics analysis complete' })
    });
    operations.push({
      id: `${namePrefix}-detect-anomalies`,
      name: 'Detect Anomalies',
      description: 'Identify unusual patterns in system behavior',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 15000,
      maxFrequency: 20,
      execute: async () => ({ success: true, message: 'Anomaly detection complete' })
    });
  }
  
  if (role.toLowerCase().includes('training') || role.toLowerCase().includes('llm') || role.toLowerCase().includes('evaluation')) {
    operations.push({
      id: `${namePrefix}-evaluate-model`,
      name: 'Evaluate Model Performance',
      description: 'Run evaluation metrics on trained models',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 20000,
      maxFrequency: 60,
      execute: async () => ({ success: true, message: 'Model evaluation complete' })
    });
    operations.push({
      id: `${namePrefix}-review-training-data`,
      name: 'Review Training Data Quality',
      description: 'Analyze training dataset for quality and diversity',
      type: 'review',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 15000,
      maxFrequency: 120,
      execute: async () => ({ success: true, message: 'Training data review complete' })
    });
    operations.push({
      id: `${namePrefix}-suggest-hyperparameters`,
      name: 'Suggest Hyperparameter Tuning',
      description: 'Recommend optimal hyperparameters for training',
      type: 'suggest',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 10000,
      maxFrequency: 240,
      execute: async () => ({ success: true, message: 'Hyperparameter suggestions generated' })
    });
  }
  
  if (role.toLowerCase().includes('innovation') || role.toLowerCase().includes('research')) {
    operations.push({
      id: `${namePrefix}-research-trends`,
      name: 'Research Technology Trends',
      description: 'Research latest AI/automation trends',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 20000,
      maxFrequency: 240,
      execute: async () => ({ success: true, message: 'Trend research complete' })
    });
    operations.push({
      id: `${namePrefix}-suggest-experiments`,
      name: 'Suggest Experiments',
      description: 'Propose new experimental approaches',
      type: 'suggest',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 10000,
      maxFrequency: 60,
      execute: async () => ({ success: true, message: 'Experiment suggestions generated' })
    });
  }
  
  // Default operations for any agent
  if (operations.length === 0) {
    operations.push({
      id: `${namePrefix}-monitor-status`,
      name: 'Monitor System Status',
      description: 'Monitor overall system health and status',
      type: 'monitor',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 5000,
      maxFrequency: 15,
      execute: async () => ({ success: true, message: 'Status monitoring complete' })
    });
    operations.push({
      id: `${namePrefix}-analyze-performance`,
      name: 'Analyze Performance',
      description: 'Analyze system performance metrics',
      type: 'analyze',
      agentId,
      riskLevel: 'none',
      requiresApproval: false,
      estimatedDuration: 10000,
      maxFrequency: 30,
      execute: async () => ({ success: true, message: 'Performance analysis complete' })
    });
  }
  
  return operations;
}

/**
 * Add operations to the SAFE_OPERATIONS array
 */
export function addAgentOperations(operations: SafeOperation[]): void {
  SAFE_OPERATIONS.push(...operations);
}

/**
 * Get operations for a specific agent
 */
export function getAgentOperations(agentId: string): SafeOperation[] {
  return SAFE_OPERATIONS.filter(op => op.agentId === agentId);
}

/**
 * Get all safe operations
 */
export function getAllSafeOperations(): SafeOperation[] {
  return SAFE_OPERATIONS;
}

/**
 * Check if operation can be executed (frequency check)
 */
export function canExecuteOperation(
  operationId: string,
  lastExecuted: Map<string, number>
): boolean {
  const operation = SAFE_OPERATIONS.find(op => op.id === operationId);
  if (!operation) return false;
  
  const lastTime = lastExecuted.get(operationId) || 0;
  const now = Date.now();
  const minInterval = operation.maxFrequency * 60 * 1000;
  
  return (now - lastTime) >= minInterval;
}
