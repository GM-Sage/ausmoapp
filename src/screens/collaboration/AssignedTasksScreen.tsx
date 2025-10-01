// Assigned Tasks Screen
// Shows therapist-assigned tasks for child and parent profiles

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
import { TherapyTask, TherapyGoal } from '../../types';
import TherapistService from '../../services/therapistService';

export default function AssignedTasksScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [assignedTasks, setAssignedTasks] = useState<TherapyTask[]>([]);
  const [assignedGoals, setAssignedGoals] = useState<TherapyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'active' | 'completed'
  >('all');

  const therapistService = TherapistService.getInstance();

  useEffect(() => {
    loadAssignedTasks();
  }, [currentUser]);

  const loadAssignedTasks = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // For child profiles, get their assigned tasks
      if (currentUser.role === 'child' && currentUser.childProfile) {
        const childId = currentUser.id;
        const goals = await therapistService.getGoalsByPatient(childId);
        setAssignedGoals(goals);

        // Get tasks for each goal
        const allTasks: TherapyTask[] = [];
        for (const goal of goals) {
          const tasks = await therapistService.getTasksByGoal(goal.id);
          allTasks.push(...tasks);
        }
        setAssignedTasks(allTasks);
      }

      // For parent profiles, get tasks for their children
      else if (currentUser.role === 'parent' && currentUser.parentProfile) {
        const children = currentUser.parentProfile.children;
        const allTasks: TherapyTask[] = [];
        const allGoals: TherapyGoal[] = [];

        for (const childId of children) {
          const goals = await therapistService.getGoalsByPatient(childId);
          allGoals.push(...goals);

          for (const goal of goals) {
            const tasks = await therapistService.getTasksByGoal(goal.id);
            allTasks.push(...tasks);
          }
        }

        setAssignedGoals(allGoals);
        setAssignedTasks(allTasks);
      }
    } catch (error) {
      console.error('Error loading assigned tasks:', error);
      Alert.alert('Error', 'Failed to load assigned tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredTasks = () => {
    switch (selectedFilter) {
      case 'active':
        return assignedTasks.filter(task => task.isActive);
      case 'completed':
        return assignedTasks.filter(task => !task.isActive);
      default:
        return assignedTasks;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return themeColors.success;
      case 'intermediate':
        return themeColors.warning;
      case 'advanced':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  const renderTaskItem = ({ item }: { item: TherapyTask }) => {
    const goal = assignedGoals.find(g => g.id === item.goalId);

    return (
      <TouchableOpacity style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskIconContainer}>
            <Ionicons
              name={getTherapyIcon(goal?.therapyType || 'ABA')}
              size={24}
              color={getTherapyColor(goal?.therapyType || 'ABA')}
            />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            {goal && <Text style={styles.goalTitle}>Goal: {goal.title}</Text>}
          </View>
          <View style={styles.taskStatus}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {item.difficulty.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.durationText}>
              {item.estimatedDuration} min
            </Text>
          </View>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Skills:</Text>
            <Text style={styles.skillsText}>{item.skills.join(', ')}</Text>
          </View>

          {item.instructions.length > 0 && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsLabel}>Instructions:</Text>
              {item.instructions.slice(0, 2).map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  • {instruction}
                </Text>
              ))}
              {item.instructions.length > 2 && (
                <Text style={styles.moreInstructionsText}>
                  +{item.instructions.length - 2} more instructions
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.materialsContainer}>
            <Ionicons
              name="cube"
              size={16}
              color={themeColors.textSecondary}
            />
            <Text style={styles.materialsText}>
              {item.materials.length} materials needed
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartTask(item)}
            accessible={true}
            accessibilityLabel={`Start ${item.title} task`}
            accessibilityRole="button"
          >
            <Ionicons name="play" size={16} color={themeColors.surface} />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleStartTask = (task: TherapyTask) => {
    Alert.alert('Start Task', `Ready to start "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          // In a real app, this would navigate to the task execution screen
          Alert.alert('Task Started', `Starting ${task.title}...`);
        },
      },
    ]);
  };

  const renderFilterTab = (filter: 'all' | 'active' | 'completed') => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterTab,
        selectedFilter === filter && styles.filterTabActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
      accessible={true}
      accessibilityLabel={`${filter} tasks`}
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
      <Ionicons name="clipboard" size={64} color={themeColors.textSecondary} />
      <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
      <Text style={styles.emptyDescription}>
        Your therapist hasn't assigned any tasks yet. Check back later!
      </Text>
    </View>
  );

  const filteredTasks = getFilteredTasks();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Assigned Tasks</Text>
        <Text style={styles.subtitle}>Tasks assigned by your therapy team</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {(['all', 'active', 'completed'] as const).map(renderFilterTab)}
        </ScrollView>
      </View>

      {/* Tasks List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.tasksList}
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
  tasksList: {
    padding: SPACING.LG,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  taskDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  taskStatus: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.XS,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  durationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  taskDetails: {
    marginBottom: SPACING.SM,
  },
  skillsContainer: {
    marginBottom: SPACING.SM,
  },
  skillsLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  skillsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  instructionsContainer: {
    marginBottom: SPACING.SM,
  },
  instructionsLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  moreInstructionsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontStyle: 'italic',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.XS,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
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
