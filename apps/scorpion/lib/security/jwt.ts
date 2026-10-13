/**
 * JWT Utilities
 * JSON Web Token creation and validation — fail closed if JWT_SECRET is missing.
 */

import { sign, verify, decode } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { requireEnv } from '../env';

export interface JWTPayload {
  userId?: string;
  serviceId?: string;
  apiKeyId?: string;
  role?: string;
  permissions?: string[];
  exp?: number;
  iat?: number;
  jti?: string;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function getJwtSecret(): string {
  return requireEnv('JWT_SECRET');
}

export function isJwtConfigured(): boolean {
  try {
    getJwtSecret();
    return true;
  } catch {
    return false;
  }
}

export function signToken(payload: Omit<JWTPayload, 'exp' | 'iat' | 'jti'>): string {
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: randomBytes(16).toString('hex'),
  };

  return sign(tokenPayload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error: any) {
    if (error?.name === 'MissingEnvError') {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return decode(token) as JWTPayload;
  } catch (error) {
    console.warn('[jwt] decode failed', error instanceof Error ? error.message : 'unknown');
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return decoded.exp < Math.floor(Date.now() / 1000);
}
