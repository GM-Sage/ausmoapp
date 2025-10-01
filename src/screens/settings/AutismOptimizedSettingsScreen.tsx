// Autism-Optimized Settings Screen
// Comprehensive settings specifically designed for children with autism and non-verbal users

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import {
  UserSettings,
  ExpressSettings,
  AdvancedSettings,
  AccessibilitySettings,
} from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { DatabaseService } from '../../services/databaseService';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export default function AutismOptimizedSettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<
    'highlight' | 'background' | 'text'
  >('highlight');

  // Autism-optimized settings
  const [autismSettings, setAutismSettings] = useState({
    // Visual Settings
    highContrast: true,
    largeButtons: true,
    brightColors: true,
    clearBorders: true,
    minimalDistractions: true,

    // Audio Settings
    clearAudioFeedback: true,
    consistentSounds: true,
    volumeBoost: true,
    audioCues: true,

    // Interaction Settings
    predictableInteractions: true,
    immediateFeedback: true,
    errorPrevention: true,
    simplifiedNavigation: true,

    // Scanning Settings
    slowScanning: true,
    clearHighlighting: true,
    audioScanning: true,
    hapticFeedback: true,

    // Express Page Settings
    simpleExpressMode: true,
    visualSentenceBuilding: true,
    repeatButton: true,
    clearWordDisplay: true,

    // Advanced Autism Features
    routineMode: false,
    breakReminders: false,
    progressTracking: true,
    parentControls: false,
  });

  const databaseService = DatabaseService.getInstance();
  const supabaseService = SupabaseDatabaseService.getInstance();

  useEffect(() => {
    loadAutismSettings();
  }, [currentUser]);

  const loadAutismSettings = () => {
    if (currentUser?.settings) {
      // Load from existing user settings
      const settings = currentUser.settings;
      setAutismSettings({
        highContrast: settings.visualSettings?.highContrast || true,
        largeButtons:
          settings.visualSettings?.buttonSize === 'large' ||
          settings.visualSettings?.buttonSize === 'extra-large',
        brightColors: true,
        clearBorders: true,
        minimalDistractions: settings.advancedSettings?.hideAllImages || false,
        clearAudioFeedback: settings.audioSettings?.audioFeedback || true,
        consistentSounds: true,
        volumeBoost: true,
        audioCues:
          settings.accessibilitySettings?.screenReader?.enabled || false,
        predictableInteractions: true,
        immediateFeedback: true,
        errorPrevention: true,
        simplifiedNavigation: true,
        slowScanning: settings.scanningSettings?.speed > 1000,
        clearHighlighting: settings.scanningSettings?.visualIndicator || true,
        audioScanning: settings.scanningSettings?.audioIndicator || true,
        hapticFeedback: settings.accessibilitySettings?.switchScanning || false,
        simpleExpressMode: settings.expressSettings?.combineTTSItems || true,
        visualSentenceBuilding: true,
        repeatButton: !settings.expressSettings?.disableExpressRepeat,
        clearWordDisplay: true,
        routineMode: false,
        breakReminders: false,
        progressTracking: true,
        parentControls: false,
      });
    }
  };

  const updateAutismSetting = async (
    key: keyof typeof autismSettings,
    value: boolean
  ) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const updatedSettings = { ...autismSettings, [key]: value };
      setAutismSettings(updatedSettings);

      // Update the underlying user settings
      const updatedUserSettings =
        await applyAutismSettingsToUserSettings(updatedSettings);

      const updatedUser = {
        ...currentUser,
        createdAt:
          typeof currentUser.createdAt === 'string'
            ? new Date(currentUser.createdAt)
            : currentUser.createdAt,
        settings: updatedUserSettings,
        updatedAt: new Date(),
      };

      await databaseService.updateUser(updatedUser);
      await supabaseService.updateUser(updatedUser);

      // Update Redux store with serialized user
      const serializedUser = {
        ...updatedUser,
        createdAt:
          updatedUser.createdAt instanceof Date
            ? updatedUser.createdAt.toISOString()
            : updatedUser.createdAt,
        updatedAt:
          updatedUser.updatedAt instanceof Date
            ? updatedUser.updatedAt.toISOString()
            : updatedUser.updatedAt,
      };
      dispatch(setCurrentUser(serializedUser));

      Alert.alert('Success', 'Autism settings updated successfully');
    } catch (error) {
      console.error('Error updating autism settings:', error);
      Alert.alert('Error', 'Failed to update autism settings');
      // Revert the change
      setAutismSettings(autismSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAutismSettingsToUserSettings = async (
    settings: any
  ): Promise<UserSettings> => {
    const currentSettings = currentUser?.settings || ({} as UserSettings);

    return {
      ...currentSettings,
      visualSettings: {
        ...currentSettings.visualSettings,
        highContrast: settings.highContrast,
        buttonSize: settings.largeButtons ? 'large' : 'medium',
        backgroundColor: settings.brightColors
          ? themeColors.surface
          : themeColors.background,
        textColor: settings.brightColors
          ? themeColors.text
          : themeColors.textSecondary,
        borderColor: settings.clearBorders
          ? themeColors.text
          : themeColors.border,
      },
      audioSettings: {
        ...currentSettings.audioSettings,
        audioFeedback: settings.clearAudioFeedback,
        volume: settings.volumeBoost ? 1.0 : 0.8,
      },
      accessibilitySettings: {
        ...currentSettings.accessibilitySettings,
        switchScanning: settings.hapticFeedback,
        scanSpeed: settings.slowScanning ? 1500 : 1000,
        screenReader: {
          enabled: settings.audioCues,
          announceChanges: true,
          announceButtons: true,
        },
      },
      scanningSettings: {
        ...currentSettings.scanningSettings,
        visualIndicator: settings.clearHighlighting,
        audioIndicator: settings.audioScanning,
        speed: settings.slowScanning ? 1500 : 1000,
      },
      expressSettings: {
        ...currentSettings.expressSettings,
        combineTTSItems: settings.simpleExpressMode,
        disableExpressRepeat: !settings.repeatButton,
        playWhenAdding: settings.immediateFeedback,
      },
      advancedSettings: {
        ...currentSettings.advancedSettings,
        hideAllImages: settings.minimalDistractions,
      },
    };
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View
      style={[
        styles.section,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderSwitch = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <View
      style={[styles.settingItem, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: themeColors.text }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.settingDescription,
              { color: themeColors.textSecondary },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: themeColors.border, true: themeColors.primary }}
        thumbColor={value ? themeColors.surface : themeColors.textSecondary}
        disabled={isLoading}
      />
    </View>
  );

  const renderColorPicker = () => (
    <Modal
      visible={showColorPicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View
        style={[
          styles.colorPickerContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <View
          style={[
            styles.colorPickerHeader,
            {
              backgroundColor: themeColors.surface,
              borderBottomColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.colorPickerTitle, { color: themeColors.text }]}>
            Choose Color
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowColorPicker(false)}
          >
            <Ionicons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.colorGrid}>
          {[
            themeColors.highlight,
            themeColors.error,
            themeColors.info,
            themeColors.primary,
            themeColors.secondary,
            themeColors.calm,
            themeColors.focus,
            themeColors.success,
            themeColors.warning,
            themeColors.disabled,
          ].map(color => (
            <TouchableOpacity
              key={color}
              style={[styles.colorOption, { backgroundColor: color }]}
              onPress={() => {
                // Apply color based on selectedColorType
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
          <Ionicons name="heart" size={32} color={themeColors.surface} />
          <Text style={[styles.headerTitle, { color: themeColors.surface }]}>
            Autism-Optimized Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.surface }]}>
            Settings specifically designed for children with autism and
            non-verbal users
          </Text>
        </View>

        {/* Visual Settings */}
        {renderSection(
          'Visual Settings',
          <>
            {renderSwitch(
              'High Contrast Mode',
              autismSettings.highContrast,
              value => updateAutismSetting('highContrast', value),
              'Use high contrast colors for better visibility'
            )}
            {renderSwitch(
              'Large Buttons',
              autismSettings.largeButtons,
              value => updateAutismSetting('largeButtons', value),
              'Make buttons larger and easier to tap'
            )}
            {renderSwitch(
              'Bright Colors',
              autismSettings.brightColors,
              value => updateAutismSetting('brightColors', value),
              'Use bright, clear colors for better visibility'
            )}
            {renderSwitch(
              'Clear Borders',
              autismSettings.clearBorders,
              value => updateAutismSetting('clearBorders', value),
              'Add clear borders around buttons and elements'
            )}
            {renderSwitch(
              'Minimal Distractions',
              autismSettings.minimalDistractions,
              value => updateAutismSetting('minimalDistractions', value),
              'Hide unnecessary images and elements'
            )}
          </>
        )}

        {/* Audio Settings */}
        {renderSection(
          'Audio Settings',
          <>
            {renderSwitch(
              'Clear Audio Feedback',
              autismSettings.clearAudioFeedback,
              value => updateAutismSetting('clearAudioFeedback', value),
              'Provide clear audio feedback for all actions'
            )}
            {renderSwitch(
              'Consistent Sounds',
              autismSettings.consistentSounds,
              value => updateAutismSetting('consistentSounds', value),
              'Use the same sounds for similar actions'
            )}
            {renderSwitch(
              'Volume Boost',
              autismSettings.volumeBoost,
              value => updateAutismSetting('volumeBoost', value),
              'Increase volume for better hearing'
            )}
            {renderSwitch(
              'Audio Cues',
              autismSettings.audioCues,
              value => updateAutismSetting('audioCues', value),
              'Play audio cues during scanning and navigation'
            )}
          </>
        )}

        {/* Interaction Settings */}
        {renderSection(
          'Interaction Settings',
          <>
            {renderSwitch(
              'Predictable Interactions',
              autismSettings.predictableInteractions,
              value => updateAutismSetting('predictableInteractions', value),
              'Make all interactions predictable and consistent'
            )}
            {renderSwitch(
              'Immediate Feedback',
              autismSettings.immediateFeedback,
              value => updateAutismSetting('immediateFeedback', value),
              'Provide immediate feedback for all actions'
            )}
            {renderSwitch(
              'Error Prevention',
              autismSettings.errorPrevention,
              value => updateAutismSetting('errorPrevention', value),
              'Prevent accidental actions and errors'
            )}
            {renderSwitch(
              'Simplified Navigation',
              autismSettings.simplifiedNavigation,
              value => updateAutismSetting('simplifiedNavigation', value),
              'Simplify navigation and reduce complexity'
            )}
          </>
        )}

        {/* Scanning Settings */}
        {renderSection(
          'Switch Scanning Settings',
          <>
            {renderSwitch(
              'Slow Scanning',
              autismSettings.slowScanning,
              value => updateAutismSetting('slowScanning', value),
              'Use slower scanning speed for better control'
            )}
            {renderSwitch(
              'Clear Highlighting',
              autismSettings.clearHighlighting,
              value => updateAutismSetting('clearHighlighting', value),
              'Use bright, clear highlighting during scanning'
            )}
            {renderSwitch(
              'Audio Scanning',
              autismSettings.audioScanning,
              value => updateAutismSetting('audioScanning', value),
              'Play audio during scanning sequence'
            )}
            {renderSwitch(
              'Haptic Feedback',
              autismSettings.hapticFeedback,
              value => updateAutismSetting('hapticFeedback', value),
              'Provide vibration feedback for actions'
            )}
          </>
        )}

        {/* Express Page Settings */}
        {renderSection(
          'Express Page Settings',
          <>
            {renderSwitch(
              'Simple Express Mode',
              autismSettings.simpleExpressMode,
              value => updateAutismSetting('simpleExpressMode', value),
              'Use simplified express page mode'
            )}
            {renderSwitch(
              'Visual Sentence Building',
              autismSettings.visualSentenceBuilding,
              value => updateAutismSetting('visualSentenceBuilding', value),
              'Show visual representation of sentence building'
            )}
            {renderSwitch(
              'Repeat Button',
              autismSettings.repeatButton,
              value => updateAutismSetting('repeatButton', value),
              'Show repeat button for sentences'
            )}
            {renderSwitch(
              'Clear Word Display',
              autismSettings.clearWordDisplay,
              value => updateAutismSetting('clearWordDisplay', value),
              'Display words clearly in the sentence bar'
            )}
          </>
        )}

        {/* Advanced Features */}
        {renderSection(
          'Advanced Features',
          <>
            {renderSwitch(
              'Routine Mode',
              autismSettings.routineMode,
              value => updateAutismSetting('routineMode', value),
              'Enable routine-based communication patterns'
            )}
            {renderSwitch(
              'Break Reminders',
              autismSettings.breakReminders,
              value => updateAutismSetting('breakReminders', value),
              'Remind users to take breaks during long sessions'
            )}
            {renderSwitch(
              'Progress Tracking',
              autismSettings.progressTracking,
              value => updateAutismSetting('progressTracking', value),
              'Track communication progress and improvements'
            )}
            {renderSwitch(
              'Parent Controls',
              autismSettings.parentControls,
              value => updateAutismSetting('parentControls', value),
              'Enable additional controls for parents and caregivers'
            )}
          </>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle"
              size={24}
              color={themeColors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Autism-Optimized Features</Text>
              <Text style={styles.infoText}>
                These settings are specifically designed to make the app more
                accessible and user-friendly for children with autism and
                non-verbal users. They focus on predictability, clear visual
                feedback, and simplified interactions.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {renderColorPicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
    paddingHorizontal: SPACING.LG,
    // backgroundColor, borderBottomColor will be set dynamically based on theme
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically based on theme
    marginTop: SPACING.XS,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    // backgroundColor, borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    padding: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginBottom: SPACING.MD,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    // backgroundColor, borderBottomColor will be set dynamically based on theme
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically based on theme
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
    marginTop: SPACING.XS,
    lineHeight: 16,
  },
  infoSection: {
    marginVertical: SPACING.XL,
    paddingHorizontal: SPACING.LG,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.MD,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  infoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  colorPickerContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  colorPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  colorPickerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  closeButton: {
    padding: SPACING.SM,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.LG,
    justifyContent: 'space-around',
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: SPACING.SM,
    borderWidth: 2,
    borderColor: themeColors.border,
  },
});
