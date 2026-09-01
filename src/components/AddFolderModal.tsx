import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Folder,
  BookOpen,
  Star,
  Bookmark,
  Sparkles,
  Target,
  Briefcase,
  Heart,
  Zap,
  GraduationCap,
  Check,
  FolderPlus,
} from 'lucide-react-native';
import { useLearningStore } from '../store/useLearningStore';
import { useThemeStore } from '../store/useThemeStore';
import { SmoothBottomSheet } from './SmoothBottomSheet';
import { VocabFolder } from '../types';

interface AddFolderModalProps {
  visible: boolean;
  onClose: () => void;
  folderToEdit?: VocabFolder | null;
}

const AVAILABLE_COLORS = [
  '#4F46E5', // Indigo
  '#0EA5E9', // Sky Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#D946EF', // Fuchsia
  '#475569', // Slate
];

const AVAILABLE_ICONS = [
  { name: 'Folder', label: 'Klasör' },
  { name: 'BookOpen', label: 'Kitap' },
  { name: 'Star', label: 'Yıldız' },
  { name: 'Bookmark', label: 'İşaret' },
  { name: 'Sparkles', label: 'Yapay Zeka' },
  { name: 'Target', label: 'Hedef' },
  { name: 'Briefcase', label: 'İş / Hukuk' },
  { name: 'Heart', label: 'Sağlık / Tıp' },
  { name: 'Zap', label: 'Hızlı' },
  { name: 'GraduationCap', label: 'Akademik' },
];

export const AddFolderModal: React.FC<AddFolderModalProps> = ({
  visible,
  onClose,
  folderToEdit,
}) => {
  const { colors } = useThemeStore();
  const { createVocabFolder, updateVocabFolder } = useLearningStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0].name);

  useEffect(() => {
    if (visible) {
      if (folderToEdit) {
        setName(folderToEdit.name);
        setDescription(folderToEdit.description || '');
        setSelectedColor(folderToEdit.color || AVAILABLE_COLORS[0]);
        setSelectedIcon(folderToEdit.icon || AVAILABLE_ICONS[0].name);
      } else {
        setName('');
        setDescription('');
        setSelectedColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
        setSelectedIcon('Folder');
      }
    }
  }, [visible, folderToEdit]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Klasör Adı Gerekli', 'Lütfen klasör için bir başlık girin.');
      return;
    }

    if (folderToEdit) {
      await updateVocabFolder(folderToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
    } else {
      await createVocabFolder({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
    }

    onClose();
  };

  const renderIconPreview = (iconName: string, color: string, size = 20) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen size={size} color={color} />;
      case 'Star':
        return <Star size={size} color={color} />;
      case 'Bookmark':
        return <Bookmark size={size} color={color} />;
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      case 'Target':
        return <Target size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'Heart':
        return <Heart size={size} color={color} />;
      case 'Zap':
        return <Zap size={size} color={color} />;
      case 'GraduationCap':
        return <GraduationCap size={size} color={color} />;
      default:
        return <Folder size={size} color={color} />;
    }
  };

  return (
    <SmoothBottomSheet visible={visible} onClose={onClose} height="85%">
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.headerIconBox, { backgroundColor: selectedColor + '20' }]}>
            {renderIconPreview(selectedIcon, selectedColor, 22)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {folderToEdit ? 'Klasörü Düzenle' : 'Yeni Kelime Klasörü'}
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              Kelimelerinizi konularına veya ilgi alanlarınıza göre gruplayın.
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Folder Name */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Klasör Başlığı *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.subtleBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn: Sağlık & Tıp Makaleleri, Zorlandığım Kelimeler..."
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={45}
          />

          {/* Folder Description */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Açıklama (İsteğe Bağlı)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.subtleBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Örn: 2024 YDS sınavı için çıkabilecek önemli terimler"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            maxLength={100}
          />

          {/* Color Picker */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Klasör Rengi</Text>
          <View style={styles.colorsGrid}>
            {AVAILABLE_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  selectedColor === c && styles.selectedColorRing,
                ]}
                onPress={() => setSelectedColor(c)}
                activeOpacity={0.8}
              >
                {selectedColor === c && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Icon Picker */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Klasör İkonu</Text>
          <View style={styles.iconsGrid}>
            {AVAILABLE_ICONS.map((item) => {
              const isSelected = selectedIcon === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isSelected ? selectedColor + '20' : colors.subtleBackground,
                      borderColor: isSelected ? selectedColor : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedIcon(item.name)}
                  activeOpacity={0.75}
                >
                  {renderIconPreview(item.name, isSelected ? selectedColor : colors.textSecondary, 20)}
                  <Text
                    style={[
                      styles.iconLabel,
                      { color: isSelected ? selectedColor : colors.textSecondary },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

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
            style={[styles.saveBtn, { backgroundColor: selectedColor }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <FolderPlus size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{folderToEdit ? 'Güncelle' : 'Klasörü Oluştur'}</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '600',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 6,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorRing: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  iconBox: {
    width: '31%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 4,
  },
  iconLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
