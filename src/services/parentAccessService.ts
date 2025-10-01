// Parent Access Service
// Manages parent access codes for switching from child to parent account

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface ParentAccessCode {
  id: string;
  code: string;
  parentUserId: string;
  childUserId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

class ParentAccessService {
  private static instance: ParentAccessService;
  private readonly STORAGE_KEY = 'parent_access_codes';
  private readonly DEFAULT_CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_HOURS = 24;

  private constructor() {}

  static getInstance(): ParentAccessService {
    if (!ParentAccessService.instance) {
      ParentAccessService.instance = new ParentAccessService();
    }
    return ParentAccessService.instance;
  }

  /**
   * Generate a new parent access code
   */
  async generateAccessCode(
    parentUserId: string,
    childUserId: string
  ): Promise<string> {
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const accessCode: ParentAccessCode = {
        id: `code_${Date.now()}`,
        code,
        parentUserId,
        childUserId,
        createdAt: new Date(),
        expiresAt: new Date(
          Date.now() + this.CODE_EXPIRY_HOURS * 60 * 60 * 1000
        ),
        isActive: true,
      };

      // Store the code
      await this.storeAccessCode(accessCode);

      console.log(
        `Generated parent access code: ${code} for parent ${parentUserId} and child ${childUserId}`
      );
      return code;
    } catch (error) {
      console.error('Error generating access code:', error);
      throw new Error('Failed to generate access code');
    }
  }

  /**
   * Validate a parent access code
   */
  async validateAccessCode(
    code: string,
    childUserId: string
  ): Promise<ParentAccessCode | null> {
    try {
      const accessCodes = await this.getAccessCodes();

      const validCode = accessCodes.find(
        accessCode =>
          accessCode.code === code &&
          accessCode.childUserId === childUserId &&
          accessCode.isActive &&
          new Date() < accessCode.expiresAt
      );

      if (validCode) {
        console.log(`Valid access code found for child ${childUserId}`);
        return validCode;
      }

      console.log(`Invalid or expired access code: ${code}`);
      return null;
    } catch (error) {
      console.error('Error validating access code:', error);
      return null;
    }
  }

  /**
   * Deactivate an access code after use
   */
  async deactivateAccessCode(codeId: string): Promise<void> {
    try {
      const accessCodes = await this.getAccessCodes();
      const updatedCodes = accessCodes.map(code =>
        code.id === codeId ? { ...code, isActive: false } : code
      );

      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedCodes)
      );
      console.log(`Deactivated access code: ${codeId}`);
    } catch (error) {
      console.error('Error deactivating access code:', error);
    }
  }

  /**
   * Get all access codes for a parent
   */
  async getParentAccessCodes(
    parentUserId: string
  ): Promise<ParentAccessCode[]> {
    try {
      const accessCodes = await this.getAccessCodes();
      return accessCodes.filter(
        code => code.parentUserId === parentUserId && code.isActive
      );
    } catch (error) {
      console.error('Error getting parent access codes:', error);
      return [];
    }
  }

  /**
   * Clean up expired codes
   */
  async cleanupExpiredCodes(): Promise<void> {
    try {
      const accessCodes = await this.getAccessCodes();
      const activeCodes = accessCodes.filter(
        code => code.isActive && new Date() < code.expiresAt
      );

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(activeCodes));
      console.log(
        `Cleaned up ${accessCodes.length - activeCodes.length} expired codes`
      );
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  }

  /**
   * Store an access code
   */
  private async storeAccessCode(accessCode: ParentAccessCode): Promise<void> {
    try {
      const existingCodes = await this.getAccessCodes();
      const updatedCodes = [...existingCodes, accessCode];

      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedCodes)
      );
    } catch (error) {
      console.error('Error storing access code:', error);
      throw error;
    }
  }

  /**
   * Get all stored access codes
   */
  private async getAccessCodes(): Promise<ParentAccessCode[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const codes = JSON.parse(stored);
      // Convert date strings back to Date objects
      return codes.map((code: any) => ({
        ...code,
        createdAt: new Date(code.createdAt),
        expiresAt: new Date(code.expiresAt),
      }));
    } catch (error) {
      console.error('Error getting access codes:', error);
      return [];
    }
  }

  /**
   * Generate a simple code for demo purposes
   */
  generateSimpleCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Show parent access instructions
   */
  showParentAccessInstructions(code: string): void {
    Alert.alert(
      'Parent Access Code',
      `Your access code is: ${code}\n\nThis code allows you to switch back to your parent account from your child's account.\n\nCode expires in ${this.CODE_EXPIRY_HOURS} hours.`,
      [{ text: 'OK', style: 'default' }]
    );
  }
}

export default ParentAccessService;
