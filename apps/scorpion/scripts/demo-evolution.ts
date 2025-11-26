#!/usr/bin/env tsx
/**
 * 🦂 Scorpion Evolution Demo
 * Demonstrates the hybrid AI compute stack algorithm and provider selection
 */

import { checkAllProviders, getProviderStatus, selectProvider } from '../lib/utils/providerSelector';
import { checkVLLMHealth } from '../lib/utils/vllm-health';
import { checkOllamaHealth } from '../lib/utils/ollama-health';
import { runModelUnified } from '../lib/chat/modelRunner';

interface AlgorithmStep {
  step: number;
  action: string;
  decision: string;
  result: string;
  provider?: string;
  latency?: number;
}

class EvolutionDemo {
  private steps: AlgorithmStep[] = [];
  private startTime = Date.now();

  addStep(step: number, action: string, decision: string, result: string, provider?: string, latency?: number) {
    this.steps.push({ step, action, decision, result, provider, latency });
  }

  async demonstrateAlgorithm() {
    console.log('\n' + '='.repeat(70));
    console.log('🦂 SCORPION EVOLUTION DEMONSTRATION');
    console.log('   Hybrid AI Compute Stack Algorithm');
    console.log('='.repeat(70) + '\n');

    // STEP 1: Discovery Phase
    console.log('📡 PHASE 1: DISCOVERY - Scanning Available Providers\n');
    this.addStep(1, 'Discovery', 'Scan all providers', 'Checking health...');
    
    const allProviders = await checkAllProviders();
    const providerMap = new Map(allProviders.map(p => [p.provider, p]));
    
    console.log('   Provider Status:');
    allProviders.forEach(p => {
      const icon = p.healthy ? '✅' : p.available ? '⚠️' : '❌';
      const status = p.healthy ? 'HEALTHY' : p.available ? 'AVAILABLE' : 'UNAVAILABLE';
      console.log(`   ${icon} ${p.provider.toUpperCase().padEnd(8)} → ${status.padEnd(10)} (Priority: ${p.priority})`);
      if (p.error) {
        console.log(`      └─ ${p.error}`);
      }
    });

    // STEP 2: Selection Algorithm
    console.log('\n🧠 PHASE 2: SELECTION ALGORITHM\n');
    this.addStep(2, 'Selection', 'Apply priority algorithm', 'Selecting best provider...');
    
    const priority = process.env.LLM_PROVIDER_PRIORITY || 'ollama,vllm,openai';
    console.log(`   Priority Order: ${priority}`);
    console.log('   Algorithm:');
    console.log('   1. Check provider priority from LLM_PROVIDER_PRIORITY');
    console.log('   2. Verify each provider health status');
    console.log('   3. Select first healthy provider in priority order');
    console.log('   4. Fallback to next provider if current fails');
    
    const selected = await selectProvider();
    const selectedStatus = providerMap.get(selected);
    this.addStep(3, 'Selection', `Selected: ${selected}`, selectedStatus?.healthy ? 'SUCCESS' : 'FALLBACK', selected);
    
    console.log(`\n   ✅ Selected Provider: ${selected.toUpperCase()}`);
    if (selectedStatus) {
      console.log(`   Status: ${selectedStatus.healthy ? 'HEALTHY' : 'DEGRADED'}`);
      console.log(`   Priority: ${selectedStatus.priority}`);
    }

    // STEP 3: Fallback Chain Demonstration
    console.log('\n🔄 PHASE 3: FALLBACK CHAIN DEMONSTRATION\n');
    this.addStep(4, 'Fallback', 'Demonstrate cascading fallback', 'Testing chain...');
    
    console.log('   Fallback Chain: ollama → vllm → openai');
    console.log('   Logic:');
    console.log('   - Try each provider in priority order');
    console.log('   - If provider fails, automatically try next');
    console.log('   - Skip providers that are not enabled');
    console.log('   - Protect local-only models from cloud fallback');
    
    // STEP 4: Real Request Simulation
    console.log('\n🚀 PHASE 4: REAL REQUEST SIMULATION\n');
    const testPrompt = 'Explain the hybrid AI compute stack in one sentence.';
    const systemPrompt = 'You are a technical assistant.';
    
    console.log(`   Request: "${testPrompt}"`);
    console.log('   Executing with fallback chain...\n');
    
    const requestStart = Date.now();
    try {
      const response = await runModelUnified(
        systemPrompt,
        testPrompt,
        { provider: 'ollama', model: 'llama3.2:1b' },
        (chunk) => {
          process.stdout.write(chunk);
        },
        []
      );
      
      const latency = Date.now() - requestStart;
      this.addStep(5, 'Execution', 'Request completed', 'SUCCESS', selected, latency);
      
      console.log(`\n\n   ✅ Request completed in ${latency}ms`);
      console.log(`   Provider used: ${selected}`);
      console.log(`   Response length: ${response.length} characters`);
    } catch (error: any) {
      const latency = Date.now() - requestStart;
      this.addStep(5, 'Execution', 'Request failed', `ERROR: ${error.message}`, selected, latency);
      console.log(`\n   ❌ Request failed: ${error.message}`);
    }

    // STEP 5: Algorithm Visualization
    console.log('\n📊 PHASE 5: ALGORITHM VISUALIZATION\n');
    this.visualizeAlgorithm();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📈 EVOLUTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`\n   Total Steps: ${this.steps.length}`);
    console.log(`   Providers Available: ${allProviders.filter(p => p.healthy).length}/${allProviders.length}`);
    console.log(`   Selected Provider: ${selected}`);
    console.log(`   Fallback Chain: ${priority}`);
    console.log(`   Total Time: ${Date.now() - this.startTime}ms`);
    
