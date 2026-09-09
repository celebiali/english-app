import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  X,
  Volume2,
  Check,
  Plus,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ArrowLeft,
  Folder,
  BookOpen,
  Sparkles,
  Trash2,
  Pencil,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useThemeStore } from '../store/useThemeStore';
import { useLearningStore } from '../store/useLearningStore';
import { WordWithProgress, dbService } from '../database/DatabaseService';
import {
  DictionaryApiService,
  RichDictionaryResult,
} from '../services/DictionaryApiService';
import { CardComponent } from './CardComponent';
import { LearnMatchWordCard } from './LearnMatchWordCard';
import { SearchInputBar } from './SearchInputBar';
import { CustomWordModal } from './CustomWordModal';
import { AddFolderModal } from './AddFolderModal';

export interface WordVaultScreenProps {
  onPracticeActiveChange?: (isActive: boolean) => void;
}

export const WordVaultScreen: React.FC<WordVaultScreenProps> = ({ onPracticeActiveChange }) => {
  const { colors } = useThemeStore();
  const {
    dictionaryWords,
    sessionWords,
    currentVocabIndex,
    loadVocabSession,
    loadVocabFolders,
    answerCurrentVocabCard,
    resetVocabSession,
    startSessionWithWords,
    deleteWord,
    vocabFolders,
  } = useLearningStore();

  // Single Folder state: null = Folder View, 'custom_default' = Inside Folder
  const [isInsideFolder, setIsInsideFolder] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);

  // Active folder name and object
  const currentFolder = useMemo(() => {
    return vocabFolders?.find((f) => f.id === 'custom_default') || vocabFolders?.[0] || null;
  }, [vocabFolders]);
  const currentFolderName = currentFolder?.name || 'Kelimelerim';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('ALL');

  // Custom Word Modal state
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);

  // Live dictionary state for global search
  const [apiResult, setApiResult] = useState<RichDictionaryResult | null>(null);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Selected word detail modal
  const [selectedWord, setSelectedWord] = useState<WordWithProgress | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<RichDictionaryResult | null>(null);

  // Study slider phase (Önce kelimeleri telaffuz, cümle ve Türkçe anlamıyla inceleme)
  const [isStudySliderActive, setIsStudySliderActive] = useState(false);
  const [studyCardIndex, setStudyCardIndex] = useState(0);

  // Practice session state (Test / alıştırma aşaması)
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastFadeAnim = useRef(new Animated.Value(0)).current;

  // Notify App.tsx to hide header & tab bar during study slider or practice mode
  useEffect(() => {
    onPracticeActiveChange?.(isPracticeActive || isStudySliderActive);
    return () => {
      onPracticeActiveChange?.(false);
    };
  }, [isPracticeActive, isStudySliderActive, onPracticeActiveChange]);

  useEffect(() => {
    loadVocabSession();
    loadVocabFolders();
  }, []);

  // Fast live dictionary API search when user searches at root
  useEffect(() => {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setApiResult(null);
      setIsSearchingApi(false);
      return;
    }

    // Check if word already exists locally in user's dictionaryWords
    const existsLocally = (dictionaryWords || []).some(
      (w) => w.word.toLowerCase() === clean
    );

    if (existsLocally) {
      setApiResult(null);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timer = setTimeout(async () => {
      try {
        if (/^[a-zA-Z\s'-]+$/.test(clean)) {
          const res = await DictionaryApiService.lookupWord(clean);
          setApiResult(res);
        }
      } catch {
        setApiResult(null);
      } finally {
        setIsSearchingApi(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, dictionaryWords]);

  // Load deep detail for selected word modal
  useEffect(() => {
    if (!selectedWord) {
      setSelectedWordDetail(null);
      return;
    }

    let isMounted = true;
    DictionaryApiService.lookupWord(selectedWord.word).then((detail) => {
      if (isMounted && detail) setSelectedWordDetail(detail);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedWord]);

  // Audio pronunciation with expo-speech
  const handleSpeak = (text: string) => {
    if (!text) return;
    try {
      setIsSpeaking(true);
      Speech.stop();
      Speech.speak(text, {
        language: 'en-US',
        rate: 0.88,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2400),
      Animated.timing(toastFadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  // Direct add word from search to custom words list (Sadece temiz Türkçe karşılığı)
  const handleAddWordDirectly = async (wordToAdd: RichDictionaryResult | WordWithProgress) => {
    try {
      if ('isFromApi' in wordToAdd) {
        const item = DictionaryApiService.convertToWordItem(wordToAdd);
        item.meaning = (wordToAdd.primaryTurkish || wordToAdd.allTurkishMeanings[0] || '').trim();
        await dbService.insertCustomWord(item);
      } else {
        await dbService.insertCustomWord(wordToAdd);
      }
      await loadVocabSession(true);
      setSelectedWord(null);
      setSearchQuery('');
      setApiResult(null);
      showToast(`"${wordToAdd.word}" eklendi! ✅`);
    } catch (err) {
      console.warn('Error adding word:', err);
    }
  };

  // Delete word with confirmation
  const handleDeleteWord = (word: WordWithProgress) => {
    Alert.alert(
      'Kelimeyi Kaldır',
      `"${word.word}" kelimesini listenizden kaldırmak istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWord(word.id);
              setSelectedWord(null);
              showToast(`"${word.word}" listenizden kaldırıldı. 🗑️`);
            } catch (err) {
              console.warn('Kelime silinirken hata:', err);
            }
          },
        },
      ]
    );
  };

  // Calculate Leitner Box Progress:
  // Günlük: %0
  // Haftalık: %33
  // Aylık: %66
  // Bittiğinde: %100 Yeşil + Tik ✅
  const getBoxProgressInfo = (word: WordWithProgress) => {
    const box = word.box || 0;
    const isMastered = box >= 3 && ((word.correctCount || 0) >= 2 || word.status === 'MASTERED');

    if (isMastered) {
      return { percentage: 100, color: '#10B981', isCompleted: true };
    }
    if (box === 3) {
      return { percentage: 66, color: '#10B981', isCompleted: false };
    }
    if (box === 2) {
      return { percentage: 33, color: '#3B82F6', isCompleted: false };
    }
    // Box 0 or 1 (Günlük / Yeni)
    return { percentage: 0, color: colors.border, isCompleted: false };
  };

  // User's words in this single folder
  const customWordsList = useMemo(() => {
    return dictionaryWords || [];
  }, [dictionaryWords]);

  // Filtered words inside the single folder
  const filteredFolderWords = useMemo(() => {
    let list = customWordsList;

    if (filterMode === 'DAILY') {
      list = list.filter((w) => !w.box || w.box === 1);
    } else if (filterMode === 'WEEKLY') {
      list = list.filter((w) => w.box === 2);
    } else if (filterMode === 'MONTHLY') {
      list = list.filter((w) => (w.box || 0) >= 3);
    }

    const clean = folderSearchQuery.trim().toLowerCase();
    if (clean) {
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(clean) ||
          w.meaning.toLowerCase().includes(clean)
      );
    }

    return list;
  }, [customWordsList, filterMode, folderSearchQuery]);

  // Global search results across custom words
  const globalSearchResults = useMemo(() => {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return [];
    return (dictionaryWords || []).filter(
      (w) =>
        w.word.toLowerCase().includes(clean) ||
        w.meaning.toLowerCase().includes(clean)
    );
  }, [dictionaryWords, searchQuery]);

  // Statistics across Leitner boxes
  const totalCount = customWordsList.length;
  const dailyCount = customWordsList.filter((w) => !w.box || w.box === 1).length;
  const weeklyCount = customWordsList.filter((w) => w.box === 2).length;
  const monthlyCount = customWordsList.filter((w) => (w.box || 0) >= 3).length;
  const progressPct = totalCount > 0 ? Math.round((monthlyCount / totalCount) * 100) : 0;

  // Handle start practice: kelimeleri önce telaffuzu, örnek cümlesi ve Türkçesiyle slider ile göster
  const handleStartPractice = () => {
    const wordsToPractice = filteredFolderWords.length > 0 ? filteredFolderWords : customWordsList;
    if (wordsToPractice.length === 0) {
      showToast('Çalışılacak kelime bulunamadı. Lütfen kelime ekleyin.');
      return;
    }
    startSessionWithWords(wordsToPractice);
    setStudyCardIndex(0);
    setIsStudySliderActive(true);
    setIsPracticeActive(false);
  };

  // =========================================================================
  // VIEW 0: STUDY SLIDER PHASE (Kelimeleri Tanıma / Çalışma Aşaması)
  // =========================================================================
  if (isStudySliderActive && sessionWords && sessionWords.length > 0) {
    const currentStudyWord = sessionWords[studyCardIndex] || sessionWords[0];
    const isLastCard = studyCardIndex >= sessionWords.length - 1;

    return (
      <LearnMatchWordCard
        word={currentStudyWord}
        currentIndex={studyCardIndex}
        totalCards={sessionWords.length}
        nextButtonText={isLastCard ? 'Alıştırmaya Başla 🚀' : 'Sonraki'}
        onNext={() => {
          if (!isLastCard) {
            setStudyCardIndex((prev) => prev + 1);
          } else {
            // Slider bitti, şimdi ezber testine / alıştırmaya başla
            setIsStudySliderActive(false);
            setIsPracticeActive(true);
          }
        }}
        onPrev={
          studyCardIndex > 0
            ? () => {
                setStudyCardIndex((prev) => Math.max(0, prev - 1));
              }
            : undefined
        }
        onClose={() => {
          setIsStudySliderActive(false);
        }}
      />
    );
  }

  // =========================================================================
  // PRACTICE CARD MODE (Alıştırmaya Başla)
  // =========================================================================
  if (isPracticeActive) {
    const currentCard = sessionWords?.[currentVocabIndex] || null;
    const isFinished = currentVocabIndex >= (sessionWords?.length || 0);
    const totalCount = sessionWords?.length || 0;
    const progressPercent = totalCount > 0 ? Math.min(100, Math.round(((currentVocabIndex + 1) / totalCount) * 100)) : 0;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.practiceTopBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setIsPracticeActive(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.practiceTitleCenter}>
            <Text style={[styles.practiceTitle, { color: colors.text }]}>
              Kelime Alıştırması
            </Text>
            {totalCount > 0 && !isFinished && (
              <Text style={[styles.practiceCounterText, { color: colors.textSecondary }]}>
                {currentVocabIndex + 1} / {totalCount}
              </Text>
            )}
          </View>
          <View style={{ width: 32 }} />
        </View>

        {totalCount > 0 && !isFinished && (
          <View style={[styles.practiceProgressBarTrack, { backgroundColor: colors.subtleBackground }]}>
            <View
              style={[
                styles.practiceProgressBarFill,
                { width: `${progressPercent}%`, backgroundColor: colors.brand },
              ]}
            />
          </View>
        )}

        {!isFinished && currentCard ? (
          <ScrollView
            contentContainerStyle={styles.practiceScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CardComponent
              cardWord={currentCard}
              onAnswer={async (isCorrect) => {
                await answerCurrentVocabCard(isCorrect);
              }}
              cardIndex={currentVocabIndex}
              totalCards={sessionWords.length || 0}
            />
          </ScrollView>
        ) : (
          <View style={styles.sessionFinishedCenter}>
            <CheckCircle2 size={54} color="#10B981" />
            <Text style={[styles.finishedTitleText, { color: colors.text }]}>
              Harika! Alıştırma Tamamlandı 🎉
            </Text>
            <Text style={[styles.finishedSubText, { color: colors.textSecondary }]}>
              Kelimeler aralıklı tekrar kutularına başarıyla aktarıldı.
            </Text>
            <TouchableOpacity
              style={[styles.finishBtn, { backgroundColor: colors.brand }]}
              onPress={() => {
                resetVocabSession();
                setIsPracticeActive(false);
              }}
            >
              <Text style={styles.finishBtnText}>Listeye Geri Dön</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: INSIDE THE SINGLE FOLDER (DIRECT WORDS LIST - NO SUB-UNITS)
  // =========================================================================
  if (isInsideFolder) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Header with Back Button, Title, and Add Word Button */}
        <View style={[styles.folderHeaderBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.folderBackBtn}
            onPress={() => {
              setIsInsideFolder(false);
              setFolderSearchQuery('');
              setFilterMode('ALL');
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={colors.brand} />
            <Text style={[styles.folderBackBtnText, { color: colors.brand }]}>Klasörler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.folderTitleWrap}
            onPress={() => setIsEditFolderModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.folderTitleWithEdit}>
              <Text style={[styles.folderTitleText, { color: colors.text }]} numberOfLines={1}>
                {currentFolderName}
              </Text>
              <View style={[styles.editPencilBadge, { backgroundColor: colors.brandLight }]}>
                <Pencil size={12} color={colors.brand} />
              </View>
            </View>
            <Text style={[styles.folderSubtitleText, { color: colors.textSecondary }]}>
              {totalCount} kelime • {monthlyCount} tamamlandı
            </Text>
          </TouchableOpacity>

          {filteredFolderWords.length > 0 && (
            <TouchableOpacity
              style={[styles.headerPracticeBtn, { backgroundColor: colors.brandLight, borderColor: colors.brand }]}
              onPress={handleStartPractice}
              activeOpacity={0.75}
            >
              <Text style={[styles.headerPracticeBtnText, { color: colors.brand }]}>Çalış</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* High Performance Unlagged Search Bar inside Folder */}
        <View style={[styles.searchRowWrap, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <SearchInputBar
            placeholder="Kelimelerim içinde ara..."
            onSearch={setFolderSearchQuery}
            debounceMs={120}
          />

          {/* Leitner Box Filter Pills */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                filterMode === 'ALL' && [styles.filterPillActive, { backgroundColor: colors.brandLight, borderColor: colors.brand }],
              ]}
              onPress={() => setFilterMode('ALL')}
            >
              <Text style={[styles.filterPillText, { color: filterMode === 'ALL' ? colors.brand : colors.textSecondary }]}>
                Tümü ({totalCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                filterMode === 'DAILY' && [styles.filterPillActive, { backgroundColor: colors.brandLight, borderColor: colors.brand }],
              ]}
              onPress={() => setFilterMode('DAILY')}
            >
              <Text style={[styles.filterPillText, { color: filterMode === 'DAILY' ? colors.brand : colors.textSecondary }]}>
                Günlük ({dailyCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                filterMode === 'WEEKLY' && [styles.filterPillActive, { backgroundColor: '#3B82F618', borderColor: '#3B82F6' }],
              ]}
              onPress={() => setFilterMode('WEEKLY')}
            >
              <Text style={[styles.filterPillText, { color: filterMode === 'WEEKLY' ? '#3B82F6' : colors.textSecondary }]}>
                Haftalık ({weeklyCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                filterMode === 'MONTHLY' && [styles.filterPillActive, { backgroundColor: '#10B98118', borderColor: '#10B981' }],
              ]}
              onPress={() => setFilterMode('MONTHLY')}
            >
              <Text style={[styles.filterPillText, { color: filterMode === 'MONTHLY' ? '#10B981' : colors.textSecondary }]}>
                Aylık ({monthlyCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Direct FlatList of Words in Single Folder (Görsel 2 Tasarımı) */}
        <FlatList
          data={filteredFolderWords}
          keyExtractor={(item) => String(item.id || item.word)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const progress = getBoxProgressInfo(item);

            return (
              <TouchableOpacity
                style={[
                  styles.wordRowItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedWord(item)}
                activeOpacity={0.7}
              >
                {/* Sol Taraf: Kelime ve Türkçe Anlamı */}
                <View style={styles.wordInfoLeft}>
                  <View style={styles.wordTitleRow}>
                    <Text style={[styles.wordTitle, { color: colors.text }]}>
                      {item.word}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleSpeak(item.word)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.speakerBtn}
                    >
                      <Volume2 size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[styles.wordMeaning, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.meaning}
                  </Text>
                </View>

                {/* Sağ Taraf: Leitner İlerleme Çubuğu (%0, %33, %66, %100 + Tik) ve Silme */}
                <View style={styles.progressAndActionRight}>
                  <View style={styles.progressContainerRight}>
                    {progress.isCompleted ? (
                      <View style={styles.completedRow}>
                        <View style={[styles.trackBar, { backgroundColor: colors.subtleBackground }]}>
                          <View style={[styles.fillBar, { width: '100%', backgroundColor: '#10B981' }]} />
                        </View>
                        <View style={styles.checkCircle}>
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.trackBar, { backgroundColor: colors.subtleBackground }]}>
                        <View
                          style={[
                            styles.fillBar,
                            {
                              width: `${progress.percentage}%`,
                              backgroundColor: progress.color,
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteWord(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    style={styles.trashActionBtn}
                  >
                    <Trash2 size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {folderSearchQuery ? 'Kelime Bulunamadı' : 'Listeniz Boş'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {folderSearchQuery
                  ? `"${folderSearchQuery}" aramasına uygun kelime bulunamadı.`
                  : 'Henüz kelime eklenmemiş. Arama çubuğuna kelime yazıp Canlı Sözlük üzerinden "+ Ekle" butonuna basarak listenize kelime ekleyebilirsiniz.'}
              </Text>
            </View>
          }
        />

        {/* Word Detail Modal */}
        {renderWordDetailModal()}

        {/* Custom Word Modal */}
        <CustomWordModal
          visible={isAddWordModalOpen}
          onClose={() => setIsAddWordModalOpen(false)}
        />

        {/* Edit Folder Modal */}
        <AddFolderModal
          visible={isEditFolderModalOpen}
          onClose={() => setIsEditFolderModalOpen(false)}
          folderToEdit={currentFolder}
        />
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: ROOT VIEW (TEK KLASÖR VE GENEL ARAMA)
  // =========================================================================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Search Header */}
      <View style={[styles.searchRowWrap, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <SearchInputBar
          placeholder="Sözlükte ara veya ekle..."
          onSearch={setSearchQuery}
          debounceMs={120}
        />
      </View>

      {/* If User Is Searching: Show Search Results / Live Dictionary Result */}
      {searchQuery.trim().length > 0 ? (
        <FlatList
          data={globalSearchResults}
          keyExtractor={(item) => String(item.id || item.word)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            // Canlı Sözlük Kartı (Kullanıcının kelimelerinde tam eşleşme yoksa)
            apiResult ? (
              <TouchableOpacity
                style={[
                  styles.apiResultCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.brand,
                  },
                ]}
                onPress={() => handleAddWordDirectly(apiResult)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.apiHeaderRow}>
                    <Text style={[styles.wordTitle, { color: colors.brand }]}>
                      {apiResult.word}
                    </Text>
                    <View style={[styles.apiBadge, { backgroundColor: colors.brandLight }]}>
                      <Globe size={11} color={colors.brand} />
                      <Text style={[styles.apiBadgeText, { color: colors.brand }]}>Canlı Sözlük</Text>
                    </View>
                  </View>
                  <Text style={[styles.wordMeaning, { color: colors.textSecondary }]} numberOfLines={1}>
                    {apiResult.primaryTurkish}
                  </Text>
                </View>

                <View style={[styles.addDirectBtn, { backgroundColor: colors.brand }]}>
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.8} />
                  <Text style={styles.addDirectBtnText}>Ekle</Text>
                </View>
              </TouchableOpacity>
            ) : isSearchingApi ? (
              <View style={styles.apiLoadingWrap}>
                <ActivityIndicator size="small" color={colors.brand} />
                <Text style={[styles.apiLoadingText, { color: colors.textSecondary }]}>
                  Sözlük taranıyor...
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const progress = getBoxProgressInfo(item);
            return (
              <TouchableOpacity
                style={[
                  styles.wordRowItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedWord(item)}
                activeOpacity={0.7}
              >
                <View style={styles.wordInfoLeft}>
                  <View style={styles.wordTitleRow}>
                    <Text style={[styles.wordTitle, { color: colors.text }]}>{item.word}</Text>
                    <TouchableOpacity
                      onPress={() => handleSpeak(item.word)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.speakerBtn}
                    >
                      <Volume2 size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.wordMeaning, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.meaning}
                  </Text>
                </View>

                <View style={styles.progressAndActionRight}>
                  <View style={styles.progressContainerRight}>
                    {progress.isCompleted ? (
                      <View style={styles.completedRow}>
                        <View style={[styles.trackBar, { backgroundColor: colors.subtleBackground }]}>
                          <View style={[styles.fillBar, { width: '100%', backgroundColor: '#10B981' }]} />
                        </View>
                        <View style={styles.checkCircle}>
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.trackBar, { backgroundColor: colors.subtleBackground }]}>
                        <View
                          style={[
                            styles.fillBar,
                            {
                              width: `${progress.percentage}%`,
                              backgroundColor: progress.color,
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteWord(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    style={styles.trashActionBtn}
                  >
                    <Trash2 size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            !isSearchingApi && !apiResult ? (
              <View style={styles.emptyCenter}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Kelime Bulunamadı</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  "{searchQuery}" için kelime bulunamadı.
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        // TEK KLASÖR GÖRÜNÜMÜ (Başlangıç / İleri Seviye olmadan tek klasör)
        <ScrollView
          style={styles.folderScrollView}
          contentContainerStyle={styles.folderScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Overview Card: Toplam, Günlük, Haftalık, Aylık */}
          <View style={[styles.statsOverviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: colors.text }]}>{totalCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Toplam</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: colors.brand }]}>{dailyCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Günlük</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: '#3B82F6' }]}>{weeklyCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Haftalık</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: '#10B981' }]}>{monthlyCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Aylık</Text>
            </View>
          </View>

          {/* TEK KLASÖR KARTI */}
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              KELİME KLASÖRÜ
            </Text>

            <TouchableOpacity
              style={[styles.singleFolderCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => {
                setIsInsideFolder(true);
                setFolderSearchQuery('');
                setFilterMode('ALL');
              }}
              activeOpacity={0.75}
            >
              {/* Folder Icon */}
              <View style={[styles.folderIconBadge, { backgroundColor: colors.brandLight }]}>
                <Folder size={24} color={colors.brand} />
              </View>

              {/* Folder Info */}
              <View style={styles.folderInfo}>
                <View style={styles.folderTitleLine}>
                  <Text style={[styles.folderItemTitle, { color: colors.text }]}>
                    {currentFolderName}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setIsEditFolderModalOpen(true);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={[styles.editPencilBadge, { backgroundColor: colors.brandLight }]}
                  >
                    <Pencil size={12} color={colors.brand} />
                  </TouchableOpacity>
                  <View style={[styles.badgePill, { backgroundColor: colors.brandLight }]}>
                    <Text style={[styles.badgePillText, { color: colors.brand }]}>
                      {totalCount} KELİME
                    </Text>
                  </View>
                </View>

                <Text style={[styles.folderItemSubtitle, { color: colors.textSecondary }]}>
                  Özel Eklenen Kelimeler Listesi
                </Text>

                {/* Progress bar inside folder row */}
                <View style={styles.folderProgressRow}>
                  <View style={[styles.folderProgressBar, { backgroundColor: colors.subtleBackground }]}>
                    <View
                      style={[
                        styles.folderProgressFill,
                        { width: `${progressPct}%`, backgroundColor: progressPct === 100 ? '#10B981' : colors.brand },
                      ]}
                    />
                  </View>
                  <Text style={[styles.folderProgressText, { color: colors.textSecondary }]}>
                    {monthlyCount}/{totalCount} (%{progressPct})
                  </Text>
                </View>
              </View>

              {/* Right Arrow */}
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Word Detail Modal */}
      {renderWordDetailModal()}

      {/* Custom Word Modal */}
      <CustomWordModal
        visible={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
      />

      {/* Edit Folder Modal */}
      <AddFolderModal
        visible={isEditFolderModalOpen}
        onClose={() => setIsEditFolderModalOpen(false)}
        folderToEdit={currentFolder}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastFadeAnim }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );

  // Helper function to render detail modal
  function renderWordDetailModal() {
    if (!selectedWord) return null;

    return (
      <Modal
        visible={!!selectedWord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalWordTitle, { color: colors.text }]}>
                  {selectedWord.word}
                </Text>
                <Text style={[styles.modalWordMeaning, { color: colors.brand }]}>
                  {selectedWordDetail?.primaryTurkish || selectedWord.meaning}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalAudioBtn, { backgroundColor: colors.subtleBackground }]}
                onPress={() => handleSpeak(selectedWord.word)}
                activeOpacity={0.7}
              >
                <Volume2 size={22} color={colors.brand} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.subtleBackground }]}
                onPress={() => setSelectedWord(null)}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Leitner Durumu */}
            <View style={[styles.modalBoxStatus, { backgroundColor: colors.subtleBackground }]}>
              <Text style={[styles.modalBoxStatusTitle, { color: colors.textSecondary }]}>
                Hafıza Kutusu:
              </Text>
              <Text style={[styles.modalBoxStatusValue, { color: colors.text }]}>
                {selectedWord.box === 0
                  ? 'Yeni Kelime (%0)'
                  : selectedWord.box === 1
                  ? 'Günlük Tekrar Havuzu (%0)'
                  : selectedWord.box === 2
                  ? 'Haftalık Tekrar Havuzu (%33)'
                  : 'Aylık Kalıcı Hafıza (%66)'}
              </Text>
            </View>

            {/* Örnek Cümle */}
            {(selectedWordDetail?.exampleEn || selectedWord.example_sentence) && (
              <View style={styles.modalExampleSection}>
                <Text style={[styles.modalExampleTitle, { color: colors.textSecondary }]}>
                  Örnek Cümle:
                </Text>
                <Text style={[styles.modalExampleEn, { color: colors.text }]}>
                  {selectedWordDetail?.exampleEn || selectedWord.example_sentence}
                </Text>
                {(selectedWordDetail?.exampleTr || selectedWord.example_translation) && (
                  <Text style={[styles.modalExampleTr, { color: colors.textSecondary }]}>
                    {selectedWordDetail?.exampleTr || selectedWord.example_translation}
                  </Text>
                )}
              </View>
            )}

            {/* Modal Alt Butonlar: Kaldır & Tamam */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.modalDeleteBtn,
                  {
                    borderColor: colors.isDark ? '#5C222E' : '#FEE2E2',
                    backgroundColor: colors.isDark ? '#3B1E2B' : '#FEF2F2',
                  },
                ]}
                onPress={() => handleDeleteWord(selectedWord)}
                activeOpacity={0.75}
              >
                <Trash2 size={16} color="#EF4444" />
                <Text style={styles.modalDeleteBtnText}>Listeden Kaldır</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalDoneBtn, { backgroundColor: colors.brand }]}
                onPress={() => setSelectedWord(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalDoneBtnText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Search row wrap
  searchRowWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  topBarFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topAddWordBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Filter pills
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {},
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Folder header bar
  folderHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  folderBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 8,
  },
  folderBackBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  folderTitleWrap: {
    flex: 1,
  },
  folderTitleWithEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editPencilBadge: {
    padding: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  folderSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  // Root ScrollView & Stats
  folderScrollView: {
    flex: 1,
  },
  folderScrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 18,
  },
  statsOverviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsCol: {
    alignItems: 'center',
  },
  statsNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: 28,
  },
  // Section groups
  sectionGroup: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  // Single Folder Card
  singleFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  folderIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderInfo: {
    flex: 1,
    gap: 3,
  },
  folderTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  folderItemTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  folderItemSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  folderProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  folderProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  folderProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  folderProgressText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Quick Add Word Action Card
  addNewWordActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 14,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWordActionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  addWordActionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  // Empty State Button
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerPracticeBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  // Words List
  listContent: {
    paddingBottom: 32,
  },
  wordRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  wordInfoLeft: {
    flex: 1,
    paddingRight: 16,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  wordTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  speakerBtn: {
    padding: 2,
  },
  wordMeaning: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressContainerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackBar: {
    width: 38,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
  checkCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sticky Bottom Bar
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  optionsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPracticeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startPracticeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  // Live Dictionary Result Card
  apiResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  apiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  apiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addDirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  apiLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  apiLoadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty State
  emptyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Practice Screen
  practiceTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  practiceTitleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  practiceCounterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  practiceProgressBarTrack: {
    width: '100%',
    height: 3,
  },
  practiceProgressBarFill: {
    height: '100%',
  },
  practiceScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  sessionFinishedCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  finishedTitleText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  finishedSubText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  finishBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Modal Backdrop & Card
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  modalWordTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalWordMeaning: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  modalAudioBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBoxStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  modalBoxStatusTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBoxStatusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalExampleSection: {
    marginBottom: 16,
    gap: 4,
  },
  modalExampleTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalExampleEn: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalExampleTr: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  modalDeleteBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalDeleteBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  modalDoneBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  progressAndActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trashActionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  // Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 24,
    right: 24,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
