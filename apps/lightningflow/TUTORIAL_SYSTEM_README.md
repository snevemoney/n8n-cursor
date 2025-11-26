# Lightning AI Tutorial System

## Overview

This implementation adds three modular, scalable features to the Lightning onboarding and simulation suite:

1. **Interactive Tutorial Player** with video + tooltip overlay
2. **Vector Response Feedback System** with "Did this help?" voting
3. **Smart Loop Error → Tutorial Linking** with AI-powered recommendations

## 🎯 Features Implemented

### 1. Tutorial Player with Interactive Tooltips

**Location**: `/learn/lightning/[tutorialId]`

**Components**:
- `TutorialPlayer` (`web/src/components/ui/tutorial-player.tsx`)
- `Tooltip` (`web/src/components/ui/tooltip.tsx`)

**Features**:
- Embeds videos via `react-player` with full YouTube support
- Context-aware tooltips that appear at specific timestamps
- Interactive overlay buttons with hover effects
- Timeline navigation with clickable timestamps
- Feedback integration for each tooltip
- Responsive design with 16:9 aspect ratio

**Example Usage**:
```tsx
<TutorialPlayer
  videoUrl="https://www.youtube.com/watch?v=rrr_zPmEiME"
  tooltips={[
    {
      id: 'channel-concept',
      x: 25, y: 30,
      timestamp: 45,
      title: 'Payment Channels',
      text: 'Payment channels are the fundamental building blocks...',
      embeddingId: 'emb_channel_basics_1',
      source: '/docs/channels/basics'
    }
  ]}
  onProgress={(progress) => console.log(progress)}
/>
```

### 2. Feedback System for Vector Responses

**API Endpoint**: `/api/track/feedback`

**Components**:
- `FeedbackButtons` (`web/src/components/ui/feedback-buttons.tsx`)

**Database Tables**:
- `feedback` - Stores user feedback with context
- `embedding_scores` - Aggregated quality scores
- `tutorial_progress` - User progress tracking

**Features**:
- Thumbs up/down voting on any content with embedding IDs
- Anonymous and authenticated feedback support
- Automatic quality score calculation
- Context tracking (page URL, user agent, tutorial ID)
- Multiple display variants (default, minimal, inline)
- Error handling and retry functionality

**Example Usage**:
```tsx
<FeedbackButtons 
  embeddingId="emb_channel_basics_1"
  context={{
    tutorial_id: 'basics',
    source: 'tutorial_tooltip'
  }}
  variant="inline"
  size="sm"
/>
```

### 3. Smart Loop Error → Tutorial Linking

**Enhanced API**: `/api/ai/loop-troubleshooter`

**Features**:
- Pattern detection for common Lightning errors
- Automatic tutorial recommendations with relevance scores
- Direct timestamp linking to specific tutorial sections
- Enhanced vector search with 5 documents (increased from 3)
- Tutorial suggestion storage in `loop_logs` table

**Error Pattern Detection**:
- **Inbound Liquidity Issues** → Loop Out tutorial (timestamp: 60s)
- **Fee Estimation Problems** → Troubleshooting tutorial (timestamp: 270s)
- **HTLC/Routing Issues** → Basics tutorial (timestamp: 180s)
- **Channel Management** → Troubleshooting tutorial (timestamp: 180s)

**Enhanced Response Format**:
```json
{
  "success": true,
  "explanation": "AI-generated explanation...",
  "suggestions": ["Step-by-step suggestions..."],
  "cli_commands": ["lncli commands..."],
  "relevant_docs": [
    {
      "title": "Document title",
      "content": "Preview text...",
      "similarity": 0.85,
      "embedding_id": "emb_doc_1",
      "source": "/docs/troubleshooting"
    }
  ],
  "tutorial_links": [
    {
      "title": "Loop Out Operations",
      "url": "/learn/lightning/loop-out",
      "description": "Learn how to create inbound liquidity...",
      "relevance_score": 0.95,
      "timestamp": 60
    }
  ],
  "confidence": 0.87
}
```

## 🗄️ Database Schema

### Feedback Tables

```sql
-- User feedback on AI responses and tutorials
CREATE TABLE feedback (
  id UUID PRIMARY KEY,
  embedding_id TEXT NOT NULL,
  value TEXT CHECK (value IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  context JSONB,
  user_agent TEXT,
  ip_address TEXT
);

-- Aggregated quality scores
CREATE TABLE embedding_scores (
  id UUID PRIMARY KEY,
  embedding_id TEXT UNIQUE,
  positive_feedback INTEGER DEFAULT 0,
  total_feedback INTEGER DEFAULT 0,
  score NUMERIC(4,3) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutorial viewing progress
CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tutorial_id TEXT,
  progress_seconds NUMERIC(10,2),
  completion_percentage NUMERIC(5,2),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, tutorial_id)
);
```

### Enhanced Loop Logs

```sql
-- Added tutorial suggestions to existing loop_logs table
ALTER TABLE loop_logs ADD COLUMN tutorial_suggestions TEXT[];
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd web
npm install react-player @radix-ui/react-tooltip
```

### 2. Apply Database Schema

Run the updated schema in your Supabase instance:
```bash
# Apply the schema from web/src/sql/supabase-schema.sql
```

### 3. Environment Variables

