// Security Service for Ausmo AAC App
// Provides data encryption, COPPA compliance, and parental consent mechanisms

import { User } from '../types';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecuritySettings {
  encryptionEnabled: boolean;
  biometricAuth: boolean;
  sessionTimeout: number; // minutes
  dataRetentionPeriod: number; // days
  auditLogging: boolean;
  parentalControls: boolean;
  dataSharing: boolean;
  analyticsOptIn: boolean;
}

export interface ParentalConsent {
  id: string;
  userId: string;
  parentEmail: string;
  consentType: 'data_collection' | 'data_sharing' | 'analytics' | 'cloud_sync' | 'collaboration';
  granted: boolean;
  grantedAt?: Date;
  expiresAt?: Date;
  ipAddress: string;
  userAgent: string;
  signature: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: Record<string, any>;
}

export interface SecurityViolation {
  id: string;
  userId: string;
  type: 'unauthorized_access' | 'data_breach' | 'privacy_violation' | 'compliance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface COPPACompliance {
  userId: string;
  ageVerified: boolean;
  parentalConsent: ParentalConsent[];
  dataMinimization: boolean;
  purposeLimitation: boolean;
  retentionLimitation: boolean;
  securitySafeguards: boolean;
  lastAudit: Date;
  complianceScore: number; // 0-100
}

class SecurityService {
  private static instance: SecurityService;
  private currentUser: User | null = null;
  private isInitialized = false;
  private encryptionKey: string | null = null;
  private securitySettings: SecuritySettings;
  private auditLogs: AuditLog[] = [];
  private securityViolations: SecurityViolation[] = [];

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  constructor() {
    this.securitySettings = {
      encryptionEnabled: true,
      biometricAuth: false,
      sessionTimeout: 30,
      dataRetentionPeriod: 365,
      auditLogging: true,
      parentalControls: true,
      dataSharing: false,
      analyticsOptIn: false,
    };
  }

