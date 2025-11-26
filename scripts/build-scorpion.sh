#!/bin/bash
set -e

echo "🦂 Building Scorpion Docker image..."

# Build from workspace root
docker build -t scorpion:local -f apps/scorpion/Dockerfile .

echo "✅ Build complete!"
echo ""
echo "To test locally:"
echo "  docker run -p 3003:3003 \\"
echo "    -v \$(pwd)/apps/scorpion/data/scorpion:/app/data/scorpion \\"
echo "    -v \$(pwd)/apps/scorpion/backups:/app/backups/scorpion \\"
echo "    -e SCORPION_STORAGE_AUTO_DETECT=false \\"
echo "    -e SCORPION_SSD_PATH=/app/data/scorpion \\"
echo "    scorpion:local"
echo ""
echo "Or use docker-compose:"
echo "  docker compose -f infra/docker/docker-compose.prod.yml up scorpion"

