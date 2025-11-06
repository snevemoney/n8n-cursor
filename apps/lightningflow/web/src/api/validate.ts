/**
 * Lightning AI Platform - API Validation & Security System
 * 
 * This system provides comprehensive validation, rate limiting, and security
 * checks for all API endpoints with user-friendly error messages.
 */

import { NextRequest } from 'next/server';
import { logger } from '../lib/logger';

export type ValidationRule = {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'bitcoin_address' | 'lightning_invoice' | 'amount';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  humanName?: string; // User-friendly field name
};

export type SecurityLevel = 'public' | 'authenticated' | 'admin' | 'system';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    humanMessage: string;
    code: string;
  }[];
  sanitizedData: Record<string, any>;
}

export interface SecurityCheck {
  passed: boolean;
  reason?: string;
  humanReason?: string;
  action: 'allow' | 'deny' | 'rate_limit' | 'require_2fa';
  metadata?: Record<string, any>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export class APIValidator {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private blockedIPs: Set<string> = new Set();

  /**
   * Validates request data against rules with user-friendly error messages
   */
  validateRequest(
    data: Record<string, any>,
    rules: ValidationRule[]
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const sanitizedData: Record<string, any> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      const humanName = rule.humanName || this.humanizeFieldName(rule.field);

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
          humanMessage: `${humanName} is required`,
          code: 'FIELD_REQUIRED'
        });
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      const typeValidation = this.validateType(value, rule.type, humanName);
      if (!typeValidation.isValid) {
        errors.push({
          field: rule.field,
          message: typeValidation.message,
          humanMessage: typeValidation.humanMessage,
          code: typeValidation.code
        });
        continue;
      }

