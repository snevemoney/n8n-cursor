// Sustainability Goals Management
// Track and monitor sustainability targets

import { query } from '@/lib/db/client';
import type { SustainabilityGoal } from './types';
import { getCarbonSummary } from './carbon-tracker';

/**
 * Create a sustainability goal
 */
export async function createSustainabilityGoal(
  goal: Omit<SustainabilityGoal, 'id' | 'current' | 'status'>
): Promise<SustainabilityGoal> {
  const id = crypto.randomUUID();
  const current = await getCurrentValue(goal.type);
  const status = calculateStatus(current, goal.target, goal.deadline);

  await query(
    `INSERT INTO sustainability_goals (
      id, name, type, target, current, unit, deadline, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [
      id,
      goal.name,
      goal.type,
      goal.target,
      current,
      goal.unit,
      goal.deadline,
      status,
    ]
  );

  return {
    id,
    ...goal,
    current,
    status,
  };
}

/**
 * Get current value for a goal type
 */
async function getCurrentValue(
  type: SustainabilityGoal['type']
): Promise<number> {
  switch (type) {
    case 'carbon_reduction': {
      const summary = await getCarbonSummary();
      return summary.totalKgCO2;
    }
    case 'energy_efficiency': {
      // Get average efficiency score
      const result = await query(
        `SELECT AVG(efficiency_score) as avg_score
         FROM sustainability_efficiency
         WHERE created_at >= NOW() - INTERVAL '30 days'`
      );
      return parseFloat(result.rows[0]?.avg_score || '0');
    }
    case 'resource_optimization': {
      // Count low-efficiency resources
      const result = await query(
        `SELECT COUNT(*) as count
         FROM sustainability_efficiency
         WHERE efficiency_score < 30
         AND created_at >= NOW() - INTERVAL '30 days'`
      );
      return parseInt(result.rows[0]?.count || '0', 10);
    }
    default:
      return 0;
  }
}

/**
 * Calculate goal status
 */
function calculateStatus(
  current: number,
  target: number,
  deadline: Date
): SustainabilityGoal['status'] {
  const now = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const progress = current / target;
  const requiredProgress = 1 - (daysRemaining / 365); // Assume 1 year timeline

  if (progress <= requiredProgress * 0.8) {
    return 'on_track';
  } else if (progress <= requiredProgress) {
    return 'at_risk';
  } else {
    return 'behind';
  }
}

/**
 * Get all sustainability goals
 */
export async function getSustainabilityGoals(): Promise<SustainabilityGoal[]> {
  const result = await query(
    `SELECT * FROM sustainability_goals
     ORDER BY deadline ASC`
  );

  // Update current values and status
  const goals = await Promise.all(
    result.rows.map(async (row) => {
      const current = await getCurrentValue(row.type as SustainabilityGoal['type']);
      const status = calculateStatus(current, row.target, new Date(row.deadline));

      // Update if changed
      if (current !== row.current || status !== row.status) {
        await query(
          `UPDATE sustainability_goals
           SET current = $1, status = $2, updated_at = NOW()
           WHERE id = $3`,
          [current, status, row.id]
        );
      }

      return {
        id: row.id,
        name: row.name,
        type: row.type,
        target: row.target,
        current,
        unit: row.unit,
        deadline: new Date(row.deadline),
        status,
      } as SustainabilityGoal;
    })
  );

  return goals;
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(
  goalId: string
): Promise<SustainabilityGoal> {
  const result = await query(
    `SELECT * FROM sustainability_goals WHERE id = $1`,
    [goalId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Goal ${goalId} not found`);
  }

  const row = result.rows[0];
  const current = await getCurrentValue(row.type as SustainabilityGoal['type']);
  const status = calculateStatus(current, row.target, new Date(row.deadline));

  await query(
    `UPDATE sustainability_goals
     SET current = $1, status = $2, updated_at = NOW()
     WHERE id = $3`,
    [current, status, goalId]
  );

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    target: row.target,
    current,
    unit: row.unit,
    deadline: new Date(row.deadline),
    status,
  } as SustainabilityGoal;
}

