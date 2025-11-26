# Cloud Digital Leader - Quick Reference Cheat Sheet
## For Exams, Interviews, and Scorpion Architecture Decisions

---

## 1. Deployment Models

| Model | Definition | When to Use | Scorpion Example |
|-------|------------|-------------|------------------|
| **On-Prem** | Own hardware + software | Full control, regulatory | MacBook dev |
| **Private Cloud** | Dedicated cloud environment | Single tenant, compliance | KVM2 server |
| **Public Cloud** | Shared infra, pay-per-use | Scalability, cost | OpenAI API |
| **Hybrid** | On-prem + public cloud | Gradual migration, compliance | MacBook + KVM2 + APIs |
| **Multicloud** | Multiple cloud providers | Best-of-breed, resilience | KVM2 + Fly.io + Vercel |

---

## 2. Service Models (IaaS / PaaS / SaaS)

### IaaS - Infrastructure as a Service
- **You manage**: OS, runtime, apps, data
- **Provider manages**: Hardware, networking, power
- **Example**: Compute Engine, Cloud Storage
- **Scorpion**: KVM2 VPS, MacBook

### PaaS - Platform as a Service
- **You manage**: Code, config, data
- **Provider manages**: Runtime, scaling, patching
- **Example**: Cloud Run, BigQuery
- **Scorpion**: Future managed DBs, analytics

### SaaS - Software as a Service
- **You manage**: Usage, access, data
- **Provider manages**: Everything else
- **Example**: Google Workspace, Gmail
- **Scorpion**: OpenAI API, GitHub, Cursor

**Rule**: More control = more responsibility

---

## 3. Data Types

| Type | Definition | Examples | Storage |
|------|------------|----------|---------|
| **Structured** | Tables, rows, columns | CRM, finance, SQL | Database |
| **Semi-structured** | Tags/markers, no strict tables | JSON, XML, HTML | NoSQL / JSON |
| **Unstructured** | No predefined model | Text, images, video, logs | Object storage |

**Key**: 80-90% of new data is unstructured, but <1% is analyzed

---

## 4. Data Storage Decision Tree

```
Is data unstructured?
├─ Yes → Cloud Storage (object storage)
└─ No → Is it OLTP or OLAP?
    ├─ OLTP (transactional)
    │   ├─ Need SQL? → Cloud SQL (regional) or Spanner (global)
    │   └─ No SQL? → Firestore (documents)
    └─ OLAP (analytical)
        ├─ SQL analytics → BigQuery
        └─ NoSQL, huge, time-series → Bigtable
```

---

## 5. Data Value Chain

1. **Genesis** - Data created (clicks, swipes, IoT)
2. **Collection** - Ingest from origin → platform
3. **Processing** - Clean, transform, merge, enrich
4. **Storage** - Put in appropriate stores
5. **Analysis** - BI dashboards, SQL, ML
6. **Activation** - Insights → actions (automation, decisions)

**Key**: No activation = no business impact

---

## 6. AI/ML Decision Tree

```
Need ML?
├─ No → Use pre-trained APIs (OpenAI, Whisper, CLIP)
└─ Yes
    ├─ Simple tabular/text prediction?
    │   └─ Yes → SQL-ML / AutoML (scikit-learn, AutoGluon)
    └─ Unique problem requiring custom model?
        └─ Yes → Custom training (PyTorch, TensorFlow)
```

**Four Tiers**:
1. Pre-trained APIs (fastest)
2. SQL-ML (simple predictions)
3. AutoML (custom models, no deep ML)
4. Custom training (unique intelligence)

---

## 7. Batch vs Streaming

| Aspect | Batch | Streaming |
|--------|-------|-----------|
| **Data** | Big chunks, scheduled | Continuous, small events |
| **Processing** | Daily/weekly/monthly | Real-time as it arrives |
| **Use Cases** | Payroll, invoices, reports | Fraud detection, personalization |
| **Tools** | Dataflow (batch mode) | Pub/Sub + Dataflow (streaming) |

**Rule**: Batch explains "what happened", streaming lets you react "while it's happening"

---

## 8. Serverless Patterns

| Pattern | Definition | Example | Scorpion Equivalent |
|---------|------------|---------|---------------------|
| **FaaS** | Functions triggered by events | Cloud Functions | n8n workflows, Python scripts |
| **Container Serverless** | Containers that auto-scale | Cloud Run | Docker Compose → k3s |
| **Event-Driven** | React to events, not polling | Pub/Sub triggers | n8n webhooks |

**Benefits**: Less ops, auto-scaling, pay-per-use, faster releases

---

## 9. Shared Responsibility Model

**Golden Rule**: Security **of** the cloud = provider | Security **in** the cloud = customer

| Model | Provider Responsible | Customer Responsible |
|-------|---------------------|---------------------|
| **On-Prem** | Nothing | Everything |
| **IaaS** | Hardware, data centers, network | OS, apps, configs, data |
| **PaaS** | Infra, runtime, OS, patching | Code, configs, data |
| **SaaS** | Infra + platform + app | Usage, access, data |

