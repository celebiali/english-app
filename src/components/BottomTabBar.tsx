import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import {
  LayoutGrid,
  Clock,
  AlertTriangle,
  BookOpen,
} from 'lucide-react-native';
import { AppTab } from '../store/useLearningStore';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  mistakesCount?: number;
}

export const BottomTabBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  mistakesCount = 0,
}) => {
  const tabs: {
    key: AppTab;
    label: string;
    Icon: any;
    badge?: number;
  }[] = [
    {
      key: 'TASKS',
      label: 'Görevler',
      Icon: LayoutGrid,
    },
    {
      key: 'EXAM',
      label: 'Sınav',
      Icon: Clock,
    },
    {
      key: 'MISTAKES',
      label: 'Hatalar',
      Icon: AlertTriangle,
      badge: mistakesCount > 0 ? mistakesCount : undefined,
    },
    {
      key: 'VOCAB',
      label: 'Kelime',
      Icon: BookOpen,
    },
  ];

  return (
    <View style={styles.tabbar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.Icon;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <IconComponent
                size={22}
                color={isActive ? '#4F46E5' : '#94A3B8'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
            <View style={[styles.pip, isActive && styles.pipActive]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7EAF3',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrapper: {
    position: 'relative',
    padding: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: '#94A3B8',
  },
  pip: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'transparent',
    marginTop: 1,
  },
  pipActive: {
    backgroundColor: '#4F46E5',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
