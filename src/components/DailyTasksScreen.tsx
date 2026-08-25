import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { QuestionCard } from './QuestionCard';
import { YdsQuestionType } from '../types';

export const DailyTasksScreen: React.FC = () => {
  const {
    streakCount,
    dailyTasksProgress,
    activeDailyQuestions,
    currentDailyIndex,
    isGeneratingAI,
    answerDailyQuestion,
    generateFreshAIQuestions,
    nextDailyQuestion,
    prevDailyQuestion,
  } = useLearningStore();

  const [selectedFilter, setSelectedFilter] = useState<YdsQuestionType | 'ALL'>('ALL');
  const [isSolvingMode, setIsSolvingMode] = useState<boolean>(false);

  const filteredQuestions =
    selectedFilter === 'ALL'
      ? activeDailyQuestions
      : activeDailyQuestions.filter((q) => q.type === selectedFilter);

  const currentQuestion = filteredQuestions[currentDailyIndex] || filteredQuestions[0];

  // Daily target goals calculation
  const totalCompleted =
    dailyTasksProgress.paragraphCompleted +
    dailyTasksProgress.clozeCompleted +
    dailyTasksProgress.sentenceCompleted +
    dailyTasksProgress.skillsCompleted;

  const dailyGoalTotal = 35;
  const completionPercentage = Math.min(100, Math.round((totalCompleted / dailyGoalTotal) * 100)) || 65;

  const tasksList = [
    {
      type: 'PARAGRAPH' as YdsQuestionType,
      title: 'Paragraf\nSoruları',
      iconEmoji: '📖',
      completed: dailyTasksProgress.paragraphCompleted || 3,
      goal: 5,
      color: '#2563EB',
      bg: '#DBEAFE',
    },
    {
      type: 'CLOZE_TEST' as YdsQuestionType,
      title: 'Cloze Test\nSoruları',
      iconEmoji: '🧩',
      completed: dailyTasksProgress.clozeCompleted || 1,
      goal: 5,
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      type: 'SENTENCE_COMPLETION' as YdsQuestionType,
      title: 'Cümle\nTamamlama',
      iconEmoji: '🔗',
      completed: dailyTasksProgress.sentenceCompleted || 7,
      goal: 10,
      color: '#059669',
      bg: '#D1FAE5',
    },
    {
      type: 'SKILL_DIALOGUE' as YdsQuestionType,
      title: 'Diyalog &\nDil Bilgisi',
      iconEmoji: '💬',
      completed: dailyTasksProgress.skillsCompleted || 4,
      goal: 15,
      color: '#D97706',
      bg: '#FEF3C7',
    },
  ];

  // =========================================================================
  // VIEW 2: DEDICATED QUESTION SOLVER VIEW (SCREEN 2 IN HTML)
  // =========================================================================
  if (isSolvingMode) {
    return (
      <View style={styles.container}>
        {/* Solver Top Navigation */}
        <View style={styles.solverHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setIsSolvingMode(false)}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#4F46E5" />
            <Text style={styles.backBtnText}>Görevler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiPillBtn}
            onPress={() =>
              generateFreshAIQuestions(
                selectedFilter === 'ALL' ? 'PARAGRAPH' : selectedFilter
              )
            }
            disabled={isGeneratingAI}
            activeOpacity={0.8}
          >
            {isGeneratingAI ? (
              <ActivityIndicator size="small" color="#7C3AED" />
            ) : (
              <>
                <Sparkles size={13} color="#7C3AED" />
                <Text style={styles.aiPillBtnText}>+ AI Taze Soru</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {currentQuestion ? (
          <View style={{ flex: 1 }}>
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionIndex={currentDailyIndex}
              totalQuestions={filteredQuestions.length || 15}
              mode="PRACTICE"
              onSelectOption={(opt) => answerDailyQuestion(currentQuestion, opt)}
            />

            {/* Bottom Next / Prev Navigation */}
            <View style={styles.bottomSolverNav}>
              <TouchableOpacity
                style={[
                  styles.navBtnPrev,
                  currentDailyIndex === 0 && styles.navBtnDisabled,
                ]}
                disabled={currentDailyIndex === 0}
                onPress={prevDailyQuestion}
                activeOpacity={0.7}
              >
                <Text style={styles.navBtnPrevText}>← Önceki</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navBtnNext,
                  currentDailyIndex >= filteredQuestions.length - 1 && styles.navBtnDisabled,
                ]}
                disabled={currentDailyIndex >= filteredQuestions.length - 1}
                onPress={nextDailyQuestion}
                activeOpacity={0.8}
              >
                <Text style={styles.navBtnNextText}>Sonraki Soru →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptySolverState}>
            <CheckCircle2 size={48} color="#10B981" />
            <Text style={styles.emptySolverTitle}>Tebrikler! Bu Görev Tamamlandı</Text>
            <Text style={styles.emptySolverSubtitle}>
              Doğru bildiğin sorular aktif havuzdan düşürüldü.
            </Text>
            <TouchableOpacity
              style={styles.emptySolverAiBtn}
              onPress={() => generateFreshAIQuestions('PARAGRAPH')}
              activeOpacity={0.8}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.emptySolverAiBtnText}>Yapay Zekadan Yeni Soru Getir</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: DASHBOARD VIEW (SCREEN 1 IN HTML)
  // =========================================================================
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topline} />

      {/* SCREEN 1: HERO BANNER */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGoalLabel}>🎯 Bugünkü Hedefin</Text>
            <Text style={styles.heroGoalNum}>35 Soru</Text>
          </View>

          {/* Dairesel İlerleme Halkası */}
          <View style={styles.ringWrap}>
            <View style={styles.ringCircle}>
              <Text style={styles.ringPct}>{completionPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Hero Rozetleri */}
        <View style={styles.heroPills}>
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 {streakCount || 5} Günlük Seri</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>⚡ +350 XP</Text>
          </View>
        </View>
      </View>

      {/* SECTION: GÜNLÜK GÖREVLER */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Günlük Görevler</Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedFilter('ALL');
            setIsSolvingMode(true);
          }}
        >
          <Text style={styles.seeAllText}>Tümü</Text>
        </TouchableOpacity>
      </View>

      {/* 2 SÜTUNLU MODÜL GRID */}
      <View style={styles.moduleGrid}>
        {tasksList.map((task) => {
          const progressPercent = Math.min(100, Math.round((task.completed / task.goal) * 100));

          return (
            <TouchableOpacity
              key={task.type}
              style={styles.moduleCard}
              onPress={() => {
                setSelectedFilter(task.type);
                setIsSolvingMode(true);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.mIcon, { backgroundColor: task.bg }]}>
                <Text style={styles.mIconEmoji}>{task.iconEmoji}</Text>
              </View>
              <Text style={styles.mTitle}>{task.title}</Text>
              <Text style={styles.mCount}>
                {task.completed} / {task.goal} tamam
              </Text>
              {/* Alt 4px İlerleme Çubuğu */}
              <View style={styles.mBar}>
                <View
                  style={[
                    styles.mBarFill,
                    { width: `${progressPercent}%`, backgroundColor: task.color },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* AI CTA KARTI */}
      <TouchableOpacity
        style={styles.aiCta}
        onPress={() => {
          setSelectedFilter('ALL');
          setIsSolvingMode(true);
        }}
        activeOpacity={0.85}
      >
        <View style={styles.sparkleBox}>
          <Text style={styles.sparkleText}>✨</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiCtaTitle}>Yeni AI Sorusu Üret</Text>
          <Text style={styles.aiCtaSubtitle}>
            Havuzun tükendi mi? Anında yeni soru al
          </Text>
        </View>
      </TouchableOpacity>

      {/* SECTION: AKTİF SORU ALANI */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Aktif Soru Alanı</Text>
      </View>

      {/* ARENA KARTI */}
      <TouchableOpacity
        style={styles.arenaCard}
        onPress={() => setIsSolvingMode(true)}
        activeOpacity={0.8}
      >
        <View style={styles.arenaBadge}>
          <Text style={styles.arenaBadgeText}>
            3/15
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.arenaTitle}>Paragraf sorusuna devam et</Text>
          <Text style={styles.arenaSubtitle}>
            Kaldığın yerden sürdür — 12 soru kaldı
          </Text>
        </View>
        <ArrowRight size={18} color="#94A3B8" />
      </TouchableOpacity>
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
  heroBanner: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#4338CA',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroGoalLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.78)',
  },
  heroGoalNum: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  ringWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  ringPct: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  heroPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  streakPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  streakPillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  xpPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  xpPillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.04)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  mIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  mIconEmoji: {
    fontSize: 18,
  },
  mTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  mCount: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  mBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  mBarFill: {
    height: '100%',
  },
  aiCta: {
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  sparkleBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 19,
  },
  aiCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiCtaSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 1,
  },
  arenaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
  },
  arenaBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arenaBadgeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  arenaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  arenaSubtitle: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  // Solver Styles
  solverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  aiPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  aiPillBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  bottomSolverNav: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7EAF3',
  },
  navBtnPrev: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: '#E7EAF3',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  navBtnPrevText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  navBtnNext: {
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
  navBtnNextText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  emptySolverState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptySolverTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySolverSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },
  emptySolverAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptySolverAiBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
