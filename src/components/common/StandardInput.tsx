// Standard Input Component
// Provides consistent input styling and accessibility across the app

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TYPOGRAPHY, SPACING, RESPONSIVE } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export interface StandardInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
  required?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface StandardPickerProps {
  label?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: Array<{ label: string; value: string }>;
  placeholder?: string;
  style?: ViewStyle;
  error?: string;
  required?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function StandardInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  style,
  inputStyle,
  error,
  required = false,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}: StandardInputProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  const inputStyles = [
    styles.input,
    {
      backgroundColor: themeColors.surface,
      borderColor: error ? themeColors.error : themeColors.border,
      color: themeColors.text,
    },
    multiline && styles.textArea,
    !editable && [
      styles.inputDisabled,
      {
        backgroundColor: themeColors.background,
        color: themeColors.textSecondary,
      },
    ],
    error && [styles.inputError, { borderColor: themeColors.error }],
    inputStyle,
  ];

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: themeColors.text },
            required && styles.labelRequired,
          ]}
        >
          {label}
          {required && (
            <Text style={[styles.required, { color: themeColors.error }]}>
              {' '}
              *
            </Text>
          )}
        </Text>
      )}
      <TextInput
        style={inputStyles}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        placeholderTextColor={themeColors.textSecondary}
      />
      {error && (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function StandardPicker({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder,
  style,
  error,
  required = false,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}: StandardPickerProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: themeColors.text },
            required && styles.labelRequired,
          ]}
        >
          {label}
          {required && (
            <Text style={[styles.required, { color: themeColors.error }]}>
              {' '}
              *
            </Text>
          )}
        </Text>
      )}
      <View
        style={[
          styles.pickerContainer,
          {
            backgroundColor: themeColors.surface,
            borderColor: error ? themeColors.error : themeColors.border,
            shadowColor: themeColors.text,
          },
          error && [styles.pickerError, { borderColor: themeColors.error }],
        ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[styles.picker, { color: themeColors.text }]}
          itemStyle={[styles.pickerItem, { color: themeColors.text }]}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
        >
          {placeholder && (
            <Picker.Item
              label={placeholder}
              value=""
              color={themeColors.textSecondary}
            />
          )}
          {items.map(item => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              color={themeColors.text}
            />
          ))}
        </Picker>
      </View>
      {error && (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD,
  },
  label: {
    fontSize: RESPONSIVE.getFontSize(COMPONENT_STYLES.LABEL.PRIMARY.fontSize),
    fontWeight: COMPONENT_STYLES.LABEL.PRIMARY.fontWeight,
    // color will be set dynamically based on theme
    marginBottom: COMPONENT_STYLES.LABEL.PRIMARY.marginBottom,
  },
  labelRequired: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  required: {
    // color will be set dynamically
  },
  input: {
    // backgroundColor, borderColor, color will be set dynamically based on theme
    borderRadius: COMPONENT_STYLES.INPUT.TEXT.borderRadius,
    borderWidth: COMPONENT_STYLES.INPUT.TEXT.borderWidth,
    fontSize: RESPONSIVE.getFontSize(COMPONENT_STYLES.INPUT.TEXT.fontSize),
    paddingVertical: RESPONSIVE.getSpacing(
      COMPONENT_STYLES.INPUT.TEXT.paddingVertical
    ),
    paddingHorizontal: RESPONSIVE.getSpacing(
      COMPONENT_STYLES.INPUT.TEXT.paddingHorizontal
    ),
  },
  textArea: {
    // backgroundColor, borderColor, color will be set dynamically based on theme
    borderRadius: COMPONENT_STYLES.INPUT.TEXTAREA.borderRadius,
    borderWidth: COMPONENT_STYLES.INPUT.TEXTAREA.borderWidth,
    fontSize: RESPONSIVE.getFontSize(COMPONENT_STYLES.INPUT.TEXTAREA.fontSize),
    paddingVertical: RESPONSIVE.getSpacing(
      COMPONENT_STYLES.INPUT.TEXTAREA.paddingVertical
    ),
    paddingHorizontal: RESPONSIVE.getSpacing(
      COMPONENT_STYLES.INPUT.TEXTAREA.paddingHorizontal
    ),
    minHeight: RESPONSIVE.getSpacing(COMPONENT_STYLES.INPUT.TEXTAREA.minHeight),
    textAlignVertical: COMPONENT_STYLES.INPUT.TEXTAREA.textAlignVertical,
  },
  inputDisabled: {
    // colors will be set dynamically
  },
  inputError: {
    // borderColor will be set dynamically
  },
  pickerContainer: {
    // backgroundColor, borderColor, shadowColor will be set dynamically based on theme
    borderRadius: COMPONENT_STYLES.PICKER.CONTAINER.borderRadius,
    borderWidth: COMPONENT_STYLES.PICKER.CONTAINER.borderWidth,
    minHeight: RESPONSIVE.getSpacing(
      COMPONENT_STYLES.PICKER.CONTAINER.minHeight
    ),
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerError: {
    // borderColor will be set dynamically
  },
  picker: {
    height: RESPONSIVE.getSpacing(COMPONENT_STYLES.PICKER.STYLE.height),
    // color will be set dynamically based on theme
    backgroundColor: 'transparent',
  },
  pickerItem: {
    fontSize: RESPONSIVE.getFontSize(COMPONENT_STYLES.PICKER.ITEM.fontSize),
    // color will be set dynamically based on theme
  },
  errorText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically
    marginTop: SPACING.XS,
  },
});

export default StandardInput;
