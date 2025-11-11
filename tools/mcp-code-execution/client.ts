/**
 * MCP Code Execution Client
 * 
 * This client enables code-based interaction with MCP servers,
 * reducing token consumption by loading tools on-demand instead of
 * loading all tool definitions upfront.
 * 
 * Based on Anthropic's code execution with MCP pattern:
 * https://www.anthropic.com/engineering/code-execution-with-mcp
 */

import { spawn } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface MCPToolCall {
  server: string;
  tool: string;
  parameters: Record<string, any>;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Call an MCP tool via code execution
 * This avoids loading all tool definitions into context
 */
export async function callMCPTool<T = any>(
  server: string,
  tool: string,
  parameters: Record<string, any>
): Promise<T> {
  // Convert tool name to function name (e.g., "workflows.list" -> "workflows_list")
  const functionName = tool.replace(/\./g, '_');
  
  // Generate code to call the tool
  const code = `
import { callMCPToolDirect } from './client.js';

export async function ${functionName}(input) {
  return callMCPToolDirect('${server}', '${tool}', input);
}
`;

  // Write to temporary file
  const tempDir = join(__dirname, 'generated');
  await mkdir(tempDir, { recursive: true });
  const tempFile = join(tempDir, `${server}_${functionName}.mjs`);
  await writeFile(tempFile, code);

  // Execute via MCP server
  return callMCPToolDirect(server, tool, parameters);
}

/**
 * Direct MCP tool call (used internally)
 */
export async function callMCPToolDirect(
  server: string,
  tool: string,
  parameters: Record<string, any>
): Promise<any> {
  // This would integrate with your MCP server implementation
  // For now, we'll use a standard approach
  const mcpServerPath = join(__dirname, '../../mcp-servers/comprehensive-n8n-server.mjs');
  
  // In a real implementation, this would communicate with the MCP server
  // via stdio or HTTP
  throw new Error('Direct MCP calls should be implemented via MCP protocol');
}

/**
 * Generate TypeScript modules for all tools in a server
 * This creates the filesystem structure for progressive disclosure
 */
export async function generateToolModules(serverName: string, tools: any[]): Promise<void> {
  const serverDir = join(__dirname, 'servers', serverName);
  await mkdir(serverDir, { recursive: true });

  // Group tools by category (e.g., workflows.*, nodes.*)
  const toolGroups: Record<string, any[]> = {};
  
  for (const tool of tools) {
    const [category] = tool.name.split('.');
    if (!toolGroups[category]) {
      toolGroups[category] = [];
    }
    toolGroups[category].push(tool);
  }

  // Generate index file
  const indexExports: string[] = [];
  
  for (const [category, categoryTools] of Object.entries(toolGroups)) {
    const categoryFile = join(serverDir, `${category}.ts`);
    const categoryExports: string[] = [];
    
    for (const tool of categoryTools) {
      const functionName = tool.name.replace(/\./g, '_');
      const interfaceName = `${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Input`;
      
      // Generate TypeScript interface from input schema
      const properties = tool.inputSchema?.properties || {};
      const required = tool.inputSchema?.required || [];
      
      const interfaceCode = Object.entries(properties)
        .map(([key, value]: [string, any]) => {
          const optional = required.includes(key) ? '' : '?';
          const type = mapJsonSchemaToTypeScript(value);
          return `  ${key}${optional}: ${type};`;
        })
        .join('\n');
      
      const toolCode = `
import { callMCPTool } from '../../client.js';

export interface ${interfaceName} {
${interfaceCode}
}

/**
 * ${tool.description}
 */
export async function ${functionName}(input: ${interfaceName}): Promise<any> {
  return callMCPTool('${serverName}', '${tool.name}', input);
}
`;
      
      await writeFile(join(serverDir, `${functionName}.ts`), toolCode);
      categoryExports.push(`export * from './${functionName}.js';`);
    }
    
    // Write category file
    await writeFile(categoryFile, categoryExports.join('\n'));
    indexExports.push(`export * as ${category} from './${category}.js';`);
  }
  
  // Write main index file
  const indexContent = `
/**
 * ${serverName} MCP Tools
 * 
 * Import only what you need for progressive disclosure:
 * 
 * import { workflows } from './servers/${serverName}';
 * const list = await workflows.workflows_list({ limit: 10 });
 */
${indexExports.join('\n')}
`;
  
  await writeFile(join(serverDir, 'index.ts'), indexContent);
}

/**
 * Map JSON Schema types to TypeScript types
 */
function mapJsonSchemaToTypeScript(schema: any): string {
  if (schema.type === 'string') return 'string';
  if (schema.type === 'number') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') {
    const itemsType = schema.items ? mapJsonSchemaToTypeScript(schema.items) : 'any';
    return `${itemsType}[]`;
  }
  if (schema.type === 'object') return 'Record<string, any>';
  return 'any';
}

/**
 * Search tools by keyword (progressive disclosure)
 */
export async function searchTools(
  serverName: string,
  query: string,
  detailLevel: 'name' | 'description' | 'full' = 'description'
): Promise<any[]> {
  // Load tool definitions on-demand
  const toolsPath = join(__dirname, 'servers', serverName, 'tools.json');
  
  try {
    const toolsData = await readFile(toolsPath, 'utf-8');
    const tools = JSON.parse(toolsData);
    
    // Filter tools by query
    const matches = tools.filter((tool: any) => {
      const searchText = `${tool.name} ${tool.description}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
    
    // Return based on detail level
    if (detailLevel === 'name') {
      return matches.map((t: any) => ({ name: t.name }));
    }
    if (detailLevel === 'description') {
      return matches.map((t: any) => ({ 
        name: t.name, 
        description: t.description 
      }));
    }
    
    return matches;
  } catch (error) {
    console.error(`Failed to search tools: ${error}`);
    return [];
  }
}

