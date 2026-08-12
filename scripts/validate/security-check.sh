#!/usr/bin/env bash
set -euo pipefail

# Security Check - Validates security best practices
# Usage: ./scripts/validate/security-check.sh

echo "🔍 Running security validation..."

VIOLATIONS=()

# Check for hardcoded secrets
echo "🔐 Checking for hardcoded secrets..."
SECRET_PATTERNS=(
    "password.*=.*['\"][^'\"]{8,}['\"]"
    "secret.*=.*['\"][^'\"]{8,}['\"]"
    "key.*=.*['\"][^'\"]{8,}['\"]"
    "token.*=.*['\"][^'\"]{8,}['\"]"
    "api_key.*=.*['\"][^'\"]{8,}['\"]"
    "private_key.*=.*['\"][^'\"]{8,}['\"]"
    "BEGIN.*PRIVATE.*KEY"
    "BEGIN.*RSA.*PRIVATE.*KEY"
    "BEGIN.*DSA.*PRIVATE.*KEY"
    "BEGIN.*EC.*PRIVATE.*KEY"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" \
        --exclude-dir=.git \
        --exclude-dir=node_modules \
        --exclude-dir=.github \
        --exclude-dir=__tests__ \
        --exclude-dir=test \
        --exclude-dir=tests \
        --exclude="*.example" \
        --exclude="*.template" \
        --exclude="*.sh" \
        --exclude="*.yml" \
        --exclude="*.yaml" \
        --exclude="*.md" \
        --exclude="*.test.*" \
        --exclude="*.spec.*" \
        --exclude="*.json" \
        --exclude=".env.*" \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        apps/ packages/ 2>/dev/null | grep -v "process\.env\|import\|require\|type \|interface \|selector\|querySelector\|data-test\|Label\|placeholder\|htmlFor\|confirm\|show\|hide\|className\|useState\|validation\|error\|\.d\.ts\|header" >/dev/null 2>&1; then
        echo "❌ Potential hardcoded secret found:"
        grep -r -i -E "$pattern" \
            --exclude-dir=.git \
            --exclude-dir=node_modules \
            --exclude-dir=.github \
            --exclude-dir=__tests__ \
            --exclude-dir=test \
            --exclude-dir=tests \
            --exclude="*.example" \
            --exclude="*.template" \
            --exclude="*.sh" \
            --exclude="*.yml" \
            --exclude="*.yaml" \
            --exclude="*.md" \
            --exclude="*.test.*" \
            --exclude="*.spec.*" \
            --exclude="*.json" \
            --exclude=".env.*" \
            --include="*.ts" \
            --include="*.tsx" \
            --include="*.js" \
            --include="*.jsx" \
            apps/ packages/ 2>/dev/null | grep -v "process\.env\|import\|require\|type \|interface \|selector\|querySelector\|data-test\|Label\|placeholder\|htmlFor\|confirm\|show\|hide\|className\|useState\|validation\|error\|\.d\.ts\|header" | head -5
        VIOLATIONS+=("hardcoded_secrets")
    fi
done

# Check for .env files with real secrets (not .example)
echo "📄 Checking for .env files with real secrets..."
ENV_FILES=$(find . -name ".env" -not -name "*.example" -not -name "*.template" 2>/dev/null || echo "")
if [ -n "$ENV_FILES" ]; then
    echo "❌ Found .env files (should be .env.example):"
    echo "$ENV_FILES"
    VIOLATIONS+=("real_env_files")
fi

# Check Dockerfile security
echo "🐳 Checking Dockerfile security..."
DOCKERFILES=$(find . -name "Dockerfile*" -type f 2>/dev/null || echo "")
for dockerfile in $DOCKERFILES; do
    echo "📄 Checking $dockerfile"
    
    # Check for running as root
    if grep -q "USER root" "$dockerfile" && ! grep -q "USER [0-9]" "$dockerfile"; then
        echo "❌ $dockerfile runs as root"
        VIOLATIONS+=("$dockerfile:runs_as_root")
    fi
    
    # Check for latest tags
    if grep -q "FROM.*:latest" "$dockerfile"; then
        echo "❌ $dockerfile uses :latest tag"
        VIOLATIONS+=("$dockerfile:uses_latest_tag")
    fi
    
    # Check for unnecessary packages
    if grep -q "apt-get install.*curl.*wget.*vim" "$dockerfile"; then
        echo "❌ $dockerfile installs unnecessary packages"
        VIOLATIONS+=("$dockerfile:unnecessary_packages")
    fi
done

# Check for SQL injection vulnerabilities
echo "🗄️ Checking for SQL injection vulnerabilities..."
SQL_FILES=$(find . -name "*.sql" -type f 2>/dev/null || echo "")
for sql_file in $SQL_FILES; do
    echo "📄 Checking $sql_file"
    
    # Check for string concatenation in SQL
    if grep -q "SELECT.*\\+" "$sql_file" || grep -q "INSERT.*\\+" "$sql_file" || grep -q "UPDATE.*\\+" "$sql_file"; then
        echo "❌ $sql_file may have SQL injection vulnerabilities"
        VIOLATIONS+=("$sql_file:sql_injection_risk")
    fi
done

# Check for input validation
echo "🔍 Checking for input validation..."
API_FILES=$(find . -name "*.ts" -o -name "*.js" | grep -E "(api|route|handler)" | head -10)
for api_file in $API_FILES; do
    if [ -f "$api_file" ]; then
        echo "📄 Checking $api_file"
        
        # Check for missing input validation
        if grep -q "req\.body\|req\.query\|req\.params" "$api_file" && ! grep -q "validate\|sanitize\|escape" "$api_file"; then
            echo "❌ $api_file may lack input validation"
            VIOLATIONS+=("$api_file:missing_input_validation")
        fi
    fi
done

# Check for HTTPS enforcement
echo "🔒 Checking for HTTPS enforcement..."
COMPOSE_FILES=$(find infra/docker -name "docker-compose*.yml" -type f 2>/dev/null || echo "")
for compose_file in $COMPOSE_FILES; do
    echo "📄 Checking $compose_file"
    
    # Check for HTTP-only services in production
    if [[ "$compose_file" == *"prod"* ]]; then
        if grep -q "http://" "$compose_file"; then
            echo "❌ $compose_file uses HTTP in production"
            VIOLATIONS+=("$compose_file:http_in_production")
        fi
    fi
done

# Check for proper error handling
echo "⚠️ Checking for proper error handling..."
ERROR_FILES=$(find . -name "*.ts" -o -name "*.js" | grep -E "(api|route|handler)" | head -10)
for error_file in $ERROR_FILES; do
    if [ -f "$error_file" ]; then
        echo "📄 Checking $error_file"
        
        # Check for missing try-catch blocks
        if grep -q "async.*=>" "$error_file" && ! grep -q "try\|catch" "$error_file"; then
            echo "❌ $error_file may lack error handling"
            VIOLATIONS+=("$error_file:missing_error_handling")
        fi
    fi
done

# Check for proper logging
echo "📝 Checking for proper logging..."
LOG_FILES=$(find . -name "*.ts" -o -name "*.js" | grep -E "(api|route|handler)" | head -10)
for log_file in $LOG_FILES; do
    if [ -f "$log_file" ]; then
        echo "📄 Checking $log_file"
        
        # Check for console.log in production code
        if grep -q "console\.log" "$log_file"; then
            echo "❌ $log_file uses console.log (should use proper logger)"
            VIOLATIONS+=("$log_file:console_log_usage")
        fi
    fi
done

# Report results
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "❌ SECURITY VIOLATIONS DETECTED:"
    for violation in "${VIOLATIONS[@]}"; do
        echo "  - $violation"
    done
    echo ""
    echo "🔧 FIX: Remove hardcoded secrets, use environment variables"
    echo "🔧 FIX: Use .env.example files, not .env files"
    echo "🔧 FIX: Add input validation and sanitization"
    echo "🔧 FIX: Use proper error handling and logging"
    echo "🔧 FIX: Run containers as non-root users"
    echo "🔧 FIX: Use specific image tags, not :latest"
    exit 1
fi

echo "✅ All security checks passed"
exit 0
