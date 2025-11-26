/**
 * HTML Sanitization for Scorpion
 *
 * Prevents XSS attacks when rendering user-generated content
 * Includes both server-side and client-side utilities
 */

// ============================================================================
// SERVER-SIDE SANITIZATION
// ============================================================================

/**
 * Sanitize HTML on the server side
 * This is a basic implementation - for production, consider using DOMPurify
 */

export interface SanitizeOptions {
  /** Allowed HTML tags */
  allowedTags?: string[];
  /** Allowed attributes per tag */
  allowedAttributes?: Record<string, string[]>;
  /** Allow links */
  allowLinks?: boolean;
  /** Allow images */
  allowImages?: boolean;
  /** Maximum text length */
  maxLength?: number;
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u',
  'code', 'pre', 'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
};

/**
 * Sanitizes HTML by removing dangerous tags and attributes
 *
 * @example
 * ```ts
 * const userHtml = '<p>Hello</p><script>alert("xss")</script>';
 * const safe = sanitizeHtml(userHtml);
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  if (!html || typeof html !== 'string') return '';

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    allowLinks = false,
    allowImages = false,
    maxLength = 100000,
  } = options;

  // Truncate if too long
  let sanitized = html.slice(0, maxLength);

  // Step 1: Remove all dangerous tags completely
  const dangerousTags = [
    'script', 'style', 'iframe', 'frame', 'frameset',
    'object', 'embed', 'applet', 'link', 'meta',
    'base', 'form', 'input', 'button', 'select',
    'textarea', 'option', 'svg', 'math',
  ];

  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing versions
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
    sanitized = sanitized.replace(selfClosing, '');
  });

  // Step 2: Build final allowed tags list
  const finalAllowedTags = [...allowedTags];
  if (allowLinks && !finalAllowedTags.includes('a')) {
    finalAllowedTags.push('a');
  }
  if (allowImages && !finalAllowedTags.includes('img')) {
    finalAllowedTags.push('img');
  }

  // Step 3: Remove event handlers and javascript: protocol
  sanitized = sanitized
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove on* attributes
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '') // Remove on* without quotes
    .replace(/javascript:/gi, 'blocked:') // Block javascript: protocol
    .replace(/data:text\/html/gi, 'blocked:'); // Block data URIs with HTML

  // Step 4: Remove all tags not in allowed list
  // This regex matches opening and closing tags
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();

    if (!finalAllowedTags.includes(tag)) {
      return ''; // Remove disallowed tag
    }

    // For allowed tags, sanitize attributes
    if (match.startsWith('</')) {
      return match; // Keep closing tags as-is
    }

    // Parse and sanitize attributes
    const allowedAttrs = allowedAttributes[tag] || [];
    if (allowedAttrs.length === 0) {
      return `<${tag}>`; // Tag with no attributes allowed
    }

    // Extract attributes
    const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
    const attrs: string[] = [];
    let attrMatch;

    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const [, attrName, attrValue] = attrMatch;

      if (allowedAttrs.includes(attrName.toLowerCase())) {
        // Additional validation for href and src
        if (attrName.toLowerCase() === 'href') {
          if (isSafeUrl(attrValue)) {
            attrs.push(`${attrName}="${escapeHtml(attrValue)}"`);
          }
        } else if (attrName.toLowerCase() === 'src') {
          if (isSafeImageUrl(attrValue)) {
            attrs.push(`${attrName}="${escapeHtml(attrValue)}"`);
          }
        } else {
          attrs.push(`${attrName}="${escapeHtml(attrValue)}"`);
        }
      }
    }

    return attrs.length > 0 ? `<${tag} ${attrs.join(' ')}>` : `<${tag}>`;
  });

  return sanitized.trim();
}

/**
 * Validates that a URL is safe for use in href attributes
 */
