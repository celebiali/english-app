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
  X,
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
  const [isPromoExpanded, setIsPromoExpanded] = useState<boolean>(false);

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
        setIsPromoExpanded(false);
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
          '7 Günlük Ücretsiz Denemeniz ve Dil Sınavı Hazırlık Pro üyeliğiniz aktif edildi. Tüm denemeler ve AI koçluğu kullanımınıza açıldı.',
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
        Alert.alert('Bilgi', 'Apple hesabınıza bağlı aktif bir Dil Sınavı Hazırlık aboneliği bulunamadı.');
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
          style={styles.backIconButton}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Geri"
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Crown size={15} color="#F59E0B" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dil Sınavı Hazırlık Pro</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerRestorePill, { backgroundColor: colors.subtleBackground }]}
          onPress={handleRestorePurchases}
          disabled={isRestoring}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color={colors.brand} />
          ) : (
            <>
              <RotateCcw size={12} color={colors.textSecondary} />
              <Text style={[styles.headerRestoreText, { color: colors.textSecondary }]}>Geri Yükle</Text>
            </>
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
          <View style={[styles.activeProCard, { backgroundColor: colors.isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.brand }]}>
            <View style={styles.activeProHeader}>
              <View style={[styles.activeProBadge, { backgroundColor: colors.brand }]}>
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

        {/* HERO BANNER - COMPACT */}
        <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.crownIconCircle, { backgroundColor: colors.brandLight }]}>
            <Crown size={22} color={colors.brand} />
          </View>

          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Hedeflediğin Puanı Şansa Bırakma
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Yapay zeka koçluğu, gerçek sınav simülasyonları ve çeldirici analizleriyle YDS/YÖKDİL'i ilk seferde geç.
          </Text>

          <View style={[styles.guaranteeRow, { backgroundColor: colors.subtleBackground }]}>
            <ShieldCheck size={13} color={colors.brand} />
            <Text style={[styles.guaranteeText, { color: colors.textSecondary }]}>
              7 Gün Ücretsiz Deneme • İstediğin an App Store'dan iptal et
            </Text>
          </View>
        </View>

        {/* COMPACT PRO ADVANTAGES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PRO İLE GELEN AVANTAJLAR
          </Text>
        </View>

        <View style={[styles.featuresCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {proFeatures.map((item, idx) => {
            const IconComp = item.icon;
            const isLast = idx === proFeatures.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.featureRow,
                  !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.featureIconBox, { backgroundColor: colors.brandLight }]}>
                  <IconComp size={15} color={colors.brand} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.desc}
                  </Text>
                </View>
                <CheckCircle2 size={16} color={colors.brand} />
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

                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
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
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PROMO / COUPON CODE SECTION (COLLAPSIBLE / ON-DEMAND) */}
        {appliedPromo ? (
          <View
            style={[
              styles.appliedPromoBadge,
              { backgroundColor: colors.isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.brand },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Tag size={14} color={colors.brand} />
              <Text style={[styles.appliedPromoText, { color: colors.brand }]}>
                %{appliedPromo.discountPercent} Kupon İndirimi ({appliedPromo.code})
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setAppliedPromo(null);
                setPromoCodeInput('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.appliedPromoRemoveBtn}
            >
              <Text style={styles.appliedPromoRemoveText}>Kaldır</Text>
            </TouchableOpacity>
          </View>
        ) : isPromoExpanded ? (
          <View
            style={[
              styles.promoCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <View style={styles.promoHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Tag size={14} color={colors.brand} />
                <Text style={[styles.promoTitle, { color: colors.text }]}>İndirim Kuponu Ekle</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPromoExpanded(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
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
          </View>
        ) : (
          <TouchableOpacity
            style={styles.promoToggleBtn}
            onPress={() => setIsPromoExpanded(true)}
            activeOpacity={0.7}
          >
            <Tag size={13} color={colors.brand} />
            <Text style={[styles.promoToggleText, { color: colors.brand }]}>
              İndirim kodun mu var? Kupon Ekle
            </Text>
          </TouchableOpacity>
        )}

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
              <Sparkles size={17} color={colors.textOnBrand} />
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerRestorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  headerRestoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },
  activeProCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  activeProHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activeProBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  activeProBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  activeProStatusText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  activeProDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  heroCard: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 14,
  },
  crownIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16.5,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  featuresCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 10,
  },
  featureIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  featureDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  plansList: {
    gap: 8,
    marginBottom: 12,
  },
  planCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
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
  planTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  planSubtitle: {
    fontSize: 10.5,
    marginTop: 1,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  planMonthly: {
    fontSize: 10.5,
    marginTop: 1,
  },
  promoToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 12,
  },
  promoToggleText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  appliedPromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  appliedPromoText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  appliedPromoRemoveBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  appliedPromoRemoveText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  promoCard: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  promoApplyBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoErrorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 6,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  trialNotice: {
    fontSize: 10.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  legalBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  restoreBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  restoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  restoreBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legalLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
