import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  ChevronLeft,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { CardComponent } from './CardComponent';
import { BoxReviewScreen } from './BoxReviewScreen';
import { WordListMenu } from './WordListMenu';

type MainVocabTab = 'DAILY_CARDS' | 'DICTIONARY';
type BoxReviewType = 'NONE' | 'WEEKLY' | 'MONTHLY';

export const WordVaultScreen: React.FC = () => {
  const {
    sessionWords,
    currentVocabIndex,
    boxSummary,
    weeklyWords,
    monthlyWords,
    dictionaryWords,
    completedTodayCount,
    answerCurrentVocabCard,
    resetVocabSession,
  } = useLearningStore();

  const { colors } = useThemeStore();

  const [activeTab, setActiveTab] = useState<MainVocabTab>('DAILY_CARDS');
  const [boxReviewMode, setBoxReviewMode] = useState<BoxReviewType>('NONE');

  const currentCard = sessionWords && sessionWords[currentVocabIndex] ? sessionWords[currentVocabIndex] : null;
  const isSessionFinished = sessionWords && sessionWords.length > 0 && currentVocabIndex >= sessionWords.length;

  // Render Box Review Sub-Screen if active
  if (boxReviewMode !== 'NONE') {
    const isWeekly = boxReviewMode === 'WEEKLY';
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Back Navigation Bar */}
        <View style={[styles.subTopBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setBoxReviewMode('NONE')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={colors.brand} />
            <Text style={[styles.backBtnText, { color: colors.brand }]}>Geri Dön</Text>
          </TouchableOpacity>
          <Text style={[styles.subPageTitle, { color: colors.text }]}>
            {isWeekly ? '📅 Haftalık Tekrar Havuzu' : '🏆 Aylık Kalıcı Hafıza Havuzu'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <BoxReviewScreen
          boxType={isWeekly ? 'WEEKLY' : 'MONTHLY'}
          words={isWeekly ? (weeklyWords || []) : (monthlyWords || [])}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP 2-TAB SEGMENTED BAR */}
      <View style={[styles.segmentContainerWrapper, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={[styles.topSegmentBar, { backgroundColor: colors.subtleBackground }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'DAILY_CARDS' && [styles.segmentBtnActive, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => setActiveTab('DAILY_CARDS')}
            activeOpacity={0.8}
          >
            <Sparkles
              size={16}
              color={activeTab === 'DAILY_CARDS' ? colors.brand : colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.segmentBtnText,
                { color: activeTab === 'DAILY_CARDS' ? colors.brand : colors.textSecondary },
                activeTab === 'DAILY_CARDS' && styles.segmentBtnTextActive,
              ]}
            >
              Günlük Set & Tekrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'DICTIONARY' && [styles.segmentBtnActive, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => setActiveTab('DICTIONARY')}
            activeOpacity={0.8}
          >
            <BookOpen
              size={16}
              color={activeTab === 'DICTIONARY' ? colors.brand : colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.segmentBtnText,
                { color: activeTab === 'DICTIONARY' ? colors.brand : colors.textSecondary },
                activeTab === 'DICTIONARY' && styles.segmentBtnTextActive,
              ]}
            >
              Sözlük
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB 1: GÜNÜN KELİMELERİ & LEITNER KUTULARI */}
      {activeTab === 'DAILY_CARDS' && (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {!isSessionFinished && currentCard ? (
            <CardComponent
              cardWord={currentCard}
              onAnswer={answerCurrentVocabCard}
              cardIndex={currentVocabIndex}
              totalCards={sessionWords.length || 0}
            />
          ) : (
            <View style={[styles.sessionFinishedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <CheckCircle2 size={46} color={colors.success} />
              <Text style={[styles.finishedTitle, { color: colors.text }]}>Tebrikler! Kelimeler Tamamlandı</Text>
              <Text style={[styles.finishedSubtitle, { color: colors.textSecondary }]}>
                Bugün {completedTodayCount} kelimeyi hafızana aldın.
              </Text>
              <TouchableOpacity
                style={[styles.restartSessionBtn, { backgroundColor: colors.brand }]}
                onPress={resetVocabSession}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color={colors.textOnBrand} />
                <Text style={[styles.restartSessionBtnText, { color: colors.textOnBrand }]}>Kelime Çalışmaya Devam Et</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PROGRESS TRACK */}
          <View style={[styles.progressSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.progressHeaderRow}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>Günün İlerlemesi</Text>
              <Text style={[styles.progressCounter, { color: colors.brand }]}>
                {sessionWords.length > 0
                  ? sessionWords.some((w) => w.cardType === 'REVIEW')
                    ? `${Math.min(currentVocabIndex + 1, sessionWords.length)} / ${sessionWords.length} (${sessionWords.filter((w) => w.cardType !== 'REVIEW').length} Yeni + ${sessionWords.filter((w) => w.cardType === 'REVIEW').length} Tekrar)`
                    : `${Math.min(currentVocabIndex + 1, sessionWords.length)} / ${sessionWords.length} Kelime`
                  : `${completedTodayCount} Kelime Tamamlandı`}
              </Text>
            </View>
            <View style={[styles.breakdownTrack, { backgroundColor: colors.subtleBackground }]}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    backgroundColor: colors.brand,
                    width: `${
                      sessionWords.length > 0
                        ? Math.min(100, Math.round(((currentVocabIndex + 1) / sessionWords.length) * 100))
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* HAFIZA HAVUZLARI DURUMU */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>📅 Tekrar ve Hafıza Havuzları</Text>
          <View style={styles.boxesList}>
            {/* GÜNLÜK TEKRAR & YENİ */}
            <View style={[styles.boxStatusCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.boxIconBox, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.boxIconNum, { color: colors.brand }]}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.boxTitle, { color: colors.text }]}>Günlük Tekrar & 25 Yeni Kelime</Text>
                <Text style={[styles.boxSub, { color: colors.textSecondary }]}>
                  {sessionWords.some((w) => w.cardType === 'REVIEW')
                    ? `${sessionWords.filter((w) => w.cardType === 'REVIEW').length} dünden tekrar + ${sessionWords.filter((w) => w.cardType !== 'REVIEW').length} yeni kelime`
                    : 'Günün 25 yeni kelimesi + dünden kalanlar'}
                </Text>
              </View>
              <View style={[styles.boxCountPill, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.boxCountText, { color: colors.brand }]}>
                  {sessionWords.length || boxSummary.dailyBoxCount || 25} Kelime
                </Text>
              </View>
            </View>

            {/* HAFTALIK TEKRAR */}
            <TouchableOpacity
              style={[styles.boxStatusCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => setBoxReviewMode('WEEKLY')}
              activeOpacity={0.8}
            >
              <View style={[styles.boxIconBox, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.boxIconNum, { color: colors.brand }]}>H</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.boxTitle, { color: colors.text }]}>Haftalık Tekrar Havuzu</Text>
                <Text style={[styles.boxSub, { color: colors.textSecondary }]}>7 günde bir pekiştirilen kelimeler</Text>
              </View>
              <View style={[styles.boxCountPill, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.boxCountText, { color: colors.brand }]}>
                  {weeklyWords.length || boxSummary.weeklyBoxCount || 0} Kelime ➔
                </Text>
              </View>
            </TouchableOpacity>

            {/* AYLIK KALICI HAFIZA */}
            <TouchableOpacity
              style={[styles.boxStatusCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => setBoxReviewMode('MONTHLY')}
              activeOpacity={0.8}
            >
              <View style={[styles.boxIconBox, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.boxIconNum, { color: colors.brand }]}>A</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.boxTitle, { color: colors.text }]}>Aylık Kalıcı Hafıza Havuzu</Text>
                <Text style={[styles.boxSub, { color: colors.textSecondary }]}>30 günde bir test edilen kalıcı kelimeler</Text>
              </View>
              <View style={[styles.boxCountPill, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.boxCountText, { color: colors.brand }]}>
                  {monthlyWords.length || boxSummary.monthlyBoxCount || 0} Kelime ➔
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* TAB 2: KLASÖRLERİM VE YDS SÖZLÜK */}
      {activeTab === 'DICTIONARY' && (
        <WordListMenu words={dictionaryWords} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  topSegmentBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  segmentBtnActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  segmentBtnTextActive: {
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  subTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  subPageTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressSection: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressCounter: {
    fontSize: 12,
    fontWeight: '800',
  },
  breakdownTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 4,
  },
  boxesList: {
    gap: 10,
  },
  boxStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  boxIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxIconNum: {
    fontSize: 15,
    fontWeight: '900',
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  boxSub: {
    fontSize: 11,
    marginTop: 2,
  },
  boxCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  boxCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sessionFinishedCard: {
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  finishedTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12,
  },
  finishedSubtitle: {
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  restartSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  restartSessionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});
