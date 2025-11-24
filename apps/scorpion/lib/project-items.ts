/**
 * Project Items Schema
 * Structured data for tech debt and missing features tracking
 */

export type ProjectItemType = 'tech_debt' | 'missing_feature';

export type ProjectItemSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ProjectItemPriority = 'p0' | 'p1' | 'p2';

export interface ProjectItem {
  id: string;               // Stable ID, e.g. "planner-max-tokens-001"
  type: ProjectItemType;    // 'tech_debt' | 'missing_feature'
  severity?: ProjectItemSeverity;  // For tech_debt
  priority?: ProjectItemPriority;  // For missing_feature
  area: string;             // e.g. "planner_pipeline", "ui.chat", "rag.knowledge"
  title: string;            // Short human-readable title
  description: string;      // 1–3 sentence explanation
  status: 'open' | 'in_progress' | 'done';
  source?: string;          // Where it was found (file path, comment, etc.)
  createdAt?: string;       // ISO timestamp
  updatedAt?: string;       // ISO timestamp
}

/**
 * Load project items from JSON file
 */
export async function loadProjectItems(): Promise<ProjectItem[]> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'project-items.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data) as ProjectItem[];
  } catch (error) {
    // File doesn't exist yet or can't be read - return empty array
    return [];
  }
}

/**
 * Calculate counts from project items
 */
export function calculateProjectItemCounts(items: ProjectItem[]): {
  techDebt: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  missingFeatures: {
    p0: number;
    p1: number;
    p2: number;
  };
} {
  // Filter to only open items
  const openItems = items.filter(item => item.status !== 'done');
  
  const techDebtItems = openItems.filter(item => item.type === 'tech_debt');
  const missingFeatureItems = openItems.filter(item => item.type === 'missing_feature');
  
  return {
    techDebt: {
      total: techDebtItems.length,
      critical: techDebtItems.filter(item => item.severity === 'critical').length,
      high: techDebtItems.filter(item => item.severity === 'high').length,
      medium: techDebtItems.filter(item => item.severity === 'medium').length,
      low: techDebtItems.filter(item => item.severity === 'low').length,
    },
    missingFeatures: {
      p0: missingFeatureItems.filter(item => item.priority === 'p0').length,
      p1: missingFeatureItems.filter(item => item.priority === 'p1').length,
      p2: missingFeatureItems.filter(item => item.priority === 'p2').length,
    },
  };
}

