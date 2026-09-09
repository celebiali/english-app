import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Volume2, Mic, Star } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { WordWithProgress } from '../database/DatabaseService';
import { CardWord } from '../types';
import { getContextImageForWord } from '../services/vocabLearnMatchData';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LearnMatchWordCard: React.FC<LearnMatchWordCardProps> = ({
  word,
  currentIndex,
  totalCards,
  onNext,
  onPrev,
  onClose,
  onToggleLearned,
  nextButtonText,
}) => {
  const { colors } = useThemeStore();

  const handleSpeak = () => {
    try {
      if (SpeechModule && typeof SpeechModule.speak === 'function') {
        SpeechModule.stop();
        SpeechModule.speak(word.word, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.88,
        });
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  };

  const progressPercent = totalCards > 0 ? Math.min(100, Math.round(((currentIndex + 1) / totalCards) * 100)) : 0;
  const imageUrl = getContextImageForWord(word.word, word.id);

  // Render underlined English sentence if sentence contains the target word
  const renderFormattedSentence = () => {
    if (!word.example_sentence) return null;

    const sentence = word.example_sentence;
    const cleanTarget = word.word.replace(/^\(to\)\s*/i, '').trim();
    const regex = new RegExp(`(${cleanTarget})`, 'gi');
    const parts = sentence.split(regex);

    return (
      <Text style={[styles.exampleSentenceText, { color: colors.textSecondary }]}>
        {parts.map((part, i) => {
          if (part.toLowerCase() === cleanTarget.toLowerCase()) {
            return (
              <Text
                key={i}
                style={[
                  styles.underlinedWord,
                  { color: colors.text, textDecorationColor: colors.brand },
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
          {/* Target Word */}
          <Text style={[styles.targetWordText, { color: colors.brand }]} numberOfLines={2}>
            {word.word}
          </Text>

          {/* English Example Sentence */}
          {word.example_sentence ? (
            <View style={styles.sentenceWrapper}>{renderFormattedSentence()}</View>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Turkish Meaning */}
          <Text style={[styles.turkishMeaningText, { color: colors.text }]} numberOfLines={2}>
            {word.meaning}
          </Text>

          {/* Turkish Sentence Translation */}
          {word.example_translation ? (
            <Text style={[styles.turkishSentenceText, { color: colors.textSecondary }]}>
              {word.example_translation}
            </Text>
          ) : null}

          {/* Illustrative Context Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.illustrativeImage}
              resizeMode="cover"
            />
          </View>

          {/* Sound & Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.audioBtn, { backgroundColor: colors.brand }]}
              onPress={handleSpeak}
              activeOpacity={0.8}
              accessibilityLabel="Telaffuzu Dinle"
            >
              <Volume2 size={24} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.micBtn,
                {
                  backgroundColor: colors.subtleBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                if (onToggleLearned) onToggleLearned(word);
              }}
              activeOpacity={0.8}
              accessibilityLabel="Öğrenildi Olarak İşaretle"
            >
              <Star
                size={22}
                color={
                  (('box' in word && (word.box || 0) >= 2) ||
                    ('progress' in word && (word.progress?.box || 0) >= 2))
                    ? '#EAB308'
                    : colors.textSecondary
                }
                fill={
                  (('box' in word && (word.box || 0) >= 2) ||
                    ('progress' in word && (word.progress?.box || 0) >= 2))
                    ? '#EAB308'
                    : 'none'
                }
              />
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  targetWordText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 8,
  },
  sentenceWrapper: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  exampleSentenceText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  underlinedWord: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 14,
  },
  turkishMeaningText: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  turkishSentenceText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: 12,
  },
  illustrativeImage: {
    width: '100%',
    height: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  audioBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 54,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
