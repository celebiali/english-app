import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  BookOpen,
  Link,
  Dna,
  MessageSquareQuote,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Filter,
} from 'lucide-react-native';
import { WordWithProgress } from '../database/DatabaseService';
import { CategoryType, WordLevel } from '../types';

export interface WordListMenuProps {
  words: WordWithProgress[];
}

type StatusTabFilter = 'ALL' | 'STUDIED' | 'UNSTUDIED';
type LevelTabFilter = 'ALL' | WordLevel;

interface CategoryInfo {
  type: CategoryType;
  title: string;
  subtitle: string;
  renderIcon: () => React.ReactNode;
}

const CATEGORIES: CategoryInfo[] = [
  {
    type: 'VOCABULARY',
    title: 'YDS Kelime Havuzu',
    subtitle: 'A1 - C1 Seviye Temel ve İleri Kelimeler',
    renderIcon: () => <BookOpen size={20} color="#2563EB" strokeWidth={2.2} />,
  },
  {
    type: 'CONNECTOR',
    title: 'Bağlaçlar ve Yapılar',
    subtitle: 'Zaman, Zıtlık, Sebep ve Koşul Bağlaçları',
    renderIcon: () => <Link size={20} color="#2563EB" strokeWidth={2.2} />,
  },
  {
    type: 'PREFIX_ROOT',
    title: 'Etimoloji ve Kökler',
    subtitle: 'Latin & Grek Kökler, Ön ve Son Ekler',
    renderIcon: () => <Dna size={20} color="#2563EB" strokeWidth={2.2} />,
  },
  {
    type: 'IDIOM',
    title: 'Deyimler ve Kalıplar',
    subtitle: 'Oxford YDS Sık Kullanılan Kalıp İfadeler',
    renderIcon: () => (
      <MessageSquareQuote size={20} color="#2563EB" strokeWidth={2.2} />
    ),
  },
];

const LEVELS: { key: LevelTabFilter; label: string }[] = [
  { key: 'ALL', label: 'Tüm Seviyeler' },
  { key: 'A1', label: 'A1' },
  { key: 'A2', label: 'A2' },
  { key: 'B1', label: 'B1' },
  { key: 'B2', label: 'B2' },
  { key: 'C1', label: 'C1' },
];

