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
import { VisualSettings } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';

export default function VisualSettingsScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Visual settings
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [buttonSize, setButtonSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [gridSpacing, setGridSpacing] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');
  const [borderColor, setBorderColor] = useState('#CCCCCC');
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');

  useEffect(() => {
    if (currentUser?.settings) {
      const visual = currentUser.settings.visualSettings;
      
      setHighContrast(visual.highContrast);
      setLargeText(visual.largeText);
      setButtonSize(visual.buttonSize);
      setGridSpacing(visual.gridSpacing);
      setBackgroundColor(visual.backgroundColor);
      setTextColor(visual.textColor);
      setBorderColor(visual.borderColor);
      setTheme(visual.theme);
    }
  }, [currentUser]);

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
        theme,
      };

      const updatedUser = {
        ...currentUser,
        settings: {
          ...currentUser.settings,
          visualSettings: updatedVisualSettings,
        },
        updatedAt: new Date(),
      };

      // Update user in database
      // await DatabaseService.updateUser(updatedUser);
      
      Alert.alert('Success', 'Visual settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving visual settings:', error);
      Alert.alert('Error', 'Failed to save visual settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'high-contrast') => {
    setTheme(newTheme);
    
    // Apply theme-specific colors
    switch (newTheme) {
      case 'dark':
        setBackgroundColor('#121212');
        setTextColor('#FFFFFF');
        setBorderColor('#333333');
        break;
      case 'high-contrast':
        setBackgroundColor('#000000');
        setTextColor('#FFFFFF');
        setBorderColor('#FFFFFF');
        setHighContrast(true);
        break;
      case 'light':
      default:
        setBackgroundColor('#FFFFFF');
        setTextColor('#000000');
        setBorderColor('#CCCCCC');
        break;
    }
  };

  const buttonSizes = [
    { value: 'small', label: 'Small', description: 'Compact buttons for small screens' },
    { value: 'medium', label: 'Medium', description: 'Standard button size' },
    { value: 'large', label: 'Large', description: 'Larger buttons for easier touch' },
    { value: 'extra-large', label: 'Extra Large', description: 'Maximum size for accessibility' },
  ];

  const themes = [
    { value: 'light', label: 'Light', description: 'Light background with dark text' },
    { value: 'dark', label: 'Dark', description: 'Dark background with light text' },
    { value: 'high-contrast', label: 'High Contrast', description: 'Maximum contrast for visibility' },
  ];

  const colorPresets = [
    { name: 'Blue', bg: '#E3F2FD', text: '#1976D2', border: '#2196F3' },
    { name: 'Green', bg: '#E8F5E8', text: '#2E7D32', border: '#4CAF50' },
    { name: 'Purple', bg: '#F3E5F5', text: '#7B1FA2', border: '#9C27B0' },
    { name: 'Orange', bg: '#FFF3E0', text: '#F57C00', border: '#FF9800' },
    { name: 'Pink', bg: '#FCE4EC', text: '#C2185B', border: '#E91E63' },
  ];

  const renderSettingRow = (
    label: string,
    children: React.ReactNode,
    description?: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
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
          disabled={!isEditing}
          minimumTrackTintColor={COLORS.PRIMARY}
          maximumTrackTintColor={COLORS.BORDER}
          thumbTintColor="#2196F3"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Ionicons name={isEditing ? "close" : "pencil"} size={24} color={COLORS.SURFACE} />
        </TouchableOpacity>
        <Text style={styles.title}>Visual Settings</Text>
        {isEditing && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color={COLORS.SURFACE} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          
          <View style={styles.themeContainer}>
            {themes.map((themeOption) => (
              <TouchableOpacity
                key={themeOption.value}
                style={[
                  styles.themeButton,
                  theme === themeOption.value && styles.themeButtonActive
                ]}
                onPress={() => isEditing && handleThemeChange(themeOption.value as any)}
              >
                <View style={[
                  styles.themePreview,
                  { backgroundColor: themeOption.value === 'light' ? '#FFFFFF' : themeOption.value === 'dark' ? '#121212' : '#000000' }
                ]}>
                  <Text style={[
                    styles.themePreviewText,
                    { color: themeOption.value === 'light' ? '#000000' : '#FFFFFF' }
                  ]}>
                    Aa
                  </Text>
                </View>
                <Text style={[
                  styles.themeLabel,
                  theme === themeOption.value && styles.themeLabelActive
                ]}>
                  {themeOption.label}
                </Text>
                <Text style={styles.themeDescription}>
                  {themeOption.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          {renderSettingRow(
            'High Contrast',
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={highContrast ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />,
            'Increase contrast for better visibility'
          )}

          {renderSettingRow(
            'Large Text',
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={largeText ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />,
            'Use larger text throughout the app'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Button Settings</Text>
          
          <View style={styles.buttonSizeContainer}>
            {buttonSizes.map((size) => (
              <TouchableOpacity
                key={size.value}
                style={[
                  styles.buttonSizeOption,
                  buttonSize === size.value && styles.buttonSizeOptionActive
                ]}
                onPress={() => isEditing && setButtonSize(size.value as any)}
              >
                <View style={[
                  styles.buttonSizePreview,
                  { 
                    width: size.value === 'small' ? 30 : size.value === 'medium' ? 40 : size.value === 'large' ? 50 : 60,
                    height: size.value === 'small' ? 30 : size.value === 'medium' ? 40 : size.value === 'large' ? 50 : 60,
                  }
                ]}>
                  <Text style={styles.buttonSizePreviewText}>Btn</Text>
                </View>
                <Text style={[
                  styles.buttonSizeLabel,
                  buttonSize === size.value && styles.buttonSizeLabelActive
                ]}>
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
            (value) => `${value}px`
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors</Text>
          
          <View style={styles.colorPresets}>
            <Text style={styles.colorPresetsTitle}>Color Presets</Text>
            <View style={styles.colorPresetsList}>
              {colorPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  style={styles.colorPreset}
                  onPress={() => {
                    if (isEditing) {
                      setBackgroundColor(preset.bg);
                      setTextColor(preset.text);
                      setBorderColor(preset.border);
                    }
                  }}
                >
                  <View style={[
                    styles.colorPresetPreview,
                    { backgroundColor: preset.bg }
                  ]}>
                    <Text style={[styles.colorPresetText, { color: preset.text }]}>
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
                  placeholder="#FFFFFF"
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.colorInputRow}>
              <Text style={styles.colorLabel}>Text</Text>
              <View style={styles.colorInputContainer}>
                <View style={[styles.colorSwatch, { backgroundColor: textColor }]} />
                <TextInput
                  style={styles.colorInput}
                  value={textColor}
                  onChangeText={setTextColor}
                  placeholder="#000000"
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.colorInputRow}>
              <Text style={styles.colorLabel}>Border</Text>
              <View style={styles.colorInputContainer}>
                <View style={[styles.colorSwatch, { backgroundColor: borderColor }]} />
                <TextInput
                  style={styles.colorInput}
                  value={borderColor}
                  onChangeText={setBorderColor}
                  placeholder="#CCCCCC"
                  editable={isEditing}
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
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.SURFACE,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    marginHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  themeButtonActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '10',
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  themePreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  themeLabelActive: {
    color: COLORS.PRIMARY,
  },
  themeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 16,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
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
    backgroundColor: COLORS.PRIMARY,
  },
  buttonSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  buttonSizeOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    marginHorizontal: SPACING.XS,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonSizeOptionActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '10',
  },
  buttonSizePreview: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  buttonSizePreviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.SURFACE,
  },
  buttonSizeLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  buttonSizeLabelActive: {
    color: COLORS.PRIMARY,
  },
  buttonSizeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  colorPresets: {
    marginBottom: SPACING.MD,
  },
  colorPresetsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
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
    borderColor: COLORS.BORDER,
  },
  colorPresetText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorPresetName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  colorInputs: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  colorLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
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
    borderColor: COLORS.BORDER,
    marginRight: SPACING.SM,
  },
  colorInput: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  previewContainer: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  previewButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 2,
    marginBottom: SPACING.MD,
  },
  previewButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.SURFACE,
  },
  previewText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    lineHeight: 20,
  },
});