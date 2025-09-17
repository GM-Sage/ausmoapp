// Constants for Ausmo AAC App

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

export const COLORS = {
  PRIMARY: '#2196F3',
  SECONDARY: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
  BACKGROUND: '#F5F5F5',
  BACKGROUND_LIGHT: '#FAFAFA',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_DISABLED: '#999999',
  BORDER: '#E0E0E0',
  DIVIDER: '#EEEEEE',
  // High contrast colors
  HIGH_CONTRAST_BACKGROUND: '#000000',
  HIGH_CONTRAST_SURFACE: '#FFFFFF',
  HIGH_CONTRAST_TEXT: '#FFFFFF',
  HIGH_CONTRAST_BORDER: '#FFFFFF',
} as const;

export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 10,
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 16,
    EXTRA_LARGE: 18,
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

export const AUDIO_SETTINGS = {
  MAX_RECORDING_DURATION: 30000, // 30 seconds
  MIN_RECORDING_DURATION: 500,   // 0.5 seconds
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
    backgroundColor: COLORS.BACKGROUND,
    textColor: COLORS.TEXT_PRIMARY,
    borderColor: COLORS.BORDER,
    theme: 'light' as const,
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
