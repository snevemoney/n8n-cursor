# n8n SMTP Configuration Guide

## Environment Variables to Set on n8n Host

Your n8n instance is running on: **69.62.66.78:22222**

Based on your workflows, you need to set the following SMTP environment variables on the n8n host:

```bash
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=<your_smtp_host>
N8N_SMTP_PORT=<your_smtp_port>
N8N_SMTP_USER=<your_smtp_username>
N8N_SMTP_PASS=<your_smtp_password>
N8N_SMTP_SENDER=<your_smtp_sender_email>
```

## How to Set These Variables (Docker Container)

Since your n8n is running in Docker (container ID: `2ec27e36-e6be-4aec-9bc9-32c23839b66b`), you need to:

### Option 1: Add to Docker Compose (Recommended)

1. **SSH into your n8n host:**
   ```bash
   ssh -p 22222 your-username@69.62.66.78
   ```

2. **Navigate to your n8n docker-compose directory:**
   ```bash
   cd ~/.n8n  # or wherever your docker-compose file is
   ```

3. **Edit your docker-compose.yml** and add these to the `n8n` service's `environment` section:
   ```yaml
   services:
     n8n:
       environment:
         # ... existing env vars ...
         - N8N_EMAIL_MODE=smtp
         - N8N_SMTP_HOST=<your_smtp_host>
         - N8N_SMTP_PORT=<your_smtp_port>
         - N8N_SMTP_USER=<your_smtp_username>
         - N8N_SMTP_PASS=<your_smtp_password>
         - N8N_SMTP_SENDER=<your_smtp_sender_email>
   ```

4. **Restart the container:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Option 2: Set Environment Variables Directly

```bash
# SSH into host
ssh -p 22222 your-username@69.62.66.78

# Export the variables for the running container
docker exec -it 2ec27e36-e6be-4aec-9bc9-32c23839b66b bash
export N8N_EMAIL_MODE=smtp
export N8N_SMTP_HOST=<your_smtp_host>
export N8N_SMTP_PORT=<your_smtp_port>
export N8N_SMTP_USER=<your_smtp_username>
export N8N_SMTP_PASS=<your_smtp_password>
export N8N_SMTP_SENDER=<your_smtp_sender_email>
```

**Note:** This method is temporary. Use Option 1 for permanent configuration.

### Option 3: Using .env File

If your docker-compose uses `env_file`, add these to your `.env` file:

```bash
# SSH into host
ssh -p 22222 your-username@69.62.66.78

# Create or edit .env file
nano .env  # or vim .env
```

Add these lines:
```env
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=<your_smtp_host>
N8N_SMTP_PORT=<your_smtp_port>
N8N_SMTP_USER=<your_smtp_username>
N8N_SMTP_PASS=<your_smtp_password>
N8N_SMTP_SENDER=<your_smtp_sender_email>
```

Then update your docker-compose.yml to include:
```yaml
services:
  n8n:
    env_file:
      - .env
```

## Verify Configuration

After setting the variables, test the email configuration:

```bash
# Restart n8n
docker-compose restart n8n

# Check if variables are loaded
docker exec 2ec27e36-e6be-4aec-9bc9-32c23839b66b env | grep N8N_SMTP
```

You should see all your SMTP variables listed.

## Next Steps

Once the environment variables are set in n8n, you'll need to update the workflows to use them. I've created a separate document for that.

## Security Notes

- **Never commit** your `.env` file with real credentials
- Use strong passwords for SMTP authentication
- Consider using Docker secrets for production
- Regularly rotate SMTP credentials

## Support

If you need help with specific SMTP providers, here are common configurations:

### Gmail
```
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-gmail@gmail.com
N8N_SMTP_PASS=your-app-password  # Use App Password, not regular password
N8N_SMTP_SENDER=your-name@gmail.com
```

### SendGrid
```
N8N_SMTP_HOST=smtp.sendgrid.net
N8N_SMTP_PORT=587
N8N_SMTP_USER=apikey
N8N_SMTP_PASS=your-sendgrid-api-key
N8N_SMTP_SENDER=your-verified-sender@yourdomain.com
```

### Mailgun
```
N8N_SMTP_HOST=smtp.mailgun.org
N8N_SMTP_PORT=587
N8N_SMTP_USER=postmaster@yourdomain.mailgun.org
N8N_SMTP_PASS=your-mailgun-smtp-password
N8N_SMTP_SENDER=noreply@yourdomain.com
```

### AWS SES
```
N8N_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-ses-smtp-username
N8N_SMTP_PASS=your-ses-smtp-password
N8N_SMTP_SENDER=noreply@yourdomain.com
```

