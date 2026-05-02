# Stage 1 — Output Screenshots

Add the screenshots of `node app.js` showing the top-10 priority notifications here.

Recommended captures:
1. `screenshot-top10.png` — initial top-10 after fetch
2. `screenshot-stream.png` — top-10 after `SIMULATE_STREAM=true` shows new arrivals admitted via O(log N) heap updates
3. `screenshot-logs.png` — log output showing entries from the logging middleware (admit/evict events)

Drop the PNGs alongside this file and reference them below:

```
![Top 10](./screenshot-top10.png)
![After stream](./screenshot-stream.png)
![Logs](./screenshot-logs.png)
```
