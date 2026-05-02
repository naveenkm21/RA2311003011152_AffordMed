/**
 * Notification API Service
 * Fetches notifications from the external API with proper error handling
 */

const axios = require('axios');
const logger = require('./logger');

class NotificationAPIService {
  constructor(apiUrl, apiToken) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && { 'Authorization': `Bearer ${apiToken}` }),
      },
    });

    logger.info('Notification API Service initialized', {
      apiUrl: this.apiUrl,
      hasToken: !!apiToken,
    });
  }

  /**
   * Fetch notifications from API
   */
  async fetchNotifications() {
    logger.info('Fetching notifications from API', {
      url: this.apiUrl,
    });

    try {
      const startTime = Date.now();
      const response = await this.client.get(this.apiUrl);
      const duration = Date.now() - startTime;

      logger.info('Notifications fetched successfully', {
        statusCode: response.status,
        totalNotifications: response.data?.notifications?.length || 0,
        duration: `${duration}ms`,
      });

      if (!response.data || !response.data.notifications) {
        logger.warn('Invalid response structure from API', {
          responseKeys: Object.keys(response.data || {}),
        });
        return [];
      }

      return response.data.notifications;
    } catch (error) {
      logger.error('Failed to fetch notifications from API', {
        error: error.message,
        code: error.code,
        status: error.response?.status,
        url: this.apiUrl,
      });
      throw error;
    }
  }

  /**
   * Fetch and validate notifications
   */
  async fetchAndValidateNotifications() {
    logger.debug('Starting notification fetch and validation');

    try {
      const notifications = await this.fetchNotifications();
      const validNotifications = this.validateNotifications(notifications);

      logger.info('Notifications validated', {
        fetched: notifications.length,
        valid: validNotifications.length,
        invalid: notifications.length - validNotifications.length,
      });

      return validNotifications;
    } catch (error) {
      logger.error('Error in fetch and validate', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate notification structure
   */
  validateNotifications(notifications) {
    logger.debug('Validating notification structure', {
      count: notifications.length,
    });

    const valid = [];
    const invalid = [];

    notifications.forEach(notif => {
      if (notif && notif.ID && notif.Type && notif.Message && notif.Timestamp) {
        // Validate type
        const validTypes = ['Placement', 'Result', 'Event'];
        if (validTypes.includes(notif.Type)) {
          valid.push(notif);
        } else {
          invalid.push({
            id: notif.ID,
            reason: `Invalid type: ${notif.Type}`,
          });
        }
      } else {
        invalid.push({
          id: notif?.ID || 'unknown',
          reason: 'Missing required fields',
        });
      }
    });

    if (invalid.length > 0) {
      logger.warn('Invalid notifications found', {
        count: invalid.length,
        sample: invalid.slice(0, 3),
      });
    }

    return valid;
  }
}

module.exports = NotificationAPIService;
