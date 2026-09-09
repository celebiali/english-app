import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  RotateCcw,
  Target,
  FileQuestion,
  Lightbulb,
  Crown,
  ArrowRight,
  X,
} from 'lucide-react-native';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgradePress: () => void;
}

export const AITestFeatureModal: React.FC<Props> = ({
  visible,
  onClose,
  onUpgradePress,
}) => {
  const { colors } = useThemeStore();

  const features = [
    {
      icon: FileQuestion,
      title: 'Kişiselleştirilmiş Soru Üretimi',
      description:
        'Paragraf, Cümle Tamamlama veya Cloze Test formatında dilediğin zorlukta ve soru sayısında sıfırdan özgün testler üretilir.',
    },
    {
      icon: RotateCcw,
      title: 'Hata Defteri Telafi Denemesi',
      description:
        'Daha önce yanlış yaptığın soruları analiz eder ve eksiklerini kapatman için sana özel telafi testleri hazırlar.',
    },
    {
      icon: Target,
      title: 'Akademik Alan & Konu Odaklı',
      description:
        'Tıp & Sağlık, Sosyal Bilimler, Ekonomi veya Fen Bilimleri gibi hedeflediğin akademik alana göre test oluşturabilirsin.',
    },
    {
      icon: Lightbulb,
      title: 'Akıllı AI Çözümleri & Açıklamalar',
      description:
        'ÖSYM soru mantığını deşifre eden, gramer ipuçları ve detaylı Türkçe açıklamalar sunan yapay zeka rehberliği.',
    },
  ];

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} height="85%">
      <View style={{ flex: 1, backgroundColor: colors.cardBackground }}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER ROW */}
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: colors.brandLight }]}>
              <Sparkles size={14} color={colors.brand} />
              <Text style={[styles.badgeText, { color: colors.brand }]}>AI TEST ÖZELLİĞİ</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Yapay Zeka Destekli{'\n'}Özel Sınav Deneyimi
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Yalnızca standart sorularla sınırlı kalma. Eksik olduğun konulara ve soru tiplerine özel sıfırdan test üret, doğrudan hedefine odaklan.
            </Text>
          </View>

          {/* FEATURE CARDS */}
          <View style={styles.featuresContainer}>
            {features.map((item, index) => {
              const IconComp = item.icon;
              return (
                <View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.subtleBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.brandLight }]}>
                    <IconComp size={20} color={colors.brand} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* PRO BANNER */}
          <View
            style={[
              styles.proCallout,
              {
                backgroundColor: colors.isDark ? '#1E293B' : '#EFF6FF',
                borderColor: colors.brandLightBorder,
              },
            ]}
          >
            <Crown size={18} color={colors.brand} />
            <Text style={[styles.proCalloutText, { color: colors.text }]}>
              AI Soru Üretimi ve Hata Telafi Testleri <Text style={{ fontWeight: '800', color: colors.brand }}>Pro Üyelik</Text> ile sınırsız olarak kullanılabilir.
            </Text>
          </View>
        </ScrollView>

        {/* PINNED BOTTOM ACTION FOOTER */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.cardBackground,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.brand }]}
            onPress={onUpgradePress}
            activeOpacity={0.85}
          >
            <Crown size={18} color={colors.textOnBrand} />
            <Text style={[styles.primaryBtnText, { color: colors.textOnBrand }]}>
              Pro Paketleri İncele
            </Text>
            <ArrowRight size={18} color={colors.textOnBrand} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
              Daha Sonra
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 8,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 27,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  featuresContainer: {
    gap: 10,
    marginBottom: 14,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
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
  proCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  proCalloutText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
