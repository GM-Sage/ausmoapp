// User Settings Screen

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
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import {
  setCurrentUser,
  deserializeUserForService,
} from '../../store/slices/userSlice';
import {
  User,
  UserSettings,
  VoiceSettings,
  VisualSettings,
  AccessibilitySettings,
  AudioSettings,
} from '../../types';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  getDefaultSettings,
} from '../../constants';
import DatabaseService from '../../services/databaseService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export default function UserSettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser(deserializeUserForService(currentUser));
      setName(currentUser.name);
      setPhoto(currentUser.photo);
      // Merge user settings with defaults to ensure all properties exist
      setSettings({
        ...getDefaultSettings(theme),
        ...currentUser.settings,
        voiceSettings: {
          ...getDefaultSettings(theme).voiceSettings,
          ...currentUser.settings?.voiceSettings,
        },
        visualSettings: {
          ...getDefaultSettings(theme).visualSettings,
          ...currentUser.settings?.visualSettings,
        },
        accessibilitySettings: {
          ...getDefaultSettings(theme).accessibilitySettings,
          ...currentUser.settings?.accessibilitySettings,
        },
        audioSettings: {
          ...getDefaultSettings(theme).audioSettings,
          ...currentUser.settings?.audioSettings,
        },
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!user || !settings) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }

    try {
      setIsLoading(true);

      const updatedUser: User = {
        ...user,
        name: name.trim(),
        photo,
        settings,
        updatedAt: new Date(),
      };

      await DatabaseService.updateUser(updatedUser);
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
      Alert.alert('Success', 'Settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Change Photo', 'Select a photo source:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Camera',
        onPress: () => {
          // In a real app, you would use expo-image-picker or similar
          Alert.alert(
            'Camera',
            'Camera functionality would be implemented here'
          );
        },
      },
      {
        text: 'Photo Library',
        onPress: () => {
          // In a real app, you would use expo-image-picker or similar
          Alert.alert(
            'Photo Library',
            'Photo library selection would be implemented here'
          );
        },
      },
      {
        text: 'Remove Photo',
        onPress: () => {
          if (user) {
            setUser({ ...user, photo: undefined });
          }
          Alert.alert('Success', 'Photo removed successfully');
        },
      },
    ]);
  };

  const handleVoiceSettingsChange = (
    field: keyof VoiceSettings,
    value: any
  ) => {
    if (!settings) return;
    const updatedSettings = {
      ...settings,
      voiceSettings: {
        ...settings.voiceSettings,
        [field]: value,
      },
    };
    setSettings(updatedSettings);

    // Update Redux store immediately
    if (user) {
      const updatedUser = {
        ...user,
        settings: updatedSettings,
        updatedAt: new Date(),
      };
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
    }
  };

  const handleVisualSettingsChange = async (
    field: keyof VisualSettings,
    value: any
  ) => {
    if (!settings) return;
    const updatedSettings = {
      ...settings,
      visualSettings: {
        ...settings.visualSettings,
        [field]: value,
      },
    };
    setSettings(updatedSettings);

    // Update Redux store immediately
    if (user) {
      const updatedUser = {
        ...user,
        settings: updatedSettings,
        updatedAt: new Date(),
      };
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

      // Update database
      try {
        await DatabaseService.updateUser(updatedUser);
      } catch (error) {
        console.error('Failed to update visual settings:', error);
      }
    }
  };

  const handleAccessibilitySettingsChange = (
    field: keyof AccessibilitySettings,
    value: any
  ) => {
    if (!settings) return;
    const updatedSettings = {
      ...settings,
      accessibilitySettings: {
        ...settings.accessibilitySettings,
        [field]: value,
      },
    };
    setSettings(updatedSettings);

    // Update Redux store immediately
    if (user) {
      const updatedUser = {
        ...user,
        settings: updatedSettings,
        updatedAt: new Date(),
      };
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
    }
  };

  const handleAudioSettingsChange = (
    field: keyof AudioSettings,
    value: any
  ) => {
    if (!settings) return;
    const updatedSettings = {
      ...settings,
      audioSettings: {
        ...settings.audioSettings,
        [field]: value,
      },
    };
    setSettings(updatedSettings);

    // Update Redux store immediately
    if (user) {
      const updatedUser = {
        ...user,
        settings: updatedSettings,
        updatedAt: new Date(),
      };
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
    }
  };

  const buttonSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'high-contrast', label: 'High Contrast' },
  ];

  if (!user || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading user settings...</Text>
      </View>
    );
  }

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
        <Text style={[styles.title, { color: themeColors.surface }]}>
          User Settings
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
            Profile
          </Text>

          <View
            style={[
              styles.profileSection,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleChangePhoto}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons
                    name="person"
                    size={40}
                    color={themeColors.textSecondary}
                  />
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={16} color={themeColors.surface} />
              </View>
            </TouchableOpacity>

            <View style={styles.nameContainer}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                placeholderTextColor={themeColors.textSecondary}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Voice Settings
          </Text>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              TTS Voice
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
              value={settings.voiceSettings?.ttsVoice || ''}
              onChangeText={value =>
                handleVoiceSettingsChange('ttsVoice', value)
              }
              placeholderTextColor={themeColors.textSecondary}
              editable={true}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>TTS Speed</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings?.ttsSpeed?.toString() || '1.0'}
              onChangeText={value =>
                handleVoiceSettingsChange('ttsSpeed', parseFloat(value) || 1.0)
              }
              keyboardType="numeric"
              editable={true}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>TTS Pitch</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings?.ttsPitch?.toString() || '1.0'}
              onChangeText={value =>
                handleVoiceSettingsChange('ttsPitch', parseFloat(value) || 1.0)
              }
              keyboardType="numeric"
              editable={true}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Volume</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings?.volume?.toString() || '1.0'}
              onChangeText={value =>
                handleVoiceSettingsChange('volume', parseFloat(value) || 1.0)
              }
              keyboardType="numeric"
              editable={true}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Repeat</Text>
            <Switch
              value={settings.voiceSettings?.autoRepeat || false}
              onValueChange={value =>
                handleVoiceSettingsChange('autoRepeat', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.voiceSettings?.autoRepeat
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Visual Settings
          </Text>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              High Contrast
            </Text>
            <Switch
              value={settings.visualSettings?.highContrast || false}
              onValueChange={value =>
                handleVisualSettingsChange('highContrast', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.visualSettings?.highContrast
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              Large Text
            </Text>
            <Switch
              value={settings.visualSettings?.largeText || false}
              onValueChange={value =>
                handleVisualSettingsChange('largeText', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.visualSettings?.largeText
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              Button Size
            </Text>
            <View style={styles.optionContainer}>
              {buttonSizes.map(size => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                    },
                    settings.visualSettings?.buttonSize === size.value &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() =>
                    handleVisualSettingsChange('buttonSize', size.value)
                  }
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      { color: themeColors.text },
                      settings.visualSettings?.buttonSize === size.value &&
                        styles.optionButtonTextActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              Theme
            </Text>
            <View style={styles.optionContainer}>
              {themes.map(themeOption => (
                <TouchableOpacity
                  key={themeOption.value}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                    },
                    settings.visualSettings?.theme === themeOption.value &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() =>
                    handleVisualSettingsChange('theme', themeOption.value)
                  }
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      { color: themeColors.text },
                      settings.visualSettings?.theme === themeOption.value &&
                        styles.optionButtonTextActive,
                    ]}
                  >
                    {themeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Accessibility Settings
          </Text>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: themeColors.text }]}>
              Switch Scanning
            </Text>
            <Switch
              value={settings.accessibilitySettings?.switchScanning || false}
              onValueChange={value =>
                handleAccessibilitySettingsChange('switchScanning', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.accessibilitySettings?.switchScanning
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Scan Speed</Text>
            <TextInput
              style={styles.input}
              value={
                settings.accessibilitySettings?.scanSpeed?.toString() || '1.0'
              }
              onChangeText={value =>
                handleAccessibilitySettingsChange(
                  'scanSpeed',
                  parseFloat(value) || 1.0
                )
              }
              keyboardType="numeric"
              editable={true}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Hold to Activate</Text>
            <Switch
              value={settings.accessibilitySettings?.holdToActivate || false}
              onValueChange={value =>
                handleAccessibilitySettingsChange('holdToActivate', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.accessibilitySettings?.holdToActivate
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>One Handed Mode</Text>
            <Switch
              value={settings.accessibilitySettings?.oneHandedMode || false}
              onValueChange={value =>
                handleAccessibilitySettingsChange('oneHandedMode', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.accessibilitySettings?.oneHandedMode
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Reduce Motion</Text>
            <Switch
              value={settings.accessibilitySettings?.reduceMotion || false}
              onValueChange={value =>
                handleAccessibilitySettingsChange('reduceMotion', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.accessibilitySettings?.reduceMotion
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Volume</Text>
            <TextInput
              style={styles.input}
              value={settings.audioSettings?.volume?.toString() || '1.0'}
              onChangeText={value =>
                handleAudioSettingsChange('volume', parseFloat(value) || 1.0)
              }
              keyboardType="numeric"
              editable={true}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Background Music</Text>
            <Switch
              value={settings.audioSettings?.backgroundMusic || false}
              onValueChange={value =>
                handleAudioSettingsChange('backgroundMusic', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.audioSettings?.backgroundMusic
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Audio Feedback</Text>
            <Switch
              value={settings.audioSettings?.audioFeedback || false}
              onValueChange={value =>
                handleAudioSettingsChange('audioFeedback', value)
              }
              disabled={false}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.audioSettings?.audioFeedback
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Noise Reduction</Text>
            <Switch
              value={settings.audioSettings?.noiseReduction || false}
              onValueChange={value =>
                handleAudioSettingsChange('noiseReduction', value)
              }
              disabled={!isEditing}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                settings.audioSettings?.noiseReduction
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor will be set dynamically based on theme
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically based on theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor will be set dynamically based on theme
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
    // color will be set dynamically based on theme
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
    // color will be set dynamically based on theme
    marginBottom: SPACING.MD,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor, borderColor will be set dynamically based on theme
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
  },
  photoContainer: {
    position: 'relative',
    marginRight: SPACING.MD,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // backgroundColor will be set dynamically based on theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    // backgroundColor will be set dynamically based on theme
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically based on theme
    marginBottom: SPACING.SM,
  },
  input: {
    // backgroundColor, borderColor, color will be set dynamically based on theme
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor, borderColor will be set dynamically based on theme
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically based on theme
    flex: 1,
    // prevent awkward wrapping by constraining width and truncating
    flexShrink: 1,
    maxWidth: '60%',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  optionButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    // backgroundColor, borderColor will be set dynamically based on theme
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  optionButtonActive: {
    // backgroundColor, borderColor will be set dynamically based on theme
  },
  optionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
  },
  optionButtonTextActive: {
    // color will be set dynamically based on theme
  },
});
