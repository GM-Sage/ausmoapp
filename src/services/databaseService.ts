// Database Service for Ausmo AAC App

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  CommunicationBook, 
  CommunicationPage, 
  CommunicationButton, 
  Message, 
  Symbol, 
  UsageAnalytics,
  BackupData 
} from '../types';
import { DATABASE_TABLES, STORAGE_KEYS } from '../constants';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Initialize database
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('ausmo.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  // Create database tables
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.USERS} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        photo TEXT,
        settings TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,

      // Communication Books table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.BOOKS} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        user_id TEXT NOT NULL,
        pages TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_template INTEGER DEFAULT 0,
        is_shared INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Communication Pages table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.PAGES} (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        layout TEXT NOT NULL,
        buttons TEXT NOT NULL,
        background_image TEXT,
        background_color TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (book_id) REFERENCES ${DATABASE_TABLES.BOOKS} (id)
      )`,

      // Communication Buttons table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.BUTTONS} (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        text TEXT NOT NULL,
        image TEXT,
        audio_message TEXT,
        tts_message TEXT,
        action TEXT NOT NULL,
        position TEXT NOT NULL,
        size TEXT NOT NULL,
        background_color TEXT NOT NULL,
        text_color TEXT NOT NULL,
        border_color TEXT NOT NULL,
        border_width INTEGER NOT NULL,
        border_radius INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        is_visible INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (page_id) REFERENCES ${DATABASE_TABLES.PAGES} (id)
      )`,

      // Messages table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.MESSAGES} (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        audio_file TEXT,
        tts_voice TEXT,
        category TEXT NOT NULL,
        user_id TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        last_used INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Symbols table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.SYMBOLS} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        image TEXT NOT NULL,
        keywords TEXT NOT NULL,
        is_built_in INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,

      // Usage Analytics table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.ANALYTICS} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date INTEGER NOT NULL,
        messages_spoken INTEGER DEFAULT 0,
        pages_viewed INTEGER DEFAULT 0,
        session_duration INTEGER DEFAULT 0,
        most_used_buttons TEXT,
        vocabulary_growth INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Hotspots table (for visual scene pages)
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.HOTSPOTS} (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        width REAL NOT NULL,
        height REAL NOT NULL,
        action TEXT NOT NULL,
        is_visible INTEGER DEFAULT 1,
        FOREIGN KEY (page_id) REFERENCES ${DATABASE_TABLES.PAGES} (id)
      )`,

      // Express Sentences table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.EXPRESS_SENTENCES} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        words TEXT NOT NULL,
        audio_file TEXT,
        usage_count INTEGER DEFAULT 0,
        last_used INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
  }

  // User operations
  async createUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO ${DATABASE_TABLES.USERS} 
      (id, name, photo, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      user.id,
      user.name,
      user.photo || null,
      JSON.stringify(user.settings),
      user.createdAt.getTime(),
      user.updatedAt.getTime(),
    ]);
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.USERS} WHERE id = ?`;
    const result = await this.db.getFirstAsync(query, [id]) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      email: result.email as string || '',
      photo: result.photo as string | undefined,
      settings: JSON.parse(result.settings as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.USERS} ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(query) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      email: result.email as string || '',
      photo: result.photo as string | undefined,
      settings: JSON.parse(result.settings as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async updateUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE ${DATABASE_TABLES.USERS} 
      SET name = ?, photo = ?, settings = ?, updated_at = ?
      WHERE id = ?
    `;

    await this.db.runAsync(query, [
      user.name,
      user.photo || null,
      JSON.stringify(user.settings),
      user.updatedAt.getTime(),
      user.id,
    ]);
  }

  async deleteUser(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `DELETE FROM ${DATABASE_TABLES.USERS} WHERE id = ?`;
    await this.db.runAsync(query, [id]);
  }

  // Communication Book operations
  async createBook(book: CommunicationBook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO ${DATABASE_TABLES.BOOKS} 
      (id, name, description, category, user_id, pages, created_at, updated_at, is_template, is_shared)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      book.id,
      book.name,
      book.description || null,
      book.category,
      book.userId,
      JSON.stringify(book.pages),
      book.createdAt.getTime(),
      book.updatedAt.getTime(),
      book.isTemplate ? 1 : 0,
      book.isShared ? 1 : 0,
    ]);
  }

  async getBook(id: string): Promise<CommunicationBook | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.BOOKS} WHERE id = ?`;
    const result = await this.db.getFirstAsync(query, [id]) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      description: result.description as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      pages: JSON.parse(result.pages as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
      isTemplate: Boolean(result.is_template),
      isShared: Boolean(result.is_shared),
    };
  }

  async getBooks(): Promise<CommunicationBook[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.BOOKS} ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(query) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      description: result.description as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      pages: JSON.parse(result.pages as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
      isTemplate: Boolean(result.is_template),
      isShared: Boolean(result.is_shared),
    }));
  }

  async getBooksByUser(userId: string): Promise<CommunicationBook[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.BOOKS} WHERE user_id = ? ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(query, [userId]) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      description: result.description as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      pages: JSON.parse(result.pages as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
      isTemplate: Boolean(result.is_template),
      isShared: Boolean(result.is_shared),
    }));
  }

  async updateBook(book: CommunicationBook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE ${DATABASE_TABLES.BOOKS} 
      SET name = ?, description = ?, category = ?, pages = ?, updated_at = ?, is_template = ?, is_shared = ?
      WHERE id = ?
    `;

    await this.db.runAsync(query, [
      book.name,
      book.description || null,
      book.category,
      JSON.stringify(book.pages),
      book.updatedAt.getTime(),
      book.isTemplate ? 1 : 0,
      book.isShared ? 1 : 0,
      book.id,
    ]);
  }

  async deleteBook(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `DELETE FROM ${DATABASE_TABLES.BOOKS} WHERE id = ?`;
    await this.db.runAsync(query, [id]);
  }

  // Message operations
  async createMessage(message: Message): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO ${DATABASE_TABLES.MESSAGES} 
      (id, text, audio_file, tts_voice, category, user_id, usage_count, last_used, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      message.id,
      message.text,
      message.audioFile || null,
      message.ttsVoice || null,
      message.category,
      message.userId,
      message.usageCount,
      message.lastUsed?.getTime() || null,
      message.createdAt.getTime(),
      message.updatedAt.getTime(),
    ]);
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.MESSAGES} WHERE user_id = ? ORDER BY usage_count DESC, created_at DESC`;
    const results = await this.db.getAllAsync(query, [userId]) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      text: result.text as string,
      audioFile: result.audio_file as string | undefined,
      ttsVoice: result.tts_voice as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      usageCount: result.usage_count as number,
      lastUsed: result.last_used ? new Date(result.last_used as number) : undefined,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async updateMessageUsage(messageId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE ${DATABASE_TABLES.MESSAGES} 
      SET usage_count = usage_count + 1, last_used = ?, updated_at = ?
      WHERE id = ?
    `;

    const now = new Date().getTime();
    await this.db.runAsync(query, [now, now, messageId]);
  }

  // Symbol operations
  async createSymbol(symbol: Symbol): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO ${DATABASE_TABLES.SYMBOLS} 
      (id, name, category, image, keywords, is_built_in, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      symbol.id,
      symbol.name,
      symbol.category,
      symbol.image,
      JSON.stringify(symbol.keywords),
      symbol.isBuiltIn ? 1 : 0,
      symbol.createdAt.getTime(),
      symbol.updatedAt.getTime(),
    ]);
  }

  async getSymbolsByCategory(category: string): Promise<Symbol[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.SYMBOLS} WHERE category = ? ORDER BY name`;
    const results = await this.db.getAllAsync(query, [category]);

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      category: result.category as string,
      image: result.image as string,
      keywords: JSON.parse(result.keywords as string),
      isBuiltIn: Boolean(result.is_built_in),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async searchSymbols(searchTerm: string): Promise<Symbol[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM ${DATABASE_TABLES.SYMBOLS} 
      WHERE name LIKE ? OR keywords LIKE ?
      ORDER BY name
    `;
    const searchPattern = `%${searchTerm}%`;
    const results = await this.db.getAllAsync(query, [searchPattern, searchPattern]);

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      category: result.category as string,
      image: result.image as string,
      keywords: JSON.parse(result.keywords as string),
      isBuiltIn: Boolean(result.is_built_in),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  // Analytics operations
  async createAnalyticsEntry(analytics: UsageAnalytics): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO ${DATABASE_TABLES.ANALYTICS} 
      (id, user_id, date, messages_spoken, pages_viewed, session_duration, most_used_buttons, vocabulary_growth)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      analytics.userId + '_' + analytics.date.getTime(),
      analytics.userId,
      analytics.date.getTime(),
      analytics.messagesSpoken,
      analytics.pagesViewed,
      analytics.sessionDuration,
      JSON.stringify(analytics.mostUsedButtons),
      analytics.vocabularyGrowth,
    ]);
  }

  async getAnalyticsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<UsageAnalytics[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `SELECT * FROM ${DATABASE_TABLES.ANALYTICS} WHERE user_id = ?`;
    const params: any[] = [userId];

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate.getTime());
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate.getTime());
    }

    query += ` ORDER BY date DESC`;

    const results = await this.db.getAllAsync(query, params);

    return results.map((result: any) => ({
      userId: result.user_id as string,
      date: new Date(result.date as number),
      messagesSpoken: result.messages_spoken as number,
      pagesViewed: result.pages_viewed as number,
      sessionDuration: result.session_duration as number,
      mostUsedButtons: JSON.parse(result.most_used_buttons as string),
      vocabularyGrowth: result.vocabulary_growth as number,
    }));
  }

  // Additional methods for backup service
  async getMessages(): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.MESSAGES} ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(query) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      text: result.text as string,
      audioFile: result.audio_file as string | undefined,
      ttsVoice: result.tts_voice as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      usageCount: result.usage_count as number,
      lastUsed: result.last_used ? new Date(result.last_used as number) : undefined,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async getSymbols(): Promise<Symbol[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.SYMBOLS} ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(query) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      category: result.category as string,
      image: result.image as string,
      keywords: JSON.parse(result.keywords as string),
      isBuiltIn: Boolean(result.is_built_in),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async getAnalytics(): Promise<UsageAnalytics[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.ANALYTICS} ORDER BY date DESC`;
    const results = await this.db.getAllAsync(query) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      userId: result.user_id as string,
      date: new Date(result.date as number),
      messagesSpoken: result.messages_spoken as number,
      pagesViewed: result.pages_viewed as number,
      sessionDuration: result.session_duration as number,
      mostUsedButtons: JSON.parse(result.most_used_buttons as string),
      vocabularyGrowth: result.vocabulary_growth as number,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  // Backup operations
  async createBackup(): Promise<BackupData> {
    const users = await this.getAllUsers();
    const books: CommunicationBook[] = [];
    const messages: Message[] = [];
    const symbols: Symbol[] = [];
    const analytics: UsageAnalytics[] = [];

    // Get all books for all users
    for (const user of users) {
      const userBooks = await this.getBooksByUser(user.id);
      books.push(...userBooks);

      const userMessages = await this.getMessagesByUser(user.id);
      messages.push(...userMessages);

      const userAnalytics = await this.getAnalyticsByUser(user.id);
      analytics.push(...userAnalytics);
    }

    // Get all symbols
    const categories = ['actions', 'animals', 'body', 'clothing', 'colors', 'communication', 'emotions', 'food', 'home', 'people', 'places', 'school', 'shapes', 'time', 'transportation', 'weather'];
    for (const category of categories) {
      const categorySymbols = await this.getSymbolsByCategory(category);
      symbols.push(...categorySymbols);
    }

    return {
      users,
      books,
      messages,
      symbols,
      analytics,
      settings: await this.getAppSettings(),
      version: '1.0.0',
      createdAt: new Date(),
    };
  }

  async restoreBackup(backupData: BackupData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Clear existing data
    await this.db.execAsync(`DELETE FROM ${DATABASE_TABLES.ANALYTICS}`);
    await this.db.execAsync(`DELETE FROM ${DATABASE_TABLES.MESSAGES}`);
    await this.db.execAsync(`DELETE FROM ${DATABASE_TABLES.BUTTONS}`);
    await this.db.execAsync(`DELETE FROM ${DATABASE_TABLES.PAGES}`);
    await this.db.execAsync(`DELETE FROM ${DATABASE_TABLES.BOOKS}`);
    await this.db.execAsync(`DELETE FROM ${DATABASE_TABLES.USERS}`);

    // Restore users
    for (const user of backupData.users) {
      await this.createUser(user);
    }

    // Restore books
    for (const book of backupData.books) {
      await this.createBook(book);
    }

    // Restore messages
    for (const message of backupData.messages) {
      await this.createMessage(message);
    }

    // Restore analytics
    for (const analytic of backupData.analytics) {
      await this.createAnalyticsEntry(analytic);
    }
  }

  // App settings
  async getAppSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Get app settings error:', error);
      return {};
    }
  }

  async setAppSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Set app settings error:', error);
      throw error;
    }
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default DatabaseService.getInstance();
