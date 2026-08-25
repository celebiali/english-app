import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Plus,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { CardComponent } from './CardComponent';
import { BoxReviewScreen } from './BoxReviewScreen';
import { WordListMenu } from './WordListMenu';
import { CustomWordModal } from './CustomWordModal';
import { CustomVaultView } from './CustomVaultView';

type VocabSubTab = 'DAILY_BOX' | 'WEEKLY_BOX' | 'MONTHLY_BOX' | 'CUSTOM_WORDS' | 'DICTIONARY';

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

  const [subTab, setSubTab] = useState<VocabSubTab>('DAILY_BOX');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const customWords = dictionaryWords.filter((w) => w.is_custom);
  const currentCard = sessionWords[currentVocabIndex];
  const isSessionFinished = sessionWords.length > 0 && currentVocabIndex >= sessionWords.length;

  const subTabs = [
    {
      key: 'DAILY_BOX' as VocabSubTab,
      label: '📦 Günlük',
      count: sessionWords.length > 0 ? sessionWords.length : boxSummary.dailyBoxCount || 0,
    },
    {
      key: 'WEEKLY_BOX' as VocabSubTab,
      label: '📦 Haftalık',
      count: weeklyWords.length || boxSummary.weeklyBoxCount || 0,
    },
    {
      key: 'MONTHLY_BOX' as VocabSubTab,
      label: '📦 Aylık',
      count: monthlyWords.length || boxSummary.monthlyBoxCount || 0,
    },
    {
      key: 'CUSTOM_WORDS' as VocabSubTab,
      label: '⭐ Özel',
      count: customWords.length,
    },
    {
      key: 'DICTIONARY' as VocabSubTab,
      label: '📚 Sözlük',
      count: dictionaryWords.length,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topline} />

      {/* SCREEN 5: BOX-NAV CHIPS IN HTML */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boxNav}
      >
        {subTabs.map((tab) => {
          const isOn = subTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.boxChip, isOn && styles.boxChipOn]}
              onPress={() => setSubTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.boxChipLabel, isOn && styles.boxChipLabelOn]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <View style={[styles.nBadge, isOn && styles.nBadgeOn]}>
                  <Text style={[styles.nBadgeText, isOn && styles.nBadgeTextOn]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FLASHCARD AND ACTIONS */}
      {subTab === 'DAILY_BOX' && (
        <View>
          {!isSessionFinished && currentCard ? (
            <CardComponent
              cardWord={currentCard}
              onAnswer={answerCurrentVocabCard}
              cardIndex={currentVocabIndex}
              totalCards={sessionWords.length || 25}
            />
          ) : (
            <View style={styles.sessionFinishedCard}>
              <CheckCircle2 size={44} color="#10B981" />
              <Text style={styles.finishedTitle}>Tebrikler! Günlük Kelime Seti Bitti</Text>
              <Text style={styles.finishedSubtitle}>
                Bugün {completedTodayCount} kelimeyi başarıyla gözden geçirdin.
              </Text>
              <TouchableOpacity
                style={styles.restartSessionBtn}
                onPress={resetVocabSession}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color="#FFFFFF" />
                <Text style={styles.restartSessionBtnText}>Yeni Kelime Grubu Başlat</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SECTION: BUGÜNKÜ İLERLEME */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Bugünkü İlerleme</Text>
            <View style={styles.progressCard}>
              <View style={styles.breakdownTrack}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${
                        sessionWords.length > 0
                          ? Math.min(100, Math.round(((currentVocabIndex + 1) / sessionWords.length) * 100))
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressCounter}>
                {sessionWords.length > 0
                  ? `${Math.min(currentVocabIndex + 1, sessionWords.length)} / ${sessionWords.length}`
                  : '0 / 25'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {subTab === 'CUSTOM_WORDS' && (
        <CustomVaultView words={customWords} />
      )}

      {subTab === 'WEEKLY_BOX' && (
        <BoxReviewScreen boxType="WEEKLY" words={weeklyWords} />
      )}

      {subTab === 'MONTHLY_BOX' && (
        <BoxReviewScreen boxType="MONTHLY" words={monthlyWords} />
      )}

      {subTab === 'DICTIONARY' && (
        <WordListMenu words={dictionaryWords} />
      )}

      <CustomWordModal
        visible={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  topline: {
    height: 10,
  },
  boxNav: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  boxChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  boxChipOn: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  boxChipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  boxChipLabelOn: {
    color: '#FFFFFF',
  },
  nBadge: {
    backgroundColor: '#F1F4FA',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  nBadgeOn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  nBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  nBadgeTextOn: {
    color: '#FFFFFF',
  },
  sessionFinishedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  finishedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  restartSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  restartSessionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressSection: {
    marginTop: 14,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#EEF1F8',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 6,
  },
  progressCounter: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  addCustomWordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  addCustomWordBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
