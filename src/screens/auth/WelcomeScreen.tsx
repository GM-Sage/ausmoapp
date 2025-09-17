// Welcome Screen

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('UserSelection' as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Ausmo</Text>
        <Text style={styles.subtitle}>
          Complete AAC Communication App for Children with Autism
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Ionicons name="chatbubbles" size={48} color={COLORS.PRIMARY} />
          <Text style={styles.featureTitle}>Easy Communication</Text>
          <Text style={styles.featureDescription}>
            Tap buttons to speak messages instantly
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="library" size={48} color={COLORS.SECONDARY} />
          <Text style={styles.featureTitle}>Custom Books</Text>
          <Text style={styles.featureDescription}>
            Create personalized communication books
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="accessibility" size={48} color={COLORS.WARNING} />
          <Text style={styles.featureTitle}>Accessible</Text>
          <Text style={styles.featureDescription}>
            Switch scanning and visual accessibility options
          </Text>
        </View>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity 
        style={styles.getStartedButton}
        onPress={handleGetStarted}
        accessible={true}
        accessibilityLabel="Get started with Ausmo"
        accessibilityRole="button"
      >
        <Text style={styles.getStartedText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={24} color={COLORS.SURFACE} />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Designed for children with autism and communication needs
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingTop: height * 0.1,
    paddingBottom: SPACING.XL,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    justifyContent: 'center',
  },
  feature: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  getStartedButton: {
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.SURFACE,
    marginRight: SPACING.SM,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  footerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.SMALL,
  },
});
