import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DarkTheme,
  DefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { Appearance } from 'react-native';
import { RootState } from '../store';
import { setCurrentUser } from '../store/slices/userSlice';
import { getSystemTheme, resolveTheme, getThemeColors, normalizeThemeObject } from '../utils/themeUtils';

type ButtonSizeSetting = 'small' | 'medium' | 'large' | 'extra-large';
type AppThemeSetting = 'light' | 'dark' | 'high-contrast' | 'system';

export interface VisualSettingsContextValue {
  buttonSize: ButtonSizeSetting;
  theme: AppThemeSetting;
  navigationTheme: NavigationTheme;
  themeColors: any; // Normalized theme colors for components
}

const VisualSettingsContext = createContext<
  VisualSettingsContextValue | undefined
>(undefined);

export const VisualSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const visualSettings = currentUser?.settings?.visualSettings;
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    getSystemTheme()
  );
  const dispatch = useDispatch();

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription?.remove();
  }, []);

  // Migrate hardcoded colors to theme-aware colors
  useEffect(() => {
    if (
      currentUser?.settings?.visualSettings &&
      (visualSettings?.backgroundColor === '#FAFAFA' ||
        visualSettings?.textColor === '#2C2C2C' ||
        visualSettings?.borderColor === '#E0E0E0')
    ) {
      console.log('Migrating hardcoded colors to theme-aware colors');
      const resolvedTheme = resolveTheme(visualSettings.theme || 'light'); // Use light as safe default
      const themeColors = getThemeColors(resolvedTheme);

      // Update the user's visual settings with theme-aware colors
      const updatedUser = {
        ...currentUser,
        settings: {
          ...currentUser.settings,
          visualSettings: {
            ...currentUser.settings.visualSettings,
            backgroundColor: themeColors.background,
            textColor: themeColors.text,
            borderColor: themeColors.border,
          },
        },
        updatedAt: new Date().toISOString(),
      };

      // Update Redux store
      dispatch(setCurrentUser(updatedUser));
    }
  }, [currentUser, visualSettings, dispatch]);

  const value = useMemo<VisualSettingsContextValue>(() => {
    // Always provide default values even when no user is logged in
    const buttonSize = visualSettings?.buttonSize || 'medium';
    const theme = visualSettings?.theme || 'light'; // Default to light theme for safety

    console.log(
      'VisualSettingsProvider - currentUser:',
      !!currentUser,
      'theme:',
      theme,
      'buttonSize:',
      buttonSize
    );
    console.log('VisualSettingsProvider - visualSettings:', visualSettings);

    // Resolve the actual theme (handle 'system' theme)
    const resolvedTheme = resolveTheme(theme);

    let navigationTheme: NavigationTheme;
    if (resolvedTheme === 'dark') {
      navigationTheme = DarkTheme;
    } else if (resolvedTheme === 'high-contrast') {
      navigationTheme = {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#000000',
          card: '#000000',
          text: '#FFFFFF',
          border: '#FFFFFF',
          primary: '#FFFF00',
        },
      };
    } else {
      navigationTheme = DefaultTheme;
    }

    // Ensure navigationTheme is never undefined
    if (!navigationTheme) {
      console.warn('navigationTheme is undefined, defaulting to DefaultTheme');
      navigationTheme = DefaultTheme;
    }

    // Create normalized theme colors from the navigation theme
    const themeColors = normalizeThemeObject(navigationTheme);

    return { buttonSize, theme, navigationTheme, themeColors };
  }, [visualSettings, systemTheme]);

  return (
    <VisualSettingsContext.Provider value={value}>
      {children}
    </VisualSettingsContext.Provider>
  );
};

export const useVisualSettings = (): VisualSettingsContextValue => {
  const ctx = useContext(VisualSettingsContext);
  if (!ctx) {
    throw new Error(
      'useVisualSettings must be used within a VisualSettingsProvider'
    );
  }
  return ctx;
};
