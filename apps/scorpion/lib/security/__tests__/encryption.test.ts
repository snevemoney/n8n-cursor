/**
 * Encryption Tests
 */

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hash, generateToken, generatePassword } from '../encryption';

describe('Encryption', () => {
  const testPassword = 'test-password-123';
  const testData = 'sensitive data here';

  it('should encrypt and decrypt data', async () => {
    const encrypted = await encrypt(testData, testPassword);
    const decrypted = await decrypt(encrypted, testPassword);

    expect(decrypted).toBe(testData);
    expect(encrypted.encrypted).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.salt).toBeDefined();
    expect(encrypted.tag).toBeDefined();
  });

  it('should fail to decrypt with wrong password', async () => {
    const encrypted = await encrypt(testData, testPassword);

    await expect(decrypt(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('should produce different encrypted values for same data', async () => {
    const encrypted1 = await encrypt(testData, testPassword);
    const encrypted2 = await encrypt(testData, testPassword);

    // Should be different due to random IV and salt
    expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.salt).not.toBe(encrypted2.salt);
  });

  it('should hash data consistently', () => {
    const hash1 = hash(testData);
    const hash2 = hash(testData);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 produces 64 char hex string
  });

  it('should generate unique tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();

    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(0);
  });

  it('should generate passwords', () => {
    const password = generatePassword(16);

    expect(password.length).toBe(16);
    expect(password).toMatch(/[A-Za-z0-9!@#$%^&*]/);
  });
});

