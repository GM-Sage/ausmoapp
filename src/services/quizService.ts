// Quiz System Service
// Handles quiz creation, management, and scoring

import { DatabaseService } from './databaseService';
import { SupabaseDatabaseService } from './supabaseDatabaseService';

export interface QuizQuestion {
  id: string;
  question: string;
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'image_choice'
    | 'audio_choice';
  options: QuizOption[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  imageUrl?: string;
  audioUrl?: string;
  points: number;
  timeLimit?: number; // in seconds
}

export interface QuizOption {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit?: number; // total time in minutes
  passingScore: number; // percentage
  maxAttempts?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  passed: boolean;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  performance: {
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    averageTimePerQuestion: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  mostMissedQuestions: string[];
  categoryPerformance: Record<string, number>;
  difficultyPerformance: Record<string, number>;
}

class QuizService {
  private static instance: QuizService;
  private dbService: DatabaseService;
  private supabaseService: SupabaseDatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.supabaseService = SupabaseDatabaseService.getInstance();
  }

  public static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  // Create a new quiz
  async createQuiz(
    quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Quiz> {
    try {
      const newQuiz: Quiz = {
        ...quiz,
        id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.supabaseService.createQuiz(newQuiz);
      return newQuiz;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz');
    }
  }

  // Get quiz by ID
  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      return await this.supabaseService.getQuiz(quizId);
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw new Error('Failed to get quiz');
    }
  }

  // Get quizzes by category
  async getQuizzesByCategory(category: string): Promise<Quiz[]> {
    try {
      return await this.supabaseService.getQuizzesByCategory(category);
    } catch (error) {
      console.error('Error getting quizzes by category:', error);
      throw new Error('Failed to get quizzes');
    }
  }

  // Get quizzes by difficulty
  async getQuizzesByDifficulty(difficulty: string): Promise<Quiz[]> {
    try {
      return await this.supabaseService.getQuizzesByDifficulty(difficulty);
    } catch (error) {
      console.error('Error getting quizzes by difficulty:', error);
      throw new Error('Failed to get quizzes');
    }
  }

  // Search quizzes
  async searchQuizzes(query: string): Promise<Quiz[]> {
    try {
      return await this.supabaseService.searchQuizzes(query);
    } catch (error) {
      console.error('Error searching quizzes:', error);
      throw new Error('Failed to search quizzes');
    }
  }

