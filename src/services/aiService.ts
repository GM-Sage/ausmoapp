// AI Service for Ausmo AAC App
// Provides smart symbol suggestions, predictive text, and usage pattern analysis

import { Symbol, CommunicationButton, UsageAnalytics } from '../types';
import AnalyticsService from './analyticsService';
import SymbolDataService from './symbolDataService';

export interface SmartSuggestion {
  symbol: Symbol;
  confidence: number;
  reason: string;
  context: string;
}

export interface PredictiveTextSuggestion {
  text: string;
  confidence: number;
  type: 'word' | 'phrase' | 'sentence';
  context: string;
}

export interface UsagePattern {
  userId: string;
  timeOfDay: string;
  dayOfWeek: string;
  commonSequences: Array<{ symbols: string[]; frequency: number }>;
  vocabularyGrowth: number;
  communicationStyle: 'simple' | 'complex' | 'mixed';
  preferredCategories: string[];
}

export interface AISettings {
  enableSmartSuggestions: boolean;
  enablePredictiveText: boolean;
  enableUsageAnalysis: boolean;
  suggestionThreshold: number; // 0-1
  maxSuggestions: number;
  learningEnabled: boolean;
}

class AIService {
  private static instance: AIService;
  private analyticsService: AnalyticsService;
  private symbolService: SymbolDataService;
  private settings: AISettings;
  private userPatterns: Map<string, UsagePattern> = new Map();
  private contextHistory: Map<string, string[]> = new Map();

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  constructor() {
    this.analyticsService = AnalyticsService.getInstance();
    this.symbolService = SymbolDataService.getInstance();
    this.settings = {
      enableSmartSuggestions: true,
      enablePredictiveText: true,
      enableUsageAnalysis: true,
      suggestionThreshold: 0.3,
      maxSuggestions: 5,
      learningEnabled: true,
    };
  }

  // Initialize AI service for a user
  async initialize(userId: string): Promise<void> {
    try {
      console.log('Initializing AI service for user:', userId);

      // Load user patterns
      await this.loadUserPatterns(userId);

      // Initialize context history
      this.contextHistory.set(userId, []);

      console.log('AI service initialized successfully');
    } catch (error) {
      console.error('Error initializing AI service:', error);
    }
  }

