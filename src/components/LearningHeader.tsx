import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Flame, GraduationCap, Sparkles, User } from 'lucide-react-native';
import { AppTab, useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';

export interface LearningHeaderProps {
  activeTab: AppTab;
  streakCount?: number;
  onOpenProfile?: () => void;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  activeTab,
  streakCount = 1,
  onOpenProfile,
}) => {
  const { userProfile, dailyTasksProgress, dailyQuestionTarget } = useLearningStore();
  const { colors } = useThemeStore();

  const totalCompleted =
    dailyTasksProgress.paragraphCompleted +
    dailyTasksProgress.clozeCompleted +
    dailyTasksProgress.sentenceCompleted +
    dailyTasksProgress.skillsCompleted;

  const target = dailyQuestionTarget || 35;

  const getTabInfo = (tab: AppTab) => {
    switch (tab) {
      case 'TASKS':
        return { title: 'Günlük Görevler', subtitle: `${totalCompleted}/${target} Soru Tamamlandı` };
      case 'EXAM':
        return { title: '180 Dk Deneme', subtitle: '80 Soru Gerçek Simülasyon' };
      case 'MISTAKES':
        return { title: 'Hata Defteri', subtitle: 'AI Çözüm & Çeldirici Analizi' };
      case 'VOCAB':
        return { title: 'Kelime Havuzu', subtitle: 'Aralıklı Tekrar Sistemi' };
    }
  };

  const info = getTabInfo(activeTab);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
      <View style={styles.headerRow}>
        {/* Left Side: Brand Logo & Title */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoBadge, { backgroundColor: colors.brand }]}>
            <GraduationCap size={20} color={colors.textOnBrand} strokeWidth={2.2} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.appTitle, { color: colors.text }]}>YDS Pratik</Text>
              <View style={[styles.aiTag, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
                <Sparkles size={10} color={colors.brand} />
                <Text style={[styles.aiTagText, { color: colors.brand }]}>PRO AI</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{info.title}</Text>
          </View>
        </View>

        {/* Right Side: Streak Badge & Profile Avatar */}
        <View style={styles.headerRightActions}>
          <View style={[styles.streakBadge, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
            <Flame size={15} color={colors.accentWarm} fill={colors.accentWarm} />
            <Text style={[styles.streakText, { color: colors.text }]}>{streakCount} Gün</Text>
          </View>

          {onOpenProfile && (
            <TouchableOpacity
              style={[styles.profileBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={onOpenProfile}
              activeOpacity={0.8}
            >
              {userProfile ? (
                <View style={[styles.avatarMini, { backgroundColor: colors.brand }]}>
                  <Text style={[styles.avatarMiniLetter, { color: colors.textOnBrand }]}>
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              ) : (
                <User size={18} color={colors.textSecondary} />
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
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '800',
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
