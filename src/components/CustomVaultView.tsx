import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
  Volume2,
} from 'lucide-react-native';
import { WordWithProgress, dbService } from '../database/DatabaseService';
import { useLearningStore } from '../store/useLearningStore';
import { CardComponent } from './CardComponent';
import { CustomWordModal } from './CustomWordModal';

interface Props {
  words: WordWithProgress[];
}

export const CustomVaultView: React.FC<Props> = ({ words }) => {
  const { loadVocabSession } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'LIST' | 'FLASHCARD'>('LIST');
  const [flashIndex, setFlashIndex] = useState(0);

  const demoWords: WordWithProgress[] = [
    {
      id: 9901,
      word: 'EXACERBATE',
      meaning: 'daha da kötüleştirmek, şiddetlendirmek',
      category: 'VOCABULARY',
      subcategory: 'Kişisel Kelime Defterim',
      level: 'B2',
      synonyms: ['worsen', 'aggravate', 'deteriorate'],
      example_sentence: 'The lack of investment will only exacerbate the current economic crisis.',
      example_translation: 'Yatırım eksikliği mevcut ekonomik krizi yalnızca daha da kötüleştirecektir.',
      is_custom: true,
      isStudied: true,
      box: 1,
      status: 'NEW',
      correctCount: 0,
      incorrectCount: 0,
      nextReviewAt: null,
    },
    {
      id: 9902,
      word: 'PLAUSIBLE',
      meaning: 'akla yatkın, makul, olası',
      category: 'VOCABULARY',
      subcategory: 'Kişisel Kelime Defterim',
      level: 'C1',
      synonyms: ['reasonable', 'credible', 'feasible'],
      example_sentence: 'She offered a plausible explanation for her unexpected absence.',
      example_translation: 'Beklenmeyen devamsızlığı için akla yatkın bir açıklama sundu.',
      is_custom: true,
      isStudied: true,
      box: 2,
      status: 'MASTERED',
      correctCount: 2,
      incorrectCount: 0,
      nextReviewAt: null,
    },
  ];

  const activeWordsList = words.length > 0 ? words : demoWords;

  // Filter words by search
  const filteredWords = activeWordsList.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const learnedCount = activeWordsList.filter((w) => (w.box || 1) > 1).length;
  const studyingCount = activeWordsList.filter((w) => (w.box || 1) <= 1).length;

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
      <View style={styles.heroBanner}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBox}>
            <Sparkles size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Kişisel Kelime Kasası</Text>
            <Text style={styles.heroSubtitle}>
              Makalelerde ve günlük hayatta karşılaştığın bilmediğin kelimeleri buraya ekle.
            </Text>
          </View>
        </View>

        {/* Big Add Word Button */}
        <TouchableOpacity
          style={styles.heroAddBtn}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.85}
        >
          <Plus size={18} color="#4F46E5" strokeWidth={2.5} />
          <Text style={styles.heroAddBtnText}>+ Yeni Kelime Ekle (AI Otomatik Doldurur)</Text>
        </TouchableOpacity>
      </View>

      {/* STATS & MODE SELECTOR */}
      <View style={styles.statsBar}>
        <View style={styles.statPill}>
          <Text style={styles.statPillText}>⭐ {words.length} Özel Kelime</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.statPillText, { color: '#059669' }]}>
            ✅ {learnedCount} Öğrenildi
          </Text>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'LIST' && styles.modeBtnActive]}
            onPress={() => setActiveMode('LIST')}
          >
            <Text
              style={[styles.modeBtnText, activeMode === 'LIST' && styles.modeBtnTextActive]}
            >
              📋 Liste
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'FLASHCARD' && styles.modeBtnActive]}
            onPress={() => {
              setFlashIndex(0);
              setActiveMode('FLASHCARD');
            }}
          >
            <Text
              style={[
                styles.modeBtnText,
                activeMode === 'FLASHCARD' && styles.modeBtnTextActive,
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
          ) : (
            <View style={styles.finishedCard}>
              <CheckCircle2 size={44} color="#10B981" />
              <Text style={styles.finishedTitle}>Özel Kelimeler Seti Tamamlandı!</Text>
              <Text style={styles.finishedSubtitle}>
                Kişisel kelime kutundaki tüm kelimeleri tekrar ettin.
              </Text>
              <TouchableOpacity
                style={styles.restartBtn}
                onPress={() => setFlashIndex(0)}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color="#FFFFFF" />
                <Text style={styles.restartBtnText}>Baştan Tekrar Et</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* MODE 2: RICH LIST OF CUSTOM WORDS */}
      {activeMode === 'LIST' && (
        <View style={{ flex: 1 }}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Kişisel kelimelerimde ara..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Cards List */}
          {filteredWords.length > 0 ? (
            <View style={styles.cardsList}>
              {filteredWords.map((item) => {
                const isLearned = (item.box || 1) > 1;

                return (
                  <View key={item.id} style={styles.wordCard}>
                    {/* Top Row: Word & Level & Actions */}
                    <View style={styles.cardHeader}>
                      <View style={styles.wordTitleRow}>
                        <Text style={styles.wordText}>{item.word}</Text>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>{item.level || 'B2'}</Text>
                        </View>
                      </View>

                      <View style={styles.actionsRight}>
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            isLearned ? styles.statusLearned : styles.statusLearning,
                          ]}
                          onPress={() => handleToggleLearned(item)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              isLearned ? styles.statusLearnedText : styles.statusLearningText,
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
                          <Trash2 size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Meaning Box */}
                    <View style={styles.meaningBox}>
                      <Text style={styles.meaningText}>{item.meaning}</Text>
                    </View>

                    {/* Example Sentence */}
                    {item.example_sentence && (
                      <View style={styles.exampleBox}>
                        <Text style={styles.exampleEn}>"{item.example_sentence}"</Text>
                        {item.example_translation && (
                          <Text style={styles.exampleTr}>{item.example_translation}</Text>
                        )}
                      </View>
                    )}

                    {/* Synonyms Chips */}
                    {item.synonyms && item.synonyms.length > 0 && (
                      <View style={styles.synonymsRow}>
                        {item.synonyms.map((s, idx) => (
                          <View key={idx} style={styles.synonymChip}>
                            <Text style={styles.synonymChipText}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <BookOpen size={36} color="#4F46E5" />
              </View>
              <Text style={styles.emptyTitle}>Henüz Özel Kelime Eklenmedi</Text>
              <Text style={styles.emptySubtitle}>
                İngilizce makaleler okurken veya günlük hayatta bilmediğin kelimeleri tek tıkla buraya ekleyebilirsin. AI otomatik olarak anlamını ve YDS örnek cümlesini hazırlar.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setIsModalOpen(true)}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.emptyAddBtnText}>İlk Kelimeni Ekle</Text>
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
    backgroundColor: '#7C3AED',
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
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
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    lineHeight: 17,
  },
  heroAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroAddBtnText: {
    color: '#4F46E5',
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  modeToggle: {
    flexDirection: 'row',
    marginLeft: 'auto',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7EAF3',
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: '#0F172A',
  },
  modeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  flashcardArea: {
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  cardsList: {
    gap: 12,
    paddingBottom: 20,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    shadowColor: '#0F172A',
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
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  levelBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
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
  statusLearning: {
    backgroundColor: '#FEF3C7',
  },
  statusLearningText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  statusLearned: {
    backgroundColor: '#ECFDF5',
  },
  statusLearnedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  statusBtnText: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 4,
  },
  meaningBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  meaningText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  exampleBox: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    paddingLeft: 10,
    paddingVertical: 2,
    marginBottom: 10,
  },
  exampleEn: {
    fontSize: 12.5,
    color: '#1E293B',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  exampleTr: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  synonymChip: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  synonymChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E7EAF3',
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  finishedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  finishedTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  restartBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
