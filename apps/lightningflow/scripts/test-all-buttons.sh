#!/bin/bash

# Lightning AI Platform - Comprehensive Button Testing Script
# Tests all buttons, links, and interactive elements for proper functionality

echo "🧪 Lightning AI Platform - Button Validation Suite"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Create test reports directory
mkdir -p audit-reports/button-tests
REPORT_FILE="audit-reports/button-tests/button-test-$(date +%Y%m%d-%H%M%S).md"

echo "# Button Validation Test Report" > $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to test button functionality
test_button_functionality() {
    local component_file="$1"
    local description="$2"
    
    echo -e "\n${BLUE}🔍 Testing: ${description}${NC}"
    echo "## Testing: $description" >> $REPORT_FILE
    echo "**File:** \`$component_file\`" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    if [ -f "web/src/$component_file" ]; then
        cd web/src
        
        # Extract button definitions
        buttons=$(grep -n -A 3 -B 1 "<Button\|onClick=" "$component_file" 2>/dev/null || true)
        
        if [ -n "$buttons" ]; then
            echo "  📊 Found button definitions:"
            echo "\`\`\`typescript" >> ../../$REPORT_FILE
            echo "$buttons" >> ../../$REPORT_FILE
            echo "\`\`\`" >> ../../$REPORT_FILE
            echo "" >> ../../$REPORT_FILE
            
            # Check for hardcoded paths
            hardcoded=$(grep -n "router\.push\|href=" "$component_file" 2>/dev/null || true)
            if [ -n "$hardcoded" ]; then
                echo "  ⚠️  Hardcoded navigation found:"
                echo "**⚠️ Hardcoded Navigation:**" >> ../../$REPORT_FILE
                echo "\`\`\`typescript" >> ../../$REPORT_FILE
                echo "$hardcoded" >> ../../$REPORT_FILE
                echo "\`\`\`" >> ../../$REPORT_FILE
                echo "" >> ../../$REPORT_FILE
            fi
            
            # Check for smart redirect usage
            smart_redirect=$(grep -n "useSmartRedirect\|quickActions\|goTo" "$component_file" 2>/dev/null || true)
            if [ -n "$smart_redirect" ]; then
                echo "  ✅ Smart redirect system detected"
                echo "**✅ Smart Redirect Usage:**" >> ../../$REPORT_FILE
                echo "\`\`\`typescript" >> ../../$REPORT_FILE
                echo "$smart_redirect" >> ../../$REPORT_FILE
                echo "\`\`\`" >> ../../$REPORT_FILE
                echo "" >> ../../$REPORT_FILE
            fi
            
        else
            echo "  ℹ️  No buttons found in this file"
            echo "- No buttons found" >> ../../$REPORT_FILE
            echo "" >> ../../$REPORT_FILE
        fi
        
        cd ../..
    else
        echo "  ❌ File not found: $component_file"
        echo "- **ERROR:** File not found" >> $REPORT_FILE
        echo "" >> $REPORT_FILE
    fi
}

# Test critical components
echo -e "\n${PURPLE}🎯 CRITICAL COMPONENT TESTING${NC}"

test_button_functionality "components/dashboard/quick-actions-card.tsx" "Dashboard Quick Actions"
test_button_functionality "components/layout/sidebar.tsx" "Main Navigation Sidebar"
test_button_functionality "components/layout/topbar-actions.tsx" "Top Bar Actions"
test_button_functionality "components/topbar-actions.tsx" "Legacy Top Bar Actions"
test_button_functionality "app/dashboard/page.tsx" "Dashboard Page"
test_button_functionality "app/send/page.tsx" "Send Payment Page"
test_button_functionality "app/receive/page.tsx" "Receive Payment Page"
test_button_functionality "app/transactions/page.tsx" "Transactions Page"
test_button_functionality "app/trust-center/page.tsx" "Trust Center Page"

# Test for duplicate actions
echo -e "\n${PURPLE}🔄 DUPLICATE ACTION DETECTION${NC}"
echo "## Duplicate Action Analysis" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -d "web/src" ]; then
    cd web/src
    
    # Find send payment actions
    send_actions=$(grep -r -n "send.*payment\|quick.*pay" --include="*.tsx" --include="*.ts" . 2>/dev/null || true)
    if [ -n "$send_actions" ]; then
        echo "  🔍 Send Payment Actions Found:"
        echo "**Send Payment Actions:**" >> ../../$REPORT_FILE
        echo "\`\`\`" >> ../../$REPORT_FILE
        echo "$send_actions" >> ../../$REPORT_FILE
        echo "\`\`\`" >> ../../$REPORT_FILE
        echo "" >> ../../$REPORT_FILE
    fi
    
    # Find invoice creation actions
    invoice_actions=$(grep -r -n "create.*invoice\|generate.*invoice" --include="*.tsx" --include="*.ts" . 2>/dev/null || true)
    if [ -n "$invoice_actions" ]; then
        echo "  🔍 Invoice Creation Actions Found:"
        echo "**Invoice Creation Actions:**" >> ../../$REPORT_FILE
        echo "\`\`\`" >> ../../$REPORT_FILE
        echo "$invoice_actions" >> ../../$REPORT_FILE
        echo "\`\`\`" >> ../../$REPORT_FILE
        echo "" >> ../../$REPORT_FILE
    fi
    
    cd ../..
