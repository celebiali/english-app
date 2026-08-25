import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
} from 'lucide-react-native';
import { QuestionItem, OptionKey } from '../types';
import { CustomWordModal } from './CustomWordModal';

interface Props {
  question: QuestionItem;
  questionIndex?: number;
  totalQuestions?: number;
  mode?: 'PRACTICE' | 'EXAM';
  selectedOption?: OptionKey | null;
  isFlagged?: boolean;
  onSelectOption: (option: OptionKey) => void;
  onToggleFlag?: () => void;
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
}) => {
  const [localAnswered, setLocalAnswered] = useState<OptionKey | null>(selectedOption);
  const [isPassageExpanded, setIsPassageExpanded] = useState<boolean>(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState<boolean>(false);

  const activeSelected = mode === 'EXAM' ? selectedOption : localAnswered;
  const isAnsweredInPractice = mode === 'PRACTICE' && localAnswered !== null;

  const handleOptionPress = (key: OptionKey) => {
    if (mode === 'PRACTICE') {
      if (localAnswered !== null) return;
      setLocalAnswered(key);
      onSelectOption(key);
    } else {
      onSelectOption(key);
    }
  };

  const optionsList: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* SCREEN 2: Q-META ROW */}
      <View style={styles.qMeta}>
        <View style={styles.qTopicBadge}>
          <Text style={styles.qTopicBadgeText}>{getTypeBadgeLabel(question.type)}</Text>
        </View>

        <View style={styles.qMetaRight}>
          {totalQuestions > 1 && (
            <Text style={styles.qCounter}>
              Soru {questionIndex + 1} / {totalQuestions}
            </Text>
          )}

          {/* Only allow custom word addition outside strict exam mode */}
          {mode !== 'EXAM' && (
            <TouchableOpacity
              style={styles.addWordQuickBtn}
              onPress={() => setIsAddWordModalOpen(true)}
              activeOpacity={0.7}
            >
              <BookmarkPlus size={15} color="#7C3AED" />
              <Text style={styles.addWordQuickText}>+ Kelime</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.flagBtn, isFlagged && styles.flagBtnActive]}
            onPress={onToggleFlag}
            activeOpacity={0.7}
          >
            <Text style={styles.flagEmoji}>🚩</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PASSAGE CARD */}
      {question.passage && (
        <View style={styles.passageCard}>
          <View style={styles.passageHead}>
            <View style={styles.kicker}>
              <Text style={styles.kickerText}>A</Text>
            </View>
            <Text style={styles.src}>Akademik Okuma Metni</Text>
          </View>

          <View style={!isPassageExpanded ? styles.passageFade : undefined}>
            <Text
              style={styles.passageText}
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
            <Text style={styles.expandLabel}>
              {isPassageExpanded ? 'Metni daralt ▴' : 'Metnin tamamını göster ▾'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QUESTION STEM */}
      <Text style={styles.qStem}>{question.question_text}</Text>

      {/* 5 TACTILE OPTIONS (A, B, C, D, E) */}
      <View style={styles.optList}>
        {optionsList.map((key) => {
          const optionText = question.options[key];
          if (!optionText) return null;

          const isSelected = activeSelected === key;
          const isCorrect = key === question.correct_option;

          let optStyle: any = styles.opt;
          let bubStyle: any = styles.bub;
          let bubTextStyle: any = styles.bubText;
          let txtStyle: any = styles.txt;

          if (mode === 'PRACTICE' && isAnsweredInPractice) {
            if (isCorrect) {
              optStyle = [styles.opt, styles.optCorrect];
              bubStyle = [styles.bub, styles.bubCorrect];
              bubTextStyle = [styles.bubText, styles.bubTextLight];
            } else if (isSelected && !isCorrect) {
              optStyle = [styles.opt, styles.optWrong];
              bubStyle = [styles.bub, styles.bubWrong];
              bubTextStyle = [styles.bubText, styles.bubTextLight];
            }
          } else if (isSelected) {
            optStyle = [styles.opt, styles.optSelected];
            bubStyle = [styles.bub, styles.bubSelected];
            bubTextStyle = [styles.bubText, styles.bubTextLight];
          }

          return (
            <TouchableOpacity
              key={key}
              style={optStyle}
              onPress={() => handleOptionPress(key)}
              activeOpacity={0.7}
            >
              <View style={bubStyle}>
                <Text style={bubTextStyle}>{key}</Text>
              </View>

              <Text style={txtStyle}>{optionText}</Text>

              {/* Status Mark */}
              {isAnsweredInPractice && isCorrect && (
                <Text style={styles.markCorrect}>✓</Text>
              )}
              {isAnsweredInPractice && isSelected && !isCorrect && (
                <Text style={styles.markWrong}>✕</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SOLUTION & AI DIAGNOSTIC DRAWER (Pratik & Sınav Sonrası İnceleme) */}
      {isAnsweredInPractice && (
        <View style={styles.solutionDrawer}>
          <View style={styles.sdHead}>
            <Text style={styles.sdHeadText}>✨ AI Sınav Koçu Analizi</Text>
          </View>

          {/* CORRECT OPTION EXPLANATION */}
          <Text style={styles.sdParagraph}>
            <Text style={styles.boldText}>Doğru cevap ({question.correct_option}): </Text>
            {question.explanation ||
              'Metindeki zaman uyumu (tense harmony), bağlaç mantığı ve akademik bağlam incelendiğinde bu seçenek tek tutarlı alternatiftir.'}
          </Text>

          {/* TRAP BREAKDOWN IF USER WAS WRONG */}
          {localAnswered !== question.correct_option && (
            <View style={styles.mistakeTrapBox}>
              <Text style={styles.mistakeTrapTitle}>⚠ Düştüğün Çeldirici Tuzağı:</Text>
              <Text style={styles.mistakeTrapDesc}>
                Seçtiğin ({localAnswered}) seçeneği: ÖSYM'nin klasik çeldirici modellerinden biridir. Cümledeki zaman akışını veya bağlaç yönünü tersine çevirerek yanıltıcı bir bağlam sunmaktadır.
              </Text>
            </View>
          )}

          <View style={styles.trapTag}>
            <Text style={styles.trapTagText}>
              🎯 Test Edilen Kural: {question.subtopic || 'Akademik Bağlam & Gramer'}
            </Text>
          </View>

          {/* INTERACTIVE VOCABULARY CHIPS (POST-EXAM RETENTION) */}
          <View style={styles.vocabSection}>
            <Text style={styles.vocabSectionTitle}>📖 Sorudaki Önemli Akademik Kelimeler</Text>
            <View style={styles.vocabChipsRow}>
              {['deteriorate', 'mitigate', 'deplete', 'precedent'].map((word, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.vocabChip}
                  onPress={() => {
                    setIsAddWordModalOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vocabChipWord}>{word}</Text>
                  <Text style={styles.vocabChipAdd}>+</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Quick Add Custom Word Modal */}
      <CustomWordModal
        visible={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  qTopicBadgeText: {
    color: '#4F46E5',
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
    color: '#475569',
  },
  addWordQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  addWordQuickText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  flagBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  flagEmoji: {
    fontSize: 14,
  },
  passageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.03)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  src: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#475569',
    textTransform: 'uppercase',
  },
  passageFade: {
    maxHeight: 88,
    overflow: 'hidden',
  },
  passageText: {
    fontSize: 14.5,
    lineHeight: 23,
    color: '#1E293B',
    fontWeight: '400',
  },
  expandToggle: {
    marginTop: 8,
  },
  expandLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  qStem: {
    fontSize: 15.5,
    fontWeight: '800',
    lineHeight: 23,
    color: '#0F172A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: '#E7EAF3',
  },
  optSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#F5F5FF',
  },
  optCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  bub: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4FA',
    borderWidth: 1.6,
    borderColor: '#E7EAF3',
  },
  bubSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  bubCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  bubWrong: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  bubText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  bubTextLight: {
    color: '#FFFFFF',
  },
  txt: {
    flex: 1,
    fontSize: 13.8,
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 20,
  },
  markCorrect: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
    marginLeft: 'auto',
  },
  markWrong: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EF4444',
    marginLeft: 'auto',
  },
  solutionDrawer: {
    marginTop: 6,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  sdHead: {
    marginBottom: 8,
  },
  sdHeadText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  sdParagraph: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  trapTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  trapTagText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  mistakeTrapBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  mistakeTrapTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  mistakeTrapDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  vocabSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  vocabSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  vocabChipWord: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  vocabChipAdd: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7C3AED',
  },
});
