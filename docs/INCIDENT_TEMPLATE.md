# 🚨 Incident Response Template

**Project**: n8n-cursor  
**Template Version**: 1.0  
**Last Updated**: $(date +%Y-%m-%d)

## 📋 Incident Summary

**Incident ID**: `INC-$(date +%Y%m%d)-001`  
**Date/Time**: `$(date)`  
**Severity**: [🔴 Critical | 🟡 High | 🟢 Medium | 🔵 Low]  
**Status**: [🚨 Open | 🔄 In Progress | ✅ Resolved | 📝 Closed]

**Incident Title**: [Brief description of what happened]

**Affected Systems**:
- [ ] n8n workflows
- [ ] Database
- [ ] API endpoints
- [ ] Authentication
- [ ] Infrastructure
- [ ] Other: _________

## 🎯 Impact Assessment

**User Impact**: [Number of users affected]
**Business Impact**: [Revenue, reputation, compliance]
**Technical Impact**: [Systems down, data loss, performance]

**Timeline**:
- **Detected**: `[Time]`
- **Reported**: `[Time]`
- **Response Started**: `[Time]`
- **Resolution**: `[Time]`
- **Recovery Complete**: `[Time]`

## 🔍 Root Cause Analysis

**Immediate Cause**: [What directly caused the incident]

**Underlying Issues**:
- [ ] Configuration error
- [ ] Code bug
- [ ] Infrastructure failure
- [ ] Security breach
- [ ] Human error
- [ ] Third-party failure
- [ ] Other: _________

**Contributing Factors**:
1. _________
2. _________
3. _________

## 🚀 Response Actions

### Immediate Response (0-15 minutes)
- [ ] **Incident declared**
  - Notify: [Names/Roles]
  - Escalation: [Process followed]
- [ ] **Initial assessment**
  - Run: `make doctor` for system health
  - Run: `make guard` for structure issues
  - Check: `make status` for service status
- [ ] **Communication initiated**
  - Internal team notified
  - Stakeholders informed
  - Status page updated

### Containment (15 minutes - 2 hours)
- [ ] **Isolate affected systems**
  ```bash
  # Stop affected services
  DRY_RUN=0 make down
  
  # Check what's running
  make status
  
  # Review logs
  make logs
  ```
- [ ] **Assess scope**
  - Identify all affected components
  - Determine data integrity
  - Check for cascading failures
- [ ] **Implement workarounds**
  - Temporary fixes applied
  - Service degradation plan
  - Rollback procedures

### Resolution (2-8 hours)
- [ ] **Fix root cause**
  - Code fixes deployed
  - Configuration corrected
  - Infrastructure restored
- [ ] **Verify fixes**
  ```bash
  # Test system health
  make doctor
  
  # Validate structure
  make guard
  
  # Test workflows
  make wf-validate
  ```
- [ ] **Restore services**
  ```bash
  # Start services
  DRY_RUN=0 make up
  
  # Verify status
  make status
  ```

## 🔧 Technical Details

**Commands Executed**:
```bash
# Add relevant commands used during incident response
```

**Configuration Changes**:
- [ ] Files modified: _________
- [ ] Environment variables: _________
- [ ] Database changes: _________
- [ ] Infrastructure changes: _________

**Logs & Evidence**:
- [ ] System logs: _________
- [ ] Application logs: _________
- [ ] Error messages: _________
- [ ] Screenshots: _________

## 📊 Recovery & Validation

### Service Restoration
- [ ] **Core services restored**
  - n8n workflows: [Status]
  - Database: [Status]
  - API: [Status]
  - Authentication: [Status]
- [ ] **Data integrity verified**
  - Backup validation: [Status]
  - Data consistency: [Status]
  - Transaction logs: [Status]

### Testing & Validation
- [ ] **Functional testing**
  ```bash
  # Run comprehensive health check
  make doctor && make guard && make wf-validate
  
  # Test critical workflows
  # [List specific workflows tested]
  ```
- [ ] **Performance testing**
  - Response times: [Baseline vs Current]
  - Throughput: [Baseline vs Current]
  - Resource usage: [Baseline vs Current]

## 📝 Lessons Learned

### What Went Well
1. _________
2. _________
3. _________

### What Could Be Improved
1. _________
2. _________
3. _________

### Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|---------|
| | | | |
| | | | |
| | | | |

## 🔄 Prevention Measures

### Immediate Actions
- [ ] **Document incident**
  - Update runbooks
  - Revise procedures
  - Train team members
- [ ] **Implement monitoring**
  - Add alerts for similar issues
  - Improve logging
  - Set up dashboards

### Long-term Improvements
- [ ] **Process improvements**
  - Incident response procedures
  - Communication protocols
  - Escalation matrices
- [ ] **Technical improvements**
  - Monitoring enhancements
  - Automation improvements
  - Testing procedures

## 📞 Contacts & Escalation

### Primary Contacts
- **Incident Commander**: [Name] - [Phone] - [Email]
- **Technical Lead**: [Name] - [Phone] - [Email]
- **Communications**: [Name] - [Phone] - [Email]

### Escalation Path
1. **Level 1**: On-call engineer (0-30 min)
2. **Level 2**: Team lead (30 min - 2 hours)
3. **Level 3**: Engineering manager (2-4 hours)
4. **Level 4**: CTO/VP Engineering (4+ hours)

### External Contacts
- **Hosting Provider**: [Contact info]
- **Database Support**: [Contact info]
- **Security Team**: [Contact info]

## 📋 Post-Incident Review

### Review Meeting
- **Date**: `[Date]`
- **Attendees**: [List]
- **Duration**: [Time]

### Key Decisions
1. _________
2. _________
3. _________

### Follow-up Actions
- [ ] **Documentation updates**
- [ ] **Process improvements**
- [ ] **Training requirements**
- [ ] **Tool improvements**

---

## 🔄 Quick Response Commands

```bash
# Emergency health check
make doctor && make guard && make wf-validate

# Stop all services
DRY_RUN=0 make down

# Start services
DRY_RUN=0 make up

# Check status
make status

# View logs
make logs

# Run security check
scripts/ops/security-monitor.sh
```

**Remember**: Stay calm, follow procedures, and communicate clearly!
