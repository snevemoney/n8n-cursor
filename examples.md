# AI Agent Workflow - Example Usage Scenarios

## Test Cases and Example Queries

### 1. Basic Information Search

**Input:**
```json
{
  "query": "What are the latest developments in quantum computing?",
  "sessionId": "test-session-001"
}
```

**Expected Behavior:**
- Agent uses Tavily search tool
- Returns structured response with search results
- Maintains context in memory

**Sample Output:**
```json
{
  "subject": "Latest Developments in Quantum Computing",
  "email": "Here are the most recent advances in quantum computing:\n\n1. IBM announced a 1000-qubit processor...\n2. Google achieved new milestone in error correction...\n3. Microsoft's topological qubits show promise...",
  "searchResults": [
    {
      "title": "IBM Unveils 1000-Qubit Quantum Processor",
      "url": "https://example.com/ibm-quantum",
      "snippet": "IBM has announced their latest quantum processor..."
    }
  ],
  "actionsTaken": [
    "Searched internet for: latest developments in quantum computing",
    "Analyzed and summarized search results"
  ]
}
```

### 2. Email Composition

**Input:**
```json
{
  "query": "Write a professional email to the team about postponing tomorrow's meeting to next Monday at 2 PM",
  "sessionId": "test-session-002"
}
```

**Expected Output:**
```json
{
  "subject": "Meeting Rescheduled: Moving Tomorrow's Meeting to Next Monday",
  "email": "Dear Team,\n\nI hope this email finds you well. I'm writing to inform you that we need to reschedule tomorrow's meeting.\n\nNew Meeting Details:\n- Date: Next Monday\n- Time: 2:00 PM\n- Location: [Same as originally planned]\n\nI apologize for any inconvenience this may cause. Please update your calendars accordingly and let me know if you have any conflicts with the new time.\n\nBest regards",
  "searchResults": [],
  "actionsTaken": [
    "Composed professional email for meeting rescheduling"
  ]
}
```

### 3. Research and Email Report

**Input:**
```json
{
  "query": "Research the top 3 project management tools for small teams and create an email report comparing them",
  "sessionId": "test-session-003"
}
```

**Expected Behavior:**
- Searches for project management tools
- Analyzes features and comparisons
- Creates structured email report

**Sample Output:**
```json
{
  "subject": "Project Management Tools Comparison Report for Small Teams",
  "email": "Subject: Project Management Tools Analysis - Top 3 Options for Our Team\n\nDear Team,\n\nFollowing our discussion about improving project coordination, I've researched the top project management tools suitable for small teams. Here's my analysis:\n\n1. **Trello**\n   - Pros: Visual Kanban boards, easy to learn, free tier available\n   - Cons: Limited advanced features, basic reporting\n   - Pricing: Free for basic, $5/user/month for advanced\n   - Best for: Visual teams, simple projects\n\n2. **Asana**\n   - Pros: Multiple view options, robust features, good integrations\n   - Cons: Can be overwhelming initially, expensive for full features\n   - Pricing: Free up to 15 users, $10.99/user/month for premium\n   - Best for: Growing teams, complex projects\n\n3. **Monday.com**\n   - Pros: Highly customizable, excellent automation, visual dashboards\n   - Cons: Steeper learning curve, no free tier\n   - Pricing: Starts at $8/user/month\n   - Best for: Teams needing customization and automation\n\nRecommendation: Based on our team size and needs, I recommend starting with Asana's free tier...",
  "searchResults": [
    {
      "title": "Best Project Management Tools for Small Teams 2024",
      "url": "https://example.com/pm-tools",
      "snippet": "Comprehensive review of top project management solutions..."
    }
  ],
  "actionsTaken": [
    "Searched internet for: top project management tools small teams comparison",
    "Analyzed search results for tool features and pricing",
    "Composed detailed comparison email report"
  ]
}
```

### 4. Multi-Turn Conversation

