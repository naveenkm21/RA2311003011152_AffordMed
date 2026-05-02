import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AllNotifications from './pages/AllNotifications.jsx';
import PriorityInbox from './pages/PriorityInbox.jsx';
import { fetchNotifications } from './api/notifications.js';
import { useViewed } from './hooks/useViewed.js';

export default function App() {
  const [globalUnread, setGlobalUnread] = useState(0);
  const { viewed } = useViewed();

  // Lightweight badge poll so the AppBar reflects unread count even when
  // the user is on the Priority page only.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const list = await fetchNotifications({ limit: 10, page: 1 });
        if (cancelled) return;
        setGlobalUnread(list.filter((n) => !viewed.has(n.ID)).length);
      } catch { /* swallow */ }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [viewed]);

  return (
    <Layout unreadCount={globalUnread}>
      <Routes>
        <Route path="/" element={<AllNotifications />} />
        <Route path="/priority" element={<PriorityInbox />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
