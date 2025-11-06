#!/usr/bin/env tsx
/**
 * Sync Lightning tutorial content to vector embeddings
 * 
 * This script:
 * 1. Reads markdown files from /content/learn/lightning/
 * 2. Extracts titles and summaries
 * 3. Chunks large content for better embeddings
 * 4. Stores in Supabase loop_embeddings table
 * 
 * Usage: npx tsx scripts/sync-loop-embeddings.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { storeDocumentWithChunking, parseMarkdown } from '../src/lib/embeddings';

const CONTENT_DIR = path.join(process.cwd(), 'content/learn/lightning');

// Sample Lightning tutorial content to seed the database
const SAMPLE_TUTORIALS = [
  {
    filename: 'loop-out-basics.md',
    content: `# Loop Out Basics

Loop Out is a service that lets you get inbound liquidity without spending your Bitcoin on purchases.

## How Loop Out Works

When you open a Lightning channel, all the balance starts on your side (local balance). This means you can send payments but cannot receive them. Loop Out solves this by:

1. You send Bitcoin through Lightning to the Loop server
2. The Loop server sends Bitcoin back to you on-chain
3. This shifts balance to the remote side of your channel
4. Now you can receive payments through that channel

## Common Issues

### "Failed to find a path to destination"
This error means your node couldn't find a route to the Loop server. Try:
- Increasing your max routing fee
- Connecting to more peers
- Waiting for network conditions to improve

### "Incorrect payment details"
This usually happens with GUI clients like Ride the Lightning. Try:
- Using the command line interface instead
- Restarting your Lightning node
- Checking your Loop client version

### "Temporary channel failure"
One of the channels in the routing path ran out of liquidity. Try:
- Waiting 5-10 minutes and retrying
- Using a smaller amount
- Connecting to different peers`
  },
  {
    filename: 'channel-opening-guide.md',
    content: `# Channel Opening Guide

Opening Lightning channels is how you connect to the Lightning Network and start earning routing fees.

## Finding Good Peers

Use 1ML.com to find well-connected nodes:
- Look for high capacity (>1 BTC)
- Many channels (>100)
- Long uptime (>1 year)
- Good connectivity

## Minimum Channel Sizes

Different nodes have different requirements:
- Fold: 0.05 BTC minimum (5,000,000 sats)
- LNBig: 100,000 sats minimum
- ACINQ: 20,000 sats minimum

## Fee Estimation

Check mempool.space for current fees:
- Next block: High priority (expensive)
- Within 6 blocks: Medium priority
- Within 144 blocks: Low priority (cheaper)

A typical channel opening costs 250-500 bytes, so multiply by current sat/byte rate.

## Common Errors

### "Channel too small"
The peer has a minimum channel size requirement. Either:
- Increase your channel amount
- Find a different peer with lower minimums
- Check the peer's requirements on 1ML

### "Connection failed"
The peer might be offline or unreachable. Try:
- Checking the pubkey is correct
- Waiting and retrying
- Finding an alternative peer`
  },
  {
    filename: 'routing-troubleshooting.md',
    content: `# Routing Troubleshooting

When Lightning payments fail, it's usually due to routing issues. Here's how to diagnose and fix them.

## Payment Routing Basics

Lightning payments travel through multiple nodes:
1. Your node finds a path to the destination
2. Each hop forwards the payment
3. If any hop fails, the whole payment fails

## Common Routing Failures

### "No route found"
- Network doesn't have enough liquidity for your payment
- Try smaller amounts
- Connect to more peers
- Increase fee limits

### "Route too long"
- Payment requires too many hops (>20)
- Try connecting closer to your destination
- Use a different route

### "Insufficient liquidity"
- One channel in the path doesn't have enough balance
- Wait for balances to shift
- Try different amount
- Use circular rebalancing

## Improving Routing

### Connect to Hub Nodes
- ACINQ, LNBig, Bitrefill
- These have many connections
- Higher success rates

### Monitor Channel Balances
- Keep channels balanced (50/50 if possible)
- Use rebalancing tools
- Monitor incoming/outgoing flows

### Set Competitive Fees
- Check fee rates of similar nodes
- Too high = no routing through you
- Too low = unprofitable`
  },
  {
    filename: 'lightning-network-overview.md',
    content: `# Lightning Network Overview

The Lightning Network is a "layer 2" payment protocol that operates on top of Bitcoin. It enables fast, cheap transactions while maintaining Bitcoin's security.

## How Lightning Works

Lightning uses payment channels between nodes:
1. Two parties create a multisig address
2. They deposit Bitcoin into this address
3. They can update balances instantly off-chain
4. Only opening and closing require on-chain transactions

## Scalability Benefits

- Bitcoin: ~7 transactions per second
- Visa: ~4,000 TPS average, 65,000 TPS peak
- Lightning: Millions of TPS possible

## Real-World Example: Coffee Shop

Bob wants to buy coffee regularly:
1. Bob opens channel with 0.05 BTC, coffee shop deposits 0
2. Bob can now buy hundreds of coffees instantly
3. Each purchase shifts balance toward coffee shop
4. Only the final closing transaction hits the blockchain

## Security Model

Lightning inherits Bitcoin's security:
- Multisig addresses protect funds
- HTLCs ensure atomic payments
- Watchtowers can monitor for cheating
- Non-custodial: you control your keys

## Limitations

- Requires online nodes for receiving
- Channel liquidity limits payment size  
- Complex routing can fail
- Backup requirements are more complex

## Getting Started

1. Run a Lightning node (LND, CLN, Eclair)
2. Fund your on-chain wallet
3. Open channels to well-connected peers
4. Start sending and receiving payments

The network effect makes Lightning more useful as more people join.`
  }
];

async function ensureContentDirectory() {
  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    console.log(`✓ Content directory ready: ${CONTENT_DIR}`);
  } catch (error) {
    console.error('Failed to create content directory:', error);
    throw error;
  }
}

async function writeSampleTutorials() {
  console.log('📝 Writing sample tutorials...');
  
  for (const tutorial of SAMPLE_TUTORIALS) {
    const filePath = path.join(CONTENT_DIR, tutorial.filename);
    
    try {
      await fs.writeFile(filePath, tutorial.content, 'utf-8');
      console.log(`✓ Written: ${tutorial.filename}`);
    } catch (error) {
      console.error(`Failed to write ${tutorial.filename}:`, error);
    }
  }
}

async function syncTutorialsToEmbeddings() {
  console.log('🔄 Syncing tutorials to vector embeddings...');
  
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    if (markdownFiles.length === 0) {
      console.log('📝 No markdown files found, creating sample tutorials...');
      await writeSampleTutorials();
      return syncTutorialsToEmbeddings(); // Retry after creating samples
    }
    
    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      console.log(`Processing: ${file}...`);
      
      const { title, summary } = parseMarkdown(content);
      console.log(`  Title: ${title || 'No title'}`);
      console.log(`  Summary: ${summary ? summary.slice(0, 100) + '...' : 'No summary'}`);
      
      const metadata = {
        source: file,
        source_type: 'tutorial',
        category: 'lightning_network',
        sync_date: new Date().toISOString()
      };
      
      try {
        const chunkIds = await storeDocumentWithChunking(content, metadata, 800);
        console.log(`✓ Stored ${file} as ${chunkIds.length} chunks`);
      } catch (error) {
        console.error(`Failed to store ${file}:`, error);
      }
    }
    
    console.log('🎉 Sync completed successfully!');
    
  } catch (error) {
    console.error('Failed to sync tutorials:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Lightning tutorial sync...');
  
  try {
    await ensureContentDirectory();
    await syncTutorialsToEmbeddings();
    
    console.log('\n✅ All done! Your Lightning tutorials are now searchable via vector embeddings.');
    console.log('\n🔧 Next steps:');
    console.log('1. Run the Supabase migration: web/sql/embeddings_migration.sql');
    console.log('2. Test vector search: /api/ai/search-loop');
    console.log('3. Try the troubleshooter: /api/ai/loop-troubleshooter');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 