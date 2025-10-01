// Error State Component
// Provides consistent error states across the app

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import StandardButton from './StandardButton';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  style?: any;
}

export default function ErrorState({
  message,
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
  style,
}: ErrorStateProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <Ionicons
          name="alert-circle"
          size={48}
          color={themeColors.error}
          style={styles.icon}
        />
      )}
      <Text style={[styles.message, { color: themeColors.text }]}>
        {message}
      </Text>
      {onRetry && (
        <StandardButton
          title={retryText}
          onPress={onRetry}
          variant="outline"
          size="medium"
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
  },
  icon: {
    marginBottom: SPACING.MD,
  },
  message: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  retryButton: {
    minWidth: 120,
  },
});
