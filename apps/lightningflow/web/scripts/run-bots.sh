#!/bin/bash

# Lightning Platform Bot Test Runner
# Usage: ./scripts/run-bots.sh [preset] [options]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
BOT_COUNT=10
TEST_DURATION=60
CONCURRENCY=5
TEST_MODE="mock"
BASE_URL="http://localhost:3000"

print_usage() {
    echo -e "${BLUE}Lightning Platform Bot Test Runner${NC}"
    echo "Usage: $0 [preset] [options]"
    echo ""
    echo "Presets:"
    echo "  quick     - 5 bots, 30 seconds (development)"
    echo "  load      - 50 bots, 300 seconds (load testing)"
    echo "  stress    - 100 bots, 600 seconds (stress testing)"
    echo "  custom    - Use environment variables or flags"
    echo ""
    echo "Options:"
    echo "  --bots <n>        Number of bots (default: $BOT_COUNT)"
    echo "  --duration <s>    Test duration in seconds (default: $TEST_DURATION)"
    echo "  --concurrency <n> Concurrent bots (default: $CONCURRENCY)"
    echo "  --mode <mode>     'mock' or 'real' (default: $TEST_MODE)"
    echo "  --url <url>       Base URL (default: $BASE_URL)"
    echo "  --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 quick                           # Quick test with defaults"
    echo "  $0 load --mode real                # Load test with real services"
    echo "  $0 custom --bots 20 --duration 120 # Custom configuration"
}

# Parse preset
case "${1:-custom}" in
    "quick")
        BOT_COUNT=5
        TEST_DURATION=30
        CONCURRENCY=3
        ;;
    "load")
        BOT_COUNT=50
        TEST_DURATION=300
        CONCURRENCY=10
        ;;
    "stress")
        BOT_COUNT=100
        TEST_DURATION=600
        CONCURRENCY=20
        ;;
    "custom")
        # Use defaults or environment variables
        ;;
    "--help"|"-h"|"help")
        print_usage
        exit 0
        ;;
    *)
        echo -e "${RED}Unknown preset: $1${NC}"
        print_usage
        exit 1
        ;;
esac

# Parse additional options
shift 2>/dev/null || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --bots)
            BOT_COUNT="$2"
            shift 2
            ;;
        --duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        --concurrency)
            CONCURRENCY="$2"
            shift 2
            ;;
        --mode)
            TEST_MODE="$2"
            shift 2
            ;;
        --url)
            BASE_URL="$2"
            shift 2
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Validate inputs
if [[ ! "$BOT_COUNT" =~ ^[0-9]+$ ]] || [[ "$BOT_COUNT" -lt 1 ]]; then
    echo -e "${RED}Error: Bot count must be a positive integer${NC}"
    exit 1
fi

if [[ ! "$TEST_DURATION" =~ ^[0-9]+$ ]] || [[ "$TEST_DURATION" -lt 1 ]]; then
    echo -e "${RED}Error: Test duration must be a positive integer${NC}"
    exit 1
fi

if [[ ! "$CONCURRENCY" =~ ^[0-9]+$ ]] || [[ "$CONCURRENCY" -lt 1 ]]; then
    echo -e "${RED}Error: Concurrency must be a positive integer${NC}"
    exit 1
fi

if [[ "$TEST_MODE" != "mock" && "$TEST_MODE" != "real" ]]; then
    echo -e "${RED}Error: Mode must be 'mock' or 'real'${NC}"
    exit 1
fi

# Check if server is running
echo -e "${YELLOW}🔍 Checking if server is running at $BASE_URL...${NC}"
if ! curl -sf "$BASE_URL/api/test-system" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not responding at $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Make sure to run 'npm run dev' first${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Check dependencies
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
    exit 1
fi

# Load environment variables if .env.local exists
if [[ -f ".env.local" ]]; then
    echo -e "${YELLOW}📄 Loading environment from .env.local${NC}"
    export $(grep -v '^#' .env.local | xargs)
fi

# Set environment variables for the test
export BOT_COUNT
export TEST_DURATION
export CONCURRENCY
export TEST_MODE
export BASE_URL

# Display configuration
echo ""
echo -e "${BLUE}🤖 Lightning Platform Bot Test Configuration${NC}"
echo "=============================================="
echo "🔧 Bots: $BOT_COUNT"
echo "⏱️  Duration: ${TEST_DURATION}s"
echo "🔀 Concurrency: $CONCURRENCY"
echo "🎯 Mode: $TEST_MODE"
echo "🌐 URL: $BASE_URL"
echo ""

# Confirmation for large tests
if [[ "$BOT_COUNT" -gt 50 ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Running $BOT_COUNT bots may generate significant load${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Create results directory
RESULTS_DIR="bot-test-results"
mkdir -p "$RESULTS_DIR"

# Run the test
echo -e "${GREEN}🚀 Starting bot test...${NC}"
echo ""

# Check if we have tsx available, otherwise use ts-node
if command -v npx tsx &> /dev/null; then
    RUNNER="npx tsx"
elif command -v npx ts-node &> /dev/null; then
    RUNNER="npx ts-node"
else
    echo -e "${RED}❌ Neither tsx nor ts-node found. Installing tsx...${NC}"
    npm install -g tsx
    RUNNER="npx tsx"
fi

# Run the bot simulation
START_TIME=$(date +%s)
if $RUNNER scripts/simulate-bots.ts; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    echo -e "${GREEN}✅ Bot test completed successfully!${NC}"
    echo -e "${BLUE}📊 Total runtime: ${DURATION}s${NC}"
    
    # Move report to results directory
    if ls bot-test-report-*.json 1> /dev/null 2>&1; then
        mv bot-test-report-*.json "$RESULTS_DIR/"
        echo -e "${BLUE}📁 Report saved to $RESULTS_DIR/${NC}"
    fi
    
    # Show quick summary if jq is available
    if command -v jq &> /dev/null && [[ -f "$RESULTS_DIR/"bot-test-report-*.json ]]; then
        LATEST_REPORT=$(ls -t "$RESULTS_DIR/"bot-test-report-*.json | head -1)
        echo ""
        echo -e "${BLUE}📈 Quick Summary:${NC}"
        echo "   Success Rate: $(jq -r '.summary.successRate' "$LATEST_REPORT")"
        echo "   Requests/sec: $(jq -r '.summary.requestsPerSecond' "$LATEST_REPORT")"
        echo "   Avg Response: $(jq -r '.summary.avgResponseTime' "$LATEST_REPORT")"
    fi
    
else
    echo -e "${RED}❌ Bot test failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Test complete! Check the detailed report in $RESULTS_DIR/${NC}" 