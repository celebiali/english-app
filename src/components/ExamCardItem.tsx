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

interface Props {
  exam: CatalogExamInfo;
  pastResult?: ExamScoreCard;
  onSelect: (exam: CatalogExamInfo) => void;
}

export const ExamCardItem: React.FC<Props> = ({ exam, pastResult, onSelect }) => {
  const isAI = exam.tag === 'AI Özel';
  const isMaster = exam.tag === 'Master Deneme';

  const getTagBadge = () => {
    if (isAI) {
      return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' };
    }
    if (isMaster) {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    }
    return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
  };

  const tagStyle = getTagBadge();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(exam)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.tagBadge,
            { backgroundColor: tagStyle.bg, borderColor: tagStyle.border },
          ]}
        >
          {isAI ? (
            <Sparkles size={12} color={tagStyle.text} />
          ) : isMaster ? (
            <BookOpen size={12} color={tagStyle.text} />
          ) : (
            <FileSpreadsheet size={12} color={tagStyle.text} />
          )}
          <Text style={[styles.tagText, { color: tagStyle.text }]}>{exam.tag}</Text>
        </View>

        {pastResult ? (
          <View style={styles.completedBadge}>
            <Award size={12} color="#10B981" />
            <Text style={styles.completedText}>
              Puan: {pastResult.ydsScore} (Seviye {pastResult.levelGrade})
            </Text>
          </View>
        ) : (
          <Text style={styles.yearText}>{exam.year}</Text>
        )}
      </View>

      <Text style={styles.title}>{exam.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {exam.description}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Clock size={13} color="#64748B" />
            <Text style={styles.metaText}>{exam.durationMinutes} Dakika</Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{exam.totalQuestions} Soru</Text>
        </View>

        <View style={styles.enterBtn}>
          <Text style={styles.enterBtnText}>İncele & Başlat</Text>
          <ChevronRight size={14} color="#2563EB" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#64748B',
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
    color: '#94A3B8',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    backgroundColor: '#CBD5E1',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  enterBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
