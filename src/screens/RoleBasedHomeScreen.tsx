// Role-Based Home Screen
// Displays different content based on user role

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { UserRole, ActiveGoal } from '../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, RESPONSIVE } from '../constants';
import RoleBasedNavigationService from '../services/roleBasedNavigationService';
import TherapistService from '../services/therapistService';
import { setCurrentUser } from '../store/slices/userSlice';
import { SupabaseDatabaseService } from '../services/supabaseDatabaseService';
import AudioService from '../services/audioService';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';

interface RoleBasedHomeScreenProps {
  navigation?: any;
}

export default function RoleBasedHomeScreen({
  navigation,
}: RoleBasedHomeScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const dispatch = useDispatch();
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const navigationService = RoleBasedNavigationService.getInstance();
  const therapistService = TherapistService.getInstance();

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      // Load active goals for children
      if (currentUser.role === 'child' && currentUser.childProfile) {
        setActiveGoals(currentUser.childProfile.currentGoals || []);
      }

      // Load recent activity for parents/therapists
      if (currentUser.role === 'parent' || currentUser.role === 'therapist') {
        // This would load recent activity from the database
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleRefreshUserData = async () => {
    if (!currentUser) return;

    try {
      console.log('Manually refreshing user data...');
      const freshUser = await SupabaseDatabaseService.getInstance().getUser(
        currentUser.id
      );
      if (freshUser) {
        console.log('Fresh user data:', freshUser.role);
        // Ensure dates are properly serialized
        const serializedUser = {
          ...freshUser,
          createdAt:
            freshUser.createdAt instanceof Date
              ? freshUser.createdAt
              : new Date(freshUser.createdAt),
          updatedAt:
            freshUser.updatedAt instanceof Date
              ? freshUser.updatedAt
              : new Date(freshUser.updatedAt),
        };
        dispatch(setCurrentUser(serializedUser));
        Alert.alert('Success', `User role updated to: ${freshUser.role}`);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      Alert.alert('Error', 'Failed to refresh user data');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(setCurrentUser(null));
        },
      },
    ]);
  };

  const handleGoalPress = async (goal: ActiveGoal) => {
    if (!goal.accessibleInApp) {
      Alert.alert(
        'Goal Information',
        `${goal.title}\n\n${goal.description}\n\nProgress: ${goal.progress}%`
      );
      return;
    }

    // Navigate to specific app activity for this goal
    if (goal.appActivity) {
      // This would navigate to the specific activity
      Alert.alert(
        'Starting Activity',
        `Opening ${goal.appActivity} for ${goal.title}`
      );
    }
  };

  const handleQuickAction = (action: string) => {
    try {
      // Navigate based on action - using role-based navigation
      switch (action) {
        case 'Talk':
          // Navigate to communication tab
          navigation.navigate('Communication');
          break;
        case 'Books':
          // Navigate to library tab
          navigation.navigate('Library');
          break;
        case 'Learn':
          // Navigate to education tab - available for all users
          navigation.navigate('Education');
          break;
        case 'Music':
          Alert.alert('Music', 'Music feature coming soon!');
          break;
        case 'Progress':
          // Navigate to progress tab (for parents)
          navigation.navigate('Progress');
          break;
        case 'Settings':
          // Navigate to settings tab
          navigation.navigate('Settings');
          break;
        case 'RequestTherapist':
          // Navigate to patient request screen (for parents)
          navigation.navigate('PatientRequest');
          break;
        case 'Therapy':
          // Navigate to therapy/collaboration tab (for therapists)
          navigation.navigate('Therapy');
          break;
        case 'Tasks':
          // Navigate to tasks tab (for therapists) - maps to Therapy tab
          navigation.navigate('Therapy');
          break;
        case 'Reports':
          // Navigate to therapy tab for reports (therapists don't have separate Progress tab)
          navigation.navigate('Therapy');
          break;
        default:
          console.log('Unknown quick action:', action);
      }
    } catch (error) {
      console.error('Error handling quick action:', error);
    }
  };

  const renderChildContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: themeColors.text }]}>
          {navigationService.getWelcomeMessage(
            'child',
            currentUser?.name || ''
          )}
        </Text>
        <Text
          style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}
        >
          Let's have fun learning and communicating!
        </Text>
      </View>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            My Goals
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: themeColors.textSecondary },
            ]}
          >
            Work on these goals to make progress!
          </Text>

          {activeGoals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
                goal.masteryStatus === 'mastered' && {
                  borderColor: themeColors.success,
                  backgroundColor: themeColors.success + '10',
                },
              ]}
              onPress={() => handleGoalPress(goal)}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalIconContainer}>
                  <Ionicons
                    name={getTherapyIcon(goal.therapyType)}
                    size={24}
                    color={getTherapyColor(goal.therapyType)}
                  />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: themeColors.text }]}>
                    {goal.title}
                  </Text>
                  <Text
                    style={[
                      styles.goalDescription,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {goal.description}
                  </Text>
                </View>
                <View style={styles.goalStatus}>
                  <Text
                    style={[styles.goalProgress, { color: themeColors.text }]}
                  >
                    {goal.progress}%
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(goal.masteryStatus) },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: themeColors.text }]}
                    >
                      {getStatusText(goal.masteryStatus)}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: themeColors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${goal.progress}%`,
                      backgroundColor: themeColors.primary,
                    },
                  ]}
                />
              </View>

              {goal.nextActivity && (
                <View style={styles.nextActivityContainer}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={themeColors.primary}
                  />
                  <Text
                    style={[
                      styles.nextActivityText,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Next: {goal.nextActivity}
                  </Text>
                </View>
              )}

              {goal.accessibleInApp && (
                <View style={styles.appAccessContainer}>
                  <Ionicons
                    name="phone-portrait"
                    size={16}
                    color={themeColors.success}
                  />
                  <Text
                    style={[
                      styles.appAccessText,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Available in app
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Quick Actions
        </Text>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Talk')}
            accessible={true}
            accessibilityLabel="Open communication"
            accessibilityRole="button"
          >
            <Ionicons
              name="chatbubbles"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.primary}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Talk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Books')}
            accessible={true}
            accessibilityLabel="Open library"
            accessibilityRole="button"
          >
            <Ionicons
              name="library"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.secondary}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Books
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Learn')}
            accessible={true}
            accessibilityLabel="Open education"
            accessibilityRole="button"
          >
            <Ionicons
              name="school"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.success}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Learn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Music')}
            accessible={true}
            accessibilityLabel="Open music"
            accessibilityRole="button"
          >
            <Ionicons
              name="musical-notes"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.warning}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Music
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Encouragement */}
      <View style={styles.encouragementSection}>
        <Ionicons name="trophy" size={48} color={themeColors.warning} />
        <Text style={[styles.encouragementText, { color: themeColors.text }]}>
          You're doing great! Keep practicing and you'll reach your goals!
        </Text>
      </View>

      {/* Parent Access Button */}
      <View style={styles.parentAccessSection}>
        <TouchableOpacity
          style={[
            styles.parentAccessButton,
            { backgroundColor: themeColors.primary },
          ]}
          onPress={() => navigation.navigate('ParentAccess')}
          accessible={true}
          accessibilityLabel="Parent access"
          accessibilityRole="button"
          accessibilityHint="Enter parent access code to switch accounts"
        >
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={themeColors.surface}
          />
          <Text
            style={[styles.parentAccessText, { color: themeColors.surface }]}
          >
            Parent Access
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderParentContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: themeColors.text }]}>
          {navigationService.getWelcomeMessage(
            'parent',
            currentUser?.name || ''
          )}
        </Text>
        <Text
          style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}
        >
          Track your child's progress and communicate with their therapy team.
        </Text>
      </View>

      {/* Child Progress Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Your Child's Progress
        </Text>

        <View
          style={[
            styles.progressSummaryCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.progressSummaryItem}>
            <Text
              style={[
                styles.progressSummaryNumber,
                { color: themeColors.text },
              ]}
            >
              3
            </Text>
            <Text
              style={[
                styles.progressSummaryLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Active Goals
            </Text>
          </View>
          <View style={styles.progressSummaryItem}>
            <Text
              style={[
                styles.progressSummaryNumber,
                { color: themeColors.text },
              ]}
            >
              75%
            </Text>
            <Text
              style={[
                styles.progressSummaryLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Average Progress
            </Text>
          </View>
          <View style={styles.progressSummaryItem}>
            <Text
              style={[
                styles.progressSummaryNumber,
                { color: themeColors.text },
              ]}
            >
              2
            </Text>
            <Text
              style={[
                styles.progressSummaryLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Sessions This Week
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Recent Activity
        </Text>

        <View
          style={[
            styles.activityCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={themeColors.success}
          />
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: themeColors.text }]}>
              Goal Mastered!
            </Text>
            <Text
              style={[
                styles.activityDescription,
                { color: themeColors.textSecondary },
              ]}
            >
              "Request Preferred Items" goal completed
            </Text>
            <Text
              style={[styles.activityTime, { color: themeColors.textDisabled }]}
            >
              2 hours ago
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.activityCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Ionicons name="calendar" size={24} color={themeColors.primary} />
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: themeColors.text }]}>
              Therapy Session
            </Text>
            <Text
              style={[
                styles.activityDescription,
                { color: themeColors.textSecondary },
              ]}
            >
              Speech therapy session completed
            </Text>
            <Text
              style={[styles.activityTime, { color: themeColors.textDisabled }]}
            >
              Yesterday
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Quick Actions
        </Text>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Progress')}
            accessible={true}
            accessibilityLabel="View progress"
            accessibilityRole="button"
          >
            <Ionicons
              name="trending-up"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.primary}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Talk')}
            accessible={true}
            accessibilityLabel="Open communication"
            accessibilityRole="button"
          >
            <Ionicons
              name="chatbubbles"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.secondary}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Talk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Books')}
            accessible={true}
            accessibilityLabel="Open library"
            accessibilityRole="button"
          >
            <Ionicons
              name="library"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.success}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Books
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Settings')}
            accessible={true}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <Ionicons
              name="settings"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.warning}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('RequestTherapist')}
            accessible={true}
            accessibilityLabel="Request therapist"
            accessibilityRole="button"
          >
            <Ionicons
              name="person-add"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.error}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Request Therapist
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTherapistContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: themeColors.text }]}>
          {navigationService.getWelcomeMessage(
            'therapist',
            currentUser?.name || ''
          )}
        </Text>
        <Text
          style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}
        >
          Manage your patients and track their progress.
        </Text>
      </View>

      {/* Patient Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Your Patients
        </Text>

        <View
          style={[
            styles.patientSummaryCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.patientSummaryItem}>
            <Text
              style={[styles.patientSummaryNumber, { color: themeColors.text }]}
            >
              12
            </Text>
            <Text
              style={[
                styles.patientSummaryLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Active Patients
            </Text>
          </View>
          <View style={styles.patientSummaryItem}>
            <Text
              style={[styles.patientSummaryNumber, { color: themeColors.text }]}
            >
              8
            </Text>
            <Text
              style={[
                styles.patientSummaryLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Sessions Today
            </Text>
          </View>
          <View style={styles.patientSummaryItem}>
            <Text
              style={[styles.patientSummaryNumber, { color: themeColors.text }]}
            >
              3
            </Text>
            <Text
              style={[
                styles.patientSummaryLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Goals Mastered
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Recent Sessions
        </Text>

        <View
          style={[
            styles.sessionCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.sessionHeader}>
            <Text style={[styles.sessionPatient, { color: themeColors.text }]}>
              Emma Johnson
            </Text>
            <Text
              style={[styles.sessionTime, { color: themeColors.textSecondary }]}
            >
              10:30 AM
            </Text>
          </View>
          <Text style={[styles.sessionType, { color: themeColors.primary }]}>
            Speech Therapy
          </Text>
          <Text
            style={[styles.sessionNotes, { color: themeColors.textSecondary }]}
          >
            Great progress on vowel sounds. Continue practicing at home.
          </Text>
        </View>

        <View
          style={[
            styles.sessionCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.sessionHeader}>
            <Text style={[styles.sessionPatient, { color: themeColors.text }]}>
              Alex Chen
            </Text>
            <Text
              style={[styles.sessionTime, { color: themeColors.textSecondary }]}
            >
              2:00 PM
            </Text>
          </View>
          <Text style={[styles.sessionType, { color: themeColors.primary }]}>
            ABA Therapy
          </Text>
          <Text
            style={[styles.sessionNotes, { color: themeColors.textSecondary }]}
          >
            Requesting behavior improved significantly.
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Quick Actions
        </Text>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Therapy')}
            accessible={true}
            accessibilityLabel="Open therapy dashboard"
            accessibilityRole="button"
          >
            <Ionicons
              name="medical"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.primary}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Therapy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Tasks')}
            accessible={true}
            accessibilityLabel="View tasks"
            accessibilityRole="button"
          >
            <Ionicons
              name="library"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.secondary}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Reports')}
            accessible={true}
            accessibilityLabel="View reports"
            accessibilityRole="button"
          >
            <Ionicons
              name="trending-up"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.success}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => handleQuickAction('Settings')}
            accessible={true}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <Ionicons
              name="settings"
              size={RESPONSIVE.getIconSize(32)}
              color={themeColors.warning}
            />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const getTherapyIcon = (therapyType: string) => {
    switch (therapyType) {
      case 'ABA':
        return 'medical';
      case 'Speech':
        return 'chatbubbles';
      case 'OT':
        return 'hand-left';
      default:
        return 'flag';
    }
  };

  const getTherapyColor = (therapyType: string) => {
    switch (therapyType) {
      case 'ABA':
        return themeColors.primary;
      case 'Speech':
        return themeColors.secondary;
      case 'OT':
        return themeColors.success;
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return themeColors.success;
      case 'in_progress':
        return themeColors.primary;
      case 'not_started':
        return themeColors.textSecondary;
      case 'regressed':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'Mastered!';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      case 'regressed':
        return 'Needs Help';
      default:
        return 'Unknown';
    }
  };

  if (!currentUser) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <Text style={[styles.errorText, { color: themeColors.text }]}>
          Please log in to continue
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Refresh Button for Debugging */}
      <View
        style={[
          styles.refreshButtonContainer,
          { borderBottomColor: themeColors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.refreshButton,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
          onPress={handleRefreshUserData}
        >
          <Ionicons name="refresh" size={20} color={themeColors.primary} />
          <Text style={[styles.refreshButtonText, { color: themeColors.text }]}>
            Refresh User Data
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.currentRoleText, { color: themeColors.textSecondary }]}
        >
          Current Role: {currentUser.role}
        </Text>
      </View>

      {currentUser.role === 'child' && renderChildContent()}
      {currentUser.role === 'parent' && renderParentContent()}
      {currentUser.role === 'therapist' && renderTherapistContent()}
      {currentUser.role === 'admin' && renderTherapistContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent', // Will be set dynamically
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
  },
  refreshButtonText: {
    ...TYPOGRAPHY.BODY_SMALL,
    marginLeft: SPACING.XS,
    fontWeight: '500',
  },
  currentRoleText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  welcomeSection: {
    paddingVertical: SPACING.XL,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    textAlign: 'center',
    marginBottom: SPACING.SM,
    // color will be set dynamically based on theme
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    // color will be set dynamically based on theme
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING.SM,
    // color will be set dynamically based on theme
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    marginBottom: SPACING.MD,
    // color will be set dynamically based on theme
  },
  goalCard: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    marginBottom: SPACING.MD,
    // backgroundColor, borderColor will be set dynamically based on theme
  },
  masteredGoalCard: {
    // Colors will be set dynamically based on theme
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING.XS,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  goalProgress: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING.XS,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.SM,
    backgroundColor: 'transparent', // Will be set dynamically
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'transparent', // Will be set dynamically
  },
  nextActivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  nextActivityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    marginLeft: SPACING.XS,
  },
  appAccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appAccessText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    marginLeft: SPACING.XS,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: RESPONSIVE.getSpacing(SPACING.SM),
  },
  quickActionCard: {
    width: RESPONSIVE.isPhone ? '48%' : RESPONSIVE.isTablet ? '31%' : '23%',
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginBottom: RESPONSIVE.getSpacing(SPACING.MD),
    minHeight: RESPONSIVE.getButtonHeight(80),
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    marginTop: RESPONSIVE.getSpacing(SPACING.SM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    textAlign: 'center',
  },
  encouragementSection: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  encouragementText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    marginTop: SPACING.MD,
  },
  progressSummaryCard: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressSummaryItem: {
    alignItems: 'center',
  },
  progressSummaryNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  progressSummaryLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    marginBottom: SPACING.SM,
  },
  activityContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING.XS,
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    marginBottom: SPACING.XS,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
  },
  patientSummaryCard: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  patientSummaryItem: {
    alignItems: 'center',
  },
  patientSummaryNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  patientSummaryLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    textAlign: 'center',
  },
  sessionCard: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    marginBottom: SPACING.SM,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  sessionPatient: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  sessionTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
  },
  sessionType: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING.SM,
  },
  sessionNotes: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
  parentAccessSection: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  parentAccessButton: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parentAccessText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.SM,
  },
});
