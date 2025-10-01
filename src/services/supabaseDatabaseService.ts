// Supabase Database Service for Ausmo AAC App

import {
  supabase,
  TABLES,
  STORAGE_BUCKETS,
  SUPABASE_URL,
} from '../config/supabase';
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
  TherapistProfile,
  ParentProfile,
  ChildProfile,
  TherapyGoal,
  TherapyTask,
  TherapySession,
  ProgressReport,
  PatientAssignmentRequest,
} from '../types';
import { STORAGE_KEYS } from '../constants';

export class SupabaseDatabaseService {
  private static instance: SupabaseDatabaseService;

  public static getInstance(): SupabaseDatabaseService {
    if (!SupabaseDatabaseService.instance) {
      SupabaseDatabaseService.instance = new SupabaseDatabaseService();
    }
    return SupabaseDatabaseService.instance;
  }

  // Generate a UUID v4
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Initialize database (check connection)
  async initialize(): Promise<void> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl === 'https://your-project.supabase.co' ||
        supabaseAnonKey === 'your-anon-key'
      ) {
        console.warn('⚠️ Supabase not configured - using local database only');
        return;
      }

      // Log which Supabase URL is being used so we can confirm env values are applied
      console.log('🔗 Using Supabase URL:', SUPABASE_URL);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Database connection timeout')),
          5000
        ); // 5 second timeout
      });

      const connectionPromise = supabase
        .from(TABLES.USERS)
        .select('count')
        .limit(1);

      const { data, error } = (await Promise.race([
        connectionPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.warn(
          '⚠️ Supabase connection failed - using local database only:',
          error.message
        );
        return; // Don't throw, just fall back to local database
      }
      console.log('✅ Supabase database initialized successfully');
    } catch (error) {
      console.warn(
        '⚠️ Supabase initialization failed - using local database only:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      // Don't throw error, just fall back to local database
    }
  }

  // User operations
  async createUser(user: User): Promise<void> {
    // Generate a proper UUID for the user if it doesn't have one
    const userId =
      user.id && user.id.length > 10 ? user.id : this.generateUUID();

    const { error } = await supabase.from(TABLES.USERS).insert({
      id: userId,
      name: user.name,
      photo: user.photo,
      settings: user.settings,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    });

    if (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Get user error:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email || '',
      photo: data.photo,
      role: data.role || 'child', // Add role property with default
      settings: data.settings,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getAllUsers(): Promise<User[]> {
    // Check if Supabase is configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl === 'https://your-project.supabase.co' ||
      supabaseAnonKey === 'your-anon-key'
    ) {
      console.warn('⚠️ Supabase not configured - returning empty users array');
      return [];
    }

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get all users error:', error);
      throw error;
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email || '',
      photo: user.photo,
      role: user.role || 'child', // Add role property with default
      settings: user.settings,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }));
  }

  async updateUser(user: User): Promise<void> {
    const { error } = await supabase
      .from(TABLES.USERS)
      .update({
        name: user.name,
        photo: user.photo,
        settings: user.settings,
        updated_at: user.updatedAt.toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from(TABLES.USERS).delete().eq('id', id);

    if (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Communication Book operations
  async createBook(book: CommunicationBook): Promise<void> {
    // Generate a proper UUID for the book if it doesn't have one
    const bookId =
      book.id && book.id.length > 10 ? book.id : this.generateUUID();

    console.log('Creating book with ID:', bookId);
    console.log('Book data:', book);

    const { error } = await supabase.from(TABLES.COMMUNICATION_BOOKS).insert({
      id: bookId,
      name: book.name,
      description: book.description,
      category: book.category,
      user_id: book.userId,
      pages: book.pages,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
      is_template: book.isTemplate,
      is_shared: book.isShared,
    });

    if (error) {
      console.error('Create book error:', error);
      throw error;
    }

    console.log('Book created successfully in database');
  }

  async getBook(id: string): Promise<CommunicationBook | null> {
    const { data, error } = await supabase
      .from(TABLES.COMMUNICATION_BOOKS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Get book error:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      title: data.title || data.name, // Use title if available, fallback to name
      description: data.description,
      category: data.category,
      userId: data.user_id,
      pages: data.pages,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isTemplate: data.is_template,
      isShared: data.is_shared,
    };
  }

  async getBooksByUser(userId: string): Promise<CommunicationBook[]> {
    console.log('Getting books for user:', userId);

    // Check if Supabase is configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl === 'https://your-project.supabase.co' ||
      supabaseAnonKey === 'your-anon-key'
    ) {
      console.warn('⚠️ Supabase not configured - returning empty books array');
      return [];
    }

    const { data, error } = await supabase
      .from(TABLES.COMMUNICATION_BOOKS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get books by user error:', error);
      throw error;
    }

    console.log('Raw books data from database:', data);

    const books = data.map(book => ({
      id: book.id,
      name: book.name,
      title: book.title || book.name, // Use title if available, fallback to name
      description: book.description,
      category: book.category,
      userId: book.user_id,
      pages: book.pages,
      createdAt: new Date(book.created_at),
      updatedAt: new Date(book.updated_at),
      isTemplate: book.is_template,
      isShared: book.is_shared,
    }));

    console.log('Processed books:', books);
    return books;
  }

  async updateBook(book: CommunicationBook): Promise<void> {
    const { error } = await supabase
      .from(TABLES.COMMUNICATION_BOOKS)
      .update({
        name: book.name,
        description: book.description,
        category: book.category,
        pages: book.pages,
        updated_at: book.updatedAt.toISOString(),
        is_template: book.isTemplate,
        is_shared: book.isShared,
      })
      .eq('id', book.id);

    if (error) {
      console.error('Update book error:', error);
      throw error;
    }
  }

  async deleteBook(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.COMMUNICATION_BOOKS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete book error:', error);
      throw error;
    }
  }

  // Page operations
  async getPage(pageId: string): Promise<CommunicationPage | null> {
    // First, find the page in any book
    const { data: books, error: booksError } = await supabase
      .from(TABLES.COMMUNICATION_BOOKS)
      .select('pages')
      .not('pages', 'is', null);

    if (booksError) {
      console.error('Get books for page search error:', booksError);
      throw booksError;
    }

    // Search through all books to find the page
    for (const book of books) {
      if (book.pages && Array.isArray(book.pages)) {
        const page = book.pages.find((p: any) => p.id === pageId);
        if (page) {
          // Convert the page data to proper format
          return {
            id: page.id,
            bookId: page.bookId || '',
            name: page.name,
            type: page.type,
            layout: page.layout,
            buttons: page.buttons || [],
            backgroundImage: page.backgroundImage,
            backgroundColor: page.backgroundColor || '#FFFFFF',
            order: page.order || 0,
            createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
            updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          };
        }
      }
    }

    return null;
  }

  // Message operations
  async createMessage(message: Message): Promise<void> {
    // Generate a proper UUID for the message if it doesn't have one
    const messageId =
      message.id && message.id.length > 10 ? message.id : this.generateUUID();

    const { error } = await supabase.from(TABLES.MESSAGES).insert({
      id: messageId,
      text: message.text,
      audio_file: message.audioFile,
      tts_voice: message.ttsVoice,
      category: message.category,
      user_id: message.userId,
      usage_count: message.usageCount,
      last_used: message.lastUsed?.toISOString(),
      created_at: message.createdAt.toISOString(),
      updated_at: message.updatedAt.toISOString(),
    });

    if (error) {
      console.error('Create message error:', error);
      throw error;
    }
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from(TABLES.MESSAGES)
      .select('*')
      .eq('user_id', userId)
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get messages by user error:', error);
      throw error;
    }

    return data.map(message => ({
      id: message.id,
      text: message.text,
      audioFile: message.audio_file,
      ttsVoice: message.tts_voice,
      category: message.category,
      userId: message.user_id,
      usageCount: message.usage_count,
      lastUsed: message.last_used ? new Date(message.last_used) : undefined,
      createdAt: new Date(message.created_at),
      updatedAt: new Date(message.updated_at),
    }));
  }

  async updateMessageUsage(messageId: string): Promise<void> {
    // First get the current usage count
    const { data: currentMessage, error: fetchError } = await supabase
      .from(TABLES.MESSAGES)
      .select('usage_count')
      .eq('id', messageId)
      .single();

    if (fetchError) {
      console.error('Fetch message error:', fetchError);
      throw fetchError;
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from(TABLES.MESSAGES)
      .update({
        usage_count: (currentMessage.usage_count || 0) + 1,
        last_used: now,
        updated_at: now,
      })
      .eq('id', messageId);

    if (error) {
      console.error('Update message usage error:', error);
      throw error;
    }
  }

  // Symbol operations
  async createSymbol(symbol: Symbol): Promise<void> {
    // Generate a proper UUID for the symbol if it doesn't have one
    const symbolId =
      symbol.id && symbol.id.length > 10 ? symbol.id : this.generateUUID();

    const { error } = await supabase.from(TABLES.SYMBOLS).insert({
      id: symbolId,
      name: symbol.name,
      category: symbol.category,
      image: symbol.image,
      keywords: symbol.keywords,
      is_built_in: symbol.isBuiltIn,
      created_at: symbol.createdAt.toISOString(),
      updated_at: symbol.updatedAt.toISOString(),
    });

    if (error) {
      console.error('Create symbol error:', error);
      throw error;
    }
  }

  async getSymbolsByCategory(category: string): Promise<Symbol[]> {
    const { data, error } = await supabase
      .from(TABLES.SYMBOLS)
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error('Get symbols by category error:', error);
      throw error;
    }

    return data.map(symbol => ({
      id: symbol.id,
      name: symbol.name,
      category: symbol.category,
      image: symbol.image,
      keywords: symbol.keywords,
      isBuiltIn: symbol.is_built_in,
      createdAt: new Date(symbol.created_at),
      updatedAt: new Date(symbol.updated_at),
    }));
  }

  async searchSymbols(searchTerm: string): Promise<Symbol[]> {
    const { data, error } = await supabase
      .from(TABLES.SYMBOLS)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`)
      .order('name');

    if (error) {
      console.error('Search symbols error:', error);
      throw error;
    }

    return data.map(symbol => ({
      id: symbol.id,
      name: symbol.name,
      category: symbol.category,
      image: symbol.image,
      keywords: symbol.keywords,
      isBuiltIn: symbol.is_built_in,
      createdAt: new Date(symbol.created_at),
      updatedAt: new Date(symbol.updated_at),
    }));
  }

  // Analytics operations
  async createAnalyticsEntry(analytics: UsageAnalytics): Promise<void> {
    const { error } = await supabase.from(TABLES.USAGE_ANALYTICS).insert({
      id: `${analytics.userId}_${analytics.date.getTime()}`,
      user_id: analytics.userId,
      date: analytics.date.toISOString().split('T')[0], // Date only
      messages_spoken: analytics.messagesSpoken,
      pages_viewed: analytics.pagesViewed,
      session_duration: analytics.sessionDuration,
      most_used_buttons: analytics.mostUsedButtons,
      vocabulary_growth: analytics.vocabularyGrowth,
    });

    if (error) {
      console.error('Create analytics entry error:', error);
      throw error;
    }
  }

  async getAnalyticsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<UsageAnalytics[]> {
    let query = supabase
      .from(TABLES.USAGE_ANALYTICS)
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Get analytics by user error:', error);
      throw error;
    }

    return data.map(analytics => ({
      userId: analytics.user_id,
      date: new Date(analytics.date),
      messagesSpoken: analytics.messages_spoken,
      pagesViewed: analytics.pages_viewed,
      sessionDuration: analytics.session_duration,
      mostUsedButtons: analytics.most_used_buttons,
      vocabularyGrowth: analytics.vocabulary_growth,
    }));
  }

  // Synced Button operations
  async createSyncedButton(button: SyncedButton): Promise<void> {
    const { error } = await supabase.from('synced_buttons').insert({
      id: button.id,
      text: button.text, // Use text instead of name
      image: button.image,
      tts_message: button.ttsMessage,
      action: button.action,
      background_color: button.backgroundColor,
      text_color: button.textColor,
      border_color: button.borderColor,
      border_width: button.borderWidth,
      border_radius: button.borderRadius,
      size: button.size,
      category: button.category,
      tags: button.tags,
      is_visible: button.isVisible,
      usage_count: button.usageCount,
      user_id: button.userId,
      created_at: button.createdAt.toISOString(),
      updated_at: button.updatedAt.toISOString(),
    });

    if (error) {
      console.error('Error creating synced button:', error);
      throw error;
    }
  }

  async getSyncedButtons(userId: string): Promise<SyncedButton[]> {
    const { data, error } = await supabase
      .from('synced_buttons')
      .select('*')
      .eq('user_id', userId)
      .order('text', { ascending: true });

    if (error) {
      console.error('Error getting synced buttons:', error);
      throw error;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.text, // Use text as name since name column might not exist
      text: row.text,
      image: row.image,
      ttsMessage: row.tts_message,
      action: row.action,
      backgroundColor: row.background_color,
      textColor: row.text_color,
      borderColor: row.border_color,
      borderWidth: row.border_width,
      borderRadius: row.border_radius,
      size: row.size,
      category: row.category,
      tags: row.tags,
      isVisible: row.is_visible,
      usageCount: row.usage_count,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getSyncedButton(buttonId: string): Promise<SyncedButton | null> {
    const { data, error } = await supabase
      .from('synced_buttons')
      .select('*')
      .eq('id', buttonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      console.error('Error getting synced button:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.text, // Use text as name since name column doesn't exist
      text: data.text,
      image: data.image,
      ttsMessage: data.tts_message,
      action: data.action,
      backgroundColor: data.background_color,
      textColor: data.text_color,
      borderColor: data.border_color,
      borderWidth: data.border_width,
      borderRadius: data.border_radius,
      size: data.size,
      category: data.category,
      tags: data.tags,
      isVisible: data.is_visible,
      usageCount: data.usage_count,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateSyncedButton(
    buttonId: string,
    updates: Partial<SyncedButton>
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Skip name updates since name column doesn't exist
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.ttsMessage !== undefined)
      updateData.tts_message = updates.ttsMessage;
    if (updates.action !== undefined) updateData.action = updates.action;
    if (updates.backgroundColor !== undefined)
      updateData.background_color = updates.backgroundColor;
    if (updates.textColor !== undefined)
      updateData.text_color = updates.textColor;
    if (updates.borderColor !== undefined)
      updateData.border_color = updates.borderColor;
    if (updates.borderWidth !== undefined)
      updateData.border_width = updates.borderWidth;
    if (updates.borderRadius !== undefined)
      updateData.border_radius = updates.borderRadius;
    if (updates.size !== undefined) updateData.size = updates.size;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isVisible !== undefined)
      updateData.is_visible = updates.isVisible;
    if (updates.usageCount !== undefined)
      updateData.usage_count = updates.usageCount;

    const { error } = await supabase
      .from('synced_buttons')
      .update(updateData)
      .eq('id', buttonId);

    if (error) {
      console.error('Error updating synced button:', error);
      throw error;
    }
  }

  async deleteSyncedButton(buttonId: string): Promise<void> {
    const { error } = await supabase
      .from('synced_buttons')
      .delete()
      .eq('id', buttonId);

    if (error) {
      console.error('Error deleting synced button:', error);
      throw error;
    }
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
    // Clear existing data (in reverse order due to foreign key constraints)
    await supabase.from(TABLES.USAGE_ANALYTICS).delete().neq('id', '');
    await supabase.from(TABLES.MESSAGES).delete().neq('id', '');
    await supabase.from(TABLES.COMMUNICATION_BUTTONS).delete().neq('id', '');
    await supabase.from(TABLES.COMMUNICATION_PAGES).delete().neq('id', '');
    await supabase.from(TABLES.COMMUNICATION_BOOKS).delete().neq('id', '');
    await supabase.from(TABLES.USERS).delete().neq('id', '');

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

  // Storage operations for file uploads
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      console.error('Upload file error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  // Cleanup (no-op for Supabase)
  async close(): Promise<void> {
    // Supabase client doesn't need explicit closing
    console.log('Supabase database service closed');
  }

  // HIPAA-Compliant Patient Assignment Methods

  // Search therapists (public information only)
  async searchTherapists(
    query: string,
    specialty?: string
  ): Promise<TherapistProfile[]> {
    try {
      let supabaseQuery = supabase
        .from('therapist_profiles')
        .select(
          `
          id,
          user_id,
          license_number,
          specialties,
          credentials,
          practice_name,
          practice_address,
          phone_number,
          email,
          is_verified,
          is_accepting_patients,
          max_patients,
          current_patients,
          created_at,
          updated_at
        `
        )
        .eq('is_accepting_patients', true)
        .or(
          `practice_name.ilike.%${query}%,credentials.ilike.%${query}%,specialties.cs.{${query}}`
        );

      if (specialty) {
        supabaseQuery = supabaseQuery.contains('specialties', [specialty]);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Search therapists error:', error);
        throw error;
      }

      return (data || []).map((therapist: any) => ({
        id: therapist.id,
        userId: therapist.user_id,
        name: therapist.practice_name || 'Unknown', // Add missing name property
        licenseNumber: therapist.license_number,
        specialties: therapist.specialties || [],
        credentials: therapist.credentials,
        practiceName: therapist.practice_name,
        practiceAddress: therapist.practice_address,
        phoneNumber: therapist.phone_number,
        email: therapist.email,
        isVerified: therapist.is_verified,
        isAcceptingPatients: therapist.is_accepting_patients,
        maxPatients: therapist.max_patients,
        currentPatientCount: therapist.current_patients,
        patients: [], // Add missing patients array
        caseload: therapist.current_patients || 0, // Add missing caseload
        experience: 0, // Add missing experience (default to 0)
        createdAt: new Date(therapist.created_at),
        updatedAt: new Date(therapist.updated_at),
      }));
    } catch (error) {
      console.error('Search therapists error:', error);
      throw error;
    }
  }

  // Get therapist profile
  async getTherapistProfile(therapistId: string): Promise<TherapistProfile> {
    try {
      const { data, error } = await supabase
        .from('therapist_profiles')
        .select('*')
        .eq('id', therapistId)
        .single();

      if (error) {
        console.error('Get therapist profile error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get therapist profile error:', error);
      throw error;
    }
  }

  // Get parent profile
  async getParentProfile(parentId: string): Promise<ParentProfile> {
    try {
      const { data, error } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('user_id', parentId)
        .single();

      if (error) {
        console.error('Get parent profile error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get parent profile error:', error);
      throw error;
    }
  }

  // Get child profile
  async getChildProfile(childId: string): Promise<ChildProfile> {
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', childId)
        .single();

      if (error) {
        console.error('Get child profile error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get child profile error:', error);
      throw error;
    }
  }

  // Create assignment request
  async createAssignmentRequest(
    request: PatientAssignmentRequest
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('patient_assignment_requests')
        .insert({
          id: request.id,
          parent_id: request.parentId,
          therapist_id: request.therapistId,
          child_id: request.childId,
          status: request.status,
          request_message: request.requestMessage,
          expires_at: request.expiresAt.toISOString(),
          created_at: request.createdAt.toISOString(),
          updated_at: request.updatedAt.toISOString(),
        });

      if (error) {
        console.error('Create assignment request error:', error);
        throw error;
      }

      // Log audit event
      await this.logAuditEvent(
        'assignment',
        request.id,
        'create',
        request.parentId,
        {
          therapist_id: request.therapistId,
          child_id: request.childId,
        }
      );
    } catch (error) {
      console.error('Create assignment request error:', error);
      throw error;
    }
  }

  // Get pending assignment request
  async getPendingAssignmentRequest(
    parentId: string,
    therapistId: string,
    childId: string
  ): Promise<PatientAssignmentRequest | null> {
    try {
      const { data, error } = await supabase
        .from('patient_assignment_requests')
        .select('*')
        .eq('parent_id', parentId)
        .eq('therapist_id', therapistId)
        .eq('child_id', childId)
        .eq('status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Get pending assignment request error:', error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        parentId: data.parent_id,
        therapistId: data.therapist_id,
        childId: data.child_id,
        status: data.status,
        requestMessage: data.request_message,
        therapistResponse: data.therapist_response,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        expiresAt: new Date(data.expires_at),
      };
    } catch (error) {
      console.error('Get pending assignment request error:', error);
      throw error;
    }
  }

  // Get therapist assignment requests
  async getTherapistAssignmentRequests(
    therapistId: string
  ): Promise<PatientAssignmentRequest[]> {
    try {
      const { data, error } = await supabase
        .from('patient_assignment_requests')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get therapist assignment requests error:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        parentId: item.parent_id,
        therapistId: item.therapist_id,
        childId: item.child_id,
        status: item.status,
        requestMessage: item.request_message,
        therapistResponse: item.therapist_response,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        expiresAt: new Date(item.expires_at),
      }));
    } catch (error) {
      console.error('Get therapist assignment requests error:', error);
      throw error;
    }
  }

  // Get parent assignment requests
  async getParentAssignmentRequests(
    parentId: string
  ): Promise<PatientAssignmentRequest[]> {
    try {
      const { data, error } = await supabase
        .from('patient_assignment_requests')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get parent assignment requests error:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        parentId: item.parent_id,
        therapistId: item.therapist_id,
        childId: item.child_id,
        status: item.status,
        requestMessage: item.request_message,
        therapistResponse: item.therapist_response,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        expiresAt: new Date(item.expires_at),
      }));
    } catch (error) {
      console.error('Get parent assignment requests error:', error);
      throw error;
    }
  }

  // Get assignment request
  async getAssignmentRequest(
    requestId: string
  ): Promise<PatientAssignmentRequest> {
    try {
      const { data, error } = await supabase
        .from('patient_assignment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) {
        console.error('Get assignment request error:', error);
        throw error;
      }

      return {
        id: data.id,
        parentId: data.parent_id,
        therapistId: data.therapist_id,
        childId: data.child_id,
        status: data.status,
        requestMessage: data.request_message,
        therapistResponse: data.therapist_response,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        expiresAt: new Date(data.expires_at),
      };
    } catch (error) {
      console.error('Get assignment request error:', error);
      throw error;
    }
  }

  // Update assignment request
  async updateAssignmentRequest(
    request: PatientAssignmentRequest
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('patient_assignment_requests')
        .update({
          status: request.status,
          therapist_response: request.therapistResponse,
          updated_at: request.updatedAt.toISOString(),
        })
        .eq('id', request.id);

      if (error) {
        console.error('Update assignment request error:', error);
        throw error;
      }

      // Log audit event
      await this.logAuditEvent(
        'assignment',
        request.id,
        'update',
        request.therapistId,
        {
          status: request.status,
          response: request.therapistResponse,
        }
      );
    } catch (error) {
      console.error('Update assignment request error:', error);
      throw error;
    }
  }

  // Add patient to therapist
  async addPatientToTherapist(
    therapistId: string,
    childId: string
  ): Promise<void> {
    try {
      const therapist = await this.getTherapistProfile(therapistId);
      const currentPatients = therapist.currentPatients || [];

      if (!currentPatients.includes(childId)) {
        const { error } = await supabase
          .from('therapist_profiles')
          .update({
            current_patients: [...currentPatients, childId],
          })
          .eq('id', therapistId);

        if (error) {
          console.error('Add patient to therapist error:', error);
          throw error;
        }

        // Log audit event
        await this.logAuditEvent(
          'therapist',
          therapistId,
          'add_patient',
          undefined,
          {
            child_id: childId,
          }
        );
      }
    } catch (error) {
      console.error('Add patient to therapist error:', error);
      throw error;
    }
  }

  // Add therapist to child
  async addTherapistToChild(
    childId: string,
    therapistId: string
  ): Promise<void> {
    try {
      const child = await this.getChildProfile(childId);
      const currentTherapists = child.currentTherapists || [];

      if (!currentTherapists.includes(therapistId)) {
        const { error } = await supabase
          .from('child_profiles')
          .update({
            current_therapists: [...currentTherapists, therapistId],
          })
          .eq('user_id', childId);

        if (error) {
          console.error('Add therapist to child error:', error);
          throw error;
        }

        // Log audit event
        await this.logAuditEvent('child', childId, 'add_therapist', undefined, {
          therapist_id: therapistId,
        });
      }
    } catch (error) {
      console.error('Add therapist to child error:', error);
      throw error;
    }
  }

  // Remove patient from therapist
  async removePatientFromTherapist(
    therapistId: string,
    childId: string
  ): Promise<void> {
    try {
      const therapist = await this.getTherapistProfile(therapistId);
      const currentPatients = therapist.currentPatients || [];
      const updatedPatients = currentPatients.filter(id => id !== childId);

      const { error } = await supabase
        .from('therapist_profiles')
        .update({
          current_patients: updatedPatients,
        })
        .eq('id', therapistId);

      if (error) {
        console.error('Remove patient from therapist error:', error);
        throw error;
      }

      // Log audit event
      await this.logAuditEvent(
        'therapist',
        therapistId,
        'remove_patient',
        undefined,
        {
          child_id: childId,
        }
      );
    } catch (error) {
      console.error('Remove patient from therapist error:', error);
      throw error;
    }
  }

  // Remove therapist from child
  async removeTherapistFromChild(
    childId: string,
    therapistId: string
  ): Promise<void> {
    try {
      const child = await this.getChildProfile(childId);
      const currentTherapists = child.currentTherapists || [];
      const updatedTherapists = currentTherapists.filter(
        id => id !== therapistId
      );

      const { error } = await supabase
        .from('child_profiles')
        .update({
          current_therapists: updatedTherapists,
        })
        .eq('user_id', childId);

      if (error) {
        console.error('Remove therapist from child error:', error);
        throw error;
      }

      // Log audit event
      await this.logAuditEvent(
        'child',
        childId,
        'remove_therapist',
        undefined,
        {
          therapist_id: therapistId,
        }
      );
    } catch (error) {
      console.error('Remove therapist from child error:', error);
      throw error;
    }
  }

  // Log patient-therapist removal
  async logPatientTherapistRemoval(
    therapistId: string,
    childId: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.logAuditEvent(
        'patient_therapist',
        `${therapistId}_${childId}`,
        'remove_relationship',
        undefined,
        {
          therapist_id: therapistId,
          child_id: childId,
          reason: reason,
        }
      );
    } catch (error) {
      console.error('Log patient-therapist removal error:', error);
      throw error;
    }
  }

  // Get audit log
  async getAuditLog(
    entityType: string,
    entityId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get audit log error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get audit log error:', error);
      throw error;
    }
  }

  // Log audit event
  async logAuditEvent(
    entityType: string,
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('audit_log').insert({
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        user_id: userId,
        details: details,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      if (error) {
        console.error('Log audit event error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Log audit event error:', error);
      throw error;
    }
  }

  // Therapist Request operations
  async createTherapistRequest(request: any): Promise<void> {
    const { error } = await supabase.from('therapist_requests').insert({
      id: request.id,
      patient_id: request.patientId,
      therapist_id: request.therapistId,
      patient_name: request.patientName,
      therapist_name: request.therapistName,
      message: request.message,
      status: request.status,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
    });

    if (error) {
      console.error('Create therapist request error:', error);
      throw error;
    }
  }

  async getTherapistRequests(therapistId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('therapist_requests')
      .select('*')
      .eq('therapist_id', therapistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get therapist requests error:', error);
      throw error;
    }

    return data.map(request => ({
      id: request.id,
      patientId: request.patient_id,
      therapistId: request.therapist_id,
      patientName: request.patient_name,
      therapistName: request.therapist_name,
      message: request.message,
      status: request.status,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
    }));
  }

  async updateTherapistRequest(request: any): Promise<void> {
    const { error } = await supabase
      .from('therapist_requests')
      .update({
        status: request.status,
        updated_at: request.updatedAt,
      })
      .eq('id', request.id);

    if (error) {
      console.error('Update therapist request error:', error);
      throw error;
    }
  }

  async createTherapistPatientRelationship(relationship: any): Promise<void> {
    const { error } = await supabase
      .from('therapist_patient_relationships')
      .insert({
        id: relationship.id,
        therapist_id: relationship.therapistId,
        patient_id: relationship.patientId,
        therapist_name: relationship.therapistName,
        patient_name: relationship.patientName,
        status: relationship.status,
        created_at: relationship.createdAt,
        updated_at: relationship.updatedAt,
      });

    if (error) {
      console.error('Create therapist-patient relationship error:', error);
      throw error;
    }
  }
}
export default SupabaseDatabaseService.getInstance();
