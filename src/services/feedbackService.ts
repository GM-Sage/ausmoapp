// User Feedback Service for Ausmo AAC App
// Collects user feedback, feature requests, support tickets, and satisfaction metrics

import AsyncStorage from '@react-native-async-storage/async-storage';

// Optional Sentry integration - only use if available
let captureSentryException: ((error: Error, context?: any) => void) | null =
  null;
let addSentryBreadcrumb:
  | ((message: string, category: string, level?: string, data?: any) => void)
  | null = null;

// Try to import Sentry functions, but don't fail if not available
try {
  const sentryModule = require('../config/sentry');
  captureSentryException = sentryModule.captureSentryException;
  addSentryBreadcrumb = sentryModule.addSentryBreadcrumb;
} catch (error) {
  // Sentry not available - continue without it
  console.log('Sentry not available in feedback service');
}

export interface FeedbackItem {
  id: string;
  userId: string;
  type:
    | 'bug_report'
    | 'feature_request'
    | 'general_feedback'
    | 'support_ticket'
    | 'satisfaction_survey';
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_review' | 'in_progress' | 'resolved' | 'closed';
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  deviceInfo: {
    model: string;
    osVersion: string;
    appVersion: string;
  };
  userContext: {
    role: 'parent' | 'child' | 'therapist' | 'admin';
    experience: 'beginner' | 'intermediate' | 'advanced';
    usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  };
  attachments?: string[]; // File paths or URLs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  resolution?: string;
  userRating?: number; // 1-5 stars
  helpfulVotes: number;
  response?: {
    message: string;
    author: string;
    timestamp: Date;
  };
}

