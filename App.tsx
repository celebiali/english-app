import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLearningStore } from './src/store/useLearningStore';
import { LearningHeader } from './src/components/LearningHeader';
import { ProgressStats } from './src/components/ProgressStats';
import { DailyPreviewScreen } from './src/components/DailyPreviewScreen';
import { CardComponent } from './src/components/CardComponent';
import { BoxReviewScreen } from './src/components/BoxReviewScreen';
import { WordListMenu } from './src/components/WordListMenu';
import { BottomTabBar } from './src/components/BottomTabBar';

export default function App() {
  const {
    activeTab,
    studyMode,
    dailyLimit,
    sessionWords,
    currentIndex,
    boxSummary,
    weeklyWords,
    monthlyWords,
    dictionaryWords,
    isLoading,
    isInitialized,
    completedTodayCount,
    initStore,
    setActiveTab,
    setStudyMode,
    answerCurrentCard,
    resetSession,
  } = useLearningStore();

  useEffect(() => {
    initStore();
  }, []);

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Veritabanı Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  const currentCard = sessionWords[currentIndex];
  const isSessionFinished = currentIndex >= sessionWords.length;

  const studiedCount = dictionaryWords.filter((w) => w.isStudied).length;
  const totalWords = dictionaryWords.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Header with Top-Right Total Studied Words Count Badge */}
      <LearningHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studiedCount={studiedCount}
        totalWords={totalWords}
      />

      {/* MAIN SCREEN CONTENT */}
      <View style={styles.mainContent}>
        {/* TAB 1: GÜNLÜK (BOX 1 - PREVIEW & TEST FLOW) */}
        {activeTab === 'DAILY' && (
          <>
            {studyMode === 'PREVIEW' ? (
              <DailyPreviewScreen
                words={sessionWords}
                onStartTest={() => setStudyMode('TEST')}
              />
            ) : (
              <>
                <View style={styles.testTopBar}>
                  <TouchableOpacity
                    style={styles.backToPreviewBtn}
                    onPress={() => setStudyMode('PREVIEW')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.backToPreviewBtnText}>
                      ← Ön Çalışma Listesine Dön
                    </Text>
                  </TouchableOpacity>
                </View>

                <ProgressStats
                  summary={boxSummary}
                  completedTodayCount={completedTodayCount}
                  dailyLimit={dailyLimit}
                />

                <View style={styles.contentContainer}>
                  {!isSessionFinished && currentCard ? (
                    <CardComponent
                      cardWord={currentCard}
                      onAnswer={answerCurrentCard}
                      cardIndex={currentIndex}
                      totalCards={sessionWords.length}
                    />
                  ) : (
                    <View style={styles.completedContainer}>
                      <Text style={styles.completedTitle}>
                        Günlük 25 Kelime Tamamlandı
                      </Text>
                      <Text style={styles.completedSubtitle}>
                        Doğru bildikleriniz Haftalık Kutu'ya aktarıldı.{'\n'}
                        Yanlış bilinenler 24 saat sonra Özel Tekrar Havuzunda tekrar
                        gösterilecektir.
                      </Text>

                      <TouchableOpacity
                        style={styles.restartButton}
                        activeOpacity={0.8}
                        onPress={resetSession}
                      >
                        <Text style={styles.restartButtonText}>Yeniden Çalış</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </>
        )}

        {/* TAB 2: HAFTALIK KUTU (BOX 2) */}
        {activeTab === 'WEEKLY' && (
          <BoxReviewScreen boxType="WEEKLY" words={weeklyWords} />
        )}

        {/* TAB 3: AYLIK KUTU (BOX 3) */}
        {activeTab === 'MONTHLY' && (
          <BoxReviewScreen boxType="MONTHLY" words={monthlyWords} />
        )}

        {/* TAB 4: TÜM KELİMELER & 4 KATEGORİ MENÜSÜ */}
        {activeTab === 'DICTIONARY' && (
          <WordListMenu words={dictionaryWords} />
        )}
      </View>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  testTopBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backToPreviewBtn: {
    alignSelf: 'flex-start',
  },
  backToPreviewBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedContainer: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  completedTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  completedSubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
