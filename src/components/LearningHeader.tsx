import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Library, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { AppTab } from '../store/useLearningStore';

export interface LearningHeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  studiedCount?: number;
  totalWords?: number;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  activeTab,
  onTabChange,
  studiedCount = 0,
  totalWords = 0,
}: LearningHeaderProps) => {
  const isDictionary = activeTab === 'DICTIONARY';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Left Side Button: Tüm Kelimeler / Ana Sayfa */}
        <TouchableOpacity
          style={styles.leftButton}
          onPress={() => onTabChange(isDictionary ? 'DAILY' : 'DICTIONARY')}
          activeOpacity={0.7}
        >
          {isDictionary ? (
            <ArrowLeft size={16} color="#2563EB" strokeWidth={2.2} />
          ) : (
            <Library size={16} color="#2563EB" strokeWidth={2.2} />
          )}
          <Text style={styles.leftButtonText}>
            {isDictionary ? 'Ana Sayfa' : 'Tüm Kelimeler'}
          </Text>
        </TouchableOpacity>

        {/* Center: App Title */}
        <View style={styles.titleCenter}>
          <Text style={styles.appTitle}>YDS Vocab</Text>
          <Text style={styles.subtitle}>Spaced Repetition</Text>
        </View>

        {/* Right Side: Studied Words Counter Badge */}
        <View style={styles.rightBadge}>
          <CheckCircle2 size={13} color="#16A34A" strokeWidth={2.5} />
          <Text style={styles.rightBadgeText}>
            {studiedCount} / {totalWords}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  leftButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  titleCenter: {
    alignItems: 'center',
  },
  appTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  rightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 5,
  },
  rightBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
});
