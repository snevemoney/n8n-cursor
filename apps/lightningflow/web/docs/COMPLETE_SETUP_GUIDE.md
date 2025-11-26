# 🚀 Complete Lightning AI SaaS Setup Guide

This guide will walk you through setting up the complete Lightning AI Business Node Platform with enterprise-grade security, multi-tenant workspaces, and Bitcoin Lightning integration.

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API account
- LNbits instance (or access to legend.lnbits.com)
- Git

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Lightning AI SaaS Platform               │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  Backend APIs  │  Database (Supabase) │
│  - Workspace UI      │  - Secure Proxy │  - Multi-tenant RLS │
│  - Role-based Access │  - Usage Quotas │  - Workspace Schema │
│  - Real-time Updates │  - LN Integration│  - Audit Logging   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Step 1: Database Setup

### 1.1 Run the Complete Schema

In your Supabase SQL editor, execute the complete schema:

```sql
-- Copy and paste the entire content from:
-- web/sql/complete-workspace-schema.sql
```

This creates:
- ✅ Multi-tenant workspace tables
- ✅ Row Level Security policies
- ✅ Usage tracking and quotas
- ✅ Invitation system
- ✅ Admin audit logging

### 1.2 Verify Tables Created

Check that these tables exist:
- `workspaces`
- `profiles` (enhanced)
- `workspace_invites`
- `workspace_usage`
- `invoices`
- `ai_assistants`
- `usage_logs`
- `bot_test_results`
- `admin_event_log`

## 🔐 Step 2: Security Configuration

### 2.1 Environment Variables

Copy `web/env.example` to `web/.env.local` and configure:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Required - OpenAI
OPENAI_KEY_DEFAULT=sk-your-openai-api-key

# Required - LNbits
LNBITS_URL=https://legend.lnbits.com
LNBITS_KEY_DEFAULT=your-lnbits-api-key

# Required - Admin Access
NEXT_PUBLIC_ADMIN_UID=your-user-uuid-from-supabase
ADMIN_BYPASS=true  # Only for development

# Required - App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.2 Get Your Admin UUID

1. Sign up through your app at `/login`
2. Go to Supabase Dashboard → Authentication → Users
3. Copy your User UUID
4. Update `NEXT_PUBLIC_ADMIN_UID` in `.env.local`
5. Set `is_admin = true` in your profile record

## 🚀 Step 3: Installation & Startup

### 3.1 Install Dependencies

```bash
cd web
npm install
```

### 3.2 Start Development Server

```bash
npm run dev
```

Your app should be running at `http://localhost:3000`

## 🧪 Step 4: Testing the System

### 4.1 Test Authentication Flow

1. Visit `http://localhost:3000`
2. Should redirect to `/login`
3. Sign up with email/password
4. Should redirect to `/dashboard`

### 4.2 Test Admin Access

1. Visit `http://localhost:3000/admin`
2. Should see admin dashboard (if UUID configured correctly)
3. Test bot management and user overview

### 4.3 Test Workspace Features

1. **Usage Quota**: Check `/api/quota/check`
2. **OpenAI Proxy**: Test `/api/proxy/openai`
3. **LNbits Proxy**: Test `/api/proxy/lnbits`
4. **Invitations**: Try inviting a user

## 🏢 Step 5: Workspace Management

### 5.1 Create Your First Workspace

```sql
-- In Supabase SQL editor
INSERT INTO workspaces (name, slug, description) 
VALUES ('My Business Node', 'my-node', 'My Lightning AI business');

-- Update your profile to join the workspace
UPDATE profiles 
SET workspace_id = (SELECT id FROM workspaces WHERE slug = 'my-node'),
    role = 'owner'
WHERE id = 'your-user-uuid';
```

### 5.2 Test Workspace Features

- **Invite Members**: Use the invite manager component
- **Role Management**: Test viewer/editor/owner permissions
- **Usage Tracking**: Monitor AI token consumption
- **Lightning Integration**: Test payment creation

## ⚡ Step 6: Lightning Integration

### 6.1 Configure LNbits

1. Get LNbits API key from your instance
2. Add to environment variables
3. Test wallet connection:

```bash
curl -X GET "http://localhost:3000/api/proxy/lnbits?path=api/v1/wallet" \
  -H "Authorization: Bearer your-session-token"
```

### 6.2 Test Lightning Features

- **Create Invoice**: Test invoice generation
- **Check Balance**: Verify wallet balance
- **Payment History**: View transaction logs

## 🤖 Step 7: AI Integration

### 7.1 Configure OpenAI

1. Get OpenAI API key
2. Test AI proxy:

```bash
curl -X POST "http://localhost:3000/api/proxy/openai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-session-token" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 7.2 Test Usage Tracking

- Check quota limits
- Monitor token consumption
- Test quota enforcement

## 🔒 Step 8: Production Deployment

### 8.1 Environment Configuration

```bash
# Production settings
NODE_ENV=production
ADMIN_BYPASS=false
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Security
CONTRACT_SECRET=generate-secure-random-string
```

### 8.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 8.3 Configure Domain & SSL

1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. SSL certificates are automatic

## 📊 Step 9: Monitoring & Maintenance

### 9.1 Database Monitoring

- Monitor RLS policy performance
- Check usage log growth
- Optimize indexes as needed

### 9.2 Usage Analytics

- Track workspace growth
- Monitor API usage patterns
- Set up alerts for quota limits

### 9.3 Security Auditing

- Review admin event logs
- Monitor failed authentication attempts
- Regular security updates

## 🚨 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**2. Supabase connection issues**
- Verify environment variables
- Check Supabase project status
- Confirm RLS policies are active

**3. Admin access denied**
- Verify `NEXT_PUBLIC_ADMIN_UID` matches your user UUID
- Check `is_admin = true` in profiles table
- Ensure `ADMIN_BYPASS=true` for development

**4. OpenAI/LNbits proxy errors**
- Verify API keys are correct
- Check network connectivity
- Review error logs in browser console

### Debug Mode

Enable debug logging:

```bash
DEBUG=true npm run dev
```

## 🎯 Next Steps

### Advanced Features

1. **Multi-Workspace Support**: Allow users to belong to multiple workspaces
2. **Subdomain Routing**: `workspace.yourdomain.com`
3. **Advanced Analytics**: Revenue tracking, user behavior
4. **Mobile App**: React Native companion app
5. **API Marketplace**: Let users sell AI services

### Scaling Considerations

1. **Database Optimization**: Partition large tables
2. **Caching Layer**: Redis for session management
3. **CDN Integration**: CloudFlare for global performance
4. **Background Jobs**: BullMQ for async processing
5. **Monitoring**: DataDog or New Relic integration

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs for database issues
4. Verify all environment variables are set correctly

## 🎉 Congratulations!

You now have a production-ready Lightning AI SaaS platform with:

- ✅ Enterprise-grade security
- ✅ Multi-tenant workspaces
- ✅ Bitcoin Lightning integration
- ✅ AI proxy with usage tracking
- ✅ Role-based access control
- ✅ Real-time collaboration
- ✅ Audit logging
- ✅ Scalable architecture

Your platform is ready to onboard customers and generate revenue! 🚀 