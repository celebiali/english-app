import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Keyboard,
  TextInput,
} from 'react-native';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  X,
  Check,
} from 'lucide-react-native';
import { SupabaseService } from '../services/SupabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { LegalSheetModal } from './LegalSheetModal';
import { AppLogo } from './AppLogo';
import { AppleIcon, GoogleIcon } from './SocialIcons';
import { FormInput } from './FormInput';

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Legal / EULA Modal State
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'PRIVACY' | 'TERMS'>('PRIVACY');

  const openLegalModal = (tab: 'PRIVACY' | 'TERMS') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

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

    if (!isTermsAccepted) {
      Alert.alert(
        'Onay Gereklidir',
        'Kayıt işlemine devam etmek için lütfen Kullanım Şartları ve Gizlilik Politikasını onaylayınız.',
        [
          { text: 'Şartları Oku', onPress: () => openLegalModal('TERMS') },
          { text: 'Tamam', style: 'cancel' },
        ]
      );
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
    const url = 'https://english-app-three-azure.vercel.app/privacy.html';
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
    const url = 'https://english-app-three-azure.vercel.app/terms.html';
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
          contentContainerStyle={[
            styles.content,
            isKeyboardVisible && { paddingBottom: 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {/* BRAND HERO HEADER */}
        <View
          style={[
            styles.heroSection,
            isKeyboardVisible && styles.heroSectionKeyboard,
          ]}
        >
          <View style={[styles.logoBadgeContainer, isKeyboardVisible && { marginBottom: 4 }]}>
            <AppLogo
              size={isKeyboardVisible ? 36 : 62}
              borderRadius={isKeyboardVisible ? 10 : 18}
            />
          </View>
          {!isKeyboardVisible && (
            <Text style={[styles.appTitle, { color: colors.text }]}>
              YDS Pratik
            </Text>
          )}
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
                {
                  color: authMode === 'LOGIN' ? colors.brand : colors.textSecondary,
                  fontWeight: '700',
                },
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
                {
                  color: authMode === 'REGISTER' ? colors.brand : colors.textSecondary,
                  fontWeight: '700',
                },
              ]}
            >
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORM INPUTS */}
        <View style={[styles.formContainer, authMode === 'REGISTER' && styles.formContainerRegister]}>
          {authMode === 'REGISTER' && (
            <FormInput
              label="Ad Soyad"
              icon={<User size={18} color={colors.textSecondary} />}
              placeholder="Adınız Soyadınız"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}

          <FormInput
            label="E-Posta Adresi"
            icon={<Mail size={18} color={colors.textSecondary} />}
            placeholder="E-posta adresinizi giriniz"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormInput
            label="Şifre"
            icon={<Lock size={18} color={colors.textSecondary} />}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            topRightElement={
              authMode === 'LOGIN' ? (
                <TouchableOpacity
                  onPress={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.forgotPassText, { color: colors.brand }]}>
                    Şifremi Unuttum?
                  </Text>
                </TouchableOpacity>
              ) : undefined
            }
            rightElement={
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
            }
          />

          {/* REGISTER CHECKBOX CONSENT (KVKK & EULA COMPLIANCE) */}
          {authMode === 'REGISTER' && (
            <View style={styles.termsConsentRow}>
              <TouchableOpacity
                style={styles.checkboxTouchable}
                onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: isTermsAccepted ? colors.brand : colors.border,
                      backgroundColor: isTermsAccepted ? colors.brand : 'transparent',
                    },
                  ]}
                >
                  {isTermsAccepted && <Check size={14} color={colors.textOnBrand} strokeWidth={3} />}
                </View>
              </TouchableOpacity>

              <Text style={[styles.termsConsentText, { color: colors.textSecondary }]}>
                <Text
                  style={[styles.termsLinkText, { color: colors.brand }]}
                  onPress={() => openLegalModal('TERMS')}
                  suppressHighlighting={false}
                >
                  Kullanım Şartları
                </Text>
                {' '}ve{' '}
                <Text
                  style={[styles.termsLinkText, { color: colors.brand }]}
                  onPress={() => openLegalModal('PRIVACY')}
                  suppressHighlighting={false}
                >
                  Gizlilik Politikası
                </Text>
                'nı okudum, onaylıyorum.
              </Text>
            </View>
          )}

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

        {/* OR DIVIDER */}
        <View style={[styles.dividerRow, authMode === 'REGISTER' && styles.dividerRowRegister]}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>veya şununla devam et</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* SOCIAL SIGN IN (APPLE & GOOGLE) AT THE BOTTOM */}
        <View style={styles.socialAuthRow}>
          {/* Apple Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.appleButton,
              { backgroundColor: colors.isDark ? '#FFFFFF' : '#000000' },
            ]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <AppleIcon size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
            <Text
              style={[
                styles.socialButtonText,
                { color: colors.isDark ? '#000000' : '#FFFFFF' },
              ]}
            >
              Apple
            </Text>
          </TouchableOpacity>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.socialButton,
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
            <GoogleIcon size={18} />
            <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
          </TouchableOpacity>
        </View>

        {/* GUEST ACCESS (OFFLINE & DEMO FRIENDLY) */}
        <TouchableOpacity
          style={[styles.guestLinkContainer, authMode === 'REGISTER' && styles.guestLinkContainerRegister]}
          onPress={handleGuestContinue}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <Text style={[styles.guestLinkText, { color: colors.textSecondary }]}>
            Daha Sonra Hesap Oluştur
          </Text>
        </TouchableOpacity>

        {/* FOOTER POLICIES WITH BOTTOM SHEET MODAL */}
        <View style={[styles.footerPolicies, authMode === 'REGISTER' && styles.footerPoliciesRegister]}>
          <ShieldCheck size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
          <Text style={[styles.footerPolicyText, { color: colors.textSecondary }]}>
            Devam ederek{' '}
            <Text
              style={[styles.policyLink, { color: colors.brand }]}
              onPress={() => openLegalModal('PRIVACY')}
              suppressHighlighting={false}
            >
              Gizlilik Politikası
            </Text>
            'nı ve{' '}
            <Text
              style={[styles.policyLink, { color: colors.brand }]}
              onPress={() => openLegalModal('TERMS')}
              suppressHighlighting={false}
            >
              Kullanım Şartları (EULA)
            </Text>
            'nı kabul etmiş olursunuz.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

      {/* LEGAL & EULA IN-APP BOTTOM SHEET MODAL */}
      <LegalSheetModal
        visible={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
        onAccept={() => setIsTermsAccepted(true)}
        showAcceptButton={authMode === 'REGISTER' && !isTermsAccepted}
      />

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

            <FormInput
              icon={<Mail size={18} color={colors.textSecondary} />}
              placeholder="E-posta adresinizi giriniz"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginBottom: 16 }}
            />

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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  heroSectionKeyboard: {
    marginTop: 0,
    marginBottom: 4,
  },
  logoBadgeContainer: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3.5,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
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
    gap: 12,
  },
  formContainerRegister: {
    gap: 10,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 14,
  },
  dividerRowRegister: {
    marginTop: 10,
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  socialAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
  },
  appleButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButton: {
    borderWidth: 1.2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  guestLinkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  guestLinkContainerRegister: {
    marginTop: 10,
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerPolicies: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  footerPoliciesRegister: {
    marginTop: 8,
  },
  footerPolicyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  policyLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
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
  termsConsentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  checkboxTouchable: {
    padding: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsConsentText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  termsLinkText: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
