// Accessibility Service for Ausmo AAC App
// Provides comprehensive accessibility features including screen reader support, gesture customization, and one-handed operation

import { AccessibilitySettings, User } from '../types';

export interface ScreenReaderSettings {
  enabled: boolean;
  announceButtonPress: boolean;
  announcePageChanges: boolean;
  announceScanning: boolean;
  speechRate: number; // 0.1 to 2.0
  speechPitch: number; // 0.1 to 2.0
  speechVolume: number; // 0.0 to 1.0
  announceContext: boolean;
  announceSuggestions: boolean;
}

export interface GestureSettings {
  enabled: boolean;
  swipeUp: string; // 'none' | 'home' | 'back' | 'menu' | 'speak'
  swipeDown: string;
  swipeLeft: string;
  swipeRight: string;
  doubleTap: string;
  longPress: string;
  pinch: string;
  twoFingerTap: string;
  threeFingerTap: string;
}

export interface OneHandedSettings {
  enabled: boolean;
  mode: 'left' | 'right' | 'auto';
  buttonSize: 'small' | 'medium' | 'large' | 'extra-large';
  spacing: 'compact' | 'normal' | 'spacious';
  reachAssist: boolean;
  thumbZone: boolean;
}

export interface AccessibilityFeatures {
  screenReader: ScreenReaderSettings;
  gestures: GestureSettings;
  oneHanded: OneHandedSettings;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  colorBlindSupport: boolean;
  voiceControl: boolean;
  switchControl: boolean;
  assistiveTouch: boolean;
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private currentUser: User | null = null;
  private features: AccessibilityFeatures;
  private isInitialized = false;

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  constructor() {
    this.features = this.getDefaultFeatures();
  }

