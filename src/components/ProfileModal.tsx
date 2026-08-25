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
  Key,
  Save,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { SupabaseService } from '../services/SupabaseService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProfileModal: React.FC<Props> = ({ visible, onClose, onOpenAuth }) => {
  const { userProfile, streakCount, boxSummary, setUserProfile } = useLearningStore();

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
    setUserProfile(null);
    onClose();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı ve tüm çalışma verilerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            await SupabaseService.deleteAccount();
            setUserProfile(null);
            onClose();
            Alert.alert('Hesap Silindi', 'Hesabınız başarıyla silindi.');
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <User size={20} color="#2563EB" />
              <Text style={styles.title}>Öğrenci Profili & Ayarlar</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* User Info Card */}
            {userProfile ? (
              <View style={styles.userCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userProfile.fullName}</Text>
                  <Text style={styles.userEmail}>{userProfile.email}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.targetBadge}>
                      <Award size={12} color="#2563EB" />
                      <Text style={styles.targetBadgeText}>Hedef: {userProfile.targetScore}+</Text>
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
              <View style={styles.loginPromptCard}>
                <Text style={styles.loginPromptTitle}>Giriş Yapmadınız</Text>
                <Text style={styles.loginPromptSubtitle}>
                  Verilerinizi bulutta senkronize etmek için ücretsiz hesap oluşturun veya giriş yapın.
                </Text>
                <TouchableOpacity
                  style={styles.openAuthBtn}
                  onPress={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.openAuthBtnText}>Giriş Yap / Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Performance Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Flame size={18} color="#EA580C" />
                <Text style={styles.statVal}>{streakCount} Gün</Text>
                <Text style={styles.statLbl}>Çalışma Serisi</Text>
              </View>
              <View style={styles.statBox}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.statVal}>{boxSummary.learnedWords}</Text>
                <Text style={styles.statLbl}>Öğrenilen Kelime</Text>
              </View>
              <View style={styles.statBox}>
                <Database size={18} color="#2563EB" />
                <Text style={styles.statVal}>{boxSummary.totalWords}</Text>
                <Text style={styles.statLbl}>Toplam Havuz</Text>
              </View>
            </View>

            {/* Supabase Cloud Connection Settings */}
            <View style={styles.settingsSection}>
              <View style={styles.sectionHeader}>
                <Cloud size={16} color="#7C3AED" />
                <Text style={styles.sectionTitle}>Supabase Bulut Bağlantısı</Text>
              </View>
              <Text style={styles.sectionDesc}>
                Supabase URL ve Anon Key bilgilerinizi girerek verilerinizi PostgreSQL bulutuna bağlayabilirsiniz.
              </Text>

              <Text style={styles.inputLabel}>Supabase Project URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://xxxxxxxx.supabase.co"
                value={supabaseUrl}
                onChangeText={setSupabaseUrl}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Supabase Anon Key</Text>
              <TextInput
                style={styles.input}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseKey}
                onChangeText={setSupabaseKey}
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.saveKeysBtn} onPress={handleSaveKeys} activeOpacity={0.8}>
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveKeysBtnText}>
                  {isSaved ? 'Kaydedildi ✓' : 'Anahtarları Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* App Store & Account Actions */}
            {userProfile && (
              <View style={styles.accountActionsSection}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                  <LogOut size={16} color="#475569" />
                  <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteAccountBtn}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={styles.deleteAccountBtnText}>Hesabımı ve Verilerimi Sil</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* App Info Footer */}
            <View style={styles.appInfoFooter}>
              <Text style={styles.appInfoText}>YDS Master v1.0.0 (Build 1)</Text>
              <Text style={styles.appInfoSubtext}>App Store & Google Play Store Uyumlu Sürüm</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E2E8F0',
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
    color: '#0F172A',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  guestBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guestBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  loginPromptCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  loginPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  loginPromptSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  openAuthBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openAuthBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  statLbl: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  saveKeysBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  saveKeysBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
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
    color: '#DC2626',
  },
  appInfoFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  appInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  appInfoSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
