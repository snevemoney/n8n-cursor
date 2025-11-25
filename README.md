# 🚀 n8n-cursor: AI-Powered Workflow Automation

A comprehensive collection of n8n workflows built using n8n-MCP (Model Context Protocol) demonstrating the power of AI-assisted workflow automation.

## 🎯 Project Overview

This repository contains enterprise-grade n8n workflows that showcase how AI can revolutionize workflow automation. Built using [n8n-MCP](https://github.com/czlonkowski/n8n-mcp), these workflows demonstrate the seamless integration of multiple APIs, AI services, and automation platforms.

## 🏗️ Repository Structure

```
n8n-cursor/
├── workflows/           # Complete n8n workflow JSON files
├── docs/               # Documentation and guides
├── examples/           # Test payloads and examples
├── .github/            # CI/CD workflows and automation
├── .env.example        # Environment variable template
├── LICENSE             # MIT License
├── SECURITY.md         # Security policy and best practices
└── README.md          # This file
```

## 🚀 Workflows Included

### 1. **AI SaaS Master Scaffold** ⭐
- **File:** `workflows/ai-saas-master-scaffold.json`
- **Purpose:** Enterprise-grade multi-API orchestration platform
- **Features:** OpenAI, Supabase, Discord integration with smart routing
- **Status:** ✅ Active & Production Ready

### 2. **AI Content Empire - Multi-Platform Automation**
- **File:** `workflows/ai-content-empire.json`
- **Purpose:** Automated content creation and distribution across platforms
- **Features:** RSS monitoring, AI analysis, Twitter/Slack posting, analytics
- **Status:** 🔧 Needs credential configuration

### 3. **AI Research Agent Demo**
- **File:** `workflows/ai-research-agent.json`
- **Purpose:** Intelligent Q&A system via webhook
- **Features:** Natural language processing, comprehensive research responses
- **Status:** ✅ Active

## 🛠️ Setup Instructions

### Prerequisites

1. **n8n Instance:** Self-hosted or n8n Cloud
2. **n8n-MCP:** Configured in Cursor/Claude Desktop
3. **API Credentials:** OpenAI, GitHub, Slack, Twitter, etc.

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/snevemoney/n8n-cursor.git
   cd n8n-cursor
   ```

2. **Import workflows to n8n:**
   - Open your n8n instance
   - Go to Workflows → Import from file
   - Select workflow JSON files from `/workflows` directory

3. **Configure credentials:**
   - Set up OAuth connections for GitHub, Slack, Twitter
   - Add API keys for OpenAI, Supabase
   - Update webhook URLs where needed

## 🌟 Key Features

- **AI-Powered Automation:** GPT-4 integration and smart routing
- **Multi-Platform Integration:** Social media, development, database automation
- **Enterprise Ready:** Error handling, scalability, security, monitoring

## 📄 License

MIT License - feel free to use these workflows in your own projects!

---

**Built with ❤️ using n8n-MCP - Where AI meets automation!**
