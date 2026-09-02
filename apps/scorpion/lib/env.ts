/**
 * Fail-closed environment access.
 * Required secrets must be present — no silent defaults.
 */

export class MissingEnvError extends Error {
  readonly name = 'MissingEnvError';
  constructor(public readonly key: string) {
    super(`Missing required environment variable: ${key}`);
  }
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new MissingEnvError(key);
  }
  return value.trim();
}

export function optionalEnv(key: string): string | undefined {
  const value = process.env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

export function hasEnv(key: string): boolean {
  return optionalEnv(key) !== undefined;
}
