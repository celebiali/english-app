import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Linking,
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
  ChevronRight,
  ExternalLink,
  RotateCcw,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { SupabaseService } from '../services/SupabaseService';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { dbService } from '../database/DatabaseService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<Props> = ({ visible, onClose, onOpenAuth }) => {
  const { userProfile, setUserProfile, loadVocabSession, loadDailyTasks } = useLearningStore();

  const [dailyTarget, setDailyTarget] = useState<number>(35);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await SupabaseService.signOut();
          setUserProfile(null);
          onClose();
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
            onClose();
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
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="90%">
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconBox}>
              <User size={18} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.title}>Profil & Ayarlar</Text>
              <Text style={styles.subtitle}>Hesap, hedef ve yasal mağaza tercihleri</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
                onPress={() => {
                  onClose();
                  setTimeout(() => onOpenAuth(), 300);
                }}
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
                    onPress={() => setDailyTarget(count)}
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
                onValueChange={setNotificationsEnabled}
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

                {/* APPLE 5.1.1 MANDATORY ACCOUNT DELETION BUTTON */}
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
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#F1F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  scroll: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E7EAF3',
    marginVertical: 10,
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
    marginVertical: 10,
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
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
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
    paddingVertical: 9,
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
