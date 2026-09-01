import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import {
  LayoutGrid,
  Clock,
  BookOpen,
  BarChart3,
} from 'lucide-react-native';
import { AppTab } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  mistakesCount?: number;
}

export const BottomTabBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
}) => {
  const { colors } = useThemeStore();

  const tabs: {
    key: AppTab;
    label: string;
    Icon: any;
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
      key: 'VOCAB',
      label: 'Kelime',
      Icon: BookOpen,
    },
    {
      key: 'STATS',
      label: 'İstatistik',
      Icon: BarChart3,
    },
  ];

  return (
    <View
      style={[
        styles.tabbar,
        {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
        },
      ]}
    >
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
            <View style={styles.iconContainer}>
              <IconComponent
                size={23}
                color={isActive ? colors.brand : colors.textSecondary}
                strokeWidth={isActive ? 2.6 : 1.9}
              />
            </View>

            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.brand : colors.textSecondary },
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    width: 32,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  tabLabelInactive: {
    fontWeight: '500',
  },
});
