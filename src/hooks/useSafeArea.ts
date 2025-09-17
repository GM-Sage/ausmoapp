// Safe Area Hook for Ausmo AAC App
// Provides safe area measurements and utilities

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Platform, Dimensions } from 'react-native';

export interface SafeAreaMeasurements {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  hasNotch: boolean;
  hasHomeIndicator: boolean;
  isLandscape: boolean;
  isTablet: boolean;
  isSmallScreen: boolean;
}

export const useSafeArea = (): SafeAreaMeasurements => {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');

  return useMemo(() => {
    const isLandscape = width > height;
    const isTablet = Math.min(width, height) >= 768;
    const isSmallScreen = Math.min(width, height) < 375;
    
    // Detect notch (top inset > 20 on iOS)
    const hasNotch = Platform.OS === 'ios' && insets.top > 20;
    
    // Detect home indicator (bottom inset > 0 on iOS)
    const hasHomeIndicator = Platform.OS === 'ios' && insets.bottom > 0;

    return {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
      width,
      height,
      availableWidth: width - insets.left - insets.right,
      availableHeight: height - insets.top - insets.bottom,
      hasNotch,
      hasHomeIndicator,
      isLandscape,
      isTablet,
      isSmallScreen,
    };
  }, [insets, width, height]);
};

// Hook for communication screen specific measurements
export const useCommunicationSafeArea = () => {
  const safeArea = useSafeArea();
  
  return useMemo(() => ({
    ...safeArea,
    // Communication specific calculations
    buttonAreaHeight: safeArea.availableHeight * 0.7, // 70% for buttons
    headerHeight: 60 + safeArea.top, // Header + safe area
    footerHeight: 80 + safeArea.bottom, // Footer + safe area
    gridPadding: Math.min(safeArea.left, safeArea.right, 16), // Minimum padding
    buttonSpacing: safeArea.isSmallScreen ? 8 : 12, // Adaptive spacing
  }), [safeArea]);
};

// Hook for settings screen specific measurements
export const useSettingsSafeArea = () => {
  const safeArea = useSafeArea();
  
  return useMemo(() => ({
    ...safeArea,
    // Settings specific calculations
    listItemHeight: 60,
    sectionHeaderHeight: 40,
    contentPadding: 16,
    maxContentWidth: Math.min(safeArea.availableWidth, 600), // Max width for readability
  }), [safeArea]);
};

// Hook for modal specific measurements
export const useModalSafeArea = () => {
  const safeArea = useSafeArea();
  
  return useMemo(() => ({
    ...safeArea,
    // Modal specific calculations
    modalMaxHeight: safeArea.availableHeight * 0.9, // 90% of available height
    modalMaxWidth: safeArea.availableWidth * 0.95, // 95% of available width
    modalPadding: 20,
    closeButtonSize: 44, // Minimum touch target
  }), [safeArea]);
};

// Hook for keyboard specific measurements
export const useKeyboardSafeArea = () => {
  const safeArea = useSafeArea();
  
  return useMemo(() => ({
    ...safeArea,
    // Keyboard specific calculations
    keyboardAvoidanceHeight: safeArea.bottom + 20, // Extra padding for keyboard
    inputAreaHeight: 60 + safeArea.bottom, // Input area height
    suggestionAreaHeight: 50, // Suggestion bar height
  }), [safeArea]);
};

export default useSafeArea;
