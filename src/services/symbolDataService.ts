// AAC Symbol Data Service - Provides comprehensive symbol library

import { Symbol } from '../types';

export interface SymbolWithSound extends Symbol {
  soundUrl?: string;
  audioFile?: string;
  ttsText?: string; // Override text for TTS pronunciation
}

export interface SymbolLibrary {
  id: string;
  name: string;
  description: string;
  symbols: SymbolWithSound[];
  isPremium: boolean;
  price?: number;
}

export interface SymbolSet {
  id: string;
  name: string;
  library: string;
  symbols: SymbolWithSound[];
}

class SymbolDataService {
  private static instance: SymbolDataService;
  private symbols: SymbolWithSound[] = [];

  public static getInstance(): SymbolDataService {
    if (!SymbolDataService.instance) {
      SymbolDataService.instance = new SymbolDataService();
    }
    return SymbolDataService.instance;
  }

  // Initialize the service (call this after database is ready)
  public async initialize(): Promise<void> {
    // Load custom symbols from database
    await this.loadCustomSymbols();
  }

  // Static methods that delegate to instance
  public static getPopularSymbols(): SymbolWithSound[] {
    // Ensure instance is created
    const instance = SymbolDataService.getInstance();
    return instance.getPopularSymbols();
  }

  public static getAllSymbols(): SymbolWithSound[] {
    const instance = SymbolDataService.getInstance();
    return instance.getAllSymbols();
  }

  public static getSymbolsByCategory(category: string): SymbolWithSound[] {
    const instance = SymbolDataService.getInstance();
    return instance.getSymbolsByCategory(category);
  }

  public static searchSymbols(query: string): SymbolWithSound[] {
    const instance = SymbolDataService.getInstance();
    return instance.searchSymbols(query);
  }

  public static getCategories(): string[] {
    const instance = SymbolDataService.getInstance();
    return instance.getCategories();
  }

  public static getSymbolById(id: string): SymbolWithSound | undefined {
    const instance = SymbolDataService.getInstance();
    return instance.getSymbolById(id);
  }

  public static getSymbolLibraries(): SymbolLibrary[] {
    const instance = SymbolDataService.getInstance();
    return instance.getSymbolLibraries();
  }

  public static getSymbolSets(): SymbolSet[] {
    const instance = SymbolDataService.getInstance();
    return instance.getSymbolSets();
  }

  public static getSymbolsByLibrary(libraryId: string): SymbolWithSound[] {
    const instance = SymbolDataService.getInstance();
    return instance.getSymbolsByLibrary(libraryId);
  }

  // Instance methods

  constructor() {
    this.initializeSymbols();
  }

