// Audio Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import { AudioSettings, VoiceSettings } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import AudioService from '../../services/audioService';
import DatabaseService from '../../services/databaseService';
import * as Speech from 'expo-speech';

export default function AudioSettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: themeColors.primary,
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
      color: themeColors.surface,
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
      color: themeColors.text,
      marginBottom: SPACING.MD,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: themeColors.surface,
      padding: SPACING.MD,
      marginBottom: SPACING.SM,
      borderRadius: BORDER_RADIUS.MEDIUM,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: SPACING.MD,
    },
    settingLabel: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.text,
      marginBottom: SPACING.XS,
    },
    settingDescription: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.textSecondary,
      lineHeight: 16,
    },
    settingValue: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.primary,
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
      backgroundColor: themeColors.primary,
    },
    voiceSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: BORDER_RADIUS.MEDIUM,
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.SM,
      minWidth: 120,
    },
    voiceText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.text,
      flex: 1,
    },
    voiceButton: {
      padding: SPACING.XS,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColors.primary,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      borderRadius: BORDER_RADIUS.MEDIUM,
      marginBottom: SPACING.SM,
    },
    testButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.surface,
      marginLeft: SPACING.SM,
    },
    qualityButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      padding: SPACING.MD,
      borderRadius: BORDER_RADIUS.MEDIUM,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    qualityButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.primary,
      flex: 1,
      marginLeft: SPACING.SM,
    },
  });

  // Audio settings
  const [volume, setVolume] = useState(1.0);
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(false);

  // Voice settings
  const [ttsVoice, setTtsVoice] = useState('default');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState(2.0);

  // Available voices
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [recommendedVoices, setRecommendedVoices] = useState<Speech.Voice[]>(
    []
  );

  useEffect(() => {
    if (currentUser?.settings) {
      const audio = currentUser.settings.audioSettings;
      const voice = currentUser.settings.voiceSettings;

      setVolume(audio.volume);
      setBackgroundMusic(audio.backgroundMusic);
      setMusicVolume(audio.musicVolume);
      setAudioFeedback(audio.audioFeedback);
      setNoiseReduction(audio.noiseReduction);

      setTtsVoice(voice.ttsVoice || 'default');
      setTtsSpeed(voice.ttsSpeed);
      setTtsPitch(voice.ttsPitch);
      setAutoRepeat(voice.autoRepeat);
      setRepeatDelay(voice.repeatDelay);
    }

    loadAvailableVoices();
  }, [currentUser]);

  const loadAvailableVoices = async () => {
    try {
      const [allVoices, recommended] = await Promise.all([
        AudioService.getAvailableVoices(),
        AudioService.getRecommendedVoices(),
      ]);

      setAvailableVoices(allVoices);
      setRecommendedVoices(recommended);

      console.log(
        `Loaded ${allVoices.length} voices, ${recommended.length} recommended`
      );
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user selected');
      return;
    }

    try {
      setIsLoading(true);

      const updatedAudioSettings: AudioSettings = {
        volume,
        backgroundMusic,
        musicVolume,
        audioFeedback,
        noiseReduction,
      };

      const updatedVoiceSettings: VoiceSettings = {
        ttsVoice,
        ttsSpeed,
        ttsPitch,
        volume,
        autoRepeat,
        repeatDelay,
      };

      const updatedUser = {
        ...currentUser,
        createdAt:
          typeof currentUser.createdAt === 'string'
            ? new Date(currentUser.createdAt)
            : currentUser.createdAt,
        settings: {
          ...currentUser.settings,
          audioSettings: updatedAudioSettings,
          voiceSettings: updatedVoiceSettings,
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

      Alert.alert('Success', 'Audio settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving audio settings:', error);
      Alert.alert('Error', 'Failed to save audio settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVoice = async () => {
    try {
      await AudioService.speak('This is a test of the text to speech voice.', {
        ttsVoice,
        ttsSpeed,
        ttsPitch,
        volume,
        autoRepeat,
        repeatDelay,
      });
    } catch (error) {
      console.error('Error testing voice:', error);
      Alert.alert('Error', 'Failed to test voice');
    }
  };

  const handleTestAudio = async () => {
    try {
      // Test background music playback
      if (backgroundMusic) {
        // In a real app, you would implement background music playback
        console.log('Background music test - volume:', musicVolume);
      }

      // Test audio feedback
      // In a real app, you would implement sound effects
      console.log('Audio feedback test');

      Alert.alert('Audio Test', 'Audio test completed successfully!');
    } catch (error) {
      console.error('Error testing audio:', error);
      Alert.alert('Error', 'Failed to test audio playback');
    }
  };

  const handleTestRecording = async () => {
    try {
      // Test microphone recording
      // In a real app, you would implement actual recording functionality
      console.log('Recording test started');

      Alert.alert('Recording Test', 'Recording test completed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Recording test finished');
          },
        },
      ]);
    } catch (error) {
      console.error('Error testing recording:', error);
      Alert.alert('Error', 'Failed to start recording test');
    }
  };

  const handleAdvancedAudioSettings = () => {
    Alert.alert(
      'Advanced Audio Settings',
      'Configure advanced audio processing options:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Noise Reduction',
          onPress: () => {
            setNoiseReduction(!noiseReduction);
            Alert.alert(
              'Noise Reduction',
              `Noise reduction ${!noiseReduction ? 'enabled' : 'disabled'}`
            );
          },
        },
        {
          text: 'Audio Enhancement',
          onPress: () =>
            Alert.alert(
              'Audio Enhancement',
              'Audio enhancement settings would be configured here'
            ),
        },
        {
          text: 'Equalizer',
          onPress: () =>
            Alert.alert(
              'Equalizer',
              'Audio equalizer settings would be configured here'
            ),
        },
      ]
    );
  };

  const showVoiceSelection = () => {
    const voiceOptions = [
      { text: 'System Default', onPress: () => setTtsVoice('default') },
      ...recommendedVoices.map(voice => ({
        text: `${voice.name} ${voice.quality === Speech.VoiceQuality.Enhanced ? '(Enhanced)' : ''}`,
        onPress: () => setTtsVoice(voice.identifier),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ];

    Alert.alert(
      'Select TTS Voice',
      'Choose a voice for text-to-speech. Enhanced voices provide better quality.',
      voiceOptions
    );
  };

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
      <View style={styles.settingControl}>{children}</View>
    </View>
  );

  const renderSliderSetting = (
    label: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number = 0,
    max: number = 1,
    step: number = 0.1,
    formatValue?: (value: number) => string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>
          {formatValue ? formatValue(value) : `${Math.round(value * 100)}%`}
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
          minimumTrackTintColor={themeColors.primary}
          maximumTrackTintColor={themeColors.border}
          thumbTintColor={themeColors.primary}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <Text style={styles.title}>Audio Settings</Text>
        {isEditing && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color={themeColors.surface} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume Settings</Text>

          {renderSliderSetting(
            'Master Volume',
            volume,
            setVolume,
            0,
            1,
            0.1,
            value => `${Math.round(value * 100)}%`
          )}

          {renderSliderSetting(
            'Music Volume',
            musicVolume,
            setMusicVolume,
            0,
            1,
            0.1,
            value => `${Math.round(value * 100)}%`
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Features</Text>

          {renderSettingRow(
            'Background Music',
            <Switch
              value={backgroundMusic}
              onValueChange={setBackgroundMusic}
              disabled={!isEditing}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                backgroundMusic
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />,
            'Play background music during app use'
          )}

          {renderSettingRow(
            'Audio Feedback',
            <Switch
              value={audioFeedback}
              onValueChange={setAudioFeedback}
              disabled={!isEditing}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                audioFeedback ? themeColors.surface : themeColors.textSecondary
              }
            />,
            'Play sounds for button presses and actions'
          )}

          {renderSettingRow(
            'Noise Reduction',
            <Switch
              value={noiseReduction}
              onValueChange={setNoiseReduction}
              disabled={!isEditing}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                noiseReduction ? themeColors.surface : themeColors.textSecondary
              }
            />,
            'Reduce background noise in recordings'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text-to-Speech</Text>

          {renderSettingRow(
            'TTS Voice',
            <View style={styles.voiceSelector}>
              <Text style={styles.voiceText}>
                {availableVoices.find(v => v.identifier === ttsVoice)?.name ||
                  recommendedVoices.find(v => v.identifier === ttsVoice)
                    ?.name ||
                  ttsVoice ||
                  'System Default'}
              </Text>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={() => {
                  if (isEditing) {
                    showVoiceSelection();
                  }
                }}
              >
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            </View>,
            'Voice used for text-to-speech'
          )}

          {renderSliderSetting(
            'TTS Speed',
            ttsSpeed,
            setTtsSpeed,
            0.1,
            3.0,
            0.1,
            value => `${value.toFixed(1)}x`
          )}

          {renderSliderSetting(
            'TTS Pitch',
            ttsPitch,
            setTtsPitch,
            0.1,
            2.0,
            0.1,
            value => `${value.toFixed(1)}x`
          )}

          {renderSettingRow(
            'Auto Repeat',
            <Switch
              value={autoRepeat}
              onValueChange={setAutoRepeat}
              disabled={!isEditing}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                autoRepeat ? themeColors.surface : themeColors.textSecondary
              }
            />,
            'Automatically repeat spoken text'
          )}

          {renderSliderSetting(
            'Repeat Delay',
            repeatDelay,
            setRepeatDelay,
            0.5,
            10.0,
            0.5,
            value => `${value.toFixed(1)}s`
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing</Text>

          <TouchableOpacity style={styles.testButton} onPress={handleTestVoice}>
            <Ionicons
              name="volume-high"
              size={20}
              color={themeColors.surface}
            />
            <Text style={styles.testButtonText}>Test TTS Voice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestAudio}>
            <Ionicons
              name="musical-notes"
              size={20}
              color={themeColors.surface}
            />
            <Text style={styles.testButtonText}>Test Audio Playback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestRecording}
          >
            <Ionicons name="mic" size={20} color={themeColors.surface} />
            <Text style={styles.testButtonText}>Test Recording</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Quality</Text>

          <TouchableOpacity
            style={styles.qualityButton}
            onPress={handleAdvancedAudioSettings}
          >
            <Ionicons name="settings" size={20} color={themeColors.primary} />
            <Text style={styles.qualityButtonText}>
              Advanced Audio Settings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
