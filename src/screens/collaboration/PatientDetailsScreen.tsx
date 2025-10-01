// Patient Details Screen
// Shows detailed information about a specific patient

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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  RESPONSIVE,
} from '../../constants';
import TherapistService from '../../services/therapistService';

interface PatientDetailsScreenProps {
  route: {
    params: {
      patientId: string;
    };
  };
}

export default function PatientDetailsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const { patientId } = route.params as { patientId: string };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPatientData();
    }, [patientId])
  );

  const loadPatientData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const therapistService = TherapistService.getInstance();

      // Load patient details, goals, and tasks
      const [patientData, patientGoals, patientTasks] = await Promise.all([
        therapistService.getPatientDetails(patientId),
        therapistService.getPatientGoals(patientId),
        therapistService.getPatientTasks(patientId),
      ]);

      setPatient(patientData);
      setGoals(patientGoals);
      setTasks(patientTasks);
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignGoal = () => {
    navigation.navigate(
      'AssignGoal' as never,
      {
        patientId,
        patientName: patient?.name,
      } as never
    );
  };

  const handleAssignTask = () => {
    navigation.navigate(
      'AssignTask' as never,
      {
        patientId,
        patientName: patient?.name,
      } as never
    );
  };

  const handleViewProgress = () => {
    navigation.navigate(
      'PatientProgress' as never,
      {
        patientId,
        patientName: patient?.name,
      } as never
    );
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return themeColors.warning;
      case 'in-progress':
        return themeColors.primary;
      case 'completed':
        return themeColors.success;
      case 'cancelled':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return themeColors.primary;
      case 'paused':
        return themeColors.warning;
      case 'completed':
        return themeColors.success;
      case 'cancelled':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="person-outline"
            size={64}
            color={themeColors.textSecondary}
          />
          <Text style={styles.errorText}>Patient not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{patient.name || 'Unknown'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{patient.age || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diagnosis:</Text>
              <Text style={styles.infoValue}>{patient.diagnosis || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Communication Level:</Text>
              <Text style={styles.infoValue}>
                {patient.communicationLevel || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAssignGoal}
            >
              <Ionicons name="flag" size={24} color={themeColors.primary} />
              <Text style={styles.actionText}>Assign Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAssignTask}
            >
              <Ionicons name="list" size={24} color={themeColors.success} />
              <Text style={styles.actionText}>Assign Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewProgress}
            >
              <Ionicons
                name="trending-up"
                size={24}
                color={themeColors.warning}
              />
              <Text style={styles.actionText}>View Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Current Goals ({goals.length})
          </Text>
          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <TouchableOpacity
                key={index}
                style={styles.goalCard}
                onPress={() =>
                  navigation.navigate(
                    'GoalDetails' as never,
                    {
                      goalId: goal.id,
                      patientId,
                      patientName: patient?.name,
                    } as never
                  )
                }
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          goal.priority === 'high'
                            ? themeColors.error
                            : goal.priority === 'medium'
                              ? themeColors.warning
                              : themeColors.success,
                      },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {goal.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>
                    Progress: {goal.progress}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${goal.progress}%` },
                      ]}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getGoalStatusColor(goal.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {goal.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.goalTarget}>
                  Target Date: {goal.targetDate}
                </Text>
                {goal.milestones && goal.milestones.length > 0 && (
                  <View style={styles.milestonesContainer}>
                    <Text style={styles.milestonesTitle}>Milestones:</Text>
                    {goal.milestones
                      .slice(0, 2)
                      .map((milestone: any, mIndex: number) => (
                        <View key={mIndex} style={styles.milestoneItem}>
                          <Ionicons
                            name={
                              milestone.completed
                                ? 'checkmark-circle'
                                : 'ellipse-outline'
                            }
                            size={16}
                            color={
                              milestone.completed
                                ? themeColors.success
                                : themeColors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.milestoneText,
                              milestone.completed && styles.milestoneCompleted,
                            ]}
                          >
                            {milestone.description}
                          </Text>
                        </View>
                      ))}
                    {goal.milestones.length > 2 && (
                      <Text style={styles.moreMilestonesText}>
                        +{goal.milestones.length - 2} more milestones
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons
                name="flag-outline"
                size={32}
                color={themeColors.textSecondary}
              />
              <Text style={styles.emptyText}>No goals assigned yet</Text>
            </View>
          )}
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Current Tasks ({tasks.length})
          </Text>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <TouchableOpacity
                key={index}
                style={styles.taskCard}
                onPress={() =>
                  navigation.navigate(
                    'TaskDetails' as never,
                    {
                      taskId: task.id,
                      patientId,
                      patientName: patient?.name,
                    } as never
                  )
                }
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getTaskStatusColor(task.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {task.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="flag"
                      size={14}
                      color={getPriorityColor(task.priority)}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: getPriorityColor(task.priority) },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time"
                      size={14}
                      color={themeColors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {task.estimatedDuration}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar"
                      size={14}
                      color={themeColors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {task.dueDate
                        ? typeof task.dueDate === 'string'
                          ? new Date(task.dueDate).toLocaleDateString()
                          : task.dueDate.toLocaleDateString()
                        : 'No due date'}
                    </Text>
                  </View>
                </View>
                <View style={styles.taskProgress}>
                  <Text style={styles.progressLabel}>
                    Progress: {task.progress}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${task.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.sessionsText}>
                    Sessions: {task.completedSessions}/{task.totalSessions}
                  </Text>
                </View>
                {task.notes && (
                  <Text style={styles.taskNotes} numberOfLines={2}>
                    Notes: {task.notes}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons
                name="list-outline"
                size={32}
                color={themeColors.textSecondary}
              />
              <Text style={styles.emptyText}>No tasks assigned yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  errorText: {
    marginTop: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
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
  infoCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.textSecondary,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '30%',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.SM,
  },
  actionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.SM,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  priorityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  progressContainer: {
    marginBottom: SPACING.SM,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  progressBar: {
    height: 8,
    backgroundColor: themeColors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: themeColors.primary,
    borderRadius: 4,
  },
  goalStatus: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    marginBottom: SPACING.XS,
  },
  goalTarget: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  milestonesContainer: {
    marginTop: SPACING.SM,
  },
  milestonesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  milestoneText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.SM,
    flex: 1,
  },
  milestoneCompleted: {
    textDecorationLine: 'line-through',
    color: themeColors.success,
  },
  moreMilestonesText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: themeColors.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.XS,
  },
  taskCard: {
    backgroundColor: themeColors.surface,
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
  },
  taskTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
    marginRight: RESPONSIVE.getSpacing(SPACING.SM),
  },
  statusBadge: {
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.SM),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.XS),
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.XS),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  taskDescription: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.textSecondary,
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
    lineHeight: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL) * 1.4,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: RESPONSIVE.getSpacing(SPACING.SM),
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.SM),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.XS),
    borderRadius: BORDER_RADIUS.SM,
  },
  metaText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.XS),
    marginLeft: RESPONSIVE.getSpacing(SPACING.XS),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  taskProgress: {
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
  },
  progressLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.text_PRIMARY,
    marginBottom: RESPONSIVE.getSpacing(SPACING.XS),
  },
  sessionsText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.XS),
    color: themeColors.textSecondary,
    marginTop: RESPONSIVE.getSpacing(SPACING.XS),
  },
  taskNotes: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.XS),
    color: themeColors.textSecondary,
    fontStyle: 'italic',
    marginTop: RESPONSIVE.getSpacing(SPACING.SM),
  },
  emptyCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.XL,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});
