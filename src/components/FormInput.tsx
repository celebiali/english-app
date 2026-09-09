import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export interface FormInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  topRightElement?: React.ReactNode;
  error?: string;
  containerStyle?: object;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  rightElement,
  topRightElement,
  error,
  containerStyle,
  style,
  placeholder,
  value,
  ...textInputProps
}) => {
  const { colors } = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);

  const displayLabel = label || placeholder || '';
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Floating Border Label Badge */}
      {isFloating && displayLabel ? (
        <View
          style={[
            styles.floatingBadge,
            { backgroundColor: colors.cardBackground },
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.floatingLabelText,
              {
                color: error
                  ? colors.error
                  : isFocused
                  ? colors.brand
                  : colors.textSecondary,
              },
            ]}
          >
            {displayLabel}
          </Text>
        </View>
      ) : null}

      {/* Top Right Element (e.g., Şifremi Unuttum?) positioned on top-right border */}
      {topRightElement && (
        <View
          style={[
            styles.topRightBadge,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          {topRightElement}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.cardBackground,
            borderColor: error ? colors.error : isFocused ? colors.brand : colors.border,
            borderWidth: isFocused ? 1.8 : 1.2,
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text,
            },
            style,
          ]}
          value={value}
          placeholder={!isFloating ? displayLabel : ''}
          placeholderTextColor={colors.textMuted || colors.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />

        {rightElement && (
          <View style={styles.rightContainer}>{rightElement}</View>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginTop: 6,
    marginBottom: 4,
  },
  floatingBadge: {
    position: 'absolute',
    top: -9,
    left: 14,
    paddingHorizontal: 6,
    zIndex: 10,
    borderRadius: 4,
  },
  floatingLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  topRightBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    paddingHorizontal: 6,
    zIndex: 20,
    borderRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    position: 'relative',
  },
  iconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    fontWeight: '600',
    paddingVertical: 0, // prevents Android text jump
  },
  rightContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    paddingHorizontal: 4,
  },
});
