#!/usr/bin/env node

/**
 * Improved MCP Tool Code Generator
 * 
 * Extracts tool definitions directly from the MCP server file
 * and generates TypeScript modules for code execution pattern.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateCodeModules() {
  const serverName = 'n8n-automation';
  const serverFile = join(__dirname, '../mcp-servers/comprehensive-n8n-server.mjs');
  
  console.log(`🚀 Generating code modules for: ${serverName}`);
  console.log(`📁 Reading from: ${serverFile}`);
  
  // Read the server file
  const content = await readFile(serverFile, 'utf-8');
  
  // Extract the tools array using a more robust approach
  // Find the tools array definition
  const toolsMatch = content.match(/const tools = \[([\s\S]*?)\];/);
  if (!toolsMatch) {
    throw new Error('Could not find tools array in server file');
  }
  
  // Parse tools using eval in a safe way (in production, use proper AST parsing)
  const toolsArrayStr = toolsMatch[1];
  
  // Extract individual tool objects
  const toolObjects = [];
  let depth = 0;
  let currentTool = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < toolsArrayStr.length; i++) {
    const char = toolsArrayStr[i];
    const prevChar = i > 0 ? toolsArrayStr[i - 1] : '';
    
    // Handle string literals
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          currentTool = '';
        }
        depth++;
        currentTool += char;
      } else if (char === '}') {
        currentTool += char;
        depth--;
        if (depth === 0) {
          // Try to parse this tool object
          try {
            // Clean up the tool string
            const cleaned = currentTool
              .replace(/\/\/.*$/gm, '') // Remove comments
              .trim();
            
            // Use Function constructor for safer eval
            const toolObj = new Function('return ' + cleaned)();
            if (toolObj.name && toolObj.description) {
              toolObjects.push(toolObj);
            }
          } catch (e) {
            console.warn(`⚠️  Failed to parse tool object: ${e.message}`);
          }
          currentTool = '';
        }
      } else if (depth > 0) {
        currentTool += char;
      }
    } else {
      currentTool += char;
    }
  }
  
  console.log(`✅ Extracted ${toolObjects.length} tools`);
  
  // Create server directory
  const serverDir = join(__dirname, 'servers', serverName);
  await mkdir(serverDir, { recursive: true });
  
  // Group tools by category
  const toolGroups = {};
  for (const tool of toolObjects) {
    const [category] = tool.name.split('.');
    if (!toolGroups[category]) {
      toolGroups[category] = [];
    }
    toolGroups[category].push(tool);
  }
  
  // Generate TypeScript modules
  const indexExports = [];
  
  for (const [category, categoryTools] of Object.entries(toolGroups)) {
    const categoryExports = [];
    
    for (const tool of categoryTools) {
      const functionName = tool.name.replace(/\./g, '_');
      const interfaceName = `${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Input`;
      
      // Generate TypeScript interface from input schema
      const properties = tool.inputSchema?.properties || {};
      const required = tool.inputSchema?.required || [];
      
      const interfaceFields = Object.entries(properties)
        .map(([key, value]) => {
          const optional = required.includes(key) ? '' : '?';
          const type = mapJsonSchemaToTypeScript(value);
          return `  ${key}${optional}: ${type};`;
        })
        .join('\n');
      
      const toolCode = `/**
 * ${tool.description}
 */
export interface ${interfaceName} {
${interfaceFields || '  // No parameters'}
}

/**
 * ${tool.description}
 * 
 * @example
 * import { ${functionName} } from './${functionName}';
 * const result = await ${functionName}({ /* parameters */ });
 */
export async function ${functionName}(input: ${interfaceName}): Promise<any> {
  // This would call the MCP tool via code execution
  // In n8n Code node, you would use:
  // const mcp = require('@n8n/mcp-client');
  // return await mcp.callTool('${serverName}', '${tool.name}', input);
  
  throw new Error('MCP tool calls must be executed in n8n Code node or external execution environment');
}
`;
      
      await writeFile(join(serverDir, `${functionName}.ts`), toolCode);
      categoryExports.push(`export * from './${functionName}.js';`);
      
      console.log(`  ✓ Generated ${functionName}.ts`);
    }
    
    // Write category index
    const categoryFile = join(serverDir, `${category}.ts`);
    await writeFile(categoryFile, categoryExports.join('\n'));
    indexExports.push(`export * as ${category} from './${category}.js';`);
  }
  
  // Write main index
  const indexContent = `/**
 * ${serverName} MCP Tools - Code Execution Pattern
 * 
 * Progressive disclosure - import only what you need:
 * 
 * @example
 * import { workflows } from './servers/${serverName}';
 * const list = await workflows.workflows_list({ limit: 10 });
 * 
 * @example
 * import { search_tools } from './servers/${serverName}';
 * const tools = await search_tools({ query: 'workflow', detailLevel: 'description' });
 */
${indexExports.join('\n')}

// Export search_tools for progressive disclosure
export { search_tools } from './search_tools.js';
`;
  
  await writeFile(join(serverDir, 'index.ts'), indexContent);
  
  // Create search_tools module
  const searchToolsCode = `/**
 * Search available tools by keyword (progressive disclosure)
 * 
 * This enables discovering tools without loading all definitions upfront.
 * 
 * @example
 * // Find workflow-related tools
 * const tools = await search_tools({ 
 *   query: 'workflow', 
 *   detailLevel: 'description' 
 * });
 */
export interface SearchToolsInput {
  query: string;
  detailLevel?: 'name' | 'description' | 'full';
}

export async function search_tools(input: SearchToolsInput): Promise<any[]> {
  // In n8n Code node:
  // const mcp = require('@n8n/mcp-client');
  // return await mcp.callTool('${serverName}', 'search_tools', input);
  
  throw new Error('MCP tool calls must be executed in n8n Code node');
}
`;
  
  await writeFile(join(serverDir, 'search_tools.ts'), searchToolsCode);
  
  // Save tool metadata for search
  await writeFile(
    join(serverDir, 'tools.json'),
    JSON.stringify(toolObjects, null, 2)
  );
  
  console.log(`\n✨ Code generation complete!`);
  console.log(`📦 Generated ${toolObjects.length} tool modules in ${serverDir}`);
  console.log(`\n💡 Usage example:`);
  console.log(`   import { workflows } from './servers/${serverName}';`);
  console.log(`   const result = await workflows.workflows_list({ limit: 10 });`);
  console.log(`\n🔍 Progressive disclosure:`);
  console.log(`   import { search_tools } from './servers/${serverName}';`);
  console.log(`   const tools = await search_tools({ query: 'workflow' });`);
}

function mapJsonSchemaToTypeScript(schema) {
  if (!schema || !schema.type) return 'any';
  
  if (schema.type === 'string') {
    if (schema.enum) {
      return schema.enum.map(e => `'${e}'`).join(' | ');
    }
    return 'string';
  }
  if (schema.type === 'number') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') {
    const itemsType = schema.items ? mapJsonSchemaToTypeScript(schema.items) : 'any';
    return `${itemsType}[]`;
  }
  if (schema.type === 'object') {
    if (schema.properties) {
      // This is a complex object, return Record for now
      return 'Record<string, any>';
    }
    return 'Record<string, any>';
  }
  return 'any';
}

// Run generator
generateCodeModules().catch(console.error);

