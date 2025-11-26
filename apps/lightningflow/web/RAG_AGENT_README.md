# 🧠 Lightning Platform RAG Agent

A Retrieval-Augmented Generation (RAG) agent that provides intelligent assistance for your Lightning AI Business Node Platform by reading Supabase schema, dashboard code, and user context.

## ✅ Features Implemented

### 🔍 **Data Sources**
- **Supabase Schema Introspection**: Reads table structures, columns, and relationships
- **Dashboard Code Analysis**: Analyzes React components and API routes  
- **User Context**: Accesses role, workspace, and plan information
- **Platform Configuration**: Understands Lightning node setup and status

### 🤖 **AI Capabilities**
- **Lightning Network Expertise**: Node management, channel liquidity, routing optimization
- **Business Intelligence**: Email campaigns, revenue optimization, customer engagement
- **Technical Support**: API troubleshooting, performance analysis, security recommendations
- **Platform Guidance**: Feature explanations, upgrade recommendations, best practices

## 🏗️ Architecture

### **API Endpoint**: `/api/agents/explain-dashboard-agent`

```typescript
POST /api/agents/explain-dashboard-agent
{
  "userId": "user-uuid",
  "question": "Why is my node offline?"
}

Response:
{
  "reply": "Your node appears offline because..."
}
```

### **Data Flow**
1. **Schema Fetching**: Uses `get_schema_doc()` function or fallback queries
2. **Code Analysis**: Reads dashboard and admin component files
3. **Context Gathering**: Fetches user role and workspace data
4. **AI Processing**: OpenAI GPT-4 with comprehensive system prompt
5. **Response Generation**: Contextual, actionable advice

## 📦 Implementation Files

```
web/
├── src/app/api/agents/explain-dashboard-agent/route.ts  # Main RAG agent
├── src/components/dashboard/DashboardAssistant.tsx     # Chat UI component
├── src/app/dashboard/ai-assistant/page.tsx             # User interface
├── src/app/admin/ai-assistant/page.tsx                 # Admin testing interface
└── sql/get_schema_doc.sql                              # Schema introspection function
```

## 🧪 Usage Examples

### **Lightning Node Management**
```
User: "Why is my node showing as offline?"
Agent: "Based on your workspace status, your node may be experiencing connectivity issues. Here are the troubleshooting steps: [specific guidance based on schema and dashboard code]"
```

### **Business Optimization**
```
User: "How can I improve my email campaign open rates?"
Agent: "Looking at your email_events table, I can see your current open rate is X%. Here are specific recommendations based on your plan level: [actionable advice]"
```

### **Feature Guidance**
```
User: "How do I set up AI agents?"
Agent: "Your current plan includes AI agent configuration. Navigate to /admin/ai-assistant to set up agents. Here's what each field means: [detailed explanation]"
```

## 🎯 Smart Features

### **Plan-Aware Responses**
- Recommends features available in user's current plan
- Explains upgrade requirements for premium features
- Provides alternative solutions for free tier users

### **Context-Sensitive Help**
- References actual database table structures
- Explains dashboard metrics based on real data
- Provides troubleshooting based on node status

### **Code-Informed Assistance**
- Understands UI layout and navigation
- Explains form fields and their purposes
- Guides users through actual workflows

## 🔧 Configuration

### **Environment Variables**
```env
OPENAI_API_KEY=sk-...                    # GPT-4 access
NEXT_PUBLIC_SUPABASE_URL=...            # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=...           # Service role for schema access
```

### **Supabase Setup**
1. Run the schema function:
```sql
-- Deploy sql/get_schema_doc.sql to your Supabase project
```

2. Ensure RLS policies allow agent access:
```sql
-- Service role needs read access to workspace_members and workspaces
```

## 🚀 Deployment

### **Development Testing**
1. Navigate to `/admin/ai-assistant` for testing interface
2. Try sample questions to verify schema access
3. Check console logs for debugging information

### **User Access**
1. Users access via `/dashboard/ai-assistant` 
2. Quick actions available from main dashboard
3. Context-aware help throughout platform

## 📊 Analytics & Monitoring

### **Usage Tracking**
- All queries logged with user ID and question
- Response quality can be monitored via console logs
- Performance metrics available through OpenAI usage dashboard

### **Error Handling**
- Graceful fallbacks if schema unavailable
- Default responses for missing context
- Comprehensive error logging for debugging

## 🔒 Security

### **Data Protection**
- Uses service role key for schema access only
- No sensitive data passed to OpenAI
- User context limited to workspace metadata

### **Access Control**
- Requires valid user ID for all requests
- Respects RLS policies for data access
- Admin features separated from user interface

## 🧩 Integration Points

### **Dashboard Integration**
```tsx
import DashboardAssistant from '@/components/dashboard/DashboardAssistant';

// Add to any page for instant help
<DashboardAssistant />
```

### **API Integration**
```typescript
const response = await fetch('/api/agents/explain-dashboard-agent', {
  method: 'POST',
  body: JSON.stringify({
    userId: session.user.id,
    question: userQuestion
  })
});
```

## 🚀 Future Enhancements

### **Planned Features**
- 📊 **Usage Analytics Dashboard**: Track popular questions and response quality
- 🔗 **Deep Linking**: Generate links to specific platform features
- 📝 **Action Buttons**: Execute simple tasks directly from chat
- 🎯 **Personalization**: Learn from user interactions for better responses

### **Advanced Capabilities**
- 🧠 **Memory Integration**: Remember conversation context
- 📈 **Predictive Assistance**: Proactive suggestions based on usage patterns
- 🔍 **Visual Analysis**: Interpret dashboard screenshots and charts
- 📱 **Multi-Modal**: Voice commands and responses

## 📝 Example Integration

Add the assistant to any dashboard page:

```tsx
// In any dashboard component
export default function YourDashboardPage() {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Add floating assistant */}
      <div className="fixed bottom-4 right-4">
        <DashboardAssistant />
      </div>
    </div>
  );
}
```

---

🚀 **Your Lightning Platform now has an intelligent assistant that understands your exact setup, data, and user context!**

Test it out at `/admin/ai-assistant` or integrate it into your dashboard workflows for instant, contextual help. 