import xss from 'xss';
import validator from 'validator';

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove any HTML tags and sanitize XSS
  return xss(validator.trim(input), {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });
};

/**
 * Sanitize object inputs recursively
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  const normalized = validator.normalizeEmail(email);
  return validator.isEmail(normalized) ? normalized : null;
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (input, options = {}) => {
  const { min, max, defaultValue = null } = options;
  
  const num = Number(input);
  
  if (isNaN(num)) return defaultValue;
  
  if (min !== undefined && num < min) return defaultValue;
  if (max !== undefined && num > max) return defaultValue;
  
  return num;
};

/**
 * Sanitize date input
 */
export const sanitizeDate = (input) => {
  if (!input) return null;
  
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Prevent SQL injection by validating input parameters
 * SQLite with prepared statements already prevents SQL injection,
 * but this adds an extra layer of validation
 */
export const validateSQLInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Check for common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(;|\-\-|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      throw new Error('Invalid input detected');
    }
  }
  
  return input;
};

/**
 * Log sanitization for admin monitoring
 */
export const createSanitizationLog = (userId, action, data) => {
  return {
    timestamp: new Date().toISOString(),
    userId,
    action,
    sanitized: true,
    dataPreview: JSON.stringify(data).substring(0, 100)
  };
};
