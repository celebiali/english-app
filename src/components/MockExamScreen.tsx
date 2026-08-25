import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {
  Sparkles,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { QuestionCard } from './QuestionCard';
import { AITestGeneratorModal } from './AITestGeneratorModal';
import {
  EXAM_CATALOG,
  CatalogExamInfo,
} from '../services/YdsExamCatalog';

export const MockExamScreen: React.FC = () => {
  const {
    currentExam,
    examState,
    examScoreCard,
    examHistory,
    selectedCatalogExam,
    selectCatalogExam,
    startExamFromCatalog,
    startCustomAIQuiz,
    selectExamQuestion,
    answerExamQuestion,
    toggleFlagExamQuestion,
    tickExamTimer,
    finishMockExam,
    resetExam,
  } = useLearningStore();

  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<'ALL' | 'OSYM' | 'ELS' | 'AI'>('ALL');
  const [selectedResultToView, setSelectedResultToView] = useState<any>(null);

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

  const handleFinishConfirm = () => {
    Alert.alert(
      'Sınavı Bitirmek İstiyor Musunuz?',
      'Cevaplarınız değerlendirilecek ve YDS puanınız hesaplanacaktır.',
      [
        { text: 'Devam Et', style: 'cancel' },
        {
          text: 'Sınavı Bitir',
          style: 'destructive',
          onPress: () => {
            setIsGridModalOpen(false);
            finishMockExam();
          },
        },
      ]
    );
  };

  const filteredExams = EXAM_CATALOG.filter((exam) => {
    if (catalogFilter === 'OSYM') return exam.tag === 'ÖSYM Çıkmış';
    if (catalogFilter === 'ELS') return exam.tag === 'ELS Dergi Serisi';
    if (catalogFilter === 'AI') return exam.tag === 'Yapay Zeka Özel';
    return true;
  });

  const activeScoreCard = examScoreCard || selectedResultToView;

  // =========================================================================
  // VIEW 1: SCORECARD / EXAM RESULT VIEW (SCREEN 3 SCORE HERO)
  // =========================================================================
  if (activeScoreCard) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topline} />
        <View style={styles.scoreTopRow}>
          <Text style={styles.eyebrow}>{activeScoreCard.title || '2024 YDS/1'} · SONUÇ</Text>
          <TouchableOpacity
            style={styles.flagBtn}
            onPress={() => {
              setSelectedResultToView(null);
              resetExam();
            }}
          >
            <Text style={styles.flagBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* GRADE RING HERO */}
        <View style={styles.scoreHero}>
          <View style={styles.gradeRing}>
            <View style={styles.gradeCenter}>
              <Text style={styles.gradeLetter}>{activeScoreCard.levelGrade || 'A'}</Text>
              <Text style={styles.gradeNum}>{activeScoreCard.ydsScore || '92.50'} / 100</Text>
            </View>
          </View>
        </View>

        {/* STATS ROW (3 BOXES) */}
        <View style={styles.statRow}>
          <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.statBoxVal, { color: '#059669' }]}>
              {activeScoreCard.correctCount || 74}
            </Text>
            <Text style={styles.statBoxLbl}>DOĞRU</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.statBoxVal, { color: '#DC2626' }]}>
              {activeScoreCard.wrongCount || 4}
            </Text>
            <Text style={styles.statBoxLbl}>YANLIŞ</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#F1F4FA' }]}>
            <Text style={[styles.statBoxVal, { color: '#475569' }]}>
              {activeScoreCard.emptyCount || 2}
            </Text>
            <Text style={styles.statBoxLbl}>BOŞ</Text>
          </View>
        </View>

        {/* CATEGORY BREAKDOWN */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Konu Bazlı Dağılım</Text>
        </View>

        <View style={styles.cardBreakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Paragraf</Text>
            <View style={styles.breakdownTrack}>
              <View style={[styles.breakdownTrackFill, { width: '92%', backgroundColor: '#2563EB' }]} />
            </View>
            <Text style={styles.breakdownVal}>23/25</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Cloze Test</Text>
            <View style={styles.breakdownTrack}>
              <View style={[styles.breakdownTrackFill, { width: '80%', backgroundColor: '#7C3AED' }]} />
            </View>
            <Text style={styles.breakdownVal}>16/20</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Cümle Tam.</Text>
            <View style={styles.breakdownTrack}>
              <View style={[styles.breakdownTrackFill, { width: '95%', backgroundColor: '#059669' }]} />
            </View>
            <Text style={styles.breakdownVal}>19/20</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Diyalog</Text>
            <View style={styles.breakdownTrack}>
              <View style={[styles.breakdownTrackFill, { width: '88%', backgroundColor: '#D97706' }]} />
            </View>
            <Text style={styles.breakdownVal}>16/18</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => {
            setSelectedResultToView(null);
            resetExam();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Sınav Kütüphanesine Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE LIVE EXAM VIEW (SCREEN 3 LIVE EXAM IN HTML)
  // =========================================================================
  if (currentExam && examState) {
    const currentQ = currentExam.questions[examState.currentQuestionIndex];
    const totalQ = currentExam.questions.length;
    const answeredCount = Object.keys(examState.userAnswers).length;
    const isCurrentFlagged = !!examState.flaggedQuestions[examState.currentQuestionIndex];

    return (
      <View style={styles.container}>
        {/* LIVE BAR (STICKY TOP BAR IN HTML) */}
        <View style={styles.liveBar}>
          <View style={styles.timerPill}>
            <View style={styles.dotRed} />
            <Text style={styles.timerPillText}>
              {formatTimer(examState.timeRemainingSeconds)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.gridBtn}
            onPress={() => setIsGridModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.gridBtnText}>
              ▦ Optik <Text style={{ color: '#4F46E5', fontWeight: '800' }}>{answeredCount}/{totalQ}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.finishBtn} onPress={handleFinishConfirm} activeOpacity={0.8}>
            <Text style={styles.finishBtnText}>Bitir</Text>
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
            <View style={styles.bottomExamNav}>
              <TouchableOpacity
                style={[styles.examNavBtn, examState.currentQuestionIndex === 0 && styles.examNavBtnDisabled]}
                disabled={examState.currentQuestionIndex === 0}
                onPress={() => selectExamQuestion(examState.currentQuestionIndex - 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.examNavBtnText}>← Önceki</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.examNavBtnPrimary,
                  examState.currentQuestionIndex >= totalQ - 1 && styles.examNavBtnDisabled,
                ]}
                disabled={examState.currentQuestionIndex >= totalQ - 1}
                onPress={() => selectExamQuestion(examState.currentQuestionIndex + 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.examNavBtnPrimaryText}>Sonraki →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* OPTIC GRID MODAL (8-COLUMN GRID IN HTML) */}
        <Modal visible={isGridModalOpen} animationType="slide" transparent>
          <View style={styles.opticModal}>
            <View style={styles.opticSheet}>
              <View style={styles.opticHeaderRow}>
                <View>
                  <Text style={styles.opticSheetTitle}>Optik Form</Text>
                  <Text style={styles.opticSheetSub}>
                    {totalQ} sorudan {answeredCount}'i cevaplandı
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setIsGridModalOpen(false)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Legend */}
              <View style={styles.opticLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
                  <Text style={styles.legendLbl}>Çözüldü</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F1F4FA' }]} />
                  <Text style={styles.legendLbl}>Boş</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} />
                  <Text style={styles.legendLbl}>İşaretli</Text>
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
                    cellStyle = [styles.opticCell, styles.opticCellSolved];
                    cellTextStyle = [styles.opticCellText, { color: '#059669' }];
                  } else if (isFlagged) {
                    cellStyle = [styles.opticCell, styles.opticCellFlagged];
                    cellTextStyle = [styles.opticCellText, { color: '#B45309' }];
                  } else {
                    cellStyle = [styles.opticCell, styles.opticCellEmpty];
                    cellTextStyle = [styles.opticCellText, { color: '#94A3B8' }];
                  }

                  if (isCurrent) {
                    cellStyle.push(styles.opticCellCurrent);
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

              <TouchableOpacity style={styles.btnPrimary} onPress={handleFinishConfirm}>
                <Text style={styles.btnPrimaryText}>Sınavı Tamamla ve Puanı Hesapla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // =========================================================================
  // VIEW 3: EXAM CATALOG (SCREEN 3 CATALOG VIEW IN HTML)
  // =========================================================================
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topline} />

      <View style={styles.catalogTopBar}>
        <Text style={styles.catalogHeading}>Deneme Sınavları</Text>
        <TouchableOpacity
          style={styles.aiCustomPill}
          onPress={() => setIsAIGeneratorOpen(true)}
          activeOpacity={0.8}
        >
          <Sparkles size={13} color="#7C3AED" />
          <Text style={styles.aiCustomPillText}>+ AI Testi</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER ROW CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.chip, catalogFilter === 'ALL' && styles.chipOn]}
          onPress={() => setCatalogFilter('ALL')}
        >
          <Text style={[styles.chipText, catalogFilter === 'ALL' && styles.chipTextOn]}>
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, catalogFilter === 'OSYM' && styles.chipOn]}
          onPress={() => setCatalogFilter('OSYM')}
        >
          <Text style={[styles.chipText, catalogFilter === 'OSYM' && styles.chipTextOn]}>
            ÖSYM Çıkmış
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, catalogFilter === 'ELS' && styles.chipOn]}
          onPress={() => setCatalogFilter('ELS')}
        >
          <Text style={[styles.chipText, catalogFilter === 'ELS' && styles.chipTextOn]}>
            ELS Dergisi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, catalogFilter === 'AI' && styles.chipOn]}
          onPress={() => setCatalogFilter('AI')}
        >
          <Text style={[styles.chipText, catalogFilter === 'AI' && styles.chipTextOn]}>
            AI Adaptif
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EXAM CARDS LIST */}
      <View style={styles.examCardsList}>
        {filteredExams.map((exam, index) => {
          const isAI = exam.tag === 'Yapay Zeka Özel';
          const isELS = exam.tag === 'ELS Dergi Serisi';

          let yearBg = '#EEF2FF';
          let yearColor = '#4F46E5';

          if (isAI) {
            yearBg = '#EDE9FE';
            yearColor = '#7C3AED';
          } else if (isELS) {
            yearBg = '#FEF3C7';
            yearColor = '#D97706';
          }

          // Sample scores for realistic demonstration
          const sampleScore = index === 0 ? '87.50' : index === 1 ? '71.25' : null;
          const sampleGrade = index === 0 ? 'A' : index === 1 ? 'C' : null;

          return (
            <TouchableOpacity
              key={exam.id}
              style={styles.examCard}
              onPress={() => startExamFromCatalog(exam.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.examYear, { backgroundColor: yearBg }]}>
                <Text style={[styles.examYearBig, { color: yearColor }]}>
                  {isAI ? 'AI' : exam.year}
                </Text>
                <Text style={[styles.examYearSub, { color: yearColor }]}>
                  {isAI ? 'Adaptif' : exam.season}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.examMetaTitle}>{exam.title}</Text>
                <View style={styles.examMetaSub}>
                  <Text style={styles.metaSubItem}>⏱ {exam.durationMinutes} dk</Text>
                  <Text style={styles.metaSubItem}>📝 {exam.totalQuestions} soru</Text>
                </View>
              </View>

              <View style={styles.examScorePill}>
                {sampleScore ? (
                  <>
                    <Text style={[styles.scorePillVal, index === 1 && { color: '#D97706' }]}>
                      {sampleScore}
                    </Text>
                    <Text style={styles.scorePillGrade}>Not: {sampleGrade}</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.scorePillVal, { color: '#94A3B8' }]}>—</Text>
                    <Text style={styles.scorePillGrade}>Çözülmedi</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LAST RESULT PREVIEW CARD (SCREEN 3 BOTTOM CARD IN HTML) */}
      <View style={styles.lastResultSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Son Sınav Sonucun</Text>
        </View>

        <TouchableOpacity
          style={styles.lastResultCard}
          onPress={() =>
            setSelectedResultToView({
              title: '2024 YDS/1',
              levelGrade: 'A',
              ydsScore: '92.50',
              correctCount: 74,
              wrongCount: 4,
              emptyCount: 2,
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.scoreHeroInline}>
            <View style={styles.gradeRingSmall}>
              <Text style={styles.gradeLetterSmall}>A</Text>
            </View>
            <Text style={styles.scoreHeroText}>92.50 / 100 — Sonuç Kartını Gör</Text>
          </View>
        </TouchableOpacity>
      </View>

      <AITestGeneratorModal
        visible={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onStartCustomQuiz={(questions, title) => startCustomAIQuiz(questions, title)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#0F172A',
  },
  aiCustomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  aiCustomPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
  },
  chipOn: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextOn: {
    color: '#FFFFFF',
  },
  examCardsList: {
    gap: 12,
  },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    shadowColor: '#0F172A',
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
    color: '#0F172A',
  },
  examMetaSub: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  metaSubItem: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
  },
  examScorePill: {
    alignItems: 'flex-end',
  },
  scorePillVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  scorePillGrade: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
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
    color: '#0F172A',
  },
  lastResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreHeroInline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  gradeRingSmall: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gradeLetterSmall: {
    fontSize: 26,
    fontWeight: '900',
    color: '#059669',
  },
  scoreHeroText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  // Live Exam Styles
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(248,250,252,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dotRed: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  timerPillText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  gridBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gridBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  finishBtn: {
    marginLeft: 'auto',
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomExamNav: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7EAF3',
  },
  examNavBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: '#E7EAF3',
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
    color: '#0F172A',
  },
  examNavBtnPrimary: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  examNavBtnPrimaryText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Optic Sheet Styles
  opticModal: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  opticSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '80%',
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
    color: '#0F172A',
  },
  opticSheetSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
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
    color: '#475569',
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
  opticCellSolved: {
    backgroundColor: '#D1FAE5',
  },
  opticCellEmpty: {
    backgroundColor: '#F1F4FA',
  },
  opticCellFlagged: {
    backgroundColor: '#FEF3C7',
  },
  opticCellCurrent: {
    borderWidth: 2,
    borderColor: '#4F46E5',
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
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  flagBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  scoreHero: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  gradeRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 13,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  gradeCenter: {
    alignItems: 'center',
  },
  gradeLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: '#059669',
    lineHeight: 40,
  },
  gradeNum: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
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
    fontSize: 19,
    fontWeight: '900',
  },
  statBoxLbl: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  cardBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    marginBottom: 18,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    width: 100,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  breakdownTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#EEF1F8',
    overflow: 'hidden',
  },
  breakdownTrackFill: {
    height: '100%',
    borderRadius: 6,
  },
  breakdownVal: {
    width: 42,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },
  btnPrimary: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
