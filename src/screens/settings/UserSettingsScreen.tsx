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
  Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { User, UserSettings, VoiceSettings, VisualSettings, AccessibilitySettings, AudioSettings } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';

export default function UserSettingsScreen() {
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
      setUser(currentUser);
      setName(currentUser.name);
      setPhoto(currentUser.photo);
      setSettings(currentUser.settings || null);
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
    Alert.alert('Change Photo', 'Photo selection functionality coming soon');
  };

  const handleVoiceSettingsChange = (field: keyof VoiceSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      voiceSettings: {
        ...settings.voiceSettings,
        [field]: value,
      },
    });
  };

  const handleVisualSettingsChange = (field: keyof VisualSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      visualSettings: {
        ...settings.visualSettings,
        [field]: value,
      },
    });
  };

  const handleAccessibilitySettingsChange = (field: keyof AccessibilitySettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      accessibilitySettings: {
        ...settings.accessibilitySettings,
        [field]: value,
      },
    });
  };

  const handleAudioSettingsChange = (field: keyof AudioSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      audioSettings: {
        ...settings.audioSettings,
        [field]: value,
      },
    });
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Ionicons name={isEditing ? "close" : "pencil"} size={24} color={COLORS.SURFACE} />
        </TouchableOpacity>
        <Text style={styles.title}>User Settings</Text>
        {isEditing && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color={COLORS.SURFACE} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.photoContainer} onPress={handleChangePhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.TEXT_SECONDARY} />
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={16} color={COLORS.SURFACE} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.nameContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>TTS Voice</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings.ttsVoice}
              onChangeText={(value) => handleVoiceSettingsChange('ttsVoice', value)}
              editable={isEditing}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>TTS Speed</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings.ttsSpeed.toString()}
              onChangeText={(value) => handleVoiceSettingsChange('ttsSpeed', parseFloat(value) || 1.0)}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>TTS Pitch</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings.ttsPitch.toString()}
              onChangeText={(value) => handleVoiceSettingsChange('ttsPitch', parseFloat(value) || 1.0)}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Volume</Text>
            <TextInput
              style={styles.input}
              value={settings.voiceSettings.volume.toString()}
              onChangeText={(value) => handleVoiceSettingsChange('volume', parseFloat(value) || 1.0)}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Repeat</Text>
            <Switch
              value={settings.voiceSettings.autoRepeat}
              onValueChange={(value) => handleVoiceSettingsChange('autoRepeat', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.voiceSettings.autoRepeat ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>High Contrast</Text>
            <Switch
              value={settings.visualSettings.highContrast}
              onValueChange={(value) => handleVisualSettingsChange('highContrast', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.visualSettings.highContrast ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Large Text</Text>
            <Switch
              value={settings.visualSettings.largeText}
              onValueChange={(value) => handleVisualSettingsChange('largeText', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.visualSettings.largeText ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Button Size</Text>
            <View style={styles.optionContainer}>
              {buttonSizes.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.optionButton,
                    settings.visualSettings.buttonSize === size.value && styles.optionButtonActive
                  ]}
                  onPress={() => isEditing && handleVisualSettingsChange('buttonSize', size.value)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    settings.visualSettings.buttonSize === size.value && styles.optionButtonTextActive
                  ]}>
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.optionContainer}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.value}
                  style={[
                    styles.optionButton,
                    settings.visualSettings.theme === theme.value && styles.optionButtonActive
                  ]}
                  onPress={() => isEditing && handleVisualSettingsChange('theme', theme.value)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    settings.visualSettings.theme === theme.value && styles.optionButtonTextActive
                  ]}>
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Switch Scanning</Text>
            <Switch
              value={settings.accessibilitySettings.switchScanning}
              onValueChange={(value) => handleAccessibilitySettingsChange('switchScanning', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.accessibilitySettings.switchScanning ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Scan Speed</Text>
            <TextInput
              style={styles.input}
              value={settings.accessibilitySettings.scanSpeed.toString()}
              onChangeText={(value) => handleAccessibilitySettingsChange('scanSpeed', parseFloat(value) || 1.0)}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Hold to Activate</Text>
            <Switch
              value={settings.accessibilitySettings.holdToActivate}
              onValueChange={(value) => handleAccessibilitySettingsChange('holdToActivate', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.accessibilitySettings.holdToActivate ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>One Handed Mode</Text>
            <Switch
              value={settings.accessibilitySettings.oneHandedMode}
              onValueChange={(value) => handleAccessibilitySettingsChange('oneHandedMode', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.accessibilitySettings.oneHandedMode ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Reduce Motion</Text>
            <Switch
              value={settings.accessibilitySettings.reduceMotion}
              onValueChange={(value) => handleAccessibilitySettingsChange('reduceMotion', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.accessibilitySettings.reduceMotion ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Volume</Text>
            <TextInput
              style={styles.input}
              value={settings.audioSettings.volume.toString()}
              onChangeText={(value) => handleAudioSettingsChange('volume', parseFloat(value) || 1.0)}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Background Music</Text>
            <Switch
              value={settings.audioSettings.backgroundMusic}
              onValueChange={(value) => handleAudioSettingsChange('backgroundMusic', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.audioSettings.backgroundMusic ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Audio Feedback</Text>
            <Switch
              value={settings.audioSettings.audioFeedback}
              onValueChange={(value) => handleAudioSettingsChange('audioFeedback', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.audioSettings.audioFeedback ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Noise Reduction</Text>
            <Switch
              value={settings.audioSettings.noiseReduction}
              onValueChange={(value) => handleAudioSettingsChange('noiseReduction', value)}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={settings.audioSettings.noiseReduction ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
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
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
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
    backgroundColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
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
  settingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  optionButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  optionButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  optionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  optionButtonTextActive: {
    color: COLORS.SURFACE,
  },
});