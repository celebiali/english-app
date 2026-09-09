import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { User } from 'lucide-react-native';
import { useLearningStore } from './src/store/useLearningStore';
import { useThemeStore } from './src/store/useThemeStore';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DailyTasksScreen } from './src/components/DailyTasksScreen';
import { MockExamScreen } from './src/components/MockExamScreen';
import { MistakeVaultScreen } from './src/components/MistakeVaultScreen';
import { WordVaultScreen } from './src/components/WordVaultScreen';
import { StatsScreen } from './src/components/StatsScreen';
import { AuthScreen } from './src/components/AuthScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { SubscriptionModal } from './src/components/SubscriptionModal';
import { AuthModal } from './src/components/AuthModal';
import { AppLogo } from './src/components/AppLogo';
import { LearningHeader } from './src/components/LearningHeader';

export default function App() {
  const {
    activeTab,
    mistakes,
    userProfile,
    setUserProfile,
    isLoading,
    isInitialized,
    initStore,
    setActiveTab,
    currentExam,
    streakCount,
  } = useLearningStore();

  const { colors, theme } = useThemeStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsPageOpen, setIsSettingsPageOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isSolvingDailyTask, setIsSolvingDailyTask] = useState(false);
  const [isVocabPracticeActive, setIsVocabPracticeActive] = useState(false);

  // Hide top header and bottom tab bar when actively solving daily tasks, on exam screens, or in vocab practice
  const shouldHideBars =
    isSolvingDailyTask ||
    isVocabPracticeActive ||
    (activeTab === 'EXAM' && (isExamActive || Boolean(currentExam)));

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initStore();
  }, []);

  useEffect(() => {
    if (!isLoading && isInitialized) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, isInitialized]);

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.splashContent}>
          <AppLogo size={88} borderRadius={22} />

          <View style={styles.splashTitleRow}>
            <Text style={[styles.splashTitleMain, { color: colors.text }]}>Dil Sınavı Hazırlık</Text>
          </View>

          <Text style={[styles.splashSubtitle, { color: colors.textSecondary }]}>
            Akademik Kelime & Sınav Hazırlığı
          </Text>

          <View style={styles.splashSpinnerContainer}>
            <ActivityIndicator size="small" color={colors.brand} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Content to render with smooth fade-in
  const renderAppContent = () => {
    // MANDATORY AUTH GATE: Show full AuthScreen if not logged in
    if (!userProfile) {
      return <AuthScreen />;
    }

    // DEDICATED FULL-PAGE SETTINGS SCREEN
    if (isSettingsPageOpen) {
      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
          <SettingsScreen
            onBack={() => setIsSettingsPageOpen(false)}
            onOpenAuth={() => setUserProfile(null)}
          />
        </View>
      );
    }

    return (
      <View style={[styles.rootContainer, { backgroundColor: colors.cardBackground }]}>
        <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

        {/* Top Safe Area Container for Header & Main Content */}
        <SafeAreaView style={[styles.topSafeArea, { backgroundColor: colors.background }]}>
          {/* Top App Header Bar (Branded, balanced header with App Logo, title, streak, and profile) */}
          {!shouldHideBars && activeTab !== 'MISTAKES' && (
            <LearningHeader
              activeTab={activeTab}
              streakCount={streakCount}
              onOpenProfile={() => setIsSettingsPageOpen(true)}
            />
          )}

          {/* Main Active Tab Screen Content */}
          <View style={styles.mainContent}>
            {activeTab === 'TASKS' && (
              <DailyTasksScreen
                onOpenMistakes={() => setActiveTab('MISTAKES')}
                onSolvingModeChange={setIsSolvingDailyTask}
              />
            )}
            {activeTab === 'EXAM' && (
              <MockExamScreen onExamActiveChange={setIsExamActive} />
            )}
            {activeTab === 'VOCAB' && (
              <WordVaultScreen onPracticeActiveChange={setIsVocabPracticeActive} />
            )}
            {activeTab === 'STATS' && (
              <StatsScreen onOpenMistakes={() => setActiveTab('MISTAKES')} />
            )}
            {activeTab === 'MISTAKES' && (
              <MistakeVaultScreen onBack={() => setActiveTab('TASKS')} />
            )}
          </View>
        </SafeAreaView>

        {/* Global Bottom Tab Bar Navigation */}
        {!shouldHideBars && (
          <BottomTabBar
            activeTab={activeTab === 'MISTAKES' ? 'TASKS' : activeTab}
            onTabChange={setActiveTab}
            mistakesCount={mistakes.length}
          />
        )}

        {/* Auth Modal Triggered from inside tabs */}
        <AuthModal
          visible={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* RevenueCat Native Apple In-App Purchase Paywall Modal */}
        <SubscriptionModal
          visible={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      </View>
    );
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {renderAppContent()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topSafeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 20,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    maxWidth: '90%',
  },
  userAvatarInitialCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitialText: {
    fontSize: 13,
    fontWeight: '900',
  },
  userProfileNameText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    paddingRight: 2,
  },
  loginHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  loginHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  splashBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  splashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  splashTitleMain: {
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  splashTitleAccent: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  splashSpinnerContainer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
