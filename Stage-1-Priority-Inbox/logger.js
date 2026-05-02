/**
 * Logging Middleware - Logger Utility
 * For use in Priority Inbox System
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',  // Reset
};

class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.minLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
  }

  shouldLog(level) {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  format(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const reset = COLORS.reset;

    return `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}\n${JSON.stringify(data, null, 2)}`;
  }

  debug(message, data = {}) {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message, data));
    }
  }

  info(message, data = {}) {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message, data));
    }
  }

  warn(message, data = {}) {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, data));
    }
  }

  error(message, data = {}) {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, data));
    }
  }
}

module.exports = new Logger(process.env.LOG_LEVEL || 'info');
