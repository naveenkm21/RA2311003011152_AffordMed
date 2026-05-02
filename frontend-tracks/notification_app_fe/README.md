# Notification App - Frontend

Real-time notification UI for AffordMed platform built with React. Displays notifications, manages preferences, and provides notification center.

## Features

- ✅ Real-time notification display
- ✅ Notification center with history
- ✅ Toast notifications
- ✅ Unread count badge
- ✅ Notification preferences panel
- ✅ Search and filter notifications
- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ WebSocket integration

## Project Structure

```
notification_app_fe/
├── src/
│   ├── components/
│   │   ├── NotificationBell.jsx
│   │   ├── NotificationCenter.jsx
│   │   ├── NotificationToast.jsx
│   │   ├── NotificationPreferences.jsx
│   │   └── NotificationItem.jsx
│   ├── hooks/
│   │   ├── useNotifications.js
│   │   ├── useWebSocket.js
│   │   └── useNotificationPreferences.js
│   ├── services/
│   │   ├── notificationApi.js
│   │   ├── socketService.js
│   │   └── mockNotifications.js
│   ├── store/
│   │   ├── notificationSlice.js
│   │   ├── preferencesSlice.js
│   │   └── store.js
│   ├── styles/
│   │   ├── notifications.css
│   │   ├── notificationCenter.css
│   │   └── preferences.css
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md
```

## Installation

```bash
npm install
```

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Running

```bash
# Development
npm start

# Build
npm run build

# Test
npm test
```

## Components

### NotificationBell
- Shows unread count
- Opens notification dropdown
- Shows recent notifications preview
- Mark all as read button

### NotificationCenter
- Full notification history
- Search and filter
- Pagination
- Mark as read/unread
- Delete individual notifications
- Clear all notifications

### NotificationToast
- Auto-dismiss toasts
- Different styles (success, error, info, warning)
- Action buttons
- Close button
- Stack management

### NotificationPreferences
- Toggle notification types
- Channel selection
- Frequency settings
- Quiet hours configuration
- Save preferences button

### NotificationItem
- Notification content display
- Action buttons
- Timestamp
- Read/unread indicator
- Delete button

## Custom Hooks

### useNotifications
Manages notification state and operations
```javascript
const { 
  notifications, 
  unreadCount, 
  markAsRead, 
  deleteNotification,
  clearAll 
} = useNotifications();
```

### useWebSocket
Handles WebSocket connections
```javascript
const { 
  connected, 
  events, 
  emit 
} = useWebSocket('http://localhost:5000');
```

### useNotificationPreferences
Manages user preferences
```javascript
const { 
  preferences, 
  updatePreferences, 
  loading 
} = useNotificationPreferences();
```

## Integration

### With Redux
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setNotifications } from './store/notificationSlice';

function App() {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications);
  
  // ...
}
```

### With Context
```javascript
import { NotificationProvider, useNotification } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <YourComponent />
    </NotificationProvider>
  );
}
```

## Styling

### CSS Variables
```css
--notification-bg: #ffffff;
--notification-border: #e5e7eb;
--notification-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
--unread-bg: #f0f9ff;
--primary-color: #2563eb;
```

### Responsive Design
- Mobile optimized
- Tablet layout
- Desktop layout
- Dark mode support

## API Integration

### Notification Endpoints
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete
- `PUT /api/notifications/mark-all-read` - Mark all as read

### Preferences Endpoints
- `GET /api/preferences` - Get preferences
- `PUT /api/preferences` - Update preferences

## WebSocket Events

### Listen
```javascript
socket.on('notification:new', (data) => {
  // Handle new notification
});

socket.on('notification:update', (data) => {
  // Handle updated notification
});
```

### Emit
```javascript
socket.emit('notification:read', notificationId);
socket.emit('preferences:update', preferences);
```

## Performance Optimization

- Lazy load notification center
- Pagination for notifications
- Virtual scrolling for large lists
- Memoized components
- Debounced search

## Testing

```bash
npm test
```

### Test Coverage
- Component rendering
- User interactions
- WebSocket events
- API calls
- State management

## Deployment

### Netlify
```bash
npm run build
# Deploy build/ folder
```

### Vercel
```bash
vercel
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. Create React components
2. Set up WebSocket integration
3. Implement API services
4. Add Redux/Context state management
5. Create styling
6. Add notifications UI
7. Implement preferences panel
8. Test and optimize
