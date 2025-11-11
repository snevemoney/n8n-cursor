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
import { ConversationIngester } from './conversation-ingester';
import { CodeIngester } from './code-ingester';
import { N8nCursorIngester } from './n8n-cursor-ingester';
import { TechDebtAnalyzer } from './tech-debt-analyzer';
import { RecommendationEngine } from './recommendation-engine';
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
  private conversationIngester: ConversationIngester;
  private codeIngester: CodeIngester;
  private n8nCursorIngester: N8nCursorIngester;
  private techDebtAnalyzer: TechDebtAnalyzer;
  private recommendationEngine: RecommendationEngine;
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
    this.conversationIngester = new ConversationIngester(workspaceRoot);
    this.codeIngester = new CodeIngester(workspaceRoot, ragStore); // Pass RAGStore for hybrid indexing
    this.n8nCursorIngester = new N8nCursorIngester(workspaceRoot);
    this.techDebtAnalyzer = new TechDebtAnalyzer(workspaceRoot);
    this.recommendationEngine = new RecommendationEngine(workspaceRoot);
    this.ragStore = ragStore;
    this.ontologyStore = ontologyStore;
  }

  /**
   * Lightweight ingestion - only tech debt and recommendations
   * Fast and focused on what's needed for the dashboard
   */
  async ingestEssential(): Promise<{ techDebt: ExtractedKnowledge[]; recommendations: ExtractedKnowledge[] }> {
    console.log('🦂 Starting essential ingestion (tech debt + recommendations only)...');
    
    const techDebtKnowledge: ExtractedKnowledge[] = [];
    const recommendations: ExtractedKnowledge[] = [];

    // Analyze codebase for tech debt and missing features
    console.log('🔍 Analyzing codebase for tech debt and missing features...');
    try {
      const techDebt = await this.techDebtAnalyzer.analyzeCodebase();
      techDebtKnowledge.push(...techDebt);
      console.log(`✅ Found ${techDebt.length} tech debt/missing feature items`);
    } catch (error: any) {
      console.error('❌ Error analyzing tech debt:', error.message);
    }

    // Generate intelligent recommendations
    console.log('🧠 Generating intelligent recommendations...');
    try {
      const recs = await this.recommendationEngine.generateRecommendations();
      recommendations.push(...recs);
      console.log(`✅ Generated ${recs.length} recommendations`);
    } catch (error: any) {
      console.error('❌ Error generating recommendations:', error.message);
    }

    // Store in RAG
    console.log('💾 Storing essential knowledge in RAG...');
    for (const k of [...techDebtKnowledge, ...recommendations]) {
      await this.ragStore.addKnowledge(k);
    }

    // Invalidate cache
    this.invalidateCache();

    console.log(`✅ Essential ingestion complete: ${techDebtKnowledge.length} tech debt + ${recommendations.length} recommendations`);

    return { techDebt: techDebtKnowledge, recommendations };
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

    // Ingest n8n-cursor development tools
    console.log('🛠️ Ingesting n8n-cursor knowledge...');
    let n8nCursorKnowledge: ExtractedKnowledge[] = [];
    try {
      n8nCursorKnowledge = await this.n8nCursorIngester.extractN8nCursorKnowledge();
      knowledge.push(...n8nCursorKnowledge);
    } catch (error: any) {
      console.error('Error extracting n8n-cursor knowledge:', error.message);
      // Continue with other ingestions
    }

    // Ingest source code (comprehensive codebase understanding)
    console.log('💻 Ingesting source code...');
    let codeKnowledge: ExtractedKnowledge[] = [];
    try {
      codeKnowledge = await this.codeIngester.extractCodeKnowledge();
      knowledge.push(...codeKnowledge);
      console.log(`✅ Ingested ${codeKnowledge.length} code files`);
    } catch (error: any) {
      console.error('Error extracting code knowledge:', error.message);
      // Continue with other ingestions even if code extraction fails
    }

    // Analyze codebase for tech debt and missing features
    console.log('🔍 Analyzing codebase for tech debt and missing features...');
    let techDebtKnowledge: ExtractedKnowledge[] = [];
    try {
      console.log('🔍 Calling techDebtAnalyzer.analyzeCodebase()...');
      techDebtKnowledge = await this.techDebtAnalyzer.analyzeCodebase();
      console.log(`🔍 Tech debt analyzer returned ${techDebtKnowledge.length} items`);
      knowledge.push(...techDebtKnowledge);
      console.log(`✅ Found ${techDebtKnowledge.length} tech debt/missing feature items`);
      
      // Debug: Log category breakdown
      const techDebtItems = techDebtKnowledge.filter(k => k.category === 'tech-debt');
      const missingFeatureItems = techDebtKnowledge.filter(k => k.category === 'missing-features');
      console.log(`   Tech Debt items: ${techDebtItems.length}`);
      console.log(`   Missing Feature items: ${missingFeatureItems.length}`);
    } catch (error: any) {
      console.error('❌ Error analyzing tech debt:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      // Continue with other ingestions even if tech debt analysis fails
    }

    // Generate intelligent recommendations
    console.log('🧠 Generating intelligent recommendations...');
    let recommendations: ExtractedKnowledge[] = [];
    try {
      console.log('🧠 Calling recommendationEngine.generateRecommendations()...');
      recommendations = await this.recommendationEngine.generateRecommendations();
      console.log(`🧠 Recommendation engine returned ${recommendations.length} items`);
      knowledge.push(...recommendations);
      console.log(`✅ Generated ${recommendations.length} recommendations`);
      
      // Debug: Log category breakdown
      const techDebtRecs = recommendations.filter(r => r.category === 'tech-debt');
      const missingFeatureRecs = recommendations.filter(r => r.category === 'missing-features');
      console.log(`   Tech Debt Recommendations: ${techDebtRecs.length}`);
      console.log(`   Missing Feature Recommendations: ${missingFeatureRecs.length}`);
      
      // Debug: Log first few recommendation IDs and categories
      if (recommendations.length > 0) {
        console.log(`   Sample recommendations:`, recommendations.slice(0, 3).map(r => ({ id: r.id, category: r.category, title: r.title })));
      }
    } catch (error: any) {
      console.error('❌ Error generating recommendations:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      // Continue with other ingestions even if recommendations fail
    }

    // Ingest infrastructure
    console.log('🏗️ Ingesting infrastructure...');
    const infraKnowledge = await this.infrastructureIngester.extractInfrastructureKnowledge();
    knowledge.push(...infraKnowledge);
    const services = await this.infrastructureIngester.getServiceStatuses();

    // Ingest conversations
    console.log('💬 Ingesting conversations...');
    let conversationKnowledge: ExtractedKnowledge[] = [];
    let conversationStats: { total: number; totalMessages: number; recentConversations: number } = { total: 0, totalMessages: 0, recentConversations: 0 };
    try {
      conversationKnowledge = await this.conversationIngester.extractConversationKnowledge();
      knowledge.push(...conversationKnowledge);
      conversationStats = await this.conversationIngester.getConversationStats();
    } catch (error: any) {
      console.error('Error extracting conversation knowledge:', error.message);
      // Continue with other ingestions even if conversations fail
    }

    // Store all knowledge in RAG
    console.log('💾 Storing knowledge in RAG...');
    for (const k of knowledge) {
      await this.ragStore.addKnowledge(k);
    }
    
    // Invalidate summary cache so next getSummary() call gets fresh data
    this.invalidateCache();

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
    // Debug: Log knowledge breakdown
    console.log(`[calculateProjectStatus] Total knowledge items: ${knowledge.length}`);
    
    // Count tech debt
    const techDebtKnowledge = knowledge.filter(k => k.category === 'tech-debt');
    console.log(`[calculateProjectStatus] Tech debt items: ${techDebtKnowledge.length}`);
    if (techDebtKnowledge.length > 0) {
      console.log(`[calculateProjectStatus] Sample tech debt tags:`, techDebtKnowledge[0].tags);
    }
    
    const critical = techDebtKnowledge.filter(k => k.tags?.some(t => t.includes('critical') || t.includes('p0'))).length;
    const high = techDebtKnowledge.filter(k => k.tags?.some(t => t.includes('high') || t.includes('p1'))).length;
    const medium = techDebtKnowledge.filter(k => k.tags?.some(t => t.includes('medium') || t.includes('p2'))).length;
    const low = techDebtKnowledge.filter(k => k.tags?.some(t => t.includes('low'))).length;
    
    console.log(`[calculateProjectStatus] Tech debt counts - Critical: ${critical}, High: ${high}, Medium: ${medium}, Low: ${low}`);

    // Count missing features
    const missingFeaturesKnowledge = knowledge.filter(k => k.category === 'missing-features');
    console.log(`[calculateProjectStatus] Missing features items: ${missingFeaturesKnowledge.length}`);
    if (missingFeaturesKnowledge.length > 0) {
      console.log(`[calculateProjectStatus] Sample missing feature tags:`, missingFeaturesKnowledge[0].tags);
    }
    
    const p0 = missingFeaturesKnowledge.filter(k => k.tags?.some(t => t.includes('p0'))).length;
    const p1 = missingFeaturesKnowledge.filter(k => k.tags?.some(t => t.includes('p1'))).length;
    const p2 = missingFeaturesKnowledge.filter(k => k.tags?.some(t => t.includes('p2'))).length;
    
    console.log(`[calculateProjectStatus] Missing features counts - P0: ${p0}, P1: ${p1}, P2: ${p2}`);

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
    databases: DatabaseSchema[];
    workflows: WorkflowInfo[];
    services: ServiceStatus[];
    conversations: {
      total: number;
      totalMessages: number;
      recentConversations: number;
    };
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
    
    // Get conversation stats
    let conversationStats = { total: 0, totalMessages: 0, recentConversations: 0 };
    try {
      conversationStats = await this.conversationIngester.getConversationStats();
    } catch (error) {
      // If conversation stats fail, use defaults
    }
    
    const allKnowledge = this.ragStore.getAllKnowledge();
    
    // Debug: Log knowledge breakdown by category
    const techDebtItems = allKnowledge.filter(k => k.category === 'tech-debt');
    const missingFeatureItems = allKnowledge.filter(k => k.category === 'missing-features');
    console.log(`[getSummary] Total knowledge: ${allKnowledge.length}, Tech Debt: ${techDebtItems.length}, Missing Features: ${missingFeatureItems.length}`);
    
    // Debug: Check if knowledge items have tags
    if (techDebtItems.length > 0) {
      const sample = techDebtItems[0];
      console.log(`[getSummary] Sample tech debt item - ID: ${sample.id}, Category: ${sample.category}, Tags: ${JSON.stringify(sample.tags)}`);
    }
    if (missingFeatureItems.length > 0) {
      const sample = missingFeatureItems[0];
      console.log(`[getSummary] Sample missing feature item - ID: ${sample.id}, Category: ${sample.category}, Tags: ${JSON.stringify(sample.tags)}`);
    }
    
    const status = await this.calculateProjectStatus(allKnowledge, workflows, services);

    const result = {
      totalKnowledge: allKnowledge.length,
      workspace,
      databases: databases, // Return array, not length
      workflows: workflows, // Return array, not length
      services, // Return array, not length
      conversations: conversationStats,
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

