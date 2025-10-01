// Educational Service for Ausmo AAC App
// Provides core vocabulary integration, progressive vocabulary building, and assessment tools

import { User, Symbol, CommunicationButton } from '../types';
import AnalyticsService from './analyticsService';
import SymbolDataService from './symbolDataService';

export interface CoreVocabularySet {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  ageRange: { min: number; max: number };
  symbols: string[]; // Symbol IDs
  categories: string[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyProgress {
  userId: string;
  vocabularySetId: string;
  totalSymbols: number;
  masteredSymbols: string[];
  learningSymbols: string[];
  notStartedSymbols: string[];
  masteryLevel: number; // 0-100
  lastAssessment: Date;
  nextAssessment?: Date;
  learningPath: LearningStep[];
}

export interface LearningStep {
  id: string;
  type: 'introduction' | 'practice' | 'assessment' | 'mastery';
  symbolId: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  attempts: number;
  successRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Assessment {
  id: string;
  userId: string;
  vocabularySetId: string;
  type: 'placement' | 'progress' | 'mastery' | 'custom';
  questions: AssessmentQuestion[];
  results: AssessmentResults;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // minutes
}

export interface AssessmentQuestion {
  id: string;
  type:
    | 'symbol_recognition'
    | 'word_completion'
    | 'sentence_building'
    | 'context_usage';
  symbolId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent: number; // seconds
  hints: string[];
  usedHints: number;
}

export interface AssessmentResults {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // 0-100
  averageTimePerQuestion: number;
  totalTime: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
  masteryLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface EducationalGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'communication' | 'social' | 'academic' | 'daily_living';
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
  milestones: GoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface LearningActivity {
  id: string;
  name: string;
  description: string;
  type: 'game' | 'exercise' | 'story' | 'conversation' | 'assessment';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  symbols: string[];
  categories: string[];
  ageRange: { min: number; max: number };
  learningObjectives: string[];
  instructions: string[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class EducationalService {
  private static instance: EducationalService;
  private currentUser: User | null = null;
  private analyticsService: AnalyticsService;
  private symbolService: SymbolDataService;
  private isInitialized = false;

  public static getInstance(): EducationalService {
    if (!EducationalService.instance) {
      EducationalService.instance = new EducationalService();
    }
    return EducationalService.instance;
  }

  constructor() {
    this.analyticsService = AnalyticsService.getInstance();
    this.symbolService = SymbolDataService.getInstance();
  }

  // Initialize educational service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await this.loadUserProgress();
      this.isInitialized = true;
      console.log('Educational service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing educational service:', error);
    }
  }

  // Core Vocabulary Management
  async getCoreVocabularySets(): Promise<CoreVocabularySet[]> {
    return [
      {
        id: 'core-basic',
        name: 'Basic Core Vocabulary',
        description: 'Essential words for daily communication',
        level: 'beginner',
        ageRange: { min: 3, max: 8 },
        symbols: [
          'hello',
          'help',
          'yes',
          'no',
          'more',
          'done',
          'please',
          'thank-you',
          'sorry',
          'goodbye',
        ],
        categories: ['Greetings', 'Communication', 'Actions'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'core-intermediate',
        name: 'Intermediate Core Vocabulary',
        description: 'Expanded vocabulary for more complex communication',
        level: 'intermediate',
        ageRange: { min: 6, max: 12 },
        symbols: [
          'I-want',
          'I-need',
          'I-like',
          'I-dont-like',
          'can-you-help',
          'how-are-you',
          'good-morning',
          'good-afternoon',
          'good-evening',
          'good-night',
        ],
        categories: ['Greetings', 'Communication', 'Feelings', 'Requests'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'core-advanced',
        name: 'Advanced Core Vocabulary',
        description: 'Complex vocabulary for sophisticated communication',
        level: 'advanced',
        ageRange: { min: 10, max: 18 },
        symbols: [
          'I-think',
          'I-believe',
          'I-hope',
          'I-wish',
          'maybe',
          'probably',
          'definitely',
          'perhaps',
          'certainly',
          'absolutely',
        ],
        categories: ['Communication', 'Thinking', 'Opinions', 'Possibility'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'academic-basic',
        name: 'Basic Academic Vocabulary',
        description: 'Essential words for school and learning',
        level: 'beginner',
        ageRange: { min: 5, max: 10 },
        symbols: [
          'book',
          'pencil',
          'paper',
          'teacher',
          'student',
          'classroom',
          'homework',
          'test',
          'grade',
          'learn',
        ],
        categories: ['School', 'Learning', 'Objects'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'social-basic',
        name: 'Basic Social Vocabulary',
        description: 'Words for social interaction and relationships',
        level: 'beginner',
        ageRange: { min: 4, max: 10 },
        symbols: [
          'friend',
          'family',
          'mom',
          'dad',
          'brother',
          'sister',
          'play',
          'share',
          'together',
          'fun',
        ],
        categories: ['Family', 'Friends', 'Social'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getVocabularyProgress(
    userId: string,
    vocabularySetId: string
  ): Promise<VocabularyProgress | null> {
    try {
      // In a real app, this would load from database
      const vocabularySet = (await this.getCoreVocabularySets()).find(
        set => set.id === vocabularySetId
      );
      if (!vocabularySet) return null;

      // Simulate progress data
      const totalSymbols = vocabularySet.symbols.length;
      const masteredSymbols = vocabularySet.symbols.slice(
        0,
        Math.floor(totalSymbols * 0.6)
      );
      const learningSymbols = vocabularySet.symbols.slice(
        masteredSymbols.length,
        Math.floor(totalSymbols * 0.8)
      );
      const notStartedSymbols = vocabularySet.symbols.slice(
        masteredSymbols.length + learningSymbols.length
      );

      return {
        userId,
        vocabularySetId,
        totalSymbols,
        masteredSymbols,
        learningSymbols,
        notStartedSymbols,
        masteryLevel: Math.floor((masteredSymbols.length / totalSymbols) * 100),
        lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        learningPath: this.generateLearningPath(vocabularySet.symbols),
      };
    } catch (error) {
      console.error('Error getting vocabulary progress:', error);
      return null;
    }
  }

  // Assessment System
  async createAssessment(
    userId: string,
    vocabularySetId: string,
    type: Assessment['type'] = 'progress'
  ): Promise<Assessment> {
    try {
      const vocabularySet = (await this.getCoreVocabularySets()).find(
        set => set.id === vocabularySetId
      );
      if (!vocabularySet) {
        throw new Error('Vocabulary set not found');
      }

      const questions = await this.generateAssessmentQuestions(
        vocabularySet,
        type
      );

      const assessment: Assessment = {
        id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        vocabularySetId,
        type,
        questions,
        results: {
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTimePerQuestion: 0,
          totalTime: 0,
          strengths: [],
          weaknesses: [],
          recommendations: [],
          nextSteps: [],
          masteryLevel: 'beginner',
        },
        startedAt: new Date(),
      };

      console.log('Assessment created:', assessment.id);
      return assessment;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  async submitAssessmentAnswer(
    assessmentId: string,
    questionId: string,
    answer: string,
    timeSpent: number
  ): Promise<void> {
    try {
      // In a real app, this would update the assessment in the database
      console.log('Assessment answer submitted:', {
        assessmentId,
        questionId,
        answer,
        timeSpent,
      });
    } catch (error) {
      console.error('Error submitting assessment answer:', error);
    }
  }

  async completeAssessment(assessmentId: string): Promise<AssessmentResults> {
    try {
      // In a real app, this would calculate results from the database
      const results: AssessmentResults = {
        totalQuestions: 10,
        correctAnswers: 8,
        accuracy: 80,
        averageTimePerQuestion: 15,
        totalTime: 150,
        strengths: ['Symbol recognition', 'Basic vocabulary'],
        weaknesses: ['Sentence building', 'Context usage'],
        recommendations: [
          'Practice sentence building activities',
          'Focus on context-based vocabulary usage',
          'Continue with current vocabulary set',
        ],
        nextSteps: [
          'Complete sentence building exercises',
          'Practice with context-based activities',
          'Schedule next assessment in 2 weeks',
        ],
        masteryLevel: 'intermediate',
      };

      console.log('Assessment completed:', assessmentId);
      return results;
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw error;
    }
  }

  // Educational Goals
  async createEducationalGoal(
    userId: string,
    title: string,
    description: string,
    type: EducationalGoal['type'],
    targetDate: Date,
    milestones: Omit<GoalMilestone, 'id'>[]
  ): Promise<EducationalGoal> {
    try {
      const goal: EducationalGoal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title,
        description,
        type,
        targetDate,
        isCompleted: false,
        progress: 0,
        milestones: milestones.map((milestone, index) => ({
          id: `milestone_${index}`,
          ...milestone,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Educational goal created:', goal.id);
      return goal;
    } catch (error) {
      console.error('Error creating educational goal:', error);
      throw error;
    }
  }

  async updateGoalProgress(
    goalId: string,
    milestoneId: string,
    progress: number
  ): Promise<void> {
    try {
      // In a real app, this would update the goal in the database
      console.log('Goal progress updated:', { goalId, milestoneId, progress });
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }

  // Learning Activities
  async getLearningActivities(
    userId: string,
    filters?: {
      type?: LearningActivity['type'];
      difficulty?: LearningActivity['difficulty'];
      ageRange?: { min: number; max: number };
      categories?: string[];
    }
  ): Promise<LearningActivity[]> {
    const activities: LearningActivity[] = [
      {
        id: 'activity-symbol-match',
        name: 'Symbol Matching Game',
        description: 'Match symbols with their meanings',
        type: 'game',
        difficulty: 'easy',
        duration: 10,
        symbols: ['hello', 'help', 'yes', 'no', 'more', 'done'],
        categories: ['Communication', 'Games'],
        ageRange: { min: 3, max: 8 },
        learningObjectives: ['Symbol recognition', 'Vocabulary building'],
        instructions: [
          'Look at the symbol on the left',
          'Find the matching word on the right',
          'Tap to select your answer',
          'Get 3 correct in a row to win!',
        ],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'activity-sentence-builder',
        name: 'Sentence Builder',
        description: 'Build sentences using core vocabulary',
        type: 'exercise',
        difficulty: 'medium',
        duration: 15,
        symbols: ['I-want', 'I-need', 'I-like', 'help', 'please', 'thank-you'],
        categories: ['Communication', 'Grammar'],
        ageRange: { min: 6, max: 12 },
        learningObjectives: ['Sentence construction', 'Grammar skills'],
        instructions: [
          'Drag words to build a sentence',
          'Start with "I want" or "I need"',
          'Add action words and objects',
          'Practice speaking your sentence',
        ],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'activity-conversation-practice',
        name: 'Conversation Practice',
        description: 'Practice common conversation scenarios',
        type: 'conversation',
        difficulty: 'hard',
        duration: 20,
        symbols: [
          'hello',
          'how-are-you',
          'good-morning',
          'goodbye',
          'nice-to-meet-you',
        ],
        categories: ['Social', 'Communication'],
        ageRange: { min: 8, max: 16 },
        learningObjectives: ['Social communication', 'Conversation skills'],
        instructions: [
          'Choose a conversation scenario',
          'Respond to prompts using symbols',
          'Practice natural conversation flow',
          'Get feedback on your responses',
        ],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Apply filters
    let filteredActivities = activities;

    if (filters?.type) {
      filteredActivities = filteredActivities.filter(
        activity => activity.type === filters.type
      );
    }

    if (filters?.difficulty) {
      filteredActivities = filteredActivities.filter(
        activity => activity.difficulty === filters.difficulty
      );
    }

    if (filters?.ageRange) {
      filteredActivities = filteredActivities.filter(
        activity =>
          activity.ageRange.min <= filters.ageRange!.max &&
          activity.ageRange.max >= filters.ageRange!.min
      );
    }

    if (filters?.categories && filters.categories.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        activity.categories.some(category =>
          filters.categories!.includes(category)
        )
      );
    }

    return filteredActivities;
  }

  // Progressive Vocabulary Building
  async getNextLearningSymbols(
    userId: string,
    vocabularySetId: string
  ): Promise<string[]> {
    try {
      const progress = await this.getVocabularyProgress(
        userId,
        vocabularySetId
      );
      if (!progress) return [];

      // Return symbols that are not yet mastered
      return [...progress.learningSymbols, ...progress.notStartedSymbols];
    } catch (error) {
      console.error('Error getting next learning symbols:', error);
      return [];
    }
  }

  async updateSymbolMastery(
    userId: string,
    vocabularySetId: string,
    symbolId: string,
    isMastered: boolean
  ): Promise<void> {
    try {
      // In a real app, this would update the progress in the database
      console.log('Symbol mastery updated:', {
        userId,
        vocabularySetId,
        symbolId,
        isMastered,
      });
    } catch (error) {
      console.error('Error updating symbol mastery:', error);
    }
  }

  // Helper Methods
  private generateLearningPath(symbols: string[]): LearningStep[] {
    return symbols.map((symbolId, index) => ({
      id: `step_${index}`,
      type: index < 3 ? 'introduction' : index < 6 ? 'practice' : 'assessment',
      symbolId,
      description: `Learn ${symbolId}`,
      isCompleted: index < 4,
      completedAt: index < 4 ? new Date() : undefined,
      attempts: index < 4 ? 3 : 0,
      successRate: index < 4 ? 0.8 : 0,
      difficulty: index < 3 ? 'easy' : index < 6 ? 'medium' : 'hard',
    }));
  }

  private async generateAssessmentQuestions(
    vocabularySet: CoreVocabularySet,
    type: Assessment['type']
  ): Promise<AssessmentQuestion[]> {
    const questions: AssessmentQuestion[] = [];

    // Generate symbol recognition questions
    vocabularySet.symbols.slice(0, 5).forEach((symbolId, index) => {
      const symbol = this.symbolService.getSymbolById(symbolId);
      if (symbol) {
        questions.push({
          id: `q_${index}`,
          type: 'symbol_recognition',
          symbolId,
          question: `What does this symbol mean?`,
          options: [symbol.name, 'Help', 'More', 'Done'],
          correctAnswer: symbol.name,
          timeSpent: 0,
          hints: [
            `Think about when you use this word`,
            `It starts with "${symbol.name[0]}"`,
          ],
          usedHints: 0,
        });
      }
    });

    // Generate sentence building questions
    vocabularySet.symbols.slice(5, 8).forEach((symbolId, index) => {
      const symbol = this.symbolService.getSymbolById(symbolId);
      if (symbol) {
        questions.push({
          id: `q_${index + 5}`,
          type: 'sentence_building',
          symbolId,
          question: `Build a sentence using "${symbol.name}"`,
          options: [
            `I want ${symbol.name}`,
            `I need ${symbol.name}`,
            `I like ${symbol.name}`,
            `Help with ${symbol.name}`,
          ],
          correctAnswer: `I want ${symbol.name}`,
          timeSpent: 0,
          hints: [`Start with "I want"`, `Add the word "${symbol.name}"`],
          usedHints: 0,
        });
      }
    });

    return questions;
  }

  private async loadUserProgress(): Promise<void> {
    // In a real app, this would load user progress from the database
    console.log('Loading user educational progress');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Cleanup
  cleanup(): void {
    this.currentUser = null;
    this.isInitialized = false;
    console.log('Educational service cleaned up');
  }
}

export default EducationalService;
