/**
 * System Check Runner - Core health monitoring for Lightning AI Business Node
 * Monitors: Node uptime, queue status, LN sync, agent runtime, and critical services
 */

export interface SystemCheckResult {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  duration_ms: number;
  auto_fixable: boolean;
}

export interface SystemHealthSummary {
  overall_status: 'healthy' | 'warning' | 'critical';
  checks_passed: number;
  checks_failed: number;
  checks_warning: number;
  last_check: Date;
  uptime_seconds: number;
  results: SystemCheckResult[];
}

class SystemCheckRunner {
  private startTime: Date;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastResults: SystemCheckResult[] = [];

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Run all system health checks
   */
  async runAllChecks(): Promise<SystemHealthSummary> {
    const checks = [
      this.checkNodeUptime,
      this.checkLightningSync,
      this.checkQueueStatus,
      this.checkAgentRuntime,
      this.checkDatabaseConnection,
      this.checkStorageSpace,
      this.checkMemoryUsage,
      this.checkNetworkConnectivity,
      this.checkWalletConnection,
      this.checkBackupStatus
    ];

    const results: SystemCheckResult[] = [];
    
    for (const check of checks) {
      try {
        const result = await check.call(this);
        results.push(result);
      } catch (error) {
        results.push({
          id: check.name,
          name: check.name,
          status: 'critical',
          message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration_ms: 0,
          auto_fixable: false
        });
      }
    }

    this.lastResults = results;

    const summary = this.generateSummary(results);
    
    // Log critical issues
    const criticalIssues = results.filter(r => r.status === 'critical');
    if (criticalIssues.length > 0) {
      console.error('🚨 Critical system issues detected:', criticalIssues);
    }

    return summary;
  }

  /**
   * Check node uptime and basic system health
   */
  private async checkNodeUptime(): Promise<SystemCheckResult> {
    const start = Date.now();
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    
    return {
      id: 'node_uptime',
      name: 'Node Uptime',
      status: uptime > 60 ? 'healthy' : 'warning',
      message: `Node running for ${uptimeHours}h ${Math.floor((uptime % 3600) / 60)}m`,
      details: {
        uptime_seconds: uptime,
        memory_usage: process.memoryUsage(),
        pid: process.pid
      },
      timestamp: new Date(),
      duration_ms: Date.now() - start,
      auto_fixable: false
    };
  }

