import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  Target,
  ArrowRight,
  UserCheck,
  X,
} from 'lucide-react-native';
import { SupabaseService } from '../services/SupabaseService';
import { useLearningStore } from '../store/useLearningStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ visible, onClose }) => {
  const { setUserProfile } = useLearningStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetScore, setTargetScore] = useState(80);
  const [isLoading, setIsLoading] = useState(false);

  const targetScoreOptions = [60, 70, 80, 90];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    const res = await SupabaseService.signIn(email, password);
    setIsLoading(false);

    if (res.user) {
      setUserProfile(res.user);
      onClose();
      Alert.alert('Giriş Başarılı', `Hoş geldiniz, ${res.user.fullName}!`);
    } else {
      Alert.alert('Giriş Hatası', res.error || 'Giriş yapılamadı.');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Geçersiz Şifre', 'Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    const res = await SupabaseService.signUp(email, password, fullName, targetScore);
    setIsLoading(false);

    if (res.user) {
      setUserProfile(res.user);
      onClose();
      Alert.alert('Kayıt Başarılı', `Tebrikler ${res.user.fullName}, üyeliğiniz oluşturuldu!`);
    } else {
      Alert.alert('Kayıt Hatası', res.error || 'Kayıt yapılamadı.');
    }
  };

  const handleGuestLogin = () => {
    const guest = SupabaseService.signInAsGuest();
    setUserProfile(guest);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <GraduationCap size={22} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.title}>YDS Master</Text>
                <Text style={styles.subtitle}>
                  {mode === 'LOGIN' ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Switch Tab */}
          <View style={styles.tabSwitchRow}>
            <TouchableOpacity
              style={[styles.switchTab, mode === 'LOGIN' && styles.switchTabActive]}
              onPress={() => setMode('LOGIN')}
            >
              <Text style={[styles.switchTabText, mode === 'LOGIN' && styles.switchTabTextActive]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, mode === 'REGISTER' && styles.switchTabActive]}
              onPress={() => setMode('REGISTER')}
            >
              <Text style={[styles.switchTabText, mode === 'REGISTER' && styles.switchTabTextActive]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Full Name for Register */}
            {mode === 'REGISTER' && (
              <>
                <Text style={styles.label}>Adınız Soyadınız</Text>
                <View style={styles.inputContainer}>
                  <User size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Ali Rıza Çelebi"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </>
            )}

            {/* Email */}
            <Text style={styles.label}>E-Posta Adresi</Text>
            <View style={styles.inputContainer}>
              <Mail size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="ornek@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <Lock size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="En az 6 karakter"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Target Score for Register */}
            {mode === 'REGISTER' && (
              <>
                <Text style={styles.label}>Hedef YDS Puanınız</Text>
                <View style={styles.targetScoreRow}>
                  {targetScoreOptions.map((sc) => (
                    <TouchableOpacity
                      key={sc}
                      style={[
                        styles.targetScoreBtn,
                        targetScore === sc && styles.targetScoreBtnActive,
                      ]}
                      onPress={() => setTargetScore(sc)}
                    >
                      <Text
                        style={[
                          styles.targetScoreText,
                          targetScore === sc && styles.targetScoreTextActive,
                        ]}
                      >
                        {sc}+ Puan
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={mode === 'LOGIN' ? handleLogin : handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>
                  {mode === 'LOGIN' ? 'Giriş Yap' : 'Kayıt Ol ve Başla'}
                </Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Guest Continue Button (App Store Compliant) */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuestLogin}
            activeOpacity={0.7}
          >
            <UserCheck size={16} color="#64748B" />
            <Text style={styles.guestBtnText}>Misafir Olarak Devam Et (Kayıtsız)</Text>
          </TouchableOpacity>
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
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  tabSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  switchTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  switchTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  scroll: {
    paddingBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  targetScoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  targetScoreBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  targetScoreBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  targetScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  targetScoreTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  guestBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
