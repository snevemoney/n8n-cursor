# Security Policy

## Supported Versions

We actively maintain the latest version of n8n-cursor workflows. Security updates are applied to the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### 🔐 Credentials Management

**CRITICAL: Never commit credentials to this repository.**

1. **Use environment variables** for all sensitive data
2. **Use n8n's credential system** for OAuth and API keys
3. **Copy `.env.example` to `.env`** and fill in your actual credentials
4. **Ensure `.env` is in `.gitignore`** (already configured)
5. **Rotate credentials** if accidentally committed

### 🛡️ Workflow Security

When importing these workflows:

- **Review all HTTP requests** - Ensure URLs and endpoints are correct
- **Validate webhook paths** - Use unique, non-guessable paths for production
- **Enable authentication** on webhooks where possible
- **Sanitize user inputs** in code nodes to prevent injection attacks
- **Use HTTPS only** - Never transmit credentials over HTTP
- **Implement rate limiting** for public-facing webhooks
- **Monitor workflow execution logs** for suspicious activity

### 🔒 API Key Security

All workflows in this repository use **placeholder credentials**:

- `sk-your-openai-key-here` → Replace with your actual OpenAI key
- `your-supabase-anon-key` → Replace with your Supabase keys
- `your-webhook-url` → Replace with your Discord/Slack webhooks

**Before activating workflows:**
1. Configure all required credentials in your n8n instance
2. Test with non-production/sandbox API keys first
3. Use separate credentials for development and production

### 📊 Data Privacy

These workflows may process:
- RSS feed data (public)
- AI-generated content (sent to OpenAI)
- Social media posts (public)
- Analytics data (stored in Airtable/Google Sheets)

**Recommendations:**
- Review OpenAI's [data usage policy](https://openai.com/policies/usage-policies)
- Implement data retention policies for stored content
- Comply with GDPR/CCPA if processing EU/CA user data
- Encrypt sensitive data at rest in Supabase

### 🚨 Common Vulnerabilities to Avoid

| Risk | Mitigation |
|------|------------|
| **Hardcoded secrets** | Use n8n credentials and environment variables |
| **Open webhooks** | Add authentication headers or tokens |
| **XSS in code nodes** | Sanitize all user inputs before processing |
| **API key exposure** | Never log credentials; use `.gitignore` |
| **Excessive permissions** | Use least-privilege API keys (e.g., read-only where possible) |
| **Unvalidated redirects** | Validate all URLs before HTTP requests |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in these workflows, please follow responsible disclosure:

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, report via one of these methods:

1. **GitHub Security Advisories** (preferred):
   - Go to the [Security tab](https://github.com/snevemoney/n8n-cursor/security)
   - Click "Report a vulnerability"
   - Provide detailed description

2. **Email**:
   - Send to: security@[repository-domain].com
   - Subject: `[SECURITY] n8n-cursor vulnerability`
   - Include: Description, reproduction steps, impact assessment

3. **GitHub Issues** (for non-sensitive security improvements):
   - Use `[SECURITY]` tag in title
   - Only for configuration recommendations, not active exploits

### What to Include

- **Description** of the vulnerability
- **Affected workflows** (which JSON files)
- **Steps to reproduce** the issue
- **Potential impact** (what could an attacker do?)
- **Suggested fix** (if you have one)
- **Your contact info** for follow-up

### Response Timeline

- **Initial response**: Within 48 hours
- **Triage and assessment**: Within 7 days
- **Fix development**: Depends on severity (critical: <24h, high: <7d, medium: <30d)
- **Public disclosure**: After fix is deployed and users are notified

### Safe Harbor

We support responsible disclosure:
- We will not pursue legal action against researchers who follow this policy
- We will publicly credit you (unless you prefer to remain anonymous)
- We encourage coordinated disclosure timing

## Security Checklist for Users

Before deploying these workflows to production:

- [ ] All placeholder credentials replaced with real values
- [ ] `.env` file created and excluded from version control
- [ ] OAuth credentials configured in n8n (not hardcoded)
- [ ] Webhook paths changed to unique, non-guessable values
- [ ] Webhook authentication enabled (headers, tokens, IP allowlist)
- [ ] Rate limiting configured for public webhooks
- [ ] Error handling configured (don't expose sensitive data in errors)
- [ ] Logs reviewed for credential leaks
- [ ] API keys use least-privilege permissions
- [ ] Production and development credentials separated
- [ ] Backup and disaster recovery plan in place
- [ ] Monitoring and alerting configured for failed executions

## Security Tools

We recommend using these tools for security:

| Tool | Purpose | How to Use |
|------|---------|------------|
| **GitHub Secret Scanning** | Detect committed secrets | Enable in repository settings |
| **git-secrets** | Pre-commit hook for secrets | Install locally: `brew install git-secrets` |
| **n8n Security Audit** | Review workflow permissions | Use n8n's built-in audit logs |
| **OWASP ZAP** | Test webhook security | Scan your webhook endpoints |

## References

- [n8n Security Best Practices](https://docs.n8n.io/hosting/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Last Updated**: 2025-11-25
**Version**: 1.0.0
