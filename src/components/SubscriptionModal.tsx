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

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ visible, onClose }) => {
  const { userProfile, setUserProfile } = useLearningStore();

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
      'YDS Master Pro Aktivasyonu',
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
              'YDS Master Pro üyeliğiniz başarıyla aktif edildi. Sınav gününe kadar tüm AI koçluk ve master denemelere sınırsız erişebilirsiniz!'
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
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP CLOSE ROW */}
        <View style={styles.topRow}>
          <View style={styles.proBadge}>
            <Crown size={14} color="#D97706" />
            <Text style={styles.proBadgeText}>PRO ÜYELİK</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* HERO TITLE */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>YDS Master Pro ile Hedef Puanına Ulaş</Text>
          <Text style={styles.heroSubtitle}>
            ÖSYM çeldirici tuzaklarını tespit eden AI sınav koçu, 80 soruluk tam master denemeler ve sınırsız kelime hafızası.
          </Text>
        </View>

        {/* PROMO CODE BOX (ALİ20 / HOCA KODU) */}
        <View style={styles.promoCard}>
          <View style={styles.promoHead}>
            <Tag size={16} color="#4F46E5" />
            <Text style={styles.promoTitle}>Hoca İndirim Kuponu</Text>
          </View>

          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Örn: ALİ20, HAKAN20"
              placeholderTextColor="#94A3B8"
              value={promoInput}
              onChangeText={(text) => {
                setPromoInput(text);
                setPromoError(null);
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.promoApplyBtn}
              onPress={handleApplyPromo}
              activeOpacity={0.8}
            >
              <Text style={styles.promoApplyText}>
                {isValidatingPromo ? 'Kontrol...' : 'Uygula'}
              </Text>
            </TouchableOpacity>
          </View>

          {activePromo && (
            <View style={styles.promoSuccessBanner}>
              <CheckCircle2 size={16} color="#059669" />
              <Text style={styles.promoSuccessText}>
                {activePromo.teacherName} %{activePromo.discountPercent} İndirimi Tanımlandı! (100 TL Tasarruf)
              </Text>
            </View>
          )}

          {promoError && <Text style={styles.promoErrorText}>{promoError}</Text>}
        </View>

        {/* PLANS SELECTION */}
        <Text style={styles.plansSectionHeading}>Bir Hazırlık Paketi Seçin</Text>
        <View style={styles.plansList}>
          {calculatedPlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const hasDiscount = Boolean(plan.discountedPrice);

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  plan.isPopular && styles.planCardPopular,
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
                activeOpacity={0.85}
              >
                {plan.badge && (
                  <View
                    style={[
                      styles.planBadge,
                      plan.isPopular ? styles.planBadgePopular : styles.planBadgeGeneric,
                    ]}
                  >
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planDuration}>{plan.durationMonths} Ay Tam Erişim</Text>
                  </View>

                  <View style={styles.priceContainer}>
                    {hasDiscount ? (
                      <>
                        <Text style={styles.originalPriceStriked}>{plan.originalPrice} TL</Text>
                        <Text style={styles.discountedPriceBig}>{plan.discountedPrice} TL</Text>
                      </>
                    ) : (
                      <Text style={styles.originalPriceBig}>{plan.originalPrice} TL</Text>
                    )}
                  </View>
                </View>

                {/* Features bullet points */}
                <View style={styles.planFeatures}>
                  {plan.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Zap size={13} color="#4F46E5" />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA ACTION BUTTON */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => handleSubscribe(selectedPlanId)}
          activeOpacity={0.85}
        >
          <Sparkles size={18} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>
            {(() => {
              const active = calculatedPlans.find((p) => p.id === selectedPlanId);
              const price = active?.discountedPrice || active?.originalPrice || 399;
              return `Hemen Başla · ${price} TL`;
            })()}
          </Text>
        </TouchableOpacity>

        {/* TRUST BADGE */}
        <View style={styles.trustFooter}>
          <ShieldCheck size={16} color="#059669" />
          <Text style={styles.trustFooterText}>
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  heroSection: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  promoCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#334155',
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  promoApplyBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promoSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  promoSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    flex: 1,
  },
  promoErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 8,
  },
  plansSectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  plansList: {
    gap: 14,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#F5F3FF',
  },
  planCardPopular: {
    borderColor: '#7C3AED',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgePopular: {
    backgroundColor: '#7C3AED',
  },
  planBadgeGeneric: {
    backgroundColor: '#059669',
  },
  planBadgeText: {
    color: '#FFFFFF',
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
    color: '#0F172A',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPriceStriked: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountedPriceBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4F46E5',
  },
  originalPriceBig: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  planFeatures: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  ctaButtonText: {
    color: '#FFFFFF',
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
    color: '#64748B',
  },
});
