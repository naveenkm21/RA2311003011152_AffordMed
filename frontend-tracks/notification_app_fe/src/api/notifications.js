import axios from 'axios';
import { createLogger } from '../lib/log.js';

const log = createLogger('api');

const MAX_PER_PAGE = 10;

async function fetchPage({ limit, page, type }) {
  const params = { limit, page };
  if (type && type !== 'All') params.notification_type = type;
  const res = await axios.get('/api/evaluation-service/notifications', { params });
  return Array.isArray(res.data?.notifications) ? res.data.notifications : [];
}

export async function fetchNotifications({ limit = MAX_PER_PAGE, page = 1, type } = {}) {
  const safeLimit = Math.min(limit, MAX_PER_PAGE);
  log.info(`GET notif p=${page} l=${safeLimit}`);
  try {
    const list = await fetchPage({ limit: safeLimit, page, type });
    log.info(`fetched n=${list.length}`);
    return list;
  } catch (e) {
    log.error(`fetch failed s=${e.response?.status || 'na'}`);
    throw e;
  }
}

// For priority ranking we need a wider sample than the server's per-page cap.
// Fetches sequential pages until we have `target` items or a short page is returned.
export async function fetchManyForRanking({ target = 50, type, maxPages = 10 } = {}) {
  const out = [];
  const seen = new Set();
  for (let p = 1; p <= maxPages && out.length < target; p++) {
    let batch;
    try {
      batch = await fetchPage({ limit: MAX_PER_PAGE, page: p, type });
    } catch (e) {
      if (p === 1) throw e;
      break;
    }
    if (!batch.length) break;
    for (const n of batch) {
      if (n?.ID && !seen.has(n.ID)) { seen.add(n.ID); out.push(n); }
    }
    if (batch.length < MAX_PER_PAGE) break;
  }
  log.info(`ranked pool n=${out.length}`);
  return out;
}
