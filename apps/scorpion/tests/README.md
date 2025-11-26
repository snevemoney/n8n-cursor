# Scorpion WebUI Testing Guide

This directory contains all tests for the Scorpion WebUI application.

## Test Structure

```
tests/
├── setup.ts                 # Global test setup and mocks
├── utils/                   # Test utilities and helpers
│   ├── test-utils.tsx      # Custom render with providers
│   ├── mock-data.ts        # Shared mock data
│   └── api-mocks.ts        # API mocking utilities
├── components/              # Unit tests for components
│   ├── DataTable.test.tsx
│   ├── forms/
│   │   ├── AgentCreationForm.test.tsx
│   │   └── SettingsForm.test.tsx
│   └── modals/
│       └── CommandBar.test.tsx
├── integration/             # Integration tests
│   ├── agents.test.tsx
│   ├── settings.test.tsx
│   └── workflows.test.tsx
└── e2e/                     # End-to-end tests
    ├── navigation-flow.spec.ts
    ├── user-journeys.spec.ts
    └── components.spec.ts
```

## Test Types

### Unit Tests

Test individual components in isolation with mocked dependencies.

**Location**: `tests/components/`

**Example**:
```typescript
import { render, screen } from '../utils/test-utils';
import { DataTable } from '@/components/scorpion/DataTable';

test('renders data correctly', () => {
  render(<DataTable columns={columns} data={data} />);
  expect(screen.getByText('Item 1')).toBeInTheDocument();
});
```

### Integration Tests

Test component interactions and API integration with mocked API calls.

**Location**: `tests/integration/`

**Example**:
```typescript
import { apiMocks } from '../utils/api-mocks';

test('saves settings successfully', async () => {
  apiMocks.settings.save({ success: true });
  // ... test form submission
});
```

### E2E Tests

Test complete user journeys in a real browser environment.

**Location**: `tests/e2e/`

**Example**:
```typescript
test('create agent journey', async ({ page }) => {
  await page.goto('/agents/create');
  await page.click('button:has-text("Content Creator")');
  // ... complete flow
});
```

## Writing Tests

### Component Tests

1. Use `render` from `test-utils.tsx` (includes providers)
2. Use `screen` queries from React Testing Library
3. Use `userEvent` for user interactions
4. Mock API calls using `apiMocks` utilities

```typescript
import { render, screen } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { apiMocks, resetApiMocks } from '../utils/api-mocks';

describe('MyComponent', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Integration Tests

1. Mock API responses using `apiMocks`
2. Test complete flows (load → interact → save)
3. Verify API calls are made correctly
4. Test error handling

```typescript
test('complete workflow', async () => {
  apiMocks.settings.get({ ragIndexing: true });
  apiMocks.settings.save({ success: true });
  
  // Test load → modify → save flow
});
```

### E2E Tests

1. Use Playwright's `page` object
2. Test real user interactions
3. Wait for network requests to complete
4. Verify UI state changes

```typescript
test('user journey', async ({ page }) => {
  await page.goto('/path');
  await page.waitForLoadState('networkidle');
  await page.click('button');
  await expect(page.locator('.success')).toBeVisible();
});
```

## Mock Data

Use shared mock data from `utils/mock-data.ts`:

```typescript
import { mockAgents, mockWorkflows, mockSettings } from '../utils/mock-data';
```

## API Mocking

Use `apiMocks` utilities for consistent API mocking:

```typescript
import { apiMocks, resetApiMocks } from '../utils/api-mocks';

beforeEach(() => {
  resetApiMocks();
});

test('handles API success', () => {
  apiMocks.agents.create({ id: '1', name: 'Agent' });
  // ... test
});

test('handles API error', () => {
  apiMocks.agents.error();
  // ... test error handling
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Test what users see and do, not internal state
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock External Dependencies**: Mock API calls, router, etc.
4. **Clean Up**: Reset mocks in `beforeEach`
5. **Test Error States**: Always test error handling
6. **Test Loading States**: Verify loading indicators work
7. **Test Accessibility**: Use semantic HTML and ARIA attributes

## Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests (requires dev server)
pnpm test:e2e

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Coverage Goals

- **Critical Components**: 80%+ coverage
- **Critical User Journeys**: 100% coverage
- **Overall**: 60%+ coverage

## Debugging Tests

### Unit/Integration Tests

```bash
# Run specific test file
pnpm test tests/components/DataTable.test.tsx

# Run with verbose output
pnpm test --reporter=verbose

# Debug in VS Code
# Set breakpoint and use "Debug Test" action
```

### E2E Tests

```bash
# Run in headed mode
pnpm test:e2e --headed

# Run specific test
pnpm test:e2e user-journeys

# Debug mode (opens Playwright Inspector)
pnpm test:e2e --debug
```

## Common Issues

### Tests Failing Due to Timing

Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Mock Not Working

Ensure `resetApiMocks()` is called in `beforeEach`:

```typescript
beforeEach(() => {
  resetApiMocks();
});
```

### E2E Tests Timing Out

Increase timeout or wait for specific conditions:

```typescript
await page.waitForLoadState('networkidle');
await expect(page.locator('.content')).toBeVisible({ timeout: 10000 });
```

## Adding New Tests

1. Create test file in appropriate directory
2. Import test utilities
3. Write test cases following existing patterns
4. Run tests to verify they pass
5. Update this README if adding new test patterns

