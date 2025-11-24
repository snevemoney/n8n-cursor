import { z } from 'zod';
import path from 'path';
import { getFileCache, getASTParser } from '@scorpion/core';
import { getFileTracker } from '../file-tracker';

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
    // Get workspace root - if we're in apps/scorpion, go up two levels
    const cwd = process.cwd();
    let workspaceRoot = cwd;
    
    // Check if we're running from apps/scorpion directory
    if (cwd.includes('/apps/scorpion') || cwd.endsWith('apps/scorpion')) {
      workspaceRoot = path.resolve(cwd, '../..');
    }
    
    // Resolve file path
    let filePath: string;
    if (path.isAbsolute(args.path)) {
      filePath = args.path;
    } else {
      filePath = path.join(workspaceRoot, args.path);
    }

    // Normalize path and make it absolute
    const normalizedPath = path.resolve(path.normalize(filePath));

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

    // Track file access
    const tracker = getFileTracker();
    tracker.trackFile({
      path: args.path,
      timestamp: Date.now(),
      source: 'read',
      contentType: fileContent.language,
      size: fileContent.content.length,
      contentPreview: fileContent.content.substring(0, 200),
    });

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
      totalLines: fileContent.content.split('\n').length, // Include total lines even if truncated
      lastModified: new Date(fileContent.lastModified).toISOString(),
      size: fileContent.content.length, // Include file size for precision
      truncated: args.maxLines && content.split('\n').length < fileContent.content.split('\n').length, // Indicate if truncated
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

