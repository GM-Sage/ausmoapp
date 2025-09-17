// Onboarding Service for Ausmo AAC App
// Provides comprehensive onboarding and tutorial system for new users

import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'tutorial' | 'setup' | 'demo' | 'completion';
  screen: string;
  component: string;
  order: number;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  duration: number; // estimated seconds
  prerequisites: string[];
  actions: OnboardingAction[];
}

export interface OnboardingAction {
  id: string;
  type: 'tap' | 'swipe' | 'speak' | 'navigate' | 'complete';
  target: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'advanced' | 'accessibility' | 'collaboration' | 'education';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TutorialStep[];
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  type: 'instruction' | 'interactive' | 'demo' | 'practice' | 'assessment';
  content: string;
  media?: {
    type: 'image' | 'video' | 'animation';
    url: string;
    alt: string;
  };
  actions: OnboardingAction[];
  isCompleted: boolean;
  completedAt?: Date;
  hints: string[];
  successCriteria: string[];
}

export interface OnboardingProgress {
  userId: string;
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  totalSteps: number;
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  timeSpent: number; // minutes
}

export interface OnboardingSettings {
  showOnboarding: boolean;
  skipOnboarding: boolean;
  showHints: boolean;
  autoAdvance: boolean;
  showProgress: boolean;
  allowSkipping: boolean;
  reminderFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  lastReminder?: Date;
}

class OnboardingService {
  private static instance: OnboardingService;
  private currentUser: User | null = null;
  private isInitialized = false;
  private onboardingSteps: OnboardingStep[] = [];
  private tutorials: Tutorial[] = [];
  private onboardingProgress: OnboardingProgress | null = null;
  private onboardingSettings: OnboardingSettings;

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  constructor() {
    this.onboardingSettings = {
      showOnboarding: true,
      skipOnboarding: false,
      showHints: true,
      autoAdvance: false,
      showProgress: true,
      allowSkipping: true,
      reminderFrequency: 'weekly',
    };

    this.initializeOnboardingSteps();
    this.initializeTutorials();
  }

