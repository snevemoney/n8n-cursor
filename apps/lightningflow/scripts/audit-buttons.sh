#!/bin/bash

# Lightning AI Platform - Button & Navigation Audit Script
# Scans codebase for all buttons, links, and navigation elements

echo "🔍 Lightning AI Platform - Button & Navigation Audit"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Create audit directory
mkdir -p audit-reports
REPORT_FILE="audit-reports/button-audit-$(date +%Y%m%d-%H%M%S).md"

echo "# Button & Navigation Audit Report" > $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to search and report
search_and_report() {
    local pattern="$1"
    local description="$2"
    local color="$3"
    
    echo -e "\n${color}🔍 Searching for: ${description}${NC}"
    echo "## $description" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    # Search in web/src directory
    if [ -d "web/src" ]; then
        cd web/src
        results=$(grep -r -n --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" "$pattern" . 2>/dev/null || true)
        
        if [ -n "$results" ]; then
            echo "$results" | while IFS= read -r line; do
                file=$(echo "$line" | cut -d: -f1)
                line_num=$(echo "$line" | cut -d: -f2)
                content=$(echo "$line" | cut -d: -f3-)
                
                echo "  📁 $file:$line_num"
                echo "     $content"
                echo "- **$file:$line_num** \`$content\`" >> ../../$REPORT_FILE
            done
            echo "" >> ../../$REPORT_FILE
        else
            echo "  ✅ No matches found"
            echo "- No matches found" >> ../../$REPORT_FILE
            echo "" >> ../../$REPORT_FILE
        fi
        cd ../..
    fi
}

# 1. Button Elements
echo -e "\n${PURPLE}📊 BUTTON AUDIT${NC}"
search_and_report "<Button" "Button Components" $BLUE
search_and_report "onClick=" "Click Handlers" $BLUE
search_and_report "onPress=" "Press Handlers" $BLUE

# 2. Navigation Elements  
echo -e "\n${PURPLE}🧭 NAVIGATION AUDIT${NC}"
search_and_report "<Link" "Link Components" $GREEN
search_and_report "href=" "Href Attributes" $GREEN
search_and_report "router\." "Router Usage" $GREEN
search_and_report "useRouter" "Router Hooks" $GREEN
search_and_report "redirect" "Redirect Calls" $GREEN

# 3. Route Definitions
echo -e "\n${PURPLE}🛣️ ROUTE AUDIT${NC}"
search_and_report "\"/" "Hardcoded Paths" $YELLOW
search_and_report "/dashboard" "Dashboard Routes" $YELLOW
search_and_report "/send" "Send Routes" $YELLOW
search_and_report "/receive" "Receive Routes" $YELLOW

# 4. Duplicate Actions
echo -e "\n${PURPLE}🔄 DUPLICATION AUDIT${NC}"
search_and_report "send.*payment" "Send Payment Actions" $RED
search_and_report "quick.*pay" "Quick Pay Actions" $RED
search_and_report "generate.*invoice" "Invoice Generation" $RED
search_and_report "create.*request" "Request Creation" $RED

# 5. Legacy/Deprecated
echo -e "\n${PURPLE}⚠️ LEGACY AUDIT${NC}"
search_and_report "/ai-assistant" "AI Assistant Routes" $RED
search_and_report "/payment-links" "Payment Links Routes" $RED
search_and_report "/team-wallets" "Team Wallets Routes" $RED
search_and_report "/analytics" "Analytics Routes" $RED

# 6. Action Buttons
echo -e "\n${PURPLE}⚡ ACTION AUDIT${NC}"
search_and_report "SignedButton" "Signed Buttons" $BLUE
search_and_report "ActionButton" "Action Buttons" $BLUE
search_and_report "QuickAction" "Quick Actions" $BLUE

# Summary Statistics
echo -e "\n${PURPLE}📈 AUDIT SUMMARY${NC}"
echo "## Summary Statistics" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -d "web/src" ]; then
    cd web/src
    
    total_buttons=$(grep -r --include="*.tsx" --include="*.ts" "<Button" . 2>/dev/null | wc -l || echo "0")
    total_links=$(grep -r --include="*.tsx" --include="*.ts" "<Link" . 2>/dev/null | wc -l || echo "0")
    total_hardcoded=$(grep -r --include="*.tsx" --include="*.ts" "\"/" . 2>/dev/null | wc -l || echo "0")
    total_files=$(find . -name "*.tsx" -o -name "*.ts" | wc -l)
    
    echo "- **Total Button Components:** $total_buttons" >> ../../$REPORT_FILE
    echo "- **Total Link Components:** $total_links" >> ../../$REPORT_FILE  
    echo "- **Total Hardcoded Paths:** $total_hardcoded" >> ../../$REPORT_FILE
    echo "- **Total TypeScript Files:** $total_files" >> ../../$REPORT_FILE
    echo "" >> ../../$REPORT_FILE
    
    echo "  📊 Total Button Components: $total_buttons"
    echo "  🔗 Total Link Components: $total_links"
    echo "  ⚠️  Total Hardcoded Paths: $total_hardcoded"
    echo "  📁 Total TypeScript Files: $total_files"
    
    cd ../..
fi

# Recommendations
echo "## Recommendations" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "### High Priority" >> $REPORT_FILE
echo "1. Replace hardcoded paths with ROUTES constants" >> $REPORT_FILE
echo "2. Consolidate duplicate payment actions" >> $REPORT_FILE
echo "3. Migrate legacy routes to new structure" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "### Medium Priority" >> $REPORT_FILE
echo "4. Standardize button components" >> $REPORT_FILE
echo "5. Implement smart redirect system" >> $REPORT_FILE
echo "6. Add navigation analytics tracking" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo -e "\n${GREEN}✅ Audit complete! Report saved to: $REPORT_FILE${NC}"
echo -e "${BLUE}📖 View report: cat $REPORT_FILE${NC}"

# Optional: Open report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}💡 Tip: Run 'open $REPORT_FILE' to view in default editor${NC}"
fi 