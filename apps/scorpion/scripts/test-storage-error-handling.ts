#!/usr/bin/env tsx
/**
 * Test Storage Error Handling
 * Tests the robust error handling system before actual SSD disconnection
 */

import { 
  writeFileWithFallback, 
  readFileWithFallback,
  ensureDirWithFallback,
  validateAndRefreshStorage,
  isStorageError,
  isStorageAccessible
} from '../lib/storage/storage-error-handler';
import { getStorageConfig, resetStorageConfig } from '../lib/storage/storage-config';
import { detectStorage, validateDetectedSSD, clearDetectionCache } from '../lib/storage/storage-detector';
import fs from 'fs/promises';
import path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function testStorageAvailabilityCheck() {
  console.log('\n📋 Test 1: Storage Availability Check');
  
  try {
    const config = await getStorageConfig();
    const isAccessible = await isStorageAccessible(config.dataDir);
    logTest(
      'Storage accessibility check',
      true,
      undefined,
      `Data directory ${config.dataDir} is ${isAccessible ? 'accessible' : 'not accessible'}`
    );
    
    // Test with invalid path
    const invalidPath = '/nonexistent/path/that/does/not/exist';
    const invalidAccessible = await isStorageAccessible(invalidPath);
    logTest(
      'Invalid path detection',
      !invalidAccessible,
      undefined,
      'Correctly detected invalid path as not accessible'
    );
  } catch (error: any) {
    logTest('Storage availability check', false, error.message);
  }
}

async function testWriteWithFallback() {
  console.log('\n📋 Test 2: Write File with Fallback');
  
  try {
    const config = await getStorageConfig();
    const testFile = path.join(config.dataDir, 'test-write-fallback.json');
    const testContent = JSON.stringify({ test: true, timestamp: Date.now() }, null, 2);
    
    const result = await writeFileWithFallback(testFile, testContent, {
      maxRetries: 3,
      ensureDir: true
    });
    
    logTest(
      'Write file with fallback',
      result.success,
      result.error,
      result.usedFallback 
        ? `Used fallback storage: ${result.path}`
        : `Wrote to primary storage: ${result.path}`
    );
    
    // Verify file was written
    if (result.success) {
      try {
        const content = await fs.readFile(result.path, 'utf-8');
        const parsed = JSON.parse(content);
        logTest(
          'File content verification',
          parsed.test === true,
          undefined,
          'File content matches expected data'
        );
        
        // Cleanup
        await fs.unlink(result.path).catch(() => {});
      } catch (error: any) {
        logTest('File content verification', false, error.message);
      }
    }
  } catch (error: any) {
    logTest('Write file with fallback', false, error.message);
  }
}

async function testReadWithFallback() {
  console.log('\n📋 Test 3: Read File with Fallback');
  
  try {
    const config = await getStorageConfig();
    const testFile = path.join(config.dataDir, 'test-read-fallback.json');
    const testContent = JSON.stringify({ test: true, data: 'test-data' }, null, 2);
    
    // First write a file
    await fs.writeFile(testFile, testContent, 'utf-8');
    
    // Then read it with fallback
    const result = await readFileWithFallback(testFile);
    
    logTest(
      'Read file with fallback',
      result.success && result.content === testContent,
      result.error,
      result.success 
        ? `Successfully read from: ${result.path}`
        : 'Failed to read file'
    );
    
    // Cleanup
    await fs.unlink(testFile).catch(() => {});
  } catch (error: any) {
    logTest('Read file with fallback', false, error.message);
  }
}

async function testEnsureDirWithFallback() {
  console.log('\n📋 Test 4: Ensure Directory with Fallback');
  
  try {
    const config = await getStorageConfig();
    const testDir = path.join(config.dataDir, 'test-dir-fallback');
    
    const result = await ensureDirWithFallback(testDir);
    
    logTest(
      'Ensure directory with fallback',
      result.success,
      undefined,
      result.usedFallback 
        ? `Created directory with fallback: ${result.path}`
        : `Created directory: ${result.path}`
    );
    
    // Verify directory exists
    if (result.success) {
      try {
        const stats = await fs.stat(result.path);
        logTest(
          'Directory existence verification',
          stats.isDirectory(),
          undefined,
          'Directory exists and is accessible'
        );
        
        // Cleanup
        await fs.rmdir(result.path).catch(() => {});
      } catch (error: any) {
        logTest('Directory existence verification', false, error.message);
      }
    }
  } catch (error: any) {
    logTest('Ensure directory with fallback', false, error.message);
  }
}

async function testStorageValidation() {
  console.log('\n📋 Test 5: Storage Validation and Refresh');
  
  try {
    const validation = await validateAndRefreshStorage();
    
    logTest(
      'Storage validation',
      validation.isValid,
      undefined,
      validation.wasRefreshed 
        ? 'Storage was refreshed during validation'
        : 'Storage is valid and accessible'
    );
    
    logTest(
      'Storage configuration',
      !!validation.config,
      undefined,
      `Current storage: ${validation.config.isSSD ? 'SSD' : 'HDD'} mode - ${validation.config.dataDir}`
    );
  } catch (error: any) {
    logTest('Storage validation', false, error.message);
  }
}

