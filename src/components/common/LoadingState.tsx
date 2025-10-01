// Loading State Component
// Provides consistent loading states across the app

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TYPOGRAPHY, SPACING } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

export default function LoadingState({
  message = 'Loading...',
  size = 'large',
  color,
  style,
}: LoadingStateProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color || themeColors.primary} />
      {message && (
        <Text style={[styles.message, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  message: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    marginTop: SPACING.MD,
    textAlign: 'center',
  },
});
