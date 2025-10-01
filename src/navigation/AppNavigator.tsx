// App Navigator for Ausmo AAC App

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RoleBasedTabNavigator from './RoleBasedTabNavigator';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { VisualSettingsProvider } from '../contexts/VisualSettingsContext';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';
import { setCurrentUser } from '../store/slices/userSlice';
import { SupabaseDatabaseService } from '../services/supabaseDatabaseService';

// Import screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import UserSelectionScreen from '../screens/auth/UserSelectionScreen';
import CreateUserScreen from '../screens/auth/CreateUserScreen';
import HomeScreen from '../screens/HomeScreen';
import ExpressCommunicationScreen from '../screens/communication/ExpressCommunicationScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import BookEditorScreen from '../screens/library/BookEditorScreen';
import PageEditorScreen from '../screens/library/PageEditorScreen';
import SymbolLibraryScreen from '../screens/library/SymbolLibraryScreen';
import TemplateGalleryScreen from '../screens/library/TemplateGalleryScreen';
import TemplateSharingScreen from '../screens/library/TemplateSharingScreen';
import SyncedButtonLibraryScreen from '../screens/library/SyncedButtonLibraryScreen';
import ExpressPageCreatorScreen from '../screens/communication/ExpressPageCreatorScreen';
import TherapistDashboardScreen from '../screens/collaboration/TherapistDashboardScreen';
import EnhancedTherapistDashboardScreen from '../screens/collaboration/EnhancedTherapistDashboardScreen';
import TherapyTaskLibraryScreen from '../screens/collaboration/TherapyTaskLibraryScreen';
import TherapistSearchScreen from '../screens/collaboration/TherapistSearchScreen';
import TherapistRequestScreen from '../screens/collaboration/TherapistRequestScreen';
import EducationalDashboardScreen from '../screens/education/EducationalDashboardScreen';
import UserSettingsScreen from '../screens/settings/UserSettingsScreen';
import AccessibilitySettingsScreen from '../screens/settings/AccessibilitySettingsScreen';
import AudioSettingsScreen from '../screens/settings/AudioSettingsScreen';
import PrivacyManagementScreen from '../screens/settings/PrivacyManagementScreen';
import BackupSettingsScreen from '../screens/settings/BackupSettingsScreen';
import AnalyticsScreen from '../screens/settings/AnalyticsScreen';
import PerformanceScreen from '../screens/settings/PerformanceScreen';
import SecuritySettingsScreen from '../screens/settings/SecuritySettingsScreen';
import LocalizationSettingsScreen from '../screens/settings/LocalizationSettingsScreen';
import ExpressSettingsScreen from '../screens/settings/ExpressSettingsScreen';
import AdvancedSettingsScreen from '../screens/settings/AdvancedSettingsScreen';
import AutismOptimizedSettingsScreen from '../screens/settings/AutismOptimizedSettingsScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import PatientRequestScreen from '../screens/collaboration/PatientRequestScreen';
import CreateChildProfileScreen from '../screens/auth/CreateChildProfileScreen';
import ChildProfileSelectionScreen from '../screens/auth/ChildProfileSelectionScreen';
import ParentAccessScreen from '../screens/auth/ParentAccessScreen';
import RoleBasedHomeScreen from '../screens/RoleBasedHomeScreen';
import VisualSettingsScreen from '../screens/settings/VisualSettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Main Communication Stack
function CommunicationStack() {
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
        name="CommunicationMain"
        component={ExpressCommunicationScreen}
        options={{ title: 'Talk' }}
      />
    </Stack.Navigator>
  );
}

// Library Stack
function LibraryStack() {
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
        name="TemplateGallery"
        component={TemplateGalleryScreen}
        options={{ title: 'Template Gallery' }}
      />
      <Stack.Screen
        name="TemplateSharing"
        component={TemplateSharingScreen as unknown as React.ComponentType<any>}
        options={{ title: 'Share Template' }}
      />
      <Stack.Screen
        name="SyncedButtonLibrary"
        component={SyncedButtonLibraryScreen}
        options={{ title: 'Synced Button Library' }}
      />
      <Stack.Screen
        name="ExpressPageCreator"
        component={ExpressPageCreatorScreen}
        options={{ title: 'Create Express Page' }}
      />
    </Stack.Navigator>
  );
}

// Collaboration Stack
function CollaborationStack() {
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
        name="TherapistDashboard"
        component={EnhancedTherapistDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TaskLibrary"
        component={TherapyTaskLibraryScreen}
        options={{ title: 'Task Library' }}
      />
      <Stack.Screen
        name="TherapistSearch"
        component={TherapistSearchScreen}
        options={{ title: 'Find Therapists' }}
      />
      <Stack.Screen
        name="TherapistRequests"
        component={TherapistRequestScreen}
        options={{ title: 'Patient Requests' }}
      />
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStack() {
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserSettings"
        component={UserSettingsScreen}
        options={{ title: 'User Settings' }}
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
        name="BackupSettings"
        component={BackupSettingsScreen}
        options={{ title: 'Backup & Sync' }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'Analytics & Progress' }}
      />
      <Stack.Screen
        name="TherapistDashboard"
        component={TherapistDashboardScreen}
        options={{ title: 'Therapist Dashboard' }}
      />
      <Stack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{ title: 'Performance Monitoring' }}
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
        name="AdvancedSettings"
        component={AdvancedSettingsScreen}
        options={{ title: 'Advanced Settings' }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ title: 'Onboarding & Tutorials' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator (Role-Based)
function MainTabNavigator() {
  return <RoleBasedTabNavigator />;
}

// Main App Stack (includes tabs and modal screens)
function MainAppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="ParentAccess"
        component={ParentAccessScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Parent Access',
        }}
      />
      <Stack.Screen
        name="PatientRequest"
        component={PatientRequestScreen}
        options={{
          headerShown: true,
          title: 'Request Therapist',
        }}
      />
    </Stack.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="UserSelection" component={UserSelectionScreen} />
      <Stack.Screen name="CreateUser" component={CreateUserScreen} />
      <Stack.Screen
        name="CreateChildProfile"
        component={CreateChildProfileScreen}
      />
    </Stack.Navigator>
  );
}

// Main App Navigator
function AppNavigatorInner() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const { navigationTheme } = useVisualSettings();

  // Force refresh user data on app start to get updated role
  useEffect(() => {
    const refreshUserData = async () => {
      if (currentUser) {
        try {
          console.log('Checking for user role updates...');
          // Get fresh user data from Supabase
          const freshUser = await SupabaseDatabaseService.getInstance().getUser(
            currentUser.id
          );
          if (freshUser && freshUser.role !== currentUser.role) {
            console.log(
              'User role updated from',
              currentUser.role,
              'to',
              freshUser.role,
              '- refreshing Redux store...'
            );
            // Ensure dates are properly serialized
            dispatch(setCurrentUser(freshUser as any));
          } else if (freshUser) {
            console.log('User role is up to date:', freshUser.role);
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    };

    refreshUserData();
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      {currentUser ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return <AppNavigatorInner />;
}
