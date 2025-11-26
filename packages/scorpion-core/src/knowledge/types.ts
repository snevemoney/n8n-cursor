/**
 * Knowledge extraction types
 */

export interface ExtractedKnowledge {
  id: string;
  source: string; // Side hustle ID
  type: 'architecture' | 'feature' | 'pattern' | 'integration' | 'best-practice';
  category: string; // e.g., 'multi-tenant', 'payment', 'chatbot'
  title: string;
  description: string;
  codeSnippets: {
    file: string;
    language: string;
    code: string;
    explanation: string;
  }[];
  patterns: string[]; // Reusable patterns identified
  dependencies: string[]; // Required dependencies
  useCases: string[]; // When to use this knowledge
  tags: string[];
  extractedAt: string;
  // File path information for project files
  filePath?: string; // Primary file path (from first codeSnippet if available)
  contentUrl?: string; // URL or path to content file
}