  // Start a quiz attempt
  async startQuizAttempt(userId: string, quizId: string): Promise<QuizAttempt> {
    try {
      const quiz = await this.getQuiz(quizId);

      // Check if user has exceeded max attempts
      if (quiz.maxAttempts) {
        const attempts = await this.getUserQuizAttempts(userId, quizId);
        if (attempts.length >= quiz.maxAttempts) {
          throw new Error('Maximum attempts exceeded for this quiz');
        }
      }

      const attempt: QuizAttempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        quizId,
        answers: [],
        score: 0,
        totalPoints: quiz.totalPoints,
        percentage: 0,
        timeSpent: 0,
        completedAt: new Date(),
        passed: false,
      };

      await this.supabaseService.createQuizAttempt(attempt);
      return attempt;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  // Submit quiz answer
  async submitAnswer(
    attemptId: string,
    questionId: string,
    selectedAnswer: string | string[],
    timeSpent: number
  ): Promise<QuizAnswer> {
    try {
      const attempt = await this.supabaseService.getQuizAttempt(attemptId);
      const quiz = await this.getQuiz(attempt.quizId);
      const question = quiz.questions.find(q => q.id === questionId);

      if (!question) {
        throw new Error('Question not found');
      }

      const isCorrect = this.checkAnswer(question, selectedAnswer);
      const pointsEarned = isCorrect ? question.points : 0;

      const answer: QuizAnswer = {
        questionId,
        selectedAnswer,
        isCorrect,
        pointsEarned,
        timeSpent,
      };

      // Update attempt with new answer
      const updatedAnswers = [...attempt.answers, answer];
      const newScore = updatedAnswers.reduce(
        (sum, ans) => sum + ans.pointsEarned,
        0
      );
      const newPercentage = (newScore / quiz.totalPoints) * 100;

      const updatedAttempt: QuizAttempt = {
        ...attempt,
        answers: updatedAnswers,
        score: newScore,
        percentage: newPercentage,
        timeSpent: attempt.timeSpent + timeSpent,
      };

      await this.supabaseService.updateQuizAttempt(updatedAttempt);
      return answer;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw new Error('Failed to submit answer');
    }
  }

  // Complete quiz attempt
  async completeQuizAttempt(attemptId: string): Promise<QuizResult> {
    try {
      const attempt = await this.supabaseService.getQuizAttempt(attemptId);
      const quiz = await this.getQuiz(attempt.quizId);

      const passed = attempt.percentage >= quiz.passingScore;
      const completedAttempt: QuizAttempt = {
        ...attempt,
        passed,
        completedAt: new Date(),
      };

      await this.supabaseService.updateQuizAttempt(completedAttempt);

      const performance = this.calculatePerformance(completedAttempt, quiz);
      const result: QuizResult = {
        attempt: completedAttempt,
        quiz,
        performance,
      };

      return result;
    } catch (error) {
      console.error('Error completing quiz attempt:', error);
      throw new Error('Failed to complete quiz');
    }
  }

  // Check if answer is correct
  private checkAnswer(
    question: QuizQuestion,
    selectedAnswer: string | string[]
  ): boolean {
    if (Array.isArray(question.correctAnswer)) {
      if (!Array.isArray(selectedAnswer)) return false;
      return question.correctAnswer.every(answer =>
        selectedAnswer.includes(answer)
      );
    } else {
      return selectedAnswer === question.correctAnswer;
    }
  }

  // Calculate performance metrics
  private calculatePerformance(attempt: QuizAttempt, quiz: Quiz): any {
    const correctAnswers = attempt.answers.filter(
      answer => answer.isCorrect
    ).length;
    const totalQuestions = quiz.questions.length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const averageTimePerQuestion = attempt.timeSpent / totalQuestions;

    // Analyze strengths and weaknesses
    const categoryPerformance: Record<string, number> = {};
    const difficultyPerformance: Record<string, number> = {};

    quiz.questions.forEach(question => {
      const answer = attempt.answers.find(a => a.questionId === question.id);
      if (answer) {
        // Category performance
        if (!categoryPerformance[question.category]) {
          categoryPerformance[question.category] = 0;
        }
        categoryPerformance[question.category] += answer.isCorrect ? 1 : 0;

        // Difficulty performance
        if (!difficultyPerformance[question.difficulty]) {
          difficultyPerformance[question.difficulty] = 0;
        }
        difficultyPerformance[question.difficulty] += answer.isCorrect ? 1 : 0;
      }
    });

    const strengths = Object.entries(categoryPerformance)
      .filter(([_, score]) => score > 0)
      .map(([category, _]) => category);

    const weaknesses = Object.entries(categoryPerformance)
      .filter(([_, score]) => score === 0)
      .map(([category, _]) => category);

    const recommendations = this.generateRecommendations(
      strengths,
      weaknesses,
      accuracy
    );

    return {
      correctAnswers,
      totalQuestions,
      accuracy,
      averageTimePerQuestion,
      strengths,
      weaknesses,
      recommendations,
    };
  }

  // Generate recommendations based on performance
  private generateRecommendations(
    strengths: string[],
    weaknesses: string[],
    accuracy: number
  ): string[] {
    const recommendations: string[] = [];

    if (accuracy >= 90) {
      recommendations.push(
        'Excellent performance! Consider trying more challenging quizzes.'
      );
    } else if (accuracy >= 70) {
      recommendations.push(
        'Good work! Focus on the areas where you struggled.'
      );
    } else {
      recommendations.push(
        'Keep practicing! Review the material and try again.'
      );
    }

    if (weaknesses.length > 0) {
      recommendations.push(`Focus on improving: ${weaknesses.join(', ')}`);
    }

    if (strengths.length > 0) {
      recommendations.push(`Great job in: ${strengths.join(', ')}`);
    }

    return recommendations;
  }

  // Get user's quiz attempts
  async getUserQuizAttempts(
    userId: string,
    quizId?: string
  ): Promise<QuizAttempt[]> {
    try {
      return await this.supabaseService.getUserQuizAttempts(userId, quizId);
    } catch (error) {
      console.error('Error getting user quiz attempts:', error);
      throw new Error('Failed to get quiz attempts');
    }
  }

  // Get quiz analytics
  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    try {
      const attempts = await this.supabaseService.getQuizAttempts(quizId);
      const quiz = await this.getQuiz(quizId);

      const totalAttempts = attempts.length;
      const averageScore =
        attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
        totalAttempts;
      const passRate =
        (attempts.filter(attempt => attempt.passed).length / totalAttempts) *
        100;
      const averageTimeSpent =
        attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) /
        totalAttempts;

      // Find most missed questions
      const questionMisses: Record<string, number> = {};
      attempts.forEach(attempt => {
        attempt.answers.forEach(answer => {
          if (!answer.isCorrect) {
            questionMisses[answer.questionId] =
              (questionMisses[answer.questionId] || 0) + 1;
          }
        });
      });

      const mostMissedQuestions = Object.entries(questionMisses)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([questionId, _]) => questionId);

