# 🦂 Scorpion DevOps Checklist

## Overview

This document outlines what a DevOps engineer would check to ensure nothing gets left in the system - no hanging processes, leaked resources, or orphaned connections.

## Quick Checks

### 1. Run Automated Checks

```bash
# Comprehensive health check
./scripts/devops-check.sh

# Resource leak detection
./scripts/devops-resource-check.sh
```

## Manual Verification Steps

### 1. Process Cleanup

**Check for zombie processes:**
```bash
# Find Scorpion processes
ps aux | grep -E "next.*3003|scorpion" | grep -v grep

# Check for child processes
ps -ef | grep -E "node|next" | grep -v grep

# After shutdown, verify no processes remain
ps aux | grep -E "next|scorpion" | grep -v grep
```

**Expected:** No processes should remain after graceful shutdown.

### 2. Connection Cleanup

**Check open connections:**
```bash
# If lsof is available
lsof -i -P -n | grep -E "3003|5678|11434"

# Check for hanging HTTP connections
netstat -an | grep -E "3003|ESTABLISHED" | wc -l

# After shutdown, verify connections are closed
lsof -i -P -n | grep -E "3003"
```

**Expected:** All connections should be closed after shutdown.

### 3. File Handle Leaks

**Check open file descriptors:**
```bash
# Find Scorpion process
PID=$(pgrep -f "next.*3003" | head -1)

# Count open file descriptors
lsof -p $PID 2>/dev/null | wc -l

# List file descriptors
lsof -p $PID 2>/dev/null | head -20
```

**Expected:** File descriptor count should be reasonable (< 100 for typical app).

### 4. Memory Leaks

**Monitor memory usage over time:**
```bash
# Watch memory usage
watch -n 1 'ps aux | grep -E "next.*3003" | grep -v grep | awk "{print \$6/1024\" MB\"}"'

# Check for memory growth
# Run for 10+ minutes, memory should stabilize, not grow continuously
```

**Expected:** Memory should stabilize, not grow unbounded.

### 5. Event Listener Leaks

**Check for unremoved listeners:**
```bash
# Search codebase for event listeners
grep -r "\.on(" apps/scorpion/lib --include="*.ts" | wc -l

# Check for cleanup
grep -r "removeListener\|removeAllListeners\|\.off(" apps/scorpion/lib --include="*.ts" | wc -l
```

**Expected:** All listeners should have corresponding cleanup.

### 6. Timer/Interval Leaks

**Check for uncleared timers:**
```bash
# Find all timers
grep -r "setInterval\|setTimeout" apps/scorpion/lib --include="*.ts"

# Check for cleanup
grep -r "clearInterval\|clearTimeout" apps/scorpion/lib --include="*.ts"
```

**Expected:** Every `setInterval`/`setTimeout` should have corresponding `clearInterval`/`clearTimeout`.

### 7. Background Worker Cleanup

**Check worker processes:**
```bash
# Find worker processes
ps aux | grep -E "worker|parser" | grep -v grep

# After shutdown, verify workers are terminated
ps aux | grep worker
```

**Expected:** All workers should be terminated on shutdown.

### 8. Cache Growth

**Monitor cache sizes:**
```bash
# Check cache implementation for limits
grep -r "MAX_SIZE\|maxSize\|limit\|LRU" apps/scorpion/lib --include="*.ts"
```

**Expected:** Caches should have size limits or LRU eviction.

### 9. Log File Growth

**Check log rotation:**
```bash
# Count log files
find apps/scorpion -name "*.log" -o -name "*log*.json" | wc -l

# Check log sizes
du -sh apps/scorpion/logs apps/scorpion/data 2>/dev/null

# Check for rotation code
grep -r "rotate\|maxSize\|maxFiles" apps/scorpion/lib --include="*.ts"
```

**Expected:** Logs should be rotated or have size limits.

### 10. Graceful Shutdown Test

**Test shutdown behavior:**
```bash
# Start Scorpion
cd apps/scorpion && pnpm dev &
SCORPION_PID=$!

# Wait for startup
sleep 5

# Send graceful shutdown signal
kill -TERM $SCORPION_PID

# Wait for shutdown
sleep 10

# Verify no processes remain
ps aux | grep -E "next|scorpion" | grep -v grep

# Check for cleanup messages in logs
tail -50 apps/scorpion/logs/*.log 2>/dev/null | grep -i "shutdown\|cleanup\|closed"
```

**Expected:** 
- Shutdown should complete within 30 seconds
- All cleanup functions should execute
- No processes should remain
- Logs should show cleanup messages

## Code-Level Checks

### 1. Shutdown Handlers

**Location:** `apps/scorpion/lib/shutdown-handler.ts`

**Verify:**
- ✅ SIGTERM handler registered
- ✅ SIGINT handler registered
- ✅ Cleanup functions for all systems
- ✅ Shutdown timeout configured
- ✅ Process exit after cleanup

