// Quiz Screen - Main quiz interface
// Handles quiz taking, scoring, and results

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import QuizService, {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizResult,
} from '../../services/quizService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface QuizScreenProps {
  navigation: any;
  route: {
    params: {
      quizId: string;
    };
  };
}

export default function QuizScreen({ navigation, route }: QuizScreenProps) {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const { quizId } = route.params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | string[] | null
  >(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const quizService = QuizService.getInstance();

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (attempt) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [attempt]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await quizService.getQuiz(quizId);
      setQuiz(quizData);

      if (currentUser) {
        const newAttempt = await quizService.startQuizAttempt(
          currentUser.id,
          quizId
        );
        setAttempt(newAttempt);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please try again.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (
      currentQuestion.questionType === 'multiple_choice' ||
      currentQuestion.questionType === 'true_false'
    ) {
      setSelectedAnswer(answerId);
    } else if (currentQuestion.questionType === 'image_choice') {
      // Handle multiple selection for image choice
      if (Array.isArray(currentQuestion.correctAnswer)) {
        const currentSelection = Array.isArray(selectedAnswer)
          ? selectedAnswer
          : [];
        if (currentSelection.includes(answerId)) {
          setSelectedAnswer(currentSelection.filter(id => id !== answerId));
        } else {
          setSelectedAnswer([...currentSelection, answerId]);
        }
      } else {
        setSelectedAnswer(answerId);
      }
    }
  };

  const handleNextQuestion = async () => {
    if (!quiz || !attempt || selectedAnswer === null) {
      Alert.alert(
        'Please Answer',
        'Please select an answer before continuing.'
      );
      return;
    }

    try {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      await quizService.submitAnswer(
        attempt.id,
        currentQuestion.id,
        selectedAnswer,
        timeSpent
      );

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeSpent(0);
      } else {
        // Quiz completed
        const quizResult = await quizService.completeQuizAttempt(attempt.id);
        setResult(quizResult);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setTimeSpent(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    if (!quiz) return null;

    const question = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
          <Text style={styles.timeSpent}>{formatTime(timeSpent)}</Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        {question.imageUrl && (
          <View style={styles.imageContainer}>
            {/* Image would be rendered here */}
            <Text style={styles.imagePlaceholder}>
              [Image: {question.imageUrl}]
            </Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {question.options.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                (selectedAnswer === option.id ||
                  (Array.isArray(selectedAnswer) &&
                    selectedAnswer.includes(option.id))) &&
                  styles.optionButtonSelected,
              ]}
              onPress={() => handleAnswerSelect(option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  (selectedAnswer === option.id ||
                    (Array.isArray(selectedAnswer) &&
                      selectedAnswer.includes(option.id))) &&
                    styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={themeColors.surface}
            />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>
              {isLastQuestion ? 'Finish Quiz' : 'Next'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.surface}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    const { attempt, quiz, performance } = result;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Ionicons
            name={attempt.passed ? 'checkmark-circle' : 'close-circle'}
            size={64}
            color={attempt.passed ? themeColors.success : themeColors.error}
          />
          <Text style={styles.resultTitle}>
            {attempt.passed ? 'Quiz Passed!' : 'Quiz Failed'}
          </Text>
          <Text style={styles.resultScore}>
            {attempt.percentage.toFixed(1)}% ({attempt.score}/{quiz.totalPoints}{' '}
            points)
          </Text>
        </View>

        <View style={styles.performanceContainer}>
          <Text style={styles.performanceTitle}>Performance Summary</Text>

          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Correct Answers:</Text>
            <Text style={styles.performanceValue}>
              {performance.correctAnswers}/{performance.totalQuestions}
            </Text>
          </View>

          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Accuracy:</Text>
            <Text style={styles.performanceValue}>
              {performance.accuracy.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Time Spent:</Text>
            <Text style={styles.performanceValue}>
              {formatTime(attempt.timeSpent)}
            </Text>
          </View>

          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Avg Time/Question:</Text>
            <Text style={styles.performanceValue}>
              {formatTime(Math.round(performance.averageTimePerQuestion))}
            </Text>
          </View>
        </View>

        {performance.strengths.length > 0 && (
          <View style={styles.strengthsContainer}>
            <Text style={styles.strengthsTitle}>Strengths</Text>
            {performance.strengths.map((strength, index) => (
              <Text key={index} style={styles.strengthItem}>
                • {strength}
              </Text>
            ))}
          </View>
        )}

        {performance.weaknesses.length > 0 && (
          <View style={styles.weaknessesContainer}>
            <Text style={styles.weaknessesTitle}>Areas for Improvement</Text>
            {performance.weaknesses.map((weakness, index) => (
              <Text key={index} style={styles.weaknessItem}>
                • {weakness}
              </Text>
            ))}
          </View>
        )}

        {performance.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            {performance.recommendations.map((recommendation, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {recommendation}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionButtonText}>Back to Quizzes</Text>
          </TouchableOpacity>

          {!attempt.passed && (
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={() => {
                setShowResult(false);
                loadQuiz();
              }}
            >
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={themeColors.error} />
        <Text style={styles.errorText}>Quiz not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: themeColors.surface,
            borderBottomColor: themeColors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{quiz.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showResult ? renderResult() : renderQuestion()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    // backgroundColor, borderBottomColor will be set dynamically based on theme
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.MD,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  errorButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  errorButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
  },
  questionContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  questionNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.textSecondary,
  },
  timeSpent: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.primary,
  },
  questionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    lineHeight: 28,
    marginBottom: SPACING.LG,
  },
  imageContainer: {
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginBottom: SPACING.XL,
  },
  optionButton: {
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 2,
    borderColor: themeColors.border,
  },
  optionButtonSelected: {
    backgroundColor: themeColors.primary_LIGHT,
    borderColor: themeColors.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  navButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginHorizontal: SPACING.SM,
  },
  resultContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  resultScore: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.textSecondary,
  },
  performanceContainer: {
    marginBottom: SPACING.XL,
  },
  performanceTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.LG,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  performanceLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  performanceValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.primary,
  },
  strengthsContainer: {
    marginBottom: SPACING.LG,
  },
  strengthsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.success,
    marginBottom: SPACING.SM,
  },
  strengthItem: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  weaknessesContainer: {
    marginBottom: SPACING.LG,
  },
  weaknessesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.error,
    marginBottom: SPACING.SM,
  },
  weaknessItem: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  recommendationsContainer: {
    marginBottom: SPACING.XL,
  },
  recommendationsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
    marginBottom: SPACING.SM,
  },
  recommendationItem: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  retryButton: {
    backgroundColor: themeColors.secondary,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
  },
});
