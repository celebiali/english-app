import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set global notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Requests permission to send notifications
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const current: any = await Notifications.getPermissionsAsync();
      let isGranted = current?.granted || current?.status === 'granted';

      if (!isGranted) {
        const requested: any = await Notifications.requestPermissionsAsync();
        isGranted = requested?.granted || requested?.status === 'granted';
      }

      if (!isGranted) {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('yds_daily_reminders', {
          name: 'YDS Günlük Hatırlatıcılar',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
        });
      }

      return true;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  }

  /**
   * Schedules a daily study reminder at a given hour and minute with dynamic target & streak
   */
  static async scheduleDailyReminder(
    hour: number = 20,
    minute: number = 0,
    dailyTarget: number = 35,
    streakCount: number = 1
  ): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔥 ${streakCount} Günlük Serini Koru!`,
          body: `Bugünkü ${dailyTarget} soruluk YDS görevini ve kelime setini tamamlamayı unutma.`,
          sound: 'default',
          data: { screen: 'TASKS' },
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      return id;
    } catch (err) {
      console.warn('Schedule notification error:', err);
      return null;
    }
  }

  /**
   * Triggers an immediate test notification to verify audio & badge
   */
  static async sendTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 YDS Master Bildirim Testi',
        body: 'Harika! Günlük çalışma hatırlatıcınız başarıyla aktif edildi.',
        sound: 'default',
      },
      trigger: null,
    });
  }

  /**
   * Cancels all scheduled notifications
   */
  static async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('Cancel notifications error:', err);
    }
  }
}
