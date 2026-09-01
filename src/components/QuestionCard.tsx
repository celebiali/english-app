import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  BookmarkPlus,
  ArrowRight,
} from 'lucide-react-native';
import { QuestionItem, OptionKey } from '../types';
import { CustomWordModal } from './CustomWordModal';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  question: QuestionItem;
  questionIndex?: number;
  totalQuestions?: number;
  mode?: 'PRACTICE' | 'EXAM' | 'REVIEW';
  selectedOption?: OptionKey | null;
  isFlagged?: boolean;
  onSelectOption?: (option: OptionKey) => void;
  onToggleFlag?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export const QuestionCard: React.FC<Props> = ({
  question,
  questionIndex = 0,
  totalQuestions = 1,
  mode = 'PRACTICE',
  selectedOption = null,
  isFlagged = false,
  onSelectOption,
  onToggleFlag,
  onNext,
  hasNext = false,
}) => {
  const [localAnswered, setLocalAnswered] = useState<OptionKey | null>(selectedOption);
  const [isPassageExpanded, setIsPassageExpanded] = useState<boolean>(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState<boolean>(false);
  const [selectedWordForModal, setSelectedWordForModal] = useState<string>('');

  React.useEffect(() => {
    setLocalAnswered(selectedOption);
    setIsPassageExpanded(false);
  }, [question.id, selectedOption]);

  const activeSelected = mode === 'EXAM' || mode === 'REVIEW' ? selectedOption : localAnswered;
  const isAnsweredInPractice = mode === 'PRACTICE' && localAnswered !== null;
  const isReviewMode = mode === 'REVIEW';
  const showSolution = isAnsweredInPractice || isReviewMode;

  const handleOptionPress = (key: OptionKey) => {
    if (mode === 'REVIEW') return;
    if (mode === 'PRACTICE') {
      if (localAnswered !== null) return;
      setLocalAnswered(key);
      onSelectOption?.(key);
    } else {
      onSelectOption?.(key);
    }
  };

  const handleOpenWordModal = (word: string) => {
    setSelectedWordForModal(word);
    setIsAddWordModalOpen(true);
  };

  const optionsList: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];

  // Extract dynamic keywords from question text and subtopic
  const getDynamicKeywords = () => {
    const rawList = [
      question.subtopic?.split(' ')[0],
      'deteriorate',
      'mitigate',
      'precedent',
      'plausible',
    ].filter(Boolean) as string[];
    return Array.from(new Set(rawList)).slice(0, 4);
  };

  const getTypeBadgeLabel = (type: string) => {
    switch (type) {
      case 'PARAGRAPH':
        return 'Paragraf (Reading)';
      case 'CLOZE_TEST':
        return 'Cloze Test';
      case 'SENTENCE_COMPLETION':
        return 'Cümle Tamamlama';
      case 'SKILL_DIALOGUE':
        return 'Diyalog & Skills';
      case 'RESTATEMENT':
        return 'Anlamca En Yakın';
      case 'TRANSLATION':
        return 'Çeviri (Translation)';
      default:
        return 'Kelime & Gramer';
    }
  };

  const { fontSize, isSystemFontSize, fontFamily, colors } = useThemeStore();

  const dynamicFontSize = isSystemFontSize ? 15.5 : fontSize;
  const dynamicFontFamily =
    fontFamily === 'serif' ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : undefined;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* SCREEN 2: Q-META ROW */}
      <View style={styles.qMeta}>
        <View style={[styles.qTopicBadge, { backgroundColor: colors.brandLight }]}>
          <Text style={[styles.qTopicBadgeText, { color: colors.brand }]}>{getTypeBadgeLabel(question.type)}</Text>
        </View>

        <View style={styles.qMetaRight}>
          {totalQuestions > 1 && (
            <Text style={[styles.qCounter, { color: colors.textSecondary }]}>
              Soru {questionIndex + 1} / {totalQuestions}
            </Text>
          )}

          {/* Only allow custom word addition outside strict exam mode */}
          {mode !== 'EXAM' && (
            <TouchableOpacity
              style={[
                styles.addWordQuickBtn,
                { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder },
              ]}
              onPress={() => handleOpenWordModal('')}
              activeOpacity={0.7}
            >
              <BookmarkPlus size={15} color={colors.brand} />
              <Text style={[styles.addWordQuickText, { color: colors.brand }]}>Kelime</Text>
            </TouchableOpacity>
          )}

          {onToggleFlag && (
            <TouchableOpacity
              style={[
                styles.flagBtn,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                isFlagged && { backgroundColor: colors.accentWarmLight, borderColor: colors.accentWarm },
              ]}
              onPress={onToggleFlag}
              activeOpacity={0.7}
            >
              <Text style={styles.flagEmoji}>🚩</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* PASSAGE CARD */}
      {question.passage && (
        <View style={[styles.passageCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.passageHead}>
            <View style={[styles.kicker, { backgroundColor: colors.brand }]}>
              <Text style={[styles.kickerText, { color: colors.textOnBrand }]}>A</Text>
            </View>
            <Text style={[styles.src, { color: colors.textSecondary }]}>Akademik Okuma Metni</Text>
          </View>

          <View style={!isPassageExpanded ? styles.passageFade : undefined}>
            <Text
              style={[
                styles.passageText,
                {
                  color: colors.text,
                  fontSize: Math.max(13, dynamicFontSize - 1),
                  fontFamily: dynamicFontFamily,
                },
              ]}
              numberOfLines={isPassageExpanded ? undefined : 3}
            >
              {question.passage}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.expandToggle}
            onPress={() => setIsPassageExpanded(!isPassageExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.expandLabel, { color: colors.brand }]}>
              {isPassageExpanded ? 'Metni daralt ▴' : 'Metnin tamamını göster ▾'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QUESTION STEM */}
      <Text
        style={[
          styles.qStem,
          {
            color: colors.text,
            fontSize: dynamicFontSize + 0.5,
            fontFamily: dynamicFontFamily,
          },
        ]}
      >
        {question.question_text}
      </Text>

      {/* 5 TACTILE OPTIONS (A, B, C, D, E) */}
      <View style={styles.optList}>
        {optionsList.map((key) => {
          const optionText = question.options[key];
          if (!optionText) return null;

          const isSelected = activeSelected === key;
          const isCorrect = key === question.correct_option;

          let optStyle: any = [styles.opt, { backgroundColor: colors.cardBackground, borderColor: colors.border }];
          let bubStyle: any = [styles.bub, { backgroundColor: colors.subtleBackground, borderColor: colors.border }];
          let bubTextStyle: any = [styles.bubText, { color: colors.textSecondary }];
          let txtStyle: any = [
            styles.txt,
            {
              color: colors.text,
              fontSize: Math.max(12.5, dynamicFontSize - 1.5),
              fontFamily: dynamicFontFamily,
            },
          ];

          if (isReviewMode) {
            if (isCorrect) {
              optStyle = [styles.opt, { borderColor: colors.success, backgroundColor: colors.successLight }];
              bubStyle = [styles.bub, { backgroundColor: colors.success, borderColor: colors.success }];
              bubTextStyle = [styles.bubText, { color: colors.textOnBrand }];
            } else if (isSelected && !isCorrect) {
              optStyle = [styles.opt, { borderColor: colors.error, backgroundColor: colors.errorLight }];
              bubStyle = [styles.bub, { backgroundColor: colors.error, borderColor: colors.error }];
              bubTextStyle = [styles.bubText, { color: colors.textOnBrand }];
            }
          } else if (mode === 'PRACTICE' && isAnsweredInPractice) {
            if (isCorrect) {
              optStyle = [styles.opt, { borderColor: colors.success, backgroundColor: colors.successLight }];
              bubStyle = [styles.bub, { backgroundColor: colors.success, borderColor: colors.success }];
              bubTextStyle = [styles.bubText, { color: colors.textOnBrand }];
            } else if (isSelected && !isCorrect) {
              optStyle = [styles.opt, { borderColor: colors.error, backgroundColor: colors.errorLight }];
              bubStyle = [styles.bub, { backgroundColor: colors.error, borderColor: colors.error }];
              bubTextStyle = [styles.bubText, { color: colors.textOnBrand }];
            }
          } else if (isSelected) {
            optStyle = [styles.opt, { borderColor: colors.brand, backgroundColor: colors.brandLight }];
            bubStyle = [styles.bub, { backgroundColor: colors.brand, borderColor: colors.brand }];
            bubTextStyle = [styles.bubText, { color: colors.textOnBrand }];
          }

          return (
            <TouchableOpacity
              key={key}
              style={optStyle}
              onPress={() => handleOptionPress(key)}
              activeOpacity={0.7}
              disabled={isReviewMode}
            >
              <View style={bubStyle}>
                <Text style={bubTextStyle}>{key}</Text>
              </View>

              <Text style={txtStyle}>{optionText}</Text>

              {/* Status Mark in Practice / Review Mode */}
              {showSolution && isCorrect && (
                <View style={styles.tagCorrectRow}>
                  {isSelected && <Text style={[styles.userPickTag, { color: colors.success }]}>Seçimin </Text>}
                  <Text style={[styles.markCorrect, { color: colors.success }]}>✓</Text>
                </View>
              )}
              {showSolution && isSelected && !isCorrect && (
                <View style={styles.tagWrongRow}>
                  <Text style={[styles.userPickTagWrong, { color: colors.error }]}>Seçimin </Text>
                  <Text style={[styles.markWrong, { color: colors.error }]}>✕</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SOLUTION & AI DIAGNOSTIC DRAWER */}
      {showSolution && mode === 'REVIEW' && (
        <View style={[styles.solutionDrawer, { backgroundColor: colors.cardBackground, borderColor: colors.brandLightBorder }]}>
          <View style={styles.sdHead}>
            <Text style={[styles.sdHeadText, { color: colors.brand }]}>✨ AI Sınav Koçu Analizi</Text>
          </View>

          {/* CORRECT OPTION EXPLANATION */}
          <Text style={[styles.sdParagraph, { color: colors.textSecondary }]}>
            <Text style={[styles.boldText, { color: colors.text }]}>Doğru cevap ({question.correct_option}): </Text>
            {question.explanation ||
              'Metindeki zaman uyumu (tense harmony), bağlaç mantığı ve akademik bağlam incelendiğinde bu seçenek tek tutarlı alternatiftir.'}
          </Text>

          {/* TRAP BREAKDOWN IF USER WAS WRONG */}
          {activeSelected && activeSelected !== question.correct_option && (
            <View style={[styles.mistakeTrapBox, { backgroundColor: colors.errorLight, borderLeftColor: colors.error }]}>
              <Text style={[styles.mistakeTrapTitle, { color: colors.error }]}>⚠ Düştüğün Çeldirici Tuzağı:</Text>
              <Text style={[styles.mistakeTrapDesc, { color: colors.text }]}>
                Seçtiğin ({activeSelected}) seçeneği: ÖSYM'nin klasik çeldirici modellerinden biridir. Cümledeki zaman akışını veya bağlaç yönünü tersine çevirerek yanıltıcı bir bağlam sunmaktadır.
              </Text>
            </View>
          )}

          <View style={[styles.trapTag, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.trapTagText, { color: colors.brand }]}>
              🎯 Test Edilen Kural: {question.subtopic || 'Akademik Bağlam & Gramer'}
            </Text>
          </View>

          {/* INTERACTIVE VOCABULARY CHIPS */}
          <View style={[styles.vocabSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.vocabSectionTitle, { color: colors.text }]}>📖 Sorudaki Önemli Akademik Kelimeler</Text>
            <View style={styles.vocabChipsRow}>
              {getDynamicKeywords().map((word, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.vocabChip, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}
                  onPress={() => handleOpenWordModal(word)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.vocabChipWord, { color: colors.text }]}>{word}</Text>
                  <Text style={[styles.vocabChipAdd, { color: colors.brand }]}>+</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* NEXT QUESTION ACTION BUTTON INSIDE SOLUTION DRAWER */}
          {hasNext && onNext && (
            <TouchableOpacity
              style={[styles.nextActionBtn, { backgroundColor: colors.brand }]}
              onPress={onNext}
              activeOpacity={0.85}
            >
              <Text style={[styles.nextActionBtnText, { color: colors.textOnBrand }]}>Sonraki Soruya Geç</Text>
              <ArrowRight size={18} color={colors.textOnBrand} strokeWidth={2.4} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Add Custom Word Modal */}
      <CustomWordModal
        visible={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        initialWord={selectedWordForModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  qMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  qTopicBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  qTopicBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  qMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qCounter: {
    fontSize: 13,
    fontWeight: '600',
  },
  addWordQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  addWordQuickText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  flagBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 14,
  },
  passageCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  passageHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  kicker: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickerText: {
    fontSize: 12,
    fontWeight: '800',
  },
  src: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  passageFade: {
    maxHeight: 88,
    overflow: 'hidden',
  },
  passageText: {
    lineHeight: 23,
    fontWeight: '400',
  },
  expandToggle: {
    marginTop: 8,
  },
  expandLabel: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  qStem: {
    fontWeight: '800',
    lineHeight: 23,
    letterSpacing: -0.2,
    marginVertical: 12,
  },
  optList: {
    gap: 10,
    marginBottom: 14,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  bub: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  bubText: {
    fontSize: 13,
    fontWeight: '800',
  },
  txt: {
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
  markCorrect: {
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 'auto',
  },
  markWrong: {
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 'auto',
  },
  solutionDrawer: {
    marginTop: 6,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  sdHead: {
    marginBottom: 8,
  },
  sdHeadText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  sdParagraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  trapTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  trapTagText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  mistakeTrapBox: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  mistakeTrapTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  mistakeTrapDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  vocabSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  vocabSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  vocabChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vocabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  vocabChipWord: {
    fontSize: 12,
    fontWeight: '700',
  },
  vocabChipAdd: {
    fontSize: 13,
    fontWeight: '900',
  },
  tagCorrectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  tagWrongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  userPickTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  userPickTagWrong: {
    fontSize: 11,
    fontWeight: '800',
  },
  nextActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  nextActionBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
