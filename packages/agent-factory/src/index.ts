/**
 * Agent Factory Package
 * 
 * Provides templates, scripts, and utilities for generating AI agents
 * from templates and deploying them to n8n workflows.
 * 
 * This package integrates the agent-factory project into the n8n-cursor workspace.
 */

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'content' | 'research' | 'saas' | 'support' | 'onboarding' | 'payout' | 'analytics' | 'yield';
  templatePath: string;
  n8nWorkflowPath?: string;
}

export interface AgentConfig {
  name: string;
  type: string;
  tenantId: string;
  config: Record<string, any>;
}

/**
 * List available agent templates
 */
export function listTemplates(): AgentTemplate[] {
  // Templates are in the templates/ directory
  // This can be enhanced to read from the filesystem
  return [
    {
      id: 'content-agent',
      name: 'Content Agent',
      description: 'AI agent for content creation and management',
      type: 'content',
      templatePath: 'templates/content-agent',
    },
    {
      id: 'research-agent',
      name: 'Research Agent',
      description: 'AI agent for research and knowledge gathering',
      type: 'research',
      templatePath: 'templates/research-agent',
    },
    {
      id: 'saas-scaffold',
      name: 'SaaS Scaffold Agent',
      description: 'Template for scaffolding SaaS applications',
      type: 'saas',
      templatePath: 'templates/saas-scaffold',
    },
    {
      id: 'support-agent',
      name: 'Support Agent',
      description: 'Customer support and helpdesk agent',
      type: 'support',
      templatePath: 'templates/support-agent',
    },
  ];
}

/**
 * Generate an agent from a template
 */
export async function generateAgent(
  templateId: string,
  config: AgentConfig
): Promise<{ success: boolean; workflowPath?: string; error?: string }> {
  // This would use the scripts in scripts/ to generate agents
  // For now, return a placeholder
  return {
    success: true,
    workflowPath: `n8n-workflows/${config.name}.json`,
  };
}

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): AgentTemplate | undefined {
  return listTemplates().find(t => t.id === templateId);
}

