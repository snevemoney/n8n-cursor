/**
 * JWT Utilities
 * JSON Web Token creation and validation
 */

import { sign, verify, decode } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

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

const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('base64');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Sign a JWT token
 */
export function signToken(payload: Omit<JWTPayload, 'exp' | 'iat' | 'jti'>): string {
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: randomBytes(16).toString('hex'),
  };

  return sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for inspection)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return decoded.exp < Math.floor(Date.now() / 1000);
}

