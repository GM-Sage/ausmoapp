// Communication Button Component

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  Image, 
  StyleSheet, 
  View,
  AccessibilityInfo 
} from 'react-native';
import { CommunicationButton as CommunicationButtonType, ButtonSize } from '../../types';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';

interface CommunicationButtonProps {
  button: CommunicationButtonType;
  onPress: (button: CommunicationButtonType) => void;
  isHighlighted?: boolean;
  isScanning?: boolean;
  size?: ButtonSize;
  scanPosition?: { row: number; column: number };
  isRowHighlighted?: boolean;
  isColumnHighlighted?: boolean;
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
}: CommunicationButtonProps) {
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

    // Highlighted style for scanning
    if (isHighlighted) {
      baseStyle.push(styles.highlighted);
    }

    // Row/column highlighting for switch scanning
    if (isRowHighlighted) {
      baseStyle.push(styles.rowHighlighted);
    }
    if (isColumnHighlighted) {
      baseStyle.push(styles.columnHighlighted);
    }

    // Custom colors
    baseStyle.push({
      backgroundColor: button.backgroundColor,
      borderColor: button.borderColor,
      borderWidth: button.borderWidth,
      borderRadius: button.borderRadius,
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

    // Custom text color
    baseStyle.push({
      color: button.textColor,
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
            <Text style={styles.emojiIcon}>
              {button.image}
            </Text>
          )}
        </View>
      )}
      
      {button.text && (
        <Text style={getTextStyle()} numberOfLines={2}>
          {button.text}
        </Text>
      )}
      
      {isScanning && (
        <View style={styles.scanIndicator} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    margin: 6,
    minHeight: 80,
    borderWidth: 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
    borderColor: COLORS.PRIMARY,
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
    color: '#000000',
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
    backgroundColor: COLORS.PRIMARY,
  },
  rowHighlighted: {
    borderWidth: 3,
    borderColor: COLORS.WARNING,
    shadowColor: COLORS.WARNING,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  columnHighlighted: {
    borderWidth: 3,
    borderColor: COLORS.SUCCESS,
    shadowColor: COLORS.SUCCESS,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
