/**
 * Workspace Structure Ingester
 * Extracts complete workspace structure from workspace.manifest.json
 */

import { ExtractedKnowledge } from './types';
import { WorkspaceStructure } from './project-types';
import fs from 'fs/promises';
import path from 'path';

export class WorkspaceIngester {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Extract workspace structure knowledge
   */
  async extractWorkspaceKnowledge(): Promise<ExtractedKnowledge[]> {
    const knowledge: ExtractedKnowledge[] = [];

    try {
      const manifestPath = path.join(this.workspaceRoot, 'workspace.manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: WorkspaceStructure = JSON.parse(manifestContent);

      // Extract workspace structure knowledge
      knowledge.push({
        id: 'workspace-structure',
        source: 'workspace',
        type: 'architecture',
        category: 'workspace',
        title: 'Workspace Structure',
        description: `Complete workspace structure with ${manifest.apps.length} apps and ${manifest.packages.length} packages`,
        codeSnippets: [{
          file: 'workspace.manifest.json',
          language: 'json',
          code: manifestContent,
          explanation: 'Workspace manifest defining all apps, packages, and policies'
        }],
        patterns: [
          'Monorepo structure',
          'App isolation',
          'Package sharing',
          'Import boundaries'
        ],
        dependencies: manifest.packages.map(p => p.name),
        useCases: [
          'Understanding project structure',
          'Dependency management',
          'Import boundary enforcement',
          'Build orchestration'
        ],
        tags: ['workspace', 'monorepo', 'structure', 'architecture'],
        extractedAt: new Date().toISOString()
      });

      // Extract knowledge for each app
      for (const [appKey, app] of Object.entries(manifest.apps)) {
        const appId = typeof app === 'object' && 'id' in app ? (app as any).id : appKey;
        const appData = typeof app === 'object' ? app : null;
        
        if (!appData || typeof appData !== 'object') continue;

        knowledge.push({
          id: `app-${appId}`,
          source: 'workspace',
          type: 'architecture',
          category: 'app',
          title: `${appId} Application`,
          description: appData.description || `${appId} application (${appData.role})`,
          codeSnippets: [{
            file: `apps/${appId}`,
            language: appData.framework || 'typescript',
            code: JSON.stringify(appData, null, 2),
            explanation: `Application configuration for ${appId}`
          }],
          patterns: [
            appData.isSideHustle ? 'Side hustle pattern' : 'Core application',
            appData.isCentral ? 'Central orchestrator' : 'Standard app',
            `Framework: ${appData.framework}`,
            `Role: ${appData.role}`
          ],
          dependencies: appData.importsAllowedFrom || [],
          useCases: [
            'Application understanding',
            'Dependency tracking',
            'Build configuration',
            'Deployment planning'
          ],
          tags: [
            'app',
            appId,
            appData.framework,
            appData.role,
            appData.isSideHustle ? 'side-hustle' : 'core',
            appData.isCentral ? 'central' : 'standard'
          ],
          extractedAt: new Date().toISOString()
        });

        // Extract sub-apps if they exist
        if (appData.subApps && typeof appData.subApps === 'object') {
          for (const [subAppName, subApp] of Object.entries(appData.subApps)) {
            if (typeof subApp !== 'object' || !subApp) continue;
            
            const subAppData = subApp as { entry: string; port: number; description?: string };
            
            knowledge.push({
              id: `app-${appId}-${subAppName}`,
              source: 'workspace',
              type: 'architecture',
              category: 'sub-app',
              title: `${appId} - ${subAppName}`,
              description: subAppData.description || `Sub-application ${subAppName} of ${appId}`,
              codeSnippets: [{
                file: subAppData.entry,
                language: appData.framework || 'typescript',
                code: JSON.stringify(subAppData, null, 2),
                explanation: `Sub-application configuration for ${subAppName}`
              }],
              patterns: [
                'Sub-application pattern',
                `Port: ${subAppData.port}`,
                `Entry: ${subAppData.entry}`
              ],
              dependencies: [],
              useCases: [
                'Sub-application routing',
                'Port management',
                'Multi-UI architecture'
              ],
              tags: ['sub-app', appId, subAppName, `port-${subAppData.port}`],
              extractedAt: new Date().toISOString()
            });
          }
        }
      }

      // Extract knowledge for each package
      for (const pkg of manifest.packages) {
        knowledge.push({
          id: `package-${pkg.name}`,
          source: 'workspace',
          type: 'architecture',
          category: 'package',
          title: `${pkg.name} Package`,
          description: `Shared package at ${pkg.path}`,
          codeSnippets: [{
            file: pkg.path,
            language: 'typescript',
            code: `Package: ${pkg.name}\nPath: ${pkg.path}`,
            explanation: `Package configuration for ${pkg.name}`
          }],
          patterns: [
            'Shared package pattern',
            'Code reuse',
            'Dependency management'
          ],
          dependencies: [],
          useCases: [
            'Shared utilities',
            'Type definitions',
            'Common components',
            'Cross-app functionality'
          ],
          tags: ['package', pkg.name, 'shared'],
          extractedAt: new Date().toISOString()
        });
      }

      // Extract policies knowledge
      if (manifest.policies) {
        knowledge.push({
          id: 'workspace-policies',
          source: 'workspace',
          type: 'best-practice',
          category: 'policies',
          title: 'Workspace Policies',
          description: 'Naming conventions, commit policies, and testing requirements',
          codeSnippets: [{
            file: 'workspace.manifest.json',
            language: 'json',
            code: JSON.stringify(manifest.policies, null, 2),
            explanation: 'Workspace policies and conventions'
          }],
          patterns: [
            manifest.policies.naming ? `Naming: ${JSON.stringify(manifest.policies.naming)}` : 'Standard naming',
            manifest.policies.commits ? `Commits: ${manifest.policies.commits}` : 'Standard commits',
            manifest.policies.testingMinimum ? `Testing: ${manifest.policies.testingMinimum.join(', ')}` : 'Standard testing'
          ],
          dependencies: [],
          useCases: [
            'Code consistency',
            'Enforcing standards',
            'CI/CD configuration',
            'Developer guidelines'
          ],
          tags: ['policies', 'conventions', 'standards'],
          extractedAt: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error extracting workspace knowledge:', error);
    }

    return knowledge;
  }

  /**
   * Get workspace structure object
   */
  async getWorkspaceStructure(): Promise<WorkspaceStructure | null> {
    try {
      const manifestPath = path.join(this.workspaceRoot, 'workspace.manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      return JSON.parse(manifestContent);
    } catch (error) {
      console.error('Error reading workspace manifest:', error);
      return null;
    }
  }
}

