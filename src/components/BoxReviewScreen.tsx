import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Lock, Unlock, Clock } from 'lucide-react-native';
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
              {isWeekly
                ? 'Bu kutuda henüz kelime yok. Günlük kelime çalışmasında doğru bildikleriniz 7 günlük kalıcılık testine girmek üzere buraya aktarılır.'
                : 'Bu kutuda henüz kelime yok. Haftalık görevini (Box 2) başarıyla tamamlayan kelimeler 30 günlük kalıcılık testine girmek üzere buraya aktarılır.'}
            </Text>
          </View>
        ) : isFullyLocked ? (
          <View style={styles.lockBanner}>
            <View style={styles.lockIconChip}>
              <Lock size={20} color="#DC2626" strokeWidth={2.2} />
            </View>
            <View style={styles.lockBannerTextGroup}>
              <Text style={styles.lockBannerTitle}>Kutu Kilitli (Süresi Dolmadı)</Text>
              <Text style={styles.lockBannerDesc}>
                {boxPeriodName} tekrar süresi henüz dolmadı. İlk tekrar kilit açılışı için yaklaşık{' '}
                <Text style={{ fontWeight: '800', color: '#DC2626' }}>{minDaysRemaining} gün</Text>{' '}
                kaldı. Zamanı gelince kilit otomatik olarak açılacaktır.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.unlockBanner}>
            <View style={styles.unlockIconChip}>
              <Unlock size={20} color="#16A34A" strokeWidth={2.2} />
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

      {/* RENDER WORDS AS STANDARD VIEW TO PREVENT VIRTUALIZED LIST SCROLL CONFLICT */}
      {words.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Kutudaki Kelimeler ve Kilit Durumları</Text>
          <View style={styles.wordRowsWrap}>
            {words.map((item) => (
              <View key={item.id} style={styles.wordRow}>
                <View style={styles.rowLeft}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  <Text style={styles.meaningText}>{item.meaning}</Text>
                </View>

                <View style={styles.rowRight}>
                  {item.isUnlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Unlock size={12} color="#059669" strokeWidth={2.2} />
                      <Text style={styles.unlockedBadgeText}>Hazır</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedBadge}>
                      <Lock size={12} color="#DC2626" strokeWidth={2.2} />
                      <Text style={styles.lockedBadgeText}>
                        {item.daysRemaining || 7} Gün Kaldı
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EAF3',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyBoxInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  emptyBoxText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 14,
  },
  lockIconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBannerTextGroup: {
    flex: 1,
  },
  lockBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 3,
  },
  lockBannerDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
  },
  unlockIconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 3,
  },
  unlockBannerDesc: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 17,
  },
  listSection: {
    marginTop: 6,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  wordRowsWrap: {
    gap: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF3',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowLeft: {
    flex: 1,
    marginRight: 10,
  },
  wordText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  meaningText: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  unlockedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
});
