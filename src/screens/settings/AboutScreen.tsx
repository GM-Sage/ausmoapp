// About Screen
// Displays app information and version details

import React from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPOGRAPHY, SPACING, APP_CONFIG } from '../../constants';

export default function AboutScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>About {APP_CONFIG.name}</Text>
          <Text style={styles.subtitle}>Version {APP_CONFIG.version}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{APP_CONFIG.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Author</Text>
            <Text style={styles.description}>{APP_CONFIG.author}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <Text style={styles.description}>
              For support and questions, please contact us at{' '}
              {APP_CONFIG.supportEmail}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Website</Text>
            <Text style={styles.description}>{APP_CONFIG.website}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
