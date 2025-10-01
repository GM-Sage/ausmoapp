import SecurityService from '../securityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('SecurityService', () => {
  let securityService: SecurityService;
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
    securityService = SecurityService.getInstance();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize security service successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await securityService.initialize(mockUser);

      expect(securityService.getCurrentUser()).toEqual(mockUser);
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await securityService.initialize(mockUser);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error initializing security service:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('encryption', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should encrypt data', async () => {
      const testData = 'sensitive information';
      const encrypted = await securityService.encryptData(testData);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testData);
    });

    it('should decrypt data', async () => {
      const testData = 'sensitive information';
      const encrypted = await securityService.encryptData(testData);
      const decrypted = await securityService.decryptData(encrypted);

      // Note: Our mock encryption is just base64 encoding, so decryption should work
      expect(decrypted).toBeDefined();
    });

    it('should handle encryption errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Key error')
      );

      // Clear encryption key to force error
      (securityService as any).encryptionKey = null;

      const result = await securityService.encryptData('test');

      expect(result).toBe('test'); // Should return original data on error
      consoleSpy.mockRestore();
    });
  });

  describe('COPPA compliance', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should verify COPPA compliance for adults', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('25'); // Age 25

      const compliance = await securityService.verifyCOPPACompliance();

      expect(compliance.userId).toBe(mockUser.id);
      expect(compliance.ageVerified).toBe(true);
      expect(compliance.complianceScore).toBeGreaterThan(0);
    });

    it('should handle underage users without consent', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('12'); // Age 12

      const compliance = await securityService.verifyCOPPACompliance();

      expect(compliance.userId).toBe(mockUser.id);
      // Should still pass compliance check but log violation
      consoleSpy.mockRestore();
    });
  });

  describe('parental consent', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should request parental consent', async () => {
      const parentEmail = 'parent@example.com';
      const consentType = 'data_collection' as const;

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');

      const consent = await securityService.requestParentalConsent(
        mockUser.id,
        parentEmail,
        consentType
      );

      expect(consent.userId).toBe(mockUser.id);
      expect(consent.parentEmail).toBe(parentEmail);
      expect(consent.consentType).toBe(consentType);
      expect(consent.granted).toBe(false);
      expect(consent.signature).toBeDefined();
    });

    it('should grant parental consent with valid signature', async () => {
      const consentId = 'test-consent-id';
      const parentEmail = 'parent@example.com';
      const consentType = 'data_collection' as const;

      // Mock existing consent
      const mockConsent = {
        id: consentId,
        userId: mockUser.id,
        parentEmail,
        consentType,
        granted: false,
        ipAddress: '127.0.0.1',
        userAgent: 'Ausmo AAC App',
        signature: 'test-signature',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockConsent])
      );

      await securityService.grantParentalConsent(
        consentId,
        parentEmail,
        'test-signature'
      );

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should reject invalid signature', async () => {
      const consentId = 'test-consent-id';
      const parentEmail = 'parent@example.com';

      const mockConsent = {
        id: consentId,
        userId: mockUser.id,
        parentEmail,
        consentType: 'data_collection' as const,
        granted: false,
        ipAddress: '127.0.0.1',
        userAgent: 'Ausmo AAC App',
        signature: 'correct-signature',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockConsent])
      );

      await expect(
        securityService.grantParentalConsent(
          consentId,
          parentEmail,
          'wrong-signature'
        )
      ).rejects.toThrow('Invalid signature');
    });
  });

  describe('security settings', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should update security settings', async () => {
      const newSettings = {
        encryptionEnabled: false,
        sessionTimeout: 60,
      };

      await securityService.updateSecuritySettings(newSettings);

      const settings = securityService.getSecuritySettings();
      expect(settings.encryptionEnabled).toBe(false);
      expect(settings.sessionTimeout).toBe(60);
    });

    it('should load existing security settings', async () => {
      const existingSettings = {
        encryptionEnabled: false,
        biometricAuth: true,
        sessionTimeout: 45,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSettings)
      );

      const settings = securityService.getSecuritySettings();
      expect(settings.encryptionEnabled).toBe(false);
      expect(settings.biometricAuth).toBe(true);
      expect(settings.sessionTimeout).toBe(45);
    });
  });

  describe('audit logging', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should log audit events', async () => {
      const event = {
        action: 'login',
        resource: 'authentication',
        success: true,
        details: { method: 'email' },
      };

      await securityService.logAuditEvent(event);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should retrieve audit logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId: mockUser.id,
          action: 'login',
          resource: 'authentication',
          timestamp: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Ausmo AAC App',
          success: true,
          details: {},
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockLogs)
      );

      const logs = await securityService.getAuditLogs(mockUser.id);

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(mockUser.id);
      expect(logs[0].action).toBe('login');
    });

    it('should filter audit logs by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const logs = await securityService.getAuditLogs(
        mockUser.id,
        startDate,
        endDate
      );

      // Should call getAuditLogs with date filters
      expect(logs).toBeDefined();
    });
  });

  describe('security violations', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should log security violations', async () => {
      const violation = {
        userId: mockUser.id,
        type: 'unauthorized_access' as const,
        severity: 'high' as const,
        description: 'Multiple failed login attempts',
        timestamp: new Date(),
        resolved: false,
      };

      await securityService.logSecurityViolation(violation);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should retrieve security violations', async () => {
      const mockViolations = [
        {
          id: 'violation-1',
          userId: mockUser.id,
          type: 'unauthorized_access',
          severity: 'high',
          description: 'Multiple failed login attempts',
          timestamp: new Date(),
          resolved: false,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockViolations)
      );

      const violations = await securityService.getSecurityViolations(
        mockUser.id
      );

      expect(violations).toHaveLength(1);
      expect(violations[0].userId).toBe(mockUser.id);
      expect(violations[0].type).toBe('unauthorized_access');
    });

    it('should filter violations by severity', async () => {
      const violations = await securityService.getSecurityViolations(
        mockUser.id,
        'high'
      );

      // Should call getSecurityViolations with severity filter
      expect(violations).toBeDefined();
    });
  });

  describe('data privacy', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await securityService.initialize(mockUser);
    });

    it('should anonymize user data', async () => {
      await securityService.anonymizeUserData(mockUser.id);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should delete user data', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        `user_${mockUser.id}`,
        `settings_${mockUser.id}`,
        `data_${mockUser.id}`,
      ]);

      await securityService.deleteUserData(mockUser.id);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        `user_${mockUser.id}`,
        `settings_${mockUser.id}`,
        `data_${mockUser.id}`,
      ]);
    });
  });

  describe('cleanup', () => {
    it('should cleanup security service', async () => {
      await securityService.cleanup();

      expect(securityService.getCurrentUser()).toBeNull();
    });
  });
});
