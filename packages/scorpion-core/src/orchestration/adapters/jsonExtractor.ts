/**
 * Safely extract JSON from LLM response
 * Handles markdown code blocks, extra text, and malformed JSON
 */

/**
 * Detect if the response is a refusal or hallucination (not JSON)
 */
function isRefusalOrHallucination(text: string): boolean {
  const trimmed = text.trim();
  
  // If it starts with JSON-like characters, it's probably JSON (even if malformed)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return false;
  }
  
  // Common refusal patterns (case-insensitive)
  const refusalPatterns = [
    /i can't help/i,
    /i cannot help/i,
    /i'm not able/i,
    /i am not able/i,
    /i don't have/i,
    /i do not have/i,
    /i'm sorry/i,
    /i apologize/i,
    /cannot fulfill/i,
    /unable to/i,
    /not appropriate/i,
    /against.*policy/i,
    /safety concern/i,
    /compromise security/i,
    /is there anything else/i,
    /anything else.*help/i,
  ];
  
  // Check for refusal patterns
  const isRefusal = refusalPatterns.some(pattern => pattern.test(text));
  if (isRefusal) {
    return true;
  }
  
  // Check if it looks like natural language response (not JSON)
  const naturalLanguageIndicators = [
    /^Based on/i,
    /^Here are/i,
    /^Here is/i,
    /^\d+\.\s/, // Numbered list at start
    /^The price of/i,
    /^According to/i,
    /^In summary/i,
    /^To answer/i,
  ];
  
  const looksLikeNaturalLanguage = naturalLanguageIndicators.some(pattern => pattern.test(trimmed));
  
  // If it doesn't start with JSON and has natural language indicators, it's not JSON
  return looksLikeNaturalLanguage;
}

/**
 * Extract JSON from a string that may contain markdown code blocks or extra text
 */
export function safeExtractJson(text: string): any {
  if (!text || typeof text !== 'string') {
    throw new Error('Input is not a string');
  }
  
  // Check if this looks like a refusal or hallucination before trying to parse
  if (isRefusalOrHallucination(text)) {
    throw new Error(`Model returned natural language instead of JSON. Response appears to be a refusal or hallucination: ${text.substring(0, 200)}...`);
  }
  
  // Try to find JSON in markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      // Continue to other methods
    }
  }
  
  // Try to find JSON object/array boundaries
  // Only match if it looks like actual JSON (starts with { or [)
  const jsonMatch = text.match(/^[\s]*(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Try to repair common JSON issues
      return repairJson(jsonMatch[1]);
    }
  }
  
  // Also try to find JSON that might be in the middle but is clearly JSON
  // (starts with { or [ and has proper structure)
  const embeddedJsonMatch = text.match(/(\{[\s\S]{20,}\}|\[[\s\S]{20,}\])/);
  if (embeddedJsonMatch) {
    const candidate = embeddedJsonMatch[1];
    // Only try if it looks like it could be valid JSON (has quotes, colons, etc.)
    if (candidate.includes('"') && candidate.includes(':')) {
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // Try to repair
        try {
          return repairJson(candidate);
        } catch (e2) {
          // If repair fails, continue to next method
        }
      }
    }
  }
  
  // Try parsing the whole string
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // Last resort: try to repair
    return repairJson(text);
  }
}

/**
 * Simple JSON repair for common issues
 * - Unclosed strings
 * - Trailing commas
 * - Unquoted keys
 * - Single quotes instead of double quotes
 */
function repairJson(text: string): any {
  let repaired = text.trim();
  
  // Remove markdown code block markers if present
  repaired = repaired.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
  
  // Fix single quotes to double quotes (but preserve escaped quotes)
  repaired = repaired.replace(/(?<!\\)'/g, '"');
  
  // Fix unquoted keys (simple heuristic: word before colon)
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  
  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Try to balance braces/brackets (simple approach)
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  
  if (openBraces > closeBraces) {
    repaired += '}'.repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    repaired += ']'.repeat(openBrackets - closeBrackets);
  }
  
  try {
    return JSON.parse(repaired);
  } catch (e) {
    // If repair fails, try jsonrepair if available (optional dependency)
    // Use dynamic import to avoid build-time errors
    if (typeof require !== 'undefined' && typeof window === 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const jsonrepair = require('jsonrepair');
        if (jsonrepair && typeof jsonrepair === 'function') {
          return JSON.parse(jsonrepair(repaired));
        }
      } catch (e2) {
        // jsonrepair not available or failed - continue to throw original error
      }
    }
    
    // Check one more time if this looks like a refusal/hallucination
    if (isRefusalOrHallucination(text)) {
      throw new Error(`Model returned natural language instead of JSON. Response appears to be a refusal or hallucination: ${text.substring(0, 200)}...`);
    }
    
    throw new Error(`Failed to extract valid JSON from: ${text.substring(0, 200)}...`);
  }
}

