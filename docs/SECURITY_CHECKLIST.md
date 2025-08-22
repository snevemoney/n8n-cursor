# 🔒 Security Checklist for n8n-cursor

**Last Updated**: $(date +%Y-%m-%d)
**Status**: 🟡 IN_PROGRESS - Security hardening in progress

## 🚨 Critical Security Items (Do First)

### 1. SSH Hardening
- [ ] **Disable root login**
  ```bash
  # Run as root
  sudo scripts/ops/harden-ssh.sh
  ```
- [ ] **Use key-based authentication only**
  - Generate SSH key pair: `ssh-keygen -t ed25519 -C "your-email@example.com"`
  - Copy public key to server: `ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server`
- [ ] **Install and configure fail2ban**
  - Automatically installed by harden-ssh.sh
  - Check status: `sudo fail2ban-client status`
- [ ] **Configure UFW firewall**
  - Automatically configured by harden-ssh.sh
  - Check status: `sudo ufw status verbose`

### 2. Secrets Management
- [ ] **Remove hardcoded secrets from code**
  - Run: `make guard` to check for forbidden strings
  - Move all secrets to environment variables
- [ ] **Set up GitHub Actions secrets**
  - Go to Settings → Secrets and variables → Actions
  - Add: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [ ] **Create .env file locally**
  ```bash
  cp .env.example .env
  # Edit .env with your actual values
  ```

### 3. Access Control
- [ ] **Review GitHub repository permissions**
  - Check Settings → Collaborators and teams
  - Remove unnecessary access
- [ ] **Review MCP tool permissions**
  - Only enable tools you actually need
  - Check ~/.cursor/mcp.json for unnecessary servers

## 🛡️ Network & Infrastructure Security

### 4. Firewall & Network Security
- [ ] **UFW firewall enabled**
  ```bash
  sudo ufw status
  # Should show: Status: active
  ```
- [ ] **Only necessary ports open**
  - SSH (22): ✅ Required
  - HTTP (80): ✅ Required
  - HTTPS (443): ✅ Required
  - n8n port (5678): ⚠️ Review if needed
- [ ] **Fail2ban active**
  ```bash
  sudo fail2ban-client status
  # Should show active jails
  ```

### 5. Docker Security
- [ ] **Docker daemon security**
  ```bash
  # Check if Docker is running as non-root
  ps aux | grep docker
  ```
- [ ] **Container security scanning**
  - Run: `make wf-validate` to check workflows
  - Consider: `docker scan` for image vulnerabilities

## 🔐 Application Security

### 6. n8n Security
- [ ] **Authentication enabled**
  - Check n8n config for basic auth
  - Verify encryption keys are set
- [ ] **Webhook security**
  - Use HTTPS only
  - Implement webhook signature verification
- [ ] **API rate limiting**
  - Consider nginx rate limiting
  - Monitor for abuse

### 7. Database Security
- [ ] **PostgreSQL security**
  - Change default passwords
  - Use SSL connections
  - Restrict network access
- [ ] **Supabase security** (if using)
  - Enable Row Level Security (RLS)
  - Review API key permissions
  - Monitor usage

## 📊 Monitoring & Alerting

### 8. Security Monitoring
- [ ] **Log monitoring**
  ```bash
  # Check SSH logs for attacks
  sudo tail -f /var/log/auth.log | grep sshd
  
  # Check fail2ban logs
  sudo tail -f /var/log/fail2ban.log
  ```
- [ ] **Security health checks**
  ```bash
  # Run security monitor
  scripts/ops/security-monitor.sh
  
  # Add to crontab (every 6 hours)
  0 */6 * * * /path/to/n8n-cursor/scripts/ops/security-monitor.sh
  ```

### 9. Backup Security
- [ ] **Encrypted backups**
  - Consider SOPS for encryption
  - Test backup restoration
- [ ] **Offsite backup copies**
  - At least one copy outside VPS
  - Test restore process monthly

## 🧪 Testing & Validation

### 10. Security Testing
- [ ] **Run security checks**
  ```bash
  make guard          # Structure guard
  make doctor         # System health
  scripts/ops/security-monitor.sh
  ```
- [ ] **Test SSH hardening**
  - Try to connect with password (should fail)
  - Verify key-based auth works
- [ ] **Test firewall rules**
  - Verify only necessary ports are open
  - Test fail2ban with failed login attempts

## 📋 Monthly Security Tasks

### 11. Ongoing Security
- [ ] **Update dependencies**
  ```bash
  # Check for outdated packages
  sudo apt update && sudo apt list --upgradable
  
  # Update Docker images
  docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"
  ```
- [ ] **Review access logs**
  - SSH access patterns
  - n8n usage patterns
  - API usage monitoring
- [ ] **Rotate secrets**
  - SSH keys (annually)
  - API keys (quarterly)
  - Database passwords (quarterly)

## 🚨 Incident Response

### 12. Security Incidents
- [ ] **Document incident response plan**
  - Who to contact
  - How to isolate issues
  - Recovery procedures
- [ ] **Keep security contacts updated**
  - Emergency contacts
  - Escalation procedures
- [ ] **Practice incident response**
  - Monthly security drills
  - Backup restoration tests

## 📚 Security Resources

### 13. References & Tools
- **SSH Hardening**: `scripts/ops/harden-ssh.sh`
- **Security Monitor**: `scripts/ops/security-monitor.sh`
- **Structure Guard**: `make guard`
- **System Health**: `make doctor`
- **Help Menu**: `./help.sh`

### 14. External Resources
- [n8n Security Best Practices](https://docs.n8n.io/hosting/security/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Ubuntu Security Guide](https://ubuntu.com/server/docs/security)

## ✅ Security Status

**Overall Security Score**: 🟡 7/10

**Completed Items**: 5/14
**In Progress**: 3/14
**Not Started**: 6/14

**Next Priority**: Complete SSH hardening and secrets management

---

## 🔄 Quick Security Commands

```bash
# Check security status
scripts/ops/security-monitor.sh

# Run all security checks
make guard && make doctor

# SSH hardening (run as root)
sudo scripts/ops/harden-ssh.sh

# Check for forbidden strings
make guard

# Monitor security logs
sudo tail -f /var/log/auth.log | grep sshd
```

**Remember**: Security is an ongoing process, not a one-time setup!
