// Collaboration Stack Navigator
// Handles navigation for therapy/collaboration screens

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';

// Import screens
import TherapistDashboardScreen from '../screens/collaboration/TherapistDashboardScreen';
import EnhancedTherapistDashboardScreen from '../screens/collaboration/EnhancedTherapistDashboardScreen';
import TherapistRequestScreen from '../screens/collaboration/TherapistRequestScreen';
import TherapistSearchScreen from '../screens/collaboration/TherapistSearchScreen';
import TherapyTaskLibraryScreen from '../screens/collaboration/TherapyTaskLibraryScreen';
import ProgressDashboardScreen from '../screens/collaboration/ProgressDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import PatientRequestScreen from '../screens/collaboration/PatientRequestScreen';
import PatientDetailsScreen from '../screens/collaboration/PatientDetailsScreen';
import AssignGoalScreen from '../screens/collaboration/AssignGoalScreen';
import AssignTaskScreen from '../screens/collaboration/AssignTaskScreen';
import TherapistAcceptanceScreen from '../screens/collaboration/TherapistAcceptanceScreen';
import TaskDetailsScreen from '../screens/collaboration/TaskDetailsScreen';
import GoalDetailsScreen from '../screens/collaboration/GoalDetailsScreen';

const Stack = createStackNavigator();

export default function CollaborationStack() {
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
        component={TherapistDashboardScreen}
        options={{ title: 'Therapy Dashboard' }}
      />
      <Stack.Screen
        name="EnhancedTherapistDashboard"
        component={EnhancedTherapistDashboardScreen}
        options={{ title: 'Enhanced Dashboard' }}
      />
      <Stack.Screen
        name="TherapistRequest"
        component={TherapistRequestScreen}
        options={{ title: 'Therapist Request' }}
      />
      <Stack.Screen
        name="TherapistSearch"
        component={TherapistSearchScreen}
        options={{ title: 'Find Therapist' }}
      />
      <Stack.Screen
        name="TherapyTaskLibrary"
        component={TherapyTaskLibraryScreen}
        options={{ title: 'Task Library' }}
      />
      <Stack.Screen
        name="ProgressDashboard"
        component={ProgressDashboardScreen}
        options={{ title: 'Progress Tracking' }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="PatientRequest"
        component={PatientRequestScreen}
        options={{ title: 'Request Therapist' }}
      />
      <Stack.Screen
        name="PatientDetails"
        component={PatientDetailsScreen}
        options={{ title: 'Patient Details' }}
      />
      <Stack.Screen
        name="AssignGoal"
        component={AssignGoalScreen}
        options={{ title: 'Assign Goal' }}
      />
      <Stack.Screen
        name="AssignTask"
        component={AssignTaskScreen}
        options={{ title: 'Assign Task' }}
      />
      <Stack.Screen
        name="TherapistAcceptance"
        component={TherapistAcceptanceScreen}
        options={{ title: 'Patient Requests' }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen
        name="GoalDetails"
        component={GoalDetailsScreen}
        options={{ title: 'Goal Details' }}
      />
    </Stack.Navigator>
  );
}
