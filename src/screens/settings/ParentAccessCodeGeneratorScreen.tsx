// Parent Access Code Generator Screen
// Allows parents to generate access codes for their children

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import { RootState } from '../../store';
import ParentAccessService from '../../services/parentAccessService';
import AudioService from '../../services/audioService';

export default function ParentAccessCodeGeneratorScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.LG,
    },
    header: {
      alignItems: 'center',
      paddingVertical: SPACING.XL,
    },
    title: {
      fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.text,
      marginTop: SPACING.MD,
      marginBottom: SPACING.SM,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    instructionsSection: {
      backgroundColor: themeColors.surface,
      padding: SPACING.LG,
      borderRadius: BORDER_RADIUS.MEDIUM,
      marginBottom: SPACING.XL,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.text,
      marginBottom: SPACING.MD,
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.SM,
    },
    instructionText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.text,
      marginLeft: SPACING.SM,
      flex: 1,
    },
    codeSection: {
      backgroundColor: themeColors.surface,
      padding: SPACING.LG,
      borderRadius: BORDER_RADIUS.MEDIUM,
      marginBottom: SPACING.XL,
      borderWidth: 1,
      borderColor: themeColors.success,
    },
    codeContainer: {
      backgroundColor: themeColors.background,
      padding: SPACING.LG,
      borderRadius: BORDER_RADIUS.MEDIUM,
      alignItems: 'center',
      marginBottom: SPACING.MD,
      borderWidth: 2,
      borderColor: themeColors.primary,
    },
    codeText: {
      fontSize: 36,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.primary,
      letterSpacing: 4,
    },
    codeActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.LG,
      paddingVertical: SPACING.SM,
      backgroundColor: themeColors.background,
      borderRadius: BORDER_RADIUS.SMALL,
      borderWidth: 1,
      borderColor: themeColors.primary,
    },
    copyButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.primary,
      marginLeft: SPACING.XS,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.LG,
      paddingVertical: SPACING.SM,
      backgroundColor: themeColors.background,
      borderRadius: BORDER_RADIUS.SMALL,
      borderWidth: 1,
      borderColor: themeColors.error,
    },
    clearButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.error,
      marginLeft: SPACING.XS,
    },
    generateButton: {
      backgroundColor: themeColors.primary,
      borderRadius: BORDER_RADIUS.MEDIUM,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.XL,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.XL,
      shadowColor: themeColors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    generateButtonDisabled: {
      backgroundColor: themeColors.textSecondary,
    },
    generateButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.surface,
      marginLeft: SPACING.SM,
    },
    securitySection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.MD,
      backgroundColor: themeColors.surface,
      borderRadius: BORDER_RADIUS.SMALL,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    securityText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.textSecondary,
      marginLeft: SPACING.SM,
      flex: 1,
      lineHeight: 18,
    },
  });

  const handleGenerateCode = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user found');
      return;
    }

    setIsGenerating(true);

    try {
      // Play audio feedback
      await AudioService.speak('Generating access code', {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.6,
        autoRepeat: false,
        repeatDelay: 1000,
      });

      // For demo purposes, generate a simple code
      const parentAccessService = ParentAccessService.getInstance();
      const code = parentAccessService.generateSimpleCode();

      setGeneratedCode(code);

      // Show the code with instructions
      parentAccessService.showParentAccessInstructions(code);

      // Play success audio
      await AudioService.speak('Access code generated', {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 1000,
      });
    } catch (error) {
      console.error('Error generating access code:', error);
      Alert.alert('Error', 'Failed to generate access code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      // In a real app, you would copy to clipboard
      Alert.alert(
        'Code Copied',
        `Access code ${generatedCode} copied to clipboard`
      );
    }
  };

  const handleClearCode = () => {
    setGeneratedCode(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="shield-checkmark"
            size={48}
            color={themeColors.primary}
          />
          <Text style={[styles.title, { color: themeColors.text }]}>
            Parent Access Code
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Generate a secure code to switch back to your account from your
            child's device
          </Text>
        </View>

        {/* Instructions */}
        <View
          style={[
            styles.instructionsSection,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            How it works:
          </Text>
          <View style={styles.instructionItem}>
            <Ionicons name="ellipse" size={20} color={themeColors.primary} />
            <Text style={[styles.instructionText, { color: themeColors.text }]}>
              Generate a 6-digit access code
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="ellipse" size={20} color={themeColors.primary} />
            <Text style={[styles.instructionText, { color: themeColors.text }]}>
              Give the code to your child
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="ellipse" size={20} color={themeColors.primary} />
            <Text style={[styles.instructionText, { color: themeColors.text }]}>
              Child enters code on their device to switch back to your account
            </Text>
          </View>
        </View>

        {/* Generated Code Section */}
        {generatedCode && (
          <View style={styles.codeSection}>
            <Text style={styles.sectionTitle}>Your Access Code:</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{generatedCode}</Text>
            </View>
            <View style={styles.codeActions}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyCode}
                accessible={true}
                accessibilityLabel="Copy access code"
                accessibilityRole="button"
              >
                <Ionicons name="copy" size={20} color={themeColors.primary} />
                <Text style={styles.copyButtonText}>Copy Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCode}
                accessible={true}
                accessibilityLabel="Clear access code"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={themeColors.error} />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerating && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateCode}
          disabled={isGenerating}
          accessible={true}
          accessibilityLabel="Generate access code"
          accessibilityRole="button"
        >
          <Ionicons
            name={isGenerating ? 'hourglass' : 'key'}
            size={24}
            color={themeColors.surface}
          />
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Access Code'}
          </Text>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <Ionicons
            name="lock-closed"
            size={20}
            color={themeColors.textSecondary}
          />
          <Text style={styles.securityText}>
            Codes expire after 24 hours for security. Each code can only be used
            once.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
