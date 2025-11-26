// Resource Efficiency Analysis
// Analyzes resource utilization and provides optimization recommendations

import { query } from '@/lib/db/client';
import type { ResourceEfficiency } from './types';

/**
 * Analyze resource efficiency
 */
export async function analyzeResourceEfficiency(
  resourceId: string
): Promise<ResourceEfficiency> {
  // Get resource metrics from monitoring system
  const metricsResult = await query(
    `SELECT 
      AVG(cpu_utilization) as avg_cpu,
      AVG(memory_utilization) as avg_memory,
      AVG(storage_utilization) as avg_storage,
      AVG(network_utilization) as avg_network
     FROM monitoring_metrics
     WHERE resource_id = $1
     AND created_at >= NOW() - INTERVAL '24 hours'`,
    [resourceId]
  );

  const metrics = metricsResult.rows[0] || {};
  const cpuUtilization = parseFloat(metrics.avg_cpu || '0');
  const memoryUtilization = parseFloat(metrics.avg_memory || '0');
  const storageUtilization = parseFloat(metrics.avg_storage || '0');
  const networkUtilization = parseFloat(metrics.avg_network || '0');

  // Calculate efficiency score
  // Higher utilization = better efficiency (up to a point)
  // But too high (>90%) = risk of saturation
  const cpuScore = cpuUtilization > 90 ? 70 : cpuUtilization; // Penalize over-utilization
  const memoryScore = memoryUtilization > 90 ? 70 : memoryUtilization;
  const storageScore = storageUtilization > 90 ? 70 : storageUtilization;
  const networkScore = networkUtilization > 90 ? 70 : networkUtilization;

  const efficiencyScore = (cpuScore + memoryScore + storageScore + networkScore) / 4;

  // Generate recommendations
  const recommendations: string[] = [];

  if (cpuUtilization < 20) {
    recommendations.push('CPU utilization is low. Consider downsizing or consolidating resources.');
  } else if (cpuUtilization > 90) {
    recommendations.push('CPU utilization is very high. Consider scaling up to avoid performance issues.');
  }

  if (memoryUtilization < 20) {
    recommendations.push('Memory utilization is low. Consider reducing allocated memory.');
  } else if (memoryUtilization > 90) {
    recommendations.push('Memory utilization is very high. Consider increasing memory allocation.');
  }

  if (storageUtilization > 80) {
    recommendations.push('Storage is nearly full. Consider cleaning up or expanding storage.');
  }

  if (networkUtilization > 80) {
    recommendations.push('Network utilization is high. Consider optimizing data transfer or upgrading bandwidth.');
  }

  if (efficiencyScore < 30) {
    recommendations.push('Overall resource efficiency is low. Review resource allocation and consider optimization.');
  }

  return {
    resourceId,
    cpuUtilization,
    memoryUtilization,
    storageUtilization,
    networkUtilization,
    efficiencyScore,
    recommendations,
  };
}

/**
 * Get all resources with low efficiency
 */
export async function getLowEfficiencyResources(
  threshold: number = 30
): Promise<ResourceEfficiency[]> {
  const resourcesResult = await query(
    `SELECT DISTINCT resource_id
     FROM monitoring_metrics
     WHERE created_at >= NOW() - INTERVAL '24 hours'`
  );

  const efficiencies = await Promise.all(
    resourcesResult.rows.map(row => analyzeResourceEfficiency(row.resource_id))
  );

  return efficiencies.filter(eff => eff.efficiencyScore < threshold);
}

/**
 * Store efficiency analysis
 */
export async function storeEfficiencyAnalysis(
  efficiency: ResourceEfficiency
): Promise<void> {
  await query(
    `INSERT INTO sustainability_efficiency (
      id, resource_id, cpu_utilization, memory_utilization,
      storage_utilization, network_utilization, efficiency_score,
      recommendations, created_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
    )
    ON CONFLICT (resource_id, DATE(created_at)) DO UPDATE
    SET cpu_utilization = $2, memory_utilization = $3,
        storage_utilization = $4, network_utilization = $5,
        efficiency_score = $6, recommendations = $7, updated_at = NOW()`,
    [
      efficiency.resourceId,
      efficiency.cpuUtilization,
      efficiency.memoryUtilization,
      efficiency.storageUtilization,
      efficiency.networkUtilization,
      efficiency.efficiencyScore,
      JSON.stringify(efficiency.recommendations),
    ]
  );
}

