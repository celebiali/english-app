import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  ChevronLeft,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import { useLearningStore, getTaskGoals } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { QuestionCard } from './QuestionCard';
import { YdsQuestionType, QuestionItem, OptionKey } from '../types';

interface DailyTasksScreenProps {
  onOpenMistakes?: () => void;
}

export const DailyTasksScreen: React.FC<DailyTasksScreenProps> = ({ onOpenMistakes }) => {
  const {
    streakCount,
    dailyTasksProgress,
    activeDailyQuestions,
    taskGoals,
    mistakes,
    answerDailyQuestion,
    setActiveTab,
    loadDailyTasks,
    completedTodayCount,
    dailyLimit,
  } = useLearningStore();

  const { colors } = useThemeStore();

  // Dynamic Selected Category in Dashboard (ALL, PARAGRAPH, CLOZE_TEST, SENTENCE_COMPLETION, SKILL_DIALOGUE)
  const [selectedCategory, setSelectedCategory] = useState<YdsQuestionType | 'ALL'>('ALL');
  const [isSolvingMode, setIsSolvingMode] = useState<boolean>(false);
  const [solverIndex, setSolverIndex] = useState<number>(0);
  const [dailyAnswers, setDailyAnswers] = useState<Record<string, OptionKey>>({});

  // Celebratory Completed Dialog state
  const [completedModalInfo, setCompletedModalInfo] = useState<{
    title: string;
    description: string;
    badgeEmoji: string;
    badgeCount: string;
  } | null>(null);

  // Filtered active questions based on category selection
  const filteredActiveQuestions = useMemo(() => {
    if (selectedCategory === 'ALL') return activeDailyQuestions;
    if (selectedCategory === 'SKILL_DIALOGUE') {
      return activeDailyQuestions.filter(
        (q) =>
          q.type === 'SKILL_DIALOGUE' ||
          q.type === 'RESTATEMENT' ||
          q.type === 'TRANSLATION' ||
          q.type === 'VOCABULARY_GRAMMAR'
      );
    }
    return activeDailyQuestions.filter((q) => q.type === selectedCategory);
  }, [activeDailyQuestions, selectedCategory]);

  const currentQuestion = filteredActiveQuestions[solverIndex] || null;
  const safeIndex = Math.min(solverIndex, Math.max(0, filteredActiveQuestions.length - 1));
  const isLastQuestion = safeIndex >= filteredActiveQuestions.length - 1;

  // Check if any question prior to current index has been marked/answered
  const hasAnsweredPreviousQuestion = useMemo(() => {
    if (safeIndex === 0) return false;
    return filteredActiveQuestions.slice(0, safeIndex).some((q) => !!dailyAnswers[q.id]);
  }, [filteredActiveQuestions, safeIndex, dailyAnswers]);

  const isPrevDisabled = safeIndex === 0 || !hasAnsweredPreviousQuestion;

  const handleStartCategory = (type: YdsQuestionType | 'ALL') => {
    setSelectedCategory(type);
    setSolverIndex(0);
    setIsSolvingMode(true);
  };

  const handleExitSolver = () => {
    setIsSolvingMode(false);
    setSelectedCategory('ALL');
    setSolverIndex(0);
    loadDailyTasks();
  };

  const handleAnswerQuestion = (question: QuestionItem, opt: OptionKey) => {
    setDailyAnswers((prev) => ({ ...prev, [question.id]: opt }));
    answerDailyQuestion(question, opt);
  };

  const handleNextQuestion = () => {
    if (safeIndex < filteredActiveQuestions.length - 1) {
      setSolverIndex(safeIndex + 1);
    } else {
      handleExitSolver();
    }
  };

  const handlePrevQuestion = () => {
    if (!isPrevDisabled && safeIndex > 0) {
      setSolverIndex(safeIndex - 1);
    }
  };

  // Dynamic Completed Counts
  const paragraphCompleted = dailyTasksProgress.paragraphCompleted || 0;
  const clozeCompleted = dailyTasksProgress.clozeCompleted || 0;
  const sentenceCompleted = dailyTasksProgress.sentenceCompleted || 0;
  const skillsCompleted = dailyTasksProgress.skillsCompleted || 0;

  const goals = taskGoals || { paragraph: 8, cloze: 5, sentence: 8, skills: 14 };
  const dailyGoalTotal = goals.paragraph + goals.cloze + goals.sentence + goals.skills;
  const totalCompleted = Math.min(dailyGoalTotal, paragraphCompleted + clozeCompleted + sentenceCompleted + skillsCompleted);
  const remainingCount = Math.max(0, dailyGoalTotal - totalCompleted);
  const completionPercentage = dailyGoalTotal > 0 ? Math.min(100, Math.round((totalCompleted / dailyGoalTotal) * 100)) : 0;

  // Dynamic Active Counts per Category
  const paragraphActiveCount = activeDailyQuestions.filter((q) => q.type === 'PARAGRAPH').length;
  const clozeActiveCount = activeDailyQuestions.filter((q) => q.type === 'CLOZE_TEST').length;
  const sentenceActiveCount = activeDailyQuestions.filter((q) => q.type === 'SENTENCE_COMPLETION').length;
  const skillsActiveCount = activeDailyQuestions.filter(
    (q) =>
      q.type === 'SKILL_DIALOGUE' ||
      q.type === 'RESTATEMENT' ||
      q.type === 'TRANSLATION' ||
      q.type === 'VOCABULARY_GRAMMAR'
  ).length;

  const vocabGoal = dailyLimit || 25;
  const vocabCompleted = Math.min(vocabGoal, completedTodayCount || 0);

  const tasksList = [
    {
      id: 'PARAGRAPH',
      type: 'PARAGRAPH' as YdsQuestionType,
      title: 'Paragraf\nSoruları',
      iconEmoji: '📖',
      completed:
        paragraphActiveCount === 0 && paragraphCompleted > 0
          ? goals.paragraph
          : Math.min(goals.paragraph, paragraphCompleted),
      goal: goals.paragraph,
      isVocab: false,
      fullWidth: false,
    },
    {
      id: 'CLOZE_TEST',
      type: 'CLOZE_TEST' as YdsQuestionType,
      title: 'Cloze Test\nSoruları',
      iconEmoji: '📝',
      completed:
        clozeActiveCount === 0 && clozeCompleted > 0
          ? goals.cloze
          : Math.min(goals.cloze, clozeCompleted),
      goal: goals.cloze,
      isVocab: false,
      fullWidth: false,
    },
    {
      id: 'SENTENCE_COMPLETION',
      type: 'SENTENCE_COMPLETION' as YdsQuestionType,
      title: 'Cümle\nTamamlama',
      iconEmoji: '🔗',
      completed:
        sentenceActiveCount === 0 && sentenceCompleted > 0
          ? goals.sentence
          : Math.min(goals.sentence, sentenceCompleted),
      goal: goals.sentence,
      isVocab: false,
      fullWidth: false,
    },
    {
      id: 'SKILL_DIALOGUE',
      type: 'SKILL_DIALOGUE' as YdsQuestionType,
      title: 'Diyalog &\nDil Bilgisi',
      iconEmoji: '💬',
      completed:
        skillsActiveCount === 0 && skillsCompleted > 0
          ? goals.skills
          : Math.min(goals.skills, skillsCompleted),
      goal: goals.skills,
      isVocab: false,
      fullWidth: false,
    },
    {
      id: 'VOCABULARY',
      type: undefined,
      title: 'Günün Kelime Hedefi',
      iconEmoji: '🔤',
      completed: vocabCompleted,
      goal: vocabGoal,
      isVocab: true,
      fullWidth: true,
    },
  ];

  const handleCardPress = (task: typeof tasksList[0]) => {
    const isDone = task.completed >= task.goal;
    if (task.isVocab) {
      if (isDone) {
        setCompletedModalInfo({
          title: `Günün Kelime Hedefi Tamamlandı! 🎉`,
          description: `Bugünkü ${task.goal} kelimelik aralıklı tekrar çalışmasını başarıyla bitirdin. Yarın yeni kelimelerle hafızanı güçlendirmeye devam edeceğiz! 🚀`,
          badgeEmoji: '🔤',
          badgeCount: `${task.goal} / ${task.goal}`,
        });
        return;
      }
      setActiveTab('VOCAB');
      return;
    }

    if (isDone) {
      setCompletedModalInfo({
        title: `${task.title.replace('\n', ' ')} Tamamlandı! 🎉`,
        description: `Bugünkü ${task.goal} soruluk hedefini başarıyla bitirdin. Bu bölüm için yeni sorular yarın yüklenecektir, yarın tekrar gel! 🚀`,
        badgeEmoji: task.iconEmoji,
        badgeCount: `${task.goal} / ${task.goal}`,
      });
      return;
    }
    if (task.type) {
      handleStartCategory(task.type);
    }
  };

  const handleArenaPress = () => {
    if (remainingCount === 0 || activeDailyQuestions.length === 0) {
      setCompletedModalInfo({
        title: 'Tüm Günlük Hedef Tamamlandı! 🏆',
        description: `Tebrikler! Bugünkü ${dailyGoalTotal} soruluk YDS soru kotanı %100 başarıyla tamamladın. Yeni soru seti için yarın tekrar gel!`,
        badgeEmoji: '🎯',
        badgeCount: `${dailyGoalTotal} / ${dailyGoalTotal}`,
      });
      return;
    }
    handleStartCategory('ALL');
  };

  // =========================================================================
  // VIEW 2: DEDICATED QUESTION SOLVER VIEW (SCREEN 2)
  // =========================================================================
  if (isSolvingMode && currentQuestion) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Solver Top Navigation */}
        <View style={[styles.solverHeader, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleExitSolver}
            activeOpacity={0.7}
          >
            <View style={[styles.backIconCircle, { backgroundColor: colors.subtleBackground }]}>
              <ChevronLeft size={18} color={colors.text} />
            </View>
            <Text style={[styles.backBtnText, { color: colors.text }]}>Geri Dön</Text>
          </TouchableOpacity>

          <View style={[styles.solverCounterBadge, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.solverCounterText, { color: colors.brand }]}>
              {filteredActiveQuestions.length > 0 ? `${safeIndex + 1} / ${filteredActiveQuestions.length}` : '0 / 0'}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionIndex={safeIndex}
            totalQuestions={filteredActiveQuestions.length}
            mode="PRACTICE"
            selectedOption={dailyAnswers[currentQuestion.id] || null}
            onSelectOption={(opt) => handleAnswerQuestion(currentQuestion, opt)}
            onNext={handleNextQuestion}
            hasNext={safeIndex < filteredActiveQuestions.length - 1}
          />

          {/* Bottom Next / Prev Navigation */}
          <View style={[styles.bottomSolverNav, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.navBtnPrev,
                { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                isPrevDisabled && styles.navBtnDisabled,
              ]}
              disabled={isPrevDisabled}
              onPress={handlePrevQuestion}
              activeOpacity={0.7}
            >
              <Text style={[styles.navBtnPrevText, { color: isPrevDisabled ? colors.textSecondary : colors.text }]}>
                ← Önceki Soru
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navBtnNext,
                { backgroundColor: isLastQuestion ? colors.success : colors.brand },
              ]}
              onPress={handleNextQuestion}
              activeOpacity={0.8}
            >
              <Text style={[styles.navBtnNextText, { color: colors.textOnBrand }]}>
                {isLastQuestion ? 'Tamamla & Çık ✓' : 'Sonraki Soru →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: DASHBOARD VIEW
  // =========================================================================
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 🎯 GÜNLÜK HEDEF KARTI */}
      <View
        style={[
          styles.heroBanner,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
          },
        ]}
      >
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroHeaderTitleGroup}>
            <View style={[styles.heroGoalDot, { backgroundColor: colors.brand }]} />
            <Text style={[styles.heroGoalLabel, { color: colors.brand }]}>GÜNLÜK HEDEF</Text>
          </View>

          {streakCount > 0 && (
            <View style={[styles.streakPill, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
              <Text style={[styles.streakPillText, { color: colors.textSecondary }]}>🔥 {streakCount} Günlük Seri</Text>
            </View>
          )}
        </View>

        <View style={styles.heroTargetMainRow}>
          <Text style={[styles.heroTargetText, { color: colors.text }]}>{dailyGoalTotal} Soru</Text>
          <View style={[styles.heroPercentBadge, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.heroPercentText, { color: colors.brand }]}>%{completionPercentage}</Text>
          </View>
        </View>

        {/* Progress Bar Track */}
        <View style={[styles.heroProgressTrack, { backgroundColor: colors.subtleBackground }]}>
          <View
            style={[
              styles.heroProgressFill,
              { width: `${completionPercentage}%`, backgroundColor: colors.brand },
            ]}
          />
        </View>

        {/* Bottom Sub Info */}
        <View style={styles.heroBottomRow}>
          <Text style={[styles.heroCompletedInfo, { color: colors.textSecondary }]}>
            {totalCompleted} / {dailyGoalTotal} Çözüldü
          </Text>
          <Text style={[styles.heroRemainingInfo, { color: colors.brand }]}>
            {remainingCount > 0 ? `${remainingCount} Soru Kaldı` : 'Hedef Tamamlandı 🎉'}
          </Text>
        </View>
      </View>

      {/* SECTION: GÜNLÜK GÖREVLER */}
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Görevler</Text>
      </View>

      {/* 2 SÜTUNLU MODÜL GRID & KELİME KARTI */}
      <View style={styles.moduleGrid}>
        {tasksList.map((task) => {
          const isDone = task.completed >= task.goal;
          const progressPercent = Math.min(100, Math.round((task.completed / task.goal) * 100));

          return (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.moduleCard,
                task.fullWidth && styles.moduleCardFullWidth,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                },
                isDone && styles.moduleCardDone,
              ]}
              onPress={() => handleCardPress(task)}
              activeOpacity={0.8}
            >
              {task.fullWidth ? (
                <View style={styles.vocabFullWidthRow}>
                  <View style={[styles.mIcon, { backgroundColor: colors.subtleBackground }]}>
                    <Text style={styles.mIconEmoji}>{task.iconEmoji}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.mTitleFull, { color: colors.text }]}>{task.title}</Text>
                      {isDone && (
                        <View style={[styles.mDoneBadge, { backgroundColor: colors.brandLight }]}>
                          <Check size={12} color={colors.brand} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.mCount, { color: colors.textSecondary }]}>
                      {isDone ? `${task.goal} / ${task.goal} kelime hafızaya alındı` : `${task.completed} / ${task.goal} kelime çalışıldı`}
                    </Text>
                  </View>
                  <ArrowRight size={16} color={colors.brand} style={{ marginLeft: 6 }} />
                </View>
              ) : (
                <>
                  <View style={styles.moduleCardTopRow}>
                    <View style={[styles.mIcon, { backgroundColor: colors.subtleBackground }]}>
                      <Text style={styles.mIconEmoji}>{task.iconEmoji}</Text>
                    </View>

                    {isDone && (
                      <View style={[styles.mDoneBadge, { backgroundColor: colors.brandLight }]}>
                        <Check size={12} color={colors.brand} strokeWidth={3} />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.mTitle, { color: colors.text }]}>{task.title}</Text>
                  <Text style={[styles.mCount, { color: colors.textSecondary }]}>
                    {isDone ? `${task.goal} / ${task.goal} tamamlandı` : `${task.completed} / ${task.goal} tamam`}
                  </Text>
                </>
              )}

              {/* Alt İlerleme Çubuğu */}
              <View style={[styles.mBar, { backgroundColor: colors.subtleBackground }]}>
                <View
                  style={[
                    styles.mBarFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: colors.brand,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SECTION: AKTİF SORU ALANI (Sadece çözülecek soru varsa gösterilir) */}
      {remainingCount > 0 && activeDailyQuestions.length > 0 && (
        <>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktif Soru Alanı</Text>
          </View>

          {/* ARENA KARTI */}
          <TouchableOpacity
            style={[
              styles.arenaCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
              },
            ]}
            onPress={handleArenaPress}
            activeOpacity={0.8}
          >
            <View style={[styles.arenaBadge, { backgroundColor: colors.brandLight }]}>
              <Text style={[styles.arenaBadgeNumber, { color: colors.brand }]}>
                {remainingCount}
              </Text>
              <Text style={[styles.arenaBadgeLabel, { color: colors.brand }]}>
                Soru
              </Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={[styles.arenaTitle, { color: colors.text }]}>
                Soru Çözümüne Devam Et
              </Text>
              <Text style={[styles.arenaSubtitle, { color: colors.textSecondary }]}>
                {`${remainingCount} aktif soru çözüm bekliyor`}
              </Text>
            </View>

            <ArrowRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}

      {/* 🏆 COMPLETED INFO CELEBRATION MODAL DIALOG */}
      <Modal
        visible={!!completedModalInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletedModalInfo(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={[styles.modalIconBubble, { backgroundColor: colors.successLight }]}>
              <Text style={styles.modalEmojiText}>{completedModalInfo?.badgeEmoji || '🎉'}</Text>
            </View>

            <View style={[styles.modalDoneBadge, { backgroundColor: colors.successLight }]}>
              <Check size={13} color={colors.success} strokeWidth={3} />
              <Text style={[styles.modalDoneBadgeText, { color: colors.success }]}>
                {completedModalInfo?.badgeCount} Tamamlandı
              </Text>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>{completedModalInfo?.title}</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>{completedModalInfo?.description}</Text>

            {streakCount > 0 && (
              <View style={[styles.modalStreakPill, { backgroundColor: colors.accentWarmLight }]}>
                <Text style={[styles.modalStreakText, { color: colors.accentWarm }]}>🔥 {streakCount} Günlük Seri Korundu</Text>
              </View>
            )}

            <View style={styles.modalButtonsRow}>
              {mistakes.length > 0 && onOpenMistakes && (
                <TouchableOpacity
                  style={[styles.modalSecondaryBtn, { borderColor: colors.border, backgroundColor: colors.subtleBackground }]}
                  onPress={() => {
                    setCompletedModalInfo(null);
                    onOpenMistakes();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalSecondaryBtnText, { color: colors.text }]}>Hata Kasasını İncele ({mistakes.length})</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.brand }]}
                onPress={() => setCompletedModalInfo(null)}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.textOnBrand }]}>Tamam, Harika!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SECTION: HATA KASASI */}
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hata Kasası</Text>
      </View>

      {/* MISTAKE VAULT QUICK ACCESS CARD */}
      <TouchableOpacity
        style={[
          styles.homeMistakeCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
          },
        ]}
        onPress={() => {
          if (onOpenMistakes) {
            onOpenMistakes();
          } else {
            setActiveTab('MISTAKES');
          }
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.homeMistakeBadge, { backgroundColor: colors.brandLight }]}>
          <Text style={[styles.homeMistakeBadgeText, { color: colors.brand }]}>{mistakes.length}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.homeMistakeTitleRow}>
            <Text style={[styles.homeMistakeTitle, { color: colors.text }]}>Kişisel Yanlış Havuzu</Text>
          </View>
          <Text style={[styles.homeMistakeSubtitle, { color: colors.textSecondary }]}>
            {mistakes.length > 0
              ? 'Yanlış yaptığın soruları AI analiziyle incele ve telafi et'
              : 'Kayıtlı hata bulunmuyor, denemelerdeki yanlışların buraya eklenir'}
          </Text>
        </View>
        <ArrowRight size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  heroBanner: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroGoalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  heroGoalLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTargetMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroTargetText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroPercentBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  heroPercentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  streakPill: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  streakPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCompletedInfo: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroRemainingInfo: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleCard: {
    width: '48.3%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  moduleCardFullWidth: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  vocabFullWidthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  mTitleFull: {
    fontSize: 14,
    fontWeight: '800',
  },
  moduleCardDone: {
    opacity: 0.8,
  },
  moduleCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mIconEmoji: {
    fontSize: 17,
  },
  mDoneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 17,
  },
  mCount: {
    fontSize: 11.5,
    marginTop: 4,
    fontWeight: '700',
  },
  mBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3.5,
  },
  mBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  arenaCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  arenaBadge: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arenaBadgeNumber: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  arenaBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  arenaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  arenaSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  homeMistakeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  homeMistakeBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeMistakeBadgeText: {
    fontSize: 15,
    fontWeight: '900',
  },
  homeMistakeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeMistakeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  homeMistakeSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },

  // Solver Styles
  solverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  solverCounterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  solverCounterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  bottomSolverNav: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navBtnPrev: {
    flex: 1,
    borderWidth: 1.5,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  navBtnPrevText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  navBtnNext: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  navBtnNextText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },

  // Celebratory Completed Modal Dialog Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalEmojiText: {
    fontSize: 30,
  },
  modalDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  modalDoneBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalStreakPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 18,
  },
  modalStreakText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalButtonsRow: {
    width: '100%',
    gap: 10,
  },
  modalPrimaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalSecondaryBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
