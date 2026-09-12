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
   * Check current permission status without prompting
   */
  static async getPermissionsStatus(): Promise<boolean> {
    try {
      const current = await Notifications.getPermissionsAsync();
      return !!(current?.granted || current?.status === 'granted');
    } catch {
      return false;
    }
  }

  /**
   * Requests permission to send notifications
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const current = await Notifications.getPermissionsAsync();
      let isGranted = current?.granted || current?.status === 'granted';

      if (!isGranted) {
        const requested = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        isGranted = requested?.granted || requested?.status === 'granted';
      }

      if (!isGranted) {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('yds_daily_reminders', {
          name: 'Dil Sınavı Günlük Çalışma Hatırlatıcıları',
          description: 'Günlük soru ve kelime hedefleri, serinizi koruma bildirimleri',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('yds_vocab_reminders', {
          name: 'Dil Sınavı Kelime Bildirimleri',
          description: 'Sabah kelime seti ve tekrar vakti hatırlatıcıları',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      return true;
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return false;
    }
  }

  /**
   * Schedules reminders silently ONLY IF permissions are already granted by the user.
   * Prevents invasive permission popups on cold launch.
   */
  static async scheduleIfPermitted(
    eveningHour: number = 20,
    eveningMinute: number = 30,
    dailyTarget: number = 35,
    streakCount: number = 1
  ): Promise<boolean> {
    const isGranted = await this.getPermissionsStatus();
    if (!isGranted) return false;
    return this.scheduleAllReminders(eveningHour, eveningMinute, dailyTarget, streakCount);
  }

  /**
   * Schedules full set of smart daily reminders:
   * 1. Morning Vocab (09:00 AM) - Kelimeler ve Tekrarlar
   * 2. Evening Streak Protection (eveningHour e.g. 20:30)
   */
  static async scheduleAllReminders(
    eveningHour: number = 20,
    eveningMinute: number = 30,
    dailyTarget: number = 35,
    streakCount: number = 1
  ): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return false;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 1. Morning Kickoff Reminder (09:00) - Kelimeler ve tekrarlar hazır
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Günün Kelimeleri ve Tekrarları Hazır! 📚',
          body: 'Bugün tekrar vakti gelen kelimelerin ve yeni hedefin seni bekliyor. Güne taze bir başlangıç yap!',
          sound: 'default',
          data: { screen: 'VOCAB' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      // 2. Evening Streak Protection Reminder (20:30 / eveningHour)
      // Gün içinde çalışma yapılmadıysa seriyi koruma uyarısı
      let eveningTitle = '🔥 Serini Kaybetme!';
      let eveningBody = `Bugün henüz günlük hedefini tamamlamadın! Serini korumak ve sınavına hazırlanmak için birkaç dakika ayır.`;

      if (streakCount > 1) {
        eveningTitle = `🔥 ${streakCount} Günlük Serini Kaybetme!`;
        eveningBody = `${streakCount} gündür harika gidiyorsun! Bugünkü çalışmanı tamamlayarak serini koru.`;
      } else if (streakCount === 1) {
        eveningTitle = '🔥 2. Gün Serisini Yakala!';
        eveningBody = 'Harika bir başlangıç yaptın! Bugünkü çalışmanı tamamlayarak serini 2 güne çıkar.';
      } else {
        eveningTitle = '🎯 İlk Gün Serini Başlat!';
        eveningBody = 'Bugün birkaç soru veya kelime çözerek ilk serini yakala ve hedefine bir adım daha yaklaş!';
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: eveningTitle,
          body: eveningBody,
          sound: 'default',
          data: { screen: 'TASKS' },
        },
        trigger: {
          hour: eveningHour,
          minute: eveningMinute,
          repeats: true,
        },
      });

      return true;
    } catch (err) {
      console.warn('Failed to schedule daily reminders:', err);
      return false;
    }
  }

  /**
   * Legacy alias for single daily reminder
   */
  static async scheduleDailyReminder(
    hour: number = 20,
    minute: number = 0,
    dailyTarget: number = 35,
    streakCount: number = 1
  ): Promise<string | null> {
    const success = await this.scheduleAllReminders(hour, minute, dailyTarget, streakCount);
    return success ? 'scheduled_all' : null;
  }

  /**
   * Triggers an immediate test notification to verify audio, vibration, and banner
   */
  static async sendTestNotification(
    title: string = '🎯 Dil Sınavı Hazırlık Bildirim Testi',
    body: string = 'Harika! Günlük çalışma ve seri koruma bildirimleriniz başarıyla aktif edildi.'
  ): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return false;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: { screen: 'TASKS' },
        },
        trigger: null, // immediate trigger
      });
      return true;
    } catch (err) {
      console.warn('Failed to send test notification:', err);
      return false;
    }
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
