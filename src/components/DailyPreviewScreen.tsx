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

export interface DailyPreviewScreenProps {
  words: CardWord[];
  onStartTest: () => void;
}

export const DailyPreviewScreen: React.FC<DailyPreviewScreenProps> = ({
  words,
  onStartTest,
}) => {
  const [hideMeanings, setHideMeanings] = useState<boolean>(false);

  const renderStudyCard = ({ item, index }: { item: CardWord; index: number }) => {
    return (
      <View style={styles.studyCard}>
        {/* Top Info Bar */}
        <View style={styles.cardHeader}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexBadgeText}>#{index + 1}</Text>
          </View>

          <View style={styles.headerBadgesRight}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{item.level}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
        </View>

        {/* Word Title & Subcategory */}
        <Text style={styles.wordTitle}>{item.word}</Text>
        {item.subcategory ? (
          <Text style={styles.subcategoryText}>{item.subcategory}</Text>
        ) : null}

        {/* Meaning Box */}
        <View style={styles.meaningBox}>
          <Text style={styles.meaningLabel}>Türkçe Karşılığı:</Text>
          {hideMeanings ? (
            <Text style={styles.hiddenMeaningText}>
              [Gizlendi - Hatırlamaya Çalışın]
            </Text>
          ) : (
            <Text style={styles.meaningText}>{item.meaning}</Text>
          )}
        </View>

        {/* Synonyms */}
        {!hideMeanings && item.synonyms && item.synonyms.length > 0 && (
          <View style={styles.synonymsRow}>
            <Text style={styles.synonymLabel}>Eş Anlamlılar:</Text>
            <View style={styles.synonymChips}>
              {item.synonyms.map((syn, idx) => (
                <View key={idx} style={styles.synonymChip}>
                  <Text style={styles.synonymChipText}>{syn}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Example Sentence */}
        {!hideMeanings && item.example_sentence && (
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleSentence}>
              "{item.example_sentence}"
            </Text>
            {item.example_translation && (
              <Text style={styles.exampleTranslation}>
                {item.example_translation}
              </Text>
            )}
          </View>
        )}

        {/* Etymology Note */}
        {!hideMeanings && item.etymology_note && (
          <View style={styles.etymologyContainer}>
            <Text style={styles.etymologyText}>
              Kök/Ek Notu: {item.etymology_note}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Banner & Instructions */}
      <View style={styles.topBanner}>
        <View style={styles.bannerIconChip}>
          <BookMarked size={20} color="#2563EB" strokeWidth={2.2} />
        </View>

        <View style={styles.bannerTextGroup}>
          <Text style={styles.bannerTitle}>Çalışma & Ezberleme Modu</Text>
          <Text style={styles.bannerSubtitle}>
            Bugünkü {words.length} kelimeyi testten önce inceleyin.
          </Text>
        </View>

        {/* Toggle Hide/Show Meanings button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setHideMeanings(!hideMeanings)}
          activeOpacity={0.8}
        >
          {hideMeanings ? (
            <Eye size={14} color="#334155" strokeWidth={2.2} />
          ) : (
            <EyeOff size={14} color="#334155" strokeWidth={2.2} />
          )}
          <Text style={styles.toggleButtonText}>
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
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startTestButton}
          onPress={onStartTest}
          activeOpacity={0.85}
        >
          <Play size={16} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          <Text style={styles.startTestButtonText}>
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
    backgroundColor: '#F8FAFC',
  },
  topBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bannerIconChip: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 10,
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  toggleButtonText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  studyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indexBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  indexBadgeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  headerBadgesRight: {
    flexDirection: 'row',
    gap: 6,
  },
  levelBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  wordTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  subcategoryText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  meaningBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  meaningLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  meaningText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '700',
  },
  hiddenMeaningText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  synonymsRow: {
    marginBottom: 8,
  },
  synonymLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  synonymChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  synonymChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  synonymChipText: {
    color: '#1E40AF',
    fontSize: 11,
    fontWeight: '600',
  },
  exampleContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    marginBottom: 6,
  },
  exampleSentence: {
    color: '#1E293B',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  exampleTranslation: {
    color: '#64748B',
    fontSize: 11,
  },
  etymologyContainer: {
    backgroundColor: '#FFFBEB',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  etymologyText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  startTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
  },
  startTestButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
