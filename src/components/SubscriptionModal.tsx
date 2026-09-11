import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  Check,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { SUBSCRIPTION_PLANS } from '../services/PromoCodeService';
import { ApplePurchaseService } from '../services/ApplePurchaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { ENV_CONFIG } from '../config/env';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ visible, onClose }) => {
  const { userProfile, setUserProfile } = useLearningStore();
  const { colors } = useThemeStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_6m');
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Focus only on the 2 primary plans: 6 Months & 12 Months
  const plans = SUBSCRIPTION_PLANS.filter((p) => p.id === 'plan_6m' || p.id === 'plan_12m');

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
        const profileToSave = userProfile || {
          id: `user_${Date.now()}`,
          fullName: 'Kullanıcı',
          email: '',
          targetScore: 70,
          isGuest: true,
          isPro: true,
          createdAt: new Date().toISOString(),
        };

        await setUserProfile({
          ...profileToSave,
          isPro: true,
          subscriptionPlanId: plan.id,
          proExpiresAt: result.expiresAt || new Date(Date.now() + plan.durationMonths * 30 * 86400000).toISOString(),
        });

        Alert.alert(
          'Tebrikler! 👑',
          '7 Günlük Ücretsiz Denemeniz ve PratikDil Pro üyeliğiniz aktif edildi. Tüm denemeler ve AI koçluğu kullanımınıza açıldı.',
          [{ text: 'Hemen Başla', onPress: onClose }]
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
        const profileToSave = userProfile || {
          id: `user_${Date.now()}`,
          fullName: 'Kullanıcı',
          email: '',
          targetScore: 70,
          isGuest: true,
          isPro: true,
          createdAt: new Date().toISOString(),
        };

        await setUserProfile({
          ...profileToSave,
          isPro: true,
          subscriptionPlanId: restoreResult.restoredPlanId,
          proExpiresAt: restoreResult.expiresAt || new Date(Date.now() + 180 * 86400000).toISOString(),
        });
        Alert.alert('Başarılı! 🎉', 'Mevcut Apple aboneliğiniz başarıyla geri yüklendi.');
        onClose();
      } else {
        Alert.alert('Bilgi', 'Apple hesabınıza bağlı aktif bir PratikDil Pro aboneliği bulunamadı.');
      }
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Satın alımlar geri yüklenemedi.');
    } finally {
      setIsRestoring(false);
    }
  };

  const proFeatures = [
    {
      title: '80 soruluk master denemeler',
      desc: 'ÖSYM standartlarında tam sınav deneyimi',
    },
    {
      title: 'AI çeldirici analizi',
      desc: 'Yanlış seçeneklerin neden tuzak olduğunu gösterir',
    },
    {
      title: 'Akıllı hata kasası',
      desc: 'Yanlışların otomatik kaydı ve aralıklı tekrarı',
    },
    {
      title: 'Aralıklı tekrarla kelime öğrenimi',
      desc: '7.000+ akademik kelime, unutmadan önce tekrar hatırlatılır',
    },
  ];

  const plan6 = plans.find((p) => p.id === 'plan_6m') || plans[0];
  const plan12 = plans.find((p) => p.id === 'plan_12m') || plans[1] || plans[0];
  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} height="90%">
      <View style={{ flex: 1, backgroundColor: colors.cardBackground }}>
        {/* TOPBAR */}
        <View style={styles.topbar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Kapat"
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.topbarTitle, { color: colors.text }]}>
            PratikDil Pro
          </Text>

          <TouchableOpacity
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={colors.brand} />
            ) : (
              <Text style={[styles.topbarRestore, { color: colors.textSecondary }]}>
                Geri Yükle
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <ScrollView
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          contentContainerStyle={styles.content}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* UPPER MAIN CONTENT */}
          <View style={styles.mainContent}>
            {/* HERO SECTION */}
            <View style={styles.hero}>
              <View style={styles.heroTag}>
                <View style={[styles.heroTagLine, { backgroundColor: colors.brand }]} />
                <Text style={[styles.heroTagText, { color: colors.brand }]}>
                  YDS · YÖKDİL · YDT
                </Text>
              </View>

              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Hedeflediğin puanı şansa bırakma
              </Text>

              <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
                Gerçek sınav simülasyonları ve yapay zeka destekli çeldirici analiziyle ilk seferde geç.
              </Text>
            </View>

            {/* TRIAL BANNER */}
            <View
              style={[
                styles.trialBanner,
                {
                  backgroundColor: colors.subtleBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <ShieldCheck size={16} color={colors.brand} />
              <Text style={[styles.trialBannerText, { color: colors.text }]}>
                7 gün ücretsiz dene, istediğin an App Store'dan iptal et
              </Text>
            </View>

            {/* SECTION LABEL: ADVANTAGES */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Pro ile gelen avantajlar
            </Text>

            {/* FEATURES LIST */}
            <View style={styles.featList}>
              {proFeatures.map((item, index) => {
                const isLast = index === proFeatures.length - 1;
                return (
                  <View
                    key={index}
                    style={[
                      styles.featRow,
                      !isLast && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                    ]}
                  >
                    <Check size={15} color={colors.brand} style={styles.featIcon} />
                    <View style={styles.featTextCol}>
                      <Text style={[styles.featTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.featDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* SECTION LABEL: PACKAGES */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 10 }]}>
              Uygun paketi seç
            </Text>

            {/* PLANS SELECTOR */}
            <View style={styles.plansContainer}>
              {/* Plan 1: 6 Aylık */}
              {plan6 && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: selectedPlanId === plan6.id ? colors.brand : colors.border,
                      borderWidth: selectedPlanId === plan6.id ? 1.8 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPlanId(plan6.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.planLeft}>
                    <View
                      style={[
                        styles.dot,
                        { borderColor: selectedPlanId === plan6.id ? colors.brand : colors.border },
                      ]}
                    >
                      {selectedPlanId === plan6.id && (
                        <View style={[styles.dotFill, { backgroundColor: colors.brand }]} />
                      )}
                    </View>
                    <View style={styles.planTextWrap}>
                      <Text style={[styles.planName, { color: colors.text }]}>
                        6 aylık hazırlık paketi
                      </Text>
                      <Text style={[styles.planDesc, { color: colors.textSecondary }]}>
                        Sınav dönemine özel · en çok tercih edilen
                      </Text>
                    </View>
                  </View>

                  <View style={styles.planRight}>
                    <Text style={[styles.planPrice, { color: colors.text }]}>
                      {plan6.originalPrice} ₺
                    </Text>
                    <Text style={[styles.planPerMonth, { color: colors.textSecondary }]}>
                      ~{plan6.monthlyPrice} ₺/ay
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Plan 2: 12 Aylık */}
              {plan12 && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: selectedPlanId === plan12.id ? colors.brand : colors.border,
                      borderWidth: selectedPlanId === plan12.id ? 1.8 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPlanId(plan12.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.planLeft}>
                    <View
                      style={[
                        styles.dot,
                        { borderColor: selectedPlanId === plan12.id ? colors.brand : colors.border },
                      ]}
                    >
                      {selectedPlanId === plan12.id && (
                        <View style={[styles.dotFill, { backgroundColor: colors.brand }]} />
                      )}
                    </View>
                    <View style={styles.planTextWrap}>
                      <Text style={[styles.planName, { color: colors.text }]}>
                        12 aylık sınırsız VIP
                      </Text>
                      <Text style={[styles.planDesc, { color: colors.textSecondary }]}>
                        YDS + YÖKDİL + YDT tüm yıl
                      </Text>
                    </View>
                  </View>

                  <View style={styles.planRight}>
                    <Text style={[styles.planPrice, { color: colors.text }]}>
                      {plan12.originalPrice} ₺
                    </Text>
                    <Text style={[styles.planPerMonth, { color: colors.textSecondary }]}>
                      ~{plan12.monthlyPrice} ₺/ay
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* BOTTOM SECTION */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.ctaBtn,
                { backgroundColor: colors.brand, opacity: isPurchasing ? 0.8 : 1 },
              ]}
              onPress={() => handleAppleSubscribe(selectedPlanId)}
              activeOpacity={0.88}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.ctaBtnText}>
                  {`7 gün ücretsiz dene · ${currentPlan.originalPrice} ₺/${currentPlan.durationMonths === 6 ? '6 ay' : '12 ay'}`}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>
              Süre bitene kadar ücret alınmaz, dilediğin an iptal et
            </Text>

            {/* LEGAL LINKS */}
            <View style={styles.linksWrap}>
              <TouchableOpacity
                onPress={() => Linking.openURL(ENV_CONFIG.LEGAL.APPLE_STANDARD_EULA_URL)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  Kullanım Şartları (EULA)
                </Text>
              </TouchableOpacity>

              <Text style={[styles.linkDot, { color: colors.textSecondary }]}>·</Text>

              <TouchableOpacity
                onPress={() => Linking.openURL(ENV_CONFIG.LEGAL.PRIVACY_URL)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  Gizlilik Politikası
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  topbarRestore: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  mainContent: {
    flexShrink: 0,
  },
  hero: {
    marginBottom: 10,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroTagLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 5,
  },
  heroDesc: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  trialBanner: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trialBannerText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  featList: {
    marginBottom: 4,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 7,
  },
  featIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  featTextCol: {
    flex: 1,
  },
  featTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  featDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  plansContainer: {
    gap: 8,
    marginBottom: 8,
  },
  planCard: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 6,
  },
  dot: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dotFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  planTextWrap: {
    flex: 1,
  },
  planName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  planDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 1,
  },
  planPerMonth: {
    fontSize: 10.5,
  },
  bottomSection: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSub: {
    textAlign: 'center',
    fontSize: 10.5,
    marginTop: 7,
    lineHeight: 14,
  },
  linksWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 6,
  },
  linkText: {
    fontSize: 10.5,
    textDecorationLine: 'underline',
  },
  linkDot: {
    fontSize: 10.5,
  },
});