export const WordListMenu: React.FC<WordListMenuProps> = ({ words }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<StatusTabFilter>('ALL');
  const [levelFilter, setLevelFilter] = useState<LevelTabFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const unstudiedQueueMap = new Map<number, number>();
  let unstudiedCounter = 0;
  words.forEach((w) => {
    if (!w.isStudied) {
      unstudiedCounter++;
      unstudiedQueueMap.set(w.id, unstudiedCounter);
    }
  });

  const getCategoryStats = (catType: CategoryType) => {
    const catWords = words.filter((w) => w.category === catType);
    const studiedCount = catWords.filter((w) => w.isStudied).length;
    return {
      total: catWords.length,
      studied: studiedCount,
      percentage: Math.round((studiedCount / (catWords.length || 1)) * 100),
    };
  };

  const categoryWords = selectedCategory
    ? words.filter((item) => {
        if (item.category !== selectedCategory) return false;

        // Level Filter
        if (levelFilter !== 'ALL' && item.level !== levelFilter) return false;

        // Status Filter
        if (statusFilter === 'STUDIED' && !item.isStudied) return false;
        if (statusFilter === 'UNSTUDIED' && item.isStudied) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchWord = item.word.toLowerCase().includes(q);
          const matchMeaning = item.meaning.toLowerCase().includes(q);
          if (!matchWord && !matchMeaning) return false;
        }

        return true;
      })
    : [];

  const renderWordItem = ({ item }: { item: WordWithProgress }) => {
    const queuePosition = unstudiedQueueMap.get(item.id);
    const upcomingDay = queuePosition ? Math.ceil(queuePosition / 25) : null;

    return (
      <View
        style={[
          styles.wordCard,
          item.isStudied ? styles.studiedCard : styles.unstudiedCard,
        ]}
      >
        <View style={styles.cardLeft}>
          <View style={styles.wordTitleRow}>
            {item.isStudied ? (
              <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.5} />
            ) : (
              <Circle size={18} color="#CBD5E1" strokeWidth={2} />
            )}

            <Text style={styles.wordText}>{item.word}</Text>
          </View>

          <Text style={styles.meaningText}>{item.meaning}</Text>

          {item.example_sentence && (
            <Text style={styles.exampleText} numberOfLines={1}>
              "{item.example_sentence}"
            </Text>
          )}
        </View>

        <View style={styles.cardRight}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>

          {item.isStudied ? (
            item.box !== null && (
              <View
                style={[
                  styles.boxTag,
                  item.box === 0 && styles.boxTag0,
                  item.box === 1 && styles.boxTag1,
                  item.box === 2 && styles.boxTag2,
                  item.box === 3 && styles.boxTag3,
                ]}
              >
                <Text style={styles.boxTagText}>
                  {item.box === 0
                    ? 'Box 0 (24h)'
                    : item.box === 1
                    ? 'Box 1 (Günlük)'
                    : item.box === 2
                    ? 'Box 2 (Haftalık)'
                    : 'Box 3 (Aylık)'}
                </Text>
              </View>
            )
          ) : (
            <View
              style={[
                styles.upcomingBadge,
                upcomingDay === 1 && styles.nextDayBadge,
              ]}
            >
              <Text
                style={[
                  styles.upcomingBadgeText,
                  upcomingDay === 1 && styles.nextDayBadgeText,
                ]}
              >
                {upcomingDay === 1
                  ? 'Sıradaki (1. Gün)'
                  : `${upcomingDay}. Gün`}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // CATEGORIES OVERVIEW
  if (selectedCategory === null) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.overviewScrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.overviewHeaderTitle}>Kelime Kategorileri</Text>
        <Text style={styles.overviewHeaderSub}>
          Görüntülemek istediğiniz kategoriye dokunun:
        </Text>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const stats = getCategoryStats(cat.type);
            return (
              <TouchableOpacity
                key={cat.type}
                style={styles.categoryCard}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedCategory(cat.type);
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setLevelFilter('ALL');
                }}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={styles.iconChip}>{cat.renderIcon()}</View>
                  <View style={styles.categoryBadgeChip}>
                    <Text style={styles.categoryBadgeChipText}>
                      {stats.total} Kelime
                    </Text>
                  </View>
                </View>

                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>

                <View style={styles.catProgressContainer}>
                  <View style={styles.catProgressHeader}>
                    <Text style={styles.catProgressText}>
                      {stats.studied} / {stats.total} Çıktı
                    </Text>
                    <Text style={styles.catPercentText}>%{stats.percentage}</Text>
                  </View>
                  <View style={styles.catTrack}>
                    <View
                      style={[
                        styles.catFill,
                        { width: `${stats.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // DETAILED CATEGORY WORD LIST
  const activeCatObj = CATEGORIES.find((c) => c.type === selectedCategory);
  const totalInCat = words.filter((w) => w.category === selectedCategory).length;
  const studiedInCat = words.filter(
    (w) => w.category === selectedCategory && w.isStudied
  ).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSelectedCategory(null)}
        activeOpacity={0.7}
      >
        <ArrowLeft size={16} color="#2563EB" strokeWidth={2.2} />
        <Text style={styles.backButtonText}>Geri Dön</Text>
      </TouchableOpacity>

      <View style={styles.selectedCatHeaderRow}>
        <Text style={styles.selectedCatTitle}>{activeCatObj?.title}</Text>
        <Text style={styles.selectedCatSub}>
          {studiedInCat} / {totalInCat} Çıktı
        </Text>
      </View>

      {/* Level Filter Chips Row */}
      <View style={styles.levelFilterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelFilterScroll}
        >
          {LEVELS.map((lvl) => {
            const countForLvl = words.filter(
              (w) =>
                w.category === selectedCategory &&
                (lvl.key === 'ALL' || w.level === lvl.key)
            ).length;

            return (
              <TouchableOpacity
                key={lvl.key}
                style={[
                  styles.levelChip,
                  levelFilter === lvl.key && styles.activeLevelChip,
                ]}
                onPress={() => setLevelFilter(lvl.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.levelChipText,
                    levelFilter === lvl.key && styles.activeLevelChipText,
                  ]}
                >
                  {lvl.label} ({countForLvl})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kelime veya anlam ara..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.statusTabsRow}>
        <TouchableOpacity
          style={[
            styles.statusTabBtn,
            statusFilter === 'ALL' && styles.activeStatusTabBtn,
          ]}
          onPress={() => setStatusFilter('ALL')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statusTabBtnText,
              statusFilter === 'ALL' && styles.activeStatusTabBtnText,
            ]}
          >
            Tümü ({categoryWords.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTabBtn,
            statusFilter === 'STUDIED' && styles.activeStatusTabBtn,
          ]}
          onPress={() => setStatusFilter('STUDIED')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statusTabBtnText,
              statusFilter === 'STUDIED' && styles.activeStatusTabBtnText,
            ]}
          >
            Çıkanlar ({categoryWords.filter((w) => w.isStudied).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusTabBtn,
            statusFilter === 'UNSTUDIED' && styles.activeStatusTabBtn,
          ]}
          onPress={() => setStatusFilter('UNSTUDIED')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statusTabBtnText,
              statusFilter === 'UNSTUDIED' && styles.activeStatusTabBtnText,
            ]}
          >
            Gelecek ({categoryWords.filter((w) => !w.isStudied).length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContent}>
        {categoryWords.map((item) => (
          <React.Fragment key={item.id}>
            {renderWordItem({ item })}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  overviewScrollContent: {
    paddingBottom: 140,
  },
  overviewHeaderTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  overviewHeaderSub: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconChip: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryBadgeChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryBadgeChipText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  categorySubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  catProgressContainer: {
    marginTop: 4,
  },
  catProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catProgressText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  catPercentText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  catTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedCatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCatTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  selectedCatSub: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '700',
  },
  levelFilterSection: {
    marginBottom: 8,
  },
  levelFilterScroll: {
    gap: 6,
  },
  levelChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeLevelChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  levelChipText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  activeLevelChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  statusTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    gap: 4,
    marginBottom: 10,
  },
  statusTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeStatusTabBtn: {
    backgroundColor: '#FFFFFF',
  },
  statusTabBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  activeStatusTabBtnText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 140,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studiedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  unstudiedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#94A3B8',
  },
  cardLeft: {
    flex: 1,
    marginRight: 10,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  wordText: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  meaningText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  exampleText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  levelBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  boxTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  boxTag0: {
    backgroundColor: '#FEF2F2',
  },
  boxTag1: {
    backgroundColor: '#FFFBEB',
  },
  boxTag2: {
    backgroundColor: '#EFF6FF',
  },
  boxTag3: {
    backgroundColor: '#F0FDF4',
  },
  boxTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  upcomingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nextDayBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  upcomingBadgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  nextDayBadgeText: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