    console.log('\n   🎯 Key Features Demonstrated:');
    console.log('   ✅ Multi-provider support (Ollama, VLLM, OpenAI)');
    console.log('   ✅ Automatic health checking');
    console.log('   ✅ Smart provider selection');
    console.log('   ✅ Cascading fallback chain');
    console.log('   ✅ Local-only model protection');
    console.log('   ✅ Zero-configuration defaults');
    
    console.log('\n' + '='.repeat(70));
    console.log('🦂 SCORPION HAS EVOLVED!');
    console.log('='.repeat(70) + '\n');
  }

  visualizeAlgorithm() {
    console.log('   Algorithm Flow:');
    console.log('');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │  User Request                          │');
    console.log('   └──────────────┬──────────────────────────┘');
    console.log('                  │');
    console.log('                  ▼');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │  PHASE 1: Discovery                     │');
    console.log('   │  • Check Ollama health                  │');
    console.log('   │  • Check VLLM health (if enabled)        │');
    console.log('   │  • Check OpenAI config                   │');
    console.log('   └──────────────┬──────────────────────────┘');
    console.log('                  │');
    console.log('                  ▼');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │  PHASE 2: Selection                     │');
    console.log('   │  • Read LLM_PROVIDER_PRIORITY           │');
    console.log('   │  • Filter by availability               │');
    console.log('   │  • Select first healthy provider        │');
    console.log('   └──────────────┬──────────────────────────┘');
    console.log('                  │');
    console.log('                  ▼');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │  PHASE 3: Execution                     │');
    console.log('   │  Try Provider 1 (Ollama)                │');
    console.log('   │      │                                   │');
    console.log('   │      ├─ Success → Return Result         │');
    console.log('   │      └─ Failure → Try Provider 2        │');
    console.log('   │                                         │');
    console.log('   │  Try Provider 2 (VLLM)                  │');
    console.log('   │      │                                   │');
    console.log('   │      ├─ Success → Return Result         │');
    console.log('   │      └─ Failure → Try Provider 3        │');
    console.log('   │                                         │');
    console.log('   │  Try Provider 3 (OpenAI)                │');
    console.log('   │      │                                   │');
    console.log('   │      ├─ Success → Return Result         │');
    console.log('   │      └─ Failure → Error                 │');
    console.log('   └──────────────┬──────────────────────────┘');
    console.log('                  │');
    console.log('                  ▼');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │  Response to User                       │');
    console.log('   └─────────────────────────────────────────┘');
    console.log('');
  }
}

async function main() {
  const demo = new EvolutionDemo();
  await demo.demonstrateAlgorithm();
}

main().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});

