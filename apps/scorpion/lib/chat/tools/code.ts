import { z } from 'zod';
import path from 'path';
import { getFileCache, getASTParser } from '@scorpion/core';

export const name = 'code.readFile';
export const label = 'Read Code File';
export const description = 'Read a code file from the workspace with optional AST parsing and dependency information';

export const schema = z.object({
  path: z.string().min(1).describe('File path relative to workspace root'),
  includeAST: z.boolean().optional().default(false).describe('Include parsed AST structure'),
  includeDependencies: z.boolean().optional().default(false).describe('Include import dependencies'),
  maxLines: z.number().optional().describe('Limit number of lines returned (for large files)')
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const workspaceRoot = process.cwd();
    const filePath = path.isAbsolute(args.path) 
      ? args.path 
      : path.join(workspaceRoot, args.path);

    // Normalize path
    const normalizedPath = path.normalize(filePath);

    // Get file from cache (or read from disk)
    const fileCache = getFileCache();
    const fileContent = await fileCache.get(normalizedPath);

    if (!fileContent) {
      return {
        ok: false,
        error: `File not found: ${args.path}`,
        path: args.path
      };
    }

    // Apply line limit if specified
    let content = fileContent.content;
    if (args.maxLines && args.maxLines > 0) {
      const lines = content.split('\n');
      if (lines.length > args.maxLines) {
        content = lines.slice(0, args.maxLines).join('\n') + `\n... (${lines.length - args.maxLines} more lines)`;
      }
    }

    const result: any = {
      ok: true,
      path: args.path,
      language: fileContent.language,
      content,
      lines: content.split('\n').length,
      lastModified: new Date(fileContent.lastModified).toISOString()
    };

    // Include AST if requested
    if (args.includeAST) {
      const astParser = getASTParser(workspaceRoot);
      const ast = await astParser.parseFile(normalizedPath);
      
      if (ast) {
        result.ast = {
          imports: ast.imports.map(imp => ({
            from: imp.from,
            imports: imp.imports,
            isTypeOnly: imp.isTypeOnly
          })),
          exports: ast.exports,
          functions: ast.functions,
          classes: ast.classes
        };
      }
    }

    // Include dependencies if requested
    if (args.includeDependencies) {
      const astParser = getASTParser(workspaceRoot);
      const dependencies = await astParser.findDependencies(normalizedPath);
      
      result.dependencies = dependencies.map(dep => {
        const relative = path.relative(workspaceRoot, dep);
        return relative.startsWith('..') ? dep : relative;
      });
    }

    return result;
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to read file',
      path: args.path
    };
  }
}

