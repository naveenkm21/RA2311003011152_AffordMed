// Pure helper: compute priority ranking on the client (mirrors backend logic).
// score = typeWeight * 1e13 + epoch_ms(timestamp); higher is more important.

export const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export function score(n) {
  const w = TYPE_WEIGHT[n.Type] || 0;
  const t = new Date(String(n.Timestamp || '').replace(' ', 'T') + 'Z').getTime() || 0;
  return w * 1e13 + t;
}

export function topN(list, n) {
  return [...list].sort((a, b) => score(b) - score(a)).slice(0, n);
}