  /**
   * Check Lightning Network synchronization status
   */
  private async checkLightningSync(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock Lightning Network check - replace with actual LND/CLN API call
      const mockSyncStatus = {
        synced_to_chain: true,
        synced_to_graph: true,
        block_height: 850000,
        best_header_timestamp: Date.now() / 1000
      };

      const isHealthy = mockSyncStatus.synced_to_chain && mockSyncStatus.synced_to_graph;
      
      return {
        id: 'lightning_sync',
        name: 'Lightning Network Sync',
        status: isHealthy ? 'healthy' : 'critical',
        message: isHealthy ? 'Fully synchronized' : 'Synchronization issues detected',
        details: mockSyncStatus,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: !isHealthy
      };
    } catch (error) {
      return {
        id: 'lightning_sync',
        name: 'Lightning Network Sync',
        status: 'critical',
        message: `Lightning node unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Check job queue status and health
   */
  private async checkQueueStatus(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock queue status - replace with actual Redis/BullMQ check
      const mockQueueStats = {
        active_jobs: 2,
        waiting_jobs: 5,
        completed_jobs: 150,
        failed_jobs: 3,
        stuck_jobs: 0
      };

      const hasStuckJobs = mockQueueStats.stuck_jobs > 0;
      const tooManyFailed = mockQueueStats.failed_jobs > 10;
      
      let status: SystemCheckResult['status'] = 'healthy';
      let message = 'Queue operating normally';
      
      if (hasStuckJobs) {
        status = 'critical';
        message = `${mockQueueStats.stuck_jobs} stuck jobs detected`;
      } else if (tooManyFailed) {
        status = 'warning';
        message = `High failure rate: ${mockQueueStats.failed_jobs} failed jobs`;
      }

      return {
        id: 'queue_status',
        name: 'Job Queue Status',
        status,
        message,
        details: mockQueueStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: hasStuckJobs
      };
    } catch (error) {
      return {
        id: 'queue_status',
        name: 'Job Queue Status',
        status: 'critical',
        message: `Queue unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Check agent runtime health
   */
  private async checkAgentRuntime(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock agent runtime check
      const mockAgentStats = {
        total_agents: 5,
        active_agents: 3,
        failed_agents: 0,
        last_execution: new Date(Date.now() - 300000), // 5 minutes ago
        avg_execution_time: 2.5
      };

      const recentExecution = Date.now() - mockAgentStats.last_execution.getTime() < 600000; // 10 minutes
      const hasFailures = mockAgentStats.failed_agents > 0;
      
      let status: SystemCheckResult['status'] = 'healthy';
      let message = 'All agents running normally';
      
      if (hasFailures) {
        status = 'warning';
        message = `${mockAgentStats.failed_agents} agents have failures`;
      } else if (!recentExecution) {
        status = 'warning';
        message = 'No recent agent activity';
      }

      return {
        id: 'agent_runtime',
        name: 'Agent Runtime',
        status,
        message,
        details: mockAgentStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: hasFailures
      };
    } catch (error) {
      return {
        id: 'agent_runtime',
        name: 'Agent Runtime',
        status: 'critical',
        message: `Agent runtime error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Check database connection and health
   */
  private async checkDatabaseConnection(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock database check - replace with actual Supabase/PostgreSQL check
      const mockDbStats = {
        connected: true,
        response_time_ms: 45,
        active_connections: 12,
        max_connections: 100
      };

      const isHealthy = mockDbStats.connected && mockDbStats.response_time_ms < 1000;
      
      return {
        id: 'database_connection',
        name: 'Database Connection',
        status: isHealthy ? 'healthy' : 'critical',
        message: isHealthy ? `Connected (${mockDbStats.response_time_ms}ms)` : 'Database unreachable',
        details: mockDbStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: !isHealthy
      };
    } catch (error) {
      return {
        id: 'database_connection',
        name: 'Database Connection',
        status: 'critical',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Check available storage space
   */
  private async checkStorageSpace(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock storage check - replace with actual filesystem check
      const mockStorageStats = {
        total_gb: 500,
        used_gb: 120,
        available_gb: 380,
        usage_percent: 24
      };

      let status: SystemCheckResult['status'] = 'healthy';
      let message = `${mockStorageStats.usage_percent}% used (${mockStorageStats.available_gb}GB free)`;
      
      if (mockStorageStats.usage_percent > 90) {
        status = 'critical';
        message = 'Storage critically low';
      } else if (mockStorageStats.usage_percent > 80) {
        status = 'warning';
        message = 'Storage running low';
      }

      return {
        id: 'storage_space',
        name: 'Storage Space',
        status,
        message,
        details: mockStorageStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: false
      };
    } catch (error) {
      return {
        id: 'storage_space',
        name: 'Storage Space',
        status: 'critical',
        message: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: false
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<SystemCheckResult> {
    const start = Date.now();
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const usagePercent = Math.round((usedMem / totalMem) * 100);

    let status: SystemCheckResult['status'] = 'healthy';
    let message = `${usagePercent}% memory used`;
    
    if (usagePercent > 90) {
      status = 'critical';
      message = 'Memory critically high';
    } else if (usagePercent > 80) {
      status = 'warning';
      message = 'Memory usage high';
    }

    return {
      id: 'memory_usage',
      name: 'Memory Usage',
      status,
      message,
      details: {
        heap_used_mb: Math.round(usedMem / 1024 / 1024),
        heap_total_mb: Math.round(totalMem / 1024 / 1024),
        usage_percent: usagePercent,
        external_mb: Math.round(memUsage.external / 1024 / 1024)
      },
      timestamp: new Date(),
      duration_ms: Date.now() - start,
      auto_fixable: false
    };
  }

  /**
   * Check network connectivity
   */
  private async checkNetworkConnectivity(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock network check - replace with actual connectivity test
      const mockNetworkStats = {
        internet_connected: true,
        dns_resolution: true,
        peer_connections: 8,
        avg_latency_ms: 45
      };

      const isHealthy = mockNetworkStats.internet_connected && mockNetworkStats.dns_resolution;
      
      return {
        id: 'network_connectivity',
        name: 'Network Connectivity',
        status: isHealthy ? 'healthy' : 'critical',
        message: isHealthy ? `Connected (${mockNetworkStats.peer_connections} peers)` : 'Network issues detected',
        details: mockNetworkStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: !isHealthy
      };
    } catch (error) {
      return {
        id: 'network_connectivity',
        name: 'Network Connectivity',
        status: 'critical',
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Check wallet connection and balance
   */
  private async checkWalletConnection(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock wallet check - replace with actual wallet API call
      const mockWalletStats = {
        connected: true,
        balance_sats: 1500000,
        channels_active: 5,
        channels_pending: 0,
        last_payment: new Date(Date.now() - 3600000) // 1 hour ago
      };

      const isHealthy = mockWalletStats.connected && mockWalletStats.balance_sats > 10000;
      
      let status: SystemCheckResult['status'] = 'healthy';
      let message = `Connected (${Math.round(mockWalletStats.balance_sats / 100000000 * 100000000 / 1000000)}M sats)`;
      
      if (!mockWalletStats.connected) {
        status = 'critical';
        message = 'Wallet disconnected';
      } else if (mockWalletStats.balance_sats < 10000) {
        status = 'warning';
        message = 'Low balance warning';
      }

      return {
        id: 'wallet_connection',
        name: 'Wallet Connection',
        status,
        message,
        details: mockWalletStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: !mockWalletStats.connected
      };
    } catch (error) {
      return {
        id: 'wallet_connection',
        name: 'Wallet Connection',
        status: 'critical',
        message: `Wallet error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Check backup status
   */
  private async checkBackupStatus(): Promise<SystemCheckResult> {
    const start = Date.now();
    
    try {
      // Mock backup check
      const mockBackupStats = {
        last_backup: new Date(Date.now() - 86400000), // 24 hours ago
        backup_size_mb: 45,
        backup_location: 'encrypted_cloud',
        auto_backup_enabled: true
      };

      const backupAge = Date.now() - mockBackupStats.last_backup.getTime();
      const hoursOld = Math.floor(backupAge / (1000 * 60 * 60));
      
      let status: SystemCheckResult['status'] = 'healthy';
      let message = `Last backup ${hoursOld}h ago`;
      
      if (hoursOld > 168) { // 7 days
        status = 'critical';
        message = 'Backup critically outdated';
      } else if (hoursOld > 48) { // 2 days
        status = 'warning';
        message = 'Backup outdated';
      }

      return {
        id: 'backup_status',
        name: 'Backup Status',
        status,
        message,
        details: mockBackupStats,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    } catch (error) {
      return {
        id: 'backup_status',
        name: 'Backup Status',
        status: 'critical',
        message: `Backup check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration_ms: Date.now() - start,
        auto_fixable: true
      };
    }
  }

  /**
   * Generate overall system health summary
   */
  private generateSummary(results: SystemCheckResult[]): SystemHealthSummary {
    const passed = results.filter(r => r.status === 'healthy').length;
    const warning = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'critical').length;
    
    let overall_status: SystemHealthSummary['overall_status'] = 'healthy';
    if (failed > 0) {
      overall_status = 'critical';
    } else if (warning > 0) {
      overall_status = 'warning';
    }

    return {
      overall_status,
      checks_passed: passed,
      checks_failed: failed,
      checks_warning: warning,
      last_check: new Date(),
      uptime_seconds: Date.now() - this.startTime.getTime(),
      results
    };
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 60000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      try {
        await this.runAllChecks();
      } catch (error) {
        console.error('System check monitoring error:', error);
      }
    }, intervalMs);
    
    console.log(`🔍 System monitoring started (${intervalMs}ms interval)`);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 System monitoring stopped');
    }
  }

  /**
   * Get last check results
   */
  getLastResults(): SystemCheckResult[] {
    return this.lastResults;
  }
}

// Export singleton instance
export const systemCheckRunner = new SystemCheckRunner();

// Export types and runner class
export { SystemCheckRunner }; 