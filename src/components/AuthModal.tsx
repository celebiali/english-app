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
  Platform,
} from 'react-native';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react-native';
import { SupabaseService } from '../services/SupabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { LegalSheetModal } from './LegalSheetModal';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ visible, onClose }) => {
  const { setUserProfile } = useLearningStore();
  const { colors } = useThemeStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetScore, setTargetScore] = useState(80);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'PRIVACY' | 'TERMS'>('PRIVACY');

  const targetScoreOptions = [60, 70, 80, 90];

  const handleCheckboxPress = () => {
    if (isTermsAccepted) {
      setIsTermsAccepted(false);
    } else {
      setLegalModalTab('TERMS');
      setIsLegalModalOpen(true);
    }
  };

  const handleModeChange = (newMode: 'LOGIN' | 'REGISTER') => {
    if (newMode === mode) return;
    setMode(newMode);
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
    setIsTermsAccepted(false);
  };

  React.useEffect(() => {
    if (!visible) {
      setEmail('');
      setPassword('');
      setFullName('');
      setShowPassword(false);
      setMode('LOGIN');
      setIsTermsAccepted(false);
    }
  }, [visible]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    const res = await SupabaseService.signIn(email, password);
    setIsLoading(false);

    if (res.user) {
      await setUserProfile(res.user);
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
    const res = await SupabaseService.signUp(email, password, fullName, targetScore, true);
    setIsLoading(false);

    if (res.user) {
      await setUserProfile(res.user);
      onClose();
      Alert.alert('Kayıt Başarılı 🎉', `Tebrikler ${res.user.fullName}, üyeliğiniz oluşturuldu!`);
    } else {
      Alert.alert('Kayıt Hatası', res.error || 'Kayıt yapılamadı.');
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    const res = await SupabaseService.signInWithApple();
    setIsLoading(false);
    if (res.user) {
      await setUserProfile(res.user);
      onClose();
    } else if (res.error) {
      Alert.alert('Apple Girişi', res.error);
    }
  };

  const handleGuestContinue = async () => {
    const guestUser = SupabaseService.signInAsGuest();
    await setUserProfile(guestUser);
    onClose();
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="90%">
      <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
        {/* Header with App Logo & Title */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.brand }]}>
              <GraduationCap size={22} color={colors.textOnBrand} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={[styles.appTitle, { color: colors.text }]}>PratikDil</Text>
              <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>Bulut Eşitleme & Sınav Motoru</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Social Auth Buttons (Apple Sign In) */}
        {Platform.OS === 'ios' && (
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[
                styles.socialBtnApple,
                { backgroundColor: colors.isDark ? '#FFFFFF' : '#000000', flex: 1 },
              ]}
              onPress={handleAppleLogin}
              activeOpacity={0.85}
            >
              <Text style={[styles.appleIcon, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}></Text>
              <Text style={[styles.socialBtnTextApple, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>Apple ile Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>veya e-posta</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Mode Selector Tabs (Giriş Yap / Kayıt Ol) */}
        <View style={[styles.tabContainer, { backgroundColor: colors.subtleBackground }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              mode === 'LOGIN' && [styles.activeTabBtn, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => handleModeChange('LOGIN')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: mode === 'LOGIN' ? colors.brand : colors.textSecondary },
                mode === 'LOGIN' && { fontWeight: '800' },
              ]}
            >
              Giriş Yap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              mode === 'REGISTER' && [styles.activeTabBtn, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => handleModeChange('REGISTER')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: mode === 'REGISTER' ? colors.brand : colors.textSecondary },
                mode === 'REGISTER' && { fontWeight: '800' },
              ]}
            >
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* REGISTER EXTRA: Full Name */}
          {mode === 'REGISTER' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Ad Soyad</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <User size={17} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Adınız ve Soyadınız"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>E-Posta Adresi</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Mail size={17} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="E-posta adresinizi giriniz"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password with Show/Hide */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Şifre</Text>
              {mode === 'LOGIN' && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Şifre Sıfırlama',
                      `${email || 'E-posta adresinize'} şifre sıfırlama talimatı gönderilsin mi?`,
                      [
                        { text: 'Vazgeç', style: 'cancel' },
                        {
                          text: 'Gönder',
                          onPress: () => {
                            if (email) {
                              SupabaseService.resetPasswordForEmail(email);
                              Alert.alert('Gönderildi', 'E-posta kutunuzu kontrol edin.');
                            } else {
                              Alert.alert('Uyarı', 'Lütfen e-posta alanını doldurun.');
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={[styles.forgotPassText, { color: colors.brand }]}>Şifremi Unuttum?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Lock size={17} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="En az 6 karakter"
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

          {/* REGISTER EXTRA: Target Score Picker */}
          {mode === 'REGISTER' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Hedeflenen YDS Puanı</Text>
              <View style={styles.scoreOptionsRow}>
                {targetScoreOptions.map((sc) => {
                  const isSelected = targetScore === sc;
                  return (
                    <TouchableOpacity
                      key={sc}
                      style={[
                        styles.scoreOptionBtn,
                        {
                          backgroundColor: isSelected ? colors.brandLight : colors.subtleBackground,
                          borderColor: isSelected ? colors.brand : colors.border,
                        },
                      ]}
                      onPress={() => setTargetScore(sc)}
                    >
                      <Text
                        style={[
                          styles.scoreOptionText,
                          { color: isSelected ? colors.brand : colors.textSecondary },
                          isSelected && { fontWeight: '800' },
                        ]}
                      >
                        {sc}+
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* REGISTER CHECKBOX CONSENT (KVKK & EULA COMPLIANCE) */}
          {mode === 'REGISTER' && (
            <View style={styles.termsConsentRow}>
              <TouchableOpacity
                style={styles.checkboxTouchable}
                onPress={handleCheckboxPress}
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
                  onPress={() => {
                    setLegalModalTab('TERMS');
                    setIsLegalModalOpen(true);
                  }}
                  suppressHighlighting={false}
                >
                  Kullanıcı Sözleşmesi
                </Text>
                'ni ve{' '}
                <Text
                  style={[styles.termsLinkText, { color: colors.brand }]}
                  onPress={() => {
                    setLegalModalTab('PRIVACY');
                    setIsLegalModalOpen(true);
                  }}
                  suppressHighlighting={false}
                >
                  KVKK Aydınlatma Metni & Gizlilik Politikası
                </Text>
                'nı okudum, kabul ediyorum.
              </Text>
            </View>
          )}

          {/* Action Submit Button */}
          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              {
                backgroundColor: colors.brand,
                opacity: (mode === 'REGISTER' && !isTermsAccepted) || isLoading ? 0.45 : 1,
              },
            ]}
            onPress={mode === 'LOGIN' ? handleLogin : handleRegister}
            disabled={(mode === 'REGISTER' && !isTermsAccepted) || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textOnBrand} />
            ) : (
              <Text style={[styles.primaryActionBtnText, { color: colors.textOnBrand }]}>
                {mode === 'LOGIN' ? 'Giriş Yap' : 'Kaydet'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Guest / Reviewer Skip Link (Discreet text link) */}
          <TouchableOpacity
            style={styles.guestLink}
            onPress={handleGuestContinue}
            activeOpacity={0.7}
          >
            <Text style={[styles.guestLinkText, { color: colors.textSecondary }]}>
              Giriş yapmadan uygulamayı keşfet
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* LEGAL & EULA IN-APP BOTTOM SHEET MODAL */}
      <LegalSheetModal
        visible={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
        onAccept={() => setIsTermsAccepted(true)}
        showAcceptButton={mode === 'REGISTER'}
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
    paddingBottom: 14,
    borderBottomWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  appSubtitle: {
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
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  socialBtnApple: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 13,
  },
  appleIcon: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  socialBtnTextApple: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  socialBtnGoogle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.3,
    paddingVertical: 10,
    borderRadius: 13,
  },
  googleGLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    fontSize: 11,
    fontWeight: '900',
  },
  socialBtnTextGoogle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabBtn: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  forgotPassText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  scoreOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreOptionBtn: {
    flex: 1,
    borderWidth: 1.4,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  scoreOptionText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryActionBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  guestLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalNote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  legalLink: {
    fontWeight: '700',
  },
  termsConsentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
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
