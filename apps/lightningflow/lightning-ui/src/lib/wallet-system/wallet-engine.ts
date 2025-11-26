/**
 * Lightning AI Platform - Wallet Engine
 * Core business logic for intelligent payment routing and wallet management
 */

import {
  WalletConfig,
  WalletHealthCheck,
  TransactionContext,
  PerformanceMetrics,
  SplitRule,
  EarningsBreakdown,
  RoutingConfig,
  PayoutMethod
} from './wallet-types';
import { Currency, convertCurrency, toSatoshis, fromSatoshis } from '../currency';
import { logger } from '../logger';

export interface RoutingDecision {
  selected_wallet_id: string;
  reason: string;
  confidence_score: number; // 0-100
  estimated_fee_sats: number;
  estimated_success_rate: number;
  fallback_wallets: string[];
  routing_path?: string[];
}

export interface SplitResult {
  original_amount_sats: number;
  splits: Array<{
    wallet_id: string;
    amount_sats: number;
    percentage: number;
    payout_method: PayoutMethod;
    delay_hours: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }>;
  total_split_amount: number;
  remaining_amount: number;
  split_rule_applied?: string;
}

export class WalletEngine {
  private wallets: Map<string, WalletConfig> = new Map();
  private realtimePrices: Map<Currency, number> = new Map();
  private routingCache: Map<string, RoutingDecision> = new Map();

  /**
   * Initialize the wallet engine with current wallet configurations
   */
  async initialize(wallets: WalletConfig[], prices: Record<Currency, number>) {
    // Load wallets into memory for fast access
    this.wallets.clear();
    wallets.forEach(wallet => {
      this.wallets.set(wallet.id, wallet);
    });

    // Update price cache
    Object.entries(prices).forEach(([currency, price]) => {
      this.realtimePrices.set(currency as Currency, price);
    });

    logger.logSystem('info', 'Wallet engine initialized', {
      wallet_count: wallets.length,
      currencies_loaded: Object.keys(prices).length,
      category: 'wallet_engine'
    });
  }

  /**
   * Intelligent wallet selection for optimal payment routing
   */
  async selectOptimalWallet(
    context: TransactionContext,
    userId: string,
    tenantId: string
  ): Promise<RoutingDecision> {
    const cacheKey = `${context.amount_sats}-${context.payment_type}-${userId}`;
    
    // Check cache first (valid for 30 seconds)
    const cached = this.routingCache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    // Get available wallets for this user/tenant
    const availableWallets = this.getAvailableWallets(userId, tenantId, context);
    
    if (availableWallets.length === 0) {
      throw new Error('No available wallets for routing');
    }

    // Score each wallet based on multiple factors
    const scoredWallets = availableWallets.map(wallet => ({
      wallet,
      score: this.calculateWalletScore(wallet, context)
    }));

    // Sort by score (highest first)
    scoredWallets.sort((a, b) => b.score.total - a.score.total);

    const bestWallet = scoredWallets[0];
    const fallbackWallets = scoredWallets
      .slice(1, 4) // Top 3 alternatives
      .map(w => w.wallet.id);

    const decision: RoutingDecision = {
      selected_wallet_id: bestWallet.wallet.id,
      reason: this.generateRoutingReason(bestWallet.score),
      confidence_score: Math.min(bestWallet.score.total, 100),
      estimated_fee_sats: this.estimateFee(bestWallet.wallet, context.amount_sats),
      estimated_success_rate: bestWallet.score.reliability,
      fallback_wallets: fallbackWallets,
      routing_path: this.calculateRoutingPath(bestWallet.wallet, context)
    };

    // Cache the decision
    this.routingCache.set(cacheKey, decision);
    
    return decision;
  }

  /**
   * Process automatic splits based on wallet rules
   */
  async processSplits(
    walletId: string,
    amount: number,
    context: TransactionContext
  ): Promise<SplitResult> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    // Find applicable split rules
    const applicableRules = wallet.split_rules
      .filter(rule => this.ruleMatches(rule, context))
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    if (applicableRules.length === 0) {
      return {
        original_amount_sats: amount,
        splits: [],
        total_split_amount: 0,
        remaining_amount: amount
      };
    }

