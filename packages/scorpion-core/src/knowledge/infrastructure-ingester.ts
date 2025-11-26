/**
 * Infrastructure Ingester
 * Extracts Docker, ports, services, and deployment configurations
 */

import { ExtractedKnowledge } from './types';
import { ServiceStatus } from './project-types';
import fs from 'fs/promises';
import path from 'path';

export class InfrastructureIngester {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Extract infrastructure knowledge
   */
  async extractInfrastructureKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Extract Docker Compose knowledge
      const dockerKnowledge = await this.extractDockerKnowledge();
      knowledge.push(...dockerKnowledge);

      // Extract port configurations
      const portKnowledge = await this.extractPortKnowledge();
      knowledge.push(...portKnowledge);

      // Extract service configurations
      const serviceKnowledge = await this.extractServiceKnowledge();
      knowledge.push(...serviceKnowledge);

    } catch (error) {
      console.error('Error extracting infrastructure knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract Docker Compose knowledge
   */
  private async extractDockerKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const infraDir = path.join(this.workspaceRoot, 'infra');
      const dockerDir = path.join(infraDir, 'docker');
      
      const composeFiles = await this.findYamlFiles(dockerDir);

      for (const file of composeFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file);

          // Extract services from docker-compose
          const serviceMatches = content.match(/^\s+(\w+):/gm) || [];
          const services = serviceMatches.map(m => m.trim().replace(':', ''));

          knowledge.push({
            id: `docker-${fileName}`,
            source: 'infrastructure',
            type: 'architecture',
            category: 'docker',
            title: `Docker Compose: ${fileName}`,
            description: `Docker Compose configuration with ${services.length} services`,
            codeSnippets: [{
              file: relativePath,
              language: 'yaml',
              code: content.substring(0, 2000),
              explanation: `Docker Compose configuration: ${fileName}`
            }],
            patterns: [
              `Services: ${services.join(', ')}`,
              'Container orchestration',
              'Service dependencies'
            ],
            dependencies: ['Docker', 'Docker Compose'],
            useCases: [
              'Local development',
              'Service orchestration',
              'Deployment',
              'Infrastructure management'
            ],
            tags: ['docker', 'docker-compose', 'infrastructure', fileName],
            extractedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error reading Docker file ${file}:`, error);
        }
      }
    } catch (error) {
      // Docker directory might not exist
    }

    return knowledge;
  }

  /**
   * Extract port configurations
   */
  private async extractPortKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Check for ports.yml or similar
      const toolingDir = path.join(this.workspaceRoot, 'tooling');
      const portsFile = path.join(toolingDir, 'ports.yml');

      try {
        const content = await fs.readFile(portsFile, 'utf-8');
        const relativePath = path.relative(this.workspaceRoot, portsFile);

        knowledge.push({
          id: 'ports-configuration',
          source: 'infrastructure',
          type: 'architecture',
          category: 'ports',
          title: 'Port Configuration',
          description: 'Port mappings for all services',
          codeSnippets: [{
            file: relativePath,
            language: 'yaml',
            code: content,
            explanation: 'Port configuration for all services'
          }],
          patterns: [
            'Port management',
            'Service ports',
            'Port conflicts prevention'
          ],
          dependencies: [],
          useCases: [
            'Port management',
            'Service configuration',
            'Conflict resolution',
            'Development setup'
          ],
          tags: ['ports', 'configuration', 'infrastructure'],
          extractedAt: new Date().toISOString()
        });
      } catch (error) {
        // Ports file might not exist
      }

      // Also extract ports from workspace.manifest.json (subApps)
      const manifestPath = path.join(this.workspaceRoot, 'workspace.manifest.json');
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent) as { apps?: Record<string, any> };
        
        const ports: number[] = [];
        if (manifest.apps) {
          for (const app of Object.values(manifest.apps)) {
            if (typeof app === 'object' && app && 'subApps' in app && app.subApps) {
              for (const subApp of Object.values(app.subApps)) {
                if (typeof subApp === 'object' && subApp && 'port' in subApp && typeof subApp.port === 'number') {
                  ports.push(subApp.port);
                }
              }
            }
          }
        }

        if (ports.length > 0) {
          knowledge.push({
            id: 'app-ports',
            source: 'infrastructure',
            type: 'architecture',
            category: 'ports',
            title: 'Application Ports',
            description: `Application ports: ${ports.join(', ')}`,
            codeSnippets: [{
              file: 'workspace.manifest.json',
              language: 'json',
              code: JSON.stringify({ ports }, null, 2),
              explanation: 'Application port mappings'
            }],
            patterns: [
              `Ports: ${ports.join(', ')}`,
              'Application ports',
              'Port allocation'
            ],
            dependencies: [],
            useCases: [
              'Port management',
              'Service discovery',
              'Development setup'
            ],
            tags: ['ports', 'applications', 'infrastructure'],
            extractedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        // Manifest might not have ports
      }

    } catch (error) {
      console.error('Error extracting port knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract service configurations
   */
  private async extractServiceKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      // Extract service information from various sources
      const services: ServiceStatus[] = [
        {
          name: 'n8n',
          type: 'n8n',
          status: 'unknown',
          url: process.env['N8N_BASE_URL'] || 'http://localhost:5678',
          port: 5678
        },
        {
          name: 'Ollama',
          type: 'ollama',
          status: 'unknown',
          url: process.env['OLLAMA_URL'] || 'http://localhost:11434',
          port: 11434
        },
        {
          name: 'PostgreSQL',
          type: 'database',
          status: 'unknown',
          port: 5432
        },
        {
          name: 'Redis',
          type: 'redis',
          status: 'unknown',
          port: 6379
        },
        {
          name: 'Caddy',
          type: 'caddy',
          status: 'unknown',
          port: 80
        }
      ];

      knowledge.push({
        id: 'services-overview',
        source: 'infrastructure',
        type: 'architecture',
        category: 'services',
        title: 'Service Infrastructure',
        description: `${services.length} services configured`,
        codeSnippets: [{
          file: 'infrastructure',
          language: 'typescript',
          code: JSON.stringify(services, null, 2),
          explanation: 'Service infrastructure configuration'
        }],
        patterns: [
          'Service orchestration',
          'Microservices',
          'Service discovery',
          'Health monitoring'
        ],
        dependencies: services.map(s => s.name),
        useCases: [
          'Service management',
          'Health monitoring',
          'Infrastructure planning',
          'Deployment'
        ],
        tags: ['services', 'infrastructure', 'microservices'],
        extractedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error extracting service knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Find all YAML files recursively
   */
  private async findYamlFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findYamlFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return files;
  }

  /**
   * Get service statuses (would check actual services)
   */
  async getServiceStatuses(): Promise<ServiceStatus[]> {
    // This would actually check service health
    // For now, return configured services
    return [
      {
        name: 'n8n',
        type: 'n8n',
        status: 'unknown',
        url: process.env['N8N_BASE_URL'] || 'http://localhost:5678',
        port: 5678
      },
      {
        name: 'Ollama',
        type: 'ollama',
        status: 'unknown',
        url: process.env['OLLAMA_URL'] || 'http://localhost:11434',
        port: 11434
      }
    ];
  }
}

