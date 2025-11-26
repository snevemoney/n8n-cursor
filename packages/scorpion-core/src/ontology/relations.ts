/**
 * Relationship Management
 * Defines and manages relationships between ontology entities
 */

import { EntityRelation, EntityType } from './schema';
import { OntologyEntity } from './types';

export interface RelationshipRule {
  fromType: EntityType;
  toType: EntityType;
  relation: string;
  bidirectional?: boolean;
  autoCreate?: boolean; // Auto-create reverse relation
}

export const relationshipRules: RelationshipRule[] = [
  {
    fromType: 'Workflow',
    toType: 'Project',
    relation: 'belongs_to',
    bidirectional: true,
    autoCreate: true
  },
  {
    fromType: 'Decision',
    toType: 'Project',
    relation: 'affects',
    bidirectional: false
  },
  {
    fromType: 'Decision',
    toType: 'Workflow',
    relation: 'triggers',
    bidirectional: false
  },
  {
    fromType: 'Metric',
    toType: 'Workflow',
    relation: 'measures',
    bidirectional: false
  },
  {
    fromType: 'Metric',
    toType: 'Project',
    relation: 'tracks',
    bidirectional: false
  },
  {
    fromType: 'Knowledge',
    toType: 'Project',
    relation: 'extracted_from',
    bidirectional: false
  }
];

/**
 * Create a relationship between two entities
 */
export function createRelation(
  from: OntologyEntity,
  to: OntologyEntity,
  relation: string,
  metadata?: Record<string, any>
): EntityRelation {
  const rule = relationshipRules.find(r => 
    r.fromType === from.type &&
    r.toType === to.type &&
    r.relation === relation
  );

  if (!rule) {
    throw new Error(`Invalid relationship: ${from.type} --${relation}--> ${to.type}`);
  }

  return {
    from: from.id,
    fromType: from.type,
    to: to.id,
    toType: to.type,
    relation,
    strength: 1.0,
    metadata
  };
}

