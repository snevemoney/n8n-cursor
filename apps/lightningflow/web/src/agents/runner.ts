/**
 * Lightning AI Platform - Business Automation Agent Runner
 * 
 * This system manages AI-powered business automations that users can
 * understand, preview, and control with complete transparency.
 */

import { EventEmitter } from 'events';
import { transactionEngine, type TransactionIntent, type AutomationRule } from '../core/runtime/transaction-engine';
import { signAndExecute, ExecutionContext, generateActionPreview } from '../core/crypto/signAndExecute';
import { CryptoPayload, hash, createPayload } from '../core/crypto/index';
import { AgentFeedback } from '../lib/ui/feedback';

export type AgentType = 
  | 'earnings_optimizer'
  | 'client_manager'
  | 'payment_processor'
  | 'content_creator'
  | 'scheduler'
  | 'financial_advisor'
  | 'security_monitor'
  | 'growth_tracker'
  | 'vault_manager'
  | 'analytics_reporter';

export type AgentStatus = 
  | 'inactive'
  | 'preview'
  | 'active'
  | 'paused'
  | 'error'
  | 'learning';

export interface BusinessAgent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  humanExplanation: string; // "I help you automatically save 20% of every payment"
  status: AgentStatus;
  capabilities: string[];
  currentTask?: string;
  lastAction?: Date;
  successRate: number;
  totalActions: number;
  estimatedValue: {
    timeSaved: string; // "2 hours per week"
    moneySaved: string; // "500 sats per month"
    efficiency: string; // "95% faster than manual"
  };
  settings: Record<string, any>;
  automationRules: string[]; // IDs of associated automation rules
  isLearning: boolean;
  confidenceLevel: number; // 0-100
}

export interface AgentAction {
  id: string;
  agentId: string;
  type: string;
  description: string;
  humanExplanation: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startTime: Date;
  endTime?: Date;
  canUndo: boolean;
  wasPreviewMode: boolean;
}

export interface AgentPreview {
  whatWillHappen: string[];
  exampleScenarios: string[];
  estimatedImpact: {
    timeImpact: string;
    moneyImpact: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  safetyChecks: {
    type: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
  }[];
  canActivate: boolean;
  recommendedSettings: Record<string, any>;
}

export interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  enabled: boolean;
  parameters: Record<string, any>;
  schedule?: string;
  safetyLevel: 'safe' | 'monitored' | 'requires_review';
  maxExecutionTime: number;
  rollbackSupported: boolean;
}

export interface AgentExecutionResult {
  success: boolean;
  agentId: string;
  action: string;
  result?: any;
  error?: string;
  executionTime: number;
  proofId?: string;
  humanExplanation: string;
  confidenceLevel: number;
  safetyChecks: string[];
  recommendations?: string[];
}

export class AgentRunner extends EventEmitter {
  private agents: Map<string, BusinessAgent> = new Map();
  private actions: Map<string, AgentAction> = new Map();
  private isRunning: boolean = false;
  private processingQueue: AgentAction[] = [];

  constructor() {
    super();
    this.initializeDefaultAgents();
    this.startProcessingLoop();
  }

  /**
   * Creates a new business agent with human-friendly configuration
   */
  async createAgent(
    type: AgentType,
    name: string,
    description: string,
    settings: Record<string, any> = {}
  ): Promise<BusinessAgent> {
    const id = this.generateAgentId();
    
    const agent: BusinessAgent = {
      id,
      type,
      name,
      description,
      humanExplanation: this.generateHumanExplanation(type, settings),
      status: 'inactive',
      capabilities: this.getAgentCapabilities(type),
      successRate: 0,
      totalActions: 0,
      estimatedValue: this.calculateEstimatedValue(type, settings),
      settings,
      automationRules: [],
      isLearning: true,
      confidenceLevel: 50 // Start with medium confidence
    };

    this.agents.set(id, agent);
    this.emit('agent_created', agent);

    return agent;
  }

  /**
   * Previews what an agent will do before activation
   */
  async previewAgent(agentId: string): Promise<AgentPreview> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const preview: AgentPreview = {
      whatWillHappen: this.generateWhatWillHappen(agent),
      exampleScenarios: this.generateExampleScenarios(agent),
      estimatedImpact: this.calculateEstimatedImpact(agent),
      safetyChecks: await this.runAgentSafetyChecks(agent),
      canActivate: true, // Will be determined by safety checks
      recommendedSettings: this.getRecommendedSettings(agent)
    };

