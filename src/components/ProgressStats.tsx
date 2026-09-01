import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BoxCountSummary } from '../types';
import { useThemeStore } from '../store/useThemeStore';

export interface ProgressStatsProps {
  summary: BoxCountSummary;
  completedTodayCount: number;
  dailyLimit?: number;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  summary,
  completedTodayCount,
  dailyLimit = 25,
}) => {
  const { colors } = useThemeStore();
  const percentage = Math.min(
    100,
    Math.round((completedTodayCount / dailyLimit) * 100)
  );

  return (
    <View style={styles.container}>
      {/* Daily Progress Goal Bar */}
      <View style={[styles.goalCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, { color: colors.text }]}>Günlük Hedef</Text>
          <Text style={[styles.goalCount, { color: colors.brand }]}>
            {completedTodayCount} / {dailyLimit} Kelime
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.subtleBackground }]}>
          <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: colors.brand }]} />
        </View>
      </View>

      {/* Compact Leitner Box Indicators Row */}
      <View style={styles.boxesRow}>
        <View style={[styles.boxChip, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
          <Text style={[styles.boxChipLabel, { color: colors.textSecondary }]}>Box 0 (24h)</Text>
          <Text style={[styles.boxChipValue, { color: colors.textSecondary }]}>
            {summary.specialPoolCount}
          </Text>
        </View>

        <View style={[styles.boxChip, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
          <Text style={[styles.boxChipLabel, { color: colors.brand }]}>Box 1 (Günlük)</Text>
          <Text style={[styles.boxChipValue, { color: colors.brand }]}>
            {summary.dailyBoxCount}
          </Text>
        </View>

        <View style={[styles.boxChip, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
          <Text style={[styles.boxChipLabel, { color: colors.brand }]}>Box 2 (7 Gün)</Text>
          <Text style={[styles.boxChipValue, { color: colors.brand }]}>
            {summary.weeklyBoxCount}
          </Text>
        </View>

        <View style={[styles.boxChip, { backgroundColor: colors.successLight, borderColor: colors.successLight }]}>
          <Text style={[styles.boxChipLabel, { color: colors.success }]}>Box 3 (30 Gün)</Text>
          <Text style={[styles.boxChipValue, { color: colors.success }]}>
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
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  boxesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  boxChip: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  boxChipLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  boxChipValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});
