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
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { QuestionCard } from './QuestionCard';
import { YdsQuestionType } from '../types';

export const DailyTasksScreen: React.FC = () => {
  const {
    streakCount,
    dailyQuestionTarget,
    dailyTasksProgress,
    activeDailyQuestions,
    currentDailyIndex,
    answerDailyQuestion,
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

  // Dynamic Completed Counts
  const paragraphCompleted = dailyTasksProgress.paragraphCompleted || 0;
  const clozeCompleted = dailyTasksProgress.clozeCompleted || 0;
  const sentenceCompleted = dailyTasksProgress.sentenceCompleted || 0;
  const skillsCompleted = dailyTasksProgress.skillsCompleted || 0;

  const totalCompleted = paragraphCompleted + clozeCompleted + sentenceCompleted + skillsCompleted;
  const dailyGoalTotal = dailyQuestionTarget || 35;
  const completionPercentage = Math.min(100, Math.round((totalCompleted / dailyGoalTotal) * 100));

  const tasksList = [
    {
      type: 'PARAGRAPH' as YdsQuestionType,
      title: 'Paragraf\nSoruları',
      iconEmoji: '📖',
      completed: paragraphCompleted,
      goal: 5,
      color: '#2563EB',
      bg: '#DBEAFE',
    },
    {
      type: 'CLOZE_TEST' as YdsQuestionType,
      title: 'Cloze Test\nSoruları',
      iconEmoji: '🧩',
      completed: clozeCompleted,
      goal: 5,
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      type: 'SENTENCE_COMPLETION' as YdsQuestionType,
      title: 'Cümle\nTamamlama',
      iconEmoji: '🔗',
      completed: sentenceCompleted,
      goal: 10,
      color: '#059669',
      bg: '#D1FAE5',
    },
    {
      type: 'SKILL_DIALOGUE' as YdsQuestionType,
      title: 'Diyalog &\nDil Bilgisi',
      iconEmoji: '💬',
      completed: skillsCompleted,
      goal: 15,
      color: '#D97706',
      bg: '#FEF3C7',
    },
  ];

  // =========================================================================
  // VIEW 2: DEDICATED QUESTION SOLVER VIEW (SCREEN 2)
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
            <Text style={styles.backBtnText}>Görevlere Dön</Text>
          </TouchableOpacity>

          <View style={styles.solverCounterBadge}>
            <Text style={styles.solverCounterText}>
              {currentDailyIndex + 1} / {filteredQuestions.length || 1}
            </Text>
          </View>
        </View>

        {currentQuestion ? (
          <View style={{ flex: 1 }}>
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionIndex={currentDailyIndex}
              totalQuestions={filteredQuestions.length || 1}
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
            <Text style={styles.emptySolverTitle}>Tebrikler! Bugünkü Görevler Tamamlandı</Text>
            <Text style={styles.emptySolverSubtitle}>
              Doğru bildiğin tüm sorular aktif havuzdan tamamlandı.
            </Text>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => setIsSolvingMode(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.returnBtnText}>Ana Görevler Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: DASHBOARD VIEW
  // =========================================================================
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* COMPACT HERO GOAL BANNER */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGoalLabel}>🎯 Bugünkü Hedefin</Text>
            <Text style={styles.heroGoalNum}>
              {totalCompleted} / {dailyGoalTotal} Soru
            </Text>
          </View>

          {/* Dairesel İlerleme Halkası */}
          <View style={styles.ringWrap}>
            <View style={styles.ringCircle}>
              <Text style={styles.ringPct}>{completionPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Hero Rozeti (XP removed) */}
        <View style={styles.heroPills}>
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 {streakCount || 1} Günlük Seri</Text>
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
              {/* Alt İlerleme Çubuğu */}
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
            {activeDailyQuestions.length > 0 ? `${currentDailyIndex + 1}/${activeDailyQuestions.length}` : 'Hazır'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.arenaTitle}>Soru Çözümüne Devam Et</Text>
          <Text style={styles.arenaSubtitle}>
            {activeDailyQuestions.length > 0
              ? `${activeDailyQuestions.length - currentDailyIndex} aktif soru bekliyor`
              : 'Günlük havuzdaki tüm sorular çözüldü'}
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
    paddingTop: 4,
    paddingBottom: 36,
  },
  heroBanner: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#4338CA',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    marginVertical: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroGoalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroGoalNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  ringWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  ringPct: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  heroPills: {
    flexDirection: 'row',
    marginTop: 10,
  },
  streakPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  streakPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
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
    padding: 14,
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
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  mIconEmoji: {
    fontSize: 17,
  },
  mTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
  },
  mCount: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  mBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3.5,
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  mBarFill: {
    height: '100%',
  },
  arenaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
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
    fontSize: 11.5,
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
  solverCounterBadge: {
    backgroundColor: '#F1F4FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  solverCounterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
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
  returnBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
