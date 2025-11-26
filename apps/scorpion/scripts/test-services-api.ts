/**
 * Test Service Registry API Endpoints
 * Run with: tsx scripts/test-services-api.ts
 */

import { randomUUID } from 'crypto';

const BASE_URL = process.env.SCORPION_URL || 'http://localhost:3003';

interface ServiceRegistration {
  serviceName: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  status?: 'healthy' | 'unhealthy' | 'unknown';
  metadata?: Record<string, string>;
  tags?: string[];
}

async function testServiceRegistry() {
  console.log('🧪 Testing Service Registry API\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test 1: Register a service
  console.log('1️⃣  Testing service registration...');
  const serviceData: ServiceRegistration = {
    serviceName: 'test-scorpion-api',
    version: '1.0.0',
    host: 'localhost',
    port: 3003,
    protocol: 'http',
    status: 'healthy',
    metadata: {
      healthEndpoint: '/health',
      weight: '1.0',
    },
    tags: ['api', 'test'],
  };

  try {
    const registerResponse = await fetch(`${BASE_URL}/api/services/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Registration failed: ${error}`);
    }

    const registerResult = await registerResponse.json();
    console.log('   ✅ Service registered:', registerResult.data.id);
    const serviceId = registerResult.data.id;

    // Test 2: Discover services
    console.log('\n2️⃣  Testing service discovery...');
    const discoverResponse = await fetch(
      `${BASE_URL}/api/services/discover?serviceName=test-scorpion-api&healthyOnly=true`
    );

    if (!discoverResponse.ok) {
      throw new Error('Discovery failed');
    }

    const discoverResult = await discoverResponse.json();
    console.log('   ✅ Found services:', discoverResult.data.count);
    if (discoverResult.data.instances?.length > 0) {
      console.log('   📋 Service details:');
      discoverResult.data.instances.forEach((instance: any, i: number) => {
        console.log(`      ${i + 1}. ${instance.serviceName} @ ${instance.host}:${instance.port}`);
        console.log(`         Status: ${instance.status}`);
        if (instance.metadata) {
          console.log(`         Metadata: ${JSON.stringify(instance.metadata)}`);
        }
      });
    }

    // Test 3: List all services
    console.log('\n3️⃣  Testing list all services...');
    const listResponse = await fetch(`${BASE_URL}/api/services/discover`);

    if (!listResponse.ok) {
      throw new Error('List services failed');
    }

    const listResult = await listResponse.json();
    console.log('   ✅ Total services:', listResult.data.count);
    if (listResult.data.services?.length > 0) {
      console.log('   📋 Services:');
      listResult.data.services.slice(0, 5).forEach((service: any, i: number) => {
        console.log(`      ${i + 1}. ${service.serviceName} (${service.version}) - ${service.status}`);
      });
    }

    // Test 4: Health check
    console.log('\n4️⃣  Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/services/health`);

    if (!healthResponse.ok) {
      throw new Error('Health check failed');
    }

    const healthResult = await healthResponse.json();
    console.log('   ✅ Health check summary:');
    console.log(`      Total: ${healthResult.data.summary.total}`);
    console.log(`      Healthy: ${healthResult.data.summary.healthy}`);
    console.log(`      Unhealthy: ${healthResult.data.summary.unhealthy}`);
    console.log(`      Degraded: ${healthResult.data.summary.degraded}`);

    console.log('\n✅ All API tests passed!\n');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run tests
testServiceRegistry().catch(console.error);

