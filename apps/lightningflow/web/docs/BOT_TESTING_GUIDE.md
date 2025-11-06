# 🤖 Lightning Platform Bot Testing Guide

The Lightning Platform includes a comprehensive bot testing system for load testing, performance monitoring, and behavioral simulation. This guide covers everything you need to know about using and configuring the bot testing system.

## 🎯 **What is Bot Testing?**

Bot testing simulates real user behavior by creating automated "bots" that interact with your Lightning platform APIs. This helps you:

- **Load Test**: Simulate hundreds of concurrent users
- **Performance Monitor**: Track response times and success rates
- **Regression Test**: Ensure new changes don't break existing functionality
- **A/B Test**: Compare different configurations or features
- **Chaos Test**: Test system resilience under various conditions

## 🚀 **Quick Start**

### 1. **Basic Setup**

Ensure your development server is running:
```bash
npm run dev
```

### 2. **Run Your First Bot Test**

```bash
# Quick test with 5 bots for 30 seconds
npm run bot:quick

# Or using the script directly
./scripts/run-bots.sh quick
```

### 3. **View Results**

After the test completes, you'll see:
- Console summary with key metrics
- Detailed JSON report in `bot-test-results/`
- HTML monitoring dashboard

```bash
# Generate monitoring dashboard
npm run bot:monitor
```

## 🎮 **Available Commands**

### **NPM Scripts**
```bash
npm run bot:quick     # 5 bots, 30s (development)
npm run bot:load      # 50 bots, 5min (load testing)
npm run bot:stress    # 100 bots, 10min (stress testing)
npm run bot:custom    # Custom configuration
npm run bot:simulate  # Direct script execution
npm run bot:monitor   # Generate monitoring report
```

### **Direct Script Usage**
```bash
# Predefined presets
./scripts/run-bots.sh quick
./scripts/run-bots.sh load
./scripts/run-bots.sh stress

# Custom configuration
./scripts/run-bots.sh custom --bots 20 --duration 120 --concurrency 8

# With specific mode
./scripts/run-bots.sh load --mode real --url https://your-prod-domain.com
```

## ⚙️ **Configuration Options**

### **Environment Variables**
```bash
export BOT_COUNT=25                    # Number of bots
export TEST_DURATION=180              # Duration in seconds
export CONCURRENCY=10                 # Concurrent bots
export TEST_MODE=mock                  # 'mock' or 'real'
export BASE_URL=http://localhost:3000  # Target URL
```

### **Test Modes**

#### **Mock Mode (Default)**
- Uses mock authentication
- Tests API structure and response times
- Safe for development and CI/CD
- No real Supabase/OpenAI calls

#### **Real Mode**
- Creates actual Supabase users
- Makes real API calls
- Requires full environment setup
- Use for production testing

## 🎯 **Bot Behaviors**

Each bot randomly performs these actions:

### **Lightning Network Tests**
- ✅ Check node info (`/api/lightning/node-info`)
- ✅ Create invoices (`/api/lightning/invoice`)
- ✅ Check invoice status (`/api/lightning/invoice/status`)
- ✅ Test LNURL-pay flow (`/api/lnurl-pay/*`)

### **AI Assistant Tests**
- ✅ Chat with AI assistant (`/api/ai/assistant`)
- ✅ Vector search (`/api/vector/search`)

### **System Health Tests**
- ✅ System health check (`/api/test-system`)
- ✅ Abuse detection (`/api/abuse/scan`)
- ✅ Analytics tracking (`/api/analytics/onboarding`)

### **Realistic Patterns**
- Random delays between actions (500ms - 3s)
- 3-7 actions per bot session
- Randomized request payloads
- Proper error handling and retries

## 📊 **Understanding Results**

### **Key Metrics**
- **Success Rate**: Percentage of successful requests
- **Avg Response Time**: Mean response time in milliseconds
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Health Score**: Overall system health (0-100)

### **Report Files**
```
bot-test-results/
├── bot-test-report-1234567890.json  # Detailed test results
└── ...

bot-test-monitor.html                 # Interactive dashboard
```

### **Health Score Calculation**
- **Success Rate** (40 points): Higher success rate = better score
- **Response Time** (30 points): Lower response time = better score  
- **Consistency** (30 points): Less variance = better score

**Score Ranges:**
- 90-100: Excellent 🟢
- 75-89: Good 🟡
- 50-74: Warning 🟠
- 0-49: Poor 🔴

## 🔧 **Advanced Usage**

### **CI/CD Integration**

The bot tests run automatically in GitHub Actions:

```yaml
# Triggered on PR
- Quick smoke test (5 bots, 30s)
- Load test (20 bots, 2min)
- Security test (auth validation)

# Triggered on main branch
- Performance benchmark (50 bots, 5min)
```

