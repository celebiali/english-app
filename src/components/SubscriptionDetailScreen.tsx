import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
  TextInput,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Check,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Brain,
  Layers,
  Tag,
  ExternalLink,
} from 'lucide-react-native';
import { SUBSCRIPTION_PLANS, PromoCodeService, PromoCodeInfo } from '../services/PromoCodeService';
import { ApplePurchaseService } from '../services/ApplePurchaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { ENV_CONFIG } from '../config/env';

interface Props {
  onBack: () => void;
}

export const SubscriptionDetailScreen: React.FC<Props> = ({ onBack }) => {
  const { userProfile, setUserProfile } = useLearningStore();
  const { colors, theme } = useThemeStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_6m');
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeInfo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);

  const basePlans = SUBSCRIPTION_PLANS.filter((p) => p.id === 'plan_6m' || p.id === 'plan_12m');
  const plans = PromoCodeService.getCalculatedPlans(appliedPromo).filter(
    (p) => p.id === 'plan_6m' || p.id === 'plan_12m'
  );

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Lütfen bir kupon kodu giriniz.');
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const match = await PromoCodeService.validateCodeAsync(promoCodeInput);
      if (match) {
        setAppliedPromo(match);
        setPromoError(null);
        Alert.alert('Harika! 🎉', `%${match.discountPercent} indirim uygulandı (${match.code})`);
      } else {
        setPromoError('Geçersiz veya süresi dolmuş kupon kodu.');
      }
    } catch {
      setPromoError('Kupon kodu doğrulanamadı.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleAppleSubscribe = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId) || plans[0];
    const productId = plan.appleProductId || ENV_CONFIG.APPLE_PRODUCT_IDS.PLAN_6M;

    setIsPurchasing(true);
    try {
      const result = await ApplePurchaseService.purchaseByProductId(productId);

      if (result.userCancelled) {
        return;
      }

      if (result.success && result.isPro) {
        if (userProfile) {
          await setUserProfile({
            ...userProfile,
            isPro: true,
            subscriptionPlanId: plan.id,
            proExpiresAt:
              result.expiresAt ||
              new Date(Date.now() + plan.durationMonths * 30 * 86400000).toISOString(),
          });
        }

        Alert.alert(
          'Tebrikler! 👑',
          '7 Günlük Ücretsiz Denemeniz ve YDS Pratik Pro üyeliğiniz aktif edildi. Tüm denemeler ve AI koçluğu kullanımınıza açıldı.',
          [{ text: 'Hemen Kullan', onPress: onBack }]
        );
      } else if (result.error) {
        Alert.alert('İşlem Başarısız', result.error);
      }
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Satın alma işlemi başlatılamadı.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const restoreResult = await ApplePurchaseService.restorePurchases();
      if (restoreResult.success && restoreResult.isPro) {
        if (userProfile) {
          await setUserProfile({
            ...userProfile,
            isPro: true,
            subscriptionPlanId: restoreResult.restoredPlanId,
            proExpiresAt:
              restoreResult.expiresAt ||
              new Date(Date.now() + 180 * 86400000).toISOString(),
          });
        }
        Alert.alert('Başarılı! 🎉', 'Mevcut Apple aboneliğiniz başarıyla geri yüklendi.');
      } else {
        Alert.alert('Bilgi', 'Apple hesabınıza bağlı aktif bir YDS Pratik aboneliği bulunamadı.');
      }
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Satın alımlar geri yüklenemedi.');
    } finally {
      setIsRestoring(false);
    }
  };

  const proFeatures = [
    {
      icon: Target,
      title: '80 Soruluk Master Denemeler',
      desc: 'ÖSYM standartlarında tam sınav deneyimi ve soru dağılımı.',
    },
    {
      icon: Brain,
      title: 'Gemini AI Çeldirici Analizi',
      desc: 'Yanlış seçeneklerin neden tuzak olduğunu tek dokunuşla açıklayan yapay zeka.',
    },
    {
      icon: Zap,
      title: 'Akıllı Hata Kasası',
      desc: 'Tüm yanlışların otomatik kaydedilir, aralıklı tekrarla eksikler telafi edilir.',
    },
    {
      icon: Layers,
      title: '7.000+ Sınav Kelimesi',
      desc: 'Akademik kelime kartları, eş anlamlılar ve çevrimdışı çalışma desteği.',
    },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* HEADER NAV */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.subtleBackground }]}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={20} color={colors.text} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>Geri</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>YDS Pratik Pro</Text>

        <TouchableOpacity
          style={styles.headerRightAction}
          onPress={handleRestorePurchases}
          disabled={isRestoring}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color={colors.brand} />
          ) : (
            <Text style={[styles.headerRestoreText, { color: colors.brand }]}>Geri Yükle</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE PRO STATUS BANNER (IF USER IS PRO) */}
        {userProfile?.isPro && (
          <View style={[styles.activeProCard, { backgroundColor: colors.isDark ? '#1E293B' : '#F0FDF4', borderColor: '#22C55E' }]}>
            <View style={styles.activeProHeader}>
              <View style={[styles.activeProBadge, { backgroundColor: '#22C55E' }]}>
                <Crown size={14} color="#FFFFFF" />
                <Text style={styles.activeProBadgeText}>PRO ÜYESİNİZ</Text>
              </View>
              <Text style={[styles.activeProStatusText, { color: colors.textSecondary }]}>
                {userProfile.proExpiresAt
                  ? `Bitiş: ${new Date(userProfile.proExpiresAt).toLocaleDateString('tr-TR')}`
                  : 'Sınırsız VIP Erişim'}
              </Text>
            </View>
            <Text style={[styles.activeProDesc, { color: colors.text }]}>
              Tüm Master Denemeler, AI Soru Koçu ve Hata Kasası hesabınıza sınırsız açık.
            </Text>
          </View>
        )}

        {/* HERO BANNER */}
        <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.crownIconCircle, { backgroundColor: colors.brandLight }]}>
            <Crown size={28} color={colors.brand} />
          </View>

          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Hedeflediğin Puanı Şansa Bırakma
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Yapay zeka soru koçluğu, gerçek sınav simülasyonları ve çeldirici analizleriyle YDS/YÖKDİL'i ilk seferde geç.
          </Text>

          <View style={styles.guaranteeRow}>
            <ShieldCheck size={16} color={colors.brand} />
            <Text style={[styles.guaranteeText, { color: colors.textSecondary }]}>
              7 Günlük Ücretsiz Deneme • İstediğin an App Store'dan iptal et
            </Text>
          </View>
        </View>

        {/* FEATURES GRID / LIST */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PRO İLE GELEN AVANTAJLAR
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {proFeatures.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <View
                key={idx}
                style={[
                  styles.featureCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
              >
                <View style={[styles.featureIconBox, { backgroundColor: colors.brandLight }]}>
                  <IconComp size={20} color={colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>
                </View>
                <CheckCircle2 size={18} color={colors.brand} />
              </View>
            );
          })}
        </View>

        {/* SUBSCRIPTION PACKAGES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            UYGUN PAKETİ SEÇİN
          </Text>
          <Text style={[styles.sectionBadge, { color: colors.brand }]}>7 Gün Ücretsiz</Text>
        </View>

        <View style={styles.plansList}>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const is12M = plan.id === 'plan_12m';

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isSelected
                      ? colors.isDark
                        ? '#1E293B'
                        : '#EFF6FF'
                      : colors.cardBackground,
                    borderColor: isSelected ? colors.brand : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
                activeOpacity={0.88}
              >
                {/* Top Badge */}
                {plan.badge && (
                  <View
                    style={[
                      styles.planBadge,
                      {
                        backgroundColor: is12M ? '#F59E0B' : colors.brand,
                      },
                    ]}
                  >
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planCardHeader}>
                  {/* Radio Button */}
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: isSelected ? colors.brand : colors.border },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.brand }]} />
                    )}
                  </View>

                  <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                    <Text style={[styles.planSubtitle, { color: colors.textSecondary }]}>
                      {plan.subtitle}
                    </Text>
                  </View>

                  {/* Price */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.planPrice, { color: colors.brand }]}>
                      {plan.originalPrice} ₺
                    </Text>
                    <Text style={[styles.planMonthly, { color: colors.textSecondary }]}>
                      ~{plan.monthlyPrice} ₺/ay
                    </Text>
                  </View>
                </View>

                {/* Plan Highlights */}
                <View style={[styles.planBullets, { borderTopColor: colors.border }]}>
                  {plan.features.slice(0, 3).map((feat, fIdx) => (
                    <View key={fIdx} style={styles.bulletRow}>
                      <Check size={12} color={colors.brand} strokeWidth={3} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PROMO / COUPON CODE SECTION */}
        <View
          style={[
            styles.promoCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.promoHeader}>
            <Tag size={16} color={colors.brand} />
            <Text style={[styles.promoTitle, { color: colors.text }]}>İndirim Kuponu / Kod</Text>
          </View>

          <View style={styles.promoInputRow}>
            <TextInput
              style={[
                styles.promoInput,
                {
                  backgroundColor: colors.subtleBackground,
                  color: colors.text,
                  borderColor: promoError ? '#EF4444' : colors.border,
                },
              ]}
              placeholder="Örn: YDS20"
              placeholderTextColor={colors.textSecondary}
              value={promoCodeInput}
              onChangeText={(text) => {
                setPromoCodeInput(text.toUpperCase());
                setPromoError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.promoApplyBtn, { backgroundColor: colors.brand }]}
              onPress={handleApplyPromoCode}
              disabled={isValidatingPromo}
            >
              {isValidatingPromo ? (
                <ActivityIndicator size="small" color={colors.textOnBrand} />
              ) : (
                <Text style={[styles.promoApplyBtnText, { color: colors.textOnBrand }]}>Uygula</Text>
              )}
            </TouchableOpacity>
          </View>

          {promoError && <Text style={styles.promoErrorText}>{promoError}</Text>}
          {appliedPromo && (
            <Text style={styles.promoSuccessText}>
              ✓ %{appliedPromo.discountPercent} Kupon İndirimi Uygulandı!
            </Text>
          )}
        </View>

        {/* PRIMARY CTA / ACTION BUTTON */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: colors.brand, opacity: isPurchasing ? 0.75 : 1 },
          ]}
          onPress={() => handleAppleSubscribe(selectedPlanId)}
          activeOpacity={0.85}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color={colors.textOnBrand} />
          ) : (
            <>
              <Sparkles size={18} color={colors.textOnBrand} />
              <Text style={[styles.ctaButtonText, { color: colors.textOnBrand }]}>
                7 Gün Ücretsiz Dene ve Başla
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.trialNotice, { color: colors.textSecondary }]}>
          7 gün tamamen ücretsiz • Süre bitene kadar ücret tahsil edilmez • Dilediğin an iptal et
        </Text>

        {/* APPLE GUIDELINE 3.1.2 MANDATORY LEGAL DISCLAIMER */}
        <View style={[styles.legalBox, { borderTopColor: colors.border }]}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Abonelik bedeli Apple Kimliğiniz üzerinden tahsil edilir. 7 günlük ücretsiz deneme süresi
            bitiminde seçilen paket bedeli ({currentPlan.originalPrice} ₺ / {currentPlan.durationMonths} Ay)
            otomatik olarak yenilenir. Aboneliğinizi dilediğiniz zaman App Store Hesap Ayarları üzerinden
            yönetebilir ve yenileme tarihinden en az 24 saat önce iptal edebilirsiniz.
          </Text>

          {/* RESTORE PURCHASES BUTTON */}
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            activeOpacity={0.7}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={colors.brand} />
            ) : (
              <View style={styles.restoreRow}>
                <RotateCcw size={14} color={colors.textSecondary} />
                <Text style={[styles.restoreBtnText, { color: colors.textSecondary }]}>
                  Satın Alımları Geri Yükle (Restore Purchases)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* LEGAL LINKS (EULA & PRIVACY) */}
          <View style={styles.legalLinksRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL(ENV_CONFIG.LEGAL.APPLE_STANDARD_EULA_URL)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.legalLinkText, { color: colors.brand }]}>
                Kullanım Şartları (EULA)
              </Text>
            </TouchableOpacity>

            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>•</Text>

            <TouchableOpacity
              onPress={() => Linking.openURL(ENV_CONFIG.LEGAL.PRIVACY_URL)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.legalLinkText, { color: colors.brand }]}>
                Gizlilik Politikası
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRightAction: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerRestoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  activeProCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  activeProHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  activeProBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeProBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  activeProStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeProDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  crownIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  guaranteeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  featuresContainer: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  plansList: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 14,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  planSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '800',
  },
  planMonthly: {
    fontSize: 11,
    marginTop: 1,
  },
  planBullets: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletText: {
    fontSize: 11,
  },
  promoCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  promoApplyBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  promoErrorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 6,
  },
  promoSuccessText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  trialNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  legalBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  restoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  restoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
