// Localization Service for Ausmo AAC App
// Provides multi-language support with cultural sensitivity in symbol choice

import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  isRTL: boolean;
  isSupported: boolean;
  symbolSet: 'western' | 'eastern' | 'arabic' | 'custom';
}

export interface LocalizedString {
  key: string;
  translations: Record<string, string>;
  context?: string;
  category?: string;
}

export interface CulturalSymbol {
  id: string;
  name: string;
  category: string;
  culturalContext: string;
  languages: string[];
  symbols: {
    western: string;
    eastern?: string;
    arabic?: string;
    custom?: string;
  };
  description: string;
  usage: string[];
  alternatives: string[];
}

export interface LocalizationSettings {
  currentLanguage: string;
  fallbackLanguage: string;
  culturalSensitivity: boolean;
  symbolLocalization: boolean;
  voiceLocalization: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

export interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
}

class LocalizationService {
  private static instance: LocalizationService;
  private currentUser: User | null = null;
  private isInitialized = false;
  private currentLanguage: string = 'en';
  private fallbackLanguage: string = 'en';
  private localizationSettings: LocalizationSettings;
  private supportedLanguages: Language[] = [];
  private localizedStrings: LocalizedString[] = [];
  private culturalSymbols: CulturalSymbol[] = [];

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  constructor() {
    this.localizationSettings = {
      currentLanguage: 'en',
      fallbackLanguage: 'en',
      culturalSensitivity: true,
      symbolLocalization: true,
      voiceLocalization: true,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: 'US',
      currencyFormat: 'USD',
    };

    this.initializeSupportedLanguages();
    this.initializeLocalizedStrings();
    this.initializeCulturalSymbols();
  }

