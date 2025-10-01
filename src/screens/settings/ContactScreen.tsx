// Contact Screen
// Contact information and support

import React from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPOGRAPHY, SPACING, APP_CONFIG } from '../../constants';

export default function ContactScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const handleEmailPress = () => {
    Linking.openURL(`mailto:${APP_CONFIG.supportEmail}`);
  };

  const handleWebsitePress = () => {
    Linking.openURL(APP_CONFIG.website);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>
            Get in touch with our support team
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email Support</Text>
            <Text style={styles.link} onPress={handleEmailPress}>
              {APP_CONFIG.supportEmail}
            </Text>
            <Text style={styles.description}>
              Send us an email for technical support, feature requests, or
              general questions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Website</Text>
            <Text style={styles.link} onPress={handleWebsitePress}>
              {APP_CONFIG.website}
            </Text>
            <Text style={styles.description}>
              Visit our website for more information, updates, and resources.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Response Time</Text>
            <Text style={styles.description}>
              We typically respond to support requests within 24-48 hours during
              business days.
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
  link: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.primary,
    textDecorationLine: 'underline',
    marginBottom: SPACING.SM,
  },
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
});
