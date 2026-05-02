# Notification System Design

## Overview
A comprehensive notification system for AffordMed that handles real-time notifications across the platform including order updates, promotions, and system alerts.

## Architecture

### Components

#### 1. Notification Backend Service
- WebSocket server for real-time notifications
- Notification queue management
- Database storage for notification history
- Multi-channel delivery (in-app, email, SMS, push)

#### 2. Notification Frontend
- Real-time notification display
- Notification center/history
- User preferences management
- Notification categories

#### 3. Logging Middleware
- Request/response logging
- Error tracking
- Performance monitoring
- Audit trail

## System Flow

```
User Action
    ↓
Backend API
    ↓
Logging Middleware (records action)
    ↓
Business Logic
    ↓
Notification Service (generates notification)
    ↓
Queue Management
    ↓
Multi-channel Delivery
    ├── WebSocket (real-time in-app)
    ├── Email Service
    ├── SMS Service
    └── Push Notifications
    ↓
Frontend Display
```

## Notification Types

### 1. Order Notifications
- Order placed
- Order confirmed
- Order shipped
- Order delivered
- Delivery delayed
- Order cancelled

### 2. Promotion Notifications
- New discount available
- Medicine in stock (saved)
- Limited time offer
- Personalized recommendation

### 3. System Notifications
- Account security alerts
- Password change
- New device login
- Account settings updated

### 4. Support Notifications
- Support ticket response
- Support ticket resolved
- Refund processed
- Return initiated

## Database Schema

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSON,
  isRead BOOLEAN DEFAULT FALSE,
  channels JSON,
  createdAt TIMESTAMP,
  readAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### User Preferences Table
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL UNIQUE,
  emailNotifications BOOLEAN DEFAULT TRUE,
  smsNotifications BOOLEAN DEFAULT FALSE,
  pushNotifications BOOLEAN DEFAULT TRUE,
  inAppNotifications BOOLEAN DEFAULT TRUE,
  orderUpdates BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT TRUE,
  security BOOLEAN DEFAULT TRUE,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## API Endpoints

### Notification Endpoints

#### Get Notifications
```
GET /api/notifications
Query Parameters:
  - limit: number (default: 20)
  - offset: number (default: 0)
  - type: string (optional)
  - isRead: boolean (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": "notif_001",
      "type": "ORDER_SHIPPED",
      "title": "Your order is on the way",
      "message": "Order #123 has been shipped",
      "isRead": false,
      "createdAt": "2026-05-02T10:30:00Z"
    }
  ],
  "total": 45,
  "unreadCount": 12
}
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Response:
{
  "success": true,
  "data": { notification_object }
}
```

#### Mark All as Read
```
PUT /api/notifications/mark-all-read
Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Delete Notification
```
DELETE /api/notifications/:id
Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

#### Get Preferences
```
GET /api/notifications/preferences
Response:
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true,
    "inAppNotifications": true,
    "orderUpdates": true,
    "promotions": true,
    "security": true
  }
}
```

#### Update Preferences
```
PUT /api/notifications/preferences
Body:
{
  "emailNotifications": true,
  "smsNotifications": true,
  "pushNotifications": false,
  "orderUpdates": true,
  "promotions": false,
  "security": true
}

Response:
{
  "success": true,
  "data": { preferences_object }
}
```

## WebSocket Events

### Client Connection
```javascript
// Connect
socket.connect();

// Listen for new notifications
socket.on('notification:new', (data) => {
  console.log('New notification:', data);
});

// Listen for notification updates
socket.on('notification:update', (data) => {
  console.log('Notification updated:', data);
});

// Disconnect
socket.disconnect();
```

### Server Events
```javascript
// Broadcast to user
io.to(`user_${userId}`).emit('notification:new', notificationData);

// Broadcast to room
io.to('admin_room').emit('alert', alertData);
```

## Frontend Components

### Notification Center
- List of all notifications
- Filter by type
- Search functionality
- Mark as read/unread
- Delete notifications
- Bulk actions

### Notification Bell Icon
- Unread count badge
- Quick preview
- Mark all as read
- View all link

### Notification Toast
- Auto-dismiss after 5 seconds
- Different styles for types (success, error, info, warning)
- Action buttons
- Close button

### Notification Preferences
- Toggle each notification type
- Channel selection per type
- Email frequency settings
- Quiet hours configuration

## Implementation Details

### Backend Stack
- Node.js + Express
- Socket.io for WebSocket
- Bull for job queue
- Redis for caching
- PostgreSQL for persistence

### Frontend Stack
- React
- Socket.io-client for WebSocket
- Redux for state management
- Toast library (react-toastify)

### Logging Middleware
- Request logging
- Response logging
- Error logging
- Performance metrics
- User action tracking

## Notification Flow Example

### Order Delivery Notification

1. **Order Status Update** (Backend Admin)
   - Admin changes order status to "Delivered"
   - Logging middleware logs the action

2. **Trigger Notification** (Backend Service)
   - Notification service creates notification record
   - Adds to notification queue
   - Prepares multi-channel delivery

3. **Queue Processing** (Backend Queue)
   - WebSocket delivery to connected client
   - Email template rendering
   - SMS formatting
   - Push notification payload

4. **Multi-channel Delivery**
   - In-app notification via WebSocket (instant)
   - Email via SendGrid (background)
   - SMS via Twilio (background)
   - Push via Firebase (background)

5. **Frontend Display** (Client)
   - WebSocket event received
   - Toast notification shown
   - Notification center updated
   - Unread count incremented
   - Bell icon badge updated

