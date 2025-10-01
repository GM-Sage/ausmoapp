// Progress Dashboard Screen for Parents
// Shows child's progress and therapy information

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { ActiveGoal, ProgressReport } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import TherapistService from '../../services/therapistService';

export default function ProgressDashboardScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [recentReports, setRecentReports] = useState<ProgressReport[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'quarter'
  >('month');

  const therapistService = TherapistService.getInstance();

  useEffect(() => {
    if (currentUser && currentUser.childProfile) {
      loadChildProgress();
    }
  }, [currentUser, selectedTimeframe]);

  const loadChildProgress = async () => {
    if (!currentUser?.childProfile) return;

    try {
      // Load active goals
      setActiveGoals(currentUser.childProfile.currentGoals || []);

      // Load recent progress reports
      const endDate = new Date();
      let startDate = new Date();

      switch (selectedTimeframe) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'quarter':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // This would typically load reports from the database
      setRecentReports([]);
    } catch (error) {
      console.error('Error loading child progress:', error);
      Alert.alert('Error', 'Failed to load progress data');
    }
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      <Text style={styles.timeframeLabel}>Time Period:</Text>
      <View style={styles.timeframeButtons}>
        {(['week', 'month', 'quarter'] as const).map(timeframe => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && styles.activeTimeframeButton,
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe &&
                  styles.activeTimeframeButtonText,
              ]}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProgressSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Progress Summary</Text>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Ionicons name="flag" size={32} color={themeColors.primary} />
          <Text style={styles.summaryNumber}>{activeGoals.length}</Text>
          <Text style={styles.summaryLabel}>Active Goals</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="trophy" size={32} color={themeColors.success} />
          <Text style={styles.summaryNumber}>
            {activeGoals.filter(g => g.masteryStatus === 'mastered').length}
          </Text>
          <Text style={styles.summaryLabel}>Mastered</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="trending-up" size={32} color={themeColors.warning} />
          <Text style={styles.summaryNumber}>
            {Math.round(
              activeGoals.reduce((sum, g) => sum + g.progress, 0) /
                activeGoals.length
            ) || 0}
            %
          </Text>
          <Text style={styles.summaryLabel}>Avg Progress</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="calendar" size={32} color={themeColors.secondary} />
          <Text style={styles.summaryNumber}>3</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </View>
      </View>
    </View>
  );

  const renderGoalsProgress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Goals Progress</Text>

      {activeGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag" size={48} color={themeColors.textSecondary} />
          <Text style={styles.emptyStateText}>No active goals</Text>
          <Text style={styles.emptyStateSubtext}>
            Goals will appear here when assigned by your therapist
          </Text>
        </View>
      ) : (
        activeGoals.map(goal => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Ionicons
                  name={getTherapyIcon(goal.therapyType)}
                  size={24}
                  color={getTherapyColor(goal.therapyType)}
                />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
              <View style={styles.goalStatus}>
                <Text style={styles.goalProgress}>{goal.progress}%</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(goal.masteryStatus) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(goal.masteryStatus)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${goal.progress}%` }]}
              />
            </View>

            {goal.lastWorkedOn && (
              <Text style={styles.lastWorkedText}>
                Last worked on: {goal.lastWorkedOn.toLocaleDateString()}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>

      <View style={styles.activityCard}>
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={themeColors.success}
        />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Goal Mastered!</Text>
          <Text style={styles.activityDescription}>
            "Request Preferred Items" goal completed successfully
          </Text>
          <Text style={styles.activityTime}>2 days ago</Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <Ionicons name="calendar" size={24} color={themeColors.primary} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Therapy Session</Text>
          <Text style={styles.activityDescription}>
            Speech therapy session completed with great progress
          </Text>
          <Text style={styles.activityTime}>1 week ago</Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <Ionicons name="trending-up" size={24} color={themeColors.warning} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Progress Update</Text>
          <Text style={styles.activityDescription}>
            "Vowel Production" goal improved by 15%
          </Text>
          <Text style={styles.activityTime}>2 weeks ago</Text>
        </View>
      </View>
    </View>
  );

  const renderTherapyTeam = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Therapy Team</Text>

      <View style={styles.teamCard}>
        <View style={styles.teamMember}>
          <View style={styles.memberAvatar}>
            <Ionicons name="medical" size={24} color={themeColors.primary} />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Dr. Sarah Johnson</Text>
            <Text style={styles.memberRole}>Speech Therapist</Text>
            <Text style={styles.memberContact}>sarah.johnson@therapy.com</Text>
          </View>
        </View>

        <View style={styles.teamMember}>
          <View style={styles.memberAvatar}>
            <Ionicons
              name="hand-left"
              size={24}
              color={themeColors.secondary}
            />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Mike Chen</Text>
            <Text style={styles.memberRole}>Occupational Therapist</Text>
            <Text style={styles.memberContact}>mike.chen@therapy.com</Text>
          </View>
        </View>

        <View style={styles.teamMember}>
          <View style={styles.memberAvatar}>
            <Ionicons name="people" size={24} color={themeColors.success} />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Lisa Rodriguez</Text>
            <Text style={styles.memberRole}>ABA Therapist</Text>
            <Text style={styles.memberContact}>lisa.rodriguez@therapy.com</Text>
          </View>
        </View>
      </View>
    </View>
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
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to continue</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTimeframeSelector()}
        {renderProgressSummary()}
        {renderGoalsProgress()}
        {renderRecentActivity()}
        {renderTherapyTeam()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  timeframeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    marginBottom: SPACING.LG,
  },
  timeframeLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  timeframeButtons: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginLeft: SPACING.SM,
  },
  activeTimeframeButton: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  timeframeButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  activeTimeframeButtonText: {
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  summaryNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.SM,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  goalCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.MD,
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
    backgroundColor: themeColors.background,
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
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  goalProgress: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
    marginBottom: SPACING.XS,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  progressBar: {
    height: 8,
    backgroundColor: themeColors.border,
    borderRadius: 4,
    marginBottom: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    backgroundColor: themeColors.primary,
    borderRadius: 4,
  },
  lastWorkedText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.SM,
  },
  activityContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  teamCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.MD,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  memberRole: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    marginBottom: SPACING.XS,
  },
  memberContact: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.error,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
});
