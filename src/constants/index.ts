// Constants for Ausmo AAC App

import { Dimensions, PixelRatio } from 'react-native';

export const APP_CONFIG = {
  name: 'Ausmo',
  version: '1.0.0',
  description: 'Complete AAC Communication App for Children with Autism',
  author: 'Ausmo Team',
  supportEmail: 'support@ausmo.app',
  website: 'https://ausmo.app',
} as const;

export const GRID_SIZES = {
  SINGLE: 1,
  TWO: 2,
  FOUR: 4,
  NINE: 9,
  SIXTEEN: 16,
  TWENTY_FIVE: 25,
  THIRTY_SIX: 36,
} as const;

export const BUTTON_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large',
} as const;

export const PAGE_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  VISUAL_SCENE: 'visual-scene',
  KEYBOARD: 'keyboard',
} as const;

export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 10,
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 16,
    EXTRA_LARGE: 18,
    XLARGE: 20, // Add missing XLARGE
    HEADING: 20,
    TITLE: 24,
  },
  FONT_WEIGHTS: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    BOLD: '700',
  },
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
  // Add body text styles for consistency (colors will be set dynamically based on theme)
  CAPTION: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 12,
    // color will be set dynamically based on theme
  },
  SUBHEADING: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    // color will be set dynamically based on theme
  },
  HEADING_2: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    // color will be set dynamically based on theme
  },
  HEADING_3: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    // color will be set dynamically based on theme
  },
  BODY: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    // color will be set dynamically based on theme
  },
  BODY_SMALL: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  BODY_MEDIUM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  BODY_LARGE: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  HEADING_SMALL: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  HEADING_MEDIUM: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  HEADING_LARGE: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const BORDER_RADIUS = {
  XS: 2,
  SM: 4,
  SMALL: 4,
  MD: 8,
  MEDIUM: 8,
  LG: 12,
  LARGE: 12,
  XL: 16,
  EXTRA_LARGE: 16,
  ROUND: 50,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const SCANNING_SPEEDS = {
  VERY_SLOW: 3000,
  SLOW: 2000,
  NORMAL: 1000,
  FAST: 500,
  VERY_FAST: 250,
} as const;

// Responsive Design Utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Safe responsive functions that handle edge cases
const safeScale = (size: number) => {
  if (!size || size <= 0) return 0;
  const scale = SCREEN_WIDTH / 375; // Base width for iPhone
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

const safeVerticalScale = (size: number) => {
  if (!size || size <= 0) return 0;
  const scale = SCREEN_HEIGHT / 812; // Base height for iPhone
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

const safeModerateScale = (size: number, factor: number = 0.5) => {
  if (!size || size <= 0) return 0;
  const scale = SCREEN_WIDTH / 375;
  return size + (scale - 1) * factor;
};

const safeGetSpacing = (baseSpacing: number) => {
  if (!baseSpacing || baseSpacing <= 0) return 0;
  if (SCREEN_WIDTH < 768) return baseSpacing; // Phone
  if (SCREEN_WIDTH < 1024) return baseSpacing * 1.2; // Tablet
  return baseSpacing * 1.5; // Desktop
};

const safeGetFontSize = (baseSize: number) => {
  if (!baseSize || baseSize <= 0) return 12; // Default minimum font size
  if (SCREEN_WIDTH < 768) return baseSize; // Phone
  if (SCREEN_WIDTH < 1024) return baseSize * 1.1; // Tablet
  return baseSize * 1.2; // Desktop
};

export const RESPONSIVE = {
  // Screen dimensions
  SCREEN_WIDTH,
  SCREEN_HEIGHT,

  // Device type detection
  isPhone: SCREEN_WIDTH < 768,
  isTablet: SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024,
  isDesktop: SCREEN_WIDTH >= 1024,

  // Responsive breakpoints
  BREAKPOINTS: {
    PHONE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },

  // Responsive scaling functions
  scale: safeScale,

  verticalScale: safeVerticalScale,

  moderateScale: safeModerateScale,

  // Responsive spacing
  getSpacing: safeGetSpacing,

  // Responsive font sizes
  getFontSize: safeGetFontSize,

  // Responsive grid columns
  getGridColumns: () => {
    if (SCREEN_WIDTH < 768) return 2; // Phone: 2 columns
    if (SCREEN_WIDTH < 1024) return 3; // Tablet: 3 columns
    return 4; // Desktop: 4 columns
  },

  // Responsive card dimensions
  getCardSize: () => {
    const columns = RESPONSIVE.getGridColumns();
    const padding = RESPONSIVE.getSpacing(SPACING.MD) * 2;
    const gap = RESPONSIVE.getSpacing(SPACING.SM);
    return (SCREEN_WIDTH - padding - gap * (columns - 1)) / columns;
  },

  // Responsive button dimensions
  getButtonHeight: (baseHeight: number = 48) => {
    if (!baseHeight || baseHeight <= 0) return 48; // Default minimum height
    if (SCREEN_WIDTH < 768) return baseHeight; // Phone
    if (SCREEN_WIDTH < 1024) return baseHeight * 1.1; // Tablet
    return baseHeight * 1.2; // Desktop
  },

  // Responsive icon sizes
  getIconSize: (baseSize: number) => {
    if (!baseSize || baseSize <= 0) return 24; // Default minimum icon size
    if (SCREEN_WIDTH < 768) return baseSize; // Phone
    if (SCREEN_WIDTH < 1024) return baseSize * 1.2; // Tablet
    return baseSize * 1.4; // Desktop
  },
} as const;

export const AUDIO_SETTINGS = {
  MAX_RECORDING_DURATION: 30000, // 30 seconds
  MIN_RECORDING_DURATION: 500, // 0.5 seconds
  DEFAULT_VOLUME: 0.8,
  MAX_VOLUME: 1.0,
  MIN_VOLUME: 0.0,
  TTS_SPEED_RANGE: {
    MIN: 0.1,
    MAX: 2.0,
    DEFAULT: 1.0,
  },
  TTS_PITCH_RANGE: {
    MIN: 0.5,
    MAX: 2.0,
    DEFAULT: 1.0,
  },
} as const;

export const SYMBOL_CATEGORIES = [
  'actions',
  'animals',
  'body',
  'clothing',
  'colors',
  'communication',
  'emotions',
  'food',
  'home',
  'people',
  'places',
  'school',
  'shapes',
  'time',
  'transportation',
  'weather',
] as const;

export const MESSAGE_CATEGORIES = [
  'greetings',
  'requests',
  'comments',
  'questions',
  'social',
  'emergency',
  'medical',
  'school',
  'home',
  'play',
] as const;

export const BOOK_CATEGORIES = [
  'home',
  'school',
  'therapy',
  'medical',
  'social',
  'emergency',
  'play',
  'learning',
  'custom',
] as const;

export const TTS_VOICES = {
  MALE: [
    { id: 'male-1', name: 'Alex', language: 'en-US' },
    { id: 'male-2', name: 'Daniel', language: 'en-US' },
    { id: 'male-3', name: 'Fred', language: 'en-US' },
  ],
  FEMALE: [
    { id: 'female-1', name: 'Samantha', language: 'en-US' },
    { id: 'female-2', name: 'Victoria', language: 'en-US' },
    { id: 'female-3', name: 'Karen', language: 'en-US' },
  ],
  CHILD: [
    { id: 'child-1', name: 'Tommy', language: 'en-US' },
    { id: 'child-2', name: 'Emma', language: 'en-US' },
  ],
} as const;

export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  CURRENT_USER: 'current_user',
  BOOKS: 'communication_books',
  MESSAGES: 'messages',
  SYMBOLS: 'symbols',
  SETTINGS: 'app_settings',
  ANALYTICS: 'usage_analytics',
  BACKUP: 'backup_data',
} as const;

export const DATABASE_TABLES = {
  USERS: 'users',
  BOOKS: 'communication_books',
  PAGES: 'communication_pages',
  BUTTONS: 'communication_buttons',
  MESSAGES: 'messages',
  SYMBOLS: 'symbols',
  ANALYTICS: 'usage_analytics',
  HOTSPOTS: 'hotspots',
  EXPRESS_SENTENCES: 'express_sentences',
  FAVORITES: 'user_favorites',
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUDIO_ERROR: 'AUDIO_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const PERMISSIONS = {
  CAMERA: 'camera',
  MICROPHONE: 'microphone',
  STORAGE: 'storage',
  MEDIA_LIBRARY: 'media_library',
  NOTIFICATIONS: 'notifications',
} as const;

export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  AUDIO: ['mp3', 'wav', 'aac', 'm4a'],
  VIDEO: ['mp4', 'mov', 'avi'],
} as const;

export const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 100 * 1024 * 1024, // 100MB
} as const;

