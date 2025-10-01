// Express Settings Screen
// Configure advanced Express Page features similar to GoTalk NOW

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import { ExpressSettings } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import { DatabaseService } from '../../services/databaseService';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';

export default function ExpressSettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [expressSettings, setExpressSettings] = useState<ExpressSettings>({
    combineTTSItems: true,
    combineAsWordFragments: false,
    rightToLeftAccumulation: false,
    playWhenAdding: false,
    scanExpressBar: false,
    expressBarLocation: 'bottom',
    disableExpressRepeat: false,
    createNewPagesAsExpress: false,
  });

  const databaseService = DatabaseService.getInstance();
  const supabaseService = SupabaseDatabaseService.getInstance();

  useEffect(() => {
    if (currentUser?.settings?.expressSettings) {
      setExpressSettings(currentUser.settings.expressSettings);
    }
  }, [currentUser]);

  const updateSetting = async (
    key: keyof ExpressSettings,
    value: boolean | string
  ) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const updatedSettings = { ...expressSettings, [key]: value };
      setExpressSettings(updatedSettings);

      // Update user settings in database
      const updatedUserSettings = {
        ...currentUser.settings,
        expressSettings: updatedSettings,
      };

      const updatedUser = {
        ...currentUser,
        createdAt:
          typeof currentUser.createdAt === 'string'
            ? new Date(currentUser.createdAt)
            : currentUser.createdAt,
        settings: {
          ...currentUser.settings,
          expressSettings: updatedSettings,
          voiceSettings: currentUser.settings?.voiceSettings || {
            ttsVoice: 'default',
            ttsSpeed: 1.0,
            ttsPitch: 1.0,
            volume: 1.0,
            autoRepeat: false,
            repeatDelay: 1.0,
          },
          visualSettings: currentUser.settings?.visualSettings || {
            highContrast: false,
            largeText: false,
            buttonSize: 'medium',
            gridSpacing: 10,
            theme: 'light',
            backgroundColor: themeColors.surface,
            textColor: themeColors.text,
            borderColor: themeColors.border,
            calmMode: false,
            reduceMotion: false,
            sensoryFriendly: false,
          },
          accessibilitySettings: currentUser.settings
            ?.accessibilitySettings || {
            switchScanning: false,
            scanSpeed: 1.0,
            scanMode: 'automatic',
            scanDirection: 'row-column',
            holdToActivate: false,
            touchSensitivity: 0.5,
            oneHandedMode: false,
            reduceMotion: false,
            screenReader: {
              enabled: false,
              announceChanges: false,
              announceButtons: false,
            },
            gestures: {
              enabled: false,
              customGestures: {},
            },
          },
          scanningSettings: currentUser.settings?.scanningSettings || {
            enabled: false,
            speed: 1.0,
            mode: 'automatic',
            direction: 'row-column',
            visualIndicator: false,
            audioIndicator: false,
            externalSwitch: false,
          },
          audioSettings: currentUser.settings?.audioSettings || {
            volume: 1.0,
            backgroundMusic: false,
            musicVolume: 0.5,
            audioFeedback: true,
            noiseReduction: false,
          },
          advancedSettings: currentUser.settings?.advancedSettings || {
            hideAllImages: false,
            showTouchesWhenExternalDisplay: false,
            switchamajigSupport: false,
            quizSupport: false,
            enableEightQuickButtons: false,
            tactileTalkSupport: false,
            disableInternetSearch: false,
            goToMainMenuOnNextStartup: false,
            experimentalFeatures: false,
          },
        },
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

      Alert.alert('Success', 'Express settings updated successfully');
    } catch (error) {
      console.error('Error updating express settings:', error);
      Alert.alert('Error', 'Failed to update express settings');
      // Revert the change
      setExpressSettings(expressSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
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
      style={[
        styles.settingItem,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
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

  const renderLocationSelector = () => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>Express Bar Location</Text>
        <Text style={styles.settingDescription}>
          Choose where the express bar appears on the screen
        </Text>
      </View>
      <View style={styles.locationSelector}>
        <TouchableOpacity
          style={[
            styles.locationOption,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
            expressSettings.expressBarLocation === 'top' &&
              styles.locationOptionSelected,
          ]}
          onPress={() => updateSetting('expressBarLocation', 'top')}
          disabled={isLoading}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={
              expressSettings.expressBarLocation === 'top'
                ? themeColors.surface
                : themeColors.textSecondary
            }
          />
          <Text
            style={[
              styles.locationOptionText,
              { color: themeColors.text },
              expressSettings.expressBarLocation === 'top' &&
                styles.locationOptionTextSelected,
            ]}
          >
            Top
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.locationOption,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
            expressSettings.expressBarLocation === 'bottom' &&
              styles.locationOptionSelected,
          ]}
          onPress={() => updateSetting('expressBarLocation', 'bottom')}
          disabled={isLoading}
        >
          <Ionicons
            name="arrow-down"
            size={20}
            color={
              expressSettings.expressBarLocation === 'bottom'
                ? themeColors.surface
                : themeColors.textSecondary
            }
          />
          <Text
            style={[
              styles.locationOptionText,
              { color: themeColors.text },
              expressSettings.expressBarLocation === 'bottom' &&
                styles.locationOptionTextSelected,
            ]}
          >
            Bottom
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Text-to-Speech Settings */}
        {renderSection(
          'Text-to-Speech Settings',
          <>
            {renderSwitch(
              'Combine TTS Items When Speaking',
              expressSettings.combineTTSItems,
              value => updateSetting('combineTTSItems', value),
              'Read messages as normal sentences (ON) or as separate words (OFF)'
            )}
            {renderSwitch(
              'Combine as Word Fragments',
              expressSettings.combineAsWordFragments,
              value => updateSetting('combineAsWordFragments', value),
              'Treat letter combinations as words (ON) or individual letter sounds (OFF)'
            )}
          </>
        )}

        {/* Language Settings */}
        {renderSection(
          'Language Settings',
          <>
            {renderSwitch(
              'Right to Left Accumulation',
              expressSettings.rightToLeftAccumulation,
              value => updateSetting('rightToLeftAccumulation', value),
              'Use for languages that read right-to-left instead of left-to-right'
            )}
          </>
        )}

        {/* Behavior Settings */}
        {renderSection(
          'Behavior Settings',
          <>
            {renderSwitch(
              'Play When Adding',
              expressSettings.playWhenAdding,
              value => updateSetting('playWhenAdding', value),
              'Automatically read messages as they are added to the Express Bar'
            )}
            {renderSwitch(
              'Disable Express Repeat',
              expressSettings.disableExpressRepeat,
              value => updateSetting('disableExpressRepeat', value),
              'Remove the Repeat button from Express Bar pages'
            )}
          </>
        )}

        {/* Accessibility Settings */}
        {renderSection(
          'Accessibility Settings',
          <>
            {renderSwitch(
              'Scan Express Bar',
              expressSettings.scanExpressBar,
              value => updateSetting('scanExpressBar', value),
              'Include the Express Page message bar in the scanning sequence'
            )}
          </>
        )}

        {/* Layout Settings */}
        {renderSection(
          'Layout Settings',
          <>
            {renderLocationSelector()}
            {renderSwitch(
              'Create New Pages as Express Pages',
              expressSettings.createNewPagesAsExpress,
              value => updateSetting('createNewPagesAsExpress', value),
              'Default new pages to Express Page type'
            )}
          </>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={24}
              color={themeColors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: themeColors.text }]}>
                Express Page Features
              </Text>
              <Text
                style={[styles.infoText, { color: themeColors.textSecondary }]}
              >
                Express Pages allow users to build sentences by selecting words
                that accumulate in a speech bar. These settings control how the
                text-to-speech behaves and how the interface responds to user
                input.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  content: {
    flex: 1,
    padding: SPACING.MD,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADING_3,
    // color will be set dynamically based on theme
    marginBottom: SPACING.MD,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingTitle: {
    ...TYPOGRAPHY.SUBHEADING,
    // color will be set dynamically based on theme
    marginBottom: SPACING.XS,
  },
  settingDescription: {
    ...TYPOGRAPHY.CAPTION,
    // color will be set dynamically based on theme
    lineHeight: 16,
  },
  locationSelector: {
    flexDirection: 'row',
    // backgroundColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.SM,
    padding: 2,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  locationOptionSelected: {
    // backgroundColor will be set dynamically based on theme
  },
  locationOptionText: {
    ...TYPOGRAPHY.CAPTION,
    // color will be set dynamically based on theme
    marginLeft: SPACING.XS,
  },
  locationOptionTextSelected: {
    // color will be set dynamically based on theme
  },
  infoSection: {
    marginTop: SPACING.LG,
  },
  infoCard: {
    flexDirection: 'row',
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  infoTitle: {
    ...TYPOGRAPHY.SUBHEADING,
    // color will be set dynamically based on theme
    marginBottom: SPACING.XS,
  },
  infoText: {
    ...TYPOGRAPHY.BODY,
    // color will be set dynamically based on theme
    lineHeight: 20,
  },
});
