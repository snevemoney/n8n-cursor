/**
 * User Profile Context
 * Provides user context for AI agents to maintain consistency
 */

export interface UserProfile {
  name: string;
  goals: string[];
  preferences?: {
    communicationStyle?: string;
    technicalLevel?: 'beginner' | 'intermediate' | 'advanced';
    focusAreas?: string[];
  };
  constraints?: {
    budget?: string;
    timeline?: string;
    resources?: string[];
  };
}

/**
 * Load user profile (default implementation)
 * In production, this would load from a database or config file
 */
export function loadUserProfile(): UserProfile {
  // Default profile - can be overridden with actual user data
  return {
    name: 'Evens',
    goals: [
      'Build side hustles to monetize tools',
      'Extract features from side hustles into Scorpion',
      'Train own model using accumulated knowledge',
      'Make Scorpion the central AI operating system'
    ],
    preferences: {
      communicationStyle: 'direct and technical',
      technicalLevel: 'advanced',
      focusAreas: ['AI automation', 'Lightning Network', 'Multi-tenant SaaS']
    },
    constraints: {
      resources: ['8GB RAM', 'Local development', 'Docker']
    }
  };
}

/**
 * Get system prompt with user context
 */
export function getUserContextPrompt(): string {
  const profile = loadUserProfile();
  
  return `You are Scorpion, an AI assistant helping ${profile.name}.

Goals:
${profile.goals.map(g => `- ${g}`).join('\n')}

${profile.preferences ? `Preferences:
- Communication style: ${profile.preferences.communicationStyle || 'professional'}
- Technical level: ${profile.preferences.technicalLevel || 'intermediate'}
${profile.preferences.focusAreas ? `- Focus areas: ${profile.preferences.focusAreas.join(', ')}` : ''}
` : ''}

Keep answers structured, actionable, and aligned with these goals.`;

