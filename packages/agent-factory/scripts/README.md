# Utility Scripts

This directory contains utility scripts to help manage and test the Agent Factory system.

## Scripts

- `start-all.sh` - Starts all necessary services and dependencies for the Agent Factory
- `stop-all.sh` - Stops all running services associated with the Agent Factory
- `clean-docker.sh` - Cleans up Docker containers and images used by the Agent Factory
- `test_agent_factory.sh` - Runs tests to verify the Agent Factory is working correctly

## Usage

Make sure to set execute permissions for these scripts:

```bash
chmod +x scripts/*.sh
```

Then run them from the project root:

```bash
./scripts/start-all.sh
```

## Requirements

- Bash shell
- Docker and Docker Compose (for container-based deployments)
- Python 3.8 or higher (for testing) 