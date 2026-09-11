import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Flame, User } from 'lucide-react-native';
import { AppTab, useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { AppLogo } from './AppLogo';

export interface LearningHeaderProps {
  activeTab: AppTab;
  streakCount?: number;
  onOpenProfile?: () => void;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  activeTab,
  streakCount,
  onOpenProfile,
}) => {
  const { userProfile, streakCount: storeStreak } = useLearningStore();
  const { colors } = useThemeStore();

  const effectiveStreak = streakCount !== undefined ? streakCount : storeStreak;

  const getTabInfo = (tab: AppTab) => {
    switch (tab) {
      case 'TASKS':
        return { title: 'Günlük Görevler', subtitle: 'Soru & Kelime Pratiği' };
      case 'EXAM':
        return { title: 'Denemeler', subtitle: '80 Soru Gerçek Simülasyon' };
      case 'MISTAKES':
        return { title: 'Hata Defteri', subtitle: 'AI Çözüm Analizi' };
      case 'VOCAB':
        return { title: 'Kelime Havuzu', subtitle: 'Kurslar & Alıştırmalar' };
      case 'STATS':
        return { title: 'Gelişim & Analiz', subtitle: 'Performans Raporu' };
      default:
        return { title: 'PratikDil', subtitle: 'YDS & Sınav Hazırlık' };
    }
  };

  const info = getTabInfo(activeTab);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerRow}>
        {/* Left Side: Brand Logo & Title */}
        <View style={styles.brandContainer}>
          <AppLogo size={36} borderRadius={10} />
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.appTitle, { color: colors.text }]}>PratikDil</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{info.title}</Text>
          </View>
        </View>

        {/* Right Side: Streak Badge & Profile Avatar */}
        <View style={styles.headerRightActions}>
          {effectiveStreak > 0 && (
            <View
              style={[
                styles.streakBadge,
                {
                  backgroundColor: colors.isDark ? 'rgba(249, 115, 22, 0.12)' : '#FFF7ED',
                  borderColor: colors.isDark ? 'rgba(249, 115, 22, 0.28)' : '#FED7AA',
                },
              ]}
            >
              <Flame size={14} color="#EA580C" fill="#EA580C" />
              <Text style={[styles.streakText, { color: colors.isDark ? '#FB923C' : '#C2410C' }]}>
                {effectiveStreak} Gün
              </Text>
            </View>
          )}

          {onOpenProfile && (
            <TouchableOpacity
              style={[
                styles.profileBtn,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                },
              ]}
              onPress={() => {
                console.log('[LearningHeader] Profile pressed');
                onOpenProfile();
              }}
              hitSlop={{ top: 12, bottom: 12, left: 10, right: 12 }}
              activeOpacity={0.7}
            >
              {userProfile ? (
                <View style={[styles.avatarMini, { backgroundColor: colors.brand }]}>
                  <Text style={[styles.avatarMiniLetter, { color: colors.textOnBrand }]}>
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              ) : (
                <User size={17} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarMini: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniLetter: {
    fontSize: 14,
    fontWeight: '800',
  },
});
