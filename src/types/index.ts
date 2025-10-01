// Core Type Definitions for Ausmo AAC App

// Fix for React Native 0.81.4 exports field compatibility
declare global {
  interface NodeModule {
    exports?: any;
  }

  interface Module {
    exports?: any;
  }
}

export type UserRole = 'child' | 'parent' | 'therapist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;
  // Role-specific fields
  therapistProfile?: TherapistProfile;
  parentProfile?: ParentProfile;
  childProfile?: ChildProfile;
}

export interface UserSettings {
  voiceSettings: VoiceSettings;
  visualSettings: VisualSettings;
  accessibilitySettings: AccessibilitySettings;
  scanningSettings: ScanningSettings;
  audioSettings: AudioSettings;
  expressSettings: ExpressSettings;
  advancedSettings: AdvancedSettings;
}

export interface VoiceSettings {
  ttsVoice?: string;
  ttsSpeed: number;
  ttsPitch: number;
  volume: number;
  autoRepeat: boolean;
  repeatDelay: number;
}

export interface ExpressSettings {
  combineTTSItems: boolean;
  combineAsWordFragments: boolean;
  rightToLeftAccumulation: boolean;
  playWhenAdding: boolean;
  scanExpressBar: boolean;
  expressBarLocation: 'top' | 'bottom';
  disableExpressRepeat: boolean;
  createNewPagesAsExpress: boolean;
}

export interface AdvancedSettings {
  hideAllImages: boolean;
  showTouchesWhenExternalDisplay: boolean;
  switchamajigSupport: boolean;
  quizSupport: boolean;
  enableEightQuickButtons: boolean;
  tactileTalkSupport: boolean;
  disableInternetSearch: boolean;
  goToMainMenuOnNextStartup: boolean;
  experimentalFeatures: boolean;
}

export interface VisualSettings {
  highContrast: boolean;
  largeText: boolean;
  buttonSize: 'small' | 'medium' | 'large' | 'extra-large';
  gridSpacing: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  theme: 'light' | 'dark' | 'high-contrast' | 'system';
  // Autism-friendly settings
  calmMode: boolean;
  reduceMotion: boolean;
  sensoryFriendly: boolean;
  // Additional theme customization
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
  };
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
  title: string; // Add title property
  description?: string;
  category: string;
  userId: string;
  pages: CommunicationPage[];
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isShared: boolean;
  author?: string; // Add author property
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
  audioUrl?: string; // Add audioUrl property
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
  syncedButtonId?: string; // Reference to synced button if this is a synced button instance
}

