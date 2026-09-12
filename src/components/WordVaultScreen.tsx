import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  PanResponder,
  Keyboard,
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

// =========================================================================
// SWIPEABLE WORD ROW COMPONENT (Sola kaydırarak silme)
// =========================================================================
interface SwipeableWordRowProps {
  item: WordWithProgress;
  colors: any;
  progress: {
    percentage: number;
    color: string;
    isCompleted: boolean;
    statusText?: string;
    isDue?: boolean;
  };
  canDelete?: boolean;
  onPress: () => void;
  onSpeak: () => void;
  onDelete?: () => void;
}

const SwipeableWordRow: React.FC<SwipeableWordRowProps> = ({
  item,
  colors,
  progress,
  canDelete = true,
  onPress,
  onSpeak,
  onDelete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isActionTriggeredRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (!canDelete || !onDelete) return false;
        // Only capture horizontal swipes leftward
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 12;
      },
      onPanResponderGrant: () => {
        isActionTriggeredRef.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!canDelete || !onDelete) return;
        // Sadece sola kaydırmaya izin ver (dx < 0), max -100px
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(-100, gestureState.dx));
        } else {
          translateX.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!canDelete || !onDelete) return;
        if (gestureState.dx < -55 && !isActionTriggeredRef.current) {
          isActionTriggeredRef.current = true;
          // Reveal the red delete background, then trigger confirmation alert
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            bounciness: 4,
          }).start(() => {
            onDelete();
            // Reset position smoothly
            Animated.timing(translateX, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        } else {
          // Snap back to zero
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.swipeRowWrapper}>
      {/* Kırmızı Arka Plan (Sil Butonu - Sadece silinebilir kelimelerde göster) */}
      {canDelete && onDelete && (
        <TouchableOpacity
          style={styles.swipeDeleteBackground}
          onPress={onDelete}
          activeOpacity={0.85}
        >
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.swipeDeleteText}>Sil</Text>
        </TouchableOpacity>
      )}

      {/* Ön Kart (Kelime Bilgisi) */}
      <Animated.View
        style={[
          styles.swipeFrontCard,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
            transform: canDelete && onDelete ? [{ translateX }] : undefined,
          },
        ]}
        {...(canDelete && onDelete ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={styles.swipeCardInnerTouchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Sol Taraf: Kelime ve Türkçe Anlamı */}
          <View style={styles.wordInfoLeft}>
            <View style={styles.wordTitleRow}>
              <Text style={[styles.wordTitle, { color: colors.text }]}>
                {item.word}
              </Text>
              <TouchableOpacity
                onPress={onSpeak}
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

          {/* Sağ Taraf: Leitner İlerleme Çubuğu (%0, %33, %66, %100 + Tik) */}
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
              <View style={styles.progressColRight}>
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
                {progress.statusText ? (
                  <Text
                    style={[
                      styles.progressStatusText,
                      { color: progress.isDue ? colors.brand : colors.textSecondary },
                    ]}
                  >
                    {progress.statusText}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
    loadDailyTasks,
    answerCurrentVocabCard,
    resetVocabSession,
    startSessionWithWords,
    deleteWord,
    vocabFolders,
  } = useLearningStore();

  // Single Folder state: null = Folder View, 'custom_default' = Inside Folder
  const [isInsideFolder, setIsInsideFolder] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('custom_default');

  // All custom user folders
  const userFolders = useMemo(() => {
    if (!vocabFolders || vocabFolders.length === 0) return [];
    return vocabFolders.filter((f) => !f.is_system);
  }, [vocabFolders]);

  // Active folder name and object
  const currentFolder = useMemo(() => {
    return (
      userFolders.find((f) => f.id === selectedFolderId) ||
      userFolders.find((f) => f.id === 'custom_default') ||
      userFolders[0] ||
      null
    );
  }, [userFolders, selectedFolderId]);
  const currentFolderName = currentFolder?.name || 'Özel Kelime Defterim';

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

  // Dictionary API search when user stops typing or submits search
  useEffect(() => {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setApiResult(null);
      setIsSearchingApi(false);
      return;
    }

    // Input validation: word must only contain English letters, hyphens, and spaces
    if (!/^[a-zA-Z\s'-]+$/.test(clean)) {
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

    let isMounted = true;
    setIsSearchingApi(true);

    DictionaryApiService.lookupWord(clean)
      .then((res) => {
        if (isMounted) {
          setApiResult(res);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiResult(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSearchingApi(false);
        }
      });

    return () => {
      isMounted = false;
      setIsSearchingApi(false);
    };
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
      const targetFolderName =
        currentFolder && currentFolder.id !== 'custom_default'
          ? currentFolder.name
          : 'Özel Kelimeler';

      const wordTextToAdd = ('isFromApi' in wordToAdd ? wordToAdd.word : wordToAdd.word).trim();

      // Check if word already exists in this folder
      const isAlreadyInFolder = (dictionaryWords || []).some((w) => {
        const matchesWord = w.word.trim().toLowerCase() === wordTextToAdd.toLowerCase();
        if (!matchesWord) return false;
        if (targetFolderName === 'Özel Kelimeler') {
          return (
            !w.subcategory ||
            w.subcategory === 'Özel Kelimeler' ||
            w.subcategory === 'Özel Kelime Defterim' ||
            w.subcategory === 'Kelimelerim'
          );
        }
        return (w.subcategory || '').trim().toLowerCase() === targetFolderName.toLowerCase();
      });

      if (isAlreadyInFolder) {
        showToast(`"${wordTextToAdd}" zaten "${targetFolderName}" klasörünüzde kayıtlı.`);
        return;
      }

      // Anında arayüzü temizle ve klavyeyi kapat (Sıfır gecikme)
      setSelectedWord(null);
      setSearchQuery('');
      setApiResult(null);
      setIsSearchingApi(false);
      Keyboard.dismiss();

      if ('isFromApi' in wordToAdd) {
        const item = DictionaryApiService.convertToWordItem(wordToAdd);
        item.meaning = (wordToAdd.primaryTurkish || wordToAdd.allTurkishMeanings[0] || '').trim();
        item.subcategory = targetFolderName;
        item.folder_name = targetFolderName;
        await dbService.insertCustomWord(item);
      } else {
        const wordCopy = { ...wordToAdd };
        wordCopy.subcategory = targetFolderName;
        wordCopy.folder_name = targetFolderName;
        await dbService.insertCustomWord(wordCopy);
      }

      await loadVocabSession(true);
      await loadDailyTasks();
      showToast(`"${wordTextToAdd}" listenize eklendi! ⭐`);
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
              await loadVocabFolders();
              setSelectedWord(null);
            } catch (err) {
              console.warn('Kelime silinirken hata:', err);
            }
          },
        },
      ]
    );
  };

  // Open create folder modal with empty folder validation
  // "üst üste klasör açamasın mesela içinde kelime olmayan 1 tane klasör varsa yenisini ekleyemesin"
  const handleOpenCreateFolder = () => {
    const emptyFolder = (userFolders || []).find((f) => {
      if (f.id === 'custom_default' && userFolders.length === 1) {
        return totalCount === 0;
      }
      return (f.word_count || 0) === 0;
    });

    if (emptyFolder) {
      Alert.alert(
        'Yeni Klasör Eklenemez',
        `"${emptyFolder.name}" klasörünüzde henüz hiç kelime bulunmuyor.\n\nİçinde kelime olmayan bir klasör varken yeni klasör oluşturamazsınız. Lütfen önce mevcut klasörünüze en az 1 kelime ekleyin.`,
        [{ text: 'Tamam', style: 'default' }]
      );
      return;
    }

    setIsCreateFolderModalOpen(true);
  };

  // Calculate Leitner Box Progress:
  // Günlük: %0
  // Haftalık: %33
  // Aylık: %66
  // Bittiğinde: %100 Yeşil + Tik ✅
  const parseSqliteDate = (dateStr?: string | null): number | null => {
    if (!dateStr) return null;
    const direct = new Date(dateStr).getTime();
    if (!isNaN(direct)) return direct;
    const normalized = dateStr.replace(' ', 'T') + 'Z';
    const normTime = new Date(normalized).getTime();
    if (!isNaN(normTime)) return normTime;
    return null;
  };

  const getBoxProgressInfo = (word: WordWithProgress) => {
    const box = word.box || 0;
    const isMastered = box >= 3 && ((word.correctCount || 0) >= 2 || word.status === 'MASTERED');

    if (isMastered) {
      return { percentage: 100, color: '#10B981', isCompleted: true, statusText: 'Tamamlandı', isDue: false };
    }

    const reviewTimestamp = parseSqliteDate(word.nextReviewAt);
    const diffMs = reviewTimestamp ? reviewTimestamp - Date.now() : 0;
    const daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
    const isDue = reviewTimestamp !== null && diffMs <= 0;

    if (box === 3) {
      if (word.status === 'MASTERED') {
        return {
          percentage: 100,
          color: '#10B981',
          isCompleted: true,
          statusText: '🏆 Tamamlandı',
          isDue: false,
        };
      }
      return {
        percentage: 75,
        color: '#10B981',
        isCompleted: false,
        statusText: isDue ? '⚡ Tekrar' : `${daysRemaining > 0 ? daysRemaining : 7}g beklemede ⏳`,
        isDue,
      };
    }
    if (box === 2) {
      return {
        percentage: 50,
        color: '#3B82F6',
        isCompleted: false,
        statusText: isDue ? '⚡ Tekrar' : `${daysRemaining > 0 ? daysRemaining : 3}g beklemede ⏳`,
        isDue,
      };
    }
    // Box 1 (1. Gün)
    if (box === 1) {
      return {
        percentage: 25,
        color: '#F59E0B',
        isCompleted: false,
        statusText: isDue ? '⚡ Tekrar' : `${daysRemaining > 0 ? daysRemaining : 1}g beklemede ⏳`,
        isDue,
      };
    }
    // Box 0 (Henüz çalışılmamış Yeni Kelime)
    return {
      percentage: 0,
      color: colors.border,
      isCompleted: false,
      statusText: 'Yeni',
      isDue: true,
    };
  };

  // Helper to determine if a word is active/due for practice
  const isWordActiveForPractice = useCallback((word: WordWithProgress): boolean => {
    const box = word.box || 0;
    const isMastered = word.status === 'MASTERED' || (box >= 3 && (word.correctCount || 0) >= 3);

    // Mastered (%100 completed) words are finished
    if (isMastered) return false;

    // Box 0: Henüz hiç çalışılmamış yeni kelime -> Her zaman aktiftir
    if (!word.box || box === 0) {
      return true;
    }

    // Box 1, Box 2 ve Box 3: Randevu tarihi geldiyse veya geçtiyse aktiftir!
    if (word.nextReviewAt) {
      const reviewTime = parseSqliteDate(word.nextReviewAt);
      if (reviewTime !== null) {
        return reviewTime <= Date.now();
      }
    }

    return true;
  }, []);

  // Check if a word is a user-added custom word
  const isCustomWord = useCallback((w: WordWithProgress) => {
    return Boolean(
      w.is_custom ||
      (w.subcategory && !['VOCABULARY', 'CONNECTOR', 'PREFIX_ROOT', 'IDIOM'].includes(w.subcategory))
    );
  }, []);

  // All custom words added by user across any folder
  const allUserCustomWords = useMemo(() => {
    return (dictionaryWords || []).filter(isCustomWord);
  }, [dictionaryWords, isCustomWord]);

  // User's words in this active folder
  const customWordsList = useMemo(() => {
    if (!allUserCustomWords) return [];
    if (!currentFolder) return allUserCustomWords;

    const otherCustomFolderNames = (userFolders || [])
      .filter((f) => f.id !== currentFolder.id)
      .map((f) => f.name.toLowerCase());

    if (currentFolder.id === 'custom_default') {
      return allUserCustomWords.filter(
        (w) =>
          !w.subcategory ||
          w.subcategory === 'Özel Kelimeler' ||
          w.subcategory === 'Özel Kelime Defterim' ||
          w.subcategory === 'Kelimelerim' ||
          !otherCustomFolderNames.includes(w.subcategory.toLowerCase())
      );
    }

    return allUserCustomWords.filter(
      (w) =>
        (w.subcategory && w.subcategory.toLowerCase() === currentFolder.name.toLowerCase()) ||
        ((w as any).folder_name && (w as any).folder_name.toLowerCase() === currentFolder.name.toLowerCase())
    );
  }, [allUserCustomWords, currentFolder, userFolders]);

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

  // Active (due) words inside the current folder view
  const activeFilteredWords = useMemo(() => {
    return filteredFolderWords.filter(isWordActiveForPractice);
  }, [filteredFolderWords, isWordActiveForPractice]);

  const activeFilteredCount = activeFilteredWords.length;

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
  // SADECE AKTİF (vadesi gelmiş / yeni) kelimeleri çalıştırır; haftalık veya aylık beklemedeki kelimeler KESİNLİKLE gelmez!
  const handleStartPractice = () => {
    const activePool = (filteredFolderWords.length > 0 ? filteredFolderWords : customWordsList).filter(isWordActiveForPractice);

    if (activePool.length === 0) {
      if (monthlyCount === totalCount && totalCount > 0) {
        Alert.alert(
          'Tüm Kelimeler Tamamlandı 🏆',
          'Tebrikler! Bu klasördeki tüm kelimeleri başarıyla öğrendiniz ve kalıcı hafızaya aldınız.',
          [{ text: 'Tamam', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Bugünkü Çalışma Tamamlandı 🎉',
          'Bu klasördeki tüm kelimeler aralıklı tekrar kutularına (3. Gün / 7. Gün) aktarıldı.\n\nKelimelerin hafızada kalıcı hale gelmesi için bekleme süresi dolana kadar yeni bir çalışma gerekmemektedir. Tekrar randevu günü geldiğinde buton otomatik olarak tekrar aktifleşecektir.',
          [{ text: 'Tamam', style: 'default' }]
        );
      }
      return;
    }

    startSessionWithWords(activePool);
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
            </View>
            <Text style={[styles.folderSubtitleText, { color: colors.textSecondary }]}>
              {totalCount} kelime • {monthlyCount} tamamlandı
            </Text>
          </TouchableOpacity>

          {filteredFolderWords.length > 0 && (
            <TouchableOpacity
              style={[
                styles.headerPracticeBtn,
                activeFilteredCount > 0
                  ? {
                      backgroundColor: colors.brandLight,
                      borderColor: colors.brand,
                    }
                  : {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      opacity: 0.65,
                    },
              ]}
              onPress={handleStartPractice}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.headerPracticeBtnText,
                  { color: activeFilteredCount > 0 ? colors.brand : colors.textSecondary },
                ]}
              >
                {activeFilteredCount > 0
                  ? (monthlyCount === totalCount && totalCount > 0 ? `Tekrar Et (${activeFilteredCount})` : `Çalış (${activeFilteredCount})`)
                  : (monthlyCount === totalCount && totalCount > 0 ? 'Tamamlandı 🏆' : 'Beklemede ⏳')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* High Performance Unlagged Search Bar inside Folder */}
        <View style={[styles.searchRowWrap, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <SearchInputBar
            value={folderSearchQuery}
            placeholder="Kelimelerim içinde ara veya yeni ekle..."
            onSearch={setFolderSearchQuery}
            onSubmitEditing={setFolderSearchQuery}
            debounceMs={300}
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
                1. Gün ({dailyCount})
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
                3. Gün ({weeklyCount})
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
                7. Gün ({monthlyCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Direct FlatList of Words in Single Folder (Görsel 2 Tasarımı) */}
        <FlatList
          data={filteredFolderWords}
          keyExtractor={(item) => String(item.id || item.word)}
          contentContainerStyle={[
            styles.listContent,
            filteredFolderWords.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const progress = getBoxProgressInfo(item);

            return (
              <SwipeableWordRow
                item={item}
                colors={colors}
                progress={progress}
                onPress={() => setSelectedWord(item)}
                onSpeak={() => handleSpeak(item.word)}
                onDelete={() => handleDeleteWord(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.subtleBackground }]}>
                <BookOpen size={28} color={colors.textSecondary} strokeWidth={1.8} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {folderSearchQuery ? 'Kelime Bulunamadı' : 'Listeniz Boş'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {folderSearchQuery
                  ? `"${folderSearchQuery}" aramasına uygun kelime bulunamadı.`
                  : 'Arama çubuğundan kelime arayıp ekleyebilirsiniz.'}
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
          value={searchQuery}
          placeholder="Sözlükten kelime ara ve havuza ekle..."
          onSearch={setSearchQuery}
          onSubmitEditing={setSearchQuery}
          debounceMs={500}
        />
      </View>

      {/* Quick Guide Tip Banner when idle */}
      {searchQuery.trim().length === 0 && (
        <View style={[styles.searchTipBanner, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
          <Text style={[styles.searchTipText, { color: colors.textSecondary }]}>
            💡 <Text style={{ fontWeight: '700', color: colors.brand }}>Kelime Eklemek İçin:</Text> Yukarıya İngilizce kelimeyi yazın, canlı sözlükten <Text style={{ fontWeight: '700', color: colors.brand }}>"+ Ekle"</Text> butonuna dokunun.
          </Text>
        </View>
      )}

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
            const isCustom = isCustomWord(item);
            return (
              <SwipeableWordRow
                item={item}
                colors={colors}
                progress={progress}
                canDelete={isCustom}
                onPress={() => setSelectedWord(item)}
                onSpeak={() => handleSpeak(item.word)}
                onDelete={isCustom ? () => handleDeleteWord(item) : undefined}
              />
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
          {/* Stats Overview Card: Toplam, 1. Gün, 3. Gün, 7. Gün */}
          <View style={[styles.statsOverviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: colors.text }]}>{totalCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Toplam</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: colors.brand }]}>{dailyCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>1. Gün</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: '#3B82F6' }]}>{weeklyCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>3. Gün</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: '#10B981' }]}>{monthlyCount}</Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>7. Gün</Text>
            </View>
          </View>

          {/* KELİME KLASÖRLERİ */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                {userFolders.length > 1 ? 'KELİME KLASÖRLERİ' : 'KELİME KLASÖRÜ'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.addFolderHeaderBtn,
                  { backgroundColor: colors.brandLight },
                ]}
                onPress={handleOpenCreateFolder}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Plus size={16} color={colors.brand} strokeWidth={2.8} />
              </TouchableOpacity>
            </View>

            {userFolders.map((folder) => {
              const fCount = folder.word_count || 0;
              const fLearned = folder.learned_count || 0;
              const fPct = fCount > 0 ? Math.round((fLearned / fCount) * 100) : 0;

              return (
                <TouchableOpacity
                  key={folder.id}
                  style={[styles.singleFolderCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedFolderId(folder.id);
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
                      <Text style={[styles.folderItemTitle, { color: colors.text }]} numberOfLines={1}>
                        {folder.name}
                      </Text>
                      <View style={[styles.badgePill, { backgroundColor: colors.brandLight }]}>
                        <Text style={[styles.badgePillText, { color: colors.brand }]}>
                          {fCount} KELİME
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.folderItemSubtitle, { color: colors.textSecondary }]}>
                      {folder.description || 'Özel Eklenen Kelimeler Listesi'}
                    </Text>

                    {/* Progress bar inside folder row */}
                    <View style={styles.folderProgressRow}>
                      <View style={[styles.folderProgressBar, { backgroundColor: colors.subtleBackground }]}>
                        <View
                          style={[
                            styles.folderProgressFill,
                            { width: `${fPct}%`, backgroundColor: fPct === 100 ? '#10B981' : colors.brand },
                          ]}
                        />
                      </View>
                      <Text style={[styles.folderProgressText, { color: colors.textSecondary }]}>
                        {fLearned}/{fCount} (%{fPct})
                      </Text>
                    </View>
                  </View>

                  {/* Right Arrow */}
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
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

      {/* Create New Folder Modal */}
      <AddFolderModal
        visible={isCreateFolderModalOpen}
        onClose={() => {
          setIsCreateFolderModalOpen(false);
          loadVocabFolders();
        }}
        folderToEdit={null}
      />

      {/* Edit Folder Modal */}
      <AddFolderModal
        visible={isEditFolderModalOpen}
        onClose={() => {
          setIsEditFolderModalOpen(false);
          loadVocabFolders();
        }}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  addFolderHeaderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  swipeRowWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeDeleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 80,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  swipeFrontCard: {
    width: '100%',
    borderBottomWidth: 1,
  },
  swipeCardInnerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    minWidth: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  progressColRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
  progressStatusText: {
    fontSize: 10,
    fontWeight: '700',
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
    paddingVertical: 36,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
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
  searchTipBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchTipText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
});
