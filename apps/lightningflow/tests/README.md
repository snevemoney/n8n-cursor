# Flow Validation Testing for Lightning AI Platform

This directory contains end-to-end tests for validating the complete flow of user actions in the Lightning AI Business Node Platform.

## Testing Philosophy

Each test validates the complete flow from UI interaction to backend processing and UI feedback, ensuring that:

1. UI components render correctly
2. User actions trigger appropriate API calls
3. API responses are handled correctly
4. Database records are created/updated as expected
5. User receives appropriate feedback (toast, visual change, etc.)
6. Asynchronous processes complete successfully (if applicable)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the test environment

Copy the example environment file:

```bash
cp tests/env.example .env.test
```

Edit `.env.test` to match your test environment.

### 3. Run the tests

Run all tests:

```bash
npm run test:e2e
```

Run tests and generate a flow validation report:

```bash
npm run test:flows
```

Run tests only in Chrome:

```bash
npm run test:flows:chrome
```

## Test Structure

- `tests/e2e/` - Test files organized by feature area
- `tests/utils/` - Test utilities and helpers
- `tests/mocks/` - Mock implementations of external services

## Test Fixtures

The test framework provides several fixtures to make testing easier:

- `authenticatedPage` - A page that's already logged in
- `supabase` - A Supabase client for database access
- `lightningNode` - A mock Lightning node
- `bullMQ` - A mock BullMQ instance for job queue testing

## Flow Validation Report

The `test:flows` command generates a human-readable report of the test results:

```
✅ Send Payment: API + ledger update + toast all passed
✅ Invoice Flow: QR and entry created
⚠️ AI Assistant: API OK, but /history not updated
❌ Channel Open: Peer not added, no channel log found
```

Each line represents a complete flow validation, with one of three statuses:
- ✅ Pass - All steps in the flow completed successfully
- ⚠️ Warning - Flow partially works but has issues
- ❌ Fail - Critical failure in the flow

## Debugging Tests

To debug tests visually:

```bash
PWDEBUG=1 npm run test:e2e
```

This will open a browser window and run the tests with the Playwright Inspector.

## CI Integration

These tests can be run in your CI pipeline. Example GitHub workflow:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:flows
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: flow-validation-report
          path: flow-validation-report.txt
``` 