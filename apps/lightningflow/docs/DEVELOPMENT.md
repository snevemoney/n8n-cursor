# Lightning AI Platform - Development Guide

This guide covers all development tools, scripts, and best practices for the Lightning AI Business Node Platform.

## 🚀 Quick Start Scripts

### Clean Development Start
```bash
# Clean cache and start fresh
./scripts/clean-start.sh
```

### Auto-Restart Development Server
```bash
# Watch for file changes and auto-restart
./scripts/dev-watch.sh
```

### Endpoint Health Check
```bash
# Test all endpoints and API routes
./scripts/test-endpoints.sh
```

## 📁 Project Structure

```
lightning-platform/
├── web/src/                    # Main Next.js application
│   ├── app/                   # App Router pages
│   ├── components/            # Reusable UI components
│   ├── features/              # Feature-specific components
│   ├── lib/                   # Utility libraries
│   └── types/                 # TypeScript type definitions
├── scripts/                   # Development scripts
├── tests/e2e/                 # End-to-end tests
└── docs/                      # Documentation
```

## 🛠️ Development Scripts

### 1. Clean Start (`scripts/clean-start.sh`)
- Removes `.next` cache and `node_modules/.cache`
- Starts development server fresh
- Use when experiencing compilation issues

### 2. Auto-Restart (`scripts/dev-watch.sh`)
- Watches for file changes in `src/`, `components/`, `lib/`, `app/`
- Automatically restarts server on changes
- Requires `fswatch` (install: `brew install fswatch`)

### 3. Endpoint Testing (`scripts/test-endpoints.sh`)
- Tests all major routes and API endpoints
- Returns colored output with pass/fail status
- Useful for CI/CD health checks

## 🧪 Testing Setup

### Playwright E2E Tests

#### Installation
```bash
npm install -D @playwright/test
npx playwright install
```

#### Running Tests
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/lightning-flows.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

#### Test Coverage
- ✅ Dashboard navigation and functionality
- ✅ Payment flows (send/receive)
- ✅ AI assistant interactions
- ✅ Lightning test harness
- ✅ Responsive design testing
- ✅ API endpoint validation
- ✅ Error state handling

### Test Configuration
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iPhone 12, Pixel 5
- **Reports**: HTML, JSON, JUnit
- **Screenshots**: On failure only
- **Videos**: Retained on failure

## 🔧 Development Best Practices

### 1. Code Quality
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Add JSDoc comments for complex functions
- Use semantic commit messages

### 2. Component Development
- Use Shadcn UI components as base
- Implement proper TypeScript interfaces
- Add data-testid attributes for testing
- Follow accessibility guidelines

### 3. Lightning Integration
- Always use mock mode for development
- Test with real Lightning only in staging
- Implement proper error handling
- Log all Lightning operations

### 4. AI Features
- Keep OpenAI API key server-side only
- Implement usage tracking and limits
- Cache responses when appropriate
- Handle rate limiting gracefully

## 🚨 Troubleshooting

### Common Issues

#### Fast Refresh Errors
```bash
rm -rf .next
killall node
npm run dev
```

#### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

#### Module Resolution Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Viewport Metadata Warnings
- Use `export const viewport: Viewport = {...}` instead of `metadata.viewport`
- Import `Viewport` type from `next`

## 📊 Performance Monitoring

### Development Metrics
- **Server Boot Time**: ~2 seconds
- **Hot Reload**: <1 second
- **Build Time**: <30 seconds
- **Test Suite**: <2 minutes

### Optimization Tips
1. Use dynamic imports for heavy components
2. Implement proper image optimization
3. Cache API responses appropriately
4. Use React.memo for expensive renders

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use `.env.local` for local development
- Validate all environment variables at startup

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Implement proper CORS policies

### Lightning Security
- Use testnet for development
- Implement proper invoice validation
- Handle payment failures gracefully
- Log all financial operations

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker (Future)
```bash
docker build -t lightning-platform .
docker run -p 3000:3000 lightning-platform
```

## 📈 Monitoring & Logging

### Development Logging
- Use `console.log` for debugging
- Implement structured logging for production
- Monitor API response times
- Track Lightning payment success rates

### Error Tracking
- Implement error boundaries
- Use Sentry or similar for production
- Log all Lightning failures
- Monitor AI API usage and costs

## 🤝 Contributing

1. Create feature branch from `main`
2. Run tests before committing
3. Use conventional commit messages
4. Update documentation as needed
5. Request code review

### Commit Message Format
```
feat: add Lightning invoice generation
fix: resolve payment method selection bug
docs: update API documentation
test: add e2e tests for dashboard
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Lightning Network Specification](https://github.com/lightningnetwork/lightning-rfc)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Need Help?** Check the troubleshooting section or create an issue in the repository. 