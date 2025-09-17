// Template Service for Ausmo AAC App
// Provides pre-made communication boards and templates

import { CommunicationBook, CommunicationPage, CommunicationButton, ButtonAction } from '../types';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageRange: string;
  language: string;
  tags: string[];
  thumbnail: string;
  book: CommunicationBook;
  isPremium: boolean;
  downloadCount: number;
  rating: number;
  author: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templateCount: number;
}

export interface TemplateSearchOptions {
  category?: string;
  difficulty?: string;
  ageRange?: string;
  language?: string;
  tags?: string[];
  isPremium?: boolean;
  searchTerm?: string;
}

class TemplateService {
  private static instance: TemplateService;
  private templates: Template[] = [];
  private categories: TemplateCategory[] = [];

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  constructor() {
    this.initializeTemplates();
    this.initializeCategories();
  }

  // Get all templates
  getAllTemplates(): Template[] {
    return [...this.templates];
  }

  // Get templates by category
  getTemplatesByCategory(categoryId: string): Template[] {
    return this.templates.filter(template => template.category === categoryId);
  }

  // Search templates
  searchTemplates(options: TemplateSearchOptions): Template[] {
    let results = [...this.templates];

    if (options.category) {
      results = results.filter(template => template.category === options.category);
    }

    if (options.difficulty) {
      results = results.filter(template => template.difficulty === options.difficulty);
    }

    if (options.ageRange) {
      results = results.filter(template => template.ageRange === options.ageRange);
    }

    if (options.language) {
      results = results.filter(template => template.language === options.language);
    }

    if (options.isPremium !== undefined) {
      results = results.filter(template => template.isPremium === options.isPremium);
    }

    if (options.searchTerm) {
      const searchTerm = options.searchTerm.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return results;
  }

  // Get template by ID
  getTemplateById(id: string): Template | undefined {
    return this.templates.find(template => template.id === id);
  }

  // Get all categories
  getCategories(): TemplateCategory[] {
    return [...this.categories];
  }

  // Get category by ID
  getCategoryById(id: string): TemplateCategory | undefined {
    return this.categories.find(category => category.id === id);
  }

  // Get featured templates
  getFeaturedTemplates(): Template[] {
    return this.templates
      .filter(template => template.rating >= 4.0)
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 10);
  }

  // Get recent templates
  getRecentTemplates(): Template[] {
    return this.templates
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }

