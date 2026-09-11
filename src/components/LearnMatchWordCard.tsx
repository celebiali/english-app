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
import { X, Volume2 } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { WordWithProgress } from '../database/DatabaseService';
import { CardWord } from '../types';
import { DictionaryApiService } from '../services/DictionaryApiService';

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
  const { colors } = useThemeStore();

  const [enrichedDetail, setEnrichedDetail] = useState<{
    phonetic?: string;
    exampleEn?: string;
    exampleTr?: string;
  } | null>(null);
  const [isLoadingSentence, setIsLoadingSentence] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // If word doesn't have an example sentence or translation, asynchronously fetch from Dictionary API
    if (!word.example_sentence || !word.example_translation) {
      setIsLoadingSentence(true);
      DictionaryApiService.lookupWord(word.word)
        .then((res) => {
          if (isMounted && res) {
            setEnrichedDetail({
              phonetic: res.phonetic,
              exampleEn: res.exampleEn,
              exampleTr: res.exampleTr,
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingSentence(false);
        });
    } else {
      setEnrichedDetail(null);
      setIsLoadingSentence(false);
    }

    return () => {
      isMounted = false;
    };
  }, [word.word, word.example_sentence, word.example_translation]);

  const handleSpeakWord = () => {
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

  // Effective English and Turkish example sentences
  const effectiveExampleEn =
    word.example_sentence ||
    enrichedDetail?.exampleEn ||
    `The ${word.word.toLowerCase()} is widely used in academic texts and daily communication.`;

  const effectiveExampleTr =
    word.example_translation ||
    enrichedDetail?.exampleTr ||
    `"${word.word}" (${word.meaning}), akademik metinlerde ve günlük iletişimde sıkça kullanılır.`;

  const phoneticText = enrichedDetail?.phonetic || '';

  // Render English sentence with target word highlighted
  const renderFormattedSentence = (sentence: string) => {
    if (!sentence) return null;

    const cleanTarget = word.word.replace(/^\(to\)\s*/i, '').trim();
    const regex = new RegExp(`(${cleanTarget})`, 'gi');
    const parts = sentence.split(regex);

    return (
      <Text style={[styles.exampleSentenceText, { color: colors.text }]}>
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
              <Text style={[styles.targetWordText, { color: colors.brand }]} numberOfLines={2}>
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
            <Text style={[styles.turkishMeaningText, { color: colors.text }]}>
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
              <TouchableOpacity
                onPress={() => handleSpeakSentence(effectiveExampleEn)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.sentenceAudioIconBtn}
                accessibilityLabel="Cümleyi Dinle"
              >
                <Volume2 size={16} color={colors.brand} />
              </TouchableOpacity>
            </View>

            {isLoadingSentence ? (
              <View style={styles.sentenceLoadingBox}>
                <ActivityIndicator size="small" color={colors.brand} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Örnek cümle yükleniyor...
                </Text>
              </View>
            ) : (
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

                {/* Sentence Divider */}
                <View style={[styles.sentenceInnerDivider, { backgroundColor: colors.border }]} />

                {/* Turkish Translation */}
                <Text style={[styles.turkishSentenceText, { color: colors.textSecondary }]}>
                  {effectiveExampleTr}
                </Text>
              </View>
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
  sentenceLoadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  sentenceInnerDivider: {
    height: 1,
    marginVertical: 8,
  },
  turkishSentenceText: {
    fontSize: 13.5,
    lineHeight: 20,
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
