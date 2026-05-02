const { createLogger } = require('../logging_middleware/utils/logger');
const log = createLogger('backend', 'service');

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

function score(n) {
  const w = TYPE_WEIGHT[n.Type] || 0;
  const t = new Date(n.Timestamp.replace(' ', 'T') + 'Z').getTime() || 0;
  return w * 1e13 + t;
}

class MinHeap {
  constructor(cmp) { this.h = []; this.cmp = cmp; }
  size() { return this.h.length; }
  peek() { return this.h[0]; }
  push(x) { this.h.push(x); this._up(this.h.length - 1); }
  pop() {
    const top = this.h[0];
    const last = this.h.pop();
    if (this.h.length) { this.h[0] = last; this._down(0); }
    return top;
  }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(this.h[i], this.h[p]) < 0) {
        [this.h[i], this.h[p]] = [this.h[p], this.h[i]];
        i = p;
      } else break;
    }
  }
  _down(i) {
    const n = this.h.length;
    while (true) {
      const l = i * 2 + 1, r = l + 1; let s = i;
      if (l < n && this.cmp(this.h[l], this.h[s]) < 0) s = l;
      if (r < n && this.cmp(this.h[r], this.h[s]) < 0) s = r;
      if (s === i) break;
      [this.h[i], this.h[s]] = [this.h[s], this.h[i]];
      i = s;
    }
  }
}

class PriorityInbox {
  constructor(n = 10) {
    this.n = n;
    this.heap = new MinHeap((a, b) => a.score - b.score);
    this.seen = new Set();
  }

  add(notification) {
    if (!notification || !notification.ID) {
      log.warn('skipped: missing ID');
      return false;
    }
    if (this.seen.has(notification.ID)) return false;
    this.seen.add(notification.ID);
    const entry = { score: score(notification), data: notification };

    if (this.heap.size() < this.n) {
      this.heap.push(entry);
      log.debug(`admit ${notification.Type} sz=${this.heap.size()}`);
      return true;
    }
    if (entry.score > this.heap.peek().score) {
      this.heap.pop();
      this.heap.push(entry);
      log.debug(`evict for ${notification.Type}`);
      return true;
    }
    return false;
  }

  addMany(list) {
    let admitted = 0;
    for (const n of list) if (this.add(n)) admitted++;
    log.info(`bulk recv=${list.length} adm=${admitted} top=${this.heap.size()}`);
    return admitted;
  }

  top() {
    return [...this.heap.h]
      .sort((a, b) => b.score - a.score)
      .map(e => e.data);
  }
}

module.exports = { PriorityInbox, score, TYPE_WEIGHT };