  // Get popular templates
  getPopularTemplates(): Template[] {
    return this.templates
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 10);
  }

  // Initialize template categories
  private initializeCategories(): void {
    this.categories = [
      {
        id: 'express',
        name: 'Express Pages',
        description: 'Sentence building with speech bar',
        icon: 'chatbubble-ellipses',
        color: '#9C27B0',
        templateCount: 3,
      },
      {
        id: 'core-vocabulary',
        name: 'Core Vocabulary',
        description: 'Essential words for basic communication',
        icon: 'chatbubbles',
        color: '#2196F3',
        templateCount: 15,
      },
      {
        id: 'greetings',
        name: 'Greetings & Social',
        description: 'Social interaction and greetings',
        icon: 'people',
        color: '#4CAF50',
        templateCount: 8,
      },
      {
        id: 'food-drink',
        name: 'Food & Drink',
        description: 'Mealtime and snack communication',
        icon: 'restaurant',
        color: '#FF9800',
        templateCount: 12,
      },
      {
        id: 'activities',
        name: 'Activities & Play',
        description: 'Playtime and recreational activities',
        icon: 'game-controller',
        color: '#9C27B0',
        templateCount: 10,
      },
      {
        id: 'school',
        name: 'School & Learning',
        description: 'Educational and classroom communication',
        icon: 'school',
        color: '#3F51B5',
        templateCount: 14,
      },
      {
        id: 'home',
        name: 'Home & Family',
        description: 'Family life and household activities',
        icon: 'home',
        color: '#795548',
        templateCount: 9,
      },
      {
        id: 'medical',
        name: 'Medical & Health',
        description: 'Health-related communication',
        icon: 'medical',
        color: '#F44336',
        templateCount: 6,
      },
      {
        id: 'emergency',
        name: 'Emergency & Safety',
        description: 'Emergency situations and safety',
        icon: 'warning',
        color: '#FF5722',
        templateCount: 4,
      },
      {
        id: 'holidays',
        name: 'Holidays & Seasons',
        description: 'Seasonal and holiday communication',
        icon: 'calendar',
        color: '#E91E63',
        templateCount: 7,
      },
      {
        id: 'advanced',
        name: 'Advanced Communication',
        description: 'Complex communication needs',
        icon: 'bulb',
        color: '#607D8B',
        templateCount: 5,
      },
    ];
  }

  // Initialize templates
  private initializeTemplates(): void {
    this.templates = [
      // Core Vocabulary Templates
      {
        id: 'core-50-words',
        name: 'Core 50 Words',
        description: 'The 50 most essential words for communication',
        category: 'core-vocabulary',
        difficulty: 'beginner',
        ageRange: '2-8',
        language: 'en',
        tags: ['core', 'essential', 'basic'],
        thumbnail: '📝',
        isPremium: false,
        downloadCount: 1250,
        rating: 4.8,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        book: this.createCore50WordsBook(),
      },
      {
        id: 'core-100-words',
        name: 'Core 100 Words',
        description: 'Extended core vocabulary with 100 essential words',
        category: 'core-vocabulary',
        difficulty: 'intermediate',
        ageRange: '3-10',
        language: 'en',
        tags: ['core', 'extended', 'vocabulary'],
        thumbnail: '📚',
        isPremium: false,
        downloadCount: 890,
        rating: 4.6,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        book: this.createCore100WordsBook(),
      },
      // Express Page Templates
      {
        id: 'express-sentence-builder',
        name: 'Express Sentence Builder',
        description: 'Build sentences word by word with speech bar',
        category: 'express',
        difficulty: 'beginner',
        ageRange: '3-12',
        language: 'en',
        tags: ['express', 'sentence', 'building', 'speech'],
        thumbnail: '🗣️',
        isPremium: false,
        downloadCount: 1200,
        rating: 4.9,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        book: this.createExpressSentenceBuilderBook(),
      },
      {
        id: 'express-basic-needs',
        name: 'Express Basic Needs',
        description: 'Express basic needs and wants with sentence building',
        category: 'express',
        difficulty: 'beginner',
        ageRange: '2-8',
        language: 'en',
        tags: ['express', 'needs', 'wants', 'basic'],
        thumbnail: '💬',
        isPremium: false,
        downloadCount: 950,
        rating: 4.7,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        book: this.createExpressBasicNeedsBook(),
      },
      {
        id: 'express-social-communication',
        name: 'Express Social Communication',
        description: 'Build social sentences and conversations',
        category: 'express',
        difficulty: 'intermediate',
        ageRange: '4-12',
        language: 'en',
        tags: ['express', 'social', 'conversation', 'communication'],
        thumbnail: '👥',
        isPremium: false,
        downloadCount: 750,
        rating: 4.6,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        book: this.createExpressSocialCommunicationBook(),
      },
      // Greetings Templates
      {
        id: 'basic-greetings',
        name: 'Basic Greetings',
        description: 'Essential greetings and social interactions',
        category: 'greetings',
        difficulty: 'beginner',
        ageRange: '2-6',
        language: 'en',
        tags: ['greetings', 'social', 'basic'],
        thumbnail: '👋',
        isPremium: false,
        downloadCount: 650,
        rating: 4.5,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        book: this.createBasicGreetingsBook(),
      },
      // Food & Drink Templates
      {
        id: 'mealtime-basics',
        name: 'Mealtime Basics',
        description: 'Essential food and drink communication',
        category: 'food-drink',
        difficulty: 'beginner',
        ageRange: '2-8',
        language: 'en',
        tags: ['food', 'drink', 'mealtime'],
        thumbnail: '🍽️',
        isPremium: false,
        downloadCount: 720,
        rating: 4.7,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        book: this.createMealtimeBasicsBook(),
      },
      // School Templates
      {
        id: 'classroom-essentials',
        name: 'Classroom Essentials',
        description: 'Essential communication for school and learning',
        category: 'school',
        difficulty: 'intermediate',
        ageRange: '4-12',
        language: 'en',
        tags: ['school', 'classroom', 'learning'],
        thumbnail: '🎓',
        isPremium: false,
        downloadCount: 580,
        rating: 4.4,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        book: this.createClassroomEssentialsBook(),
      },
      // Medical Templates
      {
        id: 'medical-basics',
        name: 'Medical Basics',
        description: 'Essential medical and health communication',
        category: 'medical',
        difficulty: 'intermediate',
        ageRange: '5-18',
        language: 'en',
        tags: ['medical', 'health', 'emergency'],
        thumbnail: '🏥',
        isPremium: true,
        downloadCount: 320,
        rating: 4.9,
        author: 'Ausmo Team',
        version: '1.0',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
        book: this.createMedicalBasicsBook(),
      },
    ];
  }

  // Template creation methods
  private createCore50WordsBook(): CommunicationBook {
    const buttons = [
      this.createButton('I', 'I', 'I', { type: 'speak' }),
      this.createButton('want', 'want', 'want', { type: 'speak' }),
      this.createButton('more', 'more', 'more', { type: 'speak' }),
      this.createButton('help', 'help', 'help', { type: 'speak' }),
      this.createButton('yes', 'yes', 'yes', { type: 'speak' }),
      this.createButton('no', 'no', 'no', { type: 'speak' }),
      this.createButton('please', 'please', 'please', { type: 'speak' }),
      this.createButton('thank you', 'thank you', 'thank you', { type: 'speak' }),
      this.createButton('good', 'good', 'good', { type: 'speak' }),
      this.createButton('bad', 'bad', 'bad', { type: 'speak' }),
      this.createButton('like', 'like', 'like', { type: 'speak' }),
      this.createButton('don\'t like', 'don\'t like', 'don\'t like', { type: 'speak' }),
      this.createButton('go', 'go', 'go', { type: 'speak' }),
      this.createButton('stop', 'stop', 'stop', { type: 'speak' }),
      this.createButton('eat', 'eat', 'eat', { type: 'speak' }),
      this.createButton('drink', 'drink', 'drink', { type: 'speak' }),
      this.createButton('play', 'play', 'play', { type: 'speak' }),
      this.createButton('sleep', 'sleep', 'sleep', { type: 'speak' }),
      this.createButton('bathroom', 'bathroom', 'bathroom', { type: 'speak' }),
      this.createButton('home', 'home', 'home', { type: 'speak' }),
      this.createButton('school', 'school', 'school', { type: 'speak' }),
      this.createButton('mom', 'mom', 'mom', { type: 'speak' }),
      this.createButton('dad', 'dad', 'dad', { type: 'speak' }),
      this.createButton('friend', 'friend', 'friend', { type: 'speak' }),
      this.createButton('teacher', 'teacher', 'teacher', { type: 'speak' }),
    ];

    const page = this.createPage('Core 50 Words', 'standard', 25, buttons);
    
    return {
      id: 'core-50-words-book',
      name: 'Core 50 Words',
      description: 'The 50 most essential words for communication',
      category: 'core-vocabulary',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createCore100WordsBook(): CommunicationBook {
    // Similar structure but with 100 words
    const buttons: CommunicationButton[] = [
      // ... 100 core vocabulary buttons
    ];

    const page = this.createPage('Core 100 Words', 'standard', 36, buttons);
    
    return {
      id: 'core-100-words-book',
      name: 'Core 100 Words',
      description: 'Extended core vocabulary with 100 essential words',
      category: 'core-vocabulary',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createBasicGreetingsBook(): CommunicationBook {
    const buttons = [
      this.createButton('Hello', 'Hello', 'Hello', { type: 'speak' }),
      this.createButton('Hi', 'Hi', 'Hi', { type: 'speak' }),
      this.createButton('Goodbye', 'Goodbye', 'Goodbye', { type: 'speak' }),
      this.createButton('Bye', 'Bye', 'Bye', { type: 'speak' }),
      this.createButton('Good morning', 'Good morning', 'Good morning', { type: 'speak' }),
      this.createButton('Good afternoon', 'Good afternoon', 'Good afternoon', { type: 'speak' }),
      this.createButton('Good evening', 'Good evening', 'Good evening', { type: 'speak' }),
      this.createButton('Good night', 'Good night', 'Good night', { type: 'speak' }),
      this.createButton('How are you?', 'How are you?', 'How are you?', { type: 'speak' }),
      this.createButton('I\'m fine', 'I\'m fine', 'I\'m fine', { type: 'speak' }),
      this.createButton('Nice to meet you', 'Nice to meet you', 'Nice to meet you', { type: 'speak' }),
      this.createButton('See you later', 'See you later', 'See you later', { type: 'speak' }),
    ];

    const page = this.createPage('Basic Greetings', 'standard', 16, buttons);
    
    return {
      id: 'basic-greetings-book',
      name: 'Basic Greetings',
      description: 'Essential greetings and social interactions',
      category: 'greetings',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createMealtimeBasicsBook(): CommunicationBook {
    const buttons = [
      this.createButton('hungry', 'hungry', 'hungry', { type: 'speak' }),
      this.createButton('thirsty', 'thirsty', 'thirsty', { type: 'speak' }),
      this.createButton('eat', 'eat', 'eat', { type: 'speak' }),
      this.createButton('drink', 'drink', 'drink', { type: 'speak' }),
      this.createButton('food', 'food', 'food', { type: 'speak' }),
      this.createButton('water', 'water', 'water', { type: 'speak' }),
      this.createButton('milk', 'milk', 'milk', { type: 'speak' }),
      this.createButton('juice', 'juice', 'juice', { type: 'speak' }),
      this.createButton('apple', 'apple', 'apple', { type: 'speak' }),
      this.createButton('bread', 'bread', 'bread', { type: 'speak' }),
      this.createButton('cookie', 'cookie', 'cookie', { type: 'speak' }),
      this.createButton('pizza', 'pizza', 'pizza', { type: 'speak' }),
      this.createButton('more', 'more', 'more', { type: 'speak' }),
      this.createButton('done', 'done', 'done', { type: 'speak' }),
      this.createButton('yummy', 'yummy', 'yummy', { type: 'speak' }),
      this.createButton('yucky', 'yucky', 'yucky', { type: 'speak' }),
    ];

    const page = this.createPage('Mealtime Basics', 'standard', 16, buttons);
    
    return {
      id: 'mealtime-basics-book',
      name: 'Mealtime Basics',
      description: 'Essential food and drink communication',
      category: 'food-drink',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createClassroomEssentialsBook(): CommunicationBook {
    const buttons = [
      this.createButton('help', 'help', 'help', { type: 'speak' }),
      this.createButton('question', 'question', 'question', { type: 'speak' }),
      this.createButton('answer', 'answer', 'answer', { type: 'speak' }),
      this.createButton('book', 'book', 'book', { type: 'speak' }),
      this.createButton('pencil', 'pencil', 'pencil', { type: 'speak' }),
      this.createButton('paper', 'paper', 'paper', { type: 'speak' }),
      this.createButton('desk', 'desk', 'desk', { type: 'speak' }),
      this.createButton('chair', 'chair', 'chair', { type: 'speak' }),
      this.createButton('teacher', 'teacher', 'teacher', { type: 'speak' }),
      this.createButton('student', 'student', 'student', { type: 'speak' }),
      this.createButton('friend', 'friend', 'friend', { type: 'speak' }),
      this.createButton('playground', 'playground', 'playground', { type: 'speak' }),
      this.createButton('lunch', 'lunch', 'lunch', { type: 'speak' }),
      this.createButton('recess', 'recess', 'recess', { type: 'speak' }),
      this.createButton('bus', 'bus', 'bus', { type: 'speak' }),
      this.createButton('home', 'home', 'home', { type: 'speak' }),
    ];

    const page = this.createPage('Classroom Essentials', 'standard', 16, buttons);
    
    return {
      id: 'classroom-essentials-book',
      name: 'Classroom Essentials',
      description: 'Essential communication for school and learning',
      category: 'school',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createMedicalBasicsBook(): CommunicationBook {
    const buttons = [
      this.createButton('hurt', 'hurt', 'hurt', { type: 'speak' }),
      this.createButton('pain', 'pain', 'pain', { type: 'speak' }),
      this.createButton('sick', 'sick', 'sick', { type: 'speak' }),
      this.createButton('tired', 'tired', 'tired', { type: 'speak' }),
      this.createButton('medicine', 'medicine', 'medicine', { type: 'speak' }),
      this.createButton('doctor', 'doctor', 'doctor', { type: 'speak' }),
      this.createButton('nurse', 'nurse', 'nurse', { type: 'speak' }),
      this.createButton('hospital', 'hospital', 'hospital', { type: 'speak' }),
      this.createButton('ambulance', 'ambulance', 'ambulance', { type: 'speak' }),
      this.createButton('emergency', 'emergency', 'emergency', { type: 'speak' }),
      this.createButton('help', 'help', 'help', { type: 'speak' }),
      this.createButton('911', '911', '911', { type: 'speak' }),
    ];

    const page = this.createPage('Medical Basics', 'standard', 16, buttons);
    
    return {
      id: 'medical-basics-book',
      name: 'Medical Basics',
      description: 'Essential medical and health communication',
      category: 'medical',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      isTemplate: true,
      isShared: true,
    };
  }

  // Express Page Creation Methods
  private createExpressSentenceBuilderBook(): CommunicationBook {
    const buttons = [
      this.createButton('I', 'I', '👤', { type: 'speak' }),
      this.createButton('want', 'want', '💭', { type: 'speak' }),
      this.createButton('need', 'need', '🆘', { type: 'speak' }),
      this.createButton('like', 'like', '❤️', { type: 'speak' }),
      this.createButton('more', 'more', '➕', { type: 'speak' }),
      this.createButton('please', 'please', '🙏', { type: 'speak' }),
      this.createButton('thank you', 'thank you', '🙏', { type: 'speak' }),
      this.createButton('Clear', '', '🗑️', { type: 'clear' }),
      this.createButton('Back', '', '⬅️', { type: 'back' }),
    ];

    const page = this.createPage('Express Sentence Builder', 'express', 9, buttons);
    
    return {
      id: 'express-sentence-builder-book',
      name: 'Express Sentence Builder',
      description: 'Build sentences word by word with speech bar',
      category: 'express',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createExpressBasicNeedsBook(): CommunicationBook {
    const buttons = [
      this.createButton('I', 'I', '👤', { type: 'speak' }),
      this.createButton('want', 'want', '💭', { type: 'speak' }),
      this.createButton('food', 'food', '🍎', { type: 'speak' }),
      this.createButton('water', 'water', '💧', { type: 'speak' }),
      this.createButton('help', 'help', '🆘', { type: 'speak' }),
      this.createButton('bathroom', 'bathroom', '🚽', { type: 'speak' }),
      this.createButton('sleep', 'sleep', '😴', { type: 'speak' }),
      this.createButton('Clear', '', '🗑️', { type: 'clear' }),
      this.createButton('Back', '', '⬅️', { type: 'back' }),
    ];

    const page = this.createPage('Express Basic Needs', 'express', 9, buttons);
    
    return {
      id: 'express-basic-needs-book',
      name: 'Express Basic Needs',
      description: 'Express basic needs and wants with sentence building',
      category: 'express',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      isTemplate: true,
      isShared: true,
    };
  }

  private createExpressSocialCommunicationBook(): CommunicationBook {
    const buttons = [
      this.createButton('Hello', 'Hello', '👋', { type: 'speak' }),
      this.createButton('How are you?', 'How are you?', '😊', { type: 'speak' }),
      this.createButton('I am', 'I am', '👤', { type: 'speak' }),
      this.createButton('happy', 'happy', '😊', { type: 'speak' }),
      this.createButton('sad', 'sad', '😢', { type: 'speak' }),
      this.createButton('tired', 'tired', '😴', { type: 'speak' }),
      this.createButton('Goodbye', 'Goodbye', '👋', { type: 'speak' }),
      this.createButton('Clear', '', '🗑️', { type: 'clear' }),
      this.createButton('Back', '', '⬅️', { type: 'back' }),
    ];

    const page = this.createPage('Express Social Communication', 'express', 9, buttons);
    
    return {
      id: 'express-social-communication-book',
      name: 'Express Social Communication',
      description: 'Build social sentences and conversations',
      category: 'express',
      userId: 'template',
      pages: [page],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isTemplate: true,
      isShared: true,
    };
  }

  // Helper methods
  private createButton(
    text: string, 
    ttsMessage: string, 
    image: string, 
    action: ButtonAction
  ): CommunicationButton {
    return {
      id: `btn-${Date.now()}-${Math.random()}`,
      pageId: '',
      text,
      image,
      ttsMessage,
      action,
      position: { row: 0, column: 0, width: 1, height: 1 },
      size: 'medium',
      backgroundColor: '#2196F3',
      textColor: '#FFFFFF',
      borderColor: '#000000',
      borderWidth: 1,
      borderRadius: 8,
      order: 0,
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createPage(
    name: string, 
    type: 'standard' | 'express' | 'visual-scene' | 'keyboard', 
    gridSize: number, 
    buttons: CommunicationButton[]
  ): CommunicationPage {
    return {
      id: `page-${Date.now()}-${Math.random()}`,
      bookId: '',
      name,
      type,
      layout: {
        gridSize: gridSize as any,
        buttonSize: 'medium',
        spacing: 8,
        padding: 16,
        orientation: 'portrait',
      },
      buttons,
      backgroundColor: '#FFFFFF',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export default TemplateService;
