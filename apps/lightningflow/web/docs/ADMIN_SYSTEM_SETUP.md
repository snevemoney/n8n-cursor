# 🔐 Lightning Platform Admin System Setup Guide

This guide walks you through setting up the complete admin system for your Lightning AI Business Node Platform.

## 🎯 **Overview**

The admin system provides:
- **User Management**: View, manage, and control all platform users
- **Bot Control Panel**: Integrate with the bot testing system we built
- **Activity Monitoring**: Track API usage, Lightning transactions, AI requests
- **Real-time Dashboards**: Live system health and performance metrics
- **Security Controls**: Role-based access with proper RLS policies

## 🏗️ **Architecture**

```
/admin/              ← Admin routes (protected by middleware)
├─ layout.tsx        ← Admin navigation and layout
├─ page.tsx          ← Dashboard overview
├─ users/page.tsx    ← User management interface
├─ bots/page.tsx     ← Bot control panel
├─ logs/page.tsx     ← Activity logs (coming next)
└─ lightning/page.tsx ← Lightning monitoring (coming next)

/api/admin/          ← Admin API endpoints
└─ bot-test/route.ts ← Bot testing API with streaming

/sql/admin-schema.sql ← Complete database schema
```

## 🚀 **Step 1: Database Setup**

### **1.1 Apply Database Schema**

Run the admin schema in your Supabase SQL editor:

```bash
# Copy and run the contents of web/sql/admin-schema.sql
```

This creates:
- Enhanced `profiles` table with admin/bot flags
- `admin_event_log` for tracking admin actions
- `bot_test_results` for storing test results
- `api_usage_logs`, `lightning_usage_logs`, `ai_usage_logs`
- RLS policies for security
- Helper functions and views

### **1.2 Create Your First Admin User**

In Supabase SQL editor:

```sql
-- Replace with your email
SELECT make_user_admin('your-email@example.com');
```

### **1.3 Install Required Dependencies**

```bash
cd web
npm install @supabase/auth-helpers-nextjs
```

## 🔧 **Step 2: Environment Configuration**

### **2.1 Update Environment Variables**

Add to your `.env.local`:

```bash
# Existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin system
BASE_URL=http://localhost:3000  # Update for production
NODE_ENV=development
```

### **2.2 Update Supabase RLS Policies**

The schema automatically creates proper RLS policies, but verify in Supabase Dashboard:

1. Go to Authentication > Policies
2. Verify `profiles` table has admin policies
3. Check that admin tables are properly protected

## 🛡️ **Step 3: Security Setup**

### **3.1 Middleware Configuration**

The middleware is already set up to protect `/admin/*` routes. It:
- Checks for authenticated users
- Verifies admin status from `profiles.is_admin`
- Redirects unauthorized users

### **3.2 Admin Access Verification**

Test admin access:

1. Sign up/login with your admin email
2. Visit `http://localhost:3000/admin`
3. Should see the admin dashboard
4. Non-admin users should be redirected

## 🎮 **Step 4: Bot Integration Setup**

### **4.1 Bot Testing Integration**

The admin bot panel integrates with our bot testing system:

```bash
# Test bot integration
cd web
npm run bot:quick  # Should work from CLI
```

### **4.2 Admin Bot Control**

In the admin panel (`/admin/bots`):
1. Configure bot test parameters
2. Start tests with live progress updates
3. View real-time logs and metrics
4. Monitor test history

## 📊 **Step 5: Monitoring Setup**

### **5.1 Activity Logging**

The system automatically tracks:
- API requests (`api_usage_logs`)
- Lightning transactions (`lightning_usage_logs`)  
- AI usage (`ai_usage_logs`)
- Admin events (`admin_event_log`)

### **5.2 Dashboard Metrics**

The dashboard shows:
- Total users vs bot users
- 24-hour activity metrics
- System health status
- Recent activity feed

## 🔌 **Step 6: API Integration**

### **6.1 Update Your API Routes**

Add logging to your existing API routes:

```typescript
// Example: Add to /api/lightning/invoice/route.ts
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  // ... existing code ...
  
  // Log Lightning usage
  const { data: logResult } = await supabase
    .from('lightning_usage_logs')
    .insert({
      user_id: user.id,
      action_type: 'invoice_created',
      amount_sats: amount,
      invoice_id: invoice.id,
      success: true
    });
  
  // ... rest of code ...
}
```

### **6.2 Update AI API Routes**

Add AI usage logging:

```typescript
// Example: Add to /api/proxy/openai/route.ts
export async function POST(request: NextRequest) {
  // ... existing OpenAI call ...
  
  // Log AI usage
  await supabase
    .from('ai_usage_logs')
    .insert({
      user_id: user.id,
      model: 'gpt-4',
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      cost_usd: calculateCost(usage),
      request_type: 'chat',
      success: true
    });
}
```

## 🧪 **Step 7: Testing the Admin System**

### **7.1 Basic Admin Flow Test**

1. **Login as admin**
2. **Visit `/admin`** - Should see dashboard
3. **Check user management** - `/admin/users` should list users
4. **Test bot control** - `/admin/bots` should allow running tests
5. **Verify access control** - Non-admin users should be blocked

### **7.2 Bot Testing Integration**

1. **Run quick test**: In `/admin/bots`, click "Quick Test"
2. **Monitor progress**: Should see live logs and metrics
3. **Check user list**: Bot users should appear in `/admin/users`
4. **Verify isolation**: Bot users marked with 🤖 icon

### **7.3 Data Flow Verification**

1. **Generate activity**: Make API calls, create invoices
2. **Check dashboard**: Should show updated metrics
3. **View logs**: Activity should appear in admin dashboard
4. **Test real-time**: Dashboard should update automatically

## 🚀 **Step 8: Production Deployment**

### **8.1 Environment Updates**

```bash
# Production .env
BASE_URL=https://your-domain.com
NODE_ENV=production

# Ensure service role key is set
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### **8.2 Security Hardening**

1. **Review RLS policies** in production Supabase
2. **Limit admin users** to trusted personnel only
3. **Monitor admin activity** through event logs
4. **Set up alerts** for suspicious admin actions

### **8.3 Performance Optimization**

1. **Database indexes** are already included in schema
2. **Log cleanup** - Set up periodic cleanup job:

```sql
-- Run monthly to clean old logs
SELECT cleanup_old_logs(90);
```

## 🔍 **Step 9: Advanced Features**

### **9.1 Custom Admin Middleware**

Extend middleware for additional checks:

```typescript
// src/middleware.ts - Add custom admin checks
if (req.nextUrl.pathname.startsWith('/admin/bots')) {
  // Additional checks for bot management
  if (profile.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
}
```

### **9.2 API Rate Limiting Integration**

Track and enforce rate limits:

```typescript
// Add to API routes
const recentRequests = await supabase
  .from('api_usage_logs')
  .select('count')
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 60000).toISOString());

if (recentRequests.data.length > 100) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### **9.3 Real-time Dashboard Updates**

Add Supabase realtime subscriptions:

```typescript
// In admin dashboard components
useEffect(() => {
  const subscription = supabase
    .channel('admin_dashboard')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'api_usage_logs' 
    }, () => {
      // Refresh dashboard metrics
      loadDashboardData();
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## 🛠️ **Step 10: Maintenance & Operations**

### **10.1 Regular Maintenance**

**Weekly:**
- Review admin activity logs
- Check system performance metrics
- Clean up old bot users if needed

**Monthly:**
- Run log cleanup function
- Review user access permissions
- Update admin documentation

### **10.2 Monitoring Checklist**

- [ ] Admin login activity normal
- [ ] Bot tests completing successfully  
- [ ] API usage within expected ranges
- [ ] Lightning transactions processing
- [ ] AI usage costs under control
- [ ] Database performance good

### **10.3 Troubleshooting**

**Admin can't access dashboard:**
1. Check `profiles.is_admin` flag
2. Verify middleware is running
3. Check browser console for errors

**Bot tests failing:**
1. Verify bot testing dependencies installed
2. Check server is running on BASE_URL
3. Review admin API logs

**Missing activity data:**
1. Verify logging is added to API routes
2. Check RLS policies allow data access
3. Confirm user authentication working

## 🎉 **Congratulations!**

You now have a complete admin system that:

✅ **Manages all users** including bot users from testing  
✅ **Controls bot simulations** with live monitoring  
✅ **Tracks all platform activity** with detailed logging  
✅ **Provides real-time dashboards** for system health  
✅ **Enforces security** with proper access controls  
✅ **Integrates seamlessly** with your existing Lightning platform  

## 🔗 **Next Steps**

1. **Add more admin pages** (Lightning monitoring, AI usage details)
2. **Set up alerts** for critical system events
3. **Create admin reports** for business insights
4. **Implement audit trails** for compliance
5. **Add bulk user operations** for scaling

Your Lightning platform now has enterprise-grade admin capabilities! 🚀 