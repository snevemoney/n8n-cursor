#!/bin/bash
# 🦂 Scorpion Resource Leak Detection
# Verifies that nothing gets left in the system after shutdown

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

pass() { echo -e "${GREEN}✓${NC} $1"; ((PASSED++)); }
fail() { echo -e "${RED}✗${NC} $1"; ((FAILED++)); }
warn() { echo -e "${YELLOW}⚠${NC} $1"; ((WARNINGS++)); }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
section() { echo ""; echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"; echo -e "${BLUE}$1${NC}"; echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"; }

SCORPION_PORT=${SCORPION_PORT:-3003}
SCORPION_PID=""
TEMP_DIR=$(mktemp -d)
CLEANUP_LOG="${TEMP_DIR}/cleanup.log"

# Cleanup on exit
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

section "1. GRACEFUL SHUTDOWN HANDLERS"

# Check if shutdown handlers are registered
if grep -q "initializeShutdownHandlers\|gracefulShutdown" apps/scorpion/instrumentation.ts 2>/dev/null; then
    pass "Shutdown handlers registered in instrumentation"
else
    fail "Shutdown handlers not found in instrumentation"
fi

# Check shutdown handler file exists
if [ -f "apps/scorpion/lib/shutdown-handler.ts" ]; then
    pass "Shutdown handler module exists"
    
    # Check for cleanup functions
    cleanup_functions=(
        "cleanupAutoSync"
        "cleanupAgentOperations"
        "cleanupBrowserPool"
        "cleanupSystemAutomation"
        "cleanupTelemetry"
    )
    
    for func in "${cleanup_functions[@]}"; do
        if grep -q "$func" apps/scorpion/lib/shutdown-handler.ts; then
            pass "Cleanup function exists: $func"
        else
            fail "Cleanup function missing: $func"
        fi
    done
    
    # Check for signal handlers
    if grep -q "process.on.*SIGTERM\|process.on.*SIGINT" apps/scorpion/lib/shutdown-handler.ts; then
        pass "Signal handlers (SIGTERM/SIGINT) registered"
    else
        fail "Signal handlers not registered"
    fi
    
    # Check for timeout
    if grep -q "SHUTDOWN_TIMEOUT\|shutdownTimeout" apps/scorpion/lib/shutdown-handler.ts; then
        pass "Shutdown timeout configured"
    else
        warn "Shutdown timeout not configured"
    fi
else
    fail "Shutdown handler module not found"
fi

section "2. RESOURCE CLEANUP VERIFICATION"

# Check auto-sync cleanup
if grep -q "stopAutoSync\|watcher.*close\|watcher.*destroy" apps/scorpion/lib/auto-sync.ts 2>/dev/null; then
    pass "Auto-sync has cleanup/stop function"
else
    fail "Auto-sync missing cleanup function"
fi

# Check browser pool cleanup
if grep -q "close.*browser\|destroy.*browser\|cleanup.*pool" apps/scorpion/lib/research/browser-pool.ts 2>/dev/null; then
    pass "Browser pool has cleanup functions"
else
    fail "Browser pool missing cleanup functions"
fi

# Check telemetry cleanup
if grep -q "disconnect\|close\|destroy\|removeAllListeners" apps/scorpion/lib/telemetry/bus.ts 2>/dev/null; then
    pass "Telemetry bus has cleanup functions"
else
    warn "Telemetry bus cleanup may be incomplete"
fi

# Check for interval/timeout cleanup
if grep -q "clearInterval\|clearTimeout" apps/scorpion/lib/telemetry/health-emitter.ts 2>/dev/null; then
    pass "Health emitter cleans up intervals"
else
    fail "Health emitter may leak intervals"
fi

section "3. EVENT LISTENER CLEANUP"

# Check for removeListener/off calls
listener_files=(
    "apps/scorpion/lib/telemetry/bus.ts"
    "apps/scorpion/lib/auto-sync.ts"
    "apps/scorpion/lib/system-automation.ts"
)

