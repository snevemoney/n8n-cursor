# Deployment Setup Guide

This guide walks you through setting up the deployment pipeline for n8n-cursor.

## 🚀 **Quick Setup Checklist**

### 1. **Create GitHub Environments**

Go to your repository → **Settings** → **Environments** and create:

- **`staging`** environment
- **`production`** environment

### 2. **Add Required Secrets**

For **both** environments, add these secrets (names must match exactly):

| Secret Name | Example Value | Notes |
|-------------|---------------|-------|
| `SSH_HOST` | `69.62.66.78` | Your VPS IP address |
| `SSH_USER` | `evens` | The Linux username you SSH with |
| `SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Full private key content (no quotes) |
| `PROJECT_PATH` | `/home/evens/n8n-cursor` | Absolute path to repo on server |
| `HEALTH_URL` | `https://n8ncloud.tech/healthz` | Must return 200 when healthy |

**Important**: Don't add quotes around values, paste raw content.

### 3. **SSH Key Setup**

**On your local machine:**
```bash
# Generate a new deploy key (if you don't have one)
ssh-keygen -t ed25519 -f ~/.ssh/n8n-deploy -C "n8n-deploy@n8ncloud.tech"

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/n8n-deploy.pub evens@69.62.66.78 -p 22222

# Copy the private key content for GitHub
cat ~/.ssh/n8n-deploy
```

**On your server:**
```bash
# Ensure proper SSH permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys ~/.ssh/id_ed25519
chown -R $USER:$USER ~/.ssh
```

## 🔧 **How It Works**

### **Branch Mapping**
- **`04-staging`** → deploys to **staging** environment
- **`main`** → deploys to **production** environment

### **Deployment Flow**
1. Push to branch triggers workflow
2. **Fail-fast validation**: Checks all required secrets are present
3. Workflow automatically selects environment
4. SSH to server using environment secrets
5. Pull latest code
6. Run health checks (`make guard`, `make doctor`)
7. Deploy services (`DRY_RUN=0 make up`)
8. **Health verification**: Curl health endpoint with 20s timeout
9. **Auto-rollback**: If health check fails, automatically rolls back to previous commit

## 🧪 **Validation Commands**

### **Before First Deploy**
```bash
# On your server
cd /home/evens/n8n-cursor
make guard          # ✅ Repository structure validated
make doctor         # ✅ System health verified
make ports          # ✅ Port configuration checked
```

### **Test Deploy**
```bash
# Make a small change to README.md
git checkout -b test-deploy
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: deployment pipeline"
git push origin test-deploy

# Create PR to 04-staging
# Watch the Deploy workflow run
```

## 🚨 **Troubleshooting**

### **"Context access might be invalid" Warnings**
- **Cause**: Secrets not configured in GitHub environments
- **Fix**: Add all required secrets to both `staging` and `production` environments

### **SSH Permission Denied**
- **Cause**: Incorrect SSH key or permissions
- **Fix**: 
  ```bash
  # On server
  chmod 700 ~/.ssh
  chmod 600 ~/.ssh/authorized_keys
  chown -R $USER:$USER ~/.ssh
  ```

### **Health Check Fails**
- **Cause**: Health endpoint not accessible or returning non-200
- **Fix**: 
  ```bash
  # Test locally
  curl -f https://n8ncloud.tech/healthz
  # Check nginx configuration
  # Verify services are running
  ```

### **Port Conflicts**
- **Cause**: Services trying to use same ports
- **Fix**: 
  ```bash
  make ports          # Check current port usage
  make ports-resolve  # Auto-resolve conflicts
  ```

## 📋 **Pre-Deployment Checklist**

- [ ] GitHub environments created (`staging`, `production`)
- [ ] All secrets configured in both environments
- [ ] SSH key working (`ssh -p 22222 evens@69.62.66.78`)
- [ ] Server health checks pass (`make doctor`)
- [ ] Port configuration valid (`make ports`)
- [ ] Repository structure clean (`make guard`)

## 🔒 **Security Notes**

- **Never commit secrets** to the repository
- **Use environment-specific secrets** for staging vs production
- **Rotate SSH keys** regularly
- **Monitor deployment logs** for any sensitive information
- **Use branch protection** on `main` and `04-staging`

## 📚 **Related Commands**

```bash
# Health & Status
make status          # Show running services
make logs            # View service logs
make doctor          # System health check

# Deployment
make up              # Start services (dry-run by default)
make down            # Stop services
make restart         # Restart services

# Port Management
make ports           # Check port configuration
make ports-cleanup   # Clean up stale ports
make ports-resolve   # Resolve port conflicts

# Validation
make guard           # Repository structure validation
make wf-validate     # Workflow validation
make ci              # Run all checks
```

## 🆘 **Emergency Procedures**

### **Manual Deploy (if pipeline fails)**
```bash
# SSH to server
ssh -p 22222 evens@69.62.66.78

# Manual deployment
cd /home/evens/n8n-cursor
git fetch --all
git checkout main  # or 04-staging
git pull origin main
DRY_RUN=0 make up
```

### **Rollback**
```bash
# Check recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard HEAD~1
DRY_RUN=0 make up
```

## 🎯 **Next Steps After Setup**

1. **Test Staging Deploy**:
   - Push a small change to `04-staging`
   - Watch the Deploy workflow run
   - Verify it chooses `staging` environment
   - Check that health endpoint returns 200

2. **Test Production Deploy**:
   - Merge a small change to `main`
   - Watch the Deploy workflow run
   - Verify it chooses `production` environment
   - Confirm successful deployment

3. **Monitor Disaster Recovery**:
   - Check that disaster-recovery.yml runs every 15 minutes
   - Verify health monitoring is working

---

**Need Help?** Check the logs in GitHub Actions or run `make doctor` on the server for diagnostics.
