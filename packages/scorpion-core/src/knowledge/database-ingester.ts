/**
 * Database Schema Ingester
 * Extracts database schemas, tables, relationships, and migrations
 */

import { ExtractedKnowledge } from './types';
import { DatabaseSchema } from './project-types';
import fs from 'fs/promises';
import path from 'path';

export class DatabaseIngester {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Extract database knowledge
   */
  async extractDatabaseKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const dbDir = path.join(this.workspaceRoot, 'database');
      const schemasDir = path.join(dbDir, 'schemas');
      const migrationsDir = path.join(dbDir, 'migrations');

      // Extract schema knowledge
      const schemas = await this.extractSchemas(schemasDir);
      knowledge.push(...schemas);

      // Extract migration knowledge
      const migrations = await this.extractMigrations(migrationsDir);
      knowledge.push(...migrations);

      // Extract overall database structure
      knowledge.push({
        id: 'database-overview',
        source: 'database',
        type: 'architecture',
        category: 'database',
        title: 'Database Structure Overview',
        description: `Complete database structure with ${schemas.length} schemas and ${migrations.length} migrations`,
        codeSnippets: [],
        patterns: [
          'PostgreSQL schema organization',
          'Multi-tenant database patterns',
          'Migration management',
          'Schema versioning'
        ],
        dependencies: ['PostgreSQL', 'Supabase'],
        useCases: [
          'Database understanding',
          'Migration planning',
          'Schema evolution',
          'Data modeling'
        ],
        tags: ['database', 'postgresql', 'schema', 'migrations'],
        extractedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error extracting database knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract schemas from database/schemas/
   */
  private async extractSchemas(schemasDir: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const entries = await fs.readdir(schemasDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const schemaPath = path.join(schemasDir, entry.name);
          const schemaFiles = await this.findSQLFiles(schemaPath);

          for (const file of schemaFiles) {
            try {
              const content = await fs.readFile(file, 'utf-8');
              const relativePath = path.relative(this.workspaceRoot, file);
              
              // Extract table names from CREATE TABLE statements
              const tableMatches = content.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["']?(\w+)["']?/gi) || [];
              const tables = tableMatches.map(m => {
                const match = m.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["']?(\w+)["']?/i);
                return match ? match[1] : null;
              }).filter(Boolean) as string[];

              // Extract foreign key relationships
              const fkMatches = content.match(/FOREIGN KEY\s*\([^)]+\)\s*REFERENCES\s+["']?(\w+)["']?/gi) || [];
              const relationships = fkMatches.map(m => {
                const match = m.match(/REFERENCES\s+["']?(\w+)["']?/i);
                return match ? match[1] : null;
              }).filter(Boolean) as string[];

              knowledge.push({
                id: `schema-${entry.name}-${path.basename(file, '.sql')}`,
                source: 'database',
                type: 'architecture',
                category: 'database-schema',
                title: `Schema: ${entry.name}/${path.basename(file)}`,
                description: `Database schema with ${tables.length} tables and ${relationships.length} relationships`,
                codeSnippets: [{
                  file: relativePath,
                  language: 'sql',
                  code: content.substring(0, 2000), // First 2000 chars
                  explanation: `Database schema definition for ${entry.name}`
                }],
                patterns: [
                  `Tables: ${tables.join(', ')}`,
                  `Relationships: ${relationships.length}`,
                  `Schema category: ${entry.name}`
                ],
                dependencies: ['PostgreSQL'],
                useCases: [
                  'Database queries',
                  'Schema understanding',
                  'Data modeling',
                  'Migration planning'
                ],
                tags: ['database', 'schema', entry.name, 'postgresql'],
                extractedAt: new Date().toISOString()
              });
            } catch (error) {
              console.error(`Error reading schema file ${file}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting schemas:', error);
    }

    return knowledge;
  }

  /**
   * Extract migrations from database/migrations/
   */
  private async extractMigrations(migrationsDir: string): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const files = await this.findSQLFiles(migrationsDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file, '.sql');

          knowledge.push({
            id: `migration-${fileName}`,
            source: 'database',
            type: 'pattern',
            category: 'database-migration',
            title: `Migration: ${fileName}`,
            description: `Database migration script`,
            codeSnippets: [{
              file: relativePath,
              language: 'sql',
              code: content.substring(0, 1000), // First 1000 chars
              explanation: `Migration script: ${fileName}`
            }],
            patterns: [
              'Database migration',
              'Schema evolution',
              'Version control'
            ],
            dependencies: ['PostgreSQL'],
            useCases: [
              'Database updates',
              'Schema changes',
              'Data migrations',
              'Version management'
            ],
            tags: ['database', 'migration', fileName],
            extractedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error reading migration file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error extracting migrations:', error);
    }

    return knowledge;
  }

  /**
   * Find all SQL files recursively
   */
  private async findSQLFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findSQLFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.sql')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors (permissions, etc.)
    }

    return files;
  }

  /**
   * Get database structure
   */
  async getDatabaseStructure(): Promise<DatabaseSchema[]> {
    const schemas: DatabaseSchema[] = [];

    try {
      const dbDir = path.join(this.workspaceRoot, 'database');
      const schemasDir = path.join(dbDir, 'schemas');
      const migrationsDir = path.join(dbDir, 'migrations');

      const entries = await fs.readdir(schemasDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const schemaPath = path.join(schemasDir, entry.name);
          const sqlFiles = await this.findSQLFiles(schemaPath);
          
          const tables: string[] = [];
          const relationships: { from: string; to: string; type: string }[] = [];

          for (const file of sqlFiles) {
            try {
              const content = await fs.readFile(file, 'utf-8');
              
              // Extract tables
              const tableMatches = content.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["']?(\w+)["']?/gi) || [];
              tableMatches.forEach(m => {
                const match = m.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["']?(\w+)["']?/i);
                if (match && match[1]) {
                  tables.push(match[1]);
                }
              });

              // Extract relationships
              const fkMatches = content.match(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+["']?(\w+)["']?/gi) || [];
              fkMatches.forEach(m => {
                const match = m.match(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+["']?(\w+)["']?/i);
                if (match && match[2]) {
                  relationships.push({
                    from: match[1].trim(),
                    to: match[2],
                    type: 'foreign_key'
                  });
                }
              });
            } catch (error) {
              // Skip files that can't be read
            }
          }

          schemas.push({
            name: entry.name,
            path: schemaPath,
            tables: [...new Set(tables)],
            relationships,
            migrations: []
          });
        }
      }

      // Get migrations
      const migrationFiles = await this.findSQLFiles(migrationsDir);
      for (const schema of schemas) {
        schema.migrations = migrationFiles.map(f => ({
          name: path.basename(f, '.sql'),
          path: f,
          applied: false // Would need to check database to know if applied
        }));
      }

    } catch (error) {
      console.error('Error getting database structure:', error);
    }

    return schemas;
  }
}

