// Carbon Emission Tracking
// Calculates CO2 emissions based on resource usage and provider carbon intensity

import { query } from '@/lib/db/client';
import { getCostTracker } from '@/lib/cost/tracker';

// Carbon intensity factors (kg CO2 per unit)
// Sources: Cloud provider sustainability reports, EPA, IEA
const CARBON_INTENSITY = {
  // Compute (kg CO2 per vCPU-hour)
  compute: {
    'aws': 0.000415, // AWS average
    'gcp': 0.000000, // GCP is 100% renewable
    'azure': 0.000356, // Azure average
    'kvm2': 0.000500, // Generic KVM (estimate)
    'local': 0.000200, // Local server (estimate, depends on grid)
  },
  // Storage (kg CO2 per GB-month)
  storage: {
    'aws': 0.000023,
    'gcp': 0.000000,
    'azure': 0.000020,
    'kvm2': 0.000030,
    'local': 0.000010,
  },
  // Network (kg CO2 per GB)
  network: {
    'aws': 0.0000004,
    'gcp': 0.0000000,
    'azure': 0.0000003,
    'kvm2': 0.0000005,
    'local': 0.0000001,
  },
  // ML Inference (kg CO2 per 1M tokens)
  ml: {
    'openai': 0.0008, // GPT-4 inference
    'ollama': 0.0001, // Local inference (much lower)
    'anthropic': 0.0007,
  },
} as const;

// Regional carbon intensity multipliers
// Higher = more carbon-intensive grid
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'us-east-1': 1.0, // Baseline
  'us-west-1': 0.8, // More renewable
  'us-west-2': 0.7, // More renewable
  'eu-west-1': 0.6, // European grid (more renewable)
  'eu-central-1': 0.5, // European grid
  'ap-southeast-1': 1.2, // Asia (coal-heavy)
  'local': 0.5, // Assumes local grid mix
};

/**
 * Calculate carbon emissions for a resource
 */
export async function calculateCarbonEmissions(
  resourceId: string,
  period: { start: Date; end: Date }
): Promise<CarbonEmission> {
  // Get resource usage from cost usage table
  const usageResult = await query(
    `SELECT 
      SUM(compute_hours) as compute_hours,
      SUM(storage_gb) as storage_gb,
      SUM(network_gb) as network_gb,
      SUM(llm_tokens) as llm_tokens
     FROM cost_usage
     WHERE resource_id = $1
     AND period_start >= $2
     AND period_end <= $3`,
    [resourceId, period.start, period.end]
  );

  const usage = {
    computeHours: parseFloat(usageResult.rows[0]?.compute_hours || '0'),
    storageGB: parseFloat(usageResult.rows[0]?.storage_gb || '0'),
    networkGB: parseFloat(usageResult.rows[0]?.network_gb || '0'),
    llmTokens: parseFloat(usageResult.rows[0]?.llm_tokens || '0'),
  };

  // Get resource metadata
  const resourceResult = await query(
    `SELECT provider, resource_type, region, tags
     FROM cost_resources
     WHERE resource_id = $1`,
    [resourceId]
  );

  if (resourceResult.rows.length === 0) {
    throw new Error(`Resource ${resourceId} not found`);
  }

  const resource = resourceResult.rows[0];
  const provider = resource.provider || 'local';
  const region = resource.region || 'local';
  const resourceType = resource.resource_type || 'container';

  // Get carbon intensity multipliers
  const computeIntensity = CARBON_INTENSITY.compute[provider as keyof typeof CARBON_INTENSITY.compute] || CARBON_INTENSITY.compute.local;
  const storageIntensity = CARBON_INTENSITY.storage[provider as keyof typeof CARBON_INTENSITY.storage] || CARBON_INTENSITY.storage.local;
  const networkIntensity = CARBON_INTENSITY.network[provider as keyof typeof CARBON_INTENSITY.network] || CARBON_INTENSITY.network.local;
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] || 1.0;

  // Calculate emissions
  const computeHours = usage.computeHours || 0;
  const storageGB = usage.storageGB || 0;
  const networkGB = usage.networkGB || 0;

  const computeEmissions = computeHours * computeIntensity * regionalMultiplier;
  const storageEmissions = storageGB * storageIntensity * regionalMultiplier;
  const networkEmissions = networkGB * networkIntensity * regionalMultiplier;

  // ML emissions (if applicable)
  const mlTokens = usage.llmTokens || 0;
  const mlProvider = resource.tags?.ml_provider || 'ollama';
  const mlIntensity = CARBON_INTENSITY.ml[mlProvider as keyof typeof CARBON_INTENSITY.ml] || CARBON_INTENSITY.ml.ollama;
  const mlEmissions = (mlTokens / 1_000_000) * mlIntensity;

  const totalEmissions = computeEmissions + storageEmissions + networkEmissions + mlEmissions;

  return {
    resourceId,
    resourceType,
    provider,
    region,
    emissionsKgCO2: totalEmissions,
    period,
    breakdown: {
      compute: computeEmissions,
      storage: storageEmissions,
      network: networkEmissions,
      ml: mlEmissions,
    },
  };
}

