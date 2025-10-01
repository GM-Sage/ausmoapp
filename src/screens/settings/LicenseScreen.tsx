// License Screen
// Displays app license information

import React from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPOGRAPHY, SPACING } from '../../constants';

export default function LicenseScreen() {
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
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.textSecondary,
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.SMALL,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>License</Text>
          <Text style={styles.subtitle}>MIT License</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MIT License</Text>
            <Text style={styles.description}>
              Copyright (c) 2024 Ausmo Team{'\n\n'}
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files (the "Software"), to deal in the Software without
              restriction, including without limitation the rights to use, copy,
              modify, merge, publish, distribute, sublicense, and/or sell copies
              of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:{'\n\n'}
              The above copyright notice and this permission notice shall be
              included in all copies or substantial portions of the Software.
              {'\n\n'}
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
              NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
              HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
              WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
              DEALINGS IN THE SOFTWARE.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
