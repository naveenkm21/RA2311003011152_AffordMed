/**
 * Reusable Log function — POSTs to the evaluation Test Server.
 *
 *   Log(stack, level, pkg, message)
 *
 * Constraints (lower-case only):
 *   stack:    "backend" | "frontend"
 *   level:    "debug" | "info" | "warn" | "error" | "fatal"
 *   package:  backend  -> cache | controller | cron_job | db | domain |
 *                         handler | repository | route | service
 *             frontend -> api | component | hook | page | state | style
 *             shared   -> auth | config | middleware | utils
 *
 * Auth: protected route — pass token via env LOG_AUTH_TOKEN (or AUTH_TOKEN
 *       as a fallback, since the eval often issues a single bearer).
 */

const axios = require('axios');

const LOG_URL = process.env.LOG_API_URL ||
  'http://20.207.122.201/evaluation-service/logs';

const VALID_STACKS = new Set(['backend', 'frontend']);
const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const BACKEND_PKGS = new Set(['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service']);
const FRONTEND_PKGS = new Set(['api', 'component', 'hook', 'page', 'state', 'style']);
const SHARED_PKGS = new Set(['auth', 'config', 'middleware', 'utils']);

function validate(stack, level, pkg) {
  if (!VALID_STACKS.has(stack)) return `invalid stack: ${stack}`;
  if (!VALID_LEVELS.has(level)) return `invalid level: ${level}`;
  const allowed = stack === 'backend'
    ? new Set([...BACKEND_PKGS, ...SHARED_PKGS])
    : new Set([...FRONTEND_PKGS, ...SHARED_PKGS]);
  if (!allowed.has(pkg)) return `invalid package "${pkg}" for stack "${stack}"`;
  return null;
}

async function Log(stack, level, pkg, message) {
  const err = validate(stack, level, pkg);
  if (err) {
    // Last-resort visibility: validation failure means the call would be
    // rejected anyway — surface it on stderr without recursing into Log.
    process.stderr.write(`[Log] validation failed: ${err}\n`);
    return { ok: false, error: err };
  }

  const token = process.env.LOG_AUTH_TOKEN || process.env.AUTH_TOKEN;
  const raw = String(message ?? '');
  const trimmed = raw.length > 48 ? raw.slice(0, 48) : raw;
  const body = { stack, level, package: pkg, message: trimmed };

  try {
    const res = await axios.post(LOG_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 5000,
    });
    return { ok: true, logID: res.data?.logID, response: res.data };
  } catch (e) {
    const respBody = e.response?.data ? JSON.stringify(e.response.data) : '';
    const sentBody = JSON.stringify(body);
    process.stderr.write(`[Log] POST failed (${e.response?.status || e.code || 'ERR'}): ${e.message} | sent=${sentBody} | resp=${respBody}\n`);
    return { ok: false, error: e.message, status: e.response?.status };
  }
}

/**
 * Bound logger — convenience wrapper so callers don't repeat (stack, package).
 *   const log = createLogger('backend', 'service');
 *   log.info('msg');
 */
function createLogger(stack, pkg) {
  const send = (level) => (message) => Log(stack, level, pkg, message);
  return {
    debug: send('debug'),
    info: send('info'),
    warn: send('warn'),
    error: send('error'),
    fatal: send('fatal'),
    raw: (level, message) => Log(stack, level, pkg, message),
  };
}

module.exports = Log;
module.exports.Log = Log;
module.exports.createLogger = createLogger;
