# Priority Inbox System - Quick Start Guide

## Files Overview

1. **app.js** - Main application entry point
2. **priorityInbox.js** - Priority calculation & queue management logic
3. **notificationApiService.js** - API fetching and validation
4. **logger.js** - Custom logging middleware
5. **Notification_System_Design.md** - Complete system design document

## Setup Instructions

### Prerequisites
- Node.js v14+
- npm

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your API details
# API_URL=http://20.207.122.201/evaluation-service/notifications
# API_TOKEN=your-token-here
```

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Expected Output

The application will:
1. Fetch notifications from the API
2. Calculate priority scores
3. Display top 10 notifications in a formatted table
4. Show statistics and breakdowns
5. Demonstrate real-time priority manager updates

## Key Functions

### Priority Score Calculation
```javascript
const { calculatePriorityScore } = require('./priorityInbox');
const score = calculatePriorityScore('Placement', '2026-04-22 17:51:18');
```

### Extract Top Notifications
```javascript
const { extractTopNotifications } = require('./priorityInbox');
const top10 = extractTopNotifications(notifications, 10);
```

### Real-time Priority Manager
```javascript
const { PriorityInboxManager } = require('./priorityInbox');
const manager = new PriorityInboxManager(10);
manager.addNotification(newNotification);
```

## Logging

All operations are logged using the custom logging middleware. Log levels:
- DEBUG: Detailed information
- INFO: General information
- WARN: Warning messages
- ERROR: Error messages

Set log level via environment variable:
```bash
LOG_LEVEL=info
```

## Performance Metrics

- **Batch Processing**: O(n log k) where k=10
- **Real-time Updates**: O(log k) per notification
- **Memory Usage**: O(k) - only top k stored
- **Scalability**: Handles 1M+ notifications efficiently
