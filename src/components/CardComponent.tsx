import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { CardWord } from '../types';
import { checkAnswerCorrectness } from '../utils/textMatcher';

export interface CardComponentProps {
  cardWord: CardWord;
  onAnswer: (isCorrect: boolean) => void;
  cardIndex: number;
  totalCards: number;
}

const { width } = Dimensions.get('window');

export const CardComponent: React.FC<CardComponentProps> = ({
  cardWord,
  onAnswer,
  cardIndex,
  totalCards,
}: CardComponentProps) => {
  const [userInput, setUserInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrectResult, setIsCorrectResult] = useState<boolean | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  // Reset input and state when card changes
  useEffect(() => {
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrectResult(null);
    setIsFlipped(false);
    flipAnimation.setValue(0);
  }, [cardWord.id]);

  const flipCard = (toFlipped: boolean) => {
    if (toFlipped) {
      Animated.timing(flipAnimation, {
        toValue: 180,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    } else {
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Evaluate typed answer
  const handleSubmitAnswer = () => {
    if (isSubmitted) return;

    const isMatch = checkAnswerCorrectness(
      userInput,
      cardWord.meaning,
      cardWord.synonyms
    );

    setIsCorrectResult(isMatch);
    setIsSubmitted(true);
    flipCard(true); // Automatically reveal meaning & details on back of card
  };

  // Skip / I don't know
  const handleSkip = () => {
    if (isSubmitted) return;

    setIsCorrectResult(false);
    setIsSubmitted(true);
    flipCard(true);
  };

  // Move to next card
  const handleProceedNext = () => {
    if (isCorrectResult !== null) {
      onAnswer(isCorrectResult);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.cardHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{cardWord.level}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{cardWord.category}</Text>
        </View>
        <Text style={styles.counterText}>
          {cardIndex + 1} / {totalCards}
        </Text>
      </View>

      {/* Flip Card Deck */}
      <View style={styles.cardWrapper}>
        {/* FRONT SIDE */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            frontAnimatedStyle,
            isFlipped ? styles.hiddenFace : null,
          ]}
        >
          <Text style={styles.subcategoryText}>
            {cardWord.subcategory || 'YDS KELİME KARTI'}
          </Text>

          <Text style={styles.wordTitle}>{cardWord.word}</Text>

          {cardWord.etymology_note && (
            <View style={styles.etymologyChip}>
              <Text style={styles.etymologyText}>
                {cardWord.etymology_note}
              </Text>
            </View>
          )}

          {/* User Input Section */}
          {!isSubmitted ? (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Türkçe karşılığını yazın..."
                placeholderTextColor="#94A3B8"
                value={userInput}
                onChangeText={setUserInput}
                onSubmitEditing={handleSubmitAnswer}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />

              <View style={styles.inputButtonsRow}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipButtonText}>Bilemiyorum</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !userInput.trim() && styles.disabledButton,
                  ]}
                  onPress={handleSubmitAnswer}
                  disabled={!userInput.trim()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submitButtonText}>Kontrol Et</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* BACK SIDE (Result & Details) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            !isFlipped ? styles.hiddenFace : null,
            isCorrectResult === true
              ? styles.correctCardBorder
              : styles.wrongCardBorder,
          ]}
        >
          {/* Answer Feedback Header */}
          <View
            style={[
              styles.feedbackBanner,
              isCorrectResult === true
                ? styles.correctBanner
                : styles.wrongBanner,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                isCorrectResult === true
                  ? styles.correctFeedbackText
                  : styles.wrongFeedbackText,
              ]}
            >
              {isCorrectResult === true
                ? 'Tebrikler! Doğru Bildiniz'
                : 'Yanlış / Bilemediniz'}
            </Text>
          </View>

          <Text style={styles.meaningTitle}>{cardWord.meaning}</Text>

          {cardWord.synonyms && cardWord.synonyms.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Eş Anlamlılar</Text>
              <View style={styles.synonymChipsRow}>
                {cardWord.synonyms.map((syn: string, idx: number) => (
                  <View key={idx} style={styles.synonymChip}>
                    <Text style={styles.synonymText}>{syn}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {cardWord.example_sentence && (
            <View style={styles.exampleContainer}>
              <Text style={styles.sectionHeader}>YDS Örnek Cümle</Text>
              <Text style={styles.exampleSentence}>
                "{cardWord.example_sentence}"
              </Text>
              {cardWord.example_translation && (
                <Text style={styles.exampleTranslation}>
                  {cardWord.example_translation}
                </Text>
              )}
            </View>
          )}

          {/* Next Word Button */}
          <TouchableOpacity
            style={[
              styles.nextWordButton,
              isCorrectResult === true
                ? styles.correctNextButton
                : styles.wrongNextButton,
            ]}
            onPress={handleProceedNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextWordButtonText}>
              {isCorrectResult === true
                ? 'Sıradaki Kelime (Haftalık Kutuya Taşı)'
                : 'Sıradaki Kelime (24h Tekrar Havuzuna Al)'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: 'center',
    marginVertical: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  levelBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBadgeText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 11,
  },
  counterText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  cardWrapper: {
    height: 380,
    width: '100%',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  hiddenFace: {
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  correctCardBorder: {
    borderColor: '#86EFAC',
  },
  wrongCardBorder: {
    borderColor: '#FCA5A5',
  },
  subcategoryText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  wordTitle: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 12,
    letterSpacing: -0.5,
  },
  etymologyChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '92%',
    marginBottom: 8,
  },
  etymologyText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1.2,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackBanner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  correctBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  wrongBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '700',
  },
  correctFeedbackText: {
    color: '#16A34A',
  },
  wrongFeedbackText: {
    color: '#DC2626',
  },
  meaningTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  synonymChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  synonymChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  synonymText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
  },
  exampleContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exampleSentence: {
    color: '#1E293B',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  exampleTranslation: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  nextWordButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  correctNextButton: {
    backgroundColor: '#16A34A',
  },
  wrongNextButton: {
    backgroundColor: '#DC2626',
  },
  nextWordButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
