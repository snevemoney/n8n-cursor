/**
 * Workflow Ingester
 * Extracts workflows from filesystem and syncs with n8n
 */

import { ExtractedKnowledge } from './types';
import { WorkflowInfo } from './project-types';
import fs from 'fs/promises';
import path from 'path';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
}

export class WorkflowIngester {
  private workspaceRoot: string;
  private n8nClient?: {
    listWorkflows: () => Promise<N8nWorkflow[]>;
    getWorkflow: (id: string) => Promise<N8nWorkflow | null>;
  };

  constructor(workspaceRoot: string, n8nClient?: any) {
    this.workspaceRoot = workspaceRoot;
    this.n8nClient = n8nClient;
  }

  /**
   * Extract workflow knowledge
   */
  async extractWorkflowKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const workflowsDir = path.join(this.workspaceRoot, 'workflows');
      const workflows = await this.extractWorkflowsFromFilesystem(workflowsDir);
      
      // Get n8n workflows if client available
      let n8nWorkflows: N8nWorkflow[] = [];
      if (this.n8nClient) {
        try {
          n8nWorkflows = await this.n8nClient.listWorkflows();
        } catch (error) {
          console.error('Error fetching n8n workflows:', error);
        }
      }

      // Create map of n8n workflows by name
      const n8nMap = new Map(n8nWorkflows.map(w => [w.name, w]));

      for (const workflow of workflows) {
        const n8nWorkflow = n8nMap.get(workflow.name);
        const synced = !!n8nWorkflow;

        knowledge.push({
          id: `workflow-${workflow.id}`,
          source: 'workflows',
          type: 'feature',
          category: 'workflow',
          title: `Workflow: ${workflow.name}`,
          description: `n8n workflow with ${workflow.nodes} nodes${synced ? ' (synced to n8n)' : ' (not synced)'}`,
          codeSnippets: [{
            file: workflow.path,
            language: 'json',
            code: workflow.trigger || 'Workflow definition',
            explanation: `Workflow configuration: ${workflow.name}`
          }],
          patterns: [
            `Trigger: ${workflow.trigger || 'Manual'}`,
            `Nodes: ${workflow.nodes}`,
            synced ? 'Synced to n8n' : 'Local only',
            workflow.active ? 'Active' : 'Inactive'
          ],
          dependencies: ['n8n'],
          useCases: [
            'Workflow automation',
            'Business process automation',
            'Integration orchestration',
            'Task automation'
          ],
          tags: [
            'workflow',
            'n8n',
            workflow.trigger || 'manual',
            synced ? 'synced' : 'local',
            workflow.active ? 'active' : 'inactive'
          ],
          extractedAt: new Date().toISOString()
        });
      }

      // Add overall workflow knowledge
      knowledge.push({
        id: 'workflows-overview',
        source: 'workflows',
        type: 'architecture',
        category: 'workflow-system',
        title: 'Workflow System Overview',
        description: `${workflows.length} workflows total, ${workflows.filter(w => n8nMap.has(w.name)).length} synced to n8n`,
        codeSnippets: [],
        patterns: [
          'Workflow orchestration',
          'n8n integration',
          'Workflow versioning',
          'Workflow sync'
        ],
        dependencies: ['n8n'],
        useCases: [
          'Workflow management',
          'Automation planning',
          'Workflow monitoring',
          'Sync management'
        ],
        tags: ['workflows', 'n8n', 'automation', 'orchestration'],
        extractedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error extracting workflow knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Extract workflows from filesystem
   */
  private async extractWorkflowsFromFilesystem(workflowsDir: string): Promise<WorkflowInfo[]> {
    const workflows: WorkflowInfo[] = [];

    try {
      const files = await this.findWorkflowFiles(workflowsDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Validate JSON before parsing
          let workflow;
          try {
            workflow = JSON.parse(content);
          } catch (jsonError: any) {
            console.error(`Error reading workflow file ${file}: ${jsonError.message}`);
            continue; // Skip this file and continue with others
          }
          
          const relativePath = path.relative(this.workspaceRoot, file);
          const fileName = path.basename(file, '.json');

          workflows.push({
            id: fileName,
            name: workflow.name || fileName,
            path: relativePath,
            trigger: this.extractTrigger(workflow),
            nodes: workflow.nodes?.length || 0,
            active: workflow.active !== false,
            syncedToN8n: false, // Will be updated if n8n client available
            lastSync: undefined
          });
        } catch (error) {
          console.error(`Error reading workflow file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error extracting workflows from filesystem:', error);
    }

    return workflows;
  }

  /**
   * Find all workflow JSON files
   */
  private async findWorkflowFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findWorkflowFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return files;
  }

  /**
   * Extract trigger type from workflow
   */
  private extractTrigger(workflow: any): string {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      return 'Manual';
    }

    const triggerNode = workflow.nodes.find((n: any) => 
      n.type?.includes('Trigger') || 
      n.type?.includes('Webhook') ||
      n.type?.includes('Schedule')
    );

    if (triggerNode) {
      return triggerNode.type || 'Unknown';
    }

    return 'Manual';
  }

  /**
   * Get all workflow information
   */
  async getWorkflows(): Promise<WorkflowInfo[]> {
    const workflowsDir = path.join(this.workspaceRoot, 'workflows');
    const workflows = await this.extractWorkflowsFromFilesystem(workflowsDir);

    // Update sync status if n8n client available
    if (this.n8nClient) {
      try {
        const n8nWorkflows = await this.n8nClient.listWorkflows();
        const n8nMap = new Map(n8nWorkflows.map(w => [w.name, w]));

        for (const workflow of workflows) {
          const n8nWorkflow = n8nMap.get(workflow.name);
          if (n8nWorkflow) {
            workflow.syncedToN8n = true;
            workflow.n8nId = n8nWorkflow.id;
            workflow.lastSync = new Date().toISOString();
            workflow.active = n8nWorkflow.active;
          }
        }
      } catch (error) {
        console.error('Error syncing workflow status:', error);
      }
    }

    return workflows;
  }
}

