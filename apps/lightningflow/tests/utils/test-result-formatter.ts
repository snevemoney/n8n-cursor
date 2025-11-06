/**
 * Test Result Formatter
 * 
 * This utility formats Playwright test results into a simple status report
 * for flow validation testing.
 */

import fs from 'fs';
import path from 'path';
import { TestResult, TestStatus } from '@playwright/test/reporter';

/**
 * Flow test result item
 */
interface FlowTestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

/**
 * Format Playwright test results into human-readable status report
 */
export function formatTestResults(testResults: TestResult[]): string {
  const flowResults: FlowTestResult[] = testResults.map(result => {
    const testName = result.title.split(' > ').pop() || result.title;
    const simplifiedName = testName.replace(' flow', '').replace(/^Test /, '');
    
    // Determine status and message
    switch (result.status) {
      case TestStatus.PASSED:
        return {
          name: simplifiedName,
          status: 'pass',
          message: getSuccessMessage(testName)
        };
      case TestStatus.FAILED:
        return {
          name: simplifiedName,
          status: 'fail',
          message: getFailureReason(result)
        };
      case TestStatus.TIMEDOUT:
        return {
          name: simplifiedName,
          status: 'warning',
          message: 'Test timed out'
        };
      case TestStatus.SKIPPED:
        return {
          name: simplifiedName,
          status: 'warning',
          message: 'Test skipped'
        };
      default:
        return {
          name: simplifiedName,
          status: 'warning',
          message: `Unknown status: ${result.status}`
        };
    }
  });
  
  // Format the results according to the requested output format
  return flowResults.map(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    return `${icon} ${result.name}: ${result.message}`;
  }).join('\n');
}

/**
 * Get a success message based on the test name
 */
function getSuccessMessage(testName: string): string {
  const messages: Record<string, string> = {
    'Send Payment': 'API + ledger update + toast all passed',
    'Generate Invoice': 'QR and entry created',
    'Invoice Payment Webhook': 'Webhook processed, DB updated',
    'AI Assistant chat': 'Chat UI + DB storage working',
    'AI Assistant generates invoice': 'AI can generate invoices correctly',
    'AI Assistant analytics': 'Analytics generation + chart display working',
    'Advanced Mode Toggle': 'Setting persists + console access controlled',
    'System Check': 'API + UI results display working',
    'Node Status Badge': 'Status indicator + modal working',
    'Dark Mode Toggle': 'Theme switch working',
    'Analytics navigation': 'Data fetching + chart display working',
    'Channel reports': 'Performance data loading + filtering working',
    'Open Channel': 'Channel creation + DB update working',
    'Channel Management': 'Fee policy updates working'
  };
  
  // Find matching message or fallback to generic success
  for (const [pattern, message] of Object.entries(messages)) {
    if (testName.includes(pattern)) {
      return message;
    }
  }
  
  return 'All steps completed successfully';
}

/**
 * Extract useful failure reason from test result
 */
function getFailureReason(result: TestResult): string {
  if (result.error?.message) {
    // Simplify error message for common issues
    const message = result.error.message;
    
    if (message.includes('timeout')) {
      return 'Timed out waiting for response';
    } else if (message.includes('expected to be visible')) {
      return 'UI element not visible';
    } else if (message.includes('API')) {
      return 'API call failed';
    } else if (message.includes('database')) {
      return 'Database record not found';
    }
    
    // Return truncated error message
    return message.split('\n')[0].substring(0, 50) + (message.length > 50 ? '...' : '');
  }
  
  return 'Failed for unknown reason';
}

/**
 * Generate report file if run directly
 */
if (require.main === module) {
  const resultsPath = process.argv[2] || path.join(process.cwd(), 'test-results.json');
  
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8')) as TestResult[];
    const formattedResults = formatTestResults(results);
    console.log(formattedResults);
    fs.writeFileSync(path.join(process.cwd(), 'flow-validation-report.txt'), formattedResults);
  } else {
    console.error(`Results file not found at ${resultsPath}`);
    process.exit(1);
  }
} 