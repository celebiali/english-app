import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  FileSpreadsheet,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';
import { CatalogExamInfo } from '../services/YdsExamCatalog';
import { ExamScoreCard } from '../types';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  exam: CatalogExamInfo;
  pastResult?: ExamScoreCard;
  onSelect: (exam: CatalogExamInfo) => void;
}

export const ExamCardItem: React.FC<Props> = ({ exam, pastResult, onSelect }) => {
  const { colors } = useThemeStore();
  const isAI = exam.tag === 'AI Özel';
  const isMaster = exam.tag === 'Master Deneme';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
        },
      ]}
      onPress={() => onSelect(exam)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.tagBadge,
            { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder },
          ]}
        >
          {isAI ? (
            <Sparkles size={12} color={colors.brand} />
          ) : isMaster ? (
            <BookOpen size={12} color={colors.brand} />
          ) : (
            <FileSpreadsheet size={12} color={colors.brand} />
          )}
          <Text style={[styles.tagText, { color: colors.brand }]}>{exam.tag}</Text>
        </View>

        {pastResult ? (
          <View style={[styles.completedBadge, { backgroundColor: colors.successLight, borderColor: colors.successLight }]}>
            <Award size={12} color={colors.success} />
            <Text style={[styles.completedText, { color: colors.success }]}>
              Puan: {pastResult.ydsScore} (Seviye {pastResult.levelGrade})
            </Text>
          </View>
        ) : (
          <Text style={[styles.yearText, { color: colors.textSecondary }]}>{exam.year}</Text>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{exam.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {exam.description}
      </Text>

      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{exam.durationMinutes} Dakika</Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{exam.totalQuestions} Soru</Text>
        </View>

        <View style={[styles.enterBtn, { backgroundColor: colors.brandLight }]}>
          <Text style={[styles.enterBtnText, { color: colors.brand }]}>İncele & Başlat</Text>
          <ChevronRight size={14} color={colors.brand} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  yearText: {
    fontSize: 12,
    fontWeight: '800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  enterBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