/**
 * Store carbon emissions in database
 */
export async function storeCarbonEmissions(emission: CarbonEmission): Promise<void> {
  await query(
    `INSERT INTO sustainability_emissions (
      id, resource_id, resource_type, provider, region,
      emissions_kg_co2, period_start, period_end,
      breakdown, created_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    ON CONFLICT (resource_id, period_start, period_end) DO UPDATE
    SET emissions_kg_co2 = $5, breakdown = $8, updated_at = NOW()`,
    [
      emission.resourceId,
      emission.resourceType,
      emission.provider,
      emission.region,
      emission.emissionsKgCO2,
      emission.period.start,
      emission.period.end,
      JSON.stringify(emission.breakdown),
    ]
  );
}

/**
 * Get carbon emissions summary
 */
export async function getCarbonSummary(
  period?: { start: Date; end: Date }
): Promise<{
  totalKgCO2: number;
  byResource: Array<{ resourceId: string; emissionsKgCO2: number }>;
  byProvider: Array<{ provider: string; emissionsKgCO2: number }>;
  byRegion: Array<{ region: string; emissionsKgCO2: number }>;
}> {
  const periodStart = period?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const periodEnd = period?.end || new Date();

  // Total emissions
  const totalResult = await query(
    `SELECT SUM(emissions_kg_co2) as total
     FROM sustainability_emissions
     WHERE period_start >= $1 AND period_end <= $2`,
    [periodStart, periodEnd]
  );
  const totalKgCO2 = parseFloat(totalResult.rows[0]?.total || '0');

  // By resource
  const byResourceResult = await query(
    `SELECT resource_id, SUM(emissions_kg_co2) as emissions
     FROM sustainability_emissions
     WHERE period_start >= $1 AND period_end <= $2
     GROUP BY resource_id
     ORDER BY emissions DESC`,
    [periodStart, periodEnd]
  );

  // By provider
  const byProviderResult = await query(
    `SELECT provider, SUM(emissions_kg_co2) as emissions
     FROM sustainability_emissions
     WHERE period_start >= $1 AND period_end <= $2
     GROUP BY provider
     ORDER BY emissions DESC`,
    [periodStart, periodEnd]
  );

  // By region
  const byRegionResult = await query(
    `SELECT region, SUM(emissions_kg_co2) as emissions
     FROM sustainability_emissions
     WHERE period_start >= $1 AND period_end <= $2
     GROUP BY region
     ORDER BY emissions DESC`,
    [periodStart, periodEnd]
  );

  return {
    totalKgCO2,
    byResource: byResourceResult.rows.map(row => ({
      resourceId: row.resource_id,
      emissionsKgCO2: parseFloat(row.emissions || '0'),
    })),
    byProvider: byProviderResult.rows.map(row => ({
      provider: row.provider,
      emissionsKgCO2: parseFloat(row.emissions || '0'),
    })),
    byRegion: byRegionResult.rows.map(row => ({
      region: row.region,
      emissionsKgCO2: parseFloat(row.emissions || '0'),
    })),
  };
}

