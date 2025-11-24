#!/bin/bash

# Test Runner Script for Intent Behavior Tests
# Runs both API-level (fast) and E2E (comprehensive) tests

set -e

echo "🧪 Running Intent Behavior Test Suite"
echo "======================================"
echo ""

BASE_URL=${BASE_URL:-http://localhost:3003}
export BASE_URL

echo "📋 Test Configuration:"
echo "  BASE_URL: $BASE_URL"
echo ""

# Step 1: Run API-level tests (fast)
echo "Step 1: Running API-level tests..."
echo "-----------------------------------"
cd "$(dirname "$0")/../.." || exit 1
pnpm test tests/integration/intent-gating.test.ts

# Step 2: Run E2E tests (requires server)
echo ""
echo "Step 2: Running E2E tests..."
echo "----------------------------"
echo "Note: Make sure the server is running on $BASE_URL"
pnpm test:e2e tests/e2e/intent-behavior.spec.ts

echo ""
echo "✅ All tests completed!"
