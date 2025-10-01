// Error Handling Service for Ausmo AAC App
// Provides graceful degradation, offline functionality, and user-friendly error messages

import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Optional Sentry integration - only use if available
let captureSentryException: ((error: Error, context?: any) => void) | null = null;
let addSentryBreadcrumb: ((message: string, category: string, level?: string, data?: any) => void) | null = null;

// Try to import Sentry functions, but don't fail if not available
try {
  const sentryModule = require('../config/sentry');
  captureSentryException = sentryModule.captureSentryException;
  addSentryBreadcrumb = sentryModule.addSentryBreadcrumb;
} catch (error) {
  // Sentry not available - continue without it
  console.log('Sentry not available in error handling service');
}

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

      // Send to Sentry for tracking (only high severity errors in production)
      if (errorInfo.severity === 'high' || errorInfo.severity === 'critical') {
        if (captureSentryException) {
          captureSentryException(error, {
            errorInfo: errorInfo,
            screen: context.screen,
            action: context.action,
            type: errorInfo.type,
            severity: errorInfo.severity,
          });
        }
      }

      // Add breadcrumb for error handling (if Sentry is available)
      if (addSentryBreadcrumb) {
        addSentryBreadcrumb(
        `Error handled: ${error.message}`,
        'error_handling',
        errorInfo.severity === 'critical' ? 'error' : 'warning',
        {
          errorType: errorInfo.type,
          severity: errorInfo.severity,
          screen: context.screen,
          action: context.action,
        }
      );
      }

      // Attempt recovery
      if (this.errorHandlingSettings.autoRecovery) {
        await this.attemptRecovery(errorInfo);
      }

      // Notify user if enabled
      if (this.errorHandlingSettings.userNotifications && errorInfo.severity !== 'low') {
        await this.notifyUser(errorInfo);
      }

      return errorInfo;
    } catch (error) {
      console.error('Error in error handling:', error);
      if (captureSentryException) {
        captureSentryException(error as Error, { context: 'error_handling_itself' });
      }
      throw error;
    }
  }
}