**First Query:**
```json
{
  "query": "What's the weather forecast for New York this week?",
  "sessionId": "conversation-001"
}
```

**Second Query (using same sessionId):**
```json
{
  "query": "Based on that forecast, write an email to attendees about what to pack for our conference",
  "sessionId": "conversation-001"
}
```

**Expected Behavior:**
- Memory retains weather information from first query
- Second response references previous context
- Creates relevant email without re-searching

### 5. Gmail Integration Test

**Input:**
```json
{
  "query": "Check my recent emails about the budget proposal and summarize the key points",
  "sessionId": "gmail-test-001"
}
```

**Expected Behavior:**
- Uses Gmail tool to search emails
- Filters for "budget proposal" keyword
- Creates summary of findings

### 6. Complex Multi-Tool Scenario

**Input:**
```json
{
  "query": "Search for best practices in remote team management, check if I have any emails from HR about remote work policies, and draft a comprehensive email proposing improvements to our current remote work setup",
  "sessionId": "complex-test-001"
}
```

**Expected Flow:**
1. Tavily search for remote team management best practices
2. Gmail search for HR emails about remote work
3. Combine information from both sources
4. Generate comprehensive proposal email

## Testing Procedures

### 1. Individual Tool Testing

**Test Tavily Search:**
```json
{
  "query": "Search for: n8n workflow automation examples",
  "sessionId": "tool-test-search"
}
```

**Test Gmail (Read):**
```json
{
  "query": "Show me my 5 most recent emails",
  "sessionId": "tool-test-gmail-read"
}
```

**Test Memory Persistence:**
```json
// First message
{
  "query": "My name is Alice and I work in marketing",
  "sessionId": "memory-test"
}

// Second message
{
  "query": "What department do I work in?",
  "sessionId": "memory-test"
}
```

### 2. Error Handling Tests

**Invalid Tool Request:**
```json
{
  "query": "Delete all files on the server",
  "sessionId": "error-test-001"
}
```
*Expected: Agent should explain it cannot perform system operations*

**Ambiguous Request:**
```json
{
  "query": "Send that email",
  "sessionId": "error-test-002"
}
```
*Expected: Agent should ask for clarification about which email*

### 3. Output Parser Validation

**Test Required Fields:**
```json
{
  "query": "Hello, how are you?",
  "sessionId": "parser-test-001"
}
```
*Expected: Output should still have "subject" and "email" fields*

## Performance Testing

### Load Test Scenarios

1. **Rapid Sequential Requests**
   - Send 10 queries in quick succession
   - Verify memory consistency
   - Check response times

2. **Large Search Results**
   - Query topics with many results
   - Verify truncation/summarization works
   - Check token usage

3. **Long Conversation Threads**
   - Continue conversation for 20+ turns
   - Verify memory window management
   - Check context retention

## Integration Testing

### 1. Webhook Trigger Test
```bash
curl -X POST https://your-n8n-instance/webhook/your-webhook-id \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Test webhook integration",
    "sessionId": "webhook-test"
  }'
```

### 2. Batch Processing Test
Create multiple test cases in a JSON file and process sequentially to verify workflow stability.

## Debugging Common Issues

### No Tool Activation
If tools aren't being used when expected:
1. Check system prompt mentions available tools
2. Verify tool descriptions are clear
3. Make queries more specific to trigger tools

### Memory Not Working
If context isn't retained:
1. Ensure sessionId is consistent
2. Check memory node is connected
3. Verify windowSize setting

### Output Format Issues
If output doesn't match schema:
1. Check output parser configuration
2. Verify system prompt mentions format
3. Test with simpler queries first

## Best Practices for Testing

1. **Start Simple**: Test individual components before complex scenarios
2. **Use Consistent Session IDs**: For testing memory and context
3. **Document Results**: Keep track of successful and failed tests
4. **Monitor Resources**: Watch token usage and API limits
5. **Test Edge Cases**: Try unusual or problematic inputs
6. **Verify Security**: Ensure sensitive data handling works correctly