export interface SatisfactionSurvey {
  id: string;
  userId: string;
  surveyType:
    | 'app_satisfaction'
    | 'feature_feedback'
    | 'accessibility_review'
    | 'performance_review';
  responses: Record<string, number | string>;
  overallRating: number; // 1-5 stars
  wouldRecommend: boolean;
  comments?: string;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category:
    | 'technical'
    | 'feature'
    | 'account'
    | 'billing'
    | 'accessibility'
    | 'other';
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: SupportMessage[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  satisfactionRating?: number;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  author: 'user' | 'support' | 'system';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

export interface FeatureRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status:
    | 'proposed'
    | 'under_review'
    | 'planned'
    | 'in_development'
    | 'released'
    | 'declined';
  votes: number;
  comments: FeatureComment[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  targetRelease?: string;
  implementationNotes?: string;
}

export interface FeatureComment {
  id: string;
  featureId: string;
  userId: string;
  comment: string;
  timestamp: Date;
  helpful: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
}

class FeedbackService {
  private static instance: FeedbackService;
  private feedbackItems: FeedbackItem[] = [];
  private supportTickets: SupportTicket[] = [];
  private featureRequests: FeatureRequest[] = [];
  private helpArticles: HelpArticle[] = [];
  private satisfactionSurveys: SatisfactionSurvey[] = [];

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  // Initialize feedback service
  async initialize(): Promise<void> {
    try {
      await this.loadFeedbackData();
      await this.initializeHelpArticles();
      console.log('Feedback service initialized');
    } catch (error) {
      console.error('Error initializing feedback service:', error);
      throw error;
    }
  }

  // Submit feedback
  async submitFeedback(
    feedback: Omit<
      FeedbackItem,
      'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes'
    >
  ): Promise<FeedbackItem> {
    try {
      const newFeedback: FeedbackItem = {
        ...feedback,
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        helpfulVotes: 0,
      };

      this.feedbackItems.push(newFeedback);
      await this.saveFeedbackData();

      // Send to analytics and monitoring (if Sentry is available)
      if (addSentryBreadcrumb) {
        addSentryBreadcrumb('Feedback submitted', 'user_feedback', 'info', {
          feedbackId: newFeedback.id,
          type: newFeedback.type,
          category: newFeedback.category,
        });
      }

      console.log('Feedback submitted:', newFeedback.id);
      return newFeedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (captureSentryException) {
        captureSentryException(error as Error, {
          context: 'feedback_submission',
        });
      }
      throw error;
    }
  }

  // Submit support ticket
  async submitSupportTicket(
    ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>
  ): Promise<SupportTicket> {
    try {
      const newTicket: SupportTicket = {
        ...ticket,
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      this.supportTickets.push(newTicket);
      await this.saveSupportTickets();

      // Add initial system message
      await this.addSupportMessage(newTicket.id, {
        author: 'system',
        message:
          'Thank you for contacting Ausmo support. We will review your ticket and respond within 24 hours.',
        timestamp: new Date(),
      });

      // Send notification to support team (if Sentry is available)
      if (addSentryBreadcrumb) {
        addSentryBreadcrumb('Support ticket created', 'support', 'info', {
          ticketId: newTicket.id,
          category: newTicket.category,
          priority: newTicket.priority,
        });
      }

      console.log('Support ticket submitted:', newTicket.id);
      return newTicket;
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      if (captureSentryException) {
        captureSentryException(error as Error, {
          context: 'support_ticket_submission',
        });
      }
      throw error;
    }
  }

  // Add message to support ticket
  async addSupportMessage(
    ticketId: string,
    message: Omit<SupportMessage, 'id' | 'ticketId' | 'timestamp'>
  ): Promise<SupportMessage> {
    try {
      const ticket = this.supportTickets.find(t => t.id === ticketId);
      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      const newMessage: SupportMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticketId,
        timestamp: new Date(),
      };

      ticket.messages.push(newMessage);
      ticket.updatedAt = new Date();

      await this.saveSupportTickets();

      if (addSentryBreadcrumb) {
        addSentryBreadcrumb('Support message added', 'support', 'info', {
          ticketId,
          messageId: newMessage.id,
          author: message.author,
        });
      }

      return newMessage;
    } catch (error) {
      console.error('Error adding support message:', error);
      throw error;
    }
  }

  // Submit feature request
  async submitFeatureRequest(
    request: Omit<
      FeatureRequest,
      'id' | 'createdAt' | 'updatedAt' | 'votes' | 'comments'
    >
  ): Promise<FeatureRequest> {
    try {
      const newRequest: FeatureRequest = {
        ...request,
        id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        votes: 1,
        comments: [],
      };

      this.featureRequests.push(newRequest);
      await this.saveFeatureRequests();

      if (addSentryBreadcrumb) {
        addSentryBreadcrumb(
          'Feature request submitted',
          'feature_request',
          'info',
          {
            requestId: newRequest.id,
            title: newRequest.title,
            category: newRequest.category,
          }
        );
      }

      console.log('Feature request submitted:', newRequest.id);
      return newRequest;
    } catch (error) {
      console.error('Error submitting feature request:', error);
      if (captureSentryException) {
        captureSentryException(error as Error, {
          context: 'feature_request_submission',
        });
      }
      throw error;
    }
  }

  // Submit satisfaction survey
  async submitSatisfactionSurvey(
    survey: Omit<SatisfactionSurvey, 'id' | 'createdAt'>
  ): Promise<SatisfactionSurvey> {
    try {
      const newSurvey: SatisfactionSurvey = {
        ...survey,
        id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      this.satisfactionSurveys.push(newSurvey);
      await this.saveSatisfactionSurveys();

      if (addSentryBreadcrumb) {
        addSentryBreadcrumb(
          'Satisfaction survey submitted',
          'user_feedback',
          'info',
          {
            surveyId: newSurvey.id,
            type: newSurvey.surveyType,
            rating: newSurvey.overallRating,
          }
        );
      }

      console.log('Satisfaction survey submitted:', newSurvey.id);
      return newSurvey;
    } catch (error) {
      console.error('Error submitting satisfaction survey:', error);
      if (captureSentryException) {
        captureSentryException(error as Error, {
          context: 'satisfaction_survey_submission',
        });
      }
      throw error;
    }
  }

  // Get help articles
  getHelpArticles(category?: string, difficulty?: string): HelpArticle[] {
    let articles = [...this.helpArticles];

    if (category) {
      articles = articles.filter(article => article.category === category);
    }

    if (difficulty) {
      articles = articles.filter(article => article.difficulty === difficulty);
    }

    return articles.sort((a, b) => b.helpful - b.notHelpful);
  }

  // Search help articles
  searchHelpArticles(query: string): HelpArticle[] {
    const lowercaseQuery = query.toLowerCase();
    return this.helpArticles.filter(
      article =>
        article.title.toLowerCase().includes(lowercaseQuery) ||
        article.content.toLowerCase().includes(lowercaseQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Rate help article
  async rateHelpArticle(articleId: string, helpful: boolean): Promise<void> {
    try {
      const article = this.helpArticles.find(a => a.id === articleId);
      if (!article) {
        throw new Error('Help article not found');
      }

      if (helpful) {
        article.helpful++;
      } else {
        article.notHelpful++;
      }

      await this.saveHelpArticles();
      console.log('Help article rated:', articleId, helpful);
    } catch (error) {
      console.error('Error rating help article:', error);
      throw error;
    }
  }

  // Get user feedback
  getUserFeedback(userId: string, type?: FeedbackItem['type']): FeedbackItem[] {
    let feedback = this.feedbackItems.filter(item => item.userId === userId);

    if (type) {
      feedback = feedback.filter(item => item.type === type);
    }

    return feedback.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Get support tickets
  getSupportTickets(userId?: string): SupportTicket[] {
    let tickets = [...this.supportTickets];

    if (userId) {
      tickets = tickets.filter(ticket => ticket.userId === userId);
    }

    return tickets.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  // Get feature requests
  getFeatureRequests(category?: string): FeatureRequest[] {
    let requests = [...this.featureRequests];

    if (category) {
      requests = requests.filter(request => request.category === category);
    }

    return requests.sort((a, b) => b.votes - a.votes);
  }

  // Vote on feature request
  async voteFeatureRequest(requestId: string, userId: string): Promise<void> {
    try {
      const request = this.featureRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Feature request not found');
      }

      // Check if user already voted
      const alreadyVoted = request.votes > 0; // Simplified - in real app would track individual votes

      if (!alreadyVoted) {
        request.votes++;
        await this.saveFeatureRequests();

        if (addSentryBreadcrumb) {
          addSentryBreadcrumb(
            'Feature request voted',
            'feature_request',
            'info',
            {
              requestId,
              userId,
              newVoteCount: request.votes,
            }
          );
        }
      }
    } catch (error) {
      console.error('Error voting on feature request:', error);
      throw error;
    }
  }

  // Get satisfaction surveys
  getSatisfactionSurveys(userId?: string): SatisfactionSurvey[] {
    let surveys = [...this.satisfactionSurveys];

    if (userId) {
      surveys = surveys.filter(survey => survey.userId === userId);
    }

    return surveys.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Generate feedback summary
  generateFeedbackSummary(): {
    totalFeedback: number;
    feedbackByType: Record<string, number>;
    averageRating: number;
    commonIssues: string[];
    featureRequestsCount: number;
    supportTicketsCount: number;
  } {
    const totalFeedback = this.feedbackItems.length;
    const feedbackByType = this.feedbackItems.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const ratings = this.satisfactionSurveys
      .map(s => s.overallRating)
      .filter(r => r > 0);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    const commonIssues = this.getCommonIssues();

    return {
      totalFeedback,
      feedbackByType,
      averageRating,
      commonIssues,
      featureRequestsCount: this.featureRequests.length,
      supportTicketsCount: this.supportTickets.length,
    };
  }

  // Get common issues
  private getCommonIssues(): string[] {
    const issues = this.feedbackItems
      .filter(item => item.type === 'bug_report')
      .map(item => item.category);

    const issueCount = issues.reduce(
      (acc, issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(issueCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  // Initialize help articles
  private async initializeHelpArticles(): Promise<void> {
    this.helpArticles = [
      {
        id: 'getting-started',
        title: 'Getting Started with Ausmo AAC',
        content:
          'Learn how to set up and start using Ausmo AAC for communication...',
        category: 'getting-started',
        tags: ['beginner', 'setup', 'introduction'],
        difficulty: 'beginner',
        lastUpdated: new Date(),
        views: 0,
        helpful: 0,
        notHelpful: 0,
        relatedArticles: ['communication-basics', 'accessibility-setup'],
      },
      {
        id: 'communication-basics',
        title: 'Communication Basics',
        content:
          'Learn the fundamentals of using symbols and building messages...',
        category: 'communication',
        tags: ['symbols', 'messages', 'basics'],
        difficulty: 'beginner',
        lastUpdated: new Date(),
        views: 0,
        helpful: 0,
        notHelpful: 0,
        relatedArticles: ['symbol-selection', 'message-building'],
      },
      {
        id: 'accessibility-setup',
        title: 'Setting Up Accessibility Features',
        content:
          'Configure switch scanning, voice control, and other accessibility options...',
        category: 'accessibility',
        tags: ['accessibility', 'switch-scanning', 'voice-control'],
        difficulty: 'intermediate',
        lastUpdated: new Date(),
        views: 0,
        helpful: 0,
        notHelpful: 0,
        relatedArticles: ['motor-accessibility', 'visual-accessibility'],
      },
      {
        id: 'troubleshooting',
        title: 'Common Issues and Solutions',
        content: 'Find solutions to common problems and technical issues...',
        category: 'support',
        tags: ['troubleshooting', 'problems', 'solutions'],
        difficulty: 'beginner',
        lastUpdated: new Date(),
        views: 0,
        helpful: 0,
        notHelpful: 0,
        relatedArticles: ['technical-support', 'performance-issues'],
      },
    ];
  }

  // Storage management
  private async saveFeedbackData(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'feedback_items',
        JSON.stringify(this.feedbackItems)
      );
    } catch (error) {
      console.error('Error saving feedback data:', error);
    }
  }

  private async saveSupportTickets(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'support_tickets',
        JSON.stringify(this.supportTickets)
      );
    } catch (error) {
      console.error('Error saving support tickets:', error);
    }
  }

  private async saveFeatureRequests(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'feature_requests',
        JSON.stringify(this.featureRequests)
      );
    } catch (error) {
      console.error('Error saving feature requests:', error);
    }
  }

  private async saveSatisfactionSurveys(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'satisfaction_surveys',
        JSON.stringify(this.satisfactionSurveys)
      );
    } catch (error) {
      console.error('Error saving satisfaction surveys:', error);
    }
  }

  private async saveHelpArticles(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'help_articles',
        JSON.stringify(this.helpArticles)
      );
    } catch (error) {
      console.error('Error saving help articles:', error);
    }
  }

  private async loadFeedbackData(): Promise<void> {
    try {
      const [
        feedbackData,
        ticketsData,
        requestsData,
        surveysData,
        articlesData,
      ] = await Promise.all([
        AsyncStorage.getItem('feedback_items'),
        AsyncStorage.getItem('support_tickets'),
        AsyncStorage.getItem('feature_requests'),
        AsyncStorage.getItem('satisfaction_surveys'),
        AsyncStorage.getItem('help_articles'),
      ]);

      if (feedbackData) {
        this.feedbackItems = JSON.parse(feedbackData);
      }

      if (ticketsData) {
        this.supportTickets = JSON.parse(ticketsData);
      }

      if (requestsData) {
        this.featureRequests = JSON.parse(requestsData);
      }

      if (surveysData) {
        this.satisfactionSurveys = JSON.parse(surveysData);
      }

      if (articlesData) {
        this.helpArticles = JSON.parse(articlesData);
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
    }
  }

  // Export feedback data
  async exportFeedbackData(): Promise<{
    feedback: FeedbackItem[];
    supportTickets: SupportTicket[];
    featureRequests: FeatureRequest[];
    satisfactionSurveys: SatisfactionSurvey[];
    summary: any;
  }> {
    const summary = this.generateFeedbackSummary();

    return {
      feedback: this.feedbackItems,
      supportTickets: this.supportTickets,
      featureRequests: this.featureRequests,
      satisfactionSurveys: this.satisfactionSurveys,
      summary,
    };
  }

  // Cleanup old data
  async cleanupOldFeedback(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date(
        Date.now() - daysToKeep * 24 * 60 * 60 * 1000
      );

      this.feedbackItems = this.feedbackItems.filter(
        item => item.createdAt > cutoffDate
      );
      this.supportTickets = this.supportTickets.filter(
        ticket => ticket.createdAt > cutoffDate
      );
      this.satisfactionSurveys = this.satisfactionSurveys.filter(
        survey => survey.createdAt > cutoffDate
      );

      await Promise.all([
        this.saveFeedbackData(),
        this.saveSupportTickets(),
        this.saveSatisfactionSurveys(),
      ]);

      console.log('Old feedback data cleaned up');
    } catch (error) {
      console.error('Error cleaning up feedback data:', error);
    }
  }

  // Get feedback statistics
  getFeedbackStatistics(): {
    totalFeedback: number;
    openTickets: number;
    averageRating: number;
    topCategories: string[];
    recentActivity: number;
  } {
    const totalFeedback = this.feedbackItems.length;
    const openTickets = this.supportTickets.filter(
      t => t.status === 'open' || t.status === 'in_progress'
    ).length;
    const ratings = this.satisfactionSurveys
      .map(s => s.overallRating)
      .filter(r => r > 0);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    const categoryCount = this.feedbackItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    const recentActivity = this.feedbackItems.filter(
      item => item.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalFeedback,
      openTickets,
      averageRating,
      topCategories,
      recentActivity,
    };
  }
}

export default FeedbackService;
