# 🚀 Quick Start: n8n SMTP Configuration

## TL;DR

Your n8n instance is on: **69.62.66.78:22222**  
Container ID: **2ec27e36-e6be-4aec-9bc9-32c23839b66b**

## Three Ways to Configure SMTP

### Option 1: Automated Script (Easiest) ✅

**On your LOCAL machine:**

```bash
# Download and run the configuration script
cd /Users/evenslouis/n8n-cursor
sudo bash configure-n8n-smtp.sh
```

The script will:
- Prompt you for SMTP credentials
- Connect to your n8n host
- Configure docker-compose.yml with SMTP settings
- Restart n8n with new configuration

**You'll need:**
- SMTP Host (e.g., `smtp.gmail.com`)
- SMTP Port (usually `587`)
- SMTP Username
- SMTP Password
- Sender Email

### Option 2: Manual Docker Compose (Recommended for Production) ✅

**SSH into your n8n host:**

```bash
ssh -p 22222 your-username@69.62.66.78
```

**Navigate to n8n directory:**
```bash
cd ~/.n8n  # or wherever your docker-compose.yml is located
```

**Edit docker-compose.yml:**
```bash
nano docker-compose.yml
```

**Add these lines to the `n8n` service's `environment` section:**

```yaml
services:
  n8n:
    environment:
      # ... existing vars ...
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=your-smtp-host.com
      - N8N_SMTP_PORT=587
      - N8N_SMTP_USER=your-username
      - N8N_SMTP_PASS=your-password
      - N8N_SMTP_SENDER=your-sender@email.com
```

**Save and restart:**
```bash
docker-compose down
docker-compose up -d
```

### Option 3: Quick Direct Setup (Temporary) ⚠️

**For quick testing only:**

```bash
# SSH into host
ssh -p 22222 your-username@69.62.66.78

# Export variables directly to running container
docker exec -e N8N_EMAIL_MODE=smtp \
  -e N8N_SMTP_HOST=your-host \
  -e N8N_SMTP_PORT=587 \
  -e N8N_SMTP_USER=your-user \
  -e N8N_SMTP_PASS=your-pass \
  -e N8N_SMTP_SENDER=your-email@domain.com \
  2ec27e36-e6be-4aec-9bc9-32c23839b66b bash
```

**⚠️ This is temporary and will be lost on restart. Use Option 1 or 2 for permanent setup.**

## Verify Configuration

After setup, verify it worked:

```bash
# SSH into host
ssh -p 22222 your-username@69.62.66.78

# Check environment variables
docker exec 2ec27e36-e6be-4aec-9bc9-32c23839b66b env | grep N8N_SMTP
```

You should see:
```
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=...
N8N_SMTP_PORT=...
N8N_SMTP_USER=...
N8N_SMTP_PASS=...
N8N_SMTP_SENDER=...
```

## Common SMTP Providers

### Gmail
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: [Use App Password - not your regular password]
```

### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
```

### Mailgun
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@your-domain.mailgun.org
Password: [Your Mailgun SMTP Password]
```

### AWS SES
```
Host: email-smtp.us-east-1.amazonaws.com  # Use your region
Port: 587
Username: [Your SES SMTP Username]
Password: [Your SES SMTP Password]
```

## What Happens Next?

After configuring SMTP in n8n:

1. ✅ n8n will be able to send emails using the Email Send nodes
2. ✅ Your workflows (especially #9 Email Notifications) will work
3. ⚠️ You may need to update workflow sender emails from `noreply@saas-chatbot.com` to match your domain

## Test Your Configuration

Once configured, test with a simple workflow or use curl:

```bash
curl -X POST https://n8ncloud.tech/webhook/notifications/email \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "type": "welcome",
    "recipient": "your-test@email.com",
    "data": {
      "name": "Test User"
    }
  }'
```

## Troubleshooting

### "SMTP authentication failed"
- Check username and password are correct
- For Gmail, use App Password (not regular password)
- Verify SMTP credentials are correct

### "Connection timeout"
- Verify SMTP host and port are correct
- Check firewall allows outbound connections on SMTP port
- Try port 465 with SSL if 587 doesn't work

### "Environment variables not found"
- Make sure you restarted the container after adding variables
- Check docker-compose.yml syntax is correct
- Verify variables are under the correct service

## Security Reminders

🔒 **Important:**
- Never commit `.env` files with real credentials
- Use App Passwords for Gmail (not your main password)
- Consider using Docker secrets in production
- Regularly rotate SMTP credentials
- Use port 587 (TLS) or 465 (SSL), not port 25

## Need Help?

If you encounter issues:
1. Check n8n logs: `docker logs 2ec27e36-e6be-4aec-9bc9-32c23839b66b`
2. Verify network connectivity: `docker exec ... ping smtp-host`
3. Test SMTP credentials separately before configuring n8n
4. Review the full guide: `N8N_SMTP_CONFIGURATION.md`

