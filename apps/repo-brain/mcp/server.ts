#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Repo Brain MCP Server
class RepoBrainMCPServer {
  private server: Server;
  private policy: any;

  constructor() {
    this.server = new Server(
      {
        name: 'repo-brain-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.loadPolicy();
  }

  private loadPolicy() {
    try {
      const policyPath = path.join(process.cwd(), 'apps/repo-brain/policy/repo_brain.yaml');
      const policyContent = fs.readFileSync(policyPath, 'utf8');
      this.policy = yaml.load(policyContent);
    } catch (error) {
      console.error('Failed to load policy:', error);
      this.policy = {};
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'suggestPath',
            description: 'Suggest the best location for a new file based on content and naming',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the file to suggest location for'
                },
                content: {
                  type: 'string',
                  description: 'Content or description of the file'
                },
                fileType: {
                  type: 'string',
                  description: 'File extension or type (e.g., .sh, .json, .md)'
                }
              },
              required: ['filename', 'content']
            }
          },
          {
            name: 'enforceStructure',
            description: 'Validate that staged files comply with repository structure policy',
            inputSchema: {
              type: 'object',
              properties: {
                paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of file paths to validate'
                },
                strict: {
                  type: 'boolean',
                  description: 'Whether to enforce strict policy (default: true)'
                }
              },
              required: ['paths']
            }
          },
          {
            name: 'explainDecision',
            description: 'Explain why a file was routed to a specific location',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'File path to explain routing for'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'validatePolicy',
            description: 'Validate the current policy configuration for errors',
            inputSchema: {
              type: 'object',
              properties: {
                verbose: {
                  type: 'boolean',
                  description: 'Whether to provide detailed validation output'
                }
              }
            }
          },
          {
            name: 'updatePolicy',
            description: 'Update the policy configuration (requires approval)',
            inputSchema: {
              type: 'object',
              properties: {
                section: {
                  type: 'string',
                  description: 'Policy section to update (e.g., routing, naming, security)'
                },
                changes: {
                  type: 'object',
                  description: 'Changes to apply to the policy'
                },
                reason: {
                  type: 'string',
                  description: 'Reason for the policy change'
                }
              },
              required: ['section', 'changes', 'reason']
            }
          },
          {
            name: 'getRepositoryStats',
            description: 'Get statistics about repository structure and policy compliance',
            inputSchema: {
              type: 'object',
              properties: {
                includeDetails: {
                  type: 'boolean',
                  description: 'Whether to include detailed file analysis'
                }
              }
            }
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'suggestPath':
            return await this.suggestPath(args);
          case 'enforceStructure':
            return await this.enforceStructure(args);
          case 'explainDecision':
            return await this.explainDecision(args);
          case 'validatePolicy':
            return await this.validatePolicy(args);
          case 'updatePolicy':
            return await this.updatePolicy(args);
          case 'getRepositoryStats':
            return await this.getRepositoryStats(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private async suggestPath(args: any) {
    const { filename, content, fileType } = args;
    
    // Apply routing rules
    const routing = this.applyRoutingRules(filename, content);
    
    // Generate naming suggestion
    const naming = this.suggestNaming(filename, fileType);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(routing, content);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            suggested_path: path.join(routing.target, naming.suggested_name),
            target_directory: routing.target,
            reason: routing.reason,
            confidence: confidence,
            naming_suggestion: naming.suggested_name,
            alternatives: this.getAlternatives(routing.target),
            policy_rules_applied: routing.applied_rules
          }, null, 2)
        }
      ]
    };
  }

  private async enforceStructure(args: any) {
    const { paths, strict = true } = args;
    const issues = [];
    const suggestions = [];

    for (const filePath of paths) {
      // Check if forbidden
      if (this.isForbidden(filePath)) {
        issues.push({
          file: filePath,
          severity: 'error',
          message: 'File path is forbidden by policy',
          suggestion: 'Remove or move to allowed location'
        });
        continue;
      }

      // Validate structure
      const structureCheck = this.validateStructure(filePath);
      if (!structureCheck.valid) {
        issues.push({
          file: filePath,
          severity: 'error',
          message: structureCheck.issue,
          suggestion: structureCheck.suggestion
        });
        continue;
      }

      // Check for top-level files
      if (!filePath.includes('/')) {
        const ext = path.extname(filePath);
        if (['.sh', '.json', '.yml', '.yaml', '.js', '.ts'].includes(ext)) {
          issues.push({
            file: filePath,
            severity: 'error',
            message: 'Top-level files are forbidden',
            suggestion: 'Move to appropriate subdirectory'
          });
          continue;
        }
      }

      // Apply routing rules for suggestions
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8').slice(0, 2000);
        const routing = this.applyRoutingRules(path.basename(filePath), fileContent);
        
        if (routing) {
          const currentDir = path.dirname(filePath);
          if (currentDir !== routing.target) {
            suggestions.push({
              file: filePath,
              suggested_path: path.join(routing.target, path.basename(filePath)),
              reason: routing.reason,
              confidence: routing.confidence
            });
          }
        }
      } catch (error) {
        // Skip binary files or unreadable files
        continue;
      }
    }

    const blockingIssues = issues.filter(i => i.severity === 'error');
    const result = {
      issues,
      suggestions,
      blocking_issues: blockingIssues.length,
      passed: blockingIssues.length === 0,
      summary: `Found ${issues.length} issues and ${suggestions.length} suggestions`
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async explainDecision(args: any) {
    const { path: filePath } = args;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8').slice(0, 2000);
      const routing = this.applyRoutingRules(path.basename(filePath), content);
      
      const explanation = {
        file_path: filePath,
        current_location: path.dirname(filePath),
        suggested_location: routing?.target || 'unknown',
        reasoning: routing?.reason || 'No specific rules matched',
        applied_rules: routing?.applied_rules || [],
        confidence: routing?.confidence || 0,
        alternatives: this.getAlternatives(path.dirname(filePath)),
        policy_version: this.policy.version || 'unknown'
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(explanation, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing file: ${error.message}`
          }
        ]
      };
    }
  }

  private async validatePolicy(args: any) {
    const { verbose = false } = args;
    const errors = [];
    const warnings = [];

    // Validate policy structure
    if (!this.policy.roots || !Array.isArray(this.policy.roots)) {
      errors.push('Policy missing or invalid roots array');
    }

    if (!this.policy.routing || !Array.isArray(this.policy.routing)) {
      errors.push('Policy missing or invalid routing array');
    }

    if (!this.policy.forbid || !Array.isArray(this.policy.forbid)) {
      errors.push('Policy missing or invalid forbid array');
    }

    // Validate routing rules
    if (this.policy.routing) {
      for (const rule of this.policy.routing) {
        if (!rule.match || !rule.to) {
          errors.push(`Invalid routing rule: missing match or to field`);
        }
        if (rule.priority && (typeof rule.priority !== 'number' || rule.priority < 0 || rule.priority > 10)) {
          warnings.push(`Routing rule priority should be 0-10, got: ${rule.priority}`);
        }
      }
    }

    // Validate thresholds
    if (this.policy.thresholds) {
      const { min_similarity, hard_block, confidence_threshold } = this.policy.thresholds;
      if (min_similarity && (min_similarity < 0 || min_similarity > 1)) {
        errors.push(`min_similarity must be 0-1, got: ${min_similarity}`);
      }
      if (hard_block && (hard_block < 0 || hard_block > 1)) {
        errors.push(`hard_block must be 0-1, got: ${hard_block}`);
      }
      if (confidence_threshold && (confidence_threshold < 0 || confidence_threshold > 1)) {
        errors.push(`confidence_threshold must be 0-1, got: ${confidence_threshold}`);
      }
    }

    const result = {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: `Policy validation: ${errors.length} errors, ${warnings.length} warnings`
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async updatePolicy(args: any) {
    const { section, changes, reason } = args;
    
    // This is a placeholder - in production you'd want proper approval workflows
    const result = {
      status: 'pending_approval',
      section,
      changes,
      reason,
      message: 'Policy updates require manual approval. Create a PR with your changes.',
      timestamp: new Date().toISOString()
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async getRepositoryStats(args: any) {
    const { includeDetails = false } = args;
    
    try {
      const stats = {
        total_files: 0,
        by_directory: {},
        policy_compliance: {
          compliant: 0,
          violations: 0,
          suggestions: 0
        },
        file_types: {},
        last_updated: new Date().toISOString()
      };

      // Count files by directory
      const files = this.getAllFiles('.');
      stats.total_files = files.length;

      for (const file of files) {
        const dir = path.dirname(file) || '.';
        stats.by_directory[dir] = (stats.by_directory[dir] || 0) + 1;
        
        const ext = path.extname(file);
        stats.file_types[ext] = (stats.file_types[ext] || 0) + 1;
      }

      if (includeDetails) {
        stats.detailed_analysis = this.analyzeCompliance(files);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting repository stats: ${error.message}`
          }
        ]
      };
    }
  }

  // Helper methods
  private applyRoutingRules(filename: string, content: string) {
    if (!this.policy.routing) return null;

    const fileName = filename.toLowerCase();
    const fileContent = content.toLowerCase();
    
    for (const rule of this.policy.routing) {
      const regex = new RegExp(rule.match, 'i');
      if (regex.test(fileName) || regex.test(fileContent)) {
        return {
          target: rule.to,
          reason: rule.reason || 'Rule matched',
          priority: rule.priority || 5,
          confidence: 0.9,
          applied_rules: [rule.match]
        };
      }
    }
    
    return null;
  }

  private suggestNaming(filename: string, fileType?: string) {
    const ext = fileType || path.extname(filename);
    const baseName = path.basename(filename, ext);
    
    // Convert to kebab-case
    const kebabName = baseName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
    
    return {
      suggested_name: `${kebabName}${ext}`,
      original_name: filename,
      transformation: 'kebab-case'
    };
  }

  private calculateConfidence(routing: any, content: string) {
    if (!routing) return 0.3;
    
    let confidence = 0.7; // Base confidence for rule match
    
    // Boost confidence based on content relevance
    if (content.length > 100) confidence += 0.1;
    if (content.length > 500) confidence += 0.1;
    
    // Boost based on rule priority
    if (routing.priority >= 8) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private getAlternatives(targetDir: string) {
    // Return alternative directories for similar files
    const alternatives = [];
    if (targetDir.includes('scripts/')) {
      alternatives.push('scripts/utils/', 'scripts/ops/', 'scripts/safety/');
    }
    if (targetDir.includes('infra/')) {
      alternatives.push('infra/docker/', 'infra/nginx/');
    }
    return alternatives.filter(alt => alt !== targetDir);
  }

  private isForbidden(filePath: string) {
    if (!this.policy.forbid) return false;
    
    for (const pattern of this.policy.forbid) {
      const regex = new RegExp(pattern);
      if (regex.test(filePath)) {
        return true;
      }
    }
    return false;
  }

  private validateStructure(filePath: string) {
    if (!this.policy.roots) return { valid: true };
    
    const segments = filePath.split('/');
    const rootDir = segments[0];
    
    if (!this.policy.roots.includes(rootDir + '/')) {
      return {
        valid: false,
        issue: 'File not in allowed root directory',
        suggestion: `Move to one of: ${this.policy.roots.join(', ')}`
      };
    }
    
    return { valid: true };
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item === '.git' || item === 'node_modules') continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
    
    return files;
  }

  private analyzeCompliance(files: string[]) {
    const analysis = {
      structure_violations: [],
      forbidden_paths: [],
      naming_issues: []
    };

    for (const file of files) {
      if (this.isForbidden(file)) {
        analysis.forbidden_paths.push(file);
      }
      
      const structureCheck = this.validateStructure(file);
      if (!structureCheck.valid) {
        analysis.structure_violations.push({
          file,
          issue: structureCheck.issue,
          suggestion: structureCheck.suggestion
        });
      }
    }

    return analysis;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Repo Brain MCP Server started');
  }
}

// Start the server
const server = new RepoBrainMCPServer();
server.run().catch(console.error);
