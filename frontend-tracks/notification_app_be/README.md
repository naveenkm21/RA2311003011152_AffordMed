# Notification App - Backend

Real-time notification service backend for AffordMed platform with WebSocket support, multi-channel delivery, and queue management.

## Features

- ✅ WebSocket real-time notifications
- ✅ Notification queue management
- ✅ Multi-channel delivery (Email, SMS, Push, In-app)
- ✅ User preferences management
- ✅ Notification history
- ✅ Logging and monitoring
- ✅ Error handling and retries

## Project Structure

```
notification_app_be/
├── server.js              # Express server setup
├── socket.js              # WebSocket configuration
├── routes/
│   ├── notifications.js   # Notification routes
│   └── preferences.js     # User preferences routes
├── controllers/
│   ├── notificationController.js
│   └── preferenceController.js
├── services/
│   ├── notificationService.js
│   ├── emailService.js
│   ├── smsService.js
│   └── pushService.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   ├── Notification.js
│   └── Preference.js
├── queue/
│   └── notificationQueue.js
├── utils/
│   ├── logger.js
│   └── errors.js
├── config/
│   ├── database.js
│   ├── redis.js
│   └── env.js
├── package.json
└── README.md
```

## Installation

```bash
npm install
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost/affordmed
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
SOCKET_IO_URL=http://localhost:5000

# Email Service
SENDGRID_API_KEY=xxx
SENDGRID_FROM_EMAIL=noreply@affordmed.com

# SMS Service
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/:id` - Get single notification
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `GET /api/preferences/channels` - Get available channels

## WebSocket Events

### Client Events
- `notification:new` - New notification received
- `notification:read` - Notification marked as read
- `notification:deleted` - Notification deleted

### Server Events
- `connect` - Client connected
- `disconnect` - Client disconnected
- `error` - Connection error

## Services

### Email Service
Handles email notifications using SendGrid

### SMS Service
Handles SMS notifications using Twilio

### Push Service
Handles push notifications using Firebase Cloud Messaging

## Queue Management

Notification jobs are processed asynchronously using Bull queue with Redis backend.

## Deployment

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  notification-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/affordmed
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
```

## Next Steps

1. Set up Express server
2. Configure WebSocket with Socket.io
3. Set up database models
4. Implement notification services
5. Create API routes
6. Set up queue processing
7. Integrate email/SMS/push services
8. Add logging and monitoring
