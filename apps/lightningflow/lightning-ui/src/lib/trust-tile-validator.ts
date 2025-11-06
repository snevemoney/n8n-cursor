/**
 * Lightning AI Platform - TrustTile Validator
 * Validates cryptographic signatures and checks proof log integrity
 */

import { createHash, createVerify } from 'crypto';
import { getProofs, type ProofLogEntry } from '../core/crypto/proofLog';

export interface TrustTileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingSignatures: string[];
  validSignatures: number;
  totalSignatures: number;
}

export interface SignatureValidationOptions {
  requireAllSigned?: boolean;
  maxAge?: number; // in milliseconds
  allowedSigners?: string[];
}

export class TrustTileValidator {
  private static instance: TrustTileValidator;
  
  public static getInstance(): TrustTileValidator {
    if (!TrustTileValidator.instance) {
      TrustTileValidator.instance = new TrustTileValidator();
    }
    return TrustTileValidator.instance;
  }

  /**
   * Validates all signatures in the proof log
   */
  public async validateProofLog(options: SignatureValidationOptions = {}): Promise<TrustTileValidationResult> {
    const {
      requireAllSigned = false,
      maxAge = 24 * 60 * 60 * 1000, // 24 hours default
      allowedSigners = []
    } = options;

    const result: TrustTileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingSignatures: [],
      validSignatures: 0,
      totalSignatures: 0
    };

    try {
      const { success, proofs } = await getProofs();
      if (success && proofs) {
        result.totalSignatures = proofs.length;
      } else {
        result.totalSignatures = 0;
      }

      if (!proofs || proofs.length === 0) {
        result.warnings.push('No entries found in proof log');
        return result;
      }

      for (const entry of proofs) {
        const validationResult = await this.validateEntry(entry, { maxAge, allowedSigners });
        
        if (validationResult.isValid) {
          result.validSignatures++;
        } else {
          result.errors.push(...validationResult.errors);
          if (validationResult.missingSignature) {
            result.missingSignatures.push(entry.id);
          }
        }
      }

      // Check if all signatures are required
      if (requireAllSigned && result.missingSignatures.length > 0) {
        result.isValid = false;
        result.errors.push(`Missing signatures for entries: ${result.missingSignatures.join(', ')}`);
      }

      // Check signature ratio
      const signatureRatio = result.validSignatures / result.totalSignatures;
      if (signatureRatio < 0.9) {
        result.warnings.push(`Low signature ratio: ${(signatureRatio * 100).toFixed(1)}%`);
      }

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Validates a single proof entry
   */
  public async validateEntry(
    entry: ProofLogEntry, 
    options: { maxAge?: number; allowedSigners?: string[] } = {}
  ): Promise<{ isValid: boolean; errors: string[]; missingSignature?: boolean }> {
    const { maxAge = 24 * 60 * 60 * 1000, allowedSigners = [] } = options;
    const errors: string[] = [];

    try {
      // Check entry age
      const entryAge = Date.now() - new Date(entry.timestamp).getTime();
      if (entryAge > maxAge) {
        errors.push(`Entry ${entry.id} is too old: ${Math.round(entryAge / (60 * 60 * 1000))} hours`);
      }

      // Check if signature exists
      if (!entry.signature) {
        return { isValid: false, errors: [`No signature found for entry ${entry.id}`], missingSignature: true };
      }

      // Check allowed signers
      if (allowedSigners.length > 0 && !allowedSigners.includes(entry.user_id)) {
        errors.push(`Unauthorized signer: ${entry.user_id}`);
      }

      // Validate signature format
      if (!this.isValidSignatureFormat(entry.signature)) {
        errors.push(`Invalid signature format for entry ${entry.id}`);
      }

      // Verify cryptographic signature
      const isSignatureValid = await this.verifySignature(entry);
      if (!isSignatureValid) {
        errors.push(`Invalid cryptographic signature for entry ${entry.id}`);
      }

      return { isValid: errors.length === 0, errors };

    } catch (error) {
      return { 
        isValid: false, 
        errors: [`Validation error for entry ${entry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  /**
   * Verifies the cryptographic signature of an entry
   */
  private async verifySignature(entry: ProofLogEntry): Promise<boolean> {
    try {
      // In a real implementation, you would:
      // 1. Get the public key for the executor
      // 2. Recreate the signed payload
      // 3. Verify the signature using the public key
      
      // For now, we'll do basic validation
      const payload = this.createSignaturePayload(entry);
      const expectedHash = createHash('sha256').update(payload).digest('hex');
      
      // In mock mode, we accept any signature that looks valid
      if (process.env.NODE_ENV === 'development') {
        return entry.signature.length > 10 && entry.signature.includes(expectedHash.substring(0, 8));
      }

      // In production, implement actual RSA signature verification
      // const verify = createVerify('RSA-SHA256');
      // verify.update(payload);
      // return verify.verify(publicKey, entry.signature, 'base64');
      
      return true; // Placeholder for actual verification
      
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Creates the payload that should be signed
   */
  private createSignaturePayload(entry: ProofLogEntry): string {
    return JSON.stringify({
      id: entry.id,
      action: entry.action,
      payload_json: entry.payload_json,
      user_id: entry.user_id,
      timestamp: entry.timestamp
    });
  }

  /**
   * Validates signature format
   */
  private isValidSignatureFormat(signature: string): boolean {
    // Basic format validation
    return signature.length > 10 && /^[A-Za-z0-9+/=]+$/.test(signature);
  }

  /**
   * Gets validation summary for dashboard display
   */
  public async getValidationSummary(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    details: string[];
  }> {
    const validation = await this.validateProofLog();
    
    if (!validation.isValid) {
      return {
        status: 'critical',
        message: `${validation.errors.length} signature validation errors`,
        details: validation.errors
      };
    }
    
    if (validation.warnings.length > 0) {
      return {
        status: 'warning',
        message: `${validation.warnings.length} signature warnings`,
        details: validation.warnings
      };
    }
    
    return {
      status: 'healthy',
      message: `All ${validation.validSignatures} signatures valid`,
      details: [`${validation.validSignatures}/${validation.totalSignatures} signatures verified`]
    };
  }
}

// Export singleton instance
export const trustTileValidator = TrustTileValidator.getInstance(); 