fi

# Route validation
echo -e "\n${PURPLE}🛣️ ROUTE VALIDATION${NC}"
echo "## Route Validation" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -f "web/src/lib/routes.ts" ]; then
    echo "  ✅ Unified routes file exists"
    echo "- ✅ Unified routes file exists" >> $REPORT_FILE
    
    # Check if components are using the routes
    cd web/src
    routes_usage=$(grep -r -n "ROUTES\." --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l || echo "0")
    echo "  📊 Components using ROUTES constant: $routes_usage"
    echo "- Components using ROUTES constant: $routes_usage" >> ../../$REPORT_FILE
    cd ../..
else
    echo "  ❌ Unified routes file missing"
    echo "- ❌ Unified routes file missing" >> $REPORT_FILE
fi

# Smart redirect usage analysis
echo -e "\n${PURPLE}🧠 SMART REDIRECT ANALYSIS${NC}"
echo "## Smart Redirect Analysis" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -f "web/src/hooks/useSmartRedirect.ts" ]; then
    echo "  ✅ Smart redirect hook exists"
    echo "- ✅ Smart redirect hook exists" >> $REPORT_FILE
    
    cd web/src
    smart_usage=$(grep -r -n "useSmartRedirect" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l || echo "0")
    echo "  📊 Components using smart redirect: $smart_usage"
    echo "- Components using smart redirect: $smart_usage" >> $REPORT_FILE
    cd ../..
else
    echo "  ❌ Smart redirect hook missing"
    echo "- ❌ Smart redirect hook missing" >> $REPORT_FILE
fi

# Generate summary statistics
echo -e "\n${PURPLE}📈 SUMMARY STATISTICS${NC}"
echo "## Summary Statistics" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -d "web/src" ]; then
    cd web/src
    
    total_buttons=$(grep -r --include="*.tsx" --include="*.ts" "<Button" . 2>/dev/null | wc -l || echo "0")
    total_onclick=$(grep -r --include="*.tsx" --include="*.ts" "onClick=" . 2>/dev/null | wc -l || echo "0")
    total_hardcoded=$(grep -r --include="*.tsx" --include="*.ts" "router\.push\|href=\"/" . 2>/dev/null | wc -l || echo "0")
    total_smart=$(grep -r --include="*.tsx" --include="*.ts" "useSmartRedirect\|quickActions" . 2>/dev/null | wc -l || echo "0")
    
    echo "- **Total Button Components:** $total_buttons" >> ../../$REPORT_FILE
    echo "- **Total Click Handlers:** $total_onclick" >> ../../$REPORT_FILE
    echo "- **Hardcoded Navigation:** $total_hardcoded" >> ../../$REPORT_FILE
    echo "- **Smart Redirect Usage:** $total_smart" >> ../../$REPORT_FILE
    echo "" >> ../../$REPORT_FILE
    
    echo "  📊 Total Button Components: $total_buttons"
    echo "  🖱️  Total Click Handlers: $total_onclick"
    echo "  ⚠️  Hardcoded Navigation: $total_hardcoded"
    echo "  🧠 Smart Redirect Usage: $total_smart"
    
    # Calculate improvement percentage
    if [ "$total_hardcoded" -gt 0 ] && [ "$total_smart" -gt 0 ]; then
        improvement=$((total_smart * 100 / (total_hardcoded + total_smart)))
        echo "  📈 Smart Navigation Adoption: ${improvement}%"
        echo "- **Smart Navigation Adoption:** ${improvement}%" >> ../../$REPORT_FILE
    fi
    
    cd ../..
fi

# Recommendations
echo "## Recommendations" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "### Immediate Actions" >> $REPORT_FILE
echo "1. Replace all hardcoded \`router.push()\` calls with smart redirect" >> $REPORT_FILE
echo "2. Consolidate duplicate payment actions into unified quick actions" >> $REPORT_FILE
echo "3. Implement button registry for consistent styling and behavior" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "### Next Steps" >> $REPORT_FILE
echo "4. Add E2E tests for all critical button interactions" >> $REPORT_FILE
echo "5. Implement analytics tracking for button usage" >> $REPORT_FILE
echo "6. Create button component library with standardized variants" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo -e "\n${GREEN}✅ Button validation complete! Report saved to: $REPORT_FILE${NC}"

# Optional: Run TypeScript check
if command -v npx &> /dev/null; then
    echo -e "\n${BLUE}🔧 Running TypeScript validation...${NC}"
    cd web
    if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
        echo -e "${GREEN}✅ TypeScript validation passed${NC}"
        echo "- ✅ TypeScript validation passed" >> ../$REPORT_FILE
    else
        echo -e "${RED}❌ TypeScript validation failed${NC}"
        echo "- ❌ TypeScript validation failed" >> ../$REPORT_FILE
    fi
    cd ..
fi

echo -e "\n${YELLOW}💡 Next: Run './scripts/validate-routes.sh' to test navigation flows${NC}" 