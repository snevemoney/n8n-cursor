#!/bin/bash

# 🚀 CONSOLIDATED LAUNCHER - Single script to launch everything
# 🎯 Reduced from multiple files to one clean launcher

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 LAUNCHING CONSOLIDATED N8N STACK${NC}"
echo -e "${BLUE}=====================================${NC}"

# Launch consolidated protection system
if [[ -f "../n8n-enterprise-protection.sh" ]]; then
  echo -e "${GREEN}🛡️  Launching enterprise protection...${NC}"
  cd ..
  ./n8n-enterprise-protection.sh start
else
  echo -e "${BLUE}🔄 Launching consolidated system...${NC}"
  # Launch consolidated components
  ./n8n-management.sh start
  ./docker-tools.sh docker
fi

echo -e "${GREEN}✅ Consolidated system launched!${NC}"
echo -e "${BLUE}📁 Check consolidated/ directory for clean files${NC}"
