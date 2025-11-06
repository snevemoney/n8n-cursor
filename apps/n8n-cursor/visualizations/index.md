# 🔄 n8n Workflow Visualizations

*Auto-generated on 8/18/2025, 8:11:48 PM*

## Quick Stats
- **Total Workflows:** 6
- **Active Workflows:** 2
- **Total Nodes:** 50

## 📋 Table of Contents

| Workflow | Status | Nodes | Last Updated | Diagram |
|----------|--------|-------|--------------|---------|
| **Simple Slack Notifier** | 🔴 Inactive | 4 | 8/18/2025 | [View](simple_slack_notifier.md) |
| **GPT-5 Support Agent** | 🔴 Inactive | 9 | 8/18/2025 | [View](gpt5-support-agent.md) |
| **Master Orchestration System** | 🔴 Inactive | 13 | 8/18/2025 | [View](master-orchestration-system.md) |
| **🚀 AI SaaS Master Scaffold** | 🟢 Active | 9 | 8/18/2025 | [View](ai-saas-master-scaffold.md) |
| **AI Research Agent Demo** | 🟢 Active | 2 | 8/18/2025 | [View](ai-research-agent.md) |
| **🚀 AI Content Empire - Multi-Platform Automation** | 🔴 Inactive | 13 | 8/18/2025 | [View](ai-content-empire.md) |

---

## 🖼️ Workflow Diagrams

### Simple Slack Notifier

# Simple Slack Notifier

```mermaid
flowchart TD
    webhook_trigger["Webhook Trigger<br/>(webhook)"]
    extract_message_data["Extract Message Data<br/>(set)"]
    check_message_exists["Check Message Exists<br/>(if)"]
    send_slack_message["Send Slack Message<br/>(httpRequest)"]

    extract_message_data --> check_message_exists
    check_message_exists --> send_slack_message

    style webhook_trigger fill:#fffbcc,stroke:#e1b000,stroke-width:3px
```

**Status:** 🔴 Inactive
**Last Updated:** 8/18/2025, 8:11:48 PM
**Nodes:** 4 | **Triggers:** 1


---

### GPT-5 Support Agent

# GPT-5 Support Agent

```mermaid
flowchart TD
    gmail_trigger["Gmail Trigger<br/>(gmailTrigger)"]
    when_missing_a_sender_name["When missing a sender name<br/>(if)"]
    support_agent["Support Agent<br/>(code)"]
    content_database["Content Database<br/>(airtable)"]
    punctuation["Punctuation<br/>(code)"]
    set_output["Set Output<br/>(set)"]
    ai_agent["AI Agent<br/>(openAiChat)"]
    score["Score<br/>(function)"]
    send_a_message["Send a message<br/>(gmail)"]

    gmail_trigger --> when_missing_a_sender_name
    when_missing_a_sender_name --> support_agent
    support_agent --> punctuation
    support_agent --> content_database
    punctuation --> set_output
    set_output --> ai_agent
    ai_agent --> score
    score --> send_a_message

```

**Status:** 🔴 Inactive
**Last Updated:** 8/18/2025, 8:11:48 PM
**Nodes:** 9 | **Triggers:** 0


---

### Master Orchestration System

# Master Orchestration System

```mermaid
flowchart TD
    master_trigger["Master Trigger<br/>(webhook)"]
    request_analyzer["Request Analyzer<br/>(function)"]
    workflow_router["Workflow Router<br/>(switch)"]
    ai_saas_workflow["AI SaaS Workflow<br/>(httpRequest)"]
    research_workflow["Research Workflow<br/>(httpRequest)"]
    content_creation_workflow["Content Creation Workflow<br/>(httpRequest)"]
    support_agent_workflow["Support Agent Workflow<br/>(httpRequest)"]
    workflow_results_merger["Workflow Results Merger<br/>(merge)"]
    analytics_tracker["Analytics Tracker<br/>(function)"]
    database_storage["Database Storage<br/>(httpRequest)"]
    notification_system["Notification System<br/>(httpRequest)"]
    response_assembler["Response Assembler<br/>(function)"]
    master_response["Master Response<br/>(respondToWebhook)"]

    master_trigger --> request_analyzer
    request_analyzer --> workflow_router
    workflow_router --> ai_saas_workflow
    workflow_router --> research_workflow
    workflow_router --> content_creation_workflow
    workflow_router --> support_agent_workflow
    workflow_router --> ai_saas_workflow
    ai_saas_workflow --> workflow_results_merger
    research_workflow --> workflow_results_merger
    content_creation_workflow --> workflow_results_merger
    support_agent_workflow --> workflow_results_merger
    workflow_results_merger --> analytics_tracker
    analytics_tracker --> database_storage
    analytics_tracker --> notification_system
    database_storage --> response_assembler
    notification_system --> response_assembler
    response_assembler --> master_response

    style master_trigger fill:#fffbcc,stroke:#e1b000,stroke-width:3px
    style master_response fill:#fffbcc,stroke:#e1b000,stroke-width:3px
```

