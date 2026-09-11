import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';

interface SearchInputBarProps {
  value?: string;
  placeholder?: string;
  onSearch: (text: string) => void;
  debounceMs?: number;
  onSubmitEditing?: (text: string) => void;
}

export const SearchInputBar: React.FC<SearchInputBarProps> = ({
  value,
  placeholder = 'Sözlükten kelime ara ve havuza ekle...',
  onSearch,
  debounceMs = 500,
  onSubmitEditing,
}) => {
  const { colors } = useThemeStore();
  const [localText, setLocalText] = useState(value ?? '');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedRef = useRef<string>(value ?? '');

  // Sync external value changes (e.g. when cleared upon adding word or switching folders)
  useEffect(() => {
    if (value !== undefined && value !== lastEmittedRef.current) {
      setLocalText(value);
      lastEmittedRef.current = value;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [value]);

  const handleChange = (text: string) => {
    setLocalText(text);
    if (timerRef.current) clearTimeout(timerRef.current);

    // If completely empty, notify immediately
    if (!text.trim()) {
      lastEmittedRef.current = '';
      onSearch('');
      return;
    }

    // Wait until typing has paused/finished before notifying parent
    timerRef.current = setTimeout(() => {
      const clean = text.trim();
      lastEmittedRef.current = clean;
      onSearch(clean);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalText('');
    lastEmittedRef.current = '';
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch('');
  };

  const handleSubmit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const clean = localText.trim();
    lastEmittedRef.current = clean;
    onSearch(clean);
    onSubmitEditing?.(clean);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.subtleBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <Search size={18} color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={localText}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="default"
        returnKeyType="search"
        clearButtonMode="never"
      />
      {localText.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearBtn}
        >
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
});
