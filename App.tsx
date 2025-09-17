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
import DatabaseService from './src/services/databaseService';
import SupabaseDatabaseService from './src/services/supabaseDatabaseService';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Ausmo AAC App...');
      
      // Initialize local database
      console.log('🔧 Initializing Local Database Service...');
      await DatabaseService.initialize();
      console.log('✅ Local Database Service initialized successfully');
      
      // Initialize Supabase database
      console.log('🔧 Initializing Supabase Database Service...');
      await SupabaseDatabaseService.initialize();
      console.log('✅ Supabase Database Service initialized successfully');
      
      // Simple initialization - just wait a bit to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ App initialization completed successfully');
      setIsInitialized(true);
    } catch (err) {
      console.error('❌ App initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.container}>
              <StatusBar 
                style="auto" 
                backgroundColor="transparent"
                translucent={Platform.OS === 'android'}
              />
              <AppNavigator />
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
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
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
});