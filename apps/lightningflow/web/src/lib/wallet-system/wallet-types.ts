/**
 * Lightning AI Platform - Advanced Wallet System
 * Enterprise-grade wallet architecture with fiat-first UX
 */

import { Currency } from '../currency';

export type WalletType = 'team' | 'terminal' | 'channel' | 'personal' | 'reserve' | 'vault';
export type WalletStatus = 'active' | 'inactive' | 'maintenance' | 'degraded';
export type PayoutMethod = 'lnurl_withdraw' | 'keysend' | 'internal_ledger' | 'on_chain';

// Core wallet configuration
export interface WalletConfig {
  id: string;
  name: string;
  type: WalletType;
  description?: string;
  
  // Ownership and access
  tenant_id: string;
  owner_id: string;
  created_by: string;
  
  // Wallet metadata
  metadata: {
    location?: string;
    department?: string;
    employee_id?: string;
    terminal_type?: 'pos' | 'web' | 'mobile' | 'kiosk';
    tags: string[];
  };
  
  // Financial configuration
  balance_sats: number;
  reserved_sats: number; // Funds held for pending transactions
  
  // Routing and optimization
  routing_config: RoutingConfig;
  
  // Auto-split rules
  split_rules: SplitRule[];
  
  // Health and performance
  health_score: number; // 0-100
  performance_metrics: PerformanceMetrics;
  
  // Status and timestamps
  status: WalletStatus;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

// Routing optimization configuration
export interface RoutingConfig {
  // Fee optimization
  max_fee_sats: number;
  max_fee_percent: number;
  prefer_low_fee: boolean;
  
  // Reliability preferences
  min_success_rate: number; // 0.0 - 1.0
  max_route_length: number;
  prefer_direct_channels: boolean;
  
  // Liquidity management
  min_liquidity_threshold: number;
  auto_rebalance: boolean;
  rebalance_target: number;
  
  // Fallback options
  fallback_wallets: string[]; // Wallet IDs to try if this one fails
  auto_failover: boolean;
}

// Split rules for automatic payment distribution
export interface SplitRule {
  id: string;
  name: string;
  description: string;
  
  // Conditions
  conditions: {
    min_amount?: number;
    max_amount?: number;
    tags?: string[];
    time_range?: {
      start: string; // HH:MM
      end: string;   // HH:MM
    };
    employee_id?: string;
  };
  
  // Split configuration
  splits: Array<{
    percentage: number;
    destination_type: 'wallet' | 'user' | 'external';
    destination_id: string;
    payout_method: PayoutMethod;
    delay_hours?: number; // Optional payout delay
  }>;
  
  // Metadata
  priority: number; // Higher number = higher priority
  active: boolean;
  created_at: string;
}

// Performance and health metrics
export interface PerformanceMetrics {
  // Success rates
  payment_success_rate: number; // Last 30 days
  average_settlement_time: number; // Seconds
  
  // Fee performance
  average_fee_sats: number;
  fee_efficiency_score: number; // 0-100
  
  // Liquidity metrics
  liquidity_utilization: number; // 0-1
  channel_availability: number; // 0-1
  
  // Volume metrics
  total_volume_30d: number;
  transaction_count_30d: number;
  largest_payment_sats: number;
  
  // Reliability
  uptime_percentage: number; // Last 30 days
  failed_payment_count: number;
  last_failure_reason?: string;
  
  // Updated timestamp
  last_calculated: string;
}

// Fiat-first display preferences
export interface FiatDisplayConfig {
  primary_currency: Currency;
  show_btc_amounts: boolean;
  btc_display_mode: 'sats' | 'btc' | 'both';
  price_update_interval: number; // Seconds
  fallback_on_price_fail: boolean;
}

// User preferences for wallet display
export interface UserWalletPreferences {
  user_id: string;
  fiat_config: FiatDisplayConfig;
  
  // Dashboard preferences
  default_wallet_view: 'overview' | 'performance' | 'splits';
  show_health_scores: boolean;
  enable_notifications: boolean;
  
  // Advanced features
  show_technical_details: boolean;
  enable_routing_override: boolean;
  
  updated_at: string;
}

// Transaction context for routing decisions
export interface TransactionContext {
  amount_sats: number;
  description: string;
  tags: string[];
  employee_id?: string;
  terminal_id?: string;
  payment_type: 'sale' | 'tip' | 'refund' | 'transfer' | 'payout';
  urgency: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

// Wallet health check result
export interface WalletHealthCheck {
  wallet_id: string;
  overall_score: number; // 0-100
  
  checks: Array<{
    name: string;
    status: 'ok' | 'warning' | 'error';
    score: number;
    message: string;
    recommendation?: string;
  }>;
  
  // Specific metrics
  liquidity_health: number;
  routing_health: number;
  fee_efficiency: number;
  uptime_score: number;
  
  checked_at: string;
}

// Earnings breakdown for accounting
export interface EarningsBreakdown {
  wallet_id: string;
  period: {
    start: string;
    end: string;
  };
  
  // Revenue
  gross_revenue_sats: number;
  tips_sats: number;
  fees_collected_sats: number;
  
  // Splits and payouts
  splits_paid_sats: number;
  fees_paid_sats: number;
  net_earnings_sats: number;
  
  // Accounting classifications
  assets_sats: number;      // Money earned and owned
  liabilities_sats: number; // Money owed (deposits, prepayments)
  
  // Fiat conversions (cached for reporting)
  fiat_breakdown: Record<Currency, {
    gross_revenue: number;
    net_earnings: number;
    fees_paid: number;
  }>;
  
  calculated_at: string;
}

// Real-time wallet status
export interface WalletStatusInfo {
  wallet_id: string;
  
  // Current state
  online: boolean;
  processing_payments: boolean;
  current_balance_sats: number;
  pending_transactions: number;
  
  // Recent activity
  last_payment_time?: string;
  last_payment_amount?: number;
  payments_last_hour: number;
  
  // Health indicators
  routing_success_rate: number; // Last 24h
  average_fee_last_24h: number;
  liquidity_available: number;
  
  // Alerts
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  
  last_updated: string;
} 