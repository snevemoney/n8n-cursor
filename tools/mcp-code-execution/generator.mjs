#!/usr/bin/env node

/**
 * MCP Tool Code Generator
 * 
 * Generates TypeScript modules for MCP tools to enable code execution pattern.
 * This reduces token consumption by allowing on-demand tool loading.
 * 
 * Usage:
 *   node generator.mjs --server n8n-automation --tools-path ../mcp-servers/comprehensive-n8n-server.mjs
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const serverName = args.find(arg => arg.startsWith('--server'))?.split('=')[1] || 'n8n-automation';
const toolsPath = args.find(arg => arg.startsWith('--tools-path'))?.split('=')[1] || '../mcp-servers/comprehensive-n8n-server.mjs';

async function generateCodeModules() {
  console.log(`🚀 Generating code modules for server: ${serverName}`);
  console.log(`📁 Reading tools from: ${toolsPath}`);
  
  // Read the MCP server file to extract tool definitions
  const serverFile = join(__dirname, toolsPath);
  const serverContent = await readFile(serverFile, 'utf-8');
  
  // Extract tool definitions using regex (simplified - in production, use AST parsing)
  const toolRegex = /name:\s*['"]([^'"]+)['"],\s*description:\s*['"]([^'"]+)['"],\s*inputSchema:\s*({[^}]+})/gs;
  const tools = [];
  let match;
  
  while ((match = toolRegex.exec(serverContent)) !== null) {
    const [, name, description, schemaStr] = match;
    try {
      // Parse the schema (simplified - would need proper JSON parsing)
      const schema = eval(`(${schemaStr})`);
      tools.push({ name, description, inputSchema: schema });
    } catch (e) {
      console.warn(`⚠️  Failed to parse schema for ${name}: ${e.message}`);
    }
  }
  
  console.log(`✅ Found ${tools.length} tools`);
  
  // Create server directory
  const serverDir = join(__dirname, 'servers', serverName);
  await mkdir(serverDir, { recursive: true });
  
  // Group tools by category
  const toolGroups = {};
  for (const tool of tools) {
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
      
      // Generate TypeScript interface
      const properties = tool.inputSchema?.properties || {};
      const required = tool.inputSchema?.required || [];
      
      const interfaceFields = Object.entries(properties)
        .map(([key, value]) => {
          const optional = required.includes(key) ? '' : '?';
          const type = mapJsonSchemaToTypeScript(value);
          return `  ${key}${optional}: ${type};`;
        })
        .join('\n');
      
      const toolCode = `import { callMCPTool } from '../client.js';

export interface ${interfaceName} {
${interfaceFields}
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
      
      console.log(`  ✓ Generated ${functionName}.ts`);
    }
    
    // Write category index
    const categoryFile = join(serverDir, `${category}.ts`);
    await writeFile(categoryFile, categoryExports.join('\n'));
    indexExports.push(`export * as ${category} from './${category}.js';`);
  }
  
  // Write main index
  const indexContent = `/**
 * ${serverName} MCP Tools
 * 
 * Progressive disclosure - import only what you need:
 * 
 * import { workflows } from './servers/${serverName}';
 * const list = await workflows.workflows_list({ limit: 10 });
 */

${indexExports.join('\n')}
`;
  
  await writeFile(join(serverDir, 'index.ts'), indexContent);
  
  // Save tool metadata for search
  await writeFile(
    join(serverDir, 'tools.json'),
    JSON.stringify(tools, null, 2)
  );
  
  console.log(`\n✨ Code generation complete!`);
  console.log(`📦 Generated ${tools.length} tool modules in ${serverDir}`);
  console.log(`\n💡 Usage example:`);
  console.log(`   import { workflows } from './servers/${serverName}';`);
  console.log(`   const result = await workflows.workflows_list({ limit: 10 });`);
}

function mapJsonSchemaToTypeScript(schema) {
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

// Run generator
generateCodeModules().catch(console.error);

