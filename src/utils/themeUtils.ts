import { Appearance } from 'react-native';

export type AppTheme = 'light' | 'dark' | 'high-contrast' | 'system';

export interface ThemeColors {
  // Core colors
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  divider: string;

  // Brand colors
  primary: string;
  primaryLight: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;

  // Autism-friendly additional colors
  calm: string;
  focus: string;
  highlight: string;
  disabled: string;

  // Interactive states
  hover: string;
  pressed: string;
  focusRing: string;

  // Component-specific colors
  cardBackground: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonOutline: string;
  buttonGhost: string;
  buttonSuccess: string;
  buttonWarning: string;
  buttonError: string;
  buttonDisabled: string;

  // Status colors
  online: string;
  offline: string;
  pending: string;
  completed: string;
  cancelled: string;

  // Shadow and overlay
  shadow: string;
  overlay: string;

  // Special colors for high contrast
  highContrastBackground: string;
  highContrastSurface: string;
  highContrastText: string;
  highContrastBorder: string;
}

// Autism-friendly color palettes - ensure this is properly accessible during bundling
const AUTISM_FRIENDLY_COLORS: Record<string, any> = {
  light: {
    calm: '#E8F4FD', // Soft blue
    focus: '#B3E5FC', // Light blue for focus
    highlight: '#FFD54F', // Soft yellow for highlighting
    disabled: '#F5F5F5', // Light gray
  },
  dark: {
    calm: '#1A237E', // Deep blue
    focus: '#3949AB', // Medium blue for focus
    highlight: '#FFB74D', // Soft orange for highlighting
    disabled: '#424242', // Dark gray
  },
  'high-contrast': {
    calm: '#000000', // Black
    focus: '#FFFF00', // Bright yellow
    highlight: '#00FFFF', // Bright cyan
    disabled: '#666666', // Medium gray
  },
};

// Get system theme preference
export const getSystemTheme = (): 'light' | 'dark' => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

// Resolve theme (handle 'system' theme)
export const resolveTheme = (
  theme: AppTheme
): 'light' | 'dark' | 'high-contrast' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme || 'light'; // Default to light theme if undefined
};

