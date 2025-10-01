// Analytics Service for Ausmo AAC App
// Provides comprehensive usage tracking and reporting

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  CommunicationBook,
  CommunicationPage,
  CommunicationButton,
  UsageAnalytics,
  ButtonPressEvent,
  NavigationEvent,
  SpeechEvent,
} from '../types';

export interface AnalyticsData {
  userId: string;
  date: Date;
  sessionDuration: number;
  messagesSpoken: number;
  pagesViewed: number;
  buttonsPressed: number;
  mostUsedButtons: Array<{ buttonId: string; count: number; text: string }>;
  mostUsedPages: Array<{ pageId: string; count: number; name: string }>;
  vocabularyGrowth: number;
  communicationEfficiency: number;
  peakUsageHours: Array<{ hour: number; count: number }>;
  errorCount: number;
  switchScanningUsage: number;
  keyboardUsage: number;
  expressModeUsage: number;
}

export interface ReportOptions {
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  includeDetails: boolean;
  format: 'summary' | 'detailed' | 'comprehensive';
  exportFormat: 'json' | 'csv' | 'pdf';
}

export interface ProgressReport {
  userId: string;
  period: string;
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  vocabularyGrowth: number;
  communicationEfficiency: number;
  mostActiveDay: string;
  peakUsageHour: number;
  topWords: Array<{ word: string; count: number }>;
  topPages: Array<{ page: string; count: number }>;
  improvementAreas: string[];
  achievements: string[];
  recommendations: string[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isTracking = false;
  private currentSession: {
    startTime: Date;
    userId: string;
    events: Array<ButtonPressEvent | NavigationEvent | SpeechEvent>;
  } | null = null;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Initialize analytics tracking
  async initialize(userId: string): Promise<void> {
    try {
      console.log('Initializing analytics for user:', userId);
      this.isTracking = true;
      this.startSession(userId);
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  // Start a new session
  startSession(userId: string): void {
    this.currentSession = {
      startTime: new Date(),
      userId,
      events: [],
    };
    console.log('Analytics session started for user:', userId);
  }

  // End current session and save data
  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const sessionDuration =
        Date.now() - this.currentSession.startTime.getTime();
      const analyticsData = await this.processSessionData(
        this.currentSession,
        sessionDuration
      );
      await this.saveAnalyticsData(analyticsData);

      console.log('Analytics session ended, duration:', sessionDuration);
      this.currentSession = null;
    } catch (error) {
      console.error('Error ending analytics session:', error);
    }
  }

  // Track button press
  trackButtonPress(buttonId: string, pageId: string, text: string): void {
    if (!this.currentSession) return;

    const event: ButtonPressEvent = {
      buttonId,
      pageId,
      timestamp: new Date(),
      userId: this.currentSession.userId,
    };

    this.currentSession.events.push(event);
    console.log('Button press tracked:', { buttonId, text });
  }

  // Track navigation
  trackNavigation(
    fromPageId: string | undefined,
    toPageId: string,
    bookId: string
  ): void {
    if (!this.currentSession) return;

    const event: NavigationEvent = {
      fromPageId,
      toPageId,
      bookId,
      timestamp: new Date(),
      userId: this.currentSession.userId,
    };

    this.currentSession.events.push(event);
    console.log('Navigation tracked:', { fromPageId, toPageId, bookId });
  }

  // Track speech event
  trackSpeech(messageId: string, text: string, method: 'tts' | 'audio'): void {
    if (!this.currentSession) return;

    const event: SpeechEvent = {
      messageId,
      text,
      timestamp: new Date(),
      userId: this.currentSession.userId,
      method,
    };

    this.currentSession.events.push(event);
    console.log('Speech tracked:', { text, method });
  }

  // Process session data into analytics
  private async processSessionData(
    session: typeof this.currentSession,
    duration: number
  ): Promise<AnalyticsData> {
    if (!session) throw new Error('No active session');

    const buttonPresses = session.events.filter(
      e => (e as any).type === 'buttonPress'
    ) as ButtonPressEvent[];
    const navigations = session.events.filter(
      e => (e as any).type === 'navigation'
    ) as NavigationEvent[];
    const speechEvents = session.events.filter(
      e => (e as any).type === 'speech'
    ) as SpeechEvent[];

    // Count button usage
    const buttonCounts = new Map<string, { count: number; text: string }>();
    buttonPresses.forEach(event => {
      const existing = buttonCounts.get(event.buttonId) || {
        count: 0,
        text: '',
      };
      buttonCounts.set(event.buttonId, {
        count: existing.count + 1,
        text: existing.text || event.buttonId,
      });
    });

    // Count page usage
    const pageCounts = new Map<string, { count: number; name: string }>();
    navigations.forEach(event => {
      const existing = pageCounts.get(event.toPageId) || {
        count: 0,
        name: event.toPageId,
      };
      pageCounts.set(event.toPageId, {
        count: existing.count + 1,
        name: existing.name,
      });
    });

    // Calculate peak usage hours
    const hourCounts = new Map<number, number>();
    session.events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    // Calculate vocabulary growth (unique words spoken)
    const uniqueWords = new Set(speechEvents.map(e => e.text.toLowerCase()));
    const vocabularyGrowth = uniqueWords.size;

    // Calculate communication efficiency (messages per minute)
    const communicationEfficiency = speechEvents.length / (duration / 60000);

    return {
      userId: session.userId,
      date: session.startTime,
      sessionDuration: duration,
      messagesSpoken: speechEvents.length,
      pagesViewed: new Set(navigations.map(n => n.toPageId)).size,
      buttonsPressed: buttonPresses.length,
      mostUsedButtons: Array.from(buttonCounts.entries())
        .map(([buttonId, data]) => ({ buttonId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      mostUsedPages: Array.from(pageCounts.entries())
        .map(([pageId, data]) => ({ pageId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      vocabularyGrowth,
      communicationEfficiency,
      peakUsageHours: Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      errorCount: 0, // TODO: Track errors
      switchScanningUsage: 0, // TODO: Track switch scanning
      keyboardUsage: 0, // TODO: Track keyboard usage
      expressModeUsage: 0, // TODO: Track express mode usage
    };
  }

  // Save analytics data
  private async saveAnalyticsData(data: AnalyticsData): Promise<void> {
    try {
      const key = `analytics_${data.userId}_${data.date.toISOString().split('T')[0]}`;
      const existingData = await AsyncStorage.getItem(key);

      let dailyData: AnalyticsData[] = existingData
        ? JSON.parse(existingData)
        : [];

      // Check if data for this session already exists
      const existingIndex = dailyData.findIndex(
        d => Math.abs(d.date.getTime() - data.date.getTime()) < 60000 // Within 1 minute
      );

      if (existingIndex >= 0) {
        // Merge with existing data
        dailyData[existingIndex] = this.mergeAnalyticsData(
          dailyData[existingIndex],
          data
        );
      } else {
        // Add new data
        dailyData.push(data);
      }

      await AsyncStorage.setItem(key, JSON.stringify(dailyData));
      console.log('Analytics data saved for user:', data.userId);
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }

  // Merge analytics data
  private mergeAnalyticsData(
    existing: AnalyticsData,
    newData: AnalyticsData
  ): AnalyticsData {
    return {
      ...existing,
      sessionDuration: existing.sessionDuration + newData.sessionDuration,
      messagesSpoken: existing.messagesSpoken + newData.messagesSpoken,
      pagesViewed: Math.max(existing.pagesViewed, newData.pagesViewed),
      buttonsPressed: existing.buttonsPressed + newData.buttonsPressed,
      mostUsedButtons: this.mergeButtonCounts(
        existing.mostUsedButtons,
        newData.mostUsedButtons
      ),
      mostUsedPages: this.mergePageCounts(
        existing.mostUsedPages,
        newData.mostUsedPages
      ),
      vocabularyGrowth: Math.max(
        existing.vocabularyGrowth,
        newData.vocabularyGrowth
      ),
      communicationEfficiency:
        (existing.communicationEfficiency + newData.communicationEfficiency) /
        2,
      peakUsageHours: this.mergeHourCounts(
        existing.peakUsageHours,
        newData.peakUsageHours
      ),
      errorCount: existing.errorCount + newData.errorCount,
      switchScanningUsage:
        existing.switchScanningUsage + newData.switchScanningUsage,
      keyboardUsage: existing.keyboardUsage + newData.keyboardUsage,
      expressModeUsage: existing.expressModeUsage + newData.expressModeUsage,
    };
  }

  // Helper methods for merging data
  private mergeButtonCounts(
    existing: AnalyticsData['mostUsedButtons'],
    newData: AnalyticsData['mostUsedButtons']
  ): AnalyticsData['mostUsedButtons'] {
    const merged = new Map<string, { count: number; text: string }>();

    existing.forEach(item => {
      merged.set(item.buttonId, { count: item.count, text: item.text });
    });

    newData.forEach(item => {
      const existing = merged.get(item.buttonId) || {
        count: 0,
        text: item.text,
      };
      merged.set(item.buttonId, {
        count: existing.count + item.count,
        text: item.text,
      });
    });

    return Array.from(merged.entries())
      .map(([buttonId, data]) => ({ buttonId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private mergePageCounts(
    existing: AnalyticsData['mostUsedPages'],
    newData: AnalyticsData['mostUsedPages']
  ): AnalyticsData['mostUsedPages'] {
    const merged = new Map<string, { count: number; name: string }>();

    existing.forEach(item => {
      merged.set(item.pageId, { count: item.count, name: item.name });
    });

    newData.forEach(item => {
      const existing = merged.get(item.pageId) || { count: 0, name: item.name };
      merged.set(item.pageId, {
        count: existing.count + item.count,
        name: item.name,
      });
    });

    return Array.from(merged.entries())
      .map(([pageId, data]) => ({ pageId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private mergeHourCounts(
    existing: AnalyticsData['peakUsageHours'],
    newData: AnalyticsData['peakUsageHours']
  ): AnalyticsData['peakUsageHours'] {
    const merged = new Map<number, number>();

    existing.forEach(item => {
      merged.set(item.hour, item.count);
    });

    newData.forEach(item => {
      const existing = merged.get(item.hour) || 0;
      merged.set(item.hour, existing + item.count);
    });

    return Array.from(merged.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Get analytics data for a user
  async getAnalyticsData(
    userId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<AnalyticsData[]> {
    try {
      const startDate =
        dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = dateRange?.end || new Date();

      const allData: AnalyticsData[] = [];

      // Get data for each day in the range
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const key = `analytics_${userId}_${date.toISOString().split('T')[0]}`;
        const dayData = await AsyncStorage.getItem(key);

        if (dayData) {
          const parsedData = JSON.parse(dayData);
          allData.push(...parsedData);
        }
      }

      return allData;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return [];
    }
  }

  // Generate progress report
  async generateProgressReport(
    userId: string,
    period: 'week' | 'month' | 'quarter'
  ): Promise<ProgressReport> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      const analyticsData = await this.getAnalyticsData(userId, {
        start: startDate,
        end: endDate,
      });

      if (analyticsData.length === 0) {
        return this.createEmptyReport(userId, period);
      }

      // Calculate report metrics
      const totalSessions = analyticsData.length;
      const totalDuration = analyticsData.reduce(
        (sum, data) => sum + data.sessionDuration,
        0
      );
      const averageSessionDuration = totalDuration / totalSessions;

      const totalMessages = analyticsData.reduce(
        (sum, data) => sum + data.messagesSpoken,
        0
      );
      const totalVocabulary = Math.max(
        ...analyticsData.map(data => data.vocabularyGrowth)
      );

      const allButtons = analyticsData.flatMap(data => data.mostUsedButtons);
      const buttonCounts = new Map<string, number>();
      allButtons.forEach(button => {
        buttonCounts.set(
          button.text,
          (buttonCounts.get(button.text) || 0) + button.count
        );
      });

      const topWords = Array.from(buttonCounts.entries())
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const allPages = analyticsData.flatMap(data => data.mostUsedPages);
      const pageCounts = new Map<string, number>();
      allPages.forEach(page => {
        pageCounts.set(
          page.name,
          (pageCounts.get(page.name) || 0) + page.count
        );
      });

      const topPages = Array.from(pageCounts.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Find most active day
      const dayCounts = new Map<string, number>();
      analyticsData.forEach(data => {
        const day = data.date.toLocaleDateString();
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      });

      const mostActiveDay =
        Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'N/A';

      // Find peak usage hour
      const allHours = analyticsData.flatMap(data => data.peakUsageHours);
      const hourCounts = new Map<number, number>();
      allHours.forEach(hour => {
        hourCounts.set(
          hour.hour,
          (hourCounts.get(hour.hour) || 0) + hour.count
        );
      });

      const peakUsageHour =
        Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        0;

      // Calculate communication efficiency
      const communicationEfficiency =
        analyticsData.reduce(
          (sum, data) => sum + data.communicationEfficiency,
          0
        ) / analyticsData.length;

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        analyticsData,
        topWords,
        topPages
      );

      // Generate achievements
      const achievements = this.generateAchievements(
        analyticsData,
        totalMessages,
        totalVocabulary
      );

      // Identify improvement areas
      const improvementAreas = this.identifyImprovementAreas(
        analyticsData,
        topWords
      );

      return {
        userId,
        period,
        totalSessions,
        totalDuration,
        averageSessionDuration,
        vocabularyGrowth: totalVocabulary,
        communicationEfficiency,
        mostActiveDay,
        peakUsageHour,
        topWords,
        topPages,
        improvementAreas,
        achievements,
        recommendations,
      };
    } catch (error) {
      console.error('Error generating progress report:', error);
      return this.createEmptyReport(userId, period);
    }
  }

  // Generate chart data
  generateChartData(
    analyticsData: AnalyticsData[],
    chartType: 'usage' | 'vocabulary' | 'efficiency'
  ): ChartData {
    switch (chartType) {
      case 'usage':
        return this.generateUsageChart(analyticsData);
      case 'vocabulary':
        return this.generateVocabularyChart(analyticsData);
      case 'efficiency':
        return this.generateEfficiencyChart(analyticsData);
      default:
        return { labels: [], datasets: [] };
    }
  }

  private generateUsageChart(analyticsData: AnalyticsData[]): ChartData {
    const labels = analyticsData.map(data => data.date.toLocaleDateString());
    const messagesData = analyticsData.map(data => data.messagesSpoken);
    const buttonsData = analyticsData.map(data => data.buttonsPressed);

    return {
      labels,
      datasets: [
        {
          label: 'Messages Spoken',
          data: messagesData,
          color: '#2196F3',
        },
        {
          label: 'Buttons Pressed',
          data: buttonsData,
          color: '#4CAF50',
        },
      ],
    };
  }

  private generateVocabularyChart(analyticsData: AnalyticsData[]): ChartData {
    const labels = analyticsData.map(data => data.date.toLocaleDateString());
    const vocabularyData = analyticsData.map(data => data.vocabularyGrowth);

    return {
      labels,
      datasets: [
        {
          label: 'Vocabulary Growth',
          data: vocabularyData,
          color: '#FF9800',
        },
      ],
    };
  }

  private generateEfficiencyChart(analyticsData: AnalyticsData[]): ChartData {
    const labels = analyticsData.map(data => data.date.toLocaleDateString());
    const efficiencyData = analyticsData.map(
      data => data.communicationEfficiency
    );

    return {
      labels,
      datasets: [
        {
          label: 'Communication Efficiency',
          data: efficiencyData,
          color: '#9C27B0',
        },
      ],
    };
  }

  // Helper methods
  private createEmptyReport(userId: string, period: string): ProgressReport {
    return {
      userId,
      period,
      totalSessions: 0,
      totalDuration: 0,
      averageSessionDuration: 0,
      vocabularyGrowth: 0,
      communicationEfficiency: 0,
      mostActiveDay: 'N/A',
      peakUsageHour: 0,
      topWords: [],
      topPages: [],
      improvementAreas: ['Start using the app regularly to see progress'],
      achievements: [],
      recommendations: [
        'Begin using the app daily to build communication skills',
      ],
    };
  }

  private generateRecommendations(
    analyticsData: AnalyticsData[],
    topWords: Array<{ word: string; count: number }>,
    topPages: Array<{ page: string; count: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (analyticsData.length < 3) {
      recommendations.push(
        'Use the app more frequently to build consistent communication habits'
      );
    }

    if (topWords.length > 0 && topWords[0].count > 10) {
      recommendations.push(
        `Consider expanding vocabulary beyond "${topWords[0].word}" which is used frequently`
      );
    }

    if (analyticsData.some(data => data.communicationEfficiency < 0.5)) {
      recommendations.push(
        'Try using the express mode to build longer sentences'
      );
    }

    if (topPages.length > 0) {
      recommendations.push(
        `Explore other communication pages beyond "${topPages[0].page}"`
      );
    }

    return recommendations;
  }

  private generateAchievements(
    analyticsData: AnalyticsData[],
    totalMessages: number,
    totalVocabulary: number
  ): string[] {
    const achievements: string[] = [];

    if (totalMessages >= 100) {
      achievements.push('Century Communicator - 100+ messages sent!');
    }

    if (totalVocabulary >= 50) {
      achievements.push('Vocabulary Builder - 50+ unique words used!');
    }

    if (analyticsData.length >= 7) {
      achievements.push('Week Warrior - Used app for 7+ days!');
    }

    if (analyticsData.some(data => data.communicationEfficiency > 2)) {
      achievements.push(
        'Efficient Communicator - High communication efficiency!'
      );
    }

    return achievements;
  }

  private identifyImprovementAreas(
    analyticsData: AnalyticsData[],
    topWords: Array<{ word: string; count: number }>
  ): string[] {
    const areas: string[] = [];

    if (topWords.length < 5) {
      areas.push('Expand vocabulary variety');
    }

    if (analyticsData.some(data => data.sessionDuration < 300000)) {
      // Less than 5 minutes
      areas.push('Increase session duration');
    }

    if (analyticsData.some(data => data.pagesViewed < 3)) {
      areas.push('Explore more communication pages');
    }

    return areas;
  }

  // Cleanup old data
  async cleanupOldData(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date(
        Date.now() - daysToKeep * 24 * 60 * 60 * 1000
      );
      const keys = await AsyncStorage.getAllKeys();

      for (const key of keys) {
        if (key.startsWith('analytics_')) {
          const dateStr = key.split('_')[2];
          const date = new Date(dateStr);

          if (date < cutoffDate) {
            await AsyncStorage.removeItem(key);
            console.log('Removed old analytics data:', key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old analytics data:', error);
    }
  }

  // Stop tracking
  stopTracking(): void {
    this.isTracking = false;
    this.endSession();
  }
}

export default AnalyticsService;
