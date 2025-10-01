// Visual Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import { VisualSettings } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export default function VisualSettingsScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Visual settings
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [buttonSize, setButtonSize] = useState<
    'small' | 'medium' | 'large' | 'extra-large'
  >('medium');
  const [gridSpacing, setGridSpacing] = useState(10);

  const [backgroundColor, setBackgroundColor] = useState(
    themeColors.background
  );
  const [textColor, setTextColor] = useState(themeColors.text);
  const [borderColor, setBorderColor] = useState(themeColors.border);
  const [currentTheme, setCurrentTheme] = useState<
    'light' | 'dark' | 'high-contrast' | 'system'
  >('system');

  useEffect(() => {
    if (currentUser?.settings) {
      const visual = currentUser.settings.visualSettings;

      setHighContrast(visual.highContrast);
      setLargeText(visual.largeText);
      setButtonSize(visual.buttonSize);
      setGridSpacing(visual.gridSpacing);
      // Use theme-aware colors instead of stored hardcoded colors
      setBackgroundColor(themeColors.background);
      setTextColor(themeColors.text);
      setBorderColor(themeColors.border);
      setCurrentTheme(visual.theme);
    }
  }, [currentUser, themeColors, setCurrentTheme]);

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user selected');
      return;
    }

    try {
      setIsLoading(true);

      const updatedVisualSettings: VisualSettings = {
        highContrast,
        largeText,
        buttonSize,
        gridSpacing,
        backgroundColor,
        textColor,
        borderColor,
        theme: theme,
        calmMode: false,
        reduceMotion: false,
        sensoryFriendly: false,
      };

      const updatedUser = {
        ...currentUser,
        createdAt:
          typeof currentUser.createdAt === 'string'
            ? new Date(currentUser.createdAt)
            : currentUser.createdAt,
        settings: {
          ...currentUser.settings,
          visualSettings: updatedVisualSettings,
          voiceSettings: currentUser.settings?.voiceSettings || {
            ttsVoice: 'default',
            ttsSpeed: 1.0,
            ttsPitch: 1.0,
            volume: 1.0,
            autoRepeat: false,
            repeatDelay: 1.0,
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
          expressSettings: currentUser.settings?.expressSettings || {
            combineTTSItems: true,
            combineAsWordFragments: false,
            rightToLeftAccumulation: false,
            playWhenAdding: false,
            scanExpressBar: false,
            expressBarLocation: 'bottom',
            disableExpressRepeat: false,
            createNewPagesAsExpress: false,
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

      // Update user in database
      await DatabaseService.updateUser(updatedUser);

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

      Alert.alert('Success', 'Visual settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving visual settings:', error);
      Alert.alert('Error', 'Failed to save visual settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (
    newTheme: 'light' | 'dark' | 'high-contrast' | 'system'
  ) => {
    setCurrentTheme(newTheme);

    // Update colors based on theme
    const newThemeColors = getThemeColors(newTheme);
    setBackgroundColor(newThemeColors.background);
    setTextColor(newThemeColors.text);
    setBorderColor(newThemeColors.border);

    if (newTheme === 'high-contrast') {
      setHighContrast(true);
    }

    // Optimistically apply theme to Redux so the app updates immediately
    if (currentUser?.settings) {
      const updatedUser = {
        ...currentUser,
        settings: {
          ...currentUser.settings,
          visualSettings: {
            ...currentUser.settings.visualSettings,
            theme: currentTheme,
            backgroundColor: newThemeColors.background,
            textColor: newThemeColors.text,
            borderColor: newThemeColors.border,
          },
        },
        updatedAt: new Date().toISOString(),
      };
      dispatch(setCurrentUser(updatedUser));
    }
  };

  const buttonSizes = [
    {
      value: 'small',
      label: 'Small',
      description: 'Compact buttons for small screens',
    },
    { value: 'medium', label: 'Medium', description: 'Standard button size' },
    {
      value: 'large',
      label: 'Large',
      description: 'Larger buttons for easier touch',
    },
    {
      value: 'extra-large',
      label: 'Extra Large',
      description: 'Maximum size for accessibility',
    },
  ];

  const themes = [
    {
      value: 'system',
      label: 'System',
      description: 'Follows device theme settings',
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Light background with dark text',
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark background with light text',
    },
    {
      value: 'high-contrast',
      label: 'High Contrast',
      description: 'Maximum contrast for visibility',
    },
  ];

  const colorPresets = [
    {
      name: 'Blue',
      bg: themeColors.calm,
      text: themeColors.primary,
      border: themeColors.primary,
    },
    {
      name: 'Green',
      bg: themeColors.calm,
      text: themeColors.secondary,
      border: themeColors.secondary,
    },
    {
      name: 'Purple',
      bg: themeColors.calm,
      text: themeColors.info,
      border: themeColors.info,
    },
    {
      name: 'Orange',
      bg: themeColors.calm,
      text: themeColors.warning,
      border: themeColors.warning,
    },
    {
      name: 'Pink',
      bg: themeColors.calm,
      text: themeColors.error,
      border: themeColors.error,
    },
  ];

  const renderSettingRow = (
    label: string,
    children: React.ReactNode,
    description?: string
  ) => (
    <View
      style={[
        styles.settingRow,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: themeColors.text }]}>
          {label}
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
      <View style={styles.settingControl}>{children}</View>
    </View>
  );

  const renderSliderSetting = (
    label: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number = 0,
    max: number = 50,
    step: number = 1,
    formatValue?: (value: number) => string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>
          {formatValue ? formatValue(value) : `${value}px`}
        </Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          disabled={false}
          minimumTrackTintColor={themeColors.primary}
          maximumTrackTintColor={themeColors.border}
          thumbTintColor={themeColors.primary}
        />
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Ionicons
            name={isEditing ? 'close' : 'pencil'}
            size={24}
            color={themeColors.surface}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Visual Settings
        </Text>
        {isEditing && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color={themeColors.surface} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Theme
          </Text>

          <View style={styles.themeContainer}>
            {themes.map(themeOption => (
              <TouchableOpacity
                key={themeOption.value}
                style={[
                  styles.themeButton,
                  currentTheme === themeOption.value &&
                    styles.themeButtonActive,
                ]}
                onPress={() =>
                  handleThemeChange(
                    themeOption.value as
                      | 'light'
                      | 'dark'
                      | 'high-contrast'
                      | 'system'
                  )
                }
              >
                <View
                  style={[
                    styles.themePreview,
                    {
                      backgroundColor: getThemeColors(
                        themeOption.value as
                          | 'light'
                          | 'dark'
                          | 'high-contrast'
                          | 'system'
                      ).background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themePreviewText,
                      {
                        color: getThemeColors(
                          themeOption.value as
                            | 'light'
                            | 'dark'
                            | 'high-contrast'
                            | 'system'
                        ).text,
                      },
                    ]}
                  >
                    Aa
                  </Text>
                </View>
                <Text
                  style={[
                    styles.themeLabel,
                    { color: themeColors.text },
                    currentTheme === themeOption.value &&
                      styles.themeLabelActive,
                  ]}
                >
                  {themeOption.label}
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {themeOption.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Accessibility
          </Text>

          {renderSettingRow(
            'High Contrast',
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                highContrast ? themeColors.surface : themeColors.textSecondary
              }
            />,
            'Increase contrast for better visibility'
          )}

          {renderSettingRow(
            'Large Text',
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                largeText ? themeColors.surface : themeColors.textSecondary
              }
            />,
            'Use larger text throughout the app'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Button Settings</Text>

          <View style={styles.buttonSizeContainer}>
            {buttonSizes.map(size => (
              <TouchableOpacity
                key={size.value}
                style={[
                  styles.buttonSizeOption,
                  buttonSize === size.value && styles.buttonSizeOptionActive,
                ]}
                onPress={() => {
                  const newSize = size.value as any;
                  setButtonSize(newSize);
                  if (currentUser?.settings) {
                    const updatedUser = {
                      ...currentUser,
                      createdAt:
                        typeof currentUser.createdAt === 'string'
                          ? new Date(currentUser.createdAt)
                          : currentUser.createdAt,
                      settings: {
                        ...currentUser.settings,
                        visualSettings: {
                          ...currentUser.settings.visualSettings,
                          buttonSize: newSize,
                        },
                      },
                      updatedAt: new Date(),
                    };
                    dispatch(setCurrentUser(updatedUser));
                  }
                }}
              >
                <View
                  style={[
                    styles.buttonSizePreview,
                    {
                      width:
                        size.value === 'small'
                          ? 30
                          : size.value === 'medium'
                            ? 40
                            : size.value === 'large'
                              ? 50
                              : 60,
                      height:
                        size.value === 'small'
                          ? 30
                          : size.value === 'medium'
                            ? 40
                            : size.value === 'large'
                              ? 50
                              : 60,
                    },
                  ]}
                >
                  <Text style={styles.buttonSizePreviewText}>Btn</Text>
                </View>
                <Text
                  style={[
                    styles.buttonSizeLabel,
                    buttonSize === size.value && styles.buttonSizeLabelActive,
                  ]}
                >
                  {size.label}
                </Text>
                <Text style={styles.buttonSizeDescription}>
                  {size.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderSliderSetting(
            'Grid Spacing',
            gridSpacing,
            setGridSpacing,
            5,
            30,
            1,
            value => `${value}px`
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors</Text>

          <View style={styles.colorPresets}>
            <Text style={styles.colorPresetsTitle}>Color Presets</Text>
            <View style={styles.colorPresetsList}>
              {colorPresets.map(preset => (
                <TouchableOpacity
                  key={preset.name}
                  style={styles.colorPreset}
                  onPress={() => {
                    setBackgroundColor(preset.bg);
                    setTextColor(preset.text);
                    setBorderColor(preset.border);
                  }}
                >
                  <View
                    style={[
                      styles.colorPresetPreview,
                      { backgroundColor: preset.bg },
                    ]}
                  >
                    <Text
                      style={[styles.colorPresetText, { color: preset.text }]}
                    >
                      Aa
                    </Text>
                  </View>
                  <Text style={styles.colorPresetName}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.colorInputs}>
            <View style={styles.colorInputRow}>
              <Text style={styles.colorLabel}>Background</Text>
              <View style={styles.colorInputContainer}>
                <View style={[styles.colorSwatch, { backgroundColor }]} />
                <TextInput
                  style={styles.colorInput}
                  value={backgroundColor}
                  onChangeText={setBackgroundColor}
                  placeholder={themeColors.surface}
                  editable={true}
                />
              </View>
            </View>

            <View style={styles.colorInputRow}>
              <Text style={styles.colorLabel}>Text</Text>
              <View style={styles.colorInputContainer}>
                <View
                  style={[styles.colorSwatch, { backgroundColor: textColor }]}
                />
                <TextInput
                  style={styles.colorInput}
                  value={textColor}
                  onChangeText={setTextColor}
                  placeholder={themeColors.text}
                  editable={true}
                />
              </View>
            </View>

            <View style={styles.colorInputRow}>
              <Text style={styles.colorLabel}>Border</Text>
              <View style={styles.colorInputContainer}>
                <View
                  style={[styles.colorSwatch, { backgroundColor: borderColor }]}
                />
                <TextInput
                  style={styles.colorInput}
                  value={borderColor}
                  onChangeText={setBorderColor}
                  placeholder={themeColors.border}
                  editable={true}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>

          <View style={[styles.previewContainer, { backgroundColor }]}>
            <View style={[styles.previewButton, { borderColor }]}>
              <Text style={[styles.previewButtonText, { color: textColor }]}>
                Sample Button
              </Text>
            </View>
            <Text style={[styles.previewText, { color: textColor }]}>
              This is how your interface will look with the current settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor will be set dynamically
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    paddingTop: 50,
  },
  editButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: SPACING.SM,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically
    marginBottom: SPACING.MD,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    // backgroundColor will be set dynamically
    padding: SPACING.MD,
    marginHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  themeButtonActive: {
    // borderColor and backgroundColor will be set dynamically
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  themePreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically
    marginBottom: SPACING.XS,
  },
  themeLabelActive: {
    // color will be set dynamically
  },
  themeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor will be set dynamically
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically
    marginBottom: SPACING.XS,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically
    lineHeight: 16,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  sliderContainer: {
    width: 120,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  sliderThumb: {
    // backgroundColor will be set dynamically
  },
  buttonSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  buttonSizeOption: {
    flex: 1,
    alignItems: 'center',
    // backgroundColor will be set dynamically
    padding: SPACING.MD,
    marginHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  buttonSizeOptionActive: {
    // borderColor and backgroundColor will be set dynamically
  },
  buttonSizePreview: {
    // backgroundColor will be set dynamically
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  buttonSizePreviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    // color will be set dynamically
  },
  buttonSizeLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically
    marginBottom: SPACING.XS,
  },
  buttonSizeLabelActive: {
    // color will be set dynamically
  },
  buttonSizeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically
    textAlign: 'center',
  },
  colorPresets: {
    marginBottom: SPACING.MD,
  },
  colorPresetsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically
    marginBottom: SPACING.SM,
  },
  colorPresetsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorPreset: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.XS,
  },
  colorPresetPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XS,
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  colorPresetText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorPresetName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically
  },
  colorInputs: {
    // backgroundColor will be set dynamically
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  colorLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically
    width: 80,
  },
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    // borderColor will be set dynamically
    marginRight: SPACING.SM,
  },
  colorInput: {
    flex: 1,
    // backgroundColor will be set dynamically
    borderWidth: 1,
    // borderColor will be set dynamically
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically
  },
  previewContainer: {
    // backgroundColor will be set dynamically
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    // borderColor will be set dynamically
    alignItems: 'center',
  },
  previewButton: {
    // backgroundColor will be set dynamically
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 2,
    marginBottom: SPACING.MD,
  },
  previewButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically
  },
  previewText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    lineHeight: 20,
  },
});
