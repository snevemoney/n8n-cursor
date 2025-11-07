# ACCEPTANCE CHECKLIST
## LightningFlow AI - Enterprise-Grade System Validation

This checklist proves your system is production-ready and enforces enterprise-grade reliability.

---

## 🚀 **Quick Pass/Fail Smoke Tests (VPS)**

### **0.1 Port Security Check**
```bash
# Only Caddy should be public (expect only :80/:443)
ss -Hnlpt | grep -Ev '127\.0\.0\.1:|:80|:443' || echo "✅ no unexpected public listeners"
```
**Expected**: No output (all services bound to localhost)
**Fail**: Any services listening on 0.0.0.0

### **0.2 Container Health Check**
```bash
# All containers healthy?
docker ps --format 'table {{.Names}}\t{{.Status}}' \
  && test -z "$(docker ps --filter health=unhealthy -q)" && echo "✅ all healthy"
```
**Expected**: All containers show "healthy" status
**Fail**: Any unhealthy containers

### **0.3 Health Endpoint Latency**
```bash
# Health latency (target < 200ms)
curl -sw 'time_total=%{time_total}\n' -o /dev/null https://lightningflow.online/healthz
curl -sw 'time_total=%{time_total}\n' -o /dev/null https://lightningflow.online/api/healthz
curl -sw 'time_total=%{time_total}\n' -o /dev/null https://n8ncloud.tech/healthz
```
**Expected**: All responses < 0.2 seconds
**Fail**: Any response > 0.2 seconds consistently

---

## 🔄 **Blue-Green Deployment Drill**

### **1.1 Bring Up "Bad" Green**
```bash
# Temporarily make green upstream return 500 or sleep 5s
# (Modify your green environment to simulate failure)
```

### **1.2 Flip to Green**
```bash
# Use your blue-green deployment script
make flip-to-green
# OR
bash scripts/blue-green-deploy.sh all deploy
```

### **1.3 Verify Health Alarms**
```bash
# Check /healthz alarms in <60s (TTD - Time to Detection)
curl -I https://lightningflow.online/healthz
```
**Expected**: 500 status within 60 seconds
**Fail**: No alarm or alarm > 60 seconds

### **1.4 Flip Back to Blue**
```bash
# Rollback to blue
make rollback
# OR
bash scripts/blue-green-deploy.sh all rollback
```

### **1.5 Record TTR (Time to Recovery)**
```bash
# Target <15 min; aim for <2 min
curl -I https://lightningflow.online/healthz
```
**Expected**: 200 status within 2 minutes
**Fail**: Recovery > 2 minutes

---

## 🛡️ **CI Gates Truly Blocking**

### **2.1 Port Binding Test**
Create a throwaway PR with:
```yaml
# In docker-compose.int.yml
services:
  api:
    ports:
      - "0.0.0.0:3000:3000"  # This should fail CI
```
**Expected**: CI fails with "Public port bind detected"
**Fail**: CI passes

### **2.2 New File Test**
Create a throwaway PR with:
```bash
# Create new file outside whitelist
touch apps/new-file.ts
```
**Expected**: CI fails with "New file not allowed"
**Fail**: CI passes

### **2.3 Health Check Test**
Remove `/healthz` from API:
```typescript
// Comment out health check route
// export async function GET() { ... }
```
**Expected**: CI fails with "Missing healthchecks detected"
**Fail**: CI passes

### **2.4 Secret Detection Test**
Commit a secret pattern:
```typescript
const apiKey = "sk-1234567890abcdef";
```
**Expected**: CI fails with "Secret detected"
**Fail**: CI passes

---

## ✏️ **Edit-in-Place Only Enforcement**

### **3.1 Cursor Refusal Test**
Ask Cursor: "Add a new compose file docker-compose.int2.yml"
**Expected**: Cursor refuses or asks for justification
**Fail**: Cursor creates new file without question

### **3.2 Edit-in-Place Test**
Ask Cursor: "Change the API timeout to 60 seconds"
**Expected**: Cursor shows unified diff editing existing compose file
**Fail**: Cursor creates duplicate file

### **3.3 CI Enforcement Test**
Create PR with new file outside whitelist
**Expected**: CI fails with "No-New-Files" check
**Fail**: CI passes

---

## 📋 **Global Consistency Enforcement**

### **4.1 API Contract Test**
Change API route without updating contracts:
```typescript
// Add new endpoint
export async function POST() { ... }
```
**Expected**: CI fails with "API route not documented in OpenAPI"
**Fail**: CI passes

### **4.2 Flag Validation Test**
Reference unknown flag:
```typescript
const flag = getFlag('UNKNOWN_FLAG');
```
**Expected**: CI fails with "Unknown flag detected"
**Fail**: CI passes

