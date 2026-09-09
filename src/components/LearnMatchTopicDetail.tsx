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
import { ArrowLeft, Star, Volume2 } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { WordWithProgress } from '../database/DatabaseService';
import { LearnMatchUnit } from '../services/vocabLearnMatchData';
import { LearnMatchWordCard } from './LearnMatchWordCard';

interface LearnMatchTopicDetailProps {
  unit: LearnMatchUnit;
  onBack: () => void;
  onToggleLearned: (word: WordWithProgress) => Promise<void>;
}

export const LearnMatchTopicDetail: React.FC<LearnMatchTopicDetailProps> = ({
  unit,
  onBack,
  onToggleLearned,
}) => {
  const { colors } = useThemeStore();

  const [studyModalVisible, setStudyModalVisible] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const words = unit.words || [];

  const handleOpenCard = (index: number) => {
    setActiveWordIndex(index);
    setStudyModalVisible(true);
  };

  const handleNextCard = () => {
    if (activeWordIndex + 1 < words.length) {
      setActiveWordIndex(activeWordIndex + 1);
    } else {
      setStudyModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Geri"
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Alt konu detayları</Text>

        {/* Flag Icons (TR & GB) */}
        <View style={styles.flagsRow}>
          <Text style={styles.flagText}>🇹🇷</Text>
          <Text style={styles.flagText}>🇬🇧</Text>
        </View>
      </View>

      {/* TOPIC BANNER */}
      <View style={[styles.topicBanner, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.topicBannerTitle, { color: colors.text }]}>{unit.title}</Text>
        <View style={styles.topicBannerStatsRow}>
          <View style={styles.starsRow}>
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text style={[styles.starsCountText, { color: colors.text }]}>
              {unit.learnedCount}
            </Text>
          </View>
          <View style={[styles.topicProgressBarTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.topicProgressBarFill,
                { width: `${unit.percentage}%`, backgroundColor: colors.brand },
              ]}
            />
          </View>
        </View>
      </View>

      {/* WORDS LIST */}
      <ScrollView
        contentContainerStyle={styles.wordsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {words.map((item, index) => {
          const isLearned = (item.box || 0) >= 2;
          const boxLevel = Math.min(3, Math.max(0, item.box || 0));

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.wordRow,
                {
                  backgroundColor: colors.cardBackground,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={() => handleOpenCard(index)}
              activeOpacity={0.7}
            >
              <View style={styles.wordInfoCol}>
                <Text style={[styles.wordText, { color: colors.text }]}>
                  {item.word}
                </Text>
                <Text style={[styles.meaningSnippetText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.meaning}
                </Text>
              </View>

              {/* Progress Indicator Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.pillTrack, { backgroundColor: colors.subtleBackground }]}>
                  <View
                    style={[
                      styles.pillFill,
                      {
                        width: isLearned ? '100%' : boxLevel > 0 ? '50%' : '15%',
                        backgroundColor: isLearned ? colors.brand : boxLevel > 0 ? '#38BDF8' : colors.border,
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.startPracticeBtn, { backgroundColor: colors.brand }]}
          onPress={() => handleOpenCard(0)}
          activeOpacity={0.88}
        >
          <Text style={styles.startPracticeBtnText}>Alıştırmaya Başla</Text>
        </TouchableOpacity>
      </View>

      {/* STUDY / FLASHCARD MODAL */}
      <Modal
        visible={studyModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setStudyModalVisible(false)}
      >
        {words[activeWordIndex] ? (
          <LearnMatchWordCard
            word={words[activeWordIndex]}
            currentIndex={activeWordIndex}
            totalCards={words.length}
            onNext={handleNextCard}
            onClose={() => setStudyModalVisible(false)}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagText: {
    fontSize: 20,
  },
  topicBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topicBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  topicBannerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicProgressBarTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  topicProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  wordsScrollContent: {
    paddingBottom: 24,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordInfoCol: {
    flex: 1,
    paddingRight: 16,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  meaningSnippetText: {
    fontSize: 13,
  },
  progressContainer: {
    width: 70,
    alignItems: 'flex-end',
  },
  pillTrack: {
    width: 60,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pillFill: {
    height: '100%',
    borderRadius: 4,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  startPracticeBtn: {
    width: '100%',
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
  startPracticeBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
