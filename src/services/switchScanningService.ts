// Switch Scanning Service for Ausmo AAC App
// Provides comprehensive switch scanning functionality for accessibility

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AudioService from './audioService';

export interface SwitchScanningSettings {
  enabled: boolean;
  speed: number; // milliseconds between scans
  mode: 'automatic' | 'step-by-step';
  direction: 'row-column' | 'item';
  visualIndicator: boolean;
  audioIndicator: boolean;
  externalSwitch: boolean;
  switchType: 'single' | 'dual';
  autoSelect: boolean; // auto-select after scan delay
  autoSelectDelay: number; // milliseconds to wait before auto-selecting
  // Enhanced autism-friendly settings
  highlightColor: string; // Color for highlighting items
  highlightStyle: 'border' | 'background' | 'pulse'; // How to highlight items
  audioCues: boolean; // Play audio when scanning items
  hapticFeedback: boolean; // Provide haptic feedback
  pauseOnHover: boolean; // Pause scanning when hovering over items
  scanSound: string; // Sound to play during scanning
  selectSound: string; // Sound to play when selecting
  errorSound: string; // Sound to play on errors
}

export interface ScanState {
  isScanning: boolean;
  currentRow: number;
  currentColumn: number;
  currentItem: number;
  totalRows: number;
  totalColumns: number;
  totalItems: number;
  highlightedButton?: string;
  scanMode: 'row-column' | 'item';
  isRowScanning: boolean;
  isColumnScanning: boolean;
}

export interface SwitchEvent {
  type: 'select' | 'next' | 'previous' | 'start' | 'stop';
  timestamp: number;
  source: 'internal' | 'external';
}

export type SwitchEventHandler = (event: SwitchEvent) => void;

class SwitchScanningService {
  private static instance: SwitchScanningService;
  private settings: SwitchScanningSettings;
  private scanState: ScanState;
  private scanTimer: NodeJS.Timeout | null = null;
  private autoSelectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: SwitchEventHandler[] = [];
  private isInitialized = false;

  // Default settings
  private defaultSettings: SwitchScanningSettings = {
    enabled: false,
    speed: 1000,
    mode: 'automatic',
    direction: 'row-column',
    visualIndicator: true,
    audioIndicator: true,
    externalSwitch: false,
    switchType: 'single',
    autoSelect: false,
    autoSelectDelay: 3000,
    // Enhanced autism-friendly defaults
    highlightColor: '#FFD700', // Bright yellow for high visibility
    highlightStyle: 'border',
    audioCues: true,
    hapticFeedback: true,
    pauseOnHover: false,
    scanSound: 'beep',
    selectSound: 'click',
    errorSound: 'error',
  };

  public static getInstance(): SwitchScanningService {
    if (!SwitchScanningService.instance) {
      SwitchScanningService.instance = new SwitchScanningService();
    }
    return SwitchScanningService.instance;
  }

  private constructor() {
    this.settings = { ...this.defaultSettings };
    this.scanState = {
      isScanning: false,
      currentRow: 0,
      currentColumn: 0,
      currentItem: 0,
      totalRows: 0,
      totalColumns: 0,
      totalItems: 0,
      scanMode: 'row-column',
      isRowScanning: true,
      isColumnScanning: false,
    };
  }

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing Switch Scanning Service...');

      // Set up external switch listeners if enabled
      if (this.settings.externalSwitch) {
        await this.setupExternalSwitchListeners();
      }

