import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Volume2 } from 'lucide-react-native';
import { CardWord } from '../types';
import { TurengService, TurengWordDetail } from '../services/TurengService';
import { AIService } from '../services/AIService';
import { useThemeStore } from '../store/useThemeStore';
import { getValidExampleSentence, isBoilerplateSentence } from '../utils/sentenceUtils';
import { dbService } from '../database/DatabaseService';
import { SoundService } from '../services/SoundService';

// Safe dynamic native module resolution to prevent launch crashes on binaries without ExpoSpeech linked
let SpeechModule: any = null;
try {
  SpeechModule = require('expo-speech');
} catch (e) {
  // Native module not linked in current binary
}

export interface CardComponentProps {
  cardWord: CardWord;
  onAnswer: (isCorrect: boolean) => void;
  cardIndex: number;
  totalCards: number;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  cardWord,
  onAnswer,
  cardIndex = 0,
  totalCards = 1,
}) => {
  const { colors, fontSize, isSystemFontSize, fontFamily } = useThemeStore();
  const dynamicFontSize = isSystemFontSize ? 16 : fontSize;
  const dynamicFontFamily =
    fontFamily === 'serif'
      ? (Platform.OS === 'ios' ? 'Georgia' : 'serif')
      : fontFamily === 'rounded'
      ? (Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium')
      : undefined;
  const [userInput, setUserInput] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [matchedWith, setMatchedWith] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [turengDetail, setTurengDetail] = useState<TurengWordDetail | null>(null);
  const [enrichedSentence, setEnrichedSentence] = useState<{ en: string; tr: string } | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [isProceeding, setIsProceeding] = useState<boolean>(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // When word or card index changes, reset input and fetch Tureng details
  useEffect(() => {
    let isMounted = true;
    setUserInput('');
    setIsChecking(false);
    setIsEvaluated(false);
    setIsCorrectAnswer(false);
    setIsFlipped(false);
    setMatchedWith('');
    setEnrichedSentence(null);
    setIsProceeding(false);

    // Fetch Tureng data safely with mount guard
    if (cardWord?.word) {
      TurengService.lookupWord(cardWord.word)
        .then((detail) => {
          if (!isMounted) return;
          setTurengDetail(detail);
          const validEn = getValidExampleSentence(detail?.sampleSentenceEn);
          if (validEn) {
            const validTr = getValidExampleSentence(detail?.sampleSentenceTr) || '';
            if (isMounted) {
              setEnrichedSentence({ en: validEn, tr: validTr });
            }
            if (cardWord.id) {
              dbService.updateWordExample(cardWord.id, validEn, validTr).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [cardWord?.id, cardWord?.word, cardIndex]);

  // Flipping the card means the user couldn't remember without looking -> Treat as Hatırlayamadım (incorrect)
  const handleFlipCard = () => {
    Keyboard.dismiss();
    if (!isEvaluated) {
      setIsEvaluated(true);
      setIsCorrectAnswer(false);
      setMatchedWith('');
      SoundService.playWrong();
    }
    setIsFlipped(true);
  };

  const handleCheckAnswer = async () => {
    if (!userInput.trim() || isChecking) return;
    Keyboard.dismiss();
    setIsChecking(true);

    // 1. Direct AI Semantic Evaluation via Gemini
    try {
      const aiResult = await AIService.evaluateWordTranslation(
        cardWord.word,
        cardWord.meaning,
        userInput,
        cardWord.synonyms
      );

      if (aiResult && aiResult.isValid) {
        setIsEvaluated(true);
        setIsCorrectAnswer(true);
        setMatchedWith(aiResult.matchedMeaning || userInput.trim());
        setIsFlipped(true);
        setIsChecking(false);
        SoundService.playCorrect();
        return;
      }
    } catch (err) {
      console.warn('AI evaluation error, checking local fallback:', err);
    }

    // 2. Local fallback check (in case device is offline)
    const localResult = TurengService.checkTurkishAnswer(
      userInput,
      cardWord.word,
      cardWord.meaning,
      turengDetail?.meanings,
      cardWord.synonyms
    );

    if (localResult.isCorrect) {
      setIsEvaluated(true);
      setIsCorrectAnswer(true);
      setMatchedWith(localResult.matchedWith || '');
      setIsFlipped(true);
      setIsChecking(false);
      SoundService.playCorrect();
      return;
    }

    // If both AI and local check reject, mark as incorrect
    setIsEvaluated(true);
    setIsCorrectAnswer(false);
    setMatchedWith('');
    setIsFlipped(true);
    setIsChecking(false);
    SoundService.playWrong();
  };

  const handleProceed = async () => {
    if (isProceeding) return;
    setIsProceeding(true);
    try {
      await Promise.resolve(onAnswer(isCorrectAnswer));
    } catch (err) {
      console.warn('CardComponent handleProceed error:', err);
    } finally {
      setIsProceeding(false);
    }
  };

  const handleSpeak = () => {
    if (!cardWord?.word) return;
    try {
      if (SpeechModule && typeof SpeechModule.speak === 'function') {
        SpeechModule.stop();
        SpeechModule.speak(cardWord.word, {
          language: 'en-US',
          rate: 0.88,
        });
      } else {
        console.warn('Native speech module is not available in this binary build.');
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  };

  const safeSynonyms = React.useMemo(() => {
    if (!cardWord?.synonyms) return [];
    if (Array.isArray(cardWord.synonyms)) return cardWord.synonyms;
    if (typeof cardWord.synonyms === 'string') {
      try {
        const parsed = JSON.parse(cardWord.synonyms);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  }, [cardWord?.synonyms]);

  const validDbSentence = getValidExampleSentence(cardWord?.example_sentence);
  const effectiveExampleEn =
    validDbSentence ||
    enrichedSentence?.en ||
    getValidExampleSentence(turengDetail?.sampleSentenceEn);

  const validDbTr = getValidExampleSentence(cardWord?.example_translation);
  const effectiveExampleTr =
    (validDbSentence ? validDbTr : undefined) ||
    enrichedSentence?.tr ||
    getValidExampleSentence(turengDetail?.sampleSentenceTr);

  return (
    <View style={[styles.container, isKeyboardVisible && styles.containerKeyboardOpen]}>
      {/* FLASH WRAP */}
      <View
        style={[
          styles.flashWrap,
          isKeyboardVisible
            ? styles.flashWrapCompact
            : !isFlipped
            ? styles.flashWrapStandard
            : styles.flashWrapFlipped,
        ]}
      >
        <Pressable
          style={[
            styles.flashCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            !isFlipped
              ? isKeyboardVisible
                ? styles.flashCardCompact
                : styles.flashCardStandard
              : styles.flashCardFlipped,
          ]}
          onPress={handleFlipCard}
        >
          {!isFlipped ? (
            /* FRONT FACE (ENGLISH & YDS BADGE) */
            <View
              style={[
                styles.flashFront,
                { backgroundColor: colors.cardBackground },
                isKeyboardVisible && styles.flashFrontCompact,
              ]}
            >
              <View style={styles.frontTopRow}>
                <View style={[styles.levelBadge, { backgroundColor: colors.brandLight }]}>
                  <Text style={[styles.levelBadgeText, { color: colors.brand }]}>{cardWord.level || 'B2 / C1'}</Text>
                </View>
                <View
                  style={[
                    styles.cardTypeBadge,
                    cardWord.cardType === 'REVIEW'
                      ? { backgroundColor: colors.accentWarmLight }
                      : { backgroundColor: colors.brandLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardTypeBadgeText,
                      cardWord.cardType === 'REVIEW'
                        ? { color: colors.accentWarm, fontWeight: '800' }
                        : { color: colors.brand, fontWeight: '800' },
                    ]}
                  >
                    {cardWord.reviewBadgeText || (cardWord.cardType === 'REVIEW' ? '🔄 Aralıklı Tekrar' : '✨ Günün Yeni Kelimesi')}
                  </Text>
                </View>
              </View>

              <View style={[styles.wordCenterBox, isKeyboardVisible && styles.wordCenterBoxCompact]}>
                <View style={styles.wordAudioRow}>
                  <Text
                    style={[
                      styles.flashWord,
                      { color: colors.text, fontFamily: dynamicFontFamily },
                      isKeyboardVisible && styles.flashWordCompact,
                    ]}
                  >
                    {cardWord.word}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSpeak();
                    }}
                    style={[styles.audioBtn, { backgroundColor: colors.brandLight }]}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                  >
                    <Volume2 size={isKeyboardVisible ? 20 : 24} color={colors.brand} />
                  </TouchableOpacity>
                </View>
                {(cardWord.etymology_note || turengDetail?.phonetic) && !isKeyboardVisible ? (
                  <Text style={[styles.flashPhon, { color: colors.textSecondary }]}>
                    {cardWord.etymology_note || turengDetail?.phonetic}
                  </Text>
                ) : null}
              </View>

              {!isKeyboardVisible ? (
                <View style={styles.bottomHintBox}>
                  <Text style={[styles.cardTapHint, { color: colors.textSecondary }]}>👆 Anlamı görmek için karta dokun</Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* BACK FACE (ACADEMIC DEFINITIONS & EXAMPLES) */
            <View style={[styles.flashBack, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.fbHeaderRow}>
                <View style={styles.fbWordAudioRow}>
                  <Text style={[styles.fbWordTitle, { color: colors.text, fontFamily: dynamicFontFamily }]}>{cardWord.word}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSpeak();
                    }}
                    style={[styles.audioBtnSmall, { backgroundColor: colors.brandLight }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Volume2 size={16} color={colors.brand} />
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.cardTypeBadge,
                    cardWord.cardType === 'REVIEW'
                      ? { backgroundColor: colors.accentWarmLight }
                      : { backgroundColor: colors.brandLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardTypeBadgeText,
                      cardWord.cardType === 'REVIEW'
                        ? { color: colors.accentWarm, fontWeight: '800' }
                        : { color: colors.brand, fontWeight: '800' },
                    ]}
                  >
                    {cardWord.reviewBadgeText ? `${cardWord.reviewBadgeText}` : (cardWord.cardType === 'REVIEW' ? '🔄 Tekrar' : '✨ Kelime Anlamı')}
                  </Text>
                </View>
              </View>

              <Text style={[
                styles.fbTr,
                {
                  color: colors.text,
                  fontFamily: dynamicFontFamily,
                  fontSize: Math.round(dynamicFontSize * 1.25),
                }
              ]}>
                {cardWord.meaning}
              </Text>

              {/* Category Tags & Meanings */}
              {turengDetail?.meanings && turengDetail.meanings.length > 0 && (
                <View style={[styles.categoriesWrap, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                  {turengDetail.meanings.slice(0, 3).map((item, idx) => (
                    <View key={idx} style={styles.catRow}>
                      <Text style={[styles.catTag, { color: colors.brand }]}>[{item.category}]</Text>
                      <Text style={[styles.catMeaning, { color: colors.text, fontFamily: dynamicFontFamily }]}>{item.turkish}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Synonyms */}
              {safeSynonyms.length > 0 && (
                <View style={styles.fbSynRow}>
                  {safeSynonyms.map((syn, idx) => (
                    <View key={idx} style={[styles.fbSyn, { backgroundColor: colors.subtleBackground }]}>
                      <Text style={[styles.fbSynText, { color: colors.brand }]}>{syn}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Example Sentence Context Box */}
              {effectiveExampleEn ? (
                <View style={[styles.fbEx, { backgroundColor: colors.subtleBackground, borderLeftColor: colors.brand }]}>
                  <Text style={[styles.fbExEn, { color: colors.text, fontFamily: dynamicFontFamily }]}>
                    {effectiveExampleEn}
                  </Text>
                  {effectiveExampleTr ? (
                    <Text style={[styles.fbExTr, { color: colors.textSecondary }]}>
                      {effectiveExampleTr}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          )}
        </Pressable>
      </View>

      {/* INTERACTIVE TEXT INPUT / EVALUATION AREA */}
      {!isEvaluated ? (
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Türkçe karşılığını yazın..."
              placeholderTextColor={colors.textSecondary}
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={handleCheckAnswer}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              editable={!isChecking}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.brand },
                (!userInput.trim() || isChecking) && styles.submitBtnDisabled,
              ]}
              disabled={!userInput.trim() || isChecking}
              onPress={handleCheckAnswer}
              activeOpacity={0.8}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color={colors.textOnBrand} />
              ) : (
                <Text style={[styles.submitBtnText, { color: colors.textOnBrand }]}>Kontrol Et</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* EVALUATION FEEDBACK & NEXT BUTTON (Duolingo Style Cohesive Result Sheet) */
        <View style={styles.feedbackContainer}>
          {isCorrectAnswer ? (
            <View style={[styles.feedbackSuccess, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
              <View style={[styles.feedbackIconBadge, { backgroundColor: colors.success }]}>
                <CheckCircle2 size={20} color={colors.textOnBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackSuccessTitle, { color: colors.success }]}>Harika! Doğru Bildiniz 🎉</Text>
                {matchedWith ? (
                  <Text style={[styles.feedbackSub, { color: colors.textSecondary }]}>
                    Eşleşen karşılık: <Text style={{ fontWeight: '700', color: colors.text }}>{matchedWith}</Text>
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={[styles.feedbackFail, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
              <View style={[styles.feedbackIconBadge, { backgroundColor: colors.error }]}>
                <XCircle size={20} color={colors.textOnBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackFailTitle, { color: colors.error }]}>Tekrar Havuzuna Eklendi</Text>
                {userInput.trim() ? (
                  <Text style={[styles.feedbackUserAnswer, { color: colors.textSecondary }]}>
                    Yazdığın: <Text style={{ textDecorationLine: 'line-through' }}>{userInput.trim()}</Text>
                  </Text>
                ) : null}
                <Text style={[styles.feedbackSub, { color: colors.text }]}>
                  Doğru karşılık: <Text style={{ fontWeight: '800', color: colors.text }}>{cardWord.meaning}</Text>
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.proceedBtn,
              { backgroundColor: colors.brand },
              isProceeding && { opacity: 0.8 },
            ]}
            onPress={handleProceed}
            disabled={isProceeding}
            activeOpacity={0.85}
          >
            {isProceeding ? (
              <ActivityIndicator size="small" color={colors.textOnBrand} />
            ) : (
              <>
                <Text style={[styles.proceedBtnText, { color: colors.textOnBrand }]}>
                  {totalCards > 0 && cardIndex >= totalCards - 1 ? 'Tamamla' : 'Sonraki Kelimeye Geç'}
                </Text>
                {totalCards > 0 && cardIndex >= totalCards - 1 ? (
                  <CheckCircle2 size={18} color={colors.textOnBrand} />
                ) : (
                  <ArrowRight size={18} color={colors.textOnBrand} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  containerKeyboardOpen: {
    justifyContent: 'flex-start',
  },
  flashWrap: {
    width: '100%',
  },
  flashWrapCompact: {
    minHeight: 120,
    marginBottom: 8,
  },
  flashWrapStandard: {
    minHeight: 180,
    marginBottom: 14,
  },
  flashWrapFlipped: {
    minHeight: 160,
    marginBottom: 14,
  },
  flashCard: {
    width: '100%',
    borderRadius: Platform.select({ ios: 22, android: 16 }),
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  flashCardCompact: {
    minHeight: 120,
  },
  flashCardStandard: {
    minHeight: 180,
  },
  flashCardFlipped: {
    minHeight: 160,
  },
  flashFront: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 180,
  },
  flashFrontCompact: {
    minHeight: 130,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  frontTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Platform.select({ ios: 10, android: 8 }),
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Platform.select({ ios: 10, android: 8 }),
  },
  cardTypeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  wordCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 26,
  },
  wordCenterBoxCompact: {
    marginVertical: 4,
  },
  wordAudioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 6,
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashWord: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  flashWordCompact: {
    fontSize: 26,
    lineHeight: 30,
  },
  flashPhon: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomHintBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  cardTapHint: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  flashBack: {
    padding: 18,
    justifyContent: 'flex-start',
    gap: 8,
    minHeight: 160,
  },
  fbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fbWordAudioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbWordTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  fbTr: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginVertical: 4,
  },
  categoriesWrap: {
    padding: 10,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catTag: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  catMeaning: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fbSynRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  fbSyn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fbSynText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fbEx: {
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3.5,
    marginTop: 8,
  },
  fbExEn: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  fbExTr: {
    fontSize: 12,
    marginTop: 4,
  },
  // Input Area Styles
  inputContainer: {
    width: '100%',
    marginTop: 12,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.2,
    borderRadius: Platform.select({ ios: 18, android: 14 }),
    padding: 6,
    paddingLeft: 18,
    minHeight: 56,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
  },
  submitBtn: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: Platform.select({ ios: 14, android: 10 }),
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  giveUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  giveUpBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Feedback Styles
  feedbackContainer: {
    width: '100%',
    marginTop: 12,
    gap: 14,
  },
  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.2,
    padding: 14,
    borderRadius: Platform.select({ ios: 16, android: 12 }),
  },
  feedbackSuccessTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  feedbackFail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.2,
    padding: 14,
    borderRadius: Platform.select({ ios: 16, android: 12 }),
  },
  feedbackIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackFailTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  feedbackUserAnswer: {
    fontSize: 12.5,
    marginTop: 2,
    marginBottom: 2,
  },
  feedbackSub: {
    fontSize: 13,
    marginTop: 3,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: Platform.select({ ios: 18, android: 14 }),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  proceedBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
