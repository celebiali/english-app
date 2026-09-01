import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {
  User,
  LogOut,
  Trash2,
  Cloud,
  Database,
  Award,
  Flame,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { SupabaseService } from '../services/SupabaseService';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProfileModal: React.FC<Props> = ({ visible, onClose, onOpenAuth }) => {
  const { userProfile, streakCount, boxSummary, setUserProfile, deleteUserAccount } = useLearningStore();
  const { colors } = useThemeStore();

  const [supabaseUrl, setSupabaseUrl] = useState(SupabaseService.getCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState(SupabaseService.getCredentials().key);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKeys = () => {
    SupabaseService.configure(supabaseUrl, supabaseKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    Alert.alert('Başarılı', 'Supabase bağlantı anahtarları güncellendi.');
  };

  const handleLogout = async () => {
    await SupabaseService.signOut();
    await setUserProfile(null);
    onClose();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı ve tüm çalışma verilerinizi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteUserAccount();
            onClose();
            Alert.alert('Hesap Silindi', 'Hesabınız ve tüm verileriniz başarıyla silindi.');
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <User size={20} color={colors.brand} />
              <Text style={[styles.title, { color: colors.text }]}>Öğrenci Profili & Ayarlar</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* User Info Card */}
            {userProfile ? (
              <View style={[styles.userCard, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.brand }]}>
                  <Text style={[styles.avatarLetter, { color: colors.textOnBrand }]}>
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{userProfile.fullName}</Text>
                  {userProfile.email && !userProfile.email.includes('privaterelay') && (
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userProfile.email}</Text>
                  )}
                  <View style={styles.badgeRow}>
                    <View style={[styles.targetBadge, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
                      <Award size={12} color={colors.brand} />
                      <Text style={[styles.targetBadgeText, { color: colors.brand }]}>Hedef: {userProfile.targetScore}+</Text>
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
              <View style={[styles.loginPromptCard, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
                <Text style={[styles.loginPromptTitle, { color: colors.brand }]}>Giriş Yapmadınız</Text>
                <Text style={[styles.loginPromptSubtitle, { color: colors.textSecondary }]}>
                  Verilerinizi bulutta senkronize etmek için ücretsiz hesap oluşturun veya giriş yapın.
                </Text>
                <TouchableOpacity
                  style={[styles.openAuthBtn, { backgroundColor: colors.brand }]}
                  onPress={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.openAuthBtnText, { color: colors.textOnBrand }]}>Giriş Yap / Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Performance Stats Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                <Flame size={18} color={colors.accentWarm} />
                <Text style={[styles.statVal, { color: colors.text }]}>{streakCount} Gün</Text>
                <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Çalışma Serisi</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                <CheckCircle2 size={18} color={colors.success} />
                <Text style={[styles.statVal, { color: colors.text }]}>{boxSummary.learnedWords}</Text>
                <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Öğrenilen Kelime</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                <Database size={18} color={colors.brand} />
                <Text style={[styles.statVal, { color: colors.text }]}>{boxSummary.totalWords}</Text>
                <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Toplam Havuz</Text>
              </View>
            </View>

            {/* Supabase Cloud Connection Settings */}
            <View style={[styles.settingsSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Cloud size={16} color={colors.brand} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Supabase Bulut Bağlantısı</Text>
              </View>
              <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                Supabase URL ve Anon Key bilgilerinizi girerek verilerinizi PostgreSQL bulutuna bağlayabilirsiniz.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Supabase Project URL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.subtleBackground, borderColor: colors.border, color: colors.text }]}
                placeholder="https://xxxxxxxx.supabase.co"
                placeholderTextColor={colors.textSecondary}
                value={supabaseUrl}
                onChangeText={setSupabaseUrl}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Supabase Anon Key</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.subtleBackground, borderColor: colors.border, color: colors.text }]}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                placeholderTextColor={colors.textSecondary}
                value={supabaseKey}
                onChangeText={setSupabaseKey}
                autoCapitalize="none"
              />

              <TouchableOpacity style={[styles.saveKeysBtn, { backgroundColor: colors.brand }]} onPress={handleSaveKeys} activeOpacity={0.8}>
                <Save size={16} color={colors.textOnBrand} />
                <Text style={[styles.saveKeysBtnText, { color: colors.textOnBrand }]}>
                  {isSaved ? 'Kaydedildi ✓' : 'Anahtarları Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* App Store & Account Actions */}
            {userProfile && (
              <View style={styles.accountActionsSection}>
                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.subtleBackground }]} onPress={handleLogout} activeOpacity={0.7}>
                  <LogOut size={16} color={colors.textSecondary} />
                  <Text style={[styles.logoutBtnText, { color: colors.textSecondary }]}>Çıkış Yap</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteAccountBtn}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color={colors.error} />
                  <Text style={[styles.deleteAccountBtnText, { color: colors.error }]}>Hesabımı ve Verilerimi Sil</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* App Info Footer */}
            <View style={styles.appInfoFooter}>
              <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>YDS Pratik v1.0.0 (Build 1)</Text>
              <Text style={[styles.appInfoSubtext, { color: colors.textMuted }]}>App Store & Google Play Store Uyumlu Sürüm</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guestBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loginPromptCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  loginPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  loginPromptSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  openAuthBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openAuthBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  statLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  settingsSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  saveKeysBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  saveKeysBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accountActionsSection: {
    gap: 8,
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  deleteAccountBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appInfoFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  appInfoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  appInfoSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
});
