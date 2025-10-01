// Create Child Profile Screen
// Allows parents to create child profiles with just a name (no email required)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import {
  setCurrentUser,
  addUser,
  serializeUser,
} from '../../store/slices/userSlice';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export default function CreateChildProfileScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateChild = async () => {
    if (!name.trim()) {
      Alert.alert('Error', "Please enter your child's name");
      return;
    }

    try {
      setIsLoading(true);

      // Create child user with only name (no email required)
      const childUser = {
        id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        email: '', // Empty email for child profiles
        role: 'child' as const,
        photo: undefined,
        settings: {
          voiceSettings: {
            ttsVoice: 'default',
            ttsSpeed: 1.0,
            ttsPitch: 1.0,
            volume: 0.8,
            autoRepeat: false,
            repeatDelay: 2000,
          },
          visualSettings: {
            highContrast: false,
            largeText: false,
            buttonSize: 'medium' as const,
            gridSpacing: 8,
            backgroundColor: themeColors.background,
            textColor: themeColors.text,
            borderColor: themeColors.border,
            theme: 'system' as const, // Default to system theme
            calmMode: false,
            reduceMotion: false,
            sensoryFriendly: false,
          },
          accessibilitySettings: {
            switchScanning: false,
            scanSpeed: 1000,
            scanMode: 'automatic' as const,
            scanDirection: 'row-column' as const,
            holdToActivate: false,
            touchSensitivity: 0.5,
            oneHandedMode: false,
            reduceMotion: false,
          },
          scanningSettings: {
            enabled: false,
            speed: 1000,
            mode: 'automatic' as const,
            direction: 'row-column' as const,
            visualIndicator: true,
            audioIndicator: true,
            externalSwitch: false,
          },
          audioSettings: {
            volume: 0.8,
            backgroundMusic: false,
            musicVolume: 0.5,
            audioFeedback: true,
            noiseReduction: false,
          },
          expressSettings: {
            combineTTSItems: true,
            combineAsWordFragments: false,
            rightToLeftAccumulation: false,
            playWhenAdding: false,
            scanExpressBar: false,
            expressBarLocation: 'bottom',
            disableExpressRepeat: false,
            createNewPagesAsExpress: false,
          },
          advancedSettings: {
            hideAllImages: false,
            showTouchesWhenExternalDisplay: false,
            switchamajigSupport: false,
            quizSupport: true,
            enableEightQuickButtons: false,
            tactileTalkSupport: false,
            disableInternetSearch: false,
            goToMainMenuOnNextStartup: false,
            experimentalFeatures: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database
      await SupabaseDatabaseService.getInstance().createUser(childUser);

      dispatch(addUser(serializeUser(childUser)));
      dispatch(setCurrentUser(serializeUser(childUser)));

      Alert.alert(
        'Success!',
        `Welcome ${name}! Your child profile has been created.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error creating child profile:', error);
      Alert.alert('Error', 'Failed to create child profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: themeColors.surface,
                shadowColor: themeColors.primary,
              },
            ]}
          >
            <Ionicons name="person-add" size={48} color={themeColors.primary} />
          </View>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Create Child Profile
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Create a profile for your child to start their communication journey
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              Child's Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your child's name"
              placeholderTextColor={themeColors.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />
          </View>

          {/* Info Box */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: themeColors.surface,
                borderLeftColor: themeColors.primary,
              },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={themeColors.primary}
            />
            <Text
              style={[styles.infoText, { color: themeColors.textSecondary }]}
            >
              Child profiles only require a name. No email is needed, making it
              simple and safe for your child to get started.
            </Text>
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresPreview}>
          <Text style={[styles.featuresTitle, { color: themeColors.text }]}>
            Your child will be able to:
          </Text>

          <View style={styles.featureItem}>
            <Ionicons
              name="chatbubbles"
              size={24}
              color={themeColors.success}
            />
            <Text style={[styles.featureText, { color: themeColors.text }]}>
              Express thoughts and feelings
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="library" size={24} color={themeColors.success} />
            <Text style={[styles.featureText, { color: themeColors.text }]}>
              Create personal communication books
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="school" size={24} color={themeColors.success} />
            <Text style={[styles.featureText, { color: themeColors.text }]}>
              Play educational games
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color={themeColors.success} />
            <Text style={[styles.featureText, { color: themeColors.text }]}>
              Connect with family and therapists
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionButtons,
          {
            backgroundColor: themeColors.surface,
            borderTopColor: themeColors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.cancelButtonText,
              { color: themeColors.textSecondary },
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: themeColors.primary },
            isLoading && styles.createButtonDisabled,
            isLoading && { backgroundColor: themeColors.textSecondary },
          ]}
          onPress={handleCreateChild}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? (
            <Text
              style={[styles.createButtonText, { color: themeColors.surface }]}
            >
              Creating...
            </Text>
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={20}
                color={themeColors.surface}
              />
              <Text
                style={[
                  styles.createButtonText,
                  { color: themeColors.surface },
                ]}
              >
                Create Profile
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // backgroundColor will be set dynamically based on theme
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LG,
    // shadowColor will be set dynamically based on theme
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...TYPOGRAPHY.HEADING_LARGE,
    // color will be set dynamically based on theme
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    // color will be set dynamically based on theme
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: SPACING.XL,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  label: {
    ...TYPOGRAPHY.BODY_LARGE,
    // color will be set dynamically based on theme
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  input: {
    // backgroundColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    ...TYPOGRAPHY.BODY_LARGE,
    // color will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  infoBox: {
    flexDirection: 'row',
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderLeftWidth: 4,
    // borderLeftColor will be set dynamically based on theme
  },
  infoText: {
    ...TYPOGRAPHY.BODY_SMALL,
    // color will be set dynamically based on theme
    marginLeft: SPACING.SM,
    flex: 1,
    lineHeight: 18,
  },
  featuresPreview: {
    // backgroundColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  featuresTitle: {
    ...TYPOGRAPHY.BODY_LARGE,
    // color will be set dynamically based on theme
    fontWeight: '600',
    marginBottom: SPACING.MD,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  featureText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    // color will be set dynamically based on theme
    marginLeft: SPACING.SM,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    // backgroundColor will be set dynamically based on theme
    borderTopWidth: 1,
    // borderTopColor will be set dynamically based on theme
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    alignItems: 'center',
  },
  cancelButtonText: {
    ...TYPOGRAPHY.BODY_LARGE,
    // color will be set dynamically based on theme
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    marginLeft: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    // backgroundColor will be set dynamically based on theme
  },
  createButtonDisabled: {
    // backgroundColor will be set dynamically based on theme
  },
  createButtonText: {
    ...TYPOGRAPHY.BODY_LARGE,
    // color will be set dynamically based on theme
    fontWeight: '600',
    marginLeft: SPACING.XS,
  },
});
