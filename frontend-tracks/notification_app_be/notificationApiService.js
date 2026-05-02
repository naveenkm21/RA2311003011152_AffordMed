const axios = require('axios');
const { createLogger } = require('../logging_middleware/utils/logger');
const log = createLogger('backend', 'handler');

const NOTIFICATIONS_URL = process.env.NOTIFICATIONS_URL ||
  'http://20.207.122.201/evaluation-service/notifications';

async function fetchNotifications() {
  const token = process.env.AUTH_TOKEN;
  if (!token) {
    await log.warn('AUTH_TOKEN missing');
  }
  await log.info('fetching notifications');
  try {
    const res = await axios.get(NOTIFICATIONS_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 10000,
    });
    const list = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
    await log.info(`fetched n=${list.length} status=${res.status}`);
    return list;
  } catch (err) {
    await log.error(`fetch failed status=${err.response?.status || 'na'}`);
    throw err;
  }
}

module.exports = { fetchNotifications };
