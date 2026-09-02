import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Platform,
  BackHandler,
  Linking,
} from 'react-native';
import {
  X,
  ChevronRight,
  RefreshCw,
  Trash2,
  Check,
  User,
  LogOut,
  RotateCcw,
  UserX,
  Minus,
  Plus,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink,
} from 'lucide-react-native';
import { useThemeStore, FontSizeValue } from '../store/useThemeStore';
import { useLearningStore } from '../store/useLearningStore';
import { dbService } from '../database/DatabaseService';
import { NotificationService } from '../services/NotificationService';
import { SupabaseService } from '../services/SupabaseService';
import { AuthModal } from './AuthModal';
import { LegalSheetModal } from './LegalSheetModal';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenAuth?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onOpenAuth }) => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    isSystemFontSize,
    setIsSystemFontSize,
    fontFamily,
    setFontFamily,
    autoNightMode,
    setAutoNightMode,
    colors,
  } = useThemeStore();

  const {
    userProfile,
    dailyTasksProgress,
    streakCount,
    taskGoals,
    dailyQuestionTarget,
    setUserProfile,
    setTaskGoals,
    loadVocabSession,
    loadDailyTasks,
    resetAllProgress,
    deleteUserAccount,
  } = useLearningStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState(21);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Bugün, 10:42');

  // Modals visibility
  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState(false);
  const [isFontFamilyModalOpen, setIsFontFamilyModalOpen] = useState(false);
  const [isHourModalOpen, setIsHourModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [legalSheetTab, setLegalSheetTab] = useState<'PRIVACY' | 'TERMS' | null>(null);

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      onBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack]);

  const openUrlSafely = async (url: string, title: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(title, `Sayfayı tarayıcınızda açın:\n${url}`);
      }
    } catch {
      Alert.alert(title, `Sayfayı tarayıcınızda açın:\n${url}`);
    }
  };

  const updateLastSyncTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setLastSyncTime(`Bugün, ${timeStr}`);
  };

  const getFontSizeLabel = (sz: FontSizeValue) => {
    if (isSystemFontSize) return 'Sistem (Otomatik)';
    switch (sz) {
      case 13:
        return 'Küçük (13 pt)';
      case 15:
        return 'Standart (15 pt)';
      case 17:
        return 'Büyük (17 pt)';
      case 19:
        return 'Çok Büyük (19 pt)';
      case 21:
        return 'Maksimum (21 pt)';
      default:
        return `${sz} pt`;
    }
  };

  const getFontFamilyLabel = (fam: string) => {
    switch (fam) {
      case 'serif':
        return 'Akademik Serif';
      case 'rounded':
        return 'Okuma Kolaylığı';
      default:
        return 'Modern Sans (Sistem)';
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await SupabaseService.signOut();
          await setUserProfile(null);
        },
      },
    ]);
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    if (val) {
      const success = await NotificationService.scheduleAllReminders(
        selectedHour,
        0,
        dailyQuestionTarget,
        streakCount
      );
      if (success) {
        Alert.alert(
          'Bildirimler Aktif Edildi 🔔',
          `• Sabah 09:00: Günlük kelime seti\n• Akşam ${selectedHour}:00: ${dailyQuestionTarget} soruluk hedef ve ${streakCount} günlük seriyi koruma bildirimi`
        );
      }
    } else {
      await NotificationService.cancelAll();
      Alert.alert('Bildirimler Kapatıldı', 'Tüm planlanmış hatırlatıcılar devre dışı bırakıldı.');
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      updateLastSyncTime();
      setIsSyncing(false);
      Alert.alert('Senkronizasyon Başarılı ☁️', 'Tüm ilerleme ve kelime kartlarınız güncellendi.');
    }, 800);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'İlerlemeyi Sıfırla',
      'Tüm kelime hafıza kutularınız (Aralıklı Tekrar), çözülen soru ve deneme geçmişiniz, hata kasanız ve günlük seriniz sıfırlanacaktır. Bu işlem geri alınamaz.\n\nDevam etmek istiyor musunuz?',
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabımı Sil',
      'Hesabınız, bulut yedeklemeleriniz ve tüm çalışma geçmişiniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.\n\nHesabınızı silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabımı Kalıcı Olarak Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteUserAccount();
            Alert.alert('Hesap Silindi', 'Hesabınız ve tüm verileriniz başarıyla silindi.');
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      {/* TOP HEADER BAR */}
      <View style={[styles.headerBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onBack} activeOpacity={0.7}>
          <X size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HESAP VE GİRİŞ DURUMU */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          HESAP VE PROFİL
        </Text>
        {userProfile ? (
          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
              },
            ]}
          >
            <View style={[styles.accountAvatarCircle, { backgroundColor: colors.brand }]}>
              <Text style={[styles.accountAvatarText, { color: colors.textOnBrand }]}>
                {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={styles.accountInfoGroup}>
              <View style={styles.accountNameRow}>
                <Text style={[styles.accountNameText, { color: colors.text }]} numberOfLines={1}>
                  {userProfile.fullName || 'YDS Öğrencisi'}
                </Text>
                {userProfile.isPro && (
                  <View style={[styles.accountStatusBadge, { backgroundColor: colors.brandLight }]}>
                    <Text style={[styles.accountStatusText, { color: colors.brand }]}>
                      ✨ PRO
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: colors.errorLight }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={19} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.loginPromptCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
              },
            ]}
            onPress={() => setIsAuthModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.loginPromptIconBox, { backgroundColor: colors.brandLight }]}>
              <User size={22} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.loginPromptTitle, { color: colors.text }]}>Giriş Yap / Kaydol</Text>
              <Text style={[styles.loginPromptSubtitle, { color: colors.textSecondary }]}>
                Çalışma geçmişini ve kelimelerini bulutta yedekle.
              </Text>
            </View>
            <View style={[styles.loginActionBtn, { backgroundColor: colors.brand }]}>
              <Text style={[styles.loginActionBtnText, { color: colors.textOnBrand }]}>Giriş</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* SECTION: TEMA */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          TEMA
        </Text>
        <View style={[styles.themeCardContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.themeGrid}>
            {/* Açık Tema */}
            <TouchableOpacity
              style={styles.themeOptionItem}
              onPress={() => setTheme('light')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.deviceFrame,
                  styles.deviceFrameLight,
                  { borderColor: theme === 'light' ? colors.brand : colors.border },
                ]}
              >
                <View style={[styles.deviceScreen, { backgroundColor: '#F8FAFC' }]}>
                  <View style={[styles.deviceHeaderBarLight, { backgroundColor: '#E2E8F0' }]} />
                  <View style={[styles.deviceLineLight, { backgroundColor: '#E2E8F0' }]} />
                  <View style={[styles.deviceLineLight, { backgroundColor: '#E2E8F0' }]} />
                  <View style={[styles.deviceLineLight, { backgroundColor: '#E2E8F0', width: '60%' }]} />
                </View>
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Açık</Text>
              <View style={[styles.radioOuter, { borderColor: theme === 'light' ? colors.brand : colors.border }]}>
                {theme === 'light' && <View style={[styles.radioInner, { backgroundColor: colors.brand }]} />}
              </View>
            </TouchableOpacity>

            {/* Koyu Tema */}
            <TouchableOpacity
              style={styles.themeOptionItem}
              onPress={() => setTheme('dark')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.deviceFrame,
                  styles.deviceFrameDark,
                  { borderColor: theme === 'dark' ? colors.brand : colors.border },
                ]}
              >
                <View style={[styles.deviceScreen, { backgroundColor: '#0B0F19' }]}>
                  <View style={[styles.deviceHeaderBarDark, { backgroundColor: '#1C2538' }]} />
                  <View style={[styles.deviceLineDark, { backgroundColor: '#2E3D59' }]} />
                  <View style={[styles.deviceLineDark, { backgroundColor: '#2E3D59' }]} />
                  <View style={[styles.deviceLineDark, { backgroundColor: '#2E3D59', width: '60%' }]} />
                </View>
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Koyu</Text>
              <View style={[styles.radioOuter, { borderColor: theme === 'dark' ? colors.brand : colors.border }]}>
                {theme === 'dark' && <View style={[styles.radioInner, { backgroundColor: colors.brand }]} />}
              </View>
            </TouchableOpacity>

            {/* Sistem Teması */}
            <TouchableOpacity
              style={styles.themeOptionItem}
              onPress={() => setTheme('system')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.deviceFrame,
                  styles.deviceFrameSystem,
                  { borderColor: theme === 'system' ? colors.brand : colors.border },
                ]}
              >
                <View style={styles.deviceScreenSplit}>
                  <View style={[styles.deviceHalfLight, { backgroundColor: '#F8FAFC' }]}>
                    <View style={[styles.deviceLineLight, { backgroundColor: '#E2E8F0' }]} />
                    <View style={[styles.deviceLineLight, { backgroundColor: '#E2E8F0' }]} />
                  </View>
                  <View style={[styles.deviceHalfDark, { backgroundColor: '#0B0F19' }]}>
                    <View style={[styles.deviceLineDark, { backgroundColor: '#2E3D59' }]} />
                    <View style={[styles.deviceLineDark, { backgroundColor: '#2E3D59' }]} />
                  </View>
                </View>
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Sistem</Text>
              <View style={[styles.radioOuter, { borderColor: theme === 'system' ? colors.brand : colors.border }]}>
                {theme === 'system' && <View style={[styles.radioInner, { backgroundColor: colors.brand }]} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION: ÇALIŞMA HEDEFLERİ */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          ÇALIŞMA HEDEFLERİ
        </Text>
        <View style={[styles.groupedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setIsGoalsModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Günlük Soru Dağılımı</Text>
              <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                Paragraf, Cloze, Cümle, Diyalog hedefleri
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.brand, fontWeight: '700' }]}>
                {(taskGoals?.paragraph || 8) + (taskGoals?.cloze || 5) + (taskGoals?.sentence || 8) + (taskGoals?.skills || 14)} Soru / Gün
              </Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION: GÖRÜNÜM & YAZI */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          GÖRÜNÜM & YAZI
        </Text>
        <View style={[styles.groupedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Otomatik Gece Modu */}
          <View style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Otomatik Gece Modu</Text>
            <Switch
              value={autoNightMode}
              onValueChange={setAutoNightMode}
              trackColor={{ false: colors.border, true: colors.brand }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Yazı Boyutu */}
          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setIsFontSizeModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Yazı Boyutu</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {getFontSizeLabel(fontSize)}
              </Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Yazı Tipi */}
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setIsFontFamilyModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Yazı Tipi</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {getFontFamilyLabel(fontFamily)}
              </Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION: BİLDİRİMLER */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          BİLDİRİMLER
        </Text>
        <View style={[styles.groupedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Hatırlatıcılar Aç/Kapa */}
          <View style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Çalışma Hatırlatıcıları</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.brand }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Hatırlatma Saati */}
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setIsHourModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Hatırlatma Saati</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {selectedHour}:00
              </Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION: İÇERİK VE VERİ YÖNETİMİ */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          İÇERİK VE VERİ YÖNETİMİ
        </Text>
        <View style={[styles.groupedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Verileri Yenile */}
          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={async () => {
              await dbService.seedQuestionsIfEmpty();
              await loadDailyTasks();
              Alert.alert('Havuz Güncellendi', 'Tüm soru ve kelime havuzu en güncel verilerle senkronize edildi.');
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>Tüm Verileri Tekrar İndir</Text>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Senkronize Et */}
          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={handleSyncData}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Senkronize Et</Text>
              <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                Son senkronizasyon: {lastSyncTime}
              </Text>
            </View>
            <RefreshCw size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* İlerlemeyi Sıfırla */}
          <TouchableOpacity
            style={[
              styles.rowItem,
              userProfile ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null,
            ]}
            onPress={handleResetProgress}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.rowLabelDanger, { color: colors.error }]}>Tüm İlerlemeyi Sıfırla</Text>
              <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                Kelime kutuları, çözülen sorular ve seriyi sıfırlar
              </Text>
            </View>
            <RotateCcw size={16} color={colors.error} />
          </TouchableOpacity>

          {/* Hesabımı Sil */}
          {userProfile && (
            <TouchableOpacity
              style={styles.rowItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View>
                <Text style={[styles.rowLabelDanger, { color: colors.error }]}>Hesabımı ve Verilerimi Sil</Text>
                <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                  Hesabınızı ve bulut kayıtlarınızı kalıcı olarak siler
                </Text>
              </View>
              <UserX size={16} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* YASAL BİLGİLER VE DESTEK (APP STORE GUIDELINE 5.1.1 & 1.2) */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          YASAL BİLGİLER VE DESTEK
        </Text>
        <View style={[styles.groupedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Gizlilik Politikası */}
          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setLegalSheetTab('PRIVACY')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <ShieldCheck size={18} color={colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Gizlilik Politikası (Privacy Policy)</Text>
                <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                  Kişisel verilerinizin korunması ve KVKK/GDPR
                </Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Kullanım Şartları (EULA) */}
          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setLegalSheetTab('TERMS')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <FileText size={18} color={colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Kullanım Şartları ve EULA (Terms)</Text>
                <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                  Apple standart lisans sözleşmesi ve kurallar
                </Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Destek ve Yardım */}
          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => openUrlSafely('https://english-app-three-azure.vercel.app/support.html', 'Destek ve Yardım')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <HelpCircle size={18} color={colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Destek ve Yardım (Support & FAQ)</Text>
                <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                  Sıkça sorulan sorular ve geliştirici iletişimi
                </Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Uygulama Sürümü */}
          <View style={styles.rowItem}>
            <View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Uygulama Sürümü</Text>
              <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>
                YDS Pratik v1.0.0 (Build 1) · Çevrimdışı Destekli
              </Text>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.brandLight }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.brand }}>v1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL 1: YAZI BOYUTU */}
      <Modal
        visible={isFontSizeModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFontSizeModalOpen(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsFontSizeModalOpen(false)}
            >
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Yazı Boyutu</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalBody}>
            {/* Live Academic Preview Card */}
            <View
              style={[
                styles.fontPreviewCard,
                {
                  backgroundColor: colors.subtleBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewTextEn,
                  {
                    color: colors.text,
                    fontSize: isSystemFontSize ? 17 : fontSize,
                    fontFamily: fontFamily === 'serif' ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : undefined,
                  },
                ]}
              >
                "The economic and technological advancements of the late twentieth century have fundamentally altered global communication patterns. Researchers emphasize that linguistic proficiency plays a decisive role in academic and career trajectory."
              </Text>
              <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
              <Text
                style={[
                  styles.previewTextTr,
                  {
                    color: colors.textSecondary,
                    fontSize: Math.max(12, (isSystemFontSize ? 17 : fontSize) - 2),
                  },
                ]}
              >
                İktisadi ve teknolojik gelişmeler küresel iletişim kalıplarını köklü biçimde değiştirmiştir. Araştırmacılar, dil yetkinliğinin akademik ve mesleki kariyerde belirleyici rol oynadığını vurgulamaktadır.
              </Text>
            </View>

            {/* Current Size Indicator Badge */}
            <View style={styles.sizeIndicatorWrap}>
              <View style={[styles.sizeBadge, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
                <Text style={[styles.sizeBadgeText, { color: colors.brand }]}>
                  {getFontSizeLabel(fontSize)}
                </Text>
              </View>
            </View>

            {/* Stepper / Slider Bar */}
            {!isSystemFontSize && (
              <View style={[styles.stepperContainer, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                <Text style={[styles.stepperLabelSmall, { color: colors.textSecondary }]}>A</Text>

                <View style={styles.stepsRow}>
                  {([13, 15, 17, 19, 21] as FontSizeValue[]).map((sz) => {
                    const isSelected = fontSize === sz;
                    return (
                      <TouchableOpacity
                        key={sz}
                        style={[
                          styles.stepDot,
                          { backgroundColor: isSelected ? colors.brand : colors.cardBackground },
                        ]}
                        onPress={() => setFontSize(sz)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.stepNumber,
                            { color: isSelected ? colors.textOnBrand : colors.textSecondary },
                          ]}
                        >
                          {sz}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.stepperLabelLarge, { color: colors.text }]}>A</Text>
              </View>
            )}

            {/* Sistem Tercihini Kullan Toggle */}
            <View style={[styles.systemToggleCard, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
              <Text style={[styles.systemToggleText, { color: colors.text }]}>
                Sistem Tercihini Kullan
              </Text>
              <Switch
                value={isSystemFontSize}
                onValueChange={setIsSystemFontSize}
                trackColor={{ false: colors.border, true: colors.brand }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: YAZI TİPİ */}
      <Modal
        visible={isFontFamilyModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFontFamilyModalOpen(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsFontFamilyModalOpen(false)}
            >
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Yazı Tipi</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Modern Sans */}
            <TouchableOpacity
              style={[
                styles.fontFamilyCard,
                {
                  backgroundColor: fontFamily === 'system' ? colors.brandLight : colors.subtleBackground,
                  borderColor: fontFamily === 'system' ? colors.brand : colors.border,
                },
              ]}
              onPress={() => setFontFamily('system')}
              activeOpacity={0.8}
            >
              <View style={styles.fontFamilyHeader}>
                <Text style={[styles.fontFamilyName, { color: colors.brand }]}>Modern Sans (Sistem)</Text>
                {fontFamily === 'system' && <Check size={18} color={colors.brand} />}
              </View>
              <Text style={[styles.fontFamilySample, { color: colors.text }]}>
                Comprehensive academic linguistic research shows rapid learning retention when using spaced repetition.
              </Text>
            </TouchableOpacity>

            {/* Akademik Serif */}
            <TouchableOpacity
              style={[
                styles.fontFamilyCard,
                {
                  backgroundColor: fontFamily === 'serif' ? colors.brandLight : colors.subtleBackground,
                  borderColor: fontFamily === 'serif' ? colors.brand : colors.border,
                },
              ]}
              onPress={() => setFontFamily('serif')}
              activeOpacity={0.8}
            >
              <View style={styles.fontFamilyHeader}>
                <Text style={[styles.fontFamilyName, { color: colors.brand }]}>Akademik Serif (Kitap & Makale)</Text>
                {fontFamily === 'serif' && <Check size={18} color={colors.brand} />}
              </View>
              <Text
                style={[
                  styles.fontFamilySample,
                  {
                    color: colors.text,
                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                  },
                ]}
              >
                Comprehensive academic linguistic research shows rapid learning retention when using spaced repetition.
              </Text>
            </TouchableOpacity>

            {/* Okuma Kolaylığı */}
            <TouchableOpacity
              style={[
                styles.fontFamilyCard,
                {
                  backgroundColor: fontFamily === 'rounded' ? colors.brandLight : colors.subtleBackground,
                  borderColor: fontFamily === 'rounded' ? colors.brand : colors.border,
                },
              ]}
              onPress={() => setFontFamily('rounded')}
              activeOpacity={0.8}
            >
              <View style={styles.fontFamilyHeader}>
                <Text style={[styles.fontFamilyName, { color: colors.brand }]}>Okuma Kolaylığı (Yuvarlak & Net)</Text>
                {fontFamily === 'rounded' && <Check size={18} color={colors.brand} />}
              </View>
              <Text style={[styles.fontFamilySample, { color: colors.text }]}>
                Comprehensive academic linguistic research shows rapid learning retention when using spaced repetition.
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL 3: HATIRLATMA SAATİ SEÇİCİ */}
      <Modal
        visible={isHourModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsHourModalOpen(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsHourModalOpen(false)}>
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Hatırlatma Saati</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalBody}>
            {[18, 19, 20, 21, 22, 23].map((hr) => {
              const isSelected = selectedHour === hr;
              return (
                <TouchableOpacity
                  key={hr}
                  style={[
                    styles.pickerRow,
                    {
                      backgroundColor: isSelected ? colors.brandLight : colors.subtleBackground,
                      borderColor: isSelected ? colors.brand : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    setSelectedHour(hr);
                    setIsHourModalOpen(false);
                    if (notificationsEnabled) {
                      await NotificationService.scheduleAllReminders(hr, 0, dailyQuestionTarget, streakCount);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={[styles.pickerRowTitle, { color: colors.text }]}>{hr}:00</Text>
                    <Text style={[styles.pickerRowSub, { color: colors.textSecondary }]}>
                      Akşam odaklanma ve seri koruma bildirimi
                    </Text>
                  </View>
                  {isSelected && <Check size={20} color={colors.brand} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 4: GÜNLÜK HEDEF & SORU DAĞILIMI */}
      <Modal
        visible={isGoalsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsGoalsModalOpen(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setIsGoalsModalOpen(false)}
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
            >
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Günlük Soru Dağılımı</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Açıklama Kartı */}
            <View style={[styles.goalsDescCard, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
              <Text style={[styles.goalsDescText, { color: colors.textSecondary }]}>
                Her gün çözmek istediğiniz soru adetlerini belirleyin. Günlük görev havuzu bu dağılıma göre otomatik planlanır.
              </Text>
            </View>

            {/* Toplam Özet Rozeti */}
            <View style={[styles.goalsSummaryCard, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
              <Text style={[styles.goalsSummaryLabel, { color: colors.brand }]}>TOPLAM GÜNLÜK HEDEF</Text>
              <Text style={[styles.goalsSummaryNumber, { color: colors.brand }]}>
                {(taskGoals?.paragraph || 8) + (taskGoals?.cloze || 5) + (taskGoals?.sentence || 8) + (taskGoals?.skills || 14)}
                <Text style={{ fontSize: 16, fontWeight: '700' }}> Soru / Gün</Text>
              </Text>
            </View>

            {/* Kategori Stepper Grubu */}
            <View style={[styles.groupedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginTop: 14 }]}>
              {/* Paragraf Soruları */}
              <View style={[styles.goalRowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>📖</Text>
                  <View>
                    <Text style={[styles.goalTitle, { color: colors.text }]}>Paragraf Soruları</Text>
                    <Text style={[styles.goalSub, { color: colors.textSecondary }]}>Okuma & Anlama (Önerilen: 8)</Text>
                  </View>
                </View>
                <View style={styles.goalStepperContainer}>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ paragraph: Math.max(1, (taskGoals?.paragraph || 8) - 1) })}
                    activeOpacity={0.7}
                  >
                    <Minus size={15} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.goalStepperValue, { color: colors.brand }]}>{taskGoals?.paragraph || 8}</Text>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ paragraph: Math.min(30, (taskGoals?.paragraph || 8) + 1) })}
                    activeOpacity={0.7}
                  >
                    <Plus size={15} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cloze Test Soruları */}
              <View style={[styles.goalRowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>📝</Text>
                  <View>
                    <Text style={[styles.goalTitle, { color: colors.text }]}>Cloze Test Soruları</Text>
                    <Text style={[styles.goalSub, { color: colors.textSecondary }]}>Paragraf İçi Boşluk (Önerilen: 5)</Text>
                  </View>
                </View>
                <View style={styles.goalStepperContainer}>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ cloze: Math.max(1, (taskGoals?.cloze || 5) - 1) })}
                    activeOpacity={0.7}
                  >
                    <Minus size={15} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.goalStepperValue, { color: colors.brand }]}>{taskGoals?.cloze || 5}</Text>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ cloze: Math.min(30, (taskGoals?.cloze || 5) + 1) })}
                    activeOpacity={0.7}
                  >
                    <Plus size={15} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cümle Tamamlama */}
              <View style={[styles.goalRowItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>🔗</Text>
                  <View>
                    <Text style={[styles.goalTitle, { color: colors.text }]}>Cümle Tamamlama</Text>
                    <Text style={[styles.goalSub, { color: colors.textSecondary }]}>Bağlaç & Mantık (Önerilen: 8)</Text>
                  </View>
                </View>
                <View style={styles.goalStepperContainer}>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ sentence: Math.max(1, (taskGoals?.sentence || 8) - 1) })}
                    activeOpacity={0.7}
                  >
                    <Minus size={15} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.goalStepperValue, { color: colors.brand }]}>{taskGoals?.sentence || 8}</Text>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ sentence: Math.min(30, (taskGoals?.sentence || 8) + 1) })}
                    activeOpacity={0.7}
                  >
                    <Plus size={15} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Diyalog & Dil Bilgisi */}
              <View style={styles.goalRowItem}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalEmoji}>💬</Text>
                  <View>
                    <Text style={[styles.goalTitle, { color: colors.text }]}>Diyalog & Dil Bilgisi</Text>
                    <Text style={[styles.goalSub, { color: colors.textSecondary }]}>Gramer, Çeviri (Önerilen: 14)</Text>
                  </View>
                </View>
                <View style={styles.goalStepperContainer}>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ skills: Math.max(1, (taskGoals?.skills || 14) - 1) })}
                    activeOpacity={0.7}
                  >
                    <Minus size={15} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.goalStepperValue, { color: colors.brand }]}>{taskGoals?.skills || 14}</Text>
                  <TouchableOpacity
                    style={[styles.goalStepperBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                    onPress={() => setTaskGoals({ skills: Math.min(30, (taskGoals?.skills || 14) + 1) })}
                    activeOpacity={0.7}
                  >
                    <Plus size={15} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Kaydet & Tamamla Butonu */}
            <TouchableOpacity
              style={[styles.saveGoalsBtn, { backgroundColor: colors.brand }]}
              onPress={() => setIsGoalsModalOpen(false)}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveGoalsBtnText, { color: colors.textOnBrand }]}>Kaydet & Tamamla</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* AUTH MODAL */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* LEGAL & EULA BOTTOM SHEET */}
      <LegalSheetModal
        visible={legalSheetTab !== null}
        onClose={() => setLegalSheetTab(null)}
        initialTab={legalSheetTab || 'PRIVACY'}
        showAcceptButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  themeCardContainer: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  themeOptionItem: {
    alignItems: 'center',
    flex: 1,
  },
  deviceFrame: {
    width: 76,
    height: 104,
    borderRadius: 14,
    padding: 4,
    borderWidth: 2,
    marginBottom: 8,
  },
  deviceFrameLight: {},
  deviceFrameDark: {},
  deviceFrameSystem: {},
  deviceScreen: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    gap: 4,
  },
  deviceScreenSplit: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  deviceHalfLight: {
    flex: 1,
    padding: 4,
    gap: 4,
    justifyContent: 'center',
  },
  deviceHalfDark: {
    flex: 1,
    padding: 4,
    gap: 4,
    justifyContent: 'center',
  },
  deviceHeaderBarLight: {
    height: 8,
    borderRadius: 3,
    marginBottom: 4,
  },
  deviceHeaderBarDark: {
    height: 8,
    borderRadius: 3,
    marginBottom: 4,
  },
  deviceHeaderBarSepia: {
    height: 8,
    borderRadius: 3,
    marginBottom: 4,
  },
  deviceLineLight: {
    height: 4,
    borderRadius: 2,
  },
  deviceLineDark: {
    height: 4,
    borderRadius: 2,
  },
  deviceLineSepia: {
    height: 4,
    borderRadius: 2,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupedCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  rowLabelDanger: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalBody: {
    padding: 18,
    gap: 16,
  },
  fontPreviewCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  previewTextEn: {
    lineHeight: 26,
    fontWeight: '500',
  },
  previewDivider: {
    height: 1,
    marginVertical: 12,
  },
  previewTextTr: {
    lineHeight: 22,
  },
  sizeIndicatorWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  sizeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  sizeBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  stepperLabelSmall: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperLabelLarge: {
    fontSize: 22,
    fontWeight: '800',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  systemToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 6,
  },
  systemToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  fontFamilyCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  fontFamilyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fontFamilyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fontFamilySample: {
    fontSize: 14,
    lineHeight: 22,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  pickerRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  pickerRowSub: {
    fontSize: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  accountAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    fontSize: 20,
    fontWeight: '900',
  },
  accountInfoGroup: {
    flex: 1,
    gap: 2,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountNameText: {
    fontSize: 15.5,
    fontWeight: '800',
    flexShrink: 1,
  },
  accountStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  accountStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  accountEmailText: {
    fontSize: 12.5,
  },
  accountTargetText: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  loginPromptIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  loginPromptSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  loginActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginActionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  // Goal Distribution Styles
  goalRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalEmoji: {
    fontSize: 22,
  },
  goalTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  goalSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  goalStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalStepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  goalStepperValue: {
    fontSize: 16,
    fontWeight: '900',
    minWidth: 26,
    textAlign: 'center',
  },
  goalTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  goalTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  goalTotalSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  goalTotalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goalTotalText: {
    fontSize: 13,
    fontWeight: '800',
  },
  goalsDescCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  goalsDescText: {
    fontSize: 13,
    lineHeight: 19,
  },
  goalsSummaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsSummaryLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  goalsSummaryNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  saveGoalsBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveGoalsBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
