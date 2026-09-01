import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Sparkles,
  Plus,
  Search,
  BookOpen,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react-native';
import { WordWithProgress, dbService } from '../database/DatabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { CardComponent } from './CardComponent';
import { CustomWordModal } from './CustomWordModal';

interface Props {
  words: WordWithProgress[];
}

export const CustomVaultView: React.FC<Props> = ({ words = [] }) => {
  const { loadVocabSession } = useLearningStore();
  const { colors } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'LIST' | 'FLASHCARD'>('LIST');
  const [flashIndex, setFlashIndex] = useState(0);

  const activeWordsList = words || [];

  // Filter words by search
  const filteredWords = activeWordsList.filter(
    (w) =>
      w &&
      (w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const learnedCount = activeWordsList.filter((w) => w && (w.box || 1) > 1).length;

  const handleDeleteWord = (item: WordWithProgress) => {
    Alert.alert(
      'Kelimeyi Sil',
      `"${item.word}" kelimesini özel defterinizden silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await dbService.deleteCustomWord(item.id);
            await loadVocabSession();
          },
        },
      ]
    );
  };

  const handleToggleLearned = async (item: WordWithProgress) => {
    const isNowLearned = (item.box || 1) <= 1;
    await dbService.updateWordBox(item.id, isNowLearned ? 3 : 1);
    await loadVocabSession();
  };

  return (
    <View style={styles.container}>
      {/* HERO BANNER FOR CUSTOM WORDS */}
      <View style={[styles.heroBanner, { backgroundColor: colors.brand }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBox}>
            <Sparkles size={20} color={colors.textOnBrand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.textOnBrand }]}>Kişisel Kelime Kasası</Text>
            <Text style={[styles.heroSubtitle, { color: 'rgba(255, 255, 255, 0.85)' }]}>
              Makalelerde ve günlük hayatta karşılaştığın bilmediğin kelimeleri buraya ekle.
            </Text>
          </View>
        </View>

        {/* Big Add Word Button */}
        <TouchableOpacity
          style={[styles.heroAddBtn, { backgroundColor: colors.cardBackground }]}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={[styles.heroAddBtnText, { color: colors.brand }]}>+ Yeni Kelime Ekle (AI Otomatik Doldurur)</Text>
        </TouchableOpacity>
      </View>

      {/* STATS & MODE SELECTOR */}
      <View style={styles.statsBar}>
        <View style={[styles.statPill, { backgroundColor: colors.brandLight }]}>
          <Text style={[styles.statPillText, { color: colors.brand }]}>⭐ {words.length} Özel Kelime</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.statPillText, { color: colors.success }]}>
            ✅ {learnedCount} Öğrenildi
          </Text>
        </View>

        {/* View Mode Toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'LIST' && [styles.modeBtnActive, { backgroundColor: colors.brandLight }],
            ]}
            onPress={() => setActiveMode('LIST')}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: activeMode === 'LIST' ? colors.brand : colors.textSecondary },
                activeMode === 'LIST' && { fontWeight: '800' },
              ]}
            >
              📋 Liste
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'FLASHCARD' && [styles.modeBtnActive, { backgroundColor: colors.brandLight }],
            ]}
            onPress={() => {
              setFlashIndex(0);
              setActiveMode('FLASHCARD');
            }}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: activeMode === 'FLASHCARD' ? colors.brand : colors.textSecondary },
                activeMode === 'FLASHCARD' && { fontWeight: '800' },
              ]}
            >
              🎴 Flashcard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODE 1: FLASHCARD STUDY ON CUSTOM WORDS */}
      {activeMode === 'FLASHCARD' && (
        <View style={styles.flashcardArea}>
          {filteredWords.length > 0 && flashIndex < filteredWords.length ? (
            <CardComponent
              cardWord={filteredWords[flashIndex]}
              cardIndex={flashIndex}
              totalCards={filteredWords.length}
              onAnswer={async (isCorrect) => {
                const current = filteredWords[flashIndex];
                await dbService.updateWordBox(current.id, isCorrect ? 2 : 1);
                await loadVocabSession();
                setFlashIndex((prev) => prev + 1);
              }}
            />
          ) : words.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.brandLight }]}>
                <BookOpen size={36} color={colors.brand} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz Özel Kelime Eklenmedi</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Flashcard tekrarı yapmak için önce yukarıdaki butondan kelime ekleyin.
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: colors.brand }]}
                onPress={() => setIsModalOpen(true)}
                activeOpacity={0.85}
              >
                <Plus size={16} color={colors.textOnBrand} strokeWidth={2.5} />
                <Text style={[styles.emptyAddBtnText, { color: colors.textOnBrand }]}>İlk Kelimeni Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.finishedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <CheckCircle2 size={44} color={colors.success} />
              <Text style={[styles.finishedTitle, { color: colors.text }]}>Özel Kelimeler Seti Tamamlandı!</Text>
              <Text style={[styles.finishedSubtitle, { color: colors.textSecondary }]}>
                Kişisel kelime kutundaki tüm kelimeleri tekrar ettin.
              </Text>
              <TouchableOpacity
                style={[styles.restartBtn, { backgroundColor: colors.brand }]}
                onPress={() => setFlashIndex(0)}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color={colors.textOnBrand} />
                <Text style={[styles.restartBtnText, { color: colors.textOnBrand }]}>Baştan Tekrar Et</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* MODE 2: RICH LIST OF CUSTOM WORDS */}
      {activeMode === 'LIST' && (
        <View style={{ flex: 1 }}>
          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Kişisel kelimelerimde ara..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearchText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Cards List */}
          {filteredWords.length > 0 ? (
            <View style={styles.cardsList}>
              {filteredWords.map((item) => {
                const isLearned = (item.box || 1) > 1;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.wordCard,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
                      },
                    ]}
                  >
                    {/* Top Row: Word & Level & Actions */}
                    <View style={styles.cardHeader}>
                      <View style={styles.wordTitleRow}>
                        <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: colors.brandLight }]}>
                          <Text style={[styles.levelBadgeText, { color: colors.brand }]}>{item.level || 'B2'}</Text>
                        </View>
                      </View>

                      <View style={styles.actionsRight}>
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            isLearned
                              ? { backgroundColor: colors.successLight }
                              : { backgroundColor: colors.subtleBackground },
                          ]}
                          onPress={() => handleToggleLearned(item)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              { color: isLearned ? colors.success : colors.textSecondary },
                              { fontWeight: '800' },
                            ]}
                          >
                            {isLearned ? '✅ Öğrendim' : '⏳ Öğreniliyor'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteWord(item)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Meaning Box */}
                    <View style={[styles.meaningBox, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                      <Text style={[styles.meaningText, { color: colors.text }]}>{item.meaning}</Text>
                    </View>

                    {/* Example Sentence */}
                    {item.example_sentence && (
                      <View style={[styles.exampleBox, { borderLeftColor: colors.brand }]}>
                        <Text style={[styles.exampleEn, { color: colors.text }]}>"{item.example_sentence}"</Text>
                        {item.example_translation && (
                          <Text style={[styles.exampleTr, { color: colors.textSecondary }]}>{item.example_translation}</Text>
                        )}
                      </View>
                    )}

                    {/* Synonyms Chips */}
                    {item.synonyms && item.synonyms.length > 0 && (
                      <View style={styles.synonymsRow}>
                        {item.synonyms.map((s, idx) => (
                          <View key={idx} style={[styles.synonymChip, { backgroundColor: colors.brandLight }]}>
                            <Text style={[styles.synonymChipText, { color: colors.brand }]}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.brandLight }]}>
                <BookOpen size={36} color={colors.brand} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz Özel Kelime Eklenmedi</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                İngilizce makaleler okurken veya günlük hayatta bilmediğin kelimeleri tek tıkla buraya ekleyebilirsin. AI otomatik olarak anlamını ve YDS örnek cümlesini hazırlar.
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: colors.brand }]}
                onPress={() => setIsModalOpen(true)}
                activeOpacity={0.85}
              >
                <Plus size={16} color={colors.textOnBrand} strokeWidth={2.5} />
                <Text style={[styles.emptyAddBtnText, { color: colors.textOnBrand }]}>İlk Kelimeni Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Modal to add new custom word */}
      <CustomWordModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  heroIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  heroAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroAddBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  modeToggle: {
    flexDirection: 'row',
    marginLeft: 'auto',
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modeBtnActive: {},
  modeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  flashcardArea: {
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.4,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  cardsList: {
    gap: 12,
    paddingBottom: 20,
  },
  wordCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBtnText: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 4,
  },
  meaningBox: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  meaningText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exampleBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 2,
    marginBottom: 10,
  },
  exampleEn: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  exampleTr: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 4,
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  synonymChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  synonymChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  finishedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
  },
  finishedTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  restartBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
