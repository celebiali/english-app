import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
} from 'react-native';
import { Lock, Unlock } from 'lucide-react-native';
import { WordWithProgress } from '../database/DatabaseService';

export interface BoxReviewScreenProps {
  boxType: 'WEEKLY' | 'MONTHLY';
  words: WordWithProgress[];
}

export const BoxReviewScreen: React.FC<BoxReviewScreenProps> = ({
  boxType,
  words,
}) => {
  const isWeekly = boxType === 'WEEKLY';
  const boxTitle = isWeekly ? 'Haftalık Kutu (Box 2)' : 'Aylık Kutu (Box 3)';
  const boxPeriodName = isWeekly ? '7 Günlük' : '30 Günlük';

  const unlockedWords = words.filter((w) => w.isUnlocked);
  const lockedWords = words.filter((w) => !w.isUnlocked);

  const minDaysRemaining =
    lockedWords.length > 0
      ? Math.min(...lockedWords.map((w) => w.daysRemaining || 1))
      : 0;

  const isFullyLocked = words.length > 0 && unlockedWords.length === 0;

  const renderWordRow = ({ item }: { item: WordWithProgress }) => {
    return (
      <View style={styles.wordRow}>
        <View style={styles.rowLeft}>
          <Text style={styles.wordText}>{item.word}</Text>
          <Text style={styles.meaningText}>{item.meaning}</Text>
        </View>

        <View style={styles.rowRight}>
          {item.isUnlocked ? (
            <View style={styles.unlockedBadge}>
              <Unlock size={12} color="#16A34A" strokeWidth={2.2} />
              <Text style={styles.unlockedBadgeText}>Tekrar Et</Text>
            </View>
          ) : (
            <View style={styles.lockedBadge}>
              <Lock size={12} color="#DC2626" strokeWidth={2.2} />
              <Text style={styles.lockedBadgeText}>
                {item.daysRemaining} Gün Kaldı
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{boxTitle}</Text>
        <Text style={styles.headerSubtitle}>
          {boxPeriodName} kalıcılık test havuzunda {words.length} kelime var.
        </Text>

        {words.length === 0 ? (
          <View style={styles.emptyBoxInfo}>
            <Text style={styles.emptyBoxText}>
              Bu kutuda henüz kelime yok. Günlük 25 kelimelik çalışmada doğru
              bildikleriniz buraya aktarılır.
            </Text>
          </View>
        ) : isFullyLocked ? (
          <View style={styles.lockBanner}>
            <View style={styles.lockIconChip}>
              <Lock size={22} color="#DC2626" strokeWidth={2.2} />
            </View>
            <View style={styles.lockBannerTextGroup}>
              <Text style={styles.lockBannerTitle}>Kutu Kilitli (Süresi Gelmedi)</Text>
              <Text style={styles.lockBannerDesc}>
                {boxPeriodName} tekrar süresi henüz dolmadı. İlk tekrar için yaklaşık{' '}
                <Text style={{ fontWeight: '700' }}>{minDaysRemaining} gün</Text>{' '}
                kaldı. Zamanı gelmeden kartlar çözülemez.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.unlockBanner}>
            <View style={styles.unlockIconChip}>
              <Unlock size={22} color="#16A34A" strokeWidth={2.2} />
            </View>
            <View style={styles.lockBannerTextGroup}>
              <Text style={styles.unlockBannerTitle}>Tekrar Zamanı Geldi!</Text>
              <Text style={styles.unlockBannerDesc}>
                {unlockedWords.length} kelimenin {boxPeriodName} tekrar süresi
                doldu. Hemen tekrar edebilirsiniz.
              </Text>
            </View>
          </View>
        )}
      </View>

      {words.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Kutudaki Kelimeler ve Kilit Durumları</Text>
          <FlatList
            data={words}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWordRow}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyBoxInfo: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyBoxText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
  lockBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockIconChip: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 10,
  },
  unlockIconChip: {
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 10,
  },
  lockBannerTextGroup: {
    flex: 1,
  },
  lockBannerTitle: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  lockBannerDesc: {
    color: '#7F1D1D',
    fontSize: 12,
    lineHeight: 16,
  },
  unlockBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unlockBannerTitle: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  unlockBannerDesc: {
    color: '#14532D',
    fontSize: 12,
    lineHeight: 16,
  },
  listSection: {
    flex: 1,
  },
  listTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  wordRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flex: 1,
    marginRight: 10,
  },
  wordText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  meaningText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  rowRight: {},
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  lockedBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  unlockedBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
});
