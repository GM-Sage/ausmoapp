// Advanced Encryption Service for HIPAA/GDPR Compliance
// Handles encryption, decryption, and secure data management

import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  iterations: number;
  saltSize: number;
}

export interface EncryptedData {
  data: string;
  salt: string;
  iv: string;
  tag?: string;
}

export interface DataRetentionPolicy {
  maxRetentionDays: number;
  autoDeleteAfterDays: number;
  requireExplicitConsent: boolean;
  allowDataExport: boolean;
  allowDataDeletion: boolean;
}

class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: string | null = null;
  private deviceId: string | null = null;

  private readonly config: EncryptionConfig = {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    iterations: 10000,
    saltSize: 16,
  };

  private readonly retentionPolicies: Record<string, DataRetentionPolicy> = {
    therapy_goals: {
      maxRetentionDays: 2555, // 7 years (HIPAA requirement)
      autoDeleteAfterDays: 2555,
      requireExplicitConsent: true,
      allowDataExport: true,
      allowDataDeletion: true,
    },
    therapy_sessions: {
      maxRetentionDays: 2555,
      autoDeleteAfterDays: 2555,
      requireExplicitConsent: true,
      allowDataExport: true,
      allowDataDeletion: true,
    },
    patient_profiles: {
      maxRetentionDays: 2555,
      autoDeleteAfterDays: 2555,
      requireExplicitConsent: true,
      allowDataExport: true,
      allowDataDeletion: true,
    },
    communication_data: {
      maxRetentionDays: 1095, // 3 years
      autoDeleteAfterDays: 1095,
      requireExplicitConsent: false,
      allowDataExport: true,
      allowDataDeletion: true,
    },
    usage_analytics: {
      maxRetentionDays: 365, // 1 year
      autoDeleteAfterDays: 365,
      requireExplicitConsent: false,
      allowDataExport: false,
      allowDataDeletion: true,
    },
  };

  private constructor() {
    this.initializeDeviceId();
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Initialize device-specific encryption
  private async initializeDeviceId(): Promise<void> {
    try {
      const storedDeviceId = await AsyncStorage.getItem('device_encryption_id');
      if (storedDeviceId) {
        this.deviceId = storedDeviceId;
      } else {
        this.deviceId = this.generateDeviceId();
        await AsyncStorage.setItem('device_encryption_id', this.deviceId);
      }
    } catch (error) {
      console.error('Error initializing device ID:', error);
      this.deviceId = this.generateDeviceId();
    }
  }

  private generateDeviceId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const platform = Platform.OS;
    return CryptoJS.SHA256(`${platform}_${timestamp}_${random}`).toString();
  }

  // Generate or retrieve master encryption key
  private async getMasterKey(): Promise<string> {
    if (this.masterKey) {
      return this.masterKey;
    }

    try {
      const storedKey = await AsyncStorage.getItem('master_encryption_key');
      if (storedKey) {
        this.masterKey = storedKey;
        return this.masterKey;
      }

      // Generate new master key
      this.masterKey = this.generateMasterKey();
      await AsyncStorage.setItem('master_encryption_key', this.masterKey);
      return this.masterKey;
    } catch (error) {
      console.error('Error getting master key:', error);
      throw new Error('Failed to initialize encryption');
    }
  }

  private generateMasterKey(): string {
    const deviceId = this.deviceId || this.generateDeviceId();
    const timestamp = Date.now().toString();
    const random = CryptoJS.lib.WordArray.random(32).toString();

    return CryptoJS.SHA256(`${deviceId}_${timestamp}_${random}`).toString();
  }

  // Encrypt sensitive data
  async encryptSensitiveData(
    data: any,
    dataType: string
  ): Promise<EncryptedData> {
    try {
      const masterKey = await this.getMasterKey();
      const salt = CryptoJS.lib.WordArray.random(this.config.saltSize);
      const key = CryptoJS.PBKDF2(masterKey, salt, {
        keySize: this.config.keySize / 32,
        iterations: this.config.iterations,
      });

      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7,
      });

      return {
        data: encrypted.toString(),
        salt: salt.toString(),
        iv: iv.toString(),
      };
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  // Decrypt sensitive data
  async decryptSensitiveData(
    encryptedData: EncryptedData,
    dataType: string
  ): Promise<any> {
    try {
      const masterKey = await this.getMasterKey();
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const key = CryptoJS.PBKDF2(masterKey, salt, {
        keySize: this.config.keySize / 32,
        iterations: this.config.iterations,
      });

      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  // Hash sensitive identifiers (one-way encryption)
  hashSensitiveIdentifier(identifier: string, salt?: string): string {
    const hashSalt = salt || CryptoJS.lib.WordArray.random(16).toString();
    return CryptoJS.SHA256(`${identifier}_${hashSalt}`).toString();
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  // Data retention and compliance methods
  getRetentionPolicy(dataType: string): DataRetentionPolicy {
    return (
      this.retentionPolicies[dataType] || {
        maxRetentionDays: 365,
        autoDeleteAfterDays: 365,
        requireExplicitConsent: false,
        allowDataExport: true,
        allowDataDeletion: true,
      }
    );
  }

  // Check if data should be auto-deleted
  shouldAutoDelete(dataType: string, createdAt: Date): boolean {
    const policy = this.getRetentionPolicy(dataType);
    const daysSinceCreation =
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > policy.autoDeleteAfterDays;
  }

  // Generate data export package
  async generateDataExport(userId: string, dataTypes: string[]): Promise<any> {
    try {
      const exportData: any = {
        userId,
        exportDate: new Date().toISOString(),
        version: '1.0',
        dataTypes: dataTypes,
        data: {},
      };

      // This would integrate with your database service
      // to export user data in a structured format
      for (const dataType of dataTypes) {
        const policy = this.getRetentionPolicy(dataType);
        if (policy.allowDataExport) {
          // exportData.data[dataType] = await this.exportUserData(userId, dataType);
        }
      }

      return exportData;
    } catch (error) {
      console.error('Error generating data export:', error);
      throw new Error('Failed to generate data export');
    }
  }

  // Secure data deletion
  async secureDataDeletion(userId: string, dataTypes: string[]): Promise<void> {
    try {
      for (const dataType of dataTypes) {
        const policy = this.getRetentionPolicy(dataType);
        if (policy.allowDataDeletion) {
          // This would integrate with your database service
          // to securely delete user data
          // await this.deleteUserData(userId, dataType);
        }
      }

      // Log the deletion for audit purposes
      await this.logDataDeletion(userId, dataTypes);
    } catch (error) {
      console.error('Error in secure data deletion:', error);
      throw new Error('Failed to securely delete data');
    }
  }

  // Log data deletion for audit
  private async logDataDeletion(
    userId: string,
    dataTypes: string[]
  ): Promise<void> {
    try {
      const deletionLog = {
        userId,
        dataTypes,
        deletionDate: new Date().toISOString(),
        method: 'secure_deletion',
        compliance: 'GDPR_Article_17',
      };

      // This would integrate with your audit logging system
      console.log('Data deletion logged:', deletionLog);
    } catch (error) {
      console.error('Error logging data deletion:', error);
    }
  }

  // Generate privacy report
  async generatePrivacyReport(userId: string): Promise<any> {
    try {
      const report = {
        userId,
        generatedDate: new Date().toISOString(),
        dataTypes: Object.keys(this.retentionPolicies),
        retentionPolicies: this.retentionPolicies,
        encryptionStatus: 'enabled',
        complianceStandards: ['HIPAA', 'GDPR', 'COPPA', 'FERPA'],
        dataRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToPortability: true,
          rightToRestrictProcessing: true,
        },
      };

      return report;
    } catch (error) {
      console.error('Error generating privacy report:', error);
      throw new Error('Failed to generate privacy report');
    }
  }

  // Validate data compliance
  validateDataCompliance(dataType: string, data: any): boolean {
    const policy = this.getRetentionPolicy(dataType);

    // Check if data contains sensitive information
    const sensitiveFields = [
      'ssn',
      'medicalRecordNumber',
      'diagnosis',
      'treatment',
    ];
    const hasSensitiveData = sensitiveFields.some(field =>
      JSON.stringify(data).toLowerCase().includes(field)
    );

    if (hasSensitiveData && !policy.requireExplicitConsent) {
      return false;
    }

    return true;
  }

  // Get encryption status
  getEncryptionStatus(): any {
    return {
      enabled: true,
      algorithm: this.config.algorithm,
      keySize: this.config.keySize,
      deviceId: this.deviceId ? 'initialized' : 'not_initialized',
      masterKey: this.masterKey ? 'initialized' : 'not_initialized',
    };
  }

  // Clear sensitive data from memory
  clearSensitiveData(): void {
    this.masterKey = null;
    // Clear any other sensitive data from memory
  }
}

export default EncryptionService;
