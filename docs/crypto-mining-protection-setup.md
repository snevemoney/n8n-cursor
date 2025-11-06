# Crypto-Mining Protection Setup Guide

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Run Security Hardening (ONE-TIME SETUP)
```bash
# Run the comprehensive security hardening script
bash scripts/security_hardening.sh
```

### 2. Set Up Daily Monitoring
```bash
# Add to crontab for daily security checks
(crontab -l 2>/dev/null; echo '0 6 * * * /path/to/scripts/daily_security_check.sh >> ~/daily_security.log 2>&1') | crontab -

# Add to crontab for 5-minute crypto monitoring
(crontab -l 2>/dev/null; echo '*/5 * * * * /path/to/scripts/crypto_monitoring.sh') | crontab -
```

### 3. Configure Alerting (Optional but Recommended)
```bash
# Set up Discord webhook for alerts
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"

# Set up email alerts
export ALERT_EMAIL="your-email@domain.com"
```

## 🔧 CONFIGURATION FILES UPDATED

### Docker Compose Security
- ✅ `infra/docker/docker-compose.prod.yml` - Hardened with security defaults
- ✅ `docker-compose.monitoring.yml` - Uptime Kuma secured

### Security Scripts Created
- ✅ `scripts/malware_scan.sh` - Detection script
- ✅ `scripts/malware_cordon.sh` - Cleanup script
- ✅ `scripts/security_hardening.sh` - One-time setup
- ✅ `scripts/crypto_monitoring.sh` - Continuous monitoring
- ✅ `scripts/container_security_check.sh` - Container security audit
- ✅ `scripts/daily_security_check.sh` - Daily health check

### CI/CD Security
- ✅ `.github/workflows/security-scan.yml` - Automated security scanning

### Documentation
- ✅ `docs/security-contract.md` - AI security rules
- ✅ `infra/caddy/monitoring.Caddyfile` - Monitoring dashboard config

## 🛡️ SECURITY MEASURES IMPLEMENTED

### Prevention
- SSH hardened (no password auth, no root login)
- UFW firewall with mining port blocks
- Docker containers with security defaults
- DNS sinkhole (Quad9)
- Fail2ban for SSH protection
- Auditd for system monitoring

### Detection
- CPU spike monitoring
- Process name scanning
- Network connection monitoring
- Container resource monitoring
- File system integrity checks
- Cron and systemd service monitoring

### Response
- Automated cleanup scripts
- Container restart procedures
- Secret rotation procedures
- System audit procedures

## 📊 MONITORING DASHBOARD

Access your monitoring dashboard at:
- Uptime Kuma: `https://yourdomain.com/monitoring/uptime/`
- Grafana: `https://yourdomain.com/monitoring/grafana/`
- Prometheus: `https://yourdomain.com/monitoring/prometheus/`

## 🚨 EMERGENCY PROCEDURES

### If You Suspect Compromise
1. **IMMEDIATE**: Run `bash scripts/malware_scan.sh`
2. **IMMEDIATE**: Run `bash scripts/malware_cordon.sh`
3. **IMMEDIATE**: Rotate all secrets
4. **IMMEDIATE**: Check authorized_keys and crontab
5. **IMMEDIATE**: Review systemd services
6. **CONSIDER**: Full system rebuild from backups

### Daily Health Check
```bash
# Run this every morning
bash scripts/daily_security_check.sh
```

## 🔍 SECURITY CHECKLIST

For every new service or change:
- [ ] Ports bound to 127.0.0.1 only
- [ ] Security options applied (no-new-privileges, cap_drop)
- [ ] Non-root user specified
- [ ] Read-only filesystem with tmpfs
- [ ] Resource limits set
- [ ] Healthcheck configured
- [ ] Caddy reverse proxy configured
- [ ] No docker.sock mounts (except Dozzle)
- [ ] Pinned image versions used
- [ ] Secrets handled via environment variables

## 📈 MONITORING LOGS

Check these log files regularly:
- `~/cpu_watch.log` - CPU spike alerts
- `~/crypto_monitor.log` - Crypto-mining detection
- `~/daily_security.log` - Daily security checks
- `/var/log/fail2ban.log` - Failed login attempts
- `/var/log/audit/audit.log` - System audit events

## 🎯 SUCCESS METRICS

Your system is secure when:
- ✅ No processes using >80% CPU consistently
- ✅ No connections to mining ports (3333, 4444, 5555, 7777)
- ✅ No suspicious processes (xmrig, minerd, kinsing, etc.)
- ✅ All containers running with security defaults
- ✅ No new executables in temp directories
- ✅ All services accessible only via Caddy reverse proxy

## 🔄 MAINTENANCE

### Weekly
- Review security logs
- Update container images
- Check for security advisories

### Monthly
- Run full security audit
- Update base images
- Review and rotate secrets
- Test emergency procedures

### Quarterly
- Full system security review
- Penetration testing
- Disaster recovery testing

---

**Remember: Security is an ongoing process, not a one-time setup!**
