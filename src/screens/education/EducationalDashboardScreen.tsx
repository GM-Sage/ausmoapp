// Educational Dashboard Screen

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
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import EducationalService, {
  CoreVocabularySet,
  VocabularyProgress,
  LearningActivity,
  EducationalGoal,
} from '../../services/educationalService';
import { ScreenSafeArea } from '../../components/common/SafeAreaWrapper';
import { useSafeArea } from '../../hooks/useSafeArea';

const { width } = Dimensions.get('window');

export default function EducationalDashboardScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [educationalService] = useState(() => EducationalService.getInstance());
  const safeArea = useSafeArea();
  const [vocabularySets, setVocabularySets] = useState<CoreVocabularySet[]>([]);
  const [learningActivities, setLearningActivities] = useState<
    LearningActivity[]
  >([]);
  const [goals, setGoals] = useState<EducationalGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'vocabulary' | 'activities' | 'goals' | 'progress'
  >('vocabulary');

  useEffect(() => {
    if (currentUser) {
      loadEducationalData();
    }
  }, [currentUser]);

  const loadEducationalData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await educationalService.initialize(currentUser);

      const [sets, activities] = await Promise.all([
        educationalService.getCoreVocabularySets(),
        educationalService.getLearningActivities(currentUser.id),
      ]);

      setVocabularySets(sets);
      setLearningActivities(activities);
    } catch (error) {
      console.error('Error loading educational data:', error);
      Alert.alert('Error', 'Failed to load educational data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVocabularySetPress = async (vocabularySet: CoreVocabularySet) => {
    try {
      const progress = await educationalService.getVocabularyProgress(
        currentUser!.id,
        vocabularySet.id
      );
      if (progress) {
        Alert.alert(
          'Vocabulary Progress',
          `Mastery Level: ${progress.masteryLevel}%\n\nMastered: ${progress.masteredSymbols.length}/${progress.totalSymbols}\nLearning: ${progress.learningSymbols.length}\nNot Started: ${progress.notStartedSymbols.length}`,
          [
            { text: 'OK' },
            {
              text: 'Start Learning',
              onPress: () => startLearning(vocabularySet.id),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error getting vocabulary progress:', error);
    }
  };

  const handleActivityPress = (activity: LearningActivity) => {
    Alert.alert(
      'Learning Activity',
      `${activity.name}\n\n${activity.description}\n\nDuration: ${activity.duration} minutes\nDifficulty: ${activity.difficulty}`,
      [
        { text: 'OK' },
        { text: 'Start Activity', onPress: () => startActivity(activity.id) },
      ]
    );
  };

  const handleGoalPress = (goal: EducationalGoal) => {
    Alert.alert(
      'Educational Goal',
      `${goal.title}\n\n${goal.description}\n\nProgress: ${goal.progress}%\nTarget Date: ${goal.targetDate.toLocaleDateString()}`,
      [
        { text: 'OK' },
        { text: 'Update Progress', onPress: () => updateGoalProgress(goal.id) },
      ]
    );
  };

  const startLearning = (vocabularySetId: string) => {
    Alert.alert(
      'Start Learning',
      `Starting vocabulary learning for set: ${vocabularySetId}`
    );
  };

  const startActivity = (activityId: string) => {
    Alert.alert('Start Activity', `Starting learning activity: ${activityId}`);
  };

  const updateGoalProgress = (goalId: string) => {
    Alert.alert('Update Progress', `Updating progress for goal: ${goalId}`);
  };

  const handleCreateGoal = () => {
    Alert.alert('Create Goal', 'Goal creation functionality coming soon');
  };

  const handleStartAssessment = () => {
    Alert.alert('Start Assessment', 'Assessment functionality coming soon');
  };

  const renderVocabularyTab = () => {
    return (
      <View style={styles.vocabularyContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Core Vocabulary Sets</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleStartAssessment}
          >
            <Ionicons name="clipboard" size={20} color={themeColors.primary} />
            <Text style={styles.headerButtonText}>Assessment</Text>
          </TouchableOpacity>
        </View>

        {vocabularySets.map(vocabularySet => (
          <TouchableOpacity
            key={vocabularySet.id}
            style={styles.vocabularyCard}
            onPress={() => handleVocabularySetPress(vocabularySet)}
          >
            <View style={styles.vocabularyHeader}>
              <View style={styles.vocabularyInfo}>
                <Text style={styles.vocabularyName}>{vocabularySet.name}</Text>
                <Text style={styles.vocabularyDescription}>
                  {vocabularySet.description}
                </Text>
              </View>
              <View
                style={[
                  styles.levelBadge,
                  {
                    backgroundColor:
                      vocabularySet.level === 'beginner'
                        ? themeColors.success
                        : vocabularySet.level === 'intermediate'
                          ? themeColors.warning
                          : themeColors.error,
                  },
                ]}
              >
                <Text style={styles.levelText}>{vocabularySet.level}</Text>
              </View>
            </View>

            <View style={styles.vocabularyDetails}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="people"
                  size={16}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.detailText}>
                  Ages {vocabularySet.ageRange.min}-{vocabularySet.ageRange.max}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="library"
                  size={16}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.detailText}>
                  {vocabularySet.symbols.length} symbols
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="folder"
                  size={16}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.detailText}>
                  {vocabularySet.categories.join(', ')}
                </Text>
              </View>
            </View>

            <View style={styles.vocabularyFooter}>
              <Text style={styles.vocabularyFooterText}>
                Tap to view progress and start learning
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={themeColors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderActivitiesTab = () => {
    return (
      <View style={styles.activitiesContainer}>
        <Text style={styles.sectionTitle}>Learning Activities</Text>

        {learningActivities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => handleActivityPress(activity)}
          >
            <View style={styles.activityHeader}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
              </View>
              <View style={styles.activityMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        activity.difficulty === 'easy'
                          ? themeColors.success
                          : activity.difficulty === 'medium'
                            ? themeColors.warning
                            : themeColors.error,
                    },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {activity.difficulty}
                  </Text>
                </View>
                <View style={styles.durationBadge}>
                  <Ionicons
                    name="time"
                    size={12}
                    color={themeColors.textSecondary}
                  />
                  <Text style={styles.durationText}>{activity.duration}m</Text>
                </View>
              </View>
            </View>

            <View style={styles.activityDetails}>
              <View style={styles.activityType}>
                <Ionicons
                  name={
                    activity.type === 'game'
                      ? 'game-controller'
                      : activity.type === 'exercise'
                        ? 'fitness'
                        : activity.type === 'story'
                          ? 'book'
                          : activity.type === 'conversation'
                            ? 'chatbubbles'
                            : 'clipboard'
                  }
                  size={16}
                  color={themeColors.primary}
                />
                <Text style={styles.activityTypeText}>{activity.type}</Text>
              </View>
              <View style={styles.activityAge}>
                <Ionicons
                  name="people"
                  size={16}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.activityAgeText}>
                  Ages {activity.ageRange.min}-{activity.ageRange.max}
                </Text>
              </View>
            </View>

            <View style={styles.activityObjectives}>
              <Text style={styles.objectivesTitle}>Learning Objectives:</Text>
              <Text style={styles.objectivesText}>
                {activity.learningObjectives.join(', ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderGoalsTab = () => {
    return (
      <View style={styles.goalsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Educational Goals</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCreateGoal}
          >
            <Ionicons name="add-circle" size={20} color={themeColors.primary} />
            <Text style={styles.headerButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="flag"
              size={48}
              color={themeColors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first educational goal to track progress and stay
              motivated.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleCreateGoal}
            >
              <Text style={styles.emptyStateButtonText}>
                Create Your First Goal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalCard}
              onPress={() => handleGoalPress(goal)}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
                <View style={styles.goalStatus}>
                  {goal.isCompleted ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={themeColors.success}
                    />
                  ) : (
                    <View style={styles.progressCircle}>
                      <Text style={styles.progressText}>{goal.progress}%</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.goalProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${goal.progress}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.goalFooter}>
                <View style={styles.goalMeta}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={themeColors.textSecondary}
                  />
                  <Text style={styles.goalMetaText}>
                    Target: {goal.targetDate.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.goalMeta}>
                  <Ionicons
                    name="flag"
                    size={16}
                    color={themeColors.textSecondary}
                  />
                  <Text style={styles.goalMetaText}>
                    {goal.milestones.length} milestones
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  const renderProgressTab = () => {
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Learning Progress</Text>

        <View style={styles.progressOverview}>
          <View style={styles.progressCard}>
            <Ionicons name="library" size={24} color={themeColors.primary} />
            <Text style={styles.progressValue}>{vocabularySets.length}</Text>
            <Text style={styles.progressLabel}>Vocabulary Sets</Text>
          </View>
          <View style={styles.progressCard}>
            <Ionicons
              name="game-controller"
              size={24}
              color={themeColors.success}
            />
            <Text style={styles.progressValue}>
              {learningActivities.length}
            </Text>
            <Text style={styles.progressLabel}>Activities</Text>
          </View>
          <View style={styles.progressCard}>
            <Ionicons name="flag" size={24} color={themeColors.warning} />
            <Text style={styles.progressValue}>{goals.length}</Text>
            <Text style={styles.progressLabel}>Goals</Text>
          </View>
        </View>

        <View style={styles.progressChart}>
          <Text style={styles.chartTitle}>Learning Progress Over Time</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons
              name="bar-chart"
              size={48}
              color={themeColors.textSecondary}
            />
            <Text style={styles.chartPlaceholderText}>Progress Chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              Visual progress tracking coming soon
            </Text>
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          <View style={styles.achievementItem}>
            <Ionicons name="trophy" size={20} color={themeColors.warning} />
            <Text style={styles.achievementText}>
              Completed Basic Core Vocabulary
            </Text>
          </View>
          <View style={styles.achievementItem}>
            <Ionicons name="star" size={20} color={themeColors.success} />
            <Text style={styles.achievementText}>Mastered 50+ symbols</Text>
          </View>
          <View style={styles.achievementItem}>
            <Ionicons name="medal" size={20} color={themeColors.info} />
            <Text style={styles.achievementText}>
              Completed 10 learning activities
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'vocabulary':
        return renderVocabularyTab();
      case 'activities':
        return renderActivitiesTab();
      case 'goals':
        return renderGoalsTab();
      case 'progress':
        return renderProgressTab();
      default:
        return renderVocabularyTab();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading educational content...</Text>
      </View>
    );
  }

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'vocabulary', label: 'Vocabulary', icon: 'library' },
          { key: 'activities', label: 'Activities', icon: 'game-controller' },
          { key: 'goals', label: 'Goals', icon: 'flag' },
          { key: 'progress', label: 'Progress', icon: 'trending-up' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonSelected,
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={
                selectedTab === tab.key
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === tab.key && styles.tabButtonTextSelected,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </ScreenSafeArea>
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
    backgroundColor: themeColors.background,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingTop: 10, // Add some top padding for better spacing
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    gap: SPACING.XS,
  },
  tabButtonSelected: {
    backgroundColor: themeColors.primary,
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  tabButtonTextSelected: {
    color: themeColors.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.MD,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.primary,
    gap: SPACING.XS,
  },
  headerButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  vocabularyContainer: {
    gap: SPACING.MD,
  },
  vocabularyCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  vocabularyInfo: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  vocabularyName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  vocabularyDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  levelBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  levelText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  vocabularyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  detailText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  vocabularyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vocabularyFooterText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  activitiesContainer: {
    gap: SPACING.MD,
  },
  activityCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  activityInfo: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  activityName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: SPACING.XS,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
  },
  durationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  activityType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  activityTypeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  activityAge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  activityAgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  activityObjectives: {
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
  },
  objectivesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  objectivesText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  goalsContainer: {
    gap: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  emptyStateButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  emptyStateButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  goalCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  goalInfo: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  goalName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  goalStatus: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  goalProgress: {
    marginBottom: SPACING.SM,
  },
  progressBar: {
    height: 8,
    backgroundColor: themeColors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: themeColors.primary,
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  goalMetaText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  progressContainer: {
    gap: SPACING.LG,
  },
  progressOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  progressCard: {
    flex: 1,
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.SM,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  progressChart: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  chartPlaceholderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.SM,
  },
  chartPlaceholderSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  achievementsContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  achievementsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    paddingVertical: SPACING.SM,
  },
  achievementText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
});
