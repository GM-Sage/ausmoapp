// Welcome Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('UserSelection' as never);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: themeColors.surface,
              shadowColor: themeColors.primary,
            },
          ]}
        >
          <Ionicons name="heart" size={60} color={themeColors.primary} />
        </View>
        <Text style={[styles.title, { color: themeColors.primary }]}>
          Welcome to Ausmo
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Empowering communication for children with autism
        </Text>
        <Text
          style={[styles.description, { color: themeColors.textSecondary }]}
        >
          A comprehensive Augmentative and Alternative Communication (AAC) app
          designed to help children express themselves, learn, and connect with
          the world around them.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Ionicons name="chatbubbles" size={40} color={themeColors.primary} />
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>
            Express Yourself
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: themeColors.textSecondary },
            ]}
          >
            Tap colorful buttons to speak your thoughts and feelings
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="library" size={40} color={themeColors.secondary} />
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>
            Personal Stories
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: themeColors.textSecondary },
            ]}
          >
            Create your own communication books with pictures and words
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="people" size={40} color={themeColors.warning} />
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>
            Family & Friends
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: themeColors.textSecondary },
            ]}
          >
            Connect with parents, therapists, and caregivers
          </Text>
        </View>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={[
          styles.getStartedButton,
          { backgroundColor: themeColors.primary },
        ]}
        onPress={handleGetStarted}
        accessible={true}
        accessibilityLabel="Start your communication journey"
        accessibilityRole="button"
      >
        <Text style={[styles.getStartedText, { color: themeColors.surface }]}>
          Start Your Journey
        </Text>
        <Ionicons name="arrow-forward" size={24} color={themeColors.surface} />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
          Every voice matters. Every child deserves to be heard.
        </Text>
        <Text
          style={[styles.footerSubtext, { color: themeColors.textSecondary }]}
        >
          Designed with love for children with autism and communication needs
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingTop: height * 0.08,
    paddingBottom: SPACING.XL,
  },
  logoContainer: {
    marginBottom: SPACING.LG,
    padding: SPACING.MD,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.SM,
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    justifyContent: 'space-around',
    paddingVertical: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  feature: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    marginHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.LARGE,
    marginBottom: SPACING.XL,
  },
  getStartedText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginRight: SPACING.SM,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  footerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginBottom: SPACING.XS,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.SMALL,
  },
});
