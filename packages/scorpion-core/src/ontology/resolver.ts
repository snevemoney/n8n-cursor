/**
 * Ontology Resolver
 * Converts entities to semantic descriptions for AI agents
 */

import { ontologySchema, EntityType } from './schema';
import { OntologyEntity } from './types';

/**
 * Describe an entity in natural language for AI context
 */
export function describeEntity(entity: OntologyEntity): string {
  const schema = ontologySchema[entity.type];
  if (!schema) {
    return `${entity.type}(${entity.id})`;
  }

  const fields = schema.fields.filter(f => entity.data[f] !== undefined);
  const descriptions = fields.map(field => {
    const value = entity.data[field];
    if (Array.isArray(value)) {
      return `${field}: [${value.length} items]`;
    }
    if (typeof value === 'object' && value !== null) {
      return `${field}: {object}`;
    }
    return `${field}: ${value}`;
  });

  return `${entity.type}(${entity.id}) → ${descriptions.join(', ')}`;
}

/**
 * Describe multiple entities with relationships
 */
export function describeEntities(entities: OntologyEntity[], maxLength: number = 2000): string {
  let description = '';
  
  for (const entity of entities) {
    const entityDesc = describeEntity(entity);
    if (description.length + entityDesc.length > maxLength) {
      description += `\n... and ${entities.length - entities.indexOf(entity)} more entities`;
      break;
    }
    description += entityDesc + '\n';
  }

  return description.trim();
}

/**
 * Format entity for Council context
 */
export function formatForCouncil(entity: OntologyEntity, memberRole?: string): string {
  const schema = ontologySchema[entity.type];
  const relevantFields = memberRole 
    ? getRelevantFieldsForRole(entity.type, memberRole, schema)
    : schema.fields;

  const context: Record<string, any> = {
    type: entity.type,
    id: entity.id
  };

  relevantFields.forEach(field => {
    if (entity.data[field] !== undefined) {
      context[field] = entity.data[field];
    }
  });

  return JSON.stringify(context, null, 2);
}

/**
 * Get fields relevant to a council member's role
 */
function getRelevantFieldsForRole(
  entityType: EntityType,
  role: string,
  schema: any
): string[] {
  // Role-specific field preferences
  const roleFields: Record<string, Record<string, string[]>> = {
    Architect: {
      Project: ['name', 'description', 'status', 'tags'],
      Workflow: ['name', 'trigger', 'actions', 'status'],
      Decision: ['topic', 'councilScore', 'summary']
    },
    Analyst: {
      Metric: ['source', 'value', 'unit', 'timestamp', 'category'],
      Decision: ['topic', 'councilScore', 'consensus', 'outcome'],
      Knowledge: ['title', 'description', 'category', 'tags']
    },
    Engineer: {
      Workflow: ['name', 'trigger', 'actions', 'outcome', 'error'],
      Project: ['name', 'status', 'repo'],
      Decision: ['actionItems', 'summary']
    },
    Safety: {
      Decision: ['topic', 'councilScore', 'summary', 'outcome'],
      Workflow: ['status', 'outcome', 'error'],
      Project: ['status', 'tags']
    }
  };

  const roleKey = role.includes('Architect') ? 'Architect' :
                  role.includes('Analyst') || role.includes('RAG') ? 'Analyst' :
                  role.includes('Engineer') || role.includes('Execution') ? 'Engineer' :
                  role.includes('Safety') || role.includes('Alignment') ? 'Safety' :
                  null;

  if (roleKey && roleFields[roleKey] && roleFields[roleKey][entityType]) {
    return roleFields[roleKey][entityType];
  }

  return schema.fields; // Fallback to all fields
}

/**
 * Extract relationships from entity data
 */
export function extractRelations(entity: OntologyEntity): string[] {
  const relations: string[] = [];
  const schema = ontologySchema[entity.type];
  
  if (!schema.relations) return relations;

  schema.relations.forEach(relationType => {
    // Look for fields that reference other entities
    const relationFields = schema.fields.filter(f => 
      f.includes(relationType.toLowerCase()) || 
      f.includes('related' + relationType)
    );

    relationFields.forEach(field => {
      const value = entity.data[field];
      if (value) {
        relations.push(`${entity.type}:${entity.id} → ${relationType}:${value}`);
      }
    });
  });

  return relations;
}