    // Apply the highest priority rule
    const rule = applicableRules[0];
    const splits = rule.splits.map(split => ({
      wallet_id: split.destination_id,
      amount_sats: Math.round(amount * (split.percentage / 100)),
      percentage: split.percentage,
      payout_method: split.payout_method,
      delay_hours: split.delay_hours || 0,
      status: 'pending' as const
    }));

    const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount_sats, 0);
    const remainingAmount = amount - totalSplitAmount;

    return {
      original_amount_sats: amount,
      splits,
      total_split_amount: totalSplitAmount,
      remaining_amount: remainingAmount,
      split_rule_applied: rule.id
    };
  }

  /**
   * Calculate comprehensive wallet health score
   */
  async checkWalletHealth(walletId: string): Promise<WalletHealthCheck> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    const checks = [
      this.checkLiquidityHealth(wallet),
      this.checkRoutingHealth(wallet),
      this.checkFeeEfficiency(wallet),
      this.checkUptimeScore(wallet),
      this.checkBalanceHealth(wallet),
      this.checkChannelHealth(wallet)
    ];

    const overallScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;

    return {
      wallet_id: walletId,
      overall_score: Math.round(overallScore),
      checks,
      liquidity_health: checks.find(c => c.name === 'liquidity')?.score || 0,
      routing_health: checks.find(c => c.name === 'routing')?.score || 0,
      fee_efficiency: checks.find(c => c.name === 'fee_efficiency')?.score || 0,
      uptime_score: checks.find(c => c.name === 'uptime')?.score || 0,
      checked_at: new Date().toISOString()
    };
  }

  /**
   * Generate earnings breakdown with fiat conversions
   */
  async generateEarningsBreakdown(
    walletId: string,
    startDate: string,
    endDate: string
  ): Promise<EarningsBreakdown> {
    // This would typically query the database for transaction data
    // For now, we'll create a mock implementation with the structure
    
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    // Mock earnings data - in production, this would come from transaction logs
    const grossRevenueSats = 1000000; // 0.01 BTC
    const tipsSats = 150000;
    const feesCollectedSats = 5000;
    const splitsPaidSats = 200000;
    const feesPaidSats = 10000;
    const netEarningsSats = grossRevenueSats - splitsPaidSats - feesPaidSats;

    // Calculate fiat breakdowns for all currencies
    const fiatBreakdown: Record<Currency, any> = {} as any;
    
    ['USD', 'CAD', 'EUR'].forEach(currency => {
      const currencyKey = currency as Currency;
      const grossRevenue = fromSatoshis(grossRevenueSats, currencyKey);
      const netEarnings = fromSatoshis(netEarningsSats, currencyKey);
      const feesPaid = fromSatoshis(feesPaidSats, currencyKey);

      fiatBreakdown[currencyKey] = {
        gross_revenue: Math.round(grossRevenue * 100) / 100,
        net_earnings: Math.round(netEarnings * 100) / 100,
        fees_paid: Math.round(feesPaid * 100) / 100
      };
    });

    return {
      wallet_id: walletId,
      period: { start: startDate, end: endDate },
      gross_revenue_sats: grossRevenueSats,
      tips_sats: tipsSats,
      fees_collected_sats: feesCollectedSats,
      splits_paid_sats: splitsPaidSats,
      fees_paid_sats: feesPaidSats,
      net_earnings_sats: netEarningsSats,
      assets_sats: netEarningsSats,
      liabilities_sats: 0, // No pending obligations
      fiat_breakdown: fiatBreakdown,
      calculated_at: new Date().toISOString()
    };
  }

  // Private helper methods

  private getAvailableWallets(
    userId: string,
    tenantId: string,
    context: TransactionContext
  ): WalletConfig[] {
    return Array.from(this.wallets.values()).filter(wallet => 
      wallet.tenant_id === tenantId &&
      wallet.status === 'active' &&
      wallet.balance_sats >= context.amount_sats &&
      this.walletSupportsPaymentType(wallet, context.payment_type)
    );
  }

  private calculateWalletScore(
    wallet: WalletConfig,
    context: TransactionContext
  ): {
    total: number;
    fee: number;
    reliability: number;
    liquidity: number;
    speed: number;
  } {
    const feeScore = this.calculateFeeScore(wallet, context.amount_sats);
    const reliabilityScore = wallet.performance_metrics.payment_success_rate * 100;
    const liquidityScore = this.calculateLiquidityScore(wallet, context.amount_sats);
    const speedScore = this.calculateSpeedScore(wallet);

    // Weighted scoring based on payment type and urgency
    let feeWeight = 0.3;
    let reliabilityWeight = 0.4;
    let liquidityWeight = 0.2;
    let speedWeight = 0.1;

    if (context.urgency === 'high') {
      speedWeight = 0.4;
      reliabilityWeight = 0.4;
      feeWeight = 0.1;
      liquidityWeight = 0.1;
    } else if (context.payment_type === 'tip') {
      speedWeight = 0.3;
      reliabilityWeight = 0.3;
      feeWeight = 0.2;
      liquidityWeight = 0.2;
    }

    const total = (
      feeScore * feeWeight +
      reliabilityScore * reliabilityWeight +
      liquidityScore * liquidityWeight +
      speedScore * speedWeight
    );

    return {
      total,
      fee: feeScore,
      reliability: reliabilityScore,
      liquidity: liquidityScore,
      speed: speedScore
    };
  }

  private calculateFeeScore(wallet: WalletConfig, amountSats: number): number {
    const estimatedFee = this.estimateFee(wallet, amountSats);
    const feePercentage = (estimatedFee / amountSats) * 100;
    
    // Score inversely proportional to fee percentage
    // 0% fee = 100 score, 1% fee = 90 score, etc.
    return Math.max(0, 100 - (feePercentage * 10));
  }

  private calculateLiquidityScore(wallet: WalletConfig, amountSats: number): number {
    const availableLiquidity = wallet.balance_sats - wallet.reserved_sats;
    const utilizationRatio = amountSats / availableLiquidity;
    
    // Prefer wallets with plenty of available liquidity
    if (utilizationRatio < 0.1) return 100;
    if (utilizationRatio < 0.3) return 90;
    if (utilizationRatio < 0.5) return 80;
    if (utilizationRatio < 0.7) return 70;
    if (utilizationRatio < 0.9) return 60;
    return 50;
  }

  private calculateSpeedScore(wallet: WalletConfig): number {
    const avgSettlementTime = wallet.performance_metrics.average_settlement_time;
    
    // Score based on settlement time (seconds)
    if (avgSettlementTime < 5) return 100;
    if (avgSettlementTime < 10) return 90;
    if (avgSettlementTime < 30) return 80;
    if (avgSettlementTime < 60) return 70;
    return 60;
  }

  private estimateFee(wallet: WalletConfig, amountSats: number): number {
    const baseFee = Math.max(1, amountSats * 0.001); // 0.1% base fee
    const routingComplexity = 1.2; // Assume some routing complexity
    return Math.round(baseFee * routingComplexity);
  }

  private generateRoutingReason(score: any): string {
    if (score.total > 90) return 'Optimal routing - excellent performance across all metrics';
    if (score.reliability > 90) return 'Selected for high reliability and uptime';
    if (score.fee > 90) return 'Selected for low fees and cost efficiency';
    if (score.liquidity > 90) return 'Selected for abundant liquidity';
    return 'Selected as best available option';
  }

  private calculateRoutingPath(wallet: WalletConfig, context: TransactionContext): string[] {
    // Simplified routing path calculation
    // In production, this would involve complex Lightning network pathfinding
    return [`node_${wallet.id}`, 'intermediate_node', 'destination'];
  }

  private ruleMatches(rule: SplitRule, context: TransactionContext): boolean {
    if (!rule.active) return false;
    
    if (rule.conditions.min_amount && context.amount_sats < rule.conditions.min_amount) return false;
    if (rule.conditions.max_amount && context.amount_sats > rule.conditions.max_amount) return false;
    if (rule.conditions.employee_id && context.employee_id !== rule.conditions.employee_id) return false;
    
    if (rule.conditions.tags && rule.conditions.tags.length > 0) {
      const hasMatchingTag = rule.conditions.tags.some(tag => context.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Time range check would go here if needed
    
    return true;
  }

  private walletSupportsPaymentType(wallet: WalletConfig, paymentType: string): boolean {
    // All wallets support basic payment types for now
    // Could be extended to have wallet-specific capabilities
    return true;
  }

  private isCacheValid(cacheKey: string): boolean {
    // Simple cache validation - in production would check timestamps
    return false; // For now, always recalculate for accuracy
  }

  // Health check methods
  private checkLiquidityHealth(wallet: WalletConfig) {
    const utilizationRate = wallet.performance_metrics.liquidity_utilization;
    let score = 100;
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'Liquidity levels are healthy';

    if (utilizationRate > 0.9) {
      score = 30;
      status = 'error';
      message = 'Critical: Very low liquidity available';
    } else if (utilizationRate > 0.7) {
      score = 60;
      status = 'warning';
      message = 'Warning: Liquidity running low';
    }

    return {
      name: 'liquidity',
      status,
      score,
      message,
      recommendation: utilizationRate > 0.7 ? 'Consider adding more liquidity or reducing outbound payments' : undefined
    };
  }

  private checkRoutingHealth(wallet: WalletConfig) {
    const successRate = wallet.performance_metrics.payment_success_rate;
    let score = successRate * 100;
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'Routing performance is excellent';

    if (successRate < 0.8) {
      status = 'error';
      message = 'Critical: High payment failure rate';
    } else if (successRate < 0.9) {
      status = 'warning';
      message = 'Warning: Some payment failures detected';
    }

    return {
      name: 'routing',
      status,
      score,
      message,
      recommendation: successRate < 0.9 ? 'Check channel connectivity and peer reliability' : undefined
    };
  }

  private checkFeeEfficiency(wallet: WalletConfig) {
    const feeScore = wallet.performance_metrics.fee_efficiency_score;
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'Fee efficiency is good';

    if (feeScore < 50) {
      status = 'error';
      message = 'High fees detected - consider optimizing routes';
    } else if (feeScore < 70) {
      status = 'warning';
      message = 'Fees could be optimized';
    }

    return {
      name: 'fee_efficiency',
      status,
      score: feeScore,
      message,
      recommendation: feeScore < 70 ? 'Review routing preferences and fee policies' : undefined
    };
  }

  private checkUptimeScore(wallet: WalletConfig) {
    const uptime = wallet.performance_metrics.uptime_percentage;
    let score = uptime;
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'Excellent uptime';

    if (uptime < 95) {
      status = 'error';
      message = 'Critical: Poor uptime detected';
    } else if (uptime < 98) {
      status = 'warning';
      message = 'Warning: Some downtime detected';
    }

    return {
      name: 'uptime',
      status,
      score,
      message,
      recommendation: uptime < 98 ? 'Investigate connectivity issues' : undefined
    };
  }

  private checkBalanceHealth(wallet: WalletConfig) {
    const balance = wallet.balance_sats;
    const reserved = wallet.reserved_sats;
    const available = balance - reserved;
    
    let score = 100;
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'Balance is healthy';

    if (available < 10000) { // Less than 10k sats available
      score = 20;
      status = 'error';
      message = 'Critical: Very low balance';
    } else if (available < 50000) { // Less than 50k sats
      score = 60;
      status = 'warning';
      message = 'Warning: Low balance';
    }

    return {
      name: 'balance',
      status,
      score,
      message,
      recommendation: available < 50000 ? 'Consider funding this wallet' : undefined
    };
  }

  private checkChannelHealth(wallet: WalletConfig) {
    const channelAvailability = wallet.performance_metrics.channel_availability;
    let score = channelAvailability * 100;
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'All channels are operational';

    if (channelAvailability < 0.7) {
      status = 'error';
      message = 'Critical: Many channels are offline';
    } else if (channelAvailability < 0.9) {
      status = 'warning';
      message = 'Warning: Some channels are offline';
    }

    return {
      name: 'channels',
      status,
      score,
      message,
      recommendation: channelAvailability < 0.9 ? 'Check channel peer connectivity' : undefined
    };
  }
} 