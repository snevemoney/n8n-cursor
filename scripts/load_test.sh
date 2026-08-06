#!/usr/bin/env bash
set -e

echo "🧪 Load Testing Script"
echo "====================="

# Check if autocannon is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

echo "Running load tests..."

# Test 1: Basic health endpoint
echo "1. Testing health endpoint (10 connections, 20 seconds)..."
npx autocannon -c 10 -d 20 https://evenslouis.ca/lightningflow/healthz

echo ""

# Test 2: Main site
echo "2. Testing main site (20 connections, 30 seconds)..."
npx autocannon -c 20 -d 30 https://evenslouis.ca/lightningflow/

echo ""

# Test 3: API endpoint
echo "3. Testing API endpoint (15 connections, 25 seconds)..."
npx autocannon -c 15 -d 25 https://evenslouis.ca/lightningflow/api/system-check

echo ""

# Test 4: n8n site
echo "4. Testing n8n site (10 connections, 20 seconds)..."
npx autocannon -c 10 -d 20 https://n8ncloud.tech/

echo ""

# Test 5: Stress test (higher load)
echo "5. Stress test - main site (50 connections, 30 seconds)..."
npx autocannon -c 50 -d 30 https://evenslouis.ca/lightningflow/

echo ""
echo "✅ Load testing complete!"
echo "If you see high latency or errors, run './scripts/perf_doctor.sh' to diagnose"
