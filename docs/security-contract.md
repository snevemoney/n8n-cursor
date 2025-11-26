# Cursor Security Contract

## CRITICAL SECURITY RULES - MUST OBEY

### 1. Container Security (MANDATORY)
- **NEVER** propose public port bindings (0.0.0.0:PORT) - ALWAYS use 127.0.0.1:PORT
- **NEVER** start background processes outside Docker Compose
- **NEVER** mount /var/run/docker.sock into app containers (only Dozzle, and keep it internal)
- **ALWAYS** add these security options to new services:
  ```yaml
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  read_only: true               # for API/worker; add tmpfs /tmp if needed
  tmpfs:
    - /tmp:rw,noexec,nosuid,size=64m
  user: "1000:1000"             # run as non-root when image allows
  pids_limit: 300
  cpus: "1.5"
  mem_limit: "1024m"
  ```

### 2. Network Security (MANDATORY)
- **ALWAYS** provide Caddy reverse proxy configuration for new services
- **NEVER** expose services directly to the internet
- **ALWAYS** bind ports to 127.0.0.1 only
- **NEVER** allow unrestricted outbound network access

### 3. Script Execution (MANDATORY)
- **REFUSE** to run remote scripts via `curl|bash` unless user adds `ALLOW_CURL_SH=true`
- **ALWAYS** validate script sources before execution
- **NEVER** execute scripts from untrusted sources

### 4. Image Security (MANDATORY)
- **ALWAYS** use allowlisted base images:
  - `node:20-alpine` (pinned version)
  - `redis:7-alpine` (pinned version)
  - `postgres:16-alpine` (pinned version)
  - `caddy:2-alpine` (pinned version)
- **NEVER** use `:latest` tags in production
- **ALWAYS** scan images with Trivy before deployment

### 5. Secret Management (MANDATORY)
- **NEVER** hardcode secrets in code or config files
- **ALWAYS** use environment variables for sensitive data
- **NEVER** commit real secrets to version control
- **ALWAYS** use `.env.example` files for secret templates

### 6. Security Checklist (MANDATORY OUTPUT)
For every change, output this checklist:
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

### 7. Emergency Response (MANDATORY)
If suspicious activity detected:
1. **IMMEDIATELY** run `bash scripts/malware_scan.sh`
2. **IMMEDIATELY** run `bash scripts/malware_cordon.sh` if compromise confirmed
3. **IMMEDIATELY** rotate all secrets
4. **IMMEDIATELY** check authorized_keys and crontab
5. **IMMEDIATELY** review systemd services

### 8. Monitoring (MANDATORY)
- **ALWAYS** set up CPU monitoring for new services
- **ALWAYS** configure healthchecks
- **ALWAYS** add to Uptime Kuma monitoring
- **ALWAYS** set up log aggregation

## VIOLATION CONSEQUENCES
- **IMMEDIATE** security review required
- **IMMEDIATE** secret rotation required
- **IMMEDIATE** system audit required
- **POTENTIAL** system rebuild required

## SECURITY CONTACTS
- Primary: System Administrator
- Emergency: Security Team
- Escalation: CTO

---
**This contract is non-negotiable and must be followed for all AI-assisted development.**
