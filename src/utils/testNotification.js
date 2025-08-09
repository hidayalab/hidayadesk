import notificationService from '../services/notificationService.js';

export async function testPrayerNotifications() {
  // Test notification permission
  const permission = await notificationService.requestPermission();
  console.log('Notification permission:', permission);

  if (permission) {
    // Test immediate notification
    await notificationService.showNotification('Test Prayer Notification', {
      body: 'This is a test notification for prayer times.',
      requireInteraction: false
    });

    // Test scheduling with fake prayer times (for immediate testing)
    const now = new Date();
    const testTime = new Date(now.getTime() + 5000); // 5 seconds from now
    const testTimeString = testTime.toTimeString().slice(0, 5); // HH:MM format

    const testPrayerTimes = {
      'TestPrayer': testTimeString
    };

    console.log('Scheduling test prayer notification for:', testTimeString);
    notificationService.scheduleAllPrayerNotifications(testPrayerTimes, {
      exactTime: true,
      advanceMinutes: 0
    });

    return true;
  }
  return false;
}

// Make it available in the browser console
if (typeof window !== 'undefined') {
  window.testPrayerNotifications = testPrayerNotifications;
}