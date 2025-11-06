/**
 * Scorpion Ontology Schema
 * Defines all entity types and their relationships in the system
 */

export interface EntitySchema {
  fields: string[];
  relations?: string[]; // Related entity types
  required?: string[]; // Required fields
  indexed?: string[]; // Fields to index for search
}

export const ontologySchema: Record<string, EntitySchema> = {
  Project: {
    fields: ['id', 'name', 'description', 'repo', 'status', 'tags', 'createdAt', 'updatedAt'],
    relations: ['Workflow', 'Decision', 'Metric'],
    required: ['id', 'name', 'status'],
    indexed: ['name', 'description', 'tags']
  },
  Workflow: {
    fields: ['id', 'name', 'trigger', 'actions', 'owner', 'status', 'outcome', 'executionTime', 'error', 'relatedProject', 'createdAt', 'updatedAt'],
    relations: ['Project', 'Decision', 'Metric'],
    required: ['id', 'name', 'trigger'],
    indexed: ['name', 'trigger', 'status', 'outcome']
  },
  Agent: {
    fields: ['id', 'name', 'role', 'tools', 'confidence', 'memory', 'specialty', 'weight', 'goal', 'createdAt'],
    relations: ['Decision', 'Workflow'],
    required: ['id', 'name', 'role'],
    indexed: ['name', 'role', 'specialty']
  },
  Decision: {
    fields: ['id', 'topic', 'councilScore', 'consensus', 'members', 'timestamp', 'summary', 'actionItems', 'relatedProject', 'relatedWorkflow', 'outcome'],
    relations: ['Project', 'Workflow', 'Agent'],
    required: ['id', 'topic', 'councilScore', 'timestamp'],
    indexed: ['topic', 'summary', 'outcome']
  },
  Metric: {
    fields: ['id', 'source', 'value', 'unit', 'timestamp', 'category', 'relatedProject', 'relatedWorkflow', 'metadata'],
    relations: ['Project', 'Workflow'],
    required: ['id', 'source', 'value', 'timestamp'],
    indexed: ['source', 'category', 'timestamp']
  },
  Knowledge: {
    fields: ['id', 'source', 'type', 'category', 'title', 'description', 'codeSnippets', 'patterns', 'dependencies', 'useCases', 'tags', 'extractedAt'],
    relations: ['Project'],
    required: ['id', 'source', 'type', 'title'],
    indexed: ['title', 'description', 'category', 'tags']
  },
  SideHustle: {
    fields: ['id', 'name', 'description', 'domain', 'localDomain', 'status', 'category', 'features', 'learnings', 'tenantId'],
    relations: ['Project', 'Workflow', 'Knowledge'],
    required: ['id', 'name', 'status'],
    indexed: ['name', 'description', 'category']
  }
};

export type EntityType = keyof typeof ontologySchema;

export interface EntityRelation {
  from: string; // Entity ID
  fromType: EntityType;
  to: string; // Entity ID
  toType: EntityType;
  relation: string; // e.g., 'triggers', 'depends_on', 'generates'
  strength?: number; // 0-1, relationship strength
  metadata?: Record<string, any>;
}

