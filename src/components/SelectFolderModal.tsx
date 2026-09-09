import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Folder,
  Plus,
  Check,
  X,
  FolderPlus,
  ChevronRight,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { WordItem } from '../types';
import { dbService } from '../database/DatabaseService';

interface SelectFolderModalProps {
  visible: boolean;
  word: WordItem | null;
  imageUrl?: string;
  onClose: () => void;
  onSuccess: (folderName: string) => void;
}

export const SelectFolderModal: React.FC<SelectFolderModalProps> = ({
  visible,
  word,
  imageUrl,
  onClose,
  onSuccess,
}) => {
  const { colors } = useThemeStore();
  const { vocabFolders, loadVocabFolders, loadVocabSession } = useLearningStore();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingFolder, setSavingFolder] = useState<string | null>(null);

  // Default system folders + custom user folders
  const defaultFolderList = [
    { id: 'custom_default', name: 'Özel Kelime Defterim', color: '#6366F1' },
    { id: 'fav_words', name: 'Favori Kelimelerim', color: '#F97316' },
    { id: 'yds_core', name: 'YDS Sık Çıkanlar', color: '#10B981' },
    { id: 'reading_words', name: 'Okuma & Paragraf Kelimeleri', color: '#EAB308' },
  ];

  // Merge store folders with defaults (prevent duplicates)
  const existingFolderNames = new Set(defaultFolderList.map((f) => f.name));
  (vocabFolders || []).forEach((f) => {
    if (!existingFolderNames.has(f.name)) {
      defaultFolderList.push({
        id: f.id,
        name: f.name,
        color: f.color || '#6366F1',
      });
      existingFolderNames.add(f.name);
    }
  });

  const handleSelectFolder = async (folderName: string) => {
    if (!word || isSaving) return;
    setIsSaving(true);
    setSavingFolder(folderName);
    try {
      await dbService.addWordToFolder(word, folderName, imageUrl);
      await loadVocabFolders();
      await loadVocabSession();
      setIsSaving(false);
      setSavingFolder(null);
      onSuccess(folderName);
      onClose();
    } catch (err) {
      console.warn('Error adding word to folder:', err);
      setIsSaving(false);
      setSavingFolder(null);
    }
  };

  const handleCreateAndSelect = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    await handleSelectFolder(trimmed);
    setNewFolderName('');
    setIsCreatingNew(false);
  };

  if (!visible || !word) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          {/* iOS Bottom Sheet Drag Handle */}
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Klasör Seçin
              </Text>
              <Text
                style={[styles.sheetSub, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                "{word.word}" kelimesini pratik havuzunuza ekleyin
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.subtleBackground }]}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* New Folder Toggle Input */}
          {isCreatingNew ? (
            <View
              style={[
                styles.newFolderBox,
                {
                  backgroundColor: colors.subtleBackground,
                  borderColor: colors.brand,
                },
              ]}
            >
              <FolderPlus size={20} color={colors.brand} />
              <TextInput
                style={[styles.newFolderInput, { color: colors.text }]}
                placeholder="Yeni Klasör Adı Yazın..."
                placeholderTextColor={colors.textSecondary}
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateAndSelect}
              />
              <TouchableOpacity
                style={[styles.saveNewBtn, { backgroundColor: colors.brand }]}
                onPress={handleCreateAndSelect}
                activeOpacity={0.8}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={2.8} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelNewBtn, { backgroundColor: colors.cardBackground }]}
                onPress={() => setIsCreatingNew(false)}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.createToggleBtn,
                {
                  backgroundColor: colors.subtleBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setIsCreatingNew(true)}
              activeOpacity={0.7}
            >
              <Plus size={16} color={colors.brand} strokeWidth={2.6} />
              <Text style={[styles.createToggleText, { color: colors.brand }]}>
                Yeni Klasör Oluştur
              </Text>
            </TouchableOpacity>
          )}

          {/* Folder List */}
          <ScrollView
            style={styles.folderList}
            contentContainerStyle={styles.folderListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {defaultFolderList.map((f) => {
              const isSelected = savingFolder === f.name;

              return (
                <TouchableOpacity
                  key={f.id + f.name}
                  style={[
                    styles.folderItem,
                    {
                      backgroundColor: colors.subtleBackground,
                      borderColor: isSelected ? colors.brand : colors.border,
                    },
                  ]}
                  onPress={() => handleSelectFolder(f.name)}
                  activeOpacity={0.72}
                  disabled={isSaving}
                >
                  <View
                    style={[
                      styles.folderIconWrap,
                      { backgroundColor: (f.color || colors.brand) + '18' },
                    ]}
                  >
                    <Folder size={20} color={f.color || colors.brand} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.folderNameText, { color: colors.text }]}>
                      {f.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.addPill,
                      {
                        backgroundColor: isSelected
                          ? colors.brand
                          : colors.cardBackground,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {isSelected ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Plus size={13} color={colors.brand} strokeWidth={2.8} />
                    )}
                    <Text
                      style={[
                        styles.addPillText,
                        { color: isSelected ? '#FFFFFF' : colors.brand },
                      ]}
                    >
                      {isSelected ? 'Ekleniyor' : 'Ekle'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '78%',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sheetSub: {
    fontSize: 13,
    marginTop: 3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  createToggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  newFolderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  newFolderInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
  },
  saveNewBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelNewBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderList: {
    maxHeight: 340,
  },
  folderListContent: {
    paddingBottom: 8,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  folderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderNameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  addPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
