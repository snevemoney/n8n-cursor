# Agent Templates

This directory contains template files for various types of specialized AI agents. These templates serve as the foundation for the Agent Factory system to generate customized agents.

## Templates

- `rest_api_agent.py` - Template for agents that interact with REST APIs
- `web_scraping_agent.py` - Template for agents that scrape data from websites
- `data_processing_agent.py` - Template for agents that process and transform data
- `document_analysis_agent.py` - Template for agents that analyze and extract information from documents

## Template Structure

Each template contains:
- Necessary imports and dependencies
- Placeholders for configuration parameters (marked with `{{placeholders}}`)
- Core functionality for the specific agent type
- Utility functions for common tasks
- Error handling and logging functionality

## Customization

The n8n workflows in the Agent Factory will replace placeholders with specific configurations to create specialized agents tailored to particular use cases. 