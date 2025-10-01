// Switch Scanning Overlay Component
// Provides visual and audio feedback for switch scanning

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING } from '../../constants';
import SwitchScanningService, {
  SwitchEvent,
} from '../../services/switchScanningService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

const { width, height } = Dimensions.get('window');

interface SwitchScanningOverlayProps {
  isVisible: boolean;
  onSwitchPress?: (event: SwitchEvent) => void;
}

export default function SwitchScanningOverlay({
  isVisible,
  onSwitchPress,
}: SwitchScanningOverlayProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [scanService] = useState(() => SwitchScanningService.getInstance());
  const [scanState, setScanState] = useState(scanService.getScanState());
  const [settings, setSettings] = useState(scanService.getSettings());
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [scanIndicatorAnimation] = useState(new Animated.Value(0));

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    overlayContainer: {
      backgroundColor: themeColors.surface,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      minWidth: 300,
      maxWidth: width * 0.8,
      shadowColor: themeColors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    scanIndicator: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: themeColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    scanIndicatorText: {
      color: themeColors.surface,
      fontSize: 16,
      fontWeight: 'bold',
    },
    modeContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modeText: {
      color: themeColors.surface,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    modeSubtext: {
      color: themeColors.surface,
      fontSize: 14,
      textAlign: 'center',
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    switchButton: {
      backgroundColor: themeColors.surface,
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      minWidth: 80,
      shadowColor: themeColors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    switchButtonText: {
      color: themeColors.text,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 5,
    },
    settingsInfo: {
      marginTop: 20,
      alignItems: 'center',
    },
    settingsText: {
      color: themeColors.surface,
      fontSize: 12,
      textAlign: 'center',
    },
    scanIndicatorContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    singleSwitchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    dualSwitchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    modeIndicator: {
      alignItems: 'center',
      marginBottom: 20,
    },
  });

  useEffect(() => {
    if (!isVisible) return;

    // Set up event listeners
    const handleSwitchEvent = (event: SwitchEvent) => {
      console.log('Switch event received:', event);
      onSwitchPress?.(event);
    };

    scanService.addEventListener(handleSwitchEvent);

    // Update state when scan state changes
    const updateScanState = () => {
      setScanState(scanService.getScanState());
    };

    // Poll for scan state changes (in a real app, this would be event-driven)
    const interval = setInterval(updateScanState, 100);

    return () => {
      scanService.removeEventListener(handleSwitchEvent);
      clearInterval(interval);
    };
  }, [isVisible, onSwitchPress, scanService]);

  useEffect(() => {
    if (!isVisible) return;

    // Update settings when user settings change
    if (currentUser?.settings?.scanningSettings) {
      const newSettings = {
        ...settings,
        ...currentUser.settings.scanningSettings,
      };
      setSettings(newSettings);
      scanService.updateSettings(newSettings);
    }
  }, [currentUser?.settings?.scanningSettings, isVisible, scanService]);

  useEffect(() => {
    if (scanState.isScanning && settings.visualIndicator) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start scan indicator animation
      Animated.loop(
        Animated.timing(scanIndicatorAnimation, {
          toValue: 1,
          duration: settings.speed,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnimation.setValue(1);
      scanIndicatorAnimation.setValue(0);
    }
  }, [scanState.isScanning, settings.visualIndicator, settings.speed]);

  if (!isVisible || !scanState.isScanning) {
    return null;
  }

  const renderScanIndicator = () => {
    if (!settings.visualIndicator) return null;

    return (
      <View style={styles.scanIndicatorContainer}>
        <Animated.View
          style={[
            styles.scanIndicator,
            {
              transform: [{ scale: pulseAnimation }],
              opacity: scanIndicatorAnimation,
            },
          ]}
        />
        <Text style={styles.scanIndicatorText}>
          {scanState.scanMode === 'row-column'
            ? `Row ${scanState.currentRow + 1}${scanState.isColumnScanning ? `, Column ${scanState.currentColumn + 1}` : ''}`
            : `Item ${scanState.currentItem + 1}`}
        </Text>
      </View>
    );
  };

  const renderSwitchControls = () => {
    if (settings.switchType === 'single') {
      return (
        <View style={styles.singleSwitchContainer}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => scanService.handleSwitchPress('select')}
            accessible={true}
            accessibilityLabel="Select current item"
            accessibilityRole="button"
          >
            <Ionicons
              name="radio-button-on"
              size={32}
              color={themeColors.primary}
            />
            <Text style={styles.switchButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.dualSwitchContainer}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => scanService.handleSwitchPress('next')}
            accessible={true}
            accessibilityLabel="Next item"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={themeColors.primary}
            />
            <Text style={styles.switchButtonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => scanService.handleSwitchPress('select')}
            accessible={true}
            accessibilityLabel="Select current item"
            accessibilityRole="button"
          >
            <Ionicons
              name="radio-button-on"
              size={32}
              color={themeColors.success}
            />
            <Text style={styles.switchButtonText}>Select</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => scanService.handleSwitchPress('previous')}
            accessible={true}
            accessibilityLabel="Previous item"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={themeColors.primary}
            />
            <Text style={styles.switchButtonText}>Previous</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderScanModeIndicator = () => {
    return (
      <View style={styles.modeIndicator}>
        <Text style={styles.modeText}>
          {scanState.scanMode === 'row-column'
            ? 'Row-Column Scan'
            : 'Item Scan'}
        </Text>
        <Text style={styles.modeSubtext}>
          {scanState.scanMode === 'row-column'
            ? scanState.isRowScanning
              ? 'Select row, then column'
              : 'Select column'
            : 'Select item'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* Scan Indicator */}
      {renderScanIndicator()}

      {/* Scan Mode Indicator */}
      {renderScanModeIndicator()}

      {/* Switch Controls */}
      {renderSwitchControls()}

      {/* Settings Info */}
      <View style={styles.settingsInfo}>
        <Text style={styles.settingsText}>
          Speed: {settings.speed}ms | Mode: {settings.mode} | Type:{' '}
          {settings.switchType}
        </Text>
      </View>
    </View>
  );
}
