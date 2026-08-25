import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import {
  User,
  LogOut,
  Trash2,
  Cloud,
  ShieldCheck,
  FileText,
  Award,
  Bell,
  Target,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { SupabaseService } from '../services/SupabaseService';
import { dbService } from '../database/DatabaseService';
import { NotificationService } from '../services/NotificationService';

interface Props {
  onBack: () => void;
  onOpenAuth: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack, onOpenAuth }) => {
  const {
    userProfile,
    setUserProfile,
    dailyQuestionTarget,
    setDailyQuestionTarget,
    streakCount,
    loadVocabSession,
    loadDailyTasks,
  } = useLearningStore();

  const [dailyTarget, setDailyTarget] = useState<number>(dailyQuestionTarget || 35);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const handleSelectTarget = async (count: number) => {
    setDailyTarget(count);
    setDailyQuestionTarget(count);
    if (notificationsEnabled) {
      await NotificationService.scheduleDailyReminder(20, 0, count, streakCount);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      const id = await NotificationService.scheduleDailyReminder(20, 0, dailyTarget, streakCount);
      if (id) {
        Alert.alert(
          'Bildirimler Aktif Edildi',
          `Her akşam 20:00'de günlük ${dailyTarget} soruluk hedefiniz ve ${streakCount} günlük seriniz için hatırlatıcı gönderilecek.`,
          [
            { text: 'Tamam' },
            {
              text: 'Test Bildirimi Gönder',
              onPress: () => NotificationService.sendTestNotification(),
            },
          ]
        );
      }
    } else {
      await NotificationService.cancelAll();
    }
  };

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await SupabaseService.signOut();
          setUserProfile(null);
          onBack();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Kalıcı Olarak Sil',
      'Hesabınızı, çözdüğünüz sınavları ve tüm kelime hafızanızı kalıcı olarak silmek istediğinizden emin misiniz? (Apple & KVKK Güvencesi: Bu işlem geri alınamaz.)',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı ve Verilerimi Sil',
          style: 'destructive',
          onPress: async () => {
            await SupabaseService.deleteAccount();
            setUserProfile(null);
            onBack();
            Alert.alert('Hesap Silindi', 'Hesabınız ve ilişkili tüm veriler başarıyla silindi.');
          },
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'İlerlemeyi Sıfırla',
      'Günlük görev havuzunu ve kelime kutularınızı başlangıç durumuna getirmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await dbService.seedQuestionsIfEmpty();
            await loadVocabSession();
            await loadDailyTasks();
            Alert.alert('Başarılı', 'İlerlemeniz sıfırlandı.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft size={22} color="#4F46E5" />
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profil & Ayarlar</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* USER CARD */}
        {userProfile ? (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{userProfile.fullName || 'YDS Öğrencisi'}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.targetBadge}>
                  <Award size={11} color="#4F46E5" />
                  <Text style={styles.targetBadgeText}>Hedef: {userProfile.targetScore || 80}+</Text>
                </View>
                {userProfile.isGuest && (
                  <View style={styles.guestBadge}>
                    <Text style={styles.guestBadgeText}>Misafir Hesap</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestPromptCard}>
            <View>
              <Text style={styles.guestPromptTitle}>Misafir Olarak Kullanıyorsunuz</Text>
              <Text style={styles.guestPromptSub}>
                İlerlemenizi bulutta yedeklemek ve cihazlar arası eşitlemek için giriş yapın.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={onOpenAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.loginBtnText}>Giriş Yap / Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 1: HEDEF VE ÇALIŞMA */}
        <Text style={styles.sectionHeading}>🎯 Hedef ve Çalışma Düzeni</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Target size={18} color="#4F46E5" />
              <View>
                <Text style={styles.settingTitle}>Günlük Soru Hedefi</Text>
                <Text style={styles.settingDesc}>Günde çözmek istediğiniz soru sayısı</Text>
              </View>
            </View>
          </View>

          {/* Target Chips */}
          <View style={styles.targetRow}>
            {[20, 35, 50].map((count) => {
              const isSelected = dailyTarget === count;
              return (
                <TouchableOpacity
                  key={count}
                  style={[styles.targetChip, isSelected && styles.targetChipActive]}
                  onPress={() => handleSelectTarget(count)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.targetChipText, isSelected && styles.targetChipTextActive]}
                  >
                    {count} Soru
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={18} color="#7C3AED" />
              <View>
                <Text style={styles.settingTitle}>Günlük Hatırlatıcı</Text>
                <Text style={styles.settingDesc}>Serinizi kaybetmemeniz için bildirimler</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
              thumbColor={notificationsEnabled ? '#4F46E5' : '#94A3B8'}
            />
          </View>
        </View>

        {/* SECTION 2: VERİ & SENKRONİZASYON */}
        <Text style={styles.sectionHeading}>☁️ Veri ve Senkronizasyon</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Cloud size={18} color="#059669" />
              <View>
                <Text style={styles.settingTitle}>Supabase Bulut Yedekleme</Text>
                <Text style={styles.settingDesc}>Verileriniz cihazda ve bulutta güvende</Text>
              </View>
            </View>
            <Text style={styles.activePillText}>Aktif</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRowAction}
            onPress={handleResetProgress}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <RotateCcw size={18} color="#D97706" />
              <Text style={[styles.settingTitle, { color: '#B45309' }]}>
                İlerlemeyi Sıfırla
              </Text>
            </View>
            <ChevronRight size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* SECTION 3: YASAL & MAĞAZA POLİTİKALARI (APPLE / GOOGLE STORE COMPLIANT) */}
        <Text style={styles.sectionHeading}>⚖️ Yasal Bilgiler & Mağaza Uyumluluğu</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingRowAction}
            onPress={() => {
              Alert.alert(
                'Gizlilik Politikası (Privacy Policy)',
                'YDS Master, kullanıcı gizliliğine saygı duyar. Çözdüğünüz sorular, kelime istatistikleriniz ve kullanıcı profiliniz yalnızca sınav başarınızı artırmak amacıyla işlenir. Verileriniz 3. taraflarla paylaşılmaz ve satılmaz. KVKK ve GDPR uyumludur.'
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <ShieldCheck size={18} color="#4F46E5" />
              <Text style={styles.settingTitle}>Gizlilik Politikası (Privacy Policy)</Text>
            </View>
            <ExternalLink size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRowAction}
            onPress={() => {
              Alert.alert(
                'Kullanım Koşulları (Terms of Service / EULA)',
                'YDS Master uygulamasındaki tüm sınav materyalleri, soru bankaları ve AI içerikleri bireysel eğitim ve sınav hazırlığı amacıyla sunulmaktadır. Ticari olarak kopyalanamaz veya dağıtılamaz.'
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <FileText size={18} color="#4F46E5" />
              <Text style={styles.settingTitle}>Kullanım Koşulları (Terms of Use / EULA)</Text>
            </View>
            <ExternalLink size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.versionLabel}>Uygulama Sürümü</Text>
            <Text style={styles.versionValue}>v1.0.0 (Build 1) · Production</Text>
          </View>
        </View>

        {/* SECTION 4: HESAP VE GÜVENLİK (APPLE GUIDELINE 5.1.1 ACCOUNT DELETION) */}
        {userProfile && (
          <>
            <Text style={styles.sectionHeading}>🔒 Hesap Güvenliği</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity
                style={styles.settingRowAction}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <LogOut size={18} color="#475569" />
                  <Text style={styles.settingTitle}>Çıkış Yap</Text>
                </View>
                <ChevronRight size={18} color="#CBD5E1" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingRowAction}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Trash2 size={18} color="#DC2626" />
                  <Text style={[styles.settingTitle, { color: '#DC2626', fontWeight: '800' }]}>
                    Hesabımı ve Tüm Verilerimi Kalıcı Olarak Sil
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },
  pageTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E7EAF3',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  guestBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  guestBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  guestPromptCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 12,
  },
  guestPromptTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  guestPromptSub: {
    fontSize: 12,
    color: '#4338CA',
    marginTop: 2,
    lineHeight: 17,
  },
  loginBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7EAF3',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingRowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  targetChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  targetChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  targetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  targetChipTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  versionLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  versionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
