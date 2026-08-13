import { Lead } from './types';

interface QualifyResult {
  temperature: 'hot' | 'warm' | 'cold';
  aiSuggestedTag?: string;
}

export function qualifyLead(data: {
  phone: string;
  goal: string;
  urgency: string;
}): QualifyResult {
  const hasPhone = data.phone.trim().length >= 7;
  const hasGoal = data.goal.trim().length > 0;
  const isUrgent = data.urgency === 'high';

  if (hasPhone && hasGoal) {
    const tag = suggestTag(data.goal);
    return { temperature: 'hot', aiSuggestedTag: tag };
  }

  if (hasGoal || hasPhone) {
    return { temperature: 'warm' };
  }

  return { temperature: 'cold' };
}

function suggestTag(goal: string): string | undefined {
  const lower = goal.toLowerCase();
  if (lower.includes('scale') || lower.includes('growth')) return 'Growth';
  if (lower.includes('automat') || lower.includes('workflow')) return 'Automation';
  if (lower.includes('lead') || lower.includes('sales')) return 'Sales';
  if (lower.includes('market')) return 'Marketing';
  return undefined;
}
