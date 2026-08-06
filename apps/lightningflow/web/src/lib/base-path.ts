const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

/**
 * Prefix browser-facing absolute paths for deployments below an apex path.
 * Next.js handles basePath for Link/router, but native fetch and location APIs do not.
 */
export function appPath(path: string): string {
  if (!path.startsWith('/')) {
    return path;
  }

  if (!BASE_PATH || path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
    return path;
  }

  return `${BASE_PATH}${path}`;
}

export const apiPath = appPath;
