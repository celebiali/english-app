import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  X,
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

  const [selectedType, setSelectedType] = useState<YdsQuestionType | 'MIXED' | 'MISTAKE_RECOVERY'>('SENTENCE_COMPLETION');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [topicPrompt, setTopicPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const typeOptions: { key: YdsQuestionType | 'MIXED' | 'MISTAKE_RECOVERY'; label: string; Icon: any; color: string }[] = [
    {
      key: 'SENTENCE_COMPLETION',
      label: 'Cümle Tamamlama',
      Icon: Link,
      color: '#059669',
    },
    {
      key: 'PARAGRAPH',
      label: 'Paragraf (Reading)',
      Icon: BookOpen,
      color: '#2563EB',
    },
    {
      key: 'CLOZE_TEST',
      label: 'Cloze Test',
      Icon: Puzzle,
      color: '#7C3AED',
    },
    {
      key: 'SKILL_DIALOGUE',
      label: 'Diyalog & Skills',
      Icon: MessageSquare,
      color: '#D97706',
    },
    {
      key: 'MIXED',
      label: 'Karma Test (Tümü)',
      Icon: Shuffle,
      color: '#0891B2',
    },
    {
      key: 'MISTAKE_RECOVERY',
      label: `Hata Defterim (${mistakes.length} Yanlış)`,
      Icon: AlertTriangle,
      color: '#DC2626',
    },
  ];

  const countOptions = [5, 10, 15, 20];

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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={20} color="#7C3AED" />
              <Text style={styles.title}>AI ile Özel Test Oluştur</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Question Type Selection */}
            <Text style={styles.sectionLabel}>1. Soru Tipi Seçin</Text>
            <View style={styles.typeGrid}>
              {typeOptions.map((opt) => {
                const isSelected = selectedType === opt.key;
                const IconComp = opt.Icon;

                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.typeCard,
                      isSelected && { borderColor: opt.color, backgroundColor: `${opt.color}10` },
                    ]}
                    onPress={() => setSelectedType(opt.key)}
                    activeOpacity={0.7}
                  >
                    <IconComp size={16} color={isSelected ? opt.color : '#64748B'} />
                    <Text
                      style={[
                        styles.typeCardText,
                        isSelected && { color: opt.color, fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question Count Selection */}
            <Text style={styles.sectionLabel}>2. Soru Sayısı</Text>
            <View style={styles.countRow}>
              {countOptions.map((cnt) => {
                const isSelected = questionCount === cnt;
                return (
                  <TouchableOpacity
                    key={cnt}
                    style={[styles.countButton, isSelected && styles.countButtonSelected]}
                    onPress={() => setQuestionCount(cnt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.countButtonText, isSelected && styles.countButtonTextSelected]}>
                      {cnt} Soru
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Topic / Prompt */}
            <Text style={styles.sectionLabel}>3. Özel Konu / Tema (İsteğe Bağlı)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Zıtlık bağlaçları, Tıp & Sağlık, Phrasal verbs..."
              value={topicPrompt}
              onChangeText={setTopicPrompt}
            />

            {/* Info notice */}
            <View style={styles.infoNotice}>
              <Text style={styles.infoNoticeText}>
                💡 Yapay zeka B2-C1 akademik seviyesinde, güçlü çeldiricilere ve detaylı çözümlere sahip sıfır kilometre bir test hazırlayacaktır.
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <View style={styles.generatingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Yapay Zeka Testi Hazırlıyor...</Text>
              </View>
            ) : (
              <View style={styles.generatingRow}>
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.generateButtonText}>Testi Oluştur ve Başlat</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
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
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    minWidth: '45%',
    flex: 1,
  },
  typeCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  countButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  countButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  countButtonTextSelected: {
    color: '#2563EB',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  infoNotice: {
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    marginTop: 14,
  },
  infoNoticeText: {
    fontSize: 12,
    color: '#6D28D9',
    lineHeight: 18,
  },
  generateButton: {
    backgroundColor: '#7C3AED',
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