      // Length/range validation
      if (rule.min !== undefined || rule.max !== undefined) {
        const rangeValidation = this.validateRange(value, rule.min, rule.max, rule.type, humanName);
        if (!rangeValidation.isValid) {
          errors.push({
            field: rule.field,
            message: rangeValidation.message,
            humanMessage: rangeValidation.humanMessage,
            code: rangeValidation.code
          });
          continue;
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} format is invalid`,
            humanMessage: `${humanName} format is not valid`,
            code: 'INVALID_FORMAT'
          });
          continue;
        }
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          const errorMessage = typeof customResult === 'string' ? customResult : 'Custom validation failed';
          errors.push({
            field: rule.field,
            message: errorMessage,
            humanMessage: `${humanName}: ${errorMessage}`,
            code: 'CUSTOM_VALIDATION_FAILED'
          });
          continue;
        }
      }

      // Sanitize and add to result
      sanitizedData[rule.field] = this.sanitizeValue(value, rule.type);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  /**
   * Performs security checks on incoming requests
   */
  async performSecurityCheck(
    req: NextRequest,
    securityLevel: SecurityLevel,
    options: {
      rateLimit?: RateLimitConfig;
      requireAuth?: boolean;
      checkSuspiciousActivity?: boolean;
    } = {}
  ): Promise<SecurityCheck> {
    const clientIP = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const path = req.nextUrl.pathname;
    const method = req.method;

    // Check blocked IPs
    if (this.blockedIPs.has(clientIP)) {
      logger.logSecurity('warn', 'blocked_ip_attempt', {
        ipAddress: clientIP,
        userAgent,
        threatType: 'blocked_ip'
      }, {
        path,
        method
      });

      return {
        passed: false,
        reason: 'IP address is blocked',
        humanReason: 'Access denied from your location',
        action: 'deny'
      };
    }

    // Rate limiting
    if (options.rateLimit) {
      const rateLimitCheck = this.checkRateLimit(req, options.rateLimit);
      if (!rateLimitCheck.passed) {
        logger.logSecurity('warn', 'rate_limit_exceeded', {
          ipAddress: clientIP,
          userAgent,
          threatType: 'rate_limit'
        }, {
          path,
          method,
          limit: options.rateLimit.maxRequests,
          window: options.rateLimit.windowMs
        });

        return rateLimitCheck;
      }
    }

    // Check for suspicious activity
    if (options.checkSuspiciousActivity) {
      const suspiciousCheck = this.checkSuspiciousActivity(req);
      if (!suspiciousCheck.passed) {
        this.suspiciousIPs.add(clientIP);
        
        logger.logSecurity('warn', 'suspicious_activity', {
          ipAddress: clientIP,
          userAgent,
          threatType: 'suspicious_activity'
        }, {
          path,
          method,
          reason: suspiciousCheck.reason
        });

        return suspiciousCheck;
      }
    }

    // Authentication check
    if (options.requireAuth || securityLevel !== 'public') {
      const authCheck = await this.checkAuthentication(req, securityLevel);
      if (!authCheck.passed) {
        logger.logSecurity('info', 'auth_required', {
          ipAddress: clientIP,
          userAgent
        }, {
          path,
          method,
          securityLevel
        });

        return authCheck;
      }
    }

    // Log successful security check
    logger.logAPI('info', 'security_check_passed', {
      method,
      path,
      statusCode: 200,
      responseTime: 0
    }, {
      securityLevel,
      clientIP
    });

    return {
      passed: true,
      action: 'allow'
    };
  }

  /**
   * Validates Lightning Network specific data
   */
  validateLightningData(data: {
    invoice?: string;
    amount?: number;
    description?: string;
    nodeId?: string;
  }): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'invoice',
        type: 'lightning_invoice',
        humanName: 'Lightning invoice'
      },
      {
        field: 'amount',
        type: 'amount',
        min: 1,
        max: 100000000, // 1 BTC in sats
        humanName: 'Payment amount'
      },
      {
        field: 'description',
        type: 'string',
        min: 1,
        max: 639, // Lightning description limit
        humanName: 'Payment description'
      },
      {
        field: 'nodeId',
        type: 'string',
        pattern: /^[0-9a-f]{66}$/i,
        humanName: 'Lightning node ID'
      }
    ];

    return this.validateRequest(data, rules);
  }

  /**
   * Validates Bitcoin addresses and amounts
   */
  validateBitcoinData(data: {
    address?: string;
    amount?: number;
    feeRate?: number;
  }): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'address',
        type: 'bitcoin_address',
        humanName: 'Bitcoin address'
      },
      {
        field: 'amount',
        type: 'amount',
        min: 546, // Dust limit
        max: 2100000000000000, // 21M BTC in sats
        humanName: 'Bitcoin amount'
      },
      {
        field: 'feeRate',
        type: 'number',
        min: 1,
        max: 1000,
        humanName: 'Fee rate (sats/vB)'
      }
    ];

    return this.validateRequest(data, rules);
  }

  /**
   * Validates user profile data
   */
  validateUserProfile(data: {
    email?: string;
    name?: string;
    timezone?: string;
    currency?: string;
  }): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'email',
        type: 'email',
        required: true,
        humanName: 'Email address'
      },
      {
        field: 'name',
        type: 'string',
        required: true,
        min: 1,
        max: 100,
        humanName: 'Full name'
      },
      {
        field: 'timezone',
        type: 'string',
        pattern: /^[A-Za-z_]+\/[A-Za-z_]+$/,
        humanName: 'Timezone'
      },
      {
        field: 'currency',
        type: 'string',
        pattern: /^[A-Z]{3}$/,
        humanName: 'Currency code'
      }
    ];

    return this.validateRequest(data, rules);
  }

  // Private helper methods

  private validateType(
    value: any,
    type: ValidationRule['type'],
    humanName: string
  ): { isValid: boolean; message: string; humanMessage: string; code: string } {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            isValid: false,
            message: 'Must be a string',
            humanMessage: `${humanName} must be text`,
            code: 'INVALID_TYPE'
          };
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            isValid: false,
            message: 'Must be a number',
            humanMessage: `${humanName} must be a number`,
            code: 'INVALID_TYPE'
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            isValid: false,
            message: 'Must be a boolean',
            humanMessage: `${humanName} must be true or false`,
            code: 'INVALID_TYPE'
          };
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return {
            isValid: false,
            message: 'Must be a valid email address',
            humanMessage: `${humanName} must be a valid email address`,
            code: 'INVALID_EMAIL'
          };
        }
        break;

      case 'url':
        if (typeof value !== 'string' || !this.isValidURL(value)) {
          return {
            isValid: false,
            message: 'Must be a valid URL',
            humanMessage: `${humanName} must be a valid web address`,
            code: 'INVALID_URL'
          };
        }
        break;

      case 'bitcoin_address':
        if (typeof value !== 'string' || !this.isValidBitcoinAddress(value)) {
          return {
            isValid: false,
            message: 'Must be a valid Bitcoin address',
            humanMessage: `${humanName} must be a valid Bitcoin address`,
            code: 'INVALID_BITCOIN_ADDRESS'
          };
        }
        break;

      case 'lightning_invoice':
        if (typeof value !== 'string' || !this.isValidLightningInvoice(value)) {
          return {
            isValid: false,
            message: 'Must be a valid Lightning invoice',
            humanMessage: `${humanName} must be a valid Lightning payment request`,
            code: 'INVALID_LIGHTNING_INVOICE'
          };
        }
        break;

      case 'amount':
        if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
          return {
            isValid: false,
            message: 'Must be a positive integer',
            humanMessage: `${humanName} must be a positive whole number`,
            code: 'INVALID_AMOUNT'
          };
        }
        break;
    }

    return { isValid: true, message: '', humanMessage: '', code: '' };
  }

  private validateRange(
    value: any,
    min?: number,
    max?: number,
    type?: string,
    humanName?: string
  ): { isValid: boolean; message: string; humanMessage: string; code: string } {
    const length = type === 'string' ? value.length : value;

    if (min !== undefined && length < min) {
      const unit = type === 'string' ? 'characters' : '';
      return {
        isValid: false,
        message: `Must be at least ${min} ${unit}`.trim(),
        humanMessage: `${humanName} must be at least ${min} ${unit}`.trim(),
        code: 'TOO_SHORT'
      };
    }

    if (max !== undefined && length > max) {
      const unit = type === 'string' ? 'characters' : '';
      return {
        isValid: false,
        message: `Must be at most ${max} ${unit}`.trim(),
        humanMessage: `${humanName} must be at most ${max} ${unit}`.trim(),
        code: 'TOO_LONG'
      };
    }

    return { isValid: true, message: '', humanMessage: '', code: '' };
  }

  private sanitizeValue(value: any, type: ValidationRule['type']): any {
    switch (type) {
      case 'string':
        return typeof value === 'string' ? value.trim() : value;
      case 'email':
        return typeof value === 'string' ? value.toLowerCase().trim() : value;
      default:
        return value;
    }
  }

  private humanizeFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }

    return 'unknown';
  }

  private checkRateLimit(req: NextRequest, config: RateLimitConfig): SecurityCheck {
    const key = config.keyGenerator ? config.keyGenerator(req) : this.getClientIP(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up old entries
    this.rateLimitStore.forEach((data, k) => {
      if (data.resetTime < now) {
        this.rateLimitStore.delete(k);
      }
    });

    const current = this.rateLimitStore.get(key) || { count: 0, resetTime: now + config.windowMs };

    if (current.resetTime < now) {
      // Reset window
      current.count = 1;
      current.resetTime = now + config.windowMs;
    } else {
      current.count++;
    }

    this.rateLimitStore.set(key, current);

    if (current.count > config.maxRequests) {
      const resetIn = Math.ceil((current.resetTime - now) / 1000);
      return {
        passed: false,
        reason: `Rate limit exceeded. Try again in ${resetIn} seconds`,
        humanReason: `Too many requests. Please wait ${resetIn} seconds before trying again`,
        action: 'rate_limit',
        metadata: { resetIn, limit: config.maxRequests }
      };
    }

    return { passed: true, action: 'allow' };
  }

  private checkSuspiciousActivity(req: NextRequest): SecurityCheck {
    const userAgent = req.headers.get('user-agent') || '';
    const path = req.nextUrl.pathname;

    // Check for bot-like user agents
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ];

    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      return {
        passed: false,
        reason: 'Bot-like user agent detected',
        humanReason: 'Automated access detected',
        action: 'deny'
      };
    }

    // Check for suspicious paths
    const suspiciousPaths = [
      /\/admin/,
      /\/wp-admin/,
      /\/phpmyadmin/,
      /\.php$/,
      /\.asp$/
    ];

    if (suspiciousPaths.some(pattern => pattern.test(path))) {
      return {
        passed: false,
        reason: 'Suspicious path access',
        humanReason: 'Invalid page requested',
        action: 'deny'
      };
    }

    return { passed: true, action: 'allow' };
  }

  private async checkAuthentication(req: NextRequest, securityLevel: SecurityLevel): Promise<SecurityCheck> {
    // This would integrate with your authentication system
    // For now, simulate authentication check
    
    const authHeader = req.headers.get('authorization');
    const sessionCookie = req.cookies.get('session');

    if (!authHeader && !sessionCookie) {
      return {
        passed: false,
        reason: 'Authentication required',
        humanReason: 'Please sign in to continue',
        action: 'deny'
      };
    }

    // Simulate different security levels
    if (securityLevel === 'admin') {
      return {
        passed: false,
        reason: 'Admin access required',
        humanReason: 'Administrator privileges required',
        action: 'deny'
      };
    }

    return { passed: true, action: 'allow' };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidBitcoinAddress(address: string): boolean {
    // Simplified Bitcoin address validation
    // In production, use a proper Bitcoin library
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy
      /^bc1[a-z0-9]{39,59}$/, // Bech32
      /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/ // P2SH
    ];

    return patterns.some(pattern => pattern.test(address));
  }

  private isValidLightningInvoice(invoice: string): boolean {
    // Simplified Lightning invoice validation
    // In production, use a proper Lightning library
    return invoice.toLowerCase().startsWith('ln') && invoice.length > 50;
  }
}

// Export singleton instance
export const apiValidator = new APIValidator(); 