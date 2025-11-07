# CURSOR CATEGORIES PLAYBOOK
## Enterprise-Grade AI Development Team for LightningFlow AI

This playbook transforms Cursor from a coding assistant into a full development team across 10 enterprise categories. Each category has specific prompts, templates, and automation scripts.

---

## 🏭 **Category 1: Code Authoring**
**Role**: Senior Developer + Architect

### **What Cursor Does**
- Feature scaffolding: New microservices, APIs, CRON jobs, workflows
- Boilerplate reduction: CRUD endpoints, DTOs, config schemas, tests
- Infrastructure manifests: Dockerfiles, Kubernetes YAML, Terraform modules

### **LightningFlow AI Applications**
- Auto-generate new n8n workflows for side hustles
- Create LNbits integration stubs
- Generate agent scaffolding for new AI tools
- Build Docker Compose services with proper health checks

### **Cursor Prompts**
```
PROJECT=lfai
ENV=int
AFFECTED_PATHS=apps/lightningflow/api/src/agents/**,packages/lf-sdk/src/**
GOAL=Create new Bitcoin Lightning agent with LNbits integration
REQUIREMENTS=Health checks, resource limits, proper error handling, rollback plan
DONE_WHEN=Agent responds to /healthz, integrates with LNbits, passes all tests
```

### **Automation Scripts**
- `scripts/generate-agent.sh` - Creates new agent scaffolding
- `scripts/generate-workflow.sh` - Creates new n8n workflow templates
- `scripts/generate-integration.sh` - Creates new service integration stubs

---

## 🔍 **Category 2: Code Review & Refactoring**
**Role**: Senior Code Reviewer + Tech Lead

### **What Cursor Does**
- Review assistant: Inline PR comments (style, security, performance)
- Refactor coach: Break down large files, explain trade-offs
- Diff summarizer: Digest massive PRs into 5-line overviews

### **LightningFlow AI Applications**
- Explain diffs when updating Compose or Supabase policies
- Refactor large workflow files into modular components
- Review security implications of new Bitcoin integrations

### **Cursor Prompts**
```
REVIEW_MODE=security
FOCUS=bitcoin_integrations,supabase_policies,docker_security
ANALYZE=This PR adds LNbits webhook handling - check for:
1. Input validation and sanitization
2. Rate limiting and DDoS protection
3. Proper error handling and logging
4. Security headers and CORS
5. Database transaction safety
```

### **Automation Scripts**
- `scripts/review-security.sh` - Automated security review
- `scripts/review-performance.sh` - Performance impact analysis
- `scripts/refactor-large-files.sh` - Break down large files

---

## 📚 **Category 3: Documentation & Knowledge Management**
**Role**: Technical Writer + Knowledge Manager

### **What Cursor Does**
- Auto-generate READMEs synced with code changes
- API usage examples: curl/Postman examples from route definitions
- Architecture diagrams: Convert folder structure to Mermaid/PlantUML

### **LightningFlow AI Applications**
- Keep infra diagrams (Docker + Caddy + Supabase) always up to date
- Generate API documentation for LightningFlow AI endpoints
- Create user guides for n8n workflows and side hustle tools

### **Cursor Prompts**
```
DOCUMENTATION_TYPE=api_reference
SERVICE=lightningflow_api
ENDPOINTS=/api/lnbits/withdraw,/api/agents/bitcoin,/api/webhooks/lightning
FORMAT=openapi_spec,curl_examples,postman_collection
INCLUDE=auth_examples,error_responses,rate_limits
```

### **Automation Scripts**
- `scripts/generate-docs.sh` - Auto-generate documentation
- `scripts/update-diagrams.sh` - Update architecture diagrams
- `scripts/sync-readme.sh` - Keep READMEs in sync

---

## 🧪 **Category 4: Testing & Validation**
**Role**: QA Engineer + Test Automation Specialist

### **What Cursor Does**
- Unit test generator: Jest/Vitest suites from functions
- Integration test composer: API tests with DB/Redis mocking
- Security regression tests: Auth bypass, injection vectors

### **LightningFlow AI Applications**
- Contract tests for `/api/lnbits/webhook` (reject invalid tokens/domains)
- Queue tests (BullMQ must not exceed concurrency)
- Bitcoin transaction validation tests

### **Cursor Prompts**
```
TEST_TYPE=integration
SERVICE=lnbits_webhook
SCENARIOS=valid_token,invalid_token,expired_token,malformed_payload
MOCK=supabase,redis,lnbits_api
COVERAGE=happy_path,error_cases,edge_cases,security_tests
```

