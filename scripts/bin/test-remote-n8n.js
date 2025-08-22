#!/usr/bin/env node

/**
 * Test script to verify connection to remote n8n instance
 */

import fetch from 'node-fetch';

const config = {
  baseUrl: 'https://n8ncloud.tech',
  username: 'unused',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDkyMzIzfQ.LyeO-0lfVya2s1wW0j5s2g9cH3bQfHjNX8kcK8DhYbY',
  port: 443
};

async function testN8nConnection() {
  console.log('🔍 Testing connection to n8ncloud.tech...');
  console.log(`📍 URL: ${config.baseUrl}`);
  console.log(`🔑 API Key: ${config.password.substring(0, 12)}...`);
  console.log('');

  // Test different authentication methods
  const authMethods = [
    {
      name: 'X-N8N-API-KEY header',
      headers: {
        'X-N8N-API-KEY': config.password,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Authorization: Bearer header',
      headers: {
        'Authorization': `Bearer ${config.password}`,
        'Content-Type': 'application/json'
      }
    }
  ];

  for (let i = 0; i < authMethods.length; i++) {
    const method = authMethods[i];
    console.log(`${i + 1}️⃣ Testing ${method.name}...`);
    
    try {
      const url = method.url || `${config.baseUrl}/api/v1/workflows`;
      const response = await fetch(url, {
        method: 'GET',
        headers: method.headers
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS! Found ${data.length || 0} workflows`);
        return;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Failed: ${errorText.substring(0, 120)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('❌ Both methods failed. If this is a fresh API key, ensure API access is enabled in n8n and try again.');
}

// Run the test
testN8nConnection().catch(console.error);