## Error Handling

### Retry Logic
- Failed notifications retry up to 3 times
- Exponential backoff: 1s, 5s, 30s
- Log all retry attempts

### Fallback
- If WebSocket fails, use polling
- If channel unavailable, try alternate channel
- Store unsent notifications for retry

## Performance Optimization

### Caching
- Cache user preferences
- Cache notification templates
- Cache notification count

### Database Optimization
- Index on userId, createdAt
- Index on isRead for unread queries
- Archive old notifications

### Frontend Optimization
- Lazy load notifications
- Pagination for notification list
- Virtual scrolling for large lists

## Security Considerations

### Authorization
- Only users can see their notifications
- Admin access control
- Role-based notification types

### Data Protection
- Encrypt sensitive data in notifications
- Sanitize notification content
- Rate limit notification API

### Audit Trail
- Log all notification activities
- Track user preference changes
- Monitor notification failures

## Testing

### Unit Tests
- Notification creation
- Preference updates
- Logging middleware

### Integration Tests
- WebSocket connection
- Multi-channel delivery
- Queue processing

### E2E Tests
- Complete notification flow
- User preference application
- Error recovery

## Deployment

### Environment Variables
```
SOCKET_IO_URL=http://localhost:5000
NOTIFICATION_QUEUE_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/affordmed
EMAIL_SERVICE_KEY=xxx
SMS_API_KEY=xxx
PUSH_API_KEY=xxx
```

### Monitoring
- WebSocket connection count
- Notification delivery rate
- Queue size
- Average delivery time

## Future Enhancements

1. **AI-Powered Notifications**
   - Smart notification timing
   - Personalized recommendations
   - Predictive alerts

2. **Advanced Scheduling**
   - Schedule notifications for later
   - Recurring notifications
   - Time-zone aware scheduling

3. **Rich Notifications**
   - Image/video attachments
   - Interactive buttons
   - Action cards

4. **Analytics**
   - Notification open rates
   - Click-through rates
   - User engagement metrics

5. **Multi-language Support**
   - Localized notifications
   - Language preferences
   - Translation service

## References

- Socket.io Documentation: https://socket.io/docs/
- Bull Queue Documentation: https://github.com/OptimalBits/bull
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Twilio SMS API: https://www.twilio.com/docs/sms

---

# Stage 1 — Priority Inbox

## Problem
Users miss important notifications because of high volume. We need a Priority Inbox that always surfaces the top N (default 10) most important **unread** notifications. Priority is a function of:
- **Type weight**: Placement > Result > Event
- **Recency**: newer wins ties

New notifications keep arriving in real time, so the data structure must support cheap incremental updates — not a re-sort of the whole list on every insert.

## Score Function
For each notification we compute a single comparable score:

```
score(n) = TYPE_WEIGHT[n.Type] * 1e13 + epoch_ms(n.Timestamp)
```

`1e13` exceeds any realistic millisecond timestamp, so type strictly dominates and recency is the within-type tiebreaker. Weights: Placement=3, Result=2, Event=1.

## Data Structure: Bounded Min-Heap of size N
We keep a **min-heap of capacity N** keyed on the score. Invariant: the heap holds the N highest-scoring notifications seen so far; the root is the *weakest* of the current top-N.

For each incoming notification `x`:
1. If `heap.size < N` → push `x`. `O(log N)`
2. Else if `score(x) > score(heap.peek())` → pop the weakest, push `x`. `O(log N)`
3. Else → discard. `O(1)`

To render the inbox, sort the N heap entries descending by score: `O(N log N)` — but N is small (10) and this only runs when the user opens the inbox.

A `Set` of seen IDs deduplicates retries / repeats from the API.

## Why a min-heap (vs alternatives)
| Approach | Insert | Get top-N | Notes |
|---|---|---|---|
| Sort full list every time | O(M log M) | O(N) | Wasted work; M grows unbounded |
| Sorted array of size N | O(N) per insert | O(N) | Linear shift on every admit |
| **Min-heap of size N** | **O(log N)** | **O(N log N)** rare | Memory bounded to N |
| Balanced BST | O(log N) | O(N) | More machinery, no win at N=10 |

Memory stays at O(N) regardless of how many notifications stream in.

## Handling streaming arrivals
The same `inbox.add(notification)` call is what a websocket / poller would invoke per message. No re-fetch, no re-sort of the whole feed. If a notification's score doesn't beat the current minimum it's dropped immediately — that's the cheap path that keeps the system stable under load.

If "unread" later needs to be mutable (user reads one), evicting an arbitrary element from a heap is O(N) — fine at N=10. For larger N, switch to an indexed heap or a treap.

## Files (in `notification_app_be/`)
- `priorityInbox.js` — `MinHeap`, `score()`, `PriorityInbox` class
- `notificationApiService.js` — fetches `GET /evaluation-service/notifications` with Bearer auth
- `app.js` — entrypoint: fetch → addMany → render top-N

## Logging
All log lines route through the Stage-0 Logging Middleware (`../logging_middleware/utils/logger`). No `console.log`/`console.error` is used for application events — `console.table` is used only as a render path for the human-visible top-N view.

## Run
```
cd notification_app_be
npm install
AUTH_TOKEN=<bearer> node app.js
# stream demo:
AUTH_TOKEN=<bearer> SIMULATE_STREAM=true node app.js
# custom N:
AUTH_TOKEN=<bearer> TOP_N=15 node app.js
```

## Output
See `OUTPUT_SCREENSHOTS.md` for screenshots of the top-10 inbox before and after a streaming round.
