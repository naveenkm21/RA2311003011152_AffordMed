/**
 * Main Application - Priority Inbox System
 * 
 * Stage 1: Implement Priority Inbox with top-n notifications
 * 
 * Features:
 * - Fetch notifications from external API
 * - Calculate priority based on type and recency
 * - Display top 10 notifications
 * - Maintain efficient in-memory priority queue
 * - Use custom logging middleware for all operations
 */

require('dotenv').config();

const logger = require('./logger');
const NotificationAPIService = require('./notificationApiService');
const { extractTopNotifications, PriorityInboxManager } = require('./priorityInbox');

/**
 * Format notification for display
 */
function formatNotificationForDisplay(notif) {
  return {
    rank: notif._rank || '-',
    id: notif.ID.substring(0, 8) + '...',
    type: notif.Type,
    message: notif.Message,
    timestamp: notif.Timestamp,
    priority: Math.round(notif.priorityScore || 0),
    weight: notif.weight,
    recencySeconds: notif.recencyScore,
  };
}

/**
 * Display priority notifications in table format
 */
function displayPriorityNotifications(notifications) {
  logger.info('='.repeat(100));
  logger.info('PRIORITY INBOX - TOP NOTIFICATIONS', {
    count: notifications.length,
    timestamp: new Date().toISOString(),
  });
  logger.info('='.repeat(100));

  if (notifications.length === 0) {
    logger.warn('No notifications to display');
    return;
  }

  // Add rank to each notification
  const rankedNotifications = notifications.map((notif, index) => ({
    ...notif,
    _rank: index + 1,
  }));

  // Create formatted display
  const displayData = rankedNotifications.map(formatNotificationForDisplay);

  // Log as table
  console.log('\n');
  console.table(displayData);
  console.log('\n');

  // Log detailed breakdown
  const summary = {
    totalDisplayed: notifications.length,
    breakdown: {
      Placement: notifications.filter(n => n.Type === 'Placement').length,
      Result: notifications.filter(n => n.Type === 'Result').length,
      Event: notifications.filter(n => n.Type === 'Event').length,
    },
    priorityRange: {
      highest: Math.round(notifications[0]?.priorityScore || 0),
      lowest: Math.round(notifications[notifications.length - 1]?.priorityScore || 0),
    },
  };

  logger.info('Priority Inbox Summary', summary);
  logger.info('='.repeat(100) + '\n');
}

/**
 * Demonstrate Priority Inbox Manager for real-time updates
 */
function demonstratePriorityManager(initialNotifications) {
  logger.info('='.repeat(100));
  logger.info('DEMONSTRATING REAL-TIME PRIORITY INBOX MANAGER', {});
  logger.info('='.repeat(100));

  const manager = new PriorityInboxManager(10);

  // Add initial notifications
  logger.info('Adding initial notifications to manager...', {});
  initialNotifications.slice(0, 15).forEach(notif => {
    manager.addNotification(notif);
  });

  logger.info('Initial state of Priority Manager:', {});
  displayPriorityNotifications(manager.getTopNotifications());

  // Display stats
  logger.info('Priority Manager Statistics', manager.getStats());

  // Simulate adding a new high-priority notification
  logger.info('Simulating new high-priority Placement notification...');
  const newPlacementNotif = {
    ID: 'new-placement-001',
    Type: 'Placement',
    Message: 'Microsoft hiring - New batch',
    Timestamp: new Date().toISOString(),
  };

  manager.addNotification(newPlacementNotif);
  logger.info('New notification added. Updated Priority Manager:', {});
  displayPriorityNotifications(manager.getTopNotifications());

  logger.info('Final Priority Manager Statistics', manager.getStats());
  logger.info('='.repeat(100) + '\n');
}

/**
 * Main execution function
 */
async function main() {
  logger.info('='.repeat(100));
  logger.info('STAGE 1: PRIORITY INBOX SYSTEM - STARTING APPLICATION', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
  logger.info('='.repeat(100));

  try {
    // Initialize API service
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl) {
      logger.error('Missing API_URL environment variable', {});
      process.exit(1);
    }

    const apiService = new NotificationAPIService(apiUrl, apiToken);

    // Fetch notifications
    logger.info('Step 1: Fetching notifications from API...');
    const notifications = await apiService.fetchAndValidateNotifications();

    logger.info('Step 1 Complete: Notifications fetched', {
      total: notifications.length,
    });

    if (notifications.length === 0) {
      logger.error('No valid notifications received from API', {});
      process.exit(1);
    }

    // Extract top 10 notifications
    const topN = parseInt(process.env.TOP_NOTIFICATIONS) || 10;
    logger.info(`Step 2: Extracting top ${topN} notifications...`);
    const topNotifications = extractTopNotifications(notifications, topN);

    logger.info(`Step 2 Complete: Top ${topN} notifications extracted`, {
      count: topNotifications.length,
    });

    // Display priority notifications
    logger.info('Step 3: Displaying priority notifications...');
    displayPriorityNotifications(topNotifications);

    // Demonstrate real-time manager
    logger.info('Step 4: Demonstrating real-time priority inbox manager...');
    demonstratePriorityManager(notifications);

    logger.info('='.repeat(100));
    logger.info('STAGE 1: APPLICATION EXECUTION COMPLETED SUCCESSFULLY', {
      timestamp: new Date().toISOString(),
      totalNotificationsProcessed: notifications.length,
      topNotificationsDisplayed: topNotifications.length,
    });
    logger.info('='.repeat(100));

  } catch (error) {
    logger.error('FATAL ERROR IN APPLICATION', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Execute main function
main();
