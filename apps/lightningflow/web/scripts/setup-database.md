# Database Setup Guide

## 🗄️ Manual Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/xlrxpfptulcugoqjccyf
   - Navigate to **SQL Editor**

2. **Run the Migration**
   - Copy the entire contents of `web/sql/05_advanced_lightning_ai_features.sql`
   - Paste into the SQL Editor
   - Click **"Run"**

3. **Verify Tables Created**
   - Check the Tables tab in your dashboard
   - Or visit: http://localhost:3000/api/migrate to check status

## 🔧 Alternative: API Migration

If you prefer, you can try the API migration:

```bash
curl -X POST http://localhost:3000/api/migrate
```

**Note**: This may not work perfectly due to Supabase RPC limitations.

## ✅ Verification

After running the migration, check that all tables exist:

```bash
curl http://localhost:3000/api/migrate
```

You should see `"migrationComplete": true` in the response.

## 📋 Tables Created

The migration creates these tables:
- `tutorials` - Tutorial content and metadata
- `tutorial_embeddings` - Vector embeddings for search
- `loop_embeddings` - Error solution embeddings
- `onboarding_events` - User onboarding tracking
- `vector_feedback` - Search result feedback
- `user_interactions` - User activity tracking
- `channel_stats` - Lightning channel analytics
- `forward_events` - Payment routing events
- `ai_agents` - AI agent configurations
- `agent_executions` - AI agent execution logs

## 🔐 Row Level Security

The migration also sets up:
- RLS policies for multi-tenant isolation
- User authentication-based access control
- Secure vector search functions 