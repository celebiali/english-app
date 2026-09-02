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
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from 'lucide-react-native';
import { SupabaseService } from '../services/SupabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onSuccess }) => {
  const { setUserProfile } = useLearningStore();
  const { colors } = useThemeStore();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetScore, setTargetScore] = useState<number>(80);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Geçersiz E-Posta', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await SupabaseService.signIn(email, password);
      if (res.user) {
        await setUserProfile(res.user);
        onSuccess?.();
      } else {
        Alert.alert('Giriş Başarısız', res.error || 'E-posta veya şifreniz hatalı.');
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

    if (!validateEmail(email)) {
      Alert.alert('Geçersiz E-Posta', 'Lütfen geçerli bir e-posta formatı girin.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Kısa Şifre', 'Şifreniz güvenlik nedeniyle en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await SupabaseService.signUp(email, password, fullName, targetScore);
      if (res.user) {
        await setUserProfile(res.user);
        Alert.alert('Hoş Geldiniz 🎉', `Tebrikler ${res.user.fullName}, hesabınız oluşturuldu!`);
        onSuccess?.();
      } else {
        Alert.alert('Kayıt Başarısız', res.error || 'Hesap oluşturulamadı.');
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
        await setUserProfile(res.user);
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
        await setUserProfile(res.user);
        onSuccess?.();
      } else if (res.error) {
        Alert.alert('Google Girişi', res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    const guestUser = SupabaseService.signInAsGuest();
    await setUserProfile(guestUser);
    onSuccess?.();
  };

  const handleSendPasswordReset = async () => {
    if (!forgotEmail.trim() || !validateEmail(forgotEmail)) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setIsForgotLoading(true);
    const res = await SupabaseService.resetPasswordForEmail(forgotEmail);
    setIsForgotLoading(false);

    if (res.success) {
      setIsForgotModalOpen(false);
      Alert.alert(
        'Sıfırlama Bağlantısı Gönderildi 📩',
        `${forgotEmail} adresinize şifre sıfırlama e-postası iletildi. Lütfen gelen kutunuzu kontrol edin.`
      );
      setForgotEmail('');
    } else {
      Alert.alert('Hata', res.error || 'Şifre sıfırlama e-postası gönderilemedi.');
    }
  };

  const openPrivacyPolicy = async () => {
    const url = 'https://celebiali.github.io/english-app/privacy.html';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Gizlilik Politikası', 'YDS Pratik kişisel verilerinizi KVKK ve GDPR kapsamında korur. Bilgileriniz 3. taraflarla asla paylaşılmaz.');
      }
    } catch {
      Alert.alert('Gizlilik Politikası', 'YDS Pratik kişisel verilerinizi KVKK ve GDPR kapsamında korur. Bilgileriniz 3. taraflarla asla paylaşılmaz.');
    }
  };

  const openTerms = async () => {
    const url = 'https://celebiali.github.io/english-app/terms.html';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Kullanım Şartları (EULA)', 'Uygulamadaki tüm YDS materyalleri ve testler bireysel eğitim amaçlıdır.');
      }
    } catch {
      Alert.alert('Kullanım Şartları (EULA)', 'Uygulamadaki tüm YDS materyalleri ve testler bireysel eğitim amaçlıdır.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* BRAND HERO HEADER */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadgeContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>YDS Pratik</Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            Akademik Sınav Hazırlığı & Spaced Repetition Kelime Motoru
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featurePillsRow}>
            <View style={[styles.featurePill, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
              <Text style={[styles.featurePillText, { color: colors.brand }]}>🎯 80 Soruluk Denemeler</Text>
            </View>
            <View style={[styles.featurePill, { backgroundColor: colors.brandLight }]}>
              <Text style={[styles.featurePillText, { color: colors.brand }]}>📖 Akıllı Kelime Kartları</Text>
            </View>
            <View style={[styles.featurePill, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
              <Text style={[styles.featurePillText, { color: colors.brand }]}>🧠 AI Analiz</Text>
            </View>
          </View>
        </View>

        {/* SOCIAL SIGN IN (APPLE & GOOGLE) */}
        <View style={styles.socialAuthContainer}>
          {/* Apple Sign-In Button */}
          <TouchableOpacity
            style={[styles.appleButton, { backgroundColor: colors.isDark ? '#FFFFFF' : '#000000' }]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={[styles.appleLogoIcon, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}></Text>
            <Text style={[styles.appleButtonText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>Apple ile Giriş Yap</Text>
          </TouchableOpacity>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <View style={[styles.googleGLogo, { backgroundColor: colors.brand }]}>
              <Text style={[styles.googleGText, { color: colors.textOnBrand }]}>G</Text>
            </View>
            <Text style={[styles.googleButtonText, { color: colors.text }]}>Google ile Devam Et</Text>
          </TouchableOpacity>
        </View>

        {/* OR DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>veya e-posta ile</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* TAB SELECTOR (LOGIN / REGISTER) */}
        <View style={[styles.tabContainer, { backgroundColor: colors.subtleBackground }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              authMode === 'LOGIN' && [styles.tabBtnActive, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => setAuthMode('LOGIN')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: authMode === 'LOGIN' ? colors.brand : colors.textSecondary },
                authMode === 'LOGIN' && { fontWeight: '800' },
              ]}
            >
              Giriş Yap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              authMode === 'REGISTER' && [styles.tabBtnActive, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => setAuthMode('REGISTER')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: authMode === 'REGISTER' ? colors.brand : colors.textSecondary },
                authMode === 'REGISTER' && { fontWeight: '800' },
              ]}
            >
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORM INPUTS */}
        <View style={styles.formContainer}>
          {authMode === 'REGISTER' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Ad Soyad</Text>
              <View style={[styles.inputField, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <User size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Adınız Soyadınız"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>E-Posta Adresi</Text>
            <View style={[styles.inputField, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Mail size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Field with Eye Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Şifre</Text>
              {authMode === 'LOGIN' && (
                <TouchableOpacity
                  onPress={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotPassText, { color: colors.brand }]}>Şifremi Unuttum?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.inputField, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Lock size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.textSecondary} />
                ) : (
                  <Eye size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.brand }]}
            onPress={authMode === 'LOGIN' ? handleEmailLogin : handleEmailRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textOnBrand} />
            ) : (
              <>
                <Text style={[styles.submitButtonText, { color: colors.textOnBrand }]}>
                  {authMode === 'LOGIN' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </Text>
                <ArrowRight size={18} color={colors.textOnBrand} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* GUEST ACCESS (OFFLINE & DEMO FRIENDLY) */}
        <TouchableOpacity
          style={[
            styles.guestButton,
            {
              backgroundColor: colors.subtleBackground,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              marginTop: 14,
              paddingVertical: 14,
            },
          ]}
          onPress={handleGuestContinue}
          activeOpacity={0.75}
        >
          <Text style={[styles.guestButtonText, { color: colors.text }]}>
            Giriş Yapmadan Devam Et (Misafir / Çevrimdışı) ➔
          </Text>
        </TouchableOpacity>

        {/* FOOTER POLICIES WITH REAL EXTERNAL LINKS */}
        <View style={styles.footerPolicies}>
          <ShieldCheck size={14} color={colors.textSecondary} />
          <Text style={[styles.footerPolicyText, { color: colors.textSecondary }]}>
            Devam ederek{' '}
            <Text
              style={[styles.policyLink, { color: colors.brand, textDecorationLine: 'underline' }]}
              onPress={openPrivacyPolicy}
            >
              Gizlilik Politikası
            </Text>
            'nı ve{' '}
            <Text
              style={[styles.policyLink, { color: colors.brand, textDecorationLine: 'underline' }]}
              onPress={openTerms}
            >
              Kullanım Şartları (EULA)
            </Text>
            'nı kabul etmiş olursunuz.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        visible={isForgotModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsForgotModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIconWrap, { backgroundColor: colors.brandLight }]}>
                <KeyRound size={20} color={colors.brand} />
              </View>
              <TouchableOpacity
                onPress={() => setIsForgotModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Şifremi Unuttum</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Kayıtlı e-posta adresinizi girin, size anında bir şifre sıfırlama bağlantısı gönderelim.
            </Text>

            <View style={[styles.modalInputField, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
              <Mail size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textSecondary}
                value={forgotEmail}
                onChangeText={setForgotEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: colors.brand }]}
              onPress={handleSendPasswordReset}
              disabled={isForgotLoading}
              activeOpacity={0.85}
            >
              {isForgotLoading ? (
                <ActivityIndicator color={colors.textOnBrand} />
              ) : (
                <Text style={[styles.modalActionBtnText, { color: colors.textOnBrand }]}>Sıfırlama Linki Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
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
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '700',
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
    paddingVertical: 14,
    borderRadius: 16,
  },
  appleLogoIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.4,
    paddingVertical: 13,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleGLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    fontSize: 13,
    fontWeight: '900',
  },
  googleButtonText: {
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
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  guestButtonText: {
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
    lineHeight: 16,
  },
  policyLink: {
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 12.5,
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 18,
  },
  modalInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalActionBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
});
