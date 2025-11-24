#!/usr/bin/env tsx
/**
 * Test script for LLM provider integration
 * Tests: VLLM health, provider selection, fallback chain, backward compatibility
 */

import { checkVLLMHealth, listVLLMModels } from '../lib/utils/vllm-health';
import { checkOllamaHealth } from '../lib/utils/ollama-health';
import { getProviderStatus, selectProvider, checkAllProviders } from '../lib/utils/providerSelector';
import { runModelUnified } from '../lib/chat/modelRunner';

async function testVLLMHealth() {
  console.log('\n🧪 Testing VLLM Health...');
  const vllmUrl = process.env.VLLM_API_URL || 'http://localhost:8000';
  
  try {
    const health = await checkVLLMHealth(vllmUrl);
    console.log(`  Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`  URL: ${health.url}`);
    if (health.error) {
      console.log(`  Error: ${health.error}`);
    }
    
    if (health.healthy) {
      const models = await listVLLMModels(vllmUrl);
      console.log(`  Available models: ${models.length > 0 ? models.join(', ') : 'None'}`);
    }
    
    return health.healthy;
  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function testOllamaHealth() {
  console.log('\n🧪 Testing Ollama Health...');
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const health = await checkOllamaHealth(ollamaUrl);
    console.log(`  Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (health.error) {
      console.log(`  Error: ${health.error}`);
    }
    return health.healthy;
  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function testProviderSelection() {
  console.log('\n🧪 Testing Provider Selection...');
  
  try {
    const status = await getProviderStatus();
    console.log(`  Selected Provider: ${status.selected}`);
    console.log(`  Recommendation: ${status.recommendation}`);
    console.log('\n  Provider Status:');
    status.all.forEach(provider => {
      const icon = provider.healthy ? '✅' : provider.available ? '⚠️' : '❌';
      console.log(`    ${icon} ${provider.provider}: ${provider.healthy ? 'Healthy' : provider.available ? 'Available but unhealthy' : 'Unavailable'}`);
      if (provider.error) {
        console.log(`      Error: ${provider.error}`);
      }
    });
    return status.selected;
  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function testFallbackChain() {
  console.log('\n🧪 Testing Fallback Chain...');
  
  const testPrompt = 'Say "Hello from provider test" and nothing else.';
  const systemPrompt = 'You are a helpful assistant.';
  
  try {
    console.log('  Attempting to run model with fallback chain...');
    const result = await runModelUnified(
      systemPrompt,
      testPrompt,
      { provider: 'ollama', model: 'llama3.2:1b' }, // Use small model for testing
      undefined, // No streaming for test
      []
    );
    
    console.log(`  ✅ Success! Response: ${result.substring(0, 100)}...`);
    return true;
  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function testBackwardCompatibility() {
  console.log('\n🧪 Testing Backward Compatibility...');
  
  // Test that old environment variables still work
  const oldLLMPrimary = process.env.LLM_PRIMARY;
  const oldLLMFallback = process.env.LLM_FALLBACK;
  
  try {
    // Test with old-style config (should still work)
    process.env.LLM_PRIMARY = 'ollama';
    process.env.LLM_FALLBACK = 'openai';
    
    const testPrompt = 'Say "backward compatibility test" and nothing else.';
    const result = await runModelUnified(
      'You are a test assistant.',
      testPrompt,
      { provider: 'ollama', model: 'llama3.2:1b' },
      undefined,
      []
    );
    
    console.log(`  ✅ Old config still works! Response: ${result.substring(0, 50)}...`);
    
    // Restore
    if (oldLLMPrimary) process.env.LLM_PRIMARY = oldLLMPrimary;
    if (oldLLMFallback) process.env.LLM_FALLBACK = oldLLMFallback;
    
    return true;
  } catch (error: any) {
    console.log(`  ⚠️  Warning: ${error.message}`);
    // Restore even on error
    if (oldLLMPrimary) process.env.LLM_PRIMARY = oldLLMPrimary;
    if (oldLLMFallback) process.env.LLM_FALLBACK = oldLLMFallback;
    return false;
  }
}

async function main() {
  console.log('🚀 Scorpion Provider Integration Tests\n');
  console.log('=' .repeat(50));
  
  const results = {
    vllm: false,
    ollama: false,
    providerSelection: false,
    fallbackChain: false,
    backwardCompatibility: false,
  };
  
  // Test individual providers
  results.vllm = await testVLLMHealth();
  results.ollama = await testOllamaHealth();
  
  // Test provider selection
  const selectedProvider = await testProviderSelection();
  results.providerSelection = selectedProvider !== null;
  
  // Test fallback chain (only if at least one provider is available)
  if (results.ollama || results.vllm) {
    results.fallbackChain = await testFallbackChain();
  } else {
    console.log('\n⚠️  Skipping fallback chain test - no providers available');
  }
  
  // Test backward compatibility
  results.backwardCompatibility = await testBackwardCompatibility();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary\n');
  console.log(`  VLLM Health: ${results.vllm ? '✅' : '❌'}`);
  console.log(`  Ollama Health: ${results.ollama ? '✅' : '❌'}`);
  console.log(`  Provider Selection: ${results.providerSelection ? '✅' : '❌'}`);
  console.log(`  Fallback Chain: ${results.fallbackChain ? '✅' : '⚠️'}`);
  console.log(`  Backward Compatibility: ${results.backwardCompatibility ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(r => r !== false);
  const criticalPassed = results.ollama && results.providerSelection && results.backwardCompatibility;
  
  console.log('\n' + '='.repeat(50));
  if (criticalPassed) {
    console.log('✅ Critical tests passed! Scorpion is ready to use.');
    if (!allPassed) {
      console.log('⚠️  Some optional tests failed (VLLM, fallback chain) - this is OK if you\'re not using those features.');
    }
  } else {
    console.log('❌ Critical tests failed. Please check your setup.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