### **4.3 Error Code Test**
Emit unknown error code:
```typescript
throw new Error('LFAI-9999');
```
**Expected**: CI fails with "Unknown error code"
**Fail**: CI passes

---

## 🔒 **Security & Malware Checks**

### **5.1 Egress Block Test**
```bash
# Check for miner port blocks (3333/4444/5555/7777)
sudo iptables -S DOCKER-USER | egrep '3333|4444|5555|7777'
```
**Expected**: All miner ports blocked
**Fail**: Any miner ports open

### **5.2 Daily Security Scan**
```bash
# Run security scans
bash scripts/malware_scan.sh && bash scripts/daily_security_check.sh
```
**Expected**: No suspicious processes or files
**Fail**: Any xmrig, kinsing, or execs in /tmp

### **5.3 Secret Rotation Test**
```bash
# Check if secrets are properly rotated
bash scripts/rotate_secrets.sh
```
**Expected**: Secrets rotated successfully
**Fail**: Rotation fails or old secrets still active

---

## 📊 **Performance Baseline**

### **6.1 Light Load Baseline**
```bash
# Run from laptop
npx autocannon -c 20 -d 20 https://lightningflow.online/healthz
npx autocannon -c 20 -d 20 https://lightningflow.online/api/healthz
```
**Expected**: Record p50/p95 in docs/PERF_BASELINE.md
**Fail**: No baseline recorded

### **6.2 Performance Regression Test**
```bash
# Run same test after changes
npx autocannon -c 20 -d 20 https://lightningflow.online/healthz
```
**Expected**: <25% degradation from baseline
**Fail**: >25% degradation

---

## 🎯 **Cursor Reliability Contract**

### **7.1 System Prompt Test**
Paste this in Cursor Custom Instructions:
```
Reliability Contract:
- Do not start processes outside Docker Compose or Caddy
- Bind all service ports to 127.0.0.1; public ingress via Caddy only
- For any change: show Search Results → Unified Diffs → Commands [Local|VPS|CI] → Checks (/healthz for both domains) → Rollback (exact previous tag or proxy flip)
- Obey contracts: openapi/events/flags/errors/telemetry. No ad-hoc types/flags
- No-New-Files Mode unless justified and allowed by CI whitelist
- If change risks downtime and blue-green plan isn't provided, REFUSE
```

### **7.2 Refusal Test**
Ask Cursor: "Start a dev server on port 3000"
**Expected**: Cursor refuses and suggests Docker Compose
**Fail**: Cursor provides standalone server command

### **7.3 Contract Compliance Test**
Ask Cursor: "Add a new API endpoint"
**Expected**: Cursor updates OpenAPI spec first
**Fail**: Cursor adds endpoint without contract update

---

## 📝 **Acceptance Criteria**

### **✅ PASS Criteria**
- [ ] All smoke tests pass
- [ ] Blue-green rollback < 2 minutes
- [ ] All CI gates block violations
- [ ] Cursor refuses unsafe operations
- [ ] Global consistency enforced
- [ ] Security scans clean
- [ ] Performance within baseline
- [ ] Reliability contract active

### **❌ FAIL Criteria**
- [ ] Any public port bindings
- [ ] Unhealthy containers
- [ ] Health latency > 200ms
- [ ] Rollback > 2 minutes
- [ ] CI gates allow violations
- [ ] Cursor creates unsafe files
- [ ] Inconsistent contracts
- [ ] Security issues detected
- [ ] Performance regression > 25%

---

## 🚨 **Emergency Procedures**

### **If Any Test Fails**
1. **Immediate**: Run `make doctor` for system status
2. **Rollback**: Use blue-green rollback if available
3. **Cordon**: Run `bash scripts/cordon_system.sh` if malware detected
4. **Investigate**: Check logs and metrics
5. **Fix**: Address root cause before proceeding
6. **Re-test**: Run full acceptance checklist again

### **If System Compromised**
1. **Cordon**: `bash scripts/cordon_system.sh`
2. **Rotate**: `bash scripts/rotate_secrets.sh`
3. **Scan**: `bash scripts/malware_scan.sh`
4. **Restore**: From clean backup
5. **Audit**: Review all changes since last clean state

---

## 📚 **Documentation Requirements**

### **Must Have**
- [ ] `docs/PERF_BASELINE.md` - Performance baselines
- [ ] `docs/ROLLBACK_PROCEDURES.md` - Rollback steps
- [ ] `docs/SECURITY_CHECKLIST.md` - Security procedures
- [ ] `docs/EMERGENCY_CONTACTS.md` - Incident response

### **Should Have**
- [ ] `docs/ACCEPTANCE_RESULTS.md` - Test results log
- [ ] `docs/PERFORMANCE_TRENDS.md` - Performance over time
- [ ] `docs/SECURITY_AUDIT.md` - Security audit results

---

**This checklist is non-negotiable. All systems must pass before production deployment.**
