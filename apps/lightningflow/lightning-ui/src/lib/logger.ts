/**
 * Lightning AI Platform - Comprehensive Logging System
 * 
 * This system provides complete transparency and audit trails for all
 * operations while maintaining user privacy and security.
 */

import { EventEmitter } from 'events';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 
  | 'transaction'
  | 'agent'
  | 'security'
  | 'system'
  | 'user'
  | 'api'
  | 'automation'
  | 'performance';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  humanMessage: string; // User-friendly explanation
  context: {
    userId?: string;
    sessionId?: string;
    transactionId?: string;
    agentId?: string;
    actionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  data: Record<string, any>;
  tags: string[];
  sensitive: boolean; // Whether this log contains sensitive data
  retention: number; // Days to retain this log
}

export interface LogQuery {
  level?: LogLevel[];
  category?: LogCategory[];
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  transactionId?: string;
  agentId?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LogSummary {
  totalEntries: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  recentErrors: LogEntry[];
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  };
}

export class Logger extends EventEmitter {
  private logs: Map<string, LogEntry> = new Map();
  private maxLogs: number = 10000; // Keep last 10k logs in memory
  private retentionPolicies: Record<LogCategory, number> = {
    transaction: 365, // 1 year
    agent: 90,       // 3 months
    security: 730,   // 2 years
    system: 30,      // 1 month
    user: 90,        // 3 months
    api: 30,         // 1 month
    automation: 90,  // 3 months
    performance: 7   // 1 week
  };

  constructor() {
    super();
    this.startCleanupProcess();
  }

  /**
   * Logs a transaction event with full context
   */
  logTransaction(
    level: LogLevel,
    message: string,
    context: {
      transactionId: string;
      userId?: string;
      amount?: number;
      currency?: string;
      intent?: string;
    },
    data: Record<string, any> = {}
  ): LogEntry {
    const humanMessage = this.generateTransactionHumanMessage(level, message, context, data);
    
    return this.log(level, 'transaction', message, humanMessage, {
      userId: context.userId,
      transactionId: context.transactionId
    }, {
      ...data,
      amount: context.amount,
      currency: context.currency,
      intent: context.intent
    }, ['transaction', context.intent || 'unknown'].filter(Boolean));
  }

  /**
   * Logs an agent action with human-friendly explanation
   */
  logAgent(
    level: LogLevel,
    message: string,
    context: {
      agentId: string;
      actionId?: string;
      userId?: string;
      actionType?: string;
    },
    data: Record<string, any> = {}
  ): LogEntry {
    const humanMessage = this.generateAgentHumanMessage(level, message, context, data);
    
    return this.log(level, 'agent', message, humanMessage, {
      userId: context.userId,
      agentId: context.agentId,
      actionId: context.actionId
    }, {
      ...data,
      actionType: context.actionType
    }, ['agent', context.actionType || 'unknown'].filter(Boolean));
  }