export const BACKUP_SETTINGS = {
  MAX_BACKUPS: 10,
  AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  BACKUP_RETENTION_DAYS: 30,
} as const;

export const ANALYTICS_EVENTS = {
  BUTTON_PRESS: 'button_press',
  PAGE_VIEW: 'page_view',
  SPEECH_EVENT: 'speech_event',
  NAVIGATION: 'navigation',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  USER_SWITCH: 'user_switch',
  SETTING_CHANGE: 'setting_change',
} as const;

export const ACCESSIBILITY_LABELS = {
  COMMUNICATION_BUTTON: 'Communication button',
  NAVIGATION_BUTTON: 'Navigation button',
  SPEAK_BUTTON: 'Speak button',
  CLEAR_BUTTON: 'Clear button',
  BACK_BUTTON: 'Back button',
  HOME_BUTTON: 'Home button',
  SETTINGS_BUTTON: 'Settings button',
  USER_SWITCH: 'Switch user',
  SCAN_INDICATOR: 'Scanning indicator',
  AUDIO_PLAYER: 'Audio player',
  RECORDING_BUTTON: 'Recording button',
} as const;

// COMPONENT_STYLES have been removed. Use getThemeColors() from themeUtils instead.
// This ensures all components use the theme system for consistent colors.

// Note: DEFAULT_SETTINGS is now deprecated in favor of theme-aware defaults
// Use getDefaultSettings() function instead for theme-aware initialization
export const DEFAULT_SETTINGS = {
  VOICE: {
    ttsVoice: 'female-1',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    volume: 0.8,
    autoRepeat: false,
    repeatDelay: 1000,
  },
  VISUAL: {
    highContrast: false,
    largeText: false,
    buttonSize: 'medium' as const,
    gridSpacing: 8,
    backgroundColor: '#FAFAFA', // Light theme background
    textColor: '#2C2C2C', // Light theme text
    borderColor: '#E0E0E0', // Light theme border
    theme: 'system' as const, // Default to system theme
    calmMode: false,
    reduceMotion: false,
    sensoryFriendly: false,
  },
  ACCESSIBILITY: {
    switchScanning: false,
    scanSpeed: SCANNING_SPEEDS.NORMAL,
    scanMode: 'automatic' as const,
    scanDirection: 'row-column' as const,
    holdToActivate: false,
    touchSensitivity: 0.5,
    oneHandedMode: false,
    reduceMotion: false,
  },
  AUDIO: {
    volume: 0.8,
    backgroundMusic: false,
    musicVolume: 0.3,
    audioFeedback: true,
    noiseReduction: true,
  },
} as const;

