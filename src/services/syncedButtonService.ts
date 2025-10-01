// Synced Button Service for Ausmo AAC App
// Provides reusable button library functionality similar to GoTalk NOW

import { CommunicationButton, ButtonAction } from '../types';
import { DatabaseService } from './databaseService';
import { SupabaseDatabaseService } from './supabaseDatabaseService';

export interface SyncedButton {
  id: string;
  name: string;
  text: string;
  image?: string;
  ttsMessage?: string;
  action: ButtonAction;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  category: string;
  tags: string[];
  isVisible: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface SyncedButtonLibrary {
  id: string;
  name: string;
  description: string;
  userId: string;
  buttons: SyncedButton[];
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class SyncedButtonService {
  private static instance: SyncedButtonService;
  private databaseService: DatabaseService;
  private supabaseService: SupabaseDatabaseService;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.supabaseService = SupabaseDatabaseService.getInstance();
  }

  public static getInstance(): SyncedButtonService {
    if (!SyncedButtonService.instance) {
      SyncedButtonService.instance = new SyncedButtonService();
    }
    return SyncedButtonService.instance;
  }

  // Create a new synced button
  async createSyncedButton(
    userId: string,
    buttonData: Omit<
      SyncedButton,
      'id' | 'usageCount' | 'createdAt' | 'updatedAt'
    >
  ): Promise<SyncedButton> {
    try {
      const syncedButton: SyncedButton = {
        id: `synced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...buttonData,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to both local and cloud databases
      await this.databaseService.createSyncedButton(syncedButton);
      await this.supabaseService.createSyncedButton(syncedButton);

      return syncedButton;
    } catch (error) {
      console.error('Error creating synced button:', error);
      throw error;
    }
  }

  // Get all synced buttons for a user
  async getSyncedButtons(userId: string): Promise<SyncedButton[]> {
    try {
      // Try cloud first, fallback to local
      try {
        return await this.supabaseService.getSyncedButtons(userId);
      } catch (error) {
        console.log('Cloud sync failed, using local data:', error);
        return await this.databaseService.getSyncedButtons(userId);
      }
    } catch (error) {
      console.error('Error getting synced buttons:', error);
      return [];
    }
  }

  // Get synced buttons by category
  async getSyncedButtonsByCategory(
    userId: string,
    category: string
  ): Promise<SyncedButton[]> {
    try {
      const buttons = await this.getSyncedButtons(userId);
      return buttons.filter(button => button.category === category);
    } catch (error) {
      console.error('Error getting synced buttons by category:', error);
      return [];
    }
  }

  // Search synced buttons
  async searchSyncedButtons(
    userId: string,
    query: string
  ): Promise<SyncedButton[]> {
    try {
      const buttons = await this.getSyncedButtons(userId);
      const lowercaseQuery = query.toLowerCase();

      return buttons.filter(
        button =>
          button.name.toLowerCase().includes(lowercaseQuery) ||
          button.text.toLowerCase().includes(lowercaseQuery) ||
          button.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching synced buttons:', error);
      return [];
    }
  }

  // Update a synced button (affects all instances)
  async updateSyncedButton(
    buttonId: string,
    updates: Partial<SyncedButton>
  ): Promise<SyncedButton> {
    try {
      const updatedButton = {
        ...updates,
        updatedAt: new Date(),
      };

      // Update in both databases
      await this.databaseService.updateSyncedButton(buttonId, updatedButton);
      await this.supabaseService.updateSyncedButton(buttonId, updatedButton);

      // Auto-sync: Update all instances of this button across all pages
      await this.syncButtonInstances(buttonId, updatedButton);

      // Get the updated button
      const button = await this.databaseService.getSyncedButton(buttonId);
      if (!button) {
        throw new Error('Synced button not found after update');
      }

      return button;
    } catch (error) {
      console.error('Error updating synced button:', error);
      throw error;
    }
  }

  // Delete a synced button
  async deleteSyncedButton(buttonId: string): Promise<void> {
    try {
      // Delete from both databases
      await this.databaseService.deleteSyncedButton(buttonId);
      await this.supabaseService.deleteSyncedButton(buttonId);
    } catch (error) {
      console.error('Error deleting synced button:', error);
      throw error;
    }
  }

  // Add a synced button to a page
  async addSyncedButtonToPage(
    buttonId: string,
    pageId: string,
    position: { row: number; column: number; width: number; height: number }
  ): Promise<CommunicationButton> {
    try {
      const syncedButton = await this.databaseService.getSyncedButton(buttonId);
      if (!syncedButton) {
        throw new Error('Synced button not found');
      }

      // Create a communication button from the synced button
      const communicationButton: CommunicationButton = {
        id: `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pageId,
        text: syncedButton.text,
        image: syncedButton.image,
        ttsMessage: syncedButton.ttsMessage,
        action: syncedButton.action,
        position,
        size: syncedButton.size,
        backgroundColor: syncedButton.backgroundColor,
        textColor: syncedButton.textColor,
        borderColor: syncedButton.borderColor,
        borderWidth: syncedButton.borderWidth,
        borderRadius: syncedButton.borderRadius,
        order: 0, // Will be set by the page editor
        isVisible: syncedButton.isVisible,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedButtonId: buttonId, // Reference to the synced button
      };

      // Save the communication button
      await this.databaseService.createButton(communicationButton);
      await this.supabaseService.createButton(communicationButton);

      // Increment usage count
      await this.updateSyncedButton(buttonId, {
        usageCount: syncedButton.usageCount + 1,
      });

      return communicationButton;
    } catch (error) {
      console.error('Error adding synced button to page:', error);
      throw error;
    }
  }

  // Get button categories
  getButtonCategories(): string[] {
    return [
      'actions',
      'animals',
      'body',
      'clothing',
      'colors',
      'communication',
      'emotions',
      'food',
      'home',
      'people',
      'places',
      'school',
      'shapes',
      'time',
      'transportation',
      'weather',
      'custom',
    ];
  }

  // Create default synced buttons
  async createDefaultSyncedButtons(userId: string): Promise<SyncedButton[]> {
    const defaultButtons: Omit<
      SyncedButton,
      'id' | 'usageCount' | 'createdAt' | 'updatedAt'
    >[] = [
      {
        name: 'Yes',
        text: 'Yes',
        image: '✅',
        ttsMessage: 'Yes',
        action: { type: 'speak' },
        backgroundColor: '#E8F5E8',
        textColor: '#2E7D32',
        borderColor: '#4CAF50',
        borderWidth: 2,
        borderRadius: 8,
        size: 'medium',
        category: 'communication',
        tags: ['yes', 'agree', 'confirm'],
        isVisible: true,
        userId,
      },
      {
        name: 'No',
        text: 'No',
        image: '❌',
        ttsMessage: 'No',
        action: { type: 'speak' },
        backgroundColor: '#FFEBEE',
        textColor: '#C62828',
        borderColor: '#F44336',
        borderWidth: 2,
        borderRadius: 8,
        size: 'medium',
        category: 'communication',
        tags: ['no', 'disagree', 'deny'],
        isVisible: true,
        userId,
      },
      {
        name: 'More',
        text: 'More',
        image: '➕',
        ttsMessage: 'More',
        action: { type: 'speak' },
        backgroundColor: '#FFF3E0',
        textColor: '#F57C00',
        borderColor: '#FF9800',
        borderWidth: 2,
        borderRadius: 8,
        size: 'medium',
        category: 'communication',
        tags: ['more', 'additional', 'continue'],
        isVisible: true,
        userId,
      },
      {
        name: 'Help',
        text: 'Help',
        image: '🆘',
        ttsMessage: 'Help',
        action: { type: 'speak' },
        backgroundColor: '#E3F2FD',
        textColor: '#1976D2',
        borderColor: '#2196F3',
        borderWidth: 2,
        borderRadius: 8,
        size: 'medium',
        category: 'communication',
        tags: ['help', 'assistance', 'support'],
        isVisible: true,
        userId,
      },
      {
        name: 'Stop',
        text: 'Stop',
        image: '⏹️',
        ttsMessage: 'Stop',
        action: { type: 'speak' },
        backgroundColor: '#FFEBEE',
        textColor: '#C62828',
        borderColor: '#F44336',
        borderWidth: 2,
        borderRadius: 8,
        size: 'medium',
        category: 'actions',
        tags: ['stop', 'halt', 'end'],
        isVisible: true,
        userId,
      },
    ];

    const createdButtons: SyncedButton[] = [];
    for (const buttonData of defaultButtons) {
      try {
        const button = await this.createSyncedButton(userId, buttonData);
        createdButtons.push(button);
      } catch (error) {
        console.error('Error creating default synced button:', error);
      }
    }

    return createdButtons;
  }

  // Export synced buttons
  async exportSyncedButtons(userId: string): Promise<string> {
    try {
      const buttons = await this.getSyncedButtons(userId);
      return JSON.stringify(buttons, null, 2);
    } catch (error) {
      console.error('Error exporting synced buttons:', error);
      throw error;
    }
  }

  // Import synced buttons
  async importSyncedButtons(
    userId: string,
    jsonData: string
  ): Promise<SyncedButton[]> {
    try {
      const buttons: SyncedButton[] = JSON.parse(jsonData);
      const importedButtons: SyncedButton[] = [];

      for (const button of buttons) {
        try {
          const importedButton = await this.createSyncedButton(userId, {
            name: button.name,
            text: button.text,
            image: button.image,
            ttsMessage: button.ttsMessage,
            action: button.action,
            backgroundColor: button.backgroundColor,
            textColor: button.textColor,
            borderColor: button.borderColor,
            borderWidth: button.borderWidth,
            borderRadius: button.borderRadius,
            size: button.size,
            category: button.category,
            tags: button.tags,
            isVisible: button.isVisible,
            userId,
          });
          importedButtons.push(importedButton);
        } catch (error) {
          console.error('Error importing synced button:', error);
        }
      }

      return importedButtons;
    } catch (error) {
      console.error('Error importing synced buttons:', error);
      throw error;
    }
  }

  // Auto-sync: Update all instances of a synced button across all pages
  private async syncButtonInstances(
    buttonId: string,
    updatedButton: Partial<SyncedButton>
  ): Promise<void> {
    try {
      // Get all communication books for the user
      const userId = updatedButton.userId;
      if (!userId) return;

      const books = await this.databaseService.getBooks(userId);

      for (const book of books) {
        for (const page of book.pages) {
          // Find buttons that reference this synced button
          const buttonsToUpdate = page.buttons.filter(
            button => button.syncedButtonId === buttonId
          );

          if (buttonsToUpdate.length > 0) {
            // Update each button instance
            for (const button of buttonsToUpdate) {
              const updatedButtonInstance = {
                ...button,
                text: updatedButton.text || button.text,
                image: updatedButton.image || button.image,
                ttsMessage: updatedButton.ttsMessage || button.ttsMessage,
                backgroundColor:
                  updatedButton.backgroundColor || button.backgroundColor,
                textColor: updatedButton.textColor || button.textColor,
                borderColor: updatedButton.borderColor || button.borderColor,
                borderWidth: updatedButton.borderWidth || button.borderWidth,
                borderRadius: updatedButton.borderRadius || button.borderRadius,
                size: updatedButton.size || button.size,
                updatedAt: new Date(),
              };

              // Update the button in the page
              await this.databaseService.updateButton(
                button.id,
                updatedButtonInstance
              );
              await this.supabaseService.updateButton(
                button.id,
                updatedButtonInstance
              );
            }

            // Update the page
            await this.databaseService.updatePage(page.id, page);
            await this.supabaseService.updatePage(page.id, page);
          }
        }
      }

      console.log(`Auto-synced button ${buttonId} across all instances`);
    } catch (error) {
      console.error('Error syncing button instances:', error);
    }
  }

  // Get usage analytics for synced buttons
  async getButtonUsageAnalytics(userId: string): Promise<{
    mostUsed: SyncedButton[];
    recentlyUsed: SyncedButton[];
    categoryUsage: { [category: string]: number };
    totalUsage: number;
  }> {
    try {
      const buttons = await this.getSyncedButtons(userId);

      const mostUsed = buttons
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      const recentlyUsed = buttons
        .filter(
          button =>
            button.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ) // Last 7 days
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10);

      const categoryUsage: { [category: string]: number } = {};
      let totalUsage = 0;

      buttons.forEach(button => {
        categoryUsage[button.category] =
          (categoryUsage[button.category] || 0) + button.usageCount;
        totalUsage += button.usageCount;
      });

      return {
        mostUsed,
        recentlyUsed,
        categoryUsage,
        totalUsage,
      };
    } catch (error) {
      console.error('Error getting button usage analytics:', error);
      return {
        mostUsed: [],
        recentlyUsed: [],
        categoryUsage: {},
        totalUsage: 0,
      };
    }
  }

  // Create a synced button from an existing communication button
  async createFromCommunicationButton(
    communicationButton: any,
    userId: string,
    name: string,
    category: string = 'communication'
  ): Promise<SyncedButton> {
    try {
      const syncedButtonData = {
        name,
        text: communicationButton.text,
        image: communicationButton.image,
        ttsMessage: communicationButton.ttsMessage,
        action: communicationButton.action,
        backgroundColor: communicationButton.backgroundColor,
        textColor: communicationButton.textColor,
        borderColor: communicationButton.borderColor,
        borderWidth: communicationButton.borderWidth,
        borderRadius: communicationButton.borderRadius,
        size: communicationButton.size,
        category,
        tags: [name.toLowerCase(), category.toLowerCase()],
        isVisible: true,
        userId,
      };

      return await this.createSyncedButton(userId, syncedButtonData);
    } catch (error) {
      console.error(
        'Error creating synced button from communication button:',
        error
      );
      throw error;
    }
  }
}

export default SyncedButtonService;
