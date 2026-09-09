import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { ArrowLeft, ChevronRight, Star, MoreHorizontal, Crown } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { WordWithProgress } from '../database/DatabaseService';
import { LearnMatchCourse, LearnMatchUnit } from '../services/vocabLearnMatchData';
import { LearnMatchTopicDetail } from './LearnMatchTopicDetail';
import { LearnMatchWordCard } from './LearnMatchWordCard';

interface LearnMatchUnitListProps {
  course: LearnMatchCourse;
  units: LearnMatchUnit[];
  onBack: () => void;
  onToggleLearned: (word: WordWithProgress) => Promise<void>;
  onSetActiveStudyCourse?: (courseId: string) => Promise<void>;
}

export const LearnMatchUnitList: React.FC<LearnMatchUnitListProps> = ({
  course,
  units,
  onBack,
  onToggleLearned,
}) => {
  const { colors } = useThemeStore();

  const [selectedUnit, setSelectedUnit] = useState<LearnMatchUnit | null>(null);
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [practiceWordIndex, setPracticeWordIndex] = useState(0);
  const [practiceWords, setPracticeWords] = useState<WordWithProgress[]>([]);

  const completedUnitsCount = units.filter((u) => u.percentage >= 100).length;

  const handleStartPractice = (unitToPractice?: LearnMatchUnit) => {
    // If unit specified, practice that unit. Otherwise find first incomplete unit or fallback to first unit.
    const target =
      unitToPractice || units.find((u) => u.percentage < 100) || units[0];
    if (target && target.words.length > 0) {
      setPracticeWords(target.words);
      setPracticeWordIndex(0);
      setPracticeModalVisible(true);
    }
  };

  const handleNextPracticeCard = () => {
    if (practiceWordIndex + 1 < practiceWords.length) {
      setPracticeWordIndex(practiceWordIndex + 1);
    } else {
      setPracticeModalVisible(false);
    }
  };

  // If a unit is selected, show its detail view
  if (selectedUnit) {
    // Keep selectedUnit synced with units prop
    const currentUnit = units.find((u) => u.id === selectedUnit.id) || selectedUnit;
    return (
      <LearnMatchTopicDetail
        unit={currentUnit}
        onBack={() => setSelectedUnit(null)}
        onToggleLearned={onToggleLearned}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP BAR WITH BREADCRUMB & CROWN */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Geri"
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Flag + Course Name */}
        <View style={styles.breadcrumbWrapper}>
          <Text style={styles.flagIcon}>🇬🇧</Text>
          <Text style={[styles.courseTitleText, { color: colors.text }]} numberOfLines={1}>
            {course.title}
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>

        {/* Crown Score (e.g. 1/6 👑) */}
        <View style={[styles.crownBadge, { backgroundColor: colors.subtleBackground }]}>
          <Text style={[styles.crownText, { color: colors.text }]}>
            {completedUnitsCount}/{units.length}
          </Text>
          <Crown size={15} color="#EAB308" fill="#EAB308" />
        </View>
      </View>

      {/* UNITS LIST */}
      <ScrollView
        contentContainerStyle={styles.unitsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {units.map((unit) => {
          const isCompleted = unit.percentage >= 100;
          const hasProgress = unit.percentage > 0;

          return (
            <TouchableOpacity
              key={unit.id}
              style={[
                styles.unitCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={() => setSelectedUnit(unit)}
              activeOpacity={0.7}
            >
              {/* Left: Circular Percentage Indicator */}
              <View
                style={[
                  styles.percentCircle,
                  {
                    borderColor: isCompleted
                      ? colors.brand
                      : hasProgress
                      ? colors.brand
                      : colors.border,
                    backgroundColor: colors.cardBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.percentText,
                    {
                      color: isCompleted
                        ? colors.brand
                        : hasProgress
                        ? colors.text
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {unit.percentage}%
                </Text>
              </View>

              {/* Middle: Title & Stars */}
              <View style={styles.unitInfoCol}>
                <Text style={[styles.unitTitleText, { color: colors.text }]} numberOfLines={1}>
                  {unit.title}
                </Text>
                <View style={styles.starsRow}>
                  <Star size={13} color="#EAB308" fill="#EAB308" />
                  <Star size={13} color="#EAB308" fill={unit.stars >= 2 ? '#EAB308' : 'none'} />
                  <Text style={[styles.unitStatsText, { color: colors.textSecondary }]}>
                    {unit.learnedCount}/{unit.wordCount}
                  </Text>
                </View>
              </View>

              {/* Right: Arrow */}
              <View style={styles.rightArrowWrapper}>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* STICKY BOTTOM BAR: [...] & ALIŞTIRMAYA BAŞLA */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.optionsBtn, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
          onPress={() => handleStartPractice()}
          activeOpacity={0.8}
        >
          <MoreHorizontal size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainStartBtn, { backgroundColor: colors.brand }]}
          onPress={() => handleStartPractice()}
          activeOpacity={0.88}
        >
          <Text style={styles.mainStartBtnText}>Alıştırmaya Başla</Text>
        </TouchableOpacity>
      </View>

      {/* DIRECT PRACTICE FLASHCARD MODAL */}
      <Modal
        visible={practiceModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPracticeModalVisible(false)}
      >
        {practiceWords[practiceWordIndex] ? (
          <LearnMatchWordCard
            word={practiceWords[practiceWordIndex]}
            currentIndex={practiceWordIndex}
            totalCards={practiceWords.length}
            onNext={handleNextPracticeCard}
            onClose={() => setPracticeModalVisible(false)}
            onToggleLearned={onToggleLearned}
          />
        ) : null}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  breadcrumbWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
    gap: 6,
  },
  flagIcon: {
    fontSize: 18,
  },
  courseTitleText: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 180,
  },
  crownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  crownText: {
    fontSize: 13,
    fontWeight: '800',
  },
  unitsScrollContent: {
    paddingBottom: 32,
  },
  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  percentCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '800',
  },
  unitInfoCol: {
    flex: 1,
  },
  unitTitleText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unitStatsText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  rightArrowWrapper: {
    paddingLeft: 12,
  },
  stickyBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  optionsBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainStartBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  mainStartBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