// Theme-aware default settings function
export const getDefaultSettings = (
  theme: 'light' | 'dark' | 'high-contrast' | 'system' = 'system'
) => {
  // Use hardcoded light theme colors as defaults to avoid import issues
  const defaultColors = {
    background: '#FAFAFA', // Light theme background
    text: '#2C2C2C', // Light theme text
    border: '#E0E0E0', // Light theme border
  };

  return {
    voiceSettings: {
      ttsVoice: 'default',
      ttsSpeed: 1.0,
      ttsPitch: 1.0,
      volume: 0.8,
      autoRepeat: false,
      repeatDelay: 2000,
    },
    visualSettings: {
      highContrast: false,
      largeText: false,
      buttonSize: 'medium' as const,
      gridSpacing: 8,
      backgroundColor: defaultColors.background,
      textColor: defaultColors.text,
      borderColor: defaultColors.border,
      theme: theme,
      calmMode: false,
      reduceMotion: false,
      sensoryFriendly: false,
    },
    accessibilitySettings: {
      switchScanning: false,
      scanSpeed: 1000,
      scanMode: 'automatic' as const,
      scanDirection: 'row-column' as const,
      holdToActivate: false,
      touchSensitivity: 0.5,
      oneHandedMode: false,
      reduceMotion: false,
    },
    scanningSettings: {
      enabled: false,
      speed: 1000,
      mode: 'automatic' as const,
      direction: 'row-column' as const,
      visualIndicator: true,
      audioIndicator: true,
      externalSwitch: false,
    },
    audioSettings: {
      volume: 0.8,
      backgroundMusic: false,
      musicVolume: 0.5,
      audioFeedback: true,
      noiseReduction: false,
    },
    expressSettings: {
      combineTTSItems: false,
      combineAsWordFragments: false,
      rightToLeftAccumulation: false,
      playWhenAdding: false,
      scanExpressBar: false,
      expressBarLocation: 'top' as const,
      disableExpressRepeat: false,
      createNewPagesAsExpress: false,
    },
    advancedSettings: {
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
  };
};