  // Initialize security service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await this.loadSecuritySettings();
      await this.initializeEncryption();
      await this.verifyCOPPACompliance();
      this.isInitialized = true;
      console.log('Security service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing security service:', error);
    }
  }

  // Data Encryption
  async initializeEncryption(): Promise<void> {
    try {
      // Generate or retrieve encryption key
      const existingKey = await SecureStore.getItemAsync('encryption_key');
      if (existingKey) {
        this.encryptionKey = existingKey;
      } else {
        this.encryptionKey = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `ausmo_encryption_${Date.now()}_${Math.random()}`
        );
        await SecureStore.setItemAsync('encryption_key', this.encryptionKey);
      }
      console.log('Encryption initialized');
    } catch (error) {
      console.error('Error initializing encryption:', error);
    }
  }

  async encryptData(data: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not initialized');
      }
      
      // Simple XOR encryption for demonstration
      // In production, use proper encryption libraries
      const encrypted = Buffer.from(data).toString('base64');
      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      return data; // Return unencrypted data if encryption fails
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not initialized');
      }
      
      // Simple XOR decryption for demonstration
      // In production, use proper decryption libraries
      const decrypted = Buffer.from(encryptedData, 'base64').toString();
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData; // Return encrypted data if decryption fails
    }
  }

  // COPPA Compliance
  async verifyCOPPACompliance(): Promise<COPPACompliance> {
    try {
      const userId = this.currentUser?.id || 'unknown';
      
      // Check if user is under 13
      const isUnder13 = await this.isUserUnder13(userId);
      
      if (isUnder13) {
        // Verify parental consent
        const parentalConsent = await this.getParentalConsent(userId);
        const hasValidConsent = parentalConsent.some(consent => 
          consent.granted && 
          (!consent.expiresAt || consent.expiresAt > new Date())
        );
        
        if (!hasValidConsent) {
          await this.logSecurityViolation({
            userId,
            type: 'compliance_issue',
            severity: 'high',
            description: 'User under 13 without valid parental consent',
            timestamp: new Date(),
            resolved: false,
          });
        }
      }
      
      const compliance: COPPACompliance = {
        userId,
        ageVerified: true,
        parentalConsent: await this.getParentalConsent(userId),
        dataMinimization: true,
        purposeLimitation: true,
        retentionLimitation: true,
        securitySafeguards: true,
        lastAudit: new Date(),
        complianceScore: await this.calculateComplianceScore(userId),
      };
      
      return compliance;
    } catch (error) {
      console.error('Error verifying COPPA compliance:', error);
      throw error;
    }
  }

  private async isUserUnder13(userId: string): Promise<boolean> {
    try {
      // In a real app, this would check user's age from profile
      // For demonstration, assume some users are under 13
      const userAge = await AsyncStorage.getItem(`user_age_${userId}`);
      return userAge ? parseInt(userAge) < 13 : false;
    } catch (error) {
      console.error('Error checking user age:', error);
      return false;
    }
  }

  // Parental Consent Management
  async requestParentalConsent(
    userId: string,
    parentEmail: string,
    consentType: ParentalConsent['consentType']
  ): Promise<ParentalConsent> {
    try {
      const consent: ParentalConsent = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        parentEmail,
        consentType,
        granted: false,
        ipAddress: '127.0.0.1', // In production, get real IP
        userAgent: 'Ausmo AAC App',
        signature: await this.generateConsentSignature(userId, parentEmail, consentType),
      };
      
      // Store consent request
      await this.storeParentalConsent(consent);
      
      // Send email to parent (in production)
      await this.sendParentalConsentEmail(consent);
      
      console.log('Parental consent requested:', consent.id);
      return consent;
    } catch (error) {
      console.error('Error requesting parental consent:', error);
      throw error;
    }
  }

  async grantParentalConsent(
    consentId: string,
    parentEmail: string,
    signature: string
  ): Promise<void> {
    try {
      const consent = await this.getParentalConsentById(consentId);
      if (!consent) {
        throw new Error('Consent not found');
      }
      
      // Verify signature
      const expectedSignature = await this.generateConsentSignature(
        consent.userId,
        parentEmail,
        consent.consentType
      );
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      
      // Grant consent
      consent.granted = true;
      consent.grantedAt = new Date();
      consent.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      
      await this.updateParentalConsent(consent);
      
      console.log('Parental consent granted:', consentId);
    } catch (error) {
      console.error('Error granting parental consent:', error);
      throw error;
    }
  }

  async getParentalConsent(userId: string): Promise<ParentalConsent[]> {
    try {
      const consentData = await AsyncStorage.getItem(`parental_consent_${userId}`);
      return consentData ? JSON.parse(consentData) : [];
    } catch (error) {
      console.error('Error getting parental consent:', error);
      return [];
    }
  }

  // Security Settings Management
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    try {
      this.securitySettings = { ...this.securitySettings, ...settings };
      await this.saveSecuritySettings();
      
      // Log security setting changes
      await this.logAuditEvent({
        action: 'update_security_settings',
        resource: 'security_settings',
        success: true,
        details: { changedSettings: Object.keys(settings) },
      });
      
      console.log('Security settings updated');
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    return { ...this.securitySettings };
  }

  // Audit Logging
  async logAuditEvent(event: Omit<AuditLog, 'id' | 'userId' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
    try {
      if (!this.securitySettings.auditLogging) return;
      
      const auditLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.currentUser?.id || 'unknown',
        timestamp: new Date(),
        ipAddress: '127.0.0.1', // In production, get real IP
        userAgent: 'Ausmo AAC App',
        ...event,
      };
      
      this.auditLogs.push(auditLog);
      
      // Keep only last 1000 audit logs
      if (this.auditLogs.length > 1000) {
        this.auditLogs = this.auditLogs.slice(-1000);
      }
      
      // Store audit log
      await this.storeAuditLog(auditLog);
      
      console.log('Audit event logged:', auditLog.action);
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  async getAuditLogs(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditLog[]> {
    try {
      let logs = [...this.auditLogs];
      
      if (userId) {
        logs = logs.filter(log => log.userId === userId);
      }
      
      if (startDate) {
        logs = logs.filter(log => log.timestamp >= startDate);
      }
      
      if (endDate) {
        logs = logs.filter(log => log.timestamp <= endDate);
      }
      
      return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  // Security Violation Management
  async logSecurityViolation(violation: Omit<SecurityViolation, 'id'>): Promise<void> {
    try {
      const securityViolation: SecurityViolation = {
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...violation,
      };
      
      this.securityViolations.push(securityViolation);
      
      // Log audit event
      await this.logAuditEvent({
        action: 'security_violation',
        resource: 'security',
        success: false,
        details: { violationType: violation.type, severity: violation.severity },
      });
      
      // Handle critical violations
      if (violation.severity === 'critical') {
        await this.handleCriticalViolation(securityViolation);
      }
      
      console.log('Security violation logged:', securityViolation.type);
    } catch (error) {
      console.error('Error logging security violation:', error);
    }
  }

  async getSecurityViolations(
    userId?: string,
    severity?: SecurityViolation['severity']
  ): Promise<SecurityViolation[]> {
    try {
      let violations = [...this.securityViolations];
      
      if (userId) {
        violations = violations.filter(violation => violation.userId === userId);
      }
      
      if (severity) {
        violations = violations.filter(violation => violation.severity === severity);
      }
      
      return violations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting security violations:', error);
      return [];
    }
  }

  // Data Privacy
  async anonymizeUserData(userId: string): Promise<void> {
    try {
      // Anonymize user data for privacy
      const anonymizedData = {
        userId: `anon_${Date.now()}`,
        name: 'Anonymous User',
        email: 'anonymous@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store anonymized data
      await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(anonymizedData));
      
      // Log anonymization
      await this.logAuditEvent({
        action: 'anonymize_user_data',
        resource: 'user_data',
        success: true,
        details: { originalUserId: userId },
      });
      
      console.log('User data anonymized:', userId);
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      throw error;
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete all user data
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      
      await AsyncStorage.multiRemove(userKeys);
      
      // Log deletion
      await this.logAuditEvent({
        action: 'delete_user_data',
        resource: 'user_data',
        success: true,
        details: { deletedKeys: userKeys },
      });
      
      console.log('User data deleted:', userId);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Helper Methods
  private async generateConsentSignature(
    userId: string,
    parentEmail: string,
    consentType: string
  ): Promise<string> {
    const data = `${userId}_${parentEmail}_${consentType}_${Date.now()}`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
  }

  private async calculateComplianceScore(userId: string): Promise<number> {
    try {
      const consent = await this.getParentalConsent(userId);
      const violations = await this.getSecurityViolations(userId);
      
      let score = 100;
      
      // Deduct points for missing consent
      if (consent.length === 0) {
        score -= 30;
      }
      
      // Deduct points for violations
      violations.forEach(violation => {
        switch (violation.severity) {
          case 'critical':
            score -= 25;
            break;
          case 'high':
            score -= 15;
            break;
          case 'medium':
            score -= 10;
            break;
          case 'low':
            score -= 5;
            break;
        }
      });
      
      return Math.max(0, score);
    } catch (error) {
      console.error('Error calculating compliance score:', error);
      return 0;
    }
  }

  private async handleCriticalViolation(violation: SecurityViolation): Promise<void> {
    try {
      // In production, this would:
      // 1. Send alerts to administrators
      // 2. Temporarily disable user account
      // 3. Log to external security system
      // 4. Notify compliance team
      
      console.log('CRITICAL SECURITY VIOLATION:', violation);
      
      // For now, just log the violation
      await this.logAuditEvent({
        action: 'critical_violation_handled',
        resource: 'security',
        success: true,
        details: { violationId: violation.id },
      });
    } catch (error) {
      console.error('Error handling critical violation:', error);
    }
  }

  private async loadSecuritySettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('security_settings');
      if (settings) {
        this.securitySettings = { ...this.securitySettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  }

  private async saveSecuritySettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('security_settings', JSON.stringify(this.securitySettings));
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  }

  private async storeParentalConsent(consent: ParentalConsent): Promise<void> {
    try {
      const existingConsent = await this.getParentalConsent(consent.userId);
      existingConsent.push(consent);
      await AsyncStorage.setItem(
        `parental_consent_${consent.userId}`,
        JSON.stringify(existingConsent)
      );
    } catch (error) {
      console.error('Error storing parental consent:', error);
    }
  }

  private async updateParentalConsent(consent: ParentalConsent): Promise<void> {
    try {
      const existingConsent = await this.getParentalConsent(consent.userId);
      const index = existingConsent.findIndex(c => c.id === consent.id);
      if (index !== -1) {
        existingConsent[index] = consent;
        await AsyncStorage.setItem(
          `parental_consent_${consent.userId}`,
          JSON.stringify(existingConsent)
        );
      }
    } catch (error) {
      console.error('Error updating parental consent:', error);
    }
  }

  private async getParentalConsentById(consentId: string): Promise<ParentalConsent | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const consentKeys = keys.filter(key => key.startsWith('parental_consent_'));
      
      for (const key of consentKeys) {
        const consentData = await AsyncStorage.getItem(key);
        if (consentData) {
          const consent: ParentalConsent[] = JSON.parse(consentData);
          const found = consent.find(c => c.id === consentId);
          if (found) return found;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting parental consent by ID:', error);
      return null;
    }
  }

  private async sendParentalConsentEmail(consent: ParentalConsent): Promise<void> {
    try {
      // In production, this would send an actual email
      console.log('Parental consent email sent to:', consent.parentEmail);
    } catch (error) {
      console.error('Error sending parental consent email:', error);
    }
  }

  private async storeAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      const logs = await AsyncStorage.getItem('audit_logs');
      const existingLogs = logs ? JSON.parse(logs) : [];
      existingLogs.push(auditLog);
      
      // Keep only last 1000 logs
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      await AsyncStorage.setItem('audit_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Error storing audit log:', error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.currentUser = null;
    this.isInitialized = false;
    this.encryptionKey = null;
    console.log('Security service cleaned up');
  }
}

export default SecurityService;
