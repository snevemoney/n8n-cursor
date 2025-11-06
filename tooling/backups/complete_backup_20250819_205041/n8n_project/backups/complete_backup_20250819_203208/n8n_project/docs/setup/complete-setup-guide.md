# Complete AI Content Team Setup Guide

## 🚀 Quick Start Overview

You now have a complete AI business automation system with:
- **5 Revenue Stream Workflows** (Marketplace, Chatbots, Custom Models, Vibe Coding, Agency)
- **4 AI Content Team Agents** (Topic Generation, Research, Writing, Publishing)
- **MCP Server Integration** for Cursor chat-to-n8n automation
- **Professional Infrastructure** with monitoring and analytics

## 📋 Prerequisites

### Required Software
```bash
# Node.js (v18+)
node --version

# PostgreSQL (v12+)
psql --version

# n8n (latest)
npm install n8n -g

# Git (for version control)
git --version
```

### Required API Keys
1. **OpenAI API Key** - For AI model interactions
2. **Stripe API Keys** - For payment processing
3. **Replicate API Token** - For custom model deployment
4. **Pinecone API Key** - For vector database
5. **Netlify API Token** - For rapid deployment
6. **Mailchimp API Key** - For email marketing (optional)
7. **Buffer/Hootsuite API** - For social media (optional)

## 🏗️ Step-by-Step Installation

### Step 1: Environment Setup

```bash
# Clone and setup project
cd /home/evens/n8n-cursor

# Create environment file
cp config/credentials/template.json config/credentials/production.json

# Edit with your actual credentials
nano config/credentials/production.json
```

### Step 2: Database Setup

```bash
# Create database
createdb n8n_ai_business

# Run main schema
psql n8n_ai_business < docs/setup/installation-guide.md

# Add content team tables
psql n8n_ai_business < docs/setup/content-team-database.sql

# Verify installation
psql n8n_ai_business -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### Step 3: N8N Configuration

```bash
# Set environment variables
export N8N_HOST=localhost
export N8N_PORT=5678
export WEBHOOK_URL=https://your-domain.com
export DB_POSTGRESDB_HOST=localhost
export DB_POSTGRESDB_DATABASE=n8n_ai_business
export DB_POSTGRESDB_USER=your_username
export DB_POSTGRESDB_PASSWORD=your_password

# Start n8n
n8n start
```

### Step 4: MCP Server Setup

```bash
# Install MCP dependencies
npm install -g @modelcontextprotocol/sdk

