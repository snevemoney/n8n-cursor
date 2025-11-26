# 📧 n8n SMTP Setup Complete - What You Have Now

## ✅ Files Created

1. **`SMTP_QUICK_START.md`** - Quick reference for setting up SMTP
2. **`N8N_SMTP_CONFIGURATION.md`** - Detailed guide with all options
3. **`configure-n8n-smtp.sh`** - Automated script to configure SMTP

## 🎯 Your n8n Instance

- **Host**: 69.62.66.78:22222
- **Container ID**: 2ec27e36-e6be-4aec-9bc9-32c23839b66b
- **URL**: https://n8ncloud.tech

## 🚀 Recommended: Use Option 2 (Manual Docker Compose)

This is the most reliable method for production:

### Step 1: SSH to Host
```bash
ssh -p 22222 your-username@69.62.66.78
```

### Step 2: Locate docker-compose.yml
```bash
cd ~/.n8n
ls -la docker-compose.yml
```

### Step 3: Edit docker-compose.yml
```bash
nano docker-compose.yml
```

Add these environment variables to the `n8n` service:

```yaml
services:
  n8n:
    image: n8nio/n8n:1.55.1  # or your current version
    environment:
      # ... existing variables ...
      
      # SMTP Configuration
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=your-smtp-host.com
      - N8N_SMTP_PORT=587
      - N8N_SMTP_USER=your-username
      - N8N_SMTP_PASS=your-password
      - N8N_SMTP_SENDER=your-sender@email.com
```

### Step 4: Save and Restart
```bash
# Save the file (in nano: Ctrl+O, Enter, Ctrl+X)

# Restart n8n with new configuration
docker-compose down
docker-compose up -d
```

### Step 5: Verify Configuration
```bash
# Check environment variables are loaded
docker exec 2ec27e36-e6be-4aec-9bc9-32c23839b66b env | grep N8N_SMTP
```

## 📝 What Environment Variables You Need

Based on your 20 workflows, set these in your n8n host:

```bash
N8N_EMAIL_MODE=smtp                    # Always set to "smtp"
N8N_SMTP_HOST=<your_smtp_host>         # e.g., smtp.gmail.com
N8N_SMTP_PORT=<your_smtp_port>         # Usually 587 or 465
N8N_SMTP_USER=<your_smtp_username>      # Your SMTP username
N8N_SMTP_PASS=<your_smtp_password>      # Your SMTP password
N8N_SMTP_SENDER=<your_sender_email>    # Sender email address
```

## 🔍 Which Workflows Use Email?

These workflows include Email Send nodes that will use your SMTP configuration:

1. **Workflow #9** - Email Notification System (6 email types)
2. **Workflow #18** - Refund Management (refund notifications)

## ⚠️ Important: Update Workflow Sender Emails

Your workflows currently have hardcoded sender: `noreply@saas-chatbot.com`

**After configuring SMTP**, update in n8n UI:

1. Open Workflow #9 (Email Notifications)
2. Click each "Send Email" node
3. Change "From Email" to: `={{ $env.N8N_SMTP_SENDER }}`
4. Save workflow
5. Repeat for Workflow #18

OR keep it simple and hardcode:
```
fromEmail: "noreply@yourdomain.com"
```

## 🧪 Test Your Setup

Once configured, test with curl:

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

You should receive an email at your-test@email.com

## 📚 Common SMTP Providers

### Gmail (Use App Password)
```
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-email@gmail.com
N8N_SMTP_PASS=your-app-password
N8N_SMTP_SENDER=noreply@yourdomain.com
```

### SendGrid
```
N8N_SMTP_HOST=smtp.sendgrid.net
N8N_SMTP_PORT=587
N8N_SMTP_USER=apikey
N8N_SMTP_PASS=your-sendgrid-api-key
N8N_SMTP_SENDER=noreply@yourdomain.com
```

### Mailgun
```
N8N_SMTP_HOST=smtp.mailgun.org
N8N_SMTP_PORT=587
N8N_SMTP_USER=postmaster@your-domain.mailgun.org
N8N_SMTP_PASS=your-mailgun-smtp-password
N8N_SMTP_SENDER=noreply@yourdomain.com
```

## 🐛 Troubleshooting

### Check n8n Logs
```bash
ssh -p 22222 your-username@69.62.66.78
docker logs 2ec27e36-e6be-4aec-9bc9-32c23839b66b
```

Look for SMTP-related errors.

### Verify Variables Are Set
```bash
docker exec 2ec27e36-e6be-4aec-9bc9-32c23839b66b env | grep N8N_SMTP
```

Should show all 6 SMTP variables.

### Test SMTP Connectivity
```bash
docker exec 2ec27e36-e6be-4aec-9bc9-32c23839b66b ping -c 3 smtp.gmail.com
```

## 🔐 Security Notes

- Never commit real credentials to git
- Use App Passwords for Gmail (not regular password)
- Consider Docker secrets for production
- Regularly rotate SMTP credentials
- Use TLS (port 587) or SSL (port 465)

## ✅ Next Steps After SMTP Configuration

1. ✅ SMTP environment variables configured
2. ✅ n8n container restarted with new config
3. ⚠️ Update workflow sender emails (see above)
4. 🧪 Test email sending with curl or workflow
5. 🚀 Deploy and monitor

## 📄 Need More Details?

- **Quick Start**: See `SMTP_QUICK_START.md`
- **Full Guide**: See `N8N_SMTP_CONFIGURATION.md`
- **Automated Script**: Run `sudo bash configure-n8n-smtp.sh`

---

**Status**: ✅ Ready to configure  
**Your Action**: SSH to host and add SMTP variables to docker-compose.yml
