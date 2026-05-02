// Frontend Log() — POSTs to the eval Test Server through the Vite /api proxy
// (which injects the Bearer token from VITE_AUTH_TOKEN). Server caps `message`
// at 48 chars, so we truncate locally.

import axios from 'axios';

const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const FRONTEND_PKGS = new Set(['api', 'component', 'hook', 'page', 'state', 'style']);
const SHARED_PKGS = new Set(['auth', 'config', 'middleware', 'utils']);

export async function Log(level, pkg, message) {
  if (!VALID_LEVELS.has(level)) return;
  if (!FRONTEND_PKGS.has(pkg) && !SHARED_PKGS.has(pkg)) return;
  const text = String(message ?? '').slice(0, 48);
  try {
    await axios.post('/api/evaluation-service/logs', {
      stack: 'frontend',
      level,
      package: pkg,
      message: text,
    });
  } catch {
    // logging must not break the app
  }
}

export function createLogger(pkg) {
  return {
    debug: (m) => Log('debug', pkg, m),
    info: (m) => Log('info', pkg, m),
    warn: (m) => Log('warn', pkg, m),
    error: (m) => Log('error', pkg, m),
    fatal: (m) => Log('fatal', pkg, m),
  };
}
