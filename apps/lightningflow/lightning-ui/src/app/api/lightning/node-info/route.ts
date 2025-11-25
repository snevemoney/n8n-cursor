import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

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

const supabase = createSupabaseClient();

// Lightning Node Configuration
const LIGHTNING_NODE_URL = process.env.LIGHTNING_NODE_URL || '';
const LIGHTNING_ADMIN_KEY = process.env.LIGHTNING_ADMIN_KEY || '';

/**
 * GET /api/lightning/node-info
 * Get information about the Lightning Network node for a tenant
 */
export async function GET(req: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      const mockNodeUri = process.env.NEXT_PUBLIC_MOCK_NODE_URI || 'mock-node@mock-host:9735';
      return NextResponse.json({
        success: true,
        node_info: {
          alias: 'Mock Lightning Node',
          public_key: '03mock-public-key',
          version: '0.17.0-beta',
          num_channels: 5,
          num_peers: 8,
          block_height: 800000,
          synced_to_chain: true,
          testnet: true,
          chains: ['bitcoin'],
          uris: [mockNodeUri]
        },
        mode: 'mock'
      });
    }

    // Skip auth in development mode for testing
    if (process.env.NODE_ENV !== 'development') {
      const session = await getServerSession();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Mock Lightning node information
    const nodeInfo = {
      node_id: 'mock_node_02a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789ab',
      alias: 'Lightning AI Business Node',
      color: '#ff9900',
      version: '0.18.0-beta',
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
      block_height: 850000,
      synced_to_chain: true,
      synced_to_graph: true,
      channels: {
        active: 4,
        pending: 1,
        total: 5
      },
      balance: {
        confirmed: 1250000,
        unconfirmed: 0,
        total: 1250000
      },
      peers: 8,
      features: {
        'option_data_loss_protect': true,
        'option_upfront_shutdown_script': true,
        'option_support_large_channel': true,
        'option_static_remotekey': true,
        'option_payment_metadata': true
      },
      uris: [
        process.env.NEXT_PUBLIC_MOCK_NODE_URI || `mock_node_02a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789ab@mock-host:9735`
      ],
      best_header_timestamp: Math.floor(Date.now() / 1000),
      chains: [
        {
          chain: 'bitcoin',
          network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
        }
      ]
    };
    
    // In development mode, skip database calls
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(nodeInfo);
    }
    
    // Fetch user's profile to get their configured node settings
    const session = await getServerSession();
    const userId = session?.user?.email;
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('node_alias, node_pubkey, node_type')
      .eq('id', userId)
      .single();
    
    if (!profileError && profile) {
      // Override with user-specific settings if they exist
      if (profile.node_alias) nodeInfo.alias = profile.node_alias;
      if (profile.node_pubkey) nodeInfo.node_id = profile.node_pubkey;
    }
    
    return NextResponse.json(nodeInfo);
    
  } catch (error) {
    console.error('Error fetching node info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get node info',
        message: 'Node information unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 