# Utility Scripts

This directory contains helper scripts for managing n8n workflows.

## Available Scripts

### `list-workflows.sh`

Lists all n8n workflows in the project and validates their JSON structure.

**Usage:**
```bash
./scripts/list-workflows.sh
```

**Features:**
- Validates JSON syntax for all workflow files
- Displays workflow names and node counts
- Shows active/inactive status
- Provides summary statistics

**Requirements:**
- `jq` (JSON processor)

**Installation of jq:**
- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
- Fedora: `sudo dnf install jq`

## Contributing

Feel free to add more utility scripts to help with workflow management, testing, or deployment.
