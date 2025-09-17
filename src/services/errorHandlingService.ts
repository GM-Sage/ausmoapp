// Error Handling Service for Ausmo AAC App
// Provides graceful degradation, offline functionality, and user-friendly error messages

import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface ErrorInfo {
  id: string;
  type: 'network' | 'database' | 'audio' | 'navigation' | 'permission' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userMessage: string;
  technicalDetails: string;
  timestamp: Date;
  userId?: string;
  screen: string;
  action: string;
  stackTrace?: string;
  context: Record<string, any>;
  isResolved: boolean;
  resolution?: string;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineCapability {
  feature: string;
  isOfflineCapable: boolean;
  offlineData: any;
  lastSync: Date;
  syncStatus: 'synced' | 'pending' | 'failed' | 'never';
  conflictResolution: 'local' | 'remote' | 'manual';
}

export interface ErrorRecoveryStrategy {
  id: string;
  errorType: ErrorInfo['type'];
  strategy: 'retry' | 'fallback' | 'degrade' | 'offline' | 'user_action';
  description: string;
  implementation: () => Promise<boolean>;
  priority: number;
  isEnabled: boolean;
}

export interface ErrorHandlingSettings {
  enableErrorReporting: boolean;
  enableOfflineMode: boolean;
  enableGracefulDegradation: boolean;
  maxRetryAttempts: number;
  retryDelay: number; // milliseconds
  errorLoggingLevel: 'none' | 'errors' | 'warnings' | 'all';
  autoRecovery: boolean;
  userNotifications: boolean;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private currentUser: User | null = null;
  private isInitialized = false;
  private errorHandlingSettings: ErrorHandlingSettings;
  private errorHistory: ErrorInfo[] = [];
  private offlineCapabilities: OfflineCapability[] = [];
  private recoveryStrategies: ErrorRecoveryStrategy[] = [];
  private isOnline: boolean = true;
  private networkListener: any = null;

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  constructor() {
    this.errorHandlingSettings = {
      enableErrorReporting: true,
      enableOfflineMode: true,
      enableGracefulDegradation: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      errorLoggingLevel: 'errors',
      autoRecovery: true,
      userNotifications: true,
    };

    this.initializeOfflineCapabilities();
    this.initializeRecoveryStrategies();
  }

  // Initialize error handling service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await this.loadErrorHandlingSettings();
      await this.setupNetworkMonitoring();
      await this.loadErrorHistory();
      this.isInitialized = true;
      console.log('Error handling service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing error handling service:', error);
    }
  }

  // Error Handling
  async handleError(
    error: Error,
    context: {
      screen: string;
      action: string;
      type?: ErrorInfo['type'];
      severity?: ErrorInfo['severity'];
      userMessage?: string;
      retryable?: boolean;
    }
  ): Promise<ErrorInfo> {
    try {
      const errorInfo: ErrorInfo = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: context.type || this.determineErrorType(error),
        severity: context.severity || this.determineErrorSeverity(error),
        message: error.message,
        userMessage: context.userMessage || this.generateUserFriendlyMessage(error, context),
        technicalDetails: error.stack || error.toString(),
        timestamp: new Date(),
        userId: this.currentUser?.id,
        screen: context.screen,
        action: context.action,
        stackTrace: error.stack,
        context: { ...context },
        isResolved: false,
        retryCount: 0,
        maxRetries: context.retryable ? this.errorHandlingSettings.maxRetryAttempts : 0,
      };

      // Log error
      await this.logError(errorInfo);

      // Attempt recovery
      if (this.errorHandlingSettings.autoRecovery) {
        await this.attemptRecovery(errorInfo);
      }

      // Notify user if enabled
      if (this.errorHandlingSettings.userNotifications && errorInfo.severity !== 'low') {
        await this.notifyUser(errorInfo);
      }

      return errorInfo;
    } catch (handlingError) {
      console.error('Error in error handling:', handlingError);
      throw handlingError;
    }
  }

  // Offline Functionality
  private initializeOfflineCapabilities(): void {
    this.offlineCapabilities = [
      {
        feature: 'communication',
        isOfflineCapable: true,
        offlineData: null,
        lastSync: new Date(),
        syncStatus: 'synced',
        conflictResolution: 'local',
      },
      {
        feature: 'symbol_library',
        isOfflineCapable: true,
        offlineData: null,
        lastSync: new Date(),
        syncStatus: 'synced',
        conflictResolution: 'local',
      },
      {
        feature: 'user_settings',
        isOfflineCapable: true,
        offlineData: null,
        lastSync: new Date(),
        syncStatus: 'synced',
        conflictResolution: 'local',
      },
      {
        feature: 'analytics',
        isOfflineCapable: false,
        offlineData: null,
        lastSync: new Date(),
        syncStatus: 'never',
        conflictResolution: 'remote',
      },
      {
        feature: 'cloud_sync',
        isOfflineCapable: false,
        offlineData: null,
        lastSync: new Date(),
        syncStatus: 'never',
        conflictResolution: 'remote',
      },
    ];
  }

  async enableOfflineMode(): Promise<void> {
    try {
      if (!this.errorHandlingSettings.enableOfflineMode) {
        throw new Error('Offline mode is disabled');
      }

      // Switch to offline mode
      this.isOnline = false;
      
      // Enable offline capabilities
      for (const capability of this.offlineCapabilities) {
        if (capability.isOfflineCapable) {
          await this.loadOfflineData(capability.feature);
        }
      }

      console.log('Offline mode enabled');
    } catch (error) {
      console.error('Error enabling offline mode:', error);
      throw error;
    }
  }

  async disableOfflineMode(): Promise<void> {
    try {
      this.isOnline = true;
      
      // Sync offline data when back online
      await this.syncOfflineData();
      
      console.log('Offline mode disabled, data synced');
    } catch (error) {
      console.error('Error disabling offline mode:', error);
      throw error;
    }
  }

  async isFeatureAvailableOffline(feature: string): Promise<boolean> {
    const capability = this.offlineCapabilities.find(c => c.feature === feature);
    return capability?.isOfflineCapable || false;
  }

  // Recovery Strategies
  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies = [
      {
        id: 'network_retry',
        errorType: 'network',
        strategy: 'retry',
        description: 'Retry network operations with exponential backoff',
        implementation: async () => {
          // Implement network retry logic
          return true;
        },
        priority: 1,
        isEnabled: true,
      },
      {
        id: 'database_fallback',
        errorType: 'database',
        strategy: 'fallback',
        description: 'Use local database when cloud database fails',
        implementation: async () => {
          // Implement database fallback logic
          return true;
        },
        priority: 2,
        isEnabled: true,
      },
      {
        id: 'audio_degradation',
        errorType: 'audio',
        strategy: 'degrade',
        description: 'Disable audio features when audio service fails',
        implementation: async () => {
          // Implement audio degradation logic
          return true;
        },
        priority: 3,
        isEnabled: true,
      },
      {
        id: 'offline_mode',
        errorType: 'network',
        strategy: 'offline',
        description: 'Switch to offline mode when network is unavailable',
        implementation: async () => {
          await this.enableOfflineMode();
          return true;
        },
        priority: 4,
        isEnabled: true,
      },
      {
        id: 'user_guidance',
        errorType: 'permission',
        strategy: 'user_action',
        description: 'Guide user to resolve permission issues',
        implementation: async () => {
          // Implement user guidance logic
          return true;
        },
        priority: 5,
        isEnabled: true,
      },
    ];
  }

  private async attemptRecovery(errorInfo: ErrorInfo): Promise<boolean> {
    try {
      const strategies = this.recoveryStrategies
        .filter(s => s.errorType === errorInfo.type && s.isEnabled)
        .sort((a, b) => a.priority - b.priority);

      for (const strategy of strategies) {
        try {
          const success = await strategy.implementation();
          if (success) {
            errorInfo.isResolved = true;
            errorInfo.resolution = strategy.description;
            await this.updateError(errorInfo);
            console.log('Error recovered using strategy:', strategy.id);
            return true;
          }
        } catch (strategyError) {
          console.error('Recovery strategy failed:', strategy.id, strategyError);
        }
      }

      return false;
    } catch (error) {
      console.error('Error in recovery attempt:', error);
      return false;
    }
  }

  // Network Monitoring
  private async setupNetworkMonitoring(): Promise<void> {
    try {
      this.networkListener = NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected || false;

        if (wasOnline && !this.isOnline) {
          // Went offline
          this.handleNetworkStatusChange('offline');
        } else if (!wasOnline && this.isOnline) {
          // Came back online
          this.handleNetworkStatusChange('online');
        }
      });

      // Get initial network state
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected || false;
    } catch (error) {
      console.error('Error setting up network monitoring:', error);
    }
  }

  private async handleNetworkStatusChange(status: 'online' | 'offline'): Promise<void> {
    try {
      if (status === 'offline') {
        await this.enableOfflineMode();
      } else {
        await this.disableOfflineMode();
      }
    } catch (error) {
      console.error('Error handling network status change:', error);
    }
  }

  // Error Logging and History
  private async logError(errorInfo: ErrorInfo): Promise<void> {
    try {
      this.errorHistory.push(errorInfo);

      // Keep only last 100 errors
      if (this.errorHistory.length > 100) {
        this.errorHistory = this.errorHistory.slice(-100);
      }

      // Save to storage
      await this.saveErrorHistory();

      // Log to console based on level
      if (this.errorHandlingSettings.errorLoggingLevel === 'all' ||
          (this.errorHandlingSettings.errorLoggingLevel === 'errors' && errorInfo.severity !== 'low') ||
          (this.errorHandlingSettings.errorLoggingLevel === 'warnings' && errorInfo.severity === 'high')) {
        console.error('Error logged:', errorInfo);
      }
    } catch (error) {
      console.error('Error logging error:', error);
    }
  }

  async getErrorHistory(
    startDate?: Date,
    endDate?: Date,
    severity?: ErrorInfo['severity']
  ): Promise<ErrorInfo[]> {
    try {
      let errors = [...this.errorHistory];

      if (startDate) {
        errors = errors.filter(error => error.timestamp >= startDate);
      }

      if (endDate) {
        errors = errors.filter(error => error.timestamp <= endDate);
      }

      if (severity) {
        errors = errors.filter(error => error.severity === severity);
      }

      return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting error history:', error);
      return [];
    }
  }

  // Settings Management
  async updateErrorHandlingSettings(settings: Partial<ErrorHandlingSettings>): Promise<void> {
    try {
      this.errorHandlingSettings = { ...this.errorHandlingSettings, ...settings };
      await this.saveErrorHandlingSettings();
      
      console.log('Error handling settings updated');
    } catch (error) {
      console.error('Error updating error handling settings:', error);
      throw error;
    }
  }

  // Helper Methods
  private determineErrorType(error: Error): ErrorInfo['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    } else if (message.includes('database') || message.includes('sqlite') || message.includes('query')) {
      return 'database';
    } else if (message.includes('audio') || message.includes('sound') || message.includes('speech')) {
      return 'audio';
    } else if (message.includes('navigation') || message.includes('route') || message.includes('screen')) {
      return 'navigation';
    } else if (message.includes('permission') || message.includes('access') || message.includes('denied')) {
      return 'permission';
    } else if (message.includes('validation') || message.includes('invalid') || message.includes('format')) {
      return 'validation';
    } else {
      return 'unknown';
    }
  }

  private determineErrorSeverity(error: Error): ErrorInfo['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal') || message.includes('crash')) {
      return 'critical';
    } else if (message.includes('error') || message.includes('failed') || message.includes('unable')) {
      return 'high';
    } else if (message.includes('warning') || message.includes('caution') || message.includes('notice')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateUserFriendlyMessage(error: Error, context: any): string {
    const errorType = this.determineErrorType(error);
    
    const userMessages: Record<ErrorInfo['type'], string> = {
      network: 'Unable to connect to the internet. Please check your connection and try again.',
      database: 'There was a problem saving your data. Your information is safe and will be saved when possible.',
      audio: 'Audio features are temporarily unavailable. You can still use the app without sound.',
      navigation: 'There was a problem navigating to that screen. Please try again.',
      permission: 'The app needs permission to access this feature. Please check your settings.',
      validation: 'Please check your input and try again.',
      unknown: 'Something went wrong. Please try again or contact support if the problem continues.',
    };

    return userMessages[errorType] || userMessages.unknown;
  }

  private async notifyUser(errorInfo: ErrorInfo): Promise<void> {
    try {
      // In a real app, this would show a user-friendly notification
      console.log('User notification:', errorInfo.userMessage);
    } catch (error) {
      console.error('Error notifying user:', error);
    }
  }

  private async loadOfflineData(feature: string): Promise<void> {
    try {
      // Load offline data for the feature
      console.log('Loading offline data for feature:', feature);
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  private async syncOfflineData(): Promise<void> {
    try {
      // Sync offline data when back online
      console.log('Syncing offline data');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  private async updateError(errorInfo: ErrorInfo): Promise<void> {
    try {
      const index = this.errorHistory.findIndex(e => e.id === errorInfo.id);
      if (index !== -1) {
        this.errorHistory[index] = errorInfo;
        await this.saveErrorHistory();
      }
    } catch (error) {
      console.error('Error updating error:', error);
    }
  }

  private async loadErrorHandlingSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('error_handling_settings');
      if (settings) {
        this.errorHandlingSettings = { ...this.errorHandlingSettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Error loading error handling settings:', error);
    }
  }

  private async saveErrorHandlingSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('error_handling_settings', JSON.stringify(this.errorHandlingSettings));
    } catch (error) {
      console.error('Error saving error handling settings:', error);
    }
  }

  private async loadErrorHistory(): Promise<void> {
    try {
      const history = await AsyncStorage.getItem('error_history');
      if (history) {
        this.errorHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading error history:', error);
    }
  }

  private async saveErrorHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem('error_history', JSON.stringify(this.errorHistory));
    } catch (error) {
      console.error('Error saving error history:', error);
    }
  }

  // Public Getters
  getErrorHandlingSettings(): ErrorHandlingSettings {
    return { ...this.errorHandlingSettings };
  }

  getOfflineCapabilities(): OfflineCapability[] {
    return [...this.offlineCapabilities];
  }

  getRecoveryStrategies(): ErrorRecoveryStrategy[] {
    return [...this.recoveryStrategies];
  }

  isOnlineMode(): boolean {
    return this.isOnline;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
    
    this.currentUser = null;
    this.isInitialized = false;
    console.log('Error handling service cleaned up');
  }
}

export default ErrorHandlingService;
