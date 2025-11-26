/**
 * JWT Tests
 */

import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, decodeToken, isTokenExpired } from '../jwt';

describe('JWT', () => {
  it('should sign and verify token', () => {
    const payload = {
      userId: 'user-123',
      role: 'admin',
      permissions: ['read', 'write'],
    };

    const token = signToken(payload);
    const verified = verifyToken(token);

    expect(verified.userId).toBe(payload.userId);
    expect(verified.role).toBe(payload.role);
    expect(verified.permissions).toEqual(payload.permissions);
    expect(verified.iat).toBeDefined();
    expect(verified.jti).toBeDefined();
  });

  it('should fail to verify invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  it('should decode token without verification', () => {
    const payload = {
      userId: 'user-123',
      role: 'user',
    };

    const token = signToken(payload);
    const decoded = decodeToken(token);

    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.role).toBe(payload.role);
  });

  it('should check token expiration', () => {
    const token = signToken({ userId: 'user-123' });
    
    // Token should not be expired immediately
    expect(isTokenExpired(token)).toBe(false);
  });
});

