# Installation & Setup Guide

## Prerequisites

Before setting up your AI Business Automation Hub, ensure you have:

- **n8n** (v1.0.0 or later)
- **PostgreSQL** database
- **Node.js** (v18+ recommended)
- **NPM** package manager
- API access to required services (see [API Configuration](#api-configuration))

## Quick Start

### 1. n8n Installation

```bash
# Global installation
npm install n8n -g

# Or using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e WEBHOOK_URL="https://your-domain.com" \
  n8nio/n8n
```

### 2. Database Setup

```sql
-- Create database
CREATE DATABASE n8n_ai_business;

-- Create tables for our workflows
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  challenges TEXT,
  budget_range VARCHAR(100),
  timeline VARCHAR(100),
  qualification_score INTEGER,
  pain_points JSONB,
  automation_opportunities JSONB,
  estimated_value DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  workflow_file JSONB,
  price DECIMAL(10,2),
  category VARCHAR(100),
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id),
  customer_email VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE knowledge_base (
  id SERIAL PRIMARY KEY,
  chatbot_id VARCHAR(255),
  content_type VARCHAR(50),
  source VARCHAR(255),
  content_hash VARCHAR(255),
  chunks_count INTEGER,
  words_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  plan_type VARCHAR(50),
  api_calls_remaining INTEGER,
  calls_this_month INTEGER,
  total_spent DECIMAL(10,2) DEFAULT 0,
  session_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_type VARCHAR(50),
  messages_limit INTEGER,
  status VARCHAR(50),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  chatbot_id VARCHAR(255),
  message TEXT,
  response TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE model_training (
  id SERIAL PRIMARY KEY,
  training_id VARCHAR(255) UNIQUE,
  user_id VARCHAR(255),
  model_name VARCHAR(255),
  model_type VARCHAR(100),
  status VARCHAR(50),
  replicate_training_id VARCHAR(255),
  model_url TEXT,
  estimated_cost DECIMAL(10,2),
  estimated_time INTEGER,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE model_marketplace (
  id SERIAL PRIMARY KEY,
  training_id VARCHAR(255),
  model_name VARCHAR(255),
  model_type VARCHAR(100),
  model_url TEXT,
  price DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_usage_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  model_id VARCHAR(255),
  request_data JSONB,
  response_data JSONB,
  cost DECIMAL(10,4),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vibe_projects (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) UNIQUE,
  idea_title VARCHAR(255),
  idea_description TEXT,
  deploy_url TEXT,
  user_email VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_feedback (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255),
  feedback_text TEXT,
  sentiment VARCHAR(50),
  key_insights JSONB,
  suggested_improvements JSONB,
  urgency_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) UNIQUE,
  client_name VARCHAR(255),
  project_name VARCHAR(255),
  project_value DECIMAL(10,2),
  complexity VARCHAR(50),
  phases JSONB,
  total_duration_weeks INTEGER,
  current_phase VARCHAR(100),
  phase_completion INTEGER DEFAULT 0,
  team_size INTEGER,
  status VARCHAR(50),
  project_start TIMESTAMP,
  estimated_completion TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Environment Configuration

Create a `.env` file in your project root:

```env
# Database
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n_ai_business
DB_POSTGRESDB_USER=your_username
DB_POSTGRESDB_PASSWORD=your_password

# n8n Configuration
N8N_HOST=localhost
N8N_PORT=5678
WEBHOOK_URL=https://your-domain.com

# API Keys (see API Configuration section)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
REPLICATE_API_TOKEN=r8_...
NETLIFY_API_TOKEN=...
PINECONE_API_KEY=...
MIXPANEL_TOKEN=...
```

## API Configuration

### Required API Services

1. **OpenAI** - For AI model interactions
   - Visit: https://platform.openai.com/api-keys
   - Create API key
   - Add to credentials as `openai`

2. **Stripe** - For payment processing
   - Visit: https://dashboard.stripe.com/apikeys
   - Get your secret key
   - Add to credentials as `stripeApi`

3. **Replicate** - For custom model deployment
   - Visit: https://replicate.com/account/api-tokens
   - Create API token
   - Add to credentials as `replicate`

4. **Pinecone** - For vector database
   - Visit: https://app.pinecone.io/
   - Create API key
   - Add to credentials as `pinecone`

5. **Netlify** - For rapid deployment
   - Visit: https://app.netlify.com/user/applications
   - Create personal access token
   - Add to credentials as `netlify`

6. **Notion** (Optional) - For project management
   - Visit: https://www.notion.so/my-integrations
   - Create integration
   - Add to credentials as `notion`

### Setting Up Credentials in n8n

1. Open n8n interface (http://localhost:5678)
2. Go to Settings → Credentials
3. Add each credential type:

```json
{
  "openai": {
    "apiKey": "sk-your-openai-key"
  },
  "stripeApi": {
    "secretKey": "sk_your-stripe-key"
  },
  "replicate": {
    "apiToken": "r8_your-replicate-token"
  },
  "pinecone": {
    "apiKey": "your-pinecone-key"
  },
  "netlify": {
    "apiToken": "your-netlify-token"
  }
}
```

## Workflow Import

### Import All Workflows

```bash
# Using n8n CLI
cd /home/evens/n8n-cursor/workflows

# Import each workflow category
n8n import:workflow --input=01-marketplace/payment-processing.json
n8n import:workflow --input=01-marketplace/workflow-as-service.json
n8n import:workflow --input=02-knowledge-chatbots/knowledge-ingestion.json
n8n import:workflow --input=02-knowledge-chatbots/chatbot-interaction.json
n8n import:workflow --input=03-custom-models/model-training-pipeline.json
n8n import:workflow --input=03-custom-models/model-monetization-api.json
n8n import:workflow --input=04-vibe-coding/idea-validation-pipeline.json
n8n import:workflow --input=05-agency-operations/client-onboarding.json
n8n import:workflow --input=05-agency-operations/project-delivery.json
```

### Manual Import

1. Open n8n interface
2. Click "New Workflow"
3. Click "..." → "Import from File"
4. Select workflow JSON file
5. Configure credentials for each node
6. Save and activate

## Testing & Validation

### 1. Test Webhook Endpoints

```bash
# Test payment webhook
curl -X POST http://localhost:5678/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_test123"}}}'

# Test new lead webhook
curl -X POST http://localhost:5678/webhook/new-lead \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Test Corp", "industry": "Tech", "contact_email": "test@example.com"}'
```

### 2. Verify Database Connections

```sql
-- Check if tables are created
\dt

-- Test data insertion
INSERT INTO leads (company_name, contact_email) VALUES ('Test Company', 'test@test.com');
SELECT * FROM leads WHERE company_name = 'Test Company';
```

### 3. Validate API Integrations

- Test OpenAI connection in any AI node
- Verify Stripe webhook configuration
- Confirm database read/write operations

## Security Configuration

### 1. Webhook Security

Add authentication to sensitive webhooks:

```javascript
// In webhook validation nodes
const apiKey = $input.first().headers['x-api-key'];
if (apiKey !== 'your-secret-key') {
  throw new Error('Unauthorized');
}
```

### 2. Database Security

```sql
-- Create dedicated user for n8n
CREATE USER n8n_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE n8n_ai_business TO n8n_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_user;
```

### 3. Environment Variables

Never hardcode sensitive values. Always use:
- n8n credentials for API keys
- Environment variables for configuration
- Database connections with limited privileges

## Monitoring & Maintenance

### 1. Workflow Monitoring

- Enable workflow execution data
- Set up error notifications
- Monitor webhook response times
- Track database performance

### 2. Regular Maintenance

```bash
# Update n8n regularly
npm update n8n -g

# Backup database daily
pg_dump n8n_ai_business > backup_$(date +%Y%m%d).sql

# Clean up old execution data
DELETE FROM execution_entity WHERE created_at < NOW() - INTERVAL '30 days';
```

### 3. Performance Optimization

- Index frequently queried columns
- Optimize workflow execution order
- Use pagination for large datasets
- Implement caching where appropriate

## Troubleshooting

### Common Issues

1. **Webhook not triggering**
   - Check URL configuration
   - Verify firewall settings
   - Test with curl/Postman

2. **Database connection errors**
   - Verify credentials
   - Check network connectivity
   - Ensure database is running

3. **API rate limits**
   - Implement exponential backoff
   - Use multiple API keys
   - Cache responses when possible

4. **Memory issues**
   - Limit concurrent executions
   - Optimize data processing
   - Use streaming for large files

### Getting Help

- Check n8n documentation: https://docs.n8n.io
- Community forum: https://community.n8n.io
- GitHub issues: https://github.com/n8n-io/n8n/issues

## Next Steps

After successful setup:

1. Review [Business Configuration Guide](../business/monetization-strategies.md)
2. Configure your first revenue stream
3. Set up monitoring and analytics
4. Scale based on usage patterns

---

*For additional support, refer to the workflow-specific documentation in the `/docs/workflows/` directory.*
