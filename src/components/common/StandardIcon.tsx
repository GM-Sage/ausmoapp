// Standard Icon Component
// Provides consistent icon usage across the app

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COMPONENT_STYLES, RESPONSIVE } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export interface StandardIconProps {
  name: string;
  size?: 'small' | 'medium' | 'large' | 'extraLarge' | number;
  color?: string;
  style?: any;
  accessible?: boolean;
  accessibilityLabel?: string;
}

const ICON_SIZES = {
  small: RESPONSIVE.getIconSize(COMPONENT_STYLES.ICON.SMALL),
  medium: RESPONSIVE.getIconSize(COMPONENT_STYLES.ICON.MEDIUM),
  large: RESPONSIVE.getIconSize(COMPONENT_STYLES.ICON.LARGE),
  extraLarge: RESPONSIVE.getIconSize(COMPONENT_STYLES.ICON.EXTRA_LARGE),
};

export default function StandardIcon({
  name,
  size = 'medium',
  color,
  style,
  accessible = true,
  accessibilityLabel,
}: StandardIconProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  const effectiveColor = color || themeColors.text;
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];

  return (
    <Ionicons
      name={name as any}
      size={iconSize}
      color={effectiveColor}
      style={style}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    />
  );
}
