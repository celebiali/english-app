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
} from 'react-native';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react-native';
import { CardWord } from '../types';
import { TurengService, TurengWordDetail } from '../services/TurengService';
import { AIService } from '../services/AIService';
import { useThemeStore } from '../store/useThemeStore';

export interface CardComponentProps {
  cardWord: CardWord;
  onAnswer: (isCorrect: boolean) => void;
  cardIndex: number;
  totalCards: number;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  cardWord,
  onAnswer,
}) => {
  const { colors } = useThemeStore();
  const [userInput, setUserInput] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [matchedWith, setMatchedWith] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [turengDetail, setTurengDetail] = useState<TurengWordDetail | null>(null);

  // When word changes, reset input and fetch Tureng details
  useEffect(() => {
    setUserInput('');
    setIsChecking(false);
    setIsEvaluated(false);
    setIsCorrectAnswer(false);
    setIsFlipped(false);
    setMatchedWith('');

    // Fetch Tureng data
    TurengService.lookupWord(cardWord.word)
      .then((detail) => {
        setTurengDetail(detail);
      })
      .finally(() => {});
  }, [cardWord.id]);

  // Flipping the card means the user couldn't remember without looking -> Treat as Hatırlayamadım (incorrect)
  const handleFlipCard = () => {
    Keyboard.dismiss();
    if (!isEvaluated) {
      setIsEvaluated(true);
      setIsCorrectAnswer(false);
      setMatchedWith('');
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
      return;
    }

    // If both AI and local check reject, mark as incorrect
    setIsEvaluated(true);
    setIsCorrectAnswer(false);
    setMatchedWith('');
    setIsFlipped(true);
    setIsChecking(false);
  };

  const handleProceed = () => {
    onAnswer(isCorrectAnswer);
  };

  return (
    <View style={styles.container}>
      {/* FLASH WRAP */}
      <View style={styles.flashWrap}>
        <Pressable
          style={[styles.flashCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={handleFlipCard}
        >
          {!isFlipped ? (
            /* FRONT FACE (ENGLISH & YDS BADGE) */
            <View style={[styles.flashFront, { backgroundColor: colors.cardBackground }]}>
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
                    {cardWord.cardType === 'REVIEW' ? '🔄 Dünden Tekrar' : '✨ Günün Yeni Kelimesi'}
                  </Text>
                </View>
              </View>

              <View style={styles.wordCenterBox}>
                <Text style={[styles.flashWord, { color: colors.text }]}>{cardWord.word}</Text>
                <Text style={[styles.flashPhon, { color: colors.textSecondary }]}>
                  {cardWord.etymology_note || turengDetail?.phonetic || 'akademik kelime'}
                </Text>
              </View>

              <View style={styles.bottomHintBox}>
                <Text style={[styles.cardTapHint, { color: colors.textSecondary }]}>👆 Anlamı görmek için karta dokun</Text>
              </View>
            </View>
          ) : (
            /* BACK FACE (ACADEMIC DEFINITIONS & EXAMPLES) */
            <View style={[styles.flashBack, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.fbHeaderRow}>
                <Text style={[styles.fbWordTitle, { color: colors.text }]}>{cardWord.word}</Text>
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
                    {cardWord.cardType === 'REVIEW' ? '🔄 Günlük Tekrar' : '✨ Kelime Anlamı'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.fbTr, { color: colors.text }]}>{cardWord.meaning}</Text>

              {/* Category Tags & Meanings */}
              {turengDetail?.meanings && turengDetail.meanings.length > 0 && (
                <View style={[styles.categoriesWrap, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
                  {turengDetail.meanings.slice(0, 3).map((item, idx) => (
                    <View key={idx} style={styles.catRow}>
                      <Text style={[styles.catTag, { color: colors.brand }]}>[{item.category}]</Text>
                      <Text style={[styles.catMeaning, { color: colors.text }]}>{item.turkish}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Synonyms */}
              {cardWord.synonyms && cardWord.synonyms.length > 0 && (
                <View style={styles.fbSynRow}>
                  {cardWord.synonyms.map((syn, idx) => (
                    <View key={idx} style={[styles.fbSyn, { backgroundColor: colors.subtleBackground }]}>
                      <Text style={[styles.fbSynText, { color: colors.brand }]}>{syn}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Example Sentence */}
              {cardWord.example_sentence && (
                <View style={[styles.fbEx, { backgroundColor: colors.subtleBackground, borderLeftColor: colors.brand }]}>
                  <Text style={[styles.fbExEn, { color: colors.text }]}>"{cardWord.example_sentence}"</Text>
                  {cardWord.example_translation && (
                    <Text style={[styles.fbExTr, { color: colors.textSecondary }]}>{cardWord.example_translation}</Text>
                  )}
                </View>
              )}
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
        /* EVALUATION FEEDBACK & NEXT BUTTON */
        <View style={styles.feedbackContainer}>
          {isCorrectAnswer ? (
            <View style={[styles.feedbackSuccess, { backgroundColor: colors.successLight, borderColor: colors.successLight }]}>
              <CheckCircle2 size={22} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackSuccessTitle, { color: colors.success }]}>Tebrikler! Doğru Bildiniz</Text>
                {matchedWith ? (
                  <Text style={[styles.feedbackSub, { color: colors.textSecondary }]}>Eşleşen anlam: {matchedWith}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={[styles.feedbackFail, { backgroundColor: colors.errorLight, borderColor: colors.errorLight }]}>
              <XCircle size={22} color={colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackFailTitle, { color: colors.error }]}>Tekrar Edilecek</Text>
                <Text style={[styles.feedbackSub, { color: colors.textSecondary }]}>Doğru anlam: {cardWord.meaning}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.proceedBtn, { backgroundColor: colors.brand }]}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={[styles.proceedBtnText, { color: colors.textOnBrand }]}>Sonraki Kelimeye Geç</Text>
            <ArrowRight size={18} color={colors.textOnBrand} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
  },
  flashWrap: {
    width: '100%',
    height: 330,
    marginBottom: 14,
  },
  flashCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  flashFront: {
    flex: 1,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frontTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTypeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  wordCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  flashWord: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  flashPhon: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomHintBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cardTapHint: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  flashBack: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  fbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fbWordTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  fbTr: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginVertical: 4,
  },
  categoriesWrap: {
    padding: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catTag: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  catMeaning: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  fbSynRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  fbSyn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fbSynText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fbEx: {
    borderRadius: 10,
    padding: 8,
    borderLeftWidth: 3,
  },
  fbExEn: {
    fontSize: 11.5,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  fbExTr: {
    fontSize: 11,
    marginTop: 2,
  },
  // Input Area Styles
  inputContainer: {
    width: '100%',
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.6,
    borderRadius: 16,
    padding: 6,
    paddingLeft: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 8,
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 13,
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
    gap: 10,
  },
  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.4,
    padding: 12,
    borderRadius: 14,
  },
  feedbackSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackFail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.4,
    padding: 12,
    borderRadius: 14,
  },
  feedbackFailTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  proceedBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
});
