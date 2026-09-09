import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Folder, FolderPlus } from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { VocabFolder } from '../types';

interface AddFolderModalProps {
  visible: boolean;
  onClose: () => void;
  folderToEdit?: VocabFolder | null;
}

export const AddFolderModal: React.FC<AddFolderModalProps> = ({
  visible,
  onClose,
  folderToEdit,
}) => {
  const { colors } = useThemeStore();
  const { createVocabFolder, updateVocabFolder } = useLearningStore();

  const [name, setName] = useState('');

  useEffect(() => {
    if (visible) {
      if (folderToEdit) {
        setName(folderToEdit.name);
      } else {
        setName('');
      }
    }
  }, [visible, folderToEdit]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Klasör Adı Gerekli', 'Lütfen klasör için bir ad girin.');
      return;
    }

    if (folderToEdit) {
      await updateVocabFolder(folderToEdit.id, {
        name: trimmed,
        color: folderToEdit.color || colors.brand,
        icon: folderToEdit.icon || 'Folder',
      });
    } else {
      await createVocabFolder({
        name: trimmed,
        color: colors.brand,
        icon: 'Folder',
      });
    }

    onClose();
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} height={280}>
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.headerIconBox, { backgroundColor: colors.brandLight }]}>
            <Folder size={22} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {folderToEdit ? 'Klasörü Düzenle' : 'Yeni Kelime Klasörü'}
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              Kelimelerinizi kolayca gruplamak için bir isim verin.
            </Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Klasör Adı</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.subtleBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn: Tıp Terimleri, Bağlaçlar, Hukuk..."
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={45}
            autoFocus={visible}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        {/* Action Buttons */}
        <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Vazgeç</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.brand }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <FolderPlus size={18} color={colors.textOnBrand} />
            <Text style={[styles.saveBtnText, { color: colors.textOnBrand }]}>
              {folderToEdit ? 'Güncelle' : 'Klasör Oluştur'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 16,
  },
  inputContainer: {
    marginVertical: 12,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
