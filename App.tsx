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
import { User, Settings } from 'lucide-react-native';
import { useLearningStore } from './src/store/useLearningStore';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DailyTasksScreen } from './src/components/DailyTasksScreen';
import { MockExamScreen } from './src/components/MockExamScreen';
import { MistakeVaultScreen } from './src/components/MistakeVaultScreen';
import { WordVaultScreen } from './src/components/WordVaultScreen';
import { AuthModal } from './src/components/AuthModal';
import { SettingsModal } from './src/components/SettingsModal';

export default function App() {
  const {
    activeTab,
    mistakes,
    userProfile,
    isLoading,
    isInitialized,
    initStore,
    setActiveTab,
  } = useLearningStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top App Header Bar with Profile & Settings Access */}
      <View style={styles.topAppBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>YDS</Text>
          </View>
          <Text style={styles.brandTitle}>Master</Text>
        </View>

        <TouchableOpacity
          style={styles.profileChip}
          onPress={() => setIsSettingsModalOpen(true)}
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

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Settings & Profile Modal */}
      <SettingsModal
        visible={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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
