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
import { AudioSettings, VoiceSettings } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import AudioService from '../../services/audioService';
import * as Speech from 'expo-speech';

export default function AudioSettingsScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
  const [recommendedVoices, setRecommendedVoices] = useState<Speech.Voice[]>([]);

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
        AudioService.getRecommendedVoices()
      ]);
      
      setAvailableVoices(allVoices);
      setRecommendedVoices(recommended);
      
      console.log(`Loaded ${allVoices.length} voices, ${recommended.length} recommended`);
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
        settings: {
          ...currentUser.settings,
          audioSettings: updatedAudioSettings,
          voiceSettings: updatedVoiceSettings,
        },
        updatedAt: new Date(),
      };

      // Update user in database
      // await DatabaseService.updateUser(updatedUser);
      
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
    Alert.alert('Test Audio', 'Audio test functionality coming soon');
  };

  const showVoiceSelection = () => {
    const voiceOptions = [
      { text: 'System Default', onPress: () => setTtsVoice('default') },
      ...recommendedVoices.map(voice => ({
        text: `${voice.name} ${voice.quality === Speech.VoiceQuality.Enhanced ? '(Enhanced)' : ''}`,
        onPress: () => setTtsVoice(voice.identifier)
      })),
      { text: 'Cancel', style: 'cancel' as const }
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
        <Text style={styles.title}>Audio Settings</Text>
        {isEditing && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color={COLORS.SURFACE} />
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
            (value) => `${Math.round(value * 100)}%`
          )}

          {renderSliderSetting(
            'Music Volume',
            musicVolume,
            setMusicVolume,
            0,
            1,
            0.1,
            (value) => `${Math.round(value * 100)}%`
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
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={backgroundMusic ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />,
            'Play background music during app use'
          )}

          {renderSettingRow(
            'Audio Feedback',
            <Switch
              value={audioFeedback}
              onValueChange={setAudioFeedback}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={audioFeedback ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
            />,
            'Play sounds for button presses and actions'
          )}

          {renderSettingRow(
            'Noise Reduction',
            <Switch
              value={noiseReduction}
              onValueChange={setNoiseReduction}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={noiseReduction ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
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
                 recommendedVoices.find(v => v.identifier === ttsVoice)?.name || 
                 ttsVoice || 'System Default'}
              </Text>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={() => {
                  if (isEditing) {
                    showVoiceSelection();
                  }
                }}
              >
                <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
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
            (value) => `${value.toFixed(1)}x`
          )}

          {renderSliderSetting(
            'TTS Pitch',
            ttsPitch,
            setTtsPitch,
            0.1,
            2.0,
            0.1,
            (value) => `${value.toFixed(1)}x`
          )}

          {renderSettingRow(
            'Auto Repeat',
            <Switch
              value={autoRepeat}
              onValueChange={setAutoRepeat}
              disabled={!isEditing}
              trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
              thumbColor={autoRepeat ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
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
            (value) => `${value.toFixed(1)}s`
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestVoice}
          >
            <Ionicons name="volume-high" size={20} color={COLORS.SURFACE} />
            <Text style={styles.testButtonText}>Test TTS Voice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestAudio}
          >
            <Ionicons name="musical-notes" size={20} color={COLORS.SURFACE} />
            <Text style={styles.testButtonText}>Test Audio Playback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => Alert.alert('Record Test', 'Recording test coming soon')}
          >
            <Ionicons name="mic" size={20} color={COLORS.SURFACE} />
            <Text style={styles.testButtonText}>Test Recording</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Quality</Text>
          
          <TouchableOpacity
            style={styles.qualityButton}
            onPress={() => Alert.alert('Audio Quality', 'Audio quality settings coming soon')}
          >
            <Ionicons name="settings" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.qualityButtonText}>Advanced Audio Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
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
  voiceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 120,
  },
  voiceText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  voiceButton: {
    padding: SPACING.XS,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.SM,
  },
  testButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.SURFACE,
    marginLeft: SPACING.SM,
  },
  qualityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  qualityButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.PRIMARY,
    flex: 1,
    marginLeft: SPACING.SM,
  },
});