import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
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
  Crown,
  Tag,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { SupabaseService } from '../services/SupabaseService';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { dbService } from '../database/DatabaseService';
import { SubscriptionModal } from './SubscriptionModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<Props> = ({ visible, onClose, onOpenAuth }) => {
  const {
    userProfile,
    setUserProfile,
    resetAllProgress,
    deleteUserAccount,
  } = useLearningStore();
  const { colors } = useThemeStore();

  const [dailyTarget, setDailyTarget] = useState<number>(35);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await SupabaseService.signOut();
          await setUserProfile(null);
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
            await deleteUserAccount();
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
      'Tüm kelime hafıza kutularınız (Aralıklı Tekrar), çözülen soru ve deneme geçmişiniz, hata kasanız ve günlük seriniz başlangıç durumuna getirilecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await resetAllProgress();
            Alert.alert('Başarılı', 'Tüm öğrenme ilerlemeniz başarıyla sıfırlandı.');
          },
        },
      ]
    );
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="90%">
      <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.brandLight }]}>
              <User size={18} color={colors.brand} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Profil & Ayarlar</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hesap, hedef ve yasal mağaza tercihleri</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}>
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* USER CARD */}
          {userProfile ? (
            <View style={[styles.userCard, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.brand }]}>
                <Text style={[styles.avatarLetter, { color: colors.textOnBrand }]}>
                  {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: colors.text }]}>{userProfile.fullName || 'YDS Öğrencisi'}</Text>
                {userProfile.email && !userProfile.email.includes('privaterelay') && (
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userProfile.email}</Text>
                )}
                <View style={styles.badgeRow}>
                  <View style={[styles.targetBadge, { backgroundColor: colors.brandLight }]}>
                    <Award size={11} color={colors.brand} />
                    <Text style={[styles.targetBadgeText, { color: colors.brand }]}>Hedef: {userProfile.targetScore || 80}+</Text>
                  </View>
                  {userProfile.isGuest && (
                    <View style={[styles.guestBadge, { backgroundColor: colors.subtleBackground }]}>
                      <Text style={[styles.guestBadgeText, { color: colors.textSecondary }]}>Misafir Hesap</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.guestPromptCard, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
              <View>
                <Text style={[styles.guestPromptTitle, { color: colors.brand }]}>Misafir Olarak Kullanıyorsunuz</Text>
                <Text style={[styles.guestPromptSub, { color: colors.textSecondary }]}>
                  İlerlemenizi bulutta yedeklemek ve cihazlar arası eşitlemek için giriş yapın.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: colors.brand }]}
                onPress={() => {
                  onClose();
                  setTimeout(() => onOpenAuth(), 300);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.loginBtnText, { color: colors.textOnBrand }]}>Giriş Yap / Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PRO MEMBERSHIP BANNER */}
          <TouchableOpacity
            style={[styles.proUpgradeBanner, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}
            onPress={() => setIsSubscriptionModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.proUpgradeLeft}>
              <View style={[styles.proUpgradeIconWrap, { backgroundColor: colors.brand }]}>
                <Crown size={20} color={colors.textOnBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.proTitleRow}>
                  <Text style={[styles.proUpgradeTitle, { color: colors.brand }]}>
                    {userProfile?.isPro ? '👑 YDS Pratik Pro Aktif' : '💎 YDS Pratik Pro Üyelik'}
                  </Text>
                  <View style={[styles.proPromoBadge, { backgroundColor: colors.accentWarmLight }]}>
                    <Tag size={10} color={colors.accentWarm} />
                    <Text style={[styles.proPromoBadgeText, { color: colors.accentWarm }]}>%20 HOCA İNDİRİMİ</Text>
                  </View>
                </View>
                <Text style={[styles.proUpgradeSub, { color: colors.textSecondary }]}>
                  {userProfile?.isPro
                    ? 'Sınav gününe kadar sınırsız AI ve Master deneme erişimi'
                    : 'AI tuzak analizi ve 80 soruluk denemeler · ALİ20 ile 470 TL'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* SECTION 1: HEDEF VE ÇALIŞMA */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>🎯 Hedef ve Çalışma Düzeni</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Target size={18} color={colors.brand} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Günlük Soru Hedefi</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Günde çözmek istediğiniz soru sayısı</Text>
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
                    style={[
                      styles.targetChip,
                      {
                        backgroundColor: isSelected ? colors.brandLight : colors.subtleBackground,
                        borderColor: isSelected ? colors.brand : colors.border,
                      },
                    ]}
                    onPress={() => setDailyTarget(count)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.targetChipText,
                        { color: isSelected ? colors.brand : colors.textSecondary },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {count} Soru
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell size={18} color={colors.brand} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Günlük Hatırlatıcı</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Serinizi kaybetmemeniz için bildirimler</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.brandLight }}
                thumbColor={notificationsEnabled ? colors.brand : colors.textSecondary}
              />
            </View>
          </View>

          {/* SECTION 2: VERİ & SENKRONİZASYON */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>☁️ Veri ve Senkronizasyon</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Cloud size={18} color={colors.success} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Supabase Bulut Yedekleme</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Verileriniz cihazda ve bulutta güvende</Text>
                </View>
              </View>
              <Text style={[styles.activePillText, { backgroundColor: colors.successLight, color: colors.success }]}>Aktif</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingRowAction}
              onPress={handleResetProgress}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <RotateCcw size={18} color={colors.accentWarm} />
                <Text style={[styles.settingTitle, { color: colors.accentWarm }]}>
                  İlerlemeyi Sıfırla
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* SECTION 3: YASAL & MAĞAZA POLİTİKALARI */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>⚖️ Yasal Bilgiler & Mağaza Uyumluluğu</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.settingRowAction}
              onPress={() => {
                Alert.alert(
                  'Gizlilik Politikası (Privacy Policy)',
                  'YDS Pratik, kullanıcı gizliliğine saygı duyar. Çözdüğünüz sorular, kelime istatistikleriniz ve kullanıcı profiliniz yalnızca sınav başarınızı artırmak amacıyla işlenir. Verileriniz 3. taraflarla paylaşılmaz ve satılmaz. KVKK ve GDPR uyumludur.'
                );
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <ShieldCheck size={18} color={colors.brand} />
                <Text style={[styles.settingTitle, { color: colors.text }]}>Gizlilik Politikası (Privacy Policy)</Text>
              </View>
              <ExternalLink size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingRowAction}
              onPress={() => {
                Alert.alert(
                  'Kullanım Koşulları (Terms of Service / EULA)',
                  'YDS Pratik uygulamasındaki tüm sınav materyalleri, soru bankaları ve AI içerikleri bireysel eğitim ve sınav hazırlığı amacıyla sunulmaktadır. Ticari olarak kopyalanamaz veya dağıtılamaz.'
                );
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <FileText size={18} color={colors.brand} />
                <Text style={[styles.settingTitle, { color: colors.text }]}>Kullanım Koşulları (Terms of Use / EULA)</Text>
              </View>
              <ExternalLink size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>Uygulama Sürümü</Text>
              <Text style={[styles.versionValue, { color: colors.text }]}>v1.0.0 (Build 1) · Production</Text>
            </View>
          </View>

          {/* SECTION 4: HESAP VE GÜVENLİK */}
          {userProfile && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>🔒 Hesap Güvenliği</Text>
              <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.settingRowAction}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <LogOut size={18} color={colors.textSecondary} />
                    <Text style={[styles.settingTitle, { color: colors.textSecondary }]}>Çıkış Yap</Text>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* APPLE 5.1.1 MANDATORY ACCOUNT DELETION BUTTON */}
                <TouchableOpacity
                  style={styles.settingRowAction}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Trash2 size={18} color={colors.error} />
                    <Text style={[styles.settingTitle, { color: colors.error, fontWeight: '800' }]}>
                      Hesabımı ve Tüm Verilerimi Kalıcı Olarak Sil
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* SUBSCRIPTION & PROMO CODE MODAL */}
      <SubscriptionModal
        visible={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 20,
  },
  userCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    marginVertical: 10,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  guestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  guestBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  guestPromptCard: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    gap: 12,
  },
  guestPromptTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  guestPromptSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  loginBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  settingsCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
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
  },
  settingDesc: {
    fontSize: 11.5,
    marginTop: 2,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
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
    borderWidth: 1.4,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  targetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  versionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  versionValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  proUpgradeBanner: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  proUpgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  proUpgradeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  proUpgradeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  proPromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proPromoBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  proUpgradeSub: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
});
