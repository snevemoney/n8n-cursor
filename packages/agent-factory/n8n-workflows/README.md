# N8N Workflows

This directory contains n8n workflow JSON files that power the Agent Factory system. These workflows orchestrate the process of generating specialized AI agents from templates.

## Workflows

- `agent_factory_main.json` - The main workflow that coordinates the agent generation process
- `rest_api_agent_generator.json` - Workflow for creating REST API agents
- `web_scraping_agent_generator.json` - Workflow for creating web scraping agents
- `data_processing_agent_generator.json` - Workflow for creating data processing agents
- `document_analysis_agent_generator.json` - Workflow for creating document analysis agents

## Usage

1. Import these workflow files into your n8n instance
2. Configure the necessary credentials and settings
3. Activate the workflows to start generating agents

## Dependencies

- n8n v1.0.0 or higher
- Node.js v16 or higher 