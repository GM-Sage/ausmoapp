// Supabase Configuration for Ausmo AAC App

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage buckets configuration
export const STORAGE_BUCKETS = {
  USER_PHOTOS: 'user-photos',
  COMMUNICATION_BOOKS: 'communication-books',
  SYMBOLS: 'symbols',
  AUDIO_FILES: 'audio-files',
  BACKUPS: 'backups',
  TEMPLATES: 'templates',
} as const;

// Database tables
export const TABLES = {
  USERS: 'users',
  COMMUNICATION_BOOKS: 'communication_books',
  COMMUNICATION_PAGES: 'communication_pages',
  COMMUNICATION_BUTTONS: 'communication_buttons',
  MESSAGES: 'messages',
  SYMBOLS: 'symbols',
  USAGE_ANALYTICS: 'usage_analytics',
  HOTSPOTS: 'hotspots',
  EXPRESS_SENTENCES: 'express_sentences',
  TEMPLATES: 'templates',
  COLLABORATION_SESSIONS: 'collaboration_sessions',
  COLLABORATION_PARTICIPANTS: 'collaboration_participants',
  EDUCATIONAL_GOALS: 'educational_goals',
  LEARNING_ACTIVITIES: 'learning_activities',
  ASSESSMENTS: 'assessments',
  SECURITY_LOGS: 'security_logs',
  PARENTAL_CONSENTS: 'parental_consents',
} as const;

// RLS (Row Level Security) policies
export const RLS_POLICIES = {
  // Users can only access their own data
  USERS_OWN_DATA: 'Users can only access their own user data',
  BOOKS_OWN_DATA: 'Users can only access their own communication books',
  MESSAGES_OWN_DATA: 'Users can only access their own messages',
  SYMBOLS_PUBLIC: 'Symbols are publicly readable',
  ANALYTICS_OWN_DATA: 'Users can only access their own analytics data',
  COLLABORATION_SHARED: 'Users can access shared collaboration sessions',
  TEMPLATES_PUBLIC: 'Templates are publicly readable',
} as const;

// Storage policies
export const STORAGE_POLICIES = {
  USER_PHOTOS_OWN: 'Users can upload and manage their own photos',
  COMMUNICATION_BOOKS_OWN: 'Users can upload and manage their own communication books',
  SYMBOLS_PUBLIC: 'Symbols are publicly readable',
  AUDIO_FILES_OWN: 'Users can upload and manage their own audio files',
  BACKUPS_OWN: 'Users can upload and manage their own backups',
  TEMPLATES_PUBLIC: 'Templates are publicly readable',
} as const;

// Helper functions
export const createStorageUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { cacheControl?: string; upsert?: boolean }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);
  
  if (error) throw error;
  return data;
};

export const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  if (error) throw error;
  return data;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};

export const listFiles = async (bucket: string, path?: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);
  
  if (error) throw error;
  return data;
};

// Real-time subscriptions
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table,
      filter,
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Authentication helpers
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Database helpers
export const executeQuery = async (query: string, params?: any[]) => {
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params: params || [],
  });
  
  if (error) throw error;
  return data;
};

// Error handling
export const handleSupabaseError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  
  if (error.details) {
    return error.details;
  }
  
  return 'An unexpected error occurred';
};

// Connection status
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};

export default supabase;