import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, Volume2, Languages, Sparkles, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { WordWithProgress, dbService } from '../database/DatabaseService';
import { CardWord } from '../types';
import { DictionaryApiService } from '../services/DictionaryApiService';
import { getValidExampleSentence, isBoilerplateSentence } from '../utils/sentenceUtils';
import { getBuiltinAcademicSentence } from '../services/BuiltinAcademicDictionary';

let SpeechModule: any = null;
try {
  SpeechModule = require('expo-speech');
} catch (e) {
  // Safe fallback if native module is not available
}

interface LearnMatchWordCardProps {
  word: WordWithProgress | CardWord;
  currentIndex: number;
  totalCards: number;
  onNext: () => void;
  onPrev?: () => void;
  onClose: () => void;
  onToggleLearned?: (word: WordWithProgress | CardWord) => void;
  nextButtonText?: string;
}

export const LearnMatchWordCard: React.FC<LearnMatchWordCardProps> = ({
  word,
  currentIndex,
  totalCards,
  onNext,
  onPrev,
  onClose,
  nextButtonText,
}) => {
  const { colors, fontSize, isSystemFontSize, fontFamily } = useThemeStore();

  const dynamicFontSize = isSystemFontSize ? 15.5 : fontSize;
  const dynamicFontFamily =
    fontFamily === 'serif'
      ? (Platform.OS === 'ios' ? 'Georgia' : 'serif')
      : fontFamily === 'rounded'
      ? (Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium')
      : undefined;

  const [enrichedDetail, setEnrichedDetail] = useState<{
    phonetic?: string;
    exampleEn?: string;
    exampleTr?: string;
  } | null>(null);
  const [isLoadingSentence, setIsLoadingSentence] = useState<boolean>(false);
  const [isSentenceExpanded, setIsSentenceExpanded] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [isTranslatingSentence, setIsTranslatingSentence] = useState<boolean>(false);
  const [onDemandTranslation, setOnDemandTranslation] = useState<string>('');

  const wordText = word?.word || '';
  const wordMeaning = word?.meaning || '';

  const safeSynonyms = React.useMemo(() => {
    const rawSyn = (word as any)?.synonyms;
    if (!rawSyn) return [];
    if (Array.isArray(rawSyn)) return rawSyn;
    if (typeof rawSyn === 'string') {
      try {
        const parsed = JSON.parse(rawSyn);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  }, [word]);

  // Reset states when word or index changes
  useEffect(() => {
    setIsSentenceExpanded(false);
    setShowTranslation(false);
    setOnDemandTranslation('');
    setIsTranslatingSentence(false);
    setEnrichedDetail(null);
  }, [wordText, currentIndex]);

  // Synchronous resolution of immediate sentence data (0ms latency, eliminates flicker)
  const builtinSentence = wordText ? getBuiltinAcademicSentence(wordText) : null;
  const cachedLookup = wordText ? DictionaryApiService.getCachedWord(wordText) : null;

  const synchronousEn =
    getValidExampleSentence(word?.example_sentence) ||
    getValidExampleSentence(builtinSentence?.sampleSentenceEn) ||
    getValidExampleSentence(cachedLookup?.exampleEn) ||
    '';

  const synchronousTr =
    getValidExampleSentence(word?.example_translation) ||
    getValidExampleSentence(builtinSentence?.sampleSentenceTr) ||
    getValidExampleSentence(cachedLookup?.exampleTr) ||
    '';

  // 1. Sayfa açıldığı an: Sadece İngilizce örnek cümleyi arka planda sessizce yükletiriz (pre-fetch)
  // skipSentenceTranslation: true sayesinde sayfayı ağırlaştıracak çeviri beklemesi yapılmaz, çok hızlı gelir
  useEffect(() => {
    let isMounted = true;
    const hasImmediateSentence = Boolean(synchronousEn);

    if (!wordText) {
      setIsLoadingSentence(false);
      return;
    }

    if (!hasImmediateSentence) {
      setIsLoadingSentence(true);
      DictionaryApiService.lookupWord(wordText, { skipSentenceTranslation: true })
        .then(async (res) => {
          if (!isMounted) return;
          let enrichedEn = getValidExampleSentence(res?.exampleEn);
          let enrichedTr = getValidExampleSentence(res?.exampleTr);

          if (!enrichedEn) {
            const fallback = await DictionaryApiService.fetchAuthenticSentence(
              wordText,
              undefined,
              true
            );
            if (fallback?.en) {
              enrichedEn = getValidExampleSentence(fallback.en);
              enrichedTr = getValidExampleSentence(fallback.tr);
            }
          }

          if (isMounted) {
            if (enrichedEn || res?.phonetic) {
              setEnrichedDetail({
                phonetic: res?.phonetic,
                exampleEn: enrichedEn || undefined,
                exampleTr: enrichedTr || undefined,
              });
              if (enrichedEn) {
                if (word?.id) {
                  dbService.updateWordExample(word.id, enrichedEn, enrichedTr || undefined).catch(() => {});
                } else {
                  dbService.updateWordExampleByText(wordText, enrichedEn, enrichedTr || undefined).catch(() => {});
                }
              }
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingSentence(false);
        });
    } else {
      setIsLoadingSentence(false);
      // Phonetic bilgisi eksikse arka planda sessizce zenginleştir
      DictionaryApiService.lookupWord(wordText, { skipSentenceTranslation: true })
        .then((res) => {
          if (isMounted && res?.phonetic) {
            setEnrichedDetail((prev) => ({
              phonetic: res.phonetic,
              exampleEn: prev?.exampleEn,
              exampleTr: prev?.exampleTr,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [wordText, word?.example_sentence, synchronousEn]);

  const handleSpeakWord = () => {
    if (!wordText) return;
    try {
      if (SpeechModule && typeof SpeechModule.speak === 'function') {
        SpeechModule.stop();
        SpeechModule.speak(wordText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.88,
        });
      } else {
        console.warn('Native speech module is not available in this binary build.');
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  };

  const handleSpeakSentence = (textToSpeak: string) => {
    try {
      if (SpeechModule && typeof SpeechModule.speak === 'function') {
        SpeechModule.stop();
        SpeechModule.speak(textToSpeak, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.86,
        });
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  };

  const progressPercent = totalCards > 0 ? Math.min(100, Math.round(((currentIndex + 1) / totalCards) * 100)) : 0;

  // Effective English example sentence (strictly non-boilerplate)
  const effectiveExampleEn =
    synchronousEn ||
    getValidExampleSentence(enrichedDetail?.exampleEn) ||
    '';

  // Candidate Turkish translation (strictly non-boilerplate)
  const candidateTr =
    onDemandTranslation ||
    synchronousTr ||
    getValidExampleSentence(enrichedDetail?.exampleTr);

  const effectiveExampleTr =
    candidateTr && !isBoilerplateSentence(candidateTr) ? candidateTr : onDemandTranslation;

  // 2. Cümle içinde kullanımına tıklandığında:
  // İngilizce cümle arka planda zaten indirildiği için anında açılır.
  // Tam bu tıklama anında Türkçe çevirisi arka planda getirilmeye başlanır!
  const handleExpandSentence = () => {
    setIsSentenceExpanded(true);

    if (!effectiveExampleTr && effectiveExampleEn && !isTranslatingSentence) {
      setIsTranslatingSentence(true);
      const targetWord = wordText;
      DictionaryApiService.translateSentence(effectiveExampleEn)
        .then((tr) => {
          if (targetWord !== (word?.word || '') || !tr || tr.trim().length === 0) return;
          const cleanTr = tr.trim();
          if (!isBoilerplateSentence(cleanTr)) {
            setOnDemandTranslation(cleanTr);
            if (word?.id) {
              dbService.updateWordExample(word.id, effectiveExampleEn, cleanTr).catch(() => {});
            } else {
              dbService.updateWordExampleByText(targetWord, effectiveExampleEn, cleanTr).catch(() => {});
            }
          }
        })
        .catch((e) => {
          console.warn('Cümle çevirisi hazırlama hatası:', e);
        })
        .finally(() => {
          if (targetWord === (word?.word || '')) {
            setIsTranslatingSentence(false);
          }
        });
    }
  };

  const handleToggleSentence = () => {
    if (isSentenceExpanded) {
      setIsSentenceExpanded(false);
      setShowTranslation(false);
    } else {
      handleExpandSentence();
    }
  };

  // Kullanıcı cümle indirilirken "Cümle İçinde Gör"e basmışsa, cümle indiği an Türkçe çeviriyi arka planda başlat
  useEffect(() => {
    if (
      isSentenceExpanded &&
      effectiveExampleEn &&
      !effectiveExampleTr &&
      !isTranslatingSentence &&
      !onDemandTranslation
    ) {
      setIsTranslatingSentence(true);
      const targetWord = wordText;
      DictionaryApiService.translateSentence(effectiveExampleEn)
        .then((tr) => {
          if (targetWord !== (word?.word || '') || !tr || tr.trim().length === 0) return;
          const cleanTr = tr.trim();
          if (!isBoilerplateSentence(cleanTr)) {
            setOnDemandTranslation(cleanTr);
            if (word?.id) {
              dbService.updateWordExample(word.id, effectiveExampleEn, cleanTr).catch(() => {});
            } else {
              dbService.updateWordExampleByText(targetWord, effectiveExampleEn, cleanTr).catch(() => {});
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          if (targetWord === (word?.word || '')) {
            setIsTranslatingSentence(false);
          }
        });
    }
  }, [isSentenceExpanded, effectiveExampleEn, effectiveExampleTr]);

  // 3. Kullanıcı Türkçe Çeviri butonuna bastığında:
  // Cümle açıldığı andan beri arka planda hazırlandığı için Türkçe çeviri de neredeyse anında açılır!
  const handleToggleTranslation = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    setShowTranslation(true);

    if (!effectiveExampleTr && effectiveExampleEn && !isTranslatingSentence) {
      setIsTranslatingSentence(true);
      const targetWord = wordText;
      try {
        const tr = await DictionaryApiService.translateSentence(effectiveExampleEn);
        if (targetWord === (word?.word || '') && tr && tr.trim().length > 0) {
          const cleanTr = tr.trim();
          if (!isBoilerplateSentence(cleanTr)) {
            setOnDemandTranslation(cleanTr);
            if (word?.id) {
              dbService.updateWordExample(word.id, effectiveExampleEn, cleanTr).catch(() => {});
            } else {
              dbService.updateWordExampleByText(targetWord, effectiveExampleEn, cleanTr).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn('Failed to translate example sentence:', e);
      } finally {
        if (targetWord === (word?.word || '')) {
          setIsTranslatingSentence(false);
        }
      }
    }
  };

  const phoneticText = enrichedDetail?.phonetic || '';

  // Render English sentence with target word highlighted (regex-safe against special characters)
  const renderFormattedSentence = (sentence: string) => {
    if (!sentence) return null;

    const cleanTarget = wordText.replace(/^\(to\)\s*/i, '').trim();
    if (!cleanTarget) {
      return (
        <Text
          style={[
            styles.exampleSentenceText,
            {
              color: colors.text,
              fontSize: dynamicFontSize,
              lineHeight: Math.round(dynamicFontSize * 1.48),
              fontFamily: dynamicFontFamily,
            },
          ]}
        >
          {sentence}
        </Text>
      );
    }

    const escaped = cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = sentence.split(regex);

    return (
      <Text
        style={[
          styles.exampleSentenceText,
          {
            color: colors.text,
            fontSize: dynamicFontSize,
            lineHeight: Math.round(dynamicFontSize * 1.48),
            fontFamily: dynamicFontFamily,
          },
        ]}
      >
        {parts.map((part, i) => {
          if (part.toLowerCase() === cleanTarget.toLowerCase()) {
            return (
              <Text
                key={i}
                style={[
                  styles.underlinedWord,
                  { color: colors.brand, backgroundColor: colors.brandLight },
                ]}
              >
                {part}
              </Text>
            );
          }
          return <Text key={i}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Kapat"
        >
          <X size={24} color={colors.textSecondary} strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Top Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.brand }]} />
        </View>

        {/* Counter Badge */}
        <View style={styles.topRightCounter}>
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            {currentIndex + 1}/{totalCards}
          </Text>
        </View>
      </View>

      {/* CARD CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.text,
            },
          ]}
        >
          {/* 1. TOP META ROW: LEVEL & PART OF SPEECH PILLS */}
          <View style={styles.cardTopMetaRow}>
            {word?.level ? (
              <View style={[styles.metaPill, { backgroundColor: colors.brandLight }]}>
                <Text style={[styles.metaPillText, { color: colors.brand }]}>
                  {word.level}
                </Text>
              </View>
            ) : null}
            {word?.part_of_speech || word?.subcategory ? (
              <View style={[styles.metaPillSubtle, { backgroundColor: colors.subtleBackground }]}>
                <Text style={[styles.metaPillSubtleText, { color: colors.textSecondary }]}>
                  {word.part_of_speech || word.subcategory}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 2. HERO TARGET WORD & PRONUNCIATION */}
          <View style={styles.heroWordSection}>
            <View style={styles.heroWordRow}>
              <Text
                style={[
                  styles.heroWordText,
                  { color: colors.text, fontFamily: dynamicFontFamily },
                ]}
                numberOfLines={2}
              >
                {wordText}
              </Text>
              <TouchableOpacity
                style={[styles.audioRoundBtn, { backgroundColor: colors.brandLight }]}
                onPress={handleSpeakWord}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Telaffuzu Dinle"
              >
                <Volume2 size={19} color={colors.brand} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {phoneticText ? (
              <Text style={[styles.phoneticMuted, { color: colors.textSecondary }]}>
                {phoneticText}
              </Text>
            ) : null}
          </View>

          {/* 3. TURKISH MEANING SECTION */}
          <View style={[styles.meaningCard, { backgroundColor: colors.subtleBackground }]}>
            <Text
              style={[
                styles.meaningText,
                { color: colors.text, fontFamily: dynamicFontFamily },
              ]}
            >
              {wordMeaning}
            </Text>
          </View>

          {/* 4. SYNONYMS SECTION (EŞ ANLAMLILAR) */}
          {safeSynonyms.length > 0 && (
            <View style={styles.synonymsSection}>
              <Text style={[styles.subtleMetaLabel, { color: colors.textSecondary }]}>
                EŞ ANLAMLILAR
              </Text>
              <View style={styles.synonymsChipsWrap}>
                {safeSynonyms.map((syn: string, idx: number) => (
                  <View
                    key={idx}
                    style={[
                      styles.synChipPill,
                      {
                        backgroundColor: colors.brandLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.synChipPillText,
                        { color: colors.brand, fontFamily: dynamicFontFamily },
                      ]}
                    >
                      {syn}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 5. CONTEXT / EXAMPLE SENTENCE SECTION */}
          {effectiveExampleEn ? (
            <View style={[styles.sentenceCardUnified, { backgroundColor: colors.subtleBackground }]}>
              <View style={styles.sentenceHeaderRow}>
                <Text style={[styles.subtleMetaLabel, { color: colors.textSecondary }]}>
                  ÖRNEK CÜMLE
                </Text>
                <TouchableOpacity
                  onPress={() => handleSpeakSentence(effectiveExampleEn)}
                  style={[styles.audioMiniBtn, { backgroundColor: colors.cardBackground }]}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityLabel="Cümleyi Dinle"
                >
                  <Volume2 size={15} color={colors.brand} />
                </TouchableOpacity>
              </View>

              {/* English Sentence */}
              <View style={styles.enSentenceBox}>
                {renderFormattedSentence(effectiveExampleEn)}
              </View>

              {/* Translation Toggle Pill */}
              <TouchableOpacity
                style={[
                  styles.translationToggleBtn,
                  {
                    backgroundColor: showTranslation ? colors.brandLight : colors.cardBackground,
                    borderColor: showTranslation ? colors.brand : colors.border,
                  },
                ]}
                onPress={handleToggleTranslation}
                activeOpacity={0.75}
                accessibilityLabel="Türkçe Çeviriyi Gör"
              >
                <Languages size={14} color={showTranslation ? colors.brand : colors.textSecondary} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.translationToggleBtnText,
                    {
                      color: showTranslation ? colors.brand : colors.textSecondary,
                      fontFamily: dynamicFontFamily,
                      fontSize: Math.max(12, dynamicFontSize - 2.5),
                      fontWeight: showTranslation ? '700' : '600',
                    },
                  ]}
                >
                  {showTranslation ? 'Türkçe Çeviriyi Gizle' : 'Türkçe Çevirisi'}
                </Text>
              </TouchableOpacity>

              {/* Turkish Translation Display */}
              {showTranslation && (
                <View style={styles.translationContainer}>
                  <View style={[styles.sentenceInnerDivider, { backgroundColor: colors.border }]} />
                  {isTranslatingSentence ? (
                    <View style={styles.translationLoadingRow}>
                      <ActivityIndicator size="small" color={colors.brand} />
                      <Text
                        style={[
                          styles.translatingText,
                          { color: colors.textSecondary, fontFamily: dynamicFontFamily },
                        ]}
                      >
                        Türkçe çeviri hazırlanıyor...
                      </Text>
                    </View>
                  ) : effectiveExampleTr ? (
                    <Text
                      style={[
                        styles.turkishSentenceText,
                        {
                          color: colors.textSecondary,
                          fontSize: Math.max(12, dynamicFontSize - 2),
                          lineHeight: Math.round((dynamicFontSize - 2) * 1.48),
                          fontFamily: dynamicFontFamily,
                        },
                      ]}
                    >
                      {effectiveExampleTr}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          ) : isLoadingSentence ? (
            <View
              style={[
                styles.sentenceLoadingBox,
                {
                  backgroundColor: colors.subtleBackground,
                },
              ]}
            >
              <ActivityIndicator size="small" color={colors.brand} />
              <Text
                style={[
                  styles.loadingText,
                  { color: colors.textSecondary, fontFamily: dynamicFontFamily },
                ]}
              >
                Örnek cümle hazırlanıyor...
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* BOTTOM STICKY BAR: ÖNCEKİ / SONRAKİ */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.bottomButtonsRow}>
          {onPrev && currentIndex > 0 ? (
            <TouchableOpacity
              style={[
                styles.prevBtn,
                {
                  backgroundColor: colors.subtleBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={onPrev}
              activeOpacity={0.8}
            >
              <Text style={[styles.prevBtnText, { color: colors.text }]}>Önceki</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor: colors.brand,
                flex: onPrev && currentIndex > 0 ? 1 : undefined,
                width: onPrev && currentIndex > 0 ? undefined : '100%',
              },
            ]}
            onPress={onNext}
            activeOpacity={0.88}
          >
            <Text style={[styles.nextBtnText, { color: colors.textOnBrand }]}>{nextButtonText || 'Sonraki'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 14,
    paddingBottom: 10,
    gap: 12,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  topRightCounter: {
    paddingHorizontal: 4,
  },
  counterText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Platform.select({ ios: 20, android: 12 }),
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTopMetaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  metaPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Platform.select({ ios: 8, android: 6 }),
  },
  metaPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaPillSubtle: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Platform.select({ ios: 8, android: 6 }),
  },
  metaPillSubtleText: {
    fontSize: 11.5,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  heroWordSection: {
    width: '100%',
    marginBottom: 14,
  },
  heroWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroWordText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    flex: 1,
  },
  audioRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneticMuted: {
    fontSize: 13.5,
    marginTop: 3,
    fontStyle: 'italic',
  },
  meaningCard: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Platform.select({ ios: 14, android: 10 }),
    marginBottom: 14,
  },
  meaningText: {
    fontSize: 18.5,
    fontWeight: '700',
    lineHeight: 25,
  },
  subtleMetaLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  synonymsSection: {
    width: '100%',
    marginBottom: 16,
  },
  synonymsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  synChipPill: {
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: Platform.select({ ios: 10, android: 7 }),
  },
  synChipPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sentenceCardUnified: {
    width: '100%',
    padding: 16,
    borderRadius: Platform.select({ ios: 16, android: 12 }),
  },
  sentenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  audioMiniBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enSentenceBox: {
    marginBottom: 12,
  },
  exampleSentenceText: {
    fontSize: 15,
    lineHeight: 22,
  },
  underlinedWord: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '700',
  },
  translationToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  translationToggleBtnText: {
    letterSpacing: 0.1,
  },
  translationContainer: {
    marginTop: 8,
  },
  sentenceInnerDivider: {
    height: 1,
    marginVertical: 8,
    opacity: 0.6,
  },
  translationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  translatingText: {
    fontSize: 12.5,
    fontStyle: 'italic',
  },
  turkishSentenceText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  sentenceLoadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Platform.select({ ios: 14, android: 10 }),
  },
  loadingText: {
    fontSize: 12,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 34, android: 20 }),
    borderTopWidth: 1,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prevBtn: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    width: '100%',
    height: 50,
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
