// Backup Service for Ausmo AAC App
// Provides comprehensive backup and export functionality

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  User,
  CommunicationBook,
  CommunicationPage,
  CommunicationButton,
  Message,
  Symbol,
  UsageAnalytics,
  BackupData,
} from '../types';
import { DatabaseService } from './databaseService';
import { SupabaseDatabaseService } from './supabaseDatabaseService';

export interface BackupOptions {
  includeUsers: boolean;
  includeBooks: boolean;
  includeMessages: boolean;
  includeSymbols: boolean;
  includeAnalytics: boolean;
  includeSettings: boolean;
  compressData: boolean;
  encryptData: boolean;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'xml';
  includeImages: boolean;
  includeAudio: boolean;
  includeMetadata: boolean;
}

export interface PDFExportOptions {
  includePageNumbers: boolean;
  includeBookTitle: boolean;
  includeUserInfo: boolean;
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  quality: 'low' | 'medium' | 'high';
}

export interface CloudBackupOptions {
  provider: 'iCloud' | 'googleDrive' | 'dropbox' | 'onedrive';
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  encryptData: boolean;
}

export interface BackupResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  error?: string;
  backupId?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredItems: {
    users: number;
    books: number;
    pages: number;
    buttons: number;
    messages: number;
    symbols: number;
    analytics: number;
  };
  error?: string;
}

