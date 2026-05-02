/**
 * Sanitizer Utility
 * Sanitizes sensitive data before logging
 */

const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'creditCard',
  'ssn',
  'aadhar',
];

/**
 * Sanitize object by removing/masking sensitive fields
 */
function sanitize(obj, sensitiveFields = DEFAULT_SENSITIVE_FIELDS) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item, sensitiveFields));
  }

  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (sanitized.hasOwnProperty(key)) {
      const lowerKey = key.toLowerCase();

      // Check if field is sensitive
      if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitize(sanitized[key], sensitiveFields);
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize headers
 */
function sanitizeHeaders(headers = {}, sensitiveFields = DEFAULT_SENSITIVE_FIELDS) {
  const sanitized = { ...headers };
  const headersToRedact = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-token',
    ...sensitiveFields,
  ];

  for (const header of headersToRedact) {
    if (sanitized[header]) {
      sanitized[header] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Mask sensitive data (show last 4 chars)
 */
function maskData(data, showChars = 4) {
  if (!data || typeof data !== 'string') {
    return data;
  }

  if (data.length <= showChars) {
    return '*'.repeat(data.length);
  }

  return '*'.repeat(data.length - showChars) + data.slice(-showChars);
}

module.exports = {
  sanitize,
  sanitizeHeaders,
  maskData,
};
