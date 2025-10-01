// Library Stack Navigator
// Handles navigation for library/book management screens

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';

// Import screens
import LibraryScreen from '../screens/library/LibraryScreen';
import BookEditorScreen from '../screens/library/BookEditorScreen';
import PageEditorScreen from '../screens/library/PageEditorScreen';
import SymbolLibraryScreen from '../screens/library/SymbolLibraryScreen';
import AddCustomSymbolScreen from '../screens/library/AddCustomSymbolScreen';
import SyncedButtonLibraryScreen from '../screens/library/SyncedButtonLibraryScreen';
import TemplateGalleryScreen from '../screens/library/TemplateGalleryScreen';
import TemplateSharingScreen from '../screens/library/TemplateSharingScreen';

const Stack = createStackNavigator();

export default function LibraryStack() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.primary,
        },
        headerTintColor: themeColors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="LibraryMain"
        component={LibraryScreen}
        options={{ title: 'My Books' }}
      />
      <Stack.Screen
        name="BookEditor"
        component={BookEditorScreen}
        options={{ title: 'Edit Book' }}
      />
      <Stack.Screen
        name="PageEditor"
        component={PageEditorScreen}
        options={{ title: 'Edit Page' }}
      />
      <Stack.Screen
        name="SymbolLibrary"
        component={SymbolLibraryScreen}
        options={{ title: 'Symbol Library' }}
      />
      <Stack.Screen
        name="AddCustomSymbol"
        component={AddCustomSymbolScreen}
        options={{ title: 'Add Custom Symbol' }}
      />
      <Stack.Screen
        name="SyncedButtonLibrary"
        component={SyncedButtonLibraryScreen}
        options={{ title: 'Button Library' }}
      />
      <Stack.Screen
        name="TemplateGallery"
        component={TemplateGalleryScreen}
        options={{ title: 'Template Gallery' }}
      />
      <Stack.Screen
        name="TemplateSharing"
        component={TemplateSharingScreen}
        options={{ title: 'Share Template' }}
      />
    </Stack.Navigator>
  );
}
