import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Flame,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  FileText,
  GraduationCap,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { dbService, PerformanceStats } from '../database/DatabaseService';

interface Props {
  onOpenMistakes?: () => void;
}

export const StatsScreen: React.FC<Props> = ({ onOpenMistakes }) => {
  const {
    streakCount,
    boxSummary,
    mistakes,
    dictionaryWords,
    setActiveTab,
    loadDailyTasks,
    loadMistakes,
  } = useLearningStore();

  const { colors } = useThemeStore();

  const [stats, setStats] = useState<PerformanceStats | null>(null);

  const fetchStats = async () => {
    try {
      const data = await dbService.getComprehensivePerformanceStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load performance stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    loadDailyTasks();
    loadMistakes();
  }, []);

  const totalQuestionsSolved = stats?.totalQuestionsSolved || 0;
  const accuracyPercentage = stats?.accuracyPercentage || 0;
  const totalWordsStudied = stats?.totalWordsStudied || (dictionaryWords || []).filter((w) => w && w.isStudied).length;

  const paragraphStats = stats?.categoryStats?.paragraph || { solved: 0, correct: 0, accuracy: 0 };
  const clozeStats = stats?.categoryStats?.cloze || { solved: 0, correct: 0, accuracy: 0 };
  const sentenceStats = stats?.categoryStats?.sentence || { solved: 0, correct: 0, accuracy: 0 };
  const skillsStats = stats?.categoryStats?.skills || { solved: 0, correct: 0, accuracy: 0 };

  const totalExams = stats?.totalExamsCompleted || 0;
  const latestScore = stats?.latestExamScore;
  const avgScore = stats?.averageExamScore;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER TITLE */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Performans & Analiz</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          YDS hazırlık sürecinin canlı ve dinamik verileri
        </Text>
      </View>

      {/* 4 DYNAMIC QUICK STATS METRICS (2x2 Grid) */}
      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
            },
          ]}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.brandLight }]}>
            <Flame size={16} color={colors.brand} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{streakCount || 1} Gün</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Günlük Seri</Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
            },
          ]}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.brandLight }]}>
            <CheckCircle2 size={16} color={colors.brand} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>%{accuracyPercentage}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Genel Başarı</Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
            },
          ]}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.brandLight }]}>
            <BarChart3 size={16} color={colors.brand} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{totalQuestionsSolved}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Çözülen Soru</Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
            },
          ]}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.brandLight }]}>
            <BookOpen size={16} color={colors.brand} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{totalWordsStudied}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Ezber Kelime</Text>
        </View>
      </View>

      {/* MISTAKE VAULT ACTION CARD */}
      <TouchableOpacity
        style={[
          styles.mistakeBanner,
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
        <View style={styles.mistakeLeft}>
          <View style={[styles.mistakeIconBox, { backgroundColor: colors.brandLight }]}>
            <AlertTriangle size={18} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.mistakeTitleRow}>
              <Text style={[styles.mistakeTitle, { color: colors.text }]}>Hata Kasası</Text>
              <View style={[styles.mistakeCountPill, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.mistakeCountText, { color: colors.brand }]}>{mistakes.length} Yanlış</Text>
              </View>
            </View>
            <Text style={[styles.mistakeSub, { color: colors.textSecondary }]}>
              {mistakes.length > 0
                ? 'Yanlışlarını AI derin analiziyle incele ve telafi et'
                : 'Tüm hatalar temizlendi, harika gidiyorsun!'}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* DENEME SINAVLARI ANALİZİ (Sadece tamamlanmış gerçek deneme varsa gösterilir) */}
      {totalExams > 0 && latestScore !== null && (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Deneme Sınavları Analizi</Text>
          </View>

          <View
            style={[
              styles.examAnalysisCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
              },
            ]}
          >
            <View style={styles.examTopRow}>
              <View style={[styles.examBadge, { backgroundColor: colors.brandLight }]}>
                <GraduationCap size={15} color={colors.brand} />
                <Text style={[styles.examBadgeText, { color: colors.brand }]}>DENEME PERFORMANSI</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveTab('EXAM')}
                activeOpacity={0.7}
                style={styles.examLinkBtn}
              >
                <Text style={[styles.examLinkText, { color: colors.brand }]}>Tüm Denemeler ➔</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.examStatsGrid}>
              <View style={[styles.examStatBox, { backgroundColor: colors.subtleBackground }]}>
                <Text style={[styles.examStatNum, { color: colors.brand }]}>{totalExams}</Text>
                <Text style={[styles.examStatSub, { color: colors.textSecondary }]}>Tamamlanan</Text>
              </View>
              <View style={[styles.examStatBox, { backgroundColor: colors.subtleBackground }]}>
                <Text style={[styles.examStatNum, { color: colors.text }]}>{latestScore !== null ? `${latestScore}` : '-'}</Text>
                <Text style={[styles.examStatSub, { color: colors.textSecondary }]}>Son Puan</Text>
              </View>
              <View style={[styles.examStatBox, { backgroundColor: colors.subtleBackground }]}>
                <Text style={[styles.examStatNum, { color: colors.text }]}>{avgScore !== null ? `${avgScore}` : '-'}</Text>
                <Text style={[styles.examStatSub, { color: colors.textSecondary }]}>Ortalama Puan</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* QUESTION SKILL BREAKDOWN */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Soru Türü Başarı Analizi</Text>
      </View>

      <View style={[styles.skillsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        {/* PARAGRAF */}
        <View style={styles.skillItem}>
          <View style={styles.skillTop}>
            <Text style={[styles.skillName, { color: colors.text }]}>📖 Paragraf Soruları</Text>
            <Text style={[styles.skillValue, { color: colors.brand }]}>
              {paragraphStats.solved > 0
                ? `${paragraphStats.correct} / ${paragraphStats.solved} Doğru (%${paragraphStats.accuracy})`
                : 'Henüz Çözülmedi'}
            </Text>
          </View>
          <View style={[styles.skillTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.skillFill,
                {
                  width: `${paragraphStats.accuracy || (paragraphStats.solved > 0 ? 100 : 0)}%`,
                  backgroundColor: colors.brand,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.skillDivider, { backgroundColor: colors.border }]} />

        {/* CLOZE TEST */}
        <View style={styles.skillItem}>
          <View style={styles.skillTop}>
            <Text style={[styles.skillName, { color: colors.text }]}>📝 Cloze Test Soruları</Text>
            <Text style={[styles.skillValue, { color: colors.brand }]}>
              {clozeStats.solved > 0
                ? `${clozeStats.correct} / ${clozeStats.solved} Doğru (%${clozeStats.accuracy})`
                : 'Henüz Çözülmedi'}
            </Text>
          </View>
          <View style={[styles.skillTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.skillFill,
                {
                  width: `${clozeStats.accuracy || (clozeStats.solved > 0 ? 100 : 0)}%`,
                  backgroundColor: colors.brand,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.skillDivider, { backgroundColor: colors.border }]} />

        {/* CÜMLE TAMAMLAMA */}
        <View style={styles.skillItem}>
          <View style={styles.skillTop}>
            <Text style={[styles.skillName, { color: colors.text }]}>🔗 Cümle Tamamlama</Text>
            <Text style={[styles.skillValue, { color: colors.brand }]}>
              {sentenceStats.solved > 0
                ? `${sentenceStats.correct} / ${sentenceStats.solved} Doğru (%${sentenceStats.accuracy})`
                : 'Henüz Çözülmedi'}
            </Text>
          </View>
          <View style={[styles.skillTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.skillFill,
                {
                  width: `${sentenceStats.accuracy || (sentenceStats.solved > 0 ? 100 : 0)}%`,
                  backgroundColor: colors.brand,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.skillDivider, { backgroundColor: colors.border }]} />

        {/* DİYALOG & DİLBİLGİSİ */}
        <View style={styles.skillItem}>
          <View style={styles.skillTop}>
            <Text style={[styles.skillName, { color: colors.text }]}>💬 Diyalog & Dil Bilgisi</Text>
            <Text style={[styles.skillValue, { color: colors.brand }]}>
              {skillsStats.solved > 0
                ? `${skillsStats.correct} / ${skillsStats.solved} Doğru (%${skillsStats.accuracy})`
                : 'Henüz Çözülmedi'}
            </Text>
          </View>
          <View style={[styles.skillTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.skillFill,
                {
                  width: `${skillsStats.accuracy || (skillsStats.solved > 0 ? 100 : 0)}%`,
                  backgroundColor: colors.brand,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* VOCABULARY STATUS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Hafıza ve Tekrar Havuzları</Text>
      </View>

      <View style={[styles.boxesCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.boxesRow}>
          <View style={[styles.boxCol, { backgroundColor: colors.subtleBackground }]}>
            <Text style={[styles.boxColNum, { color: colors.text }]}>{boxSummary.specialPoolCount || 0}</Text>
            <Text style={[styles.boxColTitle, { color: colors.text }]}>Tekrar</Text>
            <Text style={[styles.boxColSub, { color: colors.textSecondary }]}>Dünden Kalan</Text>
          </View>
          <View style={[styles.boxCol, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.boxColNum, { color: colors.brand }]}>{boxSummary.dailyBoxCount || 25}</Text>
            <Text style={[styles.boxColTitle, { color: colors.brand }]}>Günlük</Text>
            <Text style={[styles.boxColSub, { color: colors.textSecondary }]}>25 Yeni Set</Text>
          </View>
          <View style={[styles.boxCol, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.boxColNum, { color: colors.brand }]}>{boxSummary.weeklyBoxCount || 0}</Text>
            <Text style={[styles.boxColTitle, { color: colors.brand }]}>Haftalık</Text>
            <Text style={[styles.boxColSub, { color: colors.textSecondary }]}>7 Günlük</Text>
          </View>
          <View style={[styles.boxCol, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.boxColNum, { color: colors.brand }]}>{boxSummary.monthlyBoxCount || 0}</Text>
            <Text style={[styles.boxColTitle, { color: colors.brand }]}>Aylık</Text>
            <Text style={[styles.boxColSub, { color: colors.textSecondary }]}>30 Günlük</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  mistakeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  mistakeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  mistakeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mistakeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mistakeTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  mistakeCountPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mistakeCountText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  mistakeSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  sectionHeaderRow: {
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionHeader: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  examAnalysisCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  examTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  examLinkBtn: {
    paddingVertical: 2,
  },
  examLinkText: {
    fontSize: 12,
    fontWeight: '800',
  },
  examStatsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  examStatBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  examStatNum: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  examStatSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyExamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyExamIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyExamTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  emptyExamSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  skillsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  skillItem: {
    gap: 6,
  },
  skillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillName: {
    fontSize: 13,
    fontWeight: '700',
  },
  skillValue: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  skillTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  boxesCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
  },
  boxesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  boxCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  boxColNum: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  boxColTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  boxColSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
});
