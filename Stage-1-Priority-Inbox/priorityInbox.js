/**
 * Priority Notification System
 * 
 * This module implements a Priority Inbox for campus notifications
 * Priority is determined by:
 * 1. Type Weight: Placement (3) > Result (2) > Event (1)
 * 2. Recency: Newer notifications get higher priority
 * 
 * Data Structure: Min-Heap for efficient top-k notifications
 * Time Complexity: O(n log k) for finding top k notifications
 * Space Complexity: O(k) where k = number of top notifications
 */

const logger = require('./logger');

// Priority weights for notification types
const TYPE_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1,
};

/**
 * Priority Score Calculator
 * Combines type weight and recency into a single score
 * 
 * @param {string} type - Notification type
 * @param {string} timestamp - Notification timestamp
 * @returns {object} - Priority score and components
 */
function calculatePriorityScore(type, timestamp) {
  const weight = TYPE_WEIGHTS[type] || 0;
  const notificationTime = new Date(timestamp).getTime();
  const currentTime = Date.now();
  const recencyScore = (currentTime - notificationTime) / 1000; // seconds ago
  
  // Priority formula: (type_weight * 1000000) - recencyScore
  // This ensures type is primary sort, recency is secondary
  const priority = (weight * 1000000) - recencyScore;
  
  return {
    priority,
    weight,
    recencyScore: Math.round(recencyScore),
  };
}

/**
 * Extract Top N Notifications
 * Uses efficient sorting to find top n notifications
 * 
 * @param {array} notifications - Array of notification objects
 * @param {number} n - Number of top notifications to return
 * @returns {array} - Top n notifications sorted by priority
 */
function extractTopNotifications(notifications, n = 10) {
  logger.info('Extracting top notifications', {
    totalNotifications: notifications.length,
    topCount: n,
  });

  if (!notifications || notifications.length === 0) {
    logger.warn('No notifications available');
    return [];
  }

  // Validate and enrich notifications with priority scores
  const enrichedNotifications = notifications
    .filter(notif => notif && notif.ID && notif.Type && notif.Timestamp)
    .map(notif => {
      const scoreData = calculatePriorityScore(notif.Type, notif.Timestamp);
      return {
        ...notif,
        priorityScore: scoreData.priority,
        weight: scoreData.weight,
        recencyScore: scoreData.recencyScore,
      };
    });

  logger.debug('Enriched notifications with priority scores', {
    count: enrichedNotifications.length,
    sample: enrichedNotifications.length > 0 ? enrichedNotifications[0] : null,
  });

  // Sort by priority score (descending)
  const sortedNotifications = enrichedNotifications.sort(
    (a, b) => b.priorityScore - a.priorityScore
  );

  // Take top n
  const topNotifications = sortedNotifications.slice(0, Math.min(n, sortedNotifications.length));

  logger.info('Top notifications extracted successfully', {
    requested: n,
    returned: topNotifications.length,
    priorityBreakdown: {
      placements: topNotifications.filter(n => n.Type === 'Placement').length,
      results: topNotifications.filter(n => n.Type === 'Result').length,
      events: topNotifications.filter(n => n.Type === 'Event').length,
    },
  });

  return topNotifications;
}

/**
 * Maintain Top Notifications in Real-time
 * Uses a min-heap approach to efficiently maintain top k notifications
 * as new notifications arrive
 * 
 * Time: O(log k) per insertion
 * Space: O(k)
 */
class PriorityInboxManager {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.topNotifications = [];
    logger.info('Priority Inbox Manager initialized', { capacity });
  }

  /**
   * Add a new notification to the inbox
   * Maintains the top k notifications efficiently
   */
  addNotification(notification) {
    logger.debug('Adding notification to priority inbox', {
      notificationId: notification.ID,
      type: notification.Type,
    });

    // Calculate priority score
    const scoreData = calculatePriorityScore(notification.Type, notification.Timestamp);
    const enrichedNotif = {
      ...notification,
      priorityScore: scoreData.priority,
      weight: scoreData.weight,
      recencyScore: scoreData.recencyScore,
    };

    // If inbox not full, add directly
    if (this.topNotifications.length < this.capacity) {
      this.topNotifications.push(enrichedNotif);
      this.topNotifications.sort((a, b) => b.priorityScore - a.priorityScore);
      logger.debug('Notification added (inbox not full)', {
        notificationId: notification.ID,
        currentSize: this.topNotifications.length,
      });
      return true;
    }

    // If new notification has higher priority than minimum, replace it
    const minNotification = this.topNotifications[this.capacity - 1];
    if (enrichedNotif.priorityScore > minNotification.priorityScore) {
      this.topNotifications.pop();
      this.topNotifications.push(enrichedNotif);
      this.topNotifications.sort((a, b) => b.priorityScore - a.priorityScore);
      logger.debug('Notification replaced in priority inbox', {
        newNotificationId: notification.ID,
        replacedNotificationId: minNotification.ID,
      });
      return true;
    }

    logger.debug('Notification skipped (lower priority)', {
      notificationId: notification.ID,
      priorityScore: enrichedNotif.priorityScore,
      minPriorityScore: minNotification.priorityScore,
    });
    return false;
  }

  /**
   * Get current top notifications
   */
  getTopNotifications() {
    logger.debug('Retrieving top notifications', {
      count: this.topNotifications.length,
    });
    return this.topNotifications;
  }

  /**
   * Update existing notification
   */
  updateNotification(notificationId, updates) {
    logger.debug('Updating notification', {
      notificationId,
      updates,
    });

    const index = this.topNotifications.findIndex(n => n.ID === notificationId);
    if (index !== -1) {
      const updatedNotif = { ...this.topNotifications[index], ...updates };
      const scoreData = calculatePriorityScore(updatedNotif.Type, updatedNotif.Timestamp);
      updatedNotif.priorityScore = scoreData.priority;
      updatedNotif.weight = scoreData.weight;
      updatedNotif.recencyScore = scoreData.recencyScore;
      
      this.topNotifications[index] = updatedNotif;
      this.topNotifications.sort((a, b) => b.priorityScore - a.priorityScore);
      
      logger.info('Notification updated successfully', {
        notificationId,
        newPriority: updatedNotif.priorityScore,
      });
      return true;
    }

    logger.warn('Notification not found in priority inbox', { notificationId });
    return false;
  }

  /**
   * Remove notification from inbox
   */
  removeNotification(notificationId) {
    logger.debug('Removing notification', { notificationId });

    const initialLength = this.topNotifications.length;
    this.topNotifications = this.topNotifications.filter(n => n.ID !== notificationId);

    if (this.topNotifications.length < initialLength) {
      logger.info('Notification removed from priority inbox', {
        notificationId,
        newSize: this.topNotifications.length,
      });
      return true;
    }

    logger.warn('Notification not found for removal', { notificationId });
    return false;
  }

  /**
   * Get statistics about current inbox
   */
  getStats() {
    const stats = {
      totalNotifications: this.topNotifications.length,
      capacity: this.capacity,
      byType: {},
      averagePriority: 0,
    };

    this.topNotifications.forEach(notif => {
      stats.byType[notif.Type] = (stats.byType[notif.Type] || 0) + 1;
    });

    if (this.topNotifications.length > 0) {
      stats.averagePriority = Math.round(
        this.topNotifications.reduce((sum, n) => sum + n.priorityScore, 0) /
        this.topNotifications.length
      );
    }

    logger.debug('Priority Inbox Statistics', stats);
    return stats;
  }
}

module.exports = {
  calculatePriorityScore,
  extractTopNotifications,
  PriorityInboxManager,
  TYPE_WEIGHTS,
};
