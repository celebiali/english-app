import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react-native';
import { SupabaseService } from '../services/SupabaseService';
import { useLearningStore } from '../store/useLearningStore';

interface Props {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onSuccess }) => {
  const { setUserProfile } = useLearningStore();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetScore, setTargetScore] = useState<number>(80);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await SupabaseService.signIn(email, password);
      if (res.user) {
        setUserProfile(res.user);
        onSuccess?.();
      } else {
        Alert.alert('Giriş Hatası', res.error || 'Giriş yapılamadı.');
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ad, e-posta ve şifrenizi eksiksiz girin.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await SupabaseService.signUp(email, password, fullName, targetScore);
      if (res.user) {
        setUserProfile(res.user);
        Alert.alert('Hoş Geldiniz!', 'Hesabınız başarıyla oluşturuldu.');
        onSuccess?.();
      } else {
        Alert.alert('Kayıt Hatası', res.error || 'Kayıt yapılamadı.');
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await SupabaseService.signInWithApple();
      if (res.user) {
        setUserProfile(res.user);
        onSuccess?.();
      } else if (res.error) {
        Alert.alert('Apple Girişi', res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await SupabaseService.signInWithGoogle();
      if (res.user) {
        setUserProfile(res.user);
        onSuccess?.();
      } else if (res.error) {
        Alert.alert('Google Girişi', res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    const guestUser = SupabaseService.signInAsGuest();
    setUserProfile(guestUser);
    onSuccess?.();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BRAND HERO HEADER */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.logoBadge}>
              <Sparkles size={28} color="#FBBF24" />
            </View>
          </View>
          <Text style={styles.appTitle}>YDS Master</Text>
          <Text style={styles.appSubtitle}>
            Akademik Sınav Hazırlığı & Spaced Repetition Kelime Motoru
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featurePillsRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🎯 80 Soruluk Denemeler</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>📖 Tureng Leitner</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🧠 AI Analiz</Text>
            </View>
          </View>
        </View>

        {/* SOCIAL SIGN IN (APPLE & GOOGLE) */}
        <View style={styles.socialAuthContainer}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={handleAppleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.appleLogoIcon}></Text>
              <Text style={styles.appleButtonText}>Apple ile Giriş Yap</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <View style={styles.googleGLogo}>
              <Text style={styles.googleGText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Google ile Devam Et</Text>
          </TouchableOpacity>
        </View>

        {/* OR DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya e-posta ile</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* TAB SELECTOR (LOGIN / REGISTER) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'LOGIN' && styles.tabBtnActive]}
            onPress={() => setAuthMode('LOGIN')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, authMode === 'LOGIN' && styles.tabBtnTextActive]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'REGISTER' && styles.tabBtnActive]}
            onPress={() => setAuthMode('REGISTER')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, authMode === 'REGISTER' && styles.tabBtnTextActive]}>
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORM INPUTS */}
        <View style={styles.formContainer}>
          {authMode === 'REGISTER' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ad Soyad</Text>
                <View style={styles.inputField}>
                  <User size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Target Score Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🎯 YDS Hedef Puanınız</Text>
                <View style={styles.scorePickerRow}>
                  {[60, 70, 80, 90].map((score) => (
                    <TouchableOpacity
                      key={score}
                      style={[
                        styles.scoreChip,
                        targetScore === score && styles.scoreChipActive,
                      ]}
                      onPress={() => setTargetScore(score)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.scoreChipText,
                          targetScore === score && styles.scoreChipTextActive,
                        ]}
                      >
                        {score}+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-Posta Adresi</Text>
            <View style={styles.inputField}>
              <Mail size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="ornek@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <View style={styles.inputField}>
              <Lock size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={authMode === 'LOGIN' ? handleEmailLogin : handleEmailRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {authMode === 'LOGIN' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* GUEST ACCESS (APPLE REVIEWER COMPLIANCE) */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.guestButtonText}>
            Kayıt Olmadan Misafir Olarak Devam Et ➔
          </Text>
        </TouchableOpacity>

        {/* FOOTER POLICIES */}
        <View style={styles.footerPolicies}>
          <ShieldCheck size={14} color="#94A3B8" />
          <Text style={styles.footerPolicyText}>
            Devam ederek{' '}
            <Text
              style={styles.policyLink}
              onPress={() =>
                Alert.alert(
                  'Gizlilik Politikası (Privacy Policy)',
                  'YDS Master kişisel verilerinizi KVKK ve GDPR kapsamında korur. Bilgileriniz 3. taraflarla asla paylaşılmaz.'
                )
              }
            >
              Gizlilik Politikası
            </Text>
            'nı ve{' '}
            <Text
              style={styles.policyLink}
              onPress={() =>
                Alert.alert(
                  'Kullanım Şartları (Terms / EULA)',
                  'Uygulamadaki tüm YDS materyalleri ve AI analizleri bireysel eğitim amaçlıdır.'
                )
              }
            >
              Kullanım Şartları
            </Text>
            'nı kabul etmiş olursunuz.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadgeContainer: {
    marginBottom: 12,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  featurePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  featurePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  socialAuthContainer: {
    gap: 10,
    marginBottom: 16,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 16,
  },
  appleLogoIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleGLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7EAF3',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F4FA',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  scorePickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  scoreChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  scoreChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  guestButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  footerPolicies: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 10,
  },
  footerPolicyText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  policyLink: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});
