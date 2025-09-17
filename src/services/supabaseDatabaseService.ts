// Supabase Database Service for Ausmo AAC App

import { supabase, TABLES, STORAGE_BUCKETS } from '../config/supabase';
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Initialize database (check connection)
  async initialize(): Promise<void> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          supabaseAnonKey === 'your-anon-key') {
        console.warn('⚠️ Supabase not configured - using local database only');
        return;
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 10000); // 10 second timeout
      });

      const connectionPromise = supabase.from(TABLES.USERS).select('count').limit(1);
      
      const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Supabase connection error:', error);
        throw error;
      }
      console.log('Supabase database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  // User operations
  async createUser(user: User): Promise<void> {
    // Generate a proper UUID for the user if it doesn't have one
    const userId = user.id && user.id.length > 10 ? user.id : this.generateUUID();
    
    const { error } = await supabase
      .from(TABLES.USERS)
      .insert({
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
      settings: data.settings,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getAllUsers(): Promise<User[]> {
    // Check if Supabase is configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseAnonKey === 'your-anon-key') {
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
    const { error } = await supabase
      .from(TABLES.USERS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Communication Book operations
  async createBook(book: CommunicationBook): Promise<void> {
    // Generate a proper UUID for the book if it doesn't have one
    const bookId = book.id && book.id.length > 10 ? book.id : this.generateUUID();
    
    console.log('Creating book with ID:', bookId);
    console.log('Book data:', book);
    
    const { error } = await supabase
      .from(TABLES.COMMUNICATION_BOOKS)
      .insert({
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
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseAnonKey === 'your-anon-key') {
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
    const messageId = message.id && message.id.length > 10 ? message.id : this.generateUUID();
    
    const { error } = await supabase
      .from(TABLES.MESSAGES)
      .insert({
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
    const symbolId = symbol.id && symbol.id.length > 10 ? symbol.id : this.generateUUID();
    
    const { error } = await supabase
      .from(TABLES.SYMBOLS)
      .insert({
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
    const { error } = await supabase
      .from(TABLES.USAGE_ANALYTICS)
      .insert({
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

  async getAnalyticsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<UsageAnalytics[]> {
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
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Set app settings error:', error);
      throw error;
    }
  }

  // Storage operations for file uploads
  async uploadFile(bucket: string, path: string, file: File | Blob): Promise<string> {
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
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

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
}

export default SupabaseDatabaseService.getInstance();
