import { createHash, createHmac, randomBytes } from 'crypto';
import { createSign, createVerify } from 'crypto';

/**
 * Core Cryptographic Module for Lightning AI Business Node Platform
 * 
 * Provides cryptographic primitives for:
 * - Transaction signing and verification
 * - Action hashing and proof generation
 * - Secure payload validation
 * - Audit trail generation
 */

export interface CryptoPayload {
  action: string;
  timestamp: number;
  userId: string;
  data: any;
  nonce?: string;
}

export interface SignedPayload extends CryptoPayload {
  signature: string;
  publicKey: string;
  hash: string;
}

export interface ProofRecord {
  hash: string;
  timestamp: number;
  action: string;
  userId: string;
  signature: string;
  publicKey: string;
  humanSummary: string;
  json: string;
}

/**
 * Generate a cryptographic hash of any payload
 */
export function hash(payload: any): string {
  const normalized = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate a secure nonce for replay protection
 */
export function generateNonce(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Create a standardized payload for signing
 */
export function createPayload(
  action: string,
  userId: string,
  data: any,
  includeNonce: boolean = true
): CryptoPayload {
  return {
    action,
    timestamp: Date.now(),
    userId,
    data,
    ...(includeNonce && { nonce: generateNonce() })
  };
}

/**
 * Sign a payload using a private key
 * In production, this would use hardware security modules or secure enclaves
 */
export function sign(payload: CryptoPayload, privateKey: string): SignedPayload {
  const payloadHash = hash(payload);
  
  // Create signature using RSA-SHA256
  const signer = createSign('RSA-SHA256');
  signer.update(payloadHash);
  const signature = signer.sign(privateKey, 'hex');
  
  // Extract public key from private key (in production, store separately)
  const publicKey = extractPublicKey(privateKey);
  
  return {
    ...payload,
    signature,
    publicKey,
    hash: payloadHash
  };
}

/**
 * Verify a signed payload
 */
export function verify(signedPayload: SignedPayload): boolean {
  try {
    const { signature, publicKey, hash: providedHash, ...payload } = signedPayload;
    
    // Verify hash integrity
    const computedHash = hash(payload);
    if (computedHash !== providedHash) {
      console.warn('Hash mismatch in signature verification');
      return false;
    }
    
    // Verify signature
    const verifier = createVerify('RSA-SHA256');
    verifier.update(computedHash);
    return verifier.verify(publicKey, signature, 'hex');
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Extract public key from private key (simplified for demo)
 * In production, use proper key management
 */
function extractPublicKey(privateKey: string): string {
  // This is a simplified implementation
  // In production, use proper cryptographic libraries
  return createHash('sha256').update(privateKey).digest('hex').slice(0, 64);
}

/**
 * Generate a human-readable summary of an action
 */
export function generateHumanSummary(action: string, data: any, userId: string): string {
  switch (action) {
    case 'send_payment':
      return `User ${userId} sent ${data.amount} sats to ${data.recipient}`;
    case 'receive_payment':
      return `User ${userId} received ${data.amount} sats from ${data.sender}`;
    case 'agent_execution':
      return `User ${userId} executed agent "${data.agentType}" with parameters: ${JSON.stringify(data.parameters)}`;
    case 'vault_transfer':
      return `User ${userId} moved ${data.amount} sats to secure vault`;
    case 'automation_rule':
      return `User ${userId} created automation rule: ${data.description}`;
    case 'contract_generation':
      return `User ${userId} generated contract for ${data.contractType}`;
    default:
      return `User ${userId} performed action: ${action}`;
  }
}

/**
 * Export a proof record for audit purposes
 */
export function exportProof(signedPayload: SignedPayload): ProofRecord {
  const humanSummary = generateHumanSummary(
    signedPayload.action,
    signedPayload.data,
    signedPayload.userId
  );
  
  return {
    hash: signedPayload.hash,
    timestamp: signedPayload.timestamp,
    action: signedPayload.action,
    userId: signedPayload.userId,
    signature: signedPayload.signature,
    publicKey: signedPayload.publicKey,
    humanSummary,
    json: JSON.stringify(signedPayload, null, 2)
  };
}

/**
 * Validate timestamp to prevent replay attacks
 */
export function validateTimestamp(timestamp: number, maxAgeMs: number = 300000): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age >= 0 && age <= maxAgeMs;
}

/**
 * Create a secure HMAC for API authentication
 */
export function createHMAC(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createHMAC(data, secret);
  return signature === expectedSignature;
}

/**
 * Generate a deterministic ID for deduplication
 */
export function generateDeterministicId(payload: CryptoPayload): string {
  const { nonce, timestamp, ...deterministicData } = payload;
  return hash(deterministicData);
}

/**
 * Crypto utilities for development mode debugging
 */
export const DevCrypto = {
  /**
   * Generate a test key pair (DO NOT USE IN PRODUCTION)
   */
  generateTestKeyPair(): { privateKey: string; publicKey: string } {
    const privateKey = randomBytes(32).toString('hex');
    const publicKey = extractPublicKey(privateKey);
    return { privateKey, publicKey };
  },
  
  /**
   * Inspect a signed payload for debugging
   */
  inspectPayload(signedPayload: SignedPayload) {
    return {
      action: signedPayload.action,
      userId: signedPayload.userId,
      timestamp: new Date(signedPayload.timestamp).toISOString(),
      hash: signedPayload.hash,
      publicKey: signedPayload.publicKey.slice(0, 16) + '...',
      signature: signedPayload.signature.slice(0, 16) + '...',
      isValid: verify(signedPayload),
      humanSummary: generateHumanSummary(
        signedPayload.action,
        signedPayload.data,
        signedPayload.userId
      )
    };
  }
}; 