# 🔐 Scorpion Secrets Management Guide

## Current State

Scorpion currently uses environment variables stored in `.env` files. This guide outlines best practices and migration path to a secrets manager.

## Environment Variables

### Required Secrets
```bash
# n8n Integration
N8N_API_KEY=your-api-key
N8N_API_URL=http://n8n:5678

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Ollama (optional, local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Storage
SCORPION_SSD_PATH=/app/data/scorpion
```

### Best Practices (Current)

1. **Never commit `.env` files**
   - Use `.env.example` for templates
   - Add `.env*` to `.gitignore`
   - Use different `.env` files per environment

2. **Use environment-specific files**
   - `.env.development`
   - `.env.staging`
   - `.env.production`

3. **Rotate secrets regularly**
   - API keys: Every 90 days
   - Passwords: Every 180 days
   - Encryption keys: Annually

## Migration to Secrets Manager

### Option 1: HashiCorp Vault

#### Setup
```bash
# Install Vault (example)
docker run -d --name vault \
  -p 8200:8200 \
  -e VAULT_DEV_ROOT_TOKEN_ID=myroot \
  vault:latest
```

#### Store Secrets
```bash
# Login
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='myroot'

# Store secrets
vault kv put secret/scorpion/production \
  n8n_api_key="your-key" \
  openai_api_key="sk-..."

# Read secrets
vault kv get secret/scorpion/production
```

#### Integration
```typescript
// apps/scorpion/lib/secrets/vault-client.ts
import Vault from 'node-vault';

const vault = Vault({
  endpoint: process.env.VAULT_ADDR || 'http://localhost:8200',
  token: process.env.VAULT_TOKEN,
});

export async function getSecret(path: string, key: string): Promise<string> {
  const secret = await vault.read(path);
  return secret.data.data[key];
}
```

### Option 2: AWS Secrets Manager

#### Setup
```bash
# Install AWS CLI
# Configure credentials: aws configure
```

#### Store Secrets
```bash
aws secretsmanager create-secret \
  --name scorpion/production \
  --secret-string '{"n8n_api_key":"your-key","openai_api_key":"sk-..."}'
```

#### Integration
```typescript
// apps/scorpion/lib/secrets/aws-secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

export async function getSecret(secretName: string): Promise<Record<string, string>> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString || '{}');
}
```

### Option 3: Docker Secrets (Swarm)

#### Setup
```bash
# Create secret
echo "your-api-key" | docker secret create n8n_api_key -

# Use in docker-compose
services:
  scorpion:
    secrets:
      - n8n_api_key
    environment:
      N8N_API_KEY_FILE: /run/secrets/n8n_api_key
```

## Secrets Rotation

### Manual Rotation Process

1. **Generate new secret**
   ```bash
   # Generate new API key
   openssl rand -hex 32
   ```

2. **Update in secrets manager**
   ```bash
   vault kv patch secret/scorpion/production n8n_api_key="new-key"
   ```

3. **Update application**
   ```bash
   # Restart service to pick up new secret
   docker compose restart scorpion
   ```

4. **Verify**
   ```bash
   curl http://localhost:3003/api/health
   ```

5. **Revoke old secret**
   ```bash
   # Mark old key as revoked in source system
   ```

### Automated Rotation

**GitHub Actions Workflow:**
```yaml
name: Rotate Secrets

on:
  schedule:
    - cron: '0 0 1 * *'  # First day of month

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new secret
        run: |
          NEW_KEY=$(openssl rand -hex 32)
          echo "NEW_KEY=$NEW_KEY" >> $GITHUB_ENV
      
      - name: Update in Vault
        run: |
          vault kv patch secret/scorpion/production n8n_api_key="$NEW_KEY"
      
      - name: Restart service
        run: |
          # Trigger deployment to pick up new secret
```

## Audit Trail

### Logging Secret Access

```typescript
// apps/scorpion/lib/secrets/audit-logger.ts
export function logSecretAccess(secretName: string, action: 'read' | 'write' | 'delete') {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'secret_access',
    secret: secretName,
    action,
    user: process.env.USER || 'system',
  }));
}
```

### Vault Audit Log
```bash
# Enable audit logging
vault audit enable file file_path=/var/log/vault_audit.log

# View audit log
tail -f /var/log/vault_audit.log | jq
```

## Security Best Practices

1. **Principle of Least Privilege**
   - Only grant access to secrets that are needed
   - Use separate secrets per environment
   - Rotate credentials regularly

2. **Encryption**
   - Encrypt secrets at rest
   - Use TLS for secrets in transit
   - Encrypt backups

3. **Access Control**
   - Use IAM roles/service accounts
   - Implement MFA for admin access
   - Log all secret access

4. **Monitoring**
   - Alert on failed secret access
   - Monitor secret rotation
   - Track secret usage patterns

## Migration Checklist

- [ ] Choose secrets manager (Vault/AWS/Docker Secrets)
- [ ] Set up secrets manager infrastructure
- [ ] Migrate existing secrets
- [ ] Update application code to use secrets manager
- [ ] Update CI/CD to inject secrets
- [ ] Test secret rotation
- [ ] Set up audit logging
- [ ] Document procedures
- [ ] Train team on new process
- [ ] Decommission old `.env` files

## Emergency Procedures

### If Secret is Compromised

1. **Immediately rotate secret**
   ```bash
   # Generate new secret
   NEW_KEY=$(openssl rand -hex 32)
   
   # Update in secrets manager
   vault kv patch secret/scorpion/production n8n_api_key="$NEW_KEY"
   
   # Restart service
   docker compose restart scorpion
   ```

2. **Revoke old secret**
   - Revoke in source system (n8n, OpenAI, etc.)
   - Remove from all environments

3. **Investigate**
   - Review audit logs
   - Check for unauthorized access
   - Identify how secret was compromised

4. **Notify**
   - Alert security team
   - Notify affected services
   - Document incident

## Related Documentation
- [Deployment Guide](../apps/scorpion/DEPLOYMENT.md)
- [Security Contract](../security-contract.md)
- [Environment Variables](../ENV_VARS.md)

