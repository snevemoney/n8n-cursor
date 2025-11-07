/**
 * Project Knowledge Orchestrator
 * Coordinates all knowledge ingesters to build comprehensive project knowledge
 */

import { ExtractedKnowledge } from './types';
import { WorkspaceIngester } from './workspace-ingester';
import { DatabaseIngester } from './database-ingester';
import { WorkflowIngester } from './workflow-ingester';
import { DocumentationIngester } from './docs-ingester';
import { InfrastructureIngester } from './infrastructure-ingester';
import { RAGStore } from '../rag';
import { OntologyStore } from '../ontology';
import { WorkspaceStructure, DatabaseSchema, WorkflowInfo, ServiceStatus, ProjectStatus } from './project-types';

export interface ProjectKnowledgeResult {
  knowledge: ExtractedKnowledge[];
  workspace: WorkspaceStructure | null;
  databases: DatabaseSchema[];
  workflows: WorkflowInfo[];
  services: ServiceStatus[];
  status: ProjectStatus;
  ingestedAt: string;
}

export class ProjectKnowledgeOrchestrator {
  private workspaceRoot: string;
  private workspaceIngester: WorkspaceIngester;
  private databaseIngester: DatabaseIngester;
  private workflowIngester: WorkflowIngester;
  private docsIngester: DocumentationIngester;
  private infrastructureIngester: InfrastructureIngester;
  private ragStore: RAGStore;
  private ontologyStore: OntologyStore;
  
  // Cache for getSummary() results (30 second TTL)
  private summaryCache: any = null;
  private summaryCacheTime: number = 0;
  private SUMMARY_CACHE_TTL = 30000; // 30 seconds

  constructor(
    workspaceRoot: string,
    ragStore: RAGStore,
    ontologyStore: OntologyStore,
    n8nClient?: any
  ) {
    this.workspaceRoot = workspaceRoot;
    this.workspaceIngester = new WorkspaceIngester(workspaceRoot);
    this.databaseIngester = new DatabaseIngester(workspaceRoot);
    this.workflowIngester = new WorkflowIngester(workspaceRoot, n8nClient);
    this.docsIngester = new DocumentationIngester(workspaceRoot);
    this.infrastructureIngester = new InfrastructureIngester(workspaceRoot);
    this.ragStore = ragStore;
    this.ontologyStore = ontologyStore;
  }

  /**
   * Ingest all project knowledge
   */
  async ingestAll(): Promise<ProjectKnowledgeResult> {
    console.log('🦂 Starting comprehensive project knowledge ingestion...');

    const knowledge: ExtractedKnowledge[] = [];

    // Ingest workspace structure (with error recovery - don't fail entire ingestion)
    console.log('📁 Ingesting workspace structure...');
    let workspaceKnowledge: ExtractedKnowledge[] = [];
    let workspace: any = null;
    try {
      workspaceKnowledge = await this.workspaceIngester.extractWorkspaceKnowledge();
      knowledge.push(...workspaceKnowledge);
      workspace = await this.workspaceIngester.getWorkspaceStructure();
    } catch (error: any) {
      console.error('Error extracting workspace knowledge:', error.message);
      // Continue with other ingestions even if workspace fails
    }

    // Ingest database schemas
    console.log('🗄️ Ingesting database schemas...');
    const databaseKnowledge = await this.databaseIngester.extractDatabaseKnowledge();
    knowledge.push(...databaseKnowledge);
    const databases = await this.databaseIngester.getDatabaseStructure();

    // Ingest workflows
    console.log('🔄 Ingesting workflows...');
    const workflowKnowledge = await this.workflowIngester.extractWorkflowKnowledge();
    knowledge.push(...workflowKnowledge);
    const workflows = await this.workflowIngester.getWorkflows();

    // Ingest documentation
    console.log('📚 Ingesting documentation...');
    const docsKnowledge = await this.docsIngester.extractDocumentationKnowledge();
    knowledge.push(...docsKnowledge);

    // Ingest infrastructure
    console.log('🏗️ Ingesting infrastructure...');
    const infraKnowledge = await this.infrastructureIngester.extractInfrastructureKnowledge();
    knowledge.push(...infraKnowledge);
    const services = await this.infrastructureIngester.getServiceStatuses();

    // Store all knowledge in RAG
    console.log('💾 Storing knowledge in RAG...');
    for (const k of knowledge) {
      await this.ragStore.addKnowledge(k);
    }

    // Store entities in ontology
    console.log('🔗 Storing entities in ontology...');
    await this.storeEntitiesInOntology(workspace, databases, workflows, services);

    // Calculate project status
    const status = await this.calculateProjectStatus(knowledge, workflows, services);

    console.log(`✅ Ingestion complete: ${knowledge.length} knowledge items stored`);

    return {
      knowledge,
      workspace,
      databases,
      workflows,
      services,
      status,
      ingestedAt: new Date().toISOString()
    };
  }