  // Get smart symbol suggestions based on context
  async getSmartSuggestions(
    userId: string,
    currentContext: string,
    recentSymbols: string[] = []
  ): Promise<SmartSuggestion[]> {
    if (!this.settings.enableSmartSuggestions) {
      return [];
    }

    try {
      const suggestions: SmartSuggestion[] = [];
      const userPattern = this.userPatterns.get(userId);
      const allSymbols = this.symbolService.getAllSymbols();

      // Get context-based suggestions
      const contextSuggestions = this.getContextBasedSuggestions(
        currentContext,
        allSymbols,
        userPattern
      );
      suggestions.push(...contextSuggestions);

      // Get sequence-based suggestions
      const sequenceSuggestions = this.getSequenceBasedSuggestions(
        recentSymbols,
        allSymbols,
        userPattern
      );
      suggestions.push(...sequenceSuggestions);

      // Get time-based suggestions
      const timeSuggestions = this.getTimeBasedSuggestions(
        allSymbols,
        userPattern
      );
      suggestions.push(...timeSuggestions);

      // Get category-based suggestions
      const categorySuggestions = this.getCategoryBasedSuggestions(
        allSymbols,
        userPattern
      );
      suggestions.push(...categorySuggestions);

      // Remove duplicates and sort by confidence
      const uniqueSuggestions = this.removeDuplicateSuggestions(suggestions);
      const sortedSuggestions = uniqueSuggestions
        .filter(s => s.confidence >= this.settings.suggestionThreshold)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.settings.maxSuggestions);

      return sortedSuggestions;
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [];
    }
  }

  // Get predictive text suggestions
  async getPredictiveText(
    userId: string,
    currentText: string,
    context: string = ''
  ): Promise<PredictiveTextSuggestion[]> {
    if (!this.settings.enablePredictiveText) {
      return [];
    }

    try {
      const suggestions: PredictiveTextSuggestion[] = [];
      const userPattern = this.userPatterns.get(userId);

      // Word completion suggestions
      const wordSuggestions = this.getWordCompletionSuggestions(
        currentText,
        userPattern
      );
      suggestions.push(...wordSuggestions);

      // Phrase suggestions
      const phraseSuggestions = this.getPhraseSuggestions(
        currentText,
        userPattern
      );
      suggestions.push(...phraseSuggestions);

      // Sentence suggestions
      const sentenceSuggestions = this.getSentenceSuggestions(
        currentText,
        context,
        userPattern
      );
      suggestions.push(...sentenceSuggestions);

      // Sort by confidence and return top suggestions
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.settings.maxSuggestions);
    } catch (error) {
      console.error('Error getting predictive text:', error);
      return [];
    }
  }

  // Learn from user interaction
  async learnFromInteraction(
    userId: string,
    symbolId: string,
    context: string,
    timestamp: Date
  ): Promise<void> {
    if (!this.settings.learningEnabled) {
      return;
    }

    try {
      // Update context history
      const history = this.contextHistory.get(userId) || [];
      history.push(symbolId);
      if (history.length > 10) {
        history.shift(); // Keep only last 10 interactions
      }
      this.contextHistory.set(userId, history);

      // Update user patterns
      await this.updateUserPatterns(userId, symbolId, context, timestamp);

      console.log('Learned from interaction:', { userId, symbolId, context });
    } catch (error) {
      console.error('Error learning from interaction:', error);
    }
  }

  // Analyze usage patterns
  async analyzeUsagePatterns(userId: string): Promise<UsagePattern | null> {
    if (!this.settings.enableUsageAnalysis) {
      return null;
    }

    try {
      const analyticsData =
        await this.analyticsService.getAnalyticsData(userId);

      if (analyticsData.length === 0) {
        return null;
      }

      const pattern = this.buildUsagePattern(userId, analyticsData);
      this.userPatterns.set(userId, pattern);

      return pattern;
    } catch (error) {
      console.error('Error analyzing usage patterns:', error);
      return null;
    }
  }

  // Update AI settings
  updateSettings(newSettings: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('AI settings updated:', this.settings);
  }

  // Get current AI settings
  getSettings(): AISettings {
    return { ...this.settings };
  }

  // Private helper methods
  private getContextBasedSuggestions(
    context: string,
    symbols: Symbol[],
    userPattern?: UsagePattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const contextLower = context.toLowerCase();

    symbols.forEach(symbol => {
      let confidence = 0;
      let reason = '';

      // Check if symbol keywords match context
      const keywordMatch = symbol.keywords.some(keyword =>
        contextLower.includes(keyword.toLowerCase())
      );

      if (keywordMatch) {
        confidence = 0.8;
        reason = 'Context keyword match';
      }

      // Check if symbol name matches context
      if (symbol.name.toLowerCase().includes(contextLower)) {
        confidence = Math.max(confidence, 0.9);
        reason = 'Direct name match';
      }

      // Check if symbol category matches context
      if (symbol.category.toLowerCase().includes(contextLower)) {
        confidence = Math.max(confidence, 0.6);
        reason = 'Category match';
      }

      if (confidence > 0) {
        suggestions.push({
          symbol,
          confidence,
          reason,
          context: 'Context-based',
        });
      }
    });

    return suggestions;
  }

  private getSequenceBasedSuggestions(
    recentSymbols: string[],
    symbols: Symbol[],
    userPattern?: UsagePattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    if (recentSymbols.length === 0 || !userPattern) {
      return suggestions;
    }

    // Find common sequences that start with recent symbols
    userPattern.commonSequences.forEach(sequence => {
      if (sequence.symbols.length > recentSymbols.length) {
        const matches = recentSymbols.every(
          (symbol, index) => sequence.symbols[index] === symbol
        );

        if (matches) {
          const nextSymbol = sequence.symbols[recentSymbols.length];
          const symbol = symbols.find(s => s.id === nextSymbol);

          if (symbol) {
            suggestions.push({
              symbol,
              confidence: Math.min(0.9, sequence.frequency / 10),
              reason: 'Sequence pattern',
              context: 'Sequence-based',
            });
          }
        }
      }
    });

    return suggestions;
  }

  private getTimeBasedSuggestions(
    symbols: Symbol[],
    userPattern?: UsagePattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    if (!userPattern) {
      return suggestions;
    }

    // Suggest symbols based on time of day
    symbols.forEach(symbol => {
      let confidence = 0;
      let reason = '';

      // Morning symbols (6-12)
      if (currentHour >= 6 && currentHour < 12) {
        if (
          symbol.category === 'Food & Drink' ||
          symbol.name.toLowerCase().includes('breakfast')
        ) {
          confidence = 0.7;
          reason = 'Morning routine';
        }
      }

      // Afternoon symbols (12-18)
      if (currentHour >= 12 && currentHour < 18) {
        if (
          symbol.category === 'Activities' ||
          symbol.name.toLowerCase().includes('lunch')
        ) {
          confidence = 0.7;
          reason = 'Afternoon routine';
        }
      }

      // Evening symbols (18-22)
      if (currentHour >= 18 && currentHour < 22) {
        if (
          symbol.category === 'Home' ||
          symbol.name.toLowerCase().includes('dinner')
        ) {
          confidence = 0.7;
          reason = 'Evening routine';
        }
      }

      if (confidence > 0) {
        suggestions.push({
          symbol,
          confidence,
          reason,
          context: 'Time-based',
        });
      }
    });

    return suggestions;
  }

  private getCategoryBasedSuggestions(
    symbols: Symbol[],
    userPattern?: UsagePattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    if (!userPattern) {
      return suggestions;
    }

    // Suggest symbols from preferred categories
    userPattern.preferredCategories.forEach(category => {
      const categorySymbols = symbols.filter(s => s.category === category);

      categorySymbols.forEach(symbol => {
        suggestions.push({
          symbol,
          confidence: 0.5,
          reason: 'Preferred category',
          context: 'Category-based',
        });
      });
    });

    return suggestions;
  }

  private getWordCompletionSuggestions(
    currentText: string,
    userPattern?: UsagePattern
  ): PredictiveTextSuggestion[] {
    const suggestions: PredictiveTextSuggestion[] = [];
    const textLower = currentText.toLowerCase();

    // Common word completions
    const commonWords = [
      'hello',
      'help',
      'yes',
      'no',
      'please',
      'thank',
      'you',
      'want',
      'need',
      'like',
      'go',
      'come',
      'eat',
      'drink',
      'play',
      'sleep',
      'happy',
      'sad',
      'tired',
      'hungry',
    ];

    commonWords.forEach(word => {
      if (word.startsWith(textLower) && word !== textLower) {
        suggestions.push({
          text: word,
          confidence: 0.8,
          type: 'word',
          context: 'Word completion',
        });
      }
    });

    return suggestions;
  }

  private getPhraseSuggestions(
    currentText: string,
    userPattern?: UsagePattern
  ): PredictiveTextSuggestion[] {
    const suggestions: PredictiveTextSuggestion[] = [];
    const textLower = currentText.toLowerCase();

    // Common phrases
    const commonPhrases = [
      'I want',
      'I need',
      'I like',
      "I don't like",
      'Can you help',
      'Thank you',
      'Good morning',
      'Good afternoon',
      'Good evening',
      'How are you',
      "I'm fine",
    ];

    commonPhrases.forEach(phrase => {
      if (
        phrase.toLowerCase().startsWith(textLower) &&
        phrase.toLowerCase() !== textLower
      ) {
        suggestions.push({
          text: phrase,
          confidence: 0.7,
          type: 'phrase',
          context: 'Phrase completion',
        });
      }
    });

    return suggestions;
  }

  private getSentenceSuggestions(
    currentText: string,
    context: string,
    userPattern?: UsagePattern
  ): PredictiveTextSuggestion[] {
    const suggestions: PredictiveTextSuggestion[] = [];

    // Context-based sentence suggestions
    if (context.toLowerCase().includes('food')) {
      suggestions.push({
        text: 'I want to eat',
        confidence: 0.6,
        type: 'sentence',
        context: 'Food context',
      });
    }

    if (context.toLowerCase().includes('help')) {
      suggestions.push({
        text: 'Can you help me',
        confidence: 0.6,
        type: 'sentence',
        context: 'Help context',
      });
    }

    return suggestions;
  }

  private removeDuplicateSuggestions(
    suggestions: SmartSuggestion[]
  ): SmartSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      if (seen.has(suggestion.symbol.id)) {
        return false;
      }
      seen.add(suggestion.symbol.id);
      return true;
    });
  }

  private async loadUserPatterns(userId: string): Promise<void> {
    try {
      // In a real app, this would load from persistent storage
      const pattern = await this.analyzeUsagePatterns(userId);
      if (pattern) {
        this.userPatterns.set(userId, pattern);
      }
    } catch (error) {
      console.error('Error loading user patterns:', error);
    }
  }

  private async updateUserPatterns(
    userId: string,
    symbolId: string,
    context: string,
    timestamp: Date
  ): Promise<void> {
    try {
      let pattern = this.userPatterns.get(userId);

      if (!pattern) {
        pattern = {
          userId,
          timeOfDay: this.getTimeOfDay(timestamp),
          dayOfWeek: this.getDayOfWeek(timestamp),
          commonSequences: [],
          vocabularyGrowth: 0,
          communicationStyle: 'simple',
          preferredCategories: [],
        };
      }

      // Update common sequences
      const history = this.contextHistory.get(userId) || [];
      if (history.length > 1) {
        const sequence = [...history, symbolId];
        const existingSequence = pattern.commonSequences.find(
          s =>
            s.symbols.length === sequence.length &&
            s.symbols.every((symbol, index) => symbol === sequence[index])
        );

        if (existingSequence) {
          existingSequence.frequency++;
        } else {
          pattern.commonSequences.push({ symbols: sequence, frequency: 1 });
        }
      }

      // Update preferred categories
      const symbol = this.symbolService.getSymbolById(symbolId);
      if (symbol && !pattern.preferredCategories.includes(symbol.category)) {
        pattern.preferredCategories.push(symbol.category);
      }

      this.userPatterns.set(userId, pattern);
    } catch (error) {
      console.error('Error updating user patterns:', error);
    }
  }

  private buildUsagePattern(
    userId: string,
    analyticsData: any[]
  ): UsagePattern {
    const pattern: UsagePattern = {
      userId,
      timeOfDay: 'unknown',
      dayOfWeek: 'unknown',
      commonSequences: [],
      vocabularyGrowth: 0,
      communicationStyle: 'simple',
      preferredCategories: [],
    };

    // Analyze time patterns
    const hours = analyticsData.map(data => new Date(data.date).getHours());
    const mostCommonHour = this.getMostCommon(hours);
    pattern.timeOfDay = this.getTimeOfDay(new Date(0, 0, 0, mostCommonHour));

    // Analyze day patterns
    const days = analyticsData.map(data => new Date(data.date).getDay());
    const mostCommonDay = this.getMostCommon(days);
    pattern.dayOfWeek = this.getDayOfWeek(new Date(0, 0, mostCommonDay));

    // Analyze vocabulary growth
    pattern.vocabularyGrowth = Math.max(
      ...analyticsData.map(data => data.vocabularyGrowth)
    );

    // Analyze communication style
    const avgEfficiency =
      analyticsData.reduce(
        (sum, data) => sum + data.communicationEfficiency,
        0
      ) / analyticsData.length;
    if (avgEfficiency > 1.5) {
      pattern.communicationStyle = 'complex';
    } else if (avgEfficiency > 0.8) {
      pattern.communicationStyle = 'mixed';
    } else {
      pattern.communicationStyle = 'simple';
    }

    return pattern;
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private getDayOfWeek(date: Date): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[date.getDay()];
  }

  private getMostCommon(arr: number[]): number {
    const counts = new Map<number, number>();
    arr.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostCommon = arr[0];

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }
}

export default AIService;
