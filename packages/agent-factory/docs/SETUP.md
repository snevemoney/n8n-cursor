# Setting Up Agent Factory

This guide will walk you through setting up the Agent Factory system.

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js v16 or higher
- npm v7 or higher
- Python 3.8 or higher
- pip (Python package manager)
- Docker and Docker Compose (optional, for containerized deployment)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/agent-factory.git
cd agent-factory
```

## Step 2: Set Up n8n

### Option A: Local Installation

1. Install n8n globally:
   ```bash
   npm install -g n8n
   ```

2. Start n8n:
   ```bash
   n8n start
   ```

3. Access the n8n web interface at http://localhost:5678

### Option B: Docker Installation

1. Use the provided Docker Compose file:
   ```bash
   docker-compose up -d
   ```

2. Access the n8n web interface at http://localhost:5678

## Step 3: Import Workflows

1. Open the n8n web interface
2. Go to Workflows > Import From File
3. Import each workflow JSON file from the `n8n-workflows` directory
4. Save each imported workflow

## Step 4: Configure Credentials

1. In the n8n web interface, go to Settings > Credentials
2. Add credentials for any services your agents will interact with (APIs, databases, etc.)
3. Update the workflow nodes to use these credentials

## Step 5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Step 6: Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```
N8N_URL=http://localhost:5678
API_KEY=your_api_key_here
AGENT_OUTPUT_DIR=./generated_agents
```

## Step 7: Test the Setup

Run the test script to verify everything is working correctly:

```bash
./scripts/test_agent_factory.sh
```

If the test completes successfully, you're ready to start using Agent Factory!

## Next Steps

- Read the documentation for each agent type in the `templates` directory
- Try generating your first agent using the web interface
- Explore customizing the templates for your specific needs 