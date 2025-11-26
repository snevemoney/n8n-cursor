/**
 * Resource Tagging Tests
 * Test resource hierarchy and tagging utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseResourceHierarchy,
  validateResourceHierarchy,
  createResourceTags,
  extractResourceHierarchy,
  formatResourceId,
  parseResourceId,
  getDefaultScorpionTags,
} from '../tagger';

describe('Resource Tagging', () => {
  describe('parseResourceHierarchy', () => {
    it('should parse hierarchy from tags', () => {
      const tags = {
        organization: 'test-org',
        product: 'test-product',
        environment: 'prod',
        service: 'test-service',
      };

      const hierarchy = parseResourceHierarchy(tags);
      expect(hierarchy.organization).toBe('test-org');
      expect(hierarchy.product).toBe('test-product');
      expect(hierarchy.environment).toBe('prod');
      expect(hierarchy.service).toBe('test-service');
    });

    it('should use defaults when tags missing', () => {
      const hierarchy = parseResourceHierarchy(undefined, {
        organization: 'default-org',
        product: 'default-product',
        environment: 'dev',
        service: 'default-service',
      });

      expect(hierarchy.organization).toBe('default-org');
      expect(hierarchy.product).toBe('default-product');
      expect(hierarchy.environment).toBe('dev');
      expect(hierarchy.service).toBe('default-service');
    });
  });

  describe('validateResourceHierarchy', () => {
    it('should validate correct hierarchy', () => {
      const result = validateResourceHierarchy({
        organization: 'test-org',
        product: 'test-product',
        environment: 'prod',
        service: 'test-service',
      });

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject invalid environment', () => {
      const result = validateResourceHierarchy({
        organization: 'test-org',
        product: 'test-product',
        environment: 'invalid' as any,
        service: 'test-service',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', () => {
      const result = validateResourceHierarchy({
        organization: '',
        product: 'test-product',
        environment: 'prod',
        service: 'test-service',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Organization'))).toBe(true);
    });
  });

  describe('createResourceTags', () => {
    it('should create tags from hierarchy', () => {
      const hierarchy = {
        organization: 'test-org',
        product: 'test-product',
        environment: 'prod' as const,
        service: 'test-service',
      };

      const tags = createResourceTags(hierarchy, { team: 'platform' });

      expect(tags.organization).toBe('test-org');
      expect(tags.product).toBe('test-product');
      expect(tags.environment).toBe('prod');
      expect(tags.service).toBe('test-service');
      expect(tags.team).toBe('platform');
    });
  });

  describe('formatResourceId', () => {
    it('should format resource ID correctly', () => {
      const hierarchy = {
        organization: 'scorpion-systems',
        product: 'scorpion-core',
        environment: 'prod' as const,
        service: 'api',
      };

      const id = formatResourceId(hierarchy, 'container', 'api-001');
      expect(id).toBe('scorpion-systems/scorpion-core/prod/api/container/api-001');
    });

    it('should format without name', () => {
      const hierarchy = {
        organization: 'scorpion-systems',
        product: 'scorpion-core',
        environment: 'dev' as const,
        service: 'db',
      };

      const id = formatResourceId(hierarchy, 'database');
      expect(id).toBe('scorpion-systems/scorpion-core/dev/db/database');
    });
  });

  describe('parseResourceId', () => {
    it('should parse resource ID correctly', () => {
      const id = 'scorpion-systems/scorpion-core/prod/api/container/api-001';
      const parsed = parseResourceId(id);

      expect(parsed).not.toBeNull();
      expect(parsed?.hierarchy.organization).toBe('scorpion-systems');
      expect(parsed?.hierarchy.product).toBe('scorpion-core');
      expect(parsed?.hierarchy.environment).toBe('prod');
      expect(parsed?.hierarchy.service).toBe('api');
      expect(parsed?.resourceType).toBe('container');
      expect(parsed?.name).toBe('api-001');
    });

    it('should return null for invalid ID', () => {
      const parsed = parseResourceId('invalid');
      expect(parsed).toBeNull();
    });
  });

  describe('getDefaultScorpionTags', () => {
    it('should create default tags', () => {
      const tags = getDefaultScorpionTags('scorpion-core', 'prod', 'api', {
        team: 'platform',
      });

      expect(tags.organization).toBe('scorpion-systems');
      expect(tags.product).toBe('scorpion-core');
      expect(tags.environment).toBe('prod');
      expect(tags.service).toBe('api');
      expect(tags.team).toBe('platform');
      expect(tags['created-by']).toBe('scorpion');
      expect(tags['created-at']).toBeDefined();
    });
  });
});

