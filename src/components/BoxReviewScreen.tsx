import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Lock, Unlock, PackageCheck, Clock } from 'lucide-react-native';
import { WordWithProgress } from '../database/DatabaseService';
import { useThemeStore } from '../store/useThemeStore';

export interface BoxReviewScreenProps {
  boxType: 'WEEKLY' | 'MONTHLY';
  words: WordWithProgress[];
}

export const BoxReviewScreen: React.FC<BoxReviewScreenProps> = ({
  boxType,
  words = [],
}) => {
  const { colors } = useThemeStore();
  const safeWords = words || [];

  const isWeekly = boxType === 'WEEKLY';
  const boxTitle = isWeekly ? 'Haftalık Tekrar Havuzu' : 'Aylık Kalıcı Hafıza Havuzu';
  const boxPeriodName = isWeekly ? '7 Günlük' : '30 Günlük';

  const unlockedWords = safeWords.filter((w) => w && w.isUnlocked);
  const lockedWords = safeWords.filter((w) => w && !w.isUnlocked);

  const minDaysRemaining =
    lockedWords.length > 0
      ? Math.min(...lockedWords.map((w) => w.daysRemaining || 1))
      : 0;

  const isFullyLocked = safeWords.length > 0 && unlockedWords.length === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View
            style={[
              styles.boxBadge,
              { backgroundColor: colors.brandLight },
            ]}
          >
            <Text
              style={[
                styles.boxBadgeText,
                { color: colors.brand },
              ]}
            >
              {isWeekly ? 'HAFTALIK' : 'AYLIK'}
            </Text>
          </View>
          <Text style={[styles.wordCountPill, { color: colors.textSecondary }]}>
            {safeWords.length} Kelime
          </Text>
        </View>

        <Text style={[styles.headerTitle, { color: colors.text }]}>{boxTitle}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {isWeekly
            ? '7 günde bir yapılan aralıklı tekrar havuzu'
            : '30 günde bir test edilen kalıcı hafıza havuzu'}
        </Text>

        {safeWords.length === 0 ? (
          <View
            style={[
              styles.emptyBoxInfo,
              {
                backgroundColor: colors.subtleBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <PackageCheck size={28} color={colors.brand} style={styles.emptyIcon} />
            <Text style={[styles.emptyBoxTitle, { color: colors.text }]}>
              Bu Havuzda Henüz Kelime Yok
            </Text>
            <Text style={[styles.emptyBoxText, { color: colors.textSecondary }]}>
              {isWeekly
                ? 'Günlük kelime çalışmasında bildiğiniz kelimeler 7 günlük pekiştirme testine tabi tutulmak üzere otomatik olarak buraya aktarılır.'
                : 'Haftalık tekrarını başarıyla tamamlayan kelimeler 30 günlük kalıcı hafıza onay testine girmek üzere buraya aktarılır.'}
            </Text>
          </View>
        ) : isFullyLocked ? (
          <View
            style={[
              styles.lockBanner,
              {
                backgroundColor: colors.subtleBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.lockIconChip,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Lock size={18} color={colors.textSecondary} strokeWidth={2.2} />
            </View>
            <View style={styles.lockBannerTextGroup}>
              <Text style={[styles.lockBannerTitle, { color: colors.text }]}>
                Havuz Kilitli (Süresi Dolmadı)
              </Text>
              <Text style={[styles.lockBannerDesc, { color: colors.textSecondary }]}>
                {boxPeriodName} tekrar süresi henüz dolmadı. İlk tekrar kilit açılışı için yaklaşık{' '}
                <Text style={{ fontWeight: '800', color: colors.brand }}>
                  {minDaysRemaining} gün
                </Text>{' '}
                kaldı. Zamanı gelince kilit otomatik olarak açılacaktır.
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.unlockBanner,
              {
                backgroundColor: colors.brandLight,
                borderColor: colors.brandLightBorder,
              },
            ]}
          >
            <View
              style={[
                styles.unlockIconChip,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Unlock size={18} color={colors.brand} strokeWidth={2.2} />
            </View>
            <View style={styles.lockBannerTextGroup}>
              <Text style={[styles.unlockBannerTitle, { color: colors.brand }]}>
                Tekrar Zamanı Geldi!
              </Text>
              <Text style={[styles.unlockBannerDesc, { color: colors.text }]}>
                {unlockedWords.length} kelimenin {boxPeriodName} tekrar süresi doldu. Hemen tekrar edebilirsiniz.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* RENDER WORDS */}
      {safeWords.length > 0 && (
        <View style={styles.listSection}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Havuzdaki Kelimeler ({safeWords.length})
          </Text>
          <View style={styles.wordRowsWrap}>
            {safeWords.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.wordRow,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.wordText, { color: colors.text }]}>
                    {item.word}
                  </Text>
                  <Text
                    style={[styles.meaningText, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.meaning}
                  </Text>
                </View>

                <View style={styles.rowRight}>
                  {item.isUnlocked ? (
                    <View
                      style={[
                        styles.unlockedBadge,
                        {
                          backgroundColor: colors.brandLight,
                          borderColor: colors.brandLightBorder,
                        },
                      ]}
                    >
                      <Unlock size={12} color={colors.brand} strokeWidth={2.2} />
                      <Text style={[styles.unlockedBadgeText, { color: colors.brand }]}>
                        Hazır
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.lockedBadge,
                        {
                          backgroundColor: colors.subtleBackground,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Clock size={12} color={colors.textSecondary} strokeWidth={2.2} />
                      <Text style={[styles.lockedBadgeText, { color: colors.textSecondary }]}>
                        {item.daysRemaining || (isWeekly ? 7 : 30)}g
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  boxBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  boxBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  wordCountPill: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBoxInfo: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyBoxTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyBoxText: {
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'center',
  },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  lockIconChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBannerTextGroup: {
    flex: 1,
  },
  lockBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  lockBannerDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  unlockIconChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  unlockBannerDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  listSection: {
    marginTop: 4,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginLeft: 2,
  },
  wordRowsWrap: {
    gap: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
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
  },
  meaningText: {
    fontSize: 12.5,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  unlockedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
