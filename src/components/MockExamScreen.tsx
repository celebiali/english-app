import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Sparkles,
  ChevronLeft,
  BookOpen,
  Lock,
  Crown,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { QuestionCard } from './QuestionCard';
import { AITestGeneratorModal } from './AITestGeneratorModal';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { SubscriptionModal } from './SubscriptionModal';
import {
  EXAM_CATALOG,
  YdsExamCatalogService,
} from '../services/YdsExamCatalog';
import { QuestionItem, OptionKey } from '../types';

export const MockExamScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    currentExam,
    examState,
    examScoreCard,
    examHistory,
    startExamFromCatalog,
    startCustomAIQuiz,
    selectExamQuestion,
    answerExamQuestion,
    toggleFlagExamQuestion,
    tickExamTimer,
    finishMockExam,
    resetExam,
    isFeatureLocked,
  } = useLearningStore();

  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<'ALL' | 'MASTER' | 'ADVANCED' | 'AI'>('ALL');
  const [selectedResultToView, setSelectedResultToView] = useState<any>(null);

  // Review mode state (reviewing questions of a completed exam)
  const [isReviewingExam, setIsReviewingExam] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
  const [isReviewGridOpen, setIsReviewGridOpen] = useState(false);

  // Check if any question prior to current index has been marked/answered
  const hasAnsweredPreviousExamQuestion = useMemo(() => {
    if (!examState || examState.currentQuestionIndex === 0) return false;
    for (let i = 0; i < examState.currentQuestionIndex; i++) {
      if (examState.userAnswers[i]) {
        return true;
      }
    }
    return false;
  }, [examState?.currentQuestionIndex, examState?.userAnswers]);

  const isExamPrevDisabled = examState
    ? examState.currentQuestionIndex === 0 || !hasAnsweredPreviousExamQuestion
    : true;

  // Timer interval for active exam
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (examState && !examState.isPaused && !examState.isFinished) {
      interval = setInterval(() => {
        tickExamTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examState?.isPaused, examState?.isFinished]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCancelExam = () => {
    Alert.alert(
      'Sınavı İptal Etmek İstiyor Musunuz?',
      'Sınavı şimdi iptal ederseniz cevaplarınız kaydedilmeyecek ve sonuç listesine eklenmeyecektir.',
      [
        { text: 'Sınava Devam Et', style: 'cancel' },
        {
          text: 'Sınavı İptal Et ve Çık',
          style: 'destructive',
          onPress: () => {
            setIsGridModalOpen(false);
            resetExam();
          },
        },
      ]
    );
  };

  const handleFinishConfirm = () => {
    const answeredCount = Object.keys(examState?.userAnswers || {}).length;
    const totalQ = currentExam?.questions.length || 80;

    if (answeredCount === 0) {
      Alert.alert(
        'Soru Cevaplanmadı',
        'Henüz hiçbir soruya cevap vermediniz. Sınavı iptal etmek için sol üstteki "Çıkış" butonunu kullanabilirsiniz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    if (answeredCount < totalQ) {
      Alert.alert(
        'Sınavı Bitirmek İstiyor Musunuz?',
        `Sınavda toplam ${totalQ} soru bulunmaktadır, siz ${answeredCount} soru yanıtladınız (${totalQ - answeredCount} boş soru var).\n\nSınavı erken bitirip sonuç karnenizi görmek istiyor musunuz?`,
        [
          { text: 'Sınava Devam Et', style: 'cancel' },
          {
            text: 'Sınavı Bitir ve Sonucu Gör',
            style: 'destructive',
            onPress: () => {
              setIsGridModalOpen(false);
              finishMockExam();
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Sınavı Bitir',
      `Tüm ${totalQ} soruyu tamamladınız. Sınavınızı bitirip YDS sonuç karnenizi görmek istiyor musunuz?`,
      [
        { text: 'Kontrol Et', style: 'cancel' },
        {
          text: 'Sınavı Bitir',
          style: 'default',
          onPress: () => {
            setIsGridModalOpen(false);
            finishMockExam();
          },
        },
      ]
    );
  };

  const filteredExams = EXAM_CATALOG.filter((exam) => {
    if (catalogFilter === 'MASTER') return exam.tag === 'Master Deneme';
    if (catalogFilter === 'ADVANCED') return exam.tag === 'İleri Düzey' || exam.tag === 'Akademik Odak';
    if (catalogFilter === 'AI') return exam.tag === 'AI Özel';
    return true;
  });

  const activeScoreCard = examScoreCard || selectedResultToView;

  // Grade Theme & Colors
  const getGradeTheme = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'B':
        return {
          border: colors.success,
          bg: colors.successLight,
          text: colors.success,
          tagBg: colors.successLight,
          label: `${grade} Seviyesi (80-100 Puan)`,
          desc: 'Çok İyi / Mükemmel Akademik Başarı',
        };
      case 'C':
      case 'D':
        return {
          border: colors.accentWarm,
          bg: colors.accentWarmLight,
          text: colors.accentWarm,
          tagBg: colors.accentWarmLight,
          label: `${grade} Seviyesi (60-79 Puan)`,
          desc: 'Orta / İyi Düzey Yeterlilik',
        };
      default:
        return {
          border: colors.error,
          bg: colors.errorLight,
          text: colors.error,
          tagBg: colors.errorLight,
          label: 'Geliştirilmeli (0-59 Puan)',
          desc: 'Temel Seviye / Tekrar Gerekli',
        };
    }
  };

  const getCategoryColor = () => colors.brand;

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'PARAGRAPH':
        return 'Paragraf';
      case 'CLOZE_TEST':
        return 'Cloze Test';
      case 'SENTENCE_COMPLETION':
        return 'Cümle Tamamlama';
      case 'SKILL_DIALOGUE':
        return 'Diyalog & Skills';
      case 'RESTATEMENT':
        return 'Anlamca En Yakın';
      case 'TRANSLATION':
        return 'Çeviri (TR-EN)';
      case 'PARAGRAPH_COMPLETION':
        return 'Paragraf Tam.';
      case 'IRRELEVANT_SENTENCE':
        return 'Akışı Bozan Cümle';
      default:
        return 'Kelime & Gramer';
    }
  };

  // Helper to retrieve exam questions for review
  const getExamQuestionsForReview = (): QuestionItem[] => {
    if (activeScoreCard?.questions && activeScoreCard.questions.length > 0) {
      return activeScoreCard.questions;
    }
    if (currentExam?.questions && currentExam.questions.length > 0) {
      return currentExam.questions;
    }
    if (activeScoreCard?.examId) {
      return YdsExamCatalogService.getFullExam(activeScoreCard.examId).questions;
    }
    return [];
  };

  const getExamUserAnswersForReview = (): Record<number, OptionKey> => {
    if (activeScoreCard?.userAnswers) {
      return activeScoreCard.userAnswers;
    }
    if (examState?.userAnswers) {
      return examState.userAnswers;
    }
    return {};
  };

  // =========================================================================
  // VIEW 1.5: EXAM QUESTIONS REVIEW MODE
  // =========================================================================
  if (activeScoreCard && isReviewingExam) {
    const reviewQuestions = getExamQuestionsForReview();
    const userAnswers = getExamUserAnswersForReview();
    const totalQ = reviewQuestions.length || activeScoreCard.totalQuestions;
    const currentQ = reviewQuestions[reviewQuestionIndex];
    const userChoice = userAnswers[reviewQuestionIndex] || null;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Review Top Bar */}
        <View style={[styles.reviewTopBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.reviewBackBtn}
            onPress={() => setIsReviewingExam(false)}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={colors.brand} />
            <Text style={[styles.reviewBackBtnText, { color: colors.brand }]}>Sonuç Özetine Dön</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reviewOpticBtn, { backgroundColor: colors.subtleBackground }]}
            onPress={() => setIsReviewGridOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.reviewOpticBtnText, { color: colors.text }]}>
              ▦ Soru {reviewQuestionIndex + 1}/{totalQ}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Question Review Solver */}
        {currentQ ? (
          <View style={{ flex: 1 }}>
            <QuestionCard
              question={currentQ}
              questionIndex={reviewQuestionIndex}
              totalQuestions={totalQ}
              mode="REVIEW"
              selectedOption={userChoice}
            />

            {/* Bottom Nav Controls */}
            <View style={[styles.bottomExamNav, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.examNavBtn,
                  { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                  reviewQuestionIndex === 0 && styles.examNavBtnDisabled,
                ]}
                disabled={reviewQuestionIndex === 0}
                onPress={() => setReviewQuestionIndex((prev) => Math.max(0, prev - 1))}
                activeOpacity={0.7}
              >
                <Text style={[styles.examNavBtnText, { color: colors.text }]}>← Önceki Soru</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.examNavBtnPrimary,
                  { backgroundColor: colors.brand },
                  reviewQuestionIndex >= totalQ - 1 && styles.examNavBtnDisabled,
                ]}
                disabled={reviewQuestionIndex >= totalQ - 1}
                onPress={() => setReviewQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                activeOpacity={0.8}
              >
                <Text style={[styles.examNavBtnPrimaryText, { color: colors.textOnBrand }]}>Sonraki Soru →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyReviewBox}>
            <Text style={[styles.emptyReviewText, { color: colors.textSecondary }]}>Soru verisi bulunamadı.</Text>
          </View>
        )}

        {/* Review Optic Grid Drawer */}
        <SmoothBottomSheet
          visible={isReviewGridOpen}
          onClose={() => setIsReviewGridOpen(false)}
          maxHeight="82%"
        >
          <View style={[styles.opticSheetContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.opticHeaderRow}>
              <View>
                <Text style={[styles.opticSheetTitle, { color: colors.text }]}>Soru İnceleme Menüsü</Text>
                <Text style={[styles.opticSheetSub, { color: colors.textSecondary }]}>
                  Yeşil: Doğru · Kırmızı: Yanlış · Gri: Boş
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
                onPress={() => setIsReviewGridOpen(false)}
              >
                <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.opticGrid}>
              {reviewQuestions.map((q, idx) => {
                const ans = userAnswers[idx];
                const isCorrect = ans && ans === q.correct_option;
                const isWrong = ans && ans !== q.correct_option;
                const isCurrent = reviewQuestionIndex === idx;

                let cellStyle: any = styles.opticCell;
                let cellTextStyle: any = styles.opticCellText;

                if (isCorrect) {
                  cellStyle = [styles.opticCell, { backgroundColor: colors.successLight }];
                  cellTextStyle = [styles.opticCellText, { color: colors.success }];
                } else if (isWrong) {
                  cellStyle = [styles.opticCell, { backgroundColor: colors.errorLight }];
                  cellTextStyle = [styles.opticCellText, { color: colors.error }];
                } else {
                  cellStyle = [styles.opticCell, { backgroundColor: colors.subtleBackground }];
                  cellTextStyle = [styles.opticCellText, { color: colors.textSecondary }];
                }

                if (isCurrent) {
                  cellStyle.push([styles.opticCellCurrent, { borderColor: colors.brand }]);
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={cellStyle}
                    onPress={() => {
                      setReviewQuestionIndex(idx);
                      setIsReviewGridOpen(false);
                    }}
                  >
                    <Text style={cellTextStyle}>{idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SmoothBottomSheet>
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: SCORECARD / EXAM RESULT VIEW
  // =========================================================================
  if (activeScoreCard) {
    const gradeTheme = getGradeTheme(activeScoreCard.levelGrade || 'F');
    const correctCount = activeScoreCard.correctCount ?? 0;
    const wrongCount = activeScoreCard.wrongCount ?? 0;
    const emptyCount = activeScoreCard.emptyCount ?? 0;
    const ydsScore =
      typeof activeScoreCard.ydsScore === 'number'
        ? activeScoreCard.ydsScore.toFixed(2)
        : '0.00';

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topline} />
        <View style={styles.scoreTopRow}>
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
            {activeScoreCard.title || 'YDS Sınavı'} · SONUÇ
          </Text>
          <TouchableOpacity
            style={[styles.flagBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => {
              setSelectedResultToView(null);
              resetExam();
            }}
          >
            <Text style={[styles.flagBtnText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* GRADE RING HERO */}
        <View style={styles.scoreHero}>
          <View
            style={[
              styles.gradeRing,
              { borderColor: gradeTheme.border, backgroundColor: gradeTheme.bg },
            ]}
          >
            <View style={styles.gradeCenter}>
              <Text style={[styles.gradeLetter, { color: gradeTheme.text }]}>
                {activeScoreCard.levelGrade || 'F'}
              </Text>
              <Text style={[styles.gradeNum, { color: colors.textSecondary }]}>{ydsScore} / 100</Text>
            </View>
          </View>
          <View style={[styles.gradeDescBadge, { backgroundColor: gradeTheme.tagBg }]}>
            <Text style={[styles.gradeDescText, { color: gradeTheme.text }]}>
              {gradeTheme.label}
            </Text>
          </View>
          <Text style={[styles.gradeDescSub, { color: colors.textSecondary }]}>{gradeTheme.desc}</Text>
        </View>

        {/* STATS ROW (3 BOXES) */}
        <View style={styles.statRow}>
          <View style={[styles.statBox, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.statBoxVal, { color: colors.success }]}>{correctCount}</Text>
            <Text style={[styles.statBoxLbl, { color: colors.success }]}>DOĞRU</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.statBoxVal, { color: colors.error }]}>{wrongCount}</Text>
            <Text style={[styles.statBoxLbl, { color: colors.error }]}>YANLIŞ</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.subtleBackground }]}>
            <Text style={[styles.statBoxVal, { color: colors.textSecondary }]}>{emptyCount}</Text>
            <Text style={[styles.statBoxLbl, { color: colors.textSecondary }]}>BOŞ</Text>
          </View>
        </View>

        {/* CATEGORY BREAKDOWN */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Konu Bazlı Başarı Dağılımı</Text>
        </View>

        <View style={[styles.cardBreakdown, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {activeScoreCard.categoryBreakdown && activeScoreCard.categoryBreakdown.length > 0 ? (
            activeScoreCard.categoryBreakdown.map((cat: any) => {
              const pct = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
              const catColor = getCategoryColor();
              return (
                <View key={cat.type} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                    {getCategoryLabel(cat.type)}
                  </Text>
                  <View style={[styles.breakdownTrack, { backgroundColor: colors.subtleBackground }]}>
                    <View
                      style={[
                        styles.breakdownTrackFill,
                        { width: `${pct}%`, backgroundColor: catColor },
                      ]}
                    />
                  </View>
                  <Text style={[styles.breakdownVal, { color: colors.text }]}>
                    {cat.correct}/{cat.total} (%{pct})
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Toplam Soru</Text>
              <View style={[styles.breakdownTrack, { backgroundColor: colors.subtleBackground }]}>
                <View
                  style={[
                    styles.breakdownTrackFill,
                    {
                      width: `${
                        activeScoreCard.totalQuestions > 0
                          ? Math.round((correctCount / activeScoreCard.totalQuestions) * 100)
                          : 0
                      }%`,
                      backgroundColor: colors.brand,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.breakdownVal, { color: colors.text }]}>
                {correctCount}/{activeScoreCard.totalQuestions || 80}
              </Text>
            </View>
          )}
        </View>

        {/* REVIEW QUESTIONS BUTTON */}
        <TouchableOpacity
          style={[styles.btnReview, { backgroundColor: colors.brand }]}
          onPress={() => {
            setReviewQuestionIndex(0);
            setIsReviewingExam(true);
          }}
          activeOpacity={0.85}
        >
          <BookOpen size={17} color={colors.textOnBrand} />
          <Text style={[styles.btnReviewText, { color: colors.textOnBrand }]}>Soruları ve Çözümleri İncele</Text>
        </TouchableOpacity>

        {/* RETURN TO CATALOG BUTTON */}
        <TouchableOpacity
          style={[styles.btnSecondary, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => {
            setSelectedResultToView(null);
            resetExam();
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Sınav Kütüphanesine Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE LIVE EXAM VIEW
  // =========================================================================
  if (currentExam && examState) {
    const currentQ = currentExam.questions[examState.currentQuestionIndex];
    const totalQ = currentExam.questions.length;
    const answeredCount = Object.keys(examState.userAnswers).length;
    const isCurrentFlagged = !!examState.flaggedQuestions[examState.currentQuestionIndex];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* LIVE BAR (STICKY TOP BAR) */}
        <View style={[styles.liveBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelExamBtn, { backgroundColor: colors.errorLight }]}
            onPress={handleCancelExam}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={colors.error} />
            <Text style={[styles.cancelExamBtnText, { color: colors.error }]}>Çıkış</Text>
          </TouchableOpacity>

          <View style={[styles.timerPill, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
            <View style={[styles.dotRed, { backgroundColor: colors.accentWarm }]} />
            <Text style={[styles.timerPillText, { color: colors.text }]}>
              {formatTimer(examState.timeRemainingSeconds)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.gridBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => setIsGridModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.gridBtnText, { color: colors.text }]}>
              ▦ <Text style={{ color: colors.brand, fontWeight: '800' }}>{answeredCount}/{totalQ}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: colors.brand }]}
            onPress={handleFinishConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.finishBtnText, { color: colors.textOnBrand }]}>Bitir</Text>
          </TouchableOpacity>
        </View>

        {/* Current Question Solver */}
        {currentQ && (
          <View style={{ flex: 1 }}>
            <QuestionCard
              question={currentQ}
              questionIndex={examState.currentQuestionIndex}
              totalQuestions={totalQ}
              mode="EXAM"
              selectedOption={examState.userAnswers[examState.currentQuestionIndex] || null}
              isFlagged={isCurrentFlagged}
              onSelectOption={(option) =>
                answerExamQuestion(examState.currentQuestionIndex, option)
              }
              onToggleFlag={() => toggleFlagExamQuestion(examState.currentQuestionIndex)}
            />

            {/* Bottom Nav Controls */}
            <View style={[styles.bottomExamNav, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.examNavBtn,
                  { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                  isExamPrevDisabled && styles.examNavBtnDisabled,
                ]}
                disabled={isExamPrevDisabled}
                onPress={() => selectExamQuestion(examState.currentQuestionIndex - 1)}
                activeOpacity={0.7}
              >
                <Text style={[styles.examNavBtnText, { color: isExamPrevDisabled ? colors.textSecondary : colors.text }]}>
                  ← Önceki Soru
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.examNavBtnPrimary,
                  { backgroundColor: colors.brand },
                  examState.currentQuestionIndex >= totalQ - 1 && styles.examNavBtnDisabled,
                ]}
                disabled={examState.currentQuestionIndex >= totalQ - 1}
                onPress={() => selectExamQuestion(examState.currentQuestionIndex + 1)}
                activeOpacity={0.8}
              >
                <Text style={[styles.examNavBtnPrimaryText, { color: colors.textOnBrand }]}>Sonraki Soru →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* OPTIC GRID BOTTOM SHEET */}
        <SmoothBottomSheet
          visible={isGridModalOpen}
          onClose={() => setIsGridModalOpen(false)}
          maxHeight="82%"
        >
          <View style={[styles.opticSheetContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.opticHeaderRow}>
              <View>
                <Text style={[styles.opticSheetTitle, { color: colors.text }]}>Optik Form</Text>
                <Text style={[styles.opticSheetSub, { color: colors.textSecondary }]}>
                  {totalQ} sorudan {answeredCount}'i cevaplandı
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
                onPress={() => setIsGridModalOpen(false)}
              >
                <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.opticLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.successLight }]} />
                <Text style={[styles.legendLbl, { color: colors.textSecondary }]}>Cevaplandı</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.subtleBackground }]} />
                <Text style={[styles.legendLbl, { color: colors.textSecondary }]}>Boş</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.accentWarmLight }]} />
                <Text style={[styles.legendLbl, { color: colors.textSecondary }]}>İşaretli</Text>
              </View>
            </View>

            {/* 8-Column Grid */}
            <ScrollView contentContainerStyle={styles.opticGrid}>
              {Array.from({ length: totalQ }).map((_, idx) => {
                const isAnswered = !!examState.userAnswers[idx];
                const isFlagged = !!examState.flaggedQuestions[idx];
                const isCurrent = examState.currentQuestionIndex === idx;

                let cellStyle: any = styles.opticCell;
                let cellTextStyle: any = styles.opticCellText;

                if (isAnswered) {
                  cellStyle = [styles.opticCell, { backgroundColor: colors.successLight }];
                  cellTextStyle = [styles.opticCellText, { color: colors.success }];
                } else if (isFlagged) {
                  cellStyle = [styles.opticCell, { backgroundColor: colors.accentWarmLight }];
                  cellTextStyle = [styles.opticCellText, { color: colors.accentWarm }];
                } else {
                  cellStyle = [styles.opticCell, { backgroundColor: colors.subtleBackground }];
                  cellTextStyle = [styles.opticCellText, { color: colors.textSecondary }];
                }

                if (isCurrent) {
                  cellStyle.push([styles.opticCellCurrent, { borderColor: colors.brand }]);
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={cellStyle}
                    onPress={() => {
                      selectExamQuestion(idx);
                      setIsGridModalOpen(false);
                    }}
                  >
                    <Text style={cellTextStyle}>{idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.brand }]} onPress={handleFinishConfirm}>
              <Text style={[styles.btnPrimaryText, { color: colors.textOnBrand }]}>Sınavı Tamamla ve Puanı Hesapla</Text>
            </TouchableOpacity>
          </View>
        </SmoothBottomSheet>
      </View>
    );
  }

  // =========================================================================
  // VIEW 3: EXAM CATALOG
  // =========================================================================
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topline} />

      <View style={styles.catalogTopBar}>
        <Text style={[styles.catalogHeading, { color: colors.text }]}>Deneme Sınavları</Text>
        <TouchableOpacity
          style={[styles.aiCustomPill, { backgroundColor: colors.brandLight }]}
          onPress={() => {
            if (isFeatureLocked('AI_GENERATOR')) {
              setIsSubscriptionModalOpen(true);
              return;
            }
            setIsAIGeneratorOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Sparkles size={13} color={colors.brand} />
          <Text style={[styles.aiCustomPillText, { color: colors.brand }]}>+ AI Testi</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER ROW CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            catalogFilter === 'ALL' && { backgroundColor: colors.brandLight, borderColor: colors.brand },
          ]}
          onPress={() => setCatalogFilter('ALL')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              catalogFilter === 'ALL' && { color: colors.brand, fontWeight: '800' },
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            catalogFilter === 'MASTER' && { backgroundColor: colors.brandLight, borderColor: colors.brand },
          ]}
          onPress={() => setCatalogFilter('MASTER')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              catalogFilter === 'MASTER' && { color: colors.brand, fontWeight: '800' },
            ]}
          >
            Master Denemeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            catalogFilter === 'ADVANCED' && { backgroundColor: colors.brandLight, borderColor: colors.brand },
          ]}
          onPress={() => setCatalogFilter('ADVANCED')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              catalogFilter === 'ADVANCED' && { color: colors.brand, fontWeight: '800' },
            ]}
          >
            İleri Düzey & Odak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            catalogFilter === 'AI' && { backgroundColor: colors.brandLight, borderColor: colors.brand },
          ]}
          onPress={() => setCatalogFilter('AI')}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.textSecondary },
              catalogFilter === 'AI' && { color: colors.brand, fontWeight: '800' },
            ]}
          >
            AI Özel Denemeler
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* TRIAL EXPIRED WARNING BANNER */}
      {isFeatureLocked('EXAM') && (
        <TouchableOpacity
          style={[styles.lockWarningBanner, { backgroundColor: colors.cardBackground, borderColor: colors.brand }]}
          onPress={() => setIsSubscriptionModalOpen(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.lockBannerIconCircle, { backgroundColor: colors.brandLight }]}>
            <Lock size={18} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lockBannerTitle, { color: colors.text }]}>
              Deneme Sınavları Pro Üyelik Gerektirir
            </Text>
            <Text style={[styles.lockBannerSub, { color: colors.textSecondary }]}>
              7 günlük ücretsiz denemeniz sona erdi. 80 soruluk denemelere devam etmek için paketinizi seçin.
            </Text>
          </View>
          <View style={[styles.lockBannerBtn, { backgroundColor: colors.brand }]}>
            <Text style={[styles.lockBannerBtnText, { color: colors.textOnBrand }]}>İncele</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* EXAM CARDS LIST */}
      <View style={styles.examCardsList}>
        {filteredExams.map((exam) => {
          const isAI = exam.tag === 'AI Özel';
          const isLocked = isFeatureLocked('EXAM');

          // Real scores from database examHistory (only valid answered exams)
          const realResult = (examHistory || []).find(
            (h) => h && h.examId === exam.id && (h.correctCount + h.wrongCount > 0)
          );
          const scoreVal = realResult ? realResult.ydsScore.toFixed(2) : null;
          const gradeVal = realResult ? realResult.levelGrade : null;
          const itemGradeTheme = gradeVal ? getGradeTheme(gradeVal) : null;

          return (
            <TouchableOpacity
              key={exam.id}
              style={[
                styles.examCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                },
              ]}
              onPress={() => {
                if (isLocked) {
                  setIsSubscriptionModalOpen(true);
                  return;
                }
                startExamFromCatalog(exam.id);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.examYear, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.examYearBig, { color: colors.brand }]}>
                  {isAI ? 'AI' : exam.year}
                </Text>
                <Text style={[styles.examYearSub, { color: colors.brand }]}>
                  {isAI ? 'Adaptif' : exam.season}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.examMetaTitle, { color: colors.text }]}>{exam.title}</Text>
                <View style={styles.examMetaSub}>
                  <Text style={[styles.metaSubItem, { color: colors.textSecondary }]}>⏱ {exam.durationMinutes} dk</Text>
                  <Text style={[styles.metaSubItem, { color: colors.textSecondary }]}>📝 {exam.totalQuestions} soru</Text>
                </View>
              </View>

              <View style={styles.examScorePill}>
                {scoreVal && itemGradeTheme ? (
                  <>
                    <Text style={[styles.scorePillVal, { color: itemGradeTheme.text }]}>
                      {scoreVal}
                    </Text>
                    <View style={[styles.miniGradeBadge, { backgroundColor: itemGradeTheme.tagBg }]}>
                      <Text style={[styles.miniGradeText, { color: itemGradeTheme.text }]}>
                        Not: {gradeVal}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.scorePillVal, { color: colors.textSecondary }]}>—</Text>
                    <Text style={[styles.scorePillGrade, { color: colors.textSecondary }]}>Çözülmedi</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LAST RESULT PREVIEW CARD */}
      {(examHistory?.length || 0) > 0 && examHistory[0] && (
        <View style={styles.lastResultSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Sınav Sonucun</Text>
          </View>

          {(() => {
            const lastExam = examHistory[0];
            if (!lastExam) return null;
            const theme = getGradeTheme(lastExam.levelGrade || 'F');
            return (
              <TouchableOpacity
                style={[
                  styles.lastResultCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                  },
                ]}
                onPress={() => setSelectedResultToView(lastExam)}
                activeOpacity={0.8}
              >
                <View style={styles.scoreHeroInline}>
                  <View
                    style={[
                      styles.gradeRingSmall,
                      { borderColor: theme.border, backgroundColor: theme.bg },
                    ]}
                  >
                    <Text style={[styles.gradeLetterSmall, { color: theme.text }]}>
                      {lastExam.levelGrade || 'F'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scoreHeroTitle, { color: colors.text }]} numberOfLines={1}>
                      {lastExam.title}
                    </Text>
                    <Text style={[styles.scoreHeroText, { color: colors.textSecondary }]}>
                      Puan: {lastExam.ydsScore.toFixed(2)} / 100 · {lastExam.correctCount} Doğru, {lastExam.wrongCount} Yanlış
                    </Text>
                  </View>
                  <View style={[styles.viewResultBtn, { backgroundColor: colors.brandLight }]}>
                    <Text style={[styles.viewResultBtnText, { color: colors.brand }]}>İncele ➔</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })()}
        </View>
      )}

      <AITestGeneratorModal
        visible={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onStartCustomQuiz={(questions, title) => startCustomAIQuiz(questions, title)}
      />

      <SubscriptionModal
        visible={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  topline: {
    height: 10,
  },
  catalogTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  catalogHeading: {
    fontSize: 19,
    fontWeight: '900',
  },
  aiCustomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  aiCustomPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.4,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  examCardsList: {
    gap: 12,
  },
  examCard: {
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  examYear: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examYearBig: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  examYearSub: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  examMetaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  examMetaSub: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  metaSubItem: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  examScorePill: {
    alignItems: 'flex-end',
  },
  scorePillVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  scorePillGrade: {
    fontSize: 10,
    fontWeight: '600',
  },
  miniGradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  miniGradeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  lastResultSection: {
    marginTop: 20,
  },
  sectionTitleRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  lastResultCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreHeroInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeRingSmall: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetterSmall: {
    fontSize: 20,
    fontWeight: '900',
  },
  scoreHeroTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  scoreHeroText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewResultBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewResultBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelExamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cancelExamBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dotRed: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  timerPillText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  gridBtn: {
    borderWidth: 1.4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gridBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  finishBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  finishBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  bottomExamNav: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  examNavBtn: {
    flex: 1,
    borderWidth: 1.6,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  examNavBtnDisabled: {
    opacity: 0.35,
  },
  examNavBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  examNavBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  examNavBtnPrimaryText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  // Optic Sheet Styles
  opticSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  opticHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  opticSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  opticSheetSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  opticLegend: {
    flexDirection: 'row',
    gap: 14,
    marginVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
  legendLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  opticGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  opticCell: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opticCellCurrent: {
    borderWidth: 2,
  },
  opticCellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Score View Styles
  scoreTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  flagBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreHero: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  gradeRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeCenter: {
    alignItems: 'center',
  },
  gradeLetter: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
  },
  gradeNum: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  gradeDescBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 12,
  },
  gradeDescText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  gradeDescSub: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  statBoxVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  statBoxLbl: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  cardBreakdown: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    width: 110,
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  breakdownTrackFill: {
    height: '100%',
    borderRadius: 6,
  },
  breakdownVal: {
    width: 75,
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'right',
  },
  btnReview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 10,
  },
  btnReviewText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  btnPrimary: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  btnPrimaryText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  btnSecondary: {
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '800',
  },
  // Review Mode Styles
  reviewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reviewBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewBackBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  reviewOpticBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reviewOpticBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyReviewBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyReviewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lockWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  lockBannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  lockBannerSub: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  lockBannerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  lockBannerBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