      this.isInitialized = true;
      console.log('✅ Switch Scanning Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Switch Scanning Service:', error);
      throw error;
    }
  }

  // Update scanning settings
  updateSettings(newSettings: Partial<SwitchScanningSettings>): void {
    const wasEnabled = this.settings.enabled;
    this.settings = { ...this.settings, ...newSettings };

    // If scanning was disabled, stop current scanning
    if (wasEnabled && !this.settings.enabled) {
      this.stopScanning();
    }

    // If external switch setting changed, update listeners
    if (newSettings.externalSwitch !== undefined) {
      if (newSettings.externalSwitch) {
        this.setupExternalSwitchListeners();
      } else {
        this.removeExternalSwitchListeners();
      }
    }

    console.log('Switch scanning settings updated:', this.settings);
  }

  // Get current settings
  getSettings(): SwitchScanningSettings {
    return { ...this.settings };
  }

  // Get current scan state
  getScanState(): ScanState {
    return { ...this.scanState };
  }

  // Start scanning
  startScanning(
    totalRows: number,
    totalColumns: number,
    totalItems: number,
    scanMode: 'row-column' | 'item' = 'row-column'
  ): void {
    if (!this.settings.enabled) {
      console.log('Switch scanning is disabled');
      return;
    }

    console.log('Starting switch scanning:', {
      totalRows,
      totalColumns,
      totalItems,
      scanMode,
    });

    this.scanState = {
      isScanning: true,
      currentRow: 0,
      currentColumn: 0,
      currentItem: 0,
      totalRows,
      totalColumns,
      totalItems,
      scanMode,
      isRowScanning: scanMode === 'row-column',
      isColumnScanning: false,
    };

    if (this.settings.mode === 'automatic') {
      this.startAutomaticScanning();
    }

    this.emitSwitchEvent({
      type: 'start',
      timestamp: Date.now(),
      source: 'internal',
    });
  }

  // Stop scanning
  stopScanning(): void {
    console.log('Stopping switch scanning');

    this.scanState.isScanning = false;
    this.clearTimers();
    this.emitSwitchEvent({
      type: 'stop',
      timestamp: Date.now(),
      source: 'internal',
    });
  }

  // Handle switch press
  handleSwitchPress(
    switchType: 'select' | 'next' | 'previous' = 'select'
  ): void {
    if (!this.scanState.isScanning) {
      console.log('Not currently scanning, ignoring switch press');
      return;
    }

    console.log('Switch press received:', switchType);

    // Provide haptic feedback for autism users
    if (this.settings.hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Provide enhanced audio feedback for autism users
    if (this.settings.audioCues) {
      this.playEnhancedScanAudio(switchType);
    } else if (this.settings.audioIndicator) {
      this.playScanAudio(switchType);
    }

    switch (switchType) {
      case 'select':
        this.handleSelect();
        break;
      case 'next':
        this.handleNext();
        break;
      case 'previous':
        this.handlePrevious();
        break;
    }

    this.emitSwitchEvent({
      type: switchType,
      timestamp: Date.now(),
      source: 'internal',
    });
  }

  // Handle select action
  private handleSelect(): void {
    if (this.scanState.scanMode === 'row-column') {
      if (this.scanState.isRowScanning) {
        // Move to column scanning
        this.scanState.isRowScanning = false;
        this.scanState.isColumnScanning = true;
        this.scanState.currentColumn = 0;
        console.log(
          'Switched to column scanning, row:',
          this.scanState.currentRow
        );
      } else {
        // Select the current item
        this.selectCurrentItem();
      }
    } else {
      // Item scanning mode - select current item
      this.selectCurrentItem();
    }
  }

  // Handle next action
  private handleNext(): void {
    if (this.scanState.scanMode === 'row-column') {
      if (this.scanState.isRowScanning) {
        this.scanState.currentRow =
          (this.scanState.currentRow + 1) % this.scanState.totalRows;
      } else {
        this.scanState.currentColumn =
          (this.scanState.currentColumn + 1) % this.scanState.totalColumns;
      }
    } else {
      this.scanState.currentItem =
        (this.scanState.currentItem + 1) % this.scanState.totalItems;
    }

    this.updateHighlight();
  }

  // Handle previous action
  private handlePrevious(): void {
    if (this.scanState.scanMode === 'row-column') {
      if (this.scanState.isRowScanning) {
        this.scanState.currentRow =
          this.scanState.currentRow === 0
            ? this.scanState.totalRows - 1
            : this.scanState.currentRow - 1;
      } else {
        this.scanState.currentColumn =
          this.scanState.currentColumn === 0
            ? this.scanState.totalColumns - 1
            : this.scanState.currentColumn - 1;
      }
    } else {
      this.scanState.currentItem =
        this.scanState.currentItem === 0
          ? this.scanState.totalItems - 1
          : this.scanState.currentItem - 1;
    }

    this.updateHighlight();
  }

  // Select current item
  private selectCurrentItem(): void {
    console.log('Selecting current item:', {
      row: this.scanState.currentRow,
      column: this.scanState.currentColumn,
      item: this.scanState.currentItem,
    });

    // Calculate the button ID based on current position
    let buttonId: string;
    if (this.scanState.scanMode === 'row-column') {
      buttonId = `${this.scanState.currentRow}-${this.scanState.currentColumn}`;
    } else {
      buttonId = `item-${this.scanState.currentItem}`;
    }

    this.scanState.highlightedButton = buttonId;
    this.stopScanning();
  }

  // Start automatic scanning
  private startAutomaticScanning(): void {
    this.clearTimers();
    this.scanTimer = setInterval(() => {
      this.handleNext();
    }, this.settings.speed);
  }

  // Update highlight
  private updateHighlight(): void {
    let buttonId: string;
    if (this.scanState.scanMode === 'row-column') {
      if (this.scanState.isRowScanning) {
        buttonId = `row-${this.scanState.currentRow}`;
      } else {
        buttonId = `${this.scanState.currentRow}-${this.scanState.currentColumn}`;
      }
    } else {
      buttonId = `item-${this.scanState.currentItem}`;
    }

    this.scanState.highlightedButton = buttonId;

    // Start auto-select timer if enabled
    if (this.settings.autoSelect && this.settings.autoSelectDelay > 0) {
      this.clearAutoSelectTimer();
      this.autoSelectTimer = setTimeout(() => {
        this.handleSelect();
      }, this.settings.autoSelectDelay);
    }
  }

  // Play scan audio feedback
  private async playScanAudio(
    type: 'select' | 'next' | 'previous'
  ): Promise<void> {
    try {
      const audioMap = {
        select: 'beep-high',
        next: 'beep-medium',
        previous: 'beep-low',
      };

      // Use different audio cues for different actions
      await AudioService.playScanSound(
        audioMap[type] as 'beep-high' | 'beep-medium' | 'beep-low'
      );
    } catch (error) {
      console.error('Error playing scan audio:', error);
    }
  }

  // Set up external switch listeners
  private async setupExternalSwitchListeners(): Promise<void> {
    try {
      // This would integrate with external switch hardware
      // For now, we'll simulate with keyboard events
      console.log('Setting up external switch listeners');

      // In a real implementation, this would:
      // 1. Connect to Bluetooth switch devices
      // 2. Set up USB switch device listeners
      // 3. Configure accessibility switch services
    } catch (error) {
      console.error('Error setting up external switch listeners:', error);
    }
  }

  // Remove external switch listeners
  private removeExternalSwitchListeners(): void {
    console.log('Removing external switch listeners');
    // Clean up external switch connections
  }

  // Clear timers
  private clearTimers(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    this.clearAutoSelectTimer();
  }

  // Clear auto-select timer
  private clearAutoSelectTimer(): void {
    if (this.autoSelectTimer) {
      clearTimeout(this.autoSelectTimer);
      this.autoSelectTimer = null;
    }
  }

  // Add event handler
  addEventListener(handler: SwitchEventHandler): void {
    this.eventHandlers.push(handler);
  }

  // Remove event handler
  removeEventListener(handler: SwitchEventHandler): void {
    this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
  }

  // Emit switch event
  private emitSwitchEvent(event: SwitchEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in switch event handler:', error);
      }
    });
  }

  // Get highlighted button ID
  getHighlightedButton(): string | undefined {
    return this.scanState.highlightedButton;
  }

  // Check if scanning is active
  isScanning(): boolean {
    return this.scanState.isScanning;
  }

  // Reset scan state
  reset(): void {
    this.stopScanning();
    this.scanState = {
      isScanning: false,
      currentRow: 0,
      currentColumn: 0,
      currentItem: 0,
      totalRows: 0,
      totalColumns: 0,
      totalItems: 0,
      scanMode: 'row-column',
      isRowScanning: true,
      isColumnScanning: false,
    };
  }

  // Enhanced audio feedback for autism users
  private async playEnhancedScanAudio(
    switchType: 'select' | 'next' | 'previous'
  ): Promise<void> {
    try {
      let soundToPlay: string;

      switch (switchType) {
        case 'select':
          soundToPlay = this.settings.selectSound;
          break;
        case 'next':
        case 'previous':
          soundToPlay = this.settings.scanSound;
          break;
        default:
          soundToPlay = this.settings.scanSound;
      }

      // Play the appropriate sound
      await this.playScanSound(soundToPlay);
    } catch (error) {
      console.error('Error playing enhanced scan audio:', error);
    }
  }

  // Play specific scan sounds
  private async playScanSound(soundType: string): Promise<void> {
    try {
      // Map sound types to actual audio files or TTS
      switch (soundType) {
        case 'beep':
          // Play a simple beep sound
          await AudioService.playSound('beep');
          break;
        case 'click':
          // Play a click sound
          await AudioService.playSound('click');
          break;
        case 'error':
          // Play an error sound
          await AudioService.playSound('error');
          break;
        default:
          // Fallback to TTS
          await AudioService.speak(soundType);
      }
    } catch (error) {
      console.error('Error playing scan sound:', error);
    }
  }

  // Cleanup
  destroy(): void {
    this.clearTimers();
    this.removeExternalSwitchListeners();
    this.eventHandlers = [];
    this.isInitialized = false;
  }
}

export default SwitchScanningService;
