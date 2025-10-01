// Role-Based Tab Navigator
// Shows different tabs based on user role

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { UserRole } from '../types';
// COLORS import removed - using theme colors instead
import RoleBasedNavigationService from '../services/roleBasedNavigationService';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';

// Import screens
import RoleBasedHomeScreen from '../screens/RoleBasedHomeScreen';
import CommunicationScreen from '../screens/communication/CommunicationScreen';
import EnhancedTalkScreen from '../screens/communication/EnhancedTalkScreen';
import LibraryStack from './LibraryStack';
import CollaborationStack from './CollaborationStack';
import EducationalDashboardScreen from '../screens/education/EducationalDashboardScreen';
import SettingsStack from './SettingsStack';
import ProgressDashboardScreen from '../screens/collaboration/ProgressDashboardScreen';
import AssignedTasksScreen from '../screens/collaboration/AssignedTasksScreen';
import AssignedGoalsScreen from '../screens/collaboration/AssignedGoalsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Tab = createBottomTabNavigator();

export default function RoleBasedTabNavigator() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const navigationService = RoleBasedNavigationService.getInstance();

  if (!currentUser) {
    return null;
  }

  const getTabBarIcon = (
    routeName: string,
    focused: boolean,
    color: string,
    size: number
  ) => {
    const iconMap: Record<string, string> = {
      Home: 'home',
      Communication: 'chatbubbles',
      Tasks: 'clipboard',
      Goals: 'flag',
      Library: 'library',
      Therapy: 'medical',
      Education: 'school',
      Progress: 'trending-up',
      Settings: 'settings',
      Admin: 'shield',
    };

    return (
      <Ionicons name={iconMap[routeName] as any} size={size} color={color} />
    );
  };

  const renderChildTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={RoleBasedHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Communication"
        component={EnhancedTalkScreen}
        options={{ title: 'Talk' }}
      />
      <Tab.Screen
        name="Tasks"
        component={AssignedTasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name="Goals"
        component={AssignedGoalsScreen}
        options={{ title: 'Goals' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{ title: 'Books' }}
      />
      <Tab.Screen
        name="Education"
        component={EducationalDashboardScreen}
        options={{ title: 'Learn' }}
      />
    </Tab.Navigator>
  );

  const renderParentTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={RoleBasedHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Communication"
        component={EnhancedTalkScreen}
        options={{ title: 'Talk' }}
      />
      <Tab.Screen
        name="Tasks"
        component={AssignedTasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name="Goals"
        component={AssignedGoalsScreen}
        options={{ title: 'Goals' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{ title: 'Books' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressDashboardScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="Education"
        component={EducationalDashboardScreen}
        options={{ title: 'Learn' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );

  const renderTherapistTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={RoleBasedHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Therapy"
        component={CollaborationStack}
        options={{ title: 'Therapy' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{ title: 'Books' }}
      />
      <Tab.Screen
        name="Education"
        component={EducationalDashboardScreen}
        options={{ title: 'Learn' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );

  const renderAdminTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={RoleBasedHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Communication"
        component={EnhancedTalkScreen}
        options={{ title: 'Talk' }}
      />
      <Tab.Screen
        name="Tasks"
        component={AssignedTasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name="Goals"
        component={AssignedGoalsScreen}
        options={{ title: 'Goals' }}
      />
      <Tab.Screen
        name="Therapy"
        component={CollaborationStack}
        options={{ title: 'Therapy' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{ title: 'Books' }}
      />
      <Tab.Screen
        name="Education"
        component={EducationalDashboardScreen}
        options={{ title: 'Learn' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressDashboardScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminDashboardScreen}
        options={{ title: 'Admin' }}
      />
    </Tab.Navigator>
  );

  switch (currentUser.role) {
    case 'child':
      return renderChildTabs();
    case 'parent':
      return renderParentTabs();
    case 'therapist':
      return renderTherapistTabs();
    case 'admin':
      return renderAdminTabs();
    default:
      return renderChildTabs();
  }
}
