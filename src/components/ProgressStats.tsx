import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BoxCountSummary } from '../types';

export interface ProgressStatsProps {
  summary: BoxCountSummary;
  completedTodayCount: number;
  dailyLimit: number;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  summary,
  completedTodayCount,
  dailyLimit = 25,
}) => {
  const percentage = Math.min(
    100,
    Math.round((completedTodayCount / dailyLimit) * 100)
  );

  return (
    <View style={styles.container}>
      {/* Daily Progress Goal Bar */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Günlük Hedef</Text>
          <Text style={styles.goalCount}>
            {completedTodayCount} / {dailyLimit} Kelime
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%` }]} />
        </View>
      </View>

      {/* Compact Leitner Box Indicators Row */}
      <View style={styles.boxesRow}>
        <View style={[styles.boxChip, styles.boxChip0]}>
          <Text style={styles.boxChipLabel}>Box 0 (24h)</Text>
          <Text style={[styles.boxChipValue, styles.boxChipValue0]}>
            {summary.specialPoolCount}
          </Text>
        </View>

        <View style={[styles.boxChip, styles.boxChip1]}>
          <Text style={styles.boxChipLabel}>Box 1 (Günlük)</Text>
          <Text style={[styles.boxChipValue, styles.boxChipValue1]}>
            {summary.dailyBoxCount}
          </Text>
        </View>

        <View style={[styles.boxChip, styles.boxChip2]}>
          <Text style={styles.boxChipLabel}>Box 2 (7 Gün)</Text>
          <Text style={[styles.boxChipValue, styles.boxChipValue2]}>
            {summary.weeklyBoxCount}
          </Text>
        </View>

        <View style={[styles.boxChip, styles.boxChip3]}>
          <Text style={styles.boxChipLabel}>Box 3 (30 Gün)</Text>
          <Text style={[styles.boxChipValue, styles.boxChipValue3]}>
            {summary.monthlyBoxCount}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  goalCount: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  boxesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  boxChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  boxChip0: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  boxChip1: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  boxChip2: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  boxChip3: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  boxChipLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  boxChipValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  boxChipValue0: { color: '#DC2626' },
  boxChipValue1: { color: '#D97706' },
  boxChipValue2: { color: '#2563EB' },
  boxChipValue3: { color: '#16A34A' },
});
