// Core Type Definitions for Ausmo AAC App

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  voiceSettings: VoiceSettings;
  visualSettings: VisualSettings;
  accessibilitySettings: AccessibilitySettings;
  scanningSettings: ScanningSettings;
  audioSettings: AudioSettings;
}

export interface VoiceSettings {
  ttsVoice?: string;
  ttsSpeed: number;
  ttsPitch: number;
  volume: number;
  autoRepeat: boolean;
  repeatDelay: number;
}

export interface VisualSettings {
  highContrast: boolean;
  largeText: boolean;
  buttonSize: 'small' | 'medium' | 'large' | 'extra-large';
  gridSpacing: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  theme: 'light' | 'dark' | 'high-contrast';
}

export interface AccessibilitySettings {
  switchScanning: boolean;
  scanSpeed: number;
  scanMode: 'automatic' | 'step-by-step';
  scanDirection: 'row-column' | 'item';
  holdToActivate: boolean;
  touchSensitivity: number;
  oneHandedMode: boolean;
  reduceMotion: boolean;
  screenReader?: {
    enabled: boolean;
    announceChanges: boolean;
    announceButtons: boolean;
  };
  gestures?: {
    enabled: boolean;
    customGestures: Record<string, string>;
  };
  oneHanded?: {
    enabled: boolean;
    side: 'left' | 'right';
  };
  highContrast?: boolean;
  largeText?: boolean;
  colorBlindSupport?: boolean;
  voiceControl?: boolean;
  switchControl?: boolean;
  assistiveTouch?: boolean;
}

export interface ScanningSettings {
  enabled: boolean;
  speed: number;
  mode: 'automatic' | 'step-by-step';
  direction: 'row-column' | 'item';
  visualIndicator: boolean;
  audioIndicator: boolean;
  externalSwitch: boolean;
}

export interface AudioSettings {
  volume: number;
  backgroundMusic: boolean;
  musicVolume: number;
  audioFeedback: boolean;
  noiseReduction: boolean;
}

export interface CommunicationBook {
  id: string;
  name: string;
  description?: string;
  category: string;
  userId: string;
  pages: CommunicationPage[];
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isShared: boolean;
}

export interface CommunicationPage {
  id: string;
  bookId: string;
  name: string;
  type: PageType;
  layout: PageLayout;
  buttons: CommunicationButton[];
  backgroundImage?: string;
  backgroundColor: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PageType = 'standard' | 'express' | 'visual-scene' | 'keyboard';

export interface PageLayout {
  gridSize: GridSize;
  buttonSize: ButtonSize;
  spacing: number;
  padding: number;
  orientation: 'portrait' | 'landscape';
}

export type GridSize = 1 | 2 | 4 | 6 | 9 | 16 | 25 | 36;

export type ButtonSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface CommunicationButton {
  id: string;
  pageId: string;
  text: string;
  image?: string;
  audioMessage?: string;
  ttsMessage?: string;
  action: ButtonAction;
  position: ButtonPosition;
  size: ButtonSize;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ButtonAction {
  type: 'speak' | 'navigate' | 'clear' | 'back' | 'home' | 'custom';
  targetPageId?: string;
  targetBookId?: string;
  customAction?: string;
}

export interface ButtonPosition {
  row: number;
  column: number;
  width: number;
  height: number;
}

export interface Symbol {
  id: string;
  name: string;
  category: string;
  image: string;
  keywords: string[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  text: string;
  audioFile?: string;
  ttsVoice?: string;
  category: string;
  userId: string;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotspot {
  id: string;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: ButtonAction;
  isVisible: boolean;
}

export interface ExpressSentence {
  id: string;
  userId: string;
  words: string[];
  audioFile?: string;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageAnalytics {
  userId: string;
  date: Date;
  messagesSpoken: number;
  pagesViewed: number;
  sessionDuration: number;
  mostUsedButtons: string[];
  vocabularyGrowth: number;
}

export interface BackupData {
  users: User[];
  books: CommunicationBook[];
  messages: Message[];
  symbols: Symbol[];
  analytics: UsageAnalytics[];
  settings: AppSettings;
  version: string;
  createdAt: Date;
}

export interface AppSettings {
  defaultVoice?: string;
  defaultLanguage?: string;
  autoBackup?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  cloudSync?: boolean;
  analyticsEnabled?: boolean;
  crashReporting?: boolean;
  tutorialCompleted?: boolean;
}

// Default settings for new users
export const DEFAULT_SETTINGS: UserSettings = {
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
    buttonSize: 'medium',
    gridSpacing: 8,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    borderColor: '#CCCCCC',
    theme: 'light',
  },
  accessibilitySettings: {
    switchScanning: false,
    scanSpeed: 1000,
    scanMode: 'automatic',
    scanDirection: 'row-column',
    holdToActivate: false,
    touchSensitivity: 0.5,
    oneHandedMode: false,
    reduceMotion: false,
  },
  scanningSettings: {
    enabled: false,
    speed: 1000,
    mode: 'automatic',
    direction: 'row-column',
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
};

export interface NavigationState {
  currentBookId?: string;
  currentPageId?: string;
  history: NavigationHistoryItem[];
  breadcrumbs: BreadcrumbItem[];
}

export interface NavigationHistoryItem {
  bookId: string;
  pageId: string;
  timestamp: number;
}

export interface BreadcrumbItem {
  bookId: string;
  pageId: string;
  name: string;
}

export interface ScanState {
  isScanning: boolean;
  currentRow: number;
  currentColumn: number;
  currentItem: number;
  scanMode: 'row-column' | 'item';
  scanSpeed: number;
  highlightedButton?: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentSound?: string;
  volume: number;
  isRecording: boolean;
  recordingDuration: number;
}

export interface AppState {
  user: User | null;
  currentBook: CommunicationBook | null;
  currentPage: CommunicationPage | null;
  navigation: NavigationState;
  scanState: ScanState;
  audioState: AudioState;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Event Types
export interface ButtonPressEvent {
  buttonId: string;
  pageId: string;
  timestamp: Date;
  userId: string;
}

export interface NavigationEvent {
  fromPageId?: string;
  toPageId: string;
  bookId: string;
  timestamp: Date;
  userId: string;
}

export interface SpeechEvent {
  messageId: string;
  text: string;
  timestamp: Date;
  userId: string;
  method: 'tts' | 'audio';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
