# n8n-cursor DevOps Runbook

## Quick Start

```bash
# Check system health
make guard && make doctor && make wf-validate

# Start services (dry run by default)
DRY_RUN=0 make up

# Stop services
make down

# View logs
make logs
```

## Repository Structure

```
n8n-cursor/
├── infra/           # Infrastructure definitions
│   ├── docker/      # Docker compose files
│   └── nginx/       # Nginx configurations
├── scripts/         # Operational scripts
│   ├── ops/         # n8n operations
│   ├── workflows/   # Workflow management
│   ├── safety/      # Security and validation
│   ├── utils/       # Common utilities
│   └── bin/         # Binary scripts
├── workflows/       # n8n workflow files
├── templates/       # Templates for new files
├── docs/           # Documentation
├── reports/        # Generated reports
├── apps/           # Application modules
│   └── repo-brain/ # Repository intelligence
├── config/         # Configuration files
├── backups/        # Backup files
└── logs/           # Log files
```

## Make Targets

### Core Operations
- `make up` - Start n8n services
- `make down` - Stop n8n services
- `make restart` - Restart services
- `make status` - Check service status
- `make logs` - View service logs

### Workflow Management
- `make wf-validate` - Validate all workflows
- `make wf-dedupe` - Remove duplicate workflows
- `make wf-import` - Import workflows

### Safety & Health
- `make guard` - Run structure guard
- `make doctor` - Run health diagnostics
- `make repair` - Repair local issues
- `make repair-remote` - Repair remote issues

### Development
- `make new-workflow NAME="workflow-name"` - Create new workflow
- `make new-script NAME="script-name" DESC="description"` - Create new script
- `make fmt` - Format shell scripts
- `make lint` - Lint shell scripts

### Repo Brain
- `make brain-index` - Index repository for AI analysis
- `make brain-suggest` - Get AI suggestions for repository

### CI/CD
- `make ci` - Run all checks (fmt, lint, guard)

## Environment Variables

Set these in your shell or `.env` file:

```bash
export DRY_RUN=1                    # Default to dry run mode
export MASTER_UNLOCK=your_key_here  # Master unlock key (env var only!)
export OPENAI_API_KEY=...           # For Repo Brain AI features
export SUPABASE_URL=...             # For Repo Brain storage
export SUPABASE_ANON_KEY=...        # For Repo Brain authentication
```

## Repo Brain

The Repository Brain provides AI-powered insights and suggestions for your codebase.

### Setup

1. Set required environment variables:
   ```bash
   export OPENAI_API_KEY=your_openai_key
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_ANON_KEY=your_supabase_key
   ```

2. Index your repository:
   ```bash
   make brain-index
   ```

3. Get suggestions:
   ```bash
   make brain-suggest
   ```

### Features

- **Intelligent Indexing**: Analyzes your codebase structure and content
- **AI Suggestions**: Provides recommendations for improvements
- **Code Organization**: Suggests better file placement and structure
- **Security Analysis**: Identifies potential security issues

## Safety Features

### Structure Guard
- Prevents forbidden file paths
- Blocks hardcoded secrets
- Enforces repository structure

### Doctor System
- Checks system health
- Validates configurations
- Reports issues and warnings

### Backup & Recovery
- Automatic database backups
- Workflow safety backups
- Rollback capabilities

## Troubleshooting

### Common Issues

1. **Port 443 busy**: Check for conflicting services
2. **Forbidden paths**: Move files to correct locations
3. **MASTER_UNLOCK in code**: Use environment variables only

### Recovery Commands

```bash
# Check what's wrong
make doctor

# Repair issues
make repair

# Validate structure
make guard

# Check workflows
make wf-validate
```

## Security

- Never commit secrets to the repository
- Use environment variables for sensitive data
- Run `make guard` before committing
- Enable branch protections in GitHub

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `make ci` to ensure quality
4. Submit a pull request

## Support

For issues or questions:
1. Check the logs: `make logs`
2. Run diagnostics: `make doctor`
3. Check structure: `make guard`
4. Review this runbook
