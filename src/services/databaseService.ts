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
  BackupData,
  SyncedButton,
  QuizSession,
  TherapistProfile,
  ParentProfile,
  ChildProfile,
  TherapyGoal,
  TherapyTask,
  TherapySession,
  ProgressReport,
  PatientProfile,
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

      // User Favorites table
      `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.FAVORITES} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol_id TEXT NOT NULL,
        added_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id),
        FOREIGN KEY (symbol_id) REFERENCES ${DATABASE_TABLES.SYMBOLS} (id),
        UNIQUE(user_id, symbol_id)
      )`,

      // Synced Buttons table
      `CREATE TABLE IF NOT EXISTS synced_buttons (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        image TEXT,
        tts_message TEXT,
        action TEXT NOT NULL,
        background_color TEXT NOT NULL,
        text_color TEXT NOT NULL,
        border_color TEXT NOT NULL,
        border_width INTEGER NOT NULL,
        border_radius INTEGER NOT NULL,
        size TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT NOT NULL,
        is_visible INTEGER DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Quiz Sessions table
      `CREATE TABLE IF NOT EXISTS quiz_sessions (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        incorrect_answers INTEGER DEFAULT 0,
        score REAL DEFAULT 0,
        is_completed INTEGER DEFAULT 0,
        questions TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Therapist Profiles table
      `CREATE TABLE IF NOT EXISTS therapist_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        credentials TEXT NOT NULL,
        specialties TEXT NOT NULL,
        license_number TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        patients TEXT NOT NULL,
        caseload INTEGER NOT NULL,
        experience INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Parent Profiles table
      `CREATE TABLE IF NOT EXISTS parent_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        children TEXT NOT NULL,
        relationship TEXT NOT NULL,
        emergency_contact INTEGER DEFAULT 0,
        notifications TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Child Profiles table
      `CREATE TABLE IF NOT EXISTS child_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        date_of_birth INTEGER NOT NULL,
        diagnosis TEXT NOT NULL,
        therapy_types TEXT NOT NULL,
        communication_level TEXT NOT NULL,
        cognitive_level TEXT NOT NULL,
        motor_level TEXT NOT NULL,
        sensory_profile TEXT NOT NULL,
        interests TEXT NOT NULL,
        strengths TEXT NOT NULL,
        challenges TEXT NOT NULL,
        goals TEXT NOT NULL,
        therapists TEXT NOT NULL,
        parents TEXT NOT NULL,
        current_goals TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES ${DATABASE_TABLES.USERS} (id)
      )`,

      // Therapy Goals table
      `CREATE TABLE IF NOT EXISTS therapy_goals (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        therapist_id TEXT NOT NULL,
        therapy_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        target_behavior TEXT NOT NULL,
        measurement_criteria TEXT NOT NULL,
        baseline_data TEXT NOT NULL,
        target_data TEXT NOT NULL,
        current_progress TEXT NOT NULL,
        mastery_criteria TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        mastered_at INTEGER
      )`,

      // Therapy Tasks table
      `CREATE TABLE IF NOT EXISTS therapy_tasks (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT NOT NULL,
        materials TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        estimated_duration INTEGER NOT NULL,
        skills TEXT NOT NULL,
        prerequisites TEXT NOT NULL,
        adaptations TEXT NOT NULL,
        data_collection TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (goal_id) REFERENCES therapy_goals (id)
      )`,

      // Therapy Sessions table
      `CREATE TABLE IF NOT EXISTS therapy_sessions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        therapist_id TEXT NOT NULL,
        session_date INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        goals TEXT NOT NULL,
        tasks TEXT NOT NULL,
        activities TEXT NOT NULL,
        notes TEXT,
        data TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        next_session_date INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,

      // Progress Reports table
      `CREATE TABLE IF NOT EXISTS progress_reports (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        therapist_id TEXT NOT NULL,
        report_period TEXT NOT NULL,
        goals TEXT NOT NULL,
        summary TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        next_steps TEXT NOT NULL,
        created_at INTEGER NOT NULL
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
    const result = (await this.db.getFirstAsync(query, [id])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      email: (result.email as string) || '',
      photo: result.photo as string | undefined,
      role: (result.role as any) || 'child', // Add role property with fallback
      settings: JSON.parse(result.settings as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.USERS} ORDER BY created_at DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      email: (result.email as string) || '',
      photo: result.photo as string | undefined,
      role: (result.role as any) || 'child', // Add role property with fallback
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
    const result = (await this.db.getFirstAsync(query, [id])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      title: (result.title as string) || (result.name as string), // Use title if available, fallback to name
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
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      title: (result.title as string) || (result.name as string), // Use title if available, fallback to name
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
    const results = (await this.db.getAllAsync(query, [userId])) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      title: (result.title as string) || (result.name as string), // Use title if available, fallback to name
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
    const results = (await this.db.getAllAsync(query, [userId])) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      text: result.text as string,
      audioFile: result.audio_file as string | undefined,
      ttsVoice: result.tts_voice as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      usageCount: result.usage_count as number,
      lastUsed: result.last_used
        ? new Date(result.last_used as number)
        : undefined,
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
    const results = await this.db.getAllAsync(query, [
      searchPattern,
      searchPattern,
    ]);

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

  async getAnalyticsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<UsageAnalytics[]> {
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
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      text: result.text as string,
      audioFile: result.audio_file as string | undefined,
      ttsVoice: result.tts_voice as string | undefined,
      category: result.category as string,
      userId: result.user_id as string,
      usageCount: result.usage_count as number,
      lastUsed: result.last_used
        ? new Date(result.last_used as number)
        : undefined,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async getSymbols(): Promise<Symbol[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.SYMBOLS} ORDER BY created_at DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

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

  async getCustomSymbols(): Promise<Symbol[]> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('Querying custom symbols from database...');
    const query = `SELECT * FROM ${DATABASE_TABLES.SYMBOLS} WHERE is_built_in = 0 ORDER BY created_at DESC`;
    console.log('Query:', query);

    const results = (await this.db.getAllAsync(query)) as any[];
    console.log(
      'Raw database results:',
      results.length,
      results.map(r => ({ id: r.id, name: r.name, is_built_in: r.is_built_in }))
    );

    const symbols = results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      category: result.category as string,
      image: result.image as string,
      keywords: JSON.parse(result.keywords as string),
      isBuiltIn: Boolean(result.is_built_in),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));

    console.log(
      'Processed custom symbols:',
      symbols.length,
      symbols.map(s => s.name)
    );
    return symbols;
  }

  async deleteSymbol(symbolId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `DELETE FROM ${DATABASE_TABLES.SYMBOLS} WHERE id = ?`,
      [symbolId]
    );
  }

  async getAnalytics(): Promise<UsageAnalytics[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM ${DATABASE_TABLES.ANALYTICS} ORDER BY date DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

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

  // Synced Button operations
  async createSyncedButton(button: SyncedButton): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepareAsync(`
      INSERT INTO synced_buttons (
        id, text, image, tts_message, action, background_color, 
        text_color, border_color, border_width, border_radius, size, 
        category, tags, is_visible, usage_count, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.executeAsync([
      button.id,
      button.text,
      button.image || null,
      button.ttsMessage || null,
      JSON.stringify(button.action),
      button.backgroundColor,
      button.textColor,
      button.borderColor,
      button.borderWidth,
      button.borderRadius,
      button.size,
      button.category,
      JSON.stringify(button.tags),
      button.isVisible ? 1 : 0,
      button.usageCount,
      button.userId,
      button.createdAt.getTime(),
      button.updatedAt.getTime(),
    ]);

    await stmt.finalizeAsync();
  }

  async getSyncedButtons(userId: string): Promise<SyncedButton[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getAllAsync(
      `
      SELECT * FROM synced_buttons WHERE user_id = ? ORDER BY text ASC
    `,
      [userId]
    )) as any[];

    return result.map((row: any) => ({
      id: row.id,
      name: row.text, // Use text as name since name column doesn't exist
      text: row.text,
      image: row.image,
      ttsMessage: row.tts_message,
      action: JSON.parse(row.action),
      backgroundColor: row.background_color,
      textColor: row.text_color,
      borderColor: row.border_color,
      borderWidth: row.border_width,
      borderRadius: row.border_radius,
      size: row.size,
      category: row.category,
      tags: JSON.parse(row.tags),
      isVisible: Boolean(row.is_visible),
      usageCount: row.usage_count,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getSyncedButton(buttonId: string): Promise<SyncedButton | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(
      `
      SELECT * FROM synced_buttons WHERE id = ?
    `,
      [buttonId]
    )) as any;

    if (!result) return null;

    return {
      id: result.id,
      name: result.text, // Use text as name since name column doesn't exist
      text: result.text,
      image: result.image,
      ttsMessage: result.tts_message,
      action: JSON.parse(result.action),
      backgroundColor: result.background_color,
      textColor: result.text_color,
      borderColor: result.border_color,
      borderWidth: result.border_width,
      borderRadius: result.border_radius,
      size: result.size,
      category: result.category,
      tags: JSON.parse(result.tags),
      isVisible: Boolean(result.is_visible),
      usageCount: result.usage_count,
      userId: result.user_id,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };
  }

  async updateSyncedButton(
    buttonId: string,
    updates: Partial<SyncedButton>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    // Skip name updates since name column doesn't exist
    if (updates.text !== undefined) {
      fields.push('text = ?');
      values.push(updates.text);
    }
    if (updates.image !== undefined) {
      fields.push('image = ?');
      values.push(updates.image);
    }
    if (updates.ttsMessage !== undefined) {
      fields.push('tts_message = ?');
      values.push(updates.ttsMessage);
    }
    if (updates.action !== undefined) {
      fields.push('action = ?');
      values.push(JSON.stringify(updates.action));
    }
    if (updates.backgroundColor !== undefined) {
      fields.push('background_color = ?');
      values.push(updates.backgroundColor);
    }
    if (updates.textColor !== undefined) {
      fields.push('text_color = ?');
      values.push(updates.textColor);
    }
    if (updates.borderColor !== undefined) {
      fields.push('border_color = ?');
      values.push(updates.borderColor);
    }
    if (updates.borderWidth !== undefined) {
      fields.push('border_width = ?');
      values.push(updates.borderWidth);
    }
    if (updates.borderRadius !== undefined) {
      fields.push('border_radius = ?');
      values.push(updates.borderRadius);
    }
    if (updates.size !== undefined) {
      fields.push('size = ?');
      values.push(updates.size);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.isVisible !== undefined) {
      fields.push('is_visible = ?');
      values.push(updates.isVisible ? 1 : 0);
    }
    if (updates.usageCount !== undefined) {
      fields.push('usage_count = ?');
      values.push(updates.usageCount);
    }

    fields.push('updated_at = ?');
    values.push(new Date().getTime());
    values.push(buttonId);

    const stmt = await this.db.prepareAsync(`
      UPDATE synced_buttons SET ${fields.join(', ')} WHERE id = ?
    `);

    await stmt.executeAsync(values);
    await stmt.finalizeAsync();
  }

  async deleteSyncedButton(buttonId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepareAsync(`
      DELETE FROM synced_buttons WHERE id = ?
    `);

    await stmt.executeAsync([buttonId]);
    await stmt.finalizeAsync();
  }

  // Quiz operations
  async createQuizSession(session: QuizSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepareAsync(`
      INSERT INTO quiz_sessions (
        id, page_id, user_id, start_time, end_time, total_questions, 
        correct_answers, incorrect_answers, score, is_completed, questions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.executeAsync([
      session.id,
      session.pageId,
      session.userId,
      session.startTime.getTime(),
      session.endTime?.getTime() || null,
      session.totalQuestions,
      session.correctAnswers,
      session.incorrectAnswers,
      session.score,
      session.isCompleted ? 1 : 0,
      JSON.stringify(session.questions),
    ]);

    await stmt.finalizeAsync();
  }

  async getQuizSession(sessionId: string): Promise<QuizSession | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = (await this.db.getFirstAsync(
      `
      SELECT * FROM quiz_sessions WHERE id = ?
    `,
      [sessionId]
    )) as any;

    if (!result) return null;

    return {
      id: result.id,
      pageId: result.page_id,
      userId: result.user_id,
      startTime: new Date(result.start_time),
      endTime: result.end_time ? new Date(result.end_time) : undefined,
      totalQuestions: result.total_questions,
      correctAnswers: result.correct_answers,
      incorrectAnswers: result.incorrect_answers,
      score: result.score,
      isCompleted: Boolean(result.is_completed),
      questions: JSON.parse(result.questions),
    };
  }

  async updateQuizSession(
    sessionId: string,
    session: QuizSession
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepareAsync(`
      UPDATE quiz_sessions SET 
        end_time = ?, correct_answers = ?, incorrect_answers = ?, 
        score = ?, is_completed = ?, questions = ?
      WHERE id = ?
    `);

    await stmt.executeAsync([
      session.endTime?.getTime() || null,
      session.correctAnswers,
      session.incorrectAnswers,
      session.score,
      session.isCompleted ? 1 : 0,
      JSON.stringify(session.questions),
      sessionId,
    ]);

    await stmt.finalizeAsync();
  }

  async getQuizHistory(
    userId: string,
    limit: number = 10
  ): Promise<QuizSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      `
      SELECT * FROM quiz_sessions 
      WHERE user_id = ? 
      ORDER BY start_time DESC 
      LIMIT ?
    `,
      [userId, limit]
    );

    return result.map((row: any) => ({
      id: row.id,
      pageId: row.page_id,
      userId: row.user_id,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      totalQuestions: row.total_questions,
      correctAnswers: row.correct_answers,
      incorrectAnswers: row.incorrect_answers,
      score: row.score,
      isCompleted: Boolean(row.is_completed),
      questions: JSON.parse(row.questions),
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
    const categories = [
      'actions',
      'animals',
      'body',
      'clothing',
      'colors',
      'communication',
      'emotions',
      'food',
      'home',
      'people',
      'places',
      'school',
      'shapes',
      'time',
      'transportation',
      'weather',
    ];
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
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Set app settings error:', error);
      throw error;
    }
  }

  // Cleanup
  // Therapist and Therapy Management
  async createTherapistProfile(profile: TherapistProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO therapist_profiles (
        id, user_id, name, credentials, specialties, license_number, 
        email, phone, patients, caseload, experience, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      profile.id,
      profile.user_id || '',
      profile.name,
      profile.credentials,
      JSON.stringify(profile.specialties),
      profile.licenseNumber || null,
      profile.email,
      profile.phone || null,
      JSON.stringify(profile.patients),
      profile.caseload,
      profile.experience,
      profile.createdAt.getTime(),
      profile.updatedAt.getTime(),
    ]);
  }

  async getTherapistProfile(userId: string): Promise<TherapistProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapist_profiles WHERE user_id = ?`;
    const result = (await this.db.getFirstAsync(query, [userId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      user_id: result.user_id as string,
      name: result.name as string,
      credentials: result.credentials as string,
      specialties: JSON.parse(result.specialties as string),
      licenseNumber: result.license_number as string | undefined,
      email: result.email as string,
      phone: result.phone as string | undefined,
      patients: JSON.parse(result.patients as string),
      caseload: result.caseload as number,
      experience: result.experience as number,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async createParentProfile(profile: ParentProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO parent_profiles (
        id, user_id, name, email, phone, children, relationship, 
        emergency_contact, notifications, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      profile.id,
      profile.user_id || '',
      profile.name,
      profile.email,
      profile.phone || null,
      JSON.stringify(profile.children),
      profile.relationship,
      profile.emergencyContact,
      JSON.stringify(profile.notifications),
      profile.createdAt.getTime(),
      profile.updatedAt.getTime(),
    ]);
  }

  async getParentProfile(userId: string): Promise<ParentProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM parent_profiles WHERE user_id = ?`;
    const result = (await this.db.getFirstAsync(query, [userId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      user_id: result.user_id as string,
      name: result.name as string,
      email: result.email as string,
      phone: result.phone as string | undefined,
      children: JSON.parse(result.children as string),
      relationship: result.relationship as 'parent' | 'guardian' | 'caregiver',
      emergencyContact: result.emergency_contact as boolean,
      notifications: JSON.parse(result.notifications as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async createChildProfile(profile: ChildProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO child_profiles (
        id, user_id, name, date_of_birth, diagnosis, therapy_types, 
        communication_level, cognitive_level, motor_level, sensory_profile,
        interests, strengths, challenges, goals, therapists, parents, 
        current_goals, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      profile.id,
      profile.user_id || '',
      profile.name,
      profile.dateOfBirth.getTime(),
      JSON.stringify(profile.diagnosis),
      JSON.stringify(profile.therapyTypes),
      profile.communicationLevel,
      profile.cognitiveLevel,
      profile.motorLevel,
      JSON.stringify(profile.sensoryProfile),
      JSON.stringify(profile.interests),
      JSON.stringify(profile.strengths),
      JSON.stringify(profile.challenges),
      JSON.stringify(profile.goals),
      JSON.stringify(profile.therapists),
      JSON.stringify(profile.parents),
      JSON.stringify(profile.currentGoals),
      profile.createdAt.getTime(),
      profile.updatedAt.getTime(),
    ]);
  }

  async getChildProfile(userId: string): Promise<ChildProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM child_profiles WHERE user_id = ?`;
    const result = (await this.db.getFirstAsync(query, [userId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      user_id: result.user_id as string,
      name: result.name as string,
      dateOfBirth: new Date(result.date_of_birth as number),
      diagnosis: JSON.parse(result.diagnosis as string),
      therapyTypes: JSON.parse(result.therapy_types as string),
      communicationLevel: result.communication_level as any,
      cognitiveLevel: result.cognitive_level as any,
      motorLevel: result.motor_level as any,
      sensoryProfile: JSON.parse(result.sensory_profile as string),
      interests: JSON.parse(result.interests as string),
      strengths: JSON.parse(result.strengths as string),
      challenges: JSON.parse(result.challenges as string),
      goals: JSON.parse(result.goals as string),
      therapists: JSON.parse(result.therapists as string),
      parents: JSON.parse(result.parents as string),
      currentGoals: JSON.parse(result.current_goals as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async createTherapyGoal(goal: TherapyGoal): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO therapy_goals (
        id, patient_id, therapist_id, therapy_type, title, description, 
        category, subcategory, target_behavior, measurement_criteria,
        baseline_data, target_data, current_progress, mastery_criteria,
        status, priority, created_at, updated_at, mastered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      goal.id,
      goal.patientId,
      goal.therapistId,
      goal.therapyType,
      goal.title,
      goal.description,
      goal.category,
      goal.subcategory || null,
      goal.targetBehavior,
      goal.measurementCriteria,
      JSON.stringify(goal.baselineData),
      JSON.stringify(goal.targetData),
      JSON.stringify(goal.currentProgress),
      JSON.stringify(goal.masteryCriteria),
      goal.status,
      goal.priority,
      goal.createdAt.getTime(),
      goal.updatedAt.getTime(),
      goal.masteredAt?.getTime() || null,
    ]);
  }

  async getTherapyGoal(goalId: string): Promise<TherapyGoal | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapy_goals WHERE id = ?`;
    const result = (await this.db.getFirstAsync(query, [goalId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      patientId: result.patient_id as string,
      therapistId: result.therapist_id as string,
      therapyType: result.therapy_type as 'ABA' | 'Speech' | 'OT',
      title: result.title as string,
      description: result.description as string,
      category: result.category as string,
      subcategory: result.subcategory as string | undefined,
      targetBehavior: result.target_behavior as string,
      measurementCriteria: result.measurement_criteria as string,
      baselineData: JSON.parse(result.baseline_data as string),
      targetData: JSON.parse(result.target_data as string),
      currentProgress: JSON.parse(result.current_progress as string),
      masteryCriteria: JSON.parse(result.mastery_criteria as string),
      status: result.status as
        | 'active'
        | 'mastered'
        | 'paused'
        | 'discontinued',
      priority: result.priority as 'high' | 'medium' | 'low',
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
      masteredAt: result.mastered_at
        ? new Date(result.mastered_at as number)
        : undefined,
    };
  }

  async getTherapyGoals(): Promise<TherapyGoal[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapy_goals ORDER BY created_at DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      patientId: result.patient_id as string,
      therapistId: result.therapist_id as string,
      therapyType: result.therapy_type as 'ABA' | 'Speech' | 'OT',
      title: result.title as string,
      description: result.description as string,
      category: result.category as string,
      subcategory: result.subcategory as string | undefined,
      targetBehavior: result.target_behavior as string,
      measurementCriteria: result.measurement_criteria as string,
      baselineData: JSON.parse(result.baseline_data as string),
      targetData: JSON.parse(result.target_data as string),
      currentProgress: JSON.parse(result.current_progress as string),
      masteryCriteria: JSON.parse(result.mastery_criteria as string),
      status: result.status as
        | 'active'
        | 'mastered'
        | 'paused'
        | 'discontinued',
      priority: result.priority as 'high' | 'medium' | 'low',
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
      masteredAt: result.mastered_at
        ? new Date(result.mastered_at as number)
        : undefined,
    }));
  }

  async updateTherapyGoal(goalId: string, goal: TherapyGoal): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE therapy_goals 
      SET patient_id = ?, therapist_id = ?, therapy_type = ?, title = ?, 
          description = ?, category = ?, subcategory = ?, target_behavior = ?, 
          measurement_criteria = ?, baseline_data = ?, target_data = ?, 
          current_progress = ?, mastery_criteria = ?, status = ?, priority = ?, 
          updated_at = ?, mastered_at = ?
      WHERE id = ?
    `;

    await this.db.runAsync(query, [
      goal.patientId,
      goal.therapistId,
      goal.therapyType,
      goal.title,
      goal.description,
      goal.category,
      goal.subcategory || null,
      goal.targetBehavior,
      goal.measurementCriteria,
      JSON.stringify(goal.baselineData),
      JSON.stringify(goal.targetData),
      JSON.stringify(goal.currentProgress),
      JSON.stringify(goal.masteryCriteria),
      goal.status,
      goal.priority,
      goal.updatedAt.getTime(),
      goal.masteredAt?.getTime() || null,
      goalId,
    ]);
  }

  async createTherapyTask(task: TherapyTask): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO therapy_tasks (
        id, goal_id, title, description, instructions, materials, 
        difficulty, estimated_duration, skills, prerequisites, adaptations,
        data_collection, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      task.id,
      task.goalId,
      task.title,
      task.description,
      JSON.stringify(task.instructions),
      JSON.stringify(task.materials),
      task.difficulty,
      task.estimatedDuration,
      JSON.stringify(task.skills),
      JSON.stringify(task.prerequisites),
      JSON.stringify(task.adaptations),
      JSON.stringify(task.dataCollection),
      task.isActive,
      task.createdAt.getTime(),
      task.updatedAt.getTime(),
    ]);
  }

  async getTherapyTask(taskId: string): Promise<TherapyTask | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapy_tasks WHERE id = ?`;
    const result = (await this.db.getFirstAsync(query, [taskId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      goalId: result.goal_id as string,
      title: result.title as string,
      description: result.description as string,
      instructions: JSON.parse(result.instructions as string),
      materials: JSON.parse(result.materials as string),
      difficulty: result.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedDuration: result.estimated_duration as number,
      skills: JSON.parse(result.skills as string),
      prerequisites: JSON.parse(result.prerequisites as string),
      adaptations: JSON.parse(result.adaptations as string),
      dataCollection: JSON.parse(result.data_collection as string),
      isActive: result.is_active as boolean,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async getTherapyTasks(): Promise<TherapyTask[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapy_tasks ORDER BY created_at DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      goalId: result.goal_id as string,
      title: result.title as string,
      description: result.description as string,
      instructions: JSON.parse(result.instructions as string),
      materials: JSON.parse(result.materials as string),
      difficulty: result.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedDuration: result.estimated_duration as number,
      skills: JSON.parse(result.skills as string),
      prerequisites: JSON.parse(result.prerequisites as string),
      adaptations: JSON.parse(result.adaptations as string),
      dataCollection: JSON.parse(result.data_collection as string),
      isActive: result.is_active as boolean,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async updateTherapyTask(taskId: string, task: TherapyTask): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE therapy_tasks 
      SET goal_id = ?, title = ?, description = ?, instructions = ?, 
          materials = ?, difficulty = ?, estimated_duration = ?, 
          skills = ?, prerequisites = ?, adaptations = ?, data_collection = ?, 
          is_active = ?, updated_at = ?
      WHERE id = ?
    `;

    await this.db.runAsync(query, [
      task.goalId,
      task.title,
      task.description,
      JSON.stringify(task.instructions),
      JSON.stringify(task.materials),
      task.difficulty,
      task.estimatedDuration,
      JSON.stringify(task.skills),
      JSON.stringify(task.prerequisites),
      JSON.stringify(task.adaptations),
      JSON.stringify(task.dataCollection),
      task.isActive,
      task.updatedAt.getTime(),
      taskId,
    ]);
  }

  async createTherapySession(session: TherapySession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO therapy_sessions (
        id, patient_id, therapist_id, session_date, duration, goals, 
        tasks, activities, notes, data, recommendations, next_session_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      session.id,
      session.patientId,
      session.therapistId,
      session.sessionDate.getTime(),
      session.duration,
      JSON.stringify(session.goals),
      JSON.stringify(session.tasks),
      JSON.stringify(session.activities),
      session.notes,
      JSON.stringify(session.data),
      JSON.stringify(session.recommendations),
      session.nextSessionDate?.getTime() || null,
      session.createdAt.getTime(),
      session.updatedAt.getTime(),
    ]);
  }

  async getTherapySession(sessionId: string): Promise<TherapySession | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapy_sessions WHERE id = ?`;
    const result = (await this.db.getFirstAsync(query, [sessionId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      patientId: result.patient_id as string,
      therapistId: result.therapist_id as string,
      sessionDate: new Date(result.session_date as number),
      duration: result.duration as number,
      goals: JSON.parse(result.goals as string),
      tasks: JSON.parse(result.tasks as string),
      activities: JSON.parse(result.activities as string),
      notes: result.notes as string,
      data: JSON.parse(result.data as string),
      recommendations: JSON.parse(result.recommendations as string),
      nextSessionDate: result.next_session_date
        ? new Date(result.next_session_date as number)
        : undefined,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    };
  }

  async getTherapySessions(): Promise<TherapySession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM therapy_sessions ORDER BY session_date DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      patientId: result.patient_id as string,
      therapistId: result.therapist_id as string,
      sessionDate: new Date(result.session_date as number),
      duration: result.duration as number,
      goals: JSON.parse(result.goals as string),
      tasks: JSON.parse(result.tasks as string),
      activities: JSON.parse(result.activities as string),
      notes: result.notes as string,
      data: JSON.parse(result.data as string),
      recommendations: JSON.parse(result.recommendations as string),
      nextSessionDate: result.next_session_date
        ? new Date(result.next_session_date as number)
        : undefined,
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async updateTherapySession(
    sessionId: string,
    session: TherapySession
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE therapy_sessions 
      SET patient_id = ?, therapist_id = ?, session_date = ?, duration = ?, 
          goals = ?, tasks = ?, activities = ?, notes = ?, data = ?, 
          recommendations = ?, next_session_date = ?, updated_at = ?
      WHERE id = ?
    `;

    await this.db.runAsync(query, [
      session.patientId,
      session.therapistId,
      session.sessionDate.getTime(),
      session.duration,
      JSON.stringify(session.goals),
      JSON.stringify(session.tasks),
      JSON.stringify(session.activities),
      session.notes,
      JSON.stringify(session.data),
      JSON.stringify(session.recommendations),
      session.nextSessionDate?.getTime() || null,
      session.updatedAt.getTime(),
      sessionId,
    ]);
  }

  async createProgressReport(report: ProgressReport): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO progress_reports (
        id, patient_id, therapist_id, report_period, goals, summary, 
        recommendations, next_steps, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      report.id,
      report.patientId,
      report.therapistId,
      JSON.stringify(report.reportPeriod),
      JSON.stringify(report.goals),
      report.summary,
      JSON.stringify(report.recommendations),
      JSON.stringify(report.nextSteps),
      report.createdAt.getTime(),
    ]);
  }

  async getProgressReport(reportId: string): Promise<ProgressReport | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM progress_reports WHERE id = ?`;
    const result = (await this.db.getFirstAsync(query, [reportId])) as any;

    if (!result) return null;

    return {
      id: result.id as string,
      patientId: result.patient_id as string,
      therapistId: result.therapist_id as string,
      reportPeriod: JSON.parse(result.report_period as string),
      goals: JSON.parse(result.goals as string),
      summary: result.summary as string,
      recommendations: JSON.parse(result.recommendations as string),
      nextSteps: JSON.parse(result.next_steps as string),
      createdAt: new Date(result.created_at as number),
    };
  }

  async getProgressReports(): Promise<ProgressReport[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM progress_reports ORDER BY created_at DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      patientId: result.patient_id as string,
      therapistId: result.therapist_id as string,
      reportPeriod: JSON.parse(result.report_period as string),
      goals: JSON.parse(result.goals as string),
      summary: result.summary as string,
      recommendations: JSON.parse(result.recommendations as string),
      nextSteps: JSON.parse(result.next_steps as string),
      createdAt: new Date(result.created_at as number),
    }));
  }

  async updateProgressReport(
    reportId: string,
    report: ProgressReport
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE progress_reports 
      SET patient_id = ?, therapist_id = ?, report_period = ?, goals = ?, 
          summary = ?, recommendations = ?, next_steps = ?
      WHERE id = ?
    `;

    await this.db.runAsync(query, [
      report.patientId,
      report.therapistId,
      JSON.stringify(report.reportPeriod),
      JSON.stringify(report.goals),
      report.summary,
      JSON.stringify(report.recommendations),
      JSON.stringify(report.nextSteps),
      reportId,
    ]);
  }

  async createPatient(patient: PatientProfile): Promise<void> {
    // For now, this will create a child profile
    await this.createChildProfile(patient as any);
  }

  async getPatient(patientId: string): Promise<PatientProfile | null> {
    // For now, this will get a child profile
    return await this.getChildProfile(patientId);
  }

  async getPatients(): Promise<PatientProfile[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM child_profiles ORDER BY created_at DESC`;
    const results = (await this.db.getAllAsync(query)) as any[];

    return results.map((result: any) => ({
      id: result.id as string,
      name: result.name as string,
      dateOfBirth: new Date(result.date_of_birth as number),
      diagnosis: JSON.parse(result.diagnosis as string),
      therapyTypes: JSON.parse(result.therapy_types as string),
      communicationLevel: result.communication_level as any,
      cognitiveLevel: result.cognitive_level as any,
      motorLevel: result.motor_level as any,
      sensoryProfile: JSON.parse(result.sensory_profile as string),
      interests: JSON.parse(result.interests as string),
      strengths: JSON.parse(result.strengths as string),
      challenges: JSON.parse(result.challenges as string),
      goals: JSON.parse(result.goals as string),
      therapists: JSON.parse(result.therapists as string),
      parents: JSON.parse(result.parents as string),
      currentGoals: JSON.parse(result.current_goals as string),
      createdAt: new Date(result.created_at as number),
      updatedAt: new Date(result.updated_at as number),
    }));
  }

  async updatePatient(
    patientId: string,
    patient: PatientProfile
  ): Promise<void> {
    // For now, this will update a child profile
    await this.updateChildProfile(patientId, patient as any);
  }

  async updateChildProfile(
    userId: string,
    profile: ChildProfile
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE child_profiles 
      SET name = ?, date_of_birth = ?, diagnosis = ?, therapy_types = ?, 
          communication_level = ?, cognitive_level = ?, motor_level = ?, 
          sensory_profile = ?, interests = ?, strengths = ?, challenges = ?, 
          goals = ?, therapists = ?, parents = ?, current_goals = ?, updated_at = ?
      WHERE user_id = ?
    `;

    await this.db.runAsync(query, [
      profile.name,
      profile.dateOfBirth.getTime(),
      JSON.stringify(profile.diagnosis),
      JSON.stringify(profile.therapyTypes),
      profile.communicationLevel,
      profile.cognitiveLevel,
      profile.motorLevel,
      JSON.stringify(profile.sensoryProfile),
      JSON.stringify(profile.interests),
      JSON.stringify(profile.strengths),
      JSON.stringify(profile.challenges),
      JSON.stringify(profile.goals),
      JSON.stringify(profile.therapists),
      JSON.stringify(profile.parents),
      JSON.stringify(profile.currentGoals),
      profile.updatedAt.getTime(),
      userId,
    ]);
  }

  // Favorites methods
  async addFavorite(userId: string, symbolId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `fav-${userId}-${symbolId}`;
    const addedAt = Date.now();

    await this.db.runAsync(
      `INSERT OR REPLACE INTO ${DATABASE_TABLES.FAVORITES} (id, user_id, symbol_id, added_at) VALUES (?, ?, ?, ?)`,
      [id, userId, symbolId, addedAt]
    );
  }

  async removeFavorite(userId: string, symbolId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `DELETE FROM ${DATABASE_TABLES.FAVORITES} WHERE user_id = ? AND symbol_id = ?`,
      [userId, symbolId]
    );
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT symbol_id FROM ${DATABASE_TABLES.FAVORITES} WHERE user_id = ? ORDER BY added_at DESC`;
    const results = (await this.db.getAllAsync(query, [userId])) as any[];

    return results.map((result: any) => result.symbol_id as string);
  }

  async isFavorite(userId: string, symbolId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT 1 FROM ${DATABASE_TABLES.FAVORITES} WHERE user_id = ? AND symbol_id = ? LIMIT 1`;
    const result = (await this.db.getFirstAsync(query, [
      userId,
      symbolId,
    ])) as any;

    return !!result;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default DatabaseService.getInstance();
