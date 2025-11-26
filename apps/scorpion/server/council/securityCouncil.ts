// apps/scorpion/server/council/securityCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

function includesAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === 'string' ? text.includes(p.toLowerCase()) : p.test(text),
  );
}

export const SecurityCouncilMember: CouncilMember = {
  id: 'security',
  name: 'Security Councillor',
  description:
    'Flags security risks: API keys, secrets, authentication, authorization, data exposure, and unsafe operations.',

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for API keys or secrets
    const mentionsSecrets = includesAny(text, [
      'api key',
      'api_key',
      'secret',
      'password',
      'token',
      'credential',
      'private key',
      'access token',
      'bearer token',
      'auth token',
    ]);

    if (mentionsSecrets && !text.includes('environment variable') && !text.includes('env var') && !text.includes('.env')) {
      issues.push({
        severity: 5,
        tag: 'safety',
        message: 'Potential exposure of API keys, secrets, or credentials.',
        recommendation:
          'Never hardcode secrets. Use environment variables, secret managers, or secure configuration files. Ensure secrets are never committed to version control.',
        councillorId: 'security',
      });

      logImprovementSignal({
        type: 'BROKEN_FLOW',
        message: 'Security risk: API keys or secrets mentioned without proper handling.',
        tag: 'security',
        severity: 5,
      });
    }

    // Check for authentication/authorization issues
    const mentionsAuth = includesAny(text, [
      'login',
      'authenticate',
      'authorize',
      'access control',
      'permission',
      'role',
    ]);

    const mentionsPublic = includesAny(text, [
      'public endpoint',
      'public api',
      'no authentication',
      'skip auth',
      'bypass auth',
    ]);

    if (mentionsAuth && mentionsPublic) {
      issues.push({
        severity: 4,
        tag: 'safety',
        message: 'Public endpoint without authentication detected.',
        recommendation:
          'All endpoints that handle sensitive data or operations must require authentication and proper authorization checks.',
        councillorId: 'security',
      });
    }

    // Check for SQL injection risks
    const mentionsSQL = includesAny(text, [
      'sql query',
      'database query',
      'execute sql',
      'raw sql',
    ]);

    const mentionsUserInput = includesAny(text, [
      'user input',
      'user data',
      'form data',
      'request body',
    ]);

    if (mentionsSQL && mentionsUserInput && !text.includes('parameterized') && !text.includes('prepared statement') && !text.includes('orm')) {
      issues.push({
        severity: 4,
        tag: 'safety',
        message: 'SQL query construction with user input may be vulnerable to SQL injection.',
        recommendation:
          'Use parameterized queries, prepared statements, or ORM libraries to prevent SQL injection attacks.',
        councillorId: 'security',
      });
    }

    // Check for file system operations
    const mentionsFileOps = includesAny(text, [
      'write file',
      'read file',
      'delete file',
      'file system',
      'fs.write',
      'fs.read',
    ]);

    const mentionsUserPath = includesAny(text, [
      'user path',
      'user file',
      'upload',
      'user provided',
    ]);

    if (mentionsFileOps && mentionsUserPath && !text.includes('validate') && !text.includes('sanitize') && !text.includes('path traversal')) {
      issues.push({
        severity: 3,
        tag: 'safety',
        message: 'File operations with user-provided paths may be vulnerable to path traversal attacks.',
        recommendation:
          'Validate and sanitize all user-provided file paths. Use path resolution libraries and restrict file operations to safe directories.',
        councillorId: 'security',
      });
    }

    // Check for XSS risks
    const mentionsHTML = includesAny(text, [
      'render html',
      'innerhtml',
      'dangerouslysetinnerhtml',
      'html content',
    ]);

    if (mentionsHTML && mentionsUserInput && !text.includes('sanitize') && !text.includes('escape') && !text.includes('xss')) {
      issues.push({
        severity: 3,
        tag: 'safety',
        message: 'Rendering user-provided HTML may be vulnerable to XSS attacks.',
        recommendation:
          'Sanitize or escape all user-provided content before rendering. Use libraries like DOMPurify or similar sanitization tools.',
        councillorId: 'security',
      });
    }

    // Check for CORS misconfiguration
    const mentionsCORS = includesAny(text, [
      'cors',
      'cross-origin',
      'allow origin',
    ]);

    if (mentionsCORS && text.includes('*') && !text.includes('specific origin')) {
      issues.push({
        severity: 2,
        tag: 'safety',
        message: 'CORS configured to allow all origins (*) may expose the API to unauthorized access.',
        recommendation:
          'Configure CORS to allow only specific, trusted origins. Avoid using wildcard (*) in production.',
        councillorId: 'security',
      });
    }

    return {
      approved: issues.length === 0,
      issues,
    };
  },
};

