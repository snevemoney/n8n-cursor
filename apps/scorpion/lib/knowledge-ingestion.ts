/**
 * Knowledge Base Ingestion
 * Ingests comprehensive knowledge base markdown files into RAG
 */

import fs from 'fs/promises';
import path from 'path';
import { RAGStore } from '@scorpion/core';

export interface KnowledgeDomain {
  name: string;
  file: string;
  domain: string;
  description: string;
}

const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  {
    name: 'Data Analytics',
    file: 'data-analytics.md',
    domain: 'data-analytics',
    description: 'Analytics hierarchy, visualization, ML pipelines, metrics'
  },
  {
    name: 'System Design',
    file: 'system-design.md',
    domain: 'system-design',
    description: 'Architecture patterns, scalability, design patterns'
  },
  {
    name: 'AI Tools Hierarchy',
    file: 'ai-tools-hierarchy.md',
    domain: 'ai-tools',
    description: 'AI tool classification, agent design patterns, frameworks'
  },
  {
    name: 'Business Strategy',
    file: 'business-strategy.md',
    domain: 'business-strategy',
    description: 'Business models, GTM, pricing, competitive analysis, fundraising'
  },
  {
    name: 'Python Programming',
    file: 'python-programming.md',
    domain: 'python',
    description: 'Python fundamentals, best practices, libraries, testing'
  }
];

export class KnowledgeIngestionService {
  private knowledgeDir: string;
  private ingested = new Set<string>();

  constructor(private ragStore: RAGStore) {
    this.knowledgeDir = path.join(process.cwd(), '../../docs/knowledge');
  }

  /**
   * Ingest all knowledge base files into RAG
   */
  async ingestAll(): Promise<void> {
    console.log('📚 Starting knowledge base ingestion...');

    for (const domain of KNOWLEDGE_DOMAINS) {
      await this.ingestDomain(domain);
    }

    console.log(`✅ Knowledge base ingestion complete! Ingested ${this.ingested.size} domains.`);
  }

  /**
   * Ingest a single knowledge domain
   */
  async ingestDomain(domain: KnowledgeDomain): Promise<void> {
    try {
      const filePath = path.join(this.knowledgeDir, domain.file);
      
      console.log(`📖 Ingesting: ${domain.name} (${domain.domain})`);

      // Read the markdown file
      const content = await fs.readFile(filePath, 'utf-8');

      // Split into sections (by ## headers)
      const sections = this.splitIntoSections(content);

      console.log(`  └─ Found ${sections.length} sections`);

      // Ingest each section as a separate document
      for (const section of sections) {
        await this.ragStore.addDocument({
          content: section.content,
          metadata: {
            type: 'knowledge',
            domain: domain.domain,
            title: section.title,
            source: domain.file,
            timestamp: new Date().toISOString()
          }
        });
      }

      this.ingested.add(domain.domain);
      console.log(`✅ Ingested: ${domain.name}`);

    } catch (error: any) {
      console.error(`❌ Failed to ingest ${domain.name}:`, error.message);
    }
  }

  /**
   * Split markdown content into sections by headers
   */
  private splitIntoSections(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    const lines = content.split('\n');

    let currentSection: { title: string; content: string } | null = null;

    for (const line of lines) {
      // Check for ## header (section start)
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: line.substring(3).trim(),
          content: line + '\n'
        };
      } else if (currentSection) {
        // Add line to current section
        currentSection.content += line + '\n';
      } else {
        // Before first section (likely title and intro)
        if (line.startsWith('# ')) {
          currentSection = {
            title: line.substring(2).trim(),
            content: line + '\n'
          };
        }
      }
    }

    // Save last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Check if all domains are ingested
   */
  async isIngested(): Promise<boolean> {
    return this.ingested.size === KNOWLEDGE_DOMAINS.length;
  }

  /**
   * Get ingestion status
   */
  getStatus() {
    return {
      total: KNOWLEDGE_DOMAINS.length,
      ingested: this.ingested.size,
      domains: KNOWLEDGE_DOMAINS.map(d => ({
        name: d.name,
        domain: d.domain,
        status: this.ingested.has(d.domain) ? 'ingested' : 'pending'
      }))
    };
  }
}