function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Allow relative URLs
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }

  // Allow http(s) URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  // Allow mailto links
  if (url.startsWith('mailto:')) {
    return true;
  }

  // Block everything else (javascript:, data:, etc.)
  return false;
}

/**
 * Validates that a URL is safe for use in img src attributes
 */
function isSafeImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Allow relative URLs
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }

  // Allow http(s) URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  // Allow data URIs for images only
  if (url.startsWith('data:image/')) {
    return true;
  }

  return false;
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, char => map[char] || char);
}

/**
 * Strips all HTML tags, leaving only plain text
 * Use this when you want absolutely no HTML
 *
 * @example
 * ```ts
 * const html = '<p>Hello <strong>world</strong></p>';
 * const text = stripAllHtml(html);
 * // Returns: 'Hello world'
 * ```
 */
export function stripAllHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .trim();
}

// ============================================================================
// MARKDOWN SANITIZATION
// ============================================================================

/**
 * Sanitizes markdown content before rendering
 * Use this before passing to a markdown renderer
 *
 * @example
 * ```ts
 * const userMarkdown = '# Hello\n<script>alert("xss")</script>';
 * const safe = sanitizeMarkdown(userMarkdown);
 * // Script tags removed, markdown preserved
 * ```
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return '';

  // Remove HTML tags that might be embedded in markdown
  let sanitized = markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  return sanitized;
}

// ============================================================================
// REACT/CLIENT-SIDE UTILITIES
// ============================================================================

/**
 * React component helper for safely rendering user content
 * Use this instead of dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * // ❌ Dangerous
 * <div dangerouslySetInnerHTML={{ __html: userContent }} />
 *
 * // ✅ Safe
 * <SafeHtml html={userContent} />
 * ```
 */
export interface SafeHtmlProps {
  html: string;
  options?: SanitizeOptions;
  className?: string;
}

/**
 * Returns sanitized HTML and props for React
 * Use with dangerouslySetInnerHTML after sanitization
 */
export function getSafeHtmlProps(html: string, options?: SanitizeOptions) {
  return {
    dangerouslySetInnerHTML: {
      __html: sanitizeHtml(html, options),
    },
  };
}

// ============================================================================
// CONTENT SECURITY POLICY HELPERS
// ============================================================================

/**
 * Generates a CSP nonce for inline scripts
 * Use this to allow specific inline scripts while blocking XSS
 *
 * @example
 * ```tsx
 * const nonce = generateNonce();
 *
 * // In your headers:
 * Content-Security-Policy: script-src 'nonce-${nonce}'
 *
 * // In your script tag:
 * <script nonce={nonce}>
 *   console.log('Allowed');
 * </script>
 * ```
 */
export function generateNonce(): string {
  // Generate a random base64 string
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(array).toString('base64');
}

// ============================================================================
// CHAT MESSAGE SANITIZATION (SCORPION-SPECIFIC)
// ============================================================================

/**
 * Sanitizes chat messages from users and LLMs
 * Allows markdown-style formatting but blocks dangerous content
 *
 * @example
 * ```ts
 * const message = sanitizeChatMessage(userInput);
 * // Safe to store in DB and render in UI
 * ```
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') return '';

  // Step 1: Remove dangerous patterns
  let sanitized = message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Step 2: Limit length
  if (sanitized.length > 10000) {
    sanitized = sanitized.slice(0, 10000) + '... (truncated)';
  }

  return sanitized.trim();
}

/**
 * Sanitizes tool output before displaying to user
 * More permissive than chat messages (allows some HTML for formatting)
 */
export function sanitizeToolOutput(output: string, allowHtml = false): string {
  if (!output || typeof output !== 'string') return '';

  if (!allowHtml) {
    return stripAllHtml(output);
  }

  // Allow basic formatting tags only
  return sanitizeHtml(output, {
    allowedTags: ['p', 'br', 'code', 'pre', 'strong', 'em'],
    allowLinks: false,
    allowImages: false,
  });
}
