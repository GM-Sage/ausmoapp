// Premade Communication Books Service
// Provides professionally designed communication books by AAC experts

import {
  CommunicationBook,
  CommunicationPage,
  CommunicationButton,
} from '../types';
import SymbolDataService from './symbolDataService';

export interface PremadeBook {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageRange: string;
  isPremium: boolean;
  price?: number;
  book: CommunicationBook;
}

class PremadeBooksService {
  private static instance: PremadeBooksService;

  public static getInstance(): PremadeBooksService {
    if (!PremadeBooksService.instance) {
      PremadeBooksService.instance = new PremadeBooksService();
    }
    return PremadeBooksService.instance;
  }

  public static getPremadeBooks(): PremadeBook[] {
    const instance = PremadeBooksService.getInstance();
    return instance.getPremadeBooks();
  }

  public static getPremadeBookById(id: string): PremadeBook | undefined {
    const instance = PremadeBooksService.getInstance();
    return instance.getPremadeBookById(id);
  }

  public static getPremadeBooksByCategory(category: string): PremadeBook[] {
    const instance = PremadeBooksService.getInstance();
    return instance.getPremadeBooksByCategory(category);
  }

  public static getPremadeBooksByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): PremadeBook[] {
    const instance = PremadeBooksService.getInstance();
    return instance.getPremadeBooksByDifficulty(difficulty);
  }

  public getPremadeBooks(): PremadeBook[] {
    return [
      this.createBasicCommunicationBook(),
      this.createDailyActivitiesBook(),
      this.createSchoolCommunicationBook(),
      this.createEmergencyCommunicationBook(),
      this.createSocialInteractionBook(),
      this.createFoodAndDrinkBook(),
      this.createFeelingsAndEmotionsBook(),
      this.createPlayAndLeisureBook(),
    ];
  }

  public getPremadeBookById(id: string): PremadeBook | undefined {
    return this.getPremadeBooks().find(book => book.id === id);
  }

  public getPremadeBooksByCategory(category: string): PremadeBook[] {
    return this.getPremadeBooks().filter(book => book.category === category);
  }

  public getPremadeBooksByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): PremadeBook[] {
    return this.getPremadeBooks().filter(
      book => book.difficulty === difficulty
    );
  }

  private createBasicCommunicationBook(): PremadeBook {
    const symbols = SymbolDataService.getPopularSymbols();

    return {
      id: 'basic-communication-book',
      name: 'Basic Communication',
      description: 'Essential communication symbols for beginners',
      category: 'Communication',
      author: 'AAC Expert Team',
      difficulty: 'beginner',
      ageRange: '3-8 years',
      isPremium: false,
      book: {
        id: 'basic-communication-book',
        name: 'Basic Communication',
        title: 'Basic Communication',
        description: 'Essential communication symbols for beginners',
        category: 'Communication',
        userId: 'system',
        pages: [
          this.createBasicCommunicationPage(symbols),
          this.createExpressSentenceBuilderPage(),
          this.createGreetingsPage(symbols),
          this.createNeedsPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createDailyActivitiesBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('Actions');

    return {
      id: 'daily-activities-book',
      name: 'Daily Activities',
      description: 'Common daily activities and routines',
      category: 'Daily Life',
      author: 'Occupational Therapy Team',
      difficulty: 'beginner',
      ageRange: '4-10 years',
      isPremium: false,
      book: {
        id: 'daily-activities-book',
        name: 'Daily Activities',
        title: 'Daily Activities',
        description: 'Common daily activities and routines',
        category: 'Daily Life',
        userId: 'system',
        pages: [
          this.createMorningRoutinePage(symbols),
          this.createMealTimePage(symbols),
          this.createBedtimePage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createSchoolCommunicationBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('School');

    return {
      id: 'school-communication-book',
      name: 'School Communication',
      description: 'Communication symbols for school environment',
      category: 'Education',
      author: 'Special Education Team',
      difficulty: 'intermediate',
      ageRange: '5-12 years',
      isPremium: true,
      price: 4.99,
      book: {
        id: 'school-communication-book',
        name: 'School Communication',
        title: 'School Communication',
        description: 'Communication symbols for school environment',
        category: 'Education',
        userId: 'system',
        pages: [
          this.createClassroomPage(symbols),
          this.createRecessPage(symbols),
          this.createLunchPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createEmergencyCommunicationBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('Communication');

    return {
      id: 'emergency-communication-book',
      name: 'Emergency Communication',
      description: 'Critical communication symbols for emergencies',
      category: 'Safety',
      author: 'Emergency Response Team',
      difficulty: 'beginner',
      ageRange: 'All ages',
      isPremium: false,
      book: {
        id: 'emergency-communication-book',
        name: 'Emergency Communication',
        title: 'Emergency Communication',
        description: 'Critical communication symbols for emergencies',
        category: 'Safety',
        userId: 'system',
        pages: [
          this.createEmergencyPage(symbols),
          this.createMedicalPage(symbols),
          this.createHelpPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createSocialInteractionBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('People');

    return {
      id: 'social-interaction-book',
      name: 'Social Interaction',
      description: 'Symbols for social communication and interaction',
      category: 'Social',
      author: 'Speech Therapy Team',
      difficulty: 'intermediate',
      ageRange: '6-15 years',
      isPremium: true,
      price: 6.99,
      book: {
        id: 'social-interaction-book',
        name: 'Social Interaction',
        title: 'Social Interaction',
        description: 'Symbols for social communication and interaction',
        category: 'Social',
        userId: 'system',
        pages: [
          this.createFriendsPage(symbols),
          this.createFamilyPage(symbols),
          this.createPlayPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createFoodAndDrinkBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('Food & Drink');

    return {
      id: 'food-drink-book',
      name: 'Food & Drink',
      description: 'Comprehensive food and beverage communication',
      category: 'Food',
      author: 'Nutrition Team',
      difficulty: 'beginner',
      ageRange: '3-10 years',
      isPremium: false,
      book: {
        id: 'food-drink-book',
        name: 'Food & Drink',
        title: 'Food & Drink',
        description: 'Comprehensive food and beverage communication',
        category: 'Food',
        userId: 'system',
        pages: [
          this.createBreakfastPage(symbols),
          this.createLunchPage(symbols),
          this.createSnacksPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createFeelingsAndEmotionsBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('Feelings');

    return {
      id: 'feelings-emotions-book',
      name: 'Feelings & Emotions',
      description: 'Symbols for expressing feelings and emotions',
      category: 'Emotions',
      author: 'Psychology Team',
      difficulty: 'intermediate',
      ageRange: '4-12 years',
      isPremium: true,
      price: 5.99,
      book: {
        id: 'feelings-emotions-book',
        name: 'Feelings & Emotions',
        title: 'Feelings & Emotions',
        description: 'Symbols for expressing feelings and emotions',
        category: 'Emotions',
        userId: 'system',
        pages: [
          this.createHappyFeelingsPage(symbols),
          this.createSadFeelingsPage(symbols),
          this.createAngryFeelingsPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createPlayAndLeisureBook(): PremadeBook {
    const symbols = SymbolDataService.getSymbolsByCategory('Actions');

    return {
      id: 'play-leisure-book',
      name: 'Play & Leisure',
      description: 'Symbols for play activities and leisure time',
      category: 'Play',
      author: 'Recreation Therapy Team',
      difficulty: 'beginner',
      ageRange: '3-8 years',
      isPremium: false,
      book: {
        id: 'play-leisure-book',
        name: 'Play & Leisure',
        title: 'Play & Leisure',
        description: 'Symbols for play activities and leisure time',
        category: 'Play',
        userId: 'system',
        pages: [
          this.createIndoorPlayPage(symbols),
          this.createOutdoorPlayPage(symbols),
          this.createToysPage(symbols),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isShared: true,
      },
    };
  }

  private createBasicCommunicationPage(symbols: any[]): CommunicationPage {
    const basicSymbols = symbols.filter(s =>
      [
        'hello',
        'help',
        'yes',
        'no',
        'please',
        'thank-you',
        'sorry',
        'more',
        'done',
      ].includes(s.id)
    );

    return {
      id: 'basic-communication-page',
      bookId: 'basic-communication-book',
      name: 'Basic Communication',
      type: 'standard',
      layout: {
        gridSize: 9,
        buttonSize: 'medium',
        spacing: 8,
        padding: 16,
        orientation: 'portrait',
      },
      buttons: basicSymbols.map((symbol, index) => ({
        id: `btn-${symbol.id}`,
        pageId: 'basic-communication-page',
        text: symbol.name,
        image: symbol.image,
        ttsMessage: symbol.name,
        action: { type: 'speak' },
        position: {
          row: Math.floor(index / 3),
          column: index % 3,
          width: 1,
          height: 1,
        },
        size: 'medium',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: this.getCategoryColor(symbol.category),
        borderWidth: 3,
        borderRadius: 12,
        order: index,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      backgroundColor: '#FFFFFF',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createGreetingsPage(symbols: any[]): CommunicationPage {
    const greetingSymbols = symbols.filter(s =>
      ['hello', 'goodbye', 'good-morning', 'good-night'].includes(s.id)
    );

    return {
      id: 'greetings-page',
      bookId: 'basic-communication-book',
      name: 'Greetings',
      type: 'standard',
      layout: {
        gridSize: 4,
        buttonSize: 'large',
        spacing: 8,
        padding: 16,
        orientation: 'portrait',
      },
      buttons: greetingSymbols.map((symbol, index) => ({
        id: `btn-${symbol.id}`,
        pageId: 'greetings-page',
        text: symbol.name,
        image: symbol.image,
        ttsMessage: symbol.name,
        action: { type: 'speak' },
        position: {
          row: Math.floor(index / 2),
          column: index % 2,
          width: 1,
          height: 1,
        },
        size: 'large',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: this.getCategoryColor(symbol.category),
        borderWidth: 3,
        borderRadius: 12,
        order: index,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      backgroundColor: '#FFFFFF',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createNeedsPage(symbols: any[]): CommunicationPage {
    const needSymbols = symbols.filter(s =>
      ['water', 'food', 'help', 'hurt', 'tired', 'bathroom'].includes(s.id)
    );

    return {
      id: 'needs-page',
      bookId: 'basic-communication-book',
      name: 'Basic Needs',
      type: 'standard',
      layout: {
        gridSize: 6,
        buttonSize: 'medium',
        spacing: 8,
        padding: 16,
        orientation: 'portrait',
      },
      buttons: needSymbols.map((symbol, index) => ({
        id: `btn-${symbol.id}`,
        pageId: 'needs-page',
        text: symbol.name,
        image: symbol.image,
        ttsMessage: symbol.name,
        action: { type: 'speak' },
        position: {
          row: Math.floor(index / 3),
          column: index % 3,
          width: 1,
          height: 1,
        },
        size: 'medium',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: this.getCategoryColor(symbol.category),
        borderWidth: 3,
        borderRadius: 12,
        order: index,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      backgroundColor: '#FFFFFF',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Additional page creation methods...
  private createMorningRoutinePage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'morning-routine-page',
      'Morning Routine',
      symbols.slice(0, 9)
    );
  }

  private createMealTimePage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'meal-time-page',
      'Meal Time',
      symbols.slice(0, 9)
    );
  }

  private createBedtimePage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'bedtime-page',
      'Bedtime',
      symbols.slice(0, 9)
    );
  }

  private createClassroomPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'classroom-page',
      'Classroom',
      symbols.slice(0, 9)
    );
  }

  private createRecessPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('recess-page', 'Recess', symbols.slice(0, 9));
  }

  private createLunchPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('lunch-page', 'Lunch', symbols.slice(0, 9));
  }

  private createEmergencyPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'emergency-page',
      'Emergency',
      symbols.slice(0, 9)
    );
  }

  private createMedicalPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'medical-page',
      'Medical',
      symbols.slice(0, 9)
    );
  }

  private createHelpPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('help-page', 'Help', symbols.slice(0, 9));
  }

  private createFriendsPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'friends-page',
      'Friends',
      symbols.slice(0, 9)
    );
  }

  private createFamilyPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('family-page', 'Family', symbols.slice(0, 9));
  }

  private createPlayPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('play-page', 'Play', symbols.slice(0, 9));
  }

  private createBreakfastPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'breakfast-page',
      'Breakfast',
      symbols.slice(0, 9)
    );
  }

  private createSnacksPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('snacks-page', 'Snacks', symbols.slice(0, 9));
  }

  private createHappyFeelingsPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'happy-feelings-page',
      'Happy Feelings',
      symbols.slice(0, 9)
    );
  }

  private createSadFeelingsPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'sad-feelings-page',
      'Sad Feelings',
      symbols.slice(0, 9)
    );
  }

  private createAngryFeelingsPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'angry-feelings-page',
      'Angry Feelings',
      symbols.slice(0, 9)
    );
  }

  private createIndoorPlayPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'indoor-play-page',
      'Indoor Play',
      symbols.slice(0, 9)
    );
  }

  private createOutdoorPlayPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage(
      'outdoor-play-page',
      'Outdoor Play',
      symbols.slice(0, 9)
    );
  }

  private createToysPage(symbols: any[]): CommunicationPage {
    return this.createGenericPage('toys-page', 'Toys', symbols.slice(0, 9));
  }

  private createGenericPage(
    pageId: string,
    pageName: string,
    symbols: any[]
  ): CommunicationPage {
    return {
      id: pageId,
      bookId: 'generic-book',
      name: pageName,
      type: 'standard',
      layout: {
        gridSize: 9,
        buttonSize: 'medium',
        spacing: 8,
        padding: 16,
        orientation: 'portrait',
      },
      buttons: symbols.map((symbol, index) => ({
        id: `btn-${symbol.id}`,
        pageId: pageId,
        text: symbol.name,
        image: symbol.image,
        ttsMessage: symbol.name,
        action: { type: 'speak' },
        position: {
          row: Math.floor(index / 3),
          column: index % 3,
          width: 1,
          height: 1,
        },
        size: 'medium',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: this.getCategoryColor(symbol.category),
        borderWidth: 3,
        borderRadius: 12,
        order: index,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      backgroundColor: '#FFFFFF',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      Greetings: '#FFD700',
      Communication: '#32CD32',
      Actions: '#FFD700',
      'Food & Drink': '#FFD700',
      Feelings: '#FF6B6B',
      Places: '#32CD32',
      People: '#32CD32',
      Objects: '#FFD700',
      Body: '#FFD700',
      Clothing: '#FFD700',
      Animals: '#FFD700',
      Colors: '#FFD700',
      Time: '#FFD700',
      Weather: '#FFD700',
      Transportation: '#FFD700',
      Shapes: '#FFD700',
      School: '#FFD700',
      Home: '#FFD700',
    };
    return colorMap[category] || '#FFD700';
  }

  private createExpressSentenceBuilderPage(): CommunicationPage {
    const buttons: CommunicationButton[] = [
      {
        id: 'btn-i',
        pageId: '',
        text: 'I',
        image: '👤',
        ttsMessage: 'I',
        action: { type: 'speak' },
        position: { row: 0, column: 0, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#E3F2FD',
        textColor: '#1976D2',
        borderColor: '#2196F3',
        borderWidth: 2,
        borderRadius: 8,
        order: 1,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-want',
        pageId: '',
        text: 'want',
        image: '💭',
        ttsMessage: 'want',
        action: { type: 'speak' },
        position: { row: 0, column: 1, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#E8F5E8',
        textColor: '#2E7D32',
        borderColor: '#4CAF50',
        borderWidth: 2,
        borderRadius: 8,
        order: 2,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-more',
        pageId: '',
        text: 'more',
        image: '➕',
        ttsMessage: 'more',
        action: { type: 'speak' },
        position: { row: 0, column: 2, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#FFF3E0',
        textColor: '#F57C00',
        borderColor: '#FF9800',
        borderWidth: 2,
        borderRadius: 8,
        order: 3,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-please',
        pageId: '',
        text: 'please',
        image: '🙏',
        ttsMessage: 'please',
        action: { type: 'speak' },
        position: { row: 1, column: 0, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#F3E5F5',
        textColor: '#7B1FA2',
        borderColor: '#9C27B0',
        borderWidth: 2,
        borderRadius: 8,
        order: 4,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-thank-you',
        pageId: '',
        text: 'thank you',
        image: '🙏',
        ttsMessage: 'thank you',
        action: { type: 'speak' },
        position: { row: 1, column: 1, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#E0F2F1',
        textColor: '#00695C',
        borderColor: '#009688',
        borderWidth: 2,
        borderRadius: 8,
        order: 5,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-help',
        pageId: '',
        text: 'help',
        image: '🆘',
        ttsMessage: 'help',
        action: { type: 'speak' },
        position: { row: 1, column: 2, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#FFEBEE',
        textColor: '#C62828',
        borderColor: '#F44336',
        borderWidth: 2,
        borderRadius: 8,
        order: 6,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-clear',
        pageId: '',
        text: 'Clear',
        image: '🗑️',
        ttsMessage: '',
        action: { type: 'clear' },
        position: { row: 2, column: 0, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#F5F5F5',
        textColor: '#616161',
        borderColor: '#9E9E9E',
        borderWidth: 2,
        borderRadius: 8,
        order: 7,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-back',
        pageId: '',
        text: 'Back',
        image: '⬅️',
        ttsMessage: '',
        action: { type: 'back' },
        position: { row: 2, column: 1, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#F5F5F5',
        textColor: '#616161',
        borderColor: '#9E9E9E',
        borderWidth: 2,
        borderRadius: 8,
        order: 8,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btn-done',
        pageId: '',
        text: 'done',
        image: '✅',
        ttsMessage: 'done',
        action: { type: 'speak' },
        position: { row: 2, column: 2, width: 1, height: 1 },
        size: 'medium',
        backgroundColor: '#E8F5E8',
        textColor: '#2E7D32',
        borderColor: '#4CAF50',
        borderWidth: 2,
        borderRadius: 8,
        order: 9,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      id: 'express-sentence-builder-page',
      bookId: '',
      name: 'Express Sentence Builder',
      type: 'express',
      layout: {
        gridSize: 9,
        buttonSize: 'medium',
        spacing: 8,
        padding: 16,
        orientation: 'portrait',
      },
      buttons,
      backgroundColor: '#FFFFFF',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export default PremadeBooksService;
