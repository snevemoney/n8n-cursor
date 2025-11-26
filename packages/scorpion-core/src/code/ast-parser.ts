/**
 * AST Parser Service
 * Parse TypeScript/JavaScript files using TypeScript compiler API
 */

import * as ts from 'typescript';
import fs from 'fs/promises';
import path from 'path';

export interface ImportInfo {
  from: string;
  imports: string[];
  isTypeOnly: boolean;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'default';
  isTypeOnly: boolean;
}

export interface FunctionInfo {
  name: string;
  parameters: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
}

export interface ASTResult {
  imports: ImportInfo[];
  exports: ExportInfo[];
  functions: FunctionInfo[];
  classes: Array<{
    name: string;
    methods: FunctionInfo[];
    isExported: boolean;
  }>;
  dependencies: string[]; // File paths this file imports
}

interface CachedAST {
  ast: ASTResult;
  mtime: number;
}

export class ASTParser {
  private astCache = new Map<string, CachedAST>();
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Parse a file and return AST structure
   */
  async parseFile(filePath: string): Promise<ASTResult | null> {
    const normalizedPath = path.normalize(filePath);
    
    // Check cache
    const cached = this.astCache.get(normalizedPath);
    if (cached) {
      try {
        const stats = await fs.stat(normalizedPath);
        if (stats.mtimeMs === cached.mtime) {
          return cached.ast;
        }
      } catch {
        // File doesn't exist, remove from cache
        this.astCache.delete(normalizedPath);
      }
    }

    // Check if file is TypeScript/JavaScript
    const ext = path.extname(normalizedPath).toLowerCase();
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      return null;
    }