      // Category and difficulty performance
      const categoryPerformance: Record<string, number> = {};
      const difficultyPerformance: Record<string, number> = {};

      attempts.forEach(attempt => {
        attempt.answers.forEach(answer => {
          const question = quiz.questions.find(q => q.id === answer.questionId);
          if (question) {
            if (!categoryPerformance[question.category]) {
              categoryPerformance[question.category] = 0;
            }
            categoryPerformance[question.category] += answer.isCorrect ? 1 : 0;

            if (!difficultyPerformance[question.difficulty]) {
              difficultyPerformance[question.difficulty] = 0;
            }
            difficultyPerformance[question.difficulty] += answer.isCorrect
              ? 1
              : 0;
          }
        });
      });

      return {
        totalAttempts,
        averageScore,
        passRate,
        averageTimeSpent,
        mostMissedQuestions,
        categoryPerformance,
        difficultyPerformance,
      };
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      throw new Error('Failed to get quiz analytics');
    }
  }

  // Create sample quiz questions
  async createSampleQuiz(): Promise<Quiz> {
    const sampleQuestions: QuizQuestion[] = [
      {
        id: 'q1',
        question:
          'What is the primary purpose of AAC (Augmentative and Alternative Communication)?',
        questionType: 'multiple_choice',
        options: [
          { id: 'a1', text: 'To replace speech entirely' },
          {
            id: 'a2',
            text: 'To supplement or replace speech for communication',
          },
          { id: 'a3', text: 'To teach reading skills' },
          { id: 'a4', text: 'To improve motor skills' },
        ],
        correctAnswer: 'a2',
        explanation:
          'AAC is designed to supplement or replace speech for individuals who have difficulty communicating verbally.',
        difficulty: 'easy',
        category: 'AAC Basics',
        tags: ['communication', 'basics'],
        points: 10,
      },
      {
        id: 'q2',
        question: 'Which of the following are common AAC methods?',
        questionType: 'multiple_choice',
        options: [
          { id: 'a1', text: 'Picture symbols' },
          { id: 'a2', text: 'Sign language' },
          { id: 'a3', text: 'Voice output devices' },
          { id: 'a4', text: 'All of the above' },
        ],
        correctAnswer: 'a4',
        explanation:
          'All of these are valid AAC methods that can help individuals communicate.',
        difficulty: 'easy',
        category: 'AAC Methods',
        tags: ['methods', 'communication'],
        points: 10,
      },
      {
        id: 'q3',
        question: 'True or False: AAC can hinder speech development.',
        questionType: 'true_false',
        options: [
          { id: 'a1', text: 'True' },
          { id: 'a2', text: 'False' },
        ],
        correctAnswer: 'a2',
        explanation:
          'Research shows that AAC actually supports and can improve speech development.',
        difficulty: 'medium',
        category: 'AAC Research',
        tags: ['research', 'speech'],
        points: 15,
      },
    ];

    const sampleQuiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Introduction to AAC',
      description:
        'A basic quiz about Augmentative and Alternative Communication',
      category: 'Education',
      difficulty: 'beginner',
      questions: sampleQuestions,
      totalPoints: sampleQuestions.reduce((sum, q) => sum + q.points, 0),
      passingScore: 70,
      maxAttempts: 3,
      isActive: true,
      createdBy: 'system',
    };

    return await this.createQuiz(sampleQuiz);
  }
}

export default QuizService;
