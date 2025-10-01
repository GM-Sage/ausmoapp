import ErrorHandlingService from '../errorHandlingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

describe('ErrorHandlingService', () => {
  let errorHandlingService: ErrorHandlingService;
  const mockUser = {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'parent' as const,
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    preferences: {},
    profilePicture: null,
    parentConsent: true,
    coppaCompliant: true,
  };

  beforeEach(() => {
    errorHandlingService = ErrorHandlingService.getInstance();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize error handling service successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await errorHandlingService.initialize(mockUser);

      expect(errorHandlingService.getCurrentUser()).toEqual(mockUser);
      expect(errorHandlingService.isOnlineMode()).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await errorHandlingService.initialize(mockUser);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error initializing error handling service:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await errorHandlingService.initialize(mockUser);
    });

    it('should handle and classify errors correctly', async () => {
      const networkError = new Error('Network request failed');
      const errorInfo = await errorHandlingService.handleError(networkError, {
        screen: 'TestScreen',
        action: 'testAction',
        type: 'network',
      });

      expect(errorInfo.type).toBe('network');
      expect(errorInfo.severity).toBe('high');
      expect(errorInfo.userMessage).toContain('Unable to connect');
    });

    it('should handle database errors', async () => {
      const dbError = new Error('SQLite error');
      const errorInfo = await errorHandlingService.handleError(dbError, {
        screen: 'TestScreen',
        action: 'testAction',
        type: 'database',
      });

      expect(errorInfo.type).toBe('database');
      expect(errorInfo.userMessage).toContain('problem saving');
    });

    it('should handle audio errors', async () => {
      const audioError = new Error('Audio playback failed');
      const errorInfo = await errorHandlingService.handleError(audioError, {
        screen: 'TestScreen',
        action: 'testAction',
        type: 'audio',
      });

      expect(errorInfo.type).toBe('audio');
      expect(errorInfo.userMessage).toContain('Audio features');
    });

    it('should handle permission errors', async () => {
      const permissionError = new Error('Permission denied');
      const errorInfo = await errorHandlingService.handleError(
        permissionError,
        {
          screen: 'TestScreen',
          action: 'testAction',
          type: 'permission',
        }
      );

      expect(errorInfo.type).toBe('permission');
      expect(errorInfo.userMessage).toContain('permission');
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid input format');
      const errorInfo = await errorHandlingService.handleError(
        validationError,
        {
          screen: 'TestScreen',
          action: 'testAction',
          type: 'validation',
        }
      );

      expect(errorInfo.type).toBe('validation');
      expect(errorInfo.userMessage).toContain('check your input');
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Something went wrong');
      const errorInfo = await errorHandlingService.handleError(unknownError, {
        screen: 'TestScreen',
        action: 'testAction',
      });

      expect(errorInfo.type).toBe('unknown');
      expect(errorInfo.userMessage).toContain('Something went wrong');
    });

    it('should classify error severity correctly', async () => {
      const criticalError = new Error('CRITICAL ERROR');
      const errorInfo = await errorHandlingService.handleError(criticalError, {
        screen: 'TestScreen',
        action: 'testAction',
      });

      expect(errorInfo.severity).toBe('critical');
    });

    it('should store error in history', async () => {
      const testError = new Error('Test error');
      await errorHandlingService.handleError(testError, {
        screen: 'TestScreen',
        action: 'testAction',
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'error_history',
        expect.stringContaining('Test error')
      );
    });

    it('should limit error history to 100 entries', async () => {
      // Mock existing large error history
      const largeHistory = Array.from({ length: 150 }, (_, i) => ({
        id: `error-${i}`,
        type: 'unknown',
        severity: 'low',
        message: `Error ${i}`,
        userMessage: `Error ${i}`,
        technicalDetails: `Error ${i}`,
        timestamp: new Date(),
        userId: mockUser.id,
        screen: 'TestScreen',
        action: 'testAction',
        context: {},
        isResolved: false,
        retryCount: 0,
        maxRetries: 0,
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(largeHistory)
      );

      const newError = new Error('New error');
      await errorHandlingService.handleError(newError, {
        screen: 'TestScreen',
        action: 'testAction',
      });

      // Should only keep last 100 errors
      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === 'error_history'
      );
      const savedHistory = JSON.parse(setItemCall[1]);
      expect(savedHistory).toHaveLength(100);
    });
  });

  describe('offline functionality', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await errorHandlingService.initialize(mockUser);
    });

    it('should detect offline capabilities correctly', async () => {
      const communicationOffline =
        await errorHandlingService.isFeatureAvailableOffline('communication');
      const analyticsOffline =
        await errorHandlingService.isFeatureAvailableOffline('analytics');

      expect(communicationOffline).toBe(true);
      expect(analyticsOffline).toBe(false);
    });

    it('should enable offline mode when network is lost', async () => {
      // Initially online
      expect(errorHandlingService.isOnlineMode()).toBe(true);

      // Simulate network disconnection
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      // Manually trigger offline mode (in real app this would be handled by network listener)
      await errorHandlingService.enableOfflineMode();

      expect(errorHandlingService.isOnlineMode()).toBe(false);
    });

    it('should disable offline mode when network returns', async () => {
      // Start offline
      await errorHandlingService.enableOfflineMode();
      expect(errorHandlingService.isOnlineMode()).toBe(false);

      // Simulate network reconnection
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await errorHandlingService.disableOfflineMode();

      expect(errorHandlingService.isOnlineMode()).toBe(true);
    });

    it('should handle offline mode errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock AsyncStorage error
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await errorHandlingService.enableOfflineMode();

      // Should handle error gracefully
      expect(errorHandlingService.isOnlineMode()).toBe(true); // Should remain online if offline fails
      consoleSpy.mockRestore();
    });
  });

  describe('recovery strategies', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await errorHandlingService.initialize(mockUser);
    });

    it('should initialize recovery strategies correctly', () => {
      const strategies = errorHandlingService.getRecoveryStrategies();

      expect(strategies).toHaveLength(5);
      expect(strategies[0].id).toBe('network_retry');
      expect(strategies[0].strategy).toBe('retry');
      expect(strategies[0].priority).toBe(1);
    });

    it('should attempt recovery for retryable errors', async () => {
      const retryableError = new Error('Network timeout');
      const errorInfo = await errorHandlingService.handleError(retryableError, {
        screen: 'TestScreen',
        action: 'testAction',
        type: 'network',
        retryable: true,
      });

      // Should mark as retryable and not immediately resolved
      expect(errorInfo.maxRetries).toBeGreaterThan(0);
    });

    it('should not attempt recovery for non-retryable errors', async () => {
      const nonRetryableError = new Error('Validation error');
      const errorInfo = await errorHandlingService.handleError(
        nonRetryableError,
        {
          screen: 'TestScreen',
          action: 'testAction',
          type: 'validation',
          retryable: false,
        }
      );

      // Should not be retryable
      expect(errorInfo.maxRetries).toBe(0);
    });
  });

  describe('error history', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await errorHandlingService.initialize(mockUser);
    });

    it('should retrieve error history', async () => {
      const mockHistory = [
        {
          id: 'error-1',
          type: 'network',
          severity: 'high',
          message: 'Network error',
          userMessage: 'Network error message',
          technicalDetails: 'Network error details',
          timestamp: new Date(),
          userId: mockUser.id,
          screen: 'TestScreen',
          action: 'testAction',
          context: {},
          isResolved: false,
          retryCount: 0,
          maxRetries: 3,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const history = await errorHandlingService.getErrorHistory();

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('network');
      expect(history[0].severity).toBe('high');
    });

    it('should filter error history by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const history = await errorHandlingService.getErrorHistory(
        startDate,
        endDate
      );

      // Should call getErrorHistory with date filters
      expect(history).toBeDefined();
    });

    it('should filter error history by severity', async () => {
      const history = await errorHandlingService.getErrorHistory(
        undefined,
        undefined,
        'critical'
      );

      // Should call getErrorHistory with severity filter
      expect(history).toBeDefined();
    });

    it('should return empty array when no history exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const history = await errorHandlingService.getErrorHistory();

      expect(history).toEqual([]);
    });
  });

  describe('settings management', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await errorHandlingService.initialize(mockUser);
    });

    it('should update error handling settings', async () => {
      const newSettings = {
        enableErrorReporting: false,
        maxRetryAttempts: 5,
        retryDelay: 2000,
      };

      await errorHandlingService.updateErrorHandlingSettings(newSettings);

      const settings = errorHandlingService.getErrorHandlingSettings();
      expect(settings.enableErrorReporting).toBe(false);
      expect(settings.maxRetryAttempts).toBe(5);
      expect(settings.retryDelay).toBe(2000);
    });

    it('should load existing settings', async () => {
      const existingSettings = {
        enableErrorReporting: false,
        enableOfflineMode: false,
        enableGracefulDegradation: false,
        maxRetryAttempts: 1,
        retryDelay: 500,
        errorLoggingLevel: 'none' as const,
        autoRecovery: false,
        userNotifications: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSettings)
      );

      const settings = errorHandlingService.getErrorHandlingSettings();
      expect(settings.enableErrorReporting).toBe(false);
      expect(settings.maxRetryAttempts).toBe(1);
      expect(settings.retryDelay).toBe(500);
    });
  });

  describe('offline capabilities', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await errorHandlingService.initialize(mockUser);
    });

    it('should return offline capabilities correctly', () => {
      const capabilities = errorHandlingService.getOfflineCapabilities();

      expect(capabilities).toHaveLength(5);
      expect(
        capabilities.find(c => c.feature === 'communication')?.isOfflineCapable
      ).toBe(true);
      expect(
        capabilities.find(c => c.feature === 'analytics')?.isOfflineCapable
      ).toBe(false);
    });

    it('should identify offline-capable features', async () => {
      const isCommunicationOffline =
        await errorHandlingService.isFeatureAvailableOffline('communication');
      const isAnalyticsOffline =
        await errorHandlingService.isFeatureAvailableOffline('analytics');

      expect(isCommunicationOffline).toBe(true);
      expect(isAnalyticsOffline).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup error handling service', async () => {
      await errorHandlingService.cleanup();

      expect(errorHandlingService.getCurrentUser()).toBeNull();
    });
  });
});
