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

  // Reset states when word or index changes
  useEffect(() => {
    setIsSentenceExpanded(false);
    setShowTranslation(false);
    setOnDemandTranslation('');
    setIsTranslatingSentence(false);
    setEnrichedDetail(null);
  }, [word.word, currentIndex]);

  // Synchronous resolution of immediate sentence data (0ms latency, eliminates flicker)
  const builtinSentence = getBuiltinAcademicSentence(word.word);
  const cachedLookup = DictionaryApiService.getCachedWord(word.word);

  const synchronousEn =
    getValidExampleSentence(word.example_sentence) ||
    getValidExampleSentence(builtinSentence?.sampleSentenceEn) ||
    getValidExampleSentence(cachedLookup?.exampleEn) ||
    '';

  const synchronousTr =
    getValidExampleSentence(word.example_translation) ||
    getValidExampleSentence(builtinSentence?.sampleSentenceTr) ||
    getValidExampleSentence(cachedLookup?.exampleTr) ||
    '';

  // 1. Sayfa açıldığı an: Sadece İngilizce örnek cümleyi arka planda sessizce yükletiriz (pre-fetch)
  // skipSentenceTranslation: true sayesinde sayfayı ağırlaştıracak çeviri beklemesi yapılmaz, çok hızlı gelir
  useEffect(() => {
    let isMounted = true;
    const hasImmediateSentence = Boolean(synchronousEn);

    if (!hasImmediateSentence) {
      setIsLoadingSentence(true);
      DictionaryApiService.lookupWord(word.word, { skipSentenceTranslation: true })
        .then(async (res) => {
          if (!isMounted) return;
          let enrichedEn = getValidExampleSentence(res?.exampleEn);
          let enrichedTr = getValidExampleSentence(res?.exampleTr);

          if (!enrichedEn) {
            const fallback = await DictionaryApiService.fetchAuthenticSentence(
              word.word,
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
                if (word.id) {
                  dbService.updateWordExample(word.id, enrichedEn, enrichedTr || undefined).catch(() => {});
                } else {
                  dbService.updateWordExampleByText(word.word, enrichedEn, enrichedTr || undefined).catch(() => {});
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
      DictionaryApiService.lookupWord(word.word, { skipSentenceTranslation: true })
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
  }, [word.word, word.example_sentence, synchronousEn]);

  const handleSpeakWord = () => {
    try {
      if (SpeechModule && typeof SpeechModule.speak === 'function') {
        SpeechModule.stop();
        SpeechModule.speak(word.word, {
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
      DictionaryApiService.translateSentence(effectiveExampleEn)
        .then((tr) => {
          if (tr && tr.trim().length > 0) {
            setOnDemandTranslation(tr.trim());
            if (word.id) {
              dbService.updateWordExample(word.id, effectiveExampleEn, tr.trim()).catch(() => {});
            } else {
              dbService.updateWordExampleByText(word.word, effectiveExampleEn, tr.trim()).catch(() => {});
            }
          }
        })
        .catch((e) => {
          console.warn('Cümle çevirisi hazırlama hatası:', e);
        })
        .finally(() => {
          setIsTranslatingSentence(false);
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
      DictionaryApiService.translateSentence(effectiveExampleEn)
        .then((tr) => {
          if (tr && tr.trim().length > 0) {
            setOnDemandTranslation(tr.trim());
            if (word.id) {
              dbService.updateWordExample(word.id, effectiveExampleEn, tr.trim()).catch(() => {});
            } else {
              dbService.updateWordExampleByText(word.word, effectiveExampleEn, tr.trim()).catch(() => {});
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsTranslatingSentence(false);
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
      try {
        const tr = await DictionaryApiService.translateSentence(effectiveExampleEn);
        if (tr && tr.trim().length > 0) {
          setOnDemandTranslation(tr.trim());
          if (word.id) {
            dbService.updateWordExample(word.id, effectiveExampleEn, tr.trim()).catch(() => {});
          } else {
            dbService.updateWordExampleByText(word.word, effectiveExampleEn, tr.trim()).catch(() => {});
          }
        } else {
          const fallback = `"${word.meaning || word.word}" akademik metinlerde ve günlük iletişimde yaygın olarak kullanılır.`;
          setOnDemandTranslation(fallback);
        }
      } catch (e) {
        console.warn('Failed to translate example sentence:', e);
        const fallback = `"${word.meaning || word.word}" akademik metinlerde ve günlük iletişimde yaygın olarak kullanılır.`;
        setOnDemandTranslation(fallback);
      } finally {
        setIsTranslatingSentence(false);
      }
    }
  };

  const phoneticText = enrichedDetail?.phonetic || '';

  // Render English sentence with target word highlighted
  const renderFormattedSentence = (sentence: string) => {
    if (!sentence) return null;

    const cleanTarget = word.word.replace(/^\(to\)\s*/i, '').trim();
    const regex = new RegExp(`(${cleanTarget})`, 'gi');
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
              shadowColor: colors.isDark ? '#000000' : '#1F1B2E',
            },
          ]}
        >
          {/* TOP SECTION: TARGET WORD & PRONUNCIATION */}
          <View style={styles.wordHeaderSection}>
            <View style={styles.wordTitleRow}>
              <Text
                style={[
                  styles.targetWordText,
                  { color: colors.brand, fontFamily: dynamicFontFamily },
                ]}
                numberOfLines={2}
              >
                {word.word}
              </Text>
              <TouchableOpacity
                style={[styles.audioPillBtn, { backgroundColor: colors.brandLight }]}
                onPress={handleSpeakWord}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Telaffuzu Dinle"
              >
                <Volume2 size={20} color={colors.brand} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {phoneticText ? (
              <Text style={[styles.phoneticText, { color: colors.textSecondary }]}>
                {phoneticText}
              </Text>
            ) : null}
          </View>

          {/* DIVIDER */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* TURKISH MEANING SECTION */}
          <View style={styles.meaningSection}>
            <Text style={[styles.sectionMetaLabel, { color: colors.textSecondary }]}>
              TÜRKÇE ANLAMI
            </Text>
            <Text
              style={[
                styles.turkishMeaningText,
                { color: colors.text, fontFamily: dynamicFontFamily },
              ]}
            >
              {word.meaning}
            </Text>
          </View>

          {/* DIVIDER */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* CONTEXT / EXAMPLE SENTENCE SECTION */}
          <View style={styles.contextSection}>
            <View style={styles.contextHeaderRow}>
              <Text style={[styles.sectionMetaLabel, { color: colors.textSecondary }]}>
                CÜMLE İÇİNDE KULLANIMI
              </Text>
              {isSentenceExpanded && effectiveExampleEn ? (
                <TouchableOpacity
                  onPress={handleToggleSentence}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.sentenceCollapseIconBtn}
                  accessibilityLabel="Cümleyi Kapat"
                >
                  <ChevronUp size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {!isSentenceExpanded ? (
              /* Progressive Disclosure Trigger: Appears instantly without ugly skeleton */
              <TouchableOpacity
                style={[
                  styles.showSentenceBtn,
                  {
                    backgroundColor: colors.subtleBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleExpandSentence}
                activeOpacity={0.7}
                accessibilityLabel="Cümle içinde kullanımını gör"
              >
                <View style={styles.showSentenceBtnLeft}>
                  <View style={[styles.showSentenceIconCircle, { backgroundColor: colors.brandLight }]}>
                    <Sparkles size={16} color={colors.brand} />
                  </View>
                  <Text
                    style={[
                      styles.showSentenceBtnText,
                      {
                        color: colors.text,
                        fontFamily: dynamicFontFamily,
                        fontSize: Math.round(dynamicFontSize * 0.94),
                      },
                    ]}
                  >
                    Cümle içinde kullanımını gör
                  </Text>
                </View>
                <View
                  style={[
                    styles.showSentencePill,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  ]}
                >
                  <ChevronDown size={15} color={colors.brand} />
                </View>
              </TouchableOpacity>
            ) : isLoadingSentence && !effectiveExampleEn ? (
              /* Only if user tapped immediately and sentence is still loading */
              <View
                style={[
                  styles.sentenceCard,
                  {
                    backgroundColor: colors.subtleBackground,
                    borderColor: colors.border,
                    minHeight: 64,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 14,
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
            ) : effectiveExampleEn ? (
              /* Expanded English sentence card */
              <View
                style={[
                  styles.sentenceCard,
                  {
                    backgroundColor: colors.subtleBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* English Sentence */}
                <View style={styles.enSentenceBox}>
                  {renderFormattedSentence(effectiveExampleEn)}
                </View>

                {/* Translation & Audio Action Row */}
                <View style={styles.translationActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.showTranslationBtn,
                      {
                        backgroundColor: showTranslation ? colors.brandLight : colors.cardBackground,
                        borderColor: showTranslation ? colors.brand : colors.border,
                      },
                    ]}
                    onPress={handleToggleTranslation}
                    activeOpacity={0.75}
                    accessibilityLabel="Türkçe Çeviriyi Gör"
                  >
                    <Languages size={15} color={showTranslation ? colors.brand : colors.textSecondary} strokeWidth={2.2} />
                    <Text
                      style={[
                        styles.showTranslationBtnText,
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

                  <TouchableOpacity
                    onPress={() => handleSpeakSentence(effectiveExampleEn)}
                    style={[
                      styles.sentenceInlineAudioBtn,
                      { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    ]}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityLabel="Cümleyi Dinle"
                  >
                    <Volume2 size={15} color={colors.brand} />
                  </TouchableOpacity>
                </View>

                {/* Turkish Translation (Revealed on demand) */}
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
                            lineHeight: Math.round((dynamicFontSize - 2) * 1.45),
                            fontFamily: dynamicFontFamily,
                          },
                        ]}
                      >
                        {effectiveExampleTr}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.turkishSentenceText,
                          {
                            color: colors.textSecondary,
                            fontStyle: 'italic',
                            fontSize: Math.max(12, dynamicFontSize - 2),
                            fontFamily: dynamicFontFamily,
                          },
                        ]}
                      >
                        Çeviri bulunamadı.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sentenceCard,
                  {
                    backgroundColor: colors.subtleBackground,
                    borderColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 14,
                  },
                ]}
                onPress={() => {
                  setIsLoadingSentence(true);
                  DictionaryApiService.fetchAuthenticSentence(word.word)
                    .then((res) => {
                      if (res?.en) {
                        setEnrichedDetail({
                          exampleEn: res.en,
                          exampleTr: res.tr || undefined,
                        });
                        if (word.id) {
                          dbService.updateWordExample(word.id, res.en, res.tr || undefined).catch(() => {});
                        } else {
                          dbService.updateWordExampleByText(word.word, res.en, res.tr || undefined).catch(() => {});
                        }
                      }
                    })
                    .finally(() => setIsLoadingSentence(false));
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.loadingText,
                    { color: colors.textSecondary, fontFamily: dynamicFontFamily },
                  ]}
                >
                  Örnek cümleyi tekrar dene
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
            <Text style={styles.nextBtnText}>{nextButtonText || 'Sonraki'}</Text>
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
    padding: 4,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  topRightCounter: {
    paddingHorizontal: 6,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  wordHeaderSection: {
    alignItems: 'center',
    width: '100%',
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  targetWordText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  audioPillBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneticText: {
    fontSize: 13.5,
    marginTop: 4,
    fontStyle: 'italic',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 18,
  },
  meaningSection: {
    width: '100%',
    alignItems: 'center',
  },
  sectionMetaLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  turkishMeaningText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  contextSection: {
    width: '100%',
  },
  contextHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sentenceAudioIconBtn: {
    padding: 4,
  },
  sentenceCollapseIconBtn: {
    padding: 4,
  },
  showSentenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Platform.select({ ios: 14, android: 10 }),
    borderWidth: 1,
  },
  showSentenceBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  showSentenceIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showSentenceBtnText: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  showSentencePill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceLoadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  loadingText: {
    fontSize: 12,
  },
  sentenceCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  enSentenceBox: {
    marginBottom: 8,
  },
  exampleSentenceText: {
    fontSize: 15,
    lineHeight: 22,
  },
  underlinedWord: {
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  translationActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  showTranslationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Platform.select({ ios: 10, android: 8 }),
    borderWidth: 1,
  },
  showTranslationBtnText: {
    letterSpacing: 0.1,
  },
  sentenceInlineAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceInnerDivider: {
    height: 1,
    marginVertical: 8,
  },
  turkishSentenceText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  translationIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  translationContainer: {
    marginTop: 4,
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
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prevBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontSize: 15.5,
    fontWeight: '600',
  },
  nextBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
