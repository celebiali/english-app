import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
  ArrowRight,
  UserCheck,
} from 'lucide-react-native';
import { SupabaseService } from '../services/SupabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { SmoothBottomSheet } from './SmoothBottomSheet';

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
      Alert.alert('Giriş Başarılı 🎉', `Hoş geldiniz, ${res.user.fullName}!`);
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
      Alert.alert('Kayıt Başarılı 🎉', `Tebrikler ${res.user.fullName}, üyeliğiniz oluşturuldu!`);
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
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="92%">
      <View style={styles.content}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <GraduationCap size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.appTitle}>YDS Master</Text>
              <Text style={styles.appSubtitle}>Yapay Zeka Destekli YDS Hazırlık</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher: Giriş Yap | Kayıt Ol */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'LOGIN' && styles.activeTabBtn]}
            onPress={() => setMode('LOGIN')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, mode === 'LOGIN' && styles.activeTabBtnText]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'REGISTER' && styles.activeTabBtn]}
            onPress={() => setMode('REGISTER')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, mode === 'REGISTER' && styles.activeTabBtnText]}>
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Register: Full Name Input */}
          {mode === 'REGISTER' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Ali Rıza Çelebi"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-Posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Register: Target Score Selection */}
          {mode === 'REGISTER' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🎯 YDS Hedef Puanınız</Text>
              <View style={styles.scoreOptionsRow}>
                {targetScoreOptions.map((sc) => (
                  <TouchableOpacity
                    key={sc}
                    style={[
                      styles.scoreOptionBtn,
                      targetScore === sc && styles.activeScoreOptionBtn,
                    ]}
                    onPress={() => setTargetScore(sc)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.scoreOptionText,
                        targetScore === sc && styles.activeScoreOptionText,
                      ]}
                    >
                      {sc}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Main Action Button */}
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={mode === 'LOGIN' ? handleLogin : handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryActionBtnText}>
                  {mode === 'LOGIN' ? 'Giriş Yap' : 'Hesabımı Oluştur'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* APPLE STORE MANDATORY GUEST LOGIN */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuestLogin}
            activeOpacity={0.8}
          >
            <UserCheck size={16} color="#4F46E5" />
            <Text style={styles.guestBtnText}>Kayıt Olmadan Misafir Olarak Devam Et ➔</Text>
          </TouchableOpacity>

          {/* Privacy & Terms Note */}
          <Text style={styles.legalNote}>
            Devam ederek{' '}
            <Text
              style={styles.legalLink}
              onPress={() =>
                Alert.alert(
                  'Kullanım Şartları & Gizlilik',
                  'YDS Master uygulamasını kullanarak KVKK ve Gizlilik Politikası şartlarını kabul etmiş sayılırsınız.'
                )
              }
            >
              Kullanım Koşulları ve Gizlilik Politikası
            </Text>
            'nı kabul etmiş olursunuz.
          </Text>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  appSubtitle: {
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F4FA',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabBtnText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  scroll: {
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  scoreOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreOptionBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeScoreOptionBtn: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  scoreOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  activeScoreOptionText: {
    color: '#FFFFFF',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 10,
  },
  guestBtnText: {
    color: '#4F46E5',
    fontSize: 12.5,
    fontWeight: '800',
  },
  legalNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
  legalLink: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});
