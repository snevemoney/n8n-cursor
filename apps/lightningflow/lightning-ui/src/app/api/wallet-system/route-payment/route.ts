/**
 * POST /api/wallet-system/route-payment
 * Intelligent payment routing endpoint using the wallet engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { WalletEngine, RoutingDecision } from '@/lib/wallet-system/wallet-engine';
import { TransactionContext, WalletConfig } from '@/lib/wallet-system/wallet-types';
import { FiatPriceService } from '@/lib/wallet-system/fiat-price-service';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { Currency } from '@/lib/currency';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

interface RoutePaymentRequest {
  amount_sats: number;
  description: string;
  payment_type: 'sale' | 'tip' | 'refund' | 'transfer' | 'payout';
  urgency?: 'low' | 'normal' | 'high';
  tags?: string[];
  employee_id?: string;
  terminal_id?: string;
  metadata?: Record<string, any>;
}

interface RoutePaymentResponse {
  success: boolean;
  routing_decision?: RoutingDecision;
  split_preview?: {
    splits: Array<{
      wallet_id: string;
      amount_sats: number;
      percentage: number;
      delay_hours: number;
    }>;
    remaining_amount: number;
  };
  fiat_breakdown?: {
    primary_currency: string;
    primary_amount: string;
    btc_amount?: string;
  };
  error?: string;
  error_code?: string;
}

// Initialize services (in production, these would be singletons)
const walletEngine = new WalletEngine();
const priceService = new FiatPriceService();

export async function POST(req: NextRequest): Promise<NextResponse<RoutePaymentResponse>> {
  try {
    // Return mock response if Supabase not configured
    const supabase = createSupabaseClient();
    if (!supabase) {
      const body: RoutePaymentRequest = await req.json();
      
      return NextResponse.json({
        success: true,
        routing_decision: {
          selected_wallet_id: 'mock-wallet-id',
          reason: 'Mock routing - primary wallet selected for optimal performance',
          confidence_score: 85,
          estimated_fee_sats: 10,
          estimated_success_rate: 95,
          fallback_wallets: ['mock-backup-wallet'],
          routing_path: ['mock-wallet-id']
        },
        split_preview: {
          splits: [{
            wallet_id: 'mock-wallet-id',
            amount_sats: body.amount_sats,
            percentage: 100,
            delay_hours: 0
          }],
          remaining_amount: 0
        },
        fiat_breakdown: {
          primary_currency: 'USD',
          primary_amount: (body.amount_sats * 0.0004).toFixed(2), // Mock price
          btc_amount: (body.amount_sats / 100000000).toFixed(8)
        },
        mode: 'mock'
      });
    }

    // Parse request body
    const body: RoutePaymentRequest = await req.json();
    
    // Validate required fields
    if (!body.amount_sats || body.amount_sats <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount',
        error_code: 'INVALID_AMOUNT'
      }, { status: 400 });
    }

    if (!body.description?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Description is required',
        error_code: 'MISSING_DESCRIPTION'
      }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        error_code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, tenant_id, preferences')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        error_code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Get user's wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'active');

    if (walletsError) {
      logger.logAPI('error', 'Failed to fetch wallets', {
        method: 'POST',
        path: '/api/wallet-system/route-payment',
        statusCode: 500
      }, {
        error: walletsError.message,
        user_id: user.id,
        category: 'wallet_routing'
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch wallets',
        error_code: 'WALLET_FETCH_ERROR'
      }, { status: 500 });
    }

    if (!wallets || wallets.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active wallets found',
        error_code: 'NO_WALLETS'
      }, { status: 404 });
    }

    // Initialize price service (get current prices)
    if (!priceService.getAllPrices().USD) {
      await priceService.start();
    }

    // Convert database wallets to WalletConfig format
    const walletConfigs: WalletConfig[] = wallets.map(wallet => ({
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      description: wallet.description,
      tenant_id: wallet.tenant_id,
      owner_id: wallet.owner_id,
      created_by: wallet.created_by,
      metadata: wallet.metadata || {
        tags: []
      },
      balance_sats: wallet.balance_sats || 0,
      reserved_sats: wallet.reserved_sats || 0,
      routing_config: wallet.routing_config || getDefaultRoutingConfig(),
      split_rules: wallet.split_rules || [],
      health_score: wallet.health_score || 85,
      performance_metrics: wallet.performance_metrics || getDefaultPerformanceMetrics(),
      status: wallet.status,
      created_at: wallet.created_at,
      updated_at: wallet.updated_at,
      last_activity: wallet.last_activity || wallet.updated_at
    }));

    // Initialize wallet engine
    const prices = priceService.getAllPrices();
    const currencyPrices: Record<Currency, number> = {
      USD: prices.USD || 0,
      CAD: prices.CAD || 0,
      EUR: prices.EUR || 0,
      GBP: prices.GBP || 0,
      JPY: prices.JPY || 0,
      BTC: 1 // 1 BTC = 1 BTC
    };
    await walletEngine.initialize(walletConfigs, currencyPrices);

    // Create transaction context
    const context: TransactionContext = {
      amount_sats: body.amount_sats,
      description: body.description,
      tags: body.tags || [],
      employee_id: body.employee_id,
      terminal_id: body.terminal_id,
      payment_type: body.payment_type,
      urgency: body.urgency || 'normal',
      metadata: body.metadata
    };

    // Get optimal routing decision
    const routingDecision = await walletEngine.selectOptimalWallet(
      context,
      user.id,
      user.tenant_id
    );

    // Process splits preview
    const splitResult = await walletEngine.processSplits(
      routingDecision.selected_wallet_id,
      body.amount_sats,
      context
    );

    // Get user's currency preference
    const userPreferences = user.preferences || {};
    const primaryCurrency = userPreferences.primary_currency || 'USD';
    const showBtc = userPreferences.show_btc_amounts || false;

    // Create fiat breakdown
    const fiatDisplay = priceService.createFiatDisplay(
      body.amount_sats,
      primaryCurrency,
      showBtc
    );

    const response: RoutePaymentResponse = {
      success: true,
      routing_decision: routingDecision,
      split_preview: {
        splits: splitResult.splits,
        remaining_amount: splitResult.remaining_amount
      },
      fiat_breakdown: {
        primary_currency: primaryCurrency,
        primary_amount: fiatDisplay.primary,
        btc_amount: fiatDisplay.secondary
      }
    };

    // Log the routing decision
    logger.logAPI('info', 'Payment routing successful', {
      method: 'POST',
      path: '/api/wallet-system/route-payment',
      statusCode: 200
    }, {
      user_id: user.id,
      amount_sats: body.amount_sats,
      description: body.description,
      payment_type: body.payment_type,
      selected_wallet: routingDecision.selected_wallet_id
    });

    return NextResponse.json(response);

  } catch (error: any) {
    logger.logAPI('error', 'Payment routing failed', {
      method: 'POST',
      path: '/api/wallet-system/route-payment',
      statusCode: 500
    }, {
      error: error instanceof Error ? error.message : 'Unknown error',
      category: 'wallet_routing'
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error during routing',
      error_code: 'ROUTING_ERROR'
    }, { status: 500 });
  }
}

// Helper functions for default configurations

function getDefaultRoutingConfig() {
  return {
    max_fee_sats: 1000,
    max_fee_percent: 1.0,
    prefer_low_fee: true,
    min_success_rate: 0.95,
    max_route_length: 5,
    prefer_direct_channels: true,
    min_liquidity_threshold: 100000,
    auto_rebalance: false,
    rebalance_target: 50,
    fallback_wallets: [],
    auto_failover: true
  };
}

function getDefaultPerformanceMetrics() {
  return {
    payment_success_rate: 0.98,
    average_settlement_time: 15,
    average_fee_sats: 50,
    fee_efficiency_score: 85,
    liquidity_utilization: 0.3,
    channel_availability: 0.95,
    total_volume_30d: 5000000,
    transaction_count_30d: 250,
    largest_payment_sats: 500000,
    uptime_percentage: 99.5,
    failed_payment_count: 5,
    last_calculated: new Date().toISOString()
  };
} 