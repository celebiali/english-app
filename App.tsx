import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
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
  } = useLearningStore();

  const { colors, theme } = useThemeStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsPageOpen, setIsSettingsPageOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    initStore();
  }, []);

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <AppLogo size={96} borderRadius={24} />
      </SafeAreaView>
    );
  }

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
        {/* Top App Header Bar (Clean Minimalist Header with User Profile) */}
        <View style={styles.topAppBar}>
          <View style={styles.topRightRow}>
            {/* User Profile / Login Indicator */}
            {userProfile ? (
              <TouchableOpacity
                style={[
                  styles.userProfileBtn,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                  },
                ]}
                onPress={() => setIsSettingsPageOpen(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.userAvatarInitialCircle, { backgroundColor: colors.brand }]}>
                  <Text style={[styles.userAvatarInitialText, { color: colors.textOnBrand }]}>
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text style={[styles.userProfileNameText, { color: colors.text }]} numberOfLines={1}>
                  {userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'Öğrenci'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.loginHeaderBtn,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                  },
                ]}
                onPress={() => setIsAuthModalOpen(true)}
                activeOpacity={0.75}
              >
                <User size={15} color={colors.brand} />
                <Text style={[styles.loginHeaderBtnText, { color: colors.brand }]}>Giriş Yap</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main Screen Content */}
        <View style={styles.mainContent}>
          {activeTab === 'TASKS' && (
            <DailyTasksScreen onOpenMistakes={() => setActiveTab('MISTAKES')} />
          )}
          {activeTab === 'EXAM' && <MockExamScreen />}
          {activeTab === 'VOCAB' && <WordVaultScreen />}
          {activeTab === 'STATS' && (
            <StatsScreen onOpenMistakes={() => setActiveTab('MISTAKES')} />
          )}
          {activeTab === 'MISTAKES' && (
            <MistakeVaultScreen onBack={() => setActiveTab('TASKS')} />
          )}
        </View>
      </SafeAreaView>

      {/* Bottom Navigation (4 Tabs: Görevler, Sınav, Kelime, İstatistik) */}
      <BottomTabBar
        activeTab={activeTab === 'MISTAKES' ? 'TASKS' : activeTab}
        onTabChange={setActiveTab}
        mistakesCount={mistakes.length}
      />

      {/* Subscription & Promo Code Modal */}
      <SubscriptionModal
        visible={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* Auth Modal for Quick Login/Register */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </View>
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
    paddingTop: 8,
    paddingBottom: 6,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    maxWidth: 140,
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
    fontSize: 12.5,
    fontWeight: '800',
    maxWidth: 80,
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
});
