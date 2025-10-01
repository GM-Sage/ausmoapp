// Template Sharing Service
// Handles all sharing methods: email, AirDrop, WiFi, PDF export, and community sharing

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { Platform } from 'react-native';
import {
  CommunicationBook,
  CommunicationPage,
  CommunicationButton,
} from '../types';

export interface ShareOptions {
  method: 'email' | 'airdrop' | 'wifi' | 'pdf' | 'community';
  recipients?: string[];
  subject?: string;
  message?: string;
  includeImages?: boolean;
  includeAudio?: boolean;
  compressImages?: boolean;
  password?: string;
}

export interface ShareResult {
  success: boolean;
  method: string;
  message?: string;
  error?: string;
  filePath?: string;
  shareId?: string;
}

export interface TemplatePackage {
  id: string;
  title: string;
  description: string;
  version: string;
  author: string;
  authorId: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageRange: string;
  language: string;
  book: CommunicationBook;
  thumbnail?: string;
  previewImages: string[];
  downloadCount: number;
  rating: number;
  reviews: TemplateReview[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface SharingSession {
  id: string;
  hostId: string;
  hostName: string;
  sessionName: string;
  password?: string;
  participants: SharingParticipant[];
  templates: TemplatePackage[];
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface SharingParticipant {
  id: string;
  name: string;
  deviceId: string;
  joinedAt: Date;
}

class TemplateSharingService {
  private static instance: TemplateSharingService;
  private activeSessions: Map<string, SharingSession> = new Map();
  private communityTemplates: TemplatePackage[] = [];

  private constructor() {
    this.initializeCommunityTemplates();
  }

  public static getInstance(): TemplateSharingService {
    if (!TemplateSharingService.instance) {
      TemplateSharingService.instance = new TemplateSharingService();
    }
    return TemplateSharingService.instance;
  }

  // Initialize with sample community templates
  private async initializeCommunityTemplates(): Promise<void> {
    // This would load from your database/service
    this.communityTemplates = [
      {
        id: 'template_1',
        title: 'Basic Communication Starter',
        description: 'Essential words and phrases for beginning communicators',
        version: '1.0',
        author: 'Ausmo Team',
        authorId: 'system',
        category: 'Basic Communication',
        tags: ['beginner', 'essential', 'daily'],
        difficulty: 'beginner',
        ageRange: '3-8',
        language: 'English',
        book: this.createSampleBook(),
        downloadCount: 1250,
        rating: 4.8,
        reviews: [],
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Create a template package from a communication book
  async createTemplatePackage(
    book: CommunicationBook,
    metadata: Omit<
      TemplatePackage,
      | 'id'
      | 'book'
      | 'downloadCount'
      | 'rating'
      | 'reviews'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Promise<TemplatePackage> {
    const template: TemplatePackage = {
      ...metadata,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      book,
      downloadCount: 0,
      rating: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return template;
  }

  // Share via email
  async shareViaEmail(
    book: CommunicationBook,
    options: ShareOptions
  ): Promise<ShareResult> {
    try {
      const packageData = await this.createSharePackage(book, options);
      const filePath = await this.savePackageToFile(packageData, 'email');

      const emailOptions = {
        recipients: options.recipients || [],
        subject: options.subject || `${book.title} - Communication Book`,
        body:
          options.message ||
          `Please find attached the communication book "${book.title}" shared from Ausmo.`,
        attachments: [filePath],
      };

      const result = await MailComposer.composeAsync(emailOptions);

      return {
        success: result.status === 'sent',
        method: 'email',
        message:
          result.status === 'sent'
            ? 'Email sent successfully'
            : 'Email cancelled',
        filePath,
      };
    } catch (error) {
      console.error('Error sharing via email:', error);
      return {
        success: false,
        method: 'email',
        error: 'Failed to send email',
      };
    }
  }

  // Share via AirDrop (iOS)
  async shareViaAirDrop(
    book: CommunicationBook,
    options: ShareOptions
  ): Promise<ShareResult> {
    try {
      if (Platform.OS !== 'ios') {
        return {
          success: false,
          method: 'airdrop',
          error: 'AirDrop is only available on iOS',
        };
      }

      const packageData = await this.createSharePackage(book, options);
      const filePath = await this.savePackageToFile(packageData, 'airdrop');

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: `Share "${book.title}"`,
        });

        return {
          success: true,
          method: 'airdrop',
          message: 'Shared via AirDrop successfully',
          filePath,
        };
      } else {
        return {
          success: false,
          method: 'airdrop',
          error: 'AirDrop not available',
        };
      }
    } catch (error) {
      console.error('Error sharing via AirDrop:', error);
      return {
        success: false,
        method: 'airdrop',
        error: 'Failed to share via AirDrop',
      };
    }
  }

  // Create WiFi sharing session
  async createWiFiSession(
    hostId: string,
    hostName: string,
    sessionName: string,
    password?: string
  ): Promise<SharingSession> {
    const session: SharingSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hostId,
      hostName,
      sessionName,
      password,
      participants: [],
      templates: [],
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  // Join WiFi sharing session
  async joinWiFiSession(
    sessionId: string,
    participantName: string,
    password?: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return false;
    }

    if (session.password && session.password !== password) {
      return false;
    }

    if (session.expiresAt < new Date()) {
      return false;
    }

    const participant: SharingParticipant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: participantName,
      deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
      joinedAt: new Date(),
    };

    session.participants.push(participant);
    return true;
  }

  // Share template in WiFi session
  async shareInWiFiSession(
    sessionId: string,
    template: TemplatePackage
  ): Promise<ShareResult> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        method: 'wifi',
        error: 'Session not found',
      };
    }

    if (!session.isActive) {
      return {
        success: false,
        method: 'wifi',
        error: 'Session is not active',
      };
    }

    session.templates.push(template);

    return {
      success: true,
      method: 'wifi',
      message: 'Template shared in session',
      shareId: session.id,
    };
  }

  // Export to PDF
  async exportToPDF(
    book: CommunicationBook,
    options: ShareOptions
  ): Promise<ShareResult> {
    try {
      const pdfData = await this.generatePDF(book, options);
      const fileName = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const filePath = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(filePath, pdfData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/pdf',
          dialogTitle: `Export "${book.title}" as PDF`,
        });
      }

      return {
        success: true,
        method: 'pdf',
        message: 'PDF exported successfully',
        filePath,
      };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return {
        success: false,
        method: 'pdf',
        error: 'Failed to export PDF',
      };
    }
  }

  // Share to community gallery
  async shareToCommunity(template: TemplatePackage): Promise<ShareResult> {
    try {
      this.communityTemplates.push(template);

      // This would integrate with your database service
      // await this.supabaseService.createTemplatePackage(template);

      return {
        success: true,
        method: 'community',
        message: 'Template shared to community gallery',
        shareId: template.id,
      };
    } catch (error) {
      console.error('Error sharing to community:', error);
      return {
        success: false,
        method: 'community',
        error: 'Failed to share to community',
      };
    }
  }

  // Get community templates
  async getCommunityTemplates(
    category?: string,
    difficulty?: string
  ): Promise<TemplatePackage[]> {
    let templates = this.communityTemplates.filter(t => t.isPublic);

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (difficulty) {
      templates = templates.filter(t => t.difficulty === difficulty);
    }

    return templates.sort((a, b) => b.rating - a.rating);
  }

  // Download template from community
  async downloadTemplate(
    templateId: string,
    userId: string
  ): Promise<CommunicationBook | null> {
    try {
      const template = this.communityTemplates.find(t => t.id === templateId);

      if (!template) {
        return null;
      }

      // Increment download count
      template.downloadCount++;

      // This would integrate with your database service
      // await this.supabaseService.incrementTemplateDownloads(templateId);

      return template.book;
    } catch (error) {
      console.error('Error downloading template:', error);
      return null;
    }
  }

  // Rate and review template
  async rateTemplate(
    templateId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<boolean> {
    try {
      const template = this.communityTemplates.find(t => t.id === templateId);

      if (!template) {
        return false;
      }

      const review: TemplateReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        rating,
        comment,
        createdAt: new Date(),
      };

      template.reviews.push(review);

      // Recalculate average rating
      const totalRating = template.reviews.reduce(
        (sum, r) => sum + r.rating,
        0
      );
      template.rating = totalRating / template.reviews.length;

      return true;
    } catch (error) {
      console.error('Error rating template:', error);
      return false;
    }
  }

  // Create share package
  private async createSharePackage(
    book: CommunicationBook,
    options: ShareOptions
  ): Promise<any> {
    const packageData = {
      version: '1.0',
      type: 'communication_book',
      title: book.title,
      description: book.description,
      author: book.author,
      createdAt: new Date().toISOString(),
      book: {
        ...book,
        pages: await this.processPagesForSharing(book.pages, options),
      },
      sharingOptions: {
        includeImages: options.includeImages,
        includeAudio: options.includeAudio,
        compressImages: options.compressImages,
      },
    };

    return packageData;
  }

  // Process pages for sharing
  private async processPagesForSharing(
    pages: CommunicationPage[],
    options: ShareOptions
  ): Promise<CommunicationPage[]> {
    return pages.map(page => ({
      ...page,
      buttons: page.buttons.map(button => ({
        ...button,
        image: options.includeImages ? button.image : undefined,
        audioUrl: options.includeAudio ? button.audioUrl : undefined,
      })),
    }));
  }

  // Save package to file
  private async savePackageToFile(
    packageData: any,
    method: string
  ): Promise<string> {
    const fileName = `${packageData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${method}_${Date.now()}.json`;
    const filePath = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(packageData, null, 2)
    );
    return filePath;
  }

  // Generate PDF
  private async generatePDF(
    book: CommunicationBook,
    options: ShareOptions
  ): Promise<string> {
    // This is a simplified PDF generation
    // In a real implementation, you'd use a library like react-native-pdf or similar
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${book.title}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF
    `;

    return Buffer.from(pdfContent).toString('base64');
  }

  // Create sample book for testing
  private createSampleBook(): CommunicationBook {
    return {
      id: 'sample_book',
      title: 'Basic Communication Starter',
      description: 'Essential words and phrases for beginning communicators',
      author: 'Ausmo Team',
      pages: [
        {
          id: 'page_1',
          title: 'Basic Needs',
          buttons: [
            {
              id: 'btn_1',
              text: 'Help',
              image: 'help_icon.png',
              audioUrl: 'help.mp3',
              backgroundColor: '#FF6B6B',
              textColor: '#FFFFFF',
            },
            {
              id: 'btn_2',
              text: 'More',
              image: 'more_icon.png',
              audioUrl: 'more.mp3',
              backgroundColor: '#4ECDC4',
              textColor: '#FFFFFF',
            },
          ],
        },
      ],
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get active WiFi sessions
  getActiveWiFiSessions(): SharingSession[] {
    return Array.from(this.activeSessions.values()).filter(
      session => session.isActive && session.expiresAt > new Date()
    );
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.expiresAt < now) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

export default TemplateSharingService;
