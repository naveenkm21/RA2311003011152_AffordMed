import { useCallback, useEffect, useState } from 'react';

const KEY = 'affordmed:viewed-notifications';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function save(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // ignore quota errors
  }
}

export function useViewed() {
  const [viewed, setViewed] = useState(() => load());

  useEffect(() => {
    const onStorage = (e) => { if (e.key === KEY) setViewed(load()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markViewed = useCallback((id) => {
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      save(next);
      return next;
    });
  }, []);

  const markAllViewed = useCallback((ids) => {
    setViewed((prev) => {
      const next = new Set(prev);
      let changed = false;
      ids.forEach((id) => { if (!next.has(id)) { next.add(id); changed = true; } });
      if (changed) save(next);
      return next;
    });
  }, []);

  const clearViewed = useCallback(() => {
    setViewed(new Set());
    save(new Set());
  }, []);

  return { viewed, markViewed, markAllViewed, clearViewed };
}