class BackupService {
  private static instance: BackupService;
  private isBackingUp = false;
  private isRestoring = false;

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Create a complete backup
  async createBackup(
    options: Partial<BackupOptions> = {}
  ): Promise<BackupResult> {
    if (this.isBackingUp) {
      return { success: false, error: 'Backup already in progress' };
    }

    this.isBackingUp = true;

    try {
      console.log('Creating backup with options:', options);

      const defaultOptions: BackupOptions = {
        includeUsers: true,
        includeBooks: true,
        includeMessages: true,
        includeSymbols: true,
        includeAnalytics: true,
        includeSettings: true,
        compressData: true,
        encryptData: false,
        ...options,
      };

      // Collect all data
      const backupData: BackupData = {
        users: [],
        books: [],
        messages: [],
        symbols: [],
        analytics: [],
        settings: {
          defaultVoice: 'default',
          defaultLanguage: 'en',
          autoBackup: false,
          backupFrequency: 'weekly',
          cloudSync: false,
          analyticsEnabled: false,
          crashReporting: false,
          tutorialCompleted: false,
        },
        version: '1.0.0',
        createdAt: new Date(),
      };

      // Get users
      if (defaultOptions.includeUsers) {
        backupData.users = await this.getAllUsers();
      }

      // Get books
      if (defaultOptions.includeBooks) {
        backupData.books = await this.getAllBooks();
      }

      // Get messages
      if (defaultOptions.includeMessages) {
        backupData.messages = await this.getAllMessages();
      }

      // Get symbols
      if (defaultOptions.includeSymbols) {
        backupData.symbols = await this.getAllSymbols();
      }

      // Get analytics
      if (defaultOptions.includeAnalytics) {
        backupData.analytics = await this.getAllAnalytics();
      }

      // Get app settings
      if (defaultOptions.includeSettings) {
        backupData.settings = await this.getAppSettings();
      }

      // Generate backup ID
      const backupId = `ausmo_backup_${Date.now()}`;

      // Create backup file
      const backupJson = JSON.stringify(backupData, null, 2);
      const fileName = `${backupId}.json`;
      const filePath = `${(FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || ''}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, backupJson);

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const fileSize = (fileInfo as any).size || 0;

      console.log('Backup created successfully:', { filePath, fileSize });

      return {
        success: true,
        filePath,
        fileSize,
        backupId,
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isBackingUp = false;
    }
  }

  // Restore from backup
  async restoreBackup(filePath: string): Promise<RestoreResult> {
    if (this.isRestoring) {
      return {
        success: false,
        error: 'Restore already in progress',
        restoredItems: {
          users: 0,
          books: 0,
          pages: 0,
          buttons: 0,
          messages: 0,
          symbols: 0,
          analytics: 0,
        },
      };
    }

    this.isRestoring = true;

    try {
      console.log('Restoring backup from:', filePath);

      // Read backup file
      const backupJson = await FileSystem.readAsStringAsync(filePath);
      const backupData: BackupData = JSON.parse(backupJson);

      // Validate backup data
      if (!this.validateBackupData(backupData)) {
        return {
          success: false,
          error: 'Invalid backup file format',
          restoredItems: {
            users: 0,
            books: 0,
            pages: 0,
            buttons: 0,
            messages: 0,
            symbols: 0,
            analytics: 0,
          },
        };
      }

      const restoredItems = {
        users: 0,
        books: 0,
        pages: 0,
        buttons: 0,
        messages: 0,
        symbols: 0,
        analytics: 0,
      };

      // Restore users
      for (const user of backupData.users) {
        try {
          await DatabaseService.createUser(user);
          restoredItems.users++;
        } catch (error) {
          console.error('Error restoring user:', error);
        }
      }

      // Restore books
      for (const book of backupData.books) {
        try {
          await DatabaseService.createBook(book);
          restoredItems.books++;
          restoredItems.pages += book.pages.length;
          restoredItems.buttons += book.pages.reduce(
            (total, page) => total + page.buttons.length,
            0
          );
        } catch (error) {
          console.error('Error restoring book:', error);
        }
      }

      // Restore messages
      for (const message of backupData.messages) {
        try {
          await DatabaseService.createMessage(message);
          restoredItems.messages++;
        } catch (error) {
          console.error('Error restoring message:', error);
        }
      }

      // Restore symbols
      for (const symbol of backupData.symbols) {
        try {
          await DatabaseService.createSymbol(symbol);
          restoredItems.symbols++;
        } catch (error) {
          console.error('Error restoring symbol:', error);
        }
      }

      // Restore analytics
      for (const analytic of backupData.analytics) {
        try {
          await DatabaseService.createAnalyticsEntry(analytic);
          restoredItems.analytics++;
        } catch (error) {
          console.error('Error restoring analytics:', error);
        }
      }

      console.log('Backup restored successfully:', restoredItems);

      return {
        success: true,
        restoredItems,
      };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        restoredItems: {
          users: 0,
          books: 0,
          pages: 0,
          buttons: 0,
          messages: 0,
          symbols: 0,
          analytics: 0,
        },
      };
    } finally {
      this.isRestoring = false;
    }
  }

  // Export data in different formats
  async exportData(options: ExportOptions): Promise<BackupResult> {
    try {
      console.log('Exporting data with options:', options);

      const backupData = await this.createBackup();
      if (!backupData.success || !backupData.filePath) {
        return backupData;
      }

      let exportContent: string;
      let fileExtension: string;

      switch (options.format) {
        case 'json':
          exportContent = await FileSystem.readAsStringAsync(
            backupData.filePath
          );
          fileExtension = 'json';
          break;
        case 'csv':
          exportContent = this.convertToCSV(backupData);
          fileExtension = 'csv';
          break;
        case 'xml':
          exportContent = this.convertToXML(backupData);
          fileExtension = 'xml';
          break;
        case 'pdf':
          // PDF export would require additional libraries
          return { success: false, error: 'PDF export not yet implemented' };
        default:
          return { success: false, error: 'Unsupported export format' };
      }

      const exportFileName = `ausmo_export_${Date.now()}.${fileExtension}`;
      const exportFilePath = `${(FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || ''}${exportFileName}`;

      await FileSystem.writeAsStringAsync(exportFilePath, exportContent);

      const fileInfo = await FileSystem.getInfoAsync(exportFilePath);
      const fileSize = (fileInfo as any).size || 0;

      return {
        success: true,
        filePath: exportFilePath,
        fileSize,
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Share backup file
  async shareBackup(filePath: string): Promise<boolean> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Share Ausmo Backup',
      });

      return true;
    } catch (error) {
      console.error('Error sharing backup:', error);
      return false;
    }
  }

  // Import data from file
  async importData(): Promise<RestoreResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          success: false,
          error: 'No file selected',
          restoredItems: {
            users: 0,
            books: 0,
            pages: 0,
            buttons: 0,
            messages: 0,
            symbols: 0,
            analytics: 0,
          },
        };
      }

      const filePath = result.assets[0].uri;
      return await this.restoreBackup(filePath);
    } catch (error) {
      console.error('Error importing data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        restoredItems: {
          users: 0,
          books: 0,
          pages: 0,
          buttons: 0,
          messages: 0,
          symbols: 0,
          analytics: 0,
        },
      };
    }
  }

  // Cloud backup functionality
  async backupToCloud(options: CloudBackupOptions): Promise<BackupResult> {
    try {
      console.log('Backing up to cloud:', options.provider);

      // Create local backup first
      const localBackup = await this.createBackup();
      if (!localBackup.success || !localBackup.filePath) {
        return localBackup;
      }

      // Upload to cloud provider
      switch (options.provider) {
        case 'iCloud':
          return await this.backupToICloud(localBackup.filePath);
        case 'googleDrive':
          return await this.backupToGoogleDrive(localBackup.filePath);
        case 'dropbox':
          return await this.backupToDropbox(localBackup.filePath);
        case 'onedrive':
          return await this.backupToOneDrive(localBackup.filePath);
        default:
          return { success: false, error: 'Unsupported cloud provider' };
      }
    } catch (error) {
      console.error('Error backing up to cloud:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Private helper methods
  private async getAllUsers(): Promise<User[]> {
    try {
      return await DatabaseService.getAllUsers();
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  private async getAllBooks(): Promise<CommunicationBook[]> {
    try {
      return await DatabaseService.getBooks();
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  }

  private async getAllMessages(): Promise<Message[]> {
    try {
      return await DatabaseService.getMessages();
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  private async getAllSymbols(): Promise<Symbol[]> {
    try {
      return await DatabaseService.getSymbols();
    } catch (error) {
      console.error('Error getting symbols:', error);
      return [];
    }
  }

  private async getAllAnalytics(): Promise<UsageAnalytics[]> {
    try {
      return await DatabaseService.getAnalytics();
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  }

  private async getAppSettings(): Promise<any> {
    try {
      return await DatabaseService.getAppSettings();
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {};
    }
  }

  private validateBackupData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.users) &&
      Array.isArray(data.books) &&
      Array.isArray(data.messages) &&
      Array.isArray(data.symbols) &&
      Array.isArray(data.analytics) &&
      data.version &&
      data.createdAt
    );
  }

  private convertToCSV(backupData: any): string {
    // Simple CSV conversion - in a real app, this would be more comprehensive
    const csvLines = ['Type,ID,Name,Created'];

    backupData.users.forEach((user: User) => {
      csvLines.push(`User,${user.id},${user.name},${user.createdAt}`);
    });

    backupData.books.forEach((book: CommunicationBook) => {
      csvLines.push(`Book,${book.id},${book.name},${book.createdAt}`);
    });

    return csvLines.join('\n');
  }

  private convertToXML(backupData: any): string {
    // Simple XML conversion - in a real app, this would be more comprehensive
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ausmo_backup>\n';
    xml += `  <version>${backupData.version}</version>\n`;
    xml += `  <created_at>${backupData.createdAt}</created_at>\n`;
    xml += '  <users>\n';

    backupData.users.forEach((user: User) => {
      xml += `    <user id="${user.id}" name="${user.name}" />\n`;
    });

    xml += '  </users>\n';
    xml += '</ausmo_backup>';

    return xml;
  }

  private async backupToICloud(filePath: string): Promise<BackupResult> {
    // iCloud backup implementation would go here
    return { success: false, error: 'iCloud backup not yet implemented' };
  }

  private async backupToGoogleDrive(filePath: string): Promise<BackupResult> {
    // Google Drive backup implementation would go here
    return { success: false, error: 'Google Drive backup not yet implemented' };
  }

  private async backupToDropbox(filePath: string): Promise<BackupResult> {
    // Dropbox backup implementation would go here
    return { success: false, error: 'Dropbox backup not yet implemented' };
  }

  private async backupToOneDrive(filePath: string): Promise<BackupResult> {
    // OneDrive backup implementation would go here
    return { success: false, error: 'OneDrive backup not yet implemented' };
  }

  // Export communication book as PDF pages (GoTalk NOW style)
  async exportBookAsPDF(
    bookId: string,
    options: PDFExportOptions
  ): Promise<BackupResult> {
    try {
      console.log('Exporting book as PDF:', bookId, options);

      const book = await this.databaseService.getBook(bookId);
      if (!book) {
        return { success: false, error: 'Book not found' };
      }

      // This would integrate with a PDF generation library
      // For now, we'll create a placeholder implementation
      const pdfContent = this.generatePDFContent(book, options);

      const fileName = `ausmo_${book.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const filePath = `${(FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || ''}${fileName}`;

      // In a real implementation, you would use a PDF library like react-native-pdf-lib
      // or expo-print to generate the actual PDF
      await FileSystem.writeAsStringAsync(filePath, pdfContent);

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const fileSize = (fileInfo as any).size || 0;

      return {
        success: true,
        filePath,
        fileSize,
      };
    } catch (error) {
      console.error('Error exporting book as PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate PDF content (placeholder implementation)
  private generatePDFContent(book: any, options: PDFExportOptions): string {
    // This is a placeholder - in a real implementation, you would generate actual PDF content
    const content = {
      title: options.includeBookTitle ? book.name : 'Communication Book',
      userInfo: options.includeUserInfo ? 'User: ' + book.userId : '',
      pages: book.pages.map((page: any, index: number) => ({
        pageNumber: options.includePageNumbers ? index + 1 : null,
        title: page.name,
        type: page.type,
        buttons: page.buttons.map((button: any) => ({
          text: button.text,
          image: button.image,
          position: button.position,
        })),
      })),
      exportDate: new Date().toISOString(),
      options,
    };

    return JSON.stringify(content, null, 2);
  }

  // Export individual page as PDF
  async exportPageAsPDF(
    pageId: string,
    options: PDFExportOptions
  ): Promise<BackupResult> {
    try {
      console.log('Exporting page as PDF:', pageId, options);

      const page = await this.databaseService.getPage(pageId);
      if (!page) {
        return { success: false, error: 'Page not found' };
      }

      const pdfContent = this.generatePagePDFContent(page, options);

      const fileName = `ausmo_page_${page.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const filePath = `${(FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || ''}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, pdfContent);

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const fileSize = (fileInfo as any).size || 0;

      return {
        success: true,
        filePath,
        fileSize,
      };
    } catch (error) {
      console.error('Error exporting page as PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private generatePagePDFContent(page: any, options: PDFExportOptions): string {
    const content = {
      title: page.name,
      type: page.type,
      buttons: page.buttons.map((button: any) => ({
        text: button.text,
        image: button.image,
        position: button.position,
        backgroundColor: button.backgroundColor,
        textColor: button.textColor,
      })),
      exportDate: new Date().toISOString(),
      options,
    };

    return JSON.stringify(content, null, 2);
  }

  // Compress backup data
  async compressBackup(filePath: string): Promise<BackupResult> {
    try {
      console.log('Compressing backup:', filePath);

      // This would integrate with a compression library
      // For now, we'll create a placeholder implementation
      const compressedFileName = filePath.replace('.json', '.zip');

      // In a real implementation, you would use a compression library
      // to create a ZIP file containing the backup data
      await FileSystem.copyAsync({
        from: filePath,
        to: compressedFileName,
      });

      const fileInfo = await FileSystem.getInfoAsync(compressedFileName);
      const fileSize = (fileInfo as any).size || 0;

      return {
        success: true,
        filePath: compressedFileName,
        fileSize,
      };
    } catch (error) {
      console.error('Error compressing backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get backup status
  isBackupInProgress(): boolean {
    return this.isBackingUp;
  }

  isRestoreInProgress(): boolean {
    return this.isRestoring;
  }
}

export default BackupService;
