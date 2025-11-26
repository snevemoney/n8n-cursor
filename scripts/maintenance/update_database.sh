#!/bin/bash

# =====================================================
# Database Update Script for Multi-Tenant SaaS
# Run this script to apply database updates
# =====================================================

echo "🚀 Starting Database Update for Multi-Tenant SaaS..."

# Database connection details (update these for your setup)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="n8n_db"
DB_USER="n8n_user"
DB_PASSWORD="n8n_password"

# Alternative: Use environment variables
# DB_HOST="${DB_HOST:-localhost}"
# DB_PORT="${DB_PORT:-5432}"
# DB_NAME="${DB_NAME:-n8n_db}"
# DB_USER="${DB_USER:-n8n_user}"
# DB_PASSWORD="${DB_PASSWORD:-your_password}"

echo "📊 Connecting to database: $DB_NAME on $DB_HOST:$DB_PORT"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo "❌ Error: Cannot connect to database. Please check your credentials."
    echo "💡 Make sure to update the database connection details in this script."
    exit 1
fi

echo "✅ Database connection successful!"

# Apply the database updates
echo "📝 Applying database updates..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "apply_database_updates.sql"; then
    echo "✅ Database updates applied successfully!"
    echo ""
    echo "🎉 Your database now includes:"
    echo "   • knowledge_base_files table"
    echo "   • tenant_availability table"
    echo "   • website_analytics table"
    echo "   • sync_events table"
    echo "   • All necessary functions and indexes"
    echo "   • Sample data for ACME_INC tenant"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Update your n8n workflow to use these new tables"
    echo "   2. Test the new functionality"
    echo "   3. Configure your frontend to use the new endpoints"
else
    echo "❌ Error: Failed to apply database updates."
    echo "💡 Check the error messages above and fix any issues."
    exit 1
fi

echo "🏁 Database update completed!"
