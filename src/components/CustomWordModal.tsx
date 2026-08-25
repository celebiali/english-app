import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Sparkles, Check, BookmarkPlus } from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { AIService } from '../services/AIService';
import { dbService } from '../database/DatabaseService';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialWord?: string;
}

export const CustomWordModal: React.FC<Props> = ({ visible, onClose, initialWord = '' }) => {
  const { loadVocabSession } = useLearningStore();

  const [wordText, setWordText] = useState(initialWord);
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [synonymsText, setSynonymsText] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleAutoFillAI = async () => {
    if (!wordText.trim()) {
      Alert.alert('Uyarı', 'Lütfen önce bir İngilizce kelime yazın.');
      return;
    }

    setIsLoadingAI(true);
    try {
      const data = await AIService.autoCompleteWord(wordText.trim());
      if (data.meaning) setMeaning(data.meaning);
      if (data.example_sentence) setExampleSentence(data.example_sentence);
      if (data.example_translation) setExampleTranslation(data.example_translation);
      if (data.synonyms && data.synonyms.length > 0) {
        setSynonymsText(data.synonyms.join(', '));
      }
    } catch (err) {
      console.error('AI autofill failed:', err);
      Alert.alert('Bilgi', 'Kelime analiz edildi, lütfen kontrol ediniz.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (!wordText.trim() || !meaning.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen kelimeyi ve Türkçe anlamını girin.');
      return;
    }

    const syns = synonymsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await dbService.insertCustomWord({
      word: wordText.trim(),
      meaning: meaning.trim(),
      category: 'VOCABULARY',
      subcategory: 'Kişisel Kelime Defterim',
      level: 'B2',
      example_sentence: exampleSentence.trim() || undefined,
      example_translation: exampleTranslation.trim() || undefined,
      synonyms: syns,
    });

    await loadVocabSession();

    // Reset fields
    setWordText('');
    setMeaning('');
    setExampleSentence('');
    setExampleTranslation('');
    setSynonymsText('');
    onClose();

    Alert.alert(
      'Kelime Kaydedildi! ⭐',
      `"${wordText.trim()}" özel kelime defterine ve Kutu 1'e eklendi.`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <BookmarkPlus size={18} color="#4F46E5" />
              </View>
              <div>
                <Text style={styles.title}>Özel Kelime Defterine Ekle</Text>
                <Text style={styles.subtitle}>
                  Metinlerden veya günlük hayattan bilmediğin kelimeleri kaydet
                </Text>
              </div>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Word Input & AI Autofill Button */}
            <Text style={styles.inputLabel}>İngilizce Kelime / Kalıp</Text>
            <View style={styles.wordInputRow}>
              <TextInput
                style={styles.wordInput}
                placeholder="Örn: exacerbate, plausible, deteriorate..."
                placeholderTextColor="#94A3B8"
                value={wordText}
                onChangeText={setWordText}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.aiFillBtn}
                onPress={handleAutoFillAI}
                disabled={isLoadingAI}
                activeOpacity={0.8}
              >
                {isLoadingAI ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={14} color="#FFFFFF" />
                    <Text style={styles.aiFillBtnText}>AI Doldur</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Meaning Input */}
            <Text style={styles.inputLabel}>Türkçe Karşılığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: daha da kötüleştirmek, şiddetlendirmek"
              placeholderTextColor="#94A3B8"
              value={meaning}
              onChangeText={setMeaning}
            />

            {/* Example Sentence */}
            <Text style={styles.inputLabel}>Akademik / YDS Örnek Cümle (İngilizce)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Örn: Economic instability will only exacerbate current hardships."
              placeholderTextColor="#94A3B8"
              value={exampleSentence}
              onChangeText={setExampleSentence}
              multiline
            />

            {/* Example Translation */}
            <Text style={styles.inputLabel}>Cümlenin Türkçe Çevirisi</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Örn: Ekonomik istikrarsızlık mevcut zorlukları sadece daha da kötüleştirecektir."
              placeholderTextColor="#94A3B8"
              value={exampleTranslation}
              onChangeText={setExampleTranslation}
              multiline
            />

            {/* Synonyms */}
            <Text style={styles.inputLabel}>Eş Anlamlıları (Virgülle ayırın)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: worsen, aggravate, impair"
              placeholderTextColor="#94A3B8"
              value={synonymsText}
              onChangeText={setSynonymsText}
            />
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.saveBtnText}>Özel Kelimelerime Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '88%',
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#F1F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  scroll: {
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
  },
  wordInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  wordInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  aiFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  aiFillBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#E7EAF3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
