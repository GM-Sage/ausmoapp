// App Navigator for Ausmo AAC App

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { COLORS } from '../constants';

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
import ExpressPageCreatorScreen from '../screens/communication/ExpressPageCreatorScreen';
import TherapistDashboardScreen from '../screens/collaboration/TherapistDashboardScreen';
import EducationalDashboardScreen from '../screens/education/EducationalDashboardScreen';
import UserSettingsScreen from '../screens/settings/UserSettingsScreen';
import AccessibilitySettingsScreen from '../screens/settings/AccessibilitySettingsScreen';
import AudioSettingsScreen from '../screens/settings/AudioSettingsScreen';
import VisualSettingsScreen from '../screens/settings/VisualSettingsScreen';
import BackupSettingsScreen from '../screens/settings/BackupSettingsScreen';
import AnalyticsScreen from '../screens/settings/AnalyticsScreen';
import PerformanceScreen from '../screens/settings/PerformanceScreen';
import SecuritySettingsScreen from '../screens/settings/SecuritySettingsScreen';
import LocalizationSettingsScreen from '../screens/settings/LocalizationSettingsScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Main Communication Stack
function CommunicationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.SURFACE,
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.SURFACE,
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
        name="ExpressPageCreator" 
        component={ExpressPageCreatorScreen}
        options={{ title: 'Create Express Page' }}
      />
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.SURFACE,
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
        name="LocalizationSettings" 
        component={LocalizationSettingsScreen}
        options={{ title: 'Language & Localization' }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ title: 'Onboarding & Tutorials' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Communication') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Collaboration') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Education') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          // Fallback to basic icons if the specific ones don't work
          const fallbackIcons: { [key: string]: string } = {
            'home': 'home',
            'home-outline': 'home-outline',
            'chatbubble': 'chatbubble',
            'chatbubble-outline': 'chatbubble-outline',
            'book': 'book',
            'book-outline': 'book-outline',
            'people': 'people',
            'people-outline': 'people-outline',
            'school': 'school',
            'school-outline': 'school-outline',
            'settings': 'settings',
            'settings-outline': 'settings-outline',
            'help-outline': 'help-outline',
          };

          const finalIconName = fallbackIcons[iconName] || 'help-outline';

          return <Ionicons name={finalIconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE,
          borderTopColor: COLORS.BORDER,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Communication" 
        component={CommunicationStack}
        options={{ title: 'Talk' }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryStack}
        options={{ title: 'Books' }}
      />
      <Tab.Screen 
        name="Collaboration" 
        component={TherapistDashboardScreen}
        options={{ title: 'Collaboration' }}
      />
      <Tab.Screen 
        name="Education" 
        component={EducationalDashboardScreen}
        options={{ title: 'Education' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
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
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  return (
    <NavigationContainer>
      {currentUser ? (
        <MainTabNavigator />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
