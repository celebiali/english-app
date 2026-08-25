import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, HelpCircle, BookOpen } from 'lucide-react-native';
import { CardWord } from '../types';
import { TurengService, TurengWordDetail } from '../services/TurengService';

export interface CardComponentProps {
  cardWord: CardWord;
  onAnswer: (isCorrect: boolean) => void;
  cardIndex: number;
  totalCards: number;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  cardWord,
  onAnswer,
  cardIndex,
  totalCards,
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [matchedWith, setMatchedWith] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [turengDetail, setTurengDetail] = useState<TurengWordDetail | null>(null);
  const [isLoadingTureng, setIsLoadingTureng] = useState<boolean>(false);

  // When word changes, reset input and fetch Tureng details
  useEffect(() => {
    setUserInput('');
    setIsEvaluated(false);
    setIsCorrectAnswer(false);
    setIsFlipped(false);
    setMatchedWith('');

    // Fetch Tureng data
    setIsLoadingTureng(true);
    TurengService.lookupWord(cardWord.word)
      .then((detail) => {
        setTurengDetail(detail);
      })
      .finally(() => {
        setIsLoadingTureng(false);
      });
  }, [cardWord.id]);

  const handleCheckAnswer = () => {
    Keyboard.dismiss();
    const result = TurengService.checkTurkishAnswer(
      userInput,
      cardWord.meaning,
      turengDetail?.meanings,
      cardWord.synonyms
    );

    setIsEvaluated(true);
    setIsCorrectAnswer(result.isCorrect);
    setMatchedWith(result.matchedWith || '');
    setIsFlipped(true); // Automatically reveal Tureng definition
  };

  const handleGiveUp = () => {
    Keyboard.dismiss();
    setIsEvaluated(true);
    setIsCorrectAnswer(false);
    setIsFlipped(true);
  };

  const handleProceed = () => {
    onAnswer(isCorrectAnswer);
  };

  return (
    <View style={styles.container}>
      {/* SCREEN 5: FLASH WRAP */}
      <View style={styles.flashWrap}>
        <Pressable
          style={styles.flashCard}
          onPress={() => setIsFlipped(!isFlipped)}
        >
          {!isFlipped ? (
            /* FRONT FACE (ENGLISH & YDS BADGE) */
            <View style={styles.flashFront}>
              <View style={styles.frontTopRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{cardWord.level || 'B2 / C1'}</Text>
                </View>
                <View style={styles.turengBadge}>
                  <BookOpen size={12} color="#FFFFFF" />
                  <Text style={styles.turengBadgeText}>Tureng Sözlük</Text>
                </View>
              </View>

              <Text style={styles.flashWord}>{cardWord.word}</Text>

              <Text style={styles.flashPhon}>
                {turengDetail?.phonetic || cardWord.etymology_note || 'akademik kelime'}
              </Text>

              <View style={styles.inputPromptBox}>
                <Text style={styles.inputPromptText}>
                  ✍️ Türkçe karşılığını aşağıdaki kutucuğa yazın:
                </Text>
              </View>
            </View>
          ) : (
            /* BACK FACE (TURENG ACADEMIC DEFINITIONS) */
            <View style={styles.flashBack}>
              <View style={styles.fbHeaderRow}>
                <Text style={styles.fbWordTitle}>{cardWord.word}</Text>
                <View style={styles.turengBadgeDark}>
                  <Text style={styles.turengBadgeDarkText}>Tureng Karşılıkları</Text>
                </View>
              </View>

              <Text style={styles.fbTr}>{cardWord.meaning}</Text>

              {/* Tureng Category Tags */}
              {turengDetail?.meanings && turengDetail.meanings.length > 0 && (
                <View style={styles.turengCategoriesWrap}>
                  {turengDetail.meanings.slice(0, 3).map((item, idx) => (
                    <View key={idx} style={styles.turengCatRow}>
                      <Text style={styles.turengCatTag}>[{item.category}]</Text>
                      <Text style={styles.turengCatMeaning}>{item.turkish}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Synonyms */}
              {cardWord.synonyms && cardWord.synonyms.length > 0 && (
                <View style={styles.fbSynRow}>
                  {cardWord.synonyms.map((syn, idx) => (
                    <View key={idx} style={styles.fbSyn}>
                      <Text style={styles.fbSynText}>{syn}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Example Sentence */}
              {cardWord.example_sentence && (
                <View style={styles.fbEx}>
                  <Text style={styles.fbExEn}>"{cardWord.example_sentence}"</Text>
                  {cardWord.example_translation && (
                    <Text style={styles.fbExTr}>{cardWord.example_translation}</Text>
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
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Türkçe anlamını yazın (örn: kötüleşmek)..."
              placeholderTextColor="#94A3B8"
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={handleCheckAnswer}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                !userInput.trim() && styles.submitBtnDisabled,
              ]}
              disabled={!userInput.trim()}
              onPress={handleCheckAnswer}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Kontrol Et</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.giveUpBtn}
            onPress={handleGiveUp}
            activeOpacity={0.7}
          >
            <HelpCircle size={14} color="#64748B" />
            <Text style={styles.giveUpBtnText}>Anlamı Göster / Hatırlamıyorum</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* EVALUATION FEEDBACK & NEXT BUTTON */
        <View style={styles.feedbackContainer}>
          {isCorrectAnswer ? (
            <View style={styles.feedbackSuccess}>
              <CheckCircle2 size={22} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackSuccessTitle}>Tebrikler! Doğru Bildiniz</Text>
                {matchedWith ? (
                  <Text style={styles.feedbackSub}>Tureng eşleşmesi: {matchedWith}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.feedbackFail}>
              <XCircle size={22} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackFailTitle}>Tekrar Edilecek</Text>
                <Text style={styles.feedbackSub}>Doğru anlam: {cardWord.meaning}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedBtnText}>Sonraki Kelimeye Geç</Text>
            <ArrowRight size={18} color="#FFFFFF" />
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
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 5,
  },
  flashFront: {
    flex: 1,
    backgroundColor: '#3730A3',
    padding: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  turengBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  turengBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  flashWord: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  flashPhon: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
  },
  inputPromptBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  inputPromptText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  flashBack: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E7EAF3',
    borderRadius: 26,
  },
  fbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fbWordTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  turengBadgeDark: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  turengBadgeDarkText: {
    color: '#4F46E5',
    fontSize: 10.5,
    fontWeight: '800',
  },
  fbTr: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 26,
    marginVertical: 4,
  },
  turengCategoriesWrap: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E7EAF3',
  },
  turengCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turengCatTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  turengCatMeaning: {
    fontSize: 12,
    color: '#334155',
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
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fbSynText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  fbEx: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  fbExEn: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#1E293B',
    lineHeight: 16,
  },
  fbExTr: {
    fontSize: 10.5,
    color: '#64748B',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: '#E7EAF3',
    borderRadius: 16,
    padding: 6,
    paddingLeft: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 8,
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#FFFFFF',
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
    color: '#64748B',
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
    backgroundColor: '#ECFDF5',
    borderWidth: 1.4,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 14,
  },
  feedbackSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  feedbackFail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.4,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 14,
  },
  feedbackFailTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  feedbackSub: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 1,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
