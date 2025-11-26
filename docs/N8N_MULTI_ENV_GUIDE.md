# n8n Multi-Environment Promotion Guide

This guide explains how to use the multi-environment n8n promotion system that allows you to develop workflows locally and promote them through various stages to production.

## 🏗️ **System Architecture**

The system consists of:

1. **Multiple n8n instances** (local, integration, testing, staging, production)
2. **MCP servers** for each environment with enable/disable flags
3. **Promotion scripts** for moving workflows between environments
4. **Sync scripts** for backing up or synchronizing environments
5. **Environment-specific configuration** with namespaced variables

## 🚀 **Quick Start**

### 1. **Setup Environment Variables**

Copy the template and configure your environments:

```bash
cp env-templates/n8n-multi-env.example .env
```

Edit `.env` with your actual API keys and URLs.

### 2. **Enable Desired Environments**

For local development only:
```bash
N8N_LOCAL_ENABLED=1
N8N_PRD_ENABLED=0
```

For full testing:
```bash
N8N_LOCAL_ENABLED=1
N8N_INT_ENABLED=1
N8N_TEST_ENABLED=1
N8N_STG_ENABLED=1
N8N_PRD_ENABLED=1
```

### 3. **Test Connections**

Verify your MCP servers can connect to each environment:

```bash
# Test local
curl -H "X-N8N-API-KEY: $N8N_LOCAL_API_KEY" "http://localhost:5678/api/v1/workflows"

# Test production
curl -H "X-N8N-API-KEY: $N8N_PRD_API_KEY" "https://n8ncloud.tech/api/v1/workflows"
```

## 📋 **Workflow Promotion**

### **Basic Promotion**

Promote a workflow from local to production:

```bash
npm run promote -- --from local --to production --name "My Workflow"
```

### **Promote and Activate**

Promote and immediately activate the workflow:

```bash
npm run promote:activate -- --from local --to production --name "My Workflow"
```

### **Promote by ID**

If you know the workflow ID:

```bash
npm run promote -- --from local --to production --id "workflow-id-here"
```

### **Environment Chain**

Promote through the full pipeline:

```bash
# Local → Integration
npm run promote -- --from local --to integration --name "My Workflow"

# Integration → Testing
npm run promote -- --from integration --to testing --name "My Workflow"

# Testing → Staging
npm run promote -- --from testing --to staging --name "My Workflow"

# Staging → Production
npm run promote:activate -- --from staging --to production --name "My Workflow"
```

## 🔄 **Workflow Synchronization**

### **Sync Down (Backup)**

Pull all workflows from production to local:

```bash
npm run sync:down -- --from production --to local
```

### **Sync with Overwrite**

Force update existing workflows:

```bash
npm run sync:down -- --from production --to local --overwrite
```

### **Cross-Environment Sync**

Sync between any two environments:

```bash
npm run sync:down -- --from staging --to testing
```

## ⚙️ **Configuration Options**

### **Webhook Path Prefixes**

Automatically prefix webhook paths per environment:

```bash
# In .env
PROMOTE_PRODUCTION_WEBHOOK_PREFIX=prod-
PROMOTE_STAGING_WEBHOOK_PREFIX=stg-
PROMOTE_TESTING_WEBHOOK_PREFIX=test-
```

### **HTTP URL Rewriting**

Replace base URLs in HTTP Request nodes:

```bash
# In .env
PROMOTE_PRODUCTION_REPLACE_BASE=http://localhost:3000
PROMOTE_PRODUCTION_WITH_BASE=https://api.yourdomain.com
```

### **Credential Handling**

- Credentials are referenced by name (not ID)
- The system validates that required credentials exist in the target environment
- Missing credentials will show warnings but won't block promotion

## 🛡️ **Safety Features**

### **Workflow Sanitization**

The promotion process automatically:

- Removes workflow and node IDs
- Sets workflows to inactive initially
- Sanitizes credential references
- Applies environment-specific transformations
- Preserves workflow structure and connections

### **Validation**

Before promotion, the system:

- Validates source workflow exists
- Checks required credentials in target environment
- Verifies target environment connectivity
- Provides detailed error messages

### **Rollback**

If something goes wrong:

1. The original workflow remains unchanged
2. Failed promotions don't affect target environment
3. Detailed logs show what happened
4. Sanitized workflow is saved for inspection

## 🔧 **Advanced Usage**

### **Custom Environment Names**

Add new environments by:

1. Adding to `envConfig` in the scripts
2. Adding environment variables to `.env`
3. Updating MCP configuration

### **Batch Operations**

Promote multiple workflows:

```bash
# Script to promote multiple workflows
for workflow in "Workflow A" "Workflow B" "Workflow C"; do
  npm run promote -- --from local --to production --name "$workflow"
done
```

### **CI/CD Integration**

Use in your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Promote to Staging
  run: |
    npm run promote -- --from testing --to staging --name "${{ github.event.head_commit.message }}"
  
- name: Promote to Production
  if: github.ref == 'refs/heads/main'
  run: |
    npm run promote:activate -- --from staging --to production --name "${{ github.event.head_commit.message }}"
```

## 📊 **Monitoring and Debugging**

### **Logs**

All operations provide detailed logging:

- Source workflow details
- Sanitization steps
- Credential validation
- Creation/update results
- Summary statistics

### **Reports**

Sync operations generate detailed reports:

```json
{
  "timestamp": "2025-01-19T10:30:00.000Z",
  "from": "local",
  "to": "production",
  "results": {
    "created": 5,
    "updated": 2,
    "skipped": 1,
    "failed": 0
  },
  "sourceCount": 8,
  "targetCount": 7
}
```

### **Troubleshooting**

Common issues and solutions:

1. **"Unauthorized" errors**: Check API keys and enable flags
2. **Missing credentials**: Create credentials with matching names in target
3. **Connection failures**: Verify network connectivity and URLs
4. **Workflow not found**: Check workflow names and IDs

## 🚨 **Best Practices**

### **Development Workflow**

1. **Develop locally** with `N8N_LOCAL_ENABLED=1`
2. **Test thoroughly** before promotion
3. **Use descriptive names** for workflows
4. **Document dependencies** and credentials

### **Environment Management**

1. **Start with local only** for development
2. **Enable environments gradually** as needed
3. **Use different API keys** per environment
4. **Regular backups** with sync operations

### **Security**

1. **Never commit `.env` files** to version control
2. **Rotate API keys** regularly
3. **Use least privilege** for API keys
4. **Monitor access** and audit logs

### **Workflow Design**

1. **Use environment variables** for URLs and endpoints
2. **Reference credentials by name** not ID
3. **Avoid hardcoded values** that change between environments
4. **Test webhook paths** in each environment

## 🔮 **Future Enhancements**

Planned features:

- **Workflow versioning** and rollback
- **Dependency tracking** between workflows
- **Automated testing** during promotion
- **Approval workflows** for production deployments
- **Performance monitoring** and optimization
- **Multi-tenant support** for teams

## 📚 **Additional Resources**

- [n8n API Documentation](https://docs.n8n.io/api/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Environment Management Best Practices](https://12factor.net/config)
- [CI/CD Pipeline Design](https://martinfowler.com/articles/continuousIntegration.html)

## 🆘 **Support**

For issues or questions:

1. Check the troubleshooting section above
2. Review logs and error messages
3. Verify environment configuration
4. Test API connectivity manually
5. Check n8n instance status and logs

---

**Happy Automating! 🚀**
