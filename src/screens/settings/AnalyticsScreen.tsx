// Analytics Screen

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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import AnalyticsService, {
  ProgressReport,
  ChartData,
} from '../../services/analyticsService';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [analyticsService] = useState(() => AnalyticsService.getInstance());
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'quarter'
  >('month');
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState<
    'usage' | 'vocabulary' | 'efficiency'
  >('usage');
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadProgressReport();
    }
  }, [currentUser, selectedPeriod]);

  const loadProgressReport = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const report = await analyticsService.generateProgressReport(
        currentUser.id,
        selectedPeriod
      );
      setProgressReport(report);
    } catch (error) {
      console.error('Error loading progress report:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!progressReport) {
      Alert.alert('No Data', 'Please load analytics data first');
      return;
    }

    try {
      setIsLoading(true);

      // Generate report data
      const reportData = {
        user: currentUser?.name || 'Unknown User',
        period: selectedPeriod,
        generatedAt: new Date().toISOString(),
        report: progressReport,
        charts: chartData
          ? {
              usage: chartData,
              vocabulary: chartData,
              efficiency: chartData,
            }
          : null,
      };

      // Convert to JSON string
      const reportJson = JSON.stringify(reportData, null, 2);

      // In a real app, you would use a file sharing library like react-native-share
      // For now, we'll show the data in an alert (you can copy it)
      Alert.alert(
        'Export Report',
        `Report generated successfully!\n\nPeriod: ${selectedPeriod}\nTotal Sessions: ${progressReport.totalSessions}\nAverage Duration: ${progressReport.averageSessionDuration} minutes\nVocabulary Growth: ${progressReport.vocabularyGrowth} words\n\nReport data is ready for export.`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Copy Data',
            onPress: () => {
              // In a real app, you would copy to clipboard
              console.log('Report Data:', reportJson);
              Alert.alert(
                'Copied',
                'Report data copied to console (for development)'
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'Failed to export report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPeriodSelector = () => {
    const periods = [
      { key: 'week', label: 'Week', icon: 'calendar' },
      { key: 'month', label: 'Month', icon: 'calendar-outline' },
      { key: 'quarter', label: 'Quarter', icon: 'calendar-sharp' },
    ];

    return (
      <View style={styles.periodSelector}>
        {periods.map(period => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonSelected,
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Ionicons
              name={period.icon as any}
              size={20}
              color={
                selectedPeriod === period.key
                  ? themeColors.surface
                  : themeColors.primary
              }
            />
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key &&
                  styles.periodButtonTextSelected,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSummaryCards = () => {
    if (!progressReport) return null;

    const cards = [
      {
        title: 'Total Sessions',
        value: progressReport.totalSessions.toString(),
        icon: 'play-circle',
        color: themeColors.primary,
      },
      {
        title: 'Avg Session',
        value: `${Math.round(progressReport.averageSessionDuration / 60000)}m`,
        icon: 'time',
        color: themeColors.secondary,
      },
      {
        title: 'Vocabulary',
        value: progressReport.vocabularyGrowth.toString(),
        icon: 'book',
        color: themeColors.warning,
      },
      {
        title: 'Efficiency',
        value: `${Math.round(progressReport.communicationEfficiency * 100)}%`,
        icon: 'trending-up',
        color: themeColors.success,
      },
    ];

    return (
      <View style={styles.summaryCards}>
        {cards.map((card, index) => (
          <View key={index} style={styles.summaryCard}>
            <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
              <Ionicons
                name={card.icon as any}
                size={24}
                color={themeColors.surface}
              />
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTopWords = () => {
    if (!progressReport || progressReport.topWords.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Used Words</Text>
        <View style={styles.wordsList}>
          {progressReport.topWords.slice(0, 5).map((word, index) => (
            <View key={index} style={styles.wordItem}>
              <View style={styles.wordRank}>
                <Text style={styles.wordRankText}>{index + 1}</Text>
              </View>
              <View style={styles.wordInfo}>
                <Text style={styles.wordText}>{word.word}</Text>
                <Text style={styles.wordCount}>{word.count} times</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTopPages = () => {
    if (!progressReport || progressReport.topPages.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Used Pages</Text>
        <View style={styles.pagesList}>
          {progressReport.topPages.slice(0, 5).map((page, index) => (
            <View key={index} style={styles.pageItem}>
              <View style={styles.pageRank}>
                <Text style={styles.pageRankText}>{index + 1}</Text>
              </View>
              <View style={styles.pageInfo}>
                <Text style={styles.pageText}>{page.page}</Text>
                <Text style={styles.pageCount}>{page.count} visits</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAchievements = () => {
    if (!progressReport || progressReport.achievements.length === 0)
      return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsList}>
          {progressReport.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <Ionicons name="trophy" size={20} color={themeColors.warning} />
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!progressReport || progressReport.recommendations.length === 0)
      return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendationsList}>
          {progressReport.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="bulb" size={20} color={themeColors.info} />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderImprovementAreas = () => {
    if (!progressReport || progressReport.improvementAreas.length === 0)
      return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
        <View style={styles.improvementList}>
          {progressReport.improvementAreas.map((area, index) => (
            <View key={index} style={styles.improvementItem}>
              <Ionicons
                name="arrow-up"
                size={20}
                color={themeColors.secondary}
              />
              <Text style={styles.improvementText}>{area}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderChartSelector = () => {
    const charts = [
      { key: 'usage', label: 'Usage', icon: 'bar-chart' },
      { key: 'vocabulary', label: 'Vocabulary', icon: 'book' },
      { key: 'efficiency', label: 'Efficiency', icon: 'trending-up' },
    ];

    return (
      <View style={styles.chartSelector}>
        <Text style={styles.chartSelectorTitle}>Charts</Text>
        <View style={styles.chartButtons}>
          {charts.map(chart => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartButton,
                selectedChart === chart.key && styles.chartButtonSelected,
              ]}
              onPress={() => setSelectedChart(chart.key as any)}
            >
              <Ionicons
                name={chart.icon as any}
                size={16}
                color={
                  selectedChart === chart.key
                    ? themeColors.surface
                    : themeColors.primary
                }
              />
              <Text
                style={[
                  styles.chartButtonText,
                  selectedChart === chart.key && styles.chartButtonTextSelected,
                ]}
              >
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderChart = () => {
    // In a real app, this would render actual charts using a charting library
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartPlaceholder}>
          <Ionicons
            name="bar-chart"
            size={48}
            color={themeColors.textSecondary}
          />
          <Text style={styles.chartPlaceholderText}>
            {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}{' '}
            Chart
          </Text>
          <Text style={styles.chartPlaceholderSubtext}>
            Chart visualization coming soon
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics & Progress</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportReport}
          >
            <Ionicons name="download" size={20} color={themeColors.primary} />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Chart Selector */}
        {renderChartSelector()}

        {/* Chart */}
        {renderChart()}

        {/* Top Words */}
        {renderTopWords()}

        {/* Top Pages */}
        {renderTopPages()}

        {/* Achievements */}
        {renderAchievements()}

        {/* Recommendations */}
        {renderRecommendations()}

        {/* Improvement Areas */}
        {renderImprovementAreas()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.primary,
    gap: SPACING.XS,
  },
  exportButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.XS,
    marginBottom: SPACING.LG,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    gap: SPACING.XS,
  },
  periodButtonSelected: {
    backgroundColor: themeColors.primary,
  },
  periodButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  periodButtonTextSelected: {
    color: themeColors.surface,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.LG,
  },
  summaryCard: {
    width: (width - SPACING.MD * 3) / 2,
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    marginBottom: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  cardValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  chartSelector: {
    marginBottom: SPACING.MD,
  },
  chartSelectorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  chartButtons: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.XS,
  },
  chartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    gap: SPACING.XS,
  },
  chartButtonSelected: {
    backgroundColor: themeColors.primary,
  },
  chartButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  chartButtonTextSelected: {
    color: themeColors.surface,
  },
  chartContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    minHeight: 200,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  wordsList: {
    gap: SPACING.SM,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  wordRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  wordRankText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  wordCount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  pagesList: {
    gap: SPACING.SM,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  pageRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeColors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  pageRankText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  pageInfo: {
    flex: 1,
  },
  pageText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  pageCount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  achievementsList: {
    gap: SPACING.SM,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    gap: SPACING.SM,
  },
  achievementText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  recommendationsList: {
    gap: SPACING.SM,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    gap: SPACING.SM,
  },
  recommendationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  improvementList: {
    gap: SPACING.SM,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    gap: SPACING.SM,
  },
  improvementText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
});
