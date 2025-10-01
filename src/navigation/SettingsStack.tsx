// Settings Stack Navigator
// Handles navigation for settings screens

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';

// Import screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import UserSettingsScreen from '../screens/settings/UserSettingsScreen';
import AccessibilitySettingsScreen from '../screens/settings/AccessibilitySettingsScreen';
import AudioSettingsScreen from '../screens/settings/AudioSettingsScreen';
import VisualSettingsScreen from '../screens/settings/VisualSettingsScreen';
import DisplaySettingsScreen from '../screens/settings/DisplaySettingsScreen';
import BackupSettingsScreen from '../screens/settings/BackupSettingsScreen';
import SecuritySettingsScreen from '../screens/settings/SecuritySettingsScreen';
import PrivacyManagementScreen from '../screens/settings/PrivacyManagementScreen';
import LocalizationSettingsScreen from '../screens/settings/LocalizationSettingsScreen';
import ExpressSettingsScreen from '../screens/settings/ExpressSettingsScreen';
import AutismOptimizedSettingsScreen from '../screens/settings/AutismOptimizedSettingsScreen';
import PerformanceScreen from '../screens/settings/PerformanceScreen';
import AnalyticsScreen from '../screens/settings/AnalyticsScreen';
import PrivacySettingsScreen from '../screens/settings/PrivacySettingsScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import ContactScreen from '../screens/settings/ContactScreen';
import LicenseScreen from '../screens/settings/LicenseScreen';
import UpdateScreen from '../screens/settings/UpdateScreen';
import DiagnosticsScreen from '../screens/settings/DiagnosticsScreen';
import AdvancedSettingsScreen from '../screens/settings/AdvancedSettingsScreen';
import CreateChildProfileScreen from '../screens/auth/CreateChildProfileScreen';
import ChildProfileSelectionScreen from '../screens/auth/ChildProfileSelectionScreen';
import ParentAccessCodeGeneratorScreen from '../screens/settings/ParentAccessCodeGeneratorScreen';

const Stack = createStackNavigator();

export default function SettingsStack() {
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
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="UserSettings"
        component={UserSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccessibilitySettings"
        component={AccessibilitySettingsScreen}
        options={{ title: 'Accessibility' }}
      />
      <Stack.Screen
        name="AudioSettings"
        component={AudioSettingsScreen}
        options={{ title: 'Audio Settings' }}
      />
      <Stack.Screen
        name="VisualSettings"
        component={VisualSettingsScreen}
        options={{ title: 'Visual Settings' }}
      />
      <Stack.Screen
        name="DisplaySettings"
        component={DisplaySettingsScreen}
        options={{ title: 'Display Settings' }}
      />
      <Stack.Screen
        name="BackupSettings"
        component={BackupSettingsScreen}
        options={{ title: 'Backup & Restore' }}
      />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{ title: 'Security & Privacy' }}
      />
      <Stack.Screen
        name="PrivacyManagement"
        component={PrivacyManagementScreen}
        options={{ title: 'Privacy & Data Management' }}
      />
      <Stack.Screen
        name="LocalizationSettings"
        component={LocalizationSettingsScreen}
        options={{ title: 'Language & Localization' }}
      />
      <Stack.Screen
        name="ExpressSettings"
        component={ExpressSettingsScreen}
        options={{ title: 'Express Page Settings' }}
      />
      <Stack.Screen
        name="AutismOptimizedSettings"
        component={AutismOptimizedSettingsScreen}
        options={{ title: 'Autism-Optimized Settings' }}
      />
      <Stack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{ title: 'Performance' }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'Analytics & Progress' }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: 'Privacy Settings' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ title: 'Contact Us' }}
      />
      <Stack.Screen
        name="License"
        component={LicenseScreen}
        options={{ title: 'License' }}
      />
      <Stack.Screen
        name="Update"
        component={UpdateScreen}
        options={{ title: 'Check for Updates' }}
      />
      <Stack.Screen
        name="Diagnostics"
        component={DiagnosticsScreen}
        options={{ title: 'Diagnostics' }}
      />
      <Stack.Screen
        name="AdvancedSettings"
        component={AdvancedSettingsScreen}
        options={{ title: 'Advanced Settings' }}
      />
      <Stack.Screen
        name="CreateChildProfile"
        component={CreateChildProfileScreen}
        options={{ title: 'Create Child Profile' }}
      />
      <Stack.Screen
        name="ChildProfileSelection"
        component={ChildProfileSelectionScreen}
        options={{ title: 'Select Child Profile' }}
      />
      <Stack.Screen
        name="ParentAccessCodeGenerator"
        component={ParentAccessCodeGeneratorScreen}
        options={{ title: 'Parent Access Code' }}
      />
    </Stack.Navigator>
  );
}
