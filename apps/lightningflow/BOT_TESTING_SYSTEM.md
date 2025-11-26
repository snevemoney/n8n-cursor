# Lightning Platform Bot Testing System

## Overview

The Lightning Platform Bot Testing System provides automated quality assurance through intelligent bot agents that continuously test your application's core functionality. This system integrates with Supabase for comprehensive logging, GitHub Actions for CI/CD automation, and provides detailed analytics and self-healing capabilities.

## 🤖 Bot Architecture

### Bot Types

1. **Admin Bot** (`adminBot`)
   - Tests admin dashboard functionality
   - Validates revenue forecasting and analytics
   - Monitors system health endpoints
   - Verifies admin-only access controls

2. **User Bot** (`userBot`)
   - Tests standard user flows
   - Validates simulator functionality
   - Tests payment interfaces and wallet operations
   - Ensures responsive design across devices

3. **QA Bot** (`qaBot`)
   - Tests AI assistant functionality
   - Validates tutorial system and content
   - Tests search and knowledge base features
   - Provides quality assurance feedback workflows

### Bot Capabilities

- **Automated Login**: Each bot uses dedicated test accounts with appropriate permissions
- **Screenshot Capture**: Full-page screenshots on every test step for documentation
- **Performance Monitoring**: Tracks page load times, API response times, and resource usage
- **Error Detection**: Captures JavaScript errors, network failures, and layout issues
- **Mobile Testing**: Validates responsive design across different viewport sizes
- **API Testing**: Validates backend endpoints and rate limiting

## 🗄️ Database Schema

### Core Tables

```sql
-- Bot test sessions (groups of tests)
bot_test_sessions
├── id (UUID)
├── session_name (TEXT)
├── trigger_type ('manual', 'cron', 'ci', 'webhook')
├── git_commit_hash (TEXT)
├── git_branch (TEXT)
├── overall_status ('running', 'passed', 'failed', 'partial')
└── environment_config (JSONB)

-- Individual test execution logs
bot_test_logs
├── id (UUID)
├── test_session_id (UUID)
├── bot_name (TEXT)
├── test_route (TEXT)
├── test_type ('ui', 'api', 'flow', 'integration', 'performance')
├── test_result ('pass', 'fail', 'warning', 'skip')
├── execution_time_ms (INTEGER)
├── error_detail (JSONB)
├── screenshots (TEXT[])
└── performance_metrics (JSONB)

-- AI-driven failure analysis
bot_failure_analysis
├── test_log_id (UUID)
├── failure_category ('ui_regression', 'api_error', 'performance', 'data_issue')
├── severity ('critical', 'high', 'medium', 'low')
├── ai_analysis (JSONB)
├── suggested_fixes (TEXT[])
└── self_heal_attempted (BOOLEAN)
```

### Analytics Functions

```sql
-- Calculate session success rate
SELECT calculate_session_success_rate('session-uuid');

-- Get comprehensive analytics
SELECT * FROM get_bot_test_analytics(7); -- Last 7 days
```

## 🚀 Running Bot Tests

### Local Development

```bash
# Install dependencies
cd web && npm install

# Start development server
npm run dev

# Run all bot tests
node ../scripts/run-bot-tests.js all

# Run specific test suites
node ../scripts/run-bot-tests.js admin    # Admin bot only
node ../scripts/run-bot-tests.js user     # User bot only
node ../scripts/run-bot-tests.js qa       # QA bot only
node ../scripts/run-bot-tests.js smoke    # Critical tests only
```

### Using Playwright Directly

```bash
# Run all bot tests
npx playwright test tests/bots/ --project=bots

# Run specific bot
npx playwright test tests/bots/adminBot.spec.ts

# Run with UI mode for debugging
npx playwright test tests/bots/ --ui

# Generate HTML report
npx playwright show-report
```

### Test Configuration

Bot tests are configured in `playwright.config.ts` with specialized settings:

- **Timeout**: 2-3 minutes per test (longer for AI interactions)
- **Retries**: 1 retry for flaky tests
- **Video Recording**: Always enabled for documentation
- **Screenshots**: Captured on every step
- **Tracing**: Full trace collection for debugging

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The bot testing system integrates with GitHub Actions for automated testing:

```yaml
# Triggers
- schedule: '0 2 * * *'  # Nightly at 2 AM UTC
- pull_request          # On PR creation/updates
- workflow_dispatch     # Manual trigger
```

### Test Execution Matrix

| Trigger | Admin Bot | User Bot | QA Bot | Mobile Tests |
|---------|-----------|----------|---------|--------------|
| Nightly | ✅ | ✅ | ✅ | ✅ |
| PR | ✅ | ✅ | ❌ | ❌ |
| Manual | Configurable | Configurable | Configurable | Configurable |

### Notifications

- **Discord**: Failure alerts for nightly runs
- **GitHub Issues**: Auto-created for severe failures (>5 failed tests)
- **PR Comments**: Detailed results posted to pull requests

## 📊 Analytics & Monitoring

### Real-time Dashboards

Access bot test analytics through:

1. **Supabase Dashboard**
   ```sql
   SELECT * FROM bot_test_logs 
   WHERE run_at > NOW() - INTERVAL '24 hours'
   ORDER BY run_at DESC;
   ```

