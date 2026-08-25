import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { User, Settings, Sparkles, Crown } from 'lucide-react-native';
import { useLearningStore } from './src/store/useLearningStore';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DailyTasksScreen } from './src/components/DailyTasksScreen';
import { MockExamScreen } from './src/components/MockExamScreen';
import { MistakeVaultScreen } from './src/components/MistakeVaultScreen';
import { WordVaultScreen } from './src/components/WordVaultScreen';
import { AuthScreen } from './src/components/AuthScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { SubscriptionModal } from './src/components/SubscriptionModal';

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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsPageOpen, setIsSettingsPageOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    initStore();
  }, []);

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingTitle}>YDS Master</Text>
        <Text style={styles.loadingSubtitle}>
          Soru havuzu ve aralıklı tekrar motoru hazırlanıyor...
        </Text>
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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SettingsScreen
          onBack={() => setIsSettingsPageOpen(false)}
          onOpenAuth={() => setUserProfile(null)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top App Header Bar with Profile & Settings Access */}
      <View style={styles.topAppBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogoBox}>
            <Sparkles size={14} color="#FBBF24" />
          </View>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>YDS</Text>
          </View>
          <Text style={styles.brandTitle}>Master</Text>
        </View>

        <View style={styles.topRightRow}>
          {/* Quick Pro Upgrade Chip */}
          <TouchableOpacity
            style={styles.topProChip}
            onPress={() => setIsSubscriptionModalOpen(true)}
            activeOpacity={0.8}
          >
            <Crown size={12} color="#D97706" />
            <Text style={styles.topProChipText}>
              {userProfile?.isPro ? 'PRO' : 'PRO %20'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileChip}
            onPress={() => setIsSettingsPageOpen(true)}
            activeOpacity={0.75}
          >
            {userProfile ? (
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>
                  {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
            ) : (
              <View style={styles.guestChip}>
                <User size={13} color="#4F46E5" />
                <Text style={styles.guestChipText}>Giriş Yap</Text>
              </View>
            )}
            <View style={styles.settingsIconBtn}>
              <Settings size={15} color="#475569" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Screen Content */}
      <View style={styles.mainContent}>
        {activeTab === 'TASKS' && <DailyTasksScreen />}
        {activeTab === 'EXAM' && <MockExamScreen />}
        {activeTab === 'MISTAKES' && <MistakeVaultScreen />}
        {activeTab === 'VOCAB' && <WordVaultScreen />}
      </View>

      {/* Bottom Navigation (4 Tabs) */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mistakesCount={mistakes.length}
      />

      {/* Subscription & Promo Code Modal */}
      <SubscriptionModal
        visible={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandLogoBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  brandBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  brandBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topProChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  topProChipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  guestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  guestChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  settingsIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
});
