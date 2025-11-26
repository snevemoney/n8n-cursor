#!/usr/bin/env tsx
/**
 * Integration Verification - Verify all components are connected
 */

import { runModelUnified } from '../lib/chat/modelRunner';
import { getProviderStatus } from '../lib/utils/providerSelector';
import { checkOllamaHealth } from '../lib/utils/ollama-health';
import { checkVLLMHealth } from '../lib/utils/vllm-health';

interface IntegrationCheck {
  component: string;
  status: 'connected' | 'disconnected' | 'optional';
  details: string;
}

async function verifyIntegration(): Promise<IntegrationCheck[]> {
  const checks: IntegrationCheck[] = [];

  // 1. Model Runner Integration
  console.log('🔍 Checking Model Runner Integration...');
  try {
    const testResult = await runModelUnified(
      'You are a test assistant.',
      'Say "integration test" and nothing else.',
      { provider: 'ollama', model: 'llama3.2:1b' },
      undefined,
      []
    );
    checks.push({
      component: 'Model Runner (runModelUnified)',
      status: 'connected',
      details: `✅ Working - Response: ${testResult.substring(0, 30)}...`
    });
  } catch (error: any) {
    checks.push({
      component: 'Model Runner (runModelUnified)',
      status: 'disconnected',
      details: `❌ Error: ${error.message}`
    });
  }

  // 2. Provider Selector Integration
  console.log('🔍 Checking Provider Selector Integration...');
  try {
    const status = await getProviderStatus();
    checks.push({
      component: 'Provider Selector',
      status: 'connected',
      details: `✅ Working - Selected: ${status.selected}, Available: ${status.all.filter(p => p.healthy).length}/${status.all.length}`
    });
  } catch (error: any) {
    checks.push({
      component: 'Provider Selector',
      status: 'disconnected',
      details: `❌ Error: ${error.message}`
    });
  }

  // 3. Health Check Integration
  console.log('🔍 Checking Health Check Integration...');
  try {
    const ollamaHealth = await checkOllamaHealth();
    checks.push({
      component: 'Ollama Health Check',
      status: ollamaHealth.healthy ? 'connected' : 'disconnected',
      details: ollamaHealth.healthy 
        ? `✅ Ollama is healthy`
        : `⚠️ Ollama is ${ollamaHealth.available ? 'available but unhealthy' : 'unavailable'}`
    });
  } catch (error: any) {
    checks.push({
      component: 'Ollama Health Check',
      status: 'disconnected',
      details: `❌ Error: ${error.message}`
    });
  }

  // 4. VLLM Integration (Optional)
  console.log('🔍 Checking VLLM Integration (Optional)...');
  try {
    const vllmHealth = await checkVLLMHealth();
    checks.push({
      component: 'VLLM Health Check',
      status: vllmHealth.healthy ? 'connected' : 'optional',
      details: vllmHealth.healthy 
        ? `✅ VLLM is healthy and ready`
        : `⚠️ VLLM is ${vllmHealth.available ? 'available but unhealthy' : 'not enabled (optional)'}`
    });
  } catch (error: any) {
    checks.push({
      component: 'VLLM Health Check',
      status: 'optional',
      details: `⚠️ VLLM not configured (optional feature)`
    });
  }

  // 5. Chat API Integration (Check if route exists)
  console.log('🔍 Checking Chat API Integration...');
  try {
    const { readFileSync } = await import('fs');
    const chatRoute = readFileSync('app/api/chat/stream/route.ts', 'utf-8');
    const hasRunModelUnified = chatRoute.includes('runModelUnified');
    checks.push({
      component: 'Chat API Integration',
      status: hasRunModelUnified ? 'connected' : 'disconnected',
      details: hasRunModelUnified 
        ? `✅ Chat API uses runModelUnified`
        : `❌ Chat API not using runModelUnified`
    });
  } catch (error: any) {
    checks.push({
      component: 'Chat API Integration',
      status: 'disconnected',
      details: `❌ Error checking: ${error.message}`
    });
  }

  return checks;
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🦂 SCORPION INTEGRATION VERIFICATION');
  console.log('='.repeat(70) + '\n');

  const checks = await verifyIntegration();

  console.log('\n📊 Integration Status:\n');
  checks.forEach((check, index) => {
    const icon = check.status === 'connected' ? '✅' : check.status === 'optional' ? '⚠️' : '❌';
    console.log(`${index + 1}. ${icon} ${check.component}`);
    console.log(`   ${check.details}\n`);
  });

  const connected = checks.filter(c => c.status === 'connected').length;
  const total = checks.filter(c => c.status !== 'optional').length;
  const optional = checks.filter(c => c.status === 'optional').length;

  console.log('='.repeat(70));
  console.log('📈 Summary:');
  console.log(`   Connected: ${connected}/${total}`);
  console.log(`   Optional: ${optional}`);
  console.log(`   Status: ${connected === total ? '✅ READY' : '⚠️ PARTIAL'}`);
  console.log('='.repeat(70) + '\n');

  if (connected === total) {
    console.log('🎉 All critical components are connected and ready!');
    console.log('🦂 Scorpion is ready to demonstrate its evolution!\n');
    process.exit(0);
  } else {
    console.log('⚠️ Some components need attention. Check details above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});

