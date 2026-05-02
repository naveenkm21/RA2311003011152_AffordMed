# Logging Middleware

Reusable logging package for the AffordMed evaluation. Exposes a single
`Log(stack, level, package, message)` function that POSTs to the Test Server,
plus an Express request/response middleware and an error handler that route
through the same client.

## Test Server
- Endpoint: `POST http://20.207.122.201/evaluation-service/logs`
- Protected route — pass `LOG_AUTH_TOKEN` (or `AUTH_TOKEN`) via env.
- Request body: `{ stack, level, package, message }` — all lower case.

## Allowed values

| Field | Values |
|---|---|
| `stack` | `backend`, `frontend` |
| `level` | `debug`, `info`, `warn`, `error`, `fatal` |
| `package` (backend) | `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service` |
| `package` (frontend) | `api`, `component`, `hook`, `page`, `state`, `style` |
| `package` (shared) | `auth`, `config`, `middleware`, `utils` |

The client validates these locally before issuing the call so a typo fails
fast instead of being silently rejected by the server.

## Usage

### Direct call
```js
const Log = require('logging_middleware/utils/logger');

await Log('backend', 'error', 'handler', 'received string, expected bool');
await Log('backend', 'fatal', 'db',      'Critical database connection failure.');
```

### Bound logger (less repetition at call sites)
```js
const { createLogger } = require('logging_middleware/utils/logger');
const log = createLogger('backend', 'service');

await log.info('cache warmup started');
await log.warn('downstream latency high p95=820ms');
await log.error('order persist failed orderId=42');
await log.fatal('redis pool exhausted');
```

### Express middleware
```js
const express = require('express');
const loggingMiddleware = require('./logging_middleware/middleware/logging');
const errorHandler     = require('./logging_middleware/middleware/errorHandler');

const app = express();
app.use(loggingMiddleware({ trackPerformance: true, excludePaths: ['/health'] }));
// ...routes...
app.use(errorHandler);
```

The middleware emits an `info` log on every request, an `info`/`warn`/`error`
log on response (status- and duration-aware), and an `error` log on socket
errors. Each call goes to the Test Server through `Log()`.

## Auth
Set the bearer once for the process:
```
export LOG_AUTH_TOKEN=eyJhbGciOi...
```
Or reuse the `AUTH_TOKEN` you already use for the notifications API — the
client falls back to it.

## Files
- `utils/logger.js`      — `Log()` + `createLogger()`
- `middleware/logging.js`  — Express request/response middleware
- `middleware/errorHandler.js` — Express error-handling middleware
- `utils/sanitizer.js`     — Field/header redaction helpers used by the middleware