**Status:** 🔴 Inactive
**Last Updated:** 8/18/2025, 8:11:48 PM
**Nodes:** 13 | **Triggers:** 2


---

### 🚀 AI SaaS Master Scaffold

# 🚀 AI SaaS Master Scaffold

```mermaid
flowchart TD
    webhook_trigger["🌐 Webhook Trigger<br/>(webhook)"]
    prepare_payload["📦 Prepare Payload<br/>(set)"]
    api_router["🔀 API Router<br/>(if)"]
    openai_chat["🤖 OpenAI Chat<br/>(httpRequest)"]
    supabase_insert["🗄️ Supabase Insert<br/>(httpRequest)"]
    discord_notify["💬 Discord Notify<br/>(httpRequest)"]
    merge_results["🔄 Merge Results<br/>(merge)"]
    assemble_response["📋 Assemble Response<br/>(code)"]
    respond_json["✅ Respond JSON<br/>(respondToWebhook)"]

    webhook_trigger --> prepare_payload
    prepare_payload --> api_router
    api_router --> openai_chat
    api_router --> supabase_insert
    api_router --> discord_notify
    openai_chat --> merge_results
    supabase_insert --> merge_results
    discord_notify --> merge_results
    merge_results --> assemble_response
    assemble_response --> respond_json

    style webhook_trigger fill:#fffbcc,stroke:#e1b000,stroke-width:3px
    style respond_json fill:#fffbcc,stroke:#e1b000,stroke-width:3px
```

**Status:** 🟢 Active
**Last Updated:** 8/18/2025, 1:20:46 PM
**Nodes:** 9 | **Triggers:** 2


---

### AI Research Agent Demo

# AI Research Agent Demo

```mermaid
flowchart TD
    research_question_input["Research Question Input<br/>(webhook)"]
    demo_research_response["Demo Research Response<br/>(code)"]

    research_question_input --> demo_research_response

    style research_question_input fill:#fffbcc,stroke:#e1b000,stroke-width:3px
```

**Status:** 🟢 Active
**Last Updated:** 8/18/2025, 1:14:42 PM
**Nodes:** 2 | **Triggers:** 1


---

### 🚀 AI Content Empire - Multi-Platform Automation

# 🚀 AI Content Empire - Multi-Platform Automation

```mermaid
flowchart TD
    content_discovery_engine["Content Discovery Engine<br/>(scheduleTrigger)"]
    techcrunch_rss["TechCrunch RSS<br/>(rssFeedRead)"]
    hacker_news["Hacker News<br/>(rssFeedRead)"]
    ars_technica["Ars Technica<br/>(rssFeedRead)"]
    content_aggregator["Content Aggregator<br/>(merge)"]
    smart_content_filter["Smart Content Filter<br/>(if)"]
    ai_content_analyzer["🤖 AI Content Analyzer<br/>(openAi)"]
    content_intelligence_engine["Content Intelligence Engine<br/>(code)"]
    quality_gate_60["Quality Gate (60+)<br/>(if)"]
    content_database["📊 Content Database<br/>(airtable)"]
    auto_tweet["🐦 Auto-Tweet<br/>(twitter)"]
    team_notification["📢 Team Notification<br/>(slack)"]
    analytics_tracker["📈 Analytics Tracker<br/>(googleSheets)"]

    content_discovery_engine --> techcrunch_rss
    content_discovery_engine --> hacker_news
    content_discovery_engine --> ars_technica
    techcrunch_rss --> content_aggregator
    hacker_news --> content_aggregator
    ars_technica --> content_aggregator
    content_aggregator --> smart_content_filter
    smart_content_filter --> ai_content_analyzer
    ai_content_analyzer --> content_intelligence_engine
    content_intelligence_engine --> quality_gate_60
    quality_gate_60 --> content_database
    quality_gate_60 --> auto_tweet
    quality_gate_60 --> team_notification
    auto_tweet --> analytics_tracker

    style content_discovery_engine fill:#fffbcc,stroke:#e1b000,stroke-width:3px
```

**Status:** 🔴 Inactive
**Last Updated:** 8/18/2025, 1:04:04 PM
**Nodes:** 13 | **Triggers:** 1


---

## 🔧 Tools & Commands

- **Regenerate All:** `npm run gen`
- **Start Watcher:** `npm run watch`
- **Sync to GitHub:** `npm run sync`
- **View Backups:** Check `backups/` folder

*This page updates automatically when workflows change.*