**Rule**: If you configure it or store it, you secure it

---

## 10. Trust Principles (Google's 7 → Scorpion's 7)

1. You own your data
2. No selling customer data
3. No hidden training (opt-in only)
4. Encryption everywhere
5. Guard against insider access
6. No backdoors
7. Transparent & auditable

---

## 11. Cost Management

### CapEx vs OpEx

| Type | Definition | Example |
|------|------------|---------|
| **CapEx** | Big upfront purchase | Buying servers |
| **OpEx** | Pay-as-you-go | Monthly VPS + API bills |

**Cloud = OpEx shift**: From "buy once" → "rent continuously"

### Resource Hierarchy

```
Organization
└─ Products (AgentPilot, BitBrain, Scorpion)
   └─ Environments (dev, staging, prod)
      └─ Services (n8n, api, db)
```

### Cost Control Tools

1. **Quotas** - Hard limits (max VPS, storage)
2. **Budgets** - Alerts when spend hits threshold
3. **Reports** - Understand why costs increased

---

## 12. Operational Excellence (SRE)

### Four Golden Signals

1. **Latency** - How long requests take (P50, P95, P99)
2. **Traffic** - How much demand (requests/sec)
3. **Errors** - Failure rate (% errors)
4. **Saturation** - Resource utilization (CPU, RAM, disk)

### SLI / SLO / SLA

| Term | Definition | Example |
|------|------------|---------|
| **SLI** | Service Level Indicator (what you measure) | Request success rate |
| **SLO** | Service Level Objective (target) | 99% success rate |
| **SLA** | Service Level Agreement (promise to customers) | 99.9% uptime |

**Rule**: SLI measures → SLO targets → SLA promises

---

## 13. Data Governance

### Six Dimensions of Data Quality

1. **Completeness** - Are fields filled?
2. **Uniqueness** - No duplicates
3. **Timeliness** - Recent enough?
4. **Validity** - Respects format/rules
5. **Accuracy** - Content is correct
6. **Consistency** - Same representation everywhere

**Rule**: Garbage in = garbage out

---

## 14. Sustainability Principles

1. Right-size hardware (no idle servers)
2. Batch processing (queue heavy jobs)
3. Cache aggressively (avoid recomputation)
4. Sleep unused services (dev off at night)
5. Choose efficient providers (renewable energy)

**Goal**: Maximize "signal per joule" (value per energy unit)

---

## 15. Key Acronyms

| Acronym | Full Form | Meaning |
|---------|-----------|---------|
| **IaaS** | Infrastructure as a Service | Rent VMs, manage OS/apps |
| **PaaS** | Platform as a Service | Platform for code, provider manages runtime |
| **SaaS** | Software as a Service | Complete app, just use it |
| **OLTP** | Online Transaction Processing | Transactional (many small reads/writes) |
| **OLAP** | Online Analytical Processing | Analytical (big scans, aggregations) |
| **ETL** | Extract, Transform, Load | Data pipeline process |
| **FaaS** | Functions as a Service | Event-driven functions |
| **SLI** | Service Level Indicator | What you measure |
| **SLO** | Service Level Objective | Your target |
| **SLA** | Service Level Agreement | Promise to customers |
| **CapEx** | Capital Expenditure | Big upfront purchase |
| **OpEx** | Operating Expense | Pay-as-you-go |
| **TCO** | Total Cost of Ownership | All costs, not just purchase |
| **RBAC** | Role-Based Access Control | Permissions by role |
| **IAM** | Identity and Access Management | Who can do what |
| **XAI** | Explainable AI | Understanding model decisions |
| **GDPR** | General Data Protection Regulation | EU privacy law |

---

## 16. Exam-Style Quick Q&A

**Q: What's the difference between IaaS and PaaS?**  
A: IaaS = you manage OS/apps, PaaS = provider manages runtime, you focus on code.

**Q: When use streaming vs batch?**  
A: Streaming for real-time reactions (fraud, personalization), batch for scheduled reports.

**Q: What's the shared responsibility model?**  
A: Provider secures "of the cloud" (hardware), customer secures "in the cloud" (apps, data).

**Q: What are the four golden signals?**  
A: Latency, traffic, errors, saturation.

**Q: What's the difference between SLI, SLO, and SLA?**  
A: SLI measures, SLO targets, SLA promises.

**Q: What are the six dimensions of data quality?**  
A: Completeness, uniqueness, timeliness, validity, accuracy, consistency.

**Q: When use hybrid vs multicloud?**  
A: Hybrid = on-prem + cloud, multicloud = multiple cloud providers.

**Q: What's the data value chain?**  
A: Genesis → Collection → Processing → Storage → Analysis → Activation.

---

**Last Updated**: 2025-01-27  
**For**: Cloud Digital Leader Certification + Scorpion Architecture

