#!/usr/bin/env bash
set -euo pipefail

# Category 4: Testing & Validation - Generate comprehensive test suites
# Usage: ./scripts/cursor-categories/generate-tests.sh "Service Name" [Test Type]

SERVICE_NAME="${1:-}"
TEST_TYPE="${2:-integration}"

if [ -z "$SERVICE_NAME" ]; then
    echo "❌ ERROR: Service name required"
    echo "Usage: $0 \"Service Name\" [Test Type]"
    echo "Test Types: unit, integration, e2e, security, performance"
    exit 1
fi

# Convert service name to safe filename
SERVICE_SLUG=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

echo "🧪 Generating $TEST_TYPE tests for: $SERVICE_NAME"
echo "📁 Service slug: $SERVICE_SLUG"

# Create test directory structure
TEST_DIR="tests/$TEST_TYPE/$SERVICE_SLUG"
mkdir -p "$TEST_DIR"

# Generate test files based on type
case "$TEST_TYPE" in
    "unit")
        generate_unit_tests
        ;;
    "integration")
        generate_integration_tests
        ;;
    "e2e")
        generate_e2e_tests
        ;;
    "security")
        generate_security_tests
        ;;
    "performance")
        generate_performance_tests
        ;;
    *)
        echo "❌ ERROR: Unknown test type: $TEST_TYPE"
        exit 1
        ;;
esac

echo "✅ Tests generated successfully!"
echo ""
echo "📁 Files created in: $TEST_DIR"
echo ""
echo "🔧 Next steps:"
echo "  1. Review and customize test cases"
echo "  2. Add service-specific test data"
echo "  3. Run tests: npm test -- $TEST_DIR"
echo "  4. Add to CI/CD pipeline"
echo "  5. Set up test coverage reporting"