### 2. Resource Cleanup Functions

**Check each system has cleanup:**

- ✅ Auto-sync: `stopAutoSync()`
- ✅ Agent operations: `cleanupAgentOperations()`
- ✅ Browser pool: `cleanupBrowserPool()`
- ✅ System automation: `cleanupSystemAutomation()`
- ✅ Telemetry: `cleanupTelemetry()`

### 3. Event Listener Cleanup

**Pattern to check:**
```typescript
// Good: Cleanup function removes listeners
function cleanup() {
    eventEmitter.removeAllListeners();
    // or
    eventEmitter.removeListener('event', handler);
}

// Bad: Listeners never removed
eventEmitter.on('event', handler); // No cleanup
```

### 4. Timer Cleanup

**Pattern to check:**
```typescript
// Good: Timer stored and cleared
const intervalId = setInterval(() => {}, 1000);
function cleanup() {
    clearInterval(intervalId);
}

// Bad: Timer never cleared
setInterval(() => {}, 1000); // No cleanup
```

### 5. Connection Cleanup

**Pattern to check:**
```typescript
// Good: Connection closed
const client = createClient();
function cleanup() {
    client.close();
    // or
    client.destroy();
}

// Bad: Connection never closed
const client = createClient(); // No cleanup
```

## Monitoring in Production

### 1. Process Monitoring

Use process monitoring tools:
- **PM2:** `pm2 monit` - Shows memory, CPU, restarts
- **Docker:** `docker stats` - Container resource usage
- **Kubernetes:** `kubectl top pods` - Pod resource usage

### 2. Connection Monitoring

Monitor connection counts:
- **netstat:** `netstat -an | grep ESTABLISHED | wc -l`
- **ss:** `ss -s` - Socket statistics
- **Application metrics:** Track connection pool size

### 3. Memory Monitoring

Track memory usage:
- **Node.js:** `process.memoryUsage()`
- **System:** `free -m` (Linux) or `vm_stat` (macOS)
- **Alerts:** Set alerts for memory growth > 10% per hour

### 4. File Descriptor Monitoring

Track file descriptors:
- **lsof:** `lsof -p $PID | wc -l`
- **System limits:** `ulimit -n`
- **Alerts:** Alert if > 80% of limit

## Automated Testing

### 1. Shutdown Test Script

```bash
#!/bin/bash
# Test graceful shutdown

# Start Scorpion
cd apps/scorpion && pnpm dev &
PID=$!

# Wait for startup
sleep 5

# Send shutdown signal
kill -TERM $PID

# Wait for cleanup
sleep 15

# Verify cleanup
if ps -p $PID > /dev/null 2>&1; then
    echo "FAIL: Process still running"
    exit 1
else
    echo "PASS: Process cleaned up"
    exit 0
fi
```

### 2. Resource Leak Test

Run application under load, then check:
- Process count (should not increase)
- Memory usage (should stabilize)
- File descriptors (should not increase)
- Connection count (should not increase)

## Red Flags

Watch for these warning signs:

1. **Process count increases** over time without corresponding decrease
2. **Memory grows continuously** without stabilization
3. **File descriptors increase** without limit
4. **Connections accumulate** and never close
5. **Log files grow unbounded** without rotation
6. **Timers/intervals** never cleared
7. **Event listeners** never removed
8. **Workers** never terminated
9. **Shutdown takes > 30 seconds** or hangs
10. **Zombie processes** remain after shutdown

## Best Practices

1. **Always register cleanup** for every resource
2. **Use shutdown handlers** for graceful cleanup
3. **Set timeouts** for shutdown operations
4. **Monitor resource usage** in production
5. **Test shutdown** regularly
6. **Log cleanup operations** for debugging
7. **Use connection pooling** with limits
8. **Implement cache limits** or LRU eviction
9. **Rotate logs** automatically
10. **Set resource limits** (ulimit, Docker limits)

## Tools

- **lsof:** List open files
- **netstat/ss:** Network connections
- **ps/top:** Process monitoring
- **pm2:** Process manager with monitoring
- **Docker stats:** Container monitoring
- **Kubernetes metrics:** Pod monitoring
- **Node.js inspector:** Memory profiling
- **clinic.js:** Node.js performance profiling

## Conclusion

A DevOps engineer would verify:
1. ✅ Shutdown handlers are registered
2. ✅ All resources have cleanup functions
3. ✅ Timers/intervals are cleared
4. ✅ Event listeners are removed
5. ✅ Connections are closed
6. ✅ Workers are terminated
7. ✅ Processes exit cleanly
8. ✅ No resource leaks over time
9. ✅ Logs are rotated
10. ✅ Caches have limits

Run `./scripts/devops-resource-check.sh` to automate these checks.

