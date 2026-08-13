# n8n hive workflow catalog (Phase 5)

Generated: 2026-08-07 16:08 UTC from live n8n Public API.

- **Total workflows:** 162
- **Active:** 57
- **Inactive:** 105
- **With webhook nodes:** 67

## Broker decision

**n8n MCP is the secret broker** — see [phases/MCP_BROKER_DECISION.md](./phases/MCP_BROKER_DECISION.md).

Scorpion reads the same catalog via `N8N_API_KEY` on VPS `.env.hive` → hive `n8nConfigured: true`.

## Hard rules

- Never `docker compose down -v` on `n8n_data`
- Webhooks stay **without** basic_auth (`/webhook*`, `/n8n/webhook*`)
- Tag each workflow **HITL** vs **autonomous** before allowlisting triggers
- HITL/autonomous columns below are **heuristics from name** — operator should confirm before enabling agent triggers

## Live UI

- Operator: `https://evenslouis.ca/n8n/` → `/n8n/home/workflows`
- Health: `https://evenslouis.ca/healthz` (n8n)

## Catalog table

| name | id | active | webhook path | HITL? | autonomous? | notes |
|------|-----|--------|--------------|-------|-------------|-------|
| Advanced Features System | `Z615S3OKzRIp5FnN` | yes | POST /advanced, POST (Respond) | review | maybe | Advanced |
| ai background removal | `XbKc8BSn1tzvcyxN` | yes | POST /webhook/2ed65606-74cd-4722-a54f-0306aed83b8b, POST (Respond to Webhook) | review | maybe | active |
| ai nana | `8pRr7SW6ZGx2URi0` | yes | — | review | maybe | active |
| ai nana generator sub | `6weqeueKKaHHeQOV` | yes | — | review | maybe | active |
| Analytics & Reporting System | `PEgh0NzalI1cPnBV` | yes | POST /analytics, POST (Respond) | review | maybe | Analytics |
| API Key Management System | `42iMxuGIEAtueC6J` | yes | POST /api-keys, POST (Respond) | review | maybe | API Keys |
| Asset Management API (Corrected) | `jv7Y59JNJwEiaiJX` | yes | POST /webhook/assets, POST /webhook/assets, PUT /webhook/assets/:assetId (+5) | review | maybe | Assets |
| Authentication & User Management System | `v6LEf9ttiVXH8kK9` | yes | POST /auth, POST (Respond) | review | maybe | Authentication |
| Automated Stock Analysis Reports with Technical & News Sentiment using GPT-4o | `0ADjh9BW2ZVZDIJB` | yes | — | review | maybe | active |
| Backup & Restore System | `gwYX4LOFlX4ziXT5` | yes | POST /backup, POST (Respond) | review | yes | Backup |
| browser tool | `Hp5q5OmlRDo6sBzr` | yes | — | review | maybe | active |
| Build a PDF Document RAG System with Mistral OCR, Qdrant and Gemini AI | `8KWk9wpH7DW37Z2Z` | yes | — | review | maybe | active |
| Build a PDF Document RAG System with Mistral OCR, Qdrant and Gemini AI | `b8v0acF2muQRaHjw` | yes | — | review | maybe | active |
| Build a PDF Document RAG System with Mistral OCR, Qdrant and Gemini AI | `jMsWxA8M3huMGS9S` | yes | — | review | maybe | active |
| Chat AI Agent - Asset Management | `Adu0BUG3gd9OXWWR` | yes | POST /webhook/chat-assets, POST (Respond to Chat) | review | maybe | active |
| combine image | `LluJ1ziVhewLv08Y` | yes | — | review | maybe | active |
| Combine Images Nanobanana | `gzva8mJf879d0KDG` | yes | — | review | maybe | active |
| Company research | `O30H2rMHvl8tjpCE` | yes | — | review | maybe | Research agent |
| Compliance & Audit System | `RH81u3GthmYDHVPS` | yes | POST /compliance, POST (Respond) | review | maybe | Compliance |
| create image | `NXOrWSvXx26KdtaP` | yes | — | review | maybe | active |
| Demo: RAG in n8n 4 | `H3KW0NPg5mqRBPGn` | yes | — | review | maybe | active |
| Edit Image Nanobanana Tool | `6NMrOq1sSDLblNid` | yes | — | review | maybe | active |
| elevenlabs post call workflow | `7GkfpweJWvHmzSQ0` | yes | POST /webhook/cb151ce6-4393-47c1-a724-60a3491e206b | review | maybe | active |
| Email Notification System | `QlkWWnxFO1U8S3tn` | yes | POST /notifications/email, POST (Respond) | review | maybe | Email |
| Emergency Response System | `tITd7lRSoVosLXfB` | yes | POST /emergency, POST (Respond) | review | maybe | Emergency |
| Error Recovery System | `tc3wTgVAWLpipm48` | yes | POST /error-recovery, POST (Respond) | review | maybe | Recovery |
| Evens Louis Email Reply Agent | `totZ17oWxesj0Uo2` | yes | — | review | maybe | active |
| Extract facebook Profile Data with Apify and Store in Google Sheets copy | `4tpStXGH6KmnUJ7g` | yes | — | review | maybe | active |
| Extract Instagram Profile Data with Apify and Store in Google Sheets | `HqXeSz4mRXC4PNOt` | yes | — | review | maybe | active |
| Extract linkedin Profile Data with Apify and Store in Google Sheets copy | `4bXwmNJV2fQIaOfh` | yes | — | review | maybe | active |
| Extract Tiktok Profile Data with Apify and Store in Google Sheets | `LbFaMgVudjlwiSaf` | yes | — | review | maybe | active |
| Extract Twitter Profile Data with Apify and Store in Google Sheets copy | `tFVKS64tkdiYU4LT` | yes | — | review | maybe | active |
| File Upload Sync - Knowledge Base | `lfuJ1SFIHSuBCkEe` | yes | — | review | yes | active |
| Find LinkedIn | `VzGh8lTgEcRnaJKR` | yes | — | review | maybe | Research agent |
| Instagram finder | `2qtjWmU6vPQoS0it` | yes | — | review | maybe | Research agent |
| Market research | `gyR3ZlyXJuLCgjod` | yes | — | review | maybe | Research agent |
| My Sub-Workflow 1 | `JNUtp68VpTdkgEcV` | yes | — | review | maybe | active |
| n8n hacks | `2ezIjunrF3S0Ih6B` | yes | — | review | maybe | active |
| Nano Photoshop Agent | `7wCdaa03uoFU4hwM` | yes | — | review | maybe | active |
| New Leads Workflow | `jfo02s9R8Eoj5Iua` | yes | — | review | maybe | active |
| On-demand calling | `yYhgcj1b6XgPObIZ` | yes | POST (Ended Notification), POST (Emergency Response), POST (Caution Message) (+13) | review | maybe | active |
| PI Attorney Lead Qualifier | `NH2iQVOJxleV42kV` | yes | POST /webhook/chat, POST (Respond to Webhook) | review | maybe | active |
| Review Scraper | `ZKPvUvIqPboamkqv` | yes | — | review | maybe | Research agent |
| Scrape Ads | `lz97BpIUWzvgr8IW` | yes | — | review | maybe | active |
| Security & Monitoring System | `fv8eIrCa5uGVHYHf` | yes | POST /security, POST (Respond Health Check), POST (Respond) | review | yes | Security |
| Siri AI Agent: Apple Shortcuts powered voice template | `XhFh97SBmRt8YczS` | yes | POST (Respond to Apple Shortcut), POST /webhook/assistant | review | maybe | active |
| Social media finder | `BI2KqweZKH8npY0F` | yes | — | review | maybe | Research agent |
| start browser tool | `u0zCCupli5YboI42` | yes | — | review | maybe | active |
| Summarize site | `bHZhLEDiAbBKeey7` | yes | — | review | maybe | Research agent |
| Sustainability Dashboard | `m8bRs9lBNFvpygty` | yes | POST /webhook/sustainability-metrics, POST /webhook/sustainability-metrics, POST (Respond (GET)) (+1) | review | maybe | active |
| Tenant Onboarding | `D0Njug3CtceFtg3T` | yes | POST /webhook/tenant-onboard, POST (Respond with Onboarding Details) | review | maybe | active |
| Testing & QA System | `lWQ2XSNxj6p1nzCc` | yes | POST /testing, POST (Respond) | review | maybe | Testing |
| Ultimate Browser Agent | `w3rJt98sVj7KkpOy` | yes | — | review | maybe | active |
| Voice assistant agent (with Telegram and Gcal) | `EsQaobwWMvt3mPK0` | yes | — | review | maybe | active |
| Website Lead Capture with Apollo.io Enrichment, HubSpot Storage & Gmail Notifications | `mb6HfALiB1QVLasT` | yes | POST /webhook/lead-intake | review | maybe | active |
| Website scraper | `ahP6GXmZhpH59glr` | yes | — | review | maybe | Research agent |
| Work Order Management (Corrected) | `gLbR8hJGF0Q7UkCw` | yes | POST /webhook/work-orders, POST /webhook/work-orders, PUT /webhook/work-orders/:orderId/status (+3) | review | maybe | active |
|  Automate Research Paper Collection with Bright Data & n8n | `zaNJHwx3MzKrGjNk` | no | — | n/a | no | inactive |
| A. Classifier (bins-classify) | `AXS2dxwlXGw4aeiG` | no | POST /webhook/bins-classify | n/a | no | inactive |
| Ads to video | `v3BnboH9WyczmbSN` | no | — | n/a | no | inactive |
| Agent swarm | `Hf4bxywVfVf3YEOG` | no | — | n/a | no | inactive |
| AI Automation Agency - Client Onboarding | `H9xg6lUTU4D3nhTD` | no | POST /webhook/new-lead, POST /webhook/discovery-call-scheduled | n/a | no | inactive |
| AI Automation Agency - Project Delivery Management | `gz9l4hYftyHmrhBi` | no | POST /webhook/project-signed, POST /webhook/phase-complete, POST /webhook/project-complete | n/a | no | inactive |
| AI Avatar Content Creation System | `WAVzRx4WG8XKqt9d` | no | — | n/a | no | inactive |
| AI Content Team - Research & Knowledge Agent | `EgKH4eGhPVf3Gugc` | no | POST /webhook/start-research, POST /webhook/validate-research, POST /webhook/update-knowledge-base | n/a | no | inactive |
| AI Content Team - Topic Generation Agent | `IPrFgtJhmC7QdOSF` | no | POST /webhook/generate-topics, POST /webhook/submit-manual-topic | n/a | no | inactive |
| AI Knowledge Chatbot Interaction & Monetization | `h0v3Ykk3HF8y77is` | no | POST /webhook/chat/{{ $parameter["chatbot_id"] }} | n/a | no | inactive |
| AI Research Agent Demo | `mJtgqWT3btjdoieW` | no | POST /research-agent | n/a | no | inactive |
| AI Research Agent Enhanced | `PbTY82Duduu6XeKP` | no | POST /webhook/research-agent, POST (Demo Research Response) | n/a | no | inactive |
| AI SaaS Master Scaffold Enhanced | `2RXkoXQ14838mKgR` | no | POST /webhook/ai-saas-hook, POST (Respond JSON) | n/a | no | inactive |
| AI Workflow Marketplace - Payment Processing | `cL7Cp2mWWfXSA21l` | no | POST /webhook/payment-received | yes | no | inactive |
| AI Workflow-as-a-Service API | `zdOBuQayuIY2PuNn` | no | POST /webhook/run-workflow/{{ $parameter["workflow_id"] }} | n/a | no | inactive |
| AI YouTube Trend Explorer – n8n Automation Workflow with Gemini/ChatGPT | `uPcSkorKMdgLURjH` | no | — | n/a | no | inactive |
| Analyze YouTube Comments Sentiment with Gemini AI and Google Sheets | `NxzgXAH2ElzZN9ia` | no | — | n/a | no | inactive |
| Asset Management API | `p5irmmjYAQxcpOet` | no | POST /webhook/assets, POST /webhook/assets, PUT /webhook/assets/:assetId (+2) | n/a | no | inactive |
| auto post to all socials | `KJKCAPsWX2BzBCu2` | no | — | n/a | no | inactive |
| Automate Customer Feedback Analysis with Forms, AI, Google Sheets and WhatsApp | `pn7eTBST2HdSlLXk` | no | — | n/a | no | inactive |
| Automate Financial Operations with O3 CFO & GPT-4.1-mini Finance Team | `QWCJByYstSzNwe8a` | no | — | n/a | no | inactive |
| B. Processor (bins-process) | `KaUsCi36oGLQuJo6` | no | POST /webhook/bins-process | n/a | no | inactive |
| Chat with Google Drive Documents using GPT, Pinecone, and RAG | `f9iC7hLKkB5XNLp0` | no | — | n/a | no | inactive |
| chat youtube transcript | `xFOFXYRMqFu1Fd2A` | no | — | n/a | no | inactive |
| Collect & Store Restaurant Customer Feedback with Google Sheets and Email Forms | `FM3E4yWFLg0BHeBx` | no | — | n/a | no | inactive |
| Compliance Alerts | `Q1loRsb1CPKxoRgs` | no | — | n/a | no | inactive |
| Comprehensive Legal Department Automation with OpenAI O3 CLO & Specialist Agents | `3W1Z69RQWy9ifMFQ` | no | — | n/a | no | inactive |
| Content Creation Webhook | `Szlh7uQHC6kObi6V` | no | POST /webhook/content-creation, POST (Content Response) | n/a | no | inactive |
| Custom AI Model Monetization API | `6cpzujFinlhLis52` | no | POST /webhook/predict/{{ $parameter["model_id"] }}, POST /webhook/batch-predict/{{ $parameter["model_id"] }}, GET /webhook/analytics/revenue | n/a | no | inactive |
| Daily Auto-Generated Tweets from Trending Topics using Perplexity & GPT-4o | `z76yCu1oTFfPKCaA` | no | — | n/a | no | inactive |
| Data Analytics Department with AI Team: CDO & Specialists Using OpenAI O3 | `Aq7LRiLfcCqwgljX` | no | — | n/a | no | inactive |
| Data Tables | `83ofNDW4uWD2XhNA` | no | — | n/a | no | inactive |
| Data tables prompts | `ucHCvu27r9UpKcG7` | no | — | n/a | no | inactive |
| Demo: RAG in n8n | `00GF24c4LkCfukzL` | no | POST /webhook/4e27e9aa-8f09-4a80-bd43-aae591de32fa | n/a | no | inactive |
| Demo: RAG in n8n | `9dINB1JYltDeINNw` | no | POST /webhook/4e27e9aa-8f09-4a80-bd43-aae591de32fa | n/a | no | inactive |
| Demo: RAG in n8n | `BE36hOjSWK8o1qtW` | no | POST /webhook/4e27e9aa-8f09-4a80-bd43-aae591de32fa | n/a | no | inactive |
| Demo: RAG in n8n | `dwai8hi7wujDI15W` | no | POST /webhook/4e27e9aa-8f09-4a80-bd43-aae591de32fa | n/a | no | inactive |
| Demo: RAG in n8n | `p1qeUaHZiLdetDra` | no | POST /webhook/4e27e9aa-8f09-4a80-bd43-aae591de32fa | n/a | no | inactive |
| Demo: RAG in n8n | `zEx88nM3IZOvBYIb` | no | POST /webhook/4e27e9aa-8f09-4a80-bd43-aae591de32fa | n/a | no | inactive |
| Demo: RAG in n8n 3 | `poqKG8pMzYYAeVdy` | no | — | n/a | no | inactive |
| Download file | `p4x4e47p0KxokAHW` | no | — | n/a | no | inactive |
| Dynamic Dental Chatbot – Data Collection & Management | `VfeFGJcmcHSko0x7` | no | POST /webhook/chatbot/setup, POST (Respond: OK), POST (Respond: Not Setup) | n/a | no | inactive |
| Email Notification System | `e1jbcBalJzkqtbIl` | no | POST /notifications/email, POST (Respond) | n/a | no | Email |
| Email template | `wqDHBGep7EM0h5v2` | no | POST /webhook/3ee0c405-c707-4b4c-84fc-7de789727d04, POST (Respond to Webhook) | n/a | no | inactive |
| Extract YouTube Channel Videos to Google Sheets with Metadata Tracking | `8zt3VlrYJYd8OwGF` | no | — | n/a | no | inactive |
| Extract YouTube Video Statistics and Save to Google Sheets | `CJoZVCwV5xjFSw0Z` | no | — | n/a | no | inactive |
| Extractor – CONTRACT | `QDCdBaswwUFMyZ6k` | no | — | n/a | no | inactive |
| Find Content Gaps in Competitors' Websites with InfraNodus GraphRAG for SEO | `E6zSpU6SUJa4wTpl` | no | — | n/a | no | inactive |
| Gather Complete YouTube Channel Data to Google Sheets | `s5fOv5JHRXotVMfg` | no | — | n/a | no | inactive |
| Glass Fruit ASMR | `CSIZv6U39Ieja8eo` | no | — | n/a | no | inactive |
| Gmail AI Email Manager | `zqM26toU9epl70ZJ` | no | — | n/a | no | inactive |
| gmail/snevemoney12 | `StUWNn5EJBQW4r8b` | no | — | n/a | no | inactive |
| GPT-5 Support Agent | `8WpHnlUO8nHHW4Yn` | no | — | n/a | no | inactive |
| Improve AI Agent System Prompts with GPT-4o Feedback Analysis and Email Delivery | `PwTa5RrByF9S199w` | no | — | n/a | no | inactive |
| Inbound Assistant | `1VDqSoOISggEFl02` | no | POST (respondVapi), POST /webhook/vapi-solacium-outbound-assistant | n/a | no | inactive |
| Kenny James Email Agent copy | `FEBJNC9dc29DgPdN` | no | — | n/a | no | inactive |
| Knowledge Base Content Ingestion | `WZhrKkOVNmNNmKmC` | no | POST /webhook/upload-content, POST (Notify Processing Complete) | n/a | no | inactive |
| Master Orchestration System | `yHknsb5nU7iInqP0` | no | POST /webhook/master-orchestrator, POST (Master Response) | n/a | no | inactive |
| MCP Test Workflow | `2X0bVSZCh3BsxCVE` | no | — | n/a | no | inactive |
| multi-client-workflow | `XybNWchmk9vqXudl` | no | POST (Respond), POST /webhook/e08f3b85-be73-4786-936a-a56f079e2e60, POST (Respond to Webhook) (+1) | n/a | no | inactive |
| multi-client-workflow (Oct 17 at 23:12:49) | `bPmnRq2juIdBmvQm` | no | POST /webhook/e08f3b85-be73-4786-936a-a56f079e2e60, POST (Respond) | n/a | no | inactive |
| Multi-Tenant-SaaS-RAG-Agent | `LqpCRhJijICOooA4` | no | POST /webhook/chat, POST (Respond to Webhook), POST (Respond Success) (+6) | n/a | no | inactive |
| My workflow | `3L1cQI4QOfJDIgRc` | no | POST /webhook/667ca354-cc10-40fe-896b-08153fad7857, POST (Respond to Webhook) | n/a | no | inactive |
| My workflow 2 | `w1XTPQ7tn3RSwEpI` | no | — | n/a | no | inactive |
| My workflow 3 | `01XBVbQkI5VEdkca` | no | — | n/a | no | inactive |
| My workflow 4 | `HEzoQ1ZVDWN9MscP` | no | — | n/a | no | inactive |
| My workflow 5 | `sb3Thzb72u6jaVzu` | no | — | n/a | no | inactive |
| My workflow 6 | `Rvxt8jEdHJdAsfsD` | no | — | n/a | no | inactive |
| My workflow 7 | `1EtWYrHkLhncceZU` | no | — | n/a | no | inactive |
| My workflow 8 | `HFuZFHsqrrCps0wv` | no | — | n/a | no | inactive |
| n8n Hacks | `4CyGOUqs88D0ybn7` | no | — | n/a | no | inactive |
| nanav2 | `r9CV0OSpZHp4O6Os` | no | — | n/a | no | inactive |
| OCR contracts | `uyJrIv9U9nBZ53Aa` | no | — | n/a | no | inactive |
| OCR extractor/auto finance/ | `WS9HmcKe9QCppJLQ` | no | — | n/a | no | inactive |
| Omni Agent copy | `yPQWpOgAWuqwpxtN` | no | POST /webhook/7ff80ee2-24f0-47d1-9cb9-72f9208ccad1, POST (Respond to Webhook) | n/a | no | inactive |
| outbound calls | `xbMNXMcrgfYFDrCK` | no | — | n/a | no | inactive |
| photoshop agent | `UMtkdRNtu6sTbA2W` | no | — | n/a | no | inactive |
| rag agent | `KzOup6x5YW2TVpKq` | no | — | n/a | no | inactive |
| RAG AI Agent Template V5 | `CWd8ZOiQuRDiWIx5` | no | POST (Respond to Webhook), POST /webhook/af814d99-8106-4daa-8821-28a93bafe55b | n/a | no | inactive |
| Research anything | `gP2Ql5iLi0jW1Cwe` | no | — | n/a | no | Research agent |
| Revenue Growth Strategy with CRO-led Multi-Agent Team using O3 & GPT-4.1-mini | `7XKMByazqRn4AsPV` | no | — | n/a | no | inactive |
| Scrape ads | `fkfI4fcct4XPEXL6` | no | — | n/a | no | inactive |
| Server Troubleshoot Agent | `NrLhstXoCBRm8OIy` | no | — | n/a | no | inactive |
| Simple Slack Notifier | `CRv7Sj2JPIYdzgfU` | no | POST /slack-notify | n/a | no | inactive |
| Social Profile Finder+sub extract | `pCnMPNtPAyD9s2B1` | no | — | n/a | no | inactive |
| Stock price | `gKwlIqOq8fQSnag1` | no | — | n/a | no | inactive |
| Support Agent Webhook | `AnXNna6bkFbsTjEB` | no | POST /webhook/support-agent, POST (Support Response) | n/a | no | inactive |
| Sustainability Dashboard | `ip6S0HXSO30ZTvyH` | no | POST /webhook/sustainability-metrics, POST /webhook/sustainability-metrics, POST (Respond) | n/a | no | inactive |
| The Recap AI - Dentist Voice Agent | `i2CN5woqG017s6X8` | no | POST /webhook/4fe15a31-6365-4b96-a3d5-3b02bbe3d31a, POST (respond_to_webhook) | n/a | no | inactive |
| The Recap AI - Facebook Ad Cloning System | `mirm4lg85QBQ1wZR` | no | — | n/a | no | inactive |
| Ultimate Agentic RAG AI Agent Template | `8tSVIIEAhL5ggRft` | no | POST (Respond to Webhook), POST /webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d | n/a | no | inactive |
| Ultimate Browser Agent Test | `60qWX5zv5UrxJkDX` | no | — | n/a | no | inactive |
| User verification and login using Auth0 | `KWJ1oQGaGPBupWc0` | no | POST (Open Auth Webpage), POST /webhook/login, POST /webhook/receive-token | n/a | no | inactive |
| veo 3 gorilla | `riXOUCdRHpKWK8V0` | no | — | n/a | no | YouTube Video |
| Vibe Coding - Idea Validation Pipeline | `pstJWO8bY19WS2pL` | no | POST /webhook/submit-idea, POST /webhook/feedback/{{ $parameter["project_id"] }}, POST /webhook/iterate-project | n/a | no | inactive |
| Voice assistant agent 2 | `ikfzzGIQb6L7qRtr` | no | — | n/a | no | inactive |
| webhookSecurity | `g4dFy2xBn0kHMOMF` | no | POST /webhook/9ab97d04-f4aa-4b5c-b46a-fc4d24199fbb, POST /webhook/9ab97d04-f4aa-4b5c-b46a-fc4d24199fbb, POST /webhook/3702d1cc-f548-4a32-8e33-0cb4e353f50d | n/a | no | inactive |
| Work Order Management | `wGSQP9u9I4mdtp3e` | no | POST /webhook/work-orders, POST /webhook/work-orders, PUT /webhook/work-orders/:orderId/status (+1) | n/a | no | inactive |
| ⚡ Quick Demo - AI-Powered GitHub Tracker | `jF0lAHuqLQJzajjQ` | no | — | n/a | no | inactive |
| 🎵 Sync YouTube and Spotify Music Playlists | `D9Nm29w8emwao0Io` | no | — | n/a | no | inactive |
| 💥 Create viral Ads with NanoBanana & Seedance, publish on socials via upload-post - vide | `P94cnn8CH7Z3vaYn` | no | — | n/a | no | inactive |
| 🚀 AI SaaS Master Scaffold - Fixed | `ZstAlMepeID4WSED` | no | POST /webhook/ai-saas-hook, POST (✅ Respond JSON) | n/a | no | inactive |
| 🤖 AI Agentic MCP Workflow Fixer - 2025 Trending | `BWO1ymxSvq6m9p27` | no | POST /webhook/ai-agentic-fixer, POST (📤 Respond to Webhook) | n/a | no | inactive |
| 🤖 AI Workflow Fixer - MCP Powered | `gPedWLPDnSYC2AEg` | no | POST /webhook/ai-workflow-fixer, POST (📤 Respond to Webhook) | n/a | no | inactive |
| 🤖Email Agent | `O10OPmB3h3HlFOTU` | no | — | n/a | no | inactive |

## Dual-host webhooks

| Host | Path pattern | Auth |
|------|--------------|------|
| `evenslouis.ca` | `/webhook*`, `/n8n/webhook*` | none (machines) |
| `n8ncloud.tech` | `/webhook*` | none (machines) |

## Refresh

```bash
curl -sS -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_BASE_URL/api/v1/workflows?limit=50"
```