# Function to generate unit tests
generate_unit_tests() {
    cat > "$TEST_DIR/index.test.ts" << EOF
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ${SERVICE_NAME//[^a-zA-Z0-9]/} } from '../../src/services/$SERVICE_SLUG';

describe('${SERVICE_NAME} Unit Tests', () => {
  let service: ${SERVICE_NAME//[^a-zA-Z0-9]/};

  beforeEach(() => {
    service = new ${SERVICE_NAME//[^a-zA-Z0-9]/}();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(service).toBeDefined();
      expect(service.isInitialized()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      // TODO: Add error handling test
    });
  });

  describe('Core Functionality', () => {
    it('should execute main function successfully', async () => {
      const result = await service.execute();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle execution errors', async () => {
      // TODO: Add error handling test
    });
  });

  describe('Validation', () => {
    it('should validate input parameters', () => {
      const validInput = { /* TODO: Add valid input */ };
      expect(service.validateInput(validInput)).toBe(true);
    });

    it('should reject invalid input parameters', () => {
      const invalidInput = { /* TODO: Add invalid input */ };
      expect(service.validateInput(invalidInput)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // TODO: Mock network error and test handling
    });

    it('should handle timeout errors', async () => {
      // TODO: Mock timeout and test handling
    });
  });
});
EOF

    cat > "$TEST_DIR/mocks.ts" << EOF
import { jest } from '@jest/globals';

// Mock external dependencies
export const mockExternalService = {
  call: jest.fn(),
  validate: jest.fn(),
  process: jest.fn()
};

export const mockDatabase = {
  query: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn()
};

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
  mockExternalService.call.mockResolvedValue({ success: true });
  mockExternalService.validate.mockReturnValue(true);
  mockExternalService.process.mockResolvedValue({ processed: true });
  mockDatabase.query.mockResolvedValue({ rows: [] });
  mockDatabase.transaction.mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
  mockDatabase.close.mockResolvedValue(undefined);
};
EOF
}

# Function to generate integration tests
generate_integration_tests() {
    cat > "$TEST_DIR/index.test.ts" << EOF
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { ${SERVICE_NAME//[^a-zA-Z0-9]/} } from '../../src/services/$SERVICE_SLUG';
import { setupTestDatabase, cleanupTestDatabase } from '../utils/database';
import { setupTestRedis, cleanupTestRedis } from '../utils/redis';

describe('${SERVICE_NAME} Integration Tests', () => {
  let service: ${SERVICE_NAME//[^a-zA-Z0-9]/};

  beforeAll(async () => {
    await setupTestDatabase();
    await setupTestRedis();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await cleanupTestRedis();
  });

  beforeEach(async () => {
    service = new ${SERVICE_NAME//[^a-zA-Z0-9]/}();
    await service.initialize();
  });

  describe('Database Integration', () => {
    it('should connect to database successfully', async () => {
      const isConnected = await service.checkDatabaseConnection();
      expect(isConnected).toBe(true);
    });

    it('should perform database operations', async () => {
      const result = await service.performDatabaseOperation();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Redis Integration', () => {
    it('should connect to Redis successfully', async () => {
      const isConnected = await service.checkRedisConnection();
      expect(isConnected).toBe(true);
    });

    it('should perform Redis operations', async () => {
      const result = await service.performRedisOperation();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('External API Integration', () => {
    it('should call external API successfully', async () => {
      const result = await service.callExternalAPI();
      expect(result).toBeDefined();
      expect(result.status).toBe(200);
    });

    it('should handle API errors gracefully', async () => {
      // TODO: Test error handling
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full workflow successfully', async () => {
      const result = await service.executeFullWorkflow();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
EOF

    cat > "$TEST_DIR/test-data.sql" << EOF
-- Test data for ${SERVICE_NAME} integration tests
-- This file contains sample data for testing

-- Clean up existing test data
DELETE FROM test_table WHERE test_environment = 'integration';

-- Insert test data
INSERT INTO test_table (id, name, value, test_environment) VALUES
(1, 'test_record_1', 'test_value_1', 'integration'),
(2, 'test_record_2', 'test_value_2', 'integration'),
(3, 'test_record_3', 'test_value_3', 'integration');

-- TODO: Add more test data as needed
EOF
}

# Function to generate E2E tests
generate_e2e_tests() {
    cat > "$TEST_DIR/index.test.ts" << EOF
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { chromium, Browser, Page } from 'playwright';

describe('${SERVICE_NAME} E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('User Interface', () => {
    it('should load the main page', async () => {
      await page.goto('http://localhost:3000');
      await expect(page).toHaveTitle(/LightningFlow AI/);
    });

    it('should display service status', async () => {
      await page.goto('http://localhost:3000/status');
      const statusElement = await page.locator('[data-testid="service-status"]');
      await expect(statusElement).toBeVisible();
    });
  });

  describe('API Endpoints', () => {
    it('should respond to health check', async () => {
      const response = await page.request.get('http://localhost:3000/healthz');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    it('should handle API requests', async () => {
      const response = await page.request.post('http://localhost:3000/api/$SERVICE_SLUG', {
        data: { /* TODO: Add test data */ }
      });
      expect(response.status()).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should display error messages for invalid requests', async () => {
      const response = await page.request.post('http://localhost:3000/api/$SERVICE_SLUG', {
        data: { invalid: 'data' }
      });
      expect(response.status()).toBe(400);
    });
  });
});
EOF
}

# Function to generate security tests
generate_security_tests() {
    cat > "$TEST_DIR/index.test.ts" << EOF
import { describe, it, expect } from '@jest/globals';
import { ${SERVICE_NAME//[^a-zA-Z0-9]/} } from '../../src/services/$SERVICE_SLUG';

describe('${SERVICE_NAME} Security Tests', () => {
  let service: ${SERVICE_NAME//[^a-zA-Z0-9]/};

  beforeEach(() => {
    service = new ${SERVICE_NAME//[^a-zA-Z0-9]/}();
  });

  describe('Input Validation', () => {
    it('should reject SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      await expect(service.processInput(maliciousInput)).rejects.toThrow();
    });

    it('should reject XSS attempts', async () => {
      const maliciousInput = "<script>alert('xss')</script>";
      await expect(service.processInput(maliciousInput)).rejects.toThrow();
    });

    it('should reject oversized payloads', async () => {
      const oversizedInput = 'x'.repeat(1000000);
      await expect(service.processInput(oversizedInput)).rejects.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should require valid authentication', async () => {
      const response = await service.authenticate('invalid-token');
      expect(response.success).toBe(false);
    });

    it('should handle expired tokens', async () => {
      const response = await service.authenticate('expired-token');
      expect(response.success).toBe(false);
    });
  });

  describe('Authorization', () => {
    it('should enforce proper permissions', async () => {
      const response = await service.authorize('user', 'admin-action');
      expect(response.allowed).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // TODO: Test rate limiting
    });
  });

  describe('Data Protection', () => {
    it('should not leak sensitive data in logs', async () => {
      // TODO: Test log sanitization
    });

    it('should encrypt sensitive data', async () => {
      // TODO: Test data encryption
    });
  });
});
EOF
}

# Function to generate performance tests
generate_performance_tests() {
    cat > "$TEST_DIR/index.test.ts" << EOF
import { describe, it, expect } from '@jest/globals';
import { ${SERVICE_NAME//[^a-zA-Z0-9]/} } from '../../src/services/$SERVICE_SLUG';

describe('${SERVICE_NAME} Performance Tests', () => {
  let service: ${SERVICE_NAME//[^a-zA-Z0-9]/};

  beforeEach(() => {
    service = new ${SERVICE_NAME//[^a-zA-Z0-9]/}();
  });

  describe('Response Time', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      await service.execute();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000); // 1 second
    });
  });

  describe('Memory Usage', () => {
    it('should not exceed memory limits', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      await service.execute();
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Concurrency', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => service.execute());
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Load Testing', () => {
    it('should handle high load', async () => {
      const promises = Array.from({ length: 100 }, () => service.execute());
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(100);
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(95); // 95% success rate
    });
  });
});
EOF
}
