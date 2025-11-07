/**
 * Persistent Storage Layer
 * Ensures memory is never lost - persists to disk
 */

import fs from 'fs/promises';
import path from 'path';

export class PersistentStore {
  private dataDir: string;
  private ragFile: string;
  private ontologyFile: string;
  private trainingFile: string;
  private mistakesFile: string;

  constructor(dataDir: string = './data/scorpion') {
    this.dataDir = dataDir;
    this.ragFile = path.join(dataDir, 'rag-store.json');
    this.ontologyFile = path.join(dataDir, 'ontology-store.json');
    this.trainingFile = path.join(dataDir, 'training-data.json');
    this.mistakesFile = path.join(dataDir, 'mistakes.json');
  }

  /**
   * Initialize persistent storage
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  /**
   * Save RAG store to disk
   */
  async saveRAG(data: any): Promise<void> {
    await fs.writeFile(this.ragFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Load RAG store from disk
   */
  async loadRAG(): Promise<any | null> {
    try {
      const content = await fs.readFile(this.ragFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save ontology to disk
   */
  async saveOntology(data: any): Promise<void> {
    await fs.writeFile(this.ontologyFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Load ontology from disk
   */
  async loadOntology(): Promise<any | null> {
    try {
      const content = await fs.readFile(this.ontologyFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save training data
   */
  async saveTrainingData(data: any): Promise<void> {
    await fs.writeFile(this.trainingFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Load training data
   */
  async loadTrainingData(): Promise<any | null> {
    try {
      const content = await fs.readFile(this.trainingFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save mistakes log
   */
  async saveMistakes(mistakes: any[]): Promise<void> {
    await fs.writeFile(this.mistakesFile, JSON.stringify(mistakes, null, 2), 'utf-8');
  }

  /**
   * Load mistakes log
   */
  async loadMistakes(): Promise<any[]> {
    try {
      const content = await fs.readFile(this.mistakesFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Append mistake (append-only log)
   */
  async appendMistake(mistake: any): Promise<void> {
    const mistakes = await this.loadMistakes();
    mistakes.push({
      ...mistake,
      timestamp: new Date().toISOString(),
      id: `mistake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    await this.saveMistakes(mistakes);
  }
}