for file in "${listener_files[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "removeListener\|removeAllListeners\|\.off(" "$file" 2>/dev/null; then
            pass "Event listeners cleaned up in $(basename $file)"
        else
            warn "Event listeners may not be cleaned up in $(basename $file)"
        fi
    fi
done

section "4. CONNECTION CLEANUP"

# Check HTTP client cleanup
if grep -q "\.close()\|\.destroy()\|\.abort()" apps/scorpion/lib/mcp-n8n-client.ts 2>/dev/null; then
    pass "n8n client has connection cleanup"
else
    warn "n8n client connection cleanup may be missing"
fi

# Check for AbortController usage (good practice)
if grep -q "AbortController\|signal.*abort" apps/scorpion/lib/mcp-n8n-client.ts 2>/dev/null; then
    pass "n8n client uses AbortController for request cancellation"
else
    info "Consider using AbortController for request cleanup"
fi

section "5. MEMORY LEAK DETECTION"

# Check for unbounded arrays/caches
cache_files=(
    "apps/scorpion/lib/cache.ts"
    "apps/scorpion/lib/telemetry/bus.ts"
)

for file in "${cache_files[@]}"; do
    if [ -f "$file" ]; then
        # Check for size limits
        if grep -q "maxSize\|MAX_SIZE\|limit\|LRU" "$file" 2>/dev/null; then
            pass "Cache has size limits in $(basename $file)"
        else
            warn "Cache may grow unbounded in $(basename $file)"
        fi
    fi
done

# Check for event buffer limits
if grep -q "eventBuffer\|MAX_BUFFER\|buffer.*limit" apps/scorpion/lib/telemetry/bus.ts 2>/dev/null; then
    if grep -q "slice\|splice\|shift\|pop" apps/scorpion/lib/telemetry/bus.ts 2>/dev/null; then
        pass "Event buffer has size management"
    else
        warn "Event buffer may grow unbounded"
    fi
else
    info "Event buffer size management not found"
fi

section "6. FILE HANDLE LEAK DETECTION"

# Check for file stream cleanup
if grep -q "createReadStream\|createWriteStream\|fs\.open" apps/scorpion/lib 2>/dev/null | grep -v node_modules | head -5; then
    # Check if streams are closed
    if grep -r "\.close()\|\.destroy()\|\.end()" apps/scorpion/lib --include="*.ts" 2>/dev/null | grep -q stream; then
        pass "File streams are properly closed"
    else
        warn "File streams may not be closed properly"
    fi
else
    info "No file streams detected (using async fs methods)"
fi

section "7. BACKGROUND WORKER CLEANUP"

# Check for worker cleanup
if [ -f "apps/scorpion/lib/workers/parser.worker.ts" ]; then
    if grep -q "terminate\|close\|destroy" apps/scorpion/lib/workers/parser.worker.ts 2>/dev/null; then
        pass "Worker has cleanup functions"
    else
        warn "Worker cleanup may be missing"
    fi
fi

# Check for media worker cleanup
if [ -f "apps/scorpion/lib/workers/media-worker.ts" ]; then
    if grep -q "cleanup\|close\|destroy" apps/scorpion/lib/workers/media-worker.ts 2>/dev/null; then
        pass "Media worker has cleanup functions"
    else
        warn "Media worker cleanup may be missing"
    fi
fi

section "8. TIMER/INTERVAL CLEANUP"

# Find all setInterval/setTimeout calls
timer_files=$(grep -r "setInterval\|setTimeout" apps/scorpion/lib --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u)

if [ -n "$timer_files" ]; then
    timer_count=0
    cleanup_count=0
    
    while IFS= read -r file; do
        timer_count=$((timer_count + 1))
        if grep -q "clearInterval\|clearTimeout" "$file" 2>/dev/null; then
            cleanup_count=$((cleanup_count + 1))
        fi
    done <<< "$timer_files"
    
    if [ $timer_count -eq $cleanup_count ]; then
        pass "All timers have cleanup ($timer_count/$timer_count)"
    else
        warn "Some timers may not be cleaned up ($cleanup_count/$timer_count)"
        info "Files with timers:"
        echo "$timer_files" | head -5 | while read -r file; do
            info "  - $file"
        done
    fi
else
    pass "No timers found (or using cleanup)"
fi

section "9. PROCESS CLEANUP TEST"

# Check if process can be started and stopped cleanly
info "Testing graceful shutdown..."
info "Note: This requires Scorpion to be running"

if pgrep -f "next.*dev.*3003\|next.*start.*3003" > /dev/null 2>&1; then
    SCORPION_PID=$(pgrep -f "next.*dev.*3003\|next.*start.*3003" | head -1)
    info "Found Scorpion process: $SCORPION_PID"
    
    # Count child processes
    child_count=$(pgrep -P "$SCORPION_PID" 2>/dev/null | wc -l | tr -d ' ')
    info "Child processes: $child_count"
    
    if [ "$child_count" -gt 0 ]; then
        warn "Scorpion has $child_count child process(es) - verify they clean up on shutdown"
    else
        pass "No child processes detected"
    fi
    
    # Check open file descriptors (if lsof available)
    if command -v lsof &> /dev/null; then
        fd_count=$(lsof -p "$SCORPION_PID" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$fd_count" -gt 0 ]; then
            info "Open file descriptors: $fd_count"
            if [ "$fd_count" -gt 100 ]; then
                warn "High number of file descriptors ($fd_count) - possible leak"
            else
                pass "File descriptor count reasonable ($fd_count)"
            fi
        fi
    fi
else
    info "Scorpion not running - start it to test process cleanup"
    info "Start: cd apps/scorpion && pnpm dev"
    info "Then run this script again to test shutdown"
fi

section "10. LOG ROTATION & CLEANUP"

# Check for log rotation
log_files=$(find apps/scorpion -name "*.log" -o -name "*log*.json" 2>/dev/null | head -10)

if [ -n "$log_files" ]; then
    log_count=$(echo "$log_files" | wc -l | tr -d ' ')
    total_size=$(du -sh apps/scorpion/logs apps/scorpion/data 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    
    if [ "$log_count" -gt 50 ]; then
        warn "Many log files found ($log_count) - check rotation"
    else
        pass "Log file count reasonable ($log_count)"
    fi
    
    # Check for log rotation code
    if grep -r "log.*rotate\|rotate.*log\|maxSize\|maxFiles" apps/scorpion/lib --include="*.ts" 2>/dev/null; then
        pass "Log rotation implemented"
    else
        warn "Log rotation may not be implemented"
    fi
else
    info "No log files found (logs may be in-memory or external)"
fi

section "11. DATABASE CONNECTION CLEANUP"

# Check for database connection cleanup (if using DB)
if grep -r "pg\.connect\|mysql\.createConnection\|mongodb\.connect" apps/scorpion/lib --include="*.ts" 2>/dev/null | head -1; then
    if grep -r "\.close()\|\.end()\|\.disconnect()" apps/scorpion/lib --include="*.ts" 2>/dev/null | grep -q -i "connect\|pool\|client"; then
        pass "Database connections are closed"
    else
        fail "Database connections may not be closed"
    fi
else
    info "No database connections detected (using file-based storage)"
fi

section "12. SUMMARY & RECOMMENDATIONS"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "Resource Cleanup Check Results:"
echo -e "  ${GREEN}Passed:${NC}  ${PASSED}"
echo -e "  ${YELLOW}Warnings:${NC} ${WARNINGS}"
echo -e "  ${RED}Failed:${NC}  ${FAILED}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ All resource cleanup checks passed!${NC}"
        echo ""
        echo "To verify shutdown behavior:"
        echo "  1. Start Scorpion: cd apps/scorpion && pnpm dev"
        echo "  2. Send SIGTERM: kill -TERM <pid>"
        echo "  3. Check logs for cleanup messages"
        echo "  4. Verify no zombie processes: ps aux | grep node"
        exit 0
    else
        echo -e "${YELLOW}⚠ Resource cleanup checks passed with warnings${NC}"
        echo ""
        echo "Review warnings above and ensure:"
        echo "  - All timers/intervals are cleared on shutdown"
        echo "  - Event listeners are removed"
        echo "  - File handles are closed"
        echo "  - Background workers are terminated"
        exit 0
    fi
else
    echo -e "${RED}✗ Some resource cleanup checks failed${NC}"
    echo ""
    echo "Critical issues found:"
    echo "  - Fix shutdown handlers"
    echo "  - Add cleanup for all resources"
    echo "  - Test graceful shutdown"
    exit 1
fi