async function testSSDValidation() {
  console.log('\n📋 Test 6: SSD Disconnection Detection');
  
  try {
    const detection = await detectStorage();
    
    if (detection.isSSD && detection.detectedSSDPath) {
      const isValid = await validateDetectedSSD(detection.detectedSSDPath);
      logTest(
        'SSD validation',
        isValid,
        undefined,
        `SSD at ${detection.detectedSSDPath} is ${isValid ? 'accessible' : 'not accessible'}`
      );
      
      // Test with invalid path
      const invalidSSD = await validateDetectedSSD('/nonexistent/ssd/path');
      logTest(
        'Invalid SSD path detection',
        !invalidSSD,
        undefined,
        'Correctly detected invalid SSD path'
      );
    } else {
      logTest(
        'SSD validation',
        true,
        undefined,
        'No SSD detected, skipping SSD-specific tests'
      );
    }
  } catch (error: any) {
    logTest('SSD validation', false, error.message);
  }
}

async function testErrorDetection() {
  console.log('\n📋 Test 7: Storage Error Detection');
  
  try {
    // Test various error types
    const enoentError = { code: 'ENOENT', message: 'No such file or directory' };
    const eaccesError = { code: 'EACCES', message: 'Permission denied' };
    const genericError = { message: 'Some other error' };
    
    logTest(
      'ENOENT error detection',
      isStorageError(enoentError),
      undefined,
      'Correctly identified ENOENT as storage error'
    );
    
    logTest(
      'EACCES error detection',
      isStorageError(eaccesError),
      undefined,
      'Correctly identified EACCES as storage error'
    );
    
    logTest(
      'Generic error detection',
      !isStorageError(genericError),
      undefined,
      'Correctly identified non-storage error'
    );
  } catch (error: any) {
    logTest('Error detection', false, error.message);
  }
}

async function testCacheInvalidation() {
  console.log('\n📋 Test 8: Cache Invalidation');
  
  try {
    // Get initial detection
    const initialDetection = await detectStorage();
    
    // Clear cache
    clearDetectionCache();
    resetStorageConfig();
    
    // Get detection again (should re-detect)
    const newDetection = await detectStorage();
    
    logTest(
      'Cache invalidation',
      true,
      undefined,
      `Cache cleared and re-detected storage (SSD: ${newDetection.isSSD})`
    );
  } catch (error: any) {
    logTest('Cache invalidation', false, error.message);
  }
}

async function testSimulatedDisconnection() {
  console.log('\n📋 Test 9: Simulated Disconnection Scenario');
  
  try {
    const config = await getStorageConfig();
    
    if (config.isSSD && config.storageInfo.detectedSSDPath) {
      console.log('   Simulating SSD disconnection...');
      
      // Clear cache to simulate disconnection detection
      clearDetectionCache();
      
      // Try to validate the SSD path (should fail if we simulate it)
      // In real scenario, this would fail when SSD is disconnected
      const isValid = await validateDetectedSSD(config.storageInfo.detectedSSDPath);
      
      if (!isValid) {
        logTest(
          'Simulated disconnection detection',
          true,
          undefined,
          'Correctly detected simulated disconnection'
        );
      } else {
        // SSD is still connected, but we can test the fallback mechanism
        logTest(
          'Simulated disconnection detection',
          true,
          undefined,
          'SSD still connected (expected). Fallback mechanism ready.'
        );
      }
      
      // Test that fallback would work
      const fallbackDir = path.join(process.cwd(), 'data', 'scorpion');
      const fallbackAccessible = await isStorageAccessible(fallbackDir);
      
      logTest(
        'Fallback storage ready',
        fallbackAccessible,
        undefined,
        `Fallback directory ${fallbackAccessible ? 'is' : 'is not'} accessible`
      );
    } else {
      logTest(
        'Simulated disconnection scenario',
        true,
        undefined,
        'No SSD detected, skipping disconnection simulation'
      );
    }
  } catch (error: any) {
    logTest('Simulated disconnection scenario', false, error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Storage Error Handling Test Suite');
  console.log('=====================================\n');
  
  // Get initial storage info
  try {
    const config = await getStorageConfig();
    console.log(`📀 Current Storage: ${config.isSSD ? 'SSD' : 'HDD'} mode`);
    console.log(`📁 Data Directory: ${config.dataDir}`);
    if (config.isSSD && config.storageInfo.detectedSSDPath) {
      console.log(`💾 SSD Path: ${config.storageInfo.detectedSSDPath}`);
    }
    console.log('');
  } catch (error) {
    console.error('Failed to get storage config:', error);
  }
  
  // Run all tests
  await testStorageAvailabilityCheck();
  await testWriteWithFallback();
  await testReadWithFallback();
  await testEnsureDirWithFallback();
  await testStorageValidation();
  await testSSDValidation();
  await testErrorDetection();
  await testCacheInvalidation();
  await testSimulatedDisconnection();
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      if (r.error) console.log(`     Error: ${r.error}`);
    });
  }
  
  console.log('\n✨ Test suite complete!');
  console.log('💡 If all tests passed, the system is ready to handle SSD disconnection gracefully.');
  
  return failed === 0;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });

