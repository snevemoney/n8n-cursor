#!/bin/bash

# Zep Graphiti MCP Server Setup Script
# Run this on your VPS: ssh root@69.62.66.78 "bash -s" < setup-zep-mcp.sh

echo "=== Setting up Zep's Official Graphiti MCP Server ==="

# Step 1: Stop and remove custom server
echo "Step 1: Removing custom MCP server..."
docker stop zep-graffiti-mcp 2>/dev/null || true
docker rm zep-graffiti-mcp 2>/dev/null || true

# Step 2: Install Zep's official MCP server
echo "Step 2: Installing Zep's official Graphiti MCP server..."
cd /root
if [ ! -d "graphiti" ]; then
    git clone https://github.com/getzep/graphiti.git
fi
cd graphiti/mcp_server

# Install dependencies
if command -v uv &> /dev/null; then
    uv sync
else
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
    uv sync
fi

# Step 3: Set up Neo4j database
echo "Step 3: Setting up Neo4j database..."
docker stop neo4j 2>/dev/null || true
docker rm neo4j 2>/dev/null || true
docker run -d --name neo4j --network n8n-mcp-network -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:5.26

# Wait for Neo4j to start
echo "Waiting for Neo4j to start..."
sleep 30

# Step 4: Create environment file
echo "Step 4: Creating environment configuration..."
cat > .env << 'EOF'
OPENAI_API_KEY=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
MODEL_NAME=gpt-4o-mini
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
EOF

echo "Step 5: Starting Zep Graphiti MCP Server..."
echo "Run this command to start the server:"
echo "cd /root/graphiti/mcp_server && uv run graphiti_mcp_server.py --transport sse --group-id n8n-project"

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Update your OpenAI API key in /root/graphiti/mcp_server/.env"
echo "2. Start the server with the command above"
echo "3. Update n8n MCP Client to connect to the new server"