export interface ButtonAction {
  type: 'speak' | 'navigate' | 'clear' | 'back' | 'home' | 'custom' | 'quiz';
  targetPageId?: string;
  targetBookId?: string;
  customAction?: string;
  quizAction?: {
    isCorrect: boolean;
    feedback?: string;
    points?: number;
  };
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

// Note: DEFAULT_SETTINGS is now deprecated in favor of getDefaultSettings() function
// This is kept for backward compatibility but should not be used for new code
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
    backgroundColor: '#FAFAFA', // Light theme background
    textColor: '#2C2C2C', // Light theme text
    borderColor: '#E0E0E0', // Light theme border
    theme: 'system', // Default to system theme
    calmMode: false,
    reduceMotion: false,
    sensoryFriendly: false,
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
  expressSettings: {
    combineTTSItems: true,
    combineAsWordFragments: false,
    rightToLeftAccumulation: false,
    playWhenAdding: false,
    scanExpressBar: false,
    expressBarLocation: 'bottom',
    disableExpressRepeat: false,
    createNewPagesAsExpress: false,
  },
  advancedSettings: {
    hideAllImages: false,
    showTouchesWhenExternalDisplay: false,
    switchamajigSupport: false,
    quizSupport: true,
    enableEightQuickButtons: false,
    tactileTalkSupport: false,
    disableInternetSearch: false,
    goToMainMenuOnNextStartup: false,
    experimentalFeatures: false,
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

// Synced Button Types
export interface SyncedButton {
  id: string;
  name: string;
  text: string;
  image?: string;
  ttsMessage?: string;
  action: ButtonAction;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  size: ButtonSize;
  category: string;
  tags: string[];
  isVisible: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface SyncedButtonLibrary {
  id: string;
  name: string;
  description: string;
  userId: string;
  buttons: SyncedButton[];
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Types
export interface QuizSession {
  id: string;
  pageId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  isCompleted: boolean;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  points: number;
  feedback?: string;
  isAnswered: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizSettings {
  enabled: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showFeedback: boolean;
  autoAdvance: boolean;
  timeLimit?: number; // in seconds
  passingScore: number; // percentage
}

// Therapist and Therapy Types
export interface TherapyGoal {
  id: string;
  patientId: string;
  therapistId: string;
  therapyType: 'ABA' | 'Speech' | 'OT';
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  targetBehavior: string;
  measurementCriteria: string;
  baselineData: {
    frequency: number;
    duration?: number;
    accuracy?: number;
    independence?: number;
    date: Date;
  };
  targetData: {
    frequency: number;
    duration?: number;
    accuracy?: number;
    independence?: number;
    timeframe: number; // days
  };
  currentProgress: {
    frequency: number;
    duration?: number;
    accuracy?: number;
    independence?: number;
    lastUpdated: Date;
  };
  masteryCriteria: {
    consecutiveDays: number;
    accuracyThreshold: number;
    independenceThreshold: number;
  };
  status: 'active' | 'mastered' | 'paused' | 'discontinued';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  masteredAt?: Date;
}

export interface TherapyTask {
  id: string;
  goalId: string;
  title: string;
  description: string;
  instructions: string[];
  materials: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  skills: string[];
  prerequisites: string[];
  adaptations: {
    visual: string[];
    auditory: string[];
    motor: string[];
    cognitive: string[];
  };
  dataCollection: {
    frequency: boolean;
    duration: boolean;
    accuracy: boolean;
    independence: boolean;
    prompts: boolean;
    behavior: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  sessionDate: Date;
  duration: number; // minutes
  goals: string[]; // goal IDs
  tasks: string[]; // task IDs
  activities: SessionActivity[];
  notes: string;
  data: SessionData[];
  recommendations: string[];
  nextSessionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionActivity {
  id: string;
  taskId: string;
  goalId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  attempts: number;
  successes: number;
  prompts: number;
  independence: number; // 0-100%
  accuracy: number; // 0-100%
  behavior: {
    positive: string[];
    challenging: string[];
    strategies: string[];
  };
  notes: string;
}

export interface SessionData {
  goalId: string;
  measurement: 'frequency' | 'duration' | 'accuracy' | 'independence';
  value: number;
  context: string;
  timestamp: Date;
}

export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: Date;
  diagnosis: string[];
  therapyTypes: ('ABA' | 'Speech' | 'OT')[];
  communicationLevel:
    | 'pre-verbal'
    | 'single-words'
    | 'phrases'
    | 'sentences'
    | 'conversational';
  cognitiveLevel: 'severe' | 'moderate' | 'mild' | 'typical';
  motorLevel: 'severe' | 'moderate' | 'mild' | 'typical';
  sensoryProfile: {
    visual: 'hypersensitive' | 'typical' | 'hyposensitive';
    auditory: 'hypersensitive' | 'typical' | 'hyposensitive';
    tactile: 'hypersensitive' | 'typical' | 'hyposensitive';
    vestibular: 'hypersensitive' | 'typical' | 'hyposensitive';
  };
  interests: string[];
  strengths: string[];
  challenges: string[];
  goals: string[]; // goal IDs
  therapists: string[]; // therapist IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistProfile {
  id: string;
  user_id?: string;
  userId?: string; // Add userId property
  name: string;
  credentials: string;
  specialties: ('ABA' | 'Speech' | 'OT')[];
  licenseNumber?: string;
  email: string;
  phone?: string;
  phoneNumber?: string; // Add phoneNumber property
  patients: string[]; // patient IDs
  caseload: number;
  experience: number; // years
  practiceName?: string; // Add practiceName property
  practiceAddress?: string; // Add practiceAddress property
  isVerified?: boolean; // Add isVerified property
  isAcceptingPatients?: boolean; // Add isAcceptingPatients property
  maxPatients?: number; // Add maxPatients property
  currentPatients?: string[]; // Add currentPatients property
  currentPatientCount?: number; // Add currentPatientCount property
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentProfile {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  children: string[]; // child user IDs
  relationship: 'parent' | 'guardian' | 'caregiver';
  emergencyContact: boolean;
  notifications: {
    progressUpdates: boolean;
    sessionReminders: boolean;
    goalAchievements: boolean;
    weeklyReports: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildProfile {
  id: string;
  user_id?: string;
  name: string;
  dateOfBirth: Date;
  diagnosis: string[];
  therapyTypes: ('ABA' | 'Speech' | 'OT')[];
  communicationLevel:
    | 'pre-verbal'
    | 'single-words'
    | 'phrases'
    | 'sentences'
    | 'conversational';
  cognitiveLevel: 'severe' | 'moderate' | 'mild' | 'typical';
  motorLevel: 'severe' | 'moderate' | 'mild' | 'typical';
  sensoryProfile: {
    visual: 'hypersensitive' | 'typical' | 'hyposensitive';
    auditory: 'hypersensitive' | 'typical' | 'hyposensitive';
    tactile: 'hypersensitive' | 'typical' | 'hyposensitive';
    vestibular: 'hypersensitive' | 'typical' | 'hyposensitive';
  };
  interests: string[];
  strengths: string[];
  challenges: string[];
  goals: string[]; // goal IDs
  therapists: string[]; // therapist IDs
  currentTherapists?: string[]; // Add currentTherapists property
  parents: string[]; // parent IDs
  currentGoals: ActiveGoal[]; // Goals currently being worked on
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveGoal {
  id: string;
  title: string;
  description: string;
  therapyType: 'ABA' | 'Speech' | 'OT';
  progress: number; // percentage
  nextActivity?: string; // Next activity to work on
  accessibleInApp: boolean; // Can be accessed through app activities
  appActivity?: string; // Specific app activity for this goal
  lastWorkedOn?: Date;
  masteryStatus: 'not_started' | 'in_progress' | 'mastered' | 'regressed';
}

export interface ProgressReport {
  id: string;
  patientId: string;
  therapistId: string;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  goals: {
    goalId: string;
    progress: number; // percentage
    masteryStatus: 'not_started' | 'in_progress' | 'mastered' | 'regressed';
    dataPoints: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  summary: string;
  recommendations: string[];
  nextSteps: string[];
  createdAt: Date;
}

// Patient Assignment Request interface
export interface PatientAssignmentRequest {
  id: string;
  parentId: string;
  therapistId: string;
  childId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestMessage?: string;
  therapistResponse?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}
