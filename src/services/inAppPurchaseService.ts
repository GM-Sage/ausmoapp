// In-App Purchase Service
// Handles premium voices and symbol libraries

import { Platform, Alert } from 'react-native';

export interface PurchaseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'voice' | 'symbol-library' | 'premade-book';
  isPurchased: boolean;
}

export interface PurchaseResult {
  success: boolean;
  itemId?: string;
  error?: string;
}

class InAppPurchaseService {
  private static instance: InAppPurchaseService;
  private purchasedItems: Set<string> = new Set();

  public static getInstance(): InAppPurchaseService {
    if (!InAppPurchaseService.instance) {
      InAppPurchaseService.instance = new InAppPurchaseService();
    }
    return InAppPurchaseService.instance;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      console.log('Initializing In-App Purchase Service...');
      
      // In a real app, you would initialize the platform-specific IAP service here
      // For now, we'll simulate the initialization
      
      // Load previously purchased items
      await this.loadPurchasedItems();
      
      console.log('In-App Purchase Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IAP service:', error);
      throw error;
    }
  }

  // Get available purchase items
  getAvailableItems(): PurchaseItem[] {
    return [
      {
        id: 'symbolstix-library',
        name: 'SymbolStix Library',
        description: 'Professional symbol set with consistent visual style',
        price: 9.99,
        currency: 'USD',
        type: 'symbol-library',
        isPurchased: this.purchasedItems.has('symbolstix-library'),
      },
      {
        id: 'pcs-library',
        name: 'Picture Communication Symbols (PCS)',
        description: 'Comprehensive symbol library for AAC communication',
        price: 7.99,
        currency: 'USD',
        type: 'symbol-library',
        isPurchased: this.purchasedItems.has('pcs-library'),
      },
      {
        id: 'acapela-male-voices',
        name: 'Acapela Male Voices',
        description: 'High-quality male voices for natural speech',
        price: 4.99,
        currency: 'USD',
        type: 'voice',
        isPurchased: this.purchasedItems.has('acapela-male-voices'),
      },
      {
        id: 'acapela-female-voices',
        name: 'Acapela Female Voices',
        description: 'High-quality female voices for natural speech',
        price: 4.99,
        currency: 'USD',
        type: 'voice',
        isPurchased: this.purchasedItems.has('acapela-female-voices'),
      },
      {
        id: 'acapela-child-voices',
        name: 'Acapela Child Voices',
        description: 'High-quality child voices for natural speech',
        price: 4.99,
        currency: 'USD',
        type: 'voice',
        isPurchased: this.purchasedItems.has('acapela-child-voices'),
      },
      {
        id: 'school-communication-book',
        name: 'School Communication Book',
        description: 'Professional communication book for school environment',
        price: 4.99,
        currency: 'USD',
        type: 'premade-book',
        isPurchased: this.purchasedItems.has('school-communication-book'),
      },
      {
        id: 'social-interaction-book',
        name: 'Social Interaction Book',
        description: 'Professional communication book for social interaction',
        price: 6.99,
        currency: 'USD',
        type: 'premade-book',
        isPurchased: this.purchasedItems.has('social-interaction-book'),
      },
      {
        id: 'feelings-emotions-book',
        name: 'Feelings & Emotions Book',
        description: 'Professional communication book for expressing emotions',
        price: 5.99,
        currency: 'USD',
        type: 'premade-book',
        isPurchased: this.purchasedItems.has('feelings-emotions-book'),
      },
    ];
  }

  // Purchase an item
  async purchaseItem(itemId: string): Promise<PurchaseResult> {
    try {
      console.log(`Attempting to purchase item: ${itemId}`);
      
      // In a real app, you would call the platform-specific purchase method here
      // For now, we'll simulate the purchase process
      
      const item = this.getAvailableItems().find(i => i.id === itemId);
      if (!item) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      if (item.isPurchased) {
        return {
          success: false,
          error: 'Item already purchased',
        };
      }

      // Simulate purchase process
      await this.simulatePurchase(item);
      
      // Mark as purchased
      this.purchasedItems.add(itemId);
      await this.savePurchasedItems();
      
      console.log(`Successfully purchased item: ${itemId}`);
      
      return {
        success: true,
        itemId,
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: (error as Error).message || 'Purchase failed',
      };
    }
  }

  // Restore purchases
  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      console.log('Restoring purchases...');
      
      // In a real app, you would call the platform-specific restore method here
      // For now, we'll simulate the restore process
      
      const results: PurchaseResult[] = [];
      
      // Simulate restoring purchases
      await this.loadPurchasedItems();
      
      console.log('Purchases restored successfully');
      
      return results;
    } catch (error) {
      console.error('Restore purchases failed:', error);
      return [{
        success: false,
        error: (error as Error).message || 'Restore failed',
      }];
    }
  }

  // Check if an item is purchased
  isItemPurchased(itemId: string): boolean {
    return this.purchasedItems.has(itemId);
  }

  // Get purchased items
  getPurchasedItems(): string[] {
    return Array.from(this.purchasedItems);
  }

  // Simulate purchase process (for demo purposes)
  private async simulatePurchase(item: PurchaseItem): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Purchase simulation failed'));
        }
      }, 2000);
    });
  }

  // Load purchased items from storage
  private async loadPurchasedItems(): Promise<void> {
    try {
      // In a real app, you would load from secure storage
      // For now, we'll use a simple simulation
      console.log('Loading purchased items...');
      
      // Simulate loading some purchased items
      this.purchasedItems.add('symbolstix-library');
      this.purchasedItems.add('acapela-female-voices');
      
      console.log('Purchased items loaded:', Array.from(this.purchasedItems));
    } catch (error) {
      console.error('Failed to load purchased items:', error);
    }
  }

  // Save purchased items to storage
  private async savePurchasedItems(): Promise<void> {
    try {
      // In a real app, you would save to secure storage
      console.log('Saving purchased items:', Array.from(this.purchasedItems));
    } catch (error) {
      console.error('Failed to save purchased items:', error);
    }
  }

  // Show purchase dialog
  async showPurchaseDialog(item: PurchaseItem): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        `Purchase ${item.name}`,
        `${item.description}\n\nPrice: $${item.price.toFixed(2)}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Purchase',
            onPress: async () => {
              const result = await this.purchaseItem(item.id);
              if (result.success) {
                Alert.alert('Success', 'Purchase completed successfully!');
                resolve(true);
              } else {
                Alert.alert('Error', result.error || 'Purchase failed');
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  // Show restore purchases dialog
  async showRestoreDialog(): Promise<void> {
    Alert.alert(
      'Restore Purchases',
      'This will restore all your previous purchases.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          onPress: async () => {
            const results = await this.restorePurchases();
            if (results.length === 0 || results.every(r => r.success)) {
              Alert.alert('Success', 'Purchases restored successfully!');
            } else {
              Alert.alert('Error', 'Some purchases could not be restored');
            }
          },
        },
      ]
    );
  }

  // Get premium voices
  getPremiumVoices(): string[] {
    const premiumVoiceItems = this.getAvailableItems().filter(
      item => item.type === 'voice' && this.isItemPurchased(item.id)
    );
    
    return premiumVoiceItems.map(item => item.id);
  }

  // Get premium symbol libraries
  getPremiumSymbolLibraries(): string[] {
    const premiumLibraryItems = this.getAvailableItems().filter(
      item => item.type === 'symbol-library' && this.isItemPurchased(item.id)
    );
    
    return premiumLibraryItems.map(item => item.id);
  }

  // Get premium premade books
  getPremiumPremadeBooks(): string[] {
    const premiumBookItems = this.getAvailableItems().filter(
      item => item.type === 'premade-book' && this.isItemPurchased(item.id)
    );
    
    return premiumBookItems.map(item => item.id);
  }
}

export default InAppPurchaseService.getInstance();
