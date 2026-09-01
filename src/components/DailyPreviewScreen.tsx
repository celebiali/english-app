import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { BookMarked, Eye, EyeOff, Play } from 'lucide-react-native';
import { CardWord } from '../types';
import { useThemeStore } from '../store/useThemeStore';

export interface DailyPreviewScreenProps {
  words: CardWord[];
  onStartTest: () => void;
}

export const DailyPreviewScreen: React.FC<DailyPreviewScreenProps> = ({
  words,
  onStartTest,
}) => {
  const { colors } = useThemeStore();
  const [hideMeanings, setHideMeanings] = useState<boolean>(false);

  const renderStudyCard = ({ item, index }: { item: CardWord; index: number }) => {
    return (
      <View
        style={[
          styles.studyCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
          },
        ]}
      >
        {/* Top Info Bar */}
        <View style={styles.cardHeader}>
          <View style={[styles.indexBadge, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.indexBadgeText, { color: colors.brand }]}>#{index + 1}</Text>
          </View>

          <View style={styles.headerBadgesRight}>
            <View style={[styles.levelBadge, { backgroundColor: colors.brandLight }]}>
              <Text style={[styles.levelBadgeText, { color: colors.brand }]}>{item.level}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: colors.subtleBackground }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>{item.category}</Text>
            </View>
          </View>
        </View>

        {/* Word Title & Subcategory */}
        <Text style={[styles.wordTitle, { color: colors.text }]}>{item.word}</Text>
        {item.subcategory ? (
          <Text style={[styles.subcategoryText, { color: colors.textSecondary }]}>{item.subcategory}</Text>
        ) : null}

        {/* Meaning Box */}
        <View style={[styles.meaningBox, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
          <Text style={[styles.meaningLabel, { color: colors.brand }]}>Türkçe Karşılığı:</Text>
          {hideMeanings ? (
            <Text style={[styles.hiddenMeaningText, { color: colors.textSecondary }]}>
              [Gizlendi - Hatırlamaya Çalışın]
            </Text>
          ) : (
            <Text style={[styles.meaningText, { color: colors.text }]}>{item.meaning}</Text>
          )}
        </View>

        {/* Synonyms */}
        {!hideMeanings && item.synonyms && item.synonyms.length > 0 && (
          <View style={styles.synonymsRow}>
            <Text style={[styles.synonymLabel, { color: colors.textSecondary }]}>Eş Anlamlılar:</Text>
            <View style={styles.synonymChips}>
              {item.synonyms.map((syn, idx) => (
                <View key={idx} style={[styles.synonymChip, { backgroundColor: colors.brandLight }]}>
                  <Text style={[styles.synonymChipText, { color: colors.brand }]}>{syn}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Example Sentence */}
        {!hideMeanings && item.example_sentence && (
          <View style={[styles.exampleContainer, { borderLeftColor: colors.brand }]}>
            <Text style={[styles.exampleSentence, { color: colors.text }]}>
              "{item.example_sentence}"
            </Text>
            {item.example_translation && (
              <Text style={[styles.exampleTranslation, { color: colors.textSecondary }]}>
                {item.example_translation}
              </Text>
            )}
          </View>
        )}

        {/* Etymology Note */}
        {!hideMeanings && item.etymology_note && (
          <View style={[styles.etymologyContainer, { backgroundColor: colors.subtleBackground }]}>
            <Text style={[styles.etymologyText, { color: colors.textSecondary }]}>
              Kök/Ek Notu: {item.etymology_note}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Banner & Instructions */}
      <View style={[styles.topBanner, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={[styles.bannerIconChip, { backgroundColor: colors.brandLight }]}>
          <BookMarked size={20} color={colors.brand} strokeWidth={2.2} />
        </View>

        <View style={styles.bannerTextGroup}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Çalışma & Ezberleme Modu</Text>
          <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
            Bugünkü {words.length} kelimeyi testten önce inceleyin.
          </Text>
        </View>

        {/* Toggle Hide/Show Meanings button */}
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: colors.subtleBackground }]}
          onPress={() => setHideMeanings(!hideMeanings)}
          activeOpacity={0.8}
        >
          {hideMeanings ? (
            <Eye size={14} color={colors.textSecondary} strokeWidth={2.2} />
          ) : (
            <EyeOff size={14} color={colors.textSecondary} strokeWidth={2.2} />
          )}
          <Text style={[styles.toggleButtonText, { color: colors.textSecondary }]}>
            {hideMeanings ? 'Göster' : 'Gizle'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Word List */}
      <FlatList
        data={words}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStudyCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Start Test Action Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.startTestButton, { backgroundColor: colors.brand }]}
          onPress={onStartTest}
          activeOpacity={0.85}
        >
          <Play size={16} color={colors.textOnBrand} strokeWidth={2.5} fill={colors.textOnBrand} />
          <Text style={[styles.startTestButtonText, { color: colors.textOnBrand }]}>
            Hazırım, Testi Başlat ({words.length} Kelime)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bannerIconChip: {
    padding: 8,
    borderRadius: 10,
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  studyCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indexBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  indexBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  headerBadgesRight: {
    flexDirection: 'row',
    gap: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  wordTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  subcategoryText: {
    fontSize: 11,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  meaningBox: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
  },
  meaningLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  meaningText: {
    fontSize: 15,
    fontWeight: '700',
  },
  hiddenMeaningText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  synonymsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  synonymLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  synonymChips: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  synonymChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  synonymChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  exampleContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginTop: 8,
  },
  exampleSentence: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  exampleTranslation: {
    fontSize: 11,
    marginTop: 2,
  },
  etymologyContainer: {
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  etymologyText: {
    fontSize: 10.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    borderTopWidth: 1,
  },
  startTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startTestButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
});
