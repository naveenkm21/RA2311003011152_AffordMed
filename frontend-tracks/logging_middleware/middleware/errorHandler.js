const { createLogger } = require('../utils/logger');
const logger = createLogger('backend', 'middleware');

/**
 * Error Handler Middleware
 * Handles and logs application errors
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    userId: req.user?.id || 'anonymous',
    error: {
      code: err.code,
      name: err.name,
      details: err.details,
    },
  };

  logger.error(`Application Error ${JSON.stringify(errorLog)}`);

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    requestId,
    ...(isDevelopment && { stack: err.stack }),
  });
};

module.exports = errorHandler;