  /**
   * Logs a security event with appropriate sensitivity handling
   */
  logSecurity(
    level: LogLevel,
    message: string,
    context: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      threatType?: string;
    },
    data: Record<string, any> = {},
    sensitive: boolean = true
  ): LogEntry {
    const humanMessage = this.generateSecurityHumanMessage(level, message, context, data);
    
    return this.log(level, 'security', message, humanMessage, {
      userId: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    }, {
      ...data,
      threatType: context.threatType
    }, ['security', context.threatType || 'unknown'].filter(Boolean), sensitive);
  }

  /**
   * Logs a system event
   */
  logSystem(
    level: LogLevel,
    message: string,
    data: Record<string, any> = {}
  ): LogEntry {
    const humanMessage = this.generateSystemHumanMessage(level, message, data);
    
    return this.log(level, 'system', message, humanMessage, {}, data, ['system']);
  }

  /**
   * Logs a user action
   */
  logUser(
    level: LogLevel,
    message: string,
    context: {
      userId: string;
      sessionId?: string;
      action?: string;
    },
    data: Record<string, any> = {}
  ): LogEntry {
    const humanMessage = this.generateUserHumanMessage(level, message, context, data);
    
    return this.log(level, 'user', message, humanMessage, {
      userId: context.userId,
      sessionId: context.sessionId
    }, {
      ...data,
      action: context.action
    }, ['user', context.action || 'unknown'].filter(Boolean));
  }

  /**
   * Logs an API request/response
   */
  logAPI(
    level: LogLevel,
    message: string,
    context: {
      method: string;
      path: string;
      statusCode?: number;
      responseTime?: number;
      userId?: string;
    },
    data: Record<string, any> = {}
  ): LogEntry {
    const humanMessage = this.generateAPIHumanMessage(level, message, context, data);
    
    return this.log(level, 'api', message, humanMessage, {
      userId: context.userId
    }, {
      ...data,
      method: context.method,
      path: context.path,
      statusCode: context.statusCode,
      responseTime: context.responseTime
    }, ['api', context.method.toLowerCase()]);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    humanMessage: string,
    context: LogEntry['context'],
    data: Record<string, any>,
    tags: string[],
    sensitive: boolean = false
  ): LogEntry {
    const id = this.generateLogId();
    const entry: LogEntry = {
      id,
      timestamp: new Date(),
      level,
      category,
      message,
      humanMessage,
      context,
      data: sensitive ? this.sanitizeData(data) : data,
      tags,
      sensitive,
      retention: this.retentionPolicies[category]
    };

    // Store in memory
    this.logs.set(id, entry);

    // Emit event for real-time processing
    this.emit('log_entry', entry);

    // Handle critical logs immediately
    if (level === 'critical') {
      this.emit('critical_log', entry);
    }

    // Manage memory usage
    this.enforceMemoryLimits();

    return entry;
  }

  /**
   * Queries logs with filtering and pagination
   */
  queryLogs(query: LogQuery): {
    entries: LogEntry[];
    total: number;
    hasMore: boolean;
  } {
    let entries = Array.from(this.logs.values());

    // Apply filters
    if (query.level) {
      entries = entries.filter(entry => query.level!.includes(entry.level));
    }

    if (query.category) {
      entries = entries.filter(entry => query.category!.includes(entry.category));
    }

    if (query.startDate) {
      entries = entries.filter(entry => entry.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      entries = entries.filter(entry => entry.timestamp <= query.endDate!);
    }

    if (query.userId) {
      entries = entries.filter(entry => entry.context.userId === query.userId);
    }

    if (query.transactionId) {
      entries = entries.filter(entry => entry.context.transactionId === query.transactionId);
    }

    if (query.agentId) {
      entries = entries.filter(entry => entry.context.agentId === query.agentId);
    }

    if (query.tags) {
      entries = entries.filter(entry => 
        query.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      entries = entries.filter(entry => 
        entry.message.toLowerCase().includes(searchLower) ||
        entry.humanMessage.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = entries.length;
    const offset = query.offset || 0;
    const limit = query.limit || 50;

    const paginatedEntries = entries.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      entries: paginatedEntries,
      total,
      hasMore
    };
  }

  /**
   * Gets a summary of recent log activity
   */
  getLogSummary(hours: number = 24): LogSummary {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentLogs = Array.from(this.logs.values())
      .filter(log => log.timestamp >= cutoff);

    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0
    };

    const byCategory: Record<LogCategory, number> = {
      transaction: 0,
      agent: 0,
      security: 0,
      system: 0,
      user: 0,
      api: 0,
      automation: 0,
      performance: 0
    };

    recentLogs.forEach(log => {
      byLevel[log.level]++;
      byCategory[log.category]++;
    });

    const recentErrors = recentLogs
      .filter(log => log.level === 'error' || log.level === 'critical')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const systemHealth = this.assessSystemHealth(recentLogs);

    return {
      totalEntries: recentLogs.length,
      byLevel,
      byCategory,
      recentErrors,
      systemHealth
    };
  }

  /**
   * Gets user-friendly activity feed
   */
  getUserActivityFeed(userId: string, limit: number = 20): {
    activity: string;
    timestamp: Date;
    category: string;
    level: LogLevel;
    canViewDetails: boolean;
  }[] {
    const userLogs = Array.from(this.logs.values())
      .filter(log => log.context.userId === userId && !log.sensitive)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return userLogs.map(log => ({
      activity: log.humanMessage,
      timestamp: log.timestamp,
      category: log.category,
      level: log.level,
      canViewDetails: !log.sensitive && log.level !== 'debug'
    }));
  }

  // Private helper methods

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionHumanMessage(
    level: LogLevel,
    message: string,
    context: any,
    data: any
  ): string {
    if (level === 'info' && message.includes('created')) {
      return `Payment request created for ${context.amount} ${context.currency}`;
    }
    if (level === 'info' && message.includes('completed')) {
      return `Payment of ${context.amount} ${context.currency} completed successfully`;
    }
    if (level === 'error' && message.includes('failed')) {
      return `Payment failed - ${data.reason || 'unknown error'}`;
    }
    return `Transaction: ${message}`;
  }

  private generateAgentHumanMessage(
    level: LogLevel,
    message: string,
    context: any,
    data: any
  ): string {
    if (level === 'info' && message.includes('activated')) {
      return `Business automation "${data.agentName}" is now active`;
    }
    if (level === 'info' && message.includes('action_completed')) {
      return `Automation completed: ${data.humanExplanation}`;
    }
    if (level === 'error' && message.includes('action_failed')) {
      return `Automation failed: ${data.humanExplanation} - ${data.error}`;
    }
    return `Agent: ${message}`;
  }

  private generateSecurityHumanMessage(
    level: LogLevel,
    message: string,
    context: any,
    data: any
  ): string {
    if (level === 'warn' && message.includes('suspicious')) {
      return `Suspicious activity detected - ${data.description}`;
    }
    if (level === 'info' && message.includes('login')) {
      return `Successful login from ${context.ipAddress}`;
    }
    if (level === 'error' && message.includes('failed_login')) {
      return `Failed login attempt from ${context.ipAddress}`;
    }
    return `Security: ${message}`;
  }

  private generateSystemHumanMessage(
    level: LogLevel,
    message: string,
    data: any
  ): string {
    if (level === 'info' && message.includes('startup')) {
      return 'System started successfully';
    }
    if (level === 'warn' && message.includes('high_memory')) {
      return `Memory usage is high: ${data.memoryUsage}%`;
    }
    if (level === 'error' && message.includes('service_down')) {
      return `Service unavailable: ${data.serviceName}`;
    }
    return `System: ${message}`;
  }

  private generateUserHumanMessage(
    level: LogLevel,
    message: string,
    context: any,
    data: any
  ): string {
    if (level === 'info' && message.includes('settings_updated')) {
      return `Settings updated: ${data.settingName}`;
    }
    if (level === 'info' && message.includes('profile_updated')) {
      return 'Profile information updated';
    }
    return `User action: ${context.action || message}`;
  }

  private generateAPIHumanMessage(
    level: LogLevel,
    message: string,
    context: any,
    data: any
  ): string {
    if (level === 'info') {
      return `API ${context.method} ${context.path} - ${context.statusCode} (${context.responseTime}ms)`;
    }
    if (level === 'error') {
      return `API error: ${context.method} ${context.path} - ${context.statusCode}`;
    }
    return `API: ${message}`;
  }

  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    // Remove or mask sensitive fields
    const sensitiveFields = [
      'password',
      'privateKey',
      'seed',
      'mnemonic',
      'apiKey',
      'token',
      'secret'
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Mask partial sensitive data
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }

    if (sanitized.ipAddress) {
      sanitized.ipAddress = this.maskIP(sanitized.ipAddress);
    }

    return sanitized;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

  private maskIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***.`;
    }
    return ip;
  }

  private assessSystemHealth(recentLogs: LogEntry[]): LogSummary['systemHealth'] {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const errorCount = recentLogs.filter(log => log.level === 'error').length;
    const criticalCount = recentLogs.filter(log => log.level === 'critical').length;

    if (criticalCount > 0) {
      issues.push(`${criticalCount} critical errors in the last 24 hours`);
      recommendations.push('Immediate attention required for critical issues');
    }

    if (errorCount > 10) {
      issues.push(`High error rate: ${errorCount} errors in the last 24 hours`);
      recommendations.push('Review error logs and investigate common causes');
    }

    const securityLogs = recentLogs.filter(log => log.category === 'security');
    const securityWarnings = securityLogs.filter(log => log.level === 'warn' || log.level === 'error');

    if (securityWarnings.length > 5) {
      issues.push(`${securityWarnings.length} security warnings`);
      recommendations.push('Review security logs for potential threats');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalCount > 0) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      recommendations
    };
  }

  private enforceMemoryLimits(): void {
    if (this.logs.size > this.maxLogs) {
      // Remove oldest logs
      const entries = Array.from(this.logs.entries())
        .sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());
      
      const toRemove = entries.slice(0, this.logs.size - this.maxLogs);
      toRemove.forEach(([id]) => this.logs.delete(id));
    }
  }

  private startCleanupProcess(): void {
    // Clean up old logs every hour
    setInterval(() => {
      const now = new Date();
      const toDelete: string[] = [];

      this.logs.forEach((log, id) => {
        const ageInDays = (now.getTime() - log.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > log.retention) {
          toDelete.push(id);
        }
      });

      toDelete.forEach(id => this.logs.delete(id));

      if (toDelete.length > 0) {
        this.emit('logs_cleaned', { count: toDelete.length });
      }
    }, 60 * 60 * 1000); // Every hour
  }
}

// Export singleton instance
export const logger = new Logger(); 