### **Automation Scripts**
- `scripts/generate-tests.sh` - Auto-generate test suites
- `scripts/security-tests.sh` - Security regression tests
- `scripts/performance-tests.sh` - Load and performance tests

---

## 🚀 **Category 5: DevOps & Infrastructure Automation**
**Role**: DevOps Engineer + Infrastructure Architect

### **What Cursor Does**
- Config templating: Generate Compose/K8s manifests per environment
- CI pipeline author: GitHub Actions/Argo pipelines from specs
- Ops scripts: Health checks, monitoring, rollback procedures

### **LightningFlow AI Applications**
- Auto-generate new doctor.sh checks when adding containers
- Create environment-specific configurations
- Generate monitoring and alerting rules

### **Cursor Prompts**
```
INFRA_TYPE=docker_compose
ENVIRONMENT=staging
SERVICES=api,n8n,redis,supabase
REQUIREMENTS=health_checks,resource_limits,logging,monitoring
SECURITY=no_public_ports,proper_secrets,non_root_users
```

### **Automation Scripts**
- `scripts/generate-compose.sh` - Generate environment-specific compose files
- `scripts/generate-ci.sh` - Create CI/CD pipelines
- `scripts/generate-monitoring.sh` - Set up monitoring and alerting

---

## 🔒 **Category 6: Security & Compliance**
**Role**: Security Engineer + Compliance Officer

### **What Cursor Does**
- Vulnerability scanning: Explain Trivy/Snyk results
- Policy generation: Supabase RLS, IAM roles, Kubernetes RBAC
- Threat modeling: Identify weak points in architecture

### **LightningFlow AI Applications**
- Auto-propose Supabase RLS policies for new tables
- Generate security checklists for Bitcoin integrations
- Create compliance documentation for financial tools

### **Cursor Prompts**
```
SECURITY_FOCUS=bitcoin_integrations
ANALYZE=lnbits_webhook,lightning_payments,wallet_management
THREATS=injection,csrf,rate_limiting,secrets_exposure
COMPLIANCE=financial_regulations,data_protection,audit_trails
```

### **Automation Scripts**
- `scripts/security-scan.sh` - Automated security scanning
- `scripts/generate-policies.sh` - Generate security policies
- `scripts/compliance-check.sh` - Compliance validation

---

## 📊 **Category 7: Data & Analytics Engineering**
**Role**: Data Engineer + Analytics Specialist

### **What Cursor Does**
- SQL assistant: Optimize queries, propose indexes, generate reports
- ETL job scaffolding: Data movement between APIs/DBs
- Vector/RAG pipelines: Embedding jobs & Supabase pgvector upserts

### **LightningFlow AI Applications**
- Portfolio analytics queries for Bitcoin investments
- Trend ingestion jobs for market data
- User behavior analytics for LightningFlow AI usage

### **Cursor Prompts**
```
DATA_TYPE=bitcoin_analytics
TABLES=transactions,market_data,user_portfolios
QUERIES=performance_metrics,trend_analysis,risk_assessment
OPTIMIZATION=indexes,query_performance,data_retention
```

### **Automation Scripts**
- `scripts/generate-queries.sh` - Generate optimized SQL queries
- `scripts/etl-pipeline.sh` - Create ETL job templates
- `scripts/analytics-dashboard.sh` - Generate analytics dashboards

---

## 🤖 **Category 8: Productivity Glue**
**Role**: Productivity Engineer + Automation Specialist

### **What Cursor Does**
- Slack/Discord bots: Explain logs, summarize incidents, query metrics
- Meeting notes: Summarize dev standups from transcripts
- Release notes: Auto-generate changelogs from PRs

### **LightningFlow AI Applications**
- Release notes for AgentPilot and LightningFlow AI agents
- Incident summaries for service outages
- Performance reports for Bitcoin trading bots

### **Cursor Prompts**
```
PRODUCTIVITY_TYPE=release_notes
PROJECT=lightningflow_ai
PERIOD=weekly
INCLUDE=new_features,bug_fixes,performance_improvements,breaking_changes
FORMAT=markdown,slack_message,email_summary
```

### **Automation Scripts**
- `scripts/generate-release-notes.sh` - Auto-generate release notes
- `scripts/incident-summary.sh` - Create incident reports
- `scripts/performance-report.sh` - Generate performance summaries

---

## 📋 **Category 9: Governance & Compliance**
**Role**: Technical Governance + Compliance Manager

### **What Cursor Does**
- ADR generator: Architecture Decision Records for technical choices
- Changelog lawyer: Ensure PRs have ticket IDs, risk levels, rollback plans
- License check: Scan dependencies, explain legal risks

