// Audio Service for Ausmo AAC App

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { AUDIO_SETTINGS, TTS_VOICES } from '../constants';
import { VoiceSettings } from '../types';

export class AudioService {
  private static instance: AudioService;
  private sound: Audio.Sound | null = null;
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private recordingDuration = 0;
  private recordingTimer: NodeJS.Timeout | null = null;

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // Initialize audio service
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Audio Service...');
      
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      console.log('Audio permission status:', status);
      if (status !== 'granted') {
        console.warn('Audio permission not granted, TTS may not work');
      }

      // Configure audio mode for TTS with better settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false, // Changed to false for better audio output
        playThroughEarpieceAndroid: false,
      });

      console.log('Audio Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      throw error;
    }
  }

  // Text-to-Speech
  async speak(text: string, voiceSettings?: VoiceSettings): Promise<void> {
    try {
      console.log('AudioService.speak called with:', { text, voiceSettings });
      
      // Always stop any current speech first
      if (await Speech.isSpeakingAsync()) {
        console.log('Stopping current speech...');
        await Speech.stop();
        // Wait a bit for the stop to take effect
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Use default settings if voiceSettings is not provided
      const defaultVoice = await this.getDefaultVoice();
      const settings = voiceSettings || {
        ttsVoice: defaultVoice, // Use recommended voice for better AAC experience
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };

      console.log('Using settings:', settings);

      // Try to get available voices for debugging
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        console.log('Available voices:', voices.length);
        if (voices.length > 0) {
          console.log('First few voices:', voices.slice(0, 3).map(v => ({ identifier: v.identifier, name: v.name, language: v.language })));
        }
      } catch (voiceError) {
        console.log('Could not get available voices:', voiceError);
      }

      const options: Speech.SpeechOptions = {
        voice: settings.ttsVoice,
        rate: settings.ttsSpeed,
        pitch: settings.ttsPitch,
        volume: settings.volume,
        language: 'en-US',
        // quality: Speech.VoiceQuality.Enhanced, // Not available in current expo-speech version
        onStart: () => {
          console.log('Speech started for:', text);
        },
        onDone: () => {
          console.log('Speech completed for:', text);
        },
        onStopped: () => {
          console.log('Speech stopped for:', text);
        },
        onError: (error) => {
          console.error('Speech error for', text, ':', error);
        },
      };

      console.log('Speech options:', options);
      
      // Wait a bit to ensure audio system is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      await Speech.speak(text, options);
      console.log('Speech completed successfully for:', text);
    } catch (error) {
      console.error('TTS Error for', text, ':', error);
      throw error;
    }
  }

  // Stop TTS
  async stopSpeaking(): Promise<void> {
    try {
      if (await Speech.isSpeakingAsync()) {
        await Speech.stop();
      }
    } catch (error) {
      console.error('Stop TTS Error:', error);
      throw error;
    }
  }

  // Test audio output with multiple approaches
  async testAudio(): Promise<boolean> {
    try {
      console.log('Testing audio output...');
      
      // Test 1: Basic TTS with clear text
      console.log('Test 1: Basic TTS');
      await this.speak('Audio test one', {
        ttsVoice: 'default', // Use default for better compatibility
        ttsSpeed: 0.8,
        ttsPitch: 1.0,
        volume: 1.0,
        autoRepeat: false,
        repeatDelay: 2000,
      });

      // Wait longer between tests to avoid overlapping
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test 2: Try without voice specification
      console.log('Test 2: Without voice specification');
      await this.speak('Audio test two', {
        ttsVoice: 'default',
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 1.0,
        autoRepeat: false,
        repeatDelay: 2000,
      });

      // Wait longer between tests
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test 3: Try with different language
      console.log('Test 3: Different language');
      try {
        await Speech.speak('Audio test three', {
          language: 'en',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        });
      } catch (error) {
        console.log('Test 3 failed:', error);
      }

      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }

  // Check if TTS is speaking
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('TTS Status Error:', error);
      return false;
    }
  }

  // Audio Playback
  async playAudio(audioUri: string, volume: number = 1.0): Promise<void> {
    try {
      // Stop any currently playing sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { volume, shouldPlay: true }
      );

      this.sound = sound;

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.sound = null;
        }
      });
    } catch (error) {
      console.error('Audio Playback Error:', error);
      throw error;
    }
  }

  // Stop audio playback
  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Stop Audio Error:', error);
      throw error;
    }
  }

  // Pause audio playback
  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Pause Audio Error:', error);
      throw error;
    }
  }

  // Resume audio playback
  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Resume Audio Error:', error);
      throw error;
    }
  }

  // Audio Recording
  async startRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        return;
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;
      this.recordingDuration = 0;

      // Start duration timer
      this.recordingTimer = setInterval(() => {
        this.recordingDuration += 100;
      }, 100);
    } catch (error) {
      console.error('Start Recording Error:', error);
      throw error;
    }
  }

  // Stop recording and return audio URI
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.isRecording || !this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.recording = null;
      this.isRecording = false;
      this.recordingDuration = 0;

      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }

      return uri;
    } catch (error) {
      console.error('Stop Recording Error:', error);
      throw error;
    }
  }

  // Pause recording
  async pauseRecording(): Promise<void> {
    try {
      if (this.isRecording && this.recording) {
        await this.recording.pauseAsync();
        this.isRecording = false;
        
        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
          this.recordingTimer = null;
        }
      }
    } catch (error) {
      console.error('Pause Recording Error:', error);
      throw error;
    }
  }

  // Resume recording
  async resumeRecording(): Promise<void> {
    try {
      if (this.recording && !this.isRecording) {
        await this.recording.startAsync();
        this.isRecording = true;

        // Resume duration timer
        this.recordingTimer = setInterval(() => {
          this.recordingDuration += 100;
        }, 100);
      }
    } catch (error) {
      console.error('Resume Recording Error:', error);
      throw error;
    }
  }

  // Get recording duration
  getRecordingDuration(): number {
    return this.recordingDuration;
  }

  // Check if recording
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Get available TTS voices
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      console.log(`Found ${voices.length} available voices`);
      return voices;
    } catch (error) {
      console.error('Get Voices Error:', error);
      return [];
    }
  }

  // Get recommended voices for AAC (clear, natural voices)
  async getRecommendedVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Filter for high-quality, clear voices suitable for AAC
      const recommendedVoices = voices.filter(voice => {
        // Prefer enhanced quality voices
        if (voice.quality === Speech.VoiceQuality.Enhanced) {
          return true;
        }
        
        // Include some standard quality voices that are known to be clear
        const clearStandardVoices = [
          'com.apple.voice.compact.en-US.Samantha',
          'com.apple.eloquence.en-US.Eddy',
          'com.apple.eloquence.en-US.Flo',
          'com.apple.ttsbundle.Samantha-compact',
          'com.apple.ttsbundle.Alex-compact'
        ];
        
        return clearStandardVoices.includes(voice.identifier);
      });
      
      console.log(`Found ${recommendedVoices.length} recommended voices for AAC`);
      return recommendedVoices;
    } catch (error) {
      console.error('Error getting recommended voices:', error);
      return [];
    }
  }

  // Get Acapela-style voices (premium voices)
  async getAcapelaVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Filter for premium voices that sound like Acapela
      const acapelaVoices = voices.filter(voice => {
        // Look for high-quality voices with natural sound
        if (voice.quality === Speech.VoiceQuality.Enhanced) {
          return true;
        }
        
        // Include specific voices that have Acapela-like quality
        const acapelaStyleVoices = [
          'com.apple.voice.compact.en-US.Samantha',
          'com.apple.voice.compact.en-US.Alex',
          'com.apple.voice.compact.en-US.Victoria',
          'com.apple.voice.compact.en-US.Daniel',
          'com.apple.voice.compact.en-US.Karen',
          'com.apple.voice.compact.en-US.Fred',
        ];
        
        return acapelaStyleVoices.includes(voice.identifier);
      });
      
      console.log(`Found ${acapelaVoices.length} Acapela-style voices`);
      return acapelaVoices;
    } catch (error) {
      console.error('Error getting Acapela voices:', error);
      return [];
    }
  }

  // Get voices by gender
  async getVoicesByGender(gender: 'male' | 'female' | 'child'): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      const genderVoices = voices.filter(voice => {
        const identifier = voice.identifier.toLowerCase();
        const name = voice.name.toLowerCase();
        
        switch (gender) {
          case 'male':
            return identifier.includes('alex') || 
                   identifier.includes('daniel') || 
                   identifier.includes('fred') ||
                   name.includes('male') ||
                   name.includes('man');
          
          case 'female':
            return identifier.includes('samantha') || 
                   identifier.includes('victoria') || 
                   identifier.includes('karen') ||
                   name.includes('female') ||
                   name.includes('woman');
          
          case 'child':
            return identifier.includes('tommy') || 
                   identifier.includes('emma') ||
                   name.includes('child') ||
                   name.includes('kid') ||
                   name.includes('young');
          
          default:
            return false;
        }
      });
      
      console.log(`Found ${genderVoices.length} ${gender} voices`);
      return genderVoices;
    } catch (error) {
      console.error(`Error getting ${gender} voices:`, error);
      return [];
    }
  }

  // Get voices by language
  async getVoicesByLanguage(language: string): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      const languageVoices = voices.filter(voice => 
        voice.language.toLowerCase().includes(language.toLowerCase())
      );
      
      console.log(`Found ${languageVoices.length} voices for language: ${language}`);
      return languageVoices;
    } catch (error) {
      console.error(`Error getting voices for language ${language}:`, error);
      return [];
    }
  }

  // Get voice by identifier
  async getVoiceByIdentifier(identifier: string): Promise<Speech.Voice | undefined> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.find(voice => voice.identifier === identifier);
    } catch (error) {
      console.error('Error getting voice by identifier:', error);
      return undefined;
    }
  }

  // Get default voice for AAC (best quality available)
  async getDefaultVoice(): Promise<string | undefined> {
    try {
      const recommendedVoices = await this.getRecommendedVoices();
      
      if (recommendedVoices.length > 0) {
        // Return the first recommended voice
        const defaultVoice = recommendedVoices[0].identifier;
        console.log('Using default voice:', defaultVoice);
        return defaultVoice;
      }
      
      // Fallback to undefined (system default)
      console.log('No recommended voices found, using system default');
      return undefined;
    } catch (error) {
      console.error('Error getting default voice:', error);
      return undefined;
    }
  }

  // Process audio file (noise reduction, normalization)
  async processAudio(audioUri: string, operations: string[]): Promise<string> {
    try {
      // This would typically involve server-side processing
      // For now, return the original URI
      return audioUri;
    } catch (error) {
      console.error('Process Audio Error:', error);
      throw error;
    }
  }

  // Convert audio format
  async convertAudioFormat(audioUri: string, format: 'mp3' | 'wav' | 'aac' | 'm4a'): Promise<string> {
    try {
      // This would typically involve server-side conversion
      // For now, return the original URI
      return audioUri;
    } catch (error) {
      console.error('Convert Audio Error:', error);
      throw error;
    }
  }

  // Get audio file info
  async getAudioInfo(audioUri: string): Promise<{ duration: number; size: number; format: string }> {
    try {
      const info = await FileSystem.getInfoAsync(audioUri);
      if (!info.exists) {
        throw new Error('Audio file not found');
      }

      // Get duration using Audio.Sound
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      return {
        duration: status.isLoaded ? status.durationMillis || 0 : 0,
        size: info.size || 0,
        format: audioUri.split('.').pop() || 'unknown',
      };
    } catch (error) {
      console.error('Get Audio Info Error:', error);
      throw error;
    }
  }

  // Play scan sound for switch scanning
  async playScanSound(soundType: 'beep-high' | 'beep-medium' | 'beep-low'): Promise<void> {
    try {
      // Create different frequency beeps for different scan actions
      const frequencies = {
        'beep-high': 800,
        'beep-medium': 600,
        'beep-low': 400,
      };

      const frequency = frequencies[soundType];
      const duration = 0.1; // 100ms beep

      // Generate a simple beep sound using Web Audio API
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }
    } catch (error) {
      console.error('Error playing scan sound:', error);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      await this.stopAudio();
      await this.stopRecording();
      await this.stopSpeaking();
    } catch (error) {
      console.error('Audio Service Cleanup Error:', error);
    }
  }
}

export default AudioService.getInstance();