    try {
      const content = await fs.readFile(normalizedPath, 'utf-8');
      const stats = await fs.stat(normalizedPath);
      
      const sourceFile = ts.createSourceFile(
        normalizedPath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const result: ASTResult = {
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        dependencies: []
      };

      // Traverse AST
      const visitor = (node: ts.Node) => {
        // Extract imports
        if (ts.isImportDeclaration(node)) {
          const importInfo = this.extractImport(node);
          if (importInfo) {
            result.imports.push(importInfo);
            // Resolve import path to file path
            const resolvedPath = this.resolveImportPath(importInfo.from, normalizedPath);
            if (resolvedPath) {
              result.dependencies.push(resolvedPath);
            }
          }
        }

        // Extract exports
        if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
          const exports = this.extractExport(node, sourceFile);
          result.exports.push(...exports);
        }

        // Extract functions
        if (ts.isFunctionDeclaration(node) && node.name) {
          const funcInfo = this.extractFunction(node, sourceFile);
          if (funcInfo) {
            result.functions.push(funcInfo);
          }
        }

        // Extract classes
        if (ts.isClassDeclaration(node) && node.name) {
          const classInfo = this.extractClass(node, sourceFile);
          if (classInfo) {
            result.classes.push(classInfo);
          }
        }

        ts.forEachChild(node, visitor);
      };

      visitor(sourceFile);

      // Cache result
      this.astCache.set(normalizedPath, {
        ast: result,
        mtime: stats.mtimeMs
      });

      return result;
    } catch (error) {
      console.error(`Error parsing file ${normalizedPath}:`, error);
      return null;
    }
  }

  /**
   * Extract import information
   */
  private extractImport(node: ts.ImportDeclaration): ImportInfo | null {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
      return null;
    }

    const from = node.moduleSpecifier.text;
    const imports: string[] = [];
    let isTypeOnly = node.importClause?.isTypeOnly || false;

    if (node.importClause) {
      if (node.importClause.namedBindings) {
        if (ts.isNamedImports(node.importClause.namedBindings)) {
          node.importClause.namedBindings.elements.forEach(elem => {
            imports.push(elem.name.text);
            if (elem.isTypeOnly) isTypeOnly = true;
          });
        } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
          imports.push(node.importClause.namedBindings.name.text);
        }
      }
      if (node.importClause.name) {
        imports.push(node.importClause.name.text); // default import
      }
    }

    return { from, imports, isTypeOnly };
  }

  /**
   * Extract export information
   */
  private extractExport(
    node: ts.ExportDeclaration | ts.ExportAssignment,
    sourceFile: ts.SourceFile
  ): ExportInfo[] {
    const exports: ExportInfo[] = [];

    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(elem => {
          exports.push({
            name: elem.name.text,
            type: 'const', // Default, could be refined
            isTypeOnly: elem.isTypeOnly || false
          });
        });
      }
    } else if (ts.isExportAssignment(node)) {
      exports.push({
        name: 'default',
        type: 'default',
        isTypeOnly: false
      });
    }

    return exports;
  }

  /**
   * Extract function information
   */
  private extractFunction(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile
  ): FunctionInfo | null {
    if (!node.name) return null;

    const parameters = node.parameters.map(param => {
      const name = ts.isIdentifier(param.name) ? param.name.text : 'unknown';
      const type = param.type ? sourceFile.text.substring(param.type.pos, param.type.end) : '';
      return type ? `${name}: ${type}` : name;
    });

    const returnType = node.type
      ? sourceFile.text.substring(node.type.pos, node.type.end)
      : undefined;

    const isExported = node.modifiers?.some(
      mod => mod.kind === ts.SyntaxKind.ExportKeyword
    ) || false;

    return {
      name: node.name.text,
      parameters,
      returnType,
      isAsync: node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword) || false,
      isExported
    };
  }

  /**
   * Extract class information
   */
  private extractClass(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): { name: string; methods: FunctionInfo[]; isExported: boolean } | null {
    if (!node.name) return null;

    const methods: FunctionInfo[] = [];
    
    node.members.forEach(member => {
      if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const parameters = member.parameters.map(param => {
          const name = ts.isIdentifier(param.name) ? param.name.text : 'unknown';
          const type = param.type ? sourceFile.text.substring(param.type.pos, param.type.end) : '';
          return type ? `${name}: ${type}` : name;
        });

        methods.push({
          name: member.name.text,
          parameters,
          returnType: member.type
            ? sourceFile.text.substring(member.type.pos, member.type.end)
            : undefined,
          isAsync: member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword) || false,
          isExported: false // Methods are not directly exported
        });
      }
    });

    const isExported = node.modifiers?.some(
      mod => mod.kind === ts.SyntaxKind.ExportKeyword
    ) || false;

    return {
      name: node.name.text,
      methods,
      isExported
    };
  }

  /**
   * Resolve import path to actual file path
   * Note: This is synchronous path resolution, actual file existence is checked asynchronously
   */
  private resolveImportPath(importPath: string, fromFile: string): string | null {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const dir = path.dirname(fromFile);
      const resolved = path.resolve(dir, importPath);
      
      // Return the most likely path (without checking existence for performance)
      // Actual existence will be checked when the file is accessed
      return path.normalize(resolved);
    }

    // Handle workspace imports (e.g., @scorpion/core)
    if (importPath.startsWith('@')) {
      // Try to resolve from workspace root
      const parts = importPath.split('/');
      const packageName = parts[0];
      const rest = parts.slice(1).join('/');
      
      // Look in packages/ or apps/
      const candidates = [
        path.join(this.workspaceRoot, 'packages', packageName.replace('@', ''), rest),
        path.join(this.workspaceRoot, 'apps', packageName.replace('@', ''), rest)
      ];

      // Return first candidate (existence will be checked when accessed)
      if (candidates[0]) {
        return path.normalize(candidates[0]);
      }
    }

    return null;
  }

  /**
   * Find all files that a file imports
   */
  async findDependencies(filePath: string): Promise<string[]> {
    const ast = await this.parseFile(filePath);
    return ast?.dependencies || [];
  }

  /**
   * Clear AST cache
   */
  clearCache(): void {
    this.astCache.clear();
  }

  /**
   * Invalidate cache for a specific file
   */
  invalidateCache(filePath: string): void {
    const normalizedPath = path.normalize(filePath);
    this.astCache.delete(normalizedPath);
  }
}

// Singleton instance
let astParserInstance: ASTParser | null = null;

/**
 * Get the global AST parser instance
 */
export function getASTParser(workspaceRoot?: string): ASTParser {
  if (!astParserInstance) {
    astParserInstance = new ASTParser(workspaceRoot);
  }
  return astParserInstance;
}

