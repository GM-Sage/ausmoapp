// Onboarding Screen

import React, { useState, useEffect } from 'react';
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
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import OnboardingService, {
  OnboardingStep,
  OnboardingProgress,
  Tutorial,
} from '../../services/onboardingService';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [onboardingService] = useState(() => OnboardingService.getInstance());
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'onboarding' | 'tutorials' | 'progress'
  >('onboarding');

  useEffect(() => {
    if (currentUser) {
      loadOnboardingData();
    }
  }, [currentUser]);

  const loadOnboardingData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await onboardingService.initialize(currentUser);

      const [currentStepData, progressData, tutorialsData] = await Promise.all([
        onboardingService.getCurrentStep(),
        onboardingService.getOnboardingProgress(),
        onboardingService.getTutorials(),
      ]);

      setCurrentStep(currentStepData);
      setProgress(progressData);
      setTutorials(tutorialsData);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      Alert.alert('Error', 'Failed to load onboarding data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      const newProgress = await onboardingService.startOnboarding();
      setProgress(newProgress);
      setCurrentStep(onboardingService.getCurrentStep());
    } catch (error) {
      console.error('Error starting onboarding:', error);
      Alert.alert('Error', 'Failed to start onboarding');
    }
  };

  const handleCompleteStep = async (stepId: string) => {
    try {
      await onboardingService.completeOnboardingStep(stepId);
      setCurrentStep(onboardingService.getCurrentStep());
      setProgress(onboardingService.getOnboardingProgress());
    } catch (error) {
      console.error('Error completing step:', error);
      Alert.alert('Error', 'Failed to complete step');
    }
  };

  const handleSkipStep = async (stepId: string) => {
    try {
      await onboardingService.skipOnboardingStep(stepId);
      setCurrentStep(onboardingService.getCurrentStep());
      setProgress(onboardingService.getOnboardingProgress());
    } catch (error) {
      console.error('Error skipping step:', error);
      Alert.alert('Error', 'Failed to skip step');
    }
  };

  const handleStartTutorial = async (tutorialId: string) => {
    try {
      const tutorial = await onboardingService.startTutorial(tutorialId);
      if (tutorial) {
        Alert.alert(
          'Tutorial Started',
          `${tutorial.title}\n\n${tutorial.description}\n\nEstimated time: ${tutorial.estimatedTime} minutes`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error starting tutorial:', error);
      Alert.alert('Error', 'Failed to start tutorial');
    }
  };

  const renderOnboardingTab = () => {
    if (!progress) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="rocket" size={64} color={themeColors.primary} />
          <Text style={styles.emptyStateTitle}>Welcome to Ausmo!</Text>
          <Text style={styles.emptyStateText}>
            Let's get you started with your AAC communication journey. Our
            guided onboarding will help you learn the basics.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartOnboarding}
          >
            <Text style={styles.startButtonText}>Start Onboarding</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!currentStep) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="checkmark-circle"
            size={64}
            color={themeColors.success}
          />
          <Text style={styles.emptyStateTitle}>Onboarding Complete!</Text>
          <Text style={styles.emptyStateText}>
            Congratulations! You've completed the onboarding process. You're now
            ready to start communicating with Ausmo.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.onboardingContainer}>
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>{currentStep.title}</Text>
            <Text style={styles.progressDescription}>
              {currentStep.description}
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{progress.progress}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressBarFill, { width: `${progress.progress}%` }]}
          />
        </View>

        {/* Step Content */}
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIcon}>
              <Ionicons
                name={
                  currentStep.type === 'welcome'
                    ? 'home'
                    : currentStep.type === 'setup'
                      ? 'person'
                      : currentStep.type === 'demo'
                        ? 'play'
                        : currentStep.type === 'tutorial'
                          ? 'book'
                          : currentStep.type === 'completion'
                            ? 'checkmark-circle'
                            : 'help'
                }
                size={32}
                color={themeColors.primary}
              />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepType}>
                {currentStep.type.toUpperCase()}
              </Text>
              <Text style={styles.stepDuration}>
                {currentStep.duration} seconds
              </Text>
            </View>
          </View>

          <View style={styles.stepActions}>
            <Text style={styles.actionsTitle}>What you'll do:</Text>
            {currentStep.actions.map(action => (
              <View key={action.id} style={styles.actionItem}>
                <Ionicons
                  name={
                    action.type === 'tap'
                      ? 'hand-left'
                      : action.type === 'swipe'
                        ? 'swap-horizontal'
                        : action.type === 'speak'
                          ? 'volume-high'
                          : action.type === 'navigate'
                            ? 'navigate'
                            : action.type === 'complete'
                              ? 'checkmark'
                              : 'help'
                  }
                  size={16}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.actionText}>{action.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteStep(currentStep.id)}
          >
            <Ionicons name="checkmark" size={20} color={themeColors.surface} />
            <Text style={styles.actionButtonText}>Complete Step</Text>
          </TouchableOpacity>

          {currentStep.isRequired === false && (
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton]}
              onPress={() => handleSkipStep(currentStep.id)}
            >
              <Ionicons
                name="arrow-forward"
                size={20}
                color={themeColors.textSecondary}
              />
              <Text style={[styles.actionButtonText, styles.skipButtonText]}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTutorialsTab = () => {
    const categories = [
      { key: 'basic', label: 'Basic', icon: 'book' },
      { key: 'advanced', label: 'Advanced', icon: 'star' },
      { key: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
      { key: 'collaboration', label: 'Collaboration', icon: 'people' },
      { key: 'education', label: 'Education', icon: 'school' },
    ];

    return (
      <View style={styles.tutorialsContainer}>
        <Text style={styles.sectionTitle}>Interactive Tutorials</Text>

        {categories.map(category => {
          const categoryTutorials = tutorials.filter(
            t => t.category === category.key
          );
          if (categoryTutorials.length === 0) return null;

          return (
            <View key={category.key} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={themeColors.primary}
                />
                <Text style={styles.categoryTitle}>{category.label}</Text>
              </View>

              {categoryTutorials.map(tutorial => (
                <TouchableOpacity
                  key={tutorial.id}
                  style={styles.tutorialCard}
                  onPress={() => handleStartTutorial(tutorial.id)}
                >
                  <View style={styles.tutorialHeader}>
                    <View style={styles.tutorialInfo}>
                      <Text style={styles.tutorialName}>{tutorial.title}</Text>
                      <Text style={styles.tutorialDescription}>
                        {tutorial.description}
                      </Text>
                    </View>
                    <View style={styles.tutorialMeta}>
                      <View
                        style={[
                          styles.difficultyBadge,
                          {
                            backgroundColor:
                              tutorial.difficulty === 'beginner'
                                ? themeColors.success
                                : tutorial.difficulty === 'intermediate'
                                  ? themeColors.warning
                                  : themeColors.error,
                          },
                        ]}
                      >
                        <Text style={styles.difficultyText}>
                          {tutorial.difficulty}
                        </Text>
                      </View>
                      <View style={styles.timeBadge}>
                        <Ionicons
                          name="time"
                          size={12}
                          color={themeColors.textSecondary}
                        />
                        <Text style={styles.timeText}>
                          {tutorial.estimatedTime}m
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tutorialProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${tutorial.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {tutorial.progress}%
                    </Text>
                  </View>

                  {tutorial.isCompleted && (
                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={themeColors.success}
                      />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderProgressTab = () => {
    if (!progress) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="bar-chart"
            size={48}
            color={themeColors.textSecondary}
          />
          <Text style={styles.emptyStateTitle}>No Progress Yet</Text>
          <Text style={styles.emptyStateText}>
            Start the onboarding process to track your progress.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Your Progress</Text>

        {/* Overall Progress */}
        <View style={styles.overallProgressCard}>
          <View style={styles.overallProgressHeader}>
            <Text style={styles.overallProgressTitle}>Onboarding Progress</Text>
            <Text style={styles.overallProgressValue}>
              {progress.progress}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress.progress}%` },
              ]}
            />
          </View>
          <View style={styles.overallProgressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {progress.completedSteps.length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {progress.skippedSteps.length}
              </Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.totalSteps}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Tutorial Progress */}
        <View style={styles.tutorialProgressCard}>
          <Text style={styles.tutorialProgressTitle}>Tutorial Progress</Text>
          {tutorials.map(tutorial => (
            <View key={tutorial.id} style={styles.tutorialProgressItem}>
              <View style={styles.tutorialProgressInfo}>
                <Text style={styles.tutorialProgressName}>
                  {tutorial.title}
                </Text>
                <Text style={styles.tutorialProgressCategory}>
                  {tutorial.category}
                </Text>
              </View>
              <View style={styles.tutorialProgressBar}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${tutorial.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.tutorialProgressValue}>
                {tutorial.progress}%
              </Text>
            </View>
          ))}
        </View>

        {/* Time Spent */}
        <View style={styles.timeSpentCard}>
          <Text style={styles.timeSpentTitle}>Time Spent</Text>
          <View style={styles.timeSpentInfo}>
            <Ionicons name="time" size={24} color={themeColors.primary} />
            <Text style={styles.timeSpentValue}>
              {progress.timeSpent} minutes
            </Text>
          </View>
          <Text style={styles.timeSpentDescription}>
            Total time spent on onboarding and tutorials
          </Text>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'onboarding':
        return renderOnboardingTab();
      case 'tutorials':
        return renderTutorialsTab();
      case 'progress':
        return renderProgressTab();
      default:
        return renderOnboardingTab();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading onboarding data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'onboarding', label: 'Onboarding', icon: 'rocket' },
          { key: 'tutorials', label: 'Tutorials', icon: 'book' },
          { key: 'progress', label: 'Progress', icon: 'bar-chart' },
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
    </View>
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
  startButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  onboardingContainer: {
    gap: SPACING.LG,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  progressDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
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
  stepContent: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: themeColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepType: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
    marginBottom: SPACING.XS,
  },
  stepDuration: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  stepActions: {
    gap: SPACING.SM,
  },
  actionsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  actionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.MD,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.SM,
  },
  completeButton: {
    backgroundColor: themeColors.primary,
  },
  skipButton: {
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  skipButtonText: {
    color: themeColors.textSecondary,
  },
  tutorialsContainer: {
    gap: SPACING.LG,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  categorySection: {
    gap: SPACING.MD,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  tutorialCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  tutorialInfo: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  tutorialName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  tutorialDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  tutorialMeta: {
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
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
  },
  timeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  tutorialProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    marginTop: SPACING.SM,
  },
  completedText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.success,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  progressContainer: {
    gap: SPACING.LG,
  },
  overallProgressCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  overallProgressTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  overallProgressValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
  },
  overallProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.MD,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  tutorialProgressCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tutorialProgressTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  tutorialProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  tutorialProgressInfo: {
    flex: 1,
  },
  tutorialProgressName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  tutorialProgressCategory: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  tutorialProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: themeColors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  tutorialProgressValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  timeSpentCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSpentTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  timeSpentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  timeSpentValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
  },
  timeSpentDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
});
