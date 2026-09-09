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
  placeholder?: string;
  onSearch: (text: string) => void;
  debounceMs?: number;
}

export const SearchInputBar: React.FC<SearchInputBarProps> = ({
  placeholder = 'Sözlükte veya kelimelerimde ara...',
  onSearch,
  debounceMs = 120,
}) => {
  const { colors } = useThemeStore();
  const [localText, setLocalText] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced notification to parent, local input updates with 0 latency
  const handleChange = (text: string) => {
    setLocalText(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(text.trim());
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalText('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch('');
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
