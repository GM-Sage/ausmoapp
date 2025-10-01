// Standard Button Component
// Provides consistent button styling and accessibility across the app

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  COMPONENT_STYLES,
  RESPONSIVE,
} from '../../constants';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export interface StandardButtonProps {
  title: string;
  onPress: () => void;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'warning'
    | 'error';
  size?: 'small' | 'medium' | 'large' | 'extraLarge';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const BUTTON_SIZES = {
  small: {
    height: RESPONSIVE.getButtonHeight(36),
    paddingHorizontal: RESPONSIVE.getSpacing(12),
    fontSize: RESPONSIVE.getFontSize(14),
    iconSize: RESPONSIVE.getIconSize(16),
    borderRadius: BORDER_RADIUS.SM,
  },
  medium: {
    height: RESPONSIVE.getButtonHeight(44),
    paddingHorizontal: RESPONSIVE.getSpacing(16),
    fontSize: RESPONSIVE.getFontSize(16),
    iconSize: RESPONSIVE.getIconSize(20),
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  large: {
    height: RESPONSIVE.getButtonHeight(52),
    paddingHorizontal: RESPONSIVE.getSpacing(20),
    fontSize: RESPONSIVE.getFontSize(18),
    iconSize: RESPONSIVE.getIconSize(24),
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  extraLarge: {
    height: RESPONSIVE.getButtonHeight(60),
    paddingHorizontal: RESPONSIVE.getSpacing(24),
    fontSize: RESPONSIVE.getFontSize(20),
    iconSize: RESPONSIVE.getIconSize(28),
    borderRadius: BORDER_RADIUS.LARGE,
  },
};

const getButtonVariants = (safeThemeColors: any) => ({
  primary: {
    backgroundColor: safeThemeColors.primary,
    borderColor: safeThemeColors.primary,
    textColor: safeThemeColors.surface,
    disabledBackgroundColor: safeThemeColors.textSecondary,
    disabledBorderColor: safeThemeColors.textSecondary,
    disabledTextColor: safeThemeColors.surface,
  },
  secondary: {
    backgroundColor: safeThemeColors.secondary,
    borderColor: safeThemeColors.secondary,
    textColor: safeThemeColors.surface,
    disabledBackgroundColor: safeThemeColors.textSecondary,
    disabledBorderColor: safeThemeColors.textSecondary,
    disabledTextColor: safeThemeColors.surface,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: safeThemeColors.primary,
    textColor: safeThemeColors.primary,
    disabledBackgroundColor: 'transparent',
    disabledBorderColor: safeThemeColors.textSecondary,
    disabledTextColor: safeThemeColors.textSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: safeThemeColors.primary,
    disabledBackgroundColor: 'transparent',
    disabledBorderColor: 'transparent',
    disabledTextColor: safeThemeColors.textSecondary,
  },
  success: {
    backgroundColor: safeThemeColors.success,
    borderColor: safeThemeColors.success,
    textColor: safeThemeColors.surface,
    disabledBackgroundColor: safeThemeColors.textSecondary,
    disabledBorderColor: safeThemeColors.textSecondary,
    disabledTextColor: safeThemeColors.surface,
  },
  warning: {
    backgroundColor: safeThemeColors.warning,
    borderColor: safeThemeColors.warning,
    textColor: safeThemeColors.surface,
    disabledBackgroundColor: safeThemeColors.textSecondary,
    disabledBorderColor: safeThemeColors.textSecondary,
    disabledTextColor: safeThemeColors.surface,
  },
  error: {
    backgroundColor: safeThemeColors.error,
    borderColor: safeThemeColors.error,
    textColor: safeThemeColors.surface,
    disabledBackgroundColor: safeThemeColors.textSecondary,
    disabledBorderColor: safeThemeColors.textSecondary,
    disabledTextColor: safeThemeColors.surface,
  },
});

export default function StandardButton({
  title,
  onPress,
  variant = 'primary',
  size,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}: StandardButtonProps) {
  const userButtonSizeSetting =
    useSelector(
      (state: RootState) =>
        state.user.currentUser?.settings?.visualSettings?.buttonSize
    ) || 'medium';
  const { theme, themeColors } = useVisualSettings();
  const safeThemeColors = themeColors || getThemeColors(theme || 'light');
  const styles = getStyles(safeThemeColors);

  // Map 'extra-large' from settings to component's 'extraLarge' key
  const resolvedSizeKey = (size || userButtonSizeSetting).replace(
    'extra-large',
    'extraLarge'
  ) as keyof typeof BUTTON_SIZES;
  const buttonSize = BUTTON_SIZES[resolvedSizeKey];
  const buttonVariant = getButtonVariants(safeThemeColors)[variant];

  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    {
      height: buttonSize.height,
      paddingHorizontal: buttonSize.paddingHorizontal,
      borderRadius: buttonSize.borderRadius,
      backgroundColor: isDisabled
        ? buttonVariant.disabledBackgroundColor
        : buttonVariant.backgroundColor,
      borderColor: isDisabled
        ? buttonVariant.disabledBorderColor
        : buttonVariant.borderColor,
      borderWidth: variant === 'outline' ? 1 : 0,
      width: fullWidth ? ('100%' as any) : undefined,
    },
    style,
  ];

  const textStyleCombined = [
    styles.text,
    {
      fontSize: buttonSize.fontSize,
      color: isDisabled
        ? buttonVariant.disabledTextColor
        : buttonVariant.textColor,
    },
    textStyle,
  ];

  const iconColor = isDisabled
    ? buttonVariant.disabledTextColor
    : buttonVariant.textColor;

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <Ionicons
        name={icon as any}
        size={buttonSize.iconSize}
        color={iconColor}
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
          loading && styles.iconLoading,
        ]}
      />
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {iconPosition === 'left' && renderIcon()}
      <Text style={textStyleCombined}>{loading ? 'Loading...' : title}</Text>
      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
}

const getStyles = (safeThemeColors: any) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
  },
  text: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.SM,
  },
  iconRight: {
    marginLeft: SPACING.SM,
  },
  iconLoading: {
    opacity: 0.5,
  },
});
