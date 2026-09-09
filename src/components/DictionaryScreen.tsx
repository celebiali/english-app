import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import {
  Search,
  X,
  Volume2,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Crown,
  Sparkles,
  Globe,
  Eye,
  EyeOff,
  ArrowUpRight,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useThemeStore } from '../store/useThemeStore';
import { useLearningStore } from '../store/useLearningStore';
import { WordItem } from '../types';
import { dbService } from '../database/DatabaseService';
import {
  DictionaryApiService,
  RichDictionaryResult,
} from '../services/DictionaryApiService';
import { SelectFolderModal } from './SelectFolderModal';

const POPULAR_SEARCH_TAGS = [
  'money',
  'abandon',
  'achieve',
  'accommodate',
  'crucial',
  'inevitable',
  'sustainable',
  'coherent',
  'subsequent',
  'poverty',
  'negotiate',
  'resilient',
];

export const DictionaryScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { setActiveTab } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordItem[]>([]);
  const [apiResult, setApiResult] = useState<RichDictionaryResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<RichDictionaryResult | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Folder selection modal & success toast
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [toastData, setToastData] = useState<{ message: string; folderName?: string } | null>(null);

  const toastFadeAnim = useRef(new Animated.Value(0)).current;

  // Search logic: Local SQLite first, then online Dictionary API in parallel
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setApiResult(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        // 1. Local SQLite search (instant)
        const localMatches = await dbService.searchDictionary(trimmed, 25);
        setSearchResults(localMatches);

        // 2. Query Free Dictionary API for English input
        if (/^[a-zA-Z\s'-]+$/.test(trimmed) && trimmed.length >= 2) {
          const apiData = await DictionaryApiService.lookupWord(trimmed);
          setApiResult(apiData);
        } else {
          setApiResult(null);
        }
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When a word is selected, fetch deep dictionary detail (definitions, phonetics, examples)
  useEffect(() => {
    if (!selectedWord) {
      setSelectedWordDetail(null);
      return;
    }

    let isMounted = true;
    const loadDeepDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const detail = await DictionaryApiService.lookupWord(selectedWord.word);
        if (isMounted && detail) {
          setSelectedWordDetail(detail);
        }
      } catch (err) {
        console.warn('Error loading word detail:', err);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };

    loadDeepDetail();
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
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  // Safe, copyright-free AI illustration generator URL
  const getSafeAIImageUrl = (word: string, meaning: string): string => {
    const cleanWord = encodeURIComponent(word.toLowerCase());
    const cleanMeaning = encodeURIComponent(meaning.toLowerCase());
    return `https://image.pollinations.ai/prompt/clean%20minimalist%20educational%20flashcard%20illustration%20of%20${cleanWord}%20meaning%20${cleanMeaning}%20isolated%20on%20clean%20white%20background%20vector%20style?width=600&height=400&nologo=true`;
  };

  const showToast = (message: string, folderName?: string) => {
    setToastData({ message, folderName });
    Animated.sequence([
      Animated.timing(toastFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(3500),
      Animated.timing(toastFadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastData(null));
  };

  // -------------------------------------------------------------
  // VIEW 2: KELİME DETAY GÖRÜNÜMÜ (Görsel 4 - Profesyonel Tasarım)
  // -------------------------------------------------------------
  if (selectedWord) {
    const primaryMeaning =
      selectedWordDetail?.primaryTurkish && selectedWordDetail.primaryTurkish.toLowerCase() !== selectedWord.word.toLowerCase()
        ? selectedWordDetail.primaryTurkish
        : selectedWord.meaning;

    const aiImageUrl =
      selectedWord.image_url || getSafeAIImageUrl(selectedWord.word, primaryMeaning);

    const activeExampleEn =
      selectedWordDetail?.exampleEn ||
      selectedWord.example_sentence ||
      `The concept of ${selectedWord.word} is frequently studied in modern literature.`;

    const activeExampleTr =
      selectedWordDetail?.exampleTr || selectedWord.example_translation;

    const phonetic =
      selectedWordDetail?.phonetic || selectedWord.etymology_note;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Detail Navigation Bar */}
        <View style={[styles.detailNavBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.navIconBtn}
            onPress={() => setSelectedWord(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Geri"
          >
            <ArrowLeft size={22} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.detailNavCenter}>
            <Text style={[styles.detailNavTitle, { color: colors.textSecondary }]}>
              SÖZLÜK DETAYI
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navIconBtn}
            onPress={() => {
              setSelectedWord(null);
              setSearchQuery('');
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Kapat"
          >
            <X size={22} color={colors.textSecondary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.detailScroll}
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Word Header with Audio Pronounce */}
          <View style={[styles.wordHeaderCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.wordTitleRow}>
              <View style={styles.flagAndWord}>
                <Text style={styles.usFlag}>🇺🇸</Text>
                <Text style={[styles.mainWordText, { color: colors.text }]}>
                  {selectedWord.word}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.audioBtn,
                  {
                    backgroundColor: isSpeaking ? colors.brand : colors.subtleBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSpeak(selectedWord.word)}
                activeOpacity={0.8}
                accessibilityLabel="Sesli telaffuz dinle"
              >
                <Volume2
                  size={20}
                  color={isSpeaking ? '#FFFFFF' : colors.brand}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.partOfSpeechRow}>
              <View style={[styles.posBadge, { backgroundColor: colors.subtleBackground }]}>
                <Text style={[styles.posBadgeText, { color: colors.textSecondary }]}>
                  {selectedWord.part_of_speech ||
                    selectedWordDetail?.meanings[0]?.partOfSpeech ||
                    'noun'}
                </Text>
              </View>

              {phonetic ? (
                <View style={[styles.phoneticBadge, { backgroundColor: colors.subtleBackground }]}>
                  <Text style={[styles.phoneticText, { color: colors.brand }]}>
                    {phonetic}
                  </Text>
                </View>
              ) : null}

              {selectedWord.level ? (
                <View style={[styles.levelBadge, { backgroundColor: colors.brandLight }]}>
                  <Text style={[styles.levelBadgeText, { color: colors.brand }]}>
                    {selectedWord.level}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Section: Sözlük Bilgisi */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>
              SÖZLÜK
            </Text>
            <View style={[styles.dictionarySourceBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <BookOpen size={16} color="#10B981" />
              <Text style={[styles.dictionarySourceName, { color: colors.text }]}>
                OXFORD & ACADEMIC DICTIONARY
              </Text>
              <View style={[styles.onlinePill, { backgroundColor: '#10B98118' }]}>
                <Globe size={11} color="#10B981" />
                <Text style={styles.onlinePillText}>Canlı Veri</Text>
              </View>
            </View>
          </View>

          {/* Section: Çeviri */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>
              ÇEVİRİ
            </Text>
            <View style={[styles.translationBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={styles.trFlag}>🇹🇷</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.translationText, { color: colors.text }]}>
                  {primaryMeaning}
                </Text>

                {/* Sub-meanings chips */}
                {selectedWordDetail?.allTurkishMeanings &&
                  selectedWordDetail.allTurkishMeanings.length > 1 && (
                    <View style={styles.subMeaningsWrap}>
                      {selectedWordDetail.allTurkishMeanings
                        .filter((m) => m.toLowerCase() !== primaryMeaning.toLowerCase())
                        .slice(0, 5)
                        .map((m, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.subMeaningChip,
                              { backgroundColor: colors.subtleBackground, borderColor: colors.border },
                            ]}
                          >
                            <Text style={[styles.subMeaningChipText, { color: colors.textSecondary }]}>
                              {m}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}
              </View>
            </View>
          </View>

          {/* Section: Oxford / Cambridge Tanımları */}
          {selectedWordDetail?.meanings && selectedWordDetail.meanings.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>
                TANIMLAR & ANLAMLAR
              </Text>
              <View style={[styles.definitionsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                {selectedWordDetail.meanings.slice(0, 2).map((group, gIdx) => (
                  <View key={gIdx} style={styles.definitionGroup}>
                    <Text style={[styles.defPartOfSpeechTag, { color: colors.brand }]}>
                      {group.partOfSpeech.toUpperCase()}
                    </Text>
                    {group.definitions.slice(0, 3).map((def, dIdx) => (
                      <View key={dIdx} style={styles.definitionItemRow}>
                        <Text style={[styles.defNumber, { color: colors.textSecondary }]}>
                          {dIdx + 1}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.defText, { color: colors.text }]}>
                            {def.definition}
                          </Text>
                          {def.example ? (
                            <Text style={[styles.defExampleText, { color: colors.textSecondary }]}>
                              "{def.example}"
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Section: Örnekler */}
          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>
              ÖRNEKLER
            </Text>
            <View style={[styles.exampleBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.exampleSentenceEn, { color: colors.text }]}>
                {activeExampleEn}
              </Text>
              {activeExampleTr ? (
                <Text style={[styles.exampleSentenceTr, { color: colors.textSecondary }]}>
                  {activeExampleTr}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Section: Resim */}
          <View style={styles.detailSection}>
            <View style={styles.imageHeaderRow}>
              <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>
                GÖRSEL HAFIZA
              </Text>
              <TouchableOpacity
                style={styles.toggleImageBtn}
                onPress={() => setShowImage(!showImage)}
              >
                {showImage ? (
                  <EyeOff size={14} color={colors.textSecondary} />
                ) : (
                  <Eye size={14} color={colors.brand} />
                )}
                <Text style={[styles.toggleImageText, { color: showImage ? colors.textSecondary : colors.brand }]}>
                  {showImage ? 'Gizle' : 'Göster'}
                </Text>
              </TouchableOpacity>
            </View>

            {showImage && (
              <View
                style={[
                  styles.imageWrapper,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                {!imageError ? (
                  <View style={styles.imageInner}>
                    {imageLoading && (
                      <View style={styles.imageLoadingOverlay}>
                        <ActivityIndicator size="small" color={colors.brand} />
                        <Text style={[styles.imageLoadingText, { color: colors.textSecondary }]}>
                          İllüstrasyon yükleniyor...
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: aiImageUrl }}
                      style={styles.wordImage}
                      resizeMode="contain"
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                    <View style={[styles.aiBadge, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]}>
                      <Sparkles size={11} color="#FBBF24" />
                      <Text style={styles.aiBadgeText}>AI Telifsiz Görsel</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.fallbackImageBox}>
                    <BookOpen size={32} color={colors.brand} />
                    <Text style={[styles.fallbackWordTitle, { color: colors.text }]}>
                      {selectedWord.word}
                    </Text>
                    <Text style={[styles.fallbackWordMeaning, { color: colors.textSecondary }]}>
                      {primaryMeaning}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom CTA: Pratik İçin Ekle (Ölçülü, zarif ve LearnMatch turuncusu) */}
        <View
          style={[
            styles.bottomBarCta,
            {
              backgroundColor: colors.cardBackground,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.addPracticeBtn}
            onPress={() => setIsFolderModalVisible(true)}
            activeOpacity={0.88}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.addPracticeBtnText}>Pratik için ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Folder Picker Modal */}
        <SelectFolderModal
          visible={isFolderModalVisible}
          word={{
            ...selectedWord,
            meaning: primaryMeaning,
            example_sentence: activeExampleEn,
            example_translation: activeExampleTr,
            etymology_note: phonetic,
          }}
          imageUrl={aiImageUrl}
          onClose={() => setIsFolderModalVisible(false)}
          onSuccess={(folderName) => {
            // Kelime eklendikten sonra doğrudan detay ekranından çıkıp sözlük listesine döner
            const addedWord = selectedWord.word;
            setSelectedWord(null);
            showToast(`"${addedWord}" kelimesi ${folderName} klasörüne eklendi!`, folderName);
          }}
        />

        {/* Toast Notification with direct navigation to Kelimeler */}
        {toastData && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity: toastFadeAnim,
                backgroundColor: colors.isDark ? '#064E3B' : '#ECFDF5',
                borderColor: '#10B981',
              },
            ]}
          >
            <CheckCircle2 size={18} color="#10B981" />
            <Text
              style={[styles.toastText, { color: colors.isDark ? '#A7F3D0' : '#065F46' }]}
              numberOfLines={2}
            >
              {toastData.message}
            </Text>

            <TouchableOpacity
              style={styles.toastActionBtn}
              onPress={() => {
                setToastData(null);
                setActiveTab('VOCAB');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.toastActionText}>Kelimelerim</Text>
              <ArrowUpRight size={13} color="#10B981" strokeWidth={2.6} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: SÖZLÜK ANA EKRANI & ARAMA LİSTESİ (Görsel 2 & Görsel 3)
  // -------------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        {/* Search Input Bar */}
        <View style={[styles.searchBarWrap, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content: Search Results OR Default Dictionary Dashboard */}
      {searchQuery.trim().length > 0 ? (
        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={[
            styles.resultsScrollContent,
            isSearching && searchResults.length === 0 && !apiResult && styles.resultsScrollCentered,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SÖZLÜKTE ARANIYOR - TAM ORTADA! (Madde 2) */}
          {isSearching && searchResults.length === 0 && !apiResult ? (
            <View style={styles.loadingCenter}>
              <View style={[styles.loadingIconBox, { backgroundColor: colors.brandLight }]}>
                <ActivityIndicator size="small" color={colors.brand} />
              </View>
              <Text style={[styles.loadingTitle, { color: colors.text }]}>
                Sözlükte aranıyor...
              </Text>
              <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
                Yerel veritabanı ve canlı sözlük taranıyor
              </Text>
            </View>
          ) : searchResults.length === 0 && !apiResult ? (
            <View style={styles.emptyResultsBox}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Kelime bulunamadı
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                "{searchQuery}" için sonuç yok. Özel kelime ekleyebilir veya başka bir kelime deneyebilirsiniz.
              </Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {/* Canlı API sonucu */}
              {apiResult && !searchResults.some((r) => r.word.toLowerCase() === apiResult.word.toLowerCase()) && (
                <TouchableOpacity
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.brand,
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => {
                    const item = DictionaryApiService.convertToWordItem(apiResult) as WordItem;
                    setSelectedWord(item);
                    setImageError(false);
                    setImageLoading(true);
                  }}
                  activeOpacity={0.72}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.resultTopRow}>
                      <Text style={styles.smallFlag}>🇺🇸</Text>
                      <Text style={[styles.resultWordText, { color: colors.brand }]}>
                        {apiResult.word}
                      </Text>
                      <Text style={[styles.resultPosText, { color: colors.textSecondary }]}>
                        {apiResult.meanings[0]?.partOfSpeech || 'noun'}
                      </Text>
                      <View style={[styles.apiBadgePill, { backgroundColor: colors.brandLight }]}>
                        <Globe size={10} color={colors.brand} />
                        <Text style={[styles.apiBadgePillText, { color: colors.brand }]}>
                          Canlı Sözlük
                        </Text>
                      </View>
                    </View>

                    <View style={styles.resultMeaningRow}>
                      <Text style={styles.smallTrFlag}>🇹🇷</Text>
                      <Text
                        style={[styles.resultMeaningText, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {apiResult.primaryTurkish}
                        {apiResult.allTurkishMeanings.length > 1
                          ? ` (${apiResult.allTurkishMeanings.slice(1, 3).join(', ')})`
                          : ''}
                      </Text>
                    </View>

                    {apiResult.exampleEn ? (
                      <Text
                        style={[styles.resultExampleText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {apiResult.exampleEn}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight size={18} color={colors.brand} />
                </TouchableOpacity>
              )}

              {/* Yerel SQLite Sonuçları */}
              {searchResults.map((item, idx) => (
                <TouchableOpacity
                  key={item.id ? `${item.id}-${idx}` : `${item.word}-${idx}`}
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedWord(item);
                    setImageError(false);
                    setImageLoading(true);
                  }}
                  activeOpacity={0.72}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.resultTopRow}>
                      <Text style={styles.smallFlag}>🇺🇸</Text>
                      <Text style={[styles.resultWordText, { color: colors.text }]}>
                        {item.word}
                      </Text>
                      <Text style={[styles.resultPosText, { color: colors.textSecondary }]}>
                        {item.part_of_speech || item.category?.toLowerCase() || 'noun'}
                      </Text>
                    </View>

                    <View style={styles.resultMeaningRow}>
                      <Text style={styles.smallTrFlag}>🇹🇷</Text>
                      <Text
                        style={[styles.resultMeaningText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {item.meaning}
                      </Text>
                    </View>

                    {item.example_sentence ? (
                      <Text
                        style={[styles.resultExampleText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {item.example_sentence}
                      </Text>
                    ) : null}
                  </View>

                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        // SÖZLÜK ANA EKRANI (Görsel 2)
        <ScrollView
          style={styles.defaultScroll}
          contentContainerStyle={styles.defaultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dil Ayarı Bölümü */}
          <View style={styles.languageSection}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
              Dil ayarı
            </Text>
            <Text style={[styles.sectionHeaderSub, { color: colors.textSecondary }]}>
              Aşağıdaki dillerde kelime girişleri aranacak:
            </Text>

            <View style={styles.langPillsRow}>
              <View style={[styles.langPill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={styles.langPillFlag}>🇹🇷</Text>
                <Text style={[styles.langPillText, { color: colors.text }]}>Türkçe</Text>
              </View>

              <View style={[styles.langPill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={styles.langPillFlag}>🇺🇸</Text>
                <Text style={[styles.langPillText, { color: colors.text }]}>İngilizce</Text>
                <TouchableOpacity hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <X size={13} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.addLangPill, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Plus size={14} color={colors.brand} />
                <Text style={[styles.addLangPillText, { color: colors.brand }]}>Dil ekle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sözlüğü Şu Şekilde Kullanabilirsin */}
          <View style={styles.usageSection}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
              Sözlüğü şu şekilde kullanabilirsin:
            </Text>

            <TouchableOpacity
              style={[
                styles.usageCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSearchQuery('money')}
              activeOpacity={0.8}
            >
              <Text style={[styles.usageCardText, { color: colors.text }]}>
                Alıştırma için kelime ekle
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hızlı Arama Önerileri */}
          <View style={styles.quickTagsSection}>
            <Text style={[styles.quickTagsTitle, { color: colors.textSecondary }]}>
              SIK ARANAN KELİMELER
            </Text>
            <View style={styles.tagChipsWrap}>
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSearchQuery(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagChipText, { color: colors.text }]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Toast Notification with direct Kelimelerim link */}
      {toastData && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastFadeAnim,
              backgroundColor: colors.isDark ? '#064E3B' : '#ECFDF5',
              borderColor: '#10B981',
            },
          ]}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <Text
            style={[styles.toastText, { color: colors.isDark ? '#A7F3D0' : '#065F46' }]}
            numberOfLines={2}
          >
            {toastData.message}
          </Text>

          <TouchableOpacity
            style={styles.toastActionBtn}
            onPress={() => {
              setToastData(null);
              setActiveTab('VOCAB');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.toastActionText}>Kelimelerim</Text>
            <ArrowUpRight size={13} color="#10B981" strokeWidth={2.6} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  defaultScroll: {
    flex: 1,
  },
  defaultScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  languageSection: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionHeaderSub: {
    fontSize: 13,
    marginBottom: 12,
  },
  langPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  langPillFlag: {
    fontSize: 15,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addLangPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  addLangPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  usageSection: {
    marginBottom: 22,
  },
  usageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  usageCardText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickTagsSection: {
    marginBottom: 24,
  },
  quickTagsTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  oxfordBadgeBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  oxfordLogoSim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  oxfordTiny: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  oxfordBig: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  oxfordSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  oxfordDisclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  resultsScrollCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // TAM ORTADA LOADING (Madde 2)
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  loadingSubtitle: {
    fontSize: 13,
  },
  emptyResultsBox: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultsList: {
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  smallFlag: {
    fontSize: 14,
  },
  resultWordText: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultPosText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  apiBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  apiBadgePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  resultMeaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  smallTrFlag: {
    fontSize: 13,
  },
  resultMeaningText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultExampleText: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // DETAIL VIEW STYLES
  detailNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailNavCenter: {
    alignItems: 'center',
  },
  detailNavTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  wordHeaderCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  flagAndWord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  usFlag: {
    fontSize: 22,
  },
  mainWordText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  audioBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  partOfSpeechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  posBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  phoneticBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phoneticText: {
    fontSize: 12,
    fontWeight: '700',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitleLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dictionarySourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dictionarySourceName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  onlinePill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  onlinePillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  translationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  trFlag: {
    fontSize: 16,
    marginTop: 2,
  },
  translationText: {
    fontSize: 16,
    fontWeight: '800',
  },
  subMeaningsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  subMeaningChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  subMeaningChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  definitionsCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  definitionGroup: {
    gap: 8,
  },
  defPartOfSpeechTag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  definitionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  defNumber: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  defText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  defExampleText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  exampleBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  exampleSentenceEn: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  exampleSentenceTr: {
    fontSize: 13,
    lineHeight: 18,
  },
  imageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  toggleImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleImageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  imageWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  imageLoadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  fallbackImageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 6,
  },
  fallbackWordTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  fallbackWordMeaning: {
    fontSize: 13,
  },
  // PRATİK İÇİN EKLE BUTONU - CANLI TURUNCU VE ZARİF BOYUT (Madde 3)
  bottomBarCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    borderTopWidth: 1,
  },
  addPracticeBtn: {
    backgroundColor: '#FF7A00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  addPracticeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  // TOAST BİLDİRİMİ
  toastContainer: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  toastActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#10B98120',
  },
  toastActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
});
