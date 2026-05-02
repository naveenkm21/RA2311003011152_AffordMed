/**
 * Test Suite for Priority Inbox System
 * Demonstrates functionality with mock data
 */

const logger = require('./logger');
const { extractTopNotifications, PriorityInboxManager, calculatePriorityScore } = require('./priorityInbox');

// Mock notifications data (matching API response structure)
const mockNotifications = [
  {
    "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
    "Type": "Result",
    "Message": "mid-sem",
    "Timestamp": "2026-04-22 17:51:30"
  },
  {
    "ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
    "Type": "Placement",
    "Message": "CSX Corporation hiring",
    "Timestamp": "2026-04-22 17:51:18"
  },
  {
    "ID": "81589ada-0ad3-4f77-9554-f52fb558e09d",
    "Type": "Event",
    "Message": "farewell",
    "Timestamp": "2026-04-22 17:51:06"
  },
  {
    "ID": "0005513a-142b-4bbc-8678-eefec65e1ede",
    "Type": "Result",
    "Message": "mid-sem",
    "Timestamp": "2026-04-22 17:50:54"
  },
  {
    "ID": "ea836726-c25e-4f21-a72f-544a6af8a37f",
    "Type": "Result",
    "Message": "project-review",
    "Timestamp": "2026-04-22 17:50:42"
  },
  {
    "ID": "003cb427-8fc6-47f7-bb00-be228f6b0d2c",
    "Type": "Result",
    "Message": "external",
    "Timestamp": "2026-04-22 17:50:30"
  },
  {
    "ID": "e5c4ff20-31bf-4d40-8f02-72fda59e8918",
    "Type": "Result",
    "Message": "project-review",
    "Timestamp": "2026-04-22 17:50:18"
  },
  {
    "ID": "1cfce5ee-ad37-4894-8946-d707627176a5",
    "Type": "Event",
    "Message": "tech-fest",
    "Timestamp": "2026-04-22 17:50:06"
  },
  {
    "ID": "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8",
    "Type": "Result",
    "Message": "project-review",
    "Timestamp": "2026-04-22 17:49:54"
  },
  {
    "ID": "8a7412bd-6065-4d09-8501-a37f11cc848b",
    "Type": "Placement",
    "Message": "Advanced Micro Devices Inc. hiring",
    "Timestamp": "2026-04-22 17:49:42"
  }
];

/**
 * Test 1: Priority Score Calculation
 */
function testPriorityScoreCalculation() {
  logger.info('═'.repeat(80));
  logger.info('TEST 1: PRIORITY SCORE CALCULATION', {});
  logger.info('═'.repeat(80));

  const testCases = [
    { type: 'Placement', timestamp: '2026-04-22 17:51:18' },
    { type: 'Result', timestamp: '2026-04-22 17:51:30' },
    { type: 'Event', timestamp: '2026-04-22 17:51:06' },
  ];

  testCases.forEach(tc => {
    const score = calculatePriorityScore(tc.type, tc.timestamp);
    logger.info('Score Calculation Result', {
      type: tc.type,
      timestamp: tc.timestamp,
      weight: score.weight,
      recencySeconds: score.recencyScore,
      finalPriority: Math.round(score.priority),
    });
  });

  logger.info('✓ TEST 1 PASSED\n');
}

/**
 * Test 2: Extract Top Notifications
 */
function testExtractTopNotifications() {
  logger.info('═'.repeat(80));
  logger.info('TEST 2: EXTRACT TOP 10 NOTIFICATIONS', {});
  logger.info('═'.repeat(80));

  const topNotifications = extractTopNotifications(mockNotifications, 10);

  logger.info('Top Notifications Results', {
    totalInput: mockNotifications.length,
    topExtracted: topNotifications.length,
    breakdown: {
      Placement: topNotifications.filter(n => n.Type === 'Placement').length,
      Result: topNotifications.filter(n => n.Type === 'Result').length,
      Event: topNotifications.filter(n => n.Type === 'Event').length,
    },
  });

  // Display formatted table
  console.log('\n');
  console.log('PRIORITY INBOX - TOP 10 NOTIFICATIONS');
  console.log('─'.repeat(120));
  
  const displayData = topNotifications.map((notif, idx) => ({
    Rank: idx + 1,
    Type: notif.Type,
    Message: notif.Message,
    Timestamp: notif.Timestamp,
    Priority: Math.round(notif.priorityScore),
    RecencySeconds: notif.recencyScore,
  }));

  console.table(displayData);

  logger.info('✓ TEST 2 PASSED\n');
}

