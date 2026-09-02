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
  Sparkles,
  Check,
  Crown,
  X,
  RotateCcw,
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
        if (userProfile) {
          await setUserProfile({
            ...userProfile,
            isPro: true,
            subscriptionPlanId: plan.id,
            proExpiresAt: result.expiresAt || new Date(Date.now() + plan.durationMonths * 30 * 86400000).toISOString(),
          });
        }

        Alert.alert(
          'Tebrikler! 👑',
          '7 Günlük Ücretsiz Denemeniz ve YDS Pratik Pro üyeliğiniz aktif edildi. Tüm denemeler ve AI koçluğu kullanımınıza açıldı.',
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
        if (userProfile) {
          await setUserProfile({
            ...userProfile,
            isPro: true,
            subscriptionPlanId: restoreResult.restoredPlanId,
            proExpiresAt: restoreResult.expiresAt || new Date(Date.now() + 180 * 86400000).toISOString(),
          });
        }
        Alert.alert('Başarılı! 🎉', 'Mevcut Apple aboneliğiniz başarıyla geri yüklendi.');
        onClose();
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
    'Tam 80 soruluk gerçek master deneme sınavları',
    'ÖSYM çeldirici tuzaklarını deşifre eden AI koçluğu',
    'Kişiselleştirilmiş zayıf nokta soru üretimi',
    'Hata Kasası ile yanlış soruları kalıcı telafi',
  ];

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} height="88%">
      <View style={{ flex: 1, backgroundColor: colors.cardBackground }}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* TOP BAR */}
          <View style={styles.topRow}>
            <View style={[styles.proBadge, { backgroundColor: colors.accentWarmLight }]}>
              <Crown size={14} color={colors.accentWarm} />
              <Text style={[styles.proBadgeText, { color: colors.accentWarm }]}>PRO ERİŞİM</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* HERO */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              YDS Pratik Pro
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Hedef puanına ulaşmak için tüm kilitleri aç.
            </Text>
          </View>

          {/* MINIMALIST FEATURE BULLETS */}
          <View style={styles.featureList}>
            {proFeatures.map((feat, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.checkCircle, { backgroundColor: colors.brandLight }]}>
                  <Check size={13} color={colors.brand} strokeWidth={3} />
                </View>
                <Text style={[styles.featureRowText, { color: colors.text }]}>{feat}</Text>
              </View>
            ))}
          </View>

          {/* COMPACT PLAN CARDS */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: isSelected
                        ? (colors.isDark ? '#1E293B' : '#EFF6FF')
                        : colors.cardBackground,
                      borderColor: isSelected ? colors.brand : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPlanId(plan.id)}
                  activeOpacity={0.85}
                >
                  {plan.badge && (
                    <View
                      style={[
                        styles.planBadge,
                        { backgroundColor: plan.isPopular ? colors.brand : colors.accentWarm },
                      ]}
                    >
                      <Text style={[styles.planBadgeText, { color: colors.textOnBrand }]}>
                        {plan.badge}
                      </Text>
                    </View>
                  )}

                  <View style={styles.planContentRow}>
                    <View style={styles.planRadioCircleOuter}>
                      <View
                        style={[
                          styles.planRadioCircle,
                          { borderColor: isSelected ? colors.brand : colors.border },
                        ]}
                      >
                        {isSelected && (
                          <View
                            style={[styles.planRadioInner, { backgroundColor: colors.brand }]}
                          />
                        )}
                      </View>
                    </View>

                    <View style={{ flex: 1, paddingHorizontal: 8 }}>
                      <Text style={[styles.planName, { color: colors.text }]}>{plan.title}</Text>
                      <Text style={[styles.planDesc, { color: colors.textSecondary }]}>
                        {plan.durationMonths} Ay Tam Erişim
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.planPrice, { color: colors.brand }]}>
                        {plan.originalPrice} ₺
                      </Text>
                      <Text style={[styles.planSubprice, { color: colors.textSecondary }]}>
                        ~{plan.monthlyPrice} ₺ / ay
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* PRIMARY CTA BUTTON */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              { backgroundColor: colors.brand, opacity: isPurchasing ? 0.7 : 1 },
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
                  7 Gün Ücretsiz Denemeyi Başlat
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* SUBTEXT / RESTORE & LEGAL */}
          <Text style={[styles.trialNoticeText, { color: colors.textSecondary }]}>
            İlk 7 gün tamamen ücretsizdir. Dilediğiniz zaman App Store üzerinden tek dokunuşla iptal edebilirsiniz.
          </Text>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            activeOpacity={0.7}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={colors.brand} />
            ) : (
              <>
                <RotateCcw size={13} color={colors.brand} />
                <Text style={[styles.restoreBtnText, { color: colors.brand }]}>
                  Satın Alımları Geri Yükle (Restore Purchases)
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.legalLinksRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL(ENV_CONFIG.LEGAL.APPLE_STANDARD_EULA_URL)}
            >
              <Text style={[styles.legalLinkText, { color: colors.textSecondary }]}>
                Kullanım Şartları (EULA)
              </Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>•</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(ENV_CONFIG.LEGAL.PRIVACY_URL)}
            >
              <Text style={[styles.legalLinkText, { color: colors.textSecondary }]}>
                Gizlilik Politikası
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  proBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  featureList: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureRowText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  plansContainer: {
    gap: 10,
    marginBottom: 18,
  },
  planCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  planContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadioCircleOuter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '900',
  },
  planSubprice: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#4762BD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  trialNoticeText: {
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 12,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  legalLinkText: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
