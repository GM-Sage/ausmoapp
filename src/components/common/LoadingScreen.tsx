// Loading Screen Component

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TYPOGRAPHY } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = 'Loading...',
}: LoadingScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ActivityIndicator size="large" color={themeColors.primary} />
      <Text style={[styles.message, { color: themeColors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
  },
});
