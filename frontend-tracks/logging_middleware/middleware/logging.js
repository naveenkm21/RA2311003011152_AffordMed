const { v4: uuidv4 } = require('uuid');
const { createLogger } = require('../utils/logger');
const logger = createLogger('backend', 'middleware');
const sanitizer = require('../utils/sanitizer');

/**
 * Logging Middleware
 * Logs incoming requests and outgoing responses
 */
const loggingMiddleware = (options = {}) => {
  const config = {
    level: options.level || 'info',
    logErrors: options.logErrors !== false,
    trackPerformance: options.trackPerformance !== false,
    excludePaths: options.excludePaths || [],
    sensitiveFields: options.sensitiveFields || ['password', 'token', 'apiKey', 'secret'],
    maxBodySize: options.maxBodySize || 1000,
  };

  return (req, res, next) => {
    // Skip logging for excluded paths
    if (config.excludePaths.includes(req.path)) {
      return next();
    }

    // Generate request ID
    req.requestId = req.headers['x-request-id'] || uuidv4();
    
    // Record start time
    const startTime = Date.now();
    
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    let responseData = null;
    let responseStatus = null;

    // Intercept response
    res.json = function(data) {
      responseData = data;
      responseStatus = this.statusCode;
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      responseData = data;
      responseStatus = this.statusCode;
      return originalSend.call(this, data);
    };

    // Log request
    const requestLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      userId: req.user?.id || 'anonymous',
      userAgent: req.get('user-agent'),
      ip: req.ip,
      body: sanitizer.sanitize(req.body, config.sensitiveFields),
      headers: sanitizer.sanitizeHeaders(req.headers, config.sensitiveFields),
    };

    logger.info(`Incoming Request ${JSON.stringify(requestLog)}`);

    // Listen for response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      const responseLog = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || 'anonymous',
        response: truncateObject(sanitizer.sanitize(responseData, config.sensitiveFields), config.maxBodySize),
      };

      const payload = JSON.stringify(responseLog);
      if (res.statusCode >= 400) {
        logger.error(`Request Error ${payload}`);
      } else if (config.trackPerformance && duration > 1000) {
        logger.warn(`Slow Request ${payload}`);
      } else {
        logger.info(`Response Sent ${payload}`);
      }
    });

    res.on('error', (err) => {
      const duration = Date.now() - startTime;
      
      const errorLog = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        error: {
          message: err.message,
          stack: err.stack,
          code: err.code,
        },
        userId: req.user?.id || 'anonymous',
      };

      if (config.logErrors) {
        logger.error(`Request Failed ${JSON.stringify(errorLog)}`);
      }
    });

    next();
  };
};

/**
 * Truncate object to specified size
 */
function truncateObject(obj, maxSize) {
  const str = JSON.stringify(obj);
  if (str.length > maxSize) {
    return JSON.parse(str.substring(0, maxSize) + '...');
  }
  return obj;
}

module.exports = loggingMiddleware;
