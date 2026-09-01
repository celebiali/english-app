import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { BookmarkPlus, Check, X, Sparkles } from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { dbService } from '../database/DatabaseService';
import { useThemeStore } from '../store/useThemeStore';
import { AIService } from '../services/AIService';
import { SmoothBottomSheet } from './SmoothBottomSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialWord?: string;
  initialMeaning?: string;
  initialFolderId?: string | null;
  onOpenAddFolder?: () => void;
}

export const CustomWordModal: React.FC<Props> = ({
  visible,
  onClose,
  initialWord = '',
  initialMeaning = '',
  initialFolderId = null,
  onOpenAddFolder,
}) => {
  const { loadVocabSession, vocabFolders } = useLearningStore();
  const { colors } = useThemeStore();

  const userFolders = (vocabFolders || []).filter((f) => !f.is_system);

  const [wordText, setWordText] = useState(initialWord);
  const [meaning, setMeaning] = useState(initialMeaning);
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (visible) {
      setWordText(initialWord);
      setMeaning(initialMeaning);
      setExampleSentence('');
      setExampleTranslation('');

      // Match folder by initialFolderId or default (ONLY from user-created custom folders)
      if (initialFolderId && userFolders.length > 0) {
        const found = userFolders.find((f) => f.id === initialFolderId);
        if (found) {
          setSelectedFolderName(found.name);
        } else {
          setSelectedFolderName(userFolders[0]?.name || '');
        }
      } else if (userFolders.length > 0) {
        setSelectedFolderName(userFolders[0]?.name || '');
      } else {
        setSelectedFolderName('');
      }
    }
  }, [visible, initialWord, initialMeaning, initialFolderId, vocabFolders]);

  const handleAiAutoFill = async () => {
    if (!wordText.trim()) {
      Alert.alert('Kelime Yazın', 'Lütfen önce bir İngilizce kelime yazın.');
      return;
    }
    Keyboard.dismiss();
    setIsAutoFilling(true);
    try {
      const details = await AIService.autoCompleteWord(wordText.trim());
      if (details && details.meaning) {
        setMeaning(details.meaning);
        if (details.example_sentence) setExampleSentence(details.example_sentence);
        if (details.example_translation) setExampleTranslation(details.example_translation);
      } else {
        Alert.alert(
          'Kelime Bulunamadı',
          `"${wordText.trim()}" kelimesi sözlükte bulunamadı. Lütfen kelimenin yazımını kontrol edin veya anlamını manuel olarak yazın.`
        );
      }
    } catch (err) {
      console.warn('Sözlük sorgulama hatası:', err);
      Alert.alert('Hata', 'Sözlük sorgulanırken bir bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSave = async () => {
    if (!wordText.trim() || !meaning.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen kelimeyi ve Türkçe karşılığını yazın.');
      return;
    }

    if (!selectedFolderName.trim()) {
      Alert.alert(
        'Klasör Seçilmedi',
        'Hazır sistem listelerine kelime eklenemez. Kelimenizi kaydetmek için lütfen bir klasör oluşturun veya seçin.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: '+ Klasör Oluştur',
            onPress: () => {
              if (onOpenAddFolder) onOpenAddFolder();
            },
          },
        ]
      );
      return;
    }

    await dbService.insertCustomWord({
      word: wordText.trim(),
      meaning: meaning.trim(),
      category: 'VOCABULARY',
      subcategory: selectedFolderName,
      level: 'B2',
      example_sentence: exampleSentence.trim() || undefined,
      example_translation: exampleTranslation.trim() || undefined,
    });

    await loadVocabSession();

    // Reset fields
    setWordText('');
    setMeaning('');
    setExampleSentence('');
    setExampleTranslation('');
    onClose();

    Alert.alert(
      'Kelime Eklendi! ⭐',
      `"${wordText.trim()}" kelimesi "${selectedFolderName}" klasörünüze kaydedildi.`
    );
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} maxHeight="85%">
      <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.brandLight }]}>
              <BookmarkPlus size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Kelime Ekle</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Akademik karşılığı ve örnek cümlesi otomatik getirilir.
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
          style={{ flexShrink: 1 }}
        >
          {/* Target Folder Selector */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>📁 Hedef Klasör</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderRowScroll}>
            {/* + Yeni Klasör Ekle Chip */}
            <TouchableOpacity
              style={[
                styles.folderChip,
                { backgroundColor: colors.brandLight, borderColor: colors.brand, borderStyle: 'dashed' },
              ]}
              onPress={() => {
                if (onOpenAddFolder) {
                  onOpenAddFolder();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.folderChipText, { color: colors.brand, fontWeight: '800' }]}>
                + Yeni Klasör
              </Text>
            </TouchableOpacity>

            {userFolders.map((f) => {
              const isSelected = selectedFolderName === f.name;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.folderChip,
                    {
                      backgroundColor: isSelected ? f.color + '20' : colors.subtleBackground,
                      borderColor: isSelected ? f.color : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedFolderName(f.name)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.folderDot, { backgroundColor: f.color }]} />
                  <Text
                    style={[
                      styles.folderChipText,
                      { color: isSelected ? f.color : colors.textSecondary },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {f.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {userFolders.length === 0 && (
            <View style={[styles.noFolderBanner, { backgroundColor: colors.brandLight, borderColor: colors.border }]}>
              <Text style={[styles.noFolderBannerText, { color: colors.brand }]}>
                ℹ️ Hazır sistem listelerine kelime eklenemez. Kelime ekleyebilmek için lütfen yukarıdaki <Text style={{ fontWeight: '800' }}>+ Yeni Klasör</Text> butonundan kendi klasörünüzü oluşturun.
              </Text>
            </View>
          )}

          {/* Word Input with Embedded Action Button */}
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 6 }]}>İngilizce Kelime *</Text>
          <View style={[styles.wordInputWrapper, { backgroundColor: colors.subtleBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.wordTextInput, { color: colors.text }]}
              placeholder=""
              placeholderTextColor={colors.textSecondary}
              value={wordText}
              onChangeText={setWordText}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleAiAutoFill}
            />
            <TouchableOpacity
              style={[
                styles.embeddedFetchBtn,
                { backgroundColor: wordText.trim() ? colors.brand : colors.border },
              ]}
              onPress={handleAiAutoFill}
              disabled={isAutoFilling || !wordText.trim()}
              activeOpacity={0.8}
            >
              {isAutoFilling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Sparkles size={16} color={wordText.trim() ? '#FFFFFF' : colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Meaning Input */}
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Türkçe Anlamı *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.subtleBackground, color: colors.text, borderColor: colors.border }]}
            placeholder=""
            placeholderTextColor={colors.textSecondary}
            value={meaning}
            onChangeText={setMeaning}
          />

          {/* Example Sentence */}
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Örnek Cümle (İngilizce)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { backgroundColor: colors.subtleBackground, color: colors.text, borderColor: colors.border }]}
            placeholder=""
            placeholderTextColor={colors.textSecondary}
            value={exampleSentence}
            onChangeText={setExampleSentence}
            multiline
          />

          {/* Example Translation */}
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Örnek Cümle Çevirisi (Türkçe)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.subtleBackground, color: colors.text, borderColor: colors.border }]}
            placeholder=""
            placeholderTextColor={colors.textSecondary}
            value={exampleTranslation}
            onChangeText={setExampleTranslation}
          />

          {/* Submit Button (Directly under the inputs, no gap) */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.brand }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Check size={18} color={colors.textOnBrand} strokeWidth={2.5} />
            <Text style={[styles.saveBtnText, { color: colors.textOnBrand }]}>Kelimeyi Klasöre Kaydet</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 12,
  },
  folderRowScroll: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 10,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.2,
    marginRight: 8,
  },
  folderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  folderChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noFolderBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  noFolderBannerText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  wordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48,
  },
  wordTextInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  embeddedFetchBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13.5,
    borderWidth: 1,
  },
  multilineInput: {
    height: 56,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
});