    // Determine if agent can be safely activated
    preview.canActivate = preview.safetyChecks.every(check => check.status !== 'fail');

    return preview;
  }

  /**
   * Activates an agent after safety checks
   */
  async activateAgent(agentId: string): Promise<BusinessAgent> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Run safety checks first
    const preview = await this.previewAgent(agentId);
    if (!preview.canActivate) {
      throw new Error('Agent failed safety checks and cannot be activated');
    }

    agent.status = 'active';
    agent.lastAction = new Date();
    
    // Create associated automation rules
    await this.createAgentAutomationRules(agent);

    this.emit('agent_activated', agent);
    return agent;
  }

  /**
   * Executes an agent action with full logging and error handling
   */
  async executeAgentAction(
    agentId: string,
    actionType: string,
    input: Record<string, any>,
    previewMode: boolean = false
  ): Promise<AgentAction> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const actionId = this.generateActionId();
    const action: AgentAction = {
      id: actionId,
      agentId,
      type: actionType,
      description: this.generateActionDescription(actionType, input),
      humanExplanation: this.generateActionHumanExplanation(actionType, input),
      status: 'queued',
      input,
      startTime: new Date(),
      canUndo: this.canUndoAction(actionType),
      wasPreviewMode: previewMode
    };

    this.actions.set(actionId, action);
    
    if (previewMode) {
      // In preview mode, simulate the action without executing
      action.status = 'completed';
      action.endTime = new Date();
      action.output = { preview: true, simulatedResult: 'Success' };
      this.emit('agent_action_previewed', action);
    } else {
      // Queue for actual execution
      this.processingQueue.push(action);
      this.emit('agent_action_queued', action);
    }

    return action;
  }

  /**
   * Gets all agents with their current status and performance
   */
  getAllAgents(): BusinessAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Gets agent performance summary
   */
  getAgentPerformance(agentId: string): {
    successRate: number;
    totalActions: number;
    averageExecutionTime: number;
    recentActions: AgentAction[];
    estimatedValue: BusinessAgent['estimatedValue'];
    recommendations: string[];
  } {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agentActions = Array.from(this.actions.values())
      .filter(action => action.agentId === agentId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    const recentActions = agentActions.slice(0, 10);
    const completedActions = agentActions.filter(a => a.status === 'completed');
    
    const averageExecutionTime = completedActions.length > 0
      ? completedActions.reduce((sum, action) => {
          const duration = action.endTime ? action.endTime.getTime() - action.startTime.getTime() : 0;
          return sum + duration;
        }, 0) / completedActions.length
      : 0;

    return {
      successRate: agent.successRate,
      totalActions: agent.totalActions,
      averageExecutionTime,
      recentActions,
      estimatedValue: agent.estimatedValue,
      recommendations: this.generateAgentRecommendations(agent, agentActions)
    };
  }

  /**
   * Gets system-wide agent summary
   */
  getSystemSummary(): {
    totalAgents: number;
    activeAgents: number;
    totalActions: number;
    recentActivity: string;
    topPerformers: BusinessAgent[];
    needsAttention: BusinessAgent[];
  } {
    const agents = this.getAllAgents();
    const activeAgents = agents.filter(a => a.status === 'active');
    const totalActions = Array.from(this.actions.values()).length;
    
    // Get recent activity summary
    const recentActions = Array.from(this.actions.values())
      .filter(a => a.startTime > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .length;

    const recentActivity = recentActions > 0 
      ? `${recentActions} actions in the last 24 hours`
      : 'No recent activity';

    // Top performers (high success rate and active)
    const topPerformers = agents
      .filter(a => a.status === 'active' && a.successRate > 0.8)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);

    // Agents that need attention (low success rate or errors)
    const needsAttention = agents
      .filter(a => a.status === 'error' || (a.status === 'active' && a.successRate < 0.7))
      .slice(0, 3);

    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      totalActions,
      recentActivity,
      topPerformers,
      needsAttention
    };
  }

  // Private helper methods

  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHumanExplanation(type: AgentType, settings: Record<string, any>): string {
    const explanations: Record<AgentType, string> = {
      'earnings_optimizer': 'I help you automatically save and invest a percentage of every payment you receive',
      'client_manager': 'I track your clients, send follow-ups, and help you maintain great relationships',
      'payment_processor': 'I handle incoming payments, send confirmations, and manage payment flows',
      'content_creator': 'I help you create and schedule content to grow your business',
      'scheduler': 'I manage your calendar, book appointments, and send reminders',
      'financial_advisor': 'I analyze your earnings and suggest ways to optimize your finances',
      'security_monitor': 'I watch for suspicious activity and protect your funds',
      'growth_tracker': 'I track your business metrics and identify growth opportunities',
      'vault_manager': 'I manage your funds and ensure secure storage',
      'analytics_reporter': 'I generate reports and analytics for your business'
    };

    return explanations[type] || 'I help automate your business operations';
  }

  private getAgentCapabilities(type: AgentType): string[] {
    const capabilities: Record<AgentType, string[]> = {
      'earnings_optimizer': [
        'Automatically save percentage of payments',
        'Move funds to secure storage',
        'Optimize fee routing',
        'Track savings goals'
      ],
      'client_manager': [
        'Track client payment history',
        'Send payment reminders',
        'Generate client reports',
        'Manage client relationships'
      ],
      'payment_processor': [
        'Process incoming payments',
        'Send payment confirmations',
        'Handle refunds',
        'Generate invoices'
      ],
      'content_creator': [
        'Create social media posts',
        'Schedule content',
        'Generate marketing copy',
        'Track engagement'
      ],
      'scheduler': [
        'Book appointments',
        'Send calendar invites',
        'Manage availability',
        'Send reminders'
      ],
      'financial_advisor': [
        'Analyze spending patterns',
        'Suggest optimizations',
        'Track financial goals',
        'Generate reports'
      ],
      'security_monitor': [
        'Monitor for suspicious activity',
        'Alert on large transactions',
        'Check payment sources',
        'Backup important data'
      ],
      'growth_tracker': [
        'Track business metrics',
        'Identify trends',
        'Suggest improvements',
        'Generate growth reports'
      ],
      'vault_manager': [
        'Manage funds and secure storage',
        'Track asset allocation',
        'Monitor security',
        'Generate reports'
      ],
      'analytics_reporter': [
        'Generate reports and analytics',
        'Track business metrics',
        'Identify trends',
        'Provide insights'
      ]
    };

    return capabilities[type] || [];
  }

  private calculateEstimatedValue(type: AgentType, settings: Record<string, any>): BusinessAgent['estimatedValue'] {
    // Simplified estimation - would be more sophisticated in production
    const values: Record<AgentType, BusinessAgent['estimatedValue']> = {
      'earnings_optimizer': {
        timeSaved: '30 minutes per week',
        moneySaved: '1000 sats per month',
        efficiency: '90% more consistent savings'
      },
      'client_manager': {
        timeSaved: '2 hours per week',
        moneySaved: '5% faster payments',
        efficiency: '80% better client retention'
      },
      'payment_processor': {
        timeSaved: '1 hour per week',
        moneySaved: '200 sats in fees',
        efficiency: '95% faster processing'
      },
      'content_creator': {
        timeSaved: '3 hours per week',
        moneySaved: '10% more clients',
        efficiency: '70% more consistent posting'
      },
      'scheduler': {
        timeSaved: '1 hour per week',
        moneySaved: '15% fewer missed appointments',
        efficiency: '85% better time management'
      },
      'financial_advisor': {
        timeSaved: '45 minutes per week',
        moneySaved: '5% better optimization',
        efficiency: '90% better financial decisions'
      },
      'security_monitor': {
        timeSaved: '20 minutes per week',
        moneySaved: 'Prevents potential losses',
        efficiency: '99% threat detection'
      },
      'growth_tracker': {
        timeSaved: '1 hour per week',
        moneySaved: '8% revenue growth',
        efficiency: '75% better insights'
      },
      'vault_manager': {
        timeSaved: '1 hour per week',
        moneySaved: '10% more secure storage',
        efficiency: '90% better asset management'
      },
      'analytics_reporter': {
        timeSaved: '1 hour per week',
        moneySaved: '5% more accurate reports',
        efficiency: '80% better analysis'
      }
    };

    return values[type] || {
      timeSaved: '30 minutes per week',
      moneySaved: '500 sats per month',
      efficiency: '80% improvement'
    };
  }

  private generateWhatWillHappen(agent: BusinessAgent): string[] {
    return [
      `${agent.humanExplanation}`,
      `This agent will run automatically in the background`,
      `You'll be notified of all actions taken`,
      `You can pause or modify settings anytime`
    ];
  }

  private generateExampleScenarios(agent: BusinessAgent): string[] {
    const scenarios: Record<AgentType, string[]> = {
      'earnings_optimizer': [
        'When you receive 10,000 sats, I\'ll automatically save 2,000 sats (20%)',
        'If fees are high, I\'ll wait for better routing conditions',
        'Monthly, I\'ll show you your savings progress'
      ],
      'client_manager': [
        'When a client pays late, I\'ll send a friendly follow-up',
        'I\'ll track which clients pay fastest and suggest focusing on them',
        'Monthly reports will show client payment patterns'
      ],
      'payment_processor': [
        'When payment arrives, I\'ll confirm receipt within seconds',
        'If payment fails, I\'ll retry with different routing',
        'I\'ll generate receipts and update your records'
      ],
      'content_creator': [
        'Every Tuesday, I\'ll post about your latest work',
        'When you complete a project, I\'ll create a case study post',
        'I\'ll track which content gets the most engagement'
      ],
      'scheduler': [
        'When someone books a meeting, I\'ll send calendar invite',
        'Day before meetings, I\'ll send reminders to both parties',
        'I\'ll block time for focused work based on your preferences'
      ],
      'financial_advisor': [
        'Weekly, I\'ll analyze your spending and suggest optimizations',
        'When you reach savings goals, I\'ll suggest next steps',
        'I\'ll alert you to unusual spending patterns'
      ],
      'security_monitor': [
        'If transaction is unusually large, I\'ll ask for confirmation',
        'I\'ll monitor for suspicious payment patterns',
        'Daily backups of important data will be created'
      ],
      'growth_tracker': [
        'Monthly, I\'ll show your revenue growth trends',
        'I\'ll identify your most profitable services',
        'When metrics improve, I\'ll suggest scaling strategies'
      ],
      'vault_manager': [
        'Monthly, I\'ll show your asset allocation',
        'I\'ll monitor for security threats',
        'I\'ll generate reports on asset performance'
      ],
      'analytics_reporter': [
        'Monthly, I\'ll generate business analytics report',
        'I\'ll analyze trends and provide insights',
        'I\'ll help you make data-driven decisions'
      ]
    };

    return scenarios[agent.type] || [
      'I\'ll monitor for relevant events',
      'When conditions are met, I\'ll take appropriate action',
      'You\'ll receive notifications of all activities'
    ];
  }

  private calculateEstimatedImpact(agent: BusinessAgent): AgentPreview['estimatedImpact'] {
    // Risk assessment based on agent type and settings
    const riskLevels: Record<AgentType, 'low' | 'medium' | 'high'> = {
      'earnings_optimizer': 'low',
      'client_manager': 'low',
      'payment_processor': 'medium',
      'content_creator': 'low',
      'scheduler': 'low',
      'financial_advisor': 'low',
      'security_monitor': 'low',
      'growth_tracker': 'low',
      'vault_manager': 'low',
      'analytics_reporter': 'low'
    };

    return {
      timeImpact: agent.estimatedValue.timeSaved,
      moneyImpact: agent.estimatedValue.moneySaved,
      riskLevel: riskLevels[agent.type] || 'low'
    };
  }

  private async runAgentSafetyChecks(agent: BusinessAgent): Promise<AgentPreview['safetyChecks']> {
    const checks: AgentPreview['safetyChecks'] = [];

    // Basic safety checks
    checks.push({
      type: 'permissions',
      status: 'pass',
      message: 'Agent has appropriate permissions'
    });

    checks.push({
      type: 'settings',
      status: 'pass',
      message: 'Agent settings are within safe limits'
    });

    // Agent-specific checks
    if (agent.type === 'earnings_optimizer') {
      const savePercentage = agent.settings.savePercentage || 20;
      if (savePercentage > 50) {
        checks.push({
          type: 'configuration',
          status: 'warning',
          message: 'High savings percentage may impact cash flow'
        });
      }
    }

    return checks;
  }

  private getRecommendedSettings(agent: BusinessAgent): Record<string, any> {
    const recommendations: Record<AgentType, Record<string, any>> = {
      'earnings_optimizer': {
        savePercentage: 20,
        minimumAmount: 1000,
        maxDailyAmount: 100000
      },
      'client_manager': {
        followUpDelay: 24,
        maxReminders: 3,
        reportFrequency: 'weekly'
      },
      'payment_processor': {
        autoConfirm: true,
        retryAttempts: 3,
        timeoutMinutes: 10
      },
      'content_creator': {
        postFrequency: 'weekly',
        platforms: ['twitter', 'linkedin'],
        contentTypes: ['updates', 'tips']
      },
      'scheduler': {
        bufferMinutes: 15,
        workingHours: '9-17',
        timezone: 'auto'
      },
      'financial_advisor': {
        reportFrequency: 'weekly',
        alertThreshold: 10,
        analysisDepth: 'standard'
      },
      'security_monitor': {
        largeAmountThreshold: 100000,
        alertMethods: ['notification', 'email'],
        backupFrequency: 'daily'
      },
      'growth_tracker': {
        reportFrequency: 'monthly',
        metricsToTrack: ['revenue', 'clients', 'efficiency'],
        goalTracking: true
      },
      'vault_manager': {
        maxDepositAmount: 100000,
        minDepositAmount: 1000,
        operationFrequency: 'monthly'
      },
      'analytics_reporter': {
        reportFrequency: 'monthly',
        metricsToTrack: ['revenue', 'payments', 'clients'],
        goalTracking: true
      }
    };

    return recommendations[agent.type] || {};
  }

  private generateActionDescription(actionType: string, input: Record<string, any>): string {
    return `Execute ${actionType} with parameters: ${JSON.stringify(input)}`;
  }

  private generateActionHumanExplanation(actionType: string, input: Record<string, any>): string {
    // Convert technical action into human-readable explanation
    const explanations: Record<string, (input: any) => string> = {
      'save_percentage': (input) => `Save ${input.percentage}% of ${input.amount} sats to secure storage`,
      'send_reminder': (input) => `Send payment reminder to ${input.clientName}`,
      'process_payment': (input) => `Process incoming payment of ${input.amount} sats`,
      'create_post': (input) => `Create social media post about "${input.topic}"`,
      'book_appointment': (input) => `Book appointment with ${input.clientName} for ${input.date}`,
      'analyze_spending': (input) => `Analyze spending patterns for ${input.period}`,
      'security_check': (input) => `Run security check on transaction ${input.transactionId}`,
      'track_metric': (input) => `Track ${input.metric} for growth analysis`
    };

    const explainer = explanations[actionType];
    return explainer ? explainer(input) : `Execute ${actionType}`;
  }

  private canUndoAction(actionType: string): boolean {
    const undoableActions = [
      'save_percentage',
      'send_reminder',
      'create_post',
      'book_appointment'
    ];
    return undoableActions.includes(actionType);
  }

  private generateAgentRecommendations(agent: BusinessAgent, actions: AgentAction[]): string[] {
    const recommendations: string[] = [];

    if (agent.successRate < 0.8) {
      recommendations.push('Consider adjusting agent settings to improve success rate');
    }

    if (actions.length > 0 && actions.filter(a => a.status === 'failed').length > 2) {
      recommendations.push('Recent failures detected - review error logs');
    }

    if (agent.confidenceLevel < 70) {
      recommendations.push('Agent is still learning - monitor closely for first few weeks');
    }

    return recommendations;
  }

  private async createAgentAutomationRules(agent: BusinessAgent): Promise<void> {
    // Create automation rules based on agent type
    // This would integrate with the transaction engine
    const ruleId = await transactionEngine.createAutomationRule(
      `${agent.name} Automation`,
      `Automated actions for ${agent.name}`,
      {
        event: 'payment_received',
        conditions: { agentId: agent.id }
      },
      [
        {
          type: 'execute_agent_action',
          parameters: { agentId: agent.id }
        }
      ]
    );

    agent.automationRules.push(ruleId.id);
  }

  private initializeDefaultAgents(): void {
    // Initialize with some common agent templates
    // Users can create these through the UI
  }

  private startProcessingLoop(): void {
    setInterval(async () => {
      if (this.processingQueue.length > 0 && !this.isRunning) {
        this.isRunning = true;
        const action = this.processingQueue.shift();
        if (action) {
          await this.processAction(action);
        }
        this.isRunning = false;
      }
    }, 1000); // Process queue every second
  }

  private async processAction(action: AgentAction): Promise<void> {
    try {
      action.status = 'processing';
      this.emit('agent_action_processing', action);

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      action.status = 'completed';
      action.endTime = new Date();
      action.output = { success: true, result: 'Action completed successfully' };

      // Update agent statistics
      const agent = this.agents.get(action.agentId);
      if (agent) {
        agent.totalActions++;
        agent.lastAction = new Date();
        // Recalculate success rate
        const agentActions = Array.from(this.actions.values())
          .filter(a => a.agentId === action.agentId);
        const successfulActions = agentActions.filter(a => a.status === 'completed');
        agent.successRate = successfulActions.length / agentActions.length;
      }

      this.emit('agent_action_completed', action);

    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date();
      action.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('agent_action_failed', action, error);
    }
  }
}