# Make MCP servers executable
chmod +x tools/mcp-servers/*.mjs

# Test MCP server
node tools/mcp-servers/n8n-server.mjs --test
```

### Step 5: Cursor Integration

1. **Open Cursor Settings** (Cmd/Ctrl + ,)
2. **Search for "MCP"**
3. **Add MCP Servers configuration:**

```json
{
  "mcpServers": {
    "n8n-automation": {
      "command": "node",
      "args": ["/home/evens/n8n-cursor/tools/mcp-servers/n8n-server.mjs"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-n8n-api-key-here"
      }
    },
    "n8n-validator": {
      "command": "node",
      "args": ["/home/evens/n8n-cursor/tools/mcp-servers/validator-server.mjs"]
    }
  }
}
```

4. **Restart Cursor**

### Step 6: Import Workflows

#### Option A: Manual Import (Recommended for first time)
1. Open n8n interface (http://localhost:5678)
2. Go to "Workflows" → "Import"
3. Import each workflow file from `/workflows/` directories
4. Configure credentials for each node
5. Activate workflows

#### Option B: Automated Import (Using Cursor + MCP)
```
Hey Cursor, please import all AI business workflows from /home/evens/n8n-cursor/workflows/ into my n8n instance. Start with the content team workflows and then add the business monetization workflows. Validate each workflow before importing with confirm:true.
```

## 🎯 Testing Your Setup

### 1. Test Content Team Pipeline

```bash
# Test Topic Generation
curl -X POST http://localhost:5678/webhook/generate-topics \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "AI/Automation",
    "target_audience": "Business owners",
    "content_goals": ["Lead generation"],
    "quantity": 5
  }'
```

### 2. Test Business Workflows

```bash
# Test Payment Processing
curl -X POST http://localhost:5678/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test123",
        "amount": 9900,
        "receipt_email": "test@example.com"
      }
    }
  }'
```

### 3. Test MCP Integration

In Cursor, type:
```
List all my n8n workflows and show me their status
```

Expected response: JSON list of workflows with status information

### 4. Test Workflow Creation

In Cursor, type:
```
Create a simple test workflow: Webhook → Set message to "Hello World" → Respond with JSON. Validate it first, then create with confirm:true
```

## 🔧 Configuration Options

### Content Team Settings

Edit workflow parameters to customize:

```javascript
// In Topic Generation Agent
const businessContext = {
  industry: 'Your Industry',
  brand_voice: 'Your Brand Voice',
  content_pillars: ['Pillar 1', 'Pillar 2', 'Pillar 3'],
  target_audience: 'Your Target Audience'
};
```

### Revenue Stream Configuration

1. **Marketplace Settings**: Configure pricing, delivery methods
2. **Chatbot Monetization**: Set subscription tiers and limits
3. **Custom Models**: Define training parameters and pricing
4. **Agency Operations**: Customize lead qualification criteria

### MCP Server Configuration

```bash
# Environment variables for MCP servers
export N8N_BASE_URL="https://your-n8n-domain.com"
export N8N_API_KEY="your-api-key"
export VALIDATION_LEVEL="strict"  # or "standard"
export MCP_SERVER_NAME="your-server-name"
```

## 📊 Monitoring & Analytics

### Built-in Dashboards

1. **Content Performance**: Track engagement, conversions, ROI
2. **Business Metrics**: Revenue, customer acquisition, growth
3. **Workflow Health**: Execution success rates, performance
4. **Team Productivity**: Content output, quality scores

### Database Queries for Analytics

```sql
-- Content team performance
SELECT 
  agent_type,
  AVG(performance_score) as avg_performance,
  SUM(content_produced) as total_content,
  AVG(average_quality_score) as avg_quality
FROM team_analytics 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY agent_type;

-- Revenue by stream
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as total_revenue,
  COUNT(*) as transaction_count
FROM purchases 
GROUP BY month 
ORDER BY month DESC;

-- Top performing content
SELECT 
  c.title,
  p.performance_score,
  p.metrics_data->'blog_metrics'->>'page_views' as page_views
FROM content_drafts c
JOIN content_performance p ON c.content_id = p.content_id
ORDER BY p.performance_score DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Common Issues

1. **MCP Server Not Responding**
   ```bash
   # Check if server is running
   ps aux | grep mcp-server
   
   # Restart MCP server
   pkill -f n8n-server.mjs
   node tools/mcp-servers/n8n-server.mjs
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   psql n8n_ai_business -c "SELECT NOW();"
   
   # Check connection string in n8n
   echo $DB_POSTGRESDB_HOST
   ```

3. **Workflow Execution Failures**
   - Check node credentials are configured
   - Verify API keys are valid
   - Review webhook URLs and paths
   - Check database permissions

4. **Cursor MCP Integration Issues**
   - Verify MCP server paths are correct
   - Check environment variables
   - Restart Cursor after configuration changes
   - Review Cursor logs for MCP errors

### Debug Commands

```bash
# Test n8n API
curl -H "X-N8N-API-KEY: your-key" http://localhost:5678/rest/workflows

# Test webhook endpoints
curl -X POST http://localhost:5678/webhook/test

# Check database connectivity
psql n8n_ai_business -c "SELECT version();"

# Validate workflow JSON
node tools/mcp-servers/validator-server.mjs --validate workflow.json
```

## 🔐 Security Considerations

### API Key Management
- Store all API keys in n8n credentials, never in workflow JSON
- Use environment variables for MCP server configuration
- Rotate API keys regularly
- Implement webhook signature verification

### Database Security
```sql
-- Create dedicated n8n user with limited permissions
CREATE USER n8n_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE n8n_ai_business TO n8n_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_user;
```

### Network Security
- Use HTTPS for all external webhooks
- Implement rate limiting on webhook endpoints
- Configure firewall rules for database access
- Use VPN for remote access to n8n instance

## 📈 Scaling & Optimization

### Performance Optimization

1. **Database Indexing**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_workflows_active ON workflows(active);
   CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
   ```

2. **Workflow Optimization**
   - Use `workflows.diffUpdate` for minimal changes
   - Implement caching for frequently accessed data
   - Optimize AI model calls with batching
   - Use parallel execution where possible

3. **Infrastructure Scaling**
   - Consider n8n clustering for high availability
   - Implement load balancing for webhook endpoints
   - Use read replicas for analytics queries
   - Setup CDN for static content delivery

### Cost Optimization

1. **AI API Usage**
   - Monitor token consumption across workflows
   - Implement usage quotas and alerts
   - Use cheaper models for simple tasks
   - Cache AI responses when appropriate

2. **Infrastructure Costs**
   - Right-size database instances
   - Use serverless functions for occasional tasks
   - Implement auto-scaling policies
   - Regular cost analysis and optimization

## 🆘 Support & Maintenance

### Regular Maintenance Tasks

1. **Daily**
   - Monitor workflow execution success rates
   - Check error logs and alerts
   - Review API usage and costs

2. **Weekly**
   - Backup database and workflow configurations
   - Update security patches
   - Review performance metrics
   - Analyze content team productivity

3. **Monthly**
   - Rotate API keys and credentials
   - Review and optimize workflow performance
   - Analyze business metrics and ROI
   - Update documentation

### Backup Strategy

```bash
# Database backup
pg_dump n8n_ai_business > backup_$(date +%Y%m%d).sql

# Workflow backup
curl -H "X-N8N-API-KEY: your-key" \
  "http://localhost:5678/rest/workflows" > workflows_backup.json

# Git backup
git add .
git commit -m "Backup $(date)"
git push origin main
```

## 🎉 Success Metrics

### Content Team KPIs
- **Content Production Rate**: Articles per week
- **Content Quality Score**: Average quality rating
- **Engagement Metrics**: Views, shares, comments
- **Conversion Rate**: Content to leads ratio

### Business KPIs
- **Monthly Recurring Revenue (MRR)**
- **Customer Acquisition Cost (CAC)**
- **Lifetime Value (LTV)**
- **Workflow Execution Success Rate**
- **API Response Times**

### Technical KPIs
- **System Uptime**: 99.9% target
- **Workflow Success Rate**: 95%+ target
- **Average Response Time**: <2 seconds
- **Error Rate**: <1%

---

## 🚀 You're Ready!

Your AI Content Team and Business Automation Hub is now fully operational. You can:

1. **Generate content ideas** using the Topic Generation Agent
2. **Research and validate** topics with the Research Agent
3. **Write high-quality content** using the Writing Agent
4. **Publish and distribute** across channels with the Publishing Agent
5. **Monetize your expertise** through 5 different revenue streams
6. **Chat with n8n** directly in Cursor using MCP integration

**Next Steps:**
1. Create your first content topic batch
2. Set up your first revenue stream
3. Configure monitoring and alerts
4. Start scaling your automation empire!

For additional support, refer to the individual workflow documentation or reach out to the community.