### **Custom Test Scenarios**

Create your own test by modifying `scripts/simulate-bots.ts`:

```typescript
// Add custom test method
async testCustomFlow(): Promise<void> {
  // Your custom API test logic
  await this.makeRequest('/api/your-endpoint', {
    method: 'POST',
    body: JSON.stringify({ custom: 'data' }),
  });
}

// Add to behavior simulation
const actions = [
  // ... existing actions
  () => this.testCustomFlow(),
];
```

### **Real Environment Testing**

For testing against real services:

1. **Setup Environment**
```bash
# Copy and configure real credentials
cp .env.example .env.production

# Set real API keys
export SUPABASE_SERVICE_ROLE_KEY=your_real_key
export OPENAI_API_KEY=your_real_key
```

2. **Run Test**
```bash
./scripts/run-bots.sh load --mode real --url https://your-domain.com
```

3. **Cleanup**
```bash
# Clean up test users (implement cleanup script)
npm run cleanup:bots
```

## 🔒 **Security Considerations**

### **Rate Limiting**
- Use separate Supabase project for testing
- Implement rate limiting on your APIs
- Monitor for abuse patterns

### **Bot Identification**
```javascript
// Bots are marked in user_metadata
{
  isBot: true,
  botId: "123",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### **Data Isolation**
- Test bots use `@lightningplatform.test` email domain
- Separate test databases recommended
- Clean up test data regularly

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Server Not Running**
```
❌ Server not responding at http://localhost:3000
💡 Make sure to run 'npm run dev' first
```
**Solution**: Start your dev server first

#### **Module Not Found**
```
❌ Cannot find module 'tsx'
```
**Solution**: Install dependencies
```bash
npm install --save-dev tsx node-fetch @types/node-fetch
```

#### **Permission Denied**
```
❌ Permission denied: ./scripts/run-bots.sh
```
**Solution**: Make script executable
```bash
chmod +x scripts/run-bots.sh
```

#### **High Error Rates**
If you see >10% error rates:
1. Check server logs for specific errors
2. Reduce concurrency (`--concurrency 2`)
3. Verify API endpoints are working manually
4. Check rate limiting settings

### **Debug Mode**

Enable detailed logging:
```bash
DEBUG=1 npm run bot:quick
```

## 📈 **Performance Benchmarks**

### **Expected Performance** (Mock Mode)
- **Response Time**: < 50ms average
- **Success Rate**: > 95%
- **Throughput**: > 100 req/s
- **Health Score**: > 85

### **Scaling Guidelines**
- **Development**: 5-10 bots
- **CI Testing**: 10-25 bots  
- **Load Testing**: 50-100 bots
- **Stress Testing**: 100+ bots

## 🎉 **Best Practices**

### **Development Workflow**
1. **Start Small**: Begin with `bot:quick` 
2. **Iterate**: Increase load gradually
3. **Monitor**: Check health scores after changes
4. **Document**: Record performance baselines

### **Production Testing**
1. **Off-Peak Hours**: Run during low traffic
2. **Gradual Ramp**: Start small, increase gradually  
3. **Monitor Resources**: Watch CPU, memory, database
4. **Have Rollback Plan**: Be ready to scale down

### **Continuous Testing**
1. **PR Tests**: Automated bot tests on every PR
2. **Daily Benchmarks**: Track performance trends
3. **Release Validation**: Pre-deployment load tests
4. **Performance Alerts**: Monitor degradation

## 🛠️ **Extending the System**

### **Adding New Test Scenarios**
1. Add method to `LightningBot` class
2. Include in `simulateUserBehavior()` actions array
3. Test locally with `npm run bot:quick`
4. Update CI configuration if needed

### **Custom Monitoring**
1. Modify `BotTestMonitor` class
2. Add new metrics to analysis
3. Update HTML dashboard template
4. Generate custom reports

### **Integration with Monitoring Tools**
- Export metrics to Grafana
- Send alerts to Slack/Discord
- Store results in time-series database
- Create automated performance reports

---

## 🎯 **Summary**

The Lightning Platform bot testing system provides:

✅ **Easy Setup**: One command to start testing  
✅ **Realistic Simulation**: Mimics real user behavior  
✅ **Comprehensive Metrics**: Detailed performance analysis  
✅ **CI/CD Integration**: Automated testing pipeline  
✅ **Beautiful Reports**: Interactive monitoring dashboard  
✅ **Scalable**: From 5 to 500+ bots  
✅ **Safe**: Mock mode for development  

Start with `npm run bot:quick` and level up your platform's reliability! 🚀 