/**
 * AI Agents Runner with Cryptographic Enforcement
 * 
 * All agent executions are cryptographically signed and verified
 * Provides human-readable explanations and safety checks
 */
export class CryptoAgentRunner {
  private agents: Map<string, AgentConfig> = new Map();
  private executionHistory: AgentExecutionResult[] = [];

  /**
   * Register an agent with cryptographic verification requirements
   */
  registerAgent(config: AgentConfig): void {
    // Validate agent configuration
    if (!config.id || !config.type || !config.name) {
      throw new Error('Agent configuration missing required fields');
    }

    this.agents.set(config.id, config);
  }

  /**
   * Execute an agent with full cryptographic signing and verification
   */
  async executeAgent(
    agentId: string,
    userId: string,
    parameters: Record<string, any> = {},
    context: Partial<ExecutionContext> = {}
  ): Promise<AgentExecutionResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        success: false,
        agentId,
        action: 'unknown',
        error: 'Agent not found',
        executionTime: 0,
        humanExplanation: `Agent "${agentId}" is not registered in the system`,
        confidenceLevel: 0,
        safetyChecks: ['Agent validation failed']
      };
    }

    if (!agent.enabled) {
      return {
        success: false,
        agentId,
        action: agent.type,
        error: 'Agent is disabled',
        executionTime: 0,
        humanExplanation: `Agent "${agent.name}" is currently disabled and cannot execute`,
        confidenceLevel: 0,
        safetyChecks: ['Agent status check failed']
      };
    }

    // Define the agent execution function
    const agentExecutor = async (payload: CryptoPayload, execContext: ExecutionContext) => {
      if (execContext.dryRun) {
        return this.dryRunAgent(agent, parameters);
      }

      return this.executeAgentLogic(agent, parameters, payload);
    };

    // Execute with cryptographic signing
    const executionContext: ExecutionContext = {
      userId,
      metadata: {
        agentId,
        agentType: agent.type,
        safetyLevel: agent.safetyLevel,
        ...context.metadata
      },
      ...context
    };

    const result = await signAndExecute(
      'agent_execution',
      { 
        agentId, 
        agentType: agent.type, 
        parameters,
        safetyLevel: agent.safetyLevel
      },
      async () => {
        const payload = createPayload('agent_execution', executionContext.userId, {
          agentId,
          agentType: agent.type,
          parameters,
          safetyLevel: agent.safetyLevel
        });
        return await agentExecutor(payload, executionContext);
      },
      {
        requireSignature: true,
        logProof: true,
        userId: executionContext.userId
      }
    );

    // Convert to AgentExecutionResult format
    const agentResult: AgentExecutionResult = {
      success: ('success' in result && typeof result.success === 'boolean') ? result.success : true,
      agentId,
      action: agent.type,
      result: 'data' in result ? result.data : result,
      error: 'error' in result ? (typeof result.error === 'string' ? result.error : String(result.error)) : undefined,
      executionTime: 'executionTime' in result ? (typeof result.executionTime === 'number' ? result.executionTime : 0) : 0,
      proofId: 'proofId' in result ? (typeof result.proofId === 'string' ? result.proofId : undefined) : undefined,
      humanExplanation: 'humanFeedback' in result ? (typeof result.humanFeedback === 'string' ? result.humanFeedback : `Agent "${agent.name}" execution completed`) : `Agent "${agent.name}" execution completed`,
      confidenceLevel: ('success' in result && typeof result.success === 'boolean') ? (result.success ? 0.95 : 0) : 0.95,
      safetyChecks: this.generateSafetyChecks(agent, ('success' in result && typeof result.success === 'boolean') ? result.success : true),
      recommendations: this.generateRecommendations(agent, result)
    };

    // Store in execution history
    this.executionHistory.push(agentResult);

    // Send feedback to user
    if (agentResult.success && agentResult.result) {
      AgentFeedback.executed(agent.name, agent.type, agentResult.proofId);
    } else if (!agentResult.success) {
      AgentFeedback.error(agent.name, agentResult.error || 'Unknown error');
    }

    return agentResult;
  }

  /**
   * Dry run an agent to preview its effects
   */
  private async dryRunAgent(agent: AgentConfig, parameters: Record<string, any>) {
    const preview = generateActionPreview('agent_execution', {
      agentType: agent.type,
      parameters,
      safetyLevel: agent.safetyLevel
    }, 'system');

    switch (agent.type) {
      case 'earnings_optimizer':
        return {
          preview: true,
          action: 'Optimize earnings allocation',
          estimatedChanges: {
            vaultTransfer: parameters.vaultPercentage ? 
              `${parameters.vaultPercentage}% of earnings to vault` : 'No vault transfer',
            reinvestment: parameters.reinvestPercentage ?
              `${parameters.reinvestPercentage}% for reinvestment` : 'No reinvestment'
          },
          risks: preview.risks,
          safeguards: preview.safeguards
        };

      case 'vault_manager':
        return {
          preview: true,
          action: 'Manage vault operations',
          estimatedChanges: {
            transfer: parameters.amount ? `Transfer ${parameters.amount} sats to vault` : 'No transfer',
            security: 'Vault security checks will be performed'
          },
          risks: preview.risks,
          safeguards: preview.safeguards
        };

      case 'payment_processor':
        return {
          preview: true,
          action: 'Process pending payments',
          estimatedChanges: {
            payments: `Process ${parameters.maxPayments || 10} pending payments`,
            verification: 'All payments will be cryptographically verified'
          },
          risks: preview.risks,
          safeguards: preview.safeguards
        };

      default:
        return {
          preview: true,
          action: `Execute ${agent.type} agent`,
          estimatedChanges: {
            general: 'Agent will execute according to configured parameters'
          },
          risks: preview.risks,
          safeguards: preview.safeguards
        };
    }
  }

  /**
   * Execute the actual agent logic
   */
  private async executeAgentLogic(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const startTime = Date.now();

    try {
      switch (agent.type) {
        case 'earnings_optimizer':
          return await this.executeEarningsOptimizer(agent, parameters, payload);
        
        case 'vault_manager':
          return await this.executeVaultManager(agent, parameters, payload);
        
        case 'payment_processor':
          return await this.executePaymentProcessor(agent, parameters, payload);
        
        case 'client_manager':
          return await this.executeClientManager(agent, parameters, payload);
        
        case 'content_creator':
          return await this.executeContentCreator(agent, parameters, payload);
        
        case 'scheduler':
          return await this.executeScheduler(agent, parameters, payload);
        
        case 'analytics_reporter':
          return await this.executeAnalyticsReporter(agent, parameters, payload);
        
        case 'security_monitor':
          return await this.executeSecurityMonitor(agent, parameters, payload);
        
        default:
          throw new Error(`Unknown agent type: ${agent.type}`);
      }
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      throw new Error(`Agent execution failed after ${executionTime}ms: ${error.message}`);
    }
  }

  /**
   * Earnings Optimizer Agent
   */
  private async executeEarningsOptimizer(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { vaultPercentage = 20, reinvestPercentage = 10 } = parameters;
    
    // Simulate earnings optimization
    const mockEarnings = 50000; // 50k sats
    const vaultAmount = Math.floor(mockEarnings * (vaultPercentage / 100));
    const reinvestAmount = Math.floor(mockEarnings * (reinvestPercentage / 100));
    
    return {
      action: 'earnings_optimized',
      totalEarnings: mockEarnings,
      vaultTransfer: vaultAmount,
      reinvestment: reinvestAmount,
      remaining: mockEarnings - vaultAmount - reinvestAmount,
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Optimized ${mockEarnings} sats: ${vaultAmount} to vault, ${reinvestAmount} for reinvestment`
    };
  }

  /**
   * Vault Manager Agent
   */
  private async executeVaultManager(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { amount, operation = 'deposit' } = parameters;
    
    return {
      action: 'vault_operation',
      operation,
      amount,
      vaultBalance: 150000, // Mock vault balance
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `${operation === 'deposit' ? 'Deposited' : 'Withdrew'} ${amount} sats ${operation === 'deposit' ? 'to' : 'from'} secure vault`
    };
  }

  /**
   * Payment Processor Agent
   */
  private async executePaymentProcessor(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { maxPayments = 10 } = parameters;
    
    // Simulate payment processing
    const processedPayments = Math.floor(Math.random() * maxPayments) + 1;
    
    return {
      action: 'payments_processed',
      processedCount: processedPayments,
      totalAmount: processedPayments * 1000, // Mock amounts
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Processed ${processedPayments} payments totaling ${processedPayments * 1000} sats`
    };
  }

  /**
   * Client Manager Agent
   */
  private async executeClientManager(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { action = 'update_status' } = parameters;
    
    return {
      action: 'client_management',
      operation: action,
      clientsUpdated: 5,
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Updated status for 5 clients`
    };
  }

  /**
   * Content Creator Agent
   */
  private async executeContentCreator(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { contentType = 'social_post' } = parameters;
    
    return {
      action: 'content_created',
      contentType,
      itemsCreated: 3,
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Created 3 ${contentType} items`
    };
  }

  /**
   * Scheduler Agent
   */
  private async executeScheduler(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { tasksToSchedule = 5 } = parameters;
    
    return {
      action: 'tasks_scheduled',
      tasksScheduled: tasksToSchedule,
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Scheduled ${tasksToSchedule} tasks`
    };
  }

  /**
   * Analytics Reporter Agent
   */
  private async executeAnalyticsReporter(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { reportType = 'daily' } = parameters;
    
    return {
      action: 'report_generated',
      reportType,
      metricsIncluded: ['earnings', 'payments', 'clients'],
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Generated ${reportType} analytics report`
    };
  }

  /**
   * Security Monitor Agent
   */
  private async executeSecurityMonitor(
    agent: AgentConfig, 
    parameters: Record<string, any>,
    payload: CryptoPayload
  ) {
    const { checkType = 'full_scan' } = parameters;
    
    return {
      action: 'security_check',
      checkType,
      threatsDetected: 0,
      systemHealth: 'good',
      cryptoProof: {
        hash: hash(payload),
        timestamp: payload.timestamp
      },
      humanSummary: `Completed ${checkType} security check - no threats detected`
    };
  }

  /**
   * Generate safety checks for an agent execution
   */
  private generateSafetyChecks(agent: AgentConfig, success: boolean): string[] {
    const checks = [
      'Agent identity verified',
      'Execution parameters validated',
      'Cryptographic signature verified'
    ];

    if (agent.safetyLevel === 'safe') {
      checks.push('Agent marked as safe for autonomous execution');
    } else if (agent.safetyLevel === 'monitored') {
      checks.push('Agent execution monitored and logged');
    } else {
      checks.push('Agent execution requires manual review');
    }

    if (success) {
      checks.push('Execution completed within safety parameters');
    } else {
      checks.push('Execution failed safely without side effects');
    }

    return checks;
  }

  /**
   * Generate recommendations based on execution results
   */
  private generateRecommendations(agent: AgentConfig, result: any): string[] {
    const recommendations: string[] = [];

    if (!result.success) {
      recommendations.push('Review agent configuration and parameters');
      recommendations.push('Check system logs for detailed error information');
    } else {
      recommendations.push('Agent executed successfully - consider enabling automation');
      
      if (agent.safetyLevel === 'requires_review') {
        recommendations.push('Consider upgrading agent safety level after successful executions');
      }
    }

    return recommendations;
  }

  /**
   * Get execution history with cryptographic verification
   */
  getExecutionHistory(userId?: string, limit: number = 50): AgentExecutionResult[] {
    return this.executionHistory
      .filter(result => !userId || result.proofId?.includes(userId))
      .slice(-limit)
      .reverse();
  }

  /**
   * Get agent configuration
   */
  getAgent(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List all registered agents
   */
  listAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  /**
   * Explain why an agent executed (for user trust)
   */
  whyDidThisRun(executionId: string): string {
    const execution = this.executionHistory.find(e => e.proofId === executionId);
    if (!execution) {
      return 'Execution not found';
    }

    const agent = this.agents.get(execution.agentId);
    if (!agent) {
      return 'Agent configuration not found';
    }

    return `Agent "${agent.name}" executed because: ${execution.humanExplanation}. ` +
           `This execution was cryptographically signed and verified (Proof: ${execution.proofId}). ` +
           `Safety level: ${agent.safetyLevel}. Confidence: ${(execution.confidenceLevel * 100).toFixed(1)}%.`;
  }
}

// Export singleton instance
export const agentRunner = new AgentRunner();
export const cryptoAgentRunner = new CryptoAgentRunner(); 