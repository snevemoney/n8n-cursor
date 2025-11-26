// apps/scorpion/server/council/performanceCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

function includesAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === 'string' ? text.includes(p.toLowerCase()) : p.test(text),
  );
}

export const PerformanceCouncilMember: CouncilMember = {
  id: 'performance',
  name: 'Performance Councillor',
  description:
    'Flags performance issues: N+1 queries, missing caching, inefficient algorithms, large payloads, and blocking operations.',

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for N+1 query patterns
    const mentionsLoop = includesAny(text, [
      'loop',
      'for each',
      'foreach',
      'map',
      'iterate',
    ]);

    const mentionsQuery = includesAny(text, [
      'query',
      'fetch',
      'get',
      'find',
      'select',
    ]);

    if (mentionsLoop && mentionsQuery && !text.includes('batch') && !text.includes('bulk') && !text.includes('eager load') && !text.includes('include')) {
      issues.push({
        severity: 3,
        tag: 'complexity',
        message: 'Potential N+1 query problem: queries inside loops.',
        recommendation:
          'Use batch loading, eager loading, or bulk operations to fetch related data in a single query instead of querying inside loops.',
        councillorId: 'performance',
      });

      logImprovementSignal({
        type: 'LATENCY_HIGH',
        message: 'Performance risk: N+1 query pattern detected.',
        tag: 'performance',
        severity: 3,
      });
    }

    // Check for missing caching
    const mentionsFrequent = includesAny(text, [
      'frequently',
      'often',
      'repeated',
      'cache',
      'caching',
    ]);

    const mentionsExpensive = includesAny(text, [
      'expensive',
      'slow',
      'heavy',
      'complex calculation',
      'api call',
      'database query',
    ]);

    if (mentionsFrequent && mentionsExpensive && !text.includes('cache') && !text.includes('memoize') && !text.includes('redis')) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: 'Expensive operations that run frequently may benefit from caching.',
        recommendation:
          'Consider implementing caching (Redis, in-memory cache, or memoization) for expensive operations that are called frequently.',
        councillorId: 'performance',
      });
    }

    // Check for inefficient algorithms
    const mentionsSort = includesAny(text, [
      'sort',
      'order',
      'rank',
    ]);

    const mentionsLarge = includesAny(text, [
      'large dataset',
      'many records',
      'thousands',
      'millions',
      'big data',
    ]);

    if (mentionsSort && mentionsLarge && !text.includes('index') && !text.includes('database sort') && !text.includes('pagination')) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: 'Sorting large datasets in memory may be inefficient.',
        recommendation:
          'Use database-level sorting with proper indexes, or implement pagination to limit the dataset size.',
        councillorId: 'performance',
      });
    }

    // Check for large payloads
    const mentionsLargePayload = includesAny(text, [
      'send all',
      'return all',
      'fetch all',
      'load all',
      'entire dataset',
    ]);

    if (mentionsLargePayload && !text.includes('pagination') && !text.includes('limit') && !text.includes('chunk')) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: 'Transferring large payloads may cause performance issues.',
        recommendation:
          'Implement pagination, limit the response size, or use streaming/chunking for large data transfers.',
        councillorId: 'performance',
      });
    }

    // Check for blocking operations
    const mentionsBlocking = includesAny(text, [
      'synchronous',
      'blocking',
      'wait for',
      'sleep',
    ]);

    const mentionsAsync = includesAny(text, [
      'async',
      'await',
      'promise',
      'non-blocking',
    ]);

    if (mentionsBlocking && !mentionsAsync && (text.includes('i/o') || text.includes('network') || text.includes('file'))) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: 'Blocking I/O operations may degrade performance.',
        recommendation:
          'Use asynchronous/non-blocking operations for I/O, network calls, and file operations to avoid blocking the event loop.',
        councillorId: 'performance',
      });
    }

    // Check for missing indexes
    const mentionsSearch = includesAny(text, [
      'search',
      'filter',
      'where',
      'find by',
    ]);

    if (mentionsSearch && mentionsQuery && !text.includes('index') && !text.includes('database index')) {
      issues.push({
        severity: 1,
        tag: 'complexity',
        message: 'Database queries with filters may benefit from indexes.',
        recommendation:
          'Consider adding database indexes on frequently queried columns to improve search performance.',
        councillorId: 'performance',
      });
    }

    return {
      approved: true, // Performance issues don't block, but should be flagged
      issues,
    };
  },
};

