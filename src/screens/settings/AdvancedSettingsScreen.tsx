// Advanced Settings Screen
// Experimental features and advanced configuration options

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
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
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { DatabaseService } from '../../services/databaseService';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';

interface AdvancedSettings {
  hideAllImages: boolean;
  showTouchesWhenExternalDisplay: boolean;
  switchamajigSupport: boolean;
  quizSupport: boolean;
  enableEightQuickButtons: boolean;
  tactileTalkSupport: boolean;
  disableInternetSearch: boolean;
  goToMainMenuOnNextStartup: boolean;
  experimentalFeatures: boolean;
}

export default function AdvancedSettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AdvancedSettings>({
    hideAllImages: false,
    showTouchesWhenExternalDisplay: false,
    switchamajigSupport: false,
    quizSupport: true,
    enableEightQuickButtons: false,
    tactileTalkSupport: false,
    disableInternetSearch: false,
    goToMainMenuOnNextStartup: false,
    experimentalFeatures: false,
  });

  const databaseService = DatabaseService.getInstance();
  const supabaseService = SupabaseDatabaseService.getInstance();

  useEffect(() => {
    if (currentUser?.settings?.advancedSettings) {
      setSettings(currentUser.settings.advancedSettings);
    }
  }, [currentUser]);

  const updateSetting = async (key: keyof AdvancedSettings, value: boolean) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      // Update user settings in database
      const updatedUserSettings = {
        ...currentUser.settings,
        advancedSettings: updatedSettings,
      };

      await databaseService.updateUser(currentUser.id, {
        settings: updatedUserSettings,
      });

      await supabaseService.updateUser(currentUser.id, {
        settings: updatedUserSettings,
      });

      Alert.alert('Success', 'Advanced settings updated successfully');
    } catch (error) {
      console.error('Error updating advanced settings:', error);
      Alert.alert('Error', 'Failed to update advanced settings');
      // Revert the change
      setSettings(settings);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSwitch = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string,
    isExperimental: boolean = false
  ) => (
    <View
      style={[styles.settingItem, isExperimental && styles.experimentalItem]}
    >
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingTitle}>{title}</Text>
          {isExperimental && (
            <View style={styles.experimentalBadge}>
              <Text style={styles.experimentalBadgeText}>EXPERIMENTAL</Text>
            </View>
          )}
        </View>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
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

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Advanced Settings',
      'Are you sure you want to reset all advanced settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const defaultSettings: AdvancedSettings = {
                hideAllImages: false,
                showTouchesWhenExternalDisplay: false,
                switchamajigSupport: false,
                quizSupport: true,
                enableEightQuickButtons: false,
                tactileTalkSupport: false,
                disableInternetSearch: false,
                goToMainMenuOnNextStartup: false,
                experimentalFeatures: false,
              };

              setSettings(defaultSettings);

              if (currentUser) {
                const updatedUserSettings = {
                  ...currentUser.settings,
                  advancedSettings: defaultSettings,
                };

                await databaseService.updateUser(currentUser.id, {
                  settings: updatedUserSettings,
                });

                await supabaseService.updateUser(currentUser.id, {
                  settings: updatedUserSettings,
                });
              }

              Alert.alert('Success', 'Advanced settings reset to defaults');
            } catch (error) {
              console.error('Error resetting advanced settings:', error);
              Alert.alert('Error', 'Failed to reset advanced settings');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Display Settings */}
        {renderSection(
          'Display Settings',
          <>
            {renderSwitch(
              'Hide All Images (Text Only)',
              settings.hideAllImages,
              value => updateSetting('hideAllImages', value),
              'Display only text content on buttons, hiding all images'
            )}
            {renderSwitch(
              'Show Touches When External Display Connected',
              settings.showTouchesWhenExternalDisplay,
              value => updateSetting('showTouchesWhenExternalDisplay', value),
              'Show visual feedback when connected to projector or external display'
            )}
          </>
        )}

        {/* Accessibility Settings */}
        {renderSection(
          'Accessibility Settings',
          <>
            {renderSwitch(
              'Switchamajig Support',
              settings.switchamajigSupport,
              value => updateSetting('switchamajigSupport', value),
              'Enable open-source switch control for household appliances',
              true
            )}
            {renderSwitch(
              'Tactile Talk Support',
              settings.tactileTalkSupport,
              value => updateSetting('tactileTalkSupport', value),
              'Support for physical objects with screen overlay transparencies',
              true
            )}
            {renderSwitch(
              'Enable Eight Quick Buttons',
              settings.enableEightQuickButtons,
              value => updateSetting('enableEightQuickButtons', value),
              'Show 8 quick buttons instead of 4 in the Quick Buttons feature'
            )}
          </>
        )}

        {/* Educational Features */}
        {renderSection(
          'Educational Features',
          <>
            {renderSwitch(
              'Quiz Support',
              settings.quizSupport,
              value => updateSetting('quizSupport', value),
              'Enable quiz functionality for educational assessment'
            )}
          </>
        )}

        {/* Administrative Settings */}
        {renderSection(
          'Administrative Settings',
          <>
            {renderSwitch(
              'Disable Internet Search',
              settings.disableInternetSearch,
              value => updateSetting('disableInternetSearch', value),
              'Disable internet search functionality'
            )}
            {renderSwitch(
              'Go to Main Menu on Next Startup',
              settings.goToMainMenuOnNextStartup,
              value => updateSetting('goToMainMenuOnNextStartup', value),
              'Return to main menu instead of last used page on app startup'
            )}
          </>
        )}

        {/* Experimental Features */}
        {renderSection(
          'Experimental Features',
          <>
            {renderSwitch(
              'Enable Experimental Features',
              settings.experimentalFeatures,
              value => updateSetting('experimentalFeatures', value),
              'Enable experimental features that may be unstable',
              true
            )}
          </>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="warning" size={24} color={themeColors.warning} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Advanced Settings</Text>
              <Text style={styles.infoText}>
                These settings control advanced features and experimental
                functionality. Some features may affect app performance or
                stability. Use with caution.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleResetSettings}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={20} color={themeColors.error} />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
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
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  experimentalItem: {
    borderColor: themeColors.warning,
    backgroundColor: '#FFF8E1',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  settingTitle: {
    ...TYPOGRAPHY.SUBHEADING,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  experimentalBadge: {
    backgroundColor: themeColors.warning,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    marginLeft: SPACING.XS,
  },
  experimentalBadgeText: {
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  settingDescription: {
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.textSecondary,
    lineHeight: 16,
  },
  infoSection: {
    marginTop: SPACING.LG,
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
    marginLeft: SPACING.SM,
  },
  infoTitle: {
    ...TYPOGRAPHY.SUBHEADING,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  infoText: {
    ...TYPOGRAPHY.BODY,
    color: themeColors.textSecondary,
    lineHeight: 20,
  },
  actionSection: {
    marginTop: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
  },
  resetButton: {
    backgroundColor: themeColors.surface,
    borderColor: themeColors.error,
  },
  resetButtonText: {
    ...TYPOGRAPHY.SUBHEADING,
    color: themeColors.error,
    marginLeft: SPACING.SM,
    fontWeight: '600',
  },
});