export const getThemeColors = (theme: AppTheme): ThemeColors => {
  try {
    // Ensure theme is never undefined/null
    if (!theme) {
      console.warn('getThemeColors: theme is undefined/null, defaulting to light');
      theme = 'light';
    }

    const resolvedTheme = resolveTheme(theme);

    // Defensive access to prevent bundling issues
    const autismColors = (AUTISM_FRIENDLY_COLORS && AUTISM_FRIENDLY_COLORS[resolvedTheme]) || AUTISM_FRIENDLY_COLORS.light;

    // Ensure resolvedTheme is always a valid string
    const safeResolvedTheme = resolvedTheme || 'light';

    switch (safeResolvedTheme) {
    case 'dark':
      return {
        // Core colors
        background: '#121212',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        textDisabled: '#666666',
        border: '#333333',
        divider: '#2A2A2A',

        // Brand colors
        primary: '#64B5F6', // Softer blue for autism-friendly design
        primaryLight: '#90CAF9',
        secondary: '#81C784', // Softer green
        success: '#81C784', // Softer green
        warning: '#FFB74D', // Softer orange
        error: '#E57373', // Softer red
        info: '#64B5F6', // Softer blue

        // Autism-friendly colors
        calm: autismColors.calm,
        focus: autismColors.focus,
        highlight: autismColors.highlight,
        disabled: autismColors.disabled,

        // Interactive states
        hover: '#2A2A2A',
        pressed: '#1A1A1A',
        focusRing: '#64B5F6',

        // Component-specific colors
        cardBackground: '#1E1E1E',
        cardBorder: '#333333',
        inputBackground: '#1E1E1E',
        inputBorder: '#333333',
        inputPlaceholder: '#666666',
        buttonPrimary: '#64B5F6',
        buttonSecondary: '#81C784',
        buttonOutline: '#64B5F6',
        buttonGhost: 'transparent',
        buttonSuccess: '#81C784',
        buttonWarning: '#FFB74D',
        buttonError: '#E57373',
        buttonDisabled: '#666666',

        // Status colors
        online: '#4CAF50',
        offline: '#666666',
        pending: '#FFB74D',
        completed: '#81C784',
        cancelled: '#E57373',

        // Shadow and overlay
        shadow: '#000000',
        overlay: 'rgba(0, 0, 0, 0.7)',

        // High contrast colors
        highContrastBackground: '#000000',
        highContrastSurface: '#000000',
        highContrastText: '#FFFFFF',
        highContrastBorder: '#FFFFFF',
      };
    case 'high-contrast':
      return {
        // Core colors
        background: '#000000',
        surface: '#000000',
        text: '#FFFFFF',
        textSecondary: '#FFFFFF',
        textDisabled: '#CCCCCC',
        border: '#FFFFFF',
        divider: '#FFFFFF',

        // Brand colors
        primary: '#FFFF00', // Yellow for high contrast
        primaryLight: '#FFFF00',
        secondary: '#00FFFF', // Cyan for high contrast
        success: '#00FF00', // Bright green
        warning: '#FFA500', // Orange
        error: '#FF0000', // Bright red
        info: '#00FFFF', // Cyan

        // Autism-friendly colors
        calm: autismColors.calm,
        focus: autismColors.focus,
        highlight: autismColors.highlight,
        disabled: autismColors.disabled,

        // Interactive states
        hover: '#333333',
        pressed: '#666666',
        focusRing: '#FFFF00',

        // Component-specific colors
        cardBackground: '#000000',
        cardBorder: '#FFFFFF',
        inputBackground: '#000000',
        inputBorder: '#FFFFFF',
        inputPlaceholder: '#CCCCCC',
        buttonPrimary: '#FFFF00',
        buttonSecondary: '#00FFFF',
        buttonOutline: '#FFFF00',
        buttonGhost: 'transparent',
        buttonSuccess: '#00FF00',
        buttonWarning: '#FFA500',
        buttonError: '#FF0000',
        buttonDisabled: '#666666',

        // Status colors
        online: '#00FF00',
        offline: '#666666',
        pending: '#FFA500',
        completed: '#00FF00',
        cancelled: '#FF0000',

        // Shadow and overlay
        shadow: '#000000',
        overlay: 'rgba(0, 0, 0, 0.9)',

        // High contrast colors
        highContrastBackground: '#000000',
        highContrastSurface: '#000000',
        highContrastText: '#FFFFFF',
        highContrastBorder: '#FFFFFF',
      };
    default: // light
      return {
        // Core colors
        background: '#FAFAFA', // Softer background for autism-friendly design
        surface: '#FFFFFF',
        text: '#2C2C2C', // Softer black for better readability
        textSecondary: '#666666',
        textDisabled: '#999999',
        border: '#E0E0E0',
        divider: '#EEEEEE',

        // Brand colors
        primary: '#2196F3', // Standard blue
        primaryLight: '#64B5F6',
        secondary: '#4CAF50', // Standard green
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',

        // Autism-friendly colors
        calm: autismColors.calm,
        focus: autismColors.focus,
        highlight: autismColors.highlight,
        disabled: autismColors.disabled,

        // Interactive states
        hover: '#F5F5F5',
        pressed: '#EEEEEE',
        focusRing: '#2196F3',

        // Component-specific colors
        cardBackground: '#FFFFFF',
        cardBorder: '#E0E0E0',
        inputBackground: '#FFFFFF',
        inputBorder: '#E0E0E0',
        inputPlaceholder: '#999999',
        buttonPrimary: '#2196F3',
        buttonSecondary: '#4CAF50',
        buttonOutline: '#2196F3',
        buttonGhost: 'transparent',
        buttonSuccess: '#4CAF50',
        buttonWarning: '#FF9800',
        buttonError: '#F44336',
        buttonDisabled: '#CCCCCC',

        // Status colors
        online: '#4CAF50',
        offline: '#999999',
        pending: '#FF9800',
        completed: '#4CAF50',
        cancelled: '#F44336',

        // Shadow and overlay
        shadow: '#000000',
        overlay: 'rgba(0, 0, 0, 0.5)',

        // High contrast colors
        highContrastBackground: '#000000',
        highContrastSurface: '#FFFFFF',
        highContrastText: '#FFFFFF',
        highContrastBorder: '#FFFFFF',
      };
    }
  } catch (error) {
    console.warn('getThemeColors failed, falling back to light theme:', error);
    // Fallback to hardcoded light theme colors
    return {
      // Core colors
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      textSecondary: '#666666',
      textDisabled: '#999999',
      border: '#E0E0E0',
      divider: '#EEEEEE',

      // Brand colors
      primary: '#2196F3',
      primaryLight: '#64B5F6',
      secondary: '#4CAF50',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',

      // Autism-friendly colors
      calm: '#E8F4FD',
      focus: '#B3E5FC',
      highlight: '#FFD54F',
      disabled: '#F5F5F5',

      // Interactive states
      hover: '#F5F5F5',
      pressed: '#EEEEEE',
      focusRing: '#2196F3',

      // Component-specific colors
      cardBackground: '#FFFFFF',
      cardBorder: '#E0E0E0',
      inputBackground: '#FFFFFF',
      inputBorder: '#E0E0E0',
      inputPlaceholder: '#999999',
      buttonPrimary: '#2196F3',
      buttonSecondary: '#4CAF50',
      buttonOutline: '#2196F3',
      buttonGhost: 'transparent',
      buttonSuccess: '#4CAF50',
      buttonWarning: '#FF9800',
      buttonError: '#F44336',
      buttonDisabled: '#CCCCCC',

      // Status colors
      online: '#4CAF50',
      offline: '#999999',
      pending: '#FF9800',
      completed: '#4CAF50',
      cancelled: '#F44336',

      // Shadow and overlay
      shadow: '#000000',
      overlay: 'rgba(0, 0, 0, 0.5)',

      // High contrast colors
      highContrastBackground: '#000000',
      highContrastSurface: '#FFFFFF',
      highContrastText: '#FFFFFF',
      highContrastBorder: '#FFFFFF',
    };
  }
};


