# 🔌 MCP Integration & Dynamic Project Board

## 🎯 Overview

This document describes how the n8n-cursor project integrates with Model Context Protocol (MCP) tools to create a dynamic, auto-updating GitHub Projects board that reflects real-time project status.

## 🚀 Features

- **Real-time Sync**: GitHub Actions, n8n workflows, and project status
- **MCP Integration**: Direct integration with n8n and GitHub MCP tools
- **Auto-population**: Items automatically created based on events
- **Smart Automation**: Auto-labeling, assignment, and status updates
- **Live Metrics**: Real-time project insights and performance data

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   n8n MCP       │    │   Project       │
│   Actions       │───▶│   Tools         │───▶│   Board         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Project       │    │   Real-time     │    │   Auto-         │
│   Board Sync    │    │   Updates       │    │   population    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Setup

### 1. Environment Variables

```bash
# Required for GitHub integration
export GITHUB_TOKEN="your-github-token"
export GITHUB_PROJECT_ID="your-project-id"

# Optional for enhanced features
export N8N_WEBHOOK_URL="your-n8n-webhook"
export SLACK_WEBHOOK_URL="your-slack-webhook"
```

### 2. Install Dependencies

```bash
# Install Python dependencies
pip install pyyaml requests

# Or use the Makefile
make board-setup
```

### 3. Configure GitHub Project

1. Go to your GitHub repository
2. Navigate to Projects tab
3. Create a new project or use existing
4. Note the project ID from the URL
5. Set the `GITHUB_PROJECT_ID` environment variable

## 📊 Project Board Structure

### Columns

| Column | Purpose | Auto-populate | Color |
|--------|---------|---------------|-------|
| **Backlog** | Items waiting to be prioritized | ✅ | Green |
| **Ready** | Ready for development | ✅ | Blue |
| **In Progress** | Currently being worked on | ✅ | Orange |
| **In Review** | Ready for review/testing | ✅ | Purple |
| **Done** | Completed items | ✅ | Gray |

### Auto-population Rules

#### GitHub Actions Integration

```yaml
mcp_integration:
  github_actions:
    - workflow: "Deploy"
      trigger: "on_success"
      action: "create_item"
      column: "Done"
      title: "Deployment Successful - {{ env }}"
      
    - workflow: "Deploy"
      trigger: "on_failure"
      action: "create_item"
      column: "Backlog"
      title: "🚨 Deployment Failed - {{ env }}"
      priority: "High"
```

#### n8n Workflow Integration

```yaml
n8n_status:
  - check_interval: "5m"
    action: "update_health_status"
    columns: ["Ready", "In Progress"]
```

## 🔌 MCP Tools Integration

### Available MCP Tools

1. **n8n MCP**: Workflow management and execution
2. **GitHub MCP**: Repository operations and project management
3. **Project Board Sync**: Real-time synchronization

### Integration Points

#### n8n Workflows

- **Health Monitoring**: Real-time service health checks
- **Deployment Tracking**: Automatic deployment status updates
- **Error Reporting**: Failed workflow notifications

#### GitHub Operations

- **Issue Management**: Auto-create/update project items
- **Project Board**: Real-time column updates
- **Workflow Integration**: Automatic status synchronization

## 🚀 Usage

### Manual Sync

```bash
# Sync once
make board-sync

# Or run directly
python scripts/mcp/project-board-sync.py
```

### Continuous Sync

```bash
# Run every 5 minutes
python scripts/mcp/project-board-sync.py --continuous 5
```

### GitHub Actions Integration

The project board syncs automatically via GitHub Actions:

- **Trigger**: Every 5 minutes + on workflow completion
- **Environment**: Production
- **Actions**: Sync project board, update metrics, create summaries

### Makefile Commands

```bash
# Project board management
make board-setup      # Initial setup
make board-sync       # Manual sync
make board-status     # Check status
make board-clean      # Clean artifacts

# MCP integration
make mcp-test         # Test MCP tools
make mcp-status       # Check MCP status
make mcp-setup        # Setup MCP integration

# Enhanced project management
make project-status   # Comprehensive status
make project-metrics  # Show metrics
make project-insights # Generate insights report
```

## 📈 Metrics & Insights

### Real-time Metrics

- **Deployment Success Rate**: Successful vs. failed deployments
- **Health Check Status**: System health monitoring
- **Issue Resolution Time**: Average time to resolve issues
- **Workflow Performance**: n8n workflow success rates

### Automated Insights

- **Daily Reports**: Generated automatically
- **Performance Trends**: Historical data analysis
- **Health Alerts**: Automatic issue creation
- **Status Updates**: Real-time project status

## 🔄 Workflow Integration

### Deployment Workflow

1. **Pre-deployment**: Health check, validation
2. **Deployment**: Service updates, health monitoring
3. **Post-deployment**: Success/failure tracking, project board update
4. **Rollback**: Automatic on failure, project board notification

### Disaster Recovery

1. **Health Monitoring**: Continuous health checks
2. **Incident Creation**: Automatic GitHub issue creation
3. **Recovery Actions**: Guided recovery procedures
4. **Status Updates**: Real-time project board updates

## 🛠️ Troubleshooting

### Common Issues

#### Project Board Not Syncing

```bash
# Check configuration
make board-status

# Verify environment variables
echo $GITHUB_TOKEN
echo $GITHUB_PROJECT_ID

# Check logs
tail -f logs/project-board-sync.log
```

#### MCP Connection Issues

```bash
# Test MCP integration
make mcp-test

# Check MCP status
make mcp-status
```

#### GitHub API Errors

```bash
# Verify token permissions
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/user

# Check rate limits
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/rate_limit
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python scripts/mcp/project-board-sync.py
```

## 🔮 Future Enhancements

### Planned Features

1. **AI-powered Insights**: Machine learning for project predictions
2. **Advanced Automation**: Smart item routing and assignment
3. **Integration Expansion**: More MCP tools and services
4. **Real-time Notifications**: Slack, email, and webhook integrations
5. **Performance Optimization**: Faster sync and better caching

### Customization

The system is designed to be easily customizable:

- **Configuration**: Modify `config/project-board.yml`
- **Rules**: Add custom automation rules
- **Integrations**: Extend with new MCP tools
- **Metrics**: Custom metrics and insights

## 📚 Resources

- [GitHub Projects API](https://docs.github.com/en/rest/projects)
- [GitHub Actions](https://docs.github.com/en/actions)
- [n8n MCP Documentation](https://docs.n8n.io/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 🤝 Contributing

To contribute to the MCP integration:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This MCP integration is part of the n8n-cursor project and follows the same license terms.
