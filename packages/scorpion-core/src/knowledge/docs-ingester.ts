/**
 * Documentation Ingester
 * Extracts documentation, tech debt, missing features, and guides
 */

import { ExtractedKnowledge } from './types';
import fs from 'fs/promises';
import path from 'path';

export class DocumentationIngester {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Extract documentation knowledge
   */
  async extractDocumentationKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const docsDir = path.join(this.workspaceRoot, 'docs');

      // Extract tech debt knowledge
      const techDebt = await this.extractTechDebt(docsDir);
      knowledge.push(...techDebt);

      // Extract guides knowledge
      const guides = await this.extractGuides(docsDir);
      knowledge.push(...guides);

      // Extract general documentation
      const generalDocs = await this.extractGeneralDocs(docsDir);
      knowledge.push(...generalDocs);

      // Extract missing features
      const missingFeatures = await this.extractMissingFeatures(docsDir);
      knowledge.push(...missingFeatures);

    } catch (error) {
      console.error('Error extracting documentation knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract tech debt information
   */
  private async extractTechDebt(docsDir: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const techDebtDir = path.join(docsDir, 'tech-debt');
      const files = await this.findMarkdownFiles(techDebtDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file, '.md');

          // Extract priority and status from content
          let priorityMatch = content.match(/Priority[:\s]+(P0|P1|P2|Critical|High|Medium|Low)/i);
          let statusMatch = content.match(/Status[:\s]+(\w+)/i);
          
          // If no explicit priority, infer from content patterns
          if (!priorityMatch) {
            // Check for critical indicators
            if (content.match(/\b(critical|urgent|blocking|p0|security|vulnerability)\b/i)) {
              priorityMatch = ['', 'Critical'];
            }
            // Check for high priority indicators
            else if (content.match(/\b(high|important|p1|performance|bug)\b/i)) {
              priorityMatch = ['', 'High'];
            }
            // Check for medium priority indicators
            else if (content.match(/\b(medium|moderate|p2|enhancement|improvement)\b/i)) {
              priorityMatch = ['', 'Medium'];
            }
            // Check for low priority or completed items
            else if (content.match(/\b(low|nice to have|completed|done|fixed|resolved|consolidated)\b/i)) {
              priorityMatch = ['', 'Low'];
            }
          }
          
          // If no explicit status, infer from content
          if (!statusMatch) {
            if (content.match(/\b(completed|done|fixed|resolved|consolidated|✅)\b/i)) {
              statusMatch = ['', 'Completed'];
            } else if (content.match(/\b(deferred|pending|in progress|⏸️)\b/i)) {
              statusMatch = ['', 'Deferred'];
            } else if (content.match(/\b(active|open|todo|⚠️)\b/i)) {
              statusMatch = ['', 'Active'];
            }
          }
          
          const priority = priorityMatch ? priorityMatch[1] : 'Medium'; // Default to Medium instead of Unknown
          const status = statusMatch ? statusMatch[1] : 'Unknown';

          knowledge.push({
            id: `tech-debt-${fileName}`,
            source: 'docs',
            type: 'best-practice',
            category: 'tech-debt',
            title: `Tech Debt: ${fileName}`,
            description: `Tech debt item: ${fileName} (Priority: ${priority}, Status: ${status})`,
            codeSnippets: [{
              file: relativePath,
              language: 'markdown',
              code: content.substring(0, 2000),
              explanation: `Tech debt documentation: ${fileName}`
            }],
            patterns: [
              `Priority: ${priority}`,
              `Status: ${status}`,
              'Technical debt tracking'
            ],
            dependencies: [],
            useCases: [
              'Tech debt management',
              'Prioritization',
              'Refactoring planning',
              'Code quality improvement'
            ],
            tags: ['tech-debt', priority.toLowerCase(), status.toLowerCase(), fileName],
            extractedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error reading tech debt file ${file}:`, error);
        }
      }
    } catch (error) {
      // Tech debt directory might not exist
    }

    return knowledge;
  }

  /**
   * Extract guides
   */
  private async extractGuides(docsDir: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const guidesDir = path.join(docsDir, 'guides');
      const files = await this.findMarkdownFiles(guidesDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file, '.md');

          // Extract title from first heading
          const titleMatch = content.match(/^#+\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : fileName;

          knowledge.push({
            id: `guide-${fileName}`,
            source: 'docs',
            type: 'best-practice',
            category: 'guide',
            title: `Guide: ${title}`,
            description: `Development guide: ${title}`,
            codeSnippets: [{
              file: relativePath,
              language: 'markdown',
              code: content.substring(0, 2000),
              explanation: `Development guide: ${title}`
            }],
            patterns: [
              'Development guide',
              'Best practices',
              'Setup instructions'
            ],
            dependencies: [],
            useCases: [
              'Developer onboarding',
              'Setup procedures',
              'Best practices',
              'Troubleshooting'
            ],
            tags: ['guide', 'documentation', fileName],
            extractedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error reading guide file ${file}:`, error);
        }
      }
    } catch (error) {
      // Guides directory might not exist
    }

    return knowledge;
  }

  /**
   * Extract general documentation
   */
  private async extractGeneralDocs(docsDir: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const files = await this.findMarkdownFiles(docsDir);

      for (const file of files) {
        // Skip tech-debt and guides (already processed)
        if (file.includes('tech-debt') || file.includes('guides')) {
          continue;
        }

        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file, '.md');

          // Extract title from first heading
          const titleMatch = content.match(/^#+\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : fileName;

          knowledge.push({
            id: `doc-${fileName}`,
            source: 'docs',
            type: 'best-practice',
            category: 'documentation',
            title: title,
            description: `Documentation: ${title}`,
            codeSnippets: [{
              file: relativePath,
              language: 'markdown',
              code: content.substring(0, 2000),
              explanation: `Documentation: ${title}`
            }],
            patterns: [
              'Documentation',
              'Project knowledge',
              'Information'
            ],
            dependencies: [],
            useCases: [
              'Project understanding',
              'Reference material',
              'Knowledge base'
            ],
            tags: ['documentation', fileName],
            extractedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error reading doc file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error extracting general docs:', error);
    }

    return knowledge;
  }

  /**
   * Extract missing features information
   */
  private async extractMissingFeatures(docsDir: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Look for MISSING_COMPONENTS_ROADMAP.md or similar files
      const files = await this.findMarkdownFiles(docsDir);
      const missingFeatureFiles = files.filter(f => 
        f.toLowerCase().includes('missing') || 
        f.toLowerCase().includes('roadmap') ||
        f.toLowerCase().includes('todo')
      );

      for (const file of missingFeatureFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file, '.md');

          // Extract P0, P1, P2 features
          const p0Matches = content.match(/P0|🔴|CRITICAL/gi) || [];
          const p1Matches = content.match(/P1|🟡|HIGH/gi) || [];
          const p2Matches = content.match(/P2|🟢|MEDIUM/gi) || [];

          knowledge.push({
            id: `missing-features-${fileName}`,
            source: 'docs',
            type: 'feature',
            category: 'missing-features',
            title: `Missing Features: ${fileName}`,
            description: `Missing features roadmap: ${p0Matches.length} P0, ${p1Matches.length} P1, ${p2Matches.length} P2`,
            codeSnippets: [{
              file: relativePath,
              language: 'markdown',
              code: content.substring(0, 3000),
              explanation: `Missing features documentation: ${fileName}`
            }],
            patterns: [
              `P0: ${p0Matches.length}`,
              `P1: ${p1Matches.length}`,
              `P2: ${p2Matches.length}`,
              'Feature planning',
              'Roadmap'
            ],
            dependencies: [],
            useCases: [
              'Feature planning',
              'Prioritization',
              'Development roadmap',
              'Product planning'
            ],
            tags: ['missing-features', 'roadmap', 'planning', fileName],
            extractedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error reading missing features file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error extracting missing features:', error);
    }

    return knowledge;
  }

  /**
   * Find all markdown files recursively
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return files;
  }
}

