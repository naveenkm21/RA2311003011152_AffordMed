import { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Alert, Skeleton, Pagination } from '@mui/material';
import FilterToolbar from '../components/Toolbar.jsx';
import NotificationCard from '../components/NotificationCard.jsx';
import { fetchNotifications } from '../api/notifications.js';
import { useViewed } from '../hooks/useViewed.js';
import { createLogger } from '../lib/log.js';

const log = createLogger('page');
const PAGE_SIZE = 10;

export default function AllNotifications() {
  const [type, setType] = useState('All');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const { viewed, markViewed, markAllViewed } = useViewed();

  const load = async () => {
    setBusy(true); setErr(null);
    try {
      const list = await fetchNotifications({
        limit: PAGE_SIZE, page, type,
      });
      setItems(list);
      log.info(`all page=${page} got=${list.length}`);
    } catch (e) {
      const s = e.response?.status;
      const body = typeof e.response?.data === 'string'
        ? e.response.data
        : JSON.stringify(e.response?.data || {});
      setErr(s === 401
        ? 'Auth token missing or expired. Set VITE_AUTH_TOKEN and restart.'
        : `Failed to load (status=${s ?? 'network'}): ${body || e.message}`);
      log.error(`all load err ${s || ''}`);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, type]);

  const newCount = useMemo(
    () => items.filter((n) => !viewed.has(n.ID)).length,
    [items, viewed]
  );

  return (
    <Box>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5">All Notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          {newCount} new on this page
        </Typography>
      </Stack>

      <FilterToolbar
        type={type}
        onType={(v) => { setType(v); setPage(1); }}
        onRefresh={load}
        onMarkAllRead={() => markAllViewed(items.map((n) => n.ID))}
        busy={busy}
      />

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {busy && items.length === 0 ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={88} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Alert severity="info">No notifications match the current filter.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {items.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isNew={!viewed.has(n.ID)}
              onView={markViewed}
            />
          ))}
        </Stack>
      )}

      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Pagination
          count={items.length < PAGE_SIZE ? page : page + 1}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
          shape="rounded"
        />
      </Stack>
    </Box>
  );
}