  /**
   * Store entities in ontology
   */
  private async storeEntitiesInOntology(
    workspace: WorkspaceStructure | null,
    databases: DatabaseSchema[],
    workflows: WorkflowInfo[],
    services: ServiceStatus[]
  ): Promise<void> {
    try {
      // Store apps as Projects
      if (workspace && workspace.apps) {
        for (const [appKey, app] of Object.entries(workspace.apps)) {
          const appId = typeof app === 'object' && 'id' in app ? (app as any).id : appKey;
          const appData = typeof app === 'object' ? app : null;
          
          if (!appData || typeof appData !== 'object') continue;

          const now = new Date();
          await this.ontologyStore.store({
            id: `project-${appId}`,
            type: 'Project',
            createdAt: now,
            updatedAt: now,
            data: {
              id: `project-${appId}`,
              name: appId,
              description: appData.description || '',
              status: 'active',
              tags: [appData.role, appData.framework],
              createdAt: now.toISOString(),
              updatedAt: now.toISOString()
            }
          });
        }
      }

      // Store workflows
      for (const workflow of workflows) {
        const now = new Date();
        const updatedAt = workflow.lastSync ? new Date(workflow.lastSync) : now;
        await this.ontologyStore.store({
          id: `workflow-${workflow.id}`,
          type: 'Workflow',
          createdAt: now,
          updatedAt: updatedAt,
          data: {
            id: `workflow-${workflow.id}`,
            name: workflow.name,
            trigger: workflow.trigger || 'Manual',
            status: workflow.active ? 'active' : 'inactive',
            owner: 'system',
            createdAt: now.toISOString(),
            updatedAt: updatedAt.toISOString()
          }
        });
      }

      // Store services as Metrics
      for (const service of services) {
        const now = new Date();
        const updatedAt = service.lastChecked ? new Date(service.lastChecked) : now;
        await this.ontologyStore.store({
          id: `service-${service.name}`,
          type: 'Metric',
          createdAt: now,
          updatedAt: updatedAt,
          data: {
            id: `service-${service.name}`,
            source: service.name,
            value: service.status === 'online' ? 1 : 0,
            unit: 'status',
            timestamp: now.toISOString(),
            category: 'service-health',
            metadata: {
              type: service.type,
              url: service.url,
              port: service.port
            }
          }
        });
      }
    } catch (error) {
      console.error('Error storing entities in ontology:', error);
    }
  }

  /**
   * Calculate project status
   */
  private async calculateProjectStatus(
    knowledge: ExtractedKnowledge[],
    workflows: WorkflowInfo[],
    services: ServiceStatus[]
  ): Promise<ProjectStatus> {
    // Count tech debt
    const techDebtKnowledge = knowledge.filter(k => k.category === 'tech-debt');
    const critical = techDebtKnowledge.filter(k => k.tags.some(t => t.includes('critical') || t.includes('p0'))).length;
    const high = techDebtKnowledge.filter(k => k.tags.some(t => t.includes('high') || t.includes('p1'))).length;
    const medium = techDebtKnowledge.filter(k => k.tags.some(t => t.includes('medium') || t.includes('p2'))).length;
    const low = techDebtKnowledge.filter(k => k.tags.some(t => t.includes('low'))).length;

    // Count missing features
    const missingFeaturesKnowledge = knowledge.filter(k => k.category === 'missing-features');
    const p0 = missingFeaturesKnowledge.filter(k => k.tags.some(t => t.includes('p0'))).length;
    const p1 = missingFeaturesKnowledge.filter(k => k.tags.some(t => t.includes('p1'))).length;
    const p2 = missingFeaturesKnowledge.filter(k => k.tags.some(t => t.includes('p2'))).length;

    // Calculate overall health
    let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (critical > 0 || p0 > 5) {
      overallHealth = 'critical';
    } else if (high > 0 || p1 > 10 || services.some(s => s.status === 'offline')) {
      overallHealth = 'degraded';
    }

    return {
      overallHealth,
      techDebt: {
        total: techDebtKnowledge.length,
        critical,
        high,
        medium,
        low
      },
      missingFeatures: {
        p0,
        p1,
        p2
      },
      services,
      lastIngestion: new Date().toISOString()
    };
  }

  /**
   * Get project knowledge summary (with caching)
   */
  async getSummary(): Promise<{
    totalKnowledge: number;
    workspace: WorkspaceStructure | null;
    databases: number;
    workflows: number;
    services: ServiceStatus[];
    status: ProjectStatus;
  }> {
    const now = Date.now();
    
    // Return cached summary if still fresh
    if (this.summaryCache && (now - this.summaryCacheTime) < this.SUMMARY_CACHE_TTL) {
      return this.summaryCache;
    }

    const workspace = await this.workspaceIngester.getWorkspaceStructure();
    const databases = await this.databaseIngester.getDatabaseStructure();
    const workflows = await this.workflowIngester.getWorkflows();
    const services = await this.infrastructureIngester.getServiceStatuses();
    
    const allKnowledge = this.ragStore.getAllKnowledge();
    const status = await this.calculateProjectStatus(allKnowledge, workflows, services);

    const result = {
      totalKnowledge: allKnowledge.length,
      workspace,
      databases: databases.length,
      workflows: workflows.length,
      services, // Return array, not length
      status
    };

    // Cache the result
    this.summaryCache = result;
    this.summaryCacheTime = now;

    return result;
  }

  /**
   * Invalidate the summary cache (call after ingestion or major changes)
   */
  invalidateCache() {
    this.summaryCache = null;
    this.summaryCacheTime = 0;
  }
}