2. **GitHub Actions**
   - View test reports in Actions tab
   - Download artifacts (screenshots, videos, traces)

3. **Local Results**
   - HTML reports: `web/playwright-report/`
   - Screenshots: `web/test-results/screenshots/`

### Performance Metrics

Bot tests track comprehensive performance data:

- **Page Load Times**: First contentful paint, largest contentful paint
- **API Response Times**: Individual endpoint performance
- **Resource Usage**: Memory, CPU, network transfer
- **Error Rates**: JavaScript errors, console warnings, network failures

### Success Rate Tracking

```javascript
// Session-level metrics
{
  "total_tests": 45,
  "passed_tests": 42,
  "failed_tests": 2,
  "warning_tests": 1,
  "success_rate": 93.3,
  "overall_status": "partial"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Required for bot testing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional for notifications
DISCORD_WEBHOOK_URL=your_discord_webhook

# Test configuration
BASE_URL=http://localhost:3000
CI=true  # For headless mode
```

### Bot User Accounts

Test users are defined in `tests/bots/utils/login.ts`:

```typescript
const BOT_USERS = {
  adminBot: {
    email: 'sneve1@bot.dev',
    password: '121618louis',
    role: 'admin'
  },
  userBot: {
    email: 'testuser1@bot.dev',
    password: 'testpassword123',
    role: 'user'
  },
  qaBot: {
    email: 'quality@bot.dev',
    password: 'quality123',
    role: 'qa'
  }
}
```

## 🛠️ Development

### Adding New Bot Tests

1. **Create Test File**
   ```typescript
   // tests/bots/newBot.spec.ts
   import { test, expect } from '@playwright/test'
   import { loginAs, logBotTestResult } from './utils/login'
   
   test('New bot test', async ({ page }) => {
     await loginAs(page, 'userBot')
     // Your test logic here
   })
   ```

2. **Update Configuration**
   ```typescript
   // playwright.config.ts
   {
     name: 'new-bot',
     testMatch: /tests\/bots\/newBot\.spec\.ts/,
     // Bot-specific settings
   }
   ```

3. **Add to Test Suites**
   ```javascript
   // scripts/run-bot-tests.js
   const TEST_SUITES = {
     all: ['adminBot', 'userBot', 'qaBot', 'newBot'],
     // ...
   }
   ```

### Best Practices

1. **Test Isolation**: Each test should be independent and clean up after itself
2. **Robust Selectors**: Use `data-testid` attributes for reliable element selection
3. **Error Handling**: Always wrap tests in try-catch blocks for proper logging
4. **Performance Awareness**: Set reasonable timeouts for AI and API operations
5. **Documentation**: Capture screenshots for test documentation

### Debugging Failed Tests

1. **View Screenshots**: Check `test-results/screenshots/` for visual evidence
2. **Watch Videos**: Review recorded test execution videos
3. **Analyze Traces**: Use Playwright trace viewer for detailed debugging
4. **Check Logs**: Review Supabase logs for detailed error information

```bash
# View trace for failed test
npx playwright show-trace test-results/trace.zip

# Debug specific test with UI
npx playwright test tests/bots/adminBot.spec.ts --debug
```

## 🎯 Success Metrics

### Key Performance Indicators

- **Success Rate**: Target >95% for production deployments
- **Test Coverage**: All critical user flows covered by bots
- **Mean Time to Detection**: <24 hours for production issues
- **False Positive Rate**: <5% flaky test failures

### Quality Gates

| Environment | Min Success Rate | Max Failed Tests | Action |
|-------------|------------------|------------------|--------|
| Development | 80% | 10 | Warning |
| Staging | 90% | 5 | Block deployment |
| Production | 95% | 2 | Immediate alert |

## 🔮 Future Enhancements

### Planned Features

1. **Self-Healing Tests**: AI-powered test repair for UI changes
2. **Visual Regression Testing**: Automated screenshot comparison
3. **Load Testing Bots**: Performance testing under simulated load
4. **Cross-Browser Matrix**: Extended browser and device coverage
5. **Integration Testing**: End-to-end Lightning Network operations

### AI-Powered Enhancements

- **Intelligent Test Generation**: AI creates tests from user behavior
- **Failure Root Cause Analysis**: Deep learning for issue classification
- **Predictive Testing**: Proactive testing based on code changes
- **Auto-Fix Suggestions**: AI-generated solutions for common failures

## 📞 Support

### Getting Help

1. **Documentation Issues**: Create GitHub issue with `documentation` label
2. **Test Failures**: Check Supabase logs and GitHub Actions output
3. **Feature Requests**: Submit GitHub issue with `enhancement` label

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in `playwright.config.ts` |
| Login failures | Verify bot user credentials in Supabase |
| Network errors | Check development server is running |
| Supabase errors | Verify environment variables and RLS policies |

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Adding new bot tests
- Improving existing test coverage
- Reporting bugs and feature requests
- Code review process

---

**The Lightning Platform Bot Testing System ensures your application maintains high quality and reliability through comprehensive automated testing. Happy testing! 🚀** 