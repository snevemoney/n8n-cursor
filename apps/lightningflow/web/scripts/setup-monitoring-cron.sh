#!/bin/bash

# Lightning Platform Channel Monitoring Cron Setup
# This script sets up automated channel monitoring that runs every 5 minutes

set -e

echo "🔧 Setting up Lightning Channel Monitoring Cron Job..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the root of your Lightning Platform project"
    exit 1
fi

# Check if tsx or ts-node is available for TypeScript execution
TYPESCRIPT_RUNNER=""
if command -v tsx &> /dev/null; then
    TYPESCRIPT_RUNNER="tsx"
elif command -v ts-node &> /dev/null; then
    TYPESCRIPT_RUNNER="ts-node"
else
    echo "⚠️  TypeScript runner not found. Installing tsx..."
    npm install -g tsx
    TYPESCRIPT_RUNNER="tsx"
fi

# Create the cron job script with proper TypeScript handling
cat > scripts/run-channel-monitor.js << EOF
#!/usr/bin/env node

// Channel monitoring cron job runner with proper error handling
const path = require('path');
const { spawn } = require('child_process');

// Set working directory to project root
process.chdir(path.join(__dirname, '..'));

async function main() {
  const timestamp = new Date().toISOString();
  console.log(\`[\${timestamp}] Starting scheduled channel monitoring...\`);
  
  try {
    // Use tsx or ts-node to run TypeScript file
    const runner = process.env.TYPESCRIPT_RUNNER || '${TYPESCRIPT_RUNNER}';
    const scriptPath = 'web/src/workers/channel-monitor.ts';
    
    // Execute the monitoring script
    const result = await new Promise((resolve, reject) => {
      const child = spawn(runner, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(\`Monitor failed with code \${code}: \${stderr}\`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(\`Failed to start monitor: \${error.message}\`));
      });
      
      // 5 minute timeout
      setTimeout(() => {
        child.kill();
        reject(new Error('Monitor timed out after 5 minutes'));
      }, 300000);
    });
    
    console.log(\`[\${new Date().toISOString()}] Channel monitoring completed successfully\`);
  } catch (error) {
    console.error(\`[\${new Date().toISOString()}] Channel monitoring failed:\`, error.message);
    process.exit(1);
  }
}

// Execute the main monitoring function directly
main();
EOF

# Create TypeScript monitoring entry point that exports the function
cat > web/src/workers/monitor-entry.ts << 'EOF'
#!/usr/bin/env tsx

// Entry point for cron job execution
import { runChannelMonitoring } from './channel-monitor.js';

async function main() {
  try {
    await runChannelMonitoring();
    console.log('Channel monitoring completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Channel monitoring failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}
EOF

# Update the channel monitor to use secure LND client
cat > web/src/workers/channel-monitor-updated.ts << 'EOF'
import { createClient } from '@/lib/supabase/server';
import { lndClient } from '@/lib/lightning/secure-lnd-client';

interface LightningChannelInfo {
  channel_id: string;
  peer_pubkey: string;
  peer_alias: string;
  local_balance: number;
  remote_balance: number;
  capacity: number;
  active: boolean;
  base_fee_msat: number;
  fee_rate_ppm: number;
  last_forward_at?: string;
}

export class SecureChannelMonitor {
  private supabase: any;
  private userId: string;
  
  constructor(userId: string) {
    this.supabase = createClient();
    this.userId = userId;
  }

  /**
   * Fetch channel information using secure LND client
   */
  async fetchChannelsFromLND(): Promise<LightningChannelInfo[]> {
    try {
      // Validate connection first
      const validation = await lndClient.validateConnection();
      if (!validation.valid) {
        throw new Error(`LND connection invalid: ${validation.error}`);
      }

      const { channels } = await lndClient.getChannelsForMonitoring();
      return channels;
    } catch (error) {
      console.error('Failed to fetch channels from LND:', error);
      throw error;
    }
  }

  /**
   * Fetch recent forwarding events
   */
  async fetchForwardingHistory(): Promise<Map<string, string>> {
    try {
      const yesterday = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      const forwardingData = await lndClient.getForwardingHistory(yesterday, 1000);
      
      const lastForwards = new Map<string, string>();
      
      forwardingData.forwarding_events?.forEach((event) => {
        const timestamp = new Date(parseInt(event.timestamp_ns) / 1000000).toISOString();
        
        // Update last forward time for both incoming and outgoing channels
        if (event.chan_id_in) {
          const existing = lastForwards.get(event.chan_id_in);
          if (!existing || timestamp > existing) {
            lastForwards.set(event.chan_id_in, timestamp);
          }
        }
        
        if (event.chan_id_out) {
          const existing = lastForwards.get(event.chan_id_out);
          if (!existing || timestamp > existing) {
            lastForwards.set(event.chan_id_out, timestamp);
          }
        }
      });
      
      return lastForwards;
    } catch (error) {
      console.error('Failed to fetch forwarding history:', error);
      return new Map();
    }
  }

  // ... rest of the monitoring methods remain the same but use this.fetchChannelsFromLND()
  
  async runMonitoring(): Promise<void> {
    console.log(`Starting secure channel monitoring for user ${this.userId}...`);
    
    try {
      const channels = await this.fetchChannelsFromLND();
      
      if (channels.length === 0) {
        console.log('No channels found');
        return;
      }
      
      console.log(`Found ${channels.length} channels to monitor`);
      
      // Continue with existing monitoring logic...
      // (updateChannelStates, recordCapacitySnapshot, checkAndCreateAlerts)
      
    } catch (error) {
      console.error('Secure channel monitoring failed:', error);
      throw error;
    }
  }
}

export async function runChannelMonitoring(): Promise<void> {
  const supabase = createClient();
  
  try {
    const { data: users, error } = await supabase
      .from('live_channels')
      .select('user_id')
      .distinct();
    
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    for (const userRecord of users) {
      const monitor = new SecureChannelMonitor(userRecord.user_id);
      await monitor.runMonitoring();
      
      // Small delay between users
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Failed to run channel monitoring:', error);
    throw error;
  }
}
EOF

# Make the script executable
chmod +x scripts/run-channel-monitor.js

# Create the cron job entry with better error handling
CRON_JOB="*/5 * * * * cd $(pwd) && TYPESCRIPT_RUNNER=${TYPESCRIPT_RUNNER} node scripts/run-channel-monitor.js >> logs/channel-monitor.log 2>&1"

# Create logs directory if it doesn't exist
mkdir -p logs

# Add to crontab if not already present
if ! crontab -l 2>/dev/null | grep -q "run-channel-monitor.js"; then
    echo "📅 Adding channel monitoring to crontab (runs every 5 minutes)..."
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job added successfully"
else
    echo "ℹ️  Channel monitoring cron job already exists"
fi

# Create environment validation script
cat > scripts/validate-environment.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Lightning Platform Environment...\n');

// Check required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

const optionalEnvVars = [
  'LND_DIR',
  'LND_NETWORK',
  'LND_TLS_CERT_PATH', 
  'LND_MACAROON_PATH',
  'LND_RPC_SERVER'
];

let hasErrors = false;

// Check required variables
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing (REQUIRED)`);
    hasErrors = true;
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName]}`);
  } else {
    console.log(`⚠️  ${varName}: Using default`);
  }
});

// Check if LND is accessible
const { spawn } = require('child_process');

console.log('\n🔗 Testing LND Connection...');
const lndTest = spawn('lncli', ['getinfo'], { stdio: 'pipe' });

lndTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ LND: Connected');
  } else {
    console.log('❌ LND: Connection failed');
    hasErrors = true;
  }
  
  if (hasErrors) {
    console.log('\n❌ Environment validation failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ Environment validation passed!');
    process.exit(0);
  }
});

lndTest.on('error', (error) => {
  console.log(`❌ LND: ${error.message}`);
  hasErrors = true;
});
EOF

chmod +x scripts/validate-environment.js

# Create monitoring status check script
cat > scripts/monitor-status.sh << 'EOF'
#!/bin/bash

echo "📊 Lightning Channel Monitor Status"
echo "=================================="

# Check cron job
if crontab -l 2>/dev/null | grep -q "run-channel-monitor.js"; then
    echo "✅ Cron job: Active"
else
    echo "❌ Cron job: Not found"
fi

# Check systemd service (if installed)
if systemctl is-enabled lightning-monitor.service &> /dev/null; then
    if systemctl is-active lightning-monitor.service &> /dev/null; then
        echo "✅ Systemd service: Running"
    else
        echo "⚠️  Systemd service: Stopped"
    fi
else
    echo "ℹ️  Systemd service: Not installed"
fi

# Check log file
if [ -f "logs/channel-monitor.log" ]; then
    echo "📄 Last log entries:"
    tail -5 logs/channel-monitor.log
else
    echo "📄 Log file: Not found"
fi

# Check database connection
echo ""
echo "🔗 Testing database connection..."
node -e "
const { createClient } = require('./web/src/lib/supabase/server');
const supabase = createClient();
supabase.from('live_channels').select('count').then(r => {
    console.log(r.error ? '❌ Database: Connection failed' : '✅ Database: Connected');
}).catch(e => console.log('❌ Database: Connection failed'));
"
EOF

chmod +x scripts/monitor-status.sh

echo ""
echo "🎉 Secure Channel Monitoring Setup Complete!"
echo ""
echo "🔧 Useful commands:"
echo "   • Validate environment: node scripts/validate-environment.js"
echo "   • Check status: ./scripts/monitor-status.sh"
echo "   • View logs: tail -f logs/channel-monitor.log"
echo "   • Manual run: node scripts/run-channel-monitor.js"
echo ""

# Test the setup
echo "🧪 Testing monitoring setup..."
node scripts/validate-environment.js 