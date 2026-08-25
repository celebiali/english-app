import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLearningStore } from './src/store/useLearningStore';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DailyTasksScreen } from './src/components/DailyTasksScreen';
import { MockExamScreen } from './src/components/MockExamScreen';
import { MistakeVaultScreen } from './src/components/MistakeVaultScreen';
import { WordVaultScreen } from './src/components/WordVaultScreen';
import { AuthModal } from './src/components/AuthModal';
import { ProfileModal } from './src/components/ProfileModal';

export default function App() {
  const {
    activeTab,
    mistakes,
    isLoading,
    isInitialized,
    initStore,
    setActiveTab,
  } = useLearningStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

      {/* Main Screen Content - Direct 1-to-1 HTML Render without extra header */}
      <View style={styles.mainContent}>
        {activeTab === 'TASKS' && <DailyTasksScreen />}
        {activeTab === 'EXAM' && <MockExamScreen />}
        {activeTab === 'MISTAKES' && <MistakeVaultScreen />}
        {activeTab === 'VOCAB' && <WordVaultScreen />}
      </View>

      {/* Bottom Navigation (4 Tabs exactly like HTML) */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mistakesCount={mistakes.length}
      />

      {/* Auth Modal */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
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