export const getStatusBarStyle = (theme: AppTheme): 'light' | 'dark' => {
  const resolvedTheme = resolveTheme(theme);
  return resolvedTheme === 'dark' || resolvedTheme === 'high-contrast'
    ? 'light'
    : 'dark';
};

// Check if theme supports reduced motion (for autism-friendly design)
export const supportsReducedMotion = (theme: AppTheme): boolean => {
  return theme === 'high-contrast' || theme === 'system';
};

// Get autism-friendly theme recommendations
export const getAutismFriendlyRecommendations = (theme: AppTheme): string[] => {
  const recommendations: string[] = [];

  if (theme === 'light') {
    recommendations.push('Consider high contrast mode for better visibility');
    recommendations.push('Use calm colors to reduce sensory overload');
  } else if (theme === 'dark') {
    recommendations.push('Dark mode reduces eye strain in low light');
    recommendations.push('Softer colors help with sensory sensitivity');
  } else if (theme === 'high-contrast') {
    recommendations.push('High contrast provides maximum visibility');
    recommendations.push('Ideal for users with visual impairments');
  } else if (theme === 'system') {
    recommendations.push('Automatically adapts to system preferences');
    recommendations.push("Respects user's accessibility settings");
  }

  return recommendations;
};

// Safe theme accessor to prevent runtime errors
export const safeGetThemeColors = (theme: AppTheme | undefined | null): ThemeColors => {
  try {
    return getThemeColors(theme || 'light');
  } catch (error) {
    console.error('safeGetThemeColors failed, using fallback:', error);
    return getThemeColors('light'); // Always return a valid theme object
  }
};

// Helper function to safely access theme properties from any theme-like object
export const safeGetThemeProperty = (
  themeObject: any,
  property: string,
  fallbackValue: string = '#000000'
): string => {
  try {
    // If it's a React Navigation theme object, access via colors property
    if (themeObject && themeObject.colors && typeof themeObject.colors === 'object') {
      return themeObject.colors[property] || fallbackValue;
    }
    // If it's our custom theme object, access directly
    if (themeObject && typeof themeObject === 'object') {
      return themeObject[property] || fallbackValue;
    }
    return fallbackValue;
  } catch (error) {
    console.warn(`safeGetThemeProperty failed for property '${property}':`, error);
    return fallbackValue;
  }
};

