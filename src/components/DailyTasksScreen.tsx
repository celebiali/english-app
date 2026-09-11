import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  ArrowRight,
  Check,
  Target,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import { useLearningStore, getTaskGoals } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { QuestionCard } from './QuestionCard';
import { LearnMatchWordCard } from './LearnMatchWordCard';
import { CardComponent } from './CardComponent';
import { YdsQuestionType, QuestionItem, OptionKey } from '../types';

interface DailyTasksScreenProps {
  onOpenMistakes?: () => void;
  onSolvingModeChange?: (isSolving: boolean) => void;
}

export const DailyTasksScreen: React.FC<DailyTasksScreenProps> = ({
  onOpenMistakes,
  onSolvingModeChange,
}) => {
  const {
    streakCount,
    questionStreakCount,
    vocabStreakCount,
    dailyTasksProgress,
    activeDailyQuestions,
    taskGoals,
    mistakes,
    answerDailyQuestion,
    setActiveTab,
    loadDailyTasks,
    loadVocabSession,
    resetVocabSession,
    completedTodayCount,
    dailyLimit,
    sessionWords,
    currentVocabIndex,
    answerCurrentVocabCard,
    dictionaryWords,
  } = useLearningStore();

  const { colors } = useThemeStore();

  useEffect(() => {
    loadDailyTasks();
    if (!dictionaryWords || dictionaryWords.length === 0) {
      loadVocabSession();
    }
  }, []);

  // Dynamic Selected Category in Dashboard (ALL, PARAGRAPH, CLOZE_TEST, SENTENCE_COMPLETION, SKILL_DIALOGUE)
  const [selectedCategory, setSelectedCategory] = useState<YdsQuestionType | 'ALL'>('ALL');
  const [isSolvingMode, setIsSolvingMode] = useState<boolean>(false);

  // Dedicated Daily 25 Words Solving Mode
  const [isVocabSolvingMode, setIsVocabSolvingMode] = useState<boolean>(false);
  const [isVocabStudySlider, setIsVocabStudySlider] = useState<boolean>(true);
  const [vocabStudyIndex, setVocabStudyIndex] = useState<number>(0);

  useEffect(() => {
    onSolvingModeChange?.(isSolvingMode || isVocabSolvingMode);
    return () => {
      onSolvingModeChange?.(false);
    };
  }, [isSolvingMode, isVocabSolvingMode, onSolvingModeChange]);
  const [solverIndex, setSolverIndex] = useState<number>(0);
  const [dailyAnswers, setDailyAnswers] = useState<Record<string, OptionKey>>({});

  // Celebratory Completed Dialog state
  const [completedModalInfo, setCompletedModalInfo] = useState<{
    title: string;
    description: string;
    badgeEmoji: string;
    badgeCount: string;
    isVocab?: boolean;
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

  // Find nearest previous unanswered (blank) question index
  const prevUnansweredIndex = useMemo(() => {
    if (safeIndex === 0) return -1;
    for (let i = safeIndex - 1; i >= 0; i--) {
      const q = filteredActiveQuestions[i];
      if (q && !dailyAnswers[q.id]) {
        return i;
      }
    }
    return -1;
  }, [filteredActiveQuestions, safeIndex, dailyAnswers]);

  const isPrevDisabled = prevUnansweredIndex === -1;

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
    if (dailyAnswers[question.id]) return;
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
    if (prevUnansweredIndex !== -1) {
      setSolverIndex(prevUnansweredIndex);
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

  const totalVaultWords = (dictionaryWords || []).length;
  // If user has words in their vault, goal cannot exceed available words; otherwise fallback to dailyLimit
  const vocabGoal = totalVaultWords > 0
    ? Math.min(dailyLimit || 25, totalVaultWords)
    : (dailyLimit || 25);

  // Authoritative completed count from SQLite and store
  const actualVocabDone = Math.max(
    dailyTasksProgress?.vocabCompleted || 0,
    completedTodayCount || 0
  );
  const vocabCompleted = Math.min(vocabGoal, actualVocabDone);
  const vocabCompletionPercentage = vocabGoal > 0 ? Math.min(100, Math.round((vocabCompleted / vocabGoal) * 100)) : 0;

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
      title: 'Günün Kelime\nHedefi',
      iconEmoji: '🔤',
      completed: vocabCompleted,
      goal: vocabGoal,
      isVocab: true,
      fullWidth: true,
    },
  ];

  const handleStartVocab = async () => {
    let words = sessionWords;
    if (!words || words.length === 0 || words.length > (vocabGoal || 25)) {
      await loadVocabSession(true);
      words = useLearningStore.getState().sessionWords;
    }
    setVocabStudyIndex(0);
    setIsVocabStudySlider(true);
    setIsVocabSolvingMode(true);
  };

  const handleCardPress = (task: typeof tasksList[0]) => {
    const isDone = task.completed >= task.goal;
    if (task.isVocab) {
      if (isDone) {
        setCompletedModalInfo({
          title: 'Kelime Hedefi Tamamlandı',
          description: `Bugünkü ${task.goal} kelimelik hedefini tamamladın.`,
          badgeEmoji: '🔤',
          badgeCount: `${task.goal} / ${task.goal}`,
          isVocab: true,
        });
        return;
      }
      handleStartVocab();
      return;
    }

    if (isDone) {
      setCompletedModalInfo({
        title: `${task.title.replace('\n', ' ')} Tamamlandı`,
        description: `Bugünkü ${task.goal} soruluk hedefini tamamladın.`,
        badgeEmoji: task.iconEmoji,
        badgeCount: `${task.goal} / ${task.goal}`,
        isVocab: false,
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
        title: 'Günlük Hedef Tamamlandı',
        description: `Bugünkü ${dailyGoalTotal} soruluk soru kotanı tamamladın.`,
        badgeEmoji: '🎯',
        badgeCount: `${dailyGoalTotal} / ${dailyGoalTotal}`,
        isVocab: false,
      });
      return;
    }
    handleStartCategory('ALL');
  };

  // =========================================================================
  // VIEW: DEDICATED DAILY VOCABULARY SESSION (GÜNÜN 25 KELİMESİ)
  // =========================================================================
  if (isVocabSolvingMode) {
    const dailyBatchWords = (sessionWords || []).slice(0, vocabGoal || 25);

    // Phase 1: Study Slider Phase (Kelimeleri Tanıma / Kart İnceleme)
    if (isVocabStudySlider && dailyBatchWords.length > 0) {
      const currentStudyWord = dailyBatchWords[vocabStudyIndex] || dailyBatchWords[0];
      const isLastCard = vocabStudyIndex >= dailyBatchWords.length - 1;

      return (
        <LearnMatchWordCard
          word={currentStudyWord}
          currentIndex={vocabStudyIndex}
          totalCards={dailyBatchWords.length}
          nextButtonText={isLastCard ? 'Alıştırmaya Başla 🚀' : 'Sonraki'}
          onNext={() => {
            if (!isLastCard) {
              setVocabStudyIndex((prev) => prev + 1);
            } else {
              setIsVocabStudySlider(false);
            }
          }}
          onPrev={
            vocabStudyIndex > 0
              ? () => {
                  setVocabStudyIndex((prev) => Math.max(0, prev - 1));
                }
              : undefined
          }
          onClose={() => {
            setIsVocabSolvingMode(false);
            loadDailyTasks();
          }}
        />
      );
    }

    // Phase 2: Practice Quiz Phase (Aktif Hatırlama & Tureng / AI Kontrolü)
    const currentCard = dailyBatchWords[currentVocabIndex] || null;
    const isFinished = currentVocabIndex >= dailyBatchWords.length;
    const totalCount = dailyBatchWords.length;
    const progressPercent = totalCount > 0 ? Math.min(100, Math.round(((currentVocabIndex + 1) / totalCount) * 100)) : 0;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.practiceTopBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setIsVocabSolvingMode(false);
              loadDailyTasks();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Kapat"
          >
            <X size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.practiceTitleCenter}>
            <Text style={[styles.practiceTitle, { color: colors.text }]}>
              Günün Kelime Alıştırması
            </Text>
            {totalCount > 0 && !isFinished && (
              <Text style={[styles.practiceCounterText, { color: colors.textSecondary }]}>
                {currentVocabIndex + 1} / {totalCount}
              </Text>
            )}
          </View>
          <View style={{ width: 32 }} />
        </View>

        {totalCount > 0 && !isFinished && (
          <View style={[styles.practiceProgressBarTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.practiceProgressBarFill,
                { width: `${progressPercent}%`, backgroundColor: colors.brand },
              ]}
            />
          </View>
        )}

        {!isFinished && currentCard ? (
          <ScrollView
            contentContainerStyle={styles.practiceScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CardComponent
              cardWord={currentCard}
              onAnswer={async (isCorrect) => {
                await answerCurrentVocabCard(isCorrect);
              }}
              cardIndex={currentVocabIndex}
              totalCards={dailyBatchWords.length || 0}
            />
          </ScrollView>
        ) : (
          <View style={styles.sessionFinishedCenter}>
            <CheckCircle2 size={54} color="#10B981" />
            <Text style={[styles.finishedTitleText, { color: colors.text }]}>
              Harika! Günün Kelime Hedefi Tamamlandı 🎉
            </Text>
            <Text style={[styles.finishedSubText, { color: colors.textSecondary }]}>
              Bugünkü kelimeler hafıza kutularına başarıyla kaydedildi.
            </Text>
            <TouchableOpacity
              style={[styles.finishBtn, { backgroundColor: colors.brand }]}
              onPress={() => {
                setIsVocabSolvingMode(false);
                loadDailyTasks();
              }}
            >
              <Text style={styles.finishBtnText}>Görevlere Dön</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Geri"
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2.4} />
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
                      {vocabStreakCount >= 2 && (
                        <View style={[styles.vocabStreakPill, { backgroundColor: colors.accentWarmLight }]}>
                          <Text style={[styles.vocabStreakText, { color: colors.accentWarm }]}>⚡ {vocabStreakCount} Gün Seri</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.mCount, { color: colors.textSecondary }]}>
                      {isDone ? `${task.goal} / ${task.goal} kelime hafızaya alındı` : `${task.completed} / ${task.goal} kelime çalışıldı`}
                    </Text>
                  </View>
                  <ArrowRight size={18} color={colors.textSecondary} style={{ marginLeft: 6 }} />
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

            {!completedModalInfo?.isVocab && questionStreakCount > 0 && (
              <View style={[styles.modalStreakPill, { backgroundColor: colors.accentWarmLight }]}>
                <Text style={[styles.modalStreakText, { color: colors.accentWarm }]}>🔥 {questionStreakCount} Günlük Seri</Text>
              </View>
            )}

            <View style={styles.modalButtonsRow}>
              {!completedModalInfo?.isVocab && mistakes.length > 0 && onOpenMistakes && (
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
                <Text style={[styles.modalPrimaryBtnText, { color: colors.textOnBrand }]}>Tamam</Text>
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
          <Text style={[styles.homeMistakeBadgeNumber, { color: colors.brand }]}>
            {mistakes.length}
          </Text>
          <Text style={[styles.homeMistakeBadgeLabel, { color: colors.brand }]}>
            Soru
          </Text>
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
    paddingTop: 4,
    paddingBottom: 36,
  },
  compactHeroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  compactHeroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  compactHeroBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactHeroIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  compactHeroPercentPill: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  compactHeroPercentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  compactHeroMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  compactHeroStatGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  compactHeroNumber: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  compactHeroTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  compactHeroUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactHeroProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  compactHeroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  compactHeroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactHeroFooterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactHeroDoneText: {
    fontSize: 12,
    fontWeight: '700',
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
  vocabStreakPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  vocabStreakText: {
    fontSize: 10.5,
    fontWeight: '700',
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
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeMistakeBadgeNumber: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  homeMistakeBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
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
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
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
  // Practice Screen Styles
  practiceTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  practiceTitleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  practiceCounterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  practiceProgressBarTrack: {
    width: '100%',
    height: 3,
  },
  practiceProgressBarFill: {
    height: '100%',
  },
  practiceScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  sessionFinishedCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  finishedTitleText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  finishedSubText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  finishBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
