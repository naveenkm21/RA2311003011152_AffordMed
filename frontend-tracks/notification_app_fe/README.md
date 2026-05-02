# Notification Frontend (Stage 2)

Responsive React + Material UI app for the AffordMed campus notifications platform. Runs on **http://localhost:3000** only.

## Pages
- **/** — All Notifications. Filter by type (All / Placement / Result / Event), paginate, mark read.
- **/priority** — Priority Inbox. Top-N selector (10/15/20/50), same filters, ranked by `Placement > Result > Event` then recency.

## Viewed vs. New
Viewed IDs persist in `localStorage` under `affordmed:viewed-notifications`. Unviewed cards show a `NEW` chip + amber background; the AppBar shows a global unread count. Hover/click marks a card viewed; **Mark read** marks the visible page.

## Logging
All significant events (page load, fetch result, errors) go through the shared `Log()` client (`src/lib/log.js`) which POSTs to `/evaluation-service/logs` via the Vite dev proxy with the bearer token. Server caps `message` at 48 chars — the client truncates.

## Run

```bash
cp .env.example .env.local
# edit .env.local — paste the bearer token from the eval /auth response
npm install
npm start
```

Open http://localhost:3000.

The Vite dev server proxies `/api/*` -> `http://20.207.122.201/*` and injects the `Authorization: Bearer <token>` header from `VITE_AUTH_TOKEN`. This sidesteps browser CORS and keeps the token out of the page bundle.

## API params used
- `limit` — page size (All) / wide fetch window (Priority)
- `page` — pagination on the All page
- `notification_type` — `Placement` / `Result` / `Event` (omitted for All)

## Stack
React 18, React Router v6, Material UI v5, Vite, Axios. No other CSS libraries.
