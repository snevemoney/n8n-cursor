#!/usr/bin/env node
/**
 * Test script to verify SSD detection works
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Change to scorpion directory
process.chdir(join(__dirname, '..'));

async function testStorageDetection() {
  console.log('🧪 Testing Storage Detection System\n');
  
  try {
    // Import the storage detection module
    const { detectStorage } = await import('../lib/storage/storage-detector.ts');
    const { initializeStorageConfig, getStorageConfig } = await import('../lib/storage/storage-config.ts');
    const { getPerformanceConfig, getActiveOptimizations } = await import('../lib/storage/performance-optimizer.ts');
    
    console.log('1. Detecting storage...');
    const detection = await detectStorage();
    console.log('   ✓ Detection complete');
    console.log(`   - Detected SSD: ${detection.isSSD ? 'YES' : 'NO'}`);
    console.log(`   - SSD Path: ${detection.detectedSSDPath || 'None'}`);
    console.log(`   - Storage Info: ${detection.storageInfo ? detection.storageInfo.type : 'None'}`);
    
    if (detection.storageInfo) {
      console.log(`   - Read Speed: ${detection.storageInfo.readSpeed.toFixed(2)} MB/s`);
      console.log(`   - Write Speed: ${detection.storageInfo.writeSpeed.toFixed(2)} MB/s`);
      console.log(`   - Latency: ${detection.storageInfo.latency.toFixed(2)} ms`);
    }
    
    console.log('\n2. Initializing storage config...');
    const config = await initializeStorageConfig();
    console.log('   ✓ Config initialized');
    console.log(`   - Data Directory: ${config.dataDir}`);
    console.log(`   - Media Temp Directory: ${config.mediaTempDir}`);
    console.log(`   - Using SSD: ${config.isSSD ? 'YES' : 'NO'}`);
    
    console.log('\n3. Checking performance config...');
    const perfConfig = await getPerformanceConfig();
    const optimizations = await getActiveOptimizations();
    console.log('   ✓ Performance config loaded');
    console.log(`   - Workflow Batch Size: ${perfConfig.workflowSyncBatchSize}`);
    console.log(`   - Media Concurrency: ${perfConfig.mediaProcessingConcurrency}`);
    console.log(`   - Active Optimizations: ${optimizations.length > 0 ? optimizations.join(', ') : 'None'}`);
    
    console.log('\n✅ All tests passed!');
    
    if (config.isSSD) {
      console.log('\n🚀 SSD MODE ACTIVATED!');
      console.log(`   Performance optimizations are enabled.`);
    } else {
      console.log('\n💾 Running in HDD mode (default)');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testStorageDetection();

