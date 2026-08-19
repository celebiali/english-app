import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Layers, Award } from 'lucide-react-native';
import { AppTab } from '../store/useLearningStore';

export interface BottomTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Tab 1: Günlük */}
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'DAILY' && styles.activeTabBtn]}
        onPress={() => onTabChange('DAILY')}
        activeOpacity={0.7}
      >
        <Calendar
          size={20}
          color={activeTab === 'DAILY' ? '#2563EB' : '#64748B'}
          strokeWidth={2.2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'DAILY' && styles.activeTabLabel,
          ]}
        >
          Günlük
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Haftalık */}
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'WEEKLY' && styles.activeTabBtn]}
        onPress={() => onTabChange('WEEKLY')}
        activeOpacity={0.7}
      >
        <Layers
          size={20}
          color={activeTab === 'WEEKLY' ? '#2563EB' : '#64748B'}
          strokeWidth={2.2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'WEEKLY' && styles.activeTabLabel,
          ]}
        >
          Haftalık
        </Text>
      </TouchableOpacity>

      {/* Tab 3: Aylık */}
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'MONTHLY' && styles.activeTabBtn]}
        onPress={() => onTabChange('MONTHLY')}
        activeOpacity={0.7}
      >
        <Award
          size={20}
          color={activeTab === 'MONTHLY' ? '#2563EB' : '#64748B'}
          strokeWidth={2.2}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'MONTHLY' && styles.activeTabLabel,
          ]}
        >
          Aylık
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  activeTabBtn: {
    backgroundColor: '#F1F5F9',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabLabel: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
