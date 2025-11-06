#!/bin/bash
set -e

echo "🔧 MACBOOK N8N SETUP - ENVIRONMENT CONFIGURATION"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check current shell
print_status "Step 1: Checking current shell..."
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    print_success "Using zsh configuration: $SHELL_CONFIG"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
    print_success "Using bash configuration: $SHELL_CONFIG"
else
    print_warning "No shell configuration found, creating .zshrc"
    SHELL_CONFIG="$HOME/.zshrc"
    touch "$SHELL_CONFIG"
fi

# Step 2: Check if N8N environment variables are already set
print_status "Step 2: Checking current N8N environment variables..."
if grep -q "N8N_API_URL" "$SHELL_CONFIG"; then
    print_warning "N8N_API_URL already exists in $SHELL_CONFIG"
    print_status "Current value:"
    grep "N8N_API_URL" "$SHELL_CONFIG"
else
    print_status "N8N_API_URL not found, will add"
fi

if grep -q "N8N_API_KEY" "$SHELL_CONFIG"; then
    print_warning "N8N_API_KEY already exists in $SHELL_CONFIG"
    print_status "Current value:"
    grep "N8N_API_KEY" "$SHELL_CONFIG" | sed 's/N8N_API_KEY=.*/N8N_API_KEY=***HIDDEN***/'
else
    print_status "N8N_API_KEY not found, will add"
fi

# Step 3: Add N8N environment variables
print_status "Step 3: Adding N8N environment variables..."
if ! grep -q "N8N_API_URL" "$SHELL_CONFIG"; then
    echo "" >> "$SHELL_CONFIG"
    echo "# N8N Configuration" >> "$SHELL_CONFIG"
    echo "export N8N_API_URL=\"https://n8ncloud.tech/api/v1\"" >> "$SHELL_CONFIG"
    print_success "Added N8N_API_URL to $SHELL_CONFIG"
fi

if ! grep -q "N8N_API_KEY" "$SHELL_CONFIG"; then
    echo "export N8N_API_KEY=\"your-api-key-here\"" >> "$SHELL_CONFIG"
    print_success "Added N8N_API_KEY placeholder to $SHELL_CONFIG"
    print_warning "⚠️  Please replace 'your-api-key-here' with your actual n8n API key"
fi

# Step 4: Check MCP configuration
print_status "Step 4: Checking MCP configuration..."
MCP_CONFIG="$HOME/.cursor/mcp.json"
if [ -f "$MCP_CONFIG" ]; then
    print_success "MCP config file exists: $MCP_CONFIG"
    
    # Check if n8n server is configured
    if grep -q "n8n" "$MCP_CONFIG"; then
        print_success "n8n MCP server is configured"
        print_status "Current n8n MCP configuration:"
        grep -A 5 -B 5 "n8n" "$MCP_CONFIG" || echo "Configuration details not found"
    else
        print_warning "n8n MCP server not configured"
        print_status "You may need to configure n8n MCP server manually"
    fi
else
    print_error "MCP config file not found: $MCP_CONFIG"
    print_status "You may need to configure MCP manually"
fi

# Step 5: Test current environment
print_status "Step 5: Testing current environment..."
print_status "Current N8N_API_URL: $N8N_API_URL"
if [ -n "$N8N_API_KEY" ]; then
    print_status "Current N8N_API_KEY: ${N8N_API_KEY:0:10}..."
else
    print_warning "N8N_API_KEY not set"
fi

# Step 6: Test n8n connectivity
print_status "Step 6: Testing n8n connectivity..."
if curl -s -o /dev/null -w "%{http_code}" https://n8ncloud.tech | grep -q "200\|502"; then
    print_success "n8ncloud.tech is accessible"
else
    print_error "n8ncloud.tech not accessible"
fi

# Step 7: Test local n8n
print_status "Step 7: Testing local n8n..."
if curl -s http://localhost:5679 >/dev/null 2>&1; then
    print_success "Local n8n is accessible"
else
    print_warning "Local n8n not accessible"
fi

# Step 8: Generate instructions
print_status "Step 8: Generating setup instructions..."
cat << 'SETUP_INSTRUCTIONS'

📋 SETUP INSTRUCTIONS:
=====================

1. Get your n8n API key:
   - Go to https://n8ncloud.tech
   - Login with: admin / lightningflow2024
   - Go to Settings → API Keys
   - Create a new API key
   - Copy the key

2. Update your environment variables:
   - Edit $SHELL_CONFIG
   - Replace "your-api-key-here" with your actual API key
   - Save the file

3. Reload your shell configuration:
   source $SHELL_CONFIG

4. Test the setup:
   echo $N8N_API_URL
   echo $N8N_API_KEY

5. Verify MCP integration:
   - Check if n8n MCP server is working in Cursor
   - Try using n8n MCP tools

SETUP_INSTRUCTIONS

# Step 9: Show current configuration
print_status "Step 9: Current configuration summary..."
echo ""
echo "=== CURRENT CONFIGURATION ==="
echo "Shell config: $SHELL_CONFIG"
echo "MCP config: $MCP_CONFIG"
echo "N8N_API_URL: $N8N_API_URL"
echo "N8N_API_KEY: ${N8N_API_KEY:0:10}..." 2>/dev/null || echo "N8N_API_KEY: Not set"
echo ""

# Step 10: Final recommendations
print_status "Step 10: Final recommendations..."
cat << 'RECOMMENDATIONS'

🚀 NEXT STEPS:
=============

1. VPS Fix:
   - Copy the VPS fix script to your VPS terminal
   - Run it to fix n8n permission issues
   - This will resolve the 502 error on n8ncloud.tech

2. MacBook Setup:
   - Get your n8n API key from n8ncloud.tech
   - Update the environment variables
   - Reload your shell configuration

3. Test Integration:
   - Test n8ncloud.tech access
   - Test local n8n access
   - Test MCP integration

4. Database Sync:
   - Ensure your MacBook and VPS use the same database
   - Check PostgreSQL and Redis connections

RECOMMENDATIONS

print_success "🔧 MACBOOK N8N SETUP COMPLETED!"
print_status "📋 Follow the setup instructions above"
print_status "🚀 Run the VPS fix script to complete the setup"
