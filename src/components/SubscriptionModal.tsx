import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Zap,
  Crown,
  X,
} from 'lucide-react-native';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { PromoCodeService, PromoCodeInfo } from '../services/PromoCodeService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ visible, onClose }) => {
  const { userProfile, setUserProfile } = useLearningStore();
  const { colors } = useThemeStore();

  const [promoInput, setPromoInput] = useState<string>('');
  const [activePromo, setActivePromo] = useState<PromoCodeInfo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_3m');

  const calculatedPlans = PromoCodeService.getCalculatedPlans(activePromo);

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Lütfen bir kupon kodu giriniz.');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const validated = await PromoCodeService.validateCodeAsync(code);
      if (validated) {
        setActivePromo(validated);
        setPromoError(null);
        Alert.alert(
          'Kupon Uygulandı! 🎉',
          `${validated.teacherName} özel %${validated.discountPercent} indiriminiz tüm paketlere tanımlandı!`
        );
      } else {
        setActivePromo(null);
        setPromoError('Geçersiz veya süresi dolmuş kupon kodu.');
      }
    } catch (e) {
      setActivePromo(null);
      setPromoError('Kupon kontrol edilirken bir hata oluştu.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const plan = calculatedPlans.find((p) => p.id === planId);
    if (!plan) return;

    const finalPrice = plan.discountedPrice || plan.originalPrice;

    Alert.alert(
      'YDS Pratik Pro Aktivasyonu',
      `${plan.title} (${finalPrice} TL) üyeliğiniz başlatılıyor. ${
        activePromo ? `\n\nReferans Hoca: ${activePromo.teacherName} (%${activePromo.discountPercent} İndirim)` : ''
      }`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla ve Başla',
          style: 'default',
          onPress: async () => {
            if (activePromo) {
              await PromoCodeService.recordPromoUsage(
                activePromo.code,
                plan.id,
                finalPrice,
                userProfile?.id
              );
            }

            if (userProfile) {
              setUserProfile({
                ...userProfile,
                isPro: true,
                appliedPromoCode: activePromo?.code,
                proExpiresAt: new Date(Date.now() + plan.durationMonths * 30 * 86400000).toISOString(),
              });
            }
            Alert.alert(
              'Tebrikler! 👑',
              'YDS Pratik Pro üyeliğiniz başarıyla aktif edildi. Sınav gününe kadar tüm AI koçluk ve denemelere sınırsız erişebilirsiniz!'
            );
            onClose();
          },
        },
      ]
    );
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="92%">
      <ScrollView
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP CLOSE ROW */}
        <View style={styles.topRow}>
          <View style={[styles.proBadge, { backgroundColor: colors.accentWarmLight }]}>
            <Crown size={14} color={colors.accentWarm} />
            <Text style={[styles.proBadgeText, { color: colors.accentWarm }]}>PRO ÜYELİK</Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
            onPress={onClose}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* HERO TITLE */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>YDS Pratik Pro ile Hedef Puanına Ulaş</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            ÖSYM çeldirici tuzaklarını tespit eden AI sınav koçu, 80 soruluk tam master denemeler ve sınırsız kelime hafızası.
          </Text>
        </View>

        {/* PROMO CODE BOX */}
        <View style={[styles.promoCard, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
          <View style={styles.promoHead}>
            <Tag size={15} color={colors.brand} />
            <Text style={[styles.promoTitle, { color: colors.text }]}>İndirim Kuponu</Text>
          </View>

          <View style={styles.promoInputRow}>
            <TextInput
              style={[
                styles.promoInput,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Kupon kodunuz varsa buraya girin"
              placeholderTextColor={colors.textSecondary}
              value={promoInput}
              onChangeText={(text) => {
                setPromoInput(text);
                setPromoError(null);
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.promoApplyBtn, { backgroundColor: colors.brand }]}
              onPress={handleApplyPromo}
              activeOpacity={0.8}
            >
              <Text style={[styles.promoApplyText, { color: colors.textOnBrand }]}>
                {isValidatingPromo ? '...' : 'Uygula'}
              </Text>
            </TouchableOpacity>
          </View>

          {activePromo && (
            <View style={[styles.promoSuccessBanner, { backgroundColor: colors.successLight }]}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={[styles.promoSuccessText, { color: colors.success }]}>
                {activePromo.teacherName} %{activePromo.discountPercent} İndirimi Başarıyla Uygulandı!
              </Text>
            </View>
          )}

          {promoError && <Text style={[styles.promoErrorText, { color: colors.error }]}>{promoError}</Text>}
        </View>

        {/* PLANS SELECTION */}
        <Text style={[styles.plansSectionHeading, { color: colors.text }]}>Bir Hazırlık Paketi Seçin</Text>
        <View style={styles.plansList}>
          {calculatedPlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const hasDiscount = Boolean(plan.discountedPrice);

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isSelected ? colors.brandLight : colors.cardBackground,
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
                      {
                        backgroundColor: plan.isPopular ? colors.brand : colors.accentWarm,
                      },
                    ]}
                  >
                    <Text style={[styles.planBadgeText, { color: colors.textOnBrand }]}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                    <Text style={[styles.planDuration, { color: colors.textSecondary }]}>{plan.durationMonths} Ay Tam Erişim</Text>
                  </View>

                  <View style={styles.priceContainer}>
                    {hasDiscount ? (
                      <>
                        <Text style={[styles.originalPriceStriked, { color: colors.textSecondary }]}>{plan.originalPrice} TL</Text>
                        <Text style={[styles.discountedPriceBig, { color: colors.brand }]}>{plan.discountedPrice} TL</Text>
                      </>
                    ) : (
                      <Text style={[styles.originalPriceBig, { color: colors.text }]}>{plan.originalPrice} TL</Text>
                    )}
                  </View>
                </View>

                {/* Features bullet points */}
                <View style={[styles.planFeatures, { borderTopColor: colors.border }]}>
                  {plan.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Zap size={13} color={colors.brand} />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.brand }]}
          onPress={() => handleSubscribe(selectedPlanId)}
          activeOpacity={0.85}
        >
          <Sparkles size={18} color={colors.textOnBrand} />
          <Text style={[styles.ctaButtonText, { color: colors.textOnBrand }]}>
            {(() => {
              const active = calculatedPlans.find((p) => p.id === selectedPlanId);
              const price = active?.discountedPrice || active?.originalPrice || 399;
              return `Hemen Başla · ${price} TL`;
            })()}
          </Text>
        </TouchableOpacity>

        {/* TRUST BADGE */}
        <View style={styles.trustFooter}>
          <ShieldCheck size={16} color={colors.success} />
          <Text style={[styles.trustFooterText, { color: colors.textSecondary }]}>
            Güvenli Ödeme · İptal Garantisi · Sınav Odaklı Müfredat
          </Text>
        </View>
      </ScrollView>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  promoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  promoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  promoApplyBtn: {
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  promoSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  promoSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  promoErrorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  plansSectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  plansList: {
    gap: 14,
    marginBottom: 24,
  },
  planCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPriceStriked: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  discountedPriceBig: {
    fontSize: 20,
    fontWeight: '900',
  },
  originalPriceBig: {
    fontSize: 18,
    fontWeight: '800',
  },
  planFeatures: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  trustFooterText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
