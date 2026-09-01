import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  BookOpen,
  Puzzle,
  Link,
  MessageSquare,
  Shuffle,
  AlertTriangle,
  Play,
} from 'lucide-react-native';
import { YdsQuestionType } from '../types';
import { AIService } from '../services/AIService';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { SmoothBottomSheet } from './SmoothBottomSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStartCustomQuiz: (questions: any[], title: string) => void;
}

export const AITestGeneratorModal: React.FC<Props> = ({
  visible,
  onClose,
  onStartCustomQuiz,
}) => {
  const { mistakes } = useLearningStore();
  const { colors } = useThemeStore();

  const [selectedType, setSelectedType] = useState<YdsQuestionType | 'MIXED' | 'MISTAKE_RECOVERY'>('SENTENCE_COMPLETION');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [topicPrompt, setTopicPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const typeOptions: { key: YdsQuestionType | 'MIXED' | 'MISTAKE_RECOVERY'; label: string; Icon: any }[] = [
    {
      key: 'SENTENCE_COMPLETION',
      label: 'Cümle Tamamlama',
      Icon: Link,
    },
    {
      key: 'PARAGRAPH',
      label: 'Paragraf (Reading)',
      Icon: BookOpen,
    },
    {
      key: 'CLOZE_TEST',
      label: 'Cloze Test',
      Icon: Puzzle,
    },
    {
      key: 'SKILL_DIALOGUE',
      label: 'Diyalog & Skills',
      Icon: MessageSquare,
    },
    {
      key: 'MIXED',
      label: 'Karma Test (Tümü)',
      Icon: Shuffle,
    },
    {
      key: 'MISTAKE_RECOVERY',
      label: `Hata Defterim (${mistakes.length} Yanlış)`,
      Icon: AlertTriangle,
    },
  ];

  const countOptions = [10, 20, 40, 80];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedQuestions = await AIService.generateCustomQuizPackage({
        type: selectedType,
        count: questionCount,
        topic: topicPrompt.trim() || undefined,
      });

      const title = topicPrompt.trim()
        ? `AI Testi: ${topicPrompt.trim()}`
        : selectedType === 'MISTAKE_RECOVERY'
        ? 'AI Hata Telafi Testi'
        : `AI Özel YDS Testi (${questionCount} Soru)`;

      setIsGenerating(false);
      onClose();
      onStartCustomQuiz(generatedQuestions, title);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setIsGenerating(false);
    }
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={[styles.sheetContent, { backgroundColor: colors.cardBackground }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleRow}>
            <Sparkles size={20} color={colors.brand} />
            <Text style={[styles.title, { color: colors.text }]}>AI ile Özel Test Oluştur</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
          >
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Question Type Selection */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>1. Soru Tipi Seçin</Text>
          <View style={styles.typeGrid}>
            {typeOptions.map((opt) => {
              const isSelected = selectedType === opt.key;
              const IconComp = opt.Icon;

              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: isSelected ? colors.brandLight : colors.cardBackground,
                      borderColor: isSelected ? colors.brand : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedType(opt.key)}
                  activeOpacity={0.7}
                >
                  <IconComp size={16} color={isSelected ? colors.brand : colors.textSecondary} />
                  <Text
                    style={[
                      styles.typeCardText,
                      { color: isSelected ? colors.brand : colors.textSecondary },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Question Count Selection */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>2. Soru Sayısı</Text>
          <View style={styles.countRow}>
            {countOptions.map((cnt) => {
              const isSelected = questionCount === cnt;
              return (
                <TouchableOpacity
                  key={cnt}
                  style={[
                    styles.countButton,
                    {
                      backgroundColor: isSelected ? colors.brandLight : colors.subtleBackground,
                      borderColor: isSelected ? colors.brand : colors.border,
                    },
                  ]}
                  onPress={() => setQuestionCount(cnt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.countButtonText,
                      { color: isSelected ? colors.brand : colors.textSecondary },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {cnt} Soru
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Topic / Prompt */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>3. Özel Konu / Tema (İsteğe Bağlı)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn: Zıtlık bağlaçları, Tıp & Sağlık, Phrasal verbs..."
            placeholderTextColor={colors.textSecondary}
            value={topicPrompt}
            onChangeText={setTopicPrompt}
          />

          {/* Info notice */}
          <View style={[styles.infoNotice, { backgroundColor: colors.brandLight, borderColor: colors.brandLightBorder }]}>
            <Text style={[styles.infoNoticeText, { color: colors.brand }]}>
              💡 Yapay zeka B2-C1 akademik seviyesinde, güçlü çeldiricilere ve detaylı çözümlere sahip sıfır kilometre bir test hazırlayacaktır.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.brand }]}
          onPress={handleGenerate}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <View style={styles.generatingRow}>
              <ActivityIndicator size="small" color={colors.textOnBrand} />
              <Text style={[styles.generateButtonText, { color: colors.textOnBrand }]}>Yapay Zeka Testi Hazırlıyor...</Text>
            </View>
          ) : (
            <View style={styles.generatingRow}>
              <Play size={18} color={colors.textOnBrand} fill={colors.textOnBrand} />
              <Text style={[styles.generateButtonText, { color: colors.textOnBrand }]}>Testi Oluştur ve Başlat</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: '45%',
    flex: 1,
  },
  typeCardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  countButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  infoNotice: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
  },
  infoNoticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  generateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
