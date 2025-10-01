// Standard Dropdown Component
// Provides a better-styled dropdown alternative to the native Picker

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COMPONENT_STYLES,
  TYPOGRAPHY,
  SPACING,
  RESPONSIVE,
  BORDER_RADIUS,
} from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export interface StandardDropdownProps {
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

export function StandardDropdown({
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
}: StandardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem
    ? selectedItem.label
    : placeholder || 'Select an option';

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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

      <TouchableOpacity
        style={[
          styles.dropdownContainer,
          {
            backgroundColor: themeColors.inputBackground,
            borderColor: error ? themeColors.error : themeColors.inputBorder,
          },
          error && styles.dropdownError,
        ]}
        onPress={toggleDropdown}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.dropdownText,
            {
              color: selectedItem
                ? themeColors.text
                : themeColors.inputPlaceholder,
            },
            !selectedItem && styles.placeholderText,
          ]}
        >
          {displayText}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={RESPONSIVE.getIconSize(20)}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            { backgroundColor: themeColors.overlay },
          ]}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: themeColors.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                {label || 'Select Option'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons
                  name="close"
                  size={RESPONSIVE.getIconSize(24)}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: themeColors.border },
                    item.value === selectedValue && [
                      styles.selectedItem,
                      { backgroundColor: themeColors.calm },
                    ],
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: themeColors.text },
                      item.value === selectedValue && [
                        styles.selectedItemText,
                        { color: themeColors.primary },
                      ],
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Ionicons
                      name="checkmark"
                      size={RESPONSIVE.getIconSize(20)}
                      color={themeColors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: COMPONENT_STYLES.LABEL.PRIMARY.marginBottom,
  },
  labelRequired: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  required: {
    // Color will be set dynamically
  },
  dropdownContainer: {
    borderRadius: COMPONENT_STYLES.PICKER.CONTAINER.borderRadius,
    borderWidth: COMPONENT_STYLES.PICKER.CONTAINER.borderWidth,
    minHeight: RESPONSIVE.getSpacing(
      COMPONENT_STYLES.PICKER.CONTAINER.minHeight
    ),
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.MD),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.SM),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownError: {
    // Border color will be set dynamically
  },
  dropdownText: {
    fontSize: RESPONSIVE.getFontSize(COMPONENT_STYLES.PICKER.ITEM.fontSize),
    flex: 1,
  },
  placeholderText: {
    // Color will be set dynamically
  },
  errorText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    marginTop: SPACING.XS,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: RESPONSIVE.getSpacing(SPACING.LG),
  },
  modalContent: {
    borderRadius: BORDER_RADIUS.LG,
    width: '100%',
    maxHeight: '70%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: RESPONSIVE.getSpacing(SPACING.LG),
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.LG),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    borderBottomWidth: 1,
  },
  selectedItem: {
    // Background color will be set dynamically
  },
  dropdownItemText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    flex: 1,
  },
  selectedItemText: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
});

export default StandardDropdown;
