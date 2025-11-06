#!/usr/bin/env bash
set -euo pipefail

# Category 1: Code Authoring - Generate new agent scaffolding
# Usage: ./scripts/cursor-categories/generate-agent.sh "Agent Name" [Type]

AGENT_NAME="${1:-}"
AGENT_TYPE="${2:-bitcoin}"

if [ -z "$AGENT_NAME" ]; then
    echo "❌ ERROR: Agent name required"
    echo "Usage: $0 \"Agent Name\" [Type]"
    echo "Types: bitcoin, lightning, trading, analytics, webhook"
    exit 1
fi

# Convert agent name to safe filename
AGENT_SLUG=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

echo "🤖 Generating agent: $AGENT_NAME"
echo "📁 Agent slug: $AGENT_SLUG"
echo "🔧 Agent type: $AGENT_TYPE"

# Create agent directory structure
AGENT_DIR="apps/lightningflow/api/src/agents/$AGENT_SLUG"
mkdir -p "$AGENT_DIR"

# Generate agent files
echo "📝 Creating agent files..."

# Main agent file
cat > "$AGENT_DIR/index.ts" << EOF
import { Agent } from '../types/Agent';
import { BitcoinConfig } from '../types/BitcoinConfig';
import { Logger } from '../utils/Logger';

export class ${AGENT_NAME//[^a-zA-Z0-9]/}Agent implements Agent {
  private config: BitcoinConfig;
  private logger: Logger;

  constructor(config: BitcoinConfig) {
    this.config = config;
    this.logger = new Logger(\`${AGENT_SLUG}-agent\`);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing ${AGENT_NAME} agent...');
    // TODO: Add initialization logic
  }

  async execute(): Promise<void> {
    this.logger.info('Executing ${AGENT_NAME} agent...');
    // TODO: Add execution logic
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    return {
      status: 'healthy',
      details: {
        agent: '${AGENT_SLUG}',
        type: '${AGENT_TYPE}',
        timestamp: new Date().toISOString()
      }
    };
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down ${AGENT_NAME} agent...');
    // TODO: Add cleanup logic
  }
}
EOF

# Agent configuration
cat > "$AGENT_DIR/config.ts" << EOF
import { BitcoinConfig } from '../types/BitcoinConfig';

export const ${AGENT_SLUG}Config: BitcoinConfig = {
  name: '${AGENT_NAME}',
  type: '${AGENT_TYPE}',
  enabled: true,
  interval: 60000, // 1 minute
  retries: 3,
  timeout: 30000, // 30 seconds
  // TODO: Add agent-specific configuration
};
EOF

# Agent tests
cat > "$AGENT_DIR/index.test.ts" << EOF
import { ${AGENT_NAME//[^a-zA-Z0-9]/}Agent } from './index';
import { ${AGENT_SLUG}Config } from './config';

describe('${AGENT_NAME}Agent', () => {
  let agent: ${AGENT_NAME//[^a-zA-Z0-9]/}Agent;

  beforeEach(() => {
    agent = new ${AGENT_NAME//[^a-zA-Z0-9]/}Agent(${AGENT_SLUG}Config);
  });

  it('should initialize successfully', async () => {
    await expect(agent.initialize()).resolves.not.toThrow();
  });

  it('should execute successfully', async () => {
    await agent.initialize();
    await expect(agent.execute()).resolves.not.toThrow();
  });

  it('should return healthy status', async () => {
    const health = await agent.healthCheck();
    expect(health.status).toBe('healthy');
    expect(health.details.agent).toBe('${AGENT_SLUG}');
  });

  it('should shutdown gracefully', async () => {
    await agent.initialize();
    await expect(agent.shutdown()).resolves.not.toThrow();
  });
});
EOF

# Agent documentation
cat > "$AGENT_DIR/README.md" << EOF
# ${AGENT_NAME} Agent

## Overview
This agent handles ${AGENT_TYPE} operations for LightningFlow AI.

## Configuration
- **Type**: ${AGENT_TYPE}
- **Interval**: 60 seconds
- **Retries**: 3
- **Timeout**: 30 seconds

## Health Check
The agent provides a health check endpoint at \`/healthz\` that returns:
- Status: healthy/unhealthy
- Agent details
- Timestamp

## Usage
\`\`\`typescript
import { ${AGENT_NAME//[^a-zA-Z0-9]/}Agent } from './agents/${AGENT_SLUG}';
import { ${AGENT_SLUG}Config } from './agents/${AGENT_SLUG}/config';

const agent = new ${AGENT_NAME//[^a-zA-Z0-9]/}Agent(${AGENT_SLUG}Config);
await agent.initialize();
await agent.execute();
\`\`\`

## Testing
\`\`\`bash
npm test -- agents/${AGENT_SLUG}
\`\`\`

## TODO
- [ ] Implement initialization logic
- [ ] Implement execution logic
- [ ] Add error handling
- [ ] Add monitoring and metrics
- [ ] Add configuration validation
EOF

# Docker Compose service
cat > "$AGENT_DIR/docker-compose.yml" << EOF
version: "3.9"

services:
  ${AGENT_SLUG}-agent:
    build:
      context: ../../../
      dockerfile: apps/lightningflow/api/Dockerfile
    environment:
      - NODE_ENV=production
      - AGENT_TYPE=${AGENT_TYPE}
      - AGENT_NAME=${AGENT_SLUG}
    ports:
      - "127.0.0.1:${AGENT_SLUG//[^0-9]/}${RANDOM:0:3}:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    init: true
    stop_grace_period: 15s
    restart: unless-stopped
    networks:
      - internal

networks:
  internal:
    driver: bridge
EOF

echo "✅ Agent generated successfully!"
echo ""
echo "📁 Files created:"
echo "  - $AGENT_DIR/index.ts"
echo "  - $AGENT_DIR/config.ts"
echo "  - $AGENT_DIR/index.test.ts"
echo "  - $AGENT_DIR/README.md"
echo "  - $AGENT_DIR/docker-compose.yml"
echo ""
echo "🔧 Next steps:"
echo "  1. Implement the TODO items in index.ts"
echo "  2. Add agent-specific configuration in config.ts"
echo "  3. Run tests: npm test -- agents/$AGENT_SLUG"
echo "  4. Add to main agent registry"
echo "  5. Deploy with: docker compose -f $AGENT_DIR/docker-compose.yml up -d"
echo ""
echo "🏥 Health check: http://localhost:${AGENT_SLUG//[^0-9]/}${RANDOM:0:3}/healthz"
