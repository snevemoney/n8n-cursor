#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { createLFAClient } from '@lf/sdk';

interface SyncConfig {
  n8nBaseUrl: string;
  n8nEmail: string;
  n8nPassword: string;
  workflowsDir: string;
  lfaBaseUrl: string;
  lfaServiceToken: string;
}

interface WorkflowMetadata {
  name: string;
  version: string;
  owner: string;
  description?: string;
  tags?: string[];
}

/**
 * Sync workflows between local files and n8n instance
 */
export class WorkflowSync {
  private config: SyncConfig;
  private lfaClient: ReturnType<typeof createLFAClient>;

  constructor(config: SyncConfig) {
    this.config = config;
    this.lfaClient = createLFAClient({
      baseUrl: config.lfaBaseUrl,
      serviceToken: config.lfaServiceToken
    });
  }

  /**
   * Export all workflows from n8n to local files
   */
  async exportAll(): Promise<void> {
    console.log('🔄 Exporting all workflows from n8n...');

    try {
      // Get all workflows from n8n
      const workflows = await this.getN8nWorkflows();
      
      for (const workflow of workflows) {
        await this.exportWorkflow(workflow);
      }

      console.log(`✅ Exported ${workflows.length} workflows`);
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }

  /**
   * Import all local workflows to n8n
   */
  async importAll(): Promise<void> {
    console.log('🔄 Importing all workflows to n8n...');

    try {
      const workflowFiles = this.getLocalWorkflowFiles();
      
      for (const file of workflowFiles) {
        await this.importWorkflow(file);
      }

      console.log(`✅ Imported ${workflowFiles.length} workflows`);
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  /**
   * Sync workflows (import missing, update existing)
   */
  async sync(): Promise<void> {
    console.log('🔄 Syncing workflows...');

    try {
      // Get workflows from both sources
      const n8nWorkflows = await this.getN8nWorkflows();
      const localWorkflows = this.getLocalWorkflowFiles();

      // Create maps for easy lookup
      const n8nMap = new Map(n8nWorkflows.map(w => [w.name, w]));
      const localMap = new Map(localWorkflows.map(f => [this.getWorkflowName(f), f]));

      // Import new workflows
      for (const [name, file] of localMap) {
        if (!n8nMap.has(name)) {
          console.log(`📥 Importing new workflow: ${name}`);
          await this.importWorkflow(file);
        }
      }

      // Update existing workflows if local version is newer
      for (const [name, file] of localMap) {
        const n8nWorkflow = n8nMap.get(name);
        if (n8nWorkflow && this.isLocalNewer(file, n8nWorkflow)) {
          console.log(`🔄 Updating workflow: ${name}`);
          await this.updateWorkflow(n8nWorkflow.id, file);
        }
      }

      console.log('✅ Workflow sync completed');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  /**
   * Validate workflow metadata
   */
  validateWorkflow(workflowPath: string): boolean {
    try {
      const content = readFileSync(workflowPath, 'utf8');
      const workflow = JSON.parse(content);

      // Check required metadata
      if (!workflow.meta?.name || !workflow.meta?.version || !workflow.meta?.owner) {
        console.error(`❌ Workflow ${basename(workflowPath)} missing required metadata`);
        return false;
      }

      // Check workflow structure
      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        console.error(`❌ Workflow ${basename(workflowPath)} has invalid structure`);
        return false;
      }

      console.log(`✅ Workflow ${basename(workflowPath)} is valid`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to validate workflow ${basename(workflowPath)}:`, error);
      return false;
    }
  }

  /**
   * Get all workflows from n8n
   */
  private async getN8nWorkflows(): Promise<any[]> {
    const response = await fetch(`${this.config.n8nBaseUrl}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.config.n8nPassword // Using password as API key for simplicity
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Export a single workflow from n8n
   */
  private async exportWorkflow(workflow: any): Promise<void> {
    const filename = `${workflow.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    const filepath = join(this.config.workflowsDir, 'raw', filename);

    // Ensure directory exists
    const dir = join(this.config.workflowsDir, 'raw');
    if (!existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }

    // Write workflow to file
    writeFileSync(filepath, JSON.stringify(workflow, null, 2));
    console.log(`📁 Exported: ${filename}`);
  }

  /**
   * Import a single workflow to n8n
   */
  private async importWorkflow(filepath: string): Promise<void> {
    const content = readFileSync(filepath, 'utf8');
    const workflow = JSON.parse(content);

    // Remove id and other n8n-specific fields
    const { id, ...cleanWorkflow } = workflow;

    const response = await fetch(`${this.config.n8nBaseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.config.n8nPassword
      },
      body: JSON.stringify(cleanWorkflow)
    });

    if (!response.ok) {
      throw new Error(`Failed to import workflow ${basename(filepath)}: ${response.statusText}`);
    }

    console.log(`📤 Imported: ${basename(filepath)}`);
  }

  /**
   * Update an existing workflow in n8n
   */
  private async updateWorkflow(workflowId: string, filepath: string): Promise<void> {
    const content = readFileSync(filepath, 'utf8');
    const workflow = JSON.parse(content);

    const response = await fetch(`${this.config.n8nBaseUrl}/api/v1/workflows/${workflowId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.config.n8nPassword
      },
      body: JSON.stringify(workflow)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workflow ${basename(filepath)}: ${response.statusText}`);
    }

    console.log(`🔄 Updated: ${basename(filepath)}`);
  }

  /**
   * Get local workflow files
   */
  private getLocalWorkflowFiles(): string[] {
    const normalizedDir = join(this.config.workflowsDir, 'normalized');
    
    if (!existsSync(normalizedDir)) {
      return [];
    }

    return readdirSync(normalizedDir)
      .filter(file => file.endsWith('.json'))
      .map(file => join(normalizedDir, file));
  }

  /**
   * Extract workflow name from file path
   */
  private getWorkflowName(filepath: string): string {
    const content = readFileSync(filepath, 'utf8');
    const workflow = JSON.parse(content);
    return workflow.meta?.name || basename(filepath, '.json');
  }

  /**
   * Check if local workflow is newer than n8n version
   */
  private isLocalNewer(filepath: string, n8nWorkflow: any): boolean {
    const localStats = require('fs').statSync(filepath);
    const localModified = localStats.mtime;
    const n8nModified = new Date(n8nWorkflow.updatedAt);

    return localModified > n8nModified;
  }

  /**
   * Test LFA connection
   */
  async testLFAConnection(): Promise<boolean> {
    try {
      const isHealthy = await this.lfaClient.healthCheck();
      console.log(`🔗 LFA connection: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      return isHealthy;
    } catch (error) {
      console.error('❌ LFA connection failed:', error);
      return false;
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
Usage: tsx sync-workflows.ts <command> [options]

Commands:
  export    - Export all workflows from n8n to local files
  import    - Import all local workflows to n8n
  sync      - Sync workflows (import missing, update existing)
  validate  - Validate all local workflow files
  test      - Test LFA connection

Environment variables:
  N8N_BASE_URL      - n8n instance URL
  N8N_EMAIL         - n8n admin email
  N8N_PASSWORD      - n8n admin password
  LFA_BASE_URL      - LightningFlow AI base URL
  LFA_SERVICE_TOKEN - LFA service token
    `);
    return;
  }

  const config: SyncConfig = {
    n8nBaseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    n8nEmail: process.env.N8N_EMAIL || 'admin@example.com',
    n8nPassword: process.env.N8N_PASSWORD || 'password',
    workflowsDir: process.env.WORKFLOWS_DIR || './workflows',
    lfaBaseUrl: process.env.LFA_BASE_URL || 'http://localhost:3000',
    lfaServiceToken: process.env.LFA_SERVICE_TOKEN || 'your-service-token'
  };

  const sync = new WorkflowSync(config);

  try {
    switch (command) {
      case 'export':
        await sync.exportAll();
        break;
      
      case 'import':
        await sync.importAll();
        break;
      
      case 'sync':
        await sync.sync();
        break;
      
      case 'validate':
        const files = sync['getLocalWorkflowFiles'].call(sync);
        let validCount = 0;
        for (const file of files) {
          if (sync.validateWorkflow(file)) {
            validCount++;
          }
        }
        console.log(`✅ ${validCount}/${files.length} workflows are valid`);
        break;
      
      case 'test':
        await sync.testLFAConnection();
        break;
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
