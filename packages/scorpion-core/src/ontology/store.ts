/**
 * Ontology Store
 * Manages entity storage, retrieval, and relationships
 */

import { OntologyEntity, EntityQuery, EntitySearch } from './types';
import { EntityRelation } from './schema';
import { RAGStore } from '../rag/store';
import { describeEntity, extractRelations } from './resolver';
import { ExtractedKnowledge } from '../knowledge/types';
import { PersistentStore } from '../storage/persistent-store';

export class OntologyStore {
  private entities: Map<string, OntologyEntity> = new Map();
  private relations: Map<string, EntityRelation[]> = new Map();
  private ragStore: RAGStore;
  private persistentStore: PersistentStore;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private dataDir?: string;

  constructor(ragStore: RAGStore, dataDir?: string) {
    this.ragStore = ragStore;
    this.dataDir = dataDir;
    this.persistentStore = new PersistentStore(dataDir);
  }

  /**
   * Initialize and load from disk
   */
  async initialize(): Promise<void> {
    await this.persistentStore.initialize();
    
    // Load from disk
    const saved = await this.persistentStore.loadOntology();
    if (saved) {
      if (saved.entities) {
        for (const [id, entity] of Object.entries(saved.entities)) {
          this.entities.set(id, entity as OntologyEntity);
        }
      }
      if (saved.relations) {
        for (const [id, relations] of Object.entries(saved.relations)) {
          this.relations.set(id, relations as EntityRelation[]);
        }
      }
      console.log(`✅ Loaded ${this.entities.size} ontology entities from disk`);
    }

    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.save();
    }, 30 * 1000);
  }

  /**
   * Save to disk
   */
  private async save(): Promise<void> {
    const data = {
      entities: Object.fromEntries(this.entities),
      relations: Object.fromEntries(this.relations),
      lastSaved: new Date().toISOString()
    };
    await this.persistentStore.saveOntology(data);
  }

  /**
   * Store an entity in the ontology
   */
  async store(entity: OntologyEntity): Promise<void> {
    // Update timestamps
    if (!entity.createdAt) {
      entity.createdAt = new Date();
    }
    entity.updatedAt = new Date();

    // Extract and store relations
    const relationStrings = extractRelations(entity);
    const relations = relationStrings.map(r => this.parseRelation(r, entity));
    if (relations.length > 0) {
      this.relations.set(entity.id, relations);
    }

    // Store entity
    this.entities.set(entity.id, entity);

    // Index in RAG for semantic search
    await this.indexInRAG(entity);

    // Save immediately
    await this.save();
  }

  /**
   * Get entity by ID
   */
  get(id: string): OntologyEntity | undefined {
    return this.entities.get(id);
  }

  /**
   * Query entities
   */
  query(query: EntityQuery): OntologyEntity[] {
    let results = Array.from(this.entities.values());

    // Filter by type
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      results = results.filter(e => types.includes(e.type));
    }

    // Apply filters
    if (query.filters) {
      results = results.filter(entity => {
        return Object.entries(query.filters!).every(([key, value]) => {
          return entity.data[key] === value;
        });
      });
    }

    // Include relations if requested
    if (query.relations && query.relations.length > 0) {
      results = results.map(entity => ({
        ...entity,
        relations: this.getEntityRelations(entity.id)
      }));
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * Search entities semantically
   */
  async search(search: EntitySearch): Promise<OntologyEntity[]> {
    // Use RAG for semantic search
    const ragResults = await this.ragStore.search(search.query, search.limit || 10);
    
    // Map RAG results back to entities
    const entityIds = ragResults
      .map(r => r.id)
      .filter(id => this.entities.has(id));

    const entities = entityIds
      .map(id => this.entities.get(id)!)
      .filter(entity => {
        // Apply type filter if specified
        if (search.types && !search.types.includes(entity.type)) {
          return false;
        }
        // Apply additional filters
        if (search.filters) {
          return Object.entries(search.filters).every(([key, value]) => {
            return entity.data[key] === value;
          });
        }
        return true;
      });

    return entities;
  }

  /**
   * Get related entities
   */
  getRelated(entityId: string, relationType?: string): OntologyEntity[] {
    const relations = this.relations.get(entityId) || [];
    const filtered = relationType 
      ? relations.filter(r => r.relation === relationType)
      : relations;

    return filtered
      .map(r => this.entities.get(r.to))
      .filter((e): e is OntologyEntity => e !== undefined);
  }

  /**
   * Get entity relations
   */
  private getEntityRelations(entityId: string): EntityRelation[] {
    return this.relations.get(entityId) || [];
  }

  /**
   * Index entity in RAG store
   */
  private async indexInRAG(entity: OntologyEntity): Promise<void> {
    const description = describeEntity(entity);
    
    // Convert to ExtractedKnowledge format for RAG
    const knowledge: ExtractedKnowledge = {
      id: entity.id,
      source: 'ontology',
      type: 'pattern',
      category: entity.type,
      title: `${entity.type}: ${entity.data.name || entity.data.title || entity.id}`,
      description: description,
      codeSnippets: [],
      patterns: [],
      dependencies: [],
      useCases: [],
      tags: [entity.type, ...(entity.data.tags || [])],
      extractedAt: entity.createdAt.toISOString()
    };

    await this.ragStore.addKnowledge(knowledge);
  }

  /**
   * Parse relation string to EntityRelation
   */
  private parseRelation(relationStr: string, fromEntity: OntologyEntity): EntityRelation {
    // Parse format: "EntityType:id → RelatedType:relatedId"
    const parts = relationStr.split(' → ');
    if (parts.length !== 2) {
      throw new Error(`Invalid relation format: ${relationStr}`);
    }

    const [fromPart, toPart] = parts;
    const [fromType, fromId] = fromPart.split(':');
    const [toType, toId] = toPart.split(':');

    if (!fromType || !fromId || !toType || !toId) {
      throw new Error(`Invalid relation format: ${relationStr}`);
    }

    return {
      from: fromId,
      fromType: fromType as any,
      to: toId,
      toType: toType as any,
      relation: 'related',
      strength: 1.0
    };
  }
}

