#!/usr/bin/env tsx
/**
 * Test Script for Transformer Architecture
 * 
 * Run smoke tests to validate transformer orchestrator
 * 
 * Usage:
 *   tsx apps/scorpion/scripts/test-transformer.ts
 * 
 * Environment:
 *   TRANSFORMER_DEBUG=true - Enable debug logging
 *   USE_OPENAI_EMBEDDINGS=true - Use OpenAI for embeddings
 */

import { runSmokeTests } from '../lib/transformer/smoke-tests';

async function main() {
  console.log('🧪 Transformer Architecture Smoke Tests\n');
  console.log('Environment:');
  console.log('  USE_TRANSFORMER_ORCHESTRATOR:', process.env.USE_TRANSFORMER_ORCHESTRATOR);
  console.log('  TRANSFORMER_DEBUG:', process.env.TRANSFORMER_DEBUG);
  console.log('  USE_OPENAI_EMBEDDINGS:', process.env.USE_OPENAI_EMBEDDINGS);
  console.log('');

  try {
    await runSmokeTests();
    console.log('\n✅ All tests passed! Transformer orchestrator is ready.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Tests failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