### **LightningFlow AI Applications**
- AI-draft ADR.md for new Bitcoin tools or AI models
- Compliance documentation for financial regulations
- License audits for open source dependencies

### **Cursor Prompts**
```
GOVERNANCE_TYPE=architecture_decision
DECISION=choosing_lnbits_over_lnd_for_lightning_integration
CONTEXT=lightningflow_ai,bitcoin_payments,scalability_requirements
ALTERNATIVES=lnd,lnbits,lightning_labs
CRITERIA=reliability,scalability,maintenance,community_support
```

### **Automation Scripts**
- `scripts/generate-adr.sh` - Create Architecture Decision Records
- `scripts/license-audit.sh` - Audit open source licenses
- `scripts/compliance-docs.sh` - Generate compliance documentation

---

## 🚨 **Category 10: Incident Response**
**Role**: Incident Commander + Postmortem Specialist

### **What Cursor Does**
- Log triage: Cluster errors, identify root causes
- Postmortems: Auto-generate incident reports with timeline + fixes
- Rollback planner: Write restore steps for failed deploys

### **LightningFlow AI Applications**
- Incident reports for lightningflow.online slowdowns
- Root cause analysis for Bitcoin payment failures
- Rollback procedures for failed agent deployments

### **Cursor Prompts**
```
INCIDENT_TYPE=service_degradation
SERVICE=lightningflow_api
SYMPTOMS=high_response_times,error_rates_increasing
TIMELINE=last_24_hours
LOGS=application_logs,infrastructure_logs,monitoring_metrics
ANALYZE=root_cause,impact_assessment,prevention_measures
```

### **Automation Scripts**
- `scripts/incident-analysis.sh` - Analyze incident logs
- `scripts/generate-postmortem.sh` - Create postmortem reports
- `scripts/rollback-planner.sh` - Generate rollback procedures

---

## 🎯 **Implementation Strategy**

### **Phase 1: Core Categories (Weeks 1-2)**
1. **Code Authoring** - Set up agent scaffolding
2. **Testing & Validation** - Create test generation scripts
3. **DevOps & Infrastructure** - Automate compose file generation

### **Phase 2: Quality & Security (Weeks 3-4)**
4. **Code Review & Refactoring** - Set up automated reviews
5. **Security & Compliance** - Implement security scanning
6. **Documentation** - Auto-generate API docs

### **Phase 3: Advanced Categories (Weeks 5-6)**
7. **Data & Analytics** - Set up analytics pipelines
8. **Productivity Glue** - Create release note automation
9. **Governance** - Implement ADR generation
10. **Incident Response** - Set up incident analysis

### **Phase 4: Integration & Optimization (Weeks 7-8)**
- Integrate all categories into unified workflow
- Create cross-category automation scripts
- Set up monitoring and feedback loops

---

## 🔧 **Quick Start Commands**

```bash
# Set up all categories
make setup-cursor-categories

# Generate new agent (Category 1)
make generate-agent "Bitcoin Lightning Trader"

# Create security review (Category 2)
make review-security "lnbits-webhook-integration"

# Generate API docs (Category 3)
make generate-docs "lightningflow-api"

# Create test suite (Category 4)
make generate-tests "lnbits-webhook"

# Set up monitoring (Category 5)
make setup-monitoring "staging"

# Run security scan (Category 6)
make security-scan

# Generate analytics queries (Category 7)
make generate-analytics "bitcoin-portfolio"

# Create release notes (Category 8)
make generate-release-notes "v1.2.0"

# Generate ADR (Category 9)
make generate-adr "choosing-supabase-over-postgres"

# Analyze incident (Category 10)
make analyze-incident "api-slowdown-2024-01-15"
```

---

## 🎉 **The Result**

You now have a **full development team** powered by Cursor:
- **10 specialized roles** covering every aspect of software development
- **Automated workflows** for each category
- **Enterprise-grade processes** that scale with your project
- **Consistent quality** across all development activities

**This is how big companies think about AI development tools - not as assistants, but as team members with specific expertise and responsibilities.**

---

## 📚 **Next Steps**

1. **Choose 3 categories** to implement first (recommend: Code Authoring, Testing, DevOps)
2. **Set up the automation scripts** for those categories
3. **Create templates** for each category's outputs
4. **Integrate with your existing workflow** (GitHub, CI/CD, monitoring)
5. **Scale to remaining categories** as you get comfortable

**You're now thinking like a big company - with AI as your development team.**
