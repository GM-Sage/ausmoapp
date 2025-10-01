// Assigned Goals Screen
// Shows therapist-assigned goals for child and parent profiles

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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { RootState } from '../../store';
import { TherapyGoal } from '../../types';
import TherapistService from '../../services/therapistService';

export default function AssignedGoalsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [assignedGoals, setAssignedGoals] = useState<TherapyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'active' | 'mastered' | 'paused'
  >('all');

  const therapistService = TherapistService.getInstance();

  useEffect(() => {
    loadAssignedGoals();
  }, [currentUser]);

  const loadAssignedGoals = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // For child profiles, get their assigned goals
      if (currentUser.role === 'child' && currentUser.childProfile) {
        const childId = currentUser.id;
        const goals = await therapistService.getGoalsByPatient(childId);
        setAssignedGoals(goals);
      }

      // For parent profiles, get goals for their children
      else if (currentUser.role === 'parent' && currentUser.parentProfile) {
        const children = currentUser.parentProfile.children;
        const allGoals: TherapyGoal[] = [];

        for (const childId of children) {
          const goals = await therapistService.getGoalsByPatient(childId);
          allGoals.push(...goals);
        }

        setAssignedGoals(allGoals);
      }
    } catch (error) {
      console.error('Error loading assigned goals:', error);
      Alert.alert('Error', 'Failed to load assigned goals');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredGoals = () => {
    switch (selectedFilter) {
      case 'active':
        return assignedGoals.filter(goal => goal.status === 'active');
      case 'mastered':
        return assignedGoals.filter(goal => goal.status === 'mastered');
      case 'paused':
        return assignedGoals.filter(goal => goal.status === 'paused');
      default:
        return assignedGoals;
    }
  };

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
      case 'active':
        return themeColors.primary;
      case 'mastered':
        return themeColors.success;
      case 'paused':
        return themeColors.warning;
      case 'discontinued':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'mastered':
        return 'Mastered';
      case 'paused':
        return 'Paused';
      case 'discontinued':
        return 'Discontinued';
      default:
        return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return themeColors.error;
      case 'medium':
        return themeColors.warning;
      case 'low':
        return themeColors.success;
      default:
        return themeColors.textSecondary;
    }
  };

  const calculateProgress = (goal: TherapyGoal): number => {
    const baseline = goal.baselineData;
    const target = goal.targetData;
    const current = goal.currentProgress;

    if (target.frequency === baseline.frequency) return 0;

    const progress = Math.min(
      100,
      ((current.frequency - baseline.frequency) /
        (target.frequency - baseline.frequency)) *
        100
    );

    return Math.max(0, progress);
  };

  const renderGoalItem = ({ item }: { item: TherapyGoal }) => {
    const progress = calculateProgress(item);

    return (
      <TouchableOpacity style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconContainer}>
            <Ionicons
              name={getTherapyIcon(item.therapyType)}
              size={24}
              color={getTherapyColor(item.therapyType)}
            />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalDescription}>{item.description}</Text>
            <Text style={styles.goalCategory}>{item.category}</Text>
          </View>
          <View style={styles.goalStatus}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.goalDetails}>
          <View style={styles.targetBehaviorContainer}>
            <Text style={styles.targetBehaviorLabel}>Target Behavior:</Text>
            <Text style={styles.targetBehaviorText}>{item.targetBehavior}</Text>
          </View>

          <View style={styles.measurementContainer}>
            <Text style={styles.measurementLabel}>Measurement:</Text>
            <Text style={styles.measurementText}>
              {item.measurementCriteria}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.progressDetails}>
            <View style={styles.progressItem}>
              <Text style={styles.progressItemLabel}>Baseline:</Text>
              <Text style={styles.progressItemValue}>
                {item.baselineData.frequency}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressItemLabel}>Current:</Text>
              <Text style={styles.progressItemValue}>
                {item.currentProgress.frequency}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressItemLabel}>Target:</Text>
              <Text style={styles.progressItemValue}>
                {item.targetData.frequency}
              </Text>
            </View>
          </View>
        </View>

        {item.masteredAt && (
          <View style={styles.masteryContainer}>
            <Ionicons name="trophy" size={16} color={themeColors.warning} />
            <Text style={styles.masteryText}>
              Mastered on {item.masteredAt.toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.goalFooter}>
          <View style={styles.timeframeContainer}>
            <Ionicons
              name="time"
              size={16}
              color={themeColors.textSecondary}
            />
            <Text style={styles.timeframeText}>
              {item.targetData.timeframe} days target
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item)}
            accessible={true}
            accessibilityLabel={`View details for ${item.title}`}
            accessibilityRole="button"
          >
            <Ionicons
              name="information-circle"
              size={16}
              color={themeColors.primary}
            />
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleViewDetails = (goal: TherapyGoal) => {
    Alert.alert(
      goal.title,
      `${goal.description}\n\nTarget Behavior: ${goal.targetBehavior}\n\nMeasurement: ${goal.measurementCriteria}\n\nBaseline: ${goal.baselineData.frequency}\nCurrent: ${goal.currentProgress.frequency}\nTarget: ${goal.targetData.frequency}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderFilterTab = (
    filter: 'all' | 'active' | 'mastered' | 'paused'
  ) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterTab,
        selectedFilter === filter && styles.filterTabActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
      accessible={true}
      accessibilityLabel={`${filter} goals`}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.filterTabText,
          selectedFilter === filter && styles.filterTabTextActive,
        ]}
      >
        {filter.charAt(0).toUpperCase() + filter.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="flag" size={64} color={themeColors.textSecondary} />
      <Text style={styles.emptyTitle}>No Goals Assigned</Text>
      <Text style={styles.emptyDescription}>
        Your therapist hasn't assigned any goals yet. Check back later!
      </Text>
    </View>
  );

  const filteredGoals = getFilteredGoals();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Assigned Goals</Text>
        <Text style={styles.subtitle}>Goals assigned by your therapy team</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {(['all', 'active', 'mastered', 'paused'] as const).map(
            renderFilterTab
          )}
        </ScrollView>
      </View>

      {/* Goals List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      ) : filteredGoals.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredGoals}
          renderItem={renderGoalItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.goalsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.HEADING_LARGE,
    color: themeColors.text_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  filterTabsContainer: {
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  filterTabsContent: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  filterTab: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: themeColors.background,
  },
  filterTabActive: {
    backgroundColor: themeColors.primary,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  filterTabTextActive: {
    color: themeColors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
  },
  goalsList: {
    padding: SPACING.LG,
  },
  goalCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: themeColors.border,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: SPACING.XS,
  },
  goalCategory: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.XS,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  priorityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  goalDetails: {
    marginBottom: SPACING.SM,
  },
  targetBehaviorContainer: {
    marginBottom: SPACING.SM,
  },
  targetBehaviorLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  targetBehaviorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  measurementContainer: {
    marginBottom: SPACING.SM,
  },
  measurementLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  measurementText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  progressSection: {
    marginBottom: SPACING.SM,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  progressPercentage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
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
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressItemLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  progressItemValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  masteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.warning + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.SM,
  },
  masteryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.warning,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginLeft: SPACING.XS,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeframeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeframeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.XS,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  detailsButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginLeft: SPACING.XS,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  emptyTitle: {
    ...TYPOGRAPHY.HEADING_MEDIUM,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
});