  // Initialize accessibility service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      this.loadUserSettings();
      await this.setupAccessibilityFeatures();
      this.isInitialized = true;
      console.log('Accessibility service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing accessibility service:', error);
    }
  }

  // Get default accessibility features
  private getDefaultFeatures(): AccessibilityFeatures {
    return {
      screenReader: {
        enabled: false,
        announceButtonPress: true,
        announcePageChanges: true,
        announceScanning: true,
        speechRate: 1.0,
        speechPitch: 1.0,
        speechVolume: 0.8,
        announceContext: true,
        announceSuggestions: true,
      },
      gestures: {
        enabled: true,
        swipeUp: 'home',
        swipeDown: 'back',
        swipeLeft: 'previous',
        swipeRight: 'next',
        doubleTap: 'speak',
        longPress: 'menu',
        pinch: 'zoom',
        twoFingerTap: 'pause',
        threeFingerTap: 'help',
      },
      oneHanded: {
        enabled: false,
        mode: 'auto',
        buttonSize: 'medium',
        spacing: 'normal',
        reachAssist: false,
        thumbZone: false,
      },
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      colorBlindSupport: false,
      voiceControl: false,
      switchControl: false,
      assistiveTouch: false,
    };
  }

  // Load user-specific accessibility settings
  private loadUserSettings(): void {
    if (this.currentUser?.settings?.accessibilitySettings) {
      const userSettings = this.currentUser.settings.accessibilitySettings;
      
      // Update screen reader settings
      if (userSettings.screenReader) {
        this.features.screenReader = {
          ...this.features.screenReader,
          ...userSettings.screenReader,
        };
      }

      // Update gesture settings
      if (userSettings.gestures) {
        this.features.gestures = {
          ...this.features.gestures,
          ...userSettings.gestures,
        };
      }

      // Update one-handed settings
      if (userSettings.oneHanded) {
        this.features.oneHanded = {
          ...this.features.oneHanded,
          ...userSettings.oneHanded,
        };
      }

      // Update other accessibility features
      this.features.highContrast = userSettings.highContrast || false;
      this.features.largeText = userSettings.largeText || false;
      this.features.reduceMotion = userSettings.reduceMotion || false;
      this.features.colorBlindSupport = userSettings.colorBlindSupport || false;
      this.features.voiceControl = userSettings.voiceControl || false;
      this.features.switchControl = userSettings.switchControl || false;
      this.features.assistiveTouch = userSettings.assistiveTouch || false;
    }
  }

  // Setup accessibility features
  private async setupAccessibilityFeatures(): Promise<void> {
    try {
      // Setup screen reader
      if (this.features.screenReader.enabled) {
        await this.setupScreenReader();
      }

      // Setup gestures
      if (this.features.gestures.enabled) {
        await this.setupGestures();
      }

      // Setup one-handed mode
      if (this.features.oneHanded.enabled) {
        await this.setupOneHandedMode();
      }

      // Setup other accessibility features
      await this.setupVisualAccessibility();
      await this.setupMotorAccessibility();

      console.log('Accessibility features setup completed');
    } catch (error) {
      console.error('Error setting up accessibility features:', error);
    }
  }

  // Setup screen reader functionality
  private async setupScreenReader(): Promise<void> {
    try {
      // In a real app, this would integrate with the device's screen reader
      console.log('Screen reader setup:', this.features.screenReader);
      
      // Setup speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();
        utterance.rate = this.features.screenReader.speechRate;
        utterance.pitch = this.features.screenReader.speechPitch;
        utterance.volume = this.features.screenReader.speechVolume;
      }
    } catch (error) {
      console.error('Error setting up screen reader:', error);
    }
  }

  // Setup gesture recognition
  private async setupGestures(): Promise<void> {
    try {
      console.log('Gesture setup:', this.features.gestures);
      // In a real app, this would setup gesture recognizers
    } catch (error) {
      console.error('Error setting up gestures:', error);
    }
  }

  // Setup one-handed mode
  private async setupOneHandedMode(): Promise<void> {
    try {
      console.log('One-handed mode setup:', this.features.oneHanded);
      // In a real app, this would adjust UI layout and button positioning
    } catch (error) {
      console.error('Error setting up one-handed mode:', error);
    }
  }

  // Setup visual accessibility features
  private async setupVisualAccessibility(): Promise<void> {
    try {
      if (this.features.highContrast) {
        // Apply high contrast theme
        console.log('High contrast mode enabled');
      }

      if (this.features.largeText) {
        // Apply large text settings
        console.log('Large text mode enabled');
      }

      if (this.features.colorBlindSupport) {
        // Apply colorblind-friendly color scheme
        console.log('Colorblind support enabled');
      }

      if (this.features.reduceMotion) {
        // Disable animations and transitions
        console.log('Motion reduction enabled');
      }
    } catch (error) {
      console.error('Error setting up visual accessibility:', error);
    }
  }

  // Setup motor accessibility features
  private async setupMotorAccessibility(): Promise<void> {
    try {
      if (this.features.voiceControl) {
        // Setup voice control
        console.log('Voice control enabled');
      }

      if (this.features.switchControl) {
        // Setup switch control
        console.log('Switch control enabled');
      }

      if (this.features.assistiveTouch) {
        // Setup assistive touch
        console.log('Assistive touch enabled');
      }
    } catch (error) {
      console.error('Error setting up motor accessibility:', error);
    }
  }

  // Screen reader methods
  announce(text: string, priority: 'low' | 'normal' | 'high' = 'normal'): void {
    if (!this.features.screenReader.enabled) return;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.features.screenReader.speechRate;
        utterance.pitch = this.features.screenReader.speechPitch;
        utterance.volume = this.features.screenReader.speechVolume;
        
        // Set priority
        if (priority === 'high') {
          utterance.rate = Math.min(utterance.rate * 1.2, 2.0);
        } else if (priority === 'low') {
          utterance.rate = Math.max(utterance.rate * 0.8, 0.1);
        }

        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error announcing text:', error);
    }
  }

  announceButtonPress(buttonText: string, buttonContext?: string): void {
    if (!this.features.screenReader.announceButtonPress) return;

    let announcement = buttonText;
    if (buttonContext && this.features.screenReader.announceContext) {
      announcement = `${buttonText}, ${buttonContext}`;
    }

    this.announce(announcement, 'normal');
  }

  announcePageChange(pageName: string, pageContext?: string): void {
    if (!this.features.screenReader.announcePageChanges) return;

    let announcement = `Page changed to ${pageName}`;
    if (pageContext && this.features.screenReader.announceContext) {
      announcement += `, ${pageContext}`;
    }

    this.announce(announcement, 'normal');
  }

  announceScanning(currentItem: string, position: string): void {
    if (!this.features.screenReader.announceScanning) return;

    const announcement = `Scanning, ${currentItem}, ${position}`;
    this.announce(announcement, 'low');
  }

  announceSuggestion(suggestionText: string, confidence: string): void {
    if (!this.features.screenReader.announceSuggestions) return;

    const announcement = `Suggestion, ${suggestionText}, ${confidence} confidence`;
    this.announce(announcement, 'low');
  }

  // Gesture methods
  handleGesture(gestureType: string, data?: any): void {
    if (!this.features.gestures.enabled) return;

    const action = this.features.gestures[gestureType as keyof GestureSettings];
    if (action && action !== 'none') {
      this.executeGestureAction(String(action), String(data));
    }
  }

  private executeGestureAction(action: string, data?: any): void {
    switch (action) {
      case 'home':
        // Navigate to home
        console.log('Gesture: Navigate to home');
        break;
      case 'back':
        // Navigate back
        console.log('Gesture: Navigate back');
        break;
      case 'menu':
        // Open menu
        console.log('Gesture: Open menu');
        break;
      case 'speak':
        // Speak current selection
        console.log('Gesture: Speak current selection');
        break;
      case 'previous':
        // Previous item
        console.log('Gesture: Previous item');
        break;
      case 'next':
        // Next item
        console.log('Gesture: Next item');
        break;
      case 'pause':
        // Pause/resume
        console.log('Gesture: Pause/resume');
        break;
      case 'help':
        // Show help
        console.log('Gesture: Show help');
        break;
      case 'zoom':
        // Zoom in/out
        console.log('Gesture: Zoom');
        break;
      default:
        console.log('Unknown gesture action:', action);
    }
  }

  // One-handed mode methods
  getOneHandedLayout(): { buttonSize: number; spacing: number; position: 'left' | 'right' | 'center' } {
    if (!this.features.oneHanded.enabled) {
      return { buttonSize: 1, spacing: 1, position: 'center' };
    }

    const sizeMultiplier = {
      'small': 0.8,
      'medium': 1.0,
      'large': 1.2,
      'extra-large': 1.5,
    };

    const spacingMultiplier = {
      'compact': 0.8,
      'normal': 1.0,
      'spacious': 1.2,
    };

    return {
      buttonSize: sizeMultiplier[this.features.oneHanded.buttonSize],
      spacing: spacingMultiplier[this.features.oneHanded.spacing],
      position: this.features.oneHanded.mode === 'auto' ? 'center' : this.features.oneHanded.mode,
    };
  }

  // Update accessibility settings
  updateSettings(newSettings: Partial<AccessibilityFeatures>): void {
    this.features = { ...this.features, ...newSettings };
    this.setupAccessibilityFeatures();
    console.log('Accessibility settings updated');
  }

  // Get current accessibility features
  getFeatures(): AccessibilityFeatures {
    return { ...this.features };
  }

  // Check if accessibility feature is enabled
  isFeatureEnabled(feature: keyof AccessibilityFeatures): boolean {
    return this.features[feature] as boolean;
  }

  // Get accessibility recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.features.screenReader.enabled) {
      recommendations.push('Enable screen reader for better navigation');
    }

    if (!this.features.oneHanded.enabled) {
      recommendations.push('Consider enabling one-handed mode for easier use');
    }

    if (!this.features.gestures.enabled) {
      recommendations.push('Enable gestures for faster navigation');
    }

    if (!this.features.highContrast) {
      recommendations.push('High contrast mode can improve visibility');
    }

    if (!this.features.largeText) {
      recommendations.push('Large text can improve readability');
    }

    return recommendations;
  }

  // Test accessibility features
  async testAccessibility(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    try {
      // Test screen reader
      results.screenReader = this.features.screenReader.enabled;
      if (results.screenReader) {
        this.announce('Screen reader test', 'normal');
      }

      // Test gestures
      results.gestures = this.features.gestures.enabled;

      // Test one-handed mode
      results.oneHanded = this.features.oneHanded.enabled;

      // Test visual accessibility
      results.highContrast = this.features.highContrast;
      results.largeText = this.features.largeText;
      results.colorBlindSupport = this.features.colorBlindSupport;
      results.reduceMotion = this.features.reduceMotion;

      // Test motor accessibility
      results.voiceControl = this.features.voiceControl;
      results.switchControl = this.features.switchControl;
      results.assistiveTouch = this.features.assistiveTouch;

      console.log('Accessibility test results:', results);
      return results;
    } catch (error) {
      console.error('Error testing accessibility:', error);
      return {};
    }
  }

  // Cleanup
  cleanup(): void {
    this.currentUser = null;
    this.isInitialized = false;
    console.log('Accessibility service cleaned up');
  }
}

export default AccessibilityService;
