/**
 * Tolerant JSON parsing helpers for frontier-level determinism
 * Handles malformed JSON, enum mismatches, and model output quirks
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

/**
 * Safely parse JSON from model response
 * Handles markdown code blocks, extra text, and common formatting issues
 */
export function tryParseJSON(raw: string): JsonValue | null {
  if (!raw || typeof raw !== 'string') {
    return null;
  }

  // Try direct parse first
  try {
    return JSON.parse(raw.trim());
  } catch {
    // Continue to other methods
  }

  // Common pattern: model wraps JSON in ```json ... ```
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting JSON object/array from text
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // Last resort: return null
      }
    }
    return null;
  }
}

/**
 * Execution status enum values
 */
export type ExecutionStatus = 'success' | 'failed' | 'skipped';

/**
 * Coerce a raw value to a valid ExecutionStatus
 * Handles cases where model returns "success|failed|skipped" as literal string
 */
export function coerceExecutionStatus(raw: unknown): ExecutionStatus {
  if (!raw) {
    return 'failed'; // Default to failed if missing
  }

  const value = String(raw).toLowerCase().trim();

  // Direct match
  if (value === 'success' || value === 'failed' || value === 'skipped') {
    return value;
  }

  // Handle union type literals like "success|failed|skipped"
  if (value.includes('|')) {
    // If it contains "success", prefer success
    if (value.includes('success')) {
      return 'success';
    }
    // If it contains "failed", prefer failed
    if (value.includes('failed')) {
      return 'failed';
    }
    // If it contains "skipped", use skipped
    if (value.includes('skipped')) {
      return 'skipped';
    }
  }

  // Partial matches
  if (value.includes('success')) {
    return 'success';
  }
  if (value.includes('failed')) {
    return 'failed';
  }
  if (value.includes('skipped')) {
    return 'skipped';
  }

  // Ultimate fallback
  return 'failed';
}

/**
 * Safety guard issue categories
 */
export const SAFETY_ENUM = [
  'privacy',
  'security',
  'copyright',
  'self-harm',
  'illegal',
  'medical',
  'financial_misuse',
] as const;

export type SafetyCategory = (typeof SAFETY_ENUM)[number];

/**
 * FRONTIER-LEVEL: Issue mapping for safety guard
 * Maps invalid values (like "unsafe") to valid enum values
 * This prevents hard crashes when models return creative values
 */
const ISSUE_MAP: Record<string, SafetyCategory> = {
  // Direct invalid values
  unsafe: 'security',
  inappropriate: 'security',
  harmful: 'security',
  danger: 'security',
  dangerous: 'security',
  
  // Privacy-related
  pii: 'privacy',
  personal: 'privacy',
  personal_data: 'privacy',
  
  // Security-related
  security_risk: 'security',
  vulnerability: 'security',
  exploit: 'security',
  
  // Copyright-related
  ip: 'copyright',
  intellectual_property: 'copyright',
  license: 'copyright',
  licensing: 'copyright',
  
  // Self-harm related
  suicide: 'self-harm',
  self_injury: 'self-harm',
  self_injure: 'self-harm',
  
  // Illegal related
  crime: 'illegal',
  criminal: 'illegal',
  law: 'illegal',
  unlawful: 'illegal',
  
  // Medical related
  health: 'medical',
  diagnosis: 'medical',
  medical_advice: 'medical',
  
  // Financial related
  money: 'financial_misuse',
  fraud: 'financial_misuse',
  scam: 'financial_misuse',
  financial_fraud: 'financial_misuse',
};

/**
 * Normalize a safety issue category
 * Maps invalid values (like "unsafe") to valid enum values
 */
export function normalizeSafetyCategory(raw: unknown): SafetyCategory {
  if (!raw) {
    return 'security'; // Default to security for unknown issues
  }

  const value = String(raw).toLowerCase().trim();

  // Direct match
  if (SAFETY_ENUM.includes(value as SafetyCategory)) {
    return value as SafetyCategory;
  }

  // Check ISSUE_MAP first (exact matches)
  if (ISSUE_MAP[value]) {
    return ISSUE_MAP[value];
  }

  // Partial matches (fallback for variations)
  if (value.includes('privacy') || value.includes('pii') || value.includes('personal')) {
    return 'privacy';
  }
  if (value.includes('security') || value.includes('unsafe') || value.includes('danger')) {
    return 'security';
  }
  if (value.includes('copyright') || value.includes('ip') || value.includes('license')) {
    return 'copyright';
  }
  if (value.includes('self-harm') || value.includes('suicide') || value.includes('self-injury')) {
    return 'self-harm';
  }
  if (value.includes('illegal') || value.includes('crime') || value.includes('law')) {
    return 'illegal';
  }
  if (value.includes('medical') || value.includes('health') || value.includes('diagnosis')) {
    return 'medical';
  }
  if (value.includes('financial') || value.includes('money') || value.includes('fraud')) {
    return 'financial_misuse';
  }

  // Ultimate fallback
  return 'security';
}

/**
 * Sanitize safety guard response
 * Normalizes issues array and ensures all fields are valid
 */
export function sanitizeSafetyGuardResponse(data: any): {
  allowed: boolean;
  issues: SafetyCategory[];
  redactions: Array<{ type: 'secret' | 'pii'; placeholder: string }>;
  safeAlternative: string | null;
} {
  const fallback = {
    allowed: true,
    issues: [] as SafetyCategory[],
    redactions: [] as Array<{ type: 'secret' | 'pii'; placeholder: string }>,
    safeAlternative: null as string | null,
  };

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  // Normalize allowed field
  const allowed = data.allowed !== false; // Default to true if missing or false

  // Normalize issues array
  const issues: SafetyCategory[] = [];
  const rawIssues = Array.isArray(data.issues) ? data.issues : [];

  for (const issue of rawIssues) {
    if (!issue) continue;

    // Handle different formats: string, object with category/received field, etc.
    let category: SafetyCategory;
    if (typeof issue === 'string') {
      category = normalizeSafetyCategory(issue);
    } else if (issue.category || issue.received) {
      category = normalizeSafetyCategory(issue.category || issue.received);
    } else {
      continue; // Skip invalid issue format
    }

    issues.push(category);
  }

  // Normalize redactions array
  const redactions: Array<{ type: 'secret' | 'pii'; placeholder: string }> = [];
  const rawRedactions = Array.isArray(data.redactions) ? data.redactions : [];

  for (const redaction of rawRedactions) {
    if (!redaction || typeof redaction !== 'object') continue;

    const type = redaction.type === 'pii' ? 'pii' : 'secret';
    const placeholder = String(redaction.placeholder || redaction.text || '[REDACTED]');

    redactions.push({ type, placeholder });
  }

  // Normalize safeAlternative
  const safeAlternative = typeof data.safeAlternative === 'string' ? data.safeAlternative : null;

  return {
    allowed,
    issues,
    redactions,
    safeAlternative,
  };
}

