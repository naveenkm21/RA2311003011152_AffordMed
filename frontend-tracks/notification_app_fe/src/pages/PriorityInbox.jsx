import { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Alert, Skeleton } from '@mui/material';
import FilterToolbar from '../components/Toolbar.jsx';
import NotificationCard from '../components/NotificationCard.jsx';
import { fetchManyForRanking } from '../api/notifications.js';
import { topN } from '../lib/priority.js';
import { useViewed } from '../hooks/useViewed.js';
import { createLogger } from '../lib/log.js';

const log = createLogger('page');

export default function PriorityInbox() {
  const [type, setType] = useState('All');
  const [limit, setLimit] = useState(10);
  const [raw, setRaw] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const { viewed, markViewed, markAllViewed } = useViewed();

  const load = async () => {
    setBusy(true); setErr(null);
    try {
      // Server caps limit at 10/page — paginate to build a ranking pool wider than N.
      const list = await fetchManyForRanking({ target: Math.max(limit * 3, 30), type });
      setRaw(list);
      log.info(`prio fetched=${list.length}`);
    } catch (e) {
      const s = e.response?.status;
      const body = typeof e.response?.data === 'string'
        ? e.response.data
        : JSON.stringify(e.response?.data || {});
      setErr(s === 401
        ? 'Auth token missing or expired. Set VITE_AUTH_TOKEN and restart.'
        : `Failed to load (status=${s ?? 'network'}): ${body || e.message}`);
      log.error(`prio load err ${s || ''}`);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [type, limit]);

  const top = useMemo(() => topN(raw, limit), [raw, limit]);
  const newCount = useMemo(
    () => top.filter((n) => !viewed.has(n.ID)).length,
    [top, viewed]
  );

  return (
    <Box>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5">Priority Inbox</Typography>
        <Typography variant="body2" color="text.secondary">
          Top {limit} unread first · {newCount} new
        </Typography>
      </Stack>

      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        Priority = Type weight (Placement &gt; Result &gt; Event) + recency.
      </Alert>

      <FilterToolbar
        type={type}
        onType={setType}
        limit={limit}
        onLimit={setLimit}
        onRefresh={load}
        onMarkAllRead={() => markAllViewed(top.map((n) => n.ID))}
        busy={busy}
      />

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {busy && top.length === 0 ? (
        <Stack spacing={1.5}>
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={92} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : top.length === 0 ? (
        <Alert severity="info">No notifications match the current filter.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {top.map((n, i) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isNew={!viewed.has(n.ID)}
              rank={i + 1}
              onView={markViewed}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
