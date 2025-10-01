// Parent Access Screen
// Allows parents to enter a code to switch back to their account from child account

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  RESPONSIVE,
} from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import ParentAccessService from '../../services/parentAccessService';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';
import AudioService from '../../services/audioService';
import { User } from '../../types';

export default function ParentAccessScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to ensure user data is serializable for Redux
  const serializeUserForRedux = (user: User) => ({
    ...user,
    createdAt:
      typeof user.createdAt === 'string'
        ? user.createdAt
        : user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : new Date().toISOString(),
    updatedAt:
      typeof user.updatedAt === 'string'
        ? user.updatedAt
        : user.updatedAt instanceof Date
          ? user.updatedAt.toISOString()
          : new Date().toISOString(),
  });

  const handleCodeSubmit = async () => {
    if (!accessCode.trim()) {
      Alert.alert('Error', 'Please enter an access code');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'No user found');
      return;
    }

    setIsLoading(true);

    try {
      // Play audio feedback
      await AudioService.speak('Checking access code', {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.6,
        autoRepeat: false,
        repeatDelay: 1000,
      });

      // Validate the access code
      const parentAccessService = ParentAccessService.getInstance();
      const validCode = await parentAccessService.validateAccessCode(
        accessCode,
        currentUser.id
      );

      if (validCode) {
        // Handle demo parent account
        if (validCode.parentUserId === 'demo-parent-123') {
          // For demo purposes, create a temporary parent user
          const demoParentUser = {
            id: 'demo-parent-123',
            name: 'Demo Parent',
            role: 'parent' as const,
            email: 'demo@parent.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            preferences: {},
            profilePicture: null,
            parentConsent: true,
            coppaCompliant: true,
          };

          // Switch to demo parent account
          dispatch(setCurrentUser(serializeUserForRedux(demoParentUser)));

          // Deactivate the used code
          await parentAccessService.deactivateAccessCode(validCode.id);

          // Play success audio
          await AudioService.speak('Welcome back, parent', {
            ttsVoice: undefined,
            ttsSpeed: 1.0,
            ttsPitch: 1.0,
            volume: 0.8,
            autoRepeat: false,
            repeatDelay: 1000,
          });

          Alert.alert(
            'Success',
            'Welcome back, Demo Parent! You are now in parent mode.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          // Get the real parent user
          const parentUser =
            await SupabaseDatabaseService.getInstance().getUser(
              validCode.parentUserId
            );

          if (parentUser) {
            // Switch to parent account
            dispatch(setCurrentUser(serializeUserForRedux(parentUser)));

            // Deactivate the used code
            await parentAccessService.deactivateAccessCode(validCode.id);

            // Play success audio
            await AudioService.speak('Welcome back, parent', {
              ttsVoice: undefined,
              ttsSpeed: 1.0,
              ttsPitch: 1.0,
              volume: 0.8,
              autoRepeat: false,
              repeatDelay: 1000,
            });

            Alert.alert('Success', `Welcome back, ${parentUser.name}!`, [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } else {
            Alert.alert('Error', 'Parent account not found');
          }
        }
      } else {
        // Play error audio
        await AudioService.speak('Invalid access code', {
          ttsVoice: undefined,
          ttsSpeed: 1.0,
          ttsPitch: 1.0,
          volume: 0.6,
          autoRepeat: false,
          repeatDelay: 1000,
        });

        Alert.alert('Error', 'Invalid or expired access code');
      }
    } catch (error) {
      console.error('Error validating access code:', error);
      Alert.alert('Error', 'Failed to validate access code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleGenerateCode = async () => {
    // For demo purposes, generate a code and store it temporarily
    if (!currentUser) {
      Alert.alert('Error', 'No user found');
      return;
    }

    const parentAccessService = ParentAccessService.getInstance();

    // Create a temporary parent user ID for demo (use a fixed demo parent ID)
    const demoParentId = 'demo-parent-123';
    const demoCode = await parentAccessService.generateAccessCode(
      demoParentId,
      currentUser.id
    );

    // Dismiss keyboard first
    Keyboard.dismiss();

    Alert.alert(
      'Demo Access Code',
      `For demo purposes, use this code: ${demoCode}\n\nThis code will work for 24 hours.\n\nIn a real app, this would be generated by the parent account.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            style={[styles.header, { borderBottomColor: themeColors.border }]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={themeColors.primary}
              />
            </TouchableOpacity>

            <Text style={[styles.title, { color: themeColors.text }]}>
              Parent Access
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="shield-checkmark"
                size={64}
                color={themeColors.primary}
              />
            </View>

            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Enter your parent access code to switch back to your account
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                Access Code
              </Text>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={accessCode}
                onChangeText={setAccessCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="numeric"
                maxLength={6}
                accessible={true}
                accessibilityLabel="Access code input"
                accessibilityHint="Enter your 6-digit parent access code"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: themeColors.primary },
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleCodeSubmit}
              disabled={isLoading}
              accessible={true}
              accessibilityLabel="Submit access code"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.submitButtonText,
                  { color: themeColors.surface },
                ]}
              >
                {isLoading ? 'Checking...' : 'Access Parent Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoButton, { borderColor: themeColors.primary }]}
              onPress={handleGenerateCode}
              accessible={true}
              accessibilityLabel="Generate demo code"
              accessibilityRole="button"
            >
              <Ionicons
                name="key"
                size={20}
                color={themeColors.primary}
                style={styles.demoIcon}
              />
              <Text
                style={[styles.demoButtonText, { color: themeColors.primary }]}
              >
                Generate Demo Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dismissButton,
                { borderColor: themeColors.textSecondary },
              ]}
              onPress={dismissKeyboard}
              accessible={true}
              accessibilityLabel="Dismiss keyboard"
              accessibilityRole="button"
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={themeColors.textSecondary}
                style={styles.dismissIcon}
              />
              <Text
                style={[
                  styles.dismissButtonText,
                  { color: themeColors.textSecondary },
                ]}
              >
                Dismiss Keyboard
              </Text>
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={themeColors.textSecondary}
              />
              <Text
                style={[styles.helpText, { color: themeColors.textSecondary }]}
              >
                Don't have an access code? Ask your parent to generate one from
                their account.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    padding: SPACING.SM,
    marginRight: SPACING.MD,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.XL,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.XL,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.XL,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text,
    marginBottom: SPACING.SM,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.LG),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text,
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: themeColors.surface,
    minHeight: RESPONSIVE.getButtonHeight(50),
  },
  submitButton: {
    backgroundColor: themeColors.primary,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.XL),
    marginBottom: RESPONSIVE.getSpacing(SPACING.LG),
    width: '100%',
    alignItems: 'center',
    minHeight: RESPONSIVE.getButtonHeight(48),
  },
  submitButtonDisabled: {
    backgroundColor: themeColors.textSecondary,
  },
  submitButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  demoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColors.primary,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingVertical: RESPONSIVE.getSpacing(SPACING.SM),
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.LG),
    marginBottom: RESPONSIVE.getSpacing(SPACING.MD),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: RESPONSIVE.getButtonHeight(40),
  },
  demoIcon: {
    marginRight: SPACING.SM,
  },
  demoButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.primary,
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColors.textSecondary,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingVertical: RESPONSIVE.getSpacing(SPACING.SM),
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.LG),
    marginBottom: RESPONSIVE.getSpacing(SPACING.XL),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: RESPONSIVE.getButtonHeight(40),
  },
  dismissIcon: {
    marginRight: SPACING.SM,
  },
  dismissButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.textSecondary,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.MD,
  },
  helpText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.SM,
    flex: 1,
    lineHeight: 18,
  },
});
