// Main App Component for Ausmo AAC App

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/common/LoadingScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { VisualSettingsProvider, useVisualSettings } from './src/contexts/VisualSettingsContext';
import { getThemeColors, getStatusBarStyle } from './src/utils/themeUtils';
import DatabaseService from './src/services/databaseService';
import SupabaseDatabaseService from './src/services/supabaseDatabaseService';
import SymbolDataService from './src/services/symbolDataService';
import FeedbackService from './src/services/feedbackService';
import { initSentry, /* setSentryUser, */ addSentryBreadcrumb, Sentry } from './src/config/sentry';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Ausmo AAC App...');
      addSentryBreadcrumb('App initialization started', 'lifecycle');

      // Initialize Sentry for error tracking (safe no-op if module absent)
      console.log('🔧 Initializing Sentry...');
      initSentry();
      console.log('✅ Sentry initialized successfully');
      addSentryBreadcrumb('Sentry initialized', 'lifecycle');

      // Initialize local database
      console.log('🔧 Initializing Local Database Service...');
      await DatabaseService.initialize();
      console.log('✅ Local Database Service initialized successfully');
      // addSentryBreadcrumb('Local Database Service initialized', 'service');

      // Initialize Supabase database
      console.log('🔧 Initializing Supabase Database Service...');
      await SupabaseDatabaseService.initialize();
      console.log('✅ Supabase Database Service initialized successfully');
      // addSentryBreadcrumb('Supabase Database Service initialized', 'service');

      // Initialize SymbolDataService after database is ready
      console.log('🔧 Initializing Symbol Data Service...');
      await SymbolDataService.getInstance().initialize();
      console.log('✅ Symbol Data Service initialized successfully');
      // addSentryBreadcrumb('Symbol Data Service initialized', 'service');

      // Initialize FeedbackService
      console.log('🔧 Initializing Feedback Service...');
      await FeedbackService.getInstance().initialize();
      console.log('✅ Feedback Service initialized successfully');
      // addSentryBreadcrumb('Feedback Service initialized', 'service');

      // Simple initialization - just wait a bit to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ App initialization completed successfully');
      addSentryBreadcrumb('App initialization completed', 'lifecycle');
      setIsInitialized(true);
    } catch (err) {
      console.error('❌ App initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    }
  };

  if (error) {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <VisualSettingsProvider>
            <ErrorBoundary>
              <ErrorScreen error={error} />
            </ErrorBoundary>
          </VisualSettingsProvider>
        </SafeAreaProvider>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <VisualSettingsProvider>
          <ErrorBoundary>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
              {!isInitialized ? (
                <LoadingScreen message="Initializing..." />
              ) : (
                <AppContent />
              )}
            </PersistGate>
          </ErrorBoundary>
        </VisualSettingsProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

// Error screen component that can access visual settings
function ErrorScreen({ error }: { error: string }) {
  const { themeColors } = useVisualSettings();
  const safeThemeColors = themeColors || getThemeColors('light');

  return (
    <View style={[styles.errorContainer, { backgroundColor: safeThemeColors.background }]}>
      <Text style={[styles.errorText, { color: safeThemeColors.error }]}>Error: {error}</Text>
      <Text style={[styles.errorSubtext, { color: safeThemeColors.textSecondary }]}>Please restart the app</Text>
    </View>
  );
}

// App content component that can access visual settings
function AppContent() {
  const { theme, themeColors } = useVisualSettings();

  // Use normalized theme colors from context with fallback
  const safeThemeColors = themeColors || getThemeColors(theme || 'light');

  // Enhanced defensive check with optional chaining
  if (!safeThemeColors || typeof safeThemeColors !== 'object' || !safeThemeColors?.background) {
    console.error('AppContent: Invalid themeColors object, using fallback');
    // This should never happen with our normalization, but defensive programming
    return (
      <GestureHandlerRootView style={[styles.container, { backgroundColor: '#FAFAFA' }]}>
        <StatusBar style="dark" backgroundColor="transparent" translucent={Platform.OS === 'android'} />
        <AppNavigator />
      </GestureHandlerRootView>
    );
  }

  console.log('AppContent rendering with theme:', theme, 'background:', safeThemeColors.background);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: safeThemeColors?.background || '#FAFAFA' }]}>
      <StatusBar
        style={getStatusBarStyle(theme)}
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});