// Normalize any theme object to our custom ThemeColors format
export const normalizeThemeObject = (theme: any): ThemeColors => {
  try {
    if (!theme) {
      console.warn('normalizeThemeObject: Theme is undefined/null, falling back to light');
      return getThemeColors('light');
    }

    // If it's already our custom theme object, return as-is
    if (theme && typeof theme === 'object' && theme.background && theme.primary) {
      return theme as ThemeColors;
    }

    // If it's a React Navigation theme object, extract colors
    if (theme && theme.colors && typeof theme.colors === 'object') {
      // Extract from React Navigation theme and merge with system theme for completeness
      const navColors = theme.colors;
      const systemTheme = getThemeColors(resolveTheme('system'));

      return {
        // Core colors from React Navigation theme
        background: navColors.background || '#FAFAFA',
        surface: navColors.card || navColors.background || '#FFFFFF',
        text: navColors.text || '#2C2C2C',
        textSecondary: navColors.text || '#666666',
        textDisabled: navColors.text || '#999999',
        border: navColors.border || '#E0E0E0',
        divider: navColors.border || '#EEEEEE',

        // Brand colors (use primary for all since RN themes don't have these)
        primary: navColors.primary || '#2196F3',
        primaryLight: navColors.primary || '#64B5F6',
        secondary: navColors.primary || '#4CAF50',
        success: navColors.primary || '#4CAF50',
        warning: navColors.notification || '#FF9800',
        error: navColors.notification || '#F44336',
        info: navColors.primary || '#2196F3',

        // Autism-friendly colors (fallback values)
        calm: '#E8F4FD',
        focus: '#B3E5FC',
        highlight: '#FFD54F',
        disabled: '#F5F5F5',

        // Interactive states
        hover: '#F5F5F5',
        pressed: '#EEEEEE',
        focusRing: navColors.primary || '#2196F3',

        // Component-specific colors
        cardBackground: navColors.card || '#FFFFFF',
        cardBorder: navColors.border || '#E0E0E0',
        inputBackground: navColors.card || '#FFFFFF',
        inputBorder: navColors.border || '#E0E0E0',
        inputPlaceholder: navColors.text || '#999999',
        buttonPrimary: navColors.primary || '#2196F3',
        buttonSecondary: navColors.primary || '#4CAF50',
        buttonOutline: navColors.primary || '#2196F3',
        buttonGhost: 'transparent',
        buttonSuccess: navColors.primary || '#4CAF50',
        buttonWarning: navColors.notification || '#FF9800',
        buttonError: navColors.notification || '#F44336',
        buttonDisabled: navColors.text || '#CCCCCC',

        // Status colors
        online: '#4CAF50',
        offline: '#999999',
        pending: '#FF9800',
        completed: '#4CAF50',
        cancelled: '#F44336',

        // Shadow and overlay
        shadow: '#000000',
        overlay: 'rgba(0, 0, 0, 0.5)',

        // High contrast colors (fallback)
        highContrastBackground: '#000000',
        highContrastSurface: '#FFFFFF',
        highContrastText: '#FFFFFF',
        highContrastBorder: '#FFFFFF',
      };
    }

    // If it's a string (theme name), get the corresponding theme
    if (typeof theme === 'string') {
      return getThemeColors(theme as AppTheme);
    }

    // Fallback: return light theme
    console.warn('normalizeThemeObject: Unknown theme object format, using light theme');
    return getThemeColors('light');
  } catch (error) {
    console.error('normalizeThemeObject failed:', error);
    return getThemeColors('light');
  }
};

// Validate color contrast ratios for WCAG compliance
export const validateContrastRatio = (
  foreground: string,
  background: string
): {
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  isCompliant: boolean;
} => {
  // Simplified contrast calculation (in real implementation, use a proper library)
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  let level: 'AA' | 'AAA' | 'FAIL';
  let isCompliant: boolean;

  if (ratio >= 7) {
    level = 'AAA';
    isCompliant = true;
  } else if (ratio >= 4.5) {
    level = 'AA';
    isCompliant = true;
  } else {
    level = 'FAIL';
    isCompliant = false;
  }

  return { ratio, level, isCompliant };
};
