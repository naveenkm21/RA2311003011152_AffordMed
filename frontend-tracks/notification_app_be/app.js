require('dotenv').config();
const { createLogger } = require('../logging_middleware/utils/logger');
const { PriorityInbox } = require('./priorityInbox');
const { fetchNotifications } = require('./notificationApiService');

const log = createLogger('backend', 'controller');
const TOP_N = parseInt(process.env.TOP_N || '10', 10);

async function main() {
  await log.info(`start priority inbox topN=${TOP_N}`);

  const inbox = new PriorityInbox(TOP_N);
  const notifications = await fetchNotifications();
  inbox.addMany(notifications);

  const top = inbox.top();
  await log.info(`computed top-${top.length}`);

  const rows = top.map((n, i) => ({
    Rank: i + 1,
    Type: n.Type,
    Message: n.Message,
    Timestamp: n.Timestamp,
    ID: n.ID,
  }));

  process.stdout.write(`\nTop ${top.length} Priority Notifications\n\n`);
  console.table(rows);

  if (process.env.SIMULATE_STREAM === 'true' && notifications.length > 0) {
    await log.info('simulating incoming stream');
    const sample = notifications.slice(0, 5).map((n, i) => ({
      ...n,
      ID: `sim-${i}-${Date.now()}`,
      Timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }));
    inbox.addMany(sample);
    process.stdout.write('\nAfter streaming new notifications:\n\n');
    console.table(inbox.top().map((n, i) => ({
      Rank: i + 1, Type: n.Type, Message: n.Message, Timestamp: n.Timestamp, ID: n.ID,
    })));
  }
}

main().catch(async (err) => {
  await log.fatal(`run failed: ${err.message}`);
  process.exitCode = 1;
});
