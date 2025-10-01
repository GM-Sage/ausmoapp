// Update Screen
// Check for app updates

import React from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPOGRAPHY, SPACING, APP_CONFIG } from '../../constants';

export default function UpdateScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: SPACING.MD,
    },
    title: {
      fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.text_PRIMARY,
      marginBottom: SPACING.SM,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.textSecondary,
      marginBottom: SPACING.LG,
    },
    section: {
      backgroundColor: themeColors.surface,
      padding: SPACING.MD,
      borderRadius: 8,
      marginBottom: SPACING.MD,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.text_PRIMARY,
      marginBottom: SPACING.SM,
    },
    description: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.textSecondary,
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Check for Updates</Text>
          <Text style={styles.subtitle}>
            Current version: {APP_CONFIG.version}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <Text style={styles.description}>
              You are currently running the latest version of {APP_CONFIG.name}.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Automatic Updates</Text>
            <Text style={styles.description}>
              Updates are automatically downloaded and installed when available
              through your device's app store.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Updates</Text>
            <Text style={styles.description}>
              To manually check for updates, visit your device's app store and
              look for {APP_CONFIG.name}.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
