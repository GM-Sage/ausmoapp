// Communication Button Component

import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  View,
  AccessibilityInfo,
} from 'react-native';
import {
  CommunicationButton as CommunicationButtonType,
  ButtonSize,
} from '../../types';
import { TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface CommunicationButtonProps {
  button: CommunicationButtonType;
  onPress: (button: CommunicationButtonType) => void;
  isHighlighted?: boolean;
  isScanning?: boolean;
  size?: ButtonSize;
  scanPosition?: { row: number; column: number };
  isRowHighlighted?: boolean;
  isColumnHighlighted?: boolean;
  // Enhanced autism-friendly highlighting
  highlightColor?: string;
  highlightStyle?: 'border' | 'background' | 'pulse';
  isPulsing?: boolean;
}

export default function CommunicationButton({
  button,
  onPress,
  isHighlighted = false,
  isScanning = false,
  size = 'medium',
  scanPosition,
  isRowHighlighted = false,
  isColumnHighlighted = false,
  highlightColor,
  highlightStyle = 'border',
  isPulsing = false,
}: CommunicationButtonProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  // Use theme-aware highlight color if not provided
  const effectiveHighlightColor = highlightColor || themeColors.highlight;

  const styles = StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      margin: 6,
      minHeight: 80,
      borderWidth: 3,
      borderRadius: 12,
      // backgroundColor and shadowColor will be set dynamically based on theme
    },
    small: {
      minHeight: 60,
      padding: 8,
    },
    medium: {
      minHeight: 80,
      padding: 12,
    },
    large: {
      minHeight: 100,
      padding: 16,
    },
    extraLarge: {
      minHeight: 120,
      padding: 20,
    },
    highlighted: {
      borderColor: themeColors.primary,
      borderWidth: 4,
      shadowOpacity: 0.3,
      elevation: 8,
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    image: {
      width: '80%',
      height: '80%',
      maxWidth: 60,
      maxHeight: 60,
    },
    emojiIcon: {
      fontSize: 50,
      textAlign: 'center',
      lineHeight: 50,
    },
    text: {
      textAlign: 'center',
      fontWeight: 'bold',
      // color will be set dynamically based on theme
      fontSize: 16,
      lineHeight: 20,
    },
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    extraLargeText: {
      fontSize: 20,
    },
    scanIndicator: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: themeColors.primary,
    },
    rowHighlighted: {
      borderWidth: 3,
      borderColor: themeColors.warning,
      shadowColor: themeColors.warning,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 8,
    },
    columnHighlighted: {
      borderWidth: 3,
      borderColor: themeColors.success,
      shadowColor: themeColors.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 8,
    },
  });

  const handlePress = () => {
    console.log('CommunicationButton handlePress called for:', button.text);
    onPress(button);
  };

  const getButtonStyle = () => {
    const baseStyle: any = [styles.button];

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      case 'extra-large':
        baseStyle.push(styles.extraLarge);
        break;
      default:
        baseStyle.push(styles.medium);
    }

    // Enhanced highlighting for autism users
    if (isHighlighted) {
      switch (highlightStyle) {
        case 'border':
          baseStyle.push({
            borderColor: effectiveHighlightColor,
            borderWidth: 4,
            shadowColor: effectiveHighlightColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 8,
          });
          break;
        case 'background':
          baseStyle.push({
            backgroundColor: effectiveHighlightColor + '40', // 40 for transparency
            borderColor: effectiveHighlightColor,
            borderWidth: 3,
          });
          break;
        case 'pulse':
          baseStyle.push({
            borderColor: effectiveHighlightColor,
            borderWidth: 3,
            shadowColor: effectiveHighlightColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isPulsing ? 1.0 : 0.5,
            shadowRadius: isPulsing ? 12 : 6,
            elevation: isPulsing ? 12 : 6,
          });
          break;
        default:
          baseStyle.push(styles.highlighted);
      }
    }

    // Row/column highlighting for switch scanning
    if (isRowHighlighted) {
      baseStyle.push({
        ...styles.rowHighlighted,
        borderColor: effectiveHighlightColor,
        borderWidth: 2,
      });
    }
    if (isColumnHighlighted) {
      baseStyle.push({
        ...styles.columnHighlighted,
        borderColor: effectiveHighlightColor,
        borderWidth: 2,
      });
    }

    // Custom colors with theme fallback
    baseStyle.push({
      backgroundColor: button.backgroundColor || themeColors.surface,
      borderColor: button.borderColor || themeColors.border,
      borderWidth: button.borderWidth || 1,
      borderRadius: button.borderRadius || BORDER_RADIUS.MEDIUM,
      shadowColor: themeColors.text,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    });

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any = [styles.text];

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
      case 'extra-large':
        baseStyle.push(styles.extraLargeText);
        break;
      default:
        baseStyle.push(styles.mediumText);
    }

    // Custom text color with theme fallback
    baseStyle.push({
      color: button.textColor || themeColors.text,
    });

    return baseStyle;
  };

  const getAccessibilityLabel = () => {
    let label = button.text;
    if (button.image) {
      label = `${label}, image`;
    }
    if (button.audioMessage || button.ttsMessage) {
      label = `${label}, speaks: ${button.ttsMessage || 'audio message'}`;
    }
    return label;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="button"
      accessibilityHint="Tap to speak this message"
    >
      {button.image && (
        <View style={styles.imageContainer}>
          {button.image.startsWith('http') ? (
            <Image
              source={{ uri: button.image }}
              style={styles.image}
              resizeMode="contain"
              accessible={false}
            />
          ) : (
            <Text style={styles.emojiIcon}>{button.image}</Text>
          )}
        </View>
      )}

      {button.text && (
        <Text style={getTextStyle()} numberOfLines={2}>
          {button.text}
        </Text>
      )}

      {isScanning && <View style={styles.scanIndicator} />}
    </TouchableOpacity>
  );
}
