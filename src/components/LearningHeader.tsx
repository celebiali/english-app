import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Flame, GraduationCap, Sparkles, User, Target } from 'lucide-react-native';
import { AppTab, useLearningStore } from '../store/useLearningStore';

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
  const { userProfile, dailyTasksProgress } = useLearningStore();

  const totalCompleted =
    dailyTasksProgress.paragraphCompleted +
    dailyTasksProgress.clozeCompleted +
    dailyTasksProgress.sentenceCompleted +
    dailyTasksProgress.skillsCompleted;

  const getTabInfo = (tab: AppTab) => {
    switch (tab) {
      case 'TASKS':
        return { title: 'Günlük Görevler', subtitle: `${totalCompleted}/35 Soru Tamamlandı` };
      case 'EXAM':
        return { title: '180 Dk Deneme', subtitle: '80 Soru Gerçek Simülasyon' };
      case 'MISTAKES':
        return { title: 'Hata Defteri', subtitle: 'AI Çözüm & Çeldirici Analizi' };
      case 'VOCAB':
        return { title: 'Kelime & Leitner', subtitle: 'Aralıklı Tekrar Sistemi' };
    }
  };

  const info = getTabInfo(activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Left Side: Brand Logo & Title */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <GraduationCap size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>YDS Master</Text>
              <View style={styles.aiTag}>
                <Sparkles size={10} color="#7C3AED" />
                <Text style={styles.aiTagText}>PRO AI</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{info.title}</Text>
          </View>
        </View>

        {/* Right Side: Streak Badge & Profile Avatar */}
        <View style={styles.headerRightActions}>
          <View style={styles.streakBadge}>
            <Flame size={16} color="#EA580C" fill="#EA580C" />
            <Text style={styles.streakText}>{streakCount} Gün</Text>
          </View>

          {onOpenProfile && (
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={onOpenProfile}
              activeOpacity={0.8}
            >
              {userProfile ? (
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniLetter}>
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <User size={18} color="#475569" />
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
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  subtitle: {
    color: '#64748B',
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
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  streakText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '800',
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarMini: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