  // Initialize localization service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await this.loadLocalizationSettings();
      await this.detectUserLanguage();
      this.isInitialized = true;
      console.log('Localization service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing localization service:', error);
    }
  }

  // Language Management
  private initializeSupportedLanguages(): void {
    this.supportedLanguages = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        region: 'US',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        region: 'ES',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        region: 'FR',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        region: 'DE',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
      {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        region: 'IT',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        region: 'PT',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        region: 'CN',
        isRTL: false,
        isSupported: true,
        symbolSet: 'eastern',
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        region: 'JP',
        isRTL: false,
        isSupported: true,
        symbolSet: 'eastern',
      },
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        region: 'KR',
        isRTL: false,
        isSupported: true,
        symbolSet: 'eastern',
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        region: 'SA',
        isRTL: true,
        isSupported: true,
        symbolSet: 'arabic',
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        region: 'IN',
        isRTL: false,
        isSupported: true,
        symbolSet: 'eastern',
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        region: 'RU',
        isRTL: false,
        isSupported: true,
        symbolSet: 'western',
      },
    ];
  }

  private initializeLocalizedStrings(): void {
    this.localizedStrings = [
      // Navigation
      {
        key: 'nav.home',
        translations: {
          en: 'Home',
          es: 'Inicio',
          fr: 'Accueil',
          de: 'Startseite',
          it: 'Home',
          pt: 'Início',
          zh: '首页',
          ja: 'ホーム',
          ko: '홈',
          ar: 'الرئيسية',
          hi: 'होम',
          ru: 'Главная',
        },
        category: 'navigation',
      },
      {
        key: 'nav.communication',
        translations: {
          en: 'Communication',
          es: 'Comunicación',
          fr: 'Communication',
          de: 'Kommunikation',
          it: 'Comunicazione',
          pt: 'Comunicação',
          zh: '沟通',
          ja: 'コミュニケーション',
          ko: '소통',
          ar: 'التواصل',
          hi: 'संचार',
          ru: 'Общение',
        },
        category: 'navigation',
      },
      {
        key: 'nav.library',
        translations: {
          en: 'Library',
          es: 'Biblioteca',
          fr: 'Bibliothèque',
          de: 'Bibliothek',
          it: 'Libreria',
          pt: 'Biblioteca',
          zh: '图书馆',
          ja: 'ライブラリ',
          ko: '라이브러리',
          ar: 'المكتبة',
          hi: 'पुस्तकालय',
          ru: 'Библиотека',
        },
        category: 'navigation',
      },
      {
        key: 'nav.settings',
        translations: {
          en: 'Settings',
          es: 'Configuración',
          fr: 'Paramètres',
          de: 'Einstellungen',
          it: 'Impostazioni',
          pt: 'Configurações',
          zh: '设置',
          ja: '設定',
          ko: '설정',
          ar: 'الإعدادات',
          hi: 'सेटिंग्स',
          ru: 'Настройки',
        },
        category: 'navigation',
      },
      
      // Communication
      {
        key: 'comm.hello',
        translations: {
          en: 'Hello',
          es: 'Hola',
          fr: 'Bonjour',
          de: 'Hallo',
          it: 'Ciao',
          pt: 'Olá',
          zh: '你好',
          ja: 'こんにちは',
          ko: '안녕하세요',
          ar: 'مرحبا',
          hi: 'नमस्ते',
          ru: 'Привет',
        },
        category: 'communication',
      },
      {
        key: 'comm.help',
        translations: {
          en: 'Help',
          es: 'Ayuda',
          fr: 'Aide',
          de: 'Hilfe',
          it: 'Aiuto',
          pt: 'Ajuda',
          zh: '帮助',
          ja: 'ヘルプ',
          ko: '도움',
          ar: 'مساعدة',
          hi: 'मदद',
          ru: 'Помощь',
        },
        category: 'communication',
      },
      {
        key: 'comm.yes',
        translations: {
          en: 'Yes',
          es: 'Sí',
          fr: 'Oui',
          de: 'Ja',
          it: 'Sì',
          pt: 'Sim',
          zh: '是',
          ja: 'はい',
          ko: '예',
          ar: 'نعم',
          hi: 'हाँ',
          ru: 'Да',
        },
        category: 'communication',
      },
      {
        key: 'comm.no',
        translations: {
          en: 'No',
          es: 'No',
          fr: 'Non',
          de: 'Nein',
          it: 'No',
          pt: 'Não',
          zh: '不',
          ja: 'いいえ',
          ko: '아니요',
          ar: 'لا',
          hi: 'नहीं',
          ru: 'Нет',
        },
        category: 'communication',
      },
      {
        key: 'comm.more',
        translations: {
          en: 'More',
          es: 'Más',
          fr: 'Plus',
          de: 'Mehr',
          it: 'Di più',
          pt: 'Mais',
          zh: '更多',
          ja: 'もっと',
          ko: '더',
          ar: 'المزيد',
          hi: 'और',
          ru: 'Больше',
        },
        category: 'communication',
      },
      {
        key: 'comm.done',
        translations: {
          en: 'Done',
          es: 'Hecho',
          fr: 'Terminé',
          de: 'Fertig',
          it: 'Fatto',
          pt: 'Concluído',
          zh: '完成',
          ja: '完了',
          ko: '완료',
          ar: 'تم',
          hi: 'हो गया',
          ru: 'Готово',
        },
        category: 'communication',
      },
      
      // Food & Drink
      {
        key: 'food.water',
        translations: {
          en: 'Water',
          es: 'Agua',
          fr: 'Eau',
          de: 'Wasser',
          it: 'Acqua',
          pt: 'Água',
          zh: '水',
          ja: '水',
          ko: '물',
          ar: 'ماء',
          hi: 'पानी',
          ru: 'Вода',
        },
        category: 'food',
      },
      {
        key: 'food.bread',
        translations: {
          en: 'Bread',
          es: 'Pan',
          fr: 'Pain',
          de: 'Brot',
          it: 'Pane',
          pt: 'Pão',
          zh: '面包',
          ja: 'パン',
          ko: '빵',
          ar: 'خبز',
          hi: 'रोटी',
          ru: 'Хлеб',
        },
        category: 'food',
      },
      {
        key: 'food.milk',
        translations: {
          en: 'Milk',
          es: 'Leche',
          fr: 'Lait',
          de: 'Milch',
          it: 'Latte',
          pt: 'Leite',
          zh: '牛奶',
          ja: '牛乳',
          ko: '우유',
          ar: 'حليب',
          hi: 'दूध',
          ru: 'Молоко',
        },
        category: 'food',
      },
      
      // Actions
      {
        key: 'action.eat',
        translations: {
          en: 'Eat',
          es: 'Comer',
          fr: 'Manger',
          de: 'Essen',
          it: 'Mangiare',
          pt: 'Comer',
          zh: '吃',
          ja: '食べる',
          ko: '먹다',
          ar: 'أكل',
          hi: 'खाना',
          ru: 'Есть',
        },
        category: 'action',
      },
      {
        key: 'action.drink',
        translations: {
          en: 'Drink',
          es: 'Beber',
          fr: 'Boire',
          de: 'Trinken',
          it: 'Bere',
          pt: 'Beber',
          zh: '喝',
          ja: '飲む',
          ko: '마시다',
          ar: 'شرب',
          hi: 'पीना',
          ru: 'Пить',
        },
        category: 'action',
      },
      {
        key: 'action.play',
        translations: {
          en: 'Play',
          es: 'Jugar',
          fr: 'Jouer',
          de: 'Spielen',
          it: 'Giocare',
          pt: 'Brincar',
          zh: '玩',
          ja: '遊ぶ',
          ko: '놀다',
          ar: 'لعب',
          hi: 'खेलना',
          ru: 'Играть',
        },
        category: 'action',
      },
      
      // Settings
      {
        key: 'settings.language',
        translations: {
          en: 'Language',
          es: 'Idioma',
          fr: 'Langue',
          de: 'Sprache',
          it: 'Lingua',
          pt: 'Idioma',
          zh: '语言',
          ja: '言語',
          ko: '언어',
          ar: 'اللغة',
          hi: 'भाषा',
          ru: 'Язык',
        },
        category: 'settings',
      },
      {
        key: 'settings.voice',
        translations: {
          en: 'Voice',
          es: 'Voz',
          fr: 'Voix',
          de: 'Stimme',
          it: 'Voce',
          pt: 'Voz',
          zh: '声音',
          ja: '音声',
          ko: '음성',
          ar: 'صوت',
          hi: 'आवाज',
          ru: 'Голос',
        },
        category: 'settings',
      },
    ];
  }

  private initializeCulturalSymbols(): void {
    this.culturalSymbols = [
      {
        id: 'greeting_hello',
        name: 'Hello',
        category: 'greeting',
        culturalContext: 'Universal greeting',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
        symbols: {
          western: '👋',
          eastern: '🙏',
          arabic: '🤲',
        },
        description: 'A friendly greeting gesture',
        usage: ['greeting', 'hello', 'hi'],
        alternatives: ['wave', 'handshake', 'bow'],
      },
      {
        id: 'food_rice',
        name: 'Rice',
        category: 'food',
        culturalContext: 'Staple food in many cultures',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
        symbols: {
          western: '🍚',
          eastern: '🍚',
          arabic: '🍚',
        },
        description: 'Cooked rice, a staple food',
        usage: ['food', 'rice', 'meal'],
        alternatives: ['grain', 'cereal', 'staple'],
      },
      {
        id: 'family_mother',
        name: 'Mother',
        category: 'family',
        culturalContext: 'Universal family relationship',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
        symbols: {
          western: '👩',
          eastern: '👩',
          arabic: '👩',
        },
        description: 'Mother or maternal figure',
        usage: ['family', 'mother', 'mom', 'mama'],
        alternatives: ['parent', 'caregiver', 'guardian'],
      },
      {
        id: 'emotion_happy',
        name: 'Happy',
        category: 'emotion',
        culturalContext: 'Universal positive emotion',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
        symbols: {
          western: '😊',
          eastern: '😊',
          arabic: '😊',
        },
        description: 'Happy or joyful expression',
        usage: ['emotion', 'happy', 'joy', 'pleasure'],
        alternatives: ['smile', 'cheerful', 'content'],
      },
      {
        id: 'time_morning',
        name: 'Morning',
        category: 'time',
        culturalContext: 'Time of day',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
        symbols: {
          western: '🌅',
          eastern: '🌅',
          arabic: '🌅',
        },
        description: 'Morning time, sunrise',
        usage: ['time', 'morning', 'dawn', 'sunrise'],
        alternatives: ['early', 'daybreak', 'aurora'],
      },
    ];
  }

  // Language Detection and Management
  async detectUserLanguage(): Promise<string> {
    try {
      // Get device language
      const deviceLanguage = await this.getDeviceLanguage();
      
      // Check if user has a preferred language
      const userLanguage = await this.getUserPreferredLanguage();
      
      // Use user preference if available, otherwise use device language
      const detectedLanguage = userLanguage || deviceLanguage;
      
      // Check if language is supported
      const isSupported = this.supportedLanguages.some(lang => lang.code === detectedLanguage);
      
      if (isSupported) {
        this.currentLanguage = detectedLanguage;
      } else {
        // Use fallback language
        this.currentLanguage = this.fallbackLanguage;
      }
      
      console.log('Detected language:', this.currentLanguage);
      return this.currentLanguage;
    } catch (error) {
      console.error('Error detecting user language:', error);
      return this.fallbackLanguage;
    }
  }

  private async getDeviceLanguage(): Promise<string> {
    try {
      // In a real app, this would use device locale
      // For now, return English as default
      return 'en';
    } catch (error) {
      console.error('Error getting device language:', error);
      return 'en';
    }
  }

  private async getUserPreferredLanguage(): Promise<string | null> {
    try {
      if (!this.currentUser) return null;
      
      const userLanguage = await AsyncStorage.getItem(`user_language_${this.currentUser.id}`);
      return userLanguage;
    } catch (error) {
      console.error('Error getting user preferred language:', error);
      return null;
    }
  }

  // Localization Methods
  getString(key: string, language?: string): string {
    try {
      const targetLanguage = language || this.currentLanguage;
      
      // Find the localized string
      const localizedString = this.localizedStrings.find(str => str.key === key);
      if (!localizedString) {
        console.warn(`Localized string not found for key: ${key}`);
        return key; // Return key if translation not found
      }
      
      // Get translation for target language
      const translation = localizedString.translations[targetLanguage];
      if (translation) {
        return translation;
      }
      
      // Fallback to fallback language
      const fallbackTranslation = localizedString.translations[this.fallbackLanguage];
      if (fallbackTranslation) {
        return fallbackTranslation;
      }
      
      // Fallback to first available translation
      const firstTranslation = Object.values(localizedString.translations)[0];
      if (firstTranslation) {
        return firstTranslation;
      }
      
      // Return key if no translation found
      return key;
    } catch (error) {
      console.error('Error getting localized string:', error);
      return key;
    }
  }

  getCulturalSymbol(symbolId: string, language?: string): CulturalSymbol | null {
    try {
      const targetLanguage = language || this.currentLanguage;
      
      // Find the cultural symbol
      const culturalSymbol = this.culturalSymbols.find(symbol => symbol.id === symbolId);
      if (!culturalSymbol) {
        return null;
      }
      
      // Check if symbol is available for the target language
      if (culturalSymbol.languages.includes(targetLanguage)) {
        return culturalSymbol;
      }
      
      // Return symbol anyway (it's culturally appropriate)
      return culturalSymbol;
    } catch (error) {
      console.error('Error getting cultural symbol:', error);
      return null;
    }
  }

  // Voice Localization
  getVoiceSettings(language?: string): VoiceSettings {
    try {
      const targetLanguage = language || this.currentLanguage;
      
      // Default voice settings
      const defaultVoiceSettings: VoiceSettings = {
        language: targetLanguage,
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
        volume: 0.8,
        gender: 'neutral',
        accent: 'standard',
      };
      
      // Language-specific voice settings
      const voiceSettings: Record<string, Partial<VoiceSettings>> = {
        en: { voice: 'en-US', gender: 'female', accent: 'american' },
        es: { voice: 'es-ES', gender: 'female', accent: 'spanish' },
        fr: { voice: 'fr-FR', gender: 'female', accent: 'french' },
        de: { voice: 'de-DE', gender: 'male', accent: 'german' },
        it: { voice: 'it-IT', gender: 'female', accent: 'italian' },
        pt: { voice: 'pt-PT', gender: 'female', accent: 'portuguese' },
        zh: { voice: 'zh-CN', gender: 'female', accent: 'mandarin' },
        ja: { voice: 'ja-JP', gender: 'female', accent: 'japanese' },
        ko: { voice: 'ko-KR', gender: 'female', accent: 'korean' },
        ar: { voice: 'ar-SA', gender: 'male', accent: 'arabic' },
        hi: { voice: 'hi-IN', gender: 'female', accent: 'hindi' },
        ru: { voice: 'ru-RU', gender: 'male', accent: 'russian' },
      };
      
      const languageSettings = voiceSettings[targetLanguage] || {};
      return { ...defaultVoiceSettings, ...languageSettings };
    } catch (error) {
      console.error('Error getting voice settings:', error);
      return {
        language: 'en',
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
        volume: 0.8,
        gender: 'neutral',
        accent: 'standard',
      };
    }
  }

  // Formatting
  formatDate(date: Date, language?: string): string {
    try {
      const targetLanguage = language || this.currentLanguage;
      
      // Language-specific date formats
      const dateFormats: Record<string, string> = {
        en: 'MM/DD/YYYY',
        es: 'DD/MM/YYYY',
        fr: 'DD/MM/YYYY',
        de: 'DD.MM.YYYY',
        it: 'DD/MM/YYYY',
        pt: 'DD/MM/YYYY',
        zh: 'YYYY年MM月DD日',
        ja: 'YYYY年MM月DD日',
        ko: 'YYYY년 MM월 DD일',
        ar: 'DD/MM/YYYY',
        hi: 'DD/MM/YYYY',
        ru: 'DD.MM.YYYY',
      };
      
      const format = dateFormats[targetLanguage] || 'MM/DD/YYYY';
      
      // Simple date formatting (in production, use a proper date library)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return format
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  }

  formatTime(date: Date, language?: string): string {
    try {
      const targetLanguage = language || this.currentLanguage;
      
      // Language-specific time formats
      const timeFormats: Record<string, string> = {
        en: '12h',
        es: '24h',
        fr: '24h',
        de: '24h',
        it: '24h',
        pt: '24h',
        zh: '24h',
        ja: '24h',
        ko: '24h',
        ar: '12h',
        hi: '12h',
        ru: '24h',
      };
      
      const format = timeFormats[targetLanguage] || '12h';
      
      if (format === '12h') {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return date.toLocaleTimeString();
    }
  }

  // Settings Management
  async updateLocalizationSettings(settings: Partial<LocalizationSettings>): Promise<void> {
    try {
      this.localizationSettings = { ...this.localizationSettings, ...settings };
      await this.saveLocalizationSettings();
      
      // Update current language if changed
      if (settings.currentLanguage) {
        this.currentLanguage = settings.currentLanguage;
      }
      
      console.log('Localization settings updated');
    } catch (error) {
      console.error('Error updating localization settings:', error);
      throw error;
    }
  }

  async getLocalizationSettings(): Promise<LocalizationSettings> {
    return { ...this.localizationSettings };
  }

  // Language Support
  getSupportedLanguages(): Language[] {
    return [...this.supportedLanguages];
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === languageCode);
  }

  isRTLLanguage(languageCode?: string): boolean {
    const targetLanguage = languageCode || this.currentLanguage;
    const language = this.supportedLanguages.find(lang => lang.code === targetLanguage);
    return language?.isRTL || false;
  }

  // Helper Methods
  private async loadLocalizationSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('localization_settings');
      if (settings) {
        this.localizationSettings = { ...this.localizationSettings, ...JSON.parse(settings) };
        this.currentLanguage = this.localizationSettings.currentLanguage;
      }
    } catch (error) {
      console.error('Error loading localization settings:', error);
    }
  }

  private async saveLocalizationSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('localization_settings', JSON.stringify(this.localizationSettings));
    } catch (error) {
      console.error('Error saving localization settings:', error);
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
    console.log('Localization service cleaned up');
  }
}

export default LocalizationService;