  // Initialize onboarding service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await this.loadOnboardingSettings();
      await this.loadOnboardingProgress();
      this.isInitialized = true;
      console.log('Onboarding service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing onboarding service:', error);
    }
  }

  // Onboarding Steps Management
  private initializeOnboardingSteps(): void {
    this.onboardingSteps = [
      {
        id: 'welcome',
        title: 'Welcome to Ausmo',
        description: 'Let\'s get you started with your AAC communication journey',
        type: 'welcome',
        screen: 'WelcomeScreen',
        component: 'WelcomeOnboarding',
        order: 1,
        isRequired: true,
        isCompleted: false,
        duration: 30,
        prerequisites: [],
        actions: [
          {
            id: 'welcome_continue',
            type: 'tap',
            target: 'continue_button',
            description: 'Tap Continue to proceed',
            isCompleted: false,
          },
        ],
      },
      {
        id: 'user_setup',
        title: 'Set Up Your Profile',
        description: 'Create your user profile and preferences',
        type: 'setup',
        screen: 'CreateUserScreen',
        component: 'UserSetupOnboarding',
        order: 2,
        isRequired: true,
        isCompleted: false,
        duration: 120,
        prerequisites: ['welcome'],
        actions: [
          {
            id: 'user_setup_name',
            type: 'tap',
            target: 'name_input',
            description: 'Enter your name',
            isCompleted: false,
          },
          {
            id: 'user_setup_avatar',
            type: 'tap',
            target: 'avatar_selection',
            description: 'Choose your avatar',
            isCompleted: false,
          },
          {
            id: 'user_setup_complete',
            type: 'complete',
            target: 'create_user',
            description: 'Complete user setup',
            isCompleted: false,
          },
        ],
      },
      {
        id: 'communication_demo',
        title: 'Communication Basics',
        description: 'Learn how to use the communication features',
        type: 'demo',
        screen: 'CommunicationScreen',
        component: 'CommunicationDemo',
        order: 3,
        isRequired: true,
        isCompleted: false,
        duration: 180,
        prerequisites: ['user_setup'],
        actions: [
          {
            id: 'comm_demo_tap',
            type: 'tap',
            target: 'communication_button',
            description: 'Tap a communication button',
            isCompleted: false,
          },
          {
            id: 'comm_demo_speak',
            type: 'speak',
            target: 'tts_output',
            description: 'Listen to the speech output',
            isCompleted: false,
          },
          {
            id: 'comm_demo_navigate',
            type: 'navigate',
            target: 'page_navigation',
            description: 'Navigate between pages',
            isCompleted: false,
          },
        ],
      },
      {
        id: 'library_tour',
        title: 'Library Tour',
        description: 'Explore the communication book library',
        type: 'tutorial',
        screen: 'LibraryScreen',
        component: 'LibraryTour',
        order: 4,
        isRequired: false,
        isCompleted: false,
        duration: 150,
        prerequisites: ['communication_demo'],
        actions: [
          {
            id: 'library_tour_browse',
            type: 'swipe',
            target: 'book_list',
            description: 'Browse through communication books',
            isCompleted: false,
          },
          {
            id: 'library_tour_create',
            type: 'tap',
            target: 'create_book',
            description: 'Learn how to create a new book',
            isCompleted: false,
          },
          {
            id: 'library_tour_edit',
            type: 'tap',
            target: 'edit_book',
            description: 'Learn how to edit a book',
            isCompleted: false,
          },
        ],
      },
      {
        id: 'settings_intro',
        title: 'Settings Overview',
        description: 'Customize your app experience',
        type: 'tutorial',
        screen: 'SettingsScreen',
        component: 'SettingsIntro',
        order: 5,
        isRequired: false,
        isCompleted: false,
        duration: 120,
        prerequisites: ['library_tour'],
        actions: [
          {
            id: 'settings_intro_audio',
            type: 'tap',
            target: 'audio_settings',
            description: 'Explore audio settings',
            isCompleted: false,
          },
          {
            id: 'settings_intro_visual',
            type: 'tap',
            target: 'visual_settings',
            description: 'Explore visual settings',
            isCompleted: false,
          },
          {
            id: 'settings_intro_accessibility',
            type: 'tap',
            target: 'accessibility_settings',
            description: 'Explore accessibility settings',
            isCompleted: false,
          },
        ],
      },
      {
        id: 'onboarding_complete',
        title: 'You\'re All Set!',
        description: 'Congratulations! You\'re ready to start communicating',
        type: 'completion',
        screen: 'HomeScreen',
        component: 'OnboardingComplete',
        order: 6,
        isRequired: true,
        isCompleted: false,
        duration: 60,
        prerequisites: ['communication_demo'],
        actions: [
          {
            id: 'complete_finish',
            type: 'tap',
            target: 'finish_button',
            description: 'Finish onboarding',
            isCompleted: false,
          },
        ],
      },
    ];
  }

  private initializeTutorials(): void {
    this.tutorials = [
      {
        id: 'basic_communication',
        title: 'Basic Communication',
        description: 'Learn the fundamentals of AAC communication',
        category: 'basic',
        difficulty: 'beginner',
        estimatedTime: 15,
        isCompleted: false,
        progress: 0,
        steps: [
          {
            id: 'basic_comm_step1',
            title: 'Understanding Symbols',
            description: 'Learn how symbols represent words and concepts',
            type: 'instruction',
            content: 'Symbols are visual representations of words, ideas, or actions. They help you communicate by tapping or selecting them.',
            media: {
              type: 'image',
              url: 'symbol_explanation.png',
              alt: 'Symbol explanation diagram',
            },
            actions: [],
            isCompleted: false,
            hints: ['Look for familiar symbols', 'Symbols can represent objects, actions, or feelings'],
            successCriteria: ['Understand what symbols are', 'Recognize common symbols'],
          },
          {
            id: 'basic_comm_step2',
            title: 'Tapping to Communicate',
            description: 'Learn how to tap symbols to speak',
            type: 'interactive',
            content: 'Tap any symbol to hear it spoken aloud. Try tapping different symbols to build sentences.',
            actions: [
              {
                id: 'tap_symbol',
                type: 'tap',
                target: 'symbol_button',
                description: 'Tap a symbol to hear it spoken',
                isCompleted: false,
              },
            ],
            isCompleted: false,
            hints: ['Tap gently on symbols', 'Listen for the speech output'],
            successCriteria: ['Successfully tap symbols', 'Hear speech output'],
          },
          {
            id: 'basic_comm_step3',
            title: 'Building Sentences',
            description: 'Learn how to combine symbols to form sentences',
            type: 'practice',
            content: 'Combine multiple symbols to create complete sentences. Start with simple phrases like "I want" + "food".',
            actions: [
              {
                id: 'build_sentence',
                type: 'tap',
                target: 'sentence_builder',
                description: 'Build a complete sentence',
                isCompleted: false,
              },
            ],
            isCompleted: false,
            hints: ['Start with "I want" or "I need"', 'Add action words and objects'],
            successCriteria: ['Build a complete sentence', 'Understand sentence structure'],
          },
        ],
      },
      {
        id: 'advanced_features',
        title: 'Advanced Features',
        description: 'Explore advanced communication features',
        category: 'advanced',
        difficulty: 'intermediate',
        estimatedTime: 25,
        isCompleted: false,
        progress: 0,
        steps: [
          {
            id: 'advanced_step1',
            title: 'Word Prediction',
            description: 'Learn how to use word prediction for faster communication',
            type: 'instruction',
            content: 'Word prediction suggests words as you type, making communication faster and more efficient.',
            actions: [],
            isCompleted: false,
            hints: ['Look for suggested words above the keyboard', 'Tap suggested words to use them'],
            successCriteria: ['Understand word prediction', 'Use suggested words'],
          },
          {
            id: 'advanced_step2',
            title: 'Quick Phrases',
            description: 'Learn how to use and create quick phrases',
            type: 'interactive',
            content: 'Quick phrases are pre-made sentences you can use frequently. Create your own for common needs.',
            actions: [
              {
                id: 'use_quick_phrase',
                type: 'tap',
                target: 'quick_phrase',
                description: 'Use a quick phrase',
                isCompleted: false,
              },
            ],
            isCompleted: false,
            hints: ['Quick phrases appear at the top of the keyboard', 'Create phrases for common needs'],
            successCriteria: ['Use quick phrases', 'Create custom phrases'],
          },
        ],
      },
      {
        id: 'accessibility_features',
        title: 'Accessibility Features',
        description: 'Learn about accessibility options and switch scanning',
        category: 'accessibility',
        difficulty: 'beginner',
        estimatedTime: 20,
        isCompleted: false,
        progress: 0,
        steps: [
          {
            id: 'accessibility_step1',
            title: 'Switch Scanning',
            description: 'Learn how to use switch scanning for communication',
            type: 'instruction',
            content: 'Switch scanning allows you to navigate through options using external switches or buttons.',
            actions: [],
            isCompleted: false,
            hints: ['Switch scanning highlights options automatically', 'Use switches to select highlighted options'],
            successCriteria: ['Understand switch scanning', 'Know how to use switches'],
          },
          {
            id: 'accessibility_step2',
            title: 'Screen Reader Support',
            description: 'Learn about screen reader compatibility',
            type: 'instruction',
            content: 'The app works with screen readers to provide audio descriptions of all elements.',
            actions: [],
            isCompleted: false,
            hints: ['Enable screen reader in device settings', 'Listen for audio descriptions'],
            successCriteria: ['Understand screen reader support', 'Know how to enable it'],
          },
        ],
      },
      {
        id: 'collaboration_tutorial',
        title: 'Collaboration Features',
        description: 'Learn how to collaborate with therapists and caregivers',
        category: 'collaboration',
        difficulty: 'intermediate',
        estimatedTime: 18,
        isCompleted: false,
        progress: 0,
        steps: [
          {
            id: 'collaboration_step1',
            title: 'Sharing Books',
            description: 'Learn how to share communication books with others',
            type: 'instruction',
            content: 'You can share your communication books with therapists, caregivers, and family members.',
            actions: [],
            isCompleted: false,
            hints: ['Use the share button in the library', 'Choose who to share with'],
            successCriteria: ['Understand sharing functionality', 'Know how to share books'],
          },
          {
            id: 'collaboration_step2',
            title: 'Remote Support',
            description: 'Learn about remote support features',
            type: 'instruction',
            content: 'Therapists can provide remote support and guidance through the app.',
            actions: [],
            isCompleted: false,
            hints: ['Remote support requires internet connection', 'Therapists can see your progress'],
            successCriteria: ['Understand remote support', 'Know how to request help'],
          },
        ],
      },
      {
        id: 'educational_features',
        title: 'Educational Features',
        description: 'Learn about learning and assessment tools',
        category: 'education',
        difficulty: 'beginner',
        estimatedTime: 22,
        isCompleted: false,
        progress: 0,
        steps: [
          {
            id: 'education_step1',
            title: 'Core Vocabulary',
            description: 'Learn about core vocabulary and progressive learning',
            type: 'instruction',
            content: 'Core vocabulary includes the most important words for communication. Learn them progressively.',
            actions: [],
            isCompleted: false,
            hints: ['Start with basic words', 'Practice regularly'],
            successCriteria: ['Understand core vocabulary', 'Know how to practice'],
          },
          {
            id: 'education_step2',
            title: 'Learning Activities',
            description: 'Learn about educational games and activities',
            type: 'interactive',
            content: 'Engage in fun learning activities to improve your communication skills.',
            actions: [
              {
                id: 'complete_activity',
                type: 'complete',
                target: 'learning_activity',
                description: 'Complete a learning activity',
                isCompleted: false,
              },
            ],
            isCompleted: false,
            hints: ['Activities are designed to be fun', 'Complete activities regularly'],
            successCriteria: ['Complete learning activities', 'Understand educational features'],
          },
        ],
      },
    ];
  }

  // Onboarding Progress Management
  async startOnboarding(): Promise<OnboardingProgress> {
    try {
      if (!this.currentUser) {
        throw new Error('User not initialized');
      }

      const progress: OnboardingProgress = {
        userId: this.currentUser.id,
        currentStep: this.onboardingSteps[0].id,
        completedSteps: [],
        skippedSteps: [],
        totalSteps: this.onboardingSteps.length,
        progress: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        timeSpent: 0,
      };

      this.onboardingProgress = progress;
      await this.saveOnboardingProgress();
      
      console.log('Onboarding started for user:', this.currentUser.id);
      return progress;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      throw error;
    }
  }

  async completeOnboardingStep(stepId: string): Promise<void> {
    try {
      if (!this.onboardingProgress) {
        throw new Error('Onboarding not started');
      }

      const step = this.onboardingSteps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }

      // Mark step as completed
      step.isCompleted = true;
      step.completedAt = new Date();

      // Update progress
      this.onboardingProgress.completedSteps.push(stepId);
      this.onboardingProgress.progress = Math.round(
        (this.onboardingProgress.completedSteps.length / this.onboardingProgress.totalSteps) * 100
      );

      // Move to next step
      const nextStep = this.onboardingSteps.find(s => 
        s.order === step.order + 1 && !s.isCompleted
      );
      if (nextStep) {
        this.onboardingProgress.currentStep = nextStep.id;
      } else {
        // Onboarding completed
        this.onboardingProgress.completedAt = new Date();
      }

      this.onboardingProgress.lastAccessedAt = new Date();
      await this.saveOnboardingProgress();

      console.log('Onboarding step completed:', stepId);
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  async skipOnboardingStep(stepId: string): Promise<void> {
    try {
      if (!this.onboardingProgress) {
        throw new Error('Onboarding not started');
      }

      const step = this.onboardingSteps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }

      // Mark step as skipped
      this.onboardingProgress.skippedSteps.push(stepId);

      // Move to next step
      const nextStep = this.onboardingSteps.find(s => 
        s.order === step.order + 1 && !s.isCompleted
      );
      if (nextStep) {
        this.onboardingProgress.currentStep = nextStep.id;
      }

      this.onboardingProgress.lastAccessedAt = new Date();
      await this.saveOnboardingProgress();

      console.log('Onboarding step skipped:', stepId);
    } catch (error) {
      console.error('Error skipping onboarding step:', error);
      throw error;
    }
  }

  // Tutorial Management
  async startTutorial(tutorialId: string): Promise<Tutorial | null> {
    try {
      const tutorial = this.tutorials.find(t => t.id === tutorialId);
      if (!tutorial) {
        throw new Error('Tutorial not found');
      }

      console.log('Tutorial started:', tutorialId);
      return tutorial;
    } catch (error) {
      console.error('Error starting tutorial:', error);
      return null;
    }
  }

  async completeTutorialStep(tutorialId: string, stepId: string): Promise<void> {
    try {
      const tutorial = this.tutorials.find(t => t.id === tutorialId);
      if (!tutorial) {
        throw new Error('Tutorial not found');
      }

      const step = tutorial.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Tutorial step not found');
      }

      // Mark step as completed
      step.isCompleted = true;
      step.completedAt = new Date();

      // Update tutorial progress
      const completedSteps = tutorial.steps.filter(s => s.isCompleted).length;
      tutorial.progress = Math.round((completedSteps / tutorial.steps.length) * 100);

      // Check if tutorial is completed
      if (tutorial.progress === 100) {
        tutorial.isCompleted = true;
        tutorial.completedAt = new Date();
      }

      await this.saveTutorials();

      console.log('Tutorial step completed:', stepId);
    } catch (error) {
      console.error('Error completing tutorial step:', error);
      throw error;
    }
  }

  // Settings Management
  async updateOnboardingSettings(settings: Partial<OnboardingSettings>): Promise<void> {
    try {
      this.onboardingSettings = { ...this.onboardingSettings, ...settings };
      await this.saveOnboardingSettings();
      
      console.log('Onboarding settings updated');
    } catch (error) {
      console.error('Error updating onboarding settings:', error);
      throw error;
    }
  }

  // Data Retrieval
  getOnboardingSteps(): OnboardingStep[] {
    return [...this.onboardingSteps];
  }

  getTutorials(): Tutorial[] {
    return [...this.tutorials];
  }

  getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
    return this.tutorials.filter(t => t.category === category);
  }

  getTutorialsByDifficulty(difficulty: Tutorial['difficulty']): Tutorial[] {
    return this.tutorials.filter(t => t.difficulty === difficulty);
  }

  getOnboardingProgress(): OnboardingProgress | null {
    return this.onboardingProgress ? { ...this.onboardingProgress } : null;
  }

  getOnboardingSettings(): OnboardingSettings {
    return { ...this.onboardingSettings };
  }

  getCurrentStep(): OnboardingStep | null {
    if (!this.onboardingProgress) return null;
    return this.onboardingSteps.find(s => s.id === this.onboardingProgress!.currentStep) || null;
  }

  getNextStep(): OnboardingStep | null {
    if (!this.onboardingProgress) return null;
    const currentStep = this.getCurrentStep();
    if (!currentStep) return null;
    
    return this.onboardingSteps.find(s => 
      s.order === currentStep.order + 1 && !s.isCompleted
    ) || null;
  }

  // Helper Methods
  private async loadOnboardingSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('onboarding_settings');
      if (settings) {
        this.onboardingSettings = { ...this.onboardingSettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Error loading onboarding settings:', error);
    }
  }

  private async saveOnboardingSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('onboarding_settings', JSON.stringify(this.onboardingSettings));
    } catch (error) {
      console.error('Error saving onboarding settings:', error);
    }
  }

  private async loadOnboardingProgress(): Promise<void> {
    try {
      if (!this.currentUser) return;
      
      const progress = await AsyncStorage.getItem(`onboarding_progress_${this.currentUser.id}`);
      if (progress) {
        this.onboardingProgress = JSON.parse(progress);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  }

  private async saveOnboardingProgress(): Promise<void> {
    try {
      if (!this.currentUser || !this.onboardingProgress) return;
      
      await AsyncStorage.setItem(
        `onboarding_progress_${this.currentUser.id}`,
        JSON.stringify(this.onboardingProgress)
      );
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  }

  private async saveTutorials(): Promise<void> {
    try {
      await AsyncStorage.setItem('tutorials', JSON.stringify(this.tutorials));
    } catch (error) {
      console.error('Error saving tutorials:', error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.currentUser = null;
    this.isInitialized = false;
    this.onboardingProgress = null;
    console.log('Onboarding service cleaned up');
  }
}

export default OnboardingService;