  private initializeSymbols() {
    this.symbols = [
      // Basic Communication - Greetings
      {
        id: 'hello',
        name: 'Hello',
        category: 'Greetings',
        image: '👋',
        keywords: ['hello', 'hi', 'greeting', 'wave'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'goodbye',
        name: 'Goodbye',
        category: 'Greetings',
        image: '👋',
        keywords: ['goodbye', 'bye', 'farewell', 'see you'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good-morning',
        name: 'Good Morning',
        category: 'Greetings',
        image: '🌅',
        keywords: ['good morning', 'morning', 'hello morning'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good-afternoon',
        name: 'Good Afternoon',
        category: 'Greetings',
        image: '☀️',
        keywords: ['good afternoon', 'afternoon', 'hello afternoon'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good-evening',
        name: 'Good Evening',
        category: 'Greetings',
        image: '🌆',
        keywords: ['good evening', 'evening', 'hello evening'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good-night',
        name: 'Good Night',
        category: 'Greetings',
        image: '🌙',
        keywords: ['good night', 'night', 'sleep well'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'how-are-you',
        name: 'How are you?',
        category: 'Greetings',
        image: '❓',
        keywords: ['how are you', 'how are you doing', 'are you okay'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'nice-to-meet-you',
        name: 'Nice to meet you',
        category: 'Greetings',
        image: '🤝',
        keywords: ['nice to meet you', 'pleased to meet you'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'help',
        name: 'Help',
        category: 'Actions',
        image: '🆘',
        keywords: ['help', 'assistance', 'support', 'aid'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'yes',
        name: 'Yes',
        category: 'Communication',
        image: '✅',
        keywords: ['yes', 'okay', 'agree', 'correct'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'no',
        name: 'No',
        category: 'Communication',
        image: '❌',
        keywords: ['no', 'not', 'disagree', 'wrong'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'more',
        name: 'More',
        category: 'Communication',
        image: '➕',
        keywords: ['more', 'again', 'another', 'additional'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'done',
        name: 'Done',
        category: 'Communication',
        image: '✅',
        keywords: ['done', 'finished', 'complete', 'end'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'please',
        name: 'Please',
        category: 'Communication',
        image: '🙏',
        keywords: ['please', 'request', 'polite'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'thank-you',
        name: 'Thank You',
        category: 'Communication',
        image: '🙏',
        keywords: ['thank you', 'thanks', 'grateful'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Essential Communication Words
      {
        id: 'i',
        name: 'I',
        category: 'Essential Words',
        image: '👤',
        keywords: ['i', 'me', 'myself', 'self'],
        ttsText: 'eye', // Override TTS pronunciation
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'want',
        name: 'Want',
        category: 'Essential Words',
        image: '🤲',
        keywords: ['want', 'desire', 'need', 'would like'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'need',
        name: 'Need',
        category: 'Essential Words',
        image: '🆘',
        keywords: ['need', 'require', 'must have', 'essential'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'like',
        name: 'Like',
        category: 'Essential Words',
        image: '❤️',
        keywords: ['like', 'love', 'enjoy', 'prefer'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'dont-like',
        name: "Don't Like",
        category: 'Essential Words',
        image: '❌',
        keywords: ['dont like', 'dislike', 'hate', 'not want'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'go',
        name: 'Go',
        category: 'Essential Words',
        image: '🚶',
        keywords: ['go', 'walk', 'move', 'travel'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'come',
        name: 'Come',
        category: 'Essential Words',
        image: '👋',
        keywords: ['come', 'arrive', 'approach', 'join'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'big',
        name: 'Big',
        category: 'Essential Words',
        image: '🔍',
        keywords: ['big', 'large', 'huge', 'giant'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'small',
        name: 'Small',
        category: 'Essential Words',
        image: '🔬',
        keywords: ['small', 'little', 'tiny', 'mini'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'hot',
        name: 'Hot',
        category: 'Essential Words',
        image: '🔥',
        keywords: ['hot', 'warm', 'heat', 'burning'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cold',
        name: 'Cold',
        category: 'Essential Words',
        image: '❄️',
        keywords: ['cold', 'cool', 'freezing', 'chilly'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good',
        name: 'Good',
        category: 'Essential Words',
        image: '👍',
        keywords: ['good', 'great', 'nice', 'excellent'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bad',
        name: 'Bad',
        category: 'Essential Words',
        image: '👎',
        keywords: ['bad', 'terrible', 'awful', 'horrible'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'fast',
        name: 'Fast',
        category: 'Essential Words',
        image: '🏃',
        keywords: ['fast', 'quick', 'rapid', 'speedy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'slow',
        name: 'Slow',
        category: 'Essential Words',
        image: '🐌',
        keywords: ['slow', 'sluggish', 'gradual', 'delayed'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'up',
        name: 'Up',
        category: 'Essential Words',
        image: '⬆️',
        keywords: ['up', 'above', 'higher', 'rise'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'down',
        name: 'Down',
        category: 'Essential Words',
        image: '⬇️',
        keywords: ['down', 'below', 'lower', 'fall'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'in',
        name: 'In',
        category: 'Essential Words',
        image: '📥',
        keywords: ['in', 'inside', 'enter', 'within'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'out',
        name: 'Out',
        category: 'Essential Words',
        image: '📤',
        keywords: ['out', 'outside', 'exit', 'leave'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sorry',
        name: 'Sorry',
        category: 'Communication',
        image: '😔',
        keywords: ['sorry', 'apologize', 'regret'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Food & Drink
      {
        id: 'water',
        name: 'Water',
        category: 'Food & Drink',
        image: '💧',
        keywords: ['water', 'drink', 'thirsty'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'food',
        name: 'Food',
        category: 'Food & Drink',
        image: '🍽️',
        keywords: ['food', 'eat', 'hungry', 'meal'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'apple',
        name: 'Apple',
        category: 'Food & Drink',
        image: '🍎',
        keywords: ['apple', 'fruit', 'healthy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'milk',
        name: 'Milk',
        category: 'Food & Drink',
        image: '🥛',
        keywords: ['milk', 'drink', 'dairy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bread',
        name: 'Bread',
        category: 'Food & Drink',
        image: '🍞',
        keywords: ['bread', 'food', 'carbohydrate'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Feelings
      {
        id: 'happy',
        name: 'Happy',
        category: 'Feelings',
        image: '😊',
        keywords: ['happy', 'joy', 'smile', 'good'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sad',
        name: 'Sad',
        category: 'Feelings',
        image: '😢',
        keywords: ['sad', 'cry', 'upset', 'bad'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'angry',
        name: 'Angry',
        category: 'Feelings',
        image: '😠',
        keywords: ['angry', 'mad', 'frustrated'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tired',
        name: 'Tired',
        category: 'Feelings',
        image: '😴',
        keywords: ['tired', 'sleepy', 'exhausted'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'hurt',
        name: 'Hurt',
        category: 'Feelings',
        image: '🤕',
        keywords: ['hurt', 'pain', 'injured', 'ouch'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Actions
      {
        id: 'eat',
        name: 'Eat',
        category: 'Actions',
        image: '🍽️',
        keywords: ['eat', 'food', 'meal'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'drink',
        name: 'Drink',
        category: 'Actions',
        image: '🥤',
        keywords: ['drink', 'water', 'thirsty'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'play',
        name: 'Play',
        category: 'Actions',
        image: '🎮',
        keywords: ['play', 'game', 'fun', 'toy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sleep',
        name: 'Sleep',
        category: 'Actions',
        image: '😴',
        keywords: ['sleep', 'bed', 'tired'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'go',
        name: 'Go',
        category: 'Actions',
        image: '🚶',
        keywords: ['go', 'walk', 'move', 'leave'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'stop',
        name: 'Stop',
        category: 'Actions',
        image: '🛑',
        keywords: ['stop', 'halt', 'wait'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Places
      {
        id: 'home',
        name: 'Home',
        category: 'Places',
        image: '🏠',
        keywords: ['home', 'house', 'residence'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'school',
        name: 'School',
        category: 'Places',
        image: '🏫',
        keywords: ['school', 'education', 'learn'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'store',
        name: 'Store',
        category: 'Places',
        image: '🏪',
        keywords: ['store', 'shop', 'buy', 'shopping'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'park',
        name: 'Park',
        category: 'Places',
        image: '🌳',
        keywords: ['park', 'outdoor', 'nature', 'playground'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // People
      {
        id: 'mom',
        name: 'Mom',
        category: 'People',
        image: '👩',
        keywords: ['mom', 'mother', 'mommy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'dad',
        name: 'Dad',
        category: 'People',
        image: '👨',
        keywords: ['dad', 'father', 'daddy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'teacher',
        name: 'Teacher',
        category: 'People',
        image: '👩‍🏫',
        keywords: ['teacher', 'instructor', 'educator'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'friend',
        name: 'Friend',
        category: 'People',
        image: '👫',
        keywords: ['friend', 'buddy', 'companion'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Objects
      {
        id: 'book',
        name: 'Book',
        category: 'Objects',
        image: '📚',
        keywords: ['book', 'read', 'story'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'toy',
        name: 'Toy',
        category: 'Objects',
        image: '🧸',
        keywords: ['toy', 'play', 'fun'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phone',
        name: 'Phone',
        category: 'Objects',
        image: '📱',
        keywords: ['phone', 'call', 'talk'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'car',
        name: 'Car',
        category: 'Objects',
        image: '🚗',
        keywords: ['car', 'vehicle', 'drive', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Body
      {
        id: 'head',
        name: 'Head',
        category: 'Body',
        image: '👤',
        keywords: ['head', 'face', 'brain'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'hand',
        name: 'Hand',
        category: 'Body',
        image: '✋',
        keywords: ['hand', 'finger', 'touch'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'eye',
        name: 'Eye',
        category: 'Body',
        image: '👁️',
        keywords: ['eye', 'see', 'look', 'vision'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Clothing
      {
        id: 'shirt',
        name: 'Shirt',
        category: 'Clothing',
        image: '👕',
        keywords: ['shirt', 'clothes', 'wear'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pants',
        name: 'Pants',
        category: 'Clothing',
        image: '👖',
        keywords: ['pants', 'trousers', 'clothes'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'shoes',
        name: 'Shoes',
        category: 'Clothing',
        image: '👟',
        keywords: ['shoes', 'footwear', 'walk'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Animals
      {
        id: 'dog',
        name: 'Dog',
        category: 'Animals',
        image: '🐕',
        keywords: ['dog', 'pet', 'animal'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cat',
        name: 'Cat',
        category: 'Animals',
        image: '🐱',
        keywords: ['cat', 'pet', 'animal'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bird',
        name: 'Bird',
        category: 'Animals',
        image: '🐦',
        keywords: ['bird', 'fly', 'animal'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Colors
      {
        id: 'red',
        name: 'Red',
        category: 'Colors',
        image: '🔴',
        keywords: ['red', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'blue',
        name: 'Blue',
        category: 'Colors',
        image: '🔵',
        keywords: ['blue', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'green',
        name: 'Green',
        category: 'Colors',
        image: '🟢',
        keywords: ['green', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'yellow',
        name: 'Yellow',
        category: 'Colors',
        image: '🟡',
        keywords: ['yellow', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Time
      {
        id: 'morning',
        name: 'Morning',
        category: 'Time',
        image: '🌅',
        keywords: ['morning', 'early', 'sunrise'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'night',
        name: 'Night',
        category: 'Time',
        image: '🌙',
        keywords: ['night', 'dark', 'sleep'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'today',
        name: 'Today',
        category: 'Time',
        image: '📅',
        keywords: ['today', 'now', 'present'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Weather
      {
        id: 'sunny',
        name: 'Sunny',
        category: 'Weather',
        image: '☀️',
        keywords: ['sunny', 'sun', 'bright'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rainy',
        name: 'Rainy',
        category: 'Weather',
        image: '🌧️',
        keywords: ['rainy', 'rain', 'wet'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'snowy',
        name: 'Snowy',
        category: 'Weather',
        image: '❄️',
        keywords: ['snowy', 'snow', 'cold'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Transportation
      {
        id: 'bus',
        name: 'Bus',
        category: 'Transportation',
        image: '🚌',
        keywords: ['bus', 'transport', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'train',
        name: 'Train',
        category: 'Transportation',
        image: '🚂',
        keywords: ['train', 'transport', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'plane',
        name: 'Plane',
        category: 'Transportation',
        image: '✈️',
        keywords: ['plane', 'airplane', 'fly'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Shapes
      {
        id: 'circle',
        name: 'Circle',
        category: 'Shapes',
        image: '⭕',
        keywords: ['circle', 'round', 'shape'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'square',
        name: 'Square',
        category: 'Shapes',
        image: '⬜',
        keywords: ['square', 'box', 'shape'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'triangle',
        name: 'Triangle',
        category: 'Shapes',
        image: '🔺',
        keywords: ['triangle', 'shape'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // School
      {
        id: 'pencil',
        name: 'Pencil',
        category: 'School',
        image: '✏️',
        keywords: ['pencil', 'write', 'draw'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'paper',
        name: 'Paper',
        category: 'School',
        image: '📄',
        keywords: ['paper', 'write', 'draw'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'computer',
        name: 'Computer',
        category: 'School',
        image: '💻',
        keywords: ['computer', 'laptop', 'work'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Home
      {
        id: 'bed',
        name: 'Bed',
        category: 'Home',
        image: '🛏️',
        keywords: ['bed', 'sleep', 'rest'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'chair',
        name: 'Chair',
        category: 'Home',
        image: '🪑',
        keywords: ['chair', 'sit', 'furniture'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'table',
        name: 'Table',
        category: 'Home',
        image: '🪑',
        keywords: ['table', 'eat', 'work'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Additional Essential Communication Symbols
      {
        id: 'wait',
        name: 'Wait',
        category: 'Communication',
        image: '⏳',
        keywords: ['wait', 'pause', 'hold', 'stop'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'stop',
        name: 'Stop',
        category: 'Communication',
        image: '🛑',
        keywords: ['stop', 'halt', 'end', 'quit'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'go',
        name: 'Go',
        category: 'Communication',
        image: '▶️',
        keywords: ['go', 'start', 'begin', 'continue'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'goodbye',
        name: 'Goodbye',
        category: 'Greetings',
        image: '👋',
        keywords: ['goodbye', 'bye', 'see you', 'farewell'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good-morning',
        name: 'Good Morning',
        category: 'Greetings',
        image: '🌅',
        keywords: ['good morning', 'morning', 'hello'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'good-night',
        name: 'Good Night',
        category: 'Greetings',
        image: '🌙',
        keywords: ['good night', 'night', 'sleep well'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Food & Drink
      {
        id: 'juice',
        name: 'Juice',
        category: 'Food & Drink',
        image: '🧃',
        keywords: ['juice', 'drink', 'fruit juice'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cookie',
        name: 'Cookie',
        category: 'Food & Drink',
        image: '🍪',
        keywords: ['cookie', 'sweet', 'treat', 'snack'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pizza',
        name: 'Pizza',
        category: 'Food & Drink',
        image: '🍕',
        keywords: ['pizza', 'food', 'dinner', 'lunch'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ice-cream',
        name: 'Ice Cream',
        category: 'Food & Drink',
        image: '🍦',
        keywords: ['ice cream', 'dessert', 'cold', 'sweet'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'banana',
        name: 'Banana',
        category: 'Food & Drink',
        image: '🍌',
        keywords: ['banana', 'fruit', 'yellow'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'orange',
        name: 'Orange',
        category: 'Food & Drink',
        image: '🍊',
        keywords: ['orange', 'fruit', 'citrus'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'grapes',
        name: 'Grapes',
        category: 'Food & Drink',
        image: '🍇',
        keywords: ['grapes', 'fruit', 'purple'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'carrot',
        name: 'Carrot',
        category: 'Food & Drink',
        image: '🥕',
        keywords: ['carrot', 'vegetable', 'orange', 'healthy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'broccoli',
        name: 'Broccoli',
        category: 'Food & Drink',
        image: '🥦',
        keywords: ['broccoli', 'vegetable', 'green', 'healthy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Feelings
      {
        id: 'excited',
        name: 'Excited',
        category: 'Feelings',
        image: '🤩',
        keywords: ['excited', 'thrilled', 'happy', 'enthusiastic'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'worried',
        name: 'Worried',
        category: 'Feelings',
        image: '😟',
        keywords: ['worried', 'concerned', 'anxious', 'nervous'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'surprised',
        name: 'Surprised',
        category: 'Feelings',
        image: '😲',
        keywords: ['surprised', 'shocked', 'amazed'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'scared',
        name: 'Scared',
        category: 'Feelings',
        image: '😨',
        keywords: ['scared', 'afraid', 'frightened', 'fear'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'calm',
        name: 'Calm',
        category: 'Feelings',
        image: '😌',
        keywords: ['calm', 'peaceful', 'relaxed', 'quiet'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'proud',
        name: 'Proud',
        category: 'Feelings',
        image: '😊',
        keywords: ['proud', 'accomplished', 'successful'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Actions
      {
        id: 'walk',
        name: 'Walk',
        category: 'Actions',
        image: '🚶',
        keywords: ['walk', 'move', 'step', 'stroll'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'run',
        name: 'Run',
        category: 'Actions',
        image: '🏃',
        keywords: ['run', 'jog', 'fast', 'exercise'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'jump',
        name: 'Jump',
        category: 'Actions',
        image: '🦘',
        keywords: ['jump', 'hop', 'leap', 'bounce'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sit',
        name: 'Sit',
        category: 'Actions',
        image: '🪑',
        keywords: ['sit', 'seat', 'chair', 'down'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'stand',
        name: 'Stand',
        category: 'Actions',
        image: '🧍',
        keywords: ['stand', 'up', 'rise', 'feet'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wash',
        name: 'Wash',
        category: 'Actions',
        image: '🧽',
        keywords: ['wash', 'clean', 'soap', 'water'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'brush-teeth',
        name: 'Brush Teeth',
        category: 'Actions',
        image: '🦷',
        keywords: ['brush teeth', 'dental', 'clean', 'hygiene'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bath',
        name: 'Bath',
        category: 'Actions',
        image: '🛁',
        keywords: ['bath', 'bathtub', 'clean', 'water'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'read',
        name: 'Read',
        category: 'Actions',
        image: '📖',
        keywords: ['read', 'book', 'story', 'words'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'write',
        name: 'Write',
        category: 'Actions',
        image: '✏️',
        keywords: ['write', 'pen', 'pencil', 'words'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'draw',
        name: 'Draw',
        category: 'Actions',
        image: '🎨',
        keywords: ['draw', 'art', 'picture', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sing',
        name: 'Sing',
        category: 'Actions',
        image: '🎤',
        keywords: ['sing', 'music', 'song', 'voice'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'dance',
        name: 'Dance',
        category: 'Actions',
        image: '💃',
        keywords: ['dance', 'music', 'move', 'fun'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Places
      {
        id: 'park',
        name: 'Park',
        category: 'Places',
        image: '🌳',
        keywords: ['park', 'playground', 'outside', 'nature'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'store',
        name: 'Store',
        category: 'Places',
        image: '🏪',
        keywords: ['store', 'shop', 'buy', 'shopping'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'restaurant',
        name: 'Restaurant',
        category: 'Places',
        image: '🍽️',
        keywords: ['restaurant', 'eat', 'food', 'dinner'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'library',
        name: 'Library',
        category: 'Places',
        image: '📚',
        keywords: ['library', 'books', 'read', 'quiet'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'hospital',
        name: 'Hospital',
        category: 'Places',
        image: '🏥',
        keywords: ['hospital', 'doctor', 'sick', 'medical'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'church',
        name: 'Church',
        category: 'Places',
        image: '⛪',
        keywords: ['church', 'worship', 'prayer', 'faith'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'beach',
        name: 'Beach',
        category: 'Places',
        image: '🏖️',
        keywords: ['beach', 'sand', 'water', 'vacation'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mountains',
        name: 'Mountains',
        category: 'Places',
        image: '🏔️',
        keywords: ['mountains', 'hiking', 'nature', 'high'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended People
      {
        id: 'brother',
        name: 'Brother',
        category: 'People',
        image: '👦',
        keywords: ['brother', 'sibling', 'family', 'boy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sister',
        name: 'Sister',
        category: 'People',
        image: '👧',
        keywords: ['sister', 'sibling', 'family', 'girl'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'grandma',
        name: 'Grandma',
        category: 'People',
        image: '👵',
        keywords: ['grandma', 'grandmother', 'family', 'old'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'grandpa',
        name: 'Grandpa',
        category: 'People',
        image: '👴',
        keywords: ['grandpa', 'grandfather', 'family', 'old'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'teacher',
        name: 'Teacher',
        category: 'People',
        image: '👩‍🏫',
        keywords: ['teacher', 'school', 'learn', 'education'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'doctor',
        name: 'Doctor',
        category: 'People',
        image: '👨‍⚕️',
        keywords: ['doctor', 'medical', 'health', 'help'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'friend',
        name: 'Friend',
        category: 'People',
        image: '👫',
        keywords: ['friend', 'buddy', 'playmate', 'companion'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'baby',
        name: 'Baby',
        category: 'People',
        image: '👶',
        keywords: ['baby', 'infant', 'little', 'small'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Animals
      {
        id: 'elephant',
        name: 'Elephant',
        category: 'Animals',
        image: '🐘',
        keywords: ['elephant', 'big', 'trunk', 'zoo'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lion',
        name: 'Lion',
        category: 'Animals',
        image: '🦁',
        keywords: ['lion', 'king', 'roar', 'zoo'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'giraffe',
        name: 'Giraffe',
        category: 'Animals',
        image: '🦒',
        keywords: ['giraffe', 'tall', 'neck', 'zoo'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'monkey',
        name: 'Monkey',
        category: 'Animals',
        image: '🐵',
        keywords: ['monkey', 'banana', 'swing', 'zoo'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'penguin',
        name: 'Penguin',
        category: 'Animals',
        image: '🐧',
        keywords: ['penguin', 'cold', 'ice', 'waddle'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'butterfly',
        name: 'Butterfly',
        category: 'Animals',
        image: '🦋',
        keywords: ['butterfly', 'fly', 'colorful', 'garden'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bee',
        name: 'Bee',
        category: 'Animals',
        image: '🐝',
        keywords: ['bee', 'buzz', 'honey', 'sting'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'fish',
        name: 'Fish',
        category: 'Animals',
        image: '🐠',
        keywords: ['fish', 'swim', 'water', 'ocean'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Colors
      {
        id: 'purple',
        name: 'Purple',
        category: 'Colors',
        image: '🟣',
        keywords: ['purple', 'violet', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pink',
        name: 'Pink',
        category: 'Colors',
        image: '🩷',
        keywords: ['pink', 'rose', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'brown',
        name: 'Brown',
        category: 'Colors',
        image: '🤎',
        keywords: ['brown', 'chocolate', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'gray',
        name: 'Gray',
        category: 'Colors',
        image: '⚫',
        keywords: ['gray', 'grey', 'color'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Time
      {
        id: 'today',
        name: 'Today',
        category: 'Time',
        image: '📅',
        keywords: ['today', 'now', 'present', 'day'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'yesterday',
        name: 'Yesterday',
        category: 'Time',
        image: '📅',
        keywords: ['yesterday', 'past', 'before', 'day'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tomorrow',
        name: 'Tomorrow',
        category: 'Time',
        image: '📅',
        keywords: ['tomorrow', 'future', 'next', 'day'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'weekend',
        name: 'Weekend',
        category: 'Time',
        image: '📅',
        keywords: ['weekend', 'Saturday', 'Sunday', 'free'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Weather
      {
        id: 'cloudy',
        name: 'Cloudy',
        category: 'Weather',
        image: '☁️',
        keywords: ['cloudy', 'clouds', 'overcast'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'windy',
        name: 'Windy',
        category: 'Weather',
        image: '💨',
        keywords: ['windy', 'wind', 'breeze'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'foggy',
        name: 'Foggy',
        category: 'Weather',
        image: '🌫️',
        keywords: ['foggy', 'fog', 'mist', 'hazy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'stormy',
        name: 'Stormy',
        category: 'Weather',
        image: '⛈️',
        keywords: ['stormy', 'storm', 'thunder', 'lightning'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Transportation
      {
        id: 'bus-extended',
        name: 'Bus',
        category: 'Transportation',
        image: '🚌',
        keywords: ['bus', 'school', 'transport', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'train',
        name: 'Train',
        category: 'Transportation',
        image: '🚂',
        keywords: ['train', 'railroad', 'track', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'airplane',
        name: 'Airplane',
        category: 'Transportation',
        image: '✈️',
        keywords: ['airplane', 'plane', 'fly', 'travel'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'boat',
        name: 'Boat',
        category: 'Transportation',
        image: '🚤',
        keywords: ['boat', 'water', 'sail', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bicycle',
        name: 'Bicycle',
        category: 'Transportation',
        image: '🚲',
        keywords: ['bicycle', 'bike', 'pedal', 'ride'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'motorcycle',
        name: 'Motorcycle',
        category: 'Transportation',
        image: '🏍️',
        keywords: ['motorcycle', 'bike', 'ride', 'fast'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Shapes
      {
        id: 'star',
        name: 'Star',
        category: 'Shapes',
        image: '⭐',
        keywords: ['star', 'shape', 'bright', 'night'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'heart',
        name: 'Heart',
        category: 'Shapes',
        image: '❤️',
        keywords: ['heart', 'love', 'shape', 'red'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'diamond',
        name: 'Diamond',
        category: 'Shapes',
        image: '💎',
        keywords: ['diamond', 'shape', 'precious', 'sparkle'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended School
      {
        id: 'pencil',
        name: 'Pencil',
        category: 'School',
        image: '✏️',
        keywords: ['pencil', 'write', 'draw', 'school'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'crayon',
        name: 'Crayon',
        category: 'School',
        image: '🖍️',
        keywords: ['crayon', 'color', 'draw', 'art'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'scissors',
        name: 'Scissors',
        category: 'School',
        image: '✂️',
        keywords: ['scissors', 'cut', 'craft', 'art'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'glue',
        name: 'Glue',
        category: 'School',
        image: '🧴',
        keywords: ['glue', 'stick', 'craft', 'art'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'calculator',
        name: 'Calculator',
        category: 'School',
        image: '🧮',
        keywords: ['calculator', 'math', 'numbers', 'count'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'computer-extended',
        name: 'Computer',
        category: 'School',
        image: '💻',
        keywords: ['computer', 'laptop', 'screen', 'work'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Home
      {
        id: 'bed',
        name: 'Bed',
        category: 'Home',
        image: '🛏️',
        keywords: ['bed', 'sleep', 'rest', 'room'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sofa',
        name: 'Sofa',
        category: 'Home',
        image: '🛋️',
        keywords: ['sofa', 'couch', 'sit', 'living room'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'refrigerator',
        name: 'Refrigerator',
        category: 'Home',
        image: '🧊',
        keywords: ['refrigerator', 'fridge', 'cold', 'food'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'microwave',
        name: 'Microwave',
        category: 'Home',
        image: '📱',
        keywords: ['microwave', 'heat', 'food', 'kitchen'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'toilet',
        name: 'Toilet',
        category: 'Home',
        image: '🚽',
        keywords: ['toilet', 'bathroom', 'potty', 'restroom'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'shower',
        name: 'Shower',
        category: 'Home',
        image: '🚿',
        keywords: ['shower', 'bath', 'clean', 'water'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Objects
      {
        id: 'key',
        name: 'Key',
        category: 'Objects',
        image: '🗝️',
        keywords: ['key', 'unlock', 'door', 'open'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'money',
        name: 'Money',
        category: 'Objects',
        image: '💰',
        keywords: ['money', 'dollar', 'buy', 'cash'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'gift',
        name: 'Gift',
        category: 'Objects',
        image: '🎁',
        keywords: ['gift', 'present', 'surprise', 'birthday'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'camera',
        name: 'Camera',
        category: 'Objects',
        image: '📷',
        keywords: ['camera', 'photo', 'picture', 'take'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'umbrella',
        name: 'Umbrella',
        category: 'Objects',
        image: '☂️',
        keywords: ['umbrella', 'rain', 'wet', 'protect'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'backpack',
        name: 'Backpack',
        category: 'Objects',
        image: '🎒',
        keywords: ['backpack', 'bag', 'school', 'carry'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Body Parts
      {
        id: 'leg',
        name: 'Leg',
        category: 'Body',
        image: '🦵',
        keywords: ['leg', 'walk', 'run', 'body'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'arm',
        name: 'Arm',
        category: 'Body',
        image: '💪',
        keywords: ['arm', 'hand', 'body', 'reach'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'back',
        name: 'Back',
        category: 'Body',
        image: '🫁',
        keywords: ['back', 'spine', 'body', 'hurt'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'stomach',
        name: 'Stomach',
        category: 'Body',
        image: '🫀',
        keywords: ['stomach', 'belly', 'body', 'hungry'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Extended Clothing
      {
        id: 'shoes',
        name: 'Shoes',
        category: 'Clothing',
        image: '👟',
        keywords: ['shoes', 'feet', 'walk', 'wear'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'hat',
        name: 'Hat',
        category: 'Clothing',
        image: '🧢',
        keywords: ['hat', 'head', 'wear', 'sun'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'gloves',
        name: 'Gloves',
        category: 'Clothing',
        image: '🧤',
        keywords: ['gloves', 'hands', 'cold', 'warm'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'socks',
        name: 'Socks',
        category: 'Clothing',
        image: '🧦',
        keywords: ['socks', 'feet', 'shoes', 'warm'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  public getAllSymbols(): SymbolWithSound[] {
    console.log('getAllSymbols called. Total symbols:', this.symbols.length);
    const customSymbols = this.symbols.filter(s => !s.isBuiltIn);
    console.log(
      'Custom symbols in getAllSymbols:',
      customSymbols.length,
      customSymbols.map(s => s.name)
    );
    return [...this.symbols];
  }

  public getSymbolsByCategory(category: string): SymbolWithSound[] {
    return this.symbols.filter(symbol => symbol.category === category);
  }

  public searchSymbols(query: string): SymbolWithSound[] {
    if (!query.trim()) {
      return this.symbols;
    }

    const searchTerm = query.toLowerCase().trim();
    const words = searchTerm.split(' ').filter(word => word.length > 0);

    return this.symbols
      .filter(symbol => {
        const symbolText =
          `${symbol.name} ${symbol.keywords.join(' ')} ${symbol.category}`.toLowerCase();

        // Exact match gets highest priority
        if (symbolText.includes(searchTerm)) {
          return true;
        }

        // All words must be found somewhere in the symbol
        return words.every(word => symbolText.includes(word));
      })
      .sort((a, b) => {
        // Sort by relevance: exact matches first, then by name similarity
        const aExact = a.name.toLowerCase().includes(searchTerm);
        const bExact = b.name.toLowerCase().includes(searchTerm);

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return a.name.localeCompare(b.name);
      });
  }

  public getPopularSymbols(): SymbolWithSound[] {
    // Return the most commonly used symbols for AAC
    const popularIds = [
      'hello',
      'help',
      'yes',
      'no',
      'more',
      'done',
      'please',
      'thank-you',
      'sorry',
      'wait',
      'stop',
      'go',
      'goodbye',
      'good-morning',
      'good-night',
      'i',
      'want',
      'need',
      'like',
      'dont-like',
      'come',
      'big',
      'small',
      'hot',
      'cold',
      'good',
      'bad',
      'water',
      'food',
      'juice',
      'cookie',
      'pizza',
      'ice-cream',
      'apple',
      'banana',
      'happy',
      'sad',
      'excited',
      'worried',
      'angry',
      'tired',
      'hurt',
      'calm',
      'eat',
      'drink',
      'play',
      'sleep',
      'walk',
      'run',
      'jump',
      'sit',
      'stand',
      'wash',
      'brush-teeth',
      'bath',
      'read',
      'write',
      'draw',
      'sing',
      'dance',
      'home',
      'school',
      'park',
      'store',
      'restaurant',
      'library',
      'hospital',
      'mom',
      'dad',
      'brother',
      'sister',
      'grandma',
      'grandpa',
      'teacher',
      'doctor',
      'friend',
      'baby',
      'book',
      'toy',
      'phone',
      'car',
      'bus',
      'train',
      'airplane',
      'bicycle',
      'dog',
      'cat',
      'bird',
      'elephant',
      'lion',
      'giraffe',
      'monkey',
      'penguin',
      'red',
      'blue',
      'green',
      'yellow',
      'purple',
      'pink',
      'brown',
      'gray',
      'today',
      'yesterday',
      'tomorrow',
      'weekend',
      'sunny',
      'rainy',
      'cloudy',
      'windy',
      'snowy',
      'stormy',
      'circle',
      'square',
      'triangle',
      'star',
      'heart',
      'diamond',
    ];

    return popularIds
      .map(id => this.symbols.find(symbol => symbol.id === id))
      .filter(symbol => symbol !== undefined) as SymbolWithSound[];
  }

  public getCategories(): string[] {
    const categories = new Set(this.symbols.map(symbol => symbol.category));
    return Array.from(categories).sort();
  }

  public getSymbolById(id: string): SymbolWithSound | undefined {
    return this.symbols.find(symbol => symbol.id === id);
  }

  public getSymbolLibraries(): SymbolLibrary[] {
    return [
      {
        id: 'core-library',
        name: 'Core Library',
        description: 'Essential symbols for basic communication',
        symbols: this.symbols.filter(
          s => s.category === 'Communication' || s.category === 'Greetings'
        ),
        isPremium: false,
      },
      {
        id: 'symbolstix-library',
        name: 'SymbolStix Library',
        description: 'Professional symbol set with consistent visual style',
        symbols: this.getSymbolStixSymbols(),
        isPremium: true,
        price: 9.99,
      },
      {
        id: 'pcs-library',
        name: 'Picture Communication Symbols (PCS)',
        description: 'Comprehensive symbol library for AAC communication',
        symbols: this.getPCSSymbols(),
        isPremium: true,
        price: 7.99,
      },
      {
        id: 'food-drink-library',
        name: 'Food & Drink Library',
        description: 'Comprehensive food and beverage symbols',
        symbols: this.symbols.filter(s => s.category === 'Food & Drink'),
        isPremium: false,
      },
      {
        id: 'emotions-library',
        name: 'Emotions & Feelings Library',
        description: 'Symbols for expressing emotions and feelings',
        symbols: this.symbols.filter(s => s.category === 'Feelings'),
        isPremium: false,
      },
      {
        id: 'actions-library',
        name: 'Actions Library',
        description: 'Common action verbs and activities',
        symbols: this.symbols.filter(s => s.category === 'Actions'),
        isPremium: false,
      },
    ];
  }

  public getSymbolSets(): SymbolSet[] {
    return [
      {
        id: 'basic-communication',
        name: 'Basic Communication',
        library: 'core-library',
        symbols: this.symbols.filter(s =>
          [
            'hello',
            'help',
            'yes',
            'no',
            'please',
            'thank-you',
            'sorry',
            'i',
            'want',
            'need',
            'like',
            'dont-like',
          ].includes(s.id)
        ),
      },
      {
        id: 'daily-activities',
        name: 'Daily Activities',
        library: 'actions-library',
        symbols: this.symbols.filter(s =>
          [
            'eat',
            'drink',
            'sleep',
            'wash',
            'brush-teeth',
            'bath',
            'read',
            'write',
          ].includes(s.id)
        ),
      },
      {
        id: 'family-people',
        name: 'Family & People',
        library: 'core-library',
        symbols: this.symbols.filter(s =>
          [
            'mom',
            'dad',
            'brother',
            'sister',
            'grandma',
            'grandpa',
            'teacher',
            'friend',
          ].includes(s.id)
        ),
      },
    ];
  }

  public getSymbolsByLibrary(libraryId: string): SymbolWithSound[] {
    const library = this.getSymbolLibraries().find(lib => lib.id === libraryId);
    return library ? library.symbols : [];
  }

  private getSymbolStixSymbols(): SymbolWithSound[] {
    // SymbolStix symbols - these would typically come from a professional symbol library
    return [
      {
        id: 'symbolstix-hello',
        name: 'Hello',
        category: 'Greetings',
        image: '👋', // In a real app, this would be a SymbolStix image URL
        keywords: ['hello', 'hi', 'greeting', 'wave'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'symbolstix-help',
        name: 'Help',
        category: 'Actions',
        image: '🆘',
        keywords: ['help', 'assistance', 'support', 'aid'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'symbolstix-yes',
        name: 'Yes',
        category: 'Communication',
        image: '✅',
        keywords: ['yes', 'okay', 'agree', 'correct'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'symbolstix-no',
        name: 'No',
        category: 'Communication',
        image: '❌',
        keywords: ['no', 'not', 'disagree', 'wrong'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'symbolstix-more',
        name: 'More',
        category: 'Communication',
        image: '➕',
        keywords: ['more', 'again', 'another', 'additional'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getPCSSymbols(): SymbolWithSound[] {
    // PCS symbols - these would typically come from the PCS library
    return [
      {
        id: 'pcs-water',
        name: 'Water',
        category: 'Food & Drink',
        image: '💧',
        keywords: ['water', 'drink', 'thirsty'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pcs-food',
        name: 'Food',
        category: 'Food & Drink',
        image: '🍽️',
        keywords: ['food', 'eat', 'hungry', 'meal'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pcs-happy',
        name: 'Happy',
        category: 'Feelings',
        image: '😊',
        keywords: ['happy', 'joy', 'smile', 'good'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pcs-sad',
        name: 'Sad',
        category: 'Feelings',
        image: '😢',
        keywords: ['sad', 'cry', 'upset', 'bad'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pcs-play',
        name: 'Play',
        category: 'Actions',
        image: '🎮',
        keywords: ['play', 'game', 'fun', 'toy'],
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Import/Export functionality
  public exportSymbols(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'id',
        'name',
        'category',
        'image',
        'keywords',
        'isBuiltIn',
      ];
      const rows = this.symbols.map(symbol => [
        symbol.id,
        symbol.name,
        symbol.category,
        symbol.image,
        symbol.keywords.join(';'),
        symbol.isBuiltIn.toString(),
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.symbols, null, 2);
  }

  public importSymbols(
    data: string,
    format: 'json' | 'csv' = 'json'
  ): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      if (format === 'csv') {
        const lines = data.split('\n');
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= headers.length) {
            try {
              const symbol: SymbolWithSound = {
                id: values[0] || `imported-${Date.now()}-${i}`,
                name: values[1] || 'Imported Symbol',
                category: values[2] || 'Imported',
                image: values[3] || '📦',
                keywords: values[4] ? values[4].split(';') : [],
                isBuiltIn: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Check if symbol already exists
              if (!this.symbols.find(s => s.id === symbol.id)) {
                this.symbols.push(symbol);
                imported++;
              }
            } catch (error) {
              errors.push(
                `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }
        }
      } else {
        const importedSymbols = JSON.parse(data);
        if (Array.isArray(importedSymbols)) {
          for (const symbolData of importedSymbols) {
            try {
              const symbol: SymbolWithSound = {
                id: symbolData.id || `imported-${Date.now()}-${Math.random()}`,
                name: symbolData.name || 'Imported Symbol',
                category: symbolData.category || 'Imported',
                image: symbolData.image || '📦',
                keywords: symbolData.keywords || [],
                isBuiltIn: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Check if symbol already exists
              if (!this.symbols.find(s => s.id === symbol.id)) {
                this.symbols.push(symbol);
                imported++;
              }
            } catch (error) {
              errors.push(
                `Symbol ${symbolData.id || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }
        }
      }
    } catch (error) {
      errors.push(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return { success: errors.length === 0, imported, errors };
  }

  // Advanced filtering
  public getSymbolsByFilters(filters: {
    categories?: string[];
    keywords?: string[];
    isBuiltIn?: boolean;
    hasSound?: boolean;
  }): SymbolWithSound[] {
    return this.symbols.filter(symbol => {
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(symbol.category)) return false;
      }

      if (filters.keywords && filters.keywords.length > 0) {
        if (
          !filters.keywords.some(keyword =>
            symbol.keywords.some(symbolKeyword =>
              symbolKeyword.toLowerCase().includes(keyword.toLowerCase())
            )
          )
        )
          return false;
      }

      if (filters.isBuiltIn !== undefined) {
        if (symbol.isBuiltIn !== filters.isBuiltIn) return false;
      }

      if (filters.hasSound !== undefined) {
        const hasSound = !!(symbol.soundUrl || symbol.audioFile);
        if (hasSound !== filters.hasSound) return false;
      }

      return true;
    });
  }

  // Get symbol statistics
  public getSymbolStatistics(): {
    total: number;
    byCategory: Record<string, number>;
    withSound: number;
    builtIn: number;
    custom: number;
  } {
    const byCategory: Record<string, number> = {};
    let withSound = 0;
    let builtIn = 0;
    let custom = 0;

    this.symbols.forEach(symbol => {
      byCategory[symbol.category] = (byCategory[symbol.category] || 0) + 1;

      if (symbol.soundUrl || symbol.audioFile) withSound++;
      if (symbol.isBuiltIn) builtIn++;
      else custom++;
    });

    return {
      total: this.symbols.length,
      byCategory,
      withSound,
      builtIn,
      custom,
    };
  }

  // Load custom symbols from database
  private async loadCustomSymbols(): Promise<void> {
    try {
      console.log('Starting to load custom symbols from database...');
      const DatabaseService = (await import('./databaseService')).default;
      const dbService = DatabaseService;

      // Get all custom symbols (isBuiltIn = false)
      const customSymbols = await dbService.getCustomSymbols();
      console.log(
        'Retrieved custom symbols from database:',
        customSymbols.length,
        customSymbols.map(s => s.name)
      );

      // Add custom symbols to the symbols array
      customSymbols.forEach(symbol => {
        const symbolWithSound: SymbolWithSound = {
          ...symbol,
          soundUrl: undefined,
          audioFile: undefined,
        };
        this.symbols.push(symbolWithSound);
        console.log('Added custom symbol to symbols array:', symbol.name);
      });

      console.log(
        `Loaded ${customSymbols.length} custom symbols from database. Total symbols now: ${this.symbols.length}`
      );
    } catch (error) {
      console.error('Error loading custom symbols from database:', error);
    }
  }

  // Add custom symbol
  public async addCustomSymbol(symbol: SymbolWithSound): Promise<void> {
    try {
      // Check if symbol with same ID already exists
      const existingIndex = this.symbols.findIndex(s => s.id === symbol.id);
      if (existingIndex >= 0) {
        // Update existing symbol
        this.symbols[existingIndex] = symbol;
      } else {
        // Add new symbol
        this.symbols.push(symbol);
      }

      // Save to database
      const DatabaseService = (await import('./databaseService')).default;
      const dbService = DatabaseService;
      await dbService.createSymbol(symbol);

      // Update categories if new category is added
      const currentCategories = this.getCategories();
      if (!currentCategories.includes(symbol.category)) {
        // Categories are dynamically generated, so we don't need to manually add them
        // The getCategories() method will automatically include the new category
      }

      console.log(
        `Custom symbol "${symbol.name}" added successfully and saved to database`
      );
    } catch (error) {
      console.error('Error saving custom symbol to database:', error);
      // Still add to memory even if database save fails
      const existingIndex = this.symbols.findIndex(s => s.id === symbol.id);
      if (existingIndex >= 0) {
        this.symbols[existingIndex] = symbol;
      } else {
        this.symbols.push(symbol);
      }
      console.log(`Custom symbol "${symbol.name}" added to memory only`);
    }
  }

  // Remove custom symbol
  public removeCustomSymbol(symbolId: string): boolean {
    const index = this.symbols.findIndex(s => s.id === symbolId);
    if (index >= 0) {
      const symbol = this.symbols[index];
      this.symbols.splice(index, 1);

      // Check if category is still used
      const categoryStillUsed = this.symbols.some(
        s => s.category === symbol.category
      );
      if (!categoryStillUsed && symbol.category !== 'All') {
        const categoryIndex = this.categories.indexOf(symbol.category);
        if (categoryIndex >= 0) {
          this.categories.splice(categoryIndex, 1);
        }
      }

      console.log(`Custom symbol "${symbol.name}" removed successfully`);
      return true;
    }
    return false;
  }
}

export default SymbolDataService;
