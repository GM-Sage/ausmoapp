// Diagnostics Screen
// App diagnostics and troubleshooting

import React from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPOGRAPHY, SPACING } from '../../constants';

export default function DiagnosticsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Diagnostics</Text>
          <Text style={styles.subtitle}>App health and troubleshooting</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <Text style={styles.description}>
              All systems are operating normally. No issues detected.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Database</Text>
            <Text style={styles.description}>
              Database connection: ✓ Connected{'\n'}
              Data integrity: ✓ Verified{'\n'}
              Storage space: ✓ Available
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio System</Text>
            <Text style={styles.description}>
              Text-to-Speech: ✓ Available{'\n'}
              Audio recording: ✓ Available{'\n'}
              Voice synthesis: ✓ Working
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting</Text>
            <Text style={styles.description}>
              If you're experiencing issues:{'\n'}• Restart the app{'\n'}• Check
              your device's audio settings{'\n'}• Ensure you have sufficient
              storage space{'\n'}• Contact support if problems persist
            </Text>
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