Ensure these are set in your `.env.local`:
```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Access the Learning Center

Navigate to `/learn` to see the main learning center, or directly to:
- `/learn/lightning` - Lightning Network tutorials
- `/learn/lightning/basics` - Beginner tutorial
- `/learn/lightning/loop-out` - Loop Out operations
- `/learn/lightning/troubleshooting` - Error troubleshooting

## 🎨 Tutorial Configuration

### Adding New Tutorials

1. **Add to tutorial list** in `/learn/lightning/page.tsx`
2. **Configure tooltips** in `/learn/lightning/[tutorialId]/page.tsx`
3. **Update error patterns** in `/api/ai/loop-troubleshooter/route.ts`

### Tooltip Configuration Format

```typescript
interface TooltipData {
  id: string;
  x: number;        // Percentage from left (0-100)
  y: number;        // Percentage from top (0-100)
  timestamp?: number; // Video timestamp in seconds
  title: string;
  text: string;
  embeddingId?: string; // For feedback tracking
  source?: string;  // Link to documentation
}
```

### Error Pattern Detection

Add new patterns in `detectErrorPatternsAndSuggestTutorials()`:

```typescript
// Custom error pattern
if (lowercaseLog.includes('your_error_pattern')) {
  tutorials.push({
    title: 'Your Tutorial Title',
    url: '/learn/lightning/your-tutorial',
    description: 'Description of what this tutorial covers',
    relevance_score: 0.90,
    timestamp: 120 // Optional: jump to specific timestamp
  });
}
```

## 📊 Analytics & Monitoring

### Feedback Analytics

Query feedback data:
```sql
-- Get feedback stats for an embedding
SELECT 
  embedding_id,
  COUNT(*) as total_feedback,
  COUNT(*) FILTER (WHERE value = 'yes') as positive,
  AVG(CASE WHEN value = 'yes' THEN 1.0 ELSE 0.0 END) as score
FROM feedback 
WHERE embedding_id = 'your_embedding_id'
GROUP BY embedding_id;
```

### Tutorial Progress

Track user engagement:
```sql
-- Get tutorial completion rates
SELECT 
  tutorial_id,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE completion_percentage >= 90) as completed,
  AVG(completion_percentage) as avg_completion
FROM tutorial_progress 
GROUP BY tutorial_id;
```

### Error → Tutorial Effectiveness

Monitor tutorial suggestions:
```sql
-- See which tutorials are most recommended for errors
SELECT 
  unnest(tutorial_suggestions) as tutorial_url,
  COUNT(*) as suggestion_count
FROM loop_logs 
WHERE tutorial_suggestions IS NOT NULL
GROUP BY tutorial_url
ORDER BY suggestion_count DESC;
```

## 🔧 Customization

### Feedback Button Variants

```tsx
// Default variant
<FeedbackButtons embeddingId="emb_1" />

// Minimal variant (no text)
<FeedbackButtons embeddingId="emb_1" variant="minimal" />

// Inline variant (compact)
<FeedbackButtons embeddingId="emb_1" variant="inline" size="sm" />
```

### Tutorial Player Customization

```tsx
<TutorialPlayer
  videoUrl="your_video_url"
  tooltips={tooltips}
  title="Custom Title"
  onProgress={(progress) => {
    // Track progress, update database, etc.
    updateTutorialProgress(progress);
  }}
/>
```

## 🔒 Security & Privacy

### Row Level Security (RLS)

All tables have RLS policies:
- Users can only see their own feedback and progress
- Anonymous feedback is allowed
- Admins can view all feedback for analytics
- Embedding scores are publicly readable (for search improvement)

### Data Privacy

- IP addresses are hashed before storage
- User agents are truncated to remove identifying information
- Feedback can be submitted anonymously
- Context data is optional and user-controlled

## 🚀 Future Enhancements

### Planned Features

1. **Auto-scroll to Tutorial Sections**
   - Use timestamp metadata to jump to relevant sections
   - Implement smooth scrolling within embedded players

2. **Cookie-based Checkpointing**
   - Save tutorial progress across sessions
   - Resume from last watched position

3. **Advanced Analytics Dashboard**
   - Tutorial effectiveness metrics
   - User learning path analysis
   - A/B testing for tooltip placement

4. **Multi-language Support**
   - Internationalized tooltips and feedback
   - Language-specific tutorial recommendations

5. **Adaptive Learning**
   - Personalized tutorial recommendations
   - Difficulty adjustment based on user progress

## 📝 API Reference

### POST /api/track/feedback

Submit user feedback on AI responses or tutorial content.

**Request Body**:
```json
{
  "embedding_id": "emb_channel_basics_1",
  "value": "yes",
  "timestamp": "2024-01-01T00:00:00Z",
  "context": {
    "tutorial_id": "basics",
    "tooltip_id": "channel-concept",
    "source": "tutorial_tooltip"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Feedback recorded successfully"
}
```

### GET /api/track/feedback?embedding_id=emb_1

Get feedback analytics for a specific embedding.

**Response**:
```json
{
  "success": true,
  "data": {
    "embedding_id": "emb_channel_basics_1",
    "total_feedback": 25,
    "positive_feedback": 20,
    "negative_feedback": 5,
    "score": 0.8,
    "recent_feedback": [...]
  }
}
```

### POST /api/ai/loop-troubleshooter

Enhanced troubleshooting with tutorial recommendations.

**Request Body**:
```json
{
  "user_id": "user_uuid",
  "error_log": "Error: insufficient local balance",
  "error_code": "INSUFFICIENT_BALANCE",
  "context": {
    "amount_sats": 100000,
    "max_routing_fee": 1000
  }
}
```

**Response**: See enhanced response format above.

---

## 🎉 Summary

This implementation provides a complete interactive learning system with:

✅ **Video tutorials** with context-aware tooltips  
✅ **Feedback collection** on all AI-generated content  
✅ **Smart error linking** to relevant tutorial sections  
✅ **Progress tracking** and analytics  
✅ **Scalable architecture** for adding new tutorials  
✅ **Security-first design** with RLS and privacy controls  

The system is ready for production use and can scale to support thousands of users learning Lightning Network operations through interactive, AI-enhanced tutorials. 