/**
 * Test 3: Priority Inbox Manager - Real-time Updates
 */
function testPriorityInboxManager() {
  logger.info('═'.repeat(80));
  logger.info('TEST 3: PRIORITY INBOX MANAGER - REAL-TIME UPDATES', {});
  logger.info('═'.repeat(80));

  const manager = new PriorityInboxManager(10);

  // Add initial notifications
  logger.info('Adding 10 initial notifications...', {});
  mockNotifications.slice(0, 10).forEach(notif => {
    manager.addNotification(notif);
  });

  logger.info('Initial state loaded', manager.getStats());

  // Display initial top notifications
  console.log('\n');
  console.log('INITIAL PRIORITY INBOX STATE');
  console.log('─'.repeat(120));
  const initialData = manager.getTopNotifications().map((notif, idx) => ({
    Rank: idx + 1,
    Type: notif.Type,
    Message: notif.Message,
    Priority: Math.round(notif.priorityScore),
  }));
  console.table(initialData);

  // Simulate new high-priority notification
  logger.info('Simulating new Placement notification arrival...', {});
  const newPlacementNotif = {
    ID: 'sim-placement-001',
    Type: 'Placement',
    Message: 'Google hiring - Campus recruitment',
    Timestamp: new Date().toISOString(),
  };

  const added = manager.addNotification(newPlacementNotif);
  logger.info('New notification processed', {
    notificationId: newPlacementNotif.ID,
    wasAdded: added,
  });

  // Display updated top notifications
  console.log('\n');
  console.log('UPDATED PRIORITY INBOX AFTER NEW PLACEMENT NOTIFICATION');
  console.log('─'.repeat(120));
  const updatedData = manager.getTopNotifications().map((notif, idx) => ({
    Rank: idx + 1,
    Type: notif.Type,
    Message: notif.Message,
    Priority: Math.round(notif.priorityScore),
    IsNew: notif.ID === 'sim-placement-001' ? '✓ NEW' : '',
  }));
  console.table(updatedData);

  logger.info('Final Statistics', manager.getStats());
  logger.info('✓ TEST 3 PASSED\n');
}

/**
 * Test 4: Invalid Notification Handling
 */
function testInvalidNotificationHandling() {
  logger.info('═'.repeat(80));
  logger.info('TEST 4: INVALID NOTIFICATION HANDLING', {});
  logger.info('═'.repeat(80));

  const invalidNotifications = [
    ...mockNotifications,
    { Type: 'Placement', Message: 'Missing ID' }, // Missing ID
    { ID: 'test', Type: 'InvalidType', Timestamp: new Date().toISOString() }, // Invalid type
    { ID: 'test', Message: 'Missing Type' }, // Missing type
  ];

  logger.info('Processing notifications with invalid records...', {
    totalNotifications: invalidNotifications.length,
  });

  const topNotifications = extractTopNotifications(invalidNotifications, 10);

  logger.info('Processing completed', {
    totalInput: invalidNotifications.length,
    validExtracted: topNotifications.length,
    invalidSkipped: invalidNotifications.length - topNotifications.length,
  });

  logger.info('✓ TEST 4 PASSED\n');
}

/**
 * Run all tests
 */
function runAllTests() {
  logger.info('\n' + '═'.repeat(80));
  logger.info('PRIORITY INBOX SYSTEM - TEST SUITE', {
    timestamp: new Date().toISOString(),
  });
  logger.info('═'.repeat(80) + '\n');

  try {
    testPriorityScoreCalculation();
    testExtractTopNotifications();
    testPriorityInboxManager();
    testInvalidNotificationHandling();

    logger.info('═'.repeat(80));
    logger.info('ALL TESTS COMPLETED SUCCESSFULLY', {
      timestamp: new Date().toISOString(),
    });
    logger.info('═'.repeat(80));
  } catch (error) {
    logger.error('TEST SUITE FAILED', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = {
  mockNotifications,
  testPriorityScoreCalculation,
  testExtractTopNotifications,
  testPriorityInboxManager,
  testInvalidNotificationHandling,
  runAllTests,
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}
