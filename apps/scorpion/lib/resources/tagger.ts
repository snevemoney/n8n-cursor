/**
 * Resource Tagging System
 * Implements Cloud Digital Leader resource hierarchy and tagging
 * 
 * Hierarchy: Organization → Product → Environment → Service
 * Tags: Key-value pairs for filtering, cost allocation, and governance
 */

export interface ResourceTags {
  [key: string]: string;
}

export interface ResourceHierarchy {
  organization: string;
  product: string;
  environment: 'dev' | 'staging' | 'prod';
  service: string;
}

export interface TaggedResource extends ResourceHierarchy {
  resourceId: string;
  resourceType: string;
  resourceName?: string;
  tags: ResourceTags;
}

/**
 * Parse resource hierarchy from tags or environment
 */
export function parseResourceHierarchy(
  tags?: ResourceTags,
  defaults?: Partial<ResourceHierarchy>
): ResourceHierarchy {
  return {
    organization: tags?.['organization'] || defaults?.organization || 'scorpion-systems',
    product: tags?.['product'] || defaults?.product || 'scorpion-core',
    environment: (tags?.['environment'] as 'dev' | 'staging' | 'prod') || defaults?.environment || 'prod',
    service: tags?.['service'] || defaults?.service || 'unknown',
  };
}

/**
 * Validate resource hierarchy
 */
export function validateResourceHierarchy(hierarchy: ResourceHierarchy): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!hierarchy.organization || hierarchy.organization.trim() === '') {
    errors.push('Organization is required');
  }

  if (!hierarchy.product || hierarchy.product.trim() === '') {
    errors.push('Product is required');
  }

  if (!['dev', 'staging', 'prod'].includes(hierarchy.environment)) {
    errors.push(`Environment must be one of: dev, staging, prod (got: ${hierarchy.environment})`);
  }

  if (!hierarchy.service || hierarchy.service.trim() === '') {
    errors.push('Service is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create resource tags from hierarchy and additional tags
 */
export function createResourceTags(
  hierarchy: ResourceHierarchy,
  additionalTags?: ResourceTags
): ResourceTags {
  return {
    organization: hierarchy.organization,
    product: hierarchy.product,
    environment: hierarchy.environment,
    service: hierarchy.service,
    ...additionalTags,
  };
}

/**
 * Extract resource hierarchy from tags
 */
export function extractResourceHierarchy(tags: ResourceTags): ResourceHierarchy | null {
  if (!tags['organization'] || !tags['product'] || !tags['environment'] || !tags['service']) {
    return null;
  }

  const validation = validateResourceHierarchy({
    organization: tags['organization'],
    product: tags['product'],
    environment: tags['environment'] as 'dev' | 'staging' | 'prod',
    service: tags['service'],
  });

  return validation.valid
    ? {
        organization: tags['organization'],
        product: tags['product'],
        environment: tags['environment'] as 'dev' | 'staging' | 'prod',
        service: tags['service'],
      }
    : null;
}

/**
 * Format resource ID from hierarchy
 */
export function formatResourceId(hierarchy: ResourceHierarchy, resourceType: string, name?: string): string {
  const parts = [
    hierarchy.organization,
    hierarchy.product,
    hierarchy.environment,
    hierarchy.service,
    resourceType,
  ];
  
  if (name) {
    parts.push(name);
  }

  return parts.join('/');
}

/**
 * Parse resource ID back to hierarchy
 */
export function parseResourceId(resourceId: string): {
  hierarchy: ResourceHierarchy;
  resourceType: string;
  name?: string;
} | null {
  const parts = resourceId.split('/');
  
  if (parts.length < 5) {
    return null;
  }

  const [organization, product, environment, service, resourceType, ...nameParts] = parts;
  const name = nameParts.length > 0 ? nameParts.join('/') : undefined;

  const hierarchy: ResourceHierarchy = {
    organization,
    product,
    environment: environment as 'dev' | 'staging' | 'prod',
    service,
  };

  const validation = validateResourceHierarchy(hierarchy);
  if (!validation.valid) {
    return null;
  }

  return { hierarchy, resourceType, name };
}

/**
 * Common resource tag keys
 */
export const RESOURCE_TAG_KEYS = {
  ORGANIZATION: 'organization',
  PRODUCT: 'product',
  ENVIRONMENT: 'environment',
  SERVICE: 'service',
  TEAM: 'team',
  COST_CENTER: 'cost-center',
  CRITICAL: 'critical',
  BACKUP_ENABLED: 'backup-enabled',
  MONITORING_ENABLED: 'monitoring-enabled',
  CREATED_BY: 'created-by',
  CREATED_AT: 'created-at',
} as const;

/**
 * Helper to get default tags for Scorpion resources
 */
export function getDefaultScorpionTags(
  product: string,
  environment: 'dev' | 'staging' | 'prod',
  service: string,
  additionalTags?: ResourceTags
): ResourceTags {
  return createResourceTags(
    {
      organization: 'scorpion-systems',
      product,
      environment,
      service,
    },
    {
      'created-by': 'scorpion',
      'created-at': new Date().toISOString(),
      ...additionalTags,
    }